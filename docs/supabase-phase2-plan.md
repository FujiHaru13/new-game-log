# Supabase Phase 2 設計・実装計画

## 方針

Phase 2では、現在の`MatchRecord`の詳細項目を正規化テーブルへ保存・復元します。既存のPhase 1データを破壊せず、RPC追加を含むDB変更は別途レビュー・承認後に実施します。アプリ起動時の自動投入や初期構築SQLの再実行は行いません。

## 対応表

| TypeScript | Supabaseテーブル/列 | Phase 2方針 |
|---|---|---|
| `InningScore.home/away` | `match_inning_scores(match_id, inning_number, side, runs)` | 配列の空欄はNULL、`X`はホーム側の未実施表現として保存規則を決定 |
| `InningScore.homeHits/awayHits`, `homeErrors/awayErrors` | `match_team_totals(match_id, side, hits, errors)` | home/away各1行をupsert |
| `PitcherInfo` | `match_pitchers(match_id, side, role, player_name)` | starter/winning/losing/saveを行へ展開 |
| `homeRuns` | `match_events(event_type='home_run', player_name, description, side, event_order)` | 本塁打ごとにイベント行 |
| `events` | `match.events`または`match_events(event_type='other')` | 既存の概要テキストと詳細イベントを混同しない保存規則を決定 |
| `links` | `match_links(match_id, title, url)` | 既存行を削除して再挿入する方式をRPC内で実行 |
| `CostInfo.splits` | 現行スキーマに専用テーブルなし | `payment_splits`追加を別Migrationで設計。現行`payments`は明細1行として扱う |
| `CostInfo` | `watch_records`および`payments` | 総額・自己負担額と支払明細を分離。既存列を上書きしない |
| `TicketManagement` | `tickets` | `quantity`, `payment_deadline`, `vendor`, `purchase_amount`, `my_expense`, 返金列を追加マッピング |

## 現状の未接続・注意点

- Phase 1の`toMatchRecord`はイニング、投手、イベント詳細、リンク、分割支払いを復元していません。
- Phase 1の保存処理もこれらを保存していません。
- `TicketManagement.quantity`, `paymentDeadline`, `vendor`はフォーム・DB列が存在するため、Phase 2で明示的に接続します。
- `payments`には現在のスキーマ上、支払い分割専用の親子テーブルがありません。既存の`payments`を分割明細として誤用せず、専用テーブルを追加する必要があります。
- `match_inning_scores.runs`はNULLを許容するため、未入力と0を維持できます。`X`の保存表現はDB変更前に確定します。

## 原子的保存RPC案

実装関数: `public.save_match_record(p_payload jsonb)`. 初回定義はMigration [`0007_phase2_atomic_save.sql`](../supabase/migrations/0007_phase2_atomic_save.sql)、クラウド適用済み関数の競合通知コード修正は[`0008_phase2_conflict_pt409.sql`](../supabase/migrations/0008_phase2_conflict_pt409.sql)で行います。

1. `auth.uid()`がNULLでないことを確認する。
2. `current_user_is_authorized()`を確認する。
3. payloadのowner_idを受け取らず、常に`auth.uid()`を所有者として使用する。
4. `matches`をinsert/updateする。
5. `watch_records`をinsert/updateする。
6. カテゴリ、座席、チケット、イニング、チーム合計、投手、イベント、リンク、支払い分割を同一トランザクションで置換する。
7. すべての参照ID、`seat_type_id`、所有者、match_id整合性を検証する。
8. 例外時は関数全体をロールバックし、成功時だけJSON結果を返す。

関数は`SECURITY INVOKER`、`search_path = public, pg_catalog`とし、`authenticated`だけにEXECUTEを付与します。`PUBLIC`と`anon`はEXECUTE不可です。`payload jsonb`はJSON演算子で型変換し、所有者はpayloadから受け取らず`auth.uid()`を使用します。`replace`オブジェクトがtrueの子集合だけを置換するため、未指定項目は保持され、明示的な空配列/nullは削除として扱えます。

