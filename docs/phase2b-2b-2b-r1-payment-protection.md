# Phase 2B-2B-2B-R1: 親削除時の支払い保護

## 範囲と結論

クラウド未適用の0009だけを修正。0001〜0008、アプリ/React UI、既存44件・既存DB55件のテスト、RLS/既存テーブル権限、共通advisory gateは変更しない。クラウド適用・UI・Atomic Save有効化はHOLD。限定範囲の実装・隔離検証を完了してSTOPする。

## 原因

0001のpaymentsは、match_id、watch_record_id、ticket_idの単独/複合FKからON DELETE CASCADEで削除される。初版0009はticketsのBEFORE DELETEだけを保護していたため、ticket_id=NULLの観戦支払いが試合/観戦削除で消え、両方に紐づく支払いも他のFKの実行順に依存する問題があった。新規REST保存失敗時のmatches補償DELETEもこの経路を通る。

## 採用方法

1. matchesのBEFORE DELETEで同じmatch_idのpaymentsを検査し、存在すれば23503で拒否する。
2. watch_recordsのBEFORE DELETEで同じwatch_record_idのpaymentsを検査し、存在すれば23503で拒否する。
3. ticketsの既存BEFORE DELETEガードを維持する。
4. payments自身のBEFORE DELETEを追加し、`pg_catalog.pg_trigger_depth()>1`または参照親の不存在の場合に23503で拒否する。

親BEFORE ROWはFKのAFTERトリガーによるCASCADEより前に拒否する。加えてpayments側でもトリガー内のDELETEを拒否するため、別の親トリガーが支払いを先に消そうとする場合や、FKの複数CASCADE順序にも依存しない。参照親の検査は同じmatch_idへの所属も確認する。ガードの例外を握り潰すハンドラや、DELETEをNULL返却で無言スキップする処理はない。例外時は親・子・支払い・revision/時刻を含め、そのSQL/RPCトランザクションをロールバックする。

追加関数はSECURITY INVOKER、固定search_path。PUBLIC/anon/authenticatedに直接EXECUTEを付与しない。既存の認可・RLSを維持し、トリガーとして発火させる。トリガー無効化権限をauthenticatedへ付与しない。クライアントが設定するGUCや削除許可フラグは使用しない。

## 削除動作

| 操作 | 動作 |
|---|---|
| 支払いなしのmatch/watch/ticket削除 | 従来どおり成功し、関連する支払い以外の子も従来どおりCASCADE |
| 支払い付きmatch削除 | どの支払い形状でも拒否 |
| watchだけに紐づく支払いのwatch削除 | 拒否。ticket_id=NULLでも保護 |
| ticketだけに紐づく支払いのticket削除 | 拒否 |
| watch/ticket双方に紐づく支払い | どちらの親削除も拒否 |
| 別試合の支払い | 無関係な試合削除を妨げない |
| ticketだけの支払いがある状態でwatch削除 | 支払いにwatch参照がないため成功し、ticket/支払いを保持 |
| watchだけの支払いがある状態で無関係なticket削除 | 成功し、watch/支払いを保持 |
| paymentsの直接DELETE | 既存権限・RLS内で許可 |
| 通常のSECURITY INVOKER関数/RPC内の明示payments DELETE | 許可（通常関数呼び出しはtrigger depthを増やさない） |
| FKやユーザートリガー内からのpayments DELETE | 保守的に拒否 |

支払いを正当な権限で明示削除した後は、親削除も可能。複数FKをRESTRICTへ変更するDDLは導入せず、既存FKを残して上記ガードで保護する。

## 明示削除の保証範囲と代替案

現在のAPIで判別できるのはSQLの実行形態であり、人間の意図ではない。通常DELETEと通常関数/RPCのDELETEは既存の明示操作として扱う。トリガー内DELETEは、業務上意図したものでも保守的に拒否する。既存アプリにはこのような支払い削除トリガーワークフローは見当たらない。新設する場合は今回の契約外として別途レビューする。

| 案 | 評価 |
|---|---|
| payments DELETEを一律拒否 | 保守的だが、既存の正当な直接管理操作も壊すため不採用 |
| 明示削除専用RPCへ限定 | 意図確認・監査を追加しやすいが、既存DELETE権限/APIの移行が必要。今回の限定範囲外 |
| 通常DELETE許可＋トリガー内拒否 | 採用。既存APIを維持し、CASCADEと先行トリガーによる暗黙削除を防ぐ |

新しい明示削除契約を作る場合でも、クライアントが自由に設定するセッション変数でガードを解除しない。

## ロックと並行操作

共通gate `(1936024935,9)`、対象12テーブル、取得方式は変更なし。直接DMLはBEFORE STATEMENTでgate→対象行ロック→親BEFOREガード→DELETE/FK CASCADE。payments INSERTも同じgateの後にFK参照先ロックを取る。RPCは既存どおりgate→親FOR UPDATE→子。新しい明示ロックは追加していない。

- 支払いINSERTが先: INSERTの未コミット中は親DELETEがgateで待機。INSERTコミット後、親DELETEは23503で拒否され、支払いと親子を保持。
- 支払いなしの親DELETEが先: INSERTがgateで待機。DELETEコミット後、INSERTは参照先がないため23503で拒否され、支払いを作らない。
- match/watch/ticketそれぞれで両順序を実測。待機は対象セッションのapplication_nameとpg_stat_activityのadvisory待機で確認。
- 150msのlock_timeout試験では55P03になり、対象データが不変。無条件再試行はしない。試験終了時のdeadlocks=0。

