/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Team, CategoryDef } from '../types/baseball';

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'dragons_1st',
    label: '中日ドラゴンズ 1軍',
    shortLabel: '中日1軍',
    color: '#003882',
    badgeBg: 'bg-blue-900/10 dark:bg-blue-500/20',
    badgeText: 'text-blue-800 dark:text-blue-300',
  },
  {
    id: 'dragons_2nd',
    label: '中日ドラゴンズ 2軍（ウエスタン）',
    shortLabel: '中日2軍',
    color: '#1656b8',
    badgeBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    badgeText: 'text-sky-800 dark:text-sky-300',
  },
  {
    id: 'japan',
    label: '侍ジャパン（日本代表）',
    shortLabel: '日本代表',
    color: '#c9171e',
    badgeBg: 'bg-red-500/10 dark:bg-red-500/20',
    badgeText: 'text-red-800 dark:text-red-300',
  },
  {
    id: 'other',
    label: 'その他野球（他球団・アマ等）',
    shortLabel: 'その他',
    color: '#475569',
    badgeBg: 'bg-slate-500/10 dark:bg-slate-500/20',
    badgeText: 'text-slate-800 dark:text-slate-300',
  },
];

export const TEAMS: Team[] = [
  // --- セントラル・リーグ ---
  {
    id: 'dragons',
    name: '中日ドラゴンズ',
    shortName: '中日',
    code: 'D',
    color: '#003882',
    textColor: '#ffffff',
    league: 'central',
    leagueName: 'セ・リーグ',
    order: 1,
  },
  {
    id: 'tigers',
    name: '阪神タイガース',
    shortName: '阪神',
    code: 'T',
    color: '#FFE200',
    textColor: '#000000',
    league: 'central',
    leagueName: 'セ・リーグ',
    order: 2,
  },
  {
    id: 'giants',
    name: '読売ジャイアンツ',
    shortName: '巨人',
    code: 'G',
    color: '#F97709',
    textColor: '#ffffff',
    league: 'central',
    leagueName: 'セ・リーグ',
    order: 3,
  },
  {
    id: 'baystars',
    name: '横浜DeNAベイスターズ',
    shortName: 'DeNA',
    code: 'DB',
    color: '#0055A5',
    textColor: '#ffffff',
    league: 'central',
    leagueName: 'セ・リーグ',
    order: 4,
  },
  {
    id: 'carp',
    name: '広島東洋カープ',
    shortName: '広島',
    code: 'C',
    color: '#DF0011',
    textColor: '#ffffff',
    league: 'central',
    leagueName: 'セ・リーグ',
    order: 5,
  },
  {
    id: 'swallows',
    name: '東京ヤクルトスワローズ',
    shortName: 'ヤクルト',
    code: 'S',
    color: '#072C61',
    textColor: '#ffffff',
    league: 'central',
    leagueName: 'セ・リーグ',
    order: 6,
  },

  // --- パシフィック・リーグ ---
  {
    id: 'buffaloes',
    name: 'オリックス・バファローズ',
    shortName: 'オリックス',
    code: 'B',
    color: '#0B2240',
    textColor: '#BCA75D',
    league: 'pacific',
    leagueName: 'パ・リーグ',
    order: 7,
  },
  {
    id: 'marines',
    name: '千葉ロッテマリーンズ',
    shortName: 'ロッテ',
    code: 'M',
    color: '#000000',
    textColor: '#ffffff',
    league: 'pacific',
    leagueName: 'パ・リーグ',
    order: 8,
  },
  {
    id: 'hawks',
    name: '福岡ソフトバンクホークス',
    shortName: 'ソフトバンク',
    code: 'H',
    color: '#F5C700',
    textColor: '#000000',
    league: 'pacific',
    leagueName: 'パ・リーグ',
    order: 9,
  },
  {
    id: 'eagles',
    name: '東北楽天ゴールデンイーグルス',
    shortName: '楽天',
    code: 'E',
    color: '#860010',
    textColor: '#ffffff',
    league: 'pacific',
    leagueName: 'パ・リーグ',
    order: 10,
  },
  {
    id: 'fighters',
    name: '北海道日本ハムファイターズ',
    shortName: '日本ハム',
    code: 'F',
    color: '#003E7E',
    textColor: '#ffffff',
    league: 'pacific',
    leagueName: 'パ・リーグ',
    order: 11,
  },
  {
    id: 'lions',
    name: '埼玉西武ライオンズ',
    shortName: '西武',
    code: 'L',
    color: '#13294B',
    textColor: '#ffffff',
    league: 'pacific',
    leagueName: 'パ・リーグ',
    order: 12,
  },

  // --- ファーム（2軍）---
  {
    id: 'dragons_farm',
    name: '中日ドラゴンズ（2軍）',
    shortName: '中日2軍',
    code: 'D2',
    color: '#1656b8',
    textColor: '#ffffff',
    league: 'western',
    leagueName: 'ウエスタン・リーグ',
    order: 13,
  },
  {
    id: 'hayate',
    name: 'くふうハヤテベンチャーズ静岡',
    shortName: 'ハヤテ',
    code: 'HY',
    color: '#008080',
    textColor: '#ffffff',
    league: 'western',
    leagueName: 'ウエスタン・リーグ',
    order: 14,
  },
  {
    id: 'tigers_farm',
    name: '阪神タイガース（2軍）',
    shortName: '阪神2軍',
    code: 'T2',
    color: '#FFE200',
    textColor: '#000000',
    league: 'western',
    leagueName: 'ウエスタン・リーグ',
    order: 15,
  },
  {
    id: 'hawks_farm',
    name: '福岡ソフトバンクホークス（2軍）',
    shortName: 'ソフトバンク2軍',
    code: 'H2',
    color: '#F5C700',
    textColor: '#000000',
    league: 'western',
    leagueName: 'ウエスタン・リーグ',
    order: 16,
  },
  {
    id: 'buffaloes_farm',
    name: 'オリックス・バファローズ（2軍）',
    shortName: 'オリックス2軍',
    code: 'B2',
    color: '#0B2240',
    textColor: '#BCA75D',
    league: 'western',
    leagueName: 'ウエスタン・リーグ',
    order: 17,
  },
  {
    id: 'carp_farm',
    name: '広島東洋カープ（2軍）',
    shortName: '広島2軍',
    code: 'C2',
    color: '#DF0011',
    textColor: '#ffffff',
    league: 'western',
    leagueName: 'ウエスタン・リーグ',
    order: 18,
  },

  // --- 侍ジャパン / 国際代表 ---
  {
    id: 'samurai_japan',
    name: '侍ジャパン（日本代表）',
    shortName: '侍ジャパン',
    code: 'JPN',
    color: '#B31B1B',
    textColor: '#ffffff',
    league: 'japan',
    leagueName: '日本代表',
    order: 19,
  },
  {
    id: 'team_korea',
    name: '韓国代表',
    shortName: '韓国',
    code: 'KOR',
    color: '#003478',
    textColor: '#ffffff',
    league: 'japan',
    leagueName: '国際代表',
    order: 20,
  },
  {
    id: 'team_taiwan',
    name: 'チャイニーズ・タイペイ代表',
    shortName: '台湾',
    code: 'TPE',
    color: '#002F6C',
    textColor: '#ffffff',
    league: 'japan',
    leagueName: '国際代表',
    order: 21,
  },
  {
    id: 'team_usa',
    name: 'アメリカ代表',
    shortName: 'アメリカ',
    code: 'USA',
    color: '#002868',
    textColor: '#ffffff',
    league: 'japan',
    leagueName: '国際代表',
    order: 22,
  },
  {
    id: 'team_australia',
    name: 'オーストラリア代表',
    shortName: '豪州',
    code: 'AUS',
    color: '#00843D',
    textColor: '#FFCD00',
    league: 'japan',
    leagueName: '国際代表',
    order: 23,
  },
  {
    id: 'other_team',
    name: 'その他の球団・クラブ',
    shortName: 'その他',
    code: 'OTH',
    color: '#64748b',
    textColor: '#ffffff',
    league: 'other',
    leagueName: 'その他',
    order: 99,
  },
];

