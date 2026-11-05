/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useBaseball } from '../../context/BaseballContext';
import {
  Home,
  ListFilter,
  BarChart3,
  Ticket,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import { aggregateRecords, formatWinRate } from '../../utils/baseballUtils';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { activeTab, setActiveTab, records, selectedYear } = useBaseball();

  // 年度に応じたサマリー
  const yearRecords = React.useMemo(() => {
    return records.filter(r => selectedYear === 'all' || (r.date && r.date.startsWith(selectedYear)));
  }, [records, selectedYear]);

  const stats = React.useMemo(() => aggregateRecords(yearRecords), [yearRecords]);

  const navItems = [
    {
      id: 'home' as const,
      label: 'ホーム',
      enLabel: 'Dashboard',
      icon: Home,
      badge: null,
    },
    {
      id: 'records' as const,
      label: '観戦記録',
      enLabel: 'Game Logs',
      icon: ListFilter,
      badge: records.length,
    },
    {
      id: 'stats' as const,
      label: '統計・分析',
      enLabel: 'Statistics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'schedule' as const,
      label: '予定・チケット',
      enLabel: 'Tickets & Plan',
      icon: Ticket,
      badge: records.filter(r => r.watchStatus === 'scheduled').length || null,
    },
    {
      id: 'settings' as const,
      label: '設定・マスター',
      enLabel: 'Master & Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-200 select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      } shrink-0 min-h-screen z-20`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/40">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#003882] border border-blue-400/40 flex items-center justify-center font-display font-bold text-white text-base shadow-inner shrink-0">
              D
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-display font-bold tracking-tight text-base text-white truncate">
                観戦ログ
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                Dragons Official fan
              </span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-lg bg-[#003882] border border-blue-400/40 flex items-center justify-center font-display font-bold text-white text-base">
              D
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors ${
            isCollapsed ? 'hidden' : 'block'
          }`}
          title={isCollapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'}
          aria-label="サイドバー開閉"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left group ${
                isActive
                  ? 'bg-[#003882] text-white shadow-sm shadow-blue-950/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== null && (
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                        isActive
                          ? 'bg-blue-400/30 text-white'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Scoreboard Teaser at Bottom of Sidebar */}
      {!isCollapsed && (
        <div className="p-3 mx-3 mb-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5">
            <span>{selectedYear === 'all' ? '通算勝率' : `${selectedYear}年 勝率`}</span>
            <span className="font-display text-emerald-400 font-bold text-xs tracking-wider">
              {formatWinRate(stats.winRate)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300 font-display font-semibold tabular-nums">
            <span className="text-blue-400">{stats.wins}勝</span>
            <span className="text-rose-400">{stats.losses}敗</span>
            <span className="text-amber-400">{stats.draws}分</span>
            <span className="text-slate-500">({stats.finishedMatches}試合)</span>
          </div>
        </div>
      )}

      {/* Collapse Toggle Footer for compact mode */}
      {isCollapsed && (
        <div className="p-3 flex justify-center border-t border-slate-800">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="サイドバーを展開"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </aside>
  );
};
