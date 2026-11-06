import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const MUTATION_CONFIRMATION = 'I_CONFIRM_PHASE2A_ISOLATED_DATA_ONLY';
export const PROJECT_REF = 'kxnmdmpbzajrldwgroox';

function readEnvFile(path) {
  try {
    return Object.fromEntries(readFileSync(path, 'utf8').split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        let value = line.slice(index + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        return [line.slice(0, index).trim(), value];
      }));
  } catch {
    return {};
  }
}

export function mutationMode(env) {
  return env.PHASE2A_ALLOW_MUTATIONS === '1'
    && env.PHASE2A_CONFIRMATION === MUTATION_CONFIRMATION;
}

export function createTestIds() {
  return {
    match: randomUUID(),
    watch: randomUUID(),
    ticket: randomUUID(),
  };
}

export function targetColumn(table) {
  return table === 'seats' ? 'watch_record_id' : 'id';
}

function errorText(error) {
  return `${error?.code || 'unknown'} / HTTP ${error?.status || 'unknown'}`;
}

function permissionError(error) {
  return Boolean(error && (error.code === '42501' || error.status === 401 || error.status === 403));
}

function makeClient(url, key) {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function createReporter() {
  const counts = { PASS: 0, FAIL: 0, INCONCLUSIVE: 0, SKIPPED: 0 };
  const operations = new Set(['authentication', 'SELECT']);
  const report = (status, message) => {
    counts[status] += 1;
    const line = `${status}: ${message}`;
    if (status === 'FAIL' || status === 'INCONCLUSIVE') console.error(line);
    else console.log(line);
  };
  return {
    counts,
    operations,
    pass: (message) => report('PASS', message),
    fail: (message) => report('FAIL', message),
    inconclusive: (message) => report('INCONCLUSIVE', message),
    skipped: (message) => report('SKIPPED', message),
  };
}

async function signIn(url, key, email, password, label, reporter) {
  if (!email || !password) {
    reporter.skipped(`${label}ログイン（認証情報未設定）`);
    return null;
  }
  const client = makeClient(url, key);
  const result = await client.auth.signInWithPassword({ email, password });
  if (result.error || !result.data.user) {
    reporter.inconclusive(`${label}ログイン失敗 (${errorText(result.error)})`);
    return null;
  }
  reporter.pass(`${label}ログイン成功`);
  return { client, user: result.data.user };
}

async function assertUnused(authorized, ids, reporter) {
  let safe = true;
  for (const [table, id] of [['matches', ids.match], ['watch_records', ids.watch], ['tickets', ids.ticket]]) {
    const result = await authorized.client.from(table).select('id').eq('id', id);
    if (result.error) {
      reporter.inconclusive(`${table}テストID未使用確認失敗 (${errorText(result.error)})`);
      safe = false;
    } else if (result.data.length === 0) {
      reporter.pass(`${table}テストID未使用`);
    } else {
      reporter.fail(`${table}テストIDが既に使用されています`);
      safe = false;
    }
  }
  return safe;
}

function payload(ids) {
  return {
    match: {
      id: ids.match, match_date: '2099-01-01', date_unknown: false, start_time: '18:00',
      home_team_id: 'dragons', away_team_id: 'giants', stadium_id: 'vantelin_dome',
      match_type: 'official', match_status: 'finished', home_score: 3, away_score: 2,
      score_confirmed: true, notes: 'Phase 2A isolated REST test',
    },
    watch: { watch_status: 'watched', cheer_team_id: 'dragons', watch_memo: 'isolated test' },
    categories: [{ id: 'dragons_1st', is_primary: true }],
    seat: { seat_type_id: 'diamond_seat', area: 'A', seat_row: '10', seat_number: '12' },
    ticket: {
      status: 'ticketed', quantity: 1, seat_type_name: '内野',
      seat_area: 'A', seat_row: '10', seat_number: '12', vendor: 'isolated',
    },
    innings: { home: [1, 0, 'X'], away: [0, 2, null], homeHits: 5, awayHits: 4 },
    pitchers: { homeStarter: 'REST Home', awayStarter: 'REST Away' },
    home_runs: ['REST Batter'],
    events: 'REST event',
    links: [{ title: 'REST link', url: 'https://example.invalid/phase2a' }],
    splits: [{ title: 'REST split', amount: 100 }],
    replace: {
      categories: true, seat: true, ticket: true, innings: true, pitchers: true,
      events: true, links: true, splits: true,
    },
  };
}

async function rpc(client, body, reporter, label) {
  reporter.operations.add('RPC');
  const result = await client.rpc('save_match_record', { p_payload: body });
  if (result.error) {
    reporter.inconclusive(`${label} (${errorText(result.error)})`);
    return null;
  }
  reporter.pass(label);
  return result.data;
}

async function verifyReadback(client, ids, reporter) {
  const checks = [
    ['matches', 'id', ids.match],
    ['watch_records', 'match_id', ids.match],
    ['match_inning_scores', 'match_id', ids.match],
    ['match_pitchers', 'match_id', ids.match],
    ['match_events', 'match_id', ids.match],
    ['match_links', 'match_id', ids.match],
    ['tickets', 'match_id', ids.match],
  ];
  for (const [table, column, value] of checks) {
    const result = await client.from(table).select('*').eq(column, value);
    if (result.error) {
      reporter.inconclusive(`${table}読み戻し失敗 (${errorText(result.error)})`);
    } else if (result.data.length > 0) {
      reporter.pass(`${table}読み戻し`);
    } else {
      reporter.fail(`${table}読み戻しが空`);
    }
  }
  const ticket = await client.from('tickets').select('id').eq('match_id', ids.match).maybeSingle();
  const ticketId = ticket.data?.id;
  const watch = await client.from('watch_records').select('id').eq('match_id', ids.match).maybeSingle();
  if (!watch.error && watch.data) {
    const seat = await client.from('seats').select('watch_record_id').eq('watch_record_id', watch.data.id);
    const splits = await client.from('payment_splits').select('id').eq('watch_record_id', watch.data.id);
    if (!seat.error && seat.data.length === 1) reporter.pass('seats読み戻し（watch_record_id検索）');
    else reporter.fail('seats読み戻し失敗');
    if (!splits.error && splits.data.length === 1) reporter.pass('payment_splits読み戻し');
    else reporter.fail('payment_splits読み戻し失敗');
  }
  return ticketId;
}

async function cleanup(authorized, ids, reporter) {
  reporter.operations.add('DELETE');
  const remove = await authorized.client.from('matches').delete().eq('id', ids.match).select('id');
  if (remove.error || remove.data?.length !== 1) {
    reporter.fail(`テストmatch削除失敗。ID=${ids.match} (${errorText(remove.error)})`);
    return;
  }
  const checks = [
    ['matches', 'id', ids.match],
    ['watch_records', 'match_id', ids.match],
    ['tickets', 'match_id', ids.match],
  ];
  for (const [table, column, value] of checks) {
    const result = await authorized.client.from(table).select('id').eq(column, value);
    if (result.error || result.data.length !== 0) {
      reporter.fail(`削除後も${table}が残存。match=${ids.match}`);
    } else {
      reporter.pass(`削除後${table}不存在確認`);
    }
  }
}

async function verifyOtherOwner(other, authorized, ids, reporter) {
  if (!other) {
    reporter.skipped('他人所有ユーザーRPC検証（RLS_OTHER_EMAIL/PASSWORD未設定）');
    return;
  }
  const current = await authorized.client.from('matches').select('updated_at, notes').eq('id', ids.match).single();
  if (current.error || !current.data) {
    reporter.inconclusive(`他人所有RPC前の状態確認失敗 (${errorText(current.error)})`);
    return;
  }
  reporter.operations.add('RPC');
  const result = await other.client.rpc('save_match_record', {
    p_payload: {
      match: { id: ids.match, expected_updated_at: current.data.updated_at, notes: 'must reject other owner' },
    },
  });
  if (!result.error) {
    reporter.fail('他人所有ユーザーのRPCが予期せず成功');
    return;
  }
  const after = await authorized.client.from('matches').select('notes').eq('id', ids.match).single();
  if (after.error) {
    reporter.inconclusive(`他人所有RPC後の状態確認失敗 (${errorText(after.error)})`);
  } else if (after.data.notes === current.data.notes) {
    reporter.pass(`他人所有ユーザーのRPC拒否（HTTP ${result.error.status || 'unknown'}）`);
  } else {
    reporter.fail('他人所有ユーザーのRPC後に対象行が変更された');
  }
}

export async function run(options = {}) {
  const env = { ...readEnvFile('.env.local'), ...process.env, ...options.env };
  const reporter = createReporter();
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('VITE_SUPABASE_URLとPublishable Keyが必要です');
  if (new URL(url).hostname.split('.')[0] !== PROJECT_REF) {
    throw new Error(`対象Project IDが不一致です（期待値: ${PROJECT_REF}）`);
  }
  if (key.includes('service_role') || key.startsWith('sb_secret_')) {
    throw new Error('service_role/secret keyは禁止です');
  }
  const anonymous = makeClient(url, key);
  const authorized = await signIn(url, key, env.RLS_AUTHORIZED_EMAIL, env.RLS_AUTHORIZED_PASSWORD, '承認済みユーザー', reporter);
  const unauthorized = await signIn(url, key, env.RLS_TEST_EMAIL, env.RLS_TEST_PASSWORD, '未承認ユーザー', reporter);
  const otherOwner = await signIn(url, key, env.RLS_OTHER_EMAIL, env.RLS_OTHER_PASSWORD, '他人所有ユーザー', reporter);
  if (!authorized) {
    reporter.skipped('Phase 2Aクラウド検証（承認済みセッションなし）');
  } else {
    const ids = createTestIds();
    const idsAreSafe = await assertUnused(authorized, ids, reporter);
    if (!mutationMode(env)) {
      reporter.skipped('RPC保存・更新・削除（読み取り専用。PHASE2A_ALLOW_MUTATIONS=1と確認文字列が必要）');
    } else if (!idsAreSafe) {
      reporter.skipped('RPC保存・更新・削除（テストIDの安全確認未達）');
    } else {
      let created = false;
      try {
        const result = await rpc(authorized.client, payload(ids), reporter, 'RPC新規保存');
        created = result?.ok === true && result.match_id === ids.match;
        if (!created) reporter.fail('RPC応答の保存ID検証失敗');
        if (created) {
          const createdTicketId = await verifyReadback(authorized.client, ids, reporter);
          if (!createdTicketId) {
            reporter.fail('作成チケットIDを読み戻せないため、チケット更新・削除を停止');
          }
          const current = await authorized.client.from('matches').select('updated_at').eq('id', ids.match).single();
          if (current.error || !createdTicketId) {
            if (current.error) reporter.inconclusive(`競合用updated_at取得失敗 (${errorText(current.error)})`);
          }
          else {
            const partial = { match: { id: ids.match, expected_updated_at: current.data.updated_at, notes: 'partial' }, replace: { ticket: false } };
            const partialResult = await authorized.client.rpc('save_match_record', { p_payload: partial });
            reporter.operations.add('RPC');
            if (partialResult.error) reporter.inconclusive(`部分更新失敗 (${errorText(partialResult.error)})`);
            else reporter.pass('部分更新成功');
            const preserved = await authorized.client.from('tickets').select('id').eq('match_id', ids.match);
            if (!preserved.error && preserved.data.length === 1) reporter.pass('未指定チケット保持');
            else reporter.fail('未指定チケットが保持されていない');
            const ticketUpdate = { match: { id: ids.match, expected_updated_at: (await authorized.client.from('matches').select('updated_at').eq('id', ids.match).single()).data.updated_at }, ticket: { id: createdTicketId, seat_area: 'B' }, replace: { ticket: true } };
            const ticketResult = await authorized.client.rpc('save_match_record', { p_payload: ticketUpdate });
            reporter.operations.add('RPC');
            if (ticketResult.error) reporter.inconclusive(`チケット部分更新失敗 (${errorText(ticketResult.error)})`);
            else reporter.pass('チケット部分更新成功');
            const afterTicket = await authorized.client.from('matches').select('updated_at').eq('id', ids.match).single();
            const conflict = await authorized.client.rpc('save_match_record', { p_payload: { match: { id: ids.match, expected_updated_at: '2000-01-01T00:00:00Z', notes: 'must reject' } } });
            reporter.operations.add('RPC');
            if (conflict.error?.code === 'PGRST' || conflict.error?.code === '40001') reporter.pass('競合検出で更新拒否');
            else if (conflict.error) reporter.inconclusive(`競合拒否のエラー確認不能 (${errorText(conflict.error)})`);
            else reporter.fail('古いupdated_atで更新が成功');
            const invalid = await authorized.client.rpc('save_match_record', { p_payload: { match: { id: ids.match, expected_updated_at: afterTicket.data.updated_at, notes: 'must rollback' }, categories: [{ id: 'does-not-exist' }], replace: { categories: true } } });
            reporter.operations.add('RPC');
            if (invalid.error) {
              const verify = await authorized.client.from('matches').select('notes').eq('id', ids.match).single();
              if (!verify.error && verify.data.notes !== 'must rollback') reporter.pass('子データ失敗時に親更新をロールバック');
              else reporter.fail('ロールバック後に親が変更された');
            } else reporter.fail('不正子データでRPCが成功');
            const deletion = await authorized.client.rpc('save_match_record', { p_payload: { match: { id: ids.match, expected_updated_at: (await authorized.client.from('matches').select('updated_at').eq('id', ids.match).single()).data.updated_at }, ticket_operation: 'delete', ticket: { id: createdTicketId }, replace: { ticket: true } } });
            reporter.operations.add('RPC');
            if (deletion.error) reporter.inconclusive(`チケット明示削除失敗 (${errorText(deletion.error)})`);
            else reporter.pass('チケット明示削除成功');
          }
          await verifyOtherOwner(otherOwner, authorized, ids, reporter);
        }
      } finally {
        if (created) await cleanup(authorized, ids, reporter);
        else reporter.skipped('テストmatch削除（RPC保存未成功）');
      }
    }
  }
  if (unauthorized && authorized) {
    const probe = await unauthorized.client.rpc('save_match_record', { p_payload: { match: { id: randomUUID() } } });
    reporter.operations.add('RPC');
    if (permissionError(probe.error)) reporter.pass('未承認ユーザーのRPC呼び出し拒否');
    else if (probe.error) reporter.inconclusive(`未承認RPC拒否理由不明 (${errorText(probe.error)})`);
    else reporter.fail('未承認ユーザーのRPCが成功');
  } else reporter.skipped('未承認ユーザーRPC検証');
  await authorized?.client.auth.signOut();
  await unauthorized?.client.auth.signOut();
  await otherOwner?.client.auth.signOut();
  console.log(`PASS=${reporter.counts.PASS} FAIL=${reporter.counts.FAIL} INCONCLUSIVE=${reporter.counts.INCONCLUSIVE} SKIPPED=${reporter.counts.SKIPPED}`);
  console.log(`実行操作: ${[...reporter.operations].join(', ')}`);
  return reporter.counts;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const counts = await run();
    if (counts.FAIL || counts.INCONCLUSIVE) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
