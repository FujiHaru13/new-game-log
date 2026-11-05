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
} from '../../utils/baseballUtils';
import { CATEGORIES, TEAMS, getTeam } from '../../data/teams';
import { STADIUMS } from '../../data/stadiums';
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
  Filter,
} from 'lucide-react';
import { MatchRecord } from '../../types/baseball';

export const StatsDashboard: React.FC = () => {
  const { records, selectedYear, setSelectedYear, availableYears, selectedCategory, setSelectedCategory } = useBaseball();

  // Local state for analysis category tabs (e.g. Overview, Opponents, Stadiums, Pitchers, Expenses)
  const [activeAnalysisView, setActiveAnalysisView] = useState<'overview' | 'opponents' | 'stadiums' | 'pitchers' | 'expenses'>('overview');

  // Filtered records based on global filters
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedYear !== 'all' && (!r.date || !r.date.startsWith(selectedYear))) {
        return false;
      }
      if (selectedCategory !== 'all') {
        if (!r.categories.includes(selectedCategory) && r.primaryCategory !== selectedCategory) {
          return false;
        }
      }
      return true;
    });
  }, [records, selectedYear, selectedCategory]);

  const stats = useMemo(() => aggregateRecords(filteredRecords), [filteredRecords]);

  // 1. カテゴリ別成績（1軍と2軍の明確な比較！）
  const categoryStats = useMemo(() => {
    return CATEGORIES.map(cat => {
      const catRecords = records.filter(r => {
        if (selectedYear !== 'all' && (!r.date || !r.date.startsWith(selectedYear))) return false;
        return r.categories.includes(cat.id) || r.primaryCategory === cat.id;
      });
      return {
        category: cat,
        ...aggregateRecords(catRecords),
      };
    });
  }, [records, selectedYear]);

  // 2. 対戦相手別成績
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

  // 3. 球場別成績
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

  // 4. ホーム / ビジター別成績
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

  // 5. デーゲーム / ナイター別成績
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

  // 6. 先発投手別観戦成績
  const starterStats = useMemo(() => {
    const map = new Map<string, { wins: number; losses: number; draws: number; matches: number }>();
    filteredRecords.filter(r => r.matchStatus === 'finished').forEach(r => {
      // 応援チームの先発投手を取得
      const isHome = r.cheerTeamId === r.homeTeamId;
      const starter = isHome ? r.pitchers?.homeStarter : r.pitchers?.awayStarter;
      if (starter) {
        const curr = map.get(starter) || { wins: 0, losses: 0, draws: 0, matches: 0 };
        curr.matches++;
        const res = getMatchResult(r);
        if (res === 'win') curr.wins++;
        else if (res === 'loss') curr.losses++;
        else if (res === 'draw') curr.draws++;
        map.set(starter, curr);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner and Quick Metrics */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
              <span>{selectedYear === 'all' ? '通算全期間' : `${selectedYear}年`}</span>
              <span aria-hidden="true">·</span>
              <span>多角データ分析</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              観戦統計ダッシュボード
            </h2>
          </div>

          {/* Sub Navigation Views */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto text-xs">
            {[
              { id: 'overview', label: '総合サマリー' },
              { id: 'opponents', label: '対戦球団別' },
              { id: 'stadiums', label: '球場別' },
              { id: 'pitchers', label: '先発投手別' },
              { id: 'expenses', label: '費用分析' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveAnalysisView(tab.id as any)}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeAnalysisView === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
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
            <span className="text-[10px] text-slate-400">差: {stats.avgRunDiff > 0 ? `+${stats.avgRunDiff}` : stats.avgRunDiff}点</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500">ホーム / ビジター勝率</span>
            <div className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 mt-1 tabular-nums">
              H: <span className="text-blue-600">{formatWinRate(homeAwayStats.home.winRate)}</span>
              <span className="text-slate-400 mx-1">|</span>
              V: <span className="text-slate-600">{formatWinRate(homeAwayStats.away.winRate)}</span>
            </div>
            <span className="text-[10px] text-slate-400">H {homeAwayStats.home.matches}試合 / V {homeAwayStats.away.matches}試合</span>
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

      {/* VIEW: OVERVIEW */}
      {activeAnalysisView === 'overview' && (
        <div className="space-y-6">
          {/* 1軍 vs 2軍 vs 日本代表 カテゴリ別集計表 */}
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
                        <span className={`px-2 py-0.5 rounded font-bold ${catItem.category.badgeBg} ${catItem.category.badgeText}`}>
                          {catItem.category.label}
                        </span>
                      </td>
                      <td className="py-3 text-right font-display font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {catItem.finishedMatches}
                      </td>
                      <td className="py-3 text-center font-display tabular-nums">
                        <span className="text-blue-600 dark:text-blue-400">{catItem.wins}</span>
                        <span className="text-slate-400"> - </span>
                        <span className="text-rose-600 dark:text-rose-400">{catItem.losses}</span>
                        <span className="text-slate-400"> - </span>
                        <span className="text-amber-600 dark:text-amber-400">{catItem.draws}</span>
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

          {/* デーゲーム / ナイター & ホーム / ビジター 比較カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Home vs Away */}
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

            {/* Day vs Night */}
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

                <div className="p-4 rounded-xl bg-slate-900 text-white rounded-xl p-4 border border-slate-800">
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
          </div>
        </div>
      )}

      {/* VIEW: OPPONENTS */}
      {activeAnalysisView === 'opponents' && (
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
                      <span className="text-blue-600 dark:text-blue-400">{opp.wins}</span>
                      <span className="text-slate-400"> - </span>
                      <span className="text-rose-600 dark:text-rose-400">{opp.losses}</span>
                      <span className="text-slate-400"> - </span>
                      <span className="text-amber-600 dark:text-amber-400">{opp.draws}</span>
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

      {/* VIEW: STADIUMS */}
      {activeAnalysisView === 'stadiums' && (
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
                      <span className="text-blue-600 dark:text-blue-400">{std.wins}</span>
                      <span className="text-slate-400"> - </span>
                      <span className="text-rose-600 dark:text-rose-400">{std.losses}</span>
                      <span className="text-slate-400"> - </span>
                      <span className="text-amber-600 dark:text-amber-400">{std.draws}</span>
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

      {/* VIEW: PITCHERS */}
      {activeAnalysisView === 'pitchers' && (
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
                        <span className="text-blue-600 dark:text-blue-400 font-bold">{st.wins}勝</span>
                        <span className="text-slate-400"> - </span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">{st.losses}敗</span>
                        {st.draws > 0 && <span className="text-amber-500"> - {st.draws}分</span>}
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

      {/* VIEW: EXPENSES */}
      {activeAnalysisView === 'expenses' && (
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
      )}
    </div>
  );
};
