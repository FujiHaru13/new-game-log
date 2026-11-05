/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MatchRecord, CategoryId } from '../types/baseball';
import { INITIAL_SEED_RECORDS } from '../data/seedData';
import { getMatchResult } from '../utils/baseballUtils';

const STORAGE_KEY = 'baseball_watch_log_data_v2';
const THEME_KEY = 'baseball_watch_log_theme';
const SUPABASE_CONFIG_KEY = 'baseball_watch_log_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

interface BaseballContextType {
  records: MatchRecord[];
  activeTab: 'home' | 'records' | 'stats' | 'schedule' | 'settings';
  setActiveTab: (tab: 'home' | 'records' | 'stats' | 'schedule' | 'settings') => void;
  selectedRecordId: string | null;
  setSelectedRecordId: (id: string | null) => void;
  isFormModalOpen: boolean;
  setIsFormModalOpen: (open: boolean) => void;
  editingRecord: MatchRecord | null;
  setEditingRecord: (record: MatchRecord | null) => void;
  
  // 共通フィルタ
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  availableYears: string[];
  selectedCategory: CategoryId | 'all';
  setSelectedCategory: (cat: CategoryId | 'all') => void;

  // テーマ
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isDarkMode: boolean;

  // 操作
  addRecord: (record: Omit<MatchRecord, 'id' | 'createdAt' | 'updatedAt'>) => MatchRecord;
  updateRecord: (record: MatchRecord) => void;
  deleteRecord: (id: string) => void;
  resetToDemoData: () => void;
  importRecords: (incoming: MatchRecord[], mode: 'merge' | 'replace') => { added: number; updated: number };
  exportToJSON: () => void;
  exportToCSV: () => void;

  // Supabase設定
  supabaseConfig: SupabaseConfig;
  updateSupabaseConfig: (config: Partial<SupabaseConfig>) => void;
}

const BaseballContext = createContext<BaseballContextType | undefined>(undefined);

export const BaseballProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 記録データ
  const [records, setRecords] = useState<MatchRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load records from localStorage', e);
    }
    return INITIAL_SEED_RECORDS;
  });

  // ナビゲーション
  const [activeTab, setActiveTab] = useState<'home' | 'records' | 'stats' | 'schedule' | 'settings'>('home');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MatchRecord | null>(null);

  // フィルタ状態
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');

  // 利用可能な年度の算出（降順）
  const availableYears = React.useMemo(() => {
    const yearsSet = new Set<string>();
    records.forEach(r => {
      if (r.date && !r.isDateUnknown) {
        const y = r.date.split('-')[0];
        if (y) yearsSet.add(y);
      }
    });
    // 現在年を最低限含む
    yearsSet.add('2026');
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [records]);

  // 初期年度は最新年（2026）
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return '2026';
  });

  // テーマ
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem(THEME_KEY) as 'light' | 'dark' | 'system') || 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateDark = () => {
      let shouldDark = false;
      if (theme === 'dark') shouldDark = true;
      else if (theme === 'light') shouldDark = false;
      else shouldDark = mediaQuery.matches;

      setIsDarkMode(shouldDark);
      if (shouldDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateDark();
    localStorage.setItem(THEME_KEY, theme);

    const handler = () => {
      if (theme === 'system') updateDark();
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
  };

  // Supabase設定
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    try {
      const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { url: '', anonKey: '', isConnected: false };
  });

  const updateSupabaseConfig = (config: Partial<SupabaseConfig>) => {
    setSupabaseConfig(prev => {
      const next = { ...prev, ...config };
      localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(next));
      return next;
    });
  };

  // ローカルストレージへの永続化
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save records to localStorage', e);
    }
  }, [records]);

  // CRUD
  const addRecord = (data: Omit<MatchRecord, 'id' | 'createdAt' | 'updatedAt'>): MatchRecord => {
    const now = new Date().toISOString();
    const newRecord: MatchRecord = {
      ...data,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    setRecords(prev => [newRecord, ...prev]);
    return newRecord;
  };

  const updateRecord = (updated: MatchRecord) => {
    const now = new Date().toISOString();
    setRecords(prev => prev.map(r => (r.id === updated.id ? { ...updated, updatedAt: now } : r)));
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    if (selectedRecordId === id) {
      setSelectedRecordId(null);
    }
  };

  const resetToDemoData = () => {
    setRecords(INITIAL_SEED_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_RECORDS));
  };

  const importRecords = (incoming: MatchRecord[], mode: 'merge' | 'replace') => {
    let added = 0;
    let updated = 0;

    if (mode === 'replace') {
      setRecords(incoming);
      return { added: incoming.length, updated: 0 };
    }

    setRecords(prev => {
      const existingMap = new Map<string, MatchRecord>(prev.map(r => [r.id, r]));
      incoming.forEach(item => {
        if (existingMap.has(item.id)) {
          existingMap.set(item.id, item);
          updated++;
        } else {
          existingMap.set(item.id, item);
          added++;
        }
      });
      return Array.from(existingMap.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    });

    return { added, updated };
  };

  const exportToJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `baseball_watch_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportToCSV = () => {
    const headers = [
      '試合ID',
      '開催日',
      '開始時刻',
      '主カテゴリ',
      '全カテゴリ',
      'ホームチーム',
      'ビジターチーム',
      '球場',
      '試合状態',
      'ホーム得点',
      'ビジター得点',
      '応援チーム',
      '勝敗結果',
      '観戦状態',
      '席種',
      'エリア',
      '列',
      '席番',
      '同行者',
      'チケット総額',
      '自己負担額',
      'チケット状態',
      '観戦メモ'
    ];

    const rows = records.map(r => {
      const result = getMatchResult(r);
      const resLabel = result === 'win' ? '勝' : result === 'loss' ? '敗' : result === 'draw' ? '分' : result === 'cancelled' ? '中止' : '予定';
      return [
        r.id,
        r.date,
        r.time || '',
        r.primaryCategory,
        r.categories.join(';'),
        r.homeTeamId,
        r.awayTeamId,
        r.stadiumId,
        r.matchStatus,
        r.homeScore !== null ? r.homeScore : '',
        r.awayScore !== null ? r.awayScore : '',
        r.cheerTeamId,
        resLabel,
        r.watchStatus,
        r.seatInfo.seatTypeName || r.seatInfo.seatTypeId || '',
        r.seatInfo.area || '',
        r.seatInfo.row || '',
        r.seatInfo.seatNumber || '',
        `"${(r.companions || '').replace(/"/g, '""')}"`,
        r.costInfo.totalPrice ?? '',
        r.costInfo.myExpense ?? '',
        r.ticketInfo.status,
        `"${(r.watchMemo || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `baseball_watch_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <BaseballContext.Provider
      value={{
        records,
        activeTab,
        setActiveTab,
        selectedRecordId,
        setSelectedRecordId,
        isFormModalOpen,
        setIsFormModalOpen,
        editingRecord,
        setEditingRecord,
        selectedYear,
        setSelectedYear,
        availableYears,
        selectedCategory,
        setSelectedCategory,
        theme,
        setTheme,
        isDarkMode,
        addRecord,
        updateRecord,
        deleteRecord,
        resetToDemoData,
        importRecords,
        exportToJSON,
        exportToCSV,
        supabaseConfig,
        updateSupabaseConfig,
      }}
    >
      {children}
    </BaseballContext.Provider>
  );
};

export const useBaseball = () => {
  const ctx = useContext(BaseballContext);
  if (!ctx) {
    throw new Error('useBaseball must be used within a BaseballProvider');
  }
  return ctx;
};
