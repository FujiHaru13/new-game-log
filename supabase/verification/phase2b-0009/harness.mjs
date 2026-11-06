import { execFileSync, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

export const container = 'new-game-log-0009-isolated-20261106';
export const database = 'new_game_log_0009_isolated';
export const project = container;
export const owner = '00000000-0000-0000-0000-000000000001';
export const other = '00000000-0000-0000-0000-000000000002';
export const unapproved = '00000000-0000-0000-0000-000000000003';
export const match = '10000000-0000-0000-0000-000000000001';
export const otherMatch = '10000000-0000-0000-0000-000000000002';
export const watch = '20000000-0000-0000-0000-000000000001';
export const a = '30000000-0000-0000-0000-000000000001';
export const b = '30000000-0000-0000-0000-000000000002';
export const foreignTicket = '30000000-0000-0000-0000-000000000003';
export const missing = '90000000-0000-0000-0000-000000000099';
const args = ['exec', '-i', container, 'psql', '-X', '-q', '-At', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', database];
export const literal = value => "'" + String(value).replaceAll("'", "''") + "'";
export const json = value => `${literal(JSON.stringify(value))}::jsonb`;

export function verifyTarget() {
  const info = JSON.parse(execFileSync('docker', ['inspect', container], { encoding: 'utf8' }))[0];
  if (info.Name !== `/${container}` || info.Config.Labels?.project !== project
      || info.HostConfig.NetworkMode !== 'none' || info.Mounts.length
      || Object.keys(info.HostConfig.PortBindings || {}).length
      || !info.HostConfig.Tmpfs?.['/var/lib/postgresql/data']) {
    throw new Error('Refusing non-isolated DB target');
  }
  const actual = sql('select current_database(), inet_server_addr() is null;');
  if (actual !== `${database}|t`) throw new Error(`Unexpected database: ${actual}`);
  return { container, database, project, network: 'none', publishedPorts: 0, externalMounts: 0 };
}

export function sql(input) {
  return execFileSync('docker', args, { input, encoding: 'utf8', timeout: 20000, maxBuffer: 8 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}
export const file = path => readFileSync(new URL(path, import.meta.url), 'utf8');
export function session(input) {
  const child = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'] });
  let stdout = '', stderr = '';
  child.stdout.on('data', data => { stdout += data; });
  child.stderr.on('data', data => { stderr += data; });
  const done = new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', code => code ? reject(new Error(stderr)) : resolve(stdout.trim()));
  });
  if (input) child.stdin.end(input);
  return { child, done, output: () => stdout };
}

export const prelude = `
set local role authenticated;
set local request.jwt.claim.sub = '${owner}';
set local statement_timeout = '8s';
create function pg_temp.check(p_ok boolean, p_label text default 'assertion') returns void
language plpgsql as $$ begin
  if p_ok is distinct from true then raise exception 'FAIL: %', p_label; end if;
end; $$;
create function pg_temp.payload(p_changes jsonb default '{}', p_version integer default 2) returns jsonb
language sql stable as $$
  select jsonb_build_object('match', jsonb_build_object('id', id, 'expected_updated_at', updated_at,
    'expected_revision', revision::text, 'notes', 'rpc marker'))
    || case when p_version = 1 then '{}'::jsonb else jsonb_build_object('contract_version', 2, 'ticket_changes', p_changes) end
  from public.matches where id = '${match}';
$$;
create function pg_temp.expect_error(p_sql text, p_state text) returns void
language plpgsql as $$
declare v_before jsonb; v_after jsonb; v_state text;
begin
  v_before := public.get_match_record_snapshot('${match}');
  begin
    execute p_sql;
  exception when others then
    get stacked diagnostics v_state = returned_sqlstate;
    if v_state <> p_state then raise exception 'Expected %, received %: %', p_state, v_state, sqlerrm; end if;
    v_after := public.get_match_record_snapshot('${match}');
    if v_before <> v_after then raise exception 'Failed call changed aggregate'; end if;
    return;
  end;
  raise exception 'Expected SQLSTATE %, call succeeded', p_state;
end; $$;
`;
export function transaction(body) {
  sql(`begin; ${prelude} ${body} rollback;`);
}
export function rpc(changes = {}, version = 2) {
  return `public.save_match_record(pg_temp.payload(${json(changes)}, ${version}))`;
}
export function rejects(expression, state = '22023') {
  return `select pg_temp.expect_error(${literal(`select ${expression}`)}, ${literal(state)});`;
}
