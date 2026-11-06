# Phase 2B-2B-2B: Migration 0009 / 複数チケットAtomic RPC

## 範囲と判定

0009と専用隔離PostgreSQLの検証だけを実装する。0001〜0008、Reactフォーム、アプリの保存分岐、RLS、Auth設定、環境ファイルは変更しない。`VITE_SUPABASE_ATOMIC_SAVE=false`を維持する。クラウド適用、UI、フラグ有効化はHOLD。

R1で親削除の支払い保護とpayments側のCASCADE防御を追加した。最新の仕様・追加検証・結果は[親削除保護R1](phase2b-2b-2b-r1-payment-protection.md)を参照する。以下の初版検証99件は維持し、R1で36件を追加した。

## 実装前調査と方式決定

- 0008は単一`ticket`用。ID未指定かつ既存1件では新規追加せず、その1件を更新する。複数操作を1回にまとめるには契約拡張が必要。
- 0001のチケット自身の更新時刻トリガーは、親の`matches.updated_at`を変更しない。直接DMLの競合検出には伝播が必要。
- 既存RPCは親`FOR UPDATE`→子更新、直接子DMLは子行→親伝播となり、行トリガーだけではロック逆転を生む。
- `payments.ticket_id`と複合チケット外部キーはともに`ON DELETE CASCADE`。明示的なDB削除ガードが必要。
- RPCと子トリガーのrevision複数加算は許容する。revisionを変更トークンと定義し、保存回数とは扱わない。呼び出し元が変更できるセッション変数による伝播抑止や、加算の集約は行わない。

ロックは、DB共通のtransaction advisory gate `(1936024935,9)`をRPC入口および対象12テーブルのBEFORE STATEMENTトリガーで取得する。行ロック・FKロックより前に全書き込み経路を直列化し、RPC内のチケット対象行はUUID順でロックする。DB内の全利用者・全試合の書き込みが直列になるため、長いトランザクションは他の保存を待たせる。小規模アプリで正しさを優先した明示的な性能上の制約であり、クラウド適用前に実負荷とタイムアウトを評価する。

## v1契約

`contract_version`未指定または数値`1`。従来の`ticket`、`ticket_operation`、`replace.ticket`を保持する。レスポンスは従来どおり`ok`、`match_id`、`watch_record_id`の3キーだけ。

```json
{
  "match": {
    "id": "10000000-0000-0000-0000-000000000001",
    "expected_updated_at": "2026-11-06T00:00:00.123456Z"
  },
  "replace": { "ticket": true },
  "ticket": {
    "id": "30000000-0000-0000-0000-000000000001",
    "status": "ticketed"
  }
}
```

既存試合では`expected_updated_at`が必須。新規試合では従来どおり試合・観戦情報の必須項目が必要。チケットを指定せず`replace.ticket`を有効にしない場合は保持する。支払い付きチケットの削除拒否と、子変更による親時刻の進行は意図した保護強化となる。

旧REST保存への影響: 現行`saveMatchRecord`は最初のmatches upsert応答の時刻を保持した後に子テーブルを書き込む。0009適用後はその子変更で親時刻がさらに進むため、この途中の時刻を最新値として扱えなくなる。現在のAtomicフラグfalseを変更せず、クラウド適用前に旧REST保存後のsnapshot再同期、または保存経路の切替順序を別工程で確定する必要がある。今回アプリコードは変更していない。v1 Atomicクライアントの保存後updated_at再取得はこの影響を受けない。

`replace`関連の既存挙動は変更しない。特に`replace:null`は拒否、`replace.ticket=false`では`ticket:null`を無視する。`replace.ticket=true`かつ`ticket:null`は拒否。`replace`に`innings`/`pitchers`キーが存在し、対応データがJSON nullの場合はフラグfalseでも拒否される。現行クライアントとのこの契約上の注意は残るため、Atomic Save有効化前の別工程で解決する。未指定とJSON nullを同一扱いに変えない。

## v2契約

数値`contract_version:2`を指定。未知のバージョン、文字列バージョン、JSON nullを拒否。v1で`ticket_changes`を指定する場合も拒否する。

