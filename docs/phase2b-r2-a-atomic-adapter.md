# Phase 2B-2B-R2-A: Atomic RPCアダプター

## 範囲

新しい保存基盤は明示的なv2専用APIとして追加する。既存画面/Contextへの接続、複数チケットUI、既存保存経路の切替は行わない。Migration 0001〜0009とR1、RLS/Auth、環境ファイルは変更しない。VITE_SUPABASE_ATOMIC_SAVE=falseを維持し、クラウド適用/フラグ有効化はHOLD。

## 経路分離

| 経路 | 呼び出し | 契約 |
|---|---|---|
| 旧REST | saveMatchRecord | 既存の複数HTTP要求。Atomic成功として扱わない |
| Phase 2A v1 | saveMatchRecordAtomic | 旧ticket/replace、DB応答は従来3キー |
| 0009 v2 | verifyV2Capability → createV2SaveController | 明示contract=atomic_v2、payload contract_version=2、expected_revision文字列 |

saveMatchRecordWithPhase2の既存分岐は変更していない。v2の要求マーカー、revision付きレコード、clientKey付きチケットを旧REST/v1に渡すと送信前に拒否する。v2アダプターには旧REST/v1へのフォールバック処理が存在しない。

verifyV2Capabilityは、呼出元が適用確認済み環境でatomic_v2を明示選択し、同じ認証ユーザーの既知の所有試合をsnapshot RPCで正常取得・検証して初めてcapabilityを発行する。v1の応答形からv2を推測しない。snapshot RPCのPGRST202は未対応、権限・通信・スキーマ不正等は確認不能として停止し、v1/RESTへ降格しない。tokenは接続オブジェクトとownerに結び付けたWeakMapで管理し、JSONから再生成できない。保存直前にも現在セッションのuser IDを確認する。

これは一般的なDB版数照会APIではない。0009/R1が同じトランザクションで正しく適用され、書き込みRPCもv2であることのデプロイ確認が前提。手動でsnapshotだけ残して保存関数を旧版に戻した環境は未対応。既知の所有試合がない空DBではcapability発行を保守的に停止する。初回ユーザー向け能力照会契約は後続工程で必要。失敗レスポンスを成功の能力証明に使う迂回は実装しない。

## チケット差分

buildTicketChangesは基準tickets、編集tickets、明示削除IDから純粋に操作配列を作る。

- createTicketDraftで編集開始時にclientKeyを1回付与。createはclient_keyとvaluesだけを送り、DB UUIDを指定しない。
- 既存IDは基準に存在するUUIDだけを許可し、変更フィールドだけupdateへ含める。
- 基準にあるが編集配列にないチケットは保持する。削除はdeletedTicketIdsに明示したIDだけ。削除予定行は編集配列から除外する。
- 未保存行の取消は編集配列から取り除くだけで、deleteを発行しない。
- 未指定/undefinedは保持。明示nullはnullable項目のクリア。基準が既にnull相当なら無変更として省略。
- UUID/clientKey重複、更新削除の重複、未知ID、未知/不変フィールド、不正な日付・状態・数量・金額を送信前に拒否。
- ticketInfoは入力正本に使わない。取得時はDB ID順ticketsの先頭から導出し、0件はrelease_waiting表示値。

購入額/自己負担/返金のチケット固有値も変換し、既存ticket UUIDを保持する。client_keyは保存応答と新規UUIDの対応用であり、DBの冪等キーではない。

## ペイロードと詳細テーブル

prepareV2Saveは検証済みsnapshotを基準として再検証し、親/観戦の変更フィールドを送る。既存保存では基準のDB updated_atとrevisionを送り、新規はexpected_revision="0"。owner_idは送信せずDBのauth.uid()に従う。watch未作成の基準では必要なwatch情報を送る。

詳細はchangedDetailsで明示したコレクションだけreplace=trueにする。未指定はpayload/replaceからともに省略し、未読込・未編集を空配列で置換しない。innings/pitchersの明示クリアはSQL契約上の空オブジェクト。配列の明示クリアは空配列。seatは明示置換時だけnullable列を送る。splitsはpaid_date等のDBキーへ変換する。

一部しか編集表現できない投手/イベント行は、破壊的な全置換を拒否する。編集なしならrawの全情報をDBに保持する。明示置換はコレクション全体の置換であり、チケット以外の生成IDを再採番する既存RPC仕様は変えていない。既存v1のnull/replace動作も変更していない。

## snapshot変換

parseMatchSnapshotはトップレベルと12テーブル分の必須キー・型・null・enum・UUID・所属・重複・親子参照を検証する。未知の列を含むDB契約変更も自動吸収せず同期エラーとする。取得失敗や欠落を0件に変換しない。

raw全体を保持し、既存mapperを利用してUI向けrecordを復元する。DB採番UUID、チケット全件、固有金額、revision文字列、DB timestampの元文字列を保持する。従来mapperで縮まる疎なイニング位置と、イニング行がない場合の安打/失策合計も復元する。DBのpostponedはAtomicRecordの型で保持し、旧UI型を無断拡張しない。

時刻はクライアント現在時刻で補完せず、比較時だけmicrosecondsのBigIntへ変換する。revisionもBigInt比較し、JSONでは文字列のまま扱う。snapshotのrevision/timeと親の値の一致を確認する。保存応答より古いsnapshotは拒否し、同一revisionなら時刻と新規UUID/観戦IDの対応も確認する。保存応答より新しいsnapshotは、その後の更新を含む別世代として適用する。receiptとsnapshotを合成して架空の世代を作らない。

