import {test} from 'node:test';
import assert from 'node:assert/strict';
import {planFullFormV2} from './src/lib/atomic/fullFormPreflight';
import {beginTicketEditor, addTicketRow} from './src/lib/atomic/ticketEditorDraft';
import type {MatchRecord} from './src/types/baseball';
import type {MatchSnapshot} from './src/lib/atomic/snapshot';

const id='11111111-1111-4111-8111-111111111111';
const stamp='2026-11-10T04:00:00.123456+00:00';
function fixture() {
  const original:MatchRecord={
    id, date:'2026-11-01', isDateUnknown:false, homeTeamId:'dragons', awayTeamId:'giants', stadiumId:'test',
    matchType:'official',matchStatus:'finished', homeScore:2,awayScore:1,isScoreConfirmed:true,
    watchStatus:'watched',cheerTeamId:'dragons',categories:['dragons_1st'],primaryCategory:'dragons_1st',
    seatInfo:{area:'A'},costInfo:{splits:[],totalPrice:1000},ticketInfo:{status:'release_waiting'},tickets:[],
    createdAt:stamp,updatedAt:stamp,
  };
  const snapshot={updatedAt:stamp,record:{...structuredClone(original),revision:'1'},raw:{
    links:[],splits:[],pitchers:[],events:[],
  }} as unknown as MatchSnapshot;
  return {original,snapshot,draft:beginTicketEditor(original.tickets)};
}
test('unchanged full form never emits replacement of unedited collections',()=>{
  const {original,snapshot,draft}=fixture();
  const planned=planFullFormV2(original,structuredClone(original),snapshot,draft);
  assert.deepEqual(planned.changedDetails,[]);
  assert.equal(planned.baseline,snapshot);
});
test('explicitly changed categories and seats only replace those collections',()=>{
  const {original,snapshot,draft}=fixture();
  const edited={...original,categories:['dragons_1st','other'] as MatchRecord['categories'],seatInfo:{area:'B'}};
  assert.deepEqual(planFullFormV2(original,edited,snapshot,draft).changedDetails,['categories','seat']);
});
test('stale parent and stale visible data fail before constructing an RPC intent',()=>{
  const {original,snapshot,draft}=fixture();
  assert.throws(()=>planFullFormV2({...original,updatedAt:'2026-11-10T04:00:00.123457+00:00'},original,snapshot,draft),/更新時刻/);
  assert.throws(()=>planFullFormV2(original,original,{...snapshot,record:{...snapshot.record,homeScore:3}},draft),/homeScore/);
});
test('unknown legacy child rows cannot be discarded as empty projections',()=>{
  const {original,snapshot,draft}=fixture();
  const edited={...original,links:[{title:'link',url:'https://example.com'}]};
  assert.throws(()=>planFullFormV2(original,edited,{...snapshot,raw:{...snapshot.raw,links:[{id:'hidden'}]}},draft),/links/);
  const hasHidden={...snapshot,raw:{...snapshot.raw,splits:[{id:'hidden'}]}};
  assert.throws(()=>planFullFormV2(original,{...original,costInfo:{...original.costInfo,splits:[{id:'abc',title:'fee',amount:10}]}},hasHidden,draft),/splits/);
});
test('ticket edits are included without treating empty legacy arrays as a delete',()=>{
  const {original,snapshot,draft}=fixture();
  const updated=addTicketRow(draft,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  const planned=planFullFormV2(original,original,snapshot,updated);
  assert.equal(planned.tickets.length,1);
  assert.deepEqual(planned.changedDetails,[]);
});
test('mismatched ticket baseline and postponed record are stopped',()=>{
  const {original,snapshot,draft}=fixture();
  assert.throws(()=>planFullFormV2(original,original,{...snapshot,record:{...snapshot.record,matchStatus:'postponed'}},draft),/延期/);
  assert.throws(()=>planFullFormV2(original,original,snapshot,beginTicketEditor([{id:'22222222-2222-4222-8222-222222222222',status:'ticketed'}])),/チケット件数/);
});
