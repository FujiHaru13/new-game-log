/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useBaseball } from '../../context/BaseballContext';
import {
  aggregateRecords,
  formatWinRate,
  formatCurrency,
  getMatchResult,
  getOpponentTeam,
  getStadiumDisplayName,
  getMatchDayOfWeek,
  getMatchMonth,
  calculateStreaksAndRecords,
  calculateGameFlowStats,
  calculateInningDistribution,
  formatMatchDuration,
} from '../../utils/baseballUtils';
import { CATEGORIES, TEAMS, getTeam } from '../../data/teams';
import { TeamLogo } from '../common/TeamLogo';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Calendar,
  Sun,
  Moon,
  Coins,
  Shield,
  Award,
  Flame,
  Users,
  Armchair,
  Clock,
  Zap,
  Layers,
} from 'lucide-react';
import { MatchRecord, CategoryId } from '../../types/baseball';

type AnalysisTab =
  | 'overview'
  | 'yearly'
  | 'year_month'
  | 'opponents'
  | 'stadiums'
  | 'pitchers'
  | 'timing'
  | 'seats_companions'
  | 'game_flow'
  | 'expenses';

export const StatsDashboard: React.FC = () => {
  const { records, availableYears } = useBaseball();

  // Active view tab
  const [activeTab, setActiveTab] = useState<AnalysisTab>('overview');

  // 統計専用フィルタ: カテゴリ（中日1軍/中日2軍/侍ジャパン。その他 other は常時除外）と
  // 年度（全期間＋各年度）。両フィルタは併用可能。初期カテゴリは中日1軍。
  // 年度フィルタは年度別推移タブ（yearly）には適用しない。
  const [statsCategory, setStatsCategory] = useState<CategoryId>('dragons_1st');
  const [statsYear, setStatsYear] = useState<string>('all');
  const effectiveYear = activeTab === 'yearly' ? 'all' : statsYear;

  const matchesStatsCategory = (r: MatchRecord) =>
    r.categories.includes(statsCategory) || r.primaryCategory === statsCategory;

  // Filtered records based on stats filters
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (effectiveYear !== 'all' && (!r.date || !r.date.startsWith(effectiveYear))) {
        return false;
      }
      if (!matchesStatsCategory(r)) {
        return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, effectiveYear, statsCategory]);

  const stats = useMemo(() => aggregateRecords(filteredRecords), [filteredRecords]);
  const streaksAndRecords = useMemo(() => calculateStreaksAndRecords(filteredRecords), [filteredRecords]);
  const gameFlow = useMemo(() => calculateGameFlowStats(filteredRecords), [filteredRecords]);
  const inningDistribution = useMemo(() => calculateInningDistribution(filteredRecords), [filteredRecords]);

  // 1. カテゴリ別成績（1軍と2軍の明確な比較！）
  const categoryStats = useMemo(() => {
    return CATEGORIES.filter(cat => cat.id !== 'other').map(cat => {
      const catRecords = records.filter(r => {
        if (statsYear !== 'all' && (!r.date || !r.date.startsWith(statsYear))) return false;
        return r.categories.includes(cat.id) || r.primaryCategory === cat.id;
      });
      return {
        category: cat,
        ...aggregateRecords(catRecords),
      };
    });
  }, [records, statsYear]);

  // 2. 年度別集計（Excelの年度別シート完全準拠）
  const yearlyStats = useMemo(() => {
    const map = new Map<string, { matches: number; wins: number; losses: number; draws: number; runsFor: number; runsAgainst: number; cost: number; dragons1st: number; dragons2nd: number }>();
    records.filter(r => r.matchStatus === 'finished' && matchesStatsCategory(r)).forEach(r => {
      const year = r.date ? r.date.slice(0, 4) : '日付未定';
      const curr = map.get(year) || { matches: 0, wins: 0, losses: 0, draws: 0, runsFor: 0, runsAgainst: 0, cost: 0, dragons1st: 0, dragons2nd: 0 };
      curr.matches++;
      const res = getMatchResult(r);
      if (res === 'win') curr.wins++;
      else if (res === 'loss') curr.losses++;
      else if (res === 'draw') curr.draws++;

      if (r.categories.includes('dragons_1st') || r.primaryCategory === 'dragons_1st') curr.dragons1st++;
      if (r.categories.includes('dragons_2nd') || r.primaryCategory === 'dragons_2nd') curr.dragons2nd++;

      if (r.homeScore !== null && r.awayScore !== null) {
        const isHome = r.cheerTeamId === r.homeTeamId;
        curr.runsFor += isHome ? r.homeScore : r.awayScore;
        curr.runsAgainst += isHome ? r.awayScore : r.homeScore;
      }
      if (r.costInfo.myExpense) curr.cost += r.costInfo.myExpense;
      map.set(year, curr);
    });

    return Array.from(map.entries())
      .map(([year, d]) => {
        const dec = d.wins + d.losses;
        return {
          year,
          ...d,
          winRate: dec > 0 ? d.wins / dec : null,
          avgRunsFor: d.matches > 0 ? (d.runsFor / d.matches).toFixed(1) : '-',
          avgRunsAgainst: d.matches > 0 ? (d.runsAgainst / d.matches).toFixed(1) : '-',
        };
      })
      .sort((a, b) => b.year.localeCompare(a.year));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, statsCategory]);

  // 2b. 年度×月マトリクス（対象は全レコード。カテゴリ・年度フィルタに連動しない）
  const yearMonthMatrix = useMemo(() => {
    const months = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const years = [...availableYears].sort((a, b) => b.localeCompare(a));
    const counts = new Map<string, number[]>();
    years.forEach(y => counts.set(y, months.map(() => 0)));
    records.forEach(r => {
      if (!r.date || r.isDateUnknown) return;
      const parts = r.date.split('-');
      if (parts.length < 2) return;
      const row = counts.get(parts[0]);
      if (!row) return;
      const idx = months.indexOf(parseInt(parts[1], 10));
      if (idx >= 0) row[idx]++;
    });
    return {
      months,
      rows: years.map(year => {
        const rowCounts = counts.get(year) || months.map(() => 0);
        return { year, counts: rowCounts, total: rowCounts.reduce((a, b) => a + b, 0) };
      }),
    };
  }, [records, availableYears]);

  // 3. 対戦相手別成績
  const opponentStats = useMemo(() => {
    const map = new Map<string, { wins: number; losses: number; draws: number; matches: number; runsFor: number; runsAgainst: number }>();
    filteredRecords.filter(r => r.matchStatus === 'finished').forEach(r => {
      const opp = getOpponentTeam(r);
      const curr = map.get(opp.id) || { wins: 0, losses: 0, draws: 0, matches: 0, runsFor: 0, runsAgainst: 0 };
      curr.matches++;
      const res = getMatchResult(r);
      if (res === 'win') curr.wins++;
      else if (res === 'loss') curr.losses++;
      else if (res === 'draw') curr.draws++;

      if (r.homeScore !== null && r.awayScore !== null) {
        const isHome = r.cheerTeamId === r.homeTeamId;
        curr.runsFor += isHome ? r.homeScore : r.awayScore;
        curr.runsAgainst += isHome ? r.awayScore : r.homeScore;
      }
      map.set(opp.id, curr);
    });

    return Array.from(map.entries()).map(([teamId, data]) => {
      const team = getTeam(teamId);
      const decisions = data.wins + data.losses;
      return {
        team,
        ...data,
        winRate: decisions > 0 ? data.wins / decisions : null,
        runDiff: data.runsFor - data.runsAgainst,
      };
    }).sort((a, b) => b.matches - a.matches);
  }, [filteredRecords]);

  // 4. 球場別成績
  const stadiumStats = useMemo(() => {
    const map = new Map<string, { wins: number; losses: number; draws: number; matches: number; myExpense: number }>();
    filteredRecords.filter(r => r.matchStatus === 'finished').forEach(r => {
      const stdName = getStadiumDisplayName(r);
      const curr = map.get(stdName) || { wins: 0, losses: 0, draws: 0, matches: 0, myExpense: 0 };
      curr.matches++;
      const res = getMatchResult(r);
      if (res === 'win') curr.wins++;
      else if (res === 'loss') curr.losses++;
      else if (res === 'draw') curr.draws++;
      if (r.costInfo.myExpense) curr.myExpense += r.costInfo.myExpense;
      map.set(stdName, curr);
    });

    return Array.from(map.entries()).map(([name, data]) => {
      const decisions = data.wins + data.losses;
      return {
        name,
        ...data,
        winRate: decisions > 0 ? data.wins / decisions : null,
      };
    }).sort((a, b) => b.matches - a.matches);
  }, [filteredRecords]);

  // 5. 曜日別成績 (火〜日)
  const dayOfWeekStats = useMemo(() => {
    const daysOrder = ['火', '水', '木', '金', '土', '日', '月'];
    const map = new Map<string, { matches: number; wins: number; losses: number; draws: number }>();
    daysOrder.forEach(d => map.set(d, { matches: 0, wins: 0, losses: 0, draws: 0 }));

    filteredRecords.filter(r => r.matchStatus === 'finished').forEach(r => {
      const dow = getMatchDayOfWeek(r.date);
      const curr = map.get(dow) || { matches: 0, wins: 0, losses: 0, draws: 0 };
      curr.matches++;
      const res = getMatchResult(r);
      if (res === 'win') curr.wins++;
      else if (res === 'loss') curr.losses++;
      else if (res === 'draw') curr.draws++;
      map.set(dow, curr);
    });

    return daysOrder.map(day => {
      const d = map.get(day)!;
      const dec = d.wins + d.losses;
      return {
        day: `${day}曜日`,
        ...d,
        winRate: dec > 0 ? d.wins / dec : null,
      };
    });
  }, [filteredRecords]);

  // 6. 月別成績 (3月〜11月)
  const monthlyStats = useMemo(() => {
    const months = ['3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月'];
    const map = new Map<string, { matches: number; wins: number; losses: number; draws: number }>();
    months.forEach(m => map.set(m, { matches: 0, wins: 0, losses: 0, draws: 0 }));

    filteredRecords.filter(r => r.matchStatus === 'finished').forEach(r => {
      const m = getMatchMonth(r.date);
      if (map.has(m)) {
        const curr = map.get(m)!;
        curr.matches++;
        const res = getMatchResult(r);
        if (res === 'win') curr.wins++;
        else if (res === 'loss') curr.losses++;
        else if (res === 'draw') curr.draws++;
        map.set(m, curr);
      }
    });

    return months.map(month => {
      const d = map.get(month)!;
      const dec = d.wins + d.losses;
      return {
        month,
        ...d,
        winRate: dec > 0 ? d.wins / dec : null,
      };
    });
  }, [filteredRecords]);

  // 7. ホーム / ビジター別成績
  const homeAwayStats = useMemo(() => {
    let homeWins = 0, homeLosses = 0, homeDraws = 0, homeMatches = 0;
    let awayWins = 0, awayLosses = 0, awayDraws = 0, awayMatches = 0;

    filteredRecords.filter(r => r.matchStatus === 'finished').forEach(r => {
      const isHome = r.cheerTeamId === r.homeTeamId;
      const res = getMatchResult(r);
      if (isHome) {
        homeMatches++;
        if (res === 'win') homeWins++;
        else if (res === 'loss') homeLosses++;
        else if (res === 'draw') homeDraws++;
      } else {
        awayMatches++;
        if (res === 'win') awayWins++;
        else if (res === 'loss') awayLosses++;
        else if (res === 'draw') awayDraws++;
      }
    });

    return {
      home: {
        matches: homeMatches,
        wins: homeWins,
        losses: homeLosses,
        draws: homeDraws,
        winRate: (homeWins + homeLosses) > 0 ? homeWins / (homeWins + homeLosses) : null,
      },
      away: {
        matches: awayMatches,
        wins: awayWins,
        losses: awayLosses,
        draws: awayDraws,
        winRate: (awayWins + awayLosses) > 0 ? awayWins / (awayWins + awayLosses) : null,
      },
    };
  }, [filteredRecords]);

  // 8. デーゲーム / ナイター別成績
  const dayNightStats = useMemo(() => {
    let dayWins = 0, dayLosses = 0, dayMatches = 0;
    let nightWins = 0, nightLosses = 0, nightMatches = 0;

    filteredRecords.filter(r => r.matchStatus === 'finished').forEach(r => {
      const res = getMatchResult(r);
      const isDay = r.time && parseInt(r.time.split(':')[0], 10) < 17;
      if (isDay) {
        dayMatches++;
        if (res === 'win') dayWins++;
        else if (res === 'loss') dayLosses++;
      } else {
        nightMatches++;
        if (res === 'win') nightWins++;
        else if (res === 'loss') nightLosses++;
      }
    });

    return {
      day: { matches: dayMatches, wins: dayWins, losses: dayLosses, winRate: (dayWins + dayLosses) > 0 ? dayWins / (dayWins + dayLosses) : null },
      night: { matches: nightMatches, wins: nightWins, losses: nightLosses, winRate: (nightWins + nightLosses) > 0 ? nightWins / (nightWins + nightLosses) : null },
    };
  }, [filteredRecords]);

  // 9. 先発投手別観戦成績
  const starterStats = useMemo(() => {
    const map = new Map<string, { wins: number; losses: number; draws: number; matches: number }>();
    filteredRecords.filter(r => r.matchStatus === 'finished').forEach(r => {
      const isHome = r.cheerTeamId === r.homeTeamId;
      const starter = isHome ? r.pitchers?.homeStarter : r.pitchers?.awayStarter;
      if (starter && starter.trim()) {
        const curr = map.get(starter.trim()) || { wins: 0, losses: 0, draws: 0, matches: 0 };
        curr.matches++;
        const res = getMatchResult(r);
        if (res === 'win') curr.wins++;
        else if (res === 'loss') curr.losses++;
        else if (res === 'draw') curr.draws++;
        map.set(starter.trim(), curr);
      }
    });

    return Array.from(map.entries()).map(([pitcher, data]) => {
      const decisions = data.wins + data.losses;
      return {
        pitcher,
        ...data,
        winRate: decisions > 0 ? data.wins / decisions : null,
      };
    }).sort((a, b) => b.matches - a.matches);
  }, [filteredRecords]);

  // 10. 席種別成績 & 費用
  const seatTypeStats = useMemo(() => {
    const map = new Map<string, { matches: number; wins: number; losses: number; cost: number }>();
    filteredRecords.filter(r => r.matchStatus === 'finished').forEach(r => {
      const s = r.seatInfo.seatTypeName || r.seatInfo.seatTypeId || '指定なし';
      const curr = map.get(s) || { matches: 0, wins: 0, losses: 0, cost: 0 };
      curr.matches++;
      const res = getMatchResult(r);
      if (res === 'win') curr.wins++;
      if (res === 'loss') curr.losses++;
      if (r.costInfo.myExpense) curr.cost += r.costInfo.myExpense;
      map.set(s, curr);
    });

    return Array.from(map.entries()).map(([seat, d]) => {
      const dec = d.wins + d.losses;
      return {
        seat,
        ...d,
        winRate: dec > 0 ? d.wins / dec : null,
        avgCost: d.matches > 0 ? Math.round(d.cost / d.matches) : 0,
      };
    }).sort((a, b) => b.matches - a.matches);
  }, [filteredRecords]);

  // 11. 同行者別成績 (単独、友人、家族 等)
  const companionStats = useMemo(() => {
    const map = new Map<string, { matches: number; wins: number; losses: number; draws: number }>();
    filteredRecords.filter(r => r.matchStatus === 'finished').forEach(r => {
      const comp = r.companions?.trim() || '単独 (1人)';
      const curr = map.get(comp) || { matches: 0, wins: 0, losses: 0, draws: 0 };
      curr.matches++;
      const res = getMatchResult(r);
      if (res === 'win') curr.wins++;
      else if (res === 'loss') curr.losses++;
      else if (res === 'draw') curr.draws++;
      map.set(comp, curr);
    });

    return Array.from(map.entries()).map(([comp, d]) => {
      const dec = d.wins + d.losses;
      return {
        companion: comp,
        ...d,
        winRate: dec > 0 ? d.wins / dec : null,
      };
    }).sort((a, b) => b.matches - a.matches);
  }, [filteredRecords]);

  // 12. チケット購入先別分析
  const vendorStats = useMemo(() => {
    const map = new Map<string, { count: number; totalCost: number }>();
    filteredRecords.forEach(r => {
      const vendor = r.ticketInfo.vendor || r.costInfo.paymentDestination || '直接/その他';
      const curr = map.get(vendor) || { count: 0, totalCost: 0 };
      curr.count++;
      if (r.costInfo.myExpense) curr.totalCost += r.costInfo.myExpense;
      map.set(vendor, curr);
    });

    return Array.from(map.entries())
      .map(([vendor, d]) => ({ vendor, ...d }))
      .sort((a, b) => b.count - a.count);
  }, [filteredRecords]);

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
              <span>{statsYear === 'all' ? '通算全期間' : `${statsYear}年`}</span>
              <span aria-hidden="true">·</span>
              <span>エクセル分析全シート対応</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              観戦統計・多角データアナリティクス
            </h2>
          </div>

          {/* Sub Navigation Views matching all Excel dimensions */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto text-xs scrollbar-none">
            {[
              { id: 'overview', label: '総合サマリー' },
              { id: 'yearly', label: '年度別推移' },
              { id: 'opponents', label: '対戦球団別' },
              { id: 'stadiums', label: '球場別' },
              { id: 'pitchers', label: '先発投手別' },
              { id: 'timing', label: '曜日・月・時間帯' },
              { id: 'seats_companions', label: '席種・同行者' },
              { id: 'game_flow', label: '試合展開・点差' },
              { id: 'expenses', label: '費用・購入先' },
              { id: 'year_month', label: '年度×月' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AnalysisTab)}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 統計フィルタ: カテゴリ × 年度（併用可） */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs" role="group" aria-label="カテゴリ切替">
            {CATEGORIES.filter(cat => cat.id !== 'other').map(cat => (
              <button
                key={cat.id}
                onClick={() => setStatsCategory(cat.id)}
                aria-pressed={statsCategory === cat.id}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all whitespace-nowrap ${
                  statsCategory === cat.id
                    ? 'bg-[#003882] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {cat.shortLabel}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={statsYear}
              onChange={(e) => setStatsYear(e.target.value)}
              disabled={activeTab === 'yearly'}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer disabled:opacity-40"
              aria-label="統計の対象年度"
            >
              <option value="all">全期間</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}年</option>
              ))}
            </select>
            {activeTab === 'yearly' && <span className="text-[10px] text-slate-400">年度別推移では全期間固定</span>}
          </div>
          <span className="text-[11px] text-slate-400">対象: {CATEGORIES.find(c => c.id === statsCategory)?.label}（その他は常に除外）</span>
        </div>

        {/* Core KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500">観戦勝率</span>
            <div className="font-display font-bold text-2xl text-[#003882] dark:text-blue-400 mt-1 tabular-nums">
              {formatWinRate(stats.winRate)}
            </div>
            <span className="text-[10px] text-slate-400">{stats.wins}勝 {stats.losses}敗 {stats.draws}分</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500">平均得点 / 失点</span>
            <div className="font-display font-bold text-xl text-slate-800 dark:text-slate-200 mt-1 tabular-nums">
              <span className="text-emerald-600">{stats.avgRunsScored}</span>
              <span className="text-slate-400 text-sm"> / </span>
              <span className="text-slate-600">{stats.avgRunsConceded}</span>
            </div>
            <span className="text-[10px] text-slate-400">得失点差: {stats.avgRunDiff > 0 ? `+${stats.avgRunDiff}` : stats.avgRunDiff}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500">現在の連勝・連敗</span>
            <div className="flex items-center gap-1.5 mt-1">
              {streaksAndRecords.currentStreak.type === 'win' ? (
                <span className="font-display font-bold text-xl text-red-600 dark:text-red-400 flex items-center gap-1">
                  <Flame className="w-5 h-5 text-red-500 fill-red-500" />
                  {streaksAndRecords.currentStreak.count}連勝中
                </span>
              ) : streaksAndRecords.currentStreak.type === 'loss' ? (
                <span className="font-display font-bold text-xl text-blue-600 dark:text-blue-400">
                  {streaksAndRecords.currentStreak.count}連敗中
                </span>
              ) : (
                <span className="text-sm font-bold text-slate-500">なし</span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">通算最長: {streaksAndRecords.maxWinStreak}連勝 / {streaksAndRecords.maxLossStreak}連敗</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500">総観戦自己負担費用</span>
            <div className="font-display font-bold text-xl text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
              {formatCurrency(stats.totalMyExpense)}
            </div>
            <span className="text-[10px] text-slate-400">平均 {formatCurrency(stats.avgMyExpense)}/試合</span>
          </div>
        </div>
      </div>

      {/* 1. VIEW: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* カテゴリ別成績（1軍と2軍の明確な比較！） */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>カテゴリ別観戦成績（1軍と2軍を明確に分離）</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2.5">カテゴリ</th>
                    <th className="py-2.5 text-right">観戦試合</th>
                    <th className="py-2.5 text-center">勝 - 敗 - 分</th>
                    <th className="py-2.5 text-right">勝率</th>
                    <th className="py-2.5 text-right">平均得点</th>
                    <th className="py-2.5 text-right">平均失点</th>
                    <th className="py-2.5 text-right">自己負担費用</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {categoryStats.map(catItem => (
                    <tr key={catItem.category.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded font-bold text-[11px] ${catItem.category.badgeBg} ${catItem.category.badgeText}`}>
                          {catItem.category.label}
                        </span>
                      </td>
                      <td className="py-3 text-right font-display font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {catItem.finishedMatches}
                      </td>
                      <td className="py-3 text-center font-display tabular-nums">
                        <span className="text-red-600 dark:text-red-400">{catItem.wins}</span>
                        <span className="text-slate-400"> - </span>
                        <span className="text-blue-600 dark:text-blue-400">{catItem.losses}</span>
                        <span className="text-slate-400"> - </span>
                        <span className="text-slate-500 dark:text-slate-400">{catItem.draws}</span>
                      </td>
                      <td className="py-3 text-right font-display font-bold text-base text-[#003882] dark:text-blue-400 tabular-nums">
                        {formatWinRate(catItem.winRate)}
                      </td>
                      <td className="py-3 text-right font-display tabular-nums text-emerald-600">
                        {catItem.avgRunsScored}
                      </td>
                      <td className="py-3 text-right font-display tabular-nums text-slate-600 dark:text-slate-400">
                        {catItem.avgRunsConceded}
                      </td>
                      <td className="py-3 text-right font-display font-bold tabular-nums text-slate-900 dark:text-slate-100">
                        {formatCurrency(catItem.totalMyExpense)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Records & Streaks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                通算最長連勝
              </span>
              <div className="text-2xl font-display font-bold text-red-600 mt-2">
                {streaksAndRecords.maxWinStreak} <span className="text-xs font-normal text-slate-500">連勝</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-500" />
                観戦時最多得点試合
              </span>
              <div className="text-2xl font-display font-bold text-emerald-600 mt-2">
                {streaksAndRecords.maxRunsScoredGame ? `${streaksAndRecords.maxRunsScoredGame.runs}点` : '-'}
              </div>
              {streaksAndRecords.maxRunsScoredGame && (
                <span className="text-[10px] text-slate-400 block mt-1 truncate">
                  {streaksAndRecords.maxRunsScoredGame.match.date} vs {getTeam(streaksAndRecords.maxRunsScoredGame.match.awayTeamId).shortName}
                </span>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-500" />
                最長試合時間
              </span>
              <div className="text-2xl font-display font-bold text-purple-600 mt-2">
                {streaksAndRecords.longestGame ? formatMatchDuration(streaksAndRecords.longestGame.minutes) : '-'}
              </div>
              {streaksAndRecords.longestGame && (
                <span className="text-[10px] text-slate-400 block mt-1 truncate">
                  {streaksAndRecords.longestGame.match.date}
                </span>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-500" />
                完封勝利・完封負け
              </span>
              <div className="text-2xl font-display font-bold text-slate-800 dark:text-slate-200 mt-2">
                <span className="text-red-600">{gameFlow.shutoutWins}</span>
                <span className="text-slate-400 text-sm">勝 / </span>
                <span className="text-blue-600">{gameFlow.shutoutLosses}</span>
                <span className="text-slate-400 text-sm">敗</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VIEW: YEARLY */}
      {activeTab === 'yearly' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>年度別観戦推移（エクセル年度別シート準拠）</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">全{yearlyStats.length}シーズン</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5">年度</th>
                  <th className="py-2.5 text-right">観戦試合</th>
                  <th className="py-2.5 text-center">1軍 / 2軍</th>
                  <th className="py-2.5 text-center">勝 - 敗 - 分</th>
                  <th className="py-2.5 text-right">勝率</th>
                  <th className="py-2.5 text-right">平均得点</th>
                  <th className="py-2.5 text-right">平均失点</th>
                  <th className="py-2.5 text-right">自己負担費用計</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {yearlyStats.map(y => (
                  <tr key={y.year} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {y.year}年
                    </td>
                    <td className="py-3 text-right font-display font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {y.matches}
                    </td>
                    <td className="py-3 text-center text-slate-500 font-display tabular-nums">
                      <span className="text-blue-600 font-bold">{y.dragons1st}</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-emerald-600 font-bold">{y.dragons2nd}</span>
                    </td>
                    <td className="py-3 text-center font-display tabular-nums">
                      <span className="text-red-600 dark:text-red-400">{y.wins}</span>
                      <span className="text-slate-400"> - </span>
                      <span className="text-blue-600 dark:text-blue-400">{y.losses}</span>
                      <span className="text-slate-400"> - </span>
                      <span className="text-slate-500 dark:text-slate-400">{y.draws}</span>
                    </td>
                    <td className="py-3 text-right font-display font-bold text-base text-[#003882] dark:text-blue-400 tabular-nums">
                      {formatWinRate(y.winRate)}
                    </td>
                    <td className="py-3 text-right font-display tabular-nums text-emerald-600">
                      {y.avgRunsFor}
                    </td>
                    <td className="py-3 text-right font-display tabular-nums text-slate-600 dark:text-slate-400">
                      {y.avgRunsAgainst}
                    </td>
                    <td className="py-3 text-right font-display font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {formatCurrency(y.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. VIEW: OPPONENTS */}
      {activeTab === 'opponents' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>対戦相手別詳細成績 (得失点・得失点差)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5">球団</th>
                  <th className="py-2.5 text-right">試合数</th>
                  <th className="py-2.5 text-center">勝 - 敗 - 分</th>
                  <th className="py-2.5 text-right">勝率</th>
                  <th className="py-2.5 text-right">総得点</th>
                  <th className="py-2.5 text-right">総失点</th>
                  <th className="py-2.5 text-right">得失点差</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {opponentStats.map(opp => (
                  <tr key={opp.team.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 flex items-center gap-2.5">
                      <TeamLogo teamId={opp.team.id} size="sm" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{opp.team.name}</span>
                        <span className="text-[10px] text-slate-400 block">{opp.team.leagueName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-display tabular-nums text-slate-900 dark:text-slate-100 font-bold">
                      {opp.matches}
                    </td>
                    <td className="py-3 text-center font-display tabular-nums">
                      <span className="text-red-600 dark:text-red-400">{opp.wins}</span>
                      <span className="text-slate-400"> - </span>
                      <span className="text-blue-600 dark:text-blue-400">{opp.losses}</span>
                      <span className="text-slate-400"> - </span>
                      <span className="text-slate-500 dark:text-slate-400">{opp.draws}</span>
                    </td>
                    <td className="py-3 text-right font-display font-bold text-[#003882] dark:text-blue-400 tabular-nums">
                      {formatWinRate(opp.winRate)}
                    </td>
                    <td className="py-3 text-right font-display tabular-nums text-emerald-600">
                      {opp.runsFor}
                    </td>
                    <td className="py-3 text-right font-display tabular-nums text-slate-600 dark:text-slate-400">
                      {opp.runsAgainst}
                    </td>
                    <td className={`py-3 text-right font-display font-bold tabular-nums ${opp.runDiff > 0 ? 'text-blue-600' : opp.runDiff < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {opp.runDiff > 0 ? `+${opp.runDiff}` : opp.runDiff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. VIEW: STADIUMS */}
      {activeTab === 'stadiums' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>球場別観戦成績 & 費用</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5">球場名</th>
                  <th className="py-2.5 text-right">観戦試合</th>
                  <th className="py-2.5 text-center">勝 - 敗 - 分</th>
                  <th className="py-2.5 text-right">勝率</th>
                  <th className="py-2.5 text-right">自己負担費用計</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {stadiumStats.map(std => (
                  <tr key={std.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-slate-900 dark:text-slate-100">
                      {std.name}
                    </td>
                    <td className="py-3 text-right font-display tabular-nums text-slate-900 dark:text-slate-100 font-bold">
                      {std.matches}
                    </td>
                    <td className="py-3 text-center font-display tabular-nums">
                      <span className="text-red-600 dark:text-red-400">{std.wins}</span>
                      <span className="text-slate-400"> - </span>
                      <span className="text-blue-600 dark:text-blue-400">{std.losses}</span>
                      <span className="text-slate-400"> - </span>
                      <span className="text-slate-500 dark:text-slate-400">{std.draws}</span>
                    </td>
                    <td className="py-3 text-right font-display font-bold text-[#003882] dark:text-blue-400 tabular-nums">
                      {formatWinRate(std.winRate)}
                    </td>
                    <td className="py-3 text-right font-display font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {formatCurrency(std.myExpense)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. VIEW: PITCHERS */}
      {activeTab === 'pitchers' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            <span>自軍先発投手別観戦成績</span>
          </h3>

          {starterStats.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">先発投手情報が登録された試合がまだありません。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2.5">先発投手</th>
                    <th className="py-2.5 text-right">登板試合数</th>
                    <th className="py-2.5 text-center">観戦時 勝 - 敗 - 分</th>
                    <th className="py-2.5 text-right">観戦勝率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {starterStats.map(st => (
                    <tr key={st.pitcher} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {st.pitcher}
                      </td>
                      <td className="py-3 text-right font-display tabular-nums text-slate-900 dark:text-slate-100 font-bold">
                        {st.matches}
                      </td>
                      <td className="py-3 text-center font-display tabular-nums">
                        <span className="text-red-600 dark:text-red-400 font-bold">{st.wins}勝</span>
                        <span className="text-slate-400"> - </span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">{st.losses}敗</span>
                        {st.draws > 0 && <span className="text-slate-500"> - {st.draws}分</span>}
                      </td>
                      <td className="py-3 text-right font-display font-bold text-base text-[#003882] dark:text-blue-400 tabular-nums">
                        {formatWinRate(st.winRate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. VIEW: TIMING (曜日別・月別・デイナイター) */}
      {activeTab === 'timing' && (
        <div className="space-y-6">
          {/* Day vs Night & Home vs Away */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>デーゲーム vs ナイター 成績</span>
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block mb-1">デーゲーム (昼)</span>
                  <div className="text-2xl font-display font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                    {formatWinRate(dayNightStats.day.winRate)}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-display tabular-nums">
                    {dayNightStats.day.wins}勝 {dayNightStats.day.losses}敗 ({dayNightStats.day.matches}試合)
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-300 block mb-1">ナイター (夜)</span>
                  <div className="text-2xl font-display font-bold text-blue-400 tabular-nums">
                    {formatWinRate(dayNightStats.night.winRate)}
                  </div>
                  <div className="text-xs text-slate-400 mt-2 font-display tabular-nums">
                    {dayNightStats.night.wins}勝 {dayNightStats.night.losses}敗 ({dayNightStats.night.matches}試合)
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>ホーム球場 vs ビジター遠征 成績</span>
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block mb-1">ホーム (バンテリン等)</span>
                  <div className="text-2xl font-display font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                    {formatWinRate(homeAwayStats.home.winRate)}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-display tabular-nums">
                    {homeAwayStats.home.wins}勝 {homeAwayStats.home.losses}敗 {homeAwayStats.home.draws}分
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">ビジター遠征</span>
                  <div className="text-2xl font-display font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {formatWinRate(homeAwayStats.away.winRate)}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-display tabular-nums">
                    {homeAwayStats.away.wins}勝 {homeAwayStats.away.losses}敗 {homeAwayStats.away.draws}分
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 曜日別集計 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>曜日別観戦成績 (火〜日)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {dayOfWeekStats.map(d => (
                <div key={d.day} className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{d.day}</span>
                  <div className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {formatWinRate(d.winRate)}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {d.wins}勝 {d.losses}敗 ({d.matches}試合)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 月別集計 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>月別観戦推移 (3月〜11月)</span>
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
              {monthlyStats.map(m => (
                <div key={m.month} className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">{m.month}</span>
                  <div className="text-base font-display font-bold text-[#003882] dark:text-blue-400 mt-1">
                    {formatWinRate(m.winRate)}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {m.wins}勝 {m.losses}敗
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. VIEW: SEATS & COMPANIONS */}
      {activeTab === 'seats_companions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 席種別 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Armchair className="w-4 h-4 text-blue-600" />
              <span>席種別観戦成績 & 平均費用</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2">席種</th>
                    <th className="py-2 text-right">試合数</th>
                    <th className="py-2 text-right">勝率</th>
                    <th className="py-2 text-right">平均負担額</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {seatTypeStats.map(s => (
                    <tr key={s.seat}>
                      <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">{s.seat}</td>
                      <td className="py-2.5 text-right font-display tabular-nums">{s.matches}</td>
                      <td className="py-2.5 text-right font-display font-bold text-blue-600 tabular-nums">
                        {formatWinRate(s.winRate)}
                      </td>
                      <td className="py-2.5 text-right font-display tabular-nums">{formatCurrency(s.avgCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 同行者別 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>同行者別勝率比較</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2">同行者</th>
                    <th className="py-2 text-right">観戦試合</th>
                    <th className="py-2 text-center">勝 - 敗 - 分</th>
                    <th className="py-2 text-right">勝率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {companionStats.map(c => (
                    <tr key={c.companion}>
                      <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">{c.companion}</td>
                      <td className="py-2.5 text-right font-display tabular-nums">{c.matches}</td>
                      <td className="py-2.5 text-center font-display tabular-nums">
                        {c.wins} - {c.losses} - {c.draws}
                      </td>
                      <td className="py-2.5 text-right font-display font-bold text-blue-600 tabular-nums">
                        {formatWinRate(c.winRate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 8. VIEW: GAME FLOW & MARGINS */}
      {activeTab === 'game_flow' && (
        <div className="space-y-6">
          {/* 点差別勝率 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">1点差ゲーム（接戦）</span>
              <div className="text-2xl font-display font-bold text-blue-600 dark:text-blue-400 mt-1 tabular-nums">
                {formatWinRate(gameFlow.oneRunGames.winRate)}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                {gameFlow.oneRunGames.wins}勝 {gameFlow.oneRunGames.losses}敗 ({gameFlow.oneRunGames.matches}試合)
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">2点差ゲーム</span>
              <div className="text-2xl font-display font-bold text-slate-800 dark:text-slate-200 mt-1 tabular-nums">
                {formatWinRate(gameFlow.twoRunGames.winRate)}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                {gameFlow.twoRunGames.wins}勝 {gameFlow.twoRunGames.losses}敗 ({gameFlow.twoRunGames.matches}試合)
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">3点差以上（快勝 / 大敗）</span>
              <div className="text-2xl font-display font-bold text-slate-800 dark:text-slate-200 mt-1 tabular-nums">
                {formatWinRate(gameFlow.threePlusRunGames.winRate)}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                {gameFlow.threePlusRunGames.wins}勝 {gameFlow.threePlusRunGames.losses}敗 ({gameFlow.threePlusRunGames.matches}試合)
              </span>
            </div>
          </div>

          {/* 乱打戦 vs 投手戦 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">乱打戦（両チーム計10点以上）</span>
              <div className="text-2xl font-display font-bold text-amber-600 mt-1">
                {gameFlow.slugfests} <span className="text-xs font-normal text-slate-400">試合</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">投手戦（両チーム計3点以下）</span>
              <div className="text-2xl font-display font-bold text-emerald-600 mt-1">
                {gameFlow.pitchersDuels} <span className="text-xs font-normal text-slate-400">試合</span>
              </div>
            </div>
          </div>

          {/* イニング別得失点テーブル */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>イニング別得点・失点分布（1回〜9回）</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2 text-left">回</th>
                    {inningDistribution.map(inn => (
                      <th key={inn.inning} className="py-2">{inn.inning}回</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  <tr>
                    <td className="py-2.5 text-left font-bold text-emerald-600">自軍得点</td>
                    {inningDistribution.map(inn => (
                      <td key={inn.inning} className="py-2.5 font-display font-bold text-emerald-600 tabular-nums">
                        {inn.scored}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 text-left font-bold text-rose-600">失点</td>
                    {inningDistribution.map(inn => (
                      <td key={inn.inning} className="py-2.5 font-display font-bold text-rose-600 tabular-nums">
                        {inn.conceded}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 10. VIEW: YEAR x MONTH MATRIX */}
      {activeTab === 'year_month' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>年度 × 月別 観戦試合数</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">全{records.length}試合（全カテゴリ・予定含む）</span>
          </div>
          <p className="text-[11px] text-slate-500">
            対象は全レコードです。カテゴリ・年度フィルタには連動しません（その他カテゴリ含む、終了・予定を問いません）。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5 text-left">年度</th>
                  {yearMonthMatrix.months.map(m => (
                    <th key={m} className="py-2.5">{m}月</th>
                  ))}
                  <th className="py-2.5 text-right">合計</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {yearMonthMatrix.rows.map(row => (
                  <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 text-left font-bold text-slate-900 dark:text-slate-100">{row.year}年</td>
                    {row.counts.map((count, i) => (
                      <td key={i} className={`py-2.5 font-display tabular-nums ${count > 0 ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-300 dark:text-slate-600'}`}>
                        {count > 0 ? count : '-'}
                      </td>
                    ))}
                    <td className="py-2.5 text-right font-display font-bold tabular-nums text-[#003882] dark:text-blue-400">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. VIEW: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>観戦費用・チケット購入分析</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 font-semibold block">チケット購入総額（同行者分含む）</span>
                <div className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
                  {formatCurrency(stats.totalCost)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block">実質自己負担額</span>
                <div className="text-2xl font-display font-bold text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
                  {formatCurrency(stats.totalMyExpense)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 font-semibold block">1試合あたり平均自己負担</span>
                <div className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
                  {formatCurrency(stats.avgMyExpense)}
                </div>
              </div>
            </div>
          </div>

          {/* チケット購入先別 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>購入先・プレイガイド別集計</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2">購入先</th>
                    <th className="py-2 text-right">利用回数</th>
                    <th className="py-2 text-right">自己負担累計</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {vendorStats.map(v => (
                    <tr key={v.vendor}>
                      <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">{v.vendor}</td>
                      <td className="py-2.5 text-right font-display tabular-nums">{v.count}回</td>
                      <td className="py-2.5 text-right font-display font-bold tabular-nums text-slate-900 dark:text-slate-100">
                        {formatCurrency(v.totalCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
