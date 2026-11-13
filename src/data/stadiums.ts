/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stadium } from '../types/baseball';

export const STADIUMS: Stadium[] = [
  {
    id: 'vantelin_dome',
    name: 'バンテリンドーム ナゴヤ',
    shortName: 'バンテリンドーム',
    location: '愛知県名古屋市東区大幸南1-1-1',
    homeTeamId: 'dragons',
    isDome: true,
    order: 1,
    seatTypes: [
      { id: 'prime_twin', name: 'プライム・ツイン', displayName: 'プライム・ツイン (内野/外野)', category: 'premium', priceRange: '¥7,000〜¥11,000', order: 1 },
      { id: 'prime_box', name: 'プライム・ボックス', displayName: 'プライム・ボックス (4人席)', category: 'box', priceRange: '¥18,000〜¥24,000', order: 2 },
      { id: 'diamond_seat', name: 'ダイヤモンドシート', displayName: 'ダイヤモンドシート (バックネット裏最前)', category: 'premium', priceRange: '¥10,000〜¥15,000', order: 3 },
      { id: 'excellent_seat', name: 'エクセレントシート', displayName: 'エクセレントシート', category: 'premium', priceRange: '¥8,000〜¥12,000', order: 4 },
      { id: 'infield_ss', name: '内野SS指定席', displayName: '内野SS指定席 (1塁側/3塁側)', category: 'infield', priceRange: '¥5,800〜¥6,800', order: 5 },
      { id: 'infield_s', name: '内野S指定席', displayName: '内野S指定席 (1塁側/3塁側)', category: 'infield', priceRange: '¥4,800〜¥5,800', order: 6 },
      { id: 'infield_a', name: '内野A指定席', displayName: '内野A指定席 (1塁側/3塁側)', category: 'infield', priceRange: '¥4,000〜¥4,900', order: 7 },
      { id: 'infield_b', name: '内野B指定席', displayName: '内野B指定席 (1塁側/3塁側)', category: 'infield', priceRange: '¥3,200〜¥3,900', order: 8 },
      { id: 'panorama_a', name: 'パノラマA指定席', displayName: 'パノラマA指定席 (5階席)', category: 'infield', priceRange: '¥2,600〜¥3,100', order: 9 },
      { id: 'panorama_b', name: 'パノラマB指定席', displayName: 'パノラマB指定席 (5階席)', category: 'infield', priceRange: '¥1,900〜¥2,300', order: 10 },
      { id: 'dragons_ouen', name: 'ドラゴンズ外野応援席', displayName: 'ドラゴンズ外野応援席 (ライト側)', category: 'outfield', priceRange: '¥2,000〜¥2,500', order: 11 },
      { id: 'visitor_ouen', name: 'ビジター外野応援席', displayName: 'ビジター外野応援席 (レフト側)', category: 'outfield', priceRange: '¥2,000〜¥2,500', order: 12 },
      { id: 'docomo_terrace', name: 'ドコモビジネス テラス席', displayName: 'テラス席', category: 'box', priceRange: '¥15,000〜¥20,000', order: 13 },
      { id: 'field_seat', name: 'フィールドシート', displayName: 'フィールドシート (グラウンド目線)', category: 'premium', priceRange: '¥7,500〜¥9,000', order: 14 },
    ],
  },
  {
    id: 'nagoya_stadium',
    name: 'ナゴヤ球場',
    shortName: 'ナゴヤ球場',
    location: '愛知県名古屋市中川区露橋2-12-1',
    homeTeamId: 'dragons_farm',
    isDome: false,
    order: 2,
    seatTypes: [
      { id: 'nagoya_net', name: 'バックネット裏指定席', displayName: 'ネット裏指定席', category: 'infield', priceRange: '¥1,500〜¥2,000', order: 1 },
      { id: 'nagoya_infield', name: '内野指定席', displayName: '内野指定席 (1塁側/3塁側)', category: 'infield', priceRange: '¥1,000〜¥1,500', order: 2 },
      { id: 'nagoya_free', name: '内野自由席', displayName: '内野自由席', category: 'infield', priceRange: '¥800〜¥1,000', order: 3 },
    ],
  },
  {
    id: 'koshien',
    name: '阪神甲子園球場',
    shortName: '甲子園',
    location: '兵庫県西宮市甲子園町1-82',
    homeTeamId: 'tigers',
    isDome: false,
    order: 3,
    seatTypes: [
      { id: 'koshien_green', name: 'グリーンシート', displayName: 'グリーンシート', category: 'premium', priceRange: '¥5,000〜¥7,500', order: 1 },
      { id: 'koshien_ivy', name: 'アイビーシート', displayName: 'アイビーシート (1塁側)', category: 'infield', priceRange: '¥4,500〜¥5,500', order: 2 },
      { id: 'koshien_breeze', name: 'ブリーズシート', displayName: 'ブリーズシート (3塁側)', category: 'infield', priceRange: '¥4,500〜¥5,500', order: 3 },
      { id: 'koshien_alps_1', name: '1塁アルプス指定席', displayName: '1塁アルプス席', category: 'infield', priceRange: '¥2,800〜¥3,400', order: 4 },
      { id: 'koshien_alps_3', name: '3塁アルプス指定席', displayName: '3塁アルプス席', category: 'infield', priceRange: '¥2,800〜¥3,400', order: 5 },
      { id: 'koshien_visitor', name: 'ビジター専用応援席', displayName: 'レフトビジター専用応援席', category: 'outfield', priceRange: '¥2,000〜¥2,500', order: 6 },
    ],
  },
  {
    id: 'tokyo_dome',
    name: '東京ドーム',
    shortName: '東京ドーム',
    location: '東京都文京区後楽1-3-61',
    homeTeamId: 'giants',
    isDome: true,
    order: 4,
    seatTypes: [
      { id: 'td_diamond', name: 'ダイヤモンドボックス', displayName: 'ダイヤモンドボックス', category: 'premium', priceRange: '¥15,000〜¥25,000', order: 1 },
      { id: 'td_infield_s', name: '指定席S', displayName: '指定席S', category: 'infield', priceRange: '¥6,800〜¥7,500', order: 2 },
      { id: 'td_infield_a', name: '指定席A', displayName: '指定席A', category: 'infield', priceRange: '¥4,600〜¥5,400', order: 3 },
      { id: 'td_infield_b', name: '指定席B', displayName: '指定席B', category: 'infield', priceRange: '¥3,800〜¥4,400', order: 4 },
      { id: 'td_visitor_outfield', name: 'ビジターチーム応援席', displayName: 'レフト外野ビジター応援席', category: 'outfield', priceRange: '¥2,200〜¥2,600', order: 5 },
    ],
  },
  {
    id: 'meiji_jingu',
    name: '明治神宮野球場',
    shortName: '神宮球場',
    location: '東京都新宿区霞ヶ丘町3-1',
    homeTeamId: 'swallows',
    isDome: false,
    order: 5,
    seatTypes: [
      { id: 'jingu_backnet', name: 'ネット裏指定席', displayName: 'ネット裏指定席', category: 'infield', priceRange: '¥5,200〜¥6,000', order: 1 },
      { id: 'jingu_infield_s', name: '内野指定席S', displayName: '内野指定席S', category: 'infield', priceRange: '¥4,500〜¥5,200', order: 2 },
      { id: 'jingu_infield_a', name: '内野指定席A', displayName: '内野指定席A', category: 'infield', priceRange: '¥3,800〜¥4,400', order: 3 },
      { id: 'jingu_infield_b', name: '内野指定席B', displayName: '内野指定席B', category: 'infield', priceRange: '¥3,200〜¥3,800', order: 4 },
      { id: 'jingu_visitor', name: 'スワローズ側外野・ビジター側外野', displayName: 'レフトビジター外野指定席', category: 'outfield', priceRange: '¥1,900〜¥2,400', order: 5 },
    ],
  },
  {
    id: 'yokohama_stadium',
    name: '横浜スタジアム',
    shortName: 'ハマスタ',
    location: '神奈川県横浜市中区横浜公園',
    homeTeamId: 'baystars',
    isDome: false,
    order: 6,
    seatTypes: [
      { id: 'hama_ss', name: '内野指定席SS', displayName: '内野指定席SS', category: 'infield', priceRange: '¥5,500〜¥6,800', order: 1 },
      { id: 'hama_s', name: '内野指定席S', displayName: '内野指定席S', category: 'infield', priceRange: '¥4,600〜¥5,500', order: 2 },
      { id: 'hama_a', name: '内野指定席A', displayName: '内野指定席A', category: 'infield', priceRange: '¥3,700〜¥4,500', order: 3 },
      { id: 'hama_wing', name: 'ウィング席', displayName: 'ウィング席', category: 'infield', priceRange: '¥2,200〜¥2,800', order: 4 },
      { id: 'hama_visitor', name: 'ビジター外野指定席', displayName: 'レフトビジター外野指定席', category: 'outfield', priceRange: '¥2,100〜¥2,600', order: 5 },
    ],
  },
  {
    id: 'mazda_zoom_zoom',
    name: 'MAZDA Zoom-Zoom スタジアム広島',
    shortName: 'マツダスタジアム',
    location: '広島県広島市南区南蟹屋2-3-1',
    homeTeamId: 'carp',
    isDome: false,
    order: 7,
    seatTypes: [
      { id: 'mazda_ss', name: 'S指定席', displayName: 'S指定席 (ネット裏/内野)', category: 'infield', priceRange: '¥4,500〜¥5,000', order: 1 },
      { id: 'mazda_a', name: 'A指定席', displayName: 'A指定席 (1塁/3塁)', category: 'infield', priceRange: '¥3,900〜¥4,300', order: 2 },
      { id: 'mazda_visitor_perf', name: 'ビジターパフォーマンス席', displayName: 'ビジターパフォーマンス席', category: 'outfield', priceRange: '¥2,100〜¥2,300', order: 3 },
    ],
  },
  {
    id: 'escon_field',
    name: 'ES CON FIELD HOKKAIDO',
    shortName: 'エスコンフィールド',
    location: '北海道北広島市Fビレッジ1番地',
    homeTeamId: 'fighters',
    isDome: true,
    order: 8,
    seatTypes: [
      { id: 'escon_diamond', name: 'ダイヤモンドクラブシート', displayName: 'ダイヤモンドクラブシート', category: 'premium', priceRange: '¥12,000〜¥20,000', order: 1 },
      { id: 'escon_main', name: 'MAIN LEVEL 内野指定席', displayName: 'MAIN LEVEL 内野', category: 'infield', priceRange: '¥4,500〜¥6,500', order: 2 },
      { id: 'escon_star', name: 'STAR LEVEL 内野指定席', displayName: 'STAR LEVEL パノラマ', category: 'infield', priceRange: '¥2,500〜¥3,800', order: 3 },
      { id: 'escon_outfield', name: '外野指定席', displayName: '外野指定席 (ビジター)', category: 'outfield', priceRange: '¥2,000〜¥3,000', order: 4 },
    ],
  },
  {
    id: 'kyocera_dome',
    name: '京セラドーム大阪',
    shortName: '京セラドーム',
    location: '大阪府大阪市西区千代崎3-中2-1',
    homeTeamId: 'buffaloes',
    isDome: true,
    order: 9,
    seatTypes: [
      { id: 'kyocera_special', name: '特別指定席', displayName: 'ネット裏特別指定席', category: 'infield', priceRange: '¥5,000〜¥7,000', order: 1 },
      { id: 'kyocera_infield_a', name: '内野指定席A', displayName: '内野指定席A', category: 'infield', priceRange: '¥3,800〜¥4,800', order: 2 },
      { id: 'kyocera_visitor', name: 'ビジター下段指定席', displayName: 'ビジター下段指定席', category: 'outfield', priceRange: '¥2,200〜¥2,800', order: 3 },
    ],
  },
  {
    id: 'paypay_dome',
    name: 'みずほPayPayドーム福岡',
    shortName: 'PayPayドーム',
    location: '福岡県福岡市中央区地行浜2-2-2',
    homeTeamId: 'hawks',
    isDome: true,
    order: 10,
    seatTypes: [
      { id: 'paypay_infield_s', name: '内野S指定席', displayName: '内野S指定席', category: 'infield', priceRange: '¥4,500〜¥6,000', order: 1 },
      { id: 'paypay_infield_a', name: '内野A指定席', displayName: '内野A指定席', category: 'infield', priceRange: '¥3,500〜¥4,500', order: 2 },
      { id: 'paypay_visitor', name: 'ビジター応援指定席', displayName: 'ビジター応援席', category: 'outfield', priceRange: '¥2,000〜¥2,500', order: 3 },
    ],
  },
  {
    id: 'other_stadium',
    name: 'その他球場・地方球場',
    shortName: '地方・その他',
    location: '全国各地',
    isDome: false,
    order: 99,
    seatTypes: [
      { id: 'other_infield', name: '内野指定席', displayName: '内野指定席', category: 'infield', order: 1 },
      { id: 'other_outfield', name: '外野自由席', displayName: '外野自由席', category: 'outfield', order: 2 },
    ],
  },
];

