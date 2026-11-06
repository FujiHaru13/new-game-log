import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

function readEnvFile(path) {
  const result = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

const env = { ...readEnvFile('.env.local'), ...process.env };
const supabaseUrl = env.VITE_SUPABASE_URL;
const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const mutationsEnabled = env.RLS_ALLOW_MUTATIONS === '1';
const cleanupConfirmed = env.RLS_CONFIRM_CLEANUP === 'I_CONFIRM_CREATED_TEST_DATA_CLEANUP';

if (!supabaseUrl || !publishableKey) {
  throw new Error('VITE_SUPABASE_URLとVITE_SUPABASE_PUBLISHABLE_KEYを設定してください');
}
if (publishableKey.includes('service_role') || publishableKey.startsWith('sb_secret_')) {
  throw new Error('service_role keyやsecret keyは使用できません');
}

const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};
const anonymous = createClient(supabaseUrl, publishableKey, clientOptions);
let failures = 0;
let inconclusive = 0;
let createdMatchId = null;

function pass(message) { console.log(`PASS: ${message}`); }
function fail(message) { failures += 1; console.error(`FAIL: ${message}`); }
function inconclusiveResult(message) { inconclusive += 1; console.error(`INCONCLUSIVE: ${message}`); }
function skipped(message) { console.log(`SKIPPED: ${message}`); }
function errorSummary(error) {
  return `${error?.code || 'unknown'} / HTTP ${error?.status || 'unknown'}`;
}
function isPermissionDenied(error) {
  return Boolean(error && (error.code === '42501' || error.status === 401 || error.status === 403));
}
function isEmptySelect(data) {
  return Array.isArray(data) && data.length === 0;
}

async function signedInClient(email, password, label) {
  if (!email || !password) {
    inconclusiveResult(`${label}の認証情報が未設定`);
    return null;
  }
  const client = createClient(supabaseUrl, publishableKey, clientOptions);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    inconclusiveResult(`${label}のログイン失敗 (${errorSummary(error)})`);
    return null;
  }
  return { client, user: data.user };
}

async function testSelectDenied(client, table, targetId, label) {
  const query = client.from(table).select('id');
  const result = targetId ? await query.eq('id', targetId) : await query.limit(1);
  if (result.error) {
    if (isPermissionDenied(result.error)) pass(`${label}: ${table} SELECTは権限/RLSで拒否`);
    else inconclusiveResult(`${label}: ${table} SELECTの原因をRLSと断定できない (${errorSummary(result.error)})`);
    return;
  }
  if (targetId && isEmptySelect(result.data)) pass(`${label}: ${table} SELECTで対象行を取得できない`);
  else if (!targetId && isEmptySelect(result.data)) inconclusiveResult(`${label}: ${table}が空で、拒否と空データを区別できない`);
  else fail(`${label}: ${table} SELECTでデータを取得できた`);
}

async function testMutationDenied(client, table, action, targetId, label) {
  if (!targetId) {
    inconclusiveResult(`${label}: ${table} ${action}の対象IDが未設定`);
    return;
  }
  const query = client.from(table);
  const result = action === 'INSERT'
    ? await query.insert({ owner_id: crypto.randomUUID(), match_date: '2099-01-01', date_unknown: false, home_team_id: 'dragons', away_team_id: 'giants', match_type: 'official', match_status: 'scheduled' })
    : action === 'UPDATE'
      ? await query.update({ notes: 'RLS test must not update this row' }).eq('id', targetId).select('id')
      : await query.delete().eq('id', targetId).select('id');
  if (result.error) {
    if (isPermissionDenied(result.error)) pass(`${label}: ${table} ${action}は権限/RLSで拒否`);
    else inconclusiveResult(`${label}: ${table} ${action}の原因をRLSと断定できない (${errorSummary(result.error)})`);
    return;
  }
  if (action !== 'INSERT' && isEmptySelect(result.data)) pass(`${label}: ${table} ${action}の対象行は変更されなかった`);
  else fail(`${label}: ${table} ${action}が成功または変更行を返した`);
}

async function testInsertDenied(client, table, payload, label) {
  const result = await client.from(table).insert(payload);
  if (result.error) {
    if (isPermissionDenied(result.error)) pass(`${label}: ${table} INSERTは権限/RLSで拒否`);
    else inconclusiveResult(`${label}: ${table} INSERTの原因をRLSと断定できない (${errorSummary(result.error)})`);
  } else {
    fail(`${label}: ${table} INSERTが成功`);
  }
}