/**
 * マスター外ID（シードデータ・Excel取込が生成する旧ID／代表チームID）の
 * 表示名フォールバック。生IDを画面に出さないための解決表。
 * 代表チームは日本語の国名で表示する。
 */
export const TEAM_ID_FALLBACKS: Record<string, { name: string; shortName: string; code: string; color: string; textColor: string }> = {
  // シード側の日本代表ID（マスターの samurai_japan とは別ID）
  japan_national: { name: '日本', shortName: '日本', code: 'JPN', color: '#B31B1B', textColor: '#ffffff' },
  japan: { name: '日本', shortName: '日本', code: 'JPN', color: '#B31B1B', textColor: '#ffffff' },
  // シード側の対戦相手ID
  australia: { name: 'オーストラリア', shortName: 'オーストラリア', code: 'AUS', color: '#00843D', textColor: '#FFCD00' },
  czech: { name: 'チェコ', shortName: 'チェコ', code: 'CZE', color: '#11457E', textColor: '#ffffff' },
  czechia: { name: 'チェコ', shortName: 'チェコ', code: 'CZE', color: '#11457E', textColor: '#ffffff' },
  // その他の代表チーム（国名表示）
  korea: { name: '韓国', shortName: '韓国', code: 'KOR', color: '#003478', textColor: '#ffffff' },
  south_korea: { name: '韓国', shortName: '韓国', code: 'KOR', color: '#003478', textColor: '#ffffff' },
  taiwan: { name: 'チャイニーズ・タイペイ', shortName: '台湾', code: 'TPE', color: '#002F6C', textColor: '#ffffff' },
  chinese_taipei: { name: 'チャイニーズ・タイペイ', shortName: '台湾', code: 'TPE', color: '#002F6C', textColor: '#ffffff' },
  usa: { name: 'アメリカ', shortName: 'アメリカ', code: 'USA', color: '#002868', textColor: '#ffffff' },
  united_states: { name: 'アメリカ', shortName: 'アメリカ', code: 'USA', color: '#002868', textColor: '#ffffff' },
  china: { name: '中国', shortName: '中国', code: 'CHN', color: '#DE2910', textColor: '#FFDE00' },
  mexico: { name: 'メキシコ', shortName: 'メキシコ', code: 'MEX', color: '#006847', textColor: '#ffffff' },
  cuba: { name: 'キューバ', shortName: 'キューバ', code: 'CUB', color: '#002A8F', textColor: '#ffffff' },
  dominican_republic: { name: 'ドミニカ共和国', shortName: 'ドミニカ', code: 'DOM', color: '#002D62', textColor: '#ffffff' },
  dominicana: { name: 'ドミニカ共和国', shortName: 'ドミニカ', code: 'DOM', color: '#002D62', textColor: '#ffffff' },
  puerto_rico: { name: 'プエルトリコ', shortName: 'プエルトリコ', code: 'PUR', color: '#0050A4', textColor: '#ffffff' },
  venezuela: { name: 'ベネズエラ', shortName: 'ベネズエラ', code: 'VEN', color: '#FCD116', textColor: '#00247D' },
  canada: { name: 'カナダ', shortName: 'カナダ', code: 'CAN', color: '#FF0000', textColor: '#ffffff' },
  netherlands: { name: 'オランダ', shortName: 'オランダ', code: 'NED', color: '#FF6600', textColor: '#ffffff' },
  italy: { name: 'イタリア', shortName: 'イタリア', code: 'ITA', color: '#0064AA', textColor: '#ffffff' },
  israel: { name: 'イスラエル', shortName: 'イスラエル', code: 'ISR', color: '#0038b8', textColor: '#ffffff' },
  great_britain: { name: 'イギリス', shortName: 'イギリス', code: 'GBR', color: '#012169', textColor: '#ffffff' },
  germany: { name: 'ドイツ', shortName: 'ドイツ', code: 'GER', color: '#000000', textColor: '#FFCE00' },
  colombia: { name: 'コロンビア', shortName: 'コロンビア', code: 'COL', color: '#FCD116', textColor: '#003893' },
  panama: { name: 'パナマ', shortName: 'パナマ', code: 'PAN', color: '#005293', textColor: '#ffffff' },
  nicaragua: { name: 'ニカラグア', shortName: 'ニカラグア', code: 'NCA', color: '#0067C6', textColor: '#ffffff' },
  new_zealand: { name: 'ニュージーランド', shortName: 'ニュージーランド', code: 'NZL', color: '#00247D', textColor: '#ffffff' },
  philippines: { name: 'フィリピン', shortName: 'フィリピン', code: 'PHI', color: '#0038A8', textColor: '#ffffff' },
};

/** マスター側IDへのエイリアス（表示はマスター定義を使う） */
export const TEAM_ID_ALIASES: Record<string, string> = {
  team_japan: 'samurai_japan',
  samurai: 'samurai_japan',
  team_australia_alias: 'team_australia',
};

export const getTeam = (teamId: string): Team => {
  const direct = TEAMS.find(t => t.id === teamId);
  if (direct) return direct;
  const aliasTarget = TEAM_ID_ALIASES[teamId];
  if (aliasTarget) {
    const aliased = TEAMS.find(t => t.id === aliasTarget);
    if (aliased) return { ...aliased, id: teamId };
  }
  const fallback = TEAM_ID_FALLBACKS[teamId];
  if (fallback) {
    return {
      id: teamId,
      name: fallback.name,
      shortName: fallback.shortName,
      code: fallback.code,
      color: fallback.color,
      textColor: fallback.textColor,
      league: 'japan',
      leagueName: '国際代表',
      order: 900,
    };
  }
  return {
    id: teamId,
    name: teamId,
    shortName: teamId,
    code: teamId.slice(0, 2).toUpperCase(),
    color: '#64748b',
    textColor: '#ffffff',
    league: 'other',
    leagueName: 'その他',
    order: 999,
  };
};
