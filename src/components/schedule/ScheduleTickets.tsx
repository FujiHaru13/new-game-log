/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useBaseball } from '../../context/BaseballContext';
import { MatchRecord } from '../../types/baseball';
import {
  formatMatchDate,
  formatShortDate,
  formatCurrency,
  getStadiumDisplayName,
} from '../../utils/baseballUtils';
import { getTeam } from '../../data/teams';
import { TeamLogo } from '../common/TeamLogo';
import {
  Calendar as CalendarIcon,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  AlertCircle,
  Plus,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const ScheduleTickets: React.FC = () => {
  const { records, setSelectedRecordId, setActiveTab, setIsFormModalOpen, setEditingRecord } = useBaseball();

  // Current calendar viewing month (YYYY-MM)
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    // Current simulated date is in November 2026
    return '2026-11';
  });

  const [activeView, setActiveView] = useState<'calendar' | 'tickets'>('calendar');

  const [yearStr, monthStr] = currentMonth.split('-');
  const yearNum = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);

  // Calendar prev/next navigation
  const prevMonth = () => {
    if (monthNum === 1) {
      setCurrentMonth(`${yearNum - 1}-12`);
    } else {
      setCurrentMonth(`${yearNum}-${String(monthNum - 1).padStart(2, '0')}`);
    }
  };

  const nextMonth = () => {
    if (monthNum === 12) {
      setCurrentMonth(`${yearNum + 1}-01`);
    } else {
      setCurrentMonth(`${yearNum}-${String(monthNum + 1).padStart(2, '0')}`);
    }
  };

  // Generate calendar grid for month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(yearNum, monthNum - 1, 1);
    const lastDay = new Date(yearNum, monthNum, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0: Sun

    const days = [];
    // Leading empty days
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ dayNumber: null, dateStr: null });
    }
    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr });
    }
    return days;
  }, [yearNum, monthNum]);

  // Match lookup by date for current month
  const matchesByDate = useMemo(() => {
    const map = new Map<string, MatchRecord[]>();
    records.forEach(r => {
      if (r.date) {
        const list = map.get(r.date) || [];
        list.push(r);
        map.set(r.date, list);
      }
    });
    return map;
  }, [records]);

  // Ticket release events by date
  const ticketReleasesByDate = useMemo(() => {
    const map = new Map<string, MatchRecord[]>();
    records.forEach(r => {
      if (r.ticketInfo.releaseDate) {
        const list = map.get(r.ticketInfo.releaseDate) || [];
        list.push(r);
        map.set(r.ticketInfo.releaseDate, list);
      }
    });
    return map;
  }, [records]);

  // Filter all scheduled or upcoming matches
  const scheduledRecords = useMemo(() => {
    return records
      .filter(r => r.watchStatus === 'scheduled')
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }, [records]);

  // Ticket status breakdown
  const ticketStatusCategories = [
    { id: 'release_waiting', label: '発売待ち', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
    { id: 'plan_to_buy', label: '購入予定', color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800' },
    { id: 'purchased', label: '購入済み (発券待ち)', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
    { id: 'ticketed', label: '発券・確保完了', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
    { id: 'cancelled_refund', label: '払戻・キャンセル', color: 'text-zinc-600 bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700' },
  ];

  const handleSelectRecord = (record: MatchRecord) => {
    setSelectedRecordId(record.id);
    setActiveTab('records');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner and Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
              <span>観戦スケジュール & チケット管理</span>
              <span aria-hidden="true">·</span>
              <span>予定 {scheduledRecords.length} 試合</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              観戦予定・チケット手配
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
              <button
                onClick={() => setActiveView('calendar')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                  activeView === 'calendar'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                月間カレンダー
              </button>
              <button
                onClick={() => setActiveView('tickets')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                  activeView === 'tickets'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                チケット進捗ステータス
              </button>
            </div>

            <button
              onClick={() => {
                setEditingRecord(null);
                setIsFormModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#003882] hover:bg-[#002868] active:scale-[0.98] rounded-xl transition-all shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>予定を登録</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW: CALENDAR */}
      {activeView === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Calendar Header with Month Switcher */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-xl text-slate-900 dark:text-slate-100">
                {yearNum}年 {monthNum}月
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block" />
                <span>観戦試合</span>
                <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block ml-2" />
                <span>チケット発売</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="前月"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth('2026-11')}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                今月
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="次月"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center text-xs font-bold py-2.5 bg-slate-100/60 dark:bg-slate-900">
            <span className="text-rose-600">日</span>
            <span className="text-slate-600 dark:text-slate-400">月</span>
            <span className="text-slate-600 dark:text-slate-400">火</span>
            <span className="text-slate-600 dark:text-slate-400">水</span>
            <span className="text-slate-600 dark:text-slate-400">木</span>
            <span className="text-slate-600 dark:text-slate-400">金</span>
            <span className="text-blue-600">土</span>
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 auto-rows-[minmax(96px,auto)] divide-x divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-50/20 dark:bg-slate-950/20">
            {calendarDays.map((cd, index) => {
              if (!cd.dayNumber || !cd.dateStr) {
                return (
                  <div key={`empty_${index}`} className="p-2 bg-slate-100/30 dark:bg-slate-900/40 min-h-[96px]" />
                );
              }

              const dayMatches = matchesByDate.get(cd.dateStr) || [];
              const dayTicketReleases = ticketReleasesByDate.get(cd.dateStr) || [];
              const isToday = cd.dateStr === '2026-11-05';

              return (
                <div
                  key={cd.dateStr}
                  className={`p-1.5 sm:p-2 min-h-[96px] transition-colors flex flex-col justify-between ${
                    isToday ? 'bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-500' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-[#003882] text-white flex items-center justify-center font-display'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cd.dayNumber}
                    </span>
                    {dayMatches.length > 0 && (
                      <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold">
                        {dayMatches.length}試合
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 flex-1">
                    {/* Matches */}
                    {dayMatches.map(match => {
                      const away = getTeam(match.awayTeamId);
                      const home = getTeam(match.homeTeamId);
                      const isWatched = match.watchStatus === 'watched';

                      return (
                        <div
                          key={match.id}
                          onClick={() => handleSelectRecord(match)}
                          className={`p-1 rounded text-[10px] font-bold truncate cursor-pointer transition-transform hover:scale-[1.02] ${
                            isWatched
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                          }`}
                          title={`${away.shortName} vs ${home.shortName} (${getStadiumDisplayName(match)})`}
                        >
                          <span>{away.shortName}@{home.shortName}</span>
                        </div>
                      );
                    })}

                    {/* Ticket releases */}
                    {dayTicketReleases.map(match => (
                      <div
                        key={`rel_${match.id}`}
                        onClick={() => handleSelectRecord(match)}
                        className="p-1 rounded text-[10px] font-bold truncate cursor-pointer bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
                        title={`チケット発売: ${formatMatchDate(match.date)}の試合`}
                      >
                        <span>発売日</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: TICKETS PROGRESS BOARD */}
      {activeView === 'tickets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ticketStatusCategories.map(cat => {
              const matched = records.filter(r => r.ticketInfo.status === cat.id);

              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${cat.color}`}>
                      {cat.label}
                    </span>
                    <span className="text-xs font-bold text-slate-500 tabular-nums">
                      {matched.length} 件
                    </span>
                  </div>

                  {matched.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">該当チケットなし</p>
                  ) : (
                    <div className="space-y-2">
                      {matched.map(match => {
                        const home = getTeam(match.homeTeamId);
                        const away = getTeam(match.awayTeamId);

                        return (
                          <div
                            key={match.id}
                            onClick={() => handleSelectRecord(match)}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 hover:border-blue-400 cursor-pointer transition-all text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                              <span>{formatShortDate(match.date)}</span>
                              <span>{away.shortName} vs {home.shortName}</span>
                            </div>

                            <div className="text-[11px] text-slate-500 flex items-center justify-between">
                              <span className="truncate">{getStadiumDisplayName(match)}</span>
                              <span className="font-display font-bold tabular-nums text-slate-700 dark:text-slate-300">
                                {formatCurrency(match.costInfo.myExpense)}
                              </span>
                            </div>

                            {match.ticketInfo.releaseDate && (
                              <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                                発売: {match.ticketInfo.releaseDate}
                              </div>
                            )}

                            {match.ticketInfo.paymentDeadline && (
                              <div className="text-[10px] text-rose-600 font-medium">
                                支払期限: {match.ticketInfo.paymentDeadline}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
