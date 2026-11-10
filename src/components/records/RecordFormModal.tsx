/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedRecordRefreshRequiredError } from '../../lib/supabaseRecords';
import { editRecordTicket } from '../../utils/ticketRecords';
import { MultiTicketEditor } from './MultiTicketEditor';
import { beginTicketEditor, ticketEditorChanges, ticketEditorHasChanges } from '../../lib/atomic/ticketEditorDraft';
import { assembleFullFormEdit } from '../../lib/atomic/fullFormSaveBridge';

import React, { useState, useEffect, useRef } from 'react';
import { useBaseball } from '../../context/BaseballContext';
import {
  MatchRecord,
  MatchType,
  MatchStatus,
  WatchStatus,
  CategoryId,
  SplitPayment,
  TicketStatus,
} from '../../types/baseball';
import { TEAMS, CATEGORIES } from '../../data/teams';
import {
  X,
  Check,
  Calendar,
  MapPin,
  Ticket,
  Coins,
  Award,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecord?: MatchRecord | null;
}

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  isOpen,
  onClose,
  initialRecord,
}) => {
  const { addRecord, updateRecord, stadiums, v2TicketWriteEnabled, v2FullFormWriteEnabled, saveTicketEditsV2, saveFullFormV2, refreshTicketEditsV2 } = useBaseball();

  // Active step in the form wizard (1: 試合, 2: 観戦, 3: 座席, 4: 費用, 5: 詳細スコア)
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInProgress = useRef(false);
  const saveNeedsRefresh = useRef(false);
  useEffect(() => {
    if (!isOpen) saveNeedsRefresh.current = false;
  }, [isOpen]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  const [companions, setCompanions] = useState('');
  const [watchMemo, setWatchMemo] = useState('');

  // Seat info
  const [seatTypeId, setSeatTypeId] = useState('');
  const [seatTypeName, setSeatTypeName] = useState('');
  const [area, setArea] = useState('1塁側');
  const [row, setRow] = useState('15');
  const [seatNumber, setSeatNumber] = useState('32');

  // Cost & Ticket info
  const [totalPrice, setTotalPrice] = useState<string>('4800');
  const [myExpense, setMyExpense] = useState<string>('4800');
  const [paymentDate, setPaymentDate] = useState('2026-09-01');
  const [paymentDestination, setPaymentDestination] = useState('ドラチケ');
  const [paymentMethod, setPaymentMethod] = useState('クレジットカード');
  const [costMemo, setCostMemo] = useState('');
  const [splits, setSplits] = useState<SplitPayment[]>([]);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundStatus, setRefundStatus] = useState<'none' | 'pending' | 'completed'>('none');

  const [ticketStatus, setTicketStatus] = useState<TicketStatus>('ticketed');
  const [releaseDate, setReleaseDate] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [ticketType, setTicketType] = useState('QR電子チケット');
  const [ticketNotes, setTicketNotes] = useState('');
  const [multiTicketDraft, setMultiTicketDraft] = useState(() => beginTicketEditor(initialRecord?.tickets || []));
  const [showMultiTicketEditor, setShowMultiTicketEditor] = useState((initialRecord?.tickets.length || 0) > 1);
  const [multiTicketTouched, setMultiTicketTouched] = useState(false);
  const [v2TicketPhase, setV2TicketPhase] = useState<string | null>(null);

  // Batter & Pitchers info
  const [homeStarter, setHomeStarter] = useState('');
  const [awayStarter, setAwayStarter] = useState('');
  const [winningPitcher, setWinningPitcher] = useState('');
  const [losingPitcher, setLosingPitcher] = useState('');
  const [savePitcher, setSavePitcher] = useState('');
  const [homeRunsInput, setHomeRunsInput] = useState('');
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
    setMultiTicketDraft(beginTicketEditor(initialRecord?.tickets || []));
    setShowMultiTicketEditor((initialRecord?.tickets.length || 0) > 1);
    setMultiTicketTouched(false);
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
      setCompanions(initialRecord.companions || '');
      setWatchMemo(initialRecord.watchMemo || '');

      setSeatTypeId(initialRecord.seatInfo.seatTypeId || '');
      setSeatTypeName(initialRecord.seatInfo.seatTypeName || '');
      setArea(initialRecord.seatInfo.area || '');
      setRow((initialRecord.seatInfo.row || '').replace(/[^0-9]/g, ''));
      setSeatNumber((initialRecord.seatInfo.seatNumber || '').replace(/[^0-9]/g, ''));

      setTotalPrice(initialRecord.costInfo.totalPrice !== null && initialRecord.costInfo.totalPrice !== undefined ? String(initialRecord.costInfo.totalPrice) : '');
      setMyExpense(initialRecord.costInfo.myExpense !== null && initialRecord.costInfo.myExpense !== undefined ? String(initialRecord.costInfo.myExpense) : '');
      setPaymentDate(initialRecord.costInfo.paymentDate || '');
      setPaymentDestination(initialRecord.costInfo.paymentDestination || '');
      setPaymentMethod(initialRecord.costInfo.paymentMethod || 'クレジットカード');
      setCostMemo(initialRecord.costInfo.memo || '');
      setSplits(initialRecord.costInfo.splits || []);
      setRefundAmount(initialRecord.costInfo.refundAmount !== null && initialRecord.costInfo.refundAmount !== undefined ? String(initialRecord.costInfo.refundAmount) : '');
      setRefundStatus(initialRecord.costInfo.refundStatus || 'none');

      setTicketStatus(initialRecord.ticketInfo.status);
      setReleaseDate(initialRecord.ticketInfo.releaseDate || '');
      setPurchaseDate(initialRecord.ticketInfo.purchaseDate || '');
      setIssueDate(initialRecord.ticketInfo.issueDate || '');
      setTicketType(initialRecord.ticketInfo.ticketType || '');
      setTicketNotes(initialRecord.ticketInfo.notes || '');

      setHomeStarter(initialRecord.pitchers?.homeStarter || '');
      setAwayStarter(initialRecord.pitchers?.awayStarter || '');
      setWinningPitcher(initialRecord.pitchers?.winningPitcher || '');
      setLosingPitcher(initialRecord.pitchers?.losingPitcher || '');
      setSavePitcher(initialRecord.pitchers?.savePitcher || '');
      setHomeRunsInput(initialRecord.homeRuns ? initialRecord.homeRuns.join('\n') : '');
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
      setTicketStatus('plan_to_buy');
      setTotalPrice('');
      setMyExpense('');
      setDurationHours('');
      setDurationMinutes('');
      setRow('');
      setSeatNumber('');
      setSeatTypeId('');
      setSeatTypeName('');
      setSplits([]);
      setAwayInnings(Array(9).fill(''));
      setHomeInnings(Array(9).fill(''));
    }
    setActiveStep(1);
    setErrorMessage(null);
  }, [initialRecord, isOpen]);

  if (!isOpen) return null;

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

  // Split payment handler
  const addSplit = () => {
    setSplits(prev => [
      ...prev,
      {
        id: `sp_${Date.now()}`,
        title: '明細項目',
        amount: 0,
        paidDate: date,
      },
    ]);
  };

  const removeSplit = (id: string) => {
    setSplits(prev => prev.filter(s => s.id !== id));
  };

  const updateSplit = (id: string, field: keyof SplitPayment, value: any) => {
    setSplits(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const saveTicketsOnlyV2 = async () => {
    if (!initialRecord || isSubmitting || submitInProgress.current) return;
    submitInProgress.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await saveTicketEditsV2(initialRecord, multiTicketDraft);
      setV2TicketPhase(result.phase);
      if (result.phase === 'completed') onClose();
      else setErrorMessage(result.phase === 'partial_or_unknown'
        ? '保存結果が不明です。再送信せず、読み取りで確認してください。' :
        result.phase === 'saved_sync_failed'
        ? '保存自体は成功しました。再送信せず、読み取りで同期してください。' :
        result.message || '保存できませんでした。');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'v2保存処理を準備できませんでした。');
    } finally {
      setIsSubmitting(false);
      submitInProgress.current = false;
    }
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

    let multiTicketDirty = false;
    try {
      if (multiTicketTouched) multiTicketDirty = ticketEditorHasChanges(ticketEditorChanges(multiTicketDraft));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'チケットの入力に問題があります。');
      setActiveStep(4);
      submitInProgress.current = false;
      return;
    }
    if (multiTicketDirty && !(initialRecord && v2FullFormWriteEnabled)) {
      setErrorMessage('複数チケットの変更は、Atomic RPC v2への画面接続が完了するまで確定できません。入力内容を保持しています。');
      setActiveStep(4);
      submitInProgress.current = false;
      return;
    }
    if ((initialRecord?.tickets.length || 0) > 1 && !v2FullFormWriteEnabled) {
      setErrorMessage('複数のチケットが登録されているため、現在のフォームから安全に編集できません。');
      submitInProgress.current = false;
      return;
    }

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

    // Parse Costs
    const parsedTotalPrice = totalPrice.trim() !== '' ? Number(totalPrice) : null;
    const parsedMyExpense = myExpense.trim() !== '' ? Number(myExpense) : null;
    const parsedRefundAmount = refundAmount.trim() !== '' ? Number(refundAmount) : null;
    
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

    // Parse Home runs
    const parsedHomeRuns = homeRunsInput
      .split('\n')
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
      companions: companions || undefined,
      watchMemo: watchMemo || undefined,
      costInfo: {
        totalPrice: parsedTotalPrice,
        myExpense: parsedMyExpense,
        paymentDate: paymentDate || undefined,
        paymentDestination: paymentDestination || undefined,
        paymentMethod: paymentMethod || undefined,
        memo: costMemo || undefined,
        splits,
        refundAmount: parsedRefundAmount,
        refundStatus,
      },
      ticketInfo: {
        status: ticketStatus,
        releaseDate: releaseDate || undefined,
        purchaseDate: purchaseDate || undefined,
        issueDate: issueDate || undefined,
        ticketType: ticketType || undefined,
        notes: ticketNotes || undefined,
      },
    };

    setIsSubmitting(true);
    try {
      if (initialRecord && v2FullFormWriteEnabled) {
        const { record: candidate, useMultiDraft } = assembleFullFormEdit(initialRecord, recordPayload, multiTicketTouched);
        const draft = useMultiDraft ? multiTicketDraft : {
          ...multiTicketDraft,
          rows: candidate.tickets.map(ticket => ({ ...ticket })),
        };
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
        await updateRecord(editRecordTicket({
          ...recordPayload,
          id: initialRecord.id,
          createdAt: initialRecord.createdAt,
          updatedAt: initialRecord.updatedAt,
          tickets: initialRecord.tickets,
        }, recordPayload.ticketInfo));
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
    { num: 4, label: '費用・チケット' },
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

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {initialRecord && initialRecord.tickets.length > 1 && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>この試合にはチケットが複数あります。複数チケット編集に対応するまで、このフォームからの保存は無効です。</span>
          </div>
        )}

        {v2FullFormWriteEnabled && (v2TicketPhase === 'partial_or_unknown' || v2TicketPhase === 'saved_sync_failed') && (
          <div className="mx-6 mt-3 rounded-xl border border-amber-400 p-3 text-xs">
            <p className="mb-2">保存結果を確認するまでは再保存しないでください。ページを再読み込みすると確認待ちの状態が失われるため、閉じずに読取再確認してください。</p>
            <button type="button" disabled={isSubmitting} onClick={refreshTicketsOnlyV2} className="rounded-lg border border-amber-500 px-3 py-2 disabled:opacity-50">書き込まずに再確認</button>
          </div>
        )}
        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: 試合情報 */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
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

              {/* 対戦チーム選択 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
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
                    <option value="official">公式戦 (ペナントレース)</option>
                    <option value="interleague">セ・パ交流戦</option>
                    <option value="open">オープン戦</option>
                    <option value="climax">クライマックスシリーズ</option>
                    <option value="nippon_series">日本シリーズ</option>
                    <option value="practice">練習試合・教育リーグ</option>
                    <option value="international">国際試合・壮行試合</option>
                    <option value="other">その他</option>
                  </select>
                </div>
              </div>

              {/* スコア・試合状態（予定の場合は未入力許可） */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    スコア入力（※予定の試合や不明時は空欄のまま登録可能）
                  </span>
                  <select
                    value={matchStatus}
                    onChange={(e) => setMatchStatus(e.target.value as MatchStatus)}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="finished">試合終了</option>
                    <option value="scheduled">試合前・予定</option>
                    <option value="in_progress">試合中</option>
                    <option value="cancelled">中止</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-semibold">
                      ビジター得点
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      placeholder="未定（空欄）"
                      value={awayScore}
                      onChange={(e) => setAwayScore(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-display font-bold text-lg text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-semibold">
                      ホーム得点
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      placeholder="未定（空欄）"
                      value={homeScore}
                      onChange={(e) => setHomeScore(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-display font-bold text-lg text-center"
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
                        placeholder="3"
                        value={durationHours}
                        onChange={(e) => setDurationHours(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-12 px-1.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-display font-bold text-xs"
                      />
                      <span className="font-bold text-slate-600 dark:text-slate-400">時間</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="15"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-12 px-1.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-display font-bold text-xs"
                      />
                      <span className="font-bold text-slate-600 dark:text-slate-400">分</span>
                    </div>
                  </div>
                </div>

                {/* Quick duration presets */}
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500 overflow-x-auto">
                  <span className="text-[10px] text-slate-400 shrink-0">目安:</span>
                  {[
                    { label: '2時間45分', h: '2', m: '45' },
                    { label: '3時間00分', h: '3', m: '0' },
                    { label: '3時間15分', h: '3', m: '15' },
                    { label: '3時間30分', h: '3', m: '30' },
                    { label: '3時間50分', h: '3', m: '50' },
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setDurationHours(p.h);
                        setDurationMinutes(p.m);
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors shrink-0"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: 観戦情報 */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
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
                    {TEAMS.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
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

              {/* 同行者 */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  同行者（任意）
                </label>
                <input
                  type="text"
                  placeholder="例: 家族（妻・息子）、ドラファン友人2名、単独"
                  value={companions}
                  onChange={(e) => setCompanions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto">
                  <span className="text-[10px] text-slate-400 shrink-0">候補:</span>
                  {['単独 (1人)', '家族', '友人 (2名)', '会社の同僚'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCompanions(preset)}
                      className="px-2 py-0.5 text-[10px] rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
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
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
              <p className="text-slate-500">
                球場ごとの席種マスタに基づき、エリア・列・席番号を構造化して記録します。（未確定の予定試合は空欄可）
              </p>

              {/* 席種プルダウン（球場マスタ連動） */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  席種プルダウン ({currentStadium.name})
                </label>
                <select
                  value={seatTypeId}
                  onChange={(e) => {
                    setSeatTypeId(e.target.value);
                    setSeatTypeName('');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                >
                  <option value="">-- 席種を選択 (または未定) --</option>
                  {currentStadium.seatTypes.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.displayName} {st.priceRange && `(${st.priceRange})`}
                    </option>
                  ))}
                </select>
                {currentStadium.seatTypes.length === 0 && (
                  <p className="mt-2 text-amber-700 dark:text-amber-300">
                    この球場の席種マスターが未登録です。未選択のまま保存するか、下の自由入力を使用してください。管理者は
                    <code className="mx-1">0006_seed_seat_types.sql</code>
                    適用後に再読み込みしてください。
                  </p>
                )}
                <input
                  type="text"
                  placeholder="自由入力の席種（マスター外）"
                  value={seatTypeName}
                  onChange={(e) => {
                    setSeatTypeName(e.target.value);
                    if (e.target.value.trim()) setSeatTypeId('');
                  }}
                  className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

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

          {/* STEP 4: 費用・チケット情報 */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
              <div className="flex items-center justify-between gap-2">
                <p className="text-slate-600 dark:text-slate-300">複数チケット：{multiTicketDraft.rows.length}件</p>
                <button type="button" className="text-blue-700 dark:text-blue-300 underline font-semibold" onClick={() => setShowMultiTicketEditor(value => !value)}>
                  {showMultiTicketEditor ? '複数チケット編集準備を閉じる' : '複数チケット編集準備を開く'}
                </button>
              </div>
              {showMultiTicketEditor && <MultiTicketEditor draft={multiTicketDraft} canSave={Boolean(initialRecord && v2TicketWriteEnabled)} onChange={draft => { setMultiTicketDraft(draft); setMultiTicketTouched(true); }} />}
              {showMultiTicketEditor && initialRecord && v2TicketWriteEnabled && !v2FullFormWriteEnabled && (
                <div className="rounded-xl border border-amber-400 p-3 space-y-2">
                  <p className="text-xs">これはチケットだけのv2保存です。他のフォーム項目は保存されません。未適用のDBでは実行しないでください。</p>
                  <button type="button" disabled={isSubmitting || v2TicketPhase === 'partial_or_unknown' || v2TicketPhase === 'saved_sync_failed'}
                    onClick={saveTicketsOnlyV2} className="rounded-lg bg-blue-800 text-white px-3 py-2 disabled:opacity-50">チケット変更だけをAtomic v2で保存</button>
                  {(v2TicketPhase === 'partial_or_unknown' || v2TicketPhase === 'saved_sync_failed') &&
                    <button type="button" disabled={isSubmitting} onClick={refreshTicketsOnlyV2} className="ml-2 rounded-lg border border-amber-500 px-3 py-2">書き込まずに再確認</button>}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* チケット総額 */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    チケット購入総額 (¥)
                  </label>
                  <input
                    type="number"
                    placeholder="未設定"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-display font-bold text-base"
                  />
                </div>

                {/* 自己負担額（0円と未入力を区別） */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    自己負担額 (¥) ※0円と未入力を区別
                  </label>
                  <input
                    type="number"
                    placeholder="未設定"
                    value={myExpense}
                    onChange={(e) => setMyExpense(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-display font-bold text-base"
                  />
                </div>
              </div>

              {/* 支払い先 & 支払い方法 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    購入先・支払い先
                  </label>
                  <input
                    type="text"
                    placeholder="例: ドラチケFC先行、ぴあ、球場窓口"
                    value={paymentDestination}
                    onChange={(e) => setPaymentDestination(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto">
                    {['ドラチケ', 'ローチケ', 'チケットぴあ', 'イープラス', '球場窓口', 'FC招待券'].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setPaymentDestination(v)}
                        className="px-2 py-0.5 text-[10px] rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    支払い方法
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="クレジットカード">クレジットカード</option>
                    <option value="PayPay / 電子マネー">PayPay / QR決済</option>
                    <option value="コンビニ決済">コンビニ決済</option>
                    <option value="現金">現金</option>
                    <option value="その他">その他</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    チケット状態
                  </label>
                  <select
                    value={ticketStatus}
                    onChange={(e) => setTicketStatus(e.target.value as TicketStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="ticketed">発券・確保済み</option>
                    <option value="purchased">購入済み（発券前）</option>
                    <option value="plan_to_buy">購入予定</option>
                    <option value="release_waiting">発売待ち</option>
                    <option value="ticket_waiting">発券待ち</option>
                    <option value="cancelled_refund">キャンセル・払戻</option>
                  </select>
                </div>
              </div>

              {/* 分割支払い・内訳明細リスト */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    分割支払い・同行者割り勘明細（0件以上登録可能）
                  </span>
                  <button
                    type="button"
                    onClick={addSplit}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[#003882] text-white rounded-lg hover:bg-[#002868]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>明細を追加</span>
                  </button>
                </div>

                {splits.length === 0 ? (
                  <p className="text-slate-400 py-2 text-center text-xs">
                    分割明細はありません。（チケット代一括の場合は入力不要です）
                  </p>
                ) : (
                  <div className="space-y-2">
                    {splits.map((s, idx) => (
                      <div key={s.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="項目名 (例: チケット負担分)"
                          value={s.title}
                          onChange={(e) => updateSplit(s.id, 'title', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                        />
                        <input
                          type="number"
                          placeholder="金額"
                          value={s.amount || ''}
                          onChange={(e) => updateSplit(s.id, 'amount', Number(e.target.value))}
                          className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-display font-bold text-right"
                        />
                        <button
                          type="button"
                          onClick={() => removeSplit(s.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 中止時の返金管理 */}
              {watchStatus === 'cancelled' && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-3">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block">
                    試合中止時の返金・払戻管理
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-amber-700 dark:text-amber-400 mb-1">返金金額 (¥)</label>
                      <input
                        type="number"
                        placeholder="例: 2200"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-amber-700 dark:text-amber-400 mb-1">返金状況</label>
                      <select
                        value={refundStatus}
                        onChange={(e) => setRefundStatus(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800"
                      >
                        <option value="none">返金なし</option>
                        <option value="pending">返金待ち・手続き中</option>
                        <option value="completed">返金完了</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: スコア詳細 & 戦評（任意） */}
          {activeStep === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
              {/* イニング別得点（1〜9回） */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 space-y-3 overflow-x-auto">
                <span className="font-bold text-slate-200 block text-xs">
                  イニング別得点（任意：1回〜9回）
                </span>
                <table className="w-full text-center border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-1 text-left w-24">チーム</th>
                      {[1,2,3,4,5,6,7,8,9].map(n => (
                        <th key={n} className="w-8 py-1">{n}</th>
                      ))}
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

              {/* 投手情報 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ホーム先発投手
                  </label>
                  <input
                    type="text"
                    placeholder="例: 髙橋宏斗"
                    value={homeStarter}
                    onChange={(e) => setHomeStarter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <div className="flex items-center gap-1 mt-1.5 overflow-x-auto text-[10px]">
                    {['髙橋宏斗', '柳裕也', '小笠原慎之介', '涌井秀章', '大野雄大', '松木平優太', '根尾昂'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setHomeStarter(p)}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 text-slate-700 dark:text-slate-300 shrink-0"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ビジター先発投手
                  </label>
                  <input
                    type="text"
                    placeholder="例: 戸郷翔征"
                    value={awayStarter}
                    onChange={(e) => setAwayStarter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    勝利投手
                  </label>
                  <input
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
                    type="text"
                    placeholder="例: マルティネス"
                    value={savePitcher}
                    onChange={(e) => setSavePitcher(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* 本塁打（改行区切り） */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  本塁打（1行に1本ずつ入力）
                </label>
                <textarea
                  rows={3}
                  placeholder={'例:\n細川成也 21号2ラン(3回裏・戸郷)\n岡林勇希 3号ソロ(5回裏・戸郷)'}
                  value={homeRunsInput}
                  onChange={(e) => setHomeRunsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
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
                {isSubmitting ? '保存中...' : initialRecord ? '記録を更新する' : '観戦記録を登録する'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
