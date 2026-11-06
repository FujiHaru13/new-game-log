/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useBaseball } from '../../context/BaseballContext';
import { MatchRecord, MatchResult, CategoryId } from '../../types/baseball';
import {
  formatMatchDate,
  formatShortDate,
  formatCurrency,
  getMatchResult,
  getStadiumDisplayName,
  getMatchTypeName,
  formatSeatRow,
  formatSeatNumber,
} from '../../utils/baseballUtils';
import { TEAMS, CATEGORIES, getTeam } from '../../data/teams';
import { STADIUMS } from '../../data/stadiums';
import { TeamLogo } from '../common/TeamLogo';
import { ScoreboardBadge } from '../common/ScoreboardBadge';
import { RecordDetail } from './RecordDetail';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Calendar,
  MapPin,
  Coins,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Layers,
  X,
} from 'lucide-react';

export const RecordList: React.FC = () => {
  const {
    records,
    selectedYear,
    setSelectedYear,
    availableYears,
    selectedCategory,
    setSelectedCategory,
    selectedRecordId,
    setSelectedRecordId,
    setIsFormModalOpen,
    setEditingRecord,
  } = useBaseball();

  // Local filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [opponentFilter, setOpponentFilter] = useState('all');
  const [stadiumFilter, setStadiumFilter] = useState('all');
  const [watchStatusFilter, setWatchStatusFilter] = useState<'all' | 'watched' | 'scheduled' | 'cancelled'>('all');
  const [resultFilter, setResultFilter] = useState<'all' | 'win' | 'loss' | 'draw'>('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [homeAwayFilter, setHomeAwayFilter] = useState<'all' | 'home' | 'away'>('all');

  // Sorting state
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'expense_desc' | 'scored_desc'>('date_desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Filtered and Sorted Records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // 1. Year
      if (selectedYear !== 'all') {
        if (!r.date || !r.date.startsWith(selectedYear)) return false;
      }

      // 2. Category (multi-category aware!)
      if (selectedCategory !== 'all') {
        const matchesCategory = r.categories.includes(selectedCategory) || r.primaryCategory === selectedCategory;
        if (!matchesCategory) return false;
      }

      // 3. Opponent team
      if (opponentFilter !== 'all') {
        const isOpponent = r.homeTeamId === opponentFilter || r.awayTeamId === opponentFilter;
        if (!isOpponent) return false;
      }

      // 4. Stadium
      if (stadiumFilter !== 'all') {
        if (r.stadiumId !== stadiumFilter) return false;
      }

      // 5. Watch Status
      if (watchStatusFilter !== 'all') {
        if (r.watchStatus !== watchStatusFilter) return false;
      }

      // 6. Match Result
      if (resultFilter !== 'all') {
        const res = getMatchResult(r);
        if (res !== resultFilter) return false;
      }

      // 7. Month
      if (monthFilter !== 'all') {
        if (!r.date) return false;
        const m = r.date.split('-')[1];
        if (m !== monthFilter.padStart(2, '0')) return false;
      }

      // 8. Home / Away
      if (homeAwayFilter !== 'all') {
        const isHome = r.cheerTeamId === r.homeTeamId;
        if (homeAwayFilter === 'home' && !isHome) return false;
        if (homeAwayFilter === 'away' && isHome) return false;
      }

      // 9. Search Term (Team names, Stadium name, Notes, Memo, Companions)
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const homeName = getTeam(r.homeTeamId).name.toLowerCase();
        const awayName = getTeam(r.awayTeamId).name.toLowerCase();
        const stadiumName = getStadiumDisplayName(r).toLowerCase();
        const notes = (r.notes || '').toLowerCase();
        const memo = (r.watchMemo || '').toLowerCase();
        const companions = (r.companions || '').toLowerCase();
        const seat = (r.seatInfo.seatTypeName || '').toLowerCase();
        const events = (r.events || '').toLowerCase();

        const match =
          homeName.includes(q) ||
          awayName.includes(q) ||
          stadiumName.includes(q) ||
          notes.includes(q) ||
          memo.includes(q) ||
          companions.includes(q) ||
          seat.includes(q) ||
          events.includes(q);

        if (!match) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        return (b.date || '').localeCompare(a.date || '');
      }
      if (sortBy === 'date_asc') {
        return (a.date || '').localeCompare(b.date || '');
      }
      if (sortBy === 'expense_desc') {
        const expA = a.costInfo.myExpense || 0;
        const expB = b.costInfo.myExpense || 0;
        return expB - expA;
      }
      if (sortBy === 'scored_desc') {
        const runsA = (a.homeScore || 0) + (a.awayScore || 0);
        const runsB = (b.homeScore || 0) + (b.awayScore || 0);
        return runsB - runsA;
      }
      return 0;
    });
  }, [
    records,
    selectedYear,
    selectedCategory,
    opponentFilter,
    stadiumFilter,
    watchStatusFilter,
    resultFilter,
    monthFilter,
    homeAwayFilter,
    searchTerm,
    sortBy,
  ]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Selected Record for modal detail view
  const activeRecord = useMemo(() => {
    if (!selectedRecordId) return null;
    return records.find(r => r.id === selectedRecordId) || null;
  }, [records, selectedRecordId]);

  const resetFilters = () => {
    setSearchTerm('');
    setOpponentFilter('all');
    setStadiumFilter('all');
    setWatchStatusFilter('all');
    setResultFilter('all');
    setMonthFilter('all');
    setHomeAwayFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    opponentFilter !== 'all' ||
    stadiumFilter !== 'all' ||
    watchStatusFilter !== 'all' ||
    resultFilter !== 'all' ||
    monthFilter !== 'all' ||
    homeAwayFilter !== 'all';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Row 1: Search & Quick Year/Category pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="球団名・球場・選手名・メモで検索..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#003882]/40"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingRecord(null);
                setIsFormModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#003882] hover:bg-[#002868] active:scale-[0.98] rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>観戦記録を追加</span>
            </button>
          </div>
        </div>

        {/* Row 2: Detailed Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Opponent Filter */}
          <div>
            <label className="block text-[10px] text-slate-500 font-semibold mb-1">対戦相手</label>
            <select
              value={opponentFilter}
              onChange={(e) => {
                setOpponentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="all">全球団</option>
              {TEAMS.map(team => (
                <option key={team.id} value={team.id}>{team.shortName}</option>
              ))}
            </select>
          </div>

          {/* Stadium Filter */}
          <div>
            <label className="block text-[10px] text-slate-500 font-semibold mb-1">球場</label>
            <select
              value={stadiumFilter}
              onChange={(e) => {
                setStadiumFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 truncate"
            >
              <option value="all">全球場</option>
              {STADIUMS.map(stadium => (
                <option key={stadium.id} value={stadium.id}>{stadium.shortName}</option>
              ))}
            </select>
          </div>

          {/* Watch Status */}
          <div>
            <label className="block text-[10px] text-slate-500 font-semibold mb-1">観戦状態</label>
            <select
              value={watchStatusFilter}
              onChange={(e) => {
                setWatchStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="all">全て</option>
              <option value="watched">観戦済み</option>
              <option value="scheduled">観戦予定</option>
              <option value="cancelled">観戦中止</option>
            </select>
          </div>

          {/* Result Filter */}
          <div>
            <label className="block text-[10px] text-slate-500 font-semibold mb-1">勝敗結果</label>
            <select
              value={resultFilter}
              onChange={(e) => {
                setResultFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="all">全て</option>
              <option value="win">勝利</option>
              <option value="loss">敗戦</option>
              <option value="draw">引分</option>
            </select>
          </div>

          {/* Home / Away */}
          <div>
            <label className="block text-[10px] text-slate-500 font-semibold mb-1">ホーム/ビジター</label>
            <select
              value={homeAwayFilter}
              onChange={(e) => {
                setHomeAwayFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="all">全て</option>
              <option value="home">ホーム</option>
              <option value="away">ビジター</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] text-slate-500 font-semibold mb-1">並び替え</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="date_desc">開催日 (新しい順)</option>
              <option value="date_asc">開催日 (古い順)</option>
              <option value="expense_desc">自己負担額順</option>
              <option value="scored_desc">乱打戦 (総得点順)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-2">
            <span>該当: <strong className="text-slate-900 dark:text-slate-100">{filteredRecords.length}</strong> 件</span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-blue-700 dark:text-blue-400 font-semibold hover:underline"
              >
                フィルタを解除
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>表示件数:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="15">15件</option>
              <option value="30">30件</option>
              <option value="50">50件</option>
            </select>
          </div>
        </div>
      </div>

      {/* PC View: High Density Baseball Table */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4 whitespace-nowrap">開催日 / 時刻</th>
                <th className="py-3 px-3 whitespace-nowrap">カテゴリ</th>
                <th className="py-3 px-4 whitespace-nowrap">対戦カード</th>
                <th className="py-3 px-3 whitespace-nowrap">スコア</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">勝敗</th>
                <th className="py-3 px-3 whitespace-nowrap">球場</th>
                <th className="py-3 px-3 whitespace-nowrap">座席</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">自己負担額</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    条件に一致する観戦記録が見つかりませんでした。
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const homeTeam = getTeam(r.homeTeamId);
                  const awayTeam = getTeam(r.awayTeamId);
                  const result = getMatchResult(r);

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRecordId(r.id)}
                      className="hover:bg-blue-50/50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          {formatMatchDate(r.date, r.isDateUnknown)}
                        </span>
                        {r.time && <span className="text-[11px] text-slate-400">{r.time} 開始</span>}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          {r.categories.map(catId => {
                            const c = CATEGORIES.find(item => item.id === catId);
                            return (
                              <span
                                key={catId}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${c?.badgeBg} ${c?.badgeText} whitespace-nowrap`}
                              >
                                {c?.shortLabel}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Match Card */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <TeamLogo teamId={awayTeam.id} size="sm" />
                          <span className="text-slate-800 dark:text-slate-200 font-semibold">{awayTeam.shortName}</span>
                          <span className="text-slate-400 text-[10px]">@</span>
                          <span className="text-slate-800 dark:text-slate-200 font-semibold">{homeTeam.shortName}</span>
                          <TeamLogo teamId={homeTeam.id} size="sm" />
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-display font-bold text-sm tabular-nums">
                        {r.awayScore !== null && r.homeScore !== null ? (
                          <div className="flex items-center gap-1.5">
                            <span className={r.awayScore > r.homeScore ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-600 dark:text-slate-400'}>
                              {r.awayScore}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">-</span>
                            <span className={r.homeScore > r.awayScore ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-600 dark:text-slate-400'}>
                              {r.homeScore}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-sans text-xs">スコア未定</span>
                        )}
                      </td>

                      {/* Result */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <ScoreboardBadge result={result} size="sm" />
                      </td>

                      {/* Stadium */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {getStadiumDisplayName(r)}
                      </td>

                      {/* Seat */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        <span className="truncate max-w-[140px] block font-medium">
                          {r.seatInfo.seatTypeName || r.seatInfo.seatTypeId || '未指定'}
                          {r.seatInfo.row && ` (${formatSeatRow(r.seatInfo.row)}${r.seatInfo.seatNumber ? ` ${formatSeatNumber(r.seatInfo.seatNumber)}` : ''})`}
                        </span>
                      </td>

                      {/* Expense */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap font-display font-bold tabular-nums text-slate-900 dark:text-slate-100">
                        {formatCurrency(r.costInfo.myExpense)}
                      </td>

                      {/* Watch Status */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`text-[11px] font-semibold ${
                          r.watchStatus === 'watched' ? 'text-emerald-600 dark:text-emerald-400' :
                          r.watchStatus === 'scheduled' ? 'text-blue-600 dark:text-blue-400' :
                          'text-zinc-400'
                        }`}>
                          {r.watchStatus === 'watched' ? '観戦済' : r.watchStatus === 'scheduled' ? '予定' : '中止'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View: High Fidelity Match Cards */}
      <div className="md:hidden space-y-3">
        {paginatedRecords.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
            該当する観戦記録がありません。
          </div>
        ) : (
          paginatedRecords.map(r => {
            const home = getTeam(r.homeTeamId);
            const away = getTeam(r.awayTeamId);
            const result = getMatchResult(r);

            return (
              <div
                key={r.id}
                onClick={() => setSelectedRecordId(r.id)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs active:bg-slate-50 transition-colors"
              >
                {/* Card Top Line */}
                <div className="flex items-center justify-between text-xs text-slate-500 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                    <span>{formatShortDate(r.date, r.isDateUnknown)}</span>
                    {r.time && <span className="font-normal text-slate-400">{r.time}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                      {getStadiumDisplayName(r)}
                    </span>
                    <ScoreboardBadge result={result} size="sm" />
                  </div>
                </div>

                {/* Score and Teams Line */}
                <div className="flex items-center justify-between py-3">
                  {/* Away */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <TeamLogo teamId={away.id} size="sm" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {away.shortName}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="px-3 font-display font-bold text-lg tabular-nums">
                    {r.awayScore !== null && r.homeScore !== null ? (
                      <div className="flex items-center gap-1">
                        <span className={r.awayScore > r.homeScore ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}>
                          {r.awayScore}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">-</span>
                        <span className={r.homeScore > r.awayScore ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}>
                          {r.homeScore}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-sans text-slate-400">予定</span>
                    )}
                  </div>

                  {/* Home */}
                  <div className="flex items-center justify-end gap-2 flex-1 min-w-0 text-right">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {home.shortName}
                    </span>
                    <TeamLogo teamId={home.id} size="sm" />
                  </div>
                </div>

                {/* Bottom line: Seat & Expense */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  <span className="truncate max-w-[180px]">
                    {r.seatInfo.seatTypeName || '座席未指定'}
                    {r.seatInfo.row && ` · ${formatSeatRow(r.seatInfo.row)}`}
                    {r.seatInfo.seatNumber && ` ${formatSeatNumber(r.seatInfo.seatNumber)}`}
                  </span>
                  <span className="font-display font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatCurrency(r.costInfo.myExpense)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="text-slate-500">
            ページ <strong className="text-slate-900 dark:text-slate-100">{currentPage}</strong> / {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40"
              aria-label="前のページ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors ${
                  currentPage === page
                    ? 'bg-[#003882] text-white'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40"
              aria-label="次のページ"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {activeRecord && (
        <RecordDetail
          record={activeRecord}
          onClose={() => setSelectedRecordId(null)}
          onEdit={(rec) => {
            setSelectedRecordId(null);
            setEditingRecord(rec);
            setIsFormModalOpen(true);
          }}
        />
      )}
    </div>
  );
};
