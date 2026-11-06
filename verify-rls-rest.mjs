import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

function readEnvFile(path) {
  try {
    return Object.fromEntries(readFileSync(path, 'utf8').split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        let value = line.slice(separator + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        return [line.slice(0, separator).trim(), value];
      }));
  } catch {
    return {};
  }
}

const env = { ...readEnvFile('.env.local'), ...process.env };
const supabaseUrl = env.VITE_SUPABASE_URL;
const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const mutationsEnabled = env.RLS_ALLOW_MUTATIONS === '1';
const cleanupConfirmed = env.RLS_CONFIRM_CLEANUP === 'I_CONFIRM_CREATED_TEST_DATA_CLEANUP';
const selfApprovalConfirmed = env.RLS_CONFIRM_SELF_APPROVAL === 'I_CONFIRM_DEDICATED_SELF_APPROVAL_TEST';

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
const counts = { PASS: 0, FAIL: 0, INCONCLUSIVE: 0, SKIPPED: 0 };
const operations = new Set(['authentication', 'SELECT']);
let createdMatchId = null;
let destructiveTestsStopped = false;

function report(status, message) {
  counts[status] += 1;
  const output = `${status}: ${message}`;
  if (status === 'FAIL' || status === 'INCONCLUSIVE') console.error(output);
  else console.log(output);
}
function pass(message) { report('PASS', message); }
function fail(message) { report('FAIL', message); }
function inconclusive(message) { report('INCONCLUSIVE', message); }
function skipped(message) { report('SKIPPED', message); }
function errorSummary(error) {
  return `${error?.code || 'unknown'} / HTTP ${error?.status || 'unknown'}`;
}
function isPermissionDenied(error) {
  return Boolean(error && (error.code === '42501' || error.status === 401 || error.status === 403));
}
function targetColumn(table) {
  return table === 'seats' ? 'watch_record_id' : 'id';
}
function targetIdFor(table) {
  return table === 'matches'
    ? env.RLS_EXPECTED_MATCH_ID
    : table === 'watch_records'
      ? env.RLS_EXPECTED_WATCH_RECORD_ID
      : env.RLS_EXPECTED_SEAT_ID;
}

async function signedInClient(email, password, label) {
  if (!email || !password) {
    skipped(`${label}: 認証情報未設定`);
    return null;
  }
  const client = createClient(supabaseUrl, publishableKey, clientOptions);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    inconclusive(`${label}: ログイン失敗 (${errorSummary(error)})`);
    return null;
  }
  pass(`${label}: 認証成功`);
  return { client, user: data.user };
}

async function confirmTargetExists(client, table, id) {
  if (!id) {
    skipped(`${table}: RLS_EXPECTED_${table === 'matches' ? 'MATCH' : table === 'watch_records' ? 'WATCH_RECORD' : 'SEAT'}_ID未設定`);
    return false;
  }
  const column = targetColumn(table);
  const result = await client.from(table).select(column).eq(column, id);
  if (result.error) {
    inconclusive(`${table}: 対象行の事前確認失敗 (${errorSummary(result.error)})`);
    return false;
  }
  if (result.data.length !== 1) {
    skipped(`${table}: 指定IDの対象行が正確に1件存在しない`);
    return false;
  }
  return true;
}

async function selectTarget(client, table, id, label, expectedCount) {
  const column = targetColumn(table);
  const result = await client.from(table).select(column).eq(column, id);
  if (result.error) {
    if (isPermissionDenied(result.error)) {
      if (expectedCount === 0) pass(`${label}: ${table} SELECTは権限/RLSで拒否`);
      else inconclusive(`${label}: ${table} SELECTが権限エラーで、本人の期待結果を確認できない`);
    } else {
      inconclusive(`${label}: ${table} SELECT失敗 (${errorSummary(result.error)})`);
    }
    return;
  }
  if (result.data.length === expectedCount) {
    pass(`${label}: ${table} SELECT結果が${expectedCount}件`);
  } else {
    fail(`${label}: ${table} SELECT結果が${result.data.length}件（期待${expectedCount}件）`);
  }
}

