import {test} from 'node:test';
import assert from 'node:assert/strict';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {MatchRecord} from '../src/types/baseball';
import {assembleFullFormEdit, createFullFormV2SaveController, isV2FullFormWriteEnabled} from '../src/lib/atomic/fullFormSaveBridge';
import {beginTicketEditor} from '../src/lib/atomic/ticketEditorDraft';

const stamp='2026-11-10T04:00:00.123456+00:00';
function record(tickets:MatchRecord['tickets']):MatchRecord {
  return {
    id:'11111111-1111-4111-8111-111111111111', date:'2026-11-01',isDateUnknown:false,
    homeTeamId:'dragons',awayTeamId:'giants',stadiumId:'test',matchType:'official',matchStatus:'finished',
    homeScore:2,awayScore:1,isScoreConfirmed:true,watchStatus:'watched',cheerTeamId:'dragons',
    categories:['dragons_1st'],primaryCategory:'dragons_1st',seatInfo:{area:'A'},costInfo:{splits:[]},
    ticketInfo:tickets[0] ? {...tickets[0]} : {status:'release_waiting'}, tickets,
    createdAt:stamp,updatedAt:stamp,
  };
}
function input(original:MatchRecord) {
  const {id:_id,createdAt:_created,updatedAt:_updated,tickets:_tickets,...rest}=structuredClone(original);
  return rest;
}
test('full-form bridge is disabled without independent explicit opt-ins',async()=>{
  assert.equal(isV2FullFormWriteEnabled(),false);
  const original=record([]);
  let called=false;
  const client={auth:{getSession:()=>{called=true;throw Error('unexpected request');}}} as unknown as SupabaseClient;
  await assert.rejects(createFullFormV2SaveController(client,'33333333-3333-4333-8333-333333333333',original,original,beginTicketEditor([])),/無効/);
  assert.equal(called,false);
});
test('full-form assembly never truncates two tickets',()=>{
  const original=record([
    {id:'22222222-2222-4222-8222-222222222222',status:'purchased'},
    {id:'33333333-3333-4333-8333-333333333333',status:'ticketed'},
  ]);
  const result=assembleFullFormEdit(original,{...input(original),homeScore:4},false);
  assert.deepEqual(result.record.tickets,original.tickets);
  assert.notEqual(result.record.tickets,original.tickets);
  assert.equal(result.record.homeScore,4);
  assert.equal(result.useMultiDraft,false);
});
test('full-form assembly refuses overlapping single/multiple ticket edits',()=>{
  const original=record([{id:'22222222-2222-4222-8222-222222222222',status:'ticketed'}]);
  assert.throws(()=>assembleFullFormEdit(original,{...input(original),ticketInfo:{status:'purchased'}},true),/同時/);
  const multiple=record([original.tickets[0],{id:'33333333-3333-4333-8333-333333333333',status:'ticketed'}]);
  assert.throws(()=>assembleFullFormEdit(multiple,{...input(multiple),ticketInfo:{status:'purchased'}},false),/同時/);
});
test('single-ticket form retains existing UUID and changes only the representative ticket',()=>{
  const original=record([{id:'22222222-2222-4222-8222-222222222222',status:'purchased'}]);
  const result=assembleFullFormEdit(original,{...input(original),ticketInfo:{status:'ticketed'}},false);
  assert.equal(result.record.tickets.length,1);
  assert.equal(result.record.tickets[0].id,original.tickets[0].id);
  assert.equal(result.record.tickets[0].status,'ticketed');
  assert.equal(original.tickets[0].status,'purchased');
});

test('zero-to-one legacy input is blocked until stable client key is allocated in multi editor',()=>{
  const original=record([]);
  assert.throws(()=>assembleFullFormEdit(original,{...input(original),ticketInfo:{status:'purchased'}},false),/一時キー/);
});
