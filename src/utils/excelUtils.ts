/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { MatchRecord, CategoryId, MatchStatus, WatchStatus, MatchType } from '../types/baseball';
import {
  getMatchResult,
  getMatchDayOfWeek,
  getStadiumDisplayName,
  formatWinRate,
  formatMatchDuration,
} from './baseballUtils';
import { getTeam, TEAMS } from '../data/teams';
import { STADIUMS } from '../data/stadiums';

/**
 * 観戦記録リストをエクセル (.xlsx) ワークブックとして出力・ダウンロードする
 */
export function exportRecordsToExcel(records: MatchRecord[], filename = '観戦記録_エクスポート.xlsx') {
  const wb = XLSX.utils.book_new();

  // 1. メイン観戦記録シート
  const rows = records.map((r, index) => {
    const res = getMatchResult(r);
    const homeTeam = getTeam(r.homeTeamId);
    const awayTeam = getTeam(r.awayTeamId);
    const cheerTeam = getTeam(r.cheerTeamId);
    const resultLabel = res === 'win' ? '○ 勝利' : res === 'loss' ? '● 敗戦' : res === 'draw' ? '△ 引分' : res === 'cancelled' ? '中止' : '予定';

    const categoryLabels = r.categories.map(c => {
      if (c === 'dragons_1st') return '中日1軍';
      if (c === 'dragons_2nd') return '中日2軍';
      if (c === 'japan') return '侍ジャパン';
      return 'その他';
    }).join(', ');

    return {
      'No.': index + 1,
      '開催日': r.date || '未定',
      '曜日': getMatchDayOfWeek(r.date),
      '開始時刻': r.time || '',
      '観戦カテゴリ': categoryLabels,
      '主カテゴリ': r.primaryCategory === 'dragons_1st' ? '中日1軍' : r.primaryCategory === 'dragons_2nd' ? '中日2軍' : r.primaryCategory === 'japan' ? '侍ジャパン' : 'その他',
      '応援球団': cheerTeam.name,
      'ホーム球団': homeTeam.name,
      'ビジター球団': awayTeam.name,
      '対戦カード': `${homeTeam.shortName} vs ${awayTeam.shortName}`,
      '球場': getStadiumDisplayName(r),
      'ホーム得点': r.homeScore !== null ? r.homeScore : '',
      'ビジター得点': r.awayScore !== null ? r.awayScore : '',
      'スコア': r.homeScore !== null && r.awayScore !== null ? `${r.homeScore} - ${r.awayScore}` : '',
      '観戦勝敗': resultLabel,
      '試合状態': r.matchStatus === 'finished' ? '終了' : r.matchStatus === 'cancelled' ? '中止' : '予定',
      '観戦状態': r.watchStatus === 'watched' ? '観戦済' : r.watchStatus === 'cancelled' ? '中止' : '予定',
      '試合時間': formatMatchDuration(r.matchDurationMinutes),
      '試合時間(分)': r.matchDurationMinutes || '',
      '席種': r.seatInfo.seatTypeName || r.seatInfo.seatTypeId || '',
      'エリア': r.seatInfo.area || '',
      '列(数字)': r.seatInfo.row || '',
      '席番(数字)': r.seatInfo.seatNumber || '',
      'チケット総額': r.costInfo.totalPrice ?? '',
      '自己負担額': r.costInfo.myExpense ?? '',
      '購入先': r.costInfo.paymentDestination || r.ticketInfo.vendor || '',
      '決済方法': r.costInfo.paymentMethod || '',
      'チケット状態': r.ticketInfo.status,
      '同行者': r.companions || '',
      '自軍先発': (r.cheerTeamId === r.homeTeamId ? r.pitchers?.homeStarter : r.pitchers?.awayStarter) || '',
      '相手先発': (r.cheerTeamId === r.homeTeamId ? r.pitchers?.awayStarter : r.pitchers?.homeStarter) || '',
      '勝利投手': r.pitchers?.winningPitcher || '',
      '敗戦投手': r.pitchers?.losingPitcher || '',
      'セーブ': r.pitchers?.savePitcher || '',
      '本塁打': (r.homeRuns || []).join(' / '),
      '観戦メモ': r.watchMemo || '',
      '試合特記・備考': r.notes || '',
    };
  });

  const mainWs = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, mainWs, '観戦記録一覧');

  // 2. 年度別集計シート
  const yearMap = new Map<string, { matches: number; wins: number; losses: number; draws: number; runsFor: number; runsAgainst: number; cost: number }>();
  records.filter(r => r.matchStatus === 'finished').forEach(r => {
    const year = r.date ? r.date.slice(0, 4) : '不明';
    const curr = yearMap.get(year) || { matches: 0, wins: 0, losses: 0, draws: 0, runsFor: 0, runsAgainst: 0, cost: 0 };
    curr.matches++;
    const res = getMatchResult(r);
    if (res === 'win') curr.wins++;
    else if (res === 'loss') curr.losses++;
    else if (res === 'draw') curr.draws++;

    if (r.homeScore !== null && r.awayScore !== null) {
      const isHome = r.cheerTeamId === r.homeTeamId;
      curr.runsFor += isHome ? r.homeScore : r.awayScore;
      curr.runsAgainst += isHome ? r.awayScore : r.homeScore;
    }
    if (r.costInfo.myExpense) curr.cost += r.costInfo.myExpense;
    yearMap.set(year, curr);
  });

  const yearRows = Array.from(yearMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, d]) => {
      const dec = d.wins + d.losses;
      return {
        '年度': `${year}年`,
        '観戦試合': d.matches,
        '勝利': d.wins,
        '敗戦': d.losses,
        '引分': d.draws,
        '勝率': formatWinRate(dec > 0 ? d.wins / dec : null),
        '総得点': d.runsFor,
        '総失点': d.runsAgainst,
        '得失点差': d.runsFor - d.runsAgainst,
        '自己負担費用計': d.cost,
      };
    });
  const yearWs = XLSX.utils.json_to_sheet(yearRows);
  XLSX.utils.book_append_sheet(wb, yearWs, '年度別集計');

  // Write file
  XLSX.writeFile(wb, filename);
}