接続/owner/match単位の読取りwatermarkで遅れて返った古い世代を拒否する。将来のstore適用時にもacceptSnapshot(current,incoming)を使い、現在のsnapshotより古い値を上書きしない。旧複数テーブルロードとv2 snapshotを同じレコードの同一stateに混ぜない。旧画面では今までのロード方式を維持する。

## 状態管理

| phase | 意味と許可操作 |
|---|---|
| idle | 検証済み・凍結した保存要求。saveを1回だけ許可 |
| saving | 1回のsave_match_record送信。二重送信禁止 |
| rejected | 明確なSQL/認可拒否、または送信前のローカル拒否。入力/基準は保持 |
| conflict | PT409、または既知の新しい世代に対して古い基準。入力/基準保持、上書き禁止 |
| partial_or_unknown | 通信切断、504、接続障害、不明なエラー、不正な成功応答。送信内容/ID/client_keyを保持し再送禁止 |
| saved_syncing | 有効なv2成功応答を受領。snapshotだけ取得 |
| saved_sync_failed | 保存済みだがsnapshot欠落/古い世代/不整合/取得失敗。refreshだけ許可 |
| completed | 同一snapshotからrecord/UUID/revision/timeを一組として取得済み |

PT409と通常のHTTP409 unique違反は区別する。疑わしい通信エラーをrejected=未変更と断定しない。Atomic RPCそのものの部分コミットを意味するものではないが、共通の保守的状態名としてpartial_or_unknownを使う。

同じcontrollerのsaveは1回だけ。新しいcontrollerも、同接続/owner/matchに未確認操作がある場合は送信しない。SDKのretry(false)も明示する。UIコールバック例外をDB失敗として再保存しない。

成功後refreshはSELECT用RPCしか呼ばない。結果不明後のrefreshはobservedSnapshotに確認材料を置き、成功判定・基準更新・再送許可へ変換しない。client_keyがDBに保存されていないため、値が一致するだけでは当該操作の成功証明にならない。自動照合/自動DELETE/再試行はしない。

新規match IDはcreateNewMatchDraftで編集開始時に1回だけ割り当て、保存/同期時には採番しない。入力と基準はdeep clone/freezeで保持する。結果不明の解消/手動再基準化UIは後続工程。現在のregistry/入力保持はプロセス内であり、再読込をまたぐ永続化は未実装。UI統合前に未確定intentの永続化/復元・送信禁止を実装する必要がある。

## 旧RESTの扱い

旧経路を正式な移行先にはしない。R2で判明した部分保存、競合上書き、古いupdated_atは残る。8状態を既存画面へ適用したと主張しない。

今回追加した限定保護は、結果不明が明らかなstatus 0/408/5xx、接続系SQLSTATE、fetch/abort例外で新規補償DELETEを実行せず、LegacySaveResultUnknownErrorにIDを保持して投げること。明確な失敗時の従来補償契約はR1の3テストを維持する。これは旧REST全体の安全性を証明するものではない。v2ではエラー分類がより保守的で、不明な応答も結果不明とする。

## 未実装のUI統合と切替条件

1. DBの0009/R1契約・権限・実環境差分を別途確認し、明示的なv2経路を選択する。今回は既存フラグを有効化しない。
2. Context/storeにsnapshot原本とrevisionを保持し、フォーム開始時に編集コピーとbaselineを固定する。現在のRecordFormModalは接続しない。
3. 一時clientKey、新規match ID、未確定intentをフォーム開始時に保持・永続化する。Auth変更時にはcapability/controllerを破棄し、認証主体ごとのclientを使う。保存中の認証切替もUI/接続層で禁止する。
4. 8状態表示、PT409の比較/再読込、成功後同期失敗の再取得だけ、結果不明の手動確認を実装する。旧RESTのエラーをAtomic成功と表示しない。
5. 旧RESTクライアントとの混在書き込みを残したまま完全な競合安全性を主張しない。旧経路の停止・移行・残存クライアント確認を別途受入する。
6. 所有試合0件の能力照会契約、HTTP/JWT、実画面、reload復元、実負荷を検証後にのみ本切替を検討する。

## ローカル検証

| コマンド | 結果 |
|---|---|
| npm run test | 既存47＋追加モック44＝91件PASS |
| npm run test:phase2b:db | 既存88＋追加実SQL連携2＝90件PASS |
| 全体 | 既存135＋追加46＝181件PASS |
| npm run lint | PASS。ラッパーJSON異常後、rtk bypass npm run lintで同じtsc --noEmitを再実行してPASS |
| npm run build | PASS。既存のVite設定/サイズ警告は別課題 |
| git diff --check | PASS |

既存135件の内容・有効性を変えていない。専用隔離DBはnew-game-log-0009-isolated-20261106 / new_game_log_0009_isolated、network:none、公開ポート/永続マウントなし。変更のない0001〜0009/R1を適用し、アダプターを通した新規・混在チケット変更・DB UUID/時刻/revision・未編集リンク保持・PT409を直接SQLで検証する。SQLクライアントshimであり、実PostgREST/JWT試験とは区別する。実クラウドには接続しない。

限定範囲の保存基盤はローカル検証後にSTOP。UI統合・クラウド適用・Atomic Save有効化はHOLD。

終了前の残存確認: 合成baselineのみ(users3/matches2/watch_records2/tickets3)、payments/links/splits/seats0、未終了トランザクション0、deadlocks0。専用コンテナだけを正常停止し、永続ボリュームや他プロジェクトを操作しない。
