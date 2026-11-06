# Supabase初期構築チェックリスト

## 事前確認

- [ ] 対象が新規`new-game-log`プロジェクトである
- [ ] 既存データを破壊する操作が不要である
- [ ] `service_role`キー、DBパスワードをフロントエンドやGitに保存していない
- [ ] AuthのEmail/Password設定と公開サインアップ方針を確認した
- [ ] `supabase/setup/new_game_log_initial_setup.sql`を内容確認した

## SQL適用

- [ ] Supabase SQL Editorで[単一SQLパッケージ](../supabase/setup/new_game_log_initial_setup.sql)だけを使用する
- [ ] 新規プロジェクトのSQL Editorで次の順序を維持する
  1. `BEGIN;`
  2. `0001_initial_schema.sql`相当
  3. `0002_rls_policies.sql`相当
  4. `0003_views_functions.sql`相当
  5. `0004_seed_master_data.sql`相当
  6. `COMMIT;`
- [ ] 実行中にAPIクライアントから接続しない
- [ ] エラー時は同じセッションで`ROLLBACK;`し、成功扱いにしない
- [ ] SQL適用後に[verify_schema.sql](../supabase/verification/verify_schema.sql)を管理者権限で実行する
- [ ] SQL適用後に[verify_rls.sql](../supabase/verification/verify_rls.sql)を管理者権限で実行する

## 検証結果の判定

- [ ] 必須テーブル一覧に欠落がない
- [ ] 必須ビュー一覧に欠落がない
- [ ] 複合FK `payments_watch_record_match_owner_fk` と `payments_ticket_match_owner_fk` が存在する
- [ ] `pg_tables.tablename` / `pg_tables.rowsecurity`の結果で全個人テーブルのRLSが有効である
- [ ] 必須ポリシー一覧に`MISSING`がない
- [ ] `public_has_usage`が`false`である
- [ ] `anon`のスキーマ・テーブル・ビュー権限がない
- [ ] `authenticated`には必要な権限がある
- [ ] ビューの`reloptions`に`security_invoker=true`が確認できる
- [ ] 以上のいずれかが満たされない場合、Authユーザー作成やデータ投入をSTOPする

検証SQLは一覧と不足状態を返す読み取り専用SQLです。SQL Editorの管理者権限で成功しても、RLSの実ユーザー動作がPASSになったことは意味しません。

## Auth本人の作成・承認

- [ ] 管理者がSupabase Auth画面で本人アカウントを作成する
- [ ] 作成した本人UUIDを管理者経路で確認する
- [ ] UUIDをSQLファイルへ保存せず、その場限りの管理者SQLで承認する

```sql
insert into public.authorized_users (user_id, default_cheer_team_id, note)
values ('確認済みの本人UUID', 'dragons', '初期利用者');
```

- [ ] 一般ユーザーのAPIセッションから`authorized_users`へのINSERT/UPDATE/DELETEが拒否される
- [ ] 現行の個人専用運用では承認済みユーザーが共有マスターを編集できる仕様を確認する
- [ ] 将来複数利用者にする場合は管理者ロールとマスター変更ポリシーを分離する

## RLS受入テスト

Supabase URLとanon keyを使用し、管理者キーを使わない別セッションで実施します。

- [ ] 匿名: 個人テーブル・ビューのGET/POST/PATCH/DELETEが拒否される
- [ ] 未承認Authユーザー: マスター、個人テーブル、ビューのGETと個人データCRUDが拒否される
- [ ] 承認済み本人: 自分のマスターSELECTと個人データCRUDが成功する
- [ ] 承認済み本人: 他ユーザーUUIDを`owner_id`にしたINSERTが拒否される
- [ ] 承認済み本人: 既存行の所有者変更が拒否される
- [ ] 承認済み本人: 他所有者の子行とビュー参照が拒否される
- [ ] 承認取り消し後: 既存セッションでもGET/PATCH/DELETEが拒否される
- [ ] `security_invoker`ビュー経由で他所有者の行を取得できない

## 削除動作

- [ ] `matches`削除時、関連する観戦記録・チケット・支払い・スコア等がCASCADE削除されることを理解している
- [ ] `watch_records`削除時、関連する座席・カテゴリ・支払いがCASCADE削除される
- [ ] `tickets`削除時、関連する支払いがCASCADE削除される
- [ ] 履歴保持が必要な場合は、適用前に別途レビュー済みの削除ポリシーを設計する

## STOP基準

次のいずれかに該当する場合、本人承認・実データ投入・アプリ接続を行わない。

- SQLエラー、トランザクション未完了、または`ROLLBACK`未確認
- 必須テーブル・ビュー・FK・ポリシーが`MISSING`
- RLS無効、PUBLIC/anon権限あり、または想定外のauthenticated権限あり
- 匿名・未承認ユーザーのテストが成功してしまう
- 承認済み本人が所有者を偽装できる
- ビューが他所有者のデータを返す
