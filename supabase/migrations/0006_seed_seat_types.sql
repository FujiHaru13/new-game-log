-- Add the seat master data used by src/data/stadiums.ts.
-- Apply after the initial schema and master seed. This migration does not
-- insert matches, watch records, tickets, payments, or seats.

do $$
declare
  expected record;
  actual public.seat_types%rowtype;
begin
  if exists (
    select 1
    from (values
      ('vantelin_dome'), ('nagoya_stadium'), ('koshien'), ('tokyo_dome'),
      ('meiji_jingu'), ('yokohama_stadium'), ('mazda_zoom_zoom'), ('escon_field'),
      ('kyocera_dome'), ('paypay_dome'), ('other_stadium')
    ) as required(id)
    left join public.stadiums s on s.id = required.id
    where s.id is null
  ) then
    raise exception 'one or more required stadium master IDs are missing';
  end if;

  for expected in
    select * from (values
      ('prime_twin', 'プライム・ツイン', 'プライム・ツイン (内野/外野)', 'premium', '¥7,000〜¥11,000', 1),
      ('prime_box', 'プライム・ボックス', 'プライム・ボックス (4人席)', 'box', '¥18,000〜¥24,000', 2),
      ('diamond_seat', 'ダイヤモンドシート', 'ダイヤモンドシート (バックネット裏最前)', 'premium', '¥10,000〜¥15,000', 3),
      ('excellent_seat', 'エクセレントシート', 'エクセレントシート', 'premium', '¥8,000〜¥12,000', 4),
      ('infield_ss', '内野SS指定席', '内野SS指定席 (1塁側/3塁側)', 'infield', '¥5,800〜¥6,800', 5),
      ('infield_s', '内野S指定席', '内野S指定席 (1塁側/3塁側)', 'infield', '¥4,800〜¥5,800', 6),
      ('infield_a', '内野A指定席', '内野A指定席 (1塁側/3塁側)', 'infield', '¥4,000〜¥4,900', 7),
      ('infield_b', '内野B指定席', '内野B指定席 (1塁側/3塁側)', 'infield', '¥3,200〜¥3,900', 8),
      ('panorama_a', 'パノラマA指定席', 'パノラマA指定席 (5階席)', 'infield', '¥2,600〜¥3,100', 9),
      ('panorama_b', 'パノラマB指定席', 'パノラマB指定席 (5階席)', 'infield', '¥1,900〜¥2,300', 10),
      ('dragons_ouen', 'ドラゴンズ外野応援席', 'ドラゴンズ外野応援席 (ライト側)', 'outfield', '¥2,000〜¥2,500', 11),
      ('visitor_ouen', 'ビジター外野応援席', 'ビジター外野応援席 (レフト側)', 'outfield', '¥2,000〜¥2,500', 12),
      ('docomo_terrace', 'ドコモビジネス テラス席', 'テラス席', 'box', '¥15,000〜¥20,000', 13),
      ('field_seat', 'フィールドシート', 'フィールドシート (グラウンド目線)', 'premium', '¥7,500〜¥9,000', 14),
      ('nagoya_net', 'バックネット裏指定席', 'ネット裏指定席', 'infield', '¥1,500〜¥2,000', 1),
      ('nagoya_infield', '内野指定席', '内野指定席 (1塁側/3塁側)', 'infield', '¥1,000〜¥1,500', 2),
      ('nagoya_free', '内野自由席', '内野自由席', 'infield', '¥800〜¥1,000', 3),
      ('koshien_green', 'グリーンシート', 'グリーンシート', 'premium', '¥5,000〜¥7,500', 1),
      ('koshien_ivy', 'アイビーシート', 'アイビーシート (1塁側)', 'infield', '¥4,500〜¥5,500', 2),
      ('koshien_breeze', 'ブリーズシート', 'ブリーズシート (3塁側)', 'infield', '¥4,500〜¥5,500', 3),
      ('koshien_alps_1', '1塁アルプス指定席', '1塁アルプス席', 'infield', '¥2,800〜¥3,400', 4),
      ('koshien_alps_3', '3塁アルプス指定席', '3塁アルプス席', 'infield', '¥2,800〜¥3,400', 5),
      ('koshien_visitor', 'ビジター専用応援席', 'レフトビジター専用応援席', 'outfield', '¥2,000〜¥2,500', 6),
      ('td_diamond', 'ダイヤモンドボックス', 'ダイヤモンドボックス', 'premium', '¥15,000〜¥25,000', 1),
      ('td_infield_s', '指定席S', '指定席S', 'infield', '¥6,800〜¥7,500', 2),
      ('td_infield_a', '指定席A', '指定席A', 'infield', '¥4,600〜¥5,400', 3),
      ('td_infield_b', '指定席B', '指定席B', 'infield', '¥3,800〜¥4,400', 4),
      ('td_visitor_outfield', 'ビジターチーム応援席', 'レフト外野ビジター応援席', 'outfield', '¥2,200〜¥2,600', 5),
      ('jingu_backnet', 'ネット裏指定席', 'ネット裏指定席', 'infield', '¥5,200〜¥6,000', 1),
      ('jingu_infield_s', '内野指定席S', '内野指定席S', 'infield', '¥4,500〜¥5,200', 2),
      ('jingu_infield_a', '内野指定席A', '内野指定席A', 'infield', '¥3,800〜¥4,400', 3),
      ('jingu_infield_b', '内野指定席B', '内野指定席B', 'infield', '¥3,200〜¥3,800', 4),
      ('jingu_visitor', 'スワローズ側外野・ビジター側外野', 'レフトビジター外野指定席', 'outfield', '¥1,900〜¥2,400', 5),
      ('hama_ss', '内野指定席SS', '内野指定席SS', 'infield', '¥5,500〜¥6,800', 1),
      ('hama_s', '内野指定席S', '内野指定席S', 'infield', '¥4,600〜¥5,500', 2),
      ('hama_a', '内野指定席A', '内野指定席A', 'infield', '¥3,700〜¥4,500', 3),
      ('hama_wing', 'ウィング席', 'ウィング席', 'infield', '¥2,200〜¥2,800', 4),
      ('hama_visitor', 'ビジター外野指定席', 'レフトビジター外野指定席', 'outfield', '¥2,100〜¥2,600', 5),
      ('mazda_ss', 'S指定席', 'S指定席 (ネット裏/内野)', 'infield', '¥4,500〜¥5,000', 1),
      ('mazda_a', 'A指定席', 'A指定席 (1塁/3塁)', 'infield', '¥3,900〜¥4,300', 2),
      ('mazda_visitor_perf', 'ビジターパフォーマンス席', 'ビジターパフォーマンス席', 'outfield', '¥2,100〜¥2,300', 3),
      ('escon_diamond', 'ダイヤモンドクラブシート', 'ダイヤモンドクラブシート', 'premium', '¥12,000〜¥20,000', 1),
      ('escon_main', 'MAIN LEVEL 内野指定席', 'MAIN LEVEL 内野', 'infield', '¥4,500〜¥6,500', 2),
      ('escon_star', 'STAR LEVEL 内野指定席', 'STAR LEVEL パノラマ', 'infield', '¥2,500〜¥3,800', 3),
      ('escon_outfield', '外野指定席', '外野指定席 (ビジター)', 'outfield', '¥2,000〜¥3,000', 4),
      ('kyocera_special', '特別指定席', 'ネット裏特別指定席', 'infield', '¥5,000〜¥7,000', 1),
      ('kyocera_infield_a', '内野指定席A', '内野指定席A', 'infield', '¥3,800〜¥4,800', 2),
      ('kyocera_visitor', 'ビジター下段指定席', 'ビジター下段指定席', 'outfield', '¥2,200〜¥2,800', 3),
      ('paypay_infield_s', '内野S指定席', '内野S指定席', 'infield', '¥4,500〜¥6,000', 1),
      ('paypay_infield_a', '内野A指定席', '内野A指定席', 'infield', '¥3,500〜¥4,500', 2),
      ('paypay_visitor', 'ビジター応援指定席', 'ビジター応援席', 'outfield', '¥2,000〜¥2,500', 3),
      ('other_infield', '内野指定席', '内野指定席', 'infield', null, 1),
      ('other_outfield', '外野自由席', '外野自由席', 'outfield', null, 2)
    ) as v(id, name, display_name, category, price_range, display_order)
  loop
    select * into actual from public.seat_types where id = expected.id;
    if found and (actual.name, actual.display_name, actual.category, actual.price_range, actual.display_order)
      is distinct from (expected.name, expected.display_name, expected.category, expected.price_range, expected.display_order) then
      raise exception 'seat_types id % already exists with different values', expected.id;
    end if;
  end loop;
