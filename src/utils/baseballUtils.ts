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

/**
 * 列を整数または文字列から「○列」に整形
 */
export function formatSeatRow(row?: string): string {
  if (!row) return '';
  const trimmed = row.trim();
  if (!trimmed) return '';
  if (/^\d+$/.test(trimmed)) {
    return `${trimmed}列`;
  }
  return trimmed;
}

/**
 * 席番号を整数または文字列から「○番」に整形
 */
export function formatSeatNumber(seatNumber?: string): string {
  if (!seatNumber) return '';
  const trimmed = seatNumber.trim();
  if (!trimmed) return '';
  if (/^\d+$/.test(trimmed)) {
    return `${trimmed}番`;
  }
  return trimmed;
}

/**
 * 試合時間を「○時間○分」形式でフォーマット
 */
export function formatMatchDuration(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}時間${m}分`;
  if (h > 0) return `${h}時間`;
  return `${m}分`;
}

/**
 * 曜日を取得 (火〜日)
 */
export function getMatchDayOfWeek(dateStr?: string): string {
  if (!dateStr) return '不明';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '不明';
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return days[d.getDay()] || '不明';
  } catch {
    return '不明';
  }
}

/**
 * 月を取得 (例: "4月", "9月")
 */
export function getMatchMonth(dateStr?: string): string {
  if (!dateStr) return '未定';
  try {
    const parts = dateStr.split('-');
    if (parts.length < 2) return '未定';
    const m = parseInt(parts[1], 10);
    return `${m}月`;
  } catch {
    return '未定';
  }
}

/**
 * 連勝・連敗・最高記録の集計
 */
export interface StreakAndRecordStats {
  currentStreak: { type: 'win' | 'loss' | 'draw' | 'none'; count: number };
  maxWinStreak: number;
  maxLossStreak: number;
  maxRunsScoredGame: { match: MatchRecord; runs: number } | null;
  maxRunsConcededGame: { match: MatchRecord; runs: number } | null;
  longestGame: { match: MatchRecord; minutes: number } | null;
  shortestGame: { match: MatchRecord; minutes: number } | null;
}

export function calculateStreaksAndRecords(records: MatchRecord[]): StreakAndRecordStats {
  const finishedSorted = [...records]
    .filter(r => r.matchStatus === 'finished')
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  let currentStreakType: 'win' | 'loss' | 'draw' | 'none' = 'none';
  let currentStreakCount = 0;

  let maxWinStreak = 0;
  let tempWin = 0;

  let maxLossStreak = 0;
  let tempLoss = 0;

  let maxRunsScoredGame: { match: MatchRecord; runs: number } | null = null;
  let maxRunsConcededGame: { match: MatchRecord; runs: number } | null = null;
  let longestGame: { match: MatchRecord; minutes: number } | null = null;
  let shortestGame: { match: MatchRecord; minutes: number } | null = null;

  finishedSorted.forEach(m => {
    const res = getMatchResult(m);
    const isHome = m.cheerTeamId === m.homeTeamId;
    const scored = isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
    const conceded = isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);

    // Runs scored records
    if (!maxRunsScoredGame || scored > maxRunsScoredGame.runs) {
      maxRunsScoredGame = { match: m, runs: scored };
    }
    // Runs conceded records
    if (!maxRunsConcededGame || conceded > maxRunsConcededGame.runs) {
      maxRunsConcededGame = { match: m, runs: conceded };
    }

    // Game duration records
    if (m.matchDurationMinutes && m.matchDurationMinutes > 0) {
      if (!longestGame || m.matchDurationMinutes > longestGame.minutes) {
        longestGame = { match: m, minutes: m.matchDurationMinutes };
      }
      if (!shortestGame || m.matchDurationMinutes < shortestGame.minutes) {
        shortestGame = { match: m, minutes: m.matchDurationMinutes };
      }
    }

    // Win streaks
    if (res === 'win') {
      tempWin++;
      if (tempWin > maxWinStreak) maxWinStreak = tempWin;
      tempLoss = 0;
    } else if (res === 'loss') {
      tempLoss++;
      if (tempLoss > maxLossStreak) maxLossStreak = tempLoss;
      tempWin = 0;
    } else {
      tempWin = 0;
      tempLoss = 0;
    }
  });

  // Calculate current streak from the tail
  for (let i = finishedSorted.length - 1; i >= 0; i--) {
    const res = getMatchResult(finishedSorted[i]);
    if (res !== 'win' && res !== 'loss' && res !== 'draw') continue;

    if (currentStreakType === 'none') {
      currentStreakType = res;
      currentStreakCount = 1;
    } else if (currentStreakType === res) {
      currentStreakCount++;
    } else {
      break;
    }
  }

  return {
    currentStreak: { type: currentStreakType, count: currentStreakCount },
    maxWinStreak,
    maxLossStreak,
    maxRunsScoredGame,
    maxRunsConcededGame,
    longestGame,
    shortestGame,
  };
}

/**
 * 点差別・試合展開分析（1点差、逆転、完封、乱打戦、投手戦）
 */
export interface GameFlowStats {
  oneRunGames: { matches: number; wins: number; losses: number; winRate: number | null };
  twoRunGames: { matches: number; wins: number; losses: number; winRate: number | null };
  threePlusRunGames: { matches: number; wins: number; losses: number; winRate: number | null };
  shutoutWins: number;      // 完封勝利（相手0点）
  shutoutLosses: number;    // 完封負け（自軍0点）
  slugfests: number;        // 乱打戦（両軍計10得点以上）
  pitchersDuels: number;    // 投手戦（両軍計3得点以下）
}

export function calculateGameFlowStats(records: MatchRecord[]): GameFlowStats {
  let oneRunM = 0, oneRunW = 0, oneRunL = 0;
  let twoRunM = 0, twoRunW = 0, twoRunL = 0;
  let threePlusM = 0, threePlusW = 0, threePlusL = 0;
  let shutoutWins = 0;
  let shutoutLosses = 0;
  let slugfests = 0;
  let pitchersDuels = 0;

  records.filter(r => r.matchStatus === 'finished' && r.homeScore !== null && r.awayScore !== null).forEach(r => {
    const res = getMatchResult(r);
    const isHome = r.cheerTeamId === r.homeTeamId;
    const scored = isHome ? r.homeScore! : r.awayScore!;
    const conceded = isHome ? r.awayScore! : r.homeScore!;
    const diff = Math.abs(scored - conceded);
    const total = scored + conceded;

    if (diff === 1) {
      oneRunM++;
      if (res === 'win') oneRunW++;
      if (res === 'loss') oneRunL++;
    } else if (diff === 2) {
      twoRunM++;
      if (res === 'win') twoRunW++;
      if (res === 'loss') twoRunL++;
    } else if (diff >= 3) {
      threePlusM++;
      if (res === 'win') threePlusW++;
      if (res === 'loss') threePlusL++;
    }

    if (res === 'win' && conceded === 0) shutoutWins++;
    if (res === 'loss' && scored === 0) shutoutLosses++;

    if (total >= 10) slugfests++;
    if (total <= 3) pitchersDuels++;
  });

  return {
    oneRunGames: {
      matches: oneRunM,
      wins: oneRunW,
      losses: oneRunL,
      winRate: (oneRunW + oneRunL) > 0 ? oneRunW / (oneRunW + oneRunL) : null,
    },
    twoRunGames: {
      matches: twoRunM,
      wins: twoRunW,
      losses: twoRunL,
      winRate: (twoRunW + twoRunL) > 0 ? twoRunW / (twoRunW + twoRunL) : null,
    },
    threePlusRunGames: {
      matches: threePlusM,
      wins: threePlusW,
      losses: threePlusL,
      winRate: (threePlusW + threePlusL) > 0 ? threePlusW / (threePlusW + threePlusL) : null,
    },
    shutoutWins,
    shutoutLosses,
    slugfests,
    pitchersDuels,
  };
}

/**
 * イニング別得点・失点の集計
 */
export function calculateInningDistribution(records: MatchRecord[]): {
  inning: number;
  scored: number;
  conceded: number;
}[] {
  const result = Array.from({ length: 9 }, (_, i) => ({
    inning: i + 1,
    scored: 0,
    conceded: 0,
  }));

  records.filter(r => r.matchStatus === 'finished' && r.innings).forEach(r => {
    const innings = r.innings!;
    const isHome = r.cheerTeamId === r.homeTeamId;
    const cheerInnings = isHome ? innings.home : innings.away;
    const oppInnings = isHome ? innings.away : innings.home;

    cheerInnings.forEach((score, idx) => {
      if (idx < 9 && typeof score === 'number') {
        result[idx].scored += score;
      }
    });

    oppInnings.forEach((score, idx) => {
      if (idx < 9 && typeof score === 'number') {
        result[idx].conceded += score;
      }
    });
  });

  return result;
}


