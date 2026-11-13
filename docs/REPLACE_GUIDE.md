# new-game-log 置き換え・再構築手順書（REPLACE_GUIDE）

この文書は、`new-game-log` を別の環境で再現するための手順書である。

- 初期データ SQL（`supabase/seed-initial-data.sql`）を Supabase SQL Editor で実行する手順
- ローカルでアプリを起動する手順
- ビルドとデプロイの考え方

根拠は次のファイルである。数値や仕様で迷ったら、推測せずこちらを参照すること。

- `supabase/seed-initial-data.sql` の冒頭コメント（前提・実行順序・冪等性・投入保留3件の扱い）
- `src/lib/supabase.ts`（環境変数の正確な名前と fallback）
- `package.json` の `scripts`
- 調査レポート `~/workspace/new-game-log-port/INVESTIGATION.md` の §1（データ層・環境変数）と §6（`scripts`／ビルド）

> 注意: `supabase/seed-initial-data.sql` は生成スクリプトで作成されたファイルで、冒頭コメントに「手で編集しないこと」とある。内容を変える場合は生成元（`src/data/seedData.ts` など）と生成スクリプト側を直して再生成するのが原則である。

---

## 1. 初期データ SQL の実行手順（Supabase SQL Editor）

対象ファイルは `supabase/seed-initial-data.sql` である。Supabase の SQL Editor（postgres ロール）で実行する。SQL Editor の実行は RLS をバイパスするため、投入はこの経路で行う。

### 1.1 前提: マイグレーション 0001〜0009 が適用済みでテーブルが存在すること

`seed-initial-data.sql` は、次の一覧のマイグレーションがすべて適用済みで、全テーブルが存在することを前提とする。

```text
supabase/migrations/0001_initial_schema.sql
supabase/migrations/0002_rls_policies.sql
supabase/migrations/0003_views_functions.sql
supabase/migrations/0004_seed_master_data.sql
supabase/migrations/0005_restrict_function_execute.sql
supabase/migrations/0006_seed_seat_types.sql
supabase/migrations/0007_phase2_atomic_save.sql
supabase/migrations/0008_phase2_conflict_pt409.sql
supabase/migrations/0009_phase2_multi_ticket_atomic.sql
```

前提として効いてくる点は、たとえば次のとおりである。

- `payment_splits` テーブルは `0007` で追加される
- `matches.revision` 列は `0009` で追加される

#### 未適用の場合の適用方法

- 未適用のマイグレーションがある場合は、番号順に SQL Editor で適用してから `seed-initial-data.sql` を実行する。途中の番号を飛ばさないこと。
- 新規プロジェクトの初期構築については `docs/supabase-setup-guide.md` と `docs/supabase-initial-setup-checklist.md` も参照すること。新規プロジェクト用の一括版として `supabase/setup/new_game_log_initial_setup.sql`（0001〜0004 相当を連結した生成物）があるが、既存 DB へ再実行する用途ではない。
- 既に適用済みのマイグレーションは再実行しないこと。再実行すると既存オブジェクトで失敗する。既存 DB には、未適用分の差分マイグレーションだけを番号順に適用する。

### 1.2 重要: 実行前に `authorized_users` がちょうど1件であること

投入先の owner は自動確定される。`seed-initial-data.sql` は `public.authorized_users` に登録済みの行から投入先ユーザーを決める仕組みであり、次のガードが入っている。

- `authorized_users` が「ちょうど1件」でない場合、本ファイルは例外を出して停止する
- 停止した場合は単一トランザクション全体がロールバックし、中途半端な投入にはならない

実行前に、自分のユーザーだけが1件だけ登録されている状態にしておくこと。件数は SQL Editor で次で確認できる。

```sql
select count(*) from public.authorized_users;
select user_id from public.authorized_users;
```

複数ユーザー環境で使う場合は、この自動確定は使えない。`seed-initial-data.sql` 冒頭コメントの指示どおり、内部の投入先（`_seed_ctx`）への投入行を手で書き換える必要がある。その判断なしに、ガードを外して実行しないこと。

### 1.3 SQL Editor での実行手順

1. Supabase Dashboard を開き、対象プロジェクトの SQL Editor を開く
2. 新しいクエリを開き、`supabase/seed-initial-data.sql` の内容全体を開いて貼り付ける（ファイルの一部だけを実行しないこと）
3. 全体を1回で実行する
4. エラーなく完了し、コミットされたことを確認する

補足:

