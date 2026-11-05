/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MatchRecord, MatchResult, CategoryId } from '../types/baseball';
import { getTeam } from '../data/teams';
import { getStadium } from '../data/stadiums';

/**
 * 観戦した応援チーム視点での試合結果を判定する
 */
export function getMatchResult(match: MatchRecord): MatchResult {
  if (match.matchStatus === 'cancelled' || match.watchStatus === 'cancelled') {
    return 'cancelled';
  }

  if (match.matchStatus !== 'finished' || match.homeScore === null || match.awayScore === null) {
    return 'scheduled';
  }

  const isCheerHome = match.cheerTeamId === match.homeTeamId;
  const isCheerAway = match.cheerTeamId === match.awayTeamId;

  if (isCheerHome) {
    if (match.homeScore > match.awayScore) return 'win';
    if (match.homeScore < match.awayScore) return 'loss';
    return 'draw';
  } else if (isCheerAway) {
    if (match.awayScore > match.homeScore) return 'win';
    if (match.awayScore < match.homeScore) return 'loss';
    return 'draw';
  } else {
    // 応援チームが第三者の場合（ホーム勝利を基準とする）
    if (match.homeScore > match.awayScore) return 'win';
    if (match.homeScore < match.awayScore) return 'loss';
    return 'draw';
  }
}

/**
 * 勝率の計算：勝率 = 勝利数 ÷（勝利数 + 敗戦数）※引き分けは除外
 */
export function calculateWinRate(wins: number, losses: number): number | null {
  const decisions = wins + losses;
  if (decisions === 0) return null;
  return wins / decisions;
}

/**
 * 勝率のフォーマット表示（例: .625, 1.000, .000）
 */
export function formatWinRate(rate: number | null): string {
  if (rate === null) return '-';
  if (rate >= 1) return '1.000';
  return rate.toFixed(3).replace(/^0\./, '.');
}

/**
 * 日本円のフォーマット表示
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-';
  return `¥${amount.toLocaleString('ja-JP')}`;
}

/**
 * 日付の日本語フォーマット (例: 2026年9月12日(土))
 */
export function formatMatchDate(dateStr: string, isDateUnknown = false): string {
  if (isDateUnknown || !dateStr) return '日付未定';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dayOfWeek = dayNames[date.getDay()];
    return `${parts[0]}年${parseInt(parts[1], 10)}月${parseInt(parts[2], 10)}日(${dayOfWeek})`;
  } catch {
    return dateStr;
  }
}

/**
 * 短い日付表示 (例: 9/12(土))
 */
export function formatShortDate(dateStr: string, isDateUnknown = false): string {
  if (isDateUnknown || !dateStr) return '未定';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dayOfWeek = dayNames[date.getDay()];
    return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}(${dayOfWeek})`;
  } catch {
    return dateStr;
  }
}

export interface AggregatedStats {
  totalMatches: number;
  finishedMatches: number;
  wins: number;
  losses: number;
  draws: number;
  cancelled: number;
  scheduled: number;
  winRate: number | null;
  totalRunsScored: number;
  totalRunsConceded: number;
  avgRunsScored: number;
  avgRunsConceded: number;
  avgRunDiff: number;
  totalCost: number;
  totalMyExpense: number;
  avgMyExpense: number;
}

/**
 * 観戦記録群の集計関数
 */
export function aggregateRecords(records: MatchRecord[]): AggregatedStats {
  let finishedMatches = 0;
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let cancelled = 0;
  let scheduled = 0;

  let totalRunsScored = 0;
  let totalRunsConceded = 0;
  let scoreMatchesCount = 0;

  let totalCost = 0;
  let totalMyExpense = 0;
  let expenseEntriesCount = 0;

  records.forEach(rec => {
    // 費用
    if (rec.costInfo.totalPrice !== null && rec.costInfo.totalPrice !== undefined) {
      totalCost += rec.costInfo.totalPrice;
    }
    if (rec.costInfo.myExpense !== null && rec.costInfo.myExpense !== undefined) {
      totalMyExpense += rec.costInfo.myExpense;
      expenseEntriesCount++;
    }

    if (rec.watchStatus === 'cancelled' || rec.matchStatus === 'cancelled') {
      cancelled++;
      return;
    }

    if (rec.watchStatus === 'scheduled' || rec.matchStatus === 'scheduled') {
      scheduled++;
      return;
    }

    if (rec.matchStatus === 'finished') {
      finishedMatches++;
      const result = getMatchResult(rec);
      if (result === 'win') wins++;
      else if (result === 'loss') losses++;
      else if (result === 'draw') draws++;

      // 得失点計算（応援チーム視点）
      if (rec.homeScore !== null && rec.awayScore !== null) {
        scoreMatchesCount++;
        const isHome = rec.cheerTeamId === rec.homeTeamId;
        const scored = isHome ? rec.homeScore : rec.awayScore;
        const conceded = isHome ? rec.awayScore : rec.homeScore;
        totalRunsScored += scored;
        totalRunsConceded += conceded;
      }
    }
  });

  const winRate = calculateWinRate(wins, losses);
  const avgRunsScored = scoreMatchesCount > 0 ? Number((totalRunsScored / scoreMatchesCount).toFixed(2)) : 0;
  const avgRunsConceded = scoreMatchesCount > 0 ? Number((totalRunsConceded / scoreMatchesCount).toFixed(2)) : 0;
  const avgRunDiff = scoreMatchesCount > 0 ? Number(((totalRunsScored - totalRunsConceded) / scoreMatchesCount).toFixed(2)) : 0;
  const avgMyExpense = expenseEntriesCount > 0 ? Math.round(totalMyExpense / expenseEntriesCount) : 0;

  return {
    totalMatches: records.length,
    finishedMatches,
    wins,
    losses,
    draws,
    cancelled,
    scheduled,
    winRate,
    totalRunsScored,
    totalRunsConceded,
    avgRunsScored,
    avgRunsConceded,
    avgRunDiff,
    totalCost,
    totalMyExpense,
    avgMyExpense,
  };
}

/**
 * 試合の相手チームを取得
 */
export function getOpponentTeam(match: MatchRecord) {
  if (match.cheerTeamId === match.homeTeamId) {
    return getTeam(match.awayTeamId);
  }
  return getTeam(match.homeTeamId);
}

/**
 * 試合の球場表示名を取得
 */
export function getStadiumDisplayName(match: MatchRecord): string {
  if (match.stadiumCustom) return match.stadiumCustom;
  const stadium = getStadium(match.stadiumId);
  return stadium.name || match.stadiumId;
}

/**
 * 試合種別の日本語ラベル
 */
export function getMatchTypeName(type: MatchRecord['matchType']): string {
  const map: Record<MatchRecord['matchType'], string> = {
    official: '公式戦',
    interleague: '交流戦',
    open: 'オープン戦',
    climax: 'CS',
    nippon_series: '日本シリーズ',
    practice: '練習・ファーム',
    international: '国際大会',
    other: 'その他',
  };
  return map[type] || '試合';
}
