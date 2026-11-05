/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useBaseball } from '../../context/BaseballContext';
import { Home, ListFilter, BarChart3, Ticket, Settings } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, records } = useBaseball();

  const scheduledCount = records.filter(r => r.watchStatus === 'scheduled').length;

  const tabs = [
    { id: 'home' as const, label: 'ホーム', icon: Home, badge: null },
    { id: 'records' as const, label: '記録', icon: ListFilter, badge: records.length },
    { id: 'stats' as const, label: '統計', icon: BarChart3, badge: null },
    { id: 'schedule' as const, label: '予定', icon: Ticket, badge: scheduledCount || null },
    { id: 'settings' as const, label: '設定', icon: Settings, badge: null },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center relative transition-colors focus-visible:outline-none"
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive
                      ? 'text-[#003882] dark:text-blue-400 scale-110'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                />
                {tab.badge !== null && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center tabular-nums">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-bold mt-1 tracking-tight ${
                  isActive
                    ? 'text-[#003882] dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
