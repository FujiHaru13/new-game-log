/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryId = 'dragons_1st' | 'dragons_2nd' | 'japan' | 'other';

export interface CategoryDef {
  id: CategoryId;
  label: string;
  shortLabel: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export type MatchType = 
  | 'official'       // 公式戦（ペナントレース）
  | 'interleague'    // 交流戦
  | 'open'           // オープン戦
  | 'climax'         // クライマックスシリーズ
  | 'nippon_series'  // 日本シリーズ
  | 'practice'       // 練習試合・教育リーグ
  | 'international'  // 国際試合・壮行試合
  | 'other';         // その他

export type MatchStatus = 'scheduled' | 'finished' | 'cancelled' | 'in_progress';
export type WatchStatus = 'watched' | 'scheduled' | 'cancelled';
export type MatchResult = 'win' | 'loss' | 'draw' | 'cancelled' | 'scheduled';

export type TicketStatus = 
  | 'release_waiting'  // 発売待ち
  | 'plan_to_buy'      // 購入予定
  | 'purchased'        // 購入済み
  | 'ticket_waiting'   // 発券待ち
  | 'ticketed'         // 発券済み
  | 'cancelled_refund';// キャンセル・払い戻し

export interface SplitPayment {
  id: string;
  title: string;
  amount: number;
  paidDate?: string;
  memo?: string;
}

export interface InningScore {
  home: (number | 'X' | null)[];
  away: (number | null)[];
  homeHits?: number | null;
  awayHits?: number | null;
  homeErrors?: number | null;
  awayErrors?: number | null;
}

export interface PitcherInfo {
  homeStarter?: string;
  awayStarter?: string;
  winningPitcher?: string;
  losingPitcher?: string;
  savePitcher?: string;
}

export interface SeatInfo {
  seatTypeId?: string;
  seatTypeName?: string; // fallback or custom name
  area?: string;         // 例: 内野A 1塁側, バックネット裏, レフト外野
  row?: string;          // 例: 15列, 23列
  seatNumber?: string;   // 例: 34番, 120-121番
}

export interface CostInfo {
  totalPrice?: number | null;      // チケット総額 (0とnullを区別)
  myExpense?: number | null;       // 自己負担額 (0とnullを区別)
  paymentDate?: string;
  paymentDestination?: string;    // ドラチケ, チケットぴあ, 球場窓口等
  paymentMethod?: string;         // クレジットカード, PayPay, 現金等
  memo?: string;
  splits: SplitPayment[];
  refundAmount?: number | null;   // 中止時の返金金額
  refundStatus?: 'none' | 'pending' | 'completed';
}

export interface TicketManagement {
  id?: string;
  status: TicketStatus;
  releaseDate?: string;       // チケット発売日
  purchaseDate?: string;      // 購入日
  issueDate?: string;         // 発券日
  paymentDeadline?: string;   // 支払い期限
  seatTypeName?: string;
  seatArea?: string;
  seatRow?: string;
  seatNumber?: string;
  ticketType?: string;        // 電子チケット, 紙チケット, QRコード, FC招待券等
  quantity?: number;          // 枚数
  vendor?: string;            // ドラチケ, ぴあ, ローチケ, イープラス等
  notes?: string;
}

export interface MatchLink {
  title: string;
  url: string;
}

export interface MatchRecord {
  id: string;
  // --- 試合基本情報 ---
  date: string;               // YYYY-MM-DD
  time?: string;              // HH:mm (e.g. "18:00")
  isDateUnknown: boolean;     // 日付不明フラグ
  homeTeamId: string;
  awayTeamId: string;
  stadiumId: string;
  stadiumCustom?: string;     // 球場マスタ外の場合
  matchType: MatchType;
  matchStatus: MatchStatus;
  homeScore: number | null;   // 0とnullを区別
  awayScore: number | null;   // 0とnullを区別
  isScoreConfirmed: boolean;
  matchDurationMinutes?: number | null; // 試合時間（分）
  innings?: InningScore;
  pitchers?: PitcherInfo;
  homeRuns?: string[];        // 本塁打リスト
  events?: string;            // 試合イベント・見どころ
  notes?: string;             // 試合備考
  links?: MatchLink[];

  // --- 観戦情報 ---
  watchStatus: WatchStatus;
  cheerTeamId: string;        // 初期値: 'dragons' (中日)
  categories: CategoryId[];   // 複数カテゴリ所属
  primaryCategory: CategoryId;// 主カテゴリ
  seatInfo: SeatInfo;
  companions?: string;        // 同行者
  watchMemo?: string;         // 観戦メモ・日記
  costInfo: CostInfo;
  ticketInfo: TicketManagement;

  createdAt: string;
  updatedAt: string;
}

// チームマスタ
export interface Team {
  id: string;
  name: string;           // 正式名称: 中日ドラゴンズ
  shortName: string;      // 略称: 中日
  code: string;           // アルファベット: D
  color: string;          // 球団メインカラー: #003882
  textColor: string;      // 文字色: #FFFFFF
  league: 'central' | 'pacific' | 'western' | 'eastern' | 'japan' | 'other';
  leagueName: string;     // セントラル・リーグ etc.
  order: number;
}

// 球場マスタ
export interface Stadium {
  id: string;
  name: string;           // 正式名称: バンテリンドーム ナゴヤ
  shortName: string;      // 略称: バテド / ナゴド
  location: string;       // 所在地: 愛知県名古屋市東区
  homeTeamId?: string;    // 本拠地チーム
  isDome: boolean;        // ドーム球場フラグ
  order: number;
  seatTypes: SeatTypeMaster[];
}

// 席種マスタ
export interface SeatTypeMaster {
  id: string;
  name: string;           // 席種名: 内野S指定席
  displayName: string;    // 表示名: 内野S (1塁側)
  category: 'infield' | 'outfield' | 'premium' | 'box' | 'other';
  priceRange?: string;    // 参考価格帯: ¥4,500〜¥6,000
  order: number;
}