end $$;

insert into public.seat_types (id, name, display_name, category, price_range, display_order)
select id, name, display_name, category, price_range, display_order
from (values
  ('prime_twin', 'プライム・ツイン', 'プライム・ツイン (内野/外野)', 'premium', '¥7,000〜¥11,000', 1),
  ('prime_box', 'プライム・ボックス', 'プライム・ボックス (4人席)', 'box', '¥18,000〜¥24,000', 2),
  ('diamond_seat', 'ダイヤモンドシート', 'ダイヤモンドシート (バックネット裏最前)', 'premium', '¥10,000〜¥15,000', 3),
  ('excellent_seat', 'エクセレントシート', 'エクセレントシート', 'premium', '¥8,000〜¥12,000', 4),
  ('infield_ss', '内野SS指定席', '内野SS指定席 (1塁側/3塁側)', 'infield', '¥5,800〜¥6,800', 5),
  ('infield_s', '内野S指定席', '内野S指定席 (1塁側/3塁側)', 'infield', '¥4,800〜¥5,800', 6),
  ('infield_a', '内野A指定席', '内野A指定席 (1塁側/3塁側)', 'infield', '¥4,000〜¥4,900', 7),
  ('infield_b', '内野B指定席', '内野B指定席 (1塁側/3塁側)', 'infield', '¥3,200〜¥3,900', 8),
  ('panorama_a', 'パノラマA指定席', 'パノラマA指定席 (5階席)', 'infield', '¥2,600〜¥3,100', 9),
  ('panorama_b', 'パノラマB指定席', 'パノラマB指定席 (5階席)', 'infield', '¥1,900〜¥2,300', 10),
  ('dragons_ouen', 'ドラゴンズ外野応援席', 'ドラゴンズ外野応援席 (ライト側)', 'outfield', '¥2,000〜¥2,500', 11),
  ('visitor_ouen', 'ビジター外野応援席', 'ビジター外野応援席 (レフト側)', 'outfield', '¥2,000〜¥2,500', 12),
  ('docomo_terrace', 'ドコモビジネス テラス席', 'テラス席', 'box', '¥15,000〜¥20,000', 13),
  ('field_seat', 'フィールドシート', 'フィールドシート (グラウンド目線)', 'premium', '¥7,500〜¥9,000', 14),
  ('nagoya_net', 'バックネット裏指定席', 'ネット裏指定席', 'infield', '¥1,500〜¥2,000', 1),
  ('nagoya_infield', '内野指定席', '内野指定席 (1塁側/3塁側)', 'infield', '¥1,000〜¥1,500', 2),
  ('nagoya_free', '内野自由席', '内野自由席', 'infield', '¥800〜¥1,000', 3),
  ('koshien_green', 'グリーンシート', 'グリーンシート', 'premium', '¥5,000〜¥7,500', 1),
  ('koshien_ivy', 'アイビーシート', 'アイビーシート (1塁側)', 'infield', '¥4,500〜¥5,500', 2),
  ('koshien_breeze', 'ブリーズシート', 'ブリーズシート (3塁側)', 'infield', '¥4,500〜¥5,500', 3),
  ('koshien_alps_1', '1塁アルプス指定席', '1塁アルプス席', 'infield', '¥2,800〜¥3,400', 4),
  ('koshien_alps_3', '3塁アルプス指定席', '3塁アルプス席', 'infield', '¥2,800〜¥3,400', 5),
  ('koshien_visitor', 'ビジター専用応援席', 'レフトビジター専用応援席', 'outfield', '¥2,000〜¥2,500', 6),
  ('td_diamond', 'ダイヤモンドボックス', 'ダイヤモンドボックス', 'premium', '¥15,000〜¥25,000', 1),
  ('td_infield_s', '指定席S', '指定席S', 'infield', '¥6,800〜¥7,500', 2),
  ('td_infield_a', '指定席A', '指定席A', 'infield', '¥4,600〜¥5,400', 3),
  ('td_infield_b', '指定席B', '指定席B', 'infield', '¥3,800〜¥4,400', 4),
  ('td_visitor_outfield', 'ビジターチーム応援席', 'レフト外野ビジター応援席', 'outfield', '¥2,200〜¥2,600', 5),
  ('jingu_backnet', 'ネット裏指定席', 'ネット裏指定席', 'infield', '¥5,200〜¥6,000', 1),
  ('jingu_infield_s', '内野指定席S', '内野指定席S', 'infield', '¥4,500〜¥5,200', 2),
  ('jingu_infield_a', '内野指定席A', '内野指定席A', 'infield', '¥3,800〜¥4,400', 3),
  ('jingu_infield_b', '内野指定席B', '内野指定席B', 'infield', '¥3,200〜¥3,800', 4),
  ('jingu_visitor', 'スワローズ側外野・ビジター側外野', 'レフトビジター外野指定席', 'outfield', '¥1,900〜¥2,400', 5),
  ('hama_ss', '内野指定席SS', '内野指定席SS', 'infield', '¥5,500〜¥6,800', 1),
  ('hama_s', '内野指定席S', '内野指定席S', 'infield', '¥4,600〜¥5,500', 2),
  ('hama_a', '内野指定席A', '内野指定席A', 'infield', '¥3,700〜¥4,500', 3),
  ('hama_wing', 'ウィング席', 'ウィング席', 'infield', '¥2,200〜¥2,800', 4),
  ('hama_visitor', 'ビジター外野指定席', 'レフトビジター外野指定席', 'outfield', '¥2,100〜¥2,600', 5),
  ('mazda_ss', 'S指定席', 'S指定席 (ネット裏/内野)', 'infield', '¥4,500〜¥5,000', 1),
  ('mazda_a', 'A指定席', 'A指定席 (1塁/3塁)', 'infield', '¥3,900〜¥4,300', 2),
  ('mazda_visitor_perf', 'ビジターパフォーマンス席', 'ビジターパフォーマンス席', 'outfield', '¥2,100〜¥2,300', 3),
  ('escon_diamond', 'ダイヤモンドクラブシート', 'ダイヤモンドクラブシート', 'premium', '¥12,000〜¥20,000', 1),
  ('escon_main', 'MAIN LEVEL 内野指定席', 'MAIN LEVEL 内野', 'infield', '¥4,500〜¥6,500', 2),
  ('escon_star', 'STAR LEVEL 内野指定席', 'STAR LEVEL パノラマ', 'infield', '¥2,500〜¥3,800', 3),
  ('escon_outfield', '外野指定席', '外野指定席 (ビジター)', 'outfield', '¥2,000〜¥3,000', 4),
  ('kyocera_special', '特別指定席', 'ネット裏特別指定席', 'infield', '¥5,000〜¥7,000', 1),
  ('kyocera_infield_a', '内野指定席A', '内野指定席A', 'infield', '¥3,800〜¥4,800', 2),
  ('kyocera_visitor', 'ビジター下段指定席', 'ビジター下段指定席', 'outfield', '¥2,200〜¥2,800', 3),
  ('paypay_infield_s', '内野S指定席', '内野S指定席', 'infield', '¥4,500〜¥6,000', 1),
  ('paypay_infield_a', '内野A指定席', '内野A指定席', 'infield', '¥3,500〜¥4,500', 2),
  ('paypay_visitor', 'ビジター応援指定席', 'ビジター応援席', 'outfield', '¥2,000〜¥2,500', 3),
  ('other_infield', '内野指定席', '内野指定席', 'infield', null, 1),
  ('other_outfield', '外野自由席', '外野自由席', 'outfield', null, 2)
) as v(id, name, display_name, category, price_range, display_order)
on conflict (id) do nothing;