```json
{
  "contract_version": 2,
  "match": {
    "id": "10000000-0000-0000-0000-000000000001",
    "expected_updated_at": "2026-11-06T00:00:00.123456Z",
    "expected_revision": "12"
  },
  "ticket_changes": {
    "create": [
      { "client_key": "draft-c", "values": { "status": "purchased", "quantity": 1 } }
    ],
    "update": [
      { "id": "30000000-0000-0000-0000-000000000001", "changes": { "status": "ticketed", "vendor": null } }
    ],
    "delete": ["30000000-0000-0000-0000-000000000002"]
  }
}
```

- `ticket_changes`未指定は空オブジェクトと同じ。操作配列未指定・空配列は変更なし。JSON null・非配列・未知操作は拒否。
- 旧`ticket`、`ticket_operation`、`replace.ticket`との併用を拒否する（false/nullでも旧キーがあれば拒否）。
- `create`は空白だけでない文字列`client_key`と`values`オブジェクトを要求。client_keyは配列内で一意。UUIDは必ずDB採番し、既存1件の場合でも追加する。DB IDをvaluesへ渡すことは不可。
- `update`は既存UUIDと`changes`オブジェクトを要求。未指定フィールドは保持し、nullableフィールドのnullはクリア。status/refund_statusのnullはNOT NULL相当エラー。空changesは許可するが、チケット時刻更新によりrevisionが進む場合がある。
- `delete`は既存UUID文字列の配列。同一IDの重複、update/delete間の重複を拒否。UUIDはキャスト後に比較するため英字の大小で重複検証を回避できない。
- update/delete対象は`id + match_id + auth.uid()`で検証し、別試合・別所有者・不存在を拒否。未指定チケットは変更・削除しない。
- 値のキーは許可リスト方式。所有者・ID・親ID・監査時刻は変更不可。状態・文字列・正の整数枚数・非負数金額・ISO日付を検証する。日付の実在性、整数/金額の桁あふれはPostgreSQLでも拒否する。
- ticketの購入額・自己負担・返金情報も許可し、部分更新時の未指定値を保持する。観戦記録の費用・座席・`payment_splits`から自動転記しない。
- チケット操作、従来の試合/観戦/詳細保存は同一関数呼び出し・トランザクション。例外を握り潰さず、どこで失敗しても全体がロールバックされる。

v2戻り値例:

```json
{
  "ok": true,
  "match_id": "10000000-0000-0000-0000-000000000001",
  "watch_record_id": "20000000-0000-0000-0000-000000000001",
  "updated_at": "2026-11-06T00:00:01.654321+00:00",
  "revision": "16",
  "created_tickets": [
    { "client_key": "draft-c", "id": "40000000-0000-0000-0000-000000000001" }
  ]
}
```

revisionは常に文字列。値の飛び幅に意味はない。実際の時刻・IDはDBの値であり、クライアント側で補完しない。

## revision伝播と競合

`matches.revision bigint NOT NULL DEFAULT 0 CHECK(revision>=0)`を追加。既存データの時刻・値を更新せず、0から開始。再適用でも値を保持する。新規matchはrevision 0、親UPDATEでは旧値+1。RESTでrevisionやupdated_atを指定しても、親専用トリガーがDB値へ置換する。updated_atは`greatest(clock_timestamp(), old.updated_at + 1 microsecond)`で進め、共有`set_updated_at()`は変更しない。

v2は`match.expected_revision`を新規・既存とも必須とする。正規表現`^(0|[1-9][0-9]*)$`の文字列とbigint範囲を検証する。新規試合の期待値は`"0"`。既存試合では従来の`expected_updated_at`も必須。gate→親ロック→時刻/revision比較→保存の順。通常競合は`PT409`。意図的な`40001`や自動再試行は導入しない。

| テーブル | 親解決 | 実装/検証 |
|---|---|---|
| matches | 自身 | statement gate + revision/時刻BEFORE ROW |
| watch_records | OLD/NEW.match_id | 子AFTER ROW伝播、更新/削除、RPC新規作成を検証 |
| tickets | OLD/NEW.match_id | 追加/更新/削除、両親への移動、並行直接DMLを検証 |
| payments | OLD/NEW.match_id | 追加/更新/削除、支払いと削除の競合を検証 |
| watch_record_categories | OLD/NEW.watch_record_id→watch_records | 追加/更新/削除を検証 |
| seats | 同上 | 追加/更新/削除を検証 |
| payment_splits | 同上 | 追加/更新/削除を検証 |
| match_inning_scores | OLD/NEW.match_id | 追加/更新/削除を検証 |
| match_team_totals | 同上 | 追加/更新/削除を検証 |
| match_pitchers | 同上 | 追加/更新/削除を検証 |
| match_events | 同上 | 追加/更新/削除を検証 |
| match_links | 同上 | 追加/更新/削除を検証 |

