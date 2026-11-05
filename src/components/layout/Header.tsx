/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useBaseball } from '../../context/BaseballContext';
import { Plus, Sun, Moon, Laptop, Calendar } from 'lucide-react';
import { CATEGORIES } from '../../data/teams';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = () => {
  const {
    activeTab,
    setActiveTab,
    selectedYear,
    setSelectedYear,
    availableYears,
    selectedCategory,
    setSelectedCategory,
    theme,
    setTheme,
    setIsFormModalOpen,
    setEditingRecord,
  } = useBaseball();

  const handleOpenNewForm = () => {
    setEditingRecord(null);
    setIsFormModalOpen(true);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'home': return 'ホーム / ダッシュボード';
      case 'records': return '観戦記録一覧';
      case 'stats': return '観戦統計・データ分析';
      case 'schedule': return '観戦予定・チケット管理';
      case 'settings': return '設定・マスター・移行';
      default: return '観戦ログ';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      {/* Zone 1: Brand title & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setActiveTab('home')}
          className="text-left group flex items-center gap-2"
        >
          <span className="font-display font-bold tracking-tight text-xl text-[#003882] dark:text-blue-400 whitespace-nowrap">
            観戦ログ
          </span>
          <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 whitespace-nowrap">
            DRAGONS WATCH
          </span>
        </button>

        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline" aria-hidden="true">/</span>

        <h1 className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate hidden md:block">
          {getTabTitle()}
        </h1>
      </div>

      {/* Zone 2: Year & Category Filters (Desk/Tablet) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Year Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            aria-label="対象年度を選択"
          >
            <option value="all">全期間 (通算)</option>
            {availableYears.map(yr => (
              <option key={yr} value={yr}>{yr}年</option>
            ))}
          </select>
        </div>

        {/* Category Pill Switcher (Short on Mobile, Full on PC) */}
        <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            全て
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {cat.shortLabel}
            </button>
          ))}
        </div>

        {/* Theme Toggle Button */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={`テーマ切り替え (現在: ${theme})`}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-md transition-colors"
            aria-label="テーマを切り替える"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>

        {/* Zone 3: Primary Action */}
        <button
          onClick={handleOpenNewForm}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-[#003882] hover:bg-[#002868] active:scale-[0.98] rounded-lg transition-all shadow-sm shadow-blue-900/20 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>試合を記録</span>
        </button>
      </div>
    </header>
  );
};
