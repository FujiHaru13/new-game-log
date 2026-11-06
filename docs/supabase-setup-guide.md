# Supabaseセットアップ手順

## 1. 前提と安全策

- 対象は新規Supabaseプロジェクト`new-game-log`です。
- SQLはSupabase SQL Editorで、番号順に1回ずつ実行します。
- `0004_seed_master_data.sql`にも架空の試合・支払い・チケットはありません。
- `service_role`キーやDBパスワードをフロントエンド、Git、ドキュメントへ保存しません。
- 初期マイグレーションは既存スキーマを壊す`DROP ... CASCADE`を含みません。再実行すると既存オブジェクトで失敗するため、再適用は行わず、必要なら新しい番号の差分マイグレーションを作成します。

## 2. 実行順序

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_rls_policies.sql`
3. `supabase/migrations/0003_views_functions.sql`
4. `supabase/migrations/0004_seed_master_data.sql`
5. `supabase/verification/verify_schema.sql`
6. `supabase/verification/verify_rls.sql`

検証SQLは読み取り専用です。SQL Editorの管理者権限でのSELECTだけでは、anonや別AuthユーザーのRLS実動作は証明できません。

## 3. Authと本人承認

1. Authentication > ProvidersでEmailを有効化し、メール・パスワード認証を設定します。公開サインアップは無効化または招待制にします。
2. 管理者がAuth画面から本人アカウントを作成します。実際のメールアドレスやUUIDはSQLファイルへ記載しません。
3. Auth画面または安全な管理者クエリで作成された本人UUIDを確認します。
4. SQL Editorで、確認したUUIDをその場だけに貼り付けて承認します。

```sql
insert into public.authorized_users (user_id, default_cheer_team_id, note)
values ('確認済みの本人UUID', 'dragons', '初期利用者');
```

UUIDを貼り付けたSQLは保存・コミットしないでください。`authorized_users`へのINSERTポリシーはないため、一般ユーザーのanon/authenticatedセッションから自己承認はできません。

## 4. アプリ接続設定

フロントエンドに必要なのは公開プロジェクトURLとanonキーだけです。Viteでは例えば以下の環境変数名を使用します。

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-or-anon-key>
```

`service_role`キー、DB接続文字列、Auth管理APIキーは設定しません。現行アプリの設定画面は値をlocalStorageへ保存するだけでDB接続を行わないため、Supabase移行時に置き換えが必要です。

## 5. RLS受入テスト

本番データ投入前に、最低3セッションで確認します。

1. **匿名**: `anon`クライアントで個人テーブルSELECT/INSERT/UPDATE/DELETEが0件またはpermission deniedになること。マスターSELECTも、アプリ要件に合わせて公開範囲を確認する。
2. **未承認Authユーザー**: Authログイン後、マスターSELECT以外の個人データSELECTが0件、INSERTが拒否されること。
3. **承認済み本人**: 自分の`owner_id`の行だけCRUDでき、別UUIDをINSERT/UPDATEできないこと。別ユーザーのUUIDを`owner_id`にしたINSERT、既存行の所有者変更、別所有者の子行参照を試す。

SQL Editor管理者セッションではRLSを正しく再現できないため、Supabase JSのanon key + 各ユーザーのセッションで実施します。

## 6. 接続確認

最初はマスターのSELECT、次に空の個人データSELECT、最後に承認済みユーザーで1件の手動作成・更新・削除を確認します。試合を作成する際は、先にteam/stadium/categoryのマスターIDを取得し、`owner_id`は常にクライアントのAuth UIDを使います。

## 7. よくあるエラー

- `new row violates row-level security`: Authセッションがない、または`authorized_users`に本人UUIDがない。`owner_id`を固定値にしない。
- `permission denied for table`: anonキーで管理者SQLを実行している。マスター投入・承認はSQL Editor等の管理者経路で行う。
- `violates foreign key constraint`: マスターのIDが未投入、または現行TSのIDとDBのIDが異なる。ID対応表を確認する。
- `score confirmation`のCHECK違反: 確定フラグを立てる前に両スコアを入力する。未入力はNULLのままにする。
- ビューで行が見えない: `security_invoker`により基表RLSが適用されている。呼び出し元のAuth UIDと承認状態を確認する。
- 同日登録が拒否される: このスキーマには日付UNIQUE制約はない。別のクライアント側重複チェックを確認する。

## 8. ロールバック

初期適用後に問題が見つかった場合、対象データを削除する前にバックアップと影響範囲を確認します。テーブル削除や`DROP ... CASCADE`を手動で実行せず、修正用の新しい番号付きmigrationを作成します。新規プロジェクトでSQL適用直後かつデータ未投入の場合だけ、プロジェクト再作成を含むSupabaseの管理手順を検討してください。
