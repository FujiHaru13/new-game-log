import React, { useMemo } from 'react';
import type { TicketManagement, TicketStatus } from '../../types/baseball';
import type { TicketEditorDraft } from '../../lib/atomic/ticketEditorDraft';
import { addTicketRow, editTicketRow, removeTicketRow, ticketEditorChanges, ticketEditorHasChanges, undoTicketDeletion } from '../../lib/atomic/ticketEditorDraft';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';

const statuses: Array<{ value: TicketStatus; label: string }> = [
  { value: 'release_waiting', label: '発売待ち' },
  { value: 'plan_to_buy', label: '購入予定' },
  { value: 'purchased', label: '購入済み' },
  { value: 'ticket_waiting', label: '発券待ち' },
  { value: 'ticketed', label: '発券済み' },
  { value: 'cancelled_refund', label: 'キャンセル・払戻' },
];
const inputClass = 'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-sm';

export function MultiTicketEditor({ draft, onChange }: { draft: TicketEditorDraft; onChange: (draft: TicketEditorDraft) => void }) {
  const summary = useMemo(() => {
    try { return { changes: ticketEditorChanges(draft), error: null as string | null }; }
    catch (error) { return { changes: null, error: error instanceof Error ? error.message : 'チケット入力が不正です' }; }
  }, [draft]);
  const dirty = summary.changes ? ticketEditorHasChanges(summary.changes) : true;
  const update = (index: number, field: keyof TicketManagement, value: string | number | null) => onChange(editTicketRow(draft, index, field, value));

  return (
    <section className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-3" aria-label="複数チケット編集（保存準備）">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white">チケット一覧・編集準備</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300">各行の内容は一時保存されません。クラウドv2未接続のため、この画面からはまだ確定できません。</p>
        </div>
        <button type="button" className="rounded-lg bg-blue-800 px-3 py-2 text-xs font-bold text-white flex items-center gap-1" onClick={() => onChange(addTicketRow(draft))}>
          <Plus size={14} /> チケット追加
        </button>
      </div>
      {draft.rows.length === 0 && <p className="text-slate-500 text-sm">登録するチケットはありません。</p>}
      {draft.rows.map((ticket, index) => (
        <div key={ticket.id || ticket.clientKey} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm">チケット {index + 1} {ticket.id ? '（登録済み）' : '（新規）'}</span>
            <button type="button" onClick={() => onChange(removeTicketRow(draft, index))} className="text-rose-700 dark:text-rose-300 flex items-center gap-1 text-xs" aria-label={`チケット${index + 1}を削除予定にする`}><Trash2 size={14} /> 削除</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs font-semibold">状態
              <select className={inputClass} value={ticket.status || 'release_waiting'} onChange={event => update(index, 'status', event.target.value)}>
                {statuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold">枚数
              <input className={inputClass} type="number" min="1" step="1" value={ticket.quantity ?? ''} onChange={event => update(index, 'quantity', event.target.value === '' ? null : Number(event.target.value))} placeholder="未設定" />
            </label>
            <label className="text-xs font-semibold">購入先
              <input className={inputClass} value={ticket.vendor ?? ''} onChange={event => update(index, 'vendor', event.target.value || null)} placeholder="ドラチケなど" />
            </label>
            <label className="text-xs font-semibold">チケット種別
              <input className={inputClass} value={ticket.ticketType ?? ''} onChange={event => update(index, 'ticketType', event.target.value || null)} />
            </label>
            <label className="text-xs font-semibold">発売日
              <input className={inputClass} type="date" value={ticket.releaseDate ?? ''} onChange={event => update(index, 'releaseDate', event.target.value || null)} />
            </label>
            <label className="text-xs font-semibold">購入日
              <input className={inputClass} type="date" value={ticket.purchaseDate ?? ''} onChange={event => update(index, 'purchaseDate', event.target.value || null)} />
            </label>
            <label className="text-xs font-semibold">発券日
              <input className={inputClass} type="date" value={ticket.issueDate ?? ''} onChange={event => update(index, 'issueDate', event.target.value || null)} />
            </label>
            <label className="text-xs font-semibold">支払い期限
              <input className={inputClass} type="date" value={ticket.paymentDeadline ?? ''} onChange={event => update(index, 'paymentDeadline', event.target.value || null)} />
            </label>
            <label className="text-xs font-semibold sm:col-span-2">備考
              <textarea className={inputClass} rows={2} value={ticket.notes ?? ''} onChange={event => update(index, 'notes', event.target.value || null)} />
            </label>
          </div>
        </div>
      ))}
      {draft.deletedIds.length > 0 && (
        <div className="space-y-2">
          <p className="font-semibold text-xs">削除予定（まだDBには反映されていません）</p>
          {draft.deletedIds.map(id => <div key={id} className="flex items-center justify-between text-xs gap-2"><span className="truncate">{id}</span><button type="button" onClick={() => onChange(undoTicketDeletion(draft, id))} className="flex shrink-0 items-center gap-1 text-blue-700"><RotateCcw size={13} /> 取消</button></div>)}
        </div>
      )}
      {summary.error ? <p role="alert" className="text-sm font-semibold text-red-700">入力内容を確認してください：{summary.error}</p> : (
        <p className="text-sm font-semibold">変更予定：追加 {summary.changes!.create.length}件・更新 {summary.changes!.update.length}件・削除 {summary.changes!.delete.length}件</p>
      )}
      {dirty && <p role="status" className="rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 p-2 text-xs">複数チケットの変更はv2保存経路への画面接続後に確定できます。現時点では誤保存防止のため、この編集内容を含む保存は拒否します。</p>}
    </section>
  );
}
