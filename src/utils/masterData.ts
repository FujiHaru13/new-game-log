/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * マスター管理ユーティリティ。
 *
 * 「マスター」は専用テーブルではなく、全記録から動的に抽出される名前一覧。
 * 投手・本塁打選手・席種名・同行者の4カテゴリを扱い、使用件数（=その名前を
 * 含む記録の件数）つきで一覧化する。名前変更は該当する全記録への一括置換で、
 * 永続化は呼び出し側が Context の保存経路を通して行う。
 */

import { MatchRecord } from '../types/baseball';

export type MasterKind = 'pitchers' | 'homeRunPlayers' | 'seatTypes' | 'companions';

export const MASTER_KIND_LABELS: Record<MasterKind, string> = {
  pitchers: '投手',
  homeRunPlayers: '本塁打選手',
  seatTypes: '席種名',
  companions: '同行者',
};

export interface MasterEntry {
  name: string;
  /** その名前を含む記録の件数 */
  count: number;
}

/** 同行者文字列を「、」「,」で分割して個人名の配列にする */
export function splitCompanionNames(value: string): string[] {
  return value
    .split(/[,、]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/** 本塁打エントリ（例:「細川成也 21号2ラン(3回裏・戸郷)」）から先頭の選手名部分を抽出する */
export function extractHomeRunPlayer(value: string): string {
  const first = value.split(/[\s　]+/)[0]?.trim() || '';
  return first;
}

const PITCHER_FIELDS = ['homeStarter', 'awayStarter', 'winningPitcher', 'losingPitcher', 'savePitcher'] as const;

function recordMasterNames(record: MatchRecord, kind: MasterKind): string[] {
  switch (kind) {
    case 'pitchers': {
      const p = record.pitchers;
      if (!p) return [];
      return PITCHER_FIELDS.map(f => (p[f] || '').trim()).filter(Boolean);
    }
    case 'homeRunPlayers':
      return (record.homeRuns || []).map(extractHomeRunPlayer).filter(Boolean);
    case 'seatTypes': {
      const name = (record.seatInfo?.seatTypeName || '').trim();
      return name ? [name] : [];
    }
    case 'companions':
      return splitCompanionNames(record.companions || '');
  }
}

/** 全記録からマスター一覧（名前＋使用件数）を抽出する。使用件数降順→名前順。 */
export function extractMasterEntries(records: MatchRecord[], kind: MasterKind): MasterEntry[] {
  const counts = new Map<string, number>();
  records.forEach(record => {
    // 1記録の中で同じ名前が複数回出ても使用件数は1件として数える
    const unique = new Set(recordMasterNames(record, kind));
    unique.forEach(name => counts.set(name, (counts.get(name) || 0) + 1));
  });
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ja'));
}

/** その記録が置換対象（oldName を含む）かどうか */
export function recordUsesMasterName(record: MatchRecord, kind: MasterKind, name: string): boolean {
  return recordMasterNames(record, kind).includes(name);
}

/**
 * 1記録に対して名前置換を適用する。変更が無ければ null を返す。
 * - 投手: pitchers の各欄が oldName と完全一致する場合のみ置換
 * - 本塁打: エントリ先頭の選手名が oldName の場合、その部分だけを置換（後続の詳細は保持）。
 *   「牧・森下」のように複数名が1エントリに連結されている場合は該当トークンだけ置換
 * - 席種: seatInfo.seatTypeName が完全一致する場合のみ置換
 * - 同行者: companions の該当トークンだけを置換し、「、」連結で保存
 */
export function applyMasterRename(
  record: MatchRecord,
  kind: MasterKind,
  oldName: string,
  newName: string,
): MatchRecord | null {
  if (!recordUsesMasterName(record, kind, oldName)) return null;

  switch (kind) {
    case 'pitchers': {
      const p = record.pitchers || {};
      const next = { ...p };
      PITCHER_FIELDS.forEach(f => {
        if ((p[f] || '').trim() === oldName) next[f] = newName;
      });
      return { ...record, pitchers: next };
    }
    case 'homeRunPlayers': {
      const nextEntries = (record.homeRuns || []).map(entry => renameHomeRunEntry(entry, oldName, newName));
      return { ...record, homeRuns: nextEntries };
    }
    case 'seatTypes':
      return { ...record, seatInfo: { ...record.seatInfo, seatTypeName: newName } };
    case 'companions': {
      const tokens = splitCompanionNames(record.companions || '').map(t => (t === oldName ? newName : t));
      // 置換で重複が生じた場合は1つにまとめる（統合時の自然な挙動）
      const deduped = [...new Set(tokens)];
      return { ...record, companions: deduped.length > 0 ? deduped.join('、') : undefined };
    }
  }
}

function renameHomeRunEntry(entry: string, oldName: string, newName: string): string {
  const trimmed = entry.trim();
  if (trimmed === oldName) return newName;
  // 先頭トークンが選手名の場合: 区切り（空白）以降の詳細を保持して先頭だけ差し替える
  const match = trimmed.match(/^(\S+)([\s　].*)$/s);
  if (match && match[1] === oldName) {
    return newName + match[2];
  }
  // 「牧・森下」形式: 連結トークンの該当部分だけ差し替える
  if (trimmed.includes('・')) {
    const parts = trimmed.split('・');
    if (parts.some(p => p.trim() === oldName)) {
      return parts.map(p => (p.trim() === oldName ? newName : p)).join('・');
    }
  }
  return entry;
}

/** 置換で影響を受ける記録を変換済みレコードの一覧として返す */
export function buildMasterRenameTargets(
  records: MatchRecord[],
  kind: MasterKind,
  oldName: string,
  newName: string,
): MatchRecord[] {
  const targets: MatchRecord[] = [];
  records.forEach(record => {
    const renamed = applyMasterRename(record, kind, oldName, newName);
    if (renamed) targets.push(renamed);
  });
  return targets;
}