/**
 * マスター外の球場ID（シードデータ・Excel取込が生成する旧ID）の表示名解決。
 * マスター側IDへ寄せられるものはエイリアス、対応マスターが無いものは
 * 表示名フォールバックで解決し、生IDを画面に出さない。
 */
export const STADIUM_ID_ALIASES: Record<string, string> = {
  yokohama: 'yokohama_stadium',
  jingu: 'meiji_jingu',
  mazda: 'mazda_zoom_zoom',
  nagoya_dome: 'vantelin_dome',
  vantelin: 'vantelin_dome',
  tokyo: 'tokyo_dome',
  escon: 'escon_field',
  kyocera: 'kyocera_dome',
  paypay: 'paypay_dome',
  nagoya: 'nagoya_stadium',
};

export const STADIUM_ID_FALLBACKS: Record<string, { name: string; shortName: string; location: string; isDome: boolean }> = {
  // 北谷（中日キャンプ地）。対応マスターが無いため表示名を用意する
  chatan: { name: '北谷公園野球場', shortName: '北谷', location: '沖縄県中頭郡北谷町', isDome: false },
  agre_chatan: { name: '北谷公園野球場', shortName: '北谷', location: '沖縄県中頭郡北谷町', isDome: false },
  okazaki: { name: '岡崎市民球場', shortName: '岡崎', location: '愛知県岡崎市', isDome: false },
  toyohashi: { name: '豊橋市民球場', shortName: '豊橋', location: '愛知県豊橋市', isDome: false },
  gifu_nagaragawa: { name: '長良川球場', shortName: '長良川', location: '岐阜県岐阜市', isDome: false },
  nagaragawa: { name: '長良川球場', shortName: '長良川', location: '岐阜県岐阜市', isDome: false },
  kusanagi: { name: '草薙球場', shortName: '草薙', location: '静岡県静岡市', isDome: false },
  shizuoka_kusanagi: { name: '草薙球場', shortName: '草薙', location: '静岡県静岡市', isDome: false },
  matsuyama: { name: '松山中央公園野球場（坊っちゃんスタジアム）', shortName: '坊っちゃん', location: '愛媛県松山市', isDome: false },
  botchan: { name: '松山中央公園野球場（坊っちゃんスタジアム）', shortName: '坊っちゃん', location: '愛媛県松山市', isDome: false },
  kitakyushu: { name: '北九州市民球場', shortName: '北九州', location: '福岡県北九州市', isDome: false },
  kumamoto: { name: 'リブワーク藤崎台球場', shortName: '藤崎台', location: '熊本県熊本市', isDome: false },
  fujisakidai: { name: 'リブワーク藤崎台球場', shortName: '藤崎台', location: '熊本県熊本市', isDome: false },
  naha: { name: '沖縄セルラースタジアム那覇', shortName: '那覇セルラー', location: '沖縄県那覇市', isDome: false },
  okinawa_cellular: { name: '沖縄セルラースタジアム那覇', shortName: '那覇セルラー', location: '沖縄県那覇市', isDome: false },
  ginowan: { name: '宜野湾市立野球場', shortName: '宜野湾', location: '沖縄県宜野湾市', isDome: false },
  uruma: { name: 'うるま市具志川野球場', shortName: '具志川', location: '沖縄県うるま市', isDome: false },
  koza: { name: 'コザしんきんスタジアム', shortName: 'コザ', location: '沖縄県沖縄市', isDome: false },
  anan: { name: '阿南市野球場', shortName: '阿南', location: '徳島県阿南市', isDome: false },
  kurashiki: { name: '倉敷マスカットスタジアム', shortName: 'マスカット', location: '岡山県倉敷市', isDome: false },
  muscat: { name: '倉敷マスカットスタジアム', shortName: 'マスカット', location: '岡山県倉敷市', isDome: false },
  sunmarine: { name: 'サンマリンスタジアム宮崎', shortName: 'サンマリン', location: '宮崎県宮崎市', isDome: false },
  miyazaki: { name: 'サンマリンスタジアム宮崎', shortName: 'サンマリン', location: '宮崎県宮崎市', isDome: false },
  kagoshima: { name: '平和リース球場', shortName: '平和リース', location: '鹿児島県鹿児島市', isDome: false },
  kamoike: { name: '平和リース球場', shortName: '平和リース', location: '鹿児島県鹿児島市', isDome: false },
};

export const getStadium = (stadiumId: string): Stadium => {
  const direct = STADIUMS.find(s => s.id === stadiumId);
  if (direct) return direct;
  const aliasTarget = STADIUM_ID_ALIASES[stadiumId];
  if (aliasTarget) {
    const aliased = STADIUMS.find(s => s.id === aliasTarget);
    if (aliased) return { ...aliased, id: stadiumId };
  }
  const fallback = STADIUM_ID_FALLBACKS[stadiumId];
  if (fallback) {
    return {
      id: stadiumId,
      name: fallback.name,
      shortName: fallback.shortName,
      location: fallback.location,
      isDome: fallback.isDome,
      order: 900,
      seatTypes: [],
    };
  }
  return {
    id: stadiumId,
    name: stadiumId,
    shortName: stadiumId,
    location: '所在地未設定',
    isDome: false,
    order: 999,
    seatTypes: [],
  };
};

export const getSeatType = (stadiumId: string, seatTypeId?: string) => {
  if (!seatTypeId) return null;
  const stadium = getStadium(stadiumId);
  return stadium.seatTypes.find(st => st.id === seatTypeId) || null;
};
