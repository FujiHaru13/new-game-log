/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useBaseball } from '../../context/BaseballContext';
import {
  aggregateRecords,
  formatWinRate,
  formatMatchDate,
  formatCurrency,
  getMatchResult,
  getOpponentTeam,
  getStadiumDisplayName,
  formatSeatRow,
  formatSeatNumber,
} from '../../utils/baseballUtils';
import { CATEGORIES, TEAMS, getTeam } from '../../data/teams';
import { TeamLogo } from '../common/TeamLogo';
import { ScoreboardBadge } from '../common/ScoreboardBadge';
import {
  Calendar,
  Ticket,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
  Plus,
  Coins,
  ChevronRight,
} from 'lucide-react';
import { MatchRecord } from '../../types/baseball';

export const HomeDashboard: React.FC = () => {
  const {
    records,
    selectedYear,
    setSelectedYear,
    availableYears,
    selectedCategory,
    setSelectedCategory,
    setActiveTab,
    setSelectedRecordId,
    setIsFormModalOpen,
    setEditingRecord,
  } = useBaseball();

  // フィルタリング処理（年度 & カテゴリ）
  const filteredRecords = React.useMemo(() => {
    return records.filter(r => {
      // 年度
      if (selectedYear !== 'all') {
        if (!r.date || !r.date.startsWith(selectedYear)) return false;
      }
      // カテゴリ
      if (selectedCategory !== 'all') {
        if (!r.categories.includes(selectedCategory) && r.primaryCategory !== selectedCategory) {
          return false;
        }
      }
      return true;
    });
  }, [records, selectedYear, selectedCategory]);

  // 集計指標
  const stats = React.useMemo(() => aggregateRecords(filteredRecords), [filteredRecords]);

  // 直近の観戦済み試合（完了済みを降順）
  const recentFinishedMatches = React.useMemo(() => {
    return filteredRecords
      .filter(r => r.watchStatus === 'watched' && r.matchStatus === 'finished')
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 3);
  }, [filteredRecords]);

  // 次の観戦予定試合（予定を昇順）
  const upcomingMatches = React.useMemo(() => {
    return records
      .filter(r => r.watchStatus === 'scheduled')
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
      .slice(0, 3);
  }, [records]);

  // チケットの急ぎアクション（発売待ち or 支払い期限が近い）
  const ticketAlerts = React.useMemo(() => {
    return records
      .filter(r => r.watchStatus === 'scheduled' && (r.ticketInfo.status === 'release_waiting' || r.ticketInfo.status === 'plan_to_buy' || r.ticketInfo.status === 'ticket_waiting'))
      .slice(0, 3);
  }, [records]);

  // 対戦相手別成績の集計
  const opponentStats = React.useMemo(() => {
    const map = new Map<string, { wins: number; losses: number; draws: number; matches: number }>();
    filteredRecords
      .filter(r => r.matchStatus === 'finished')
      .forEach(r => {
        const opp = getOpponentTeam(r);
        const curr = map.get(opp.id) || { wins: 0, losses: 0, draws: 0, matches: 0 };
        curr.matches++;
        const res = getMatchResult(r);
        if (res === 'win') curr.wins++;
        else if (res === 'loss') curr.losses++;
        else if (res === 'draw') curr.draws++;
        map.set(opp.id, curr);
      });

    return Array.from(map.entries())
      .map(([teamId, data]) => {
        const team = getTeam(teamId);
        const rate = (data.wins + data.losses) > 0 ? data.wins / (data.wins + data.losses) : null;
        return {
          team,
          ...data,
          winRate: rate,
        };
      })
      .sort((a, b) => b.matches - a.matches);
  }, [filteredRecords]);

  // 年度別観戦試合数の推移（全レコード基準）
  const yearlyTrend = React.useMemo(() => {
    const counts: Record<string, number> = {};
    availableYears.forEach(y => { counts[y] = 0; });
    records.forEach(r => {
      if (r.date && !r.isDateUnknown) {
        const y = r.date.split('-')[0];
        if (counts[y] !== undefined) counts[y]++;
      }
    });
    return availableYears.map(y => ({ year: y, count: counts[y] || 0 })).reverse();
  }, [records, availableYears]);

  const maxYearCount = Math.max(...yearlyTrend.map(t => t.count), 1);

  const handleSelectRecord = (rec: MatchRecord) => {
    setSelectedRecordId(rec.id);
    setActiveTab('records');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Filter Control Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
              <span>{selectedYear === 'all' ? '通算全期間' : `${selectedYear}シーズン`}</span>
              <span aria-hidden="true">·</span>
              <span>
                {selectedCategory === 'all'
                  ? '全カテゴリ (1軍・2軍・代表・その他)'
                  : CATEGORIES.find(c => c.id === selectedCategory)?.label}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
              観戦ダッシュボード
            </h2>
          </div>

          {/* Interactive Category Segmented Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              全カテゴリ
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {cat.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Core Scoreboard Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          {/* 1. 観戦試合数 */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">観戦試合数</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {stats.finishedMatches}
              </span>
              <span className="text-xs text-slate-500 font-medium">試合</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
              予定 {stats.scheduled} / 中止 {stats.cancelled}
            </div>
          </div>

          {/* 2. 観戦勝率 */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">観戦勝率</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-display font-bold text-[#003882] dark:text-blue-400 tabular-nums">
                {formatWinRate(stats.winRate)}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              勝÷(勝+敗)
            </div>
          </div>

          {/* 3. 勝敗分 内訳 */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">通算勝敗</span>
            <div className="flex items-baseline gap-1.5 mt-1 font-display font-bold text-xl sm:text-2xl tabular-nums">
              <span className="text-blue-700 dark:text-blue-400">{stats.wins}勝</span>
              <span className="text-slate-400 font-normal">/</span>
              <span className="text-rose-600 dark:text-rose-400">{stats.losses}敗</span>
              {stats.draws > 0 && (
                <>
                  <span className="text-slate-400 font-normal">/</span>
                  <span className="text-amber-600 dark:text-amber-400">{stats.draws}分</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              勝敗差 {stats.wins - stats.losses > 0 ? `+${stats.wins - stats.losses}` : stats.wins - stats.losses}
            </div>
          </div>

          {/* 4. 平均得点 */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">平均得点</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-display font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {stats.avgRunsScored}
              </span>
              <span className="text-xs text-slate-500 font-medium">点/試合</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
              総得点: {stats.totalRunsScored}点
            </div>
          </div>

          {/* 5. 平均失点 */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">平均失点</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-display font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                {stats.avgRunsConceded}
              </span>
              <span className="text-xs text-slate-500 font-medium">点/試合</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
              総失点: {stats.totalRunsConceded}点 (差 {stats.avgRunDiff > 0 ? `+${stats.avgRunDiff}` : stats.avgRunDiff})
            </div>
          </div>

          {/* 6. 自己負担観戦費用 */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">自己負担費用</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatCurrency(stats.totalMyExpense)}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
              平均 {formatCurrency(stats.avgMyExpense)}/回
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Recent Match Showcase & Upcoming Plan Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Recent Matches with Scoreboard Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                直近の観戦試合
              </h3>
              <span className="text-xs text-slate-500">最新3試合</span>
            </div>
            <button
              onClick={() => setActiveTab('records')}
              className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>すべての記録を見る ({filteredRecords.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentFinishedMatches.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-sm text-slate-500">該当する観戦記録がありません。</p>
              <button
                onClick={() => {
                  setEditingRecord(null);
                  setIsFormModalOpen(true);
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#003882] rounded-lg"
              >
                <Plus className="w-4 h-4" />
                最初の観戦記録を登録する
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentFinishedMatches.map((match) => {
                const homeTeam = getTeam(match.homeTeamId);
                const awayTeam = getTeam(match.awayTeamId);
                const cheerTeam = getTeam(match.cheerTeamId);
                const result = getMatchResult(match);

                return (
                  <div
                    key={match.id}
                    onClick={() => handleSelectRecord(match)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl p-4 sm:p-5 transition-all shadow-xs cursor-pointer group"
                  >
                    {/* Header line: Date, Stadium, Result Badge */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="text-slate-900 dark:text-slate-100 font-semibold">
                          {formatMatchDate(match.date, match.isDateUnknown)}
                        </span>
                        {match.time && <span>{match.time} 開始</span>}
                        <span aria-hidden="true">·</span>
                        <span>{getStadiumDisplayName(match)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ScoreboardBadge result={result} />
                      </div>
                    </div>

                    {/* Main Match Card Score Display */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3 items-center">
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        {/* Away Team */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <TeamLogo teamId={awayTeam.id} size="md" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                              {awayTeam.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              (ビジター)
                            </span>
                          </div>
                        </div>

                        {/* Scores */}
                        <div className="flex items-center gap-2 px-3 font-display text-2xl font-bold tabular-nums">
                          <span className={match.awayScore! > match.homeScore! ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}>
                            {match.awayScore}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700 text-lg">-</span>
                          <span className={match.homeScore! > match.awayScore! ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}>
                            {match.homeScore}
                          </span>
                        </div>

                        {/* Home Team */}
                        <div className="flex items-center justify-end gap-2 min-w-0 flex-1 text-right">
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                              {homeTeam.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              (ホーム)
                            </span>
                          </div>
                          <TeamLogo teamId={homeTeam.id} size="md" />
                        </div>
                      </div>

                      {/* Seat & Highlights */}
                      <div className="text-xs space-y-1.5 sm:border-l sm:border-slate-100 dark:sm:border-slate-800 sm:pl-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="font-medium truncate">
                            {match.seatInfo.seatTypeName || '座席指定'}
                            {match.seatInfo.area && ` · ${match.seatInfo.area}`}
                            {match.seatInfo.row && ` · ${formatSeatRow(match.seatInfo.row)}`}
                            {match.seatInfo.seatNumber && ` ${formatSeatNumber(match.seatInfo.seatNumber)}`}
                          </span>
                        </div>

                        {match.pitchers?.winningPitcher && (
                          <div className="text-slate-500 truncate text-[11px]">
                            勝: <span className="font-semibold text-slate-700 dark:text-slate-300">{match.pitchers.winningPitcher}</span>
                            {match.pitchers.savePitcher && ` / S: ${match.pitchers.savePitcher}`}
                          </div>
                        )}

                        {match.homeRuns && match.homeRuns.length > 0 && (
                          <div className="text-slate-500 truncate text-[11px]">
                            本塁打: {match.homeRuns.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Highlights/Memo */}
                    {match.events && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-950/40 p-2 rounded-lg line-clamp-1 mt-2">
                        {match.events}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 span): Upcoming Schedule & Ticket Alerts */}
        <div className="space-y-6">
          {/* Upcoming Matches */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>次の観戦予定</span>
              </h3>
              <button
                onClick={() => setActiveTab('schedule')}
                className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline"
              >
                カレンダー
              </button>
            </div>

            {upcomingMatches.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                直近の観戦予定はありません。
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMatches.map(match => {
                  const home = getTeam(match.homeTeamId);
                  const away = getTeam(match.awayTeamId);

                  return (
                    <div
                      key={match.id}
                      onClick={() => handleSelectRecord(match)}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 hover:border-blue-400 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatMatchDate(match.date, match.isDateUnknown)}
                        </span>
                        <span>{match.time || '時間未定'}</span>
                      </div>
                      <div className="flex items-center gap-2 my-2">
                        <TeamLogo teamId={away.id} size="sm" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {away.shortName}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">vs</span>
                        <TeamLogo teamId={home.id} size="sm" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {home.shortName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                        <span className="truncate">{getStadiumDisplayName(match)}</span>
                        <span className="font-semibold text-blue-700 dark:text-blue-400">
                          {match.ticketInfo.status === 'purchased' ? '購入済' : match.ticketInfo.status === 'release_waiting' ? '発売待ち' : '手配中'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ticket Alerts Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-amber-600" />
              <span>チケット発売・手配予定</span>
            </h3>

            {ticketAlerts.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">現在手配待ちのチケットはありません。</p>
            ) : (
              <div className="space-y-2.5">
                {ticketAlerts.map(match => (
                  <div
                    key={match.id}
                    onClick={() => handleSelectRecord(match)}
                    className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs cursor-pointer hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                      <span>{formatMatchDate(match.date)}</span>
                      <span className="text-amber-700 dark:text-amber-400">
                        {match.ticketInfo.status === 'release_waiting' ? '発売日待ち' : '購入予定'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      {match.ticketInfo.releaseDate && `発売日: ${match.ticketInfo.releaseDate} `}
                      {match.ticketInfo.vendor && `(${match.ticketInfo.vendor})`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Opponent Breakdown & Yearly Trend Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opponent Breakdown Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>対戦相手別成績</span>
            </h3>
            <span className="text-xs text-slate-500">勝率順</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2 text-left">対戦球団</th>
                  <th className="pb-2 text-right">試合</th>
                  <th className="pb-2 text-center">勝 - 敗 - 分</th>
                  <th className="pb-2 text-right">勝率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {opponentStats.slice(0, 6).map(item => (
                  <tr key={item.team.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 flex items-center gap-2">
                      <TeamLogo teamId={item.team.id} size="sm" />
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{item.team.name}</span>
                    </td>
                    <td className="py-2.5 text-right font-display tabular-nums text-slate-600 dark:text-slate-400">
                      {item.matches}
                    </td>
                    <td className="py-2.5 text-center font-display tabular-nums">
                      <span className="text-blue-600 dark:text-blue-400">{item.wins}</span>
                      <span className="text-slate-400"> - </span>
                      <span className="text-rose-600 dark:text-rose-400">{item.losses}</span>
                      <span className="text-slate-400"> - </span>
                      <span className="text-amber-600 dark:text-amber-400">{item.draws}</span>
                    </td>
                    <td className="py-2.5 text-right font-display font-bold tabular-nums text-[#003882] dark:text-blue-400">
                      {formatWinRate(item.winRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Yearly Trend Chart Strip */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>年度別観戦試合数の推移</span>
            </h3>
            <span className="text-xs text-slate-500">通算 {records.length}試合</span>
          </div>

          <div className="space-y-3 pt-2">
            {yearlyTrend.map(item => {
              const pct = (item.count / maxYearCount) * 100;
              const isSelected = selectedYear === item.year;

              return (
                <div key={item.year} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => setSelectedYear(item.year)}
                      className={`font-bold hover:underline ${
                        isSelected ? 'text-[#003882] dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.year}年
                    </button>
                    <span className="font-display font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {item.count} 試合
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected ? 'bg-[#003882]' : 'bg-blue-400/70 dark:bg-blue-600/60'
                      }`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