- 本ファイルは単一トランザクションである。エラー時は全体がロールバックする
- 末尾には件数検証の `DO` ブロックがあり、件数が不一致なら例外でロールバックする
- 再実行可能（冪等）である。マスタ投入はすべて `ON CONFLICT DO NOTHING` で冪等にしてあり、`matches.id` などの UUID も `legacy_id` から決定的に生成されるため、再実行しても同じ UUID になる

### 1.4 投入内容の概要

投入されるのは大きく分けて次の2つである。

| 区分 | 内容 |
|---|---|
| マスタ | `categories` / `teams` / `stadiums` / `seat_types` / `stadium_seat_types`。0004 / 0006 が適用済みでも再実行できるよう冪等にしてある。あわせて、シードが参照する不足マスタ（シード側 ID のチーム・球場など）もここで先に追加される |
| 観戦記録 | 生成元である `src/data/seedData.ts` の全259件のうち **256件**。`matches` → `watch_records` → `watch_record_categories` / `seats` / `tickets` → `match_inning_scores` / `match_team_totals` / `match_pitchers` / `match_events` の順に投入される |

投入されないもの:

- 投入保留の3件（次節 1.5）。そのため投入される `matches` / `watch_records` は 259件ではなく 256件であり、末尾の件数検証もこの「投入分」の件数で照合する
- `match_links`、`payment_splits`、`payments`、`import_batches` / `import_rows` は投入対象外である（シードに対応データが無い、または取込管理用であるため）

#### 誤記修正済み2件の注記

シード元の誤記2件は、推測ではなく確認済みの内容として、本 SQL で修正して投入される。元の `seedData.ts` の値をそのまま正としないこと。

1. **2026-02-28 侍ジャパン戦（`excel_jp_2026-02-28_12`）**
   - スコアを侍ジャパン **7-3** 中日に修正した（修正前は home / away が逆転していた）
   - あわせてイニング・安打・失策を追加した（イニング合計は修正後スコアと一致する）

2. **2026-08-30 ファーム戦（`excel_d2_2026-08-30_18`）**
   - 対戦相手を阪神から **ハヤテベンチャーズ静岡** に修正した
   - スコア 12-2 は記録どおり正しいため不変。イニングは検証可能な出典が無いため追加していない
   - 同日の別記録は未確定のため修正していない

### 1.5 投入保留3件の扱い

次の3件は投入保留である。

```text
excel_oth_2023-07-19_3
excel_oth_2024-07-25_7
excel_oth_2025-07-23_8
```

理由と現状:

- いずれもオールスター／レジェンドゲームの記録で、`home_team_id = away_team_id`（両側とも同一チーム）になっている
- そのままでは DB の制約 `matches_teams_distinct_ck`（`home_team_id <> away_team_id`）に違反するため投入できない
- データを推測で書き換えることはせず、`supabase/seed-initial-data.sql` の末尾にコメントアウトした INSERT として残してある

投入したい場合の考え方:

- 進め方は次のどちらかの判断が先に必要であり、コメントを外すだけでは投入できない
  1. **対戦相手を確定する**: 実態を確認したうえで片側のチームを正しい相手（例: その他の球団を表すマスタ）に直すなど、データ側を確定させる
  2. **制約を見直す**: 同一チーム同士の記録を許す仕様にするなら、`matches_teams_distinct_ck` の見直しを別途マイグレーションとして設計・判断する
- どちらの場合も、対象を末尾のコメントアウト部分だけで完結させず、投入先の対応表への追加と末尾の件数検証（現在は256件前提）の見直しまで含めて行うこと

---

## 2. ローカル起動手順

### 2.1 コードの取得と依存の導入

```bash
git pull
bun install
```

- パッケージマネージャは Bun 前提である（`bun.lock` がある）。`package.json` の npm スクリプトもそのまま動く

### 2.2 `.env` の作成

リポジトリルートに `.env` を作成し、Supabase 接続情報を設定する。変数名は `src/lib/supabase.ts` が実際に読む名前であり、次が正確である。