async function testAuthorizedSelfRegistration(client, user, label) {
  const result = await client.from('authorized_users').insert({ user_id: user.id });
  if (result.error && isPermissionDenied(result.error)) {
    pass(`${label}: authorized_usersへの自己承認INSERTは拒否`);
  } else if (result.error) {
    inconclusiveResult(`${label}: authorized_users自己承認の原因をRLSと断定できない (${errorSummary(result.error)})`);
  } else {
    fail(`${label}: authorized_usersへの自己承認INSERTが成功`);
  }
}

async function createIsolatedMatch(authenticated) {
  if (!mutationsEnabled) {
    skipped('本人CRUDと隔離テストデータ作成（RLS_ALLOW_MUTATIONS=1が必要）');
    return;
  }
  if (!cleanupConfirmed) {
    inconclusiveResult('書き込みモードにはRLS_CONFIRM_CLEANUP=I_CONFIRM_CREATED_TEST_DATA_CLEANUPが必要');
    return;
  }
  const id = crypto.randomUUID();
  const result = await authenticated.client.from('matches').insert({
    id,
    owner_id: authenticated.user.id,
    match_date: '2099-01-01',
    date_unknown: false,
    home_team_id: 'dragons',
    away_team_id: 'giants',
    match_type: 'official',
    match_status: 'scheduled',
    score_confirmed: false,
  }).select('id').single();
  if (result.error || !result.data) {
    inconclusiveResult(`隔離テスト用matches INSERT失敗 (${errorSummary(result.error)})`);
    return;
  }
  createdMatchId = result.data.id;
  pass('承認済み本人が隔離テスト用matchesをINSERT');
  const update = await authenticated.client.from('matches').update({ notes: 'RLS isolated test' }).eq('id', createdMatchId);
  if (update.error) inconclusiveResult(`承認済み本人のmatches UPDATE失敗 (${errorSummary(update.error)})`);
  else pass('承認済み本人が自分のmatchesをUPDATE');
}

async function cleanupIsolatedMatch(authenticated) {
  if (!createdMatchId) return;
  const result = await authenticated.client.from('matches').delete().eq('id', createdMatchId);
  if (result.error) {
    inconclusiveResult(`作成した隔離テスト行の限定DELETEに失敗 (${errorSummary(result.error)})。ID: ${createdMatchId}`);
  } else {
    pass('作成した隔離テスト行だけをクリーンアップ');
  }
}