子トリガーはOLD/NEWの親を重複除去してUUID順に通知する。DELETEでNEWを参照しない。watch削除で子の親解決ができなくなっても、watch_records自身のOLD.match_idが親を通知する。親match削除時に親行が既に見えない場合は通知対象がなくなり、削除済み親を再作成しない。

未対応/対象外:

- チーム・球場・カテゴリ等のマスター変更は試合固有データではないためrevision対象外。
- authorized_users/Auth変更はrevision対象外。各RPCとRLSで都度認可する。
- import_batches/import_rowsは取込管理情報で、今回の保存・snapshot対象外。
- TRUNCATE、トリガー無効化、replication role、手動DDL、gate前に明示的に行ロックを取得する管理SQLは保証対象外。authenticatedにはTRUNCATEを付与しない。管理作業が必要な場合はgateを先に取得して同じ順序を守る。
- 一般のSQLで複数行ロックを先に取り、後からRPCを呼ぶトランザクションまで無条件にデッドロックしないとは保証しない。通常のREST DMLとRPCはstatement gateを通る。

ロックタイムアウトは`55P03`としてそのまま返し、再試行しない。検証した通常経路ではデッドロック0。gateを回避する管理経路の性能・デッドロック受入は今回の対象外。

## payments削除保護

`BEFORE DELETE ON tickets`で関連paymentsの存在を検証し、`23503`で拒否する。v1/v2/直接DELETEすべてに適用。paymentsのDMLも同じgateを通るため、存在確認とDELETEの間への支払い追加を防ぐ。既存外部キーは変更せず、チケット削除に伴う支払いの連鎖削除をガードする。支払いを自動削除・付け替えしない。支払いをユーザーが別操作で明示削除した後のチケット削除は許容する。

R1ではmatches/watch_recordsのBEFORE DELETEにも関連支払いの拒否を追加し、payments自身のBEFORE DELETEでトリガー内削除を拒否する。支払い付き親削除をCASCADE順序に依存させず防ぐ。通常のpayments直接DELETE・通常関数からの明示DELETEは維持する。支払い削除UXは別途受入が必要。

## READ ONLYスナップショット

`public.get_match_record_snapshot(p_match_id uuid)`を追加。`SECURITY INVOKER`、`STABLE`、固定search_path、authenticatedのみEXECUTE。未承認ユーザー、null ID、他人/不存在の試合を拒否する。UUID形式不正は引数変換時に拒否。

認可確認後、単一SELECTでmatch、watch_record、ID順チケット全件、categories、seats、splits、payments、innings、totals、pitchers、events、linksをJSON化する。match内部とトップレベルのrevisionはともに文字列。watch未作成ならwatch_record=null、それ以外の複数行情報は存在しなければ空配列となる。権限エラー等を空配列に変換する例外処理はない。

STABLE関数の呼び出し文スナップショットと単一SELECTにより、各テーブルを同一MVCC世代で読む。親時刻/revisionと子配列を別々のネットワーク要求で取得しない。ロック・書き込み不要で、READ ONLYトランザクションでも実行できる。並行トランザクションの未コミット変更を含まず、コミット後には新しい一式を返す。25回の複数テーブル更新と40回の並行読取りでも世代混在を検出しなかった。

将来のアプリは保存成功後にこのRPCで再取得し、返却された全件・時刻・revisionを一緒に反映する。同期失敗・保存結果不明を保存拒否と区別し、自動再保存しない。このクライアント処理は今回実装しない。

## 権限

既存RLSポリシー・テーブル権限・承認条件を維持する。すべての追加関数はSECURITY INVOKER。PUBLIC/anonのEXECUTEを剥奪し、authenticatedには保存RPC、snapshot、保存RPCから呼ぶ純粋な値検証関数だけを付与する。トリガー専用関数のEXECUTEは付与しない。トリガー発火時にそれらの直接EXECUTE権限が不要なことを実際のCRUDで検証した。

## 隔離検証と再現手順

専用対象:

