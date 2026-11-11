# R2-C2 — Migration 0010: isolated SQL candidate (HOLD)

This migration is **NOT production approved**. Do not paste it into Supabase cloud SQL Editor. 0001–0009 stay unchanged.

## Contract

- Adds `save_match_record_v3(jsonb)`, leaving v1/v2 `save_match_record(jsonb)` untouched.
- Requires `contract_version: 3`, `operation_id` (UUID), `payload_digest` (lowercase hex SHA-256).
- The digest is computed by PostgreSQL over `(payload - 'operation_id' - 'payload_digest')::text`, using UTF-8. **It is not JS JSON.stringify.** A future client must obtain the digest via `get_match_save_payload_digest(jsonb)` against the same frozen payload.
- v3 wrapper obtains existing 0009 global advisory lock, checks existing receipt **before** the old CAS, calls v2 core exactly once, inserts receipt in the **same transaction**.
- Same operation+digest returns prior committed result (`replayed: true`), without writing. Same operation with a different digest/match -> PT409.
- Receipt lookup is `get_match_save_operation_receipt(uuid)`: `null` means unresolved, not rejected. Does not clear any client marker.
- There is deliberately no match FK on the receipt table; receipts survive later match deletion and do not block normal parent cleanup. This needs a retention and privacy review.

## Security gate — not yet established

The v3 RPC is `SECURITY DEFINER` so authenticated callers cannot manufacture committed receipts via table INSERT. **This also causes the legacy v2 SECURITY INVOKER core to run with definer privileges**, potentially bypassing RLS. The new wrapper explicitly checks auth authorization and parent ownership, but that is **not equivalent to an audited proof** of full tenant isolation. Before any cloud migration, audit every SQL child DML for cross-owner effects, test unauthorized roles, and consider an alternative least-privilege role design. Do not mark PASS based only on the SQL syntax.

## Required isolated database tests

1. Start a freshly created local disposable PostgreSQL instance with auth/Supabase schema and applied 0001–0009 migrations. Do not connect this script to the real cloud.
2. Verify initial `v1` and `v2` success and existing 0009 regression tests are unchanged.
3. v3 first save: single transaction contains saved data and exactly one committed receipt; `replayed` false.
4. Re-send same operation_id + exact payload after successful commit: no extra revisions/rows, `replayed` true, ticket UUID mapping identical.
5. Reuse ID with changed payload/digest or match: PT409 and no mutations.
6. Spoof wrong digest: 22023; no modifications.
7. Force rollback after invoking v3 in an outer transaction; receipt **and data** absent afterward. Absence does not prove failure to the client.
8. Test two concurrent connections on same and different matches, opposite ordering, no deadlocks/duplicate receipts; verify global gate behavior and timing.
9. Impersonate second authenticated owner; cannot read or write another owner's match or receipt, including by guessing UUID.
10. Direct `anon` and `authenticated` INSERT/UPDATE/DELETE of receipt table denied. Table SELECT likewise denied; only lookup RPC available.
11. Validate old and new payments protection, parent delete, FK cascades, check default privileges and function execution grants.
12. Simulate disconnect/HTTP504 **after** commit; lookup proves committed but UI marker stays blocked until a separately approved reconciliation procedure.
13. Validate SQL syntax, extension version, PostgREST signatures and that all migration changes are additive. Re-run migrations on disposable clone only.
14. Study legacy old REST/v1/v2 coexistence; new receipts do not make their writes idempotent.

## Explicit HOLDs

- R2-C3 React integration, evidence-based unlock, auto retries, cloud migration, feature flag, deployment
- No claim that these SQL tests passed; current artifact is a candidate for isolated DB review only
