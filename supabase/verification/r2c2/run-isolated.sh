#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../.."
repo="$(pwd)"
if [[ ! -f "$repo/supabase/migrations/0009_phase2_multi_ticket_atomic.sql" || ! -f "$repo/docs/sql-candidates/0010_phase2_operation_receipts_draft.sql" ]]; then
  echo 'STOP: expected 0009 and 0010 candidate not found' >&2
  exit 2
fi
if ! command -v docker >/dev/null 2>&1; then
  echo 'STOP: Docker is not installed; no cloud fallback is allowed' >&2
  exit 2
fi
if ! docker image inspect postgres:16 >/dev/null 2>&1; then
  echo 'STOP: image postgres:16 is not cached. Run docker pull postgres:16 separately, then retry.' >&2
  exit 2
fi
name="ngl-r2c2-isolated-$$"
cleanup() { docker rm -f "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run --detach --rm --name "$name" --network none \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  -e POSTGRES_DB=isolated_test \
  postgres:16 >/dev/null
for i in {1..40}; do
  if docker exec "$name" pg_isready -U postgres -d isolated_test >/dev/null 2>&1; then break; fi
  sleep 1
done
docker exec "$name" pg_isready -U postgres -d isolated_test >/dev/null

run_sql() {
  local path="$1"
  docker cp "$path" "$name:/tmp/current.sql" >/dev/null
  docker exec "$name" psql -X -v ON_ERROR_STOP=1 -U postgres -d isolated_test -f /tmp/current.sql
}
run_sql "$repo/supabase/verification/r2c2/bootstrap.sql"
for i in {1..9}; do
  source_path="$(find "$repo/supabase/migrations" -maxdepth 1 -type f -name "$(printf '%04d' "$i")_*.sql" -print -quit)"
  if [[ -z "$source_path" ]]; then echo "STOP: missing migration $i" >&2; exit 2; fi
  echo "APPLY (isolated only): $(basename "$source_path")"
  run_sql "$source_path"
done
run_sql "$repo/docs/sql-candidates/0010_phase2_operation_receipts_draft.sql"
run_sql "$repo/supabase/verification/r2c2/verify.sql"
echo 'BASIC ISOLATED TEST PASS; additional security/concurrency tests required before promotion'
