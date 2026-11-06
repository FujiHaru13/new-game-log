/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBaseball } from '../../context/BaseballContext';
import { MatchRecord } from '../../types/baseball';
import { getTeam, CATEGORIES } from '../../data/teams';
import { getStadium, getSeatType } from '../../data/stadiums';
import {
  formatMatchDate,
  formatCurrency,
  getMatchResult,
  getStadiumDisplayName,
  getMatchTypeName,
  formatSeatRow,
  formatSeatNumber,
  formatMatchDuration,
} from '../../utils/baseballUtils';
import { TeamLogo } from '../common/TeamLogo';
import { ScoreboardBadge } from '../common/ScoreboardBadge';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Coins,
  Edit2,
  Trash2,
  X,
  User,
  FileText,
  AlertCircle,
  ExternalLink,
  Flame,
  Award,
} from 'lucide-react';

interface RecordDetailProps {
  record: MatchRecord;
  onClose: () => void;
  onEdit: (record: MatchRecord) => void;
}

export const RecordDetail: React.FC<RecordDetailProps> = ({ record, onClose, onEdit }) => {
  const { deleteRecord } = useBaseball();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const homeTeam = getTeam(record.homeTeamId);
  const awayTeam = getTeam(record.awayTeamId);
  const cheerTeam = getTeam(record.cheerTeamId);
  const stadium = getStadium(record.stadiumId);
  const seatType = getSeatType(record.stadiumId, record.seatInfo.seatTypeId);
  const result = getMatchResult(record);

  const handleDeleteConfirm = async () => {
    try {
      await deleteRecord(record.id);
      setIsDeleteModalOpen(false);
      onClose();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '削除に失敗しました。');
    }
  };

  const innings = record.innings;
  const maxInnings = innings ? Math.max(9, innings.home.length, innings.away.length) : 9;
  const inningCols = Array.from({ length: maxInnings }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#003882] text-white">
              {getMatchTypeName(record.matchType)}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              {record.categories.map(catId => {
                const c = CATEGORIES.find(item => item.id === catId);
                return (
                  <span key={catId} className="font-semibold text-slate-700 dark:text-slate-300">
                    {c?.shortLabel}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(record)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>編集</span>
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>削除</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg ml-1"
              aria-label="詳細を閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Main Scoreboard Display (Ballpark Motif) */}
          <div className="bg-slate-950 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-lg">
            {/* Top Info Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pb-3 border-b border-slate-800/80 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-white font-bold">
                  {formatMatchDate(record.date, record.isDateUnknown)}
                </span>
                {record.time && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {record.time} 試合開始
                  </span>
                )}
                {record.matchDurationMinutes && (
                  <span>(試合時間: {formatMatchDuration(record.matchDurationMinutes)})</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-200">{getStadiumDisplayName(record)}</span>
                <ScoreboardBadge result={result} />
              </div>
            </div>

            {/* Scoreboard Table (Innings 1-9+) */}
            <div className="overflow-x-auto my-4">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="text-[11px] text-slate-400 border-b border-slate-800 font-display">
                    <th className="py-2 text-left pl-3 w-32">TEAM</th>
                    {inningCols.map(num => (
                      <th key={num} className="w-8 py-2 font-bold">{num}</th>
                    ))}
                    <th className="w-12 py-2 font-bold text-amber-400 border-l border-slate-800">R</th>
                    <th className="w-10 py-2 font-bold text-slate-400">H</th>
                    <th className="w-10 py-2 font-bold text-slate-400">E</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-display text-sm">
                  {/* Away Team (Top of inning) */}
                  <tr className="hover:bg-slate-900/60">
                    <td className="py-2.5 pl-3 text-left">
                      <div className="flex items-center gap-2">
                        <TeamLogo teamId={awayTeam.id} size="sm" />
                        <span className="font-bold text-slate-200 text-xs sm:text-sm font-sans truncate">
                          {awayTeam.name}
                        </span>
                      </div>
                    </td>
                    {inningCols.map((_, i) => {
                      const val = innings?.away[i];
                      return (
                        <td key={i} className="py-2.5 font-bold tabular-nums text-slate-300">
                          {val !== undefined && val !== null ? val : '-'}
                        </td>
                      );
                    })}
                    <td className="py-2.5 font-bold text-lg text-amber-400 border-l border-slate-800 tabular-nums">
                      {record.awayScore !== null ? record.awayScore : '-'}
                    </td>
                    <td className="py-2.5 text-xs text-slate-400 tabular-nums">
                      {innings?.awayHits !== undefined && innings.awayHits !== null ? innings.awayHits : '-'}
                    </td>
                    <td className="py-2.5 text-xs text-slate-400 tabular-nums">
                      {innings?.awayErrors !== undefined && innings.awayErrors !== null ? innings.awayErrors : '-'}
                    </td>
                  </tr>

                  {/* Home Team (Bottom of inning) */}
                  <tr className="hover:bg-slate-900/60">
                    <td className="py-2.5 pl-3 text-left">
                      <div className="flex items-center gap-2">
                        <TeamLogo teamId={homeTeam.id} size="sm" />
                        <span className="font-bold text-slate-200 text-xs sm:text-sm font-sans truncate">
                          {homeTeam.name}
                        </span>
                      </div>
                    </td>
                    {inningCols.map((_, i) => {
                      const val = innings?.home[i];
                      return (
                        <td key={i} className="py-2.5 font-bold tabular-nums text-slate-300">
                          {val !== undefined && val !== null ? val : '-'}
                        </td>
                      );
                    })}
                    <td className="py-2.5 font-bold text-lg text-amber-400 border-l border-slate-800 tabular-nums">
                      {record.homeScore !== null ? record.homeScore : '-'}
                    </td>
                    <td className="py-2.5 text-xs text-slate-400 tabular-nums">
                      {innings?.homeHits !== undefined && innings.homeHits !== null ? innings.homeHits : '-'}
                    </td>
                    <td className="py-2.5 text-xs text-slate-400 tabular-nums">
                      {innings?.homeErrors !== undefined && innings.homeErrors !== null ? innings.homeErrors : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Cheer Context Footer */}
            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800 text-slate-400">
              <div className="flex items-center gap-1.5">
                <span>応援チーム:</span>
                <span className="font-bold text-white">{cheerTeam.name}</span>
                <span className="text-[11px] text-slate-500">
                  ({record.cheerTeamId === record.homeTeamId ? 'ホーム側' : 'ビジター側'})
                </span>
              </div>
              <div className="text-slate-400 text-xs">
                {record.isScoreConfirmed ? 'スコア確定' : 'スコア未確定・予定'}
              </div>
            </div>
          </div>

          {/* Highlights & Pitchers Info */}
          {(record.pitchers || (record.homeRuns && record.homeRuns.length > 0) || record.events) && (
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span>バッテリー・本塁打・戦評</span>
              </h4>

              {/* Pitchers Info Grid */}
              {record.pitchers && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {record.pitchers.homeStarter && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-500 block text-[10px] font-semibold">{homeTeam.shortName} 先発</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{record.pitchers.homeStarter}</span>
                    </div>
                  )}
                  {record.pitchers.awayStarter && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-500 block text-[10px] font-semibold">{awayTeam.shortName} 先発</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{record.pitchers.awayStarter}</span>
                    </div>
                  )}
                  {record.pitchers.winningPitcher && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-blue-600 dark:text-blue-400 block text-[10px] font-semibold">勝利投手</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{record.pitchers.winningPitcher}</span>
                    </div>
                  )}
                  {record.pitchers.losingPitcher && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-rose-600 dark:text-rose-400 block text-[10px] font-semibold">敗戦投手</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{record.pitchers.losingPitcher}</span>
                    </div>
                  )}
                  {record.pitchers.savePitcher && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-emerald-600 dark:text-emerald-400 block text-[10px] font-semibold">セーブ</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{record.pitchers.savePitcher}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Home Runs List */}
              {record.homeRuns && record.homeRuns.length > 0 && (
                <div className="text-xs space-y-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    本塁打:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {record.homeRuns.map((hr, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200">
                        {hr}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Events & Summary */}
              {record.events && (
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  {record.events}
                </div>
              )}
            </div>
          )}

          {/* 2-Column Split: Seat & Watch Info / Expenses & Tickets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Seat & Watch Diary */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>座席・観戦情報</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">球場</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-right">
                    {getStadiumDisplayName(record)}
                  </span>
                </div>

                <div className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">席種</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-right">
                    {record.seatInfo.seatTypeName || seatType?.displayName || '未指定'}
                  </span>
                </div>

                <div className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">エリア・列・番号</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                    {[record.seatInfo.area, formatSeatRow(record.seatInfo.row), formatSeatNumber(record.seatInfo.seatNumber)].filter(Boolean).join(' / ') || '座席未定'}
                  </span>
                </div>

                {record.companions && (
                  <div className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      同行者
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                      {record.companions}
                    </span>
                  </div>
                )}

                {record.watchMemo && (
                  <div className="pt-2">
                    <span className="text-slate-500 block mb-1 font-semibold">観戦メモ・日記</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {record.watchMemo}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Tickets & Cost Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>費用・チケット情報</span>
              </h4>

              <div className="space-y-3 text-xs">
                {/* Cost KPI strip */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">チケット総額</span>
                    <span className="font-display font-bold text-base text-slate-900 dark:text-slate-100 tabular-nums">
                      {record.costInfo.totalPrice !== null && record.costInfo.totalPrice !== undefined
                        ? formatCurrency(record.costInfo.totalPrice)
                        : '未設定'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">自己負担額</span>
                    <span className="font-display font-bold text-base text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {record.costInfo.myExpense !== null && record.costInfo.myExpense !== undefined
                        ? formatCurrency(record.costInfo.myExpense)
                        : '未設定'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">チケット状態</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {record.ticketInfo.status === 'purchased' ? '購入済み'
                      : record.ticketInfo.status === 'release_waiting' ? '発売日待ち'
                      : record.ticketInfo.status === 'ticketed' ? '発券・確保済み'
                      : record.ticketInfo.status === 'cancelled_refund' ? '払戻完了'
                      : record.ticketInfo.status}
                  </span>
                </div>

                {record.costInfo.paymentDestination && (
                  <div className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">購入元・支払先</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {record.costInfo.paymentDestination}
                    </span>
                  </div>
                )}

                {record.costInfo.refundAmount !== null && record.costInfo.refundAmount !== undefined && (
                  <div className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-rose-600 dark:text-rose-400">
                    <span>返金・払戻額</span>
                    <span className="font-display font-bold tabular-nums">
                      {formatCurrency(record.costInfo.refundAmount)} ({record.costInfo.refundStatus === 'completed' ? '返金完了' : '手続き中'})
                    </span>
                  </div>
                )}

                {/* Split Payments List */}
                {record.costInfo.splits && record.costInfo.splits.length > 0 && (
                  <div className="pt-2">
                    <span className="text-slate-500 block mb-1.5 font-semibold">分割・明細内訳 ({record.costInfo.splits.length}件)</span>
                    <div className="space-y-1.5">
                      {record.costInfo.splits.map((sp) => (
                        <div
                          key={sp.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/40 text-xs border border-slate-100 dark:border-slate-800"
                        >
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                            {sp.title}
                          </span>
                          <span className="font-display font-bold text-slate-900 dark:text-slate-100 tabular-nums shrink-0 ml-2">
                            {formatCurrency(sp.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          title="観戦記録の削除"
          message={`この観戦記録 (${formatMatchDate(record.date)} ${awayTeam.shortName} vs ${homeTeam.shortName}) を削除してもよろしいですか？この操作は取り消せません。`}
          confirmLabel="削除する"
          cancelLabel="戻る"
          isDestructive={true}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      </div>
    </div>
  );
};
