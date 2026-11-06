import { MatchRecord, CategoryId, MatchStatus, MatchType, WatchStatus, TicketStatus, InningScore, PitcherInfo, MatchLink, SplitPayment } from '../types/baseball';
import { SupabaseClient } from '@supabase/supabase-js';

type JsonRecord = Record<string, unknown>;

interface MatchRow extends JsonRecord {
  id: string;
  owner_id: string;
  match_date: string | null;
  date_unknown: boolean;
  start_time: string | null;
  home_team_id: string;
  away_team_id: string;
  stadium_id: string | null;
  stadium_custom_name: string | null;
  match_type: MatchType;
  match_status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  score_confirmed: boolean;
  duration_minutes: number | null;
  events: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface WatchRow extends JsonRecord {
  id: string;
  match_id: string;
  owner_id: string;
  watch_status: WatchStatus;
  cheer_team_id: string;
  companions: string | null;
  watch_memo: string | null;
  total_price: number | null;
  my_expense: number | null;
  payment_date: string | null;
  payment_destination: string | null;
  payment_method: string | null;
  cost_memo: string | null;
  refund_amount: number | null;
  refund_status: 'none' | 'pending' | 'completed';
  created_at: string;
  updated_at: string;
}

interface CategoryRow extends JsonRecord {
  owner_id: string;
  watch_record_id: string;
  category_id: CategoryId;
  is_primary: boolean;
}

interface SeatRow extends JsonRecord {
  owner_id: string;
  watch_record_id: string;
  seat_type_id: string | null;
  custom_seat_type_name: string | null;
  area: string | null;
  seat_row: string | null;
  seat_number: string | null;
}

interface TicketRow extends JsonRecord {
  id: string;
  match_id: string;
  owner_id: string;
  status: TicketStatus;
  release_date: string | null;
  purchase_date: string | null;
  issue_date: string | null;
  ticket_type: string | null;
  notes: string | null;
  payment_deadline: string | null;
  quantity: number | null;
  seat_type_name: string | null;
  seat_area: string | null;
  seat_row: string | null;
  seat_number: string | null;
  vendor: string | null;
  purchase_amount: number | null;
  my_expense: number | null;
  refund_amount: number | null;
  refund_status: 'none' | 'pending' | 'completed';
}

interface InningRow extends JsonRecord {
  match_id: string;
  inning_number: number;
  side: 'home' | 'away';
  runs: number | null;
  is_not_played: boolean;
}
interface TeamTotalRow extends JsonRecord {
  match_id: string;
  side: 'home' | 'away';
  hits: number | null;
  errors: number | null;
}
interface PitcherRow extends JsonRecord {
  match_id: string;
  side: 'home' | 'away' | null;
  role: 'starter' | 'winning' | 'losing' | 'save' | 'other';
  player_name: string;
}
interface EventRow extends JsonRecord {
  match_id: string;
  event_type: 'home_run' | 'other';
  player_name: string | null;
  description: string;
  event_order: number | null;
}
interface LinkRow extends JsonRecord {
  match_id: string;
  title: string;
  url: string;
}
interface PaymentSplitRow extends JsonRecord {
  id: string;
  watch_record_id: string;
  title: string;
  amount: number;
  paid_date: string | null;
  memo: string | null;
}

export interface Phase2RecordTables {
  innings: InningRow[];
  totals: TeamTotalRow[];
  pitchers: PitcherRow[];
  events: EventRow[];
  links: LinkRow[];
  splits: PaymentSplitRow[];
}

const asNullable = (value: string | undefined) => value || null;
const asDate = (value: string | null) => value || '';

export interface RecordTables {
  matches: MatchRow[];
  watches: WatchRow[];
  categories: CategoryRow[];
  seats: SeatRow[];
  tickets: TicketRow[];
}

export const loadRecordTables = async (client: SupabaseClient, includePhase2 = false): Promise<RecordTables & Partial<Phase2RecordTables>> => {
  const [matches, watches, categories, seats, tickets] = await Promise.all([
    client.from('matches').select('*').order('match_date', { ascending: false }),
    client.from('watch_records').select('*'),
    client.from('watch_record_categories').select('*'),
    client.from('seats').select('*'),
    client.from('tickets').select('*'),
  ]);
  for (const result of [matches, watches, categories, seats, tickets]) {
    if (result.error) throw new Error(`試合データの読み込みに失敗しました: ${result.error.message}`);
  }
  const base = {
    matches: (matches.data || []) as MatchRow[],
    watches: (watches.data || []) as WatchRow[],
    categories: (categories.data || []) as CategoryRow[],
    seats: (seats.data || []) as SeatRow[],
    tickets: (tickets.data || []) as TicketRow[],
  };
  if (!includePhase2) return base;
  const detailResults = await Promise.all([
    client.from('match_inning_scores').select('*'),
    client.from('match_team_totals').select('*'),
    client.from('match_pitchers').select('*'),
    client.from('match_events').select('*').order('event_order'),
    client.from('match_links').select('*'),
    client.from('payment_splits').select('*'),
  ]);
  const detailError = detailResults.find(result => result.error)?.error;
  if (detailError) throw new Error(`Phase 2詳細データの読み込みに失敗しました: ${detailError.message}`);
  return {
    ...base,
    innings: detailResults[0].data as InningRow[],
    totals: detailResults[1].data as TeamTotalRow[],
    pitchers: detailResults[2].data as PitcherRow[],
    events: detailResults[3].data as EventRow[],
    links: detailResults[4].data as LinkRow[],
    splits: detailResults[5].data as PaymentSplitRow[],
  };
};

export const toMatchRecord = (
  match: MatchRow,
  watch: WatchRow | undefined,
  categories: CategoryRow[],
  seat: SeatRow | undefined,
  ticket: TicketRow | undefined,
  details?: Phase2RecordTables,
): MatchRecord => {
  const recordCategories = categories.filter(row => row.watch_record_id === watch?.id);
  const primary = recordCategories.find(row => row.is_primary)?.category_id || recordCategories[0]?.category_id || 'other';
  const matchInnings = details?.innings.filter(row => row.match_id === match.id) || [];
  const matchTotals = details?.totals.filter(row => row.match_id === match.id) || [];
  const matchPitchers = details?.pitchers.filter(row => row.match_id === match.id) || [];
  const matchEvents = details?.events.filter(row => row.match_id === match.id) || [];
  const matchLinks = details?.links.filter(row => row.match_id === match.id) || [];
  const matchSplits = details?.splits.filter(row => row.watch_record_id === watch?.id) || [];
  const innings: InningScore | undefined = matchInnings.length ? {
    home: matchInnings.filter(row => row.side === 'home').sort((a, b) => a.inning_number - b.inning_number)
      .map(row => row.is_not_played ? 'X' : row.runs),
    away: matchInnings.filter(row => row.side === 'away').sort((a, b) => a.inning_number - b.inning_number).map(row => row.runs),
    homeHits: matchTotals.find(row => row.side === 'home')?.hits,
    awayHits: matchTotals.find(row => row.side === 'away')?.hits,
    homeErrors: matchTotals.find(row => row.side === 'home')?.errors,
    awayErrors: matchTotals.find(row => row.side === 'away')?.errors,
  } : undefined;
  const pitchers: PitcherInfo | undefined = matchPitchers.length ? {
    homeStarter: matchPitchers.find(row => row.role === 'starter' && row.side === 'home')?.player_name,
    awayStarter: matchPitchers.find(row => row.role === 'starter' && row.side === 'away')?.player_name,
    winningPitcher: matchPitchers.find(row => row.role === 'winning')?.player_name,
    losingPitcher: matchPitchers.find(row => row.role === 'losing')?.player_name,
    savePitcher: matchPitchers.find(row => row.role === 'save')?.player_name,
  } : undefined;
  return {
    id: match.id,
    date: asDate(match.match_date),
    time: match.start_time?.slice(0, 5),
    isDateUnknown: match.date_unknown,
    homeTeamId: match.home_team_id,
    awayTeamId: match.away_team_id,
    stadiumId: match.stadium_id || '',
    stadiumCustom: match.stadium_custom_name || undefined,
    matchType: match.match_type,
    matchStatus: match.match_status,
    homeScore: match.home_score,
    awayScore: match.away_score,
    isScoreConfirmed: match.score_confirmed,
    matchDurationMinutes: match.duration_minutes,
    innings,
    pitchers,
    homeRuns: matchEvents.filter(row => row.event_type === 'home_run').map(row => row.player_name || row.description),
    events: match.events || undefined,
    links: matchLinks.length ? matchLinks.map(row => ({ title: row.title, url: row.url })) : undefined,
    notes: match.notes || undefined,
    watchStatus: watch?.watch_status || 'scheduled',
    cheerTeamId: watch?.cheer_team_id || 'dragons',
    categories: recordCategories.map(row => row.category_id),
    primaryCategory: primary,
    seatInfo: {
      seatTypeId: seat?.seat_type_id || undefined,
      seatTypeName: seat?.custom_seat_type_name || undefined,
      area: seat?.area || undefined,
      row: seat?.seat_row || undefined,
      seatNumber: seat?.seat_number || undefined,
    },
    companions: watch?.companions || undefined,
    watchMemo: watch?.watch_memo || undefined,
    costInfo: {
      totalPrice: watch?.total_price,
      myExpense: watch?.my_expense,
      paymentDate: watch?.payment_date || undefined,
      paymentDestination: watch?.payment_destination || undefined,
      paymentMethod: watch?.payment_method || undefined,
      memo: watch?.cost_memo || undefined,
      splits: matchSplits.map(row => ({ id: row.id, title: row.title, amount: row.amount, paidDate: row.paid_date || undefined, memo: row.memo || undefined })),
      refundAmount: watch?.refund_amount,
      refundStatus: watch?.refund_status || 'none',
    },
    ticketInfo: {
      id: ticket?.id,
      status: ticket?.status || 'release_waiting',
      releaseDate: ticket?.release_date || undefined,
      purchaseDate: ticket?.purchase_date || undefined,
      issueDate: ticket?.issue_date || undefined,
      paymentDeadline: ticket?.payment_deadline || undefined,
      quantity: ticket?.quantity || undefined,
      seatTypeName: ticket?.seat_type_name || undefined,
      seatArea: ticket?.seat_area || undefined,
      seatRow: ticket?.seat_row || undefined,
      seatNumber: ticket?.seat_number || undefined,
      vendor: ticket?.vendor || undefined,
      ticketType: ticket?.ticket_type || undefined,
      notes: ticket?.notes || undefined,
    },
    createdAt: match.created_at,
    updatedAt: match.updated_at,
  };
};

const matchPayload = (record: MatchRecord, ownerId: string) => ({
  id: record.id,
  owner_id: ownerId,
  match_date: record.isDateUnknown ? null : asNullable(record.date),
  date_unknown: record.isDateUnknown,
  start_time: asNullable(record.time),
  home_team_id: record.homeTeamId,
  away_team_id: record.awayTeamId,
  stadium_id: asNullable(record.stadiumId),
  stadium_custom_name: asNullable(record.stadiumCustom),
  match_type: record.matchType,
  match_status: record.matchStatus,
  home_score: record.homeScore,
  away_score: record.awayScore,
  score_confirmed: record.isScoreConfirmed,
  duration_minutes: record.matchDurationMinutes ?? null,
  events: record.events || null,
  notes: record.notes || null,
});

const watchPayload = (record: MatchRecord, ownerId: string) => ({
  match_id: record.id,
  owner_id: ownerId,
  watch_status: record.watchStatus,
  cheer_team_id: record.cheerTeamId,
  companions: record.companions || null,
  watch_memo: record.watchMemo || null,
  total_price: record.costInfo.totalPrice ?? null,
  my_expense: record.costInfo.myExpense ?? null,
  payment_date: record.costInfo.paymentDate || null,
  payment_destination: record.costInfo.paymentDestination || null,
  payment_method: record.costInfo.paymentMethod || null,
  cost_memo: record.costInfo.memo || null,
  refund_amount: record.costInfo.refundAmount ?? null,
  refund_status: record.costInfo.refundStatus || 'none',
});

const ticketPayload = (record: MatchRecord, ownerId: string) => ({
  match_id: record.id,
  owner_id: ownerId,
  status: record.ticketInfo.status,
  release_date: record.ticketInfo.releaseDate || null,
  purchase_date: record.ticketInfo.purchaseDate || null,
  issue_date: record.ticketInfo.issueDate || null,
  payment_deadline: record.ticketInfo.paymentDeadline || null,
  quantity: record.ticketInfo.quantity ?? null,
  vendor: record.ticketInfo.vendor || null,
  ticket_type: record.ticketInfo.ticketType || null,
  notes: record.ticketInfo.notes || null,
});

export interface AtomicSaveOptions {
  replaceDetails?: boolean;
  ticketOperation?: 'delete';
}

const atomicPayload = (record: MatchRecord, ownerId: string, options: AtomicSaveOptions) => {
  const replaceDetails = options.replaceDetails ?? true;
  if (options.ticketOperation === 'delete' && !record.ticketInfo.id) {
    throw new Error('チケット削除には対象チケットIDが必要です');
  }
  return {
    match: { ...matchPayload(record, ownerId), expected_updated_at: record.updatedAt },
    watch: watchPayload(record, ownerId),
    categories: record.categories.map(id => ({ id, is_primary: id === record.primaryCategory })),
    seat: {
      seat_type_id: record.seatInfo.seatTypeId?.trim() || null,
      custom_seat_type_name: record.seatInfo.seatTypeName?.trim() || null,
      area: record.seatInfo.area || null,
      seat_row: record.seatInfo.row || null,
      seat_number: record.seatInfo.seatNumber || null,
    },
    ticket: {
      id: record.ticketInfo.id || null,
      status: record.ticketInfo.status,
      release_date: record.ticketInfo.releaseDate || null,
      purchase_date: record.ticketInfo.purchaseDate || null,
      issue_date: record.ticketInfo.issueDate || null,
      payment_deadline: record.ticketInfo.paymentDeadline || null,
      quantity: record.ticketInfo.quantity ?? null,
      seat_type_name: record.ticketInfo.seatTypeName || null,
      seat_area: record.ticketInfo.seatArea || null,
      seat_row: record.ticketInfo.seatRow || null,
      seat_number: record.ticketInfo.seatNumber || null,
      ticket_type: record.ticketInfo.ticketType || null,
      vendor: record.ticketInfo.vendor || null,
      notes: record.ticketInfo.notes || null,
    },
    innings: record.innings || null,
    pitchers: record.pitchers || null,
    home_runs: record.homeRuns || [],
    events: record.events || null,
    links: record.links || [],
    splits: record.costInfo.splits || [],
    replace: {
      categories: replaceDetails,
      seat: replaceDetails,
      ticket: replaceDetails,
      innings: replaceDetails,
      pitchers: replaceDetails,
      events: replaceDetails,
      links: replaceDetails,
      splits: replaceDetails,
    },
    ...(options.ticketOperation ? { ticket_operation: options.ticketOperation } : {}),
  };
};

const validateSeatType = async (client: SupabaseClient, record: MatchRecord) => {
  const seatTypeId = record.seatInfo.seatTypeId?.trim();
  if (!seatTypeId) return;

  const result = await client.from('seat_types').select('id').eq('id', seatTypeId).maybeSingle();
  if (result.error) {
    throw new Error(`座席種別マスターの確認に失敗しました: ${result.error.message}`);
  }
  if (!result.data) {
    throw new Error(`座席種別「${seatTypeId}」はSupabaseのseat_typesに存在しません。マスター登録後に選択するか、自由入力を使用してください。`);
  }
};

export const saveMatchRecord = async (
  client: SupabaseClient,
  ownerId: string,
  record: MatchRecord,
  isNew: boolean,
) => {
  await validateSeatType(client, record);
  let matchWritten = false;

  try {
    const matchResult = await client.from('matches').upsert(matchPayload(record, ownerId)).select().single();
    if (matchResult.error) throw new Error(`試合情報の保存に失敗しました: ${matchResult.error.message}`);
    matchWritten = true;

    const watchResult = await client.from('watch_records').upsert(watchPayload(record, ownerId), { onConflict: 'match_id' });
    if (watchResult.error) throw new Error(`観戦情報の保存に失敗しました: ${watchResult.error.message}`);

    const watch = await client.from('watch_records').select('id').eq('match_id', record.id).single();
    if (watch.error || !watch.data) throw new Error('観戦記録のID取得に失敗しました。保存状態を確認してください。');
    const categoryDelete = await client.from('watch_record_categories').delete().eq('watch_record_id', watch.data.id);
    if (categoryDelete.error) throw new Error(`カテゴリ更新に失敗しました。部分保存の可能性があります: ${categoryDelete.error.message}`);
    const categoryRows = record.categories.map(category_id => ({
      owner_id: ownerId,
      watch_record_id: watch.data.id,
      category_id,
      is_primary: category_id === record.primaryCategory,
    }));
    if (categoryRows.length) {
      const categoryInsert = await client.from('watch_record_categories').insert(categoryRows);
      if (categoryInsert.error) throw new Error(`カテゴリ保存に失敗しました。部分保存の可能性があります: ${categoryInsert.error.message}`);
    }

    const seatDelete = await client.from('seats').delete().eq('watch_record_id', watch.data.id);
    if (seatDelete.error) throw new Error(`座席情報の更新に失敗しました。部分保存の可能性があります: ${seatDelete.error.message}`);
    const seat = record.seatInfo;
    if (seat.seatTypeId || seat.seatTypeName || seat.area || seat.row || seat.seatNumber) {
      const seatInsert = await client.from('seats').insert({
        owner_id: ownerId,
        watch_record_id: watch.data.id,
        seat_type_id: seat.seatTypeId?.trim() || null,
        custom_seat_type_name: seat.seatTypeName?.trim() || null,
        area: seat.area || null,
        seat_row: seat.row || null,
        seat_number: seat.seatNumber || null,
      });
      if (seatInsert.error) throw new Error(`座席保存に失敗しました。部分保存の可能性があります: ${seatInsert.error.message}`);
    }

    const ticketResult = await client.from('tickets').select('id').eq('match_id', record.id).maybeSingle();
    if (ticketResult.error) throw new Error(`チケット情報の確認に失敗しました: ${ticketResult.error.message}`);
    const ticketWrite = ticketResult.data
      ? await client.from('tickets').update(ticketPayload(record, ownerId)).eq('id', ticketResult.data.id)
      : await client.from('tickets').insert(ticketPayload(record, ownerId));
    if (ticketWrite.error) throw new Error(`チケット保存に失敗しました。部分保存の可能性があります: ${ticketWrite.error.message}`);
  } catch (error) {
    if (isNew && matchWritten) {
      const cleanup = await client.from('matches').delete().eq('id', record.id).eq('owner_id', ownerId);
      if (cleanup.error) {
        throw new Error(`${error instanceof Error ? error.message : '保存に失敗しました。'} 新規試合の自動ロールバックにも失敗しました（match_id: ${record.id}）。このIDを確認して手動回復してください。`);
      }
    }
    throw error;
  }
};

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
export const isAtomicSaveEnabled = viteEnv?.VITE_SUPABASE_ATOMIC_SAVE === 'true';

export const isAtomicSaveConflict = (error: {
  code?: string;
  message?: string;
  status?: number;
} | null | undefined) => {
  if (!error) return false;
  return error.code === 'PT409'
    || error.status === 409
    || (error.message || '').toLowerCase().includes('match was modified by another session');
};

export const saveMatchRecordAtomic = async (
  client: SupabaseClient,
  ownerId: string,
  record: MatchRecord,
  options: AtomicSaveOptions = {},
) => {
  await validateSeatType(client, record);
  const result = await client.rpc('save_match_record', {
    p_payload: atomicPayload(record, ownerId, options),
  });
  if (result.error) {
    if (isAtomicSaveConflict({
      code: result.error.code,
      message: result.error.message,
      status: result.status,
    })) {
      throw new Error('試合情報が別の画面で更新されたため保存できませんでした。最新データを再読み込みしてから再試行してください。');
    }
    throw new Error(`原子的試合保存に失敗しました: ${result.error.message}`);
  }
  const response = result.data as { ok?: boolean; match_id?: string; watch_record_id?: string } | null;
  if (!response?.ok || response.match_id !== record.id || !response.watch_record_id) {
    throw new Error('原子的試合保存の応答を検証できませんでした。データ状態を確認してください。');
  }
  return response;
};

export const saveMatchRecordWithPhase2 = async (
  client: SupabaseClient,
  ownerId: string,
  record: MatchRecord,
  isNew: boolean,
) => {
  if (isAtomicSaveEnabled) {
    await saveMatchRecordAtomic(client, ownerId, record);
    return;
  }
  await saveMatchRecord(client, ownerId, record, isNew);
};

export const deleteMatchRecord = async (client: SupabaseClient, ownerId: string, id: string) => {
  const result = await client.from('matches').delete().eq('id', id).eq('owner_id', ownerId);
  if (result.error) throw new Error(`試合の削除に失敗しました: ${result.error.message}`);
};