- container / Project ID: `new-game-log-0009-isolated-20261106`
- DB: `new_game_log_0009_isolated`
- image: ローカル`postgres:17`、検証版17.11
- network:none、公開ポートなし、外部マウントなし、PGDATAはtmpfs
- クラウドURL、実Auth、既存Supabase CLI/Docker環境は使わない

新規コンテナに限定して次を実行する。既存コンテナ・ボリュームの削除やDB初期化コマンドは使わない。

```sh
docker run --detach --pull=never --name new-game-log-0009-isolated-20261106 --network none --label project=new-game-log-0009-isolated-20261106 --tmpfs /var/lib/postgresql/data:rw --env POSTGRES_HOST_AUTH_METHOD=trust --env POSTGRES_DB=new_game_log_0009_isolated postgres:17
node supabase/verification/phase2b-0009/initialize.mjs
npm run test:phase2b:db
```

initializerは対象名・ラベル・ネットワーク・公開ポート・外部マウント・tmpfs・DB名を照合し、空DBでなければ拒否する。専用DB内だけにauth.uid()/auth.usersの最小shimとロールを作成し、0001〜0008、合成fixture、0009を順に適用。既存fixtureとRLSの保持、再適用でも時刻/revisionが変わらないことを確認する。

55 DBテストでは通常ケースをROLLBACKし、並行検証だけ合成baselineの更新をコミットする。payments競合テストで作った1行はその専用条件で明示削除する。最後にbaselineのusers3、matches2、watch_records2、tickets3以外の操作生成データがないこと、支払い/詳細0、未終了トランザクション0、deadlocks0を検証する。baselineは実データではなく専用テスト用。終了時はこの専用コンテナだけを停止し、tmpfsデータの永続化はない。コンテナ削除・ボリューム削除・DROP DATABASE・TRUNCATEは使わない。

並行検証は、先行セッションのREADYとpg_stat_activity上のadvisory待機を確認してから解放する。無条件リトライで競合を隠さない。テスト中のpsqlエスケープ不備で待機確認が失敗した初期実行は修正し、全件再実行している。実際のDBデッドロックは発生していない。

未検証: 実SupabaseのJWT/PostgREST HTTP層、クラウドでの権限継承/既存オブジェクト差分、実負荷、管理SQL、React実画面。親試合の支払い付き削除はR1の隔離PostgreSQL検証に追加した。shim検証を実Authの受入と同一視しない。

## クラウド適用前のゲート

1. 0009の契約・粗い書き込み直列化・revisionの飛び幅を監査承認する。
2. 実環境の0001〜0008、RLS、関数/トリガー/ACL、payments FKと0009未適用をREAD ONLYで照合する。
3. 適用時のロック待機・トランザクション長・性能と、運用上の回復手順をレビューする。
4. v2クライアント、保存後snapshot同期、保存済み/同期失敗/結果不明の状態管理を別工程で実装・受入する。旧REST経路の途中時刻を最新値にしない同期と、切替順序も確定する。
5. v1のnull/replace契約と実クライアントの整合を解決し、未読込詳細を空配列として置換しない。
6. 明示GO後にのみ対象クラウドのREST受入を行う。Atomic Save有効化はさらに別判断とする。

## 初版の結果（2313b3eまで）

- 0009初回適用・再適用、適用前データ/RLS保持: PASS。
- `npm run test`: 既存44件PASS（削除・無効化・変更なし）。
- `npm run test:phase2b:db`: 追加55件PASS。既存と合わせて99件PASS。
- `npm run lint`: PASS。出力ラッパーのJSON解析エラーがあったため、`rtk bypass npm run lint`で再実行し、実体の`tsc --noEmit`がPASSしたことを確認。
- `npm run build`: PASS。既存のVite native config互換性・バンドルサイズ警告あり。
- `git diff --check`: PASS。
- 0001〜0008、src、既存44件のテスト、環境サンプルのHEADとの差分なし。
- 残存確認: 合成baselineのみ、操作で生成した追加行0、未終了トランザクション0、deadlocks0。

限定範囲の実装・隔離DB検証はPASS。クラウド適用・UI・Atomic Save有効化はHOLDのままSTOPする。

今回の専用コンテナは正常停止済み（exit=0、永続マウントなし）。削除はしていない。同じ専用コンテナで再検証する場合はラベル/遮断設定を照合してから`docker start new-game-log-0009-isolated-20261106`を実行し、tmpfs上で新規作成された空DBにinitializer→DBテストの順で実行する。他のコンテナの再起動は行わない。
