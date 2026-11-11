/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { normalizeRecordTickets, normalizeStoredRecords } from '../utils/ticketRecords';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { MatchRecord, CategoryId, Stadium, SeatTypeMaster } from '../types/baseball';
import { STADIUMS } from '../data/stadiums';
import { INITIAL_SEED_RECORDS } from '../data/seedData';
import { getMatchResult } from '../utils/baseballUtils';
import { getSupabaseConnection, saveSupabaseConnection, SupabaseConnection } from '../lib/supabase';
import { deleteMatchRecord, SavedRecordRefreshRequiredError, isAtomicSaveEnabled, loadRecordTables, saveMatchRecordWithPhase2, toMatchRecord } from '../lib/supabaseRecords';
import { Session, User } from '@supabase/supabase-js';
import { createTicketOnlySaveController, isV2TicketWriteEnabled } from '../lib/atomic/ticketSaveBridge';
import { createFullFormV2SaveController, isV2FullFormWriteEnabled } from '../lib/atomic/fullFormSaveBridge';
import type { TicketEditorDraft } from '../lib/atomic/ticketEditorDraft';
import type { V2SaveController, SavePhase } from '../lib/atomic/adapter';
import { reviewPendingSaveReadOnly, type PendingReview } from '../lib/atomic/pendingSaveReview';
import { assertNoPendingSave, beginPendingSave, clearConfirmedPendingSave, markPendingSave, readPendingSave, type PendingSaveMarker } from '../lib/atomic/pendingSaveGuard';

const STORAGE_KEY = 'baseball_watch_log_data_v3_excel';
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
  addRecord: (record: Omit<MatchRecord, 'id' | 'createdAt' | 'updatedAt' | 'tickets'>) => Promise<MatchRecord>;
  updateRecord: (record: MatchRecord) => Promise<void>;
  v2TicketWriteEnabled: boolean;
  v2FullFormWriteEnabled: boolean;
  saveFullFormV2: (original: MatchRecord, edited: MatchRecord, draft: TicketEditorDraft) => Promise<{phase: SavePhase; message?: string}>;
  saveTicketEditsV2: (record: MatchRecord, draft: TicketEditorDraft) => Promise<{phase: SavePhase; message?: string}>;
  refreshTicketEditsV2: () => Promise<{phase: SavePhase; message?: string}>;
  getV2PendingSaveNotice: (matchId: string) => string | null;
  reviewPendingSaveV2: (matchId: string) => Promise<PendingReview>;
  deleteRecord: (id: string) => Promise<void>;
  resetToDemoData: () => void;
  importRecords: (incoming: MatchRecord[], mode: 'merge' | 'replace') => { added: number; updated: number };
  exportToJSON: () => void;
  exportToCSV: () => void;

  // Supabase設定
  supabaseConfig: SupabaseConfig;
  updateSupabaseConfig: (config: Partial<SupabaseConfig>) => void;
  authLoading: boolean;
  user: User | null;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  retryConnection: () => Promise<void>;
  stadiums: Stadium[];
}

const BaseballContext = createContext<BaseballContextType | undefined>(undefined);