async function insertDenied(client, table, payload, label) {
  operations.add('INSERT');
  const result = await client.from(table).insert(payload).select(targetColumn(table));
  if (result.error && isPermissionDenied(result.error)) {
    pass(`${label}: ${table} INSERTは権限/RLSで拒否`);
  } else if (result.error) {
    inconclusive(`${label}: ${table} INSERTの拒否理由をRLSと断定できない (${errorSummary(result.error)})`);
  } else {
    const insertedId = result.data?.[0]?.[targetColumn(table)] || '不明';
    fail(`${label}: ${table} INSERTが予期せず成功（ID: ${insertedId}）`);
    destructiveTestsStopped = true;
  }
}

async function testSelfApproval(unauthorized) {
  if (destructiveTestsStopped) {
    skipped('authorized_users自己承認INSERT（安全停止中）');
    return;
  }
  if (!mutationsEnabled) {
    skipped('authorized_users自己承認INSERT（RLS_ALLOW_MUTATIONS=1が必要）');
    return;
  }
  if (!selfApprovalConfirmed || !env.RLS_SELF_APPROVAL_TEST_USER_ID) {
    skipped('authorized_users自己承認INSERT（専用ユーザーIDと明示確認が必要）');
    return;
  }
  if (!unauthorized || unauthorized.user.id !== env.RLS_SELF_APPROVAL_TEST_USER_ID) {
    skipped('authorized_users自己承認INSERT（専用未承認ユーザーのセッションが一致しない）');
    return;
  }
  operations.add('INSERT');
  const result = await unauthorized.client.from('authorized_users').insert({ user_id: unauthorized.user.id });
  if (result.error && isPermissionDenied(result.error)) {
    pass('未承認ユーザーのauthorized_users自己承認INSERTは拒否');
  } else if (result.error) {
    inconclusive(`authorized_users自己承認の拒否理由をRLSと断定できない (${errorSummary(result.error)})`);
  } else {
    fail(`authorized_users自己承認INSERTが予期せず成功（user_id: ${unauthorized.user.id}）`);
    destructiveTestsStopped = true;
  }
}

async function createIsolatedMatch(authorized) {
  if (!mutationsEnabled) {
    skipped('隔離テストデータ作成（RLS_ALLOW_MUTATIONS=1が必要）');
    return;
  }
  if (!cleanupConfirmed) {
    skipped('隔離テストデータ作成（クリーンアップ明示確認が必要）');
    return;
  }
  operations.add('INSERT');
  const id = crypto.randomUUID();
  const result = await authorized.client.from('matches').insert({
    id,
    owner_id: authorized.user.id,
    match_date: '2099-01-01',
    date_unknown: false,
    home_team_id: 'dragons',
    away_team_id: 'giants',
    match_type: 'official',
    match_status: 'scheduled',
    score_confirmed: false,
  }).select('id').single();
  if (result.error || !result.data || result.data.id !== id) {
    inconclusive(`隔離テスト用matches INSERT失敗 (${errorSummary(result.error)})`);
    return;
  }
  createdMatchId = id;
  pass('承認済み本人が今回の実行専用matchesを作成');
}