/**
 * アップロードされたエクセルファイルを解析して MatchRecord の配列に変換する
 */
export async function parseExcelFile(file: File): Promise<{
  sheetNames: string[];
  records: MatchRecord[];
  rawRowCount: number;
  unrecognizedColumns: string[];
}> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  const sheetNames = workbook.SheetNames;

  // 全シートから観戦データと思われるシートを探す（シート名に「記録」「試合」「データ」「20」などが含まれるか、最初のシート）
  let targetSheetName = sheetNames[0];
  const preferredSheet = sheetNames.find(s =>
    s.includes('記録') || s.includes('試合') || s.includes('データ') || s.includes('ログ') || /20\d\d/.test(s)
  );
  if (preferredSheet) {
    targetSheetName = preferredSheet;
  }

  const worksheet = workbook.Sheets[targetSheetName];
  if (!worksheet) {
    throw new Error('有効なワークシートが見つかりませんでした。');
  }

  // Convert to JSON (header as row 1)
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  const recognizedColumns = new Set<string>();
  const parsedRecords: MatchRecord[] = [];

  rawRows.forEach((row, idx) => {
    // 必須に近いキーを探す（日付または対戦カード）
    const rowKeys = Object.keys(row);

    const findVal = (keywords: string[]) => {
      for (const k of rowKeys) {
        const lower = k.toLowerCase().trim();
        for (const kw of keywords) {
          if (lower.includes(kw.toLowerCase())) {
            recognizedColumns.add(k);
            return row[k];
          }
        }
      }
      return undefined;
    };

    // Date
    let rawDate = findVal(['日付', '開催日', 'date', '年月日', '日程']);
    let dateStr = '';
    let isDateUnknown = false;

    if (rawDate instanceof Date) {
      const y = rawDate.getFullYear();
      const m = String(rawDate.getMonth() + 1).padStart(2, '0');
      const d = String(rawDate.getDate()).padStart(2, '0');
      dateStr = `${y}-${m}-${d}`;
    } else if (typeof rawDate === 'string' && rawDate.trim()) {
      const match = rawDate.match(/(\d{4})[./\-](\d{1,2})[./\-](\d{1,2})/);
      if (match) {
        dateStr = `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`;
      } else {
        dateStr = rawDate.trim();
      }
    } else if (typeof rawDate === 'number') {
      // Excel serial date
      const parsed = new Date((rawDate - 25569) * 86400 * 1000);
      if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, '0');
        const d = String(parsed.getDate()).padStart(2, '0');
        dateStr = `${y}-${m}-${d}`;
      }
    }

    if (!dateStr) {
      isDateUnknown = true;
    }

    // Time
    const rawTime = findVal(['開始', '時刻', '時間', 'time']);
    let timeStr = '14:00';
    if (typeof rawTime === 'string' && /\d{1,2}:\d{2}/.test(rawTime)) {
      const m = rawTime.match(/(\d{1,2}:\d{2})/);
      if (m) timeStr = m[1];
    }

    // Stadium
    const rawStadium = String(findVal(['球場', 'stadium', 'スタジアム', '場所']) || '').trim();
    let stadiumId = 'vantelin_dome';
    let stadiumCustom: string | undefined = undefined;

    if (rawStadium) {
      const matched = STADIUMS.find(s => s.name.includes(rawStadium) || rawStadium.includes(s.shortName));
      if (matched) {
        stadiumId = matched.id;
      } else if (rawStadium.includes('ナゴヤ') || rawStadium.includes('鳴海')) {
        stadiumId = 'nagoya_stadium';
      } else if (rawStadium.includes('甲子園')) {
        stadiumId = 'koshien';
      } else if (rawStadium.includes('東京ドーム')) {
        stadiumId = 'tokyo_dome';
      } else if (rawStadium.includes('神宮')) {
        stadiumId = 'jingu';
      } else if (rawStadium.includes('横浜') || rawStadium.includes('ハマスタ')) {
        stadiumId = 'yokohama';
      } else if (rawStadium.includes('マツダ') || rawStadium.includes('広島')) {
        stadiumId = 'mazda';
      } else {
        stadiumId = 'other_stadium';
        stadiumCustom = rawStadium;
      }
    }

    // Teams
    const rawCard = String(findVal(['対戦', 'カード', '試合', 'versus', 'vs']) || '');
    const rawHome = String(findVal(['ホーム', 'home', '先攻/後攻']) || '');
    const rawAway = String(findVal(['ビジター', 'away', 'ビジター球団', '相手']) || '');

    let homeTeamId = 'dragons';
    let awayTeamId = 'tigers';

    const matchTeamByName = (txt: string) => {
      const t = TEAMS.find(item => txt.includes(item.shortName) || txt.includes(item.name) || txt.toLowerCase().includes(item.code.toLowerCase()));
      return t ? t.id : null;
    };

    if (rawCard && rawCard.includes('vs')) {
      const parts = rawCard.split(/vs|VS|-/);
      if (parts.length >= 2) {
        homeTeamId = matchTeamByName(parts[0]) || 'dragons';
        awayTeamId = matchTeamByName(parts[1]) || 'tigers';
      }
    } else {
      if (rawHome) homeTeamId = matchTeamByName(rawHome) || homeTeamId;
      if (rawAway) awayTeamId = matchTeamByName(rawAway) || awayTeamId;
    }

    // Category
    const rawCategory = String(findVal(['カテゴリ', '種別', '1軍', '2軍', 'category']) || '');
    const categories: CategoryId[] = [];
    let primaryCategory: CategoryId = 'dragons_1st';

    if (rawCategory.includes('2軍') || rawCategory.includes('ファーム') || rawStadium.includes('ナゴヤ球場')) {
      categories.push('dragons_2nd');
      primaryCategory = 'dragons_2nd';
    } else if (rawCategory.includes('侍') || rawCategory.includes('代表') || rawCategory.includes('ジャパン')) {
      categories.push('japan');
      primaryCategory = 'japan';
    } else {
      categories.push('dragons_1st');
      primaryCategory = 'dragons_1st';
    }

    // Scores
    const rawHomeScore = findVal(['ホーム得点', '自得点', 'スコア(ホーム)', '得点']);
    const rawAwayScore = findVal(['ビジター得点', '相手得点', 'スコア(ビジター)', '失点']);
    let homeScore: number | null = null;
    let awayScore: number | null = null;

    if (rawHomeScore !== undefined && rawHomeScore !== '') homeScore = Number(rawHomeScore);
    if (rawAwayScore !== undefined && rawAwayScore !== '') awayScore = Number(rawAwayScore);

    // Score combined string e.g. "4 - 2" or "4-2"
    const rawScoreStr = String(findVal(['スコア', '結果', 'スコア結果', 'score']) || '');
    if ((homeScore === null || awayScore === null) && rawScoreStr) {
      const m = rawScoreStr.match(/(\d+)\s*[-–対]\s*(\d+)/);
      if (m) {
        homeScore = Number(m[1]);
        awayScore = Number(m[2]);
      }
    }

    // Seat info - pure integers for row and seatNumber
    const rawSeatType = String(findVal(['席種', 'シート', '席タイプ', 'seat']) || '').trim();
    const rawArea = String(findVal(['エリア', '塁側', '側', '位置']) || '').trim();
    const rawRow = String(findVal(['列', '段', 'row']) || '').replace(/[^0-9]/g, '');
    const rawSeatNum = String(findVal(['席番', '番号', '席', 'number']) || '').replace(/[^0-9]/g, '');

    // Cost info
    const rawPrice = findVal(['チケット総額', '金額', '料金', '定価', 'price']);
    const rawExpense = findVal(['自己負担', '負担額', '支払額', '実費', 'expense']);
    const rawVendor = String(findVal(['購入先', '購入元', '販売元', 'vendor']) || '').trim();
    const rawPaymentMethod = String(findVal(['決済方法', '支払方法', '支払い']) || '').trim();

    // Duration (○時間○分 or minutes)
    const rawDuration = String(findVal(['試合時間', '所要時間', '時間(分)', 'duration']) || '').trim();
    let durationMinutes: number | null = null;
    if (rawDuration) {
      const matchHM = rawDuration.match(/(\d+)\s*時間\s*(\d+)?/);
      if (matchHM) {
        const h = parseInt(matchHM[1], 10);
        const m = matchHM[2] ? parseInt(matchHM[2], 10) : 0;
        durationMinutes = h * 60 + m;
      } else if (/^\d+$/.test(rawDuration)) {
        durationMinutes = parseInt(rawDuration, 10);
      }
    }

    // Pitchers
    const homeStarter = String(findVal(['自軍先発', '先発投手', 'ホーム先発', '先発']) || '').trim();
    const awayStarter = String(findVal(['相手先発', 'ビジター先発', '対戦先発']) || '').trim();
    const winningPitcher = String(findVal(['勝利投手', '勝投手']) || '').trim();
    const losingPitcher = String(findVal(['敗戦投手', '負投手']) || '').trim();
    const savePitcher = String(findVal(['セーブ', 'S投手']) || '').trim();

    // Companions & Memos
    const companions = String(findVal(['同行者', '同行', '一緒', 'companion']) || '').trim();
    const watchMemo = String(findVal(['観戦メモ', 'メモ', '感想', 'memo']) || '').trim();
    const notes = String(findVal(['備考', '特記事項', '見どころ', 'notes']) || '').trim();

    // Match status
    let matchStatus: MatchStatus = 'finished';
    let watchStatus: WatchStatus = 'watched';
    const statusVal = String(findVal(['状態', 'ステータス', 'status']) || '');
    if (statusVal.includes('中止') || statusVal.includes('雨天')) {
      matchStatus = 'cancelled';
      watchStatus = 'cancelled';
    } else if (statusVal.includes('予定') || homeScore === null) {
      matchStatus = 'scheduled';
      watchStatus = 'scheduled';
    }

    const record: MatchRecord = {
      id: `imported_${Date.now()}_${idx}`,
      date: dateStr,
      time: timeStr,
      isDateUnknown,
      homeTeamId,
      awayTeamId,
      stadiumId,
      stadiumCustom,
      matchType: 'official' as MatchType,
      matchStatus,
      homeScore,
      awayScore,
      isScoreConfirmed: homeScore !== null && awayScore !== null,
      matchDurationMinutes: durationMinutes,
      pitchers: {
        homeStarter: homeStarter || undefined,
        awayStarter: awayStarter || undefined,
        winningPitcher: winningPitcher || undefined,
        losingPitcher: losingPitcher || undefined,
        savePitcher: savePitcher || undefined,
      },
      watchStatus,
      cheerTeamId: 'dragons',
      categories,
      primaryCategory,
      seatInfo: {
        seatTypeName: rawSeatType || undefined,
        area: rawArea || undefined,
        row: rawRow || undefined,
        seatNumber: rawSeatNum || undefined,
      },
      costInfo: {
        totalPrice: rawPrice !== undefined && rawPrice !== '' ? Number(rawPrice) : null,
        myExpense: rawExpense !== undefined && rawExpense !== '' ? Number(rawExpense) : null,
        paymentDestination: rawVendor || undefined,
        paymentMethod: rawPaymentMethod || undefined,
        splits: [],
        refundStatus: 'none',
      },
      ticketInfo: {
        status: watchStatus === 'watched' ? 'ticketed' : 'purchased',
        vendor: rawVendor || undefined,
      },
      companions: companions || undefined,
      watchMemo: watchMemo || undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    parsedRecords.push(record);
  });

  const unrecognized = Object.keys(rawRows[0] || {}).filter(k => !recognizedColumns.has(k));

  return {
    sheetNames,
    records: parsedRecords,
    rawRowCount: rawRows.length,
    unrecognizedColumns: unrecognized,
  };
}