export const BaseballProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<SupabaseConnection | null>(() => getSupabaseConnection());
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [masterDataError, setMasterDataError] = useState<string | null>(null);
  const [stadiums, setStadiums] = useState<Stadium[]>(() => getSupabaseConnection() ? [] : STADIUMS);
  const localStorageBlocked = useRef(false);
  // 記録データ（観戦記録.xlsx の全259試合実データ）
  const [records, setRecords] = useState<MatchRecord[]>(() => {
    if (getSupabaseConnection()) return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return normalizeStoredRecords(parsed);
      }
    } catch (e) {
      localStorageBlocked.current = true;
      console.error('Failed to load records from localStorage', e);
      return [];
    }
    return INITIAL_SEED_RECORDS;
  });

  const user = session?.user || null;
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (!connection) {
      setAuthLoading(false);
      return;
    }

    let active = true;
    const client = connection.client;
    client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthError(`認証状態の取得に失敗しました: ${error.message}`);
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setAuthLoading(false);
      if (!nextSession) {
        setIsAuthorized(false);
        setRecords([]);
      }
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [connection]);

  const loadRemoteData = async () => {
    if (!connection || !user) return;
    setAuthError(null);
    setMasterDataError(null);
    const authResult = await connection.client
      .from('authorized_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (authResult.error) throw new Error(`本人承認状態の取得に失敗しました: ${authResult.error.message}`);
    if (!authResult.data) {
      setIsAuthorized(false);
      setAuthError('このAuthユーザーはauthorized_usersで承認されていません。管理者による本人承認が必要です。');
      setRecords([]);
      return;
    }
    setIsAuthorized(true);
    const masters = await Promise.all([
      connection.client.from('teams').select('*').order('display_order'),
      connection.client.from('stadiums').select('*').order('display_order'),
      connection.client.from('categories').select('*').order('display_order'),
      connection.client.from('seat_types').select('*').order('display_order'),
      connection.client.from('stadium_seat_types').select('stadium_id, seat_type_id'),
    ]);
    const masterError = masters.find(result => result.error)?.error;
    if (masterError) throw new Error(`マスターデータの読み込みに失敗しました: ${masterError.message}`);
    const stadiumRows = masters[1].data as Array<{
      id: string;
      name: string;
      short_name: string;
      location: string | null;
      home_team_id: string | null;
      is_dome: boolean;
      display_order: number;
    }>;
    const seatRows = masters[3].data as Array<{
      id: string;
      name: string;
      display_name: string;
      category: SeatTypeMaster['category'];
      price_range: string | null;
      display_order: number;
    }>;
    const stadiumSeatRows = masters[4].data as Array<{ stadium_id: string; seat_type_id: string }>;
    const seatMap = new Map(seatRows.map(row => [row.id, row]));
    setStadiums(stadiumRows.map(row => ({
      id: row.id,
      name: row.name,
      shortName: row.short_name,
      location: row.location || '',
      homeTeamId: row.home_team_id || undefined,
      isDome: row.is_dome,
      order: row.display_order,
      seatTypes: stadiumSeatRows
        .filter(link => link.stadium_id === row.id)
        .map(link => seatMap.get(link.seat_type_id))
        .filter((seat): seat is NonNullable<typeof seat> => Boolean(seat))
        .map(seat => ({
          id: seat.id,
          name: seat.name,
          displayName: seat.display_name,
          category: seat.category,
          priceRange: seat.price_range || undefined,
          order: seat.display_order,
        })),
    })));
    const tables = await loadRecordTables(connection.client, isAtomicSaveEnabled);
    const watches = new Map(tables.watches.map(row => [row.match_id, row]));
    const seats = new Map(tables.seats.map(row => [row.watch_record_id, row]));
      const tickets = new Map<string, typeof tables.tickets>();
      for (const ticket of tables.tickets) {
        const current = tickets.get(ticket.match_id) || [];
        current.push(ticket);
        tickets.set(ticket.match_id, current);
      }
    setRecords(tables.matches.map(match => {
      const watch = watches.get(match.id);
      return toMatchRecord(
        match,
        watch,
        tables.categories,
        watch ? seats.get(watch.id) : undefined,
        tickets.get(match.id) || [],
        isAtomicSaveEnabled ? {
          innings: tables.innings || [],
          totals: tables.totals || [],
          pitchers: tables.pitchers || [],
          events: tables.events || [],
          links: tables.links || [],
          splits: tables.splits || [],
        } : undefined,
      );
    }));
  };

  useEffect(() => {
    if (!connection || !user) return;
    loadRemoteData().catch(error => {
      setAuthError(error instanceof Error ? error.message : 'Supabaseデータの読み込みに失敗しました。');
      setRecords([]);
    });
  }, [connection, user?.id]);

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
    if (connection) return;
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
    if (config.anonKey && (config.anonKey.includes('service_role') || config.anonKey.startsWith('sb_secret_'))) {
      throw new Error('service_role keyやsecret keyはブラウザ設定に保存できません。Publishable Keyを使用してください。');
    }
    setSupabaseConfig(prev => {
      const next = { ...prev, ...config };
      localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(next));
      if (next.url && next.anonKey) {
        saveSupabaseConnection(next.url, next.anonKey);
        setConnection(getSupabaseConnection());
      }
      return next;
    });
  };

  const signIn = async (email: string, password: string) => {
    if (!connection) throw new Error('Supabase URLとPublishable Keyを設定してください。');
    const { error } = await connection.client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(`ログインに失敗しました: ${error.message}`);
  };

  const signOut = async () => {
    if (!connection) return;
    const { error } = await connection.client.auth.signOut();
    if (error) throw new Error(`ログアウトに失敗しました: ${error.message}`);
  };

  const retryConnection = async () => {
    setConnection(getSupabaseConnection());
  };

  // ローカルストレージへの永続化
  useEffect(() => {
    try {
      if (!localStorageBlocked.current && !connection) localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save records to localStorage', e);
    }
  }, [records, connection]);

  // CRUD
  const addRecord = async (data: Omit<MatchRecord, 'id' | 'createdAt' | 'updatedAt' | 'tickets'>): Promise<MatchRecord> => {
    if (!connection && localStorageBlocked.current) throw new Error('保存済みデータが不正なため上書きを停止しています。元データを確認してください。');
    const now = new Date().toISOString();
    const newRecord: MatchRecord = normalizeRecordTickets({
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
    if (connection && user) {
      let refreshRequired = false;
      let savedUpdatedAt = newRecord.updatedAt;
      {
        const result = await saveMatchRecordWithPhase2(connection.client, user.id, newRecord, true);
        if (result?.updated_at) savedUpdatedAt = result.updated_at;
        refreshRequired = !!(result && 'refreshRequired' in result && result.refreshRequired);
      }
      setRecords(prev => [{ ...newRecord, updatedAt: savedUpdatedAt }, ...prev]);
      if (refreshRequired) throw new SavedRecordRefreshRequiredError();
    } else {
      setRecords(prev => [newRecord, ...prev]);
    }
    return newRecord;
  };

  const updateRecord = async (updated: MatchRecord): Promise<void> => {
    if (!connection && localStorageBlocked.current) throw new Error('保存済みデータが不正なため上書きを停止しています。元データを確認してください。');
    if (connection && user) assertNoPendingSave(user.id, updated.id);
    updated = normalizeRecordTickets(updated);
    if (updated.tickets.length > 1) throw new Error('複数チケットがあるため保存できません');
    let refreshRequired = false;
    let savedUpdatedAt = connection ? updated.updatedAt : new Date().toISOString();
    if (connection && user) {
      {
        const result = await saveMatchRecordWithPhase2(connection.client, user.id, updated, false);
        if (result?.updated_at) savedUpdatedAt = result.updated_at;
        refreshRequired = !!(result && 'refreshRequired' in result && result.refreshRequired);
      }
    }
    setRecords(prev => prev.map(r => (r.id === updated.id ? { ...updated, updatedAt: savedUpdatedAt } : r)));
    if (refreshRequired) throw new SavedRecordRefreshRequiredError();
  };

  // Keep an ambiguous or committed-but-not-synced intent alive. Never reconstruct
  // a new controller to retry writes or discard an unknown outcome automatically.
  const ticketV2Pending = useRef<{ matchId: string; controller: V2SaveController; marker: PendingSaveMarker } | null>(null);
  const getV2PendingSaveNotice = (matchId: string): string | null => {
    if (!user || !connection) return null;
    try {
      const marker = readPendingSave(user.id, matchId);
      return marker ? `この試合には${marker.startedAt}開始の保存確認待ちがあります。ページを再読み込みしても再送信はできません。保存内容を読み取り、手動で照合してください。` : null;
    } catch (error) { return error instanceof Error ? error.message : '保存確認記録を確認できません。'; }
  };
  const reviewPendingSaveV2 = async (matchId: string): Promise<PendingReview> => {
    if (!connection || !user || !isAuthorized) {
      return {status:'unavailable', message:'認証または接続が利用できないため確認できません。保存停止は維持します。'};
    }
    // Explicit READ ONLY. Never call save(), clear markers, or invoke legacy REST.
    return reviewPendingSaveReadOnly(connection.client, user.id, matchId);
  };
  const finishV2Pending = (phase: SavePhase) => {
    const pending = ticketV2Pending.current;
    if (!pending) return;
    if (phase === 'completed' || phase === 'conflict' || phase === 'rejected') {
      clearConfirmedPendingSave(pending.marker);
      ticketV2Pending.current = null;
    } else if (phase === 'partial_or_unknown' || phase === 'saved_syncing' || phase === 'saved_sync_failed') {
      markPendingSave(pending.marker, phase);
    }
  };
  const presentTicketState = (phase: SavePhase, message?: string) => ({phase, message});
  const acceptTicketSnapshot = (controller: V2SaveController) => {
    const state = controller.getState();
    if (state.phase !== 'completed' || !state.snapshot) return;
    if (state.snapshot.record.matchStatus === 'postponed') {
      throw new Error('延期状態の試合は現行画面に安全に反映できません。再取得が必要です。');
    }
    const restored = normalizeRecordTickets(state.snapshot.record as MatchRecord);
    setRecords(previous => previous.map(item => item.id === restored.id ? restored : item));
  };
  const saveTicketEditsV2 = async (record: MatchRecord, draft: TicketEditorDraft) => {
    if (!isV2TicketWriteEnabled() || !connection || !user || !isAuthorized) {
      throw new Error('Atomic RPC v2保存は現在利用できません。変更は送信されていません。');
    }
    if (ticketV2Pending.current) throw new Error('以前の保存結果を確認中です。再送信はできません。');
    assertNoPendingSave(user.id, record.id);
    const controller = await createTicketOnlySaveController(connection.client, user.id, record, draft);
    const marker = beginPendingSave(user.id, record.id, 'ticket');
    ticketV2Pending.current = {matchId:record.id, controller, marker};
    const result = await controller.save();
    if (result.phase === 'completed') acceptTicketSnapshot(controller);
    finishV2Pending(result.phase);
    return presentTicketState(result.phase, result.issue?.message);
  };
  const saveFullFormV2 = async (original: MatchRecord, edited: MatchRecord, draft: TicketEditorDraft) => {
    if (!isV2FullFormWriteEnabled() || !connection || !user || !isAuthorized) {
      throw new Error('フォーム全体のAtomic RPC v2保存は利用できません。変更は送信されていません。');
    }
    if (ticketV2Pending.current) throw new Error('以前の保存結果を確認中です。再送信はできません。');
    assertNoPendingSave(user.id, original.id);
    const controller = await createFullFormV2SaveController(connection.client, user.id, original, edited, draft);
    const marker = beginPendingSave(user.id, original.id, 'full_form');
    ticketV2Pending.current = {matchId:original.id, controller, marker};
    const result = await controller.save();
    if (result.phase === 'completed') acceptTicketSnapshot(controller);
    finishV2Pending(result.phase);
    return presentTicketState(result.phase, result.issue?.message);
  };
  const refreshTicketEditsV2 = async () => {
    const pending = ticketV2Pending.current;
    if (!pending) throw new Error('確認待ちの保存はありません。');
    if (!connection || !user || !isAuthorized) throw new Error('認証状態が変わったため、再確認できません。');
    const result = await pending.controller.refresh();
    if (result.phase === 'completed') acceptTicketSnapshot(pending.controller);
    finishV2Pending(result.phase);
    return presentTicketState(result.phase, result.issue?.message);
  };

  const deleteRecord = async (id: string): Promise<void> => {
    if (connection && user) { assertNoPendingSave(user.id, id); await deleteMatchRecord(connection.client, user.id, id); }
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
    incoming = normalizeStoredRecords(incoming);
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
        v2TicketWriteEnabled: isV2TicketWriteEnabled(),
        v2FullFormWriteEnabled: isV2FullFormWriteEnabled(),
        saveFullFormV2,
        saveTicketEditsV2,
        refreshTicketEditsV2,
        getV2PendingSaveNotice,
        reviewPendingSaveV2,
        deleteRecord,
        resetToDemoData,
        importRecords,
        exportToJSON,
        exportToCSV,
        supabaseConfig,
        updateSupabaseConfig,
        authLoading,
        user,
        isAuthenticated,
        isAuthorized,
        authError: authError || masterDataError,
        signIn,
        signOut,
        retryConnection,
        stadiums,
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