async function testIsolatedMutations(authorized, unauthorized) {
  if (!createdMatchId || destructiveTestsStopped) {
    skipped('隔離matchのUPDATE/DELETE（隔離レコード未作成または安全停止）');
    return;
  }
  if (authorized) {
    const before = await authorized.client.from('matches').select('id, notes').eq('id', createdMatchId).single();
    if (before.error || !before.data) {
      inconclusive(`隔離matches UPDATE前の状態確認失敗（ID: ${createdMatchId}）`);
      return;
    }
    operations.add('UPDATE');
    const update = await authorized.client.from('matches')
      .update({ notes: 'RLS isolated test' }).eq('id', createdMatchId).select('id');
    if (update.error || update.data?.length !== 1) {
      inconclusive(`承認済み本人の隔離matches UPDATE確認失敗 (${errorSummary(update.error)})`);
      return;
    }
    const updated = await authorized.client.from('matches').select('id, notes').eq('id', createdMatchId).single();
    if (updated.error || updated.data?.notes !== 'RLS isolated test') {
      inconclusive(`承認済み本人の隔離matches UPDATE後の状態確認失敗（ID: ${createdMatchId}）`);
      return;
    }
    pass('承認済み本人が隔離matchesをUPDATEし、値の変更を確認');
  }
  if (unauthorized && !destructiveTestsStopped) {
    const before = await authorized.client.from('matches').select('id, notes').eq('id', createdMatchId).single();
    if (before.error || !before.data) {
      inconclusive(`未承認UPDATE前の隔離matches状態確認失敗（ID: ${createdMatchId}）`);
      return;
    }
    operations.add('UPDATE');
    const update = await unauthorized.client.from('matches')
      .update({ notes: 'must be rejected' }).eq('id', createdMatchId).select('id');
    if (update.error && isPermissionDenied(update.error)) {
      pass('未承認ユーザーの隔離matches UPDATEは拒否');
    } else if (update.error) {
      inconclusive(`未承認ユーザーの隔離matches UPDATEの拒否理由をRLSと断定できない (${errorSummary(update.error)})`);
    } else {
      if (update.data?.length > 0) {
        fail(`未承認ユーザーの隔離matches UPDATEが予期せず成功（ID: ${createdMatchId}）`);
        destructiveTestsStopped = true;
      } else {
        const after = await authorized.client.from('matches').select('id, notes').eq('id', createdMatchId).single();
        if (after.error || !after.data) {
          inconclusive(`未承認UPDATE後の隔離matches状態確認失敗（ID: ${createdMatchId}）`);
        } else if (after.data.notes === before.data.notes) {
          pass('未承認ユーザーの隔離matches UPDATEは0件で、値が不変');
        } else {
          fail(`未承認ユーザーの隔離matches UPDATE後に値が変更された（ID: ${createdMatchId}）`);
          destructiveTestsStopped = true;
        }
      }
    }
  }
  if (unauthorized && !destructiveTestsStopped) {
    const before = await authorized.client.from('matches').select('id').eq('id', createdMatchId).single();
    if (before.error || !before.data) {
      inconclusive(`未承認DELETE前の隔離matches存在確認失敗（ID: ${createdMatchId}）`);
      return;
    }
    operations.add('DELETE');
    const remove = await unauthorized.client.from('matches')
      .delete().eq('id', createdMatchId).select('id');
    if (remove.error && isPermissionDenied(remove.error)) {
      pass('未承認ユーザーの隔離matches DELETEは拒否');
    } else if (remove.error) {
      inconclusive(`未承認ユーザーの隔離matches DELETEの拒否理由をRLSと断定できない (${errorSummary(remove.error)})`);
    } else if (remove.data?.length > 0) {
      fail(`未承認ユーザーの隔離matches DELETEが予期せず成功（ID: ${createdMatchId}）`);
      destructiveTestsStopped = true;
    } else {
      const after = await authorized.client.from('matches').select('id').eq('id', createdMatchId).single();
      if (after.error || !after.data) {
        inconclusive(`未承認DELETE後の隔離matches存在確認失敗（ID: ${createdMatchId}）`);
      } else {
        pass('未承認ユーザーの隔離matches DELETEは0件で、対象行が存在');
      }
    }
  }
}

async function cleanupIsolatedMatch(authorized) {
  if (!createdMatchId) return;
  if (destructiveTestsStopped) {
    inconclusive(`安全停止のため隔離matchesを自動削除していません（ID: ${createdMatchId}）`);
    return;
  }
  operations.add('DELETE');
  const remove = await authorized.client.from('matches').delete().eq('id', createdMatchId).select('id');
  if (remove.error || remove.data.length !== 1) {
    inconclusive(`隔離matchesの限定DELETE失敗。対象ID: ${createdMatchId} (${errorSummary(remove.error)})`);
    return;
  }
  const verify = await authorized.client.from('matches').select('id').eq('id', createdMatchId);
  if (verify.error) {
    inconclusive(`隔離matches削除後の不存在確認失敗。対象ID: ${createdMatchId} (${errorSummary(verify.error)})`);
  } else if (verify.data.length === 0) {
    pass(`隔離matchesを削除し、削除後の不存在を確認（ID: ${createdMatchId}）`);
  } else {
    fail(`隔離matches削除後も行が存在（ID: ${createdMatchId}）`);
  }
}

