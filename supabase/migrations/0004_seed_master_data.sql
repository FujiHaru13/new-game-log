-- Master data only. No matches, tickets, payments, or user rows are inserted.

insert into public.categories (id, label, short_label, display_order)
values
  ('dragons_1st', '中日ドラゴンズ 1軍', '中日1軍', 1),
  ('dragons_2nd', '中日ドラゴンズ 2軍（ウエスタン）', '中日2軍', 2),
  ('japan', '侍ジャパン（日本代表）', '日本代表', 3),
  ('other', 'その他野球（他球団・アマ等）', 'その他', 4);

insert into public.teams (id, name, short_name, code, color, text_color, league, league_name, display_order)
values
  ('dragons', '中日ドラゴンズ', '中日', 'D', '#003882', '#ffffff', 'central', 'セ・リーグ', 1),
  ('tigers', '阪神タイガース', '阪神', 'T', '#FFE200', '#000000', 'central', 'セ・リーグ', 2),
  ('giants', '読売ジャイアンツ', '巨人', 'G', '#F97709', '#ffffff', 'central', 'セ・リーグ', 3),
  ('baystars', '横浜DeNAベイスターズ', 'DeNA', 'DB', '#0055A5', '#ffffff', 'central', 'セ・リーグ', 4),
  ('carp', '広島東洋カープ', '広島', 'C', '#DF0011', '#ffffff', 'central', 'セ・リーグ', 5),
  ('swallows', '東京ヤクルトスワローズ', 'ヤクルト', 'S', '#072C61', '#ffffff', 'central', 'セ・リーグ', 6),
  ('buffaloes', 'オリックス・バファローズ', 'オリックス', 'B', '#0B2240', '#BCA75D', 'pacific', 'パ・リーグ', 7),
  ('marines', '千葉ロッテマリーンズ', 'ロッテ', 'M', '#000000', '#ffffff', 'pacific', 'パ・リーグ', 8),
  ('hawks', '福岡ソフトバンクホークス', 'ソフトバンク', 'H', '#F5C700', '#000000', 'pacific', 'パ・リーグ', 9),
  ('eagles', '東北楽天ゴールデンイーグルス', '楽天', 'E', '#860010', '#ffffff', 'pacific', 'パ・リーグ', 10),
  ('fighters', '北海道日本ハムファイターズ', '日本ハム', 'F', '#003E7E', '#ffffff', 'pacific', 'パ・リーグ', 11),
  ('lions', '埼玉西武ライオンズ', '西武', 'L', '#13294B', '#ffffff', 'pacific', 'パ・リーグ', 12),
  ('dragons_farm', '中日ドラゴンズ（2軍）', '中日2軍', 'D2', '#1656b8', '#ffffff', 'western', 'ウエスタン・リーグ', 13),
  ('hayate', 'くふうハヤテベンチャーズ静岡', 'ハヤテ', 'HY', '#008080', '#ffffff', 'western', 'ウエスタン・リーグ', 14),
  ('tigers_farm', '阪神タイガース（2軍）', '阪神2軍', 'T2', '#FFE200', '#000000', 'western', 'ウエスタン・リーグ', 15),
  ('hawks_farm', '福岡ソフトバンクホークス（2軍）', 'ソフトバンク2軍', 'H2', '#F5C700', '#000000', 'western', 'ウエスタン・リーグ', 16),
  ('buffaloes_farm', 'オリックス・バファローズ（2軍）', 'オリックス2軍', 'B2', '#0B2240', '#BCA75D', 'western', 'ウエスタン・リーグ', 17),
  ('carp_farm', '広島東洋カープ（2軍）', '広島2軍', 'C2', '#DF0011', '#ffffff', 'western', 'ウエスタン・リーグ', 18),
  ('samurai_japan', '侍ジャパン（日本代表）', '侍ジャパン', 'JPN', '#B31B1B', '#ffffff', 'japan', '日本代表', 19),
  ('team_korea', '韓国代表', '韓国', 'KOR', '#003478', '#ffffff', 'japan', '国際代表', 20),
  ('team_taiwan', 'チャイニーズ・タイペイ代表', '台湾', 'TPE', '#002F6C', '#ffffff', 'japan', '国際代表', 21),
  ('team_usa', 'アメリカ代表', 'アメリカ', 'USA', '#002868', '#ffffff', 'japan', '国際代表', 22),
  ('team_australia', 'オーストラリア代表', '豪州', 'AUS', '#00843D', '#FFCD00', 'japan', '国際代表', 23),
  ('other_team', 'その他の球団・クラブ', 'その他', 'OTH', '#64748b', '#ffffff', 'other', 'その他', 99);

insert into public.stadiums (id, name, short_name, location, home_team_id, is_dome, display_order)
values
  ('vantelin_dome', 'バンテリンドーム ナゴヤ', 'バンテリンドーム', '愛知県名古屋市東区大幸南1-1-1', 'dragons', true, 1),
  ('nagoya_stadium', 'ナゴヤ球場', 'ナゴヤ球場', '愛知県名古屋市中川区露橋2-12-1', 'dragons_farm', false, 2),
  ('koshien', '阪神甲子園球場', '甲子園', '兵庫県西宮市甲子園町1-82', 'tigers', false, 3),
  ('tokyo_dome', '東京ドーム', '東京ドーム', '東京都文京区後楽1-3-61', 'giants', true, 4),
  ('meiji_jingu', '明治神宮野球場', '神宮球場', '東京都新宿区霞ヶ丘町3-1', 'swallows', false, 5),
  ('yokohama_stadium', '横浜スタジアム', 'ハマスタ', '神奈川県横浜市中区横浜公園', 'baystars', false, 6),
  ('mazda_zoom_zoom', 'MAZDA Zoom-Zoom スタジアム広島', 'マツダスタジアム', '広島県広島市南区南蟹屋2-3-1', 'carp', false, 7),
  ('escon_field', 'ES CON FIELD HOKKAIDO', 'エスコンフィールド', '北海道北広島市Fビレッジ1番地', 'fighters', true, 8),
  ('kyocera_dome', '京セラドーム大阪', '京セラドーム', '大阪府大阪市西区千代崎3-中2-1', 'buffaloes', true, 9),
  ('paypay_dome', 'みずほPayPayドーム福岡', 'PayPayドーム', '福岡県福岡市中央区地行浜2-2-2', 'hawks', true, 10),
  ('other_stadium', 'その他球場・地方球場', '地方・その他', '全国各地', null, false, 99);