## CASCADE順序・トリガー順序の証明範囲

通常の有償親DELETE拒否だけではpayments側の防御を証明できないため、隔離DBだけで次の故障注入を実施した。

- 各テストの外側トランザクション内でmatches/watch/ticketsの親ガードを一時無効化し、実際のFK CASCADEを実行。matchのwatch-only/both、watchのboth、ticketのbothでpayments側が23503を返し、snapshot全体が保持されることを確認。
- 親ガードより名前順で先に発火するBEFORE DELETEトリガーをテスト用に作り、支払いを先に削除させようとする。payments側が拒否し、親子・支払いを保持。
- 一時的なトリガー/無効化/DDLは必ずROLLBACK。通常authenticatedは無効化できないことも検証。

FKの内部トリガー名/OIDに依存する順序を契約にはしない。既存55テストは変更せず通過している。

## 既存UIと補償DELETE

| 経路 | 確認結果 |
|---|---|
| RecordDetail.handleDeleteConfirm | awaitが拒否されるとalertへ進み、成功時のcloseは実行されない |
| BaseballContext.deleteRecord | DB削除awaitの後だけstate/selectedRecordを除去するため、拒否時は保持 |
| supabaseRecords.deleteMatchRecord | DBエラーをthrow。既存条件id+owner_idを維持 |
| 新規REST保存失敗時の補償DELETE | 1回だけmatches DELETE。拒否なら元の保存エラーと残存match_id、自動ロールバック失敗・手動回復案内をthrow |
| 既存REST編集失敗 | isNew=falseでは親DELETEによる補償を実行しない |

DAO実装を呼ぶ新規3モックテストで拒否の伝播、補償1回だけ、残存ID通知、payments等への追加DELETEなしを確認した。React UIコードは変更していない。UIの判断順序は静的確認であり、実画面受入とは区別する。新規REST補償拒否時のデータはDBへ残り、stateへ成功追加されない。残存IDで状態確認が必要となる。自動で支払いを削除して回復しない。

次工程: 支払い付き削除拒否の案内文、残存match_idの確認導線、明示的支払い削除ワークフロー、REST保存後snapshot同期を設計する。旧RESTの部分保存/競合未照合・古いupdated_at問題は今回修正しない。

## 隔離環境・検証結果

対象は既存の今回専用コンテナ`new-game-log-0009-isolated-20261106`、DB `new_game_log_0009_isolated`。起動前にID/ラベル、network:none、公開ポートなし、外部マウントなし、tmpfsを確認。空DBへのinitializerで0001〜0008→合成fixture→修正0009を適用し、初回・再適用・データ/RLS保持を確認した。別のDB/コンテナやクラウドは操作しない。

| 検証 | 結果 |
|---|---|
| npm run test | 既存44＋R1モック3＝47件PASS |
| npm run test:phase2b:db | 既存55＋R1 DB33＝88件PASS |
| 全体 | 135件PASS。既存99件の削除/無効化/内容変更なし |
| npm run lint | PASS。出力ラッパーのJSON解析異常後、rtk bypass npm run lintで同じtsc --noEmitを再実行してPASS |
| npm run build | PASS。既存Vite設定互換性/バンドルサイズ警告あり |
| git diff --check | PASS |

R1 DB33件の内訳: 無償親削除3、有償親削除と全データ保持7、無関係な支払い/親3、親ガード無効化下のCASCADE防御4、明示削除2、先行親トリガー1、ネスト削除/GUC無効1、v1/v2/直接削除1、ガード権限1、所有者境界1、再適用1、並行両順序6、タイムアウト1、残存確認1。

通常試験はROLLBACK。並行試験用の専用IDの行は、明示payments DELETE→専用match DELETEで限定回復する。最後の残存は合成baselineのusers3、matches2、watch_records2、tickets3、payments0、未終了トランザクション0、deadlocks0。追加の並行試験行は残さない。終了時は専用コンテナだけを正常停止する。

HTTP/JWT/PostgREST、クラウド、実UIは未検証。auth shim/SET ROLEの直接PostgreSQL試験をこれらの受入と混同しない。

## 残るデータ消失経路とHOLD

対象とした通常DML/FK CASCADEで、支払いがあるまま親削除により暗黙消失する経路は今回の試験では残っていない。既存権限内のpayments明示DELETEは意図的に許可する。通常関数が人間の意図に反してDELETEを発行するかどうかまではDBの実行深さで判定できないため、将来の公開RPCも契約レビューが必要。管理者のTRUNCATE/トリガー無効化/DDLやスーパーユーザー操作は保証対象外。authenticatedへその権限を追加していない。

今回のP1修正は隔離環境でPASS。クラウド実環境差分/REST受入、旧REST同期と部分保存、共通gateの性能、v1 null/replace、UI/明示削除ワークフローは別工程。クラウド適用・UI・Atomic Save有効化は引き続きHOLD。

終了確認: 専用コンテナはrunning=false / exit=0 / mounts=[]。コンテナ削除は行っていない。実行中に合成baseline以外の支払い・分割・座席・カテゴリ・リンク・一時試験トリガーが残っていないことを確認してから停止した。