```dotenv
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

| 変数 | 意味 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase の Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable Key（第1優先） |
| `VITE_SUPABASE_ANON_KEY` | 旧名。fallback として有効である |

- キーの優先順位は `src/lib/supabase.ts` の実装どおり、`VITE_SUPABASE_PUBLISHABLE_KEY` → `VITE_SUPABASE_ANON_KEY` → ブラウザの `localStorage` 保存値の順である
- `service_role` キーや `sb_secret_` で始まる秘密キーは使わないこと。コード側の安全ガードで接続が無効化される
- `.env` を変更した場合は、開発サーバーを再起動すること（Vite の環境変数は起動時・ビルド時に読み込まれる）

### 2.3 任意フラグ（Atomic Save / v2）

保存経路を切り替える任意フラグである。いずれも文字列で `'true'` のときだけ有効になる。

```dotenv
VITE_SUPABASE_ATOMIC_SAVE=true
VITE_SUPABASE_ATOMIC_V2_TICKET_WRITES=true
VITE_SUPABASE_ATOMIC_V2_FULL_FORM_WRITES=true
```

| 変数 | 有効化されるもの | 条件 |
|---|---|---|
| `VITE_SUPABASE_ATOMIC_SAVE` | v1 Atomic RPC 保存（RPC `save_match_record`）。イニング等の Phase2 詳細の読み込み可否もこのフラグで決まる | 単独で `'true'` |
| `VITE_SUPABASE_ATOMIC_V2_TICKET_WRITES` | v2 チケット保存 | `VITE_SUPABASE_ATOMIC_SAVE` と両方 `'true'` |
| `VITE_SUPABASE_ATOMIC_V2_FULL_FORM_WRITES` | v2 フォーム全体保存 | 上記2つが有効なうえで、さらに本変数も `'true'`（3つの AND） |

注意:

- **複数チケットの保存には v2 パス有効化が必要である。** レガシー REST 経路と v1 Atomic 経路はどちらも複数チケット（`tickets.length > 1`）を例外で拒否する。複数チケットを保存できるのは v2 経路だけであり、フォーム全体で使う場合は上記3フラグすべてを `true` にすること
- `.env.example` に記載があるのは `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_ATOMIC_SAVE` のみである。v2 系の2変数は `.env.example` には無いので、本節を根拠に設定すること

### 2.4 開発サーバーの起動

```bash
npm run dev
```

- 実体は次であり、ポートは 3000 である

```bash
vite --port=3000 --host=0.0.0.0
```

- 起動後は次で開く

```text
http://localhost:3000
```

#### 環境変数が無い場合はローカルモードで動く

`VITE_SUPABASE_URL` かキーが無い場合、`src/lib/supabase.ts` の `getSupabaseConnection()` は `null` を返し、アプリはローカルモードで動く。

- 保存先はブラウザの `localStorage` で、初期データとしてシード（`INITIAL_SEED_RECORDS`）が使われる
- この状態では Supabase へは読み書きしない。Supabase 接続時の動作を確認したい場合は、`.env` を設定してから再起動すること

### 2.5 検証コマンド

```bash
npm run lint
npm run build
npm run test
```

| コマンド | 実体・意味 |
|---|---|
| `npm run lint` | `tsc --noEmit`。型チェックはこれでのみ行う。`npm run build` には `tsc` は含まれないため、型エラーがあってもビルド自体は通る点に注意すること |
| `npm run build` | `vite build`。`dist/` を生成する（次章参照） |
| `npm run test` | Supabase 不要のテストスイート群を直列に実行する。実 DB が必須な検証はこのコマンドには含まれない |

---

## 3. ビルド・デプロイの考え方

### 3.1 ビルド

```bash
npm run build
```

- 実体は `vite build` であり、成果物は `dist/` に生成される
- 本アプリは静的 SPA である。アプリ本体に常駐サーバーは不要で、データの保存先は Supabase（接続時）またはブラウザの `localStorage`（ローカルモード）である
- `fonts/` のフォントなども含め、成果物一式が `dist/` に入る

### 3.2 環境変数はビルド時に埋め込まれる

Vite の `VITE_` プレフィックス環境変数は、実行時ではなく **ビルド時に埋め込まれる**。この点がデプロイで最も間違いやすい。

- デプロイ先でも、ビルドを行う環境に `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`（および必要なら任意フラグ）を設定してからビルドすること
- ビルド済みの `dist/` に対して後からサーバー側の環境変数を変えても反映されない。値を変えたら再ビルドが必要である
- ローカルで正しく動いていても、デプロイ先のビルド環境に同じ変数が無ければ、デプロイ先ではローカルモード（Supabase 未接続）として動く

デプロイ時の流れは次である。

```bash
# デプロイ先のビルド環境で VITE_SUPABASE_URL 等を設定したうえで
npm run build
# 生成された dist/ の中身をホスティング先へ配置する
```

### 3.3 配置先

- `dist/` は静的ファイル一式なので、任意の静的ホスティングに置ける
- 配置先を変えてもアプリ側の作り替えは不要である。変える必要があるのは、ビルド環境の環境変数と、配置先へのアップロード方法だけである
