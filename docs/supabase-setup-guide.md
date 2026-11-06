# Supabaseセットアップ手順

## 1. 前提と安全策

- 対象は新規Supabaseプロジェクト`new-game-log`です。
- SQLはSupabase SQL Editorで、番号順に1回ずつ実行します。
- `0004_seed_master_data.sql`にも架空の試合・支払い・チケットはありません。
- `service_role`キーやDBパスワードをフロントエンド、Git、ドキュメントへ保存しません。
- 初期マイグレーションは既存スキーマを壊す`DROP ... CASCADE`を含みません。再実行すると既存オブジェクトで失敗するため、再適用は行わず、必要なら新しい番号の差分マイグレーションを作成します。

## 2. 実行順序とトランザクション境界

一度に実行する提出物は[`supabase/setup/new_game_log_initial_setup.sql`](../supabase/setup/new_game_log_initial_setup.sql)です。これは下記4本を順序どおり連結し、外側の`BEGIN`/`COMMIT`だけを追加した生成物です。個別マイグレーションを別々のセッションで実行しないでください。

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_rls_policies.sql`
3. `supabase/migrations/0003_views_functions.sql`
4. `supabase/migrations/0004_seed_master_data.sql`
5. `supabase/verification/verify_schema.sql`
6. `supabase/verification/verify_rls.sql`

新規プロジェクトでは、1〜4を**1つのトランザクション**として実行し、各ファイルの間にAPIクライアントから接続しないでください。実行単位は、SQL Editorで次の順に`BEGIN`、0001、0002、0003、0004、`COMMIT`を同一エディタ実行に含めることです。`public`スキーマのPUBLIC USAGEはSupabaseサービスのため維持します。0001では今回作成するアプリ専用テーブルだけの権限を遮断し、0002の最後で承認済みauthenticated向け権限だけを戻します。これにより、途中失敗時は`ROLLBACK`で初期構築全体を戻せます。

既に初期構築済みのデータベースには、初期構築SQLや`0001`〜`0004`を再実行せず、差分マイグレーション[`0005_restrict_function_execute.sql`](../supabase/migrations/0005_restrict_function_execute.sql)だけを管理者経路で適用します。この差分は3関数の`PUBLIC`/`anon` EXECUTEを取り消し、`authenticated`のEXECUTEを維持します。新規プロジェクト用の連結パッケージには含めません。

SQL Editorで実行する場合の形は次のとおりです。各ファイル内容をこの順に連結して実行します。

```sql
begin;
-- 0001_initial_schema.sql
-- 0002_rls_policies.sql
-- 0003_views_functions.sql
-- 0004_seed_master_data.sql
commit;
```

Phase 2Aを適用済みの環境では、0007を再実行せず、[`0008_phase2_conflict_pt409.sql`](../supabase/migrations/0008_phase2_conflict_pt409.sql)だけを管理者経路で実行します。0008は`save_match_record(jsonb)`の明示的な競合通知だけを`PT409`へ変更し、実際の直列化失敗を変換する例外ハンドラは追加しません。実行後に[`verify_phase2a.sql`](../supabase/verification/verify_phase2a.sql)を実行し、関数定義、SECURITY INVOKER、`authenticated` EXECUTE、PUBLIC/anon拒否、RLS、`PT409`を確認します。SQL Editorで適用済みの履歴とSupabase CLIの履歴が異なる場合は、関数定義と適用日時を記録してから進めます。

途中でエラーになった場合は同じセッションで`rollback;`を実行し、原因を直して新しいトランザクションとして最初から実行します。Supabase CLI等が外側のトランザクションを管理する場合は、CLIの管理に任せてSQLへ二重の`BEGIN`/`COMMIT`を追加しません。既存スキーマに対して再実行せず、破壊的な`DROP ... CASCADE`も使用しません。

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

## 5. RLS受入テスト（REST）

本番データ投入前に、Supabase URLとanon keyを使う別REST/JSセッションで確認します。管理者キーは使いません。テスト用の承認済みユーザーA、未承認ユーザーBを用意し、匿名セッションも用意します。

1. **匿名**: `/rest/v1/teams`、個人テーブル、各ビューをGETし、全て401/403または0件相当であること。POST/PATCH/DELETEも拒否されること。
2. **未承認AuthユーザーB**: マスターGET、個人データGET、各ビューGET、個人データPOST/PATCH/DELETEを試し、全て拒否されること。承認状態の自己INSERT/UPDATE/DELETEも拒否されること。
3. **承認済み本人A**: マスターGETと自分の個人データCRUDが成功すること。`owner_id`をBや任意UUIDにしたPOST、既存行のowner変更、別所有者の子行・ビュー参照を試し拒否されること。
4. **承認取り消し**: 管理者経路でAの`authorized_users`行を削除または無効化し、同じAセッションで個人テーブル・ビューのGET/PATCH/DELETEが拒否されること。matchesのDELETEによるCASCADEも実行できないこと。

SQL Editor管理者セッションではRLSを正しく再現できないため、Supabase JSのanon key + 各ユーザーのセッションで実施します。

## 6. 接続確認

最初はマスターのSELECT、次に空の個人データSELECT、最後に承認済みユーザーで1件の手動作成・更新・削除を確認します。試合を作成する際は、先にteam/stadium/categoryのマスターIDを取得し、`owner_id`は常にクライアントのAuth UIDを使います。

## 7. よくあるエラー

- `new row violates row-level security`: Authセッションがない、または`authorized_users`に本人UUIDがない。`owner_id`を固定値にしない。
- `permission denied for table`: anonキーで管理者SQLを実行している。マスター投入・承認はSQL Editor等の管理者経路で行う。
- `public_has_usage`が`true`: SupabaseではPUBLICのpublicスキーマUSAGEは維持します。これはアプリ専用テーブルの実効権限やRLSを許可するものではありません。19テーブルのanon権限がfalseであることを別途確認します。
- 関数権限検証では、`current_user_is_authorized`、`set_updated_at`、`check_import_row_match_owners`の`public_execute`/`anon_execute`が`false`、`authenticated_execute`が`true`、`security_definer`が`false`であることを確認します。
- `violates foreign key constraint`: マスターのIDが未投入、または現行TSのIDとDBのIDが異なる。ID対応表を確認する。
- `payments_*_match_owner_fk`違反: 支払いの`match_id`と、指定した観戦記録またはチケットの`match_id`が一致していない。支払い対象を同じ試合から選ぶ。
- `score confirmation`のCHECK違反: 確定フラグを立てる前に両スコアを入力する。未入力はNULLのままにする。
- ビューで行が見えない: `security_invoker`により基表RLSが適用されている。呼び出し元のAuth UIDと承認状態を確認する。
- 同日登録が拒否される: このスキーマには日付UNIQUE制約はない。別のクライアント側重複チェックを確認する。
- 球場不明: `matches.stadium_id`と`stadium_custom_name`は両方NULLを許容する。`NULL`は不明・未入力、`other_stadium`は実際に「その他球場」と判明している場合だけ使う。表示時はマスター名、自由入力名、不明ラベルの順に解決する。

## 8. ロールバック

初期適用後に問題が見つかった場合、対象データを削除する前にバックアップと影響範囲を確認します。テーブル削除や`DROP ... CASCADE`を手動で実行せず、修正用の新しい番号付きmigrationを作成します。新規プロジェクトでSQL適用直後かつデータ未投入の場合だけ、プロジェクト再作成を含むSupabaseの管理手順を検討してください。
