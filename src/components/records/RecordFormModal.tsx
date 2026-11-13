/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedRecordRefreshRequiredError } from '../../lib/supabaseRecords';
import { editRecordTicket } from '../../utils/ticketRecords';
import { beginTicketEditor } from '../../lib/atomic/ticketEditorDraft';
import { assembleFullFormEdit } from '../../lib/atomic/fullFormSaveBridge';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useBaseball } from '../../context/BaseballContext';
import {
  MatchRecord,
  MatchType,
  MatchStatus,
  WatchStatus,
  CategoryId,
} from '../../types/baseball';
import { TEAMS, CATEGORIES } from '../../data/teams';
import { OFFICIAL_SEAT_TYPES_2026 } from '../../data/officialSeatTypes2026';
import {
  X,
  Check,
  Plus,
  AlertTriangle,
} from 'lucide-react';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecord?: MatchRecord | null;
}

/** 同行者文字列を「、」「,」で分割して個人名の配列にする */
function splitCompanionNames(value: string): string[] {
  return value
    .split(/[,、]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/** 本塁打エントリ（例:「細川成也 21号2ラン(3回裏・戸郷)」）から先頭の選手名部分を抽出する */
function extractHomeRunPlayer(value: string): string {
  const first = value.split(/[\s　]+/)[0]?.trim() || '';
  return first;
}

/** イニング別得点の合計（R）。数値でない入力（'X'など）は0として扱う */
function sumInningRuns(values: string[]): number {
  return values.reduce((sum, v) => {
    const n = v.trim() === '' ? 0 : Number(v);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
}

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  isOpen,
  onClose,
  initialRecord,
}) => {
  const { records, addRecord, updateRecord, stadiums, v2FullFormWriteEnabled, saveFullFormV2, refreshTicketEditsV2, getV2PendingSaveNotice, reviewPendingSaveV2 } = useBaseball();

  // Active step in the form wizard (1: 試合, 2: 観戦, 3: 座席, 4: 費用, 5: 詳細スコア)
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInProgress = useRef(false);
  const saveNeedsRefresh = useRef(false);
  useEffect(() => {
    if (!isOpen) saveNeedsRefresh.current = false;
  }, [isOpen]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingReview, setPendingReview] = useState<string | null>(null);
  const [pendingReviewBusy, setPendingReviewBusy] = useState(false);
  useEffect(() => { setPendingReview(null); }, [initialRecord?.id, isOpen]);

  // Form State
  const [date, setDate] = useState('2026-09-20');
  const [time, setTime] = useState('14:00');
  const [isDateUnknown, setIsDateUnknown] = useState(false);
  const [homeTeamId, setHomeTeamId] = useState('dragons');
  const [awayTeamId, setAwayTeamId] = useState('tigers');
  const [stadiumId, setStadiumId] = useState('vantelin_dome');
  const [stadiumCustom, setStadiumCustom] = useState('');
  const [matchType, setMatchType] = useState<MatchType>('official');
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('finished');
  const [homeScore, setHomeScore] = useState<string>('4');
  const [awayScore, setAwayScore] = useState<string>('2');
  const [isScoreConfirmed, setIsScoreConfirmed] = useState(true);
  const [durationHours, setDurationHours] = useState<string>('3');
  const [durationMinutes, setDurationMinutes] = useState<string>('5');

  // Watch info
  const [watchStatus, setWatchStatus] = useState<WatchStatus>('watched');
  const [cheerTeamId, setCheerTeamId] = useState('dragons');
  const [categories, setCategories] = useState<CategoryId[]>(['dragons_1st']);
  const [primaryCategory, setPrimaryCategory] = useState<CategoryId>('dragons_1st');
  const [companionTags, setCompanionTags] = useState<string[]>([]);
  const [companionInput, setCompanionInput] = useState('');
  const [watchMemo, setWatchMemo] = useState('');

  // Seat info
  const [seatTypeId, setSeatTypeId] = useState('');
  const [seatTypeName, setSeatTypeName] = useState('');
  const [area, setArea] = useState('1塁側');
  const [row, setRow] = useState('15');
  const [seatNumber, setSeatNumber] = useState('32');

  // Cost info (自己負担額のみをフォームで扱う。ほかは保存時に initialRecord から引き継ぐ)
  const [myExpense, setMyExpense] = useState<string>('4800');
  const [v2TicketPhase, setV2TicketPhase] = useState<string | null>(null);

  // Batter & Pitchers info
  const [homeStarter, setHomeStarter] = useState('');
  const [awayStarter, setAwayStarter] = useState('');
  const [winningPitcher, setWinningPitcher] = useState('');
  const [losingPitcher, setLosingPitcher] = useState('');
  const [savePitcher, setSavePitcher] = useState('');
  const [homeRunEntries, setHomeRunEntries] = useState<string[]>([]);
  const [events, setEvents] = useState('');
  const [notes, setNotes] = useState('');

  // Inning scores
  const [awayInnings, setAwayInnings] = useState<string[]>(Array(9).fill(''));
  const [homeInnings, setHomeInnings] = useState<string[]>(Array(9).fill(''));
  const [awayHits, setAwayHits] = useState('');
  const [homeHits, setHomeHits] = useState('');
  const [awayErrors, setAwayErrors] = useState('');
  const [homeErrors, setHomeErrors] = useState('');

  // Initialize or reset form when initialRecord changes
  useEffect(() => {
    setV2TicketPhase(null);
    if (initialRecord) {
      setDate(initialRecord.date || '');
      setTime(initialRecord.time || '');
      setIsDateUnknown(initialRecord.isDateUnknown || false);
      setHomeTeamId(initialRecord.homeTeamId);
      setAwayTeamId(initialRecord.awayTeamId);
      setStadiumId(initialRecord.stadiumId);
      setStadiumCustom(initialRecord.stadiumCustom || '');
      setMatchType(initialRecord.matchType);
      setMatchStatus(initialRecord.matchStatus);
      setHomeScore(initialRecord.homeScore !== null ? String(initialRecord.homeScore) : '');
      setAwayScore(initialRecord.awayScore !== null ? String(initialRecord.awayScore) : '');
      setIsScoreConfirmed(initialRecord.isScoreConfirmed);
      if (initialRecord.matchDurationMinutes && initialRecord.matchDurationMinutes > 0) {
        const h = Math.floor(initialRecord.matchDurationMinutes / 60);
        const m = initialRecord.matchDurationMinutes % 60;
        setDurationHours(h > 0 ? String(h) : '');
        setDurationMinutes(m > 0 ? String(m) : '');
      } else {
        setDurationHours('');
        setDurationMinutes('');
      }

      setWatchStatus(initialRecord.watchStatus);
      setCheerTeamId(initialRecord.cheerTeamId);
      setCategories(initialRecord.categories || ['dragons_1st']);
      setPrimaryCategory(initialRecord.primaryCategory || 'dragons_1st');
      setCompanionTags(splitCompanionNames(initialRecord.companions || ''));
      setWatchMemo(initialRecord.watchMemo || '');

      setSeatTypeId(initialRecord.seatInfo.seatTypeId || '');
      setSeatTypeName(initialRecord.seatInfo.seatTypeName || '');
      setArea(initialRecord.seatInfo.area || '');
      setRow((initialRecord.seatInfo.row || '').replace(/[^0-9]/g, ''));
      setSeatNumber((initialRecord.seatInfo.seatNumber || '').replace(/[^0-9]/g, ''));

      setMyExpense(initialRecord.costInfo.myExpense !== null && initialRecord.costInfo.myExpense !== undefined ? String(initialRecord.costInfo.myExpense) : '');

      setHomeStarter(initialRecord.pitchers?.homeStarter || '');
      setAwayStarter(initialRecord.pitchers?.awayStarter || '');
      setWinningPitcher(initialRecord.pitchers?.winningPitcher || '');
      setLosingPitcher(initialRecord.pitchers?.losingPitcher || '');
      setSavePitcher(initialRecord.pitchers?.savePitcher || '');
      setHomeRunEntries(initialRecord.homeRuns ? [...initialRecord.homeRuns] : []);
      setEvents(initialRecord.events || '');
      setNotes(initialRecord.notes || '');

      if (initialRecord.innings) {
        setAwayInnings(initialRecord.innings.away.map(v => v !== null ? String(v) : ''));
        setHomeInnings(initialRecord.innings.home.map(v => v !== null ? String(v) : ''));
        setAwayHits(initialRecord.innings.awayHits !== null && initialRecord.innings.awayHits !== undefined ? String(initialRecord.innings.awayHits) : '');
        setHomeHits(initialRecord.innings.homeHits !== null && initialRecord.innings.homeHits !== undefined ? String(initialRecord.innings.homeHits) : '');
        setAwayErrors(initialRecord.innings.awayErrors !== null && initialRecord.innings.awayErrors !== undefined ? String(initialRecord.innings.awayErrors) : '');
        setHomeErrors(initialRecord.innings.homeErrors !== null && initialRecord.innings.homeErrors !== undefined ? String(initialRecord.innings.homeErrors) : '');
      }
    } else {
      // Default new record
      const today = new Date().toISOString().slice(0, 10);
      setDate(today);
      setTime('14:00');
      setIsDateUnknown(false);
      setHomeTeamId('dragons');
      setAwayTeamId('tigers');
      setStadiumId('vantelin_dome');
      setMatchType('official');
      setMatchStatus('scheduled');
      setHomeScore('');
      setAwayScore('');
      setIsScoreConfirmed(false);
      setWatchStatus('scheduled');
      setCheerTeamId('dragons');
      setCategories(['dragons_1st']);
      setPrimaryCategory('dragons_1st');
      setCompanionTags([]);
      setCompanionInput('');
      setMyExpense('');
      setDurationHours('');
      setDurationMinutes('');
      setRow('');
      setSeatNumber('');
      setSeatTypeId('');
      setSeatTypeName('');
      setHomeStarter('');
      setAwayStarter('');
      setWinningPitcher('');
      setLosingPitcher('');
      setSavePitcher('');
      setHomeRunEntries([]);
      setEvents('');
      setNotes('');
      setAwayInnings(Array(9).fill(''));
      setHomeInnings(Array(9).fill(''));
    }
    setActiveStep(1);
    setErrorMessage(null);
  }, [initialRecord, isOpen]);

  // Selected Stadium seat types
  const currentStadium = stadiums.find(stadium => stadium.id === stadiumId) || {
    id: stadiumId,
    name: '球場マスター読み込み中',
    shortName: '',
    location: '',
    isDome: false,
    order: 0,
    seatTypes: [],
  };

  // 席種の入力方式は球場で決まる: バンテリンドームはプルダウンのみ、それ以外は自由入力のみ
  const isVantelinDome = stadiumId === 'vantelin_dome';

  // 過去の入力から集めた候補（datalist / チップ用）。重複を除く。
  const pastCompanions = useMemo(() => {
    const names = new Set<string>();
    records.forEach(r => {
      splitCompanionNames(r.companions || '').forEach(n => names.add(n));
    });
    return [...names];
  }, [records]);

  const pastSeatTypes = useMemo(() => {
    const names = new Set<string>();
    records.forEach(r => {
      const name = (r.seatInfo?.seatTypeName || '').trim();
      if (name && !OFFICIAL_SEAT_TYPES_2026.includes(name)) names.add(name);
    });
    return [...names];
  }, [records]);

  const pastPitchers = useMemo(() => {
    const names = new Set<string>();
    records.forEach(r => {
      const p = r.pitchers;
      if (!p) return;
      [p.homeStarter, p.awayStarter, p.winningPitcher, p.losingPitcher, p.savePitcher].forEach(n => {
        const name = (n || '').trim();
        if (name) names.add(name);
      });
    });
    return [...names];
  }, [records]);

  const pastHomeRunPlayers = useMemo(() => {
    const names = new Set<string>();
    records.forEach(r => {
      (r.homeRuns || []).forEach(hr => {
        const name = extractHomeRunPlayer(hr);
        if (name) names.add(name);
      });
    });
    return [...names];
  }, [records]);

  // 応援チームは対戦2チームからのみ選ぶ。ホーム／ビジターが変わって現在の
  // 応援チームが2チームに含まれなくなったらホームチームにリセットする。
  const matchupTeamIds = useMemo(() => {
    const ids = [homeTeamId, awayTeamId].filter(Boolean);
    return [...new Set(ids)];
  }, [homeTeamId, awayTeamId]);
  useEffect(() => {
    if (cheerTeamId && !matchupTeamIds.includes(cheerTeamId)) {
      setCheerTeamId(homeTeamId);
    }
  }, [matchupTeamIds, cheerTeamId, homeTeamId]);

  // NOTE: この early return は全フックの後でなければならない。フックより前に
  // 置くと、閉じている時と開いた時でフックの数が変わり、React が
  // "Rendered more hooks than during the previous render" で落ちて画面が真っ白になる。
  if (!isOpen) return null;

  // 同行者タグの追加／削除
  const addCompanion = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || companionTags.includes(trimmed)) return;
    setCompanionTags(prev => [...prev, trimmed]);
  };
  const removeCompanion = (name: string) => {
    setCompanionTags(prev => prev.filter(t => t !== name));
  };

  // イニングの追加／削除（9〜12回）
  const addInning = () => {
    if (awayInnings.length >= 12) return;
    setAwayInnings(prev => [...prev, '']);
    setHomeInnings(prev => [...prev, '']);
  };
  const removeInning = () => {
    if (awayInnings.length <= 9) return;
    setAwayInnings(prev => prev.slice(0, -1));
    setHomeInnings(prev => prev.slice(0, -1));
  };

  // 本塁打エントリの追加／削除／更新
  const addHomeRunEntry = () => {
    setHomeRunEntries(prev => [...prev, '']);
  };
  const removeHomeRunEntry = (index: number) => {
    setHomeRunEntries(prev => prev.filter((_, i) => i !== index));
  };
  const updateHomeRunEntry = (index: number, value: string) => {
    setHomeRunEntries(prev => prev.map((v, i) => (i === index ? value : v)));
  };

  // 席種セレクトの表示値。球場マスタのID・公式席種名・過去の席種名のいずれかを指す。
  const seatTypeSelectValue = seatTypeId
    ? seatTypeId
    : seatTypeName && OFFICIAL_SEAT_TYPES_2026.includes(seatTypeName)
      ? `official:${seatTypeName}`
      : seatTypeName && pastSeatTypes.includes(seatTypeName)
        ? `past:${seatTypeName}`
        : '';

  const handleSeatTypeSelect = (value: string) => {
    if (value.startsWith('official:')) {
      setSeatTypeId('');
      setSeatTypeName(value.slice('official:'.length));
    } else if (value.startsWith('past:')) {
      setSeatTypeId('');
      setSeatTypeName(value.slice('past:'.length));
    } else {
      setSeatTypeId(value);
      setSeatTypeName('');
    }
  };

  // 自由入力モード（バンテリンドーム以外）で、既存レコードが球場マスタの席種IDを
  // 持っている場合に現在の席種名を表示するための参照
  const selectedMasterSeatType = seatTypeId
    ? currentStadium.seatTypes.find(st => st.id === seatTypeId)
    : undefined;

  // Toggle Category selection (multi-select)
  const toggleCategory = (catId: CategoryId) => {
    setCategories(prev => {
      let next: CategoryId[];
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev; // At least one
        next = prev.filter(c => c !== catId);
      } else {
        next = [...prev, catId];
      }
      if (!next.includes(primaryCategory)) {
        setPrimaryCategory(next[0]);
      }
      return next;
    });
  };

  const refreshTicketsOnlyV2 = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await refreshTicketEditsV2();
      setV2TicketPhase(result.phase);
      if (result.phase === 'completed') onClose();
      else setErrorMessage(result.phase === 'partial_or_unknown'
        ? '読取結果だけでは保存の成否を断定できません。再送信はしないでください。'
        : result.message || '保存済みデータとの同期を確認できませんでした。');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '再確認に失敗しました。');
    } finally { setIsSubmitting(false); }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitInProgress.current || saveNeedsRefresh.current) return;
    submitInProgress.current = true;
    setErrorMessage(null);

    // Validation 1: Home != Away
    if (homeTeamId === awayTeamId) {
      setErrorMessage('ホームチームとビジターチームには異なる球団を選択してください。');
      setActiveStep(1);
      submitInProgress.current = false;
      return;
    }

    // Validation 2: Score parsing (strict differentiation between 0 and null!)
    const parsedHomeScore = homeScore.trim() !== '' ? Number(homeScore) : null;
    const parsedAwayScore = awayScore.trim() !== '' ? Number(awayScore) : null;

    if (parsedHomeScore !== null && isNaN(parsedHomeScore)) {
      setErrorMessage('ホーム得点は有効な数値を入力してください。');
      submitInProgress.current = false;
      return;
    }
    if (parsedAwayScore !== null && isNaN(parsedAwayScore)) {
      setErrorMessage('ビジター得点は有効な数値を入力してください。');
      submitInProgress.current = false;
      return;
    }

    // Parse Costs (自己負担額のみをフォームで扱う)
    const parsedMyExpense = myExpense.trim() !== '' ? Number(myExpense) : null;
    
    // Parse Duration (○時間○分から分換算)
    let parsedDuration: number | null = null;
    const h = durationHours.trim() !== '' ? parseInt(durationHours, 10) : 0;
    const m = durationMinutes.trim() !== '' ? parseInt(durationMinutes, 10) : 0;
    if (durationHours.trim() !== '' || durationMinutes.trim() !== '') {
      parsedDuration = (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
      if (parsedDuration <= 0) parsedDuration = null;
    }

    // Parse Innings
    const hasInnings = awayInnings.some(v => v.trim() !== '') || homeInnings.some(v => v.trim() !== '');
    let inningsData = undefined;
    if (hasInnings) {
      inningsData = {
        away: awayInnings.map(v => v.trim() !== '' ? Number(v) : null),
        home: homeInnings.map(v => (v.trim() === 'X' || v.trim() === 'x') ? ('X' as const) : v.trim() !== '' ? Number(v) : null),
        awayHits: awayHits.trim() !== '' ? Number(awayHits) : null,
        homeHits: homeHits.trim() !== '' ? Number(homeHits) : null,
        awayErrors: awayErrors.trim() !== '' ? Number(awayErrors) : null,
        homeErrors: homeErrors.trim() !== '' ? Number(homeErrors) : null,
      };
    }

    // Parse Home runs (複数エントリのうち空でないもの)
    const parsedHomeRuns = homeRunEntries
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const recordPayload: Omit<MatchRecord, 'id' | 'createdAt' | 'updatedAt' | 'tickets'> = {
      date: isDateUnknown ? '' : date,
      time: time || undefined,
      isDateUnknown,
      homeTeamId,
      awayTeamId,
      stadiumId,
      stadiumCustom: stadiumId === 'other_stadium' ? stadiumCustom : undefined,
      matchType,
      matchStatus,
      homeScore: parsedHomeScore,
      awayScore: parsedAwayScore,
      isScoreConfirmed,
      matchDurationMinutes: parsedDuration,
      innings: inningsData,
      pitchers: {
        homeStarter: homeStarter || undefined,
        awayStarter: awayStarter || undefined,
        winningPitcher: winningPitcher || undefined,
        losingPitcher: losingPitcher || undefined,
        savePitcher: savePitcher || undefined,
      },
      homeRuns: parsedHomeRuns,
      events: events || undefined,
      notes: notes || undefined,

      watchStatus,
      cheerTeamId,
      categories,
      primaryCategory,
      seatInfo: {
        seatTypeId: seatTypeId || undefined,
        seatTypeName: seatTypeName || undefined,
        area: area || undefined,
        row: row || undefined,
        seatNumber: seatNumber || undefined,
      },
      companions: companionTags.length > 0 ? companionTags.join('、') : undefined,
      watchMemo: watchMemo || undefined,
      costInfo: initialRecord
        ? { ...initialRecord.costInfo, myExpense: parsedMyExpense }
        : { myExpense: parsedMyExpense, splits: [] },
      ticketInfo: initialRecord
        ? { ...initialRecord.ticketInfo }
        : { status: 'plan_to_buy' as const },
    };

    setIsSubmitting(true);
    try {
      if (initialRecord && v2FullFormWriteEnabled) {
        // チケットはフォームの対象外のため編集せず、既存チケットをそのまま引き継ぐ。
        const { record: candidate } = assembleFullFormEdit(initialRecord, recordPayload, false);
        const draft = beginTicketEditor(candidate.tickets);
        const result = await saveFullFormV2(initialRecord, candidate, draft);
        if (result.phase === 'partial_or_unknown' || result.phase === 'saved_sync_failed') saveNeedsRefresh.current = true;
        setV2TicketPhase(result.phase);
        if (result.phase === 'completed') onClose();
        else setErrorMessage(result.phase === 'partial_or_unknown'
          ? '保存結果が不明です。再送信せず、読取で確認してください。'
          : result.phase === 'saved_sync_failed'
          ? '保存は完了しましたが同期できません。再送信せず、読取で確認してください。'
          : result.message || '保存できませんでした。');
        return;
      }
      if (initialRecord) {
        const fullRecord: MatchRecord = {
          ...recordPayload,
          id: initialRecord.id,
          createdAt: initialRecord.createdAt,
          updatedAt: initialRecord.updatedAt,
          tickets: initialRecord.tickets,
        };
        // 複数チケットの記録は editRecordTicket が扱えないため、そのまま保存する。
        // チケット自体は initialRecord.tickets を引き継いでおり、失われない。
        // なお従来の保存経路（updateRecord / Supabase）は複数チケットを保存できない
        // ため、その場合はバックエンド側のエラーが表示される。
        const toSave = initialRecord.tickets.length > 1
          ? fullRecord
          : editRecordTicket(fullRecord, recordPayload.ticketInfo);
        await updateRecord(toSave);
      } else {
        await addRecord(recordPayload);
      }
      onClose();
    } catch (err: any) {
      if (err instanceof SavedRecordRefreshRequiredError) saveNeedsRefresh.current = true;
      setErrorMessage(err?.message || '保存に失敗しました。');
    } finally {
      setIsSubmitting(false);
      submitInProgress.current = false;
    }
  };

  const steps = [
    { num: 1, label: '試合情報' },
    { num: 2, label: '観戦情報' },
    { num: 3, label: '座席情報' },
    { num: 4, label: '費用' },
    { num: 5, label: 'スコア詳細' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
              {initialRecord ? '観戦記録の編集' : '新規観戦記録'}
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {initialRecord ? '試合情報・観戦ログの更新' : '試合を記録する'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 overflow-x-auto text-xs shrink-0">
          {steps.map(step => (
            <button
              key={step.num}
              type="button"
              onClick={() => setActiveStep(step.num)}
              className={`py-3 px-3 font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeStep === step.num
                  ? 'border-[#003882] text-[#003882] dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${activeStep === step.num ? 'bg-[#003882] text-white dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {step.num}
              </span>
              <span>{step.label}</span>
            </button>
          ))}
        </div>

        {initialRecord && getV2PendingSaveNotice(initialRecord.id) && (
          <div role="alert" className="mx-6 mt-4 rounded-xl border border-amber-500 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <p className="font-semibold">保存確認待ちの操作があります</p>
            <p>{getV2PendingSaveNotice(initialRecord.id)}</p>
            <p>この画面から保存・削除を再実行しないでください。読み取ったDB状態だけでは以前の送信結果を確定できません。</p>
            <button type="button" disabled={pendingReviewBusy} className="mt-2 rounded-lg border border-amber-600 px-3 py-2 disabled:opacity-50" onClick={async () => {
              if (!initialRecord || pendingReviewBusy) return;
              setPendingReviewBusy(true);
              setPendingReview(null);
              try {
                const result = await reviewPendingSaveV2(initialRecord.id);
                setPendingReview(result.status === 'observed_unproven'
                  ? `${result.message} revision: ${result.revision} / 更新: ${result.updatedAt}`
                  : result.message);
              } catch {
                setPendingReview('確認処理に失敗しました。再送信は禁止のままです。');
              } finally { setPendingReviewBusy(false); }
            }}>{pendingReviewBusy ? '読み取り中…' : 'DBを読み取り専用で確認'}</button>
            {pendingReview && <p role="status" className="mt-2 whitespace-pre-wrap">{pendingReview}</p>}
          </div>
        )}
        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {v2FullFormWriteEnabled && (v2TicketPhase === 'partial_or_unknown' || v2TicketPhase === 'saved_sync_failed') && (
          <div className="mx-6 mt-3 rounded-xl border border-amber-400 p-3 text-xs">
            <p className="mb-2">保存結果を確認するまでは再保存しないでください。再読み込み後も再送信防止の記録は残りますが、元の確認用コントローラーは復元されません。可能ならこの画面で読み取り再確認してください。</p>
            <button type="button" disabled={isSubmitting} onClick={refreshTicketsOnlyV2} className="rounded-lg border border-amber-500 px-3 py-2 disabled:opacity-50">書き込まずに再確認</button>
          </div>
        )}
        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: 試合情報 */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 開催日 */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    開催日 {!isDateUnknown && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="date"
                    disabled={isDateUnknown}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
                  />
                  <label className="inline-flex items-center gap-1.5 mt-1.5 cursor-pointer text-slate-500">
                    <input
                      type="checkbox"
                      checked={isDateUnknown}
                      onChange={(e) => setIsDateUnknown(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span>開催日不明・未定</span>
                  </label>
                </div>

                {/* 開始時刻 */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    開始時刻 (デー/ナイター)
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* 対戦チーム選択（ホーム左・ビジター右） */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 sm:gap-2 items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ホームチーム（後攻） <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={homeTeamId}
                    onChange={(e) => setHomeTeamId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    {TEAMS.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.leagueName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-center">
                  <span className="px-2.5 py-1 rounded-full bg-[#003882] text-white text-xs font-bold">VS</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ビジターチーム（先攻） <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={awayTeamId}
                    onChange={(e) => setAwayTeamId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    {TEAMS.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.leagueName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 球場 & 試合種別 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    球場 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={stadiumId}
                    onChange={(e) => {
                      setStadiumId(e.target.value);
                      setSeatTypeId('');
                      setSeatTypeName('');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    {stadiums.map(stadium => (
                      <option key={stadium.id} value={stadium.id}>
                        {stadium.name}
                      </option>
                    ))}
                  </select>
                  {stadiumId === 'other_stadium' && (
                    <input
                      type="text"
                      placeholder="球場名を入力 (例: 長良川球場)"
                      value={stadiumCustom}
                      onChange={(e) => setStadiumCustom(e.target.value)}
                      className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    試合種別・大会
                  </label>
                  <select
                    value={matchType}
                    onChange={(e) => setMatchType(e.target.value as MatchType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="practice">練習試合</option>
                    <option value="open">オープン戦</option>
                    <option value="official">公式戦</option>
                    <option value="climax">クライマックスシリーズ</option>
                    <option value="nippon_series">日本シリーズ</option>
                    <option value="samurai_japan">侍ジャパン</option>
                    <option value="other">その他</option>
                  </select>
                </div>
              </div>

              {/* 試合状態（セグメント切替） */}
              <div>
                <span className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  試合状態
                </span>
                <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 p-1.5" role="group" aria-label="試合状態">
                  {([
                    { value: 'finished', label: '試合終了' },
                    { value: 'scheduled', label: '試合前・予定' },
                    { value: 'in_progress', label: '試合中' },
                    { value: 'cancelled', label: '中止' },
                  ] as { value: MatchStatus; label: string }[]).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMatchStatus(opt.value)}
                      aria-pressed={matchStatus === opt.value}
                      className={`px-2 py-2 rounded-lg text-sm font-bold transition-colors ${
                        matchStatus === opt.value
                          ? 'bg-[#003882] text-white shadow'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {matchStatus === 'scheduled' && (
                  <p className="mt-2 text-sm text-slate-500">
                    観戦予定として登録します。スコアや試合時間は試合終了後に結果登録で入力できます。
                  </p>
                )}
              </div>

              {/* スコア・試合時間（試合前・予定のときは出さない） */}
              {matchStatus !== 'scheduled' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  スコア入力
                </span>

                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 font-semibold">
                      ホーム得点
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      inputMode="numeric"
                      placeholder="—"
                      value={homeScore}
                      onChange={(e) => setHomeScore(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-display font-bold text-xl text-center"
                    />
                  </div>

                  <div className="flex items-center justify-center pb-2">
                    <span className="px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold">—</span>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1 font-semibold">
                      ビジター得点
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      inputMode="numeric"
                      placeholder="—"
                      value={awayScore}
                      onChange={(e) => setAwayScore(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-display font-bold text-xl text-center"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-slate-500">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isScoreConfirmed}
                      onChange={(e) => setIsScoreConfirmed(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span>スコア確定済み</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">試合時間:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="24"
                        inputMode="numeric"
                        placeholder="3"
                        value={durationHours}
                        onChange={(e) => setDurationHours(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-14 px-1.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-display font-bold text-sm"
                      />
                      <span className="font-bold text-slate-600 dark:text-slate-400">時間</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        inputMode="numeric"
                        placeholder="15"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-14 px-1.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-display font-bold text-sm"
                      />
                      <span className="font-bold text-slate-600 dark:text-slate-400">分</span>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>
          )}

          {/* STEP 2: 観戦情報 */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 観戦状態 */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    観戦状態 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={watchStatus}
                    onChange={(e) => setWatchStatus(e.target.value as WatchStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="watched">観戦済み</option>
                    <option value="scheduled">観戦予定</option>
                    <option value="cancelled">観戦中止・未観戦</option>
                  </select>
                </div>

                {/* 応援チーム（初期値: 中日ドラゴンズ） */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    応援チーム <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={cheerTeamId}
                    onChange={(e) => setCheerTeamId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    {matchupTeamIds.map(teamId => {
                      const team = TEAMS.find(t => t.id === teamId);
                      return (
                        <option key={teamId} value={teamId}>
                          {team ? team.name : teamId}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* 観戦カテゴリ（複数選択 & 主カテゴリ設定） */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="block font-bold text-slate-800 dark:text-slate-200">
                  観戦カテゴリ（複数選択可 · 1軍と2軍は明確に分けて集計されます）
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => {
                    const isSelected = categories.includes(cat.id);
                    const isPrimary = primaryCategory === cat.id;

                    return (
                      <div
                        key={cat.id}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-[#003882] dark:border-blue-500'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                        onClick={() => toggleCategory(cat.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{cat.shortLabel}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                        </div>
                        {isSelected && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrimaryCategory(cat.id);
                            }}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isPrimary
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {isPrimary ? '主カテゴリ' : '主カテゴリにする'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 同行者（複数人登録可：過去の入力から選択＋自由記述） */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  同行者（任意・複数人可）
                </label>
                {companionTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {companionTags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-[#003882] dark:border-blue-500 text-slate-900 dark:text-slate-100 font-semibold">
                        {tag}
                        <button type="button" onClick={() => removeCompanion(tag)} aria-label={`${tag}を外す`} className="text-slate-400 hover:text-rose-500">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="名前を入力して追加（例: 家族、友人2名）"
                    value={companionInput}
                    onChange={(e) => setCompanionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCompanion(companionInput);
                        setCompanionInput('');
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => { addCompanion(companionInput); setCompanionInput(''); }}
                    className="px-3 py-2 text-sm font-bold text-white bg-[#003882] hover:bg-[#002868] rounded-xl shrink-0"
                  >
                    追加
                  </button>
                </div>
                {pastCompanions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-xs text-slate-400 shrink-0">過去の入力:</span>
                    {pastCompanions.filter(n => !companionTags.includes(n)).map(name => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => addCompanion(name)}
                        className="px-2 py-1 text-xs rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 観戦メモ */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  観戦メモ・日記
                </label>
                <textarea
                  rows={4}
                  placeholder="打席の印象、応援の盛り上がり、球場飯の感想など自由に記録"
                  value={watchMemo}
                  onChange={(e) => setWatchMemo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          {/* STEP 3: 座席情報 */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150 text-sm">
              <p className="text-slate-500">
                席種はバンテリンドームではプルダウンから選択、それ以外の球場では自由入力で登録します。エリア・列・席番号もあわせて記録します。（未確定の予定試合は空欄可）
              </p>

              {/* 席種: バンテリンドームはプルダウンのみ、それ以外は自由入力のみ */}
              {isVantelinDome ? (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    席種プルダウン ({currentStadium.name})
                  </label>
                  <select
                    value={seatTypeSelectValue}
                    onChange={(e) => handleSeatTypeSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="">-- 席種を選択 (または未定) --</option>
                    <optgroup label="2026年公式席種">
                      {OFFICIAL_SEAT_TYPES_2026.map(name => (
                        <option key={name} value={`official:${name}`}>{name}</option>
                      ))}
                    </optgroup>
                    {pastSeatTypes.length > 0 && (
                      <optgroup label="過去に入力した席種">
                        {pastSeatTypes.map(name => (
                          <option key={name} value={`past:${name}`}>{name}</option>
                        ))}
                      </optgroup>
                    )}
                    {currentStadium.seatTypes.length > 0 && (
                      <optgroup label={`${currentStadium.name}の席種`}>
                        {currentStadium.seatTypes.map(st => (
                          <option key={st.id} value={st.id}>
                            {st.displayName} {st.priceRange && `(${st.priceRange})`}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    席種（自由入力）
                  </label>
                  <input
                    type="text"
                    placeholder="席種を入力（例: 内野指定席）"
                    value={seatTypeName}
                    onChange={(e) => {
                      setSeatTypeName(e.target.value);
                      if (e.target.value.trim()) setSeatTypeId('');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                  {selectedMasterSeatType && !seatTypeName && (
                    <p className="mt-2 text-slate-500">
                      現在の席種: {selectedMasterSeatType.displayName}（入力すると上書きされます）
                    </p>
                  )}
                </div>
              )}

              {/* 構造化入力: エリア, 列, 席番号 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    エリア・通路
                  </label>
                  <input
                    type="text"
                    placeholder="例: 内野S 1塁側 22ゲート"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    列 (整数)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      placeholder="例: 15"
                      value={row}
                      onChange={(e) => setRow(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-3 py-2 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-display font-bold text-sm"
                    />
                    <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none">
                      列
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    席番号 (整数)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      placeholder="例: 45"
                      value={seatNumber}
                      onChange={(e) => setSeatNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-3 py-2 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-display font-bold text-sm"
                    />
                    <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none">
                      番
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: 費用（自己負担額のみ） */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150 text-sm">
              <p className="text-slate-500">
                チケット代の自己負担額だけを記録します。チケットの詳細（購入先・状態など）はこのフォームでは変更しません。
              </p>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  自己負担額 (¥) ※0円と未入力を区別
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder="未設定"
                    value={myExpense}
                    onChange={(e) => setMyExpense(e.target.value)}
                    className="w-full px-3 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-display font-bold text-lg text-right"
                  />
                  <span className="absolute right-3 text-sm font-bold text-slate-400 pointer-events-none">
                    円
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: スコア詳細 & 戦評（任意） */}
          {activeStep === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150 text-sm">
              {matchStatus === 'scheduled' ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
                  <p className="font-bold text-slate-800 dark:text-slate-200">試合終了後に結果を入力できます</p>
                  <p className="text-slate-500 mt-1">
                    この試合は「試合前・予定」です。イニング・投手・本塁打・戦評は、観戦後に試合状態を「試合終了」に変えてから入力できます。すでに入力済みの結果がある場合は、状態を変えると再表示されます。
                  </p>
                </div>
              ) : (
                <>
              {/* イニング別得点（延長戦対応：9〜12回） */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 space-y-3 overflow-x-auto">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-200 block text-xs">
                    イニング別得点（任意：1回〜{awayInnings.length}回）
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={removeInning}
                      disabled={awayInnings.length <= 9}
                      className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 disabled:opacity-40"
                    >
                      回を減らす
                    </button>
                    <button
                      type="button"
                      onClick={addInning}
                      disabled={awayInnings.length >= 12}
                      className="px-2 py-1 rounded-lg bg-[#003882] text-white text-xs font-bold hover:bg-[#002868] disabled:opacity-40"
                    >
                      回を追加
                    </button>
                  </div>
                </div>
                <table className="w-full text-center border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-1 text-left w-24">チーム</th>
                      {awayInnings.map((_, i) => (
                        <th key={i} className="w-8 py-1">{i + 1}</th>
                      ))}
                      <th className="w-10 py-1 text-slate-200">R</th>
                      <th className="w-10 py-1 text-slate-400">H</th>
                      <th className="w-10 py-1 text-slate-400">E</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="py-2 text-left font-bold truncate">ビジター</td>
                      {awayInnings.map((val, i) => (
                        <td key={i} className="p-0.5">
                          <input
                            type="text"
                            maxLength={2}
                            value={val}
                            onChange={(e) => {
                              const next = [...awayInnings];
                              next[i] = e.target.value;
                              setAwayInnings(next);
                            }}
                            className="w-7 h-7 text-center rounded bg-slate-800 text-white font-bold border border-slate-700"
                          />
                        </td>
                      ))}
                      <td className="p-0.5 text-center font-bold text-slate-100">{sumInningRuns(awayInnings)}</td>
                      <td className="p-0.5">
                        <input
                          type="text"
                          maxLength={2}
                          value={awayHits}
                          onChange={(e) => setAwayHits(e.target.value)}
                          placeholder="安打"
                          className="w-8 h-7 text-center rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                        />
                      </td>
                      <td className="p-0.5">
                        <input
                          type="text"
                          maxLength={2}
                          value={awayErrors}
                          onChange={(e) => setAwayErrors(e.target.value)}
                          placeholder="失策"
                          className="w-8 h-7 text-center rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-left font-bold truncate">ホーム</td>
                      {homeInnings.map((val, i) => (
                        <td key={i} className="p-0.5">
                          <input
                            type="text"
                            maxLength={2}
                            value={val}
                            onChange={(e) => {
                              const next = [...homeInnings];
                              next[i] = e.target.value;
                              setHomeInnings(next);
                            }}
                            className="w-7 h-7 text-center rounded bg-slate-800 text-white font-bold border border-slate-700"
                          />
                        </td>
                      ))}
                      <td className="p-0.5 text-center font-bold text-slate-100">{sumInningRuns(homeInnings)}</td>
                      <td className="p-0.5">
                        <input
                          type="text"
                          maxLength={2}
                          value={homeHits}
                          onChange={(e) => setHomeHits(e.target.value)}
                          placeholder="安打"
                          className="w-8 h-7 text-center rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                        />
                      </td>
                      <td className="p-0.5">
                        <input
                          type="text"
                          maxLength={2}
                          value={homeErrors}
                          onChange={(e) => setHomeErrors(e.target.value)}
                          placeholder="失策"
                          className="w-8 h-7 text-center rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 投手情報（過去の入力から選択＋自由入力） */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ホーム先発投手
                  </label>
                  <input
                    type="text"
                    list="pitcher-datalist"
                    placeholder="例: 髙橋宏斗"
                    value={homeStarter}
                    onChange={(e) => setHomeStarter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ビジター先発投手
                  </label>
                  <input
                    type="text"
                    list="pitcher-datalist"
                    placeholder="例: 戸郷翔征"
                    value={awayStarter}
                    onChange={(e) => setAwayStarter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
              <datalist id="pitcher-datalist">
                {pastPitchers.map(name => (
                  <option key={name} value={name} />
                ))}
              </datalist>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    勝利投手
                  </label>
                  <input
                    list="pitcher-datalist"
                    type="text"
                    placeholder="例: 髙橋宏斗"
                    value={winningPitcher}
                    onChange={(e) => setWinningPitcher(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    敗戦投手
                  </label>
                  <input
                    list="pitcher-datalist"
                    type="text"
                    placeholder="例: 戸郷翔征"
                    value={losingPitcher}
                    onChange={(e) => setLosingPitcher(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    セーブ
                  </label>
                  <input
                    list="pitcher-datalist"
                    type="text"
                    placeholder="例: マルティネス"
                    value={savePitcher}
                    onChange={(e) => setSavePitcher(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* 本塁打（打った選手を複数登録可：過去の入力から選択＋自由入力） */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  本塁打（打った選手を記録）
                </label>
                {homeRunEntries.length === 0 && (
                  <p className="text-slate-400 text-sm mb-2">本塁打があれば「本塁打を追加」から記録できます。</p>
                )}
                <div className="space-y-2">
                  {homeRunEntries.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        list="homerun-player-datalist"
                        placeholder="例: 細川成也 21号2ラン(3回裏・戸郷)"
                        value={entry}
                        onChange={(e) => updateHomeRunEntry(i, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => removeHomeRunEntry(i)}
                        aria-label="この本塁打を削除"
                        className="p-2 text-rose-500 hover:text-rose-700 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <datalist id="homerun-player-datalist">
                  {pastHomeRunPlayers.map(name => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <button
                  type="button"
                  onClick={addHomeRunEntry}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-2 text-sm font-bold text-[#003882] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  本塁打を追加
                </button>
              </div>

              {/* 見どころ・イベント */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  試合イベント・見どころ戦評
                </label>
                <textarea
                  rows={3}
                  placeholder="サヨナラ勝ち、中田翔のタイムリー、立浪監督の抗議など"
                  value={events}
                  onChange={(e) => setEvents(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
                </>
              )}
            </div>
          )}

          {/* Form Wizard Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep(prev => prev - 1)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  前へ
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep(prev => prev + 1)}
                  className="px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
                >
                  次へ ({steps[activeStep].label})
                </button>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#003882] hover:bg-[#002868] active:scale-[0.98] rounded-xl transition-all shadow-md shadow-blue-900/20 disabled:opacity-50"
              >
                {isSubmitting ? '保存中...' : initialRecord ? '記録を更新する' : matchStatus === 'scheduled' ? '観戦予定を登録する' : '観戦記録を登録する'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
