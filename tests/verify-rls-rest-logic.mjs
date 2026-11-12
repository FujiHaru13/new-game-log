export function createMutationSafetyState() {
  return { stopped: false, createdIds: [] };
}

export function recordCreatedId(state, id) {
  if (id) state.createdIds.push(id);
}

export function classifyProtectedMutation({ error, returnedRows = [], before, after, operation }) {
  if (error?.code === '42501' || error?.status === 401 || error?.status === 403) {
    return 'PASS';
  }
  if (error) return 'INCONCLUSIVE';
  if (returnedRows.length > 0) return 'FAIL';
  if (operation === 'UPDATE' && before && after && before.notes === after.notes) return 'PASS';
  if (operation === 'DELETE' && before && after) return 'PASS';
  return 'INCONCLUSIVE';
}

export function stopAfterUnexpectedSuccess(state, status, id) {
  if (status === 'FAIL') {
    state.stopped = true;
    return `安全停止: 予期しない書き込み成功。対象ID: ${id}`;
  }
  return null;
}
