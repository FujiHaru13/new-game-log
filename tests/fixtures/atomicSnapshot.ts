export const owner='00000000-0000-0000-0000-000000000001';
export const matchId='10000000-0000-0000-0000-000000000001';
export const watchId='20000000-0000-0000-0000-000000000001';
export const ticketA='30000000-0000-0000-0000-000000000001';
export const ticketB='30000000-0000-0000-0000-000000000002';
export const ticketC='30000000-0000-0000-0000-000000000003';
export const otherId='10000000-0000-0000-0000-000000000002';
export const stamp='2026-11-06T00:00:00.123456+00:00';
export const later='2026-11-06T00:00:00.123457+00:00';
export function ticketRow(id=ticketA) {
  return {id,owner_id:owner,match_id:matchId,status:'purchased',release_date:null,purchase_date:'2026-11-05',issue_date:null,payment_deadline:null,
    quantity:1,seat_type_name:'infield',seat_area:null,seat_row:null,seat_number:null,ticket_type:'QR',vendor:'vendor',notes:null,
    purchase_amount:2000,my_expense:1000,refund_amount:null,refund_status:'none',created_at:stamp,updated_at:stamp};
}
export function snapshot(version='5',updated=stamp) {
  return {
    match:{id:matchId,owner_id:owner,legacy_id:null,match_date:'2026-11-06',date_unknown:false,start_time:'18:00:00',home_team_id:'dragons',away_team_id:'giants',
      stadium_id:'vantelin_dome',stadium_custom_name:null,match_type:'official',match_status:'scheduled',home_score:null,away_score:null,score_confirmed:false,
      duration_minutes:null,events:null,notes:'baseline',source_document:null,source_row_number:null,source_payload:null,created_at:stamp,updated_at:updated,revision:version},
    watch_record:{id:watchId,owner_id:owner,match_id:matchId,watch_status:'scheduled',cheer_team_id:'dragons',companions:null,watch_memo:null,
      total_price:2000,my_expense:1000,payment_date:null,payment_destination:null,payment_method:null,cost_memo:null,refund_amount:null,refund_status:'none',created_at:stamp,updated_at:stamp},
    updated_at:updated,revision:version,tickets:[ticketRow()],
    categories:[{owner_id:owner,watch_record_id:watchId,category_id:'dragons_1st',is_primary:true}],
    seats:[{owner_id:owner,watch_record_id:watchId,seat_type_id:null,custom_seat_type_name:'infield',area:'A',seat_row:null,seat_number:null}],
    splits:[],payments:[],innings:[],totals:[],pitchers:[],events:[],links:[],
  };
}