async function main() {
  const authorized = await signedInClient(env.RLS_AUTHORIZED_EMAIL, env.RLS_AUTHORIZED_PASSWORD, '承認済み本人');
  const unauthorized = await signedInClient(env.RLS_TEST_EMAIL, env.RLS_TEST_PASSWORD, '未承認ユーザー');
  const targetTables = ['matches', 'watch_records', 'seats'];
  const confirmedTargets = {};

  if (authorized) {
    for (const table of targetTables) {
      const id = targetIdFor(table);
      confirmedTargets[table] = await confirmTargetExists(authorized.client, table, id);
      if (confirmedTargets[table]) {
        await selectTarget(authorized.client, table, id, '承認済み本人', 1);
      }
    }
  } else {
    for (const table of targetTables) skipped(`${table}: 承認済み本人セッションがなく対象行を事前確認できない`);
  }

  console.log('\n--- 匿名ユーザー SELECT検証 ---');
  for (const table of targetTables) {
    if (confirmedTargets[table]) {
      await selectTarget(anonymous, table, targetIdFor(table), '匿名', 0);
    } else {
      skipped(`匿名: ${table} SELECT（保護対象行の存在未確認）`);
    }
  }

  console.log('\n--- 未承認ユーザー検証 ---');
  if (unauthorized && !destructiveTestsStopped) {
    for (const table of targetTables) {
      if (confirmedTargets[table]) await selectTarget(unauthorized.client, table, targetIdFor(table), '未承認', 0);
      else skipped(`未承認: ${table} SELECT（保護対象行の存在未確認）`);
    }
  } else {
    for (const table of targetTables) skipped(`未承認: ${table} SELECT（未承認ユーザー未認証）`);
  }

  console.log('\n--- 書き込み検証 ---');
  if (!mutationsEnabled) {
    for (const operation of ['INSERT', 'UPDATE', 'DELETE']) skipped(`${operation}（読み取り専用モード）`);
    skipped('authorized_users自己承認INSERT（読み取り専用モード）');
    skipped('隔離テストデータ作成・削除（読み取り専用モード）');
  } else {
    if (authorized) await createIsolatedMatch(authorized);
    else skipped('隔離テストデータ作成（承認済み本人未認証）');
    await testIsolatedMutations(authorized, unauthorized);
    await testSelfApproval(unauthorized);
    if (authorized) await cleanupIsolatedMatch(authorized);
    else skipped('隔離テストデータ削除（承認済み本人未認証）');

    if (unauthorized) {
      await insertDenied(unauthorized.client, 'matches', {
        owner_id: unauthorized.user.id,
        match_date: '2099-01-01',
        date_unknown: false,
        home_team_id: 'dragons',
        away_team_id: 'giants',
        match_type: 'official',
        match_status: 'scheduled',
      }, '未承認');
    } else {
      skipped('未承認matches INSERT（未承認ユーザー未認証）');
    }
    if (unauthorized && createdMatchId && !destructiveTestsStopped) {
      await insertDenied(unauthorized.client, 'watch_records', {
        owner_id: unauthorized.user.id,
        match_id: createdMatchId,
        watch_status: 'scheduled',
        cheer_team_id: 'dragons',
      }, '未承認');
    } else {
      skipped('未承認watch_records INSERT（今回作成した隔離match未確認）');
    }
    skipped('未承認seats INSERT（今回の実行で隔離watch_recordを作成していないため未実施）');
    if (!destructiveTestsStopped) await insertDenied(anonymous, 'matches', {
      owner_id: crypto.randomUUID(),
      match_date: '2099-01-01',
      date_unknown: false,
      home_team_id: 'dragons',
      away_team_id: 'giants',
      match_type: 'official',
      match_status: 'scheduled',
    }, '匿名');
    if (createdMatchId && !destructiveTestsStopped) {
      await insertDenied(anonymous, 'watch_records', {
        owner_id: crypto.randomUUID(),
        match_id: createdMatchId,
        watch_status: 'scheduled',
        cheer_team_id: 'dragons',
      }, '匿名');
    } else {
      skipped('匿名watch_records INSERT（今回作成した隔離match未確認）');
    }
    skipped('匿名seats INSERT（今回の実行で隔離watch_recordを作成していないため未実施）');
  }

  if (authorized) await authorized.client.auth.signOut();
  if (unauthorized) await unauthorized.client.auth.signOut();
}

try {
  await main();
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

console.log(`\n--- 最終判定 ---`);
console.log(`PASS=${counts.PASS} FAIL=${counts.FAIL} INCONCLUSIVE=${counts.INCONCLUSIVE} SKIPPED=${counts.SKIPPED}`);
console.log(`実行した操作種別: ${[...operations].join(', ')}`);
if (destructiveTestsStopped) {
  console.error('安全停止: 予期しない書き込み成功のため、後続の書き込みと自動クリーンアップを停止しました。手動確認が必要です。');
}
if (counts.FAIL > 0 || counts.INCONCLUSIVE > 0) process.exitCode = 1;