insert into public.stadium_seat_types (stadium_id, seat_type_id)
select stadium_id, seat_type_id
from (values
  ('vantelin_dome', 'prime_twin'), ('vantelin_dome', 'prime_box'), ('vantelin_dome', 'diamond_seat'), ('vantelin_dome', 'excellent_seat'), ('vantelin_dome', 'infield_ss'), ('vantelin_dome', 'infield_s'), ('vantelin_dome', 'infield_a'), ('vantelin_dome', 'infield_b'), ('vantelin_dome', 'panorama_a'), ('vantelin_dome', 'panorama_b'), ('vantelin_dome', 'dragons_ouen'), ('vantelin_dome', 'visitor_ouen'), ('vantelin_dome', 'docomo_terrace'), ('vantelin_dome', 'field_seat'),
  ('nagoya_stadium', 'nagoya_net'), ('nagoya_stadium', 'nagoya_infield'), ('nagoya_stadium', 'nagoya_free'),
  ('koshien', 'koshien_green'), ('koshien', 'koshien_ivy'), ('koshien', 'koshien_breeze'), ('koshien', 'koshien_alps_1'), ('koshien', 'koshien_alps_3'), ('koshien', 'koshien_visitor'),
  ('tokyo_dome', 'td_diamond'), ('tokyo_dome', 'td_infield_s'), ('tokyo_dome', 'td_infield_a'), ('tokyo_dome', 'td_infield_b'), ('tokyo_dome', 'td_visitor_outfield'),
  ('meiji_jingu', 'jingu_backnet'), ('meiji_jingu', 'jingu_infield_s'), ('meiji_jingu', 'jingu_infield_a'), ('meiji_jingu', 'jingu_infield_b'), ('meiji_jingu', 'jingu_visitor'),
  ('yokohama_stadium', 'hama_ss'), ('yokohama_stadium', 'hama_s'), ('yokohama_stadium', 'hama_a'), ('yokohama_stadium', 'hama_wing'), ('yokohama_stadium', 'hama_visitor'),
  ('mazda_zoom_zoom', 'mazda_ss'), ('mazda_zoom_zoom', 'mazda_a'), ('mazda_zoom_zoom', 'mazda_visitor_perf'),
  ('escon_field', 'escon_diamond'), ('escon_field', 'escon_main'), ('escon_field', 'escon_star'), ('escon_field', 'escon_outfield'),
  ('kyocera_dome', 'kyocera_special'), ('kyocera_dome', 'kyocera_infield_a'), ('kyocera_dome', 'kyocera_visitor'),
  ('paypay_dome', 'paypay_infield_s'), ('paypay_dome', 'paypay_infield_a'), ('paypay_dome', 'paypay_visitor')
  ,('other_stadium', 'other_infield'), ('other_stadium', 'other_outfield')
) as v(stadium_id, seat_type_id)
on conflict (stadium_id, seat_type_id) do nothing;
