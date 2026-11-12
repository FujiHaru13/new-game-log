# Supabase接続 Phase 1

## 対象範囲

Phase 1では、既存UIを維持したまま次を接続します。

- Supabase Authのメール・パスワードログイン、セッション維持、ログアウト
- `authorized_users`による本人承認確認
- teams / stadiums / categoriesの認証後読み込み
- matches、watch_records、カテゴリ、座席、チケットの基本CRUD
- Publishable Keyを使ったRLS経由のアクセス

デモデータをSupabaseへ投入したり、既存localStorageデータを削除したりしません。Supabase接続中に読み込みが失敗した場合も、デモデータへフォールバックしません。

## 接続設定

### 推奨: `.env.local`

`.env.local`はGit管理対象外です。

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

旧形式のanon keyを使用するプロジェクトでは`VITE_SUPABASE_ANON_KEY`も読み込めますが、service_role keyやsecret keyは絶対に設定しません。

### 画面入力

ログイン画面または設定画面にProject URLとPublishable Keyを入力できます。入力値はブラウザのlocalStorageに保存されます。Publishable Keyはブラウザ公開を前提としたキーですが、RLSがデータ保護の境界です。

## ログイン確認

1. Supabase DashboardでEmail認証を有効化し、本人Authユーザーが存在することを確認する。
2. `authorized_users`に本人UUIDが登録されていることを管理者経路で確認する。
3. アプリでログインする。
4. 認証後にマスターと自分の試合一覧が表示されることを確認する。
5. ヘッダーのログアウトを押し、ログイン画面へ戻ることを確認する。
6. ブラウザを再読み込みし、Supabase Authのセッションが維持されることを確認する。

未承認ユーザーはログインできてもアプリ本体へ進めません。承認取り消し後は再読み込みまたはAuth状態更新後にデータへアクセスできません。

## CRUD受入テスト

承認済み本人のセッションで、試合の新規登録、編集、削除を順に実行します。保存はmatchesを起点にwatch_records、カテゴリ、座席、チケットへ順に反映します。子テーブルの保存に失敗した場合はエラーを表示し、新規試合では親試合のロールバックを試みます。更新時に部分保存が起きた場合は「部分保存の可能性があります」と表示されるため、一覧を再読み込みして状態を確認してください。

このPhaseでは、支払い分割明細、イニング別スコア、投手、イベント、リンクのSupabase保存は未接続です。画面上の入力値を接続済みと扱わず、次Phaseで専用の保存処理を追加します。

## RLS受入テスト

SQL Editorの管理者SELECTだけでは合格にしません。Project URLとPublishable Keyを使う、別々の実セッションで確認します。

| 主体 | 期待結果 |
|---|---|
| 匿名 | `/rest/v1/matches`等の個人テーブルで読み書き不可 |
| 未承認Authユーザー | マスター・個人データ・ビューの読み書き不可 |
| 承認済み本人 | マスター参照、自分の試合CRUDが可能 |
| 承認済み本人 | `owner_id`を別UUIDにした登録、別所有者行の参照・変更は不可 |
| 承認取り消し後 | 既存セッションでも個人データの参照・変更不可 |

REST確認例:

```bash
curl -i "$VITE_SUPABASE_URL/rest/v1/matches?select=id" \
  -H "apikey: $VITE_SUPABASE_PUBLISHABLE_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

匿名、未承認、承認済み本人で`Authorization`を切り替えて確認します。テスト用レコードを作成する場合は、既存記録と区別できる内容にし、終了後は作成主体自身のレコードだけを削除します。

観戦状態の確認では、フォームで「観戦済み」「観戦予定」「観戦中止・未観戦」をそれぞれ選び、`watch_records.watch_status`がそれぞれ`watched`、`scheduled`、`cancelled`になることを確認します。新規フォームの初期値は意図的に`scheduled`です。

### REST検証スクリプト

tests/の[`verify-rls-rest.mjs`](../tests/verify-rls-rest.mjs)は、既定の読み取り専用モードではINSERT・UPDATE・DELETEを一切送信しません。認証、承認済み本人による対象行の正確な1件SELECT、匿名・未承認ユーザーによる対象行の非取得だけを確認します。`RLS_EXPECTED_MATCH_ID`、`RLS_EXPECTED_WATCH_RECORD_ID`、`RLS_EXPECTED_SEAT_ID`はテーブル別の主キーとして扱い、対象行を承認済みセッションで事前確認できない場合はSKIPPEDとします。なお、現在のDDLでは`seats`に`id`列はなく、`watch_record_id`がPRIMARY KEYなので、`RLS_EXPECTED_SEAT_ID`の値も`watch_record_id`を指定します。

承認済み本人のCRUDと隔離行の作成・削除を実施する場合だけ、次を明示設定します。

```text
RLS_ALLOW_MUTATIONS=1
RLS_CONFIRM_CLEANUP=I_CONFIRM_CREATED_TEST_DATA_CLEANUP
RLS_AUTHORIZED_EMAIL=...
RLS_AUTHORIZED_PASSWORD=...
RLS_TEST_EMAIL=...
RLS_TEST_PASSWORD=...
RLS_EXPECTED_MATCH_ID=...
RLS_EXPECTED_WATCH_RECORD_ID=...
RLS_EXPECTED_SEAT_ID=...
RLS_SELF_APPROVAL_TEST_USER_ID=...
RLS_CONFIRM_SELF_APPROVAL=I_CONFIRM_DEDICATED_SELF_APPROVAL_TEST
```

`RLS_ALLOW_MUTATIONS=1`を指定した場合だけ、専用の未承認ユーザーによるINSERT拒否、承認済み本人が今回作成した隔離matchのUPDATE、未承認ユーザーのUPDATE/DELETE拒否、作成したmatchの限定DELETEと削除後不存在確認を行います。`RLS_CONFIRM_CLEANUP`がない場合は隔離データを作成しません。既存の検証試合・観戦記録・座席はUPDATE/DELETE対象にしません。自己承認INSERTは専用ユーザーIDと`RLS_CONFIRM_SELF_APPROVAL`の両方が必要です。予期しない変更成功時はFAILとして破壊的テストを停止し、対象IDを表示します。

認証情報・アクセストークンは出力しません。認証情報不足、対象ID不足、クリーンアップ確認不足のテストはPASSにせず、INCONCLUSIVEまたはSKIPPEDとして扱います。承認取り消し試験は、管理者が専用テストユーザーを事前に用意し、手動で承認状態を変更してから同じRESTセッションで実施します。本人アカウントを無断で取り消しません。

ローカルモック検証は実DBへ接続しません。

```bash
npm run test:rls
```

実RESTの読み取り専用確認は、既存の検証用試合等のIDをテーブル別に指定して実行します。

```bash
RLS_EXPECTED_MATCH_ID=b3c8645a-1bd5-4be4-9d10-68f05457c1ea \
RLS_EXPECTED_WATCH_RECORD_ID=... \
RLS_EXPECTED_SEAT_ID=... \
node tests/verify-rls-rest.mjs
```

書き込み検証は、専用の承認済み本人・未承認ユーザーを用意し、次のように明示的に有効化します。作成されるのは今回の実行で生成した隔離matchだけで、既存IDはUPDATE/DELETEしません。

```bash
RLS_ALLOW_MUTATIONS=1 \
RLS_CONFIRM_CLEANUP=I_CONFIRM_CREATED_TEST_DATA_CLEANUP \
RLS_AUTHORIZED_EMAIL=... \
RLS_AUTHORIZED_PASSWORD=... \
RLS_TEST_EMAIL=... \
RLS_TEST_PASSWORD=... \
RLS_EXPECTED_MATCH_ID=b3c8645a-1bd5-4be4-9d10-68f05457c1ea \
RLS_EXPECTED_WATCH_RECORD_ID=... \
RLS_EXPECTED_SEAT_ID=... \
node tests/verify-rls-rest.mjs
```

期待ログには、隔離match作成、未承認UPDATE/DELETEの拒否または0件かつ状態不変、限定DELETE後の不存在確認、`FAIL=0`が含まれます。予期しないINSERT/UPDATE/DELETE成功、状態確認不能、通信例外では後続書き込みと自動クリーンアップを停止し、隔離match UUIDを手動確認用に出力します。

検証終了後は、シェル履歴や環境変数に認証情報を残さないよう、現在のシェルで次を実行します。

```bash
unset RLS_AUTHORIZED_EMAIL RLS_AUTHORIZED_PASSWORD RLS_TEST_EMAIL RLS_TEST_PASSWORD
unset VITE_SUPABASE_URL VITE_SUPABASE_PUBLISHABLE_KEY VITE_SUPABASE_ANON_KEY
```

RLS検証の詳細なPhase 2対応表とRPC案は[`supabase-phase2-plan.md`](./supabase-phase2-plan.md)に記載しています。

## 未実施・残存リスク

- この作業環境ではSupabase URL、Publishable Key、テスト用未承認Authユーザーの認証情報が提供されていないため、実DBへのREST RLS受入テストは未実施です。
- 正規化子テーブルの一括保存はPostgRESTの単一トランザクションではありません。新規保存の親ロールバックと、更新時の部分保存エラー検知で保護していますが、完全な原子性にはRPC等のDB変更が必要です。
- 既存UIの詳細スコア、投手、イベント、リンク、分割支払いはまだlocal UI状態のみです。

## 座席種別マスターと保存

`seats.seat_type_id`は`seat_types.id`への外部キーです。現在のDBで`seat_types`が空の場合、画面のローカル選択肢をそのまま送信せず、マスター選択は保存前に拒否します。未選択または自由入力の席種は`seat_type_id = NULL`、自由入力名は`custom_seat_type_name`へ保存します。必要な席種を実DBへ追加する場合は、名称・カテゴリ・球場対応を確認したseedまたは管理者操作を別途承認してから実施してください。

ローカル定義には53件の一意な席種IDがあります。既存DB向けの追加マイグレーション[`0006_seed_seat_types.sql`](../supabase/migrations/0006_seed_seat_types.sql)が、これらを`seat_types`へ登録し、球場別リンクを`stadium_seat_types`へ登録します。`dragons_ouen`を含め、アプリのローカルIDをDB IDとして統一しています。アプリ起動時はDBの席種と球場リンクだけをプルダウンに表示し、DB未登録のローカル席種を正式項目として表示しません。

適用順序は、既存の初期構築済みDBに対して`0006_seed_seat_types.sql`を単独で適用し、その後[`verify_seat_types.sql`](../supabase/verification/verify_seat_types.sql)を読み取り専用で実行します。初期構築パッケージの再実行や、アプリ起動時の自動投入は行いません。`0006`は既存のseat_types行と内容が異なる場合に例外で停止します。

## 既存の部分保存テストデータの確認と回復案

以下は読み取り専用の確認SQLです。指定された2件以外を変更しません。

```sql
select
  m.id as match_id,
  w.id as watch_record_id,
  (select count(*) from public.seats s where s.watch_record_id = w.id) as seat_count,
  (select count(*) from public.watch_record_categories c where c.watch_record_id = w.id) as category_count,
  (select count(*) from public.tickets t where t.match_id = m.id) as ticket_count,
  (select count(*) from public.payments p where p.match_id = m.id) as payment_count
from public.matches m
left join public.watch_records w on w.match_id = m.id
where m.id in (
  'b1d18dfb-fa62-4d91-bc4e-33e7993b7362',
  '6a460cbd-f3e3-499f-80d7-38ac632e564a'
);
```

回復は、まずアプリで対象試合を編集し、観戦状態・座席を確認して保存します。削除が必要な場合も、バックアップと関連件数を確認した後、上記2つの`match_id`を明示した管理者用SQLを別途レビューしてから実行します。初期構築SQLの再実行、全件削除、RLS無効化は行いません。

今回の保存失敗では、親削除を伴う補償処理を新規登録の全子保存段階へ拡張しました。補償削除に失敗した場合は`match_id`をエラーに含め、画面の再読み込みで部分保存行を取得してから編集・限定回復できるようにします。

## 原子保存の次Phase案

`save_match_record` RPCを追加し、`matches`、`watch_records`、カテゴリ、座席、チケットをPostgreSQL関数内の1トランザクションで保存します。関数は`SECURITY INVOKER`を基本とし、`auth.uid()`と承認状態を検証し、引数の`seat_type_id`が存在することを確認します。RPC追加はDBスキーマ変更を伴うため、別途SQLレビュー後に実施します。
