# R2-C RFC｜Atomic v2 保存操作の永続証跡と確実な復旧

**状態：DESIGN ONLY / HOLD。実クラウドへの適用・Migration作成・実際の保存経路への接続は未承認。**

## 1. 根拠と限界

0009の`save_match_record(jsonb)`は`contract_version=2`と`expected_revision`を受け、成功時に`revision`、`updated_at`、`created_tickets`を返す。`get_match_record_snapshot(uuid)`は現在の集約状態を返す。ただしどちらにも**送信試行IDの永続記録と検索契約がない**。既存の`pendingSaveGuard.ts`はブラウザ側に`attemptId`、所有者・試合IDと状態だけを記録している。したがってタイムアウト後のrevision一致・画面一致・レコード不在は、送信結果の確証にならない。

## 2. 推奨する新契約（今後の0010以降、未実装）

`save_match_record`のv1/v2互換性を保ちつつ、**新契約バージョン3**で`operation_id`（UUID）と`payload_digest`（SHA-256、正規化対象を仕様化）を必須とする。v2を後付けで意味変更しない。操作IDはクライアントで送信前に一度生成し、未確定時に変更しない。ハッシュはオーナー／試合ID／契約バージョン／編集基準revision／操作内容を含め、JSONの順序や数値・null表現について決定的なcanonicalizationを規定する。秘密鍵・個人情報・チケット本文をログやlocalStorageに保存しない。ハッシュだけを保存し、機密値の推測可能性が残ることも認識する。

新テーブル（仮称）`match_save_operations`：`owner_id uuid`、`match_id uuid`、`operation_id uuid`、`payload_digest text`、`status`（committedのみを成功証拠とする）、`revision text`またはbigint、`updated_at timestamptz`、`created_tickets jsonb`、`committed_at timestamptz`。`(owner_id, operation_id)`を一意とし、同一IDの別内容送信は明確に拒否。保存操作と証跡INSERTは**同一DBトランザクション**で行い、証跡が残らない成功コミットを許さない。保存失敗は全体ロールバックするため、証跡の不在は失敗の証拠ではない。

RPC側で**ロック取得直後、既存操作証跡の確認を、revision CASより先に行う**。同じoperation_id・同じdigest・同じownerで既にコミット済みなら再実行せず既存の成功証跡を返す。ただし再送信はUIが自動実行しない（読取照合を優先）。同じID・違う内容なら拒否。競合順序、トリガー経由のrevision増分、全試合共通advisory gate、支払い保護を既存0010以前と矛盾させない。検索RPCは`operation_id`と認証済み所有者でのみ取得可能で、他人の証跡は返さない。RLSと関数権限を別途検証する。

**重要：現行0009のglobal advisory lockとDML triggerが存在するため、証跡確認・冪等返却をCASより前に配置する際にも、テーブル操作順とデッドロック検証を必要とする。**

## 3. ブラウザ復旧の状態遷移

| 読み取り結果 | 判定 | 次動作 |
| --- | --- | --- |
| 同一owner/match/operation/digestのcommitted証跡 | committed_verified | **再送信せず**新スナップショットと証跡revisionを照合。自動解除はしない |
| operation_id不在 | unresolved | ロック維持。不存在は失敗の確証ではない |
| ネットワーク失敗、権限不足、破損、不一致 | unresolved | ロック維持。操作内容を再送しない |
| snapshot上の値のみ一致 | unresolved | ロック維持。今回の送信結果は不明 |
| 操作IDが一致するがdigest不一致 | unresolved/mismatch | ロック維持。セキュリティイベントとして扱う |

ブラウザ保存の記録が消去された場合／別端末ではローカルロックで守れない。サーバー側の一意性・認証・CASが真の保証。既存v1/v2や旧RESTへのダウングレードは不可。DBへの保存と確認後解除を実装する段階では、専用E2E、同時実行、クライアントクラッシュ、コミット直後の504、権限・リプレイ・ハッシュ不一致の試験が必須。

## 4. 今回の実装範囲

`src/lib/atomic/operationReceiptPolicy.ts`は**将来の検索結果を受け取って分類する純粋関数のみ**。RPC呼び出し、ブラウザ保存の解除、Migration、既存Context、UI、環境変数は変更しない。`verified_commit`でも`mayReleaseAutomatically=false`を返す。`not_found`を失敗確定とみなさない。

## 5. 先行して検証する受入条件

1. 異なるowner/match/operation/digestでは保存成功とみなさない。
2. `revision`はbigint相当の10進文字列を保持する。
3. 取得不能・認可失敗・データ破損・証跡不在でロック解除しない。
4. 保存と証跡書き込みを同一トランザクションで実現できる0010 SQL案と隔離DB試験を、別工程で作成する。
5. PostgreSQL上で2クライアント同時送信、同一operation再送、内容不一致、504、ロールバック、RLS、payment保護を試験する。
6. 0009クラウド適用・フラグ有効化・本番デプロイは継続HOLD。

## 6. 意図的な未解決事項

安全な「未コミット確定」証明、旧v2保存と新v3契約の共存期間、巨大/複雑なペイロードの正規化、操作証跡の保持期間・削除後の再利用防止、監査ログ内の個人情報最小化、証跡とsnapshotの整合保証、localStorage故障、別端末での可視化、手動解除権限は未決。これらを解決せずに保存ロック解除の実装を許可しない。