async function main() {
  const expectedMatchId = env.RLS_EXPECTED_MATCH_ID;
  const authorized = await signedInClient(env.RLS_AUTHORIZED_EMAIL, env.RLS_AUTHORIZED_PASSWORD, '承認済み本人');
  const unauthorized = await signedInClient(env.RLS_TEST_EMAIL, env.RLS_TEST_PASSWORD, '未承認ユーザー');
  if (!authorized && !unauthorized) {
    inconclusiveResult('本人・未承認ユーザーの認証セッションがありません');
  }

  if (expectedMatchId) {
    console.log('\n--- 匿名ユーザー検証 ---');
    console.log('INFO: REST結果はテーブルGRANTとRLSの実効結果です。GRANT/RLSの個別判定はverify_rls.sqlで行います。');
    for (const table of ['matches', 'watch_records', 'seats']) {
      await testSelectDenied(anonymous, table, expectedMatchId, '匿名');
    }
    await testInsertDenied(anonymous, 'matches', {
      owner_id: crypto.randomUUID(),
      match_date: '2099-01-01',
      date_unknown: false,
      home_team_id: 'dragons',
      away_team_id: 'giants',
      match_type: 'official',
      match_status: 'scheduled',
    }, '匿名');
    await testInsertDenied(anonymous, 'watch_records', {
      owner_id: crypto.randomUUID(),
      match_id: expectedMatchId,
      watch_status: 'scheduled',
      cheer_team_id: 'dragons',
    }, '匿名');
    if (env.RLS_EXPECTED_WATCH_RECORD_ID) {
      await testInsertDenied(anonymous, 'seats', {
        owner_id: crypto.randomUUID(),
        watch_record_id: env.RLS_EXPECTED_WATCH_RECORD_ID,
      }, '匿名');
    } else {
      inconclusiveResult('RLS_EXPECTED_WATCH_RECORD_ID未設定。匿名seats INSERTを実行しない');
    }
    await testMutationDenied(anonymous, 'matches', 'UPDATE', expectedMatchId, '匿名');
    await testMutationDenied(anonymous, 'matches', 'DELETE', expectedMatchId, '匿名');
  } else {
    inconclusiveResult('RLS_EXPECTED_MATCH_ID未設定。空テーブルと拒否を区別できないため匿名SELECTをPASSにしない');
  }

  if (unauthorized) {
    console.log('\n--- 未承認ユーザー検証 ---');
    const authorization = await unauthorized.client.from('authorized_users').select('user_id').eq('user_id', unauthorized.user.id).maybeSingle();
    if (authorization.error) inconclusiveResult(`未承認状態の確認失敗 (${errorSummary(authorization.error)})`);
    else if (authorization.data) fail('テストユーザーがauthorized_usersに登録されている');
    else pass('未承認ユーザーはauthorized_usersに登録されていない');
    for (const table of ['matches', 'watch_records', 'seats']) {
      await testSelectDenied(unauthorized.client, table, expectedMatchId, '未承認');
    }
    if (expectedMatchId) {
      await testInsertDenied(unauthorized.client, 'matches', {
        owner_id: unauthorized.user.id,
        match_date: '2099-01-01',
        date_unknown: false,
        home_team_id: 'dragons',
        away_team_id: 'giants',
        match_type: 'official',
        match_status: 'scheduled',
      }, '未承認');
      await testInsertDenied(unauthorized.client, 'watch_records', {
        owner_id: unauthorized.user.id,
        match_id: expectedMatchId,
        watch_status: 'scheduled',
        cheer_team_id: 'dragons',
      }, '未承認');
      if (env.RLS_EXPECTED_WATCH_RECORD_ID) {
        await testInsertDenied(unauthorized.client, 'seats', {
          owner_id: unauthorized.user.id,
          watch_record_id: env.RLS_EXPECTED_WATCH_RECORD_ID,
        }, '未承認');
      } else {
        inconclusiveResult('RLS_EXPECTED_WATCH_RECORD_ID未設定。未承認seats INSERTを実行しない');
      }
    } else {
      inconclusiveResult('RLS_EXPECTED_MATCH_ID未設定。未承認INSERTを実行しない');
    }
    await testMutationDenied(unauthorized.client, 'matches', 'UPDATE', expectedMatchId, '未承認');
    await testMutationDenied(unauthorized.client, 'matches', 'DELETE', expectedMatchId, '未承認');
    await testAuthorizedSelfRegistration(unauthorized.client, unauthorized.user, '未承認');
  }

  if (authorized) {
    console.log('\n--- 承認済み本人検証 ---');
    if (expectedMatchId) {
      const own = await authorized.client.from('matches').select('id').eq('id', expectedMatchId);
      if (own.error) inconclusiveResult(`本人のmatches SELECT失敗 (${errorSummary(own.error)})`);
      else pass('承認済み本人のmatches SELECTを実行');
    } else {
      inconclusiveResult('RLS_EXPECTED_MATCH_ID未設定。本人SELECTの対象が未確定');
    }
    await createIsolatedMatch(authorized);
    if (createdMatchId && unauthorized) {
      await testSelectDenied(unauthorized.client, 'matches', createdMatchId, '未承認（本人作成行）');
      await testMutationDenied(unauthorized.client, 'matches', 'UPDATE', createdMatchId, '未承認（本人作成行）');
      await testMutationDenied(unauthorized.client, 'matches', 'DELETE', createdMatchId, '未承認（本人作成行）');
    }
    await cleanupIsolatedMatch(authorized);
    await authorized.client.auth.signOut();
  }
  if (unauthorized) await unauthorized.client.auth.signOut();
}

try {
  await main();
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

console.log(`\n--- 最終判定 ---\nPASS/FAIL/INCONCLUSIVE counters: FAIL=${failures}, INCONCLUSIVE=${inconclusive}`);
if (failures > 0 || inconclusive > 0) process.exitCode = 1;
