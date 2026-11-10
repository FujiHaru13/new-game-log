import test from 'node:test';
import assert from 'node:assert/strict';
import { addTicketRow, beginTicketEditor, editTicketRow, removeTicketRow, ticketEditorChanges, ticketEditorHasChanges, undoTicketDeletion } from './src/lib/atomic/ticketEditorDraft';

const idA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const idB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

test('baseline is unchanged and identical draft has no changes', () => {
  const initial = [{ id: idA, status: 'purchased' as const, vendor: 'ドラチケ' }];
  const draft = beginTicketEditor(initial);
  initial[0].vendor = '変更後';
  assert.equal(draft.baseline[0].vendor, 'ドラチケ');
  assert.equal(ticketEditorHasChanges(ticketEditorChanges(draft)), false);
});

test('edit one, delete another, create a stable-key new ticket', () => {
  let draft = beginTicketEditor([{ id: idA, status: 'purchased', vendor: 'ドラチケ' }, { id: idB, status: 'ticketed' }]);
  draft = editTicketRow(draft, 0, 'vendor', '窓口');
  draft = removeTicketRow(draft, 1);
  draft = addTicketRow(draft, 'draft-c');
  const changes = ticketEditorChanges(draft);
  assert.deepEqual(changes.update, [{ id: idA, changes: { vendor: '窓口' } }]);
  assert.deepEqual(changes.delete, [idB]);
  assert.equal(changes.create[0].client_key, 'draft-c');
  assert.equal(changes.create[0].values.status, 'release_waiting');
});

test('new draft removal does not send delete and undo restores old ticket', () => {
  let draft = beginTicketEditor([{ id: idA, status: 'purchased' }]);
  draft = addTicketRow(draft, 'draft-c');
  draft = removeTicketRow(draft, 1);
  assert.equal(ticketEditorHasChanges(ticketEditorChanges(draft)), false);
  draft = removeTicketRow(draft, 0);
  assert.deepEqual(ticketEditorChanges(draft).delete, [idA]);
  draft = undoTicketDeletion(draft, idA);
  assert.equal(ticketEditorHasChanges(ticketEditorChanges(draft)), false);
});

test('null is a deliberate clear; invalid quantity is rejected', () => {
  let draft = beginTicketEditor([{ id: idA, status: 'purchased', vendor: 'ドラチケ' }]);
  draft = editTicketRow(draft, 0, 'vendor', null);
  assert.deepEqual(ticketEditorChanges(draft).update[0].changes, { vendor: null });
  draft = editTicketRow(draft, 0, 'quantity', 0);
  assert.throws(() => ticketEditorChanges(draft), /quantity/);
});
