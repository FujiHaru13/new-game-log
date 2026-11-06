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

## 未実施・残存リスク

- この作業環境ではSupabase URL、Publishable Key、テスト用未承認Authユーザーの認証情報が提供されていないため、実DBへのREST RLS受入テストは未実施です。
- 正規化子テーブルの一括保存はPostgRESTの単一トランザクションではありません。新規保存の親ロールバックと、更新時の部分保存エラー検知で保護していますが、完全な原子性にはRPC等のDB変更が必要です。
- 既存UIの詳細スコア、投手、イベント、リンク、分割支払いはまだlocal UI状態のみです。