更新時は`match.expected_updated_at`を必須の競合検出値として送信します。DBの`updated_at`と一致しない場合はPostgRESTの再試行を誘発しない`PT409`で全体をロールバックします。新規行にはこの値を要求せず、既存行の更新だけを保護します。`watch`を省略した既存試合は既存観戦記録を保持し、新規試合で省略した場合だけエラーにします。

nullableな値はJSONの`null`で表現し、空文字列は契約違反として拒否します。したがって未指定（JSONキーなし）、明示的`null`（NULL化）、空文字列（拒否）は区別されます。

チケットはDB上複数行を許容します。`ticket.id`を指定した場合はその所有者・試合の行だけを更新し、`status`、日付、枚数、座席、種別、購入先、メモをキー単位で更新します。未指定キーは保持し、JSON `null`だけがNULL化します。`replace.ticket=false`は保持、削除は`replace.ticket=true`かつ`ticket_operation="delete"`と対象`ticket.id`を必須とします。複数行が存在するのにIDを省略した更新、存在しない・他人所有のID、IDなしの削除は拒否します。

アプリ側は`VITE_SUPABASE_ATOMIC_SAVE=true`の場合だけRPCを呼びます。既定値はfalseで、Migration未適用の環境では従来の保存処理を使用します。RPC応答は`ok`, `match_id`, `watch_record_id`を検証し、不一致を成功扱いしません。

環境変数は`.env.example`に記載しています。Migration未適用の環境でこのフラグをtrueにしてはいけません。

## Phase 2実装順序

1. 型とDB列の対応表を確定する。
2. `payment_splits`の必要性、`X`の表現、イベントの重複規則をレビューする。
3. RPCと必要なMigrationを追加する。
4. `verify_schema.sql`、`verify_rls.sql`を更新する。
5. RPCを使う読み書き変換層を実装する。
6. 既存Phase 1データを読み込む後方互換テストを実施する。
7. 隔離テストユーザー・隔離試合で原子性、RLS、再試行を検証する。

## 0007・0008適用前後の確認

- 0001〜0006は再実行せず、既存データを変更しない。
- 0007適用済みのクラウドでは0007を再実行せず、0008だけを管理者経路で適用する。0008は`CREATE OR REPLACE FUNCTION`で関数の権限・SECURITY INVOKER・引数・戻り値を維持する。
- 0008適用後に`verify_phase2a.sql`で関数、RLS、EXECUTE権限、`payment_splits`、`is_not_played`、意図的競合コード`PT409`を確認する。
- SQL Editorで適用済みのMigrationとCLIのローカル履歴が異なる場合は、適用日時・実行SQL・関数定義の差分を記録し、0008を重複適用しない。
- 検証後にのみ`VITE_SUPABASE_ATOMIC_SAVE=true`を設定して段階切替する。現状は`false`を維持する。
- RPC失敗時はアプリが成功扱いせず、既存の再読込・エラー表示で停止する。
- 実PostgreSQL/Supabaseでのトランザクション・RLS受入は、隔離ユーザーと隔離試合で別途実施する。

## 部分保存と再試行

RPC導入前はPostgREST複数リクエストのため完全な原子性がありません。Phase 1の補償削除・再読込・エラー表示を維持します。RPC導入後は同じ`match_id`を再送してもupsert/子行置換が決定的になるようにし、クライアントの二重送信防止と併用します。

## 受入条件

- 未入力スコアと0点が復元時も区別される。
- 延長イニングを保存できる。
- 投手・本塁打・イベント・リンクが重複せず復元される。
- 分割支払いの合計と親支払いが混同されない。
- RPC失敗時に親子の一部だけが残らない。
- 匿名、未承認、他人所有者がRPCを実行できない。
- 楽観的競合は`PT409`またはHTTP 409として通知され、504/タイムアウトは成功扱いされない。
