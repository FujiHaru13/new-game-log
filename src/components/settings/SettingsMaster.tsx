/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBaseball } from '../../context/BaseballContext';
import { TEAMS } from '../../data/teams';
import { STADIUMS } from '../../data/stadiums';
import { TeamLogo } from '../common/TeamLogo';
import {
  Settings,
  Database,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Lock,
  Layers,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { MatchRecord } from '../../types/baseball';

export const SettingsMaster: React.FC = () => {
  const {
    records,
    resetToDemoData,
    exportToJSON,
    exportToCSV,
    importRecords,
    supabaseConfig,
    updateSupabaseConfig,
  } = useBaseball();

  const [activeTab, setActiveTab] = useState<'backup' | 'master_teams' | 'master_stadiums' | 'supabase'>('backup');
  const [jsonInput, setJsonInput] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Supabase form
  const [sbUrl, setSbUrl] = useState(supabaseConfig.url);
  const [sbAnonKey, setSbAnonKey] = useState(supabaseConfig.anonKey);
  const [sbStatusMsg, setSbStatusMsg] = useState<string | null>(null);

  const handleJsonImport = () => {
    setImportMessage(null);
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error('インポートデータは試合記録の配列(JSON Array)である必要があります。');
      }
      const res = importRecords(parsed as MatchRecord[], importMode);
      setImportMessage({
        type: 'success',
        text: `インポートが完了しました（新規追加: ${res.added}件, 更新: ${res.updated}件）。`,
      });
      setJsonInput('');
    } catch (err: any) {
      setImportMessage({
        type: 'error',
        text: `JSONの解析またはインポートに失敗しました: ${err.message}`,
      });
    }
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseConfig({
      url: sbUrl,
      anonKey: sbAnonKey,
      isConnected: sbUrl.length > 0 && sbAnonKey.length > 0,
    });
    setSbStatusMsg('設定を保存しました。現在は安全なデモモード（ローカル保存）で継続動作しています。');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
            <span>システム設定 · マスターデータ · データ移行</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            設定 & マスター管理
          </h2>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto text-xs">
          {[
            { id: 'backup', label: 'データ移行・バックアップ' },
            { id: 'master_teams', label: '球団マスター' },
            { id: 'master_stadiums', label: '球場・席種マスター' },
            { id: 'supabase', label: 'Supabase・本番連携準備' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: BACKUP & DATA MIGRATION */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Export & Demo Reset Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* JSON Export */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Download className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">JSONバックアップ</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                全観戦記録・詳細スコア・座席・費用分割明細を完全なJSON形式で保存します。
              </p>
              <button
                onClick={exportToJSON}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#003882] hover:bg-[#002868] rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>JSONファイルをダウンロード</span>
              </button>
            </div>

            {/* CSV Export */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <FileSpreadsheet className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">CSVエクスポート</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Excelやスプレッドシートで閲覧・再集計できるUTF-8 BOM付きCSV形式で出力します。
              </p>
              <button
                onClick={exportToCSV}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>CSVを出力 (Excel対応)</span>
              </button>
            </div>

            {/* Reset to Demo Data */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-600">
                <RefreshCw className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">デモ初期データ復元</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                動作確認用の初期サンプル観戦記録（中日1軍・2軍・侍ジャパン・予定）へ初期化します。
              </p>
              <button
                onClick={() => {
                  if (window.confirm('初期デモデータにリセットしますか？現在のローカル変更は上書きされます。')) {
                    resetToDemoData();
                  }
                }}
                className="w-full py-2.5 px-4 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 rounded-xl border border-amber-200 dark:border-amber-800 transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>デモデータに初期化</span>
              </button>
            </div>
          </div>

          {/* JSON Restore & Future Excel Migration Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>JSON復元 / Excel原本移行用インポート</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Excel原本17シート（ユニーク254試合 / 延べ258カテゴリ）の移行仕様について:
              </p>
              <p>
                本アプリのデータモデルは、1試合が複数カテゴリに属する多対多構造、同一日複数試合、日付不明・球場不明などの欠損値、およびスコア0と未入力の厳密な区別を完全サポートしています。
              </p>
            </div>

            {importMessage && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                importMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200'
              }`}>
                {importMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{importMessage.text}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">インポート方式:</span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="text-blue-600"
                  />
                  <span>既存データと統合（ID重複時は上書き更新）</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-blue-600"
                  />
                  <span>全件入れ替え（現在のデータを置換）</span>
                </label>
              </div>

              <textarea
                rows={5}
                placeholder="JSONテキストをここに貼り付けてください（例: [{'id': 'rec_01', 'date': '2026-09-12', ...}]）"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100"
              />

              <button
                onClick={handleJsonImport}
                disabled={!jsonInput.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-[#003882] hover:bg-[#002868] rounded-xl transition-all disabled:opacity-40"
              >
                JSONデータを復元・インポート
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: TEAMS MASTER */}
      {activeTab === 'master_teams' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              NPB球団・ファーム・日本代表マスター ({TEAMS.length}球団)
            </h3>
            <span className="text-xs text-slate-500">公式カラー・所属リーグ定義</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TEAMS.map(team => (
              <div
                key={team.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <TeamLogo teamId={team.id} size="md" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      {team.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      略称: {team.shortName} · {team.leagueName}
                    </span>
                  </div>
                </div>
                <div
                  className="w-4 h-4 rounded-full border border-white dark:border-slate-700 shadow-xs"
                  style={{ backgroundColor: team.color }}
                  title={`カラーコード: ${team.color}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: STADIUMS & SEAT TYPES MASTER */}
      {activeTab === 'master_stadiums' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>球場 & 席種構造化マスター</span>
            </h3>

            <div className="space-y-4">
              {STADIUMS.map(std => (
                <div
                  key={std.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {std.name} {std.isDome && ' (ドーム)'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      席種定義: {std.seatTypes.length}件
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{std.location}</p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {std.seatTypes.map(st => (
                      <span
                        key={st.id}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]"
                      >
                        {st.displayName}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: SUPABASE & PRODUCTION READINESS */}
      {activeTab === 'supabase' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Server className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Supabase 接続 & RLS (Row Level Security) 連携設定
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              本アプリは現在、安全なローカルストレージ（デモモード）で全機能を動作させています。
              将来的に本人のSupabaseプロジェクトへ移行する際、下記にURLとAnon Keyを設定することで、シームレスにPostgreSQL同期へ拡張できます。
            </p>
          </div>

          {sbStatusMsg && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs">
              {sbStatusMsg}
            </div>
          )}

          <form onSubmit={handleSaveSupabaseConfig} className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={sbUrl}
                onChange={(e) => setSbUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Supabase Anon Public Key (※service_roleは絶対に入力しないでください)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                value={sbAnonKey}
                onChange={(e) => setSbAnonKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-[#003882] hover:bg-[#002868] rounded-xl transition-all shadow-sm"
            >
              接続設定を保存
            </button>
          </form>

          {/* RLS Architecture SQL Script Preview */}
          <div className="p-4 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold">
              <Lock className="w-4 h-4" />
              <span>本番用 PostgreSQL スキーマ & RLS セキュリティポリシー</span>
            </div>
            <pre className="font-mono text-[11px] overflow-x-auto text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
{`-- 観戦記録テーブル
create table if not exists match_records (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  date text,
  time text,
  is_date_unknown boolean default false,
  home_team_id text not null,
  away_team_id text not null,
  stadium_id text not null,
  match_type text not null,
  match_status text not null,
  home_score integer,
  away_score integer,
  cheer_team_id text not null,
  categories text[] not null,
  primary_category text not null,
  seat_info jsonb default '{}'::jsonb,
  cost_info jsonb default '{}'::jsonb,
  ticket_info jsonb default '{}'::jsonb,
  innings jsonb,
  pitchers jsonb,
  home_runs text[],
  watch_memo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS (Row Level Security) の有効化: 本人のみ読み書きを許可
alter table match_records enable row level security;

create policy "Users can manage only their own match logs"
on match_records for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
