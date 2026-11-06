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
import { exportRecordsToExcel, parseExcelFile } from '../../utils/excelUtils';

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
  const [excelParseResult, setExcelParseResult] = useState<{
    sheetNames: string[];
    records: MatchRecord[];
    rawRowCount: number;
    unrecognizedColumns: string[];
  } | null>(null);

  // Supabase form
  const [sbUrl, setSbUrl] = useState(supabaseConfig.url);
  const [sbAnonKey, setSbAnonKey] = useState(supabaseConfig.anonKey);
  const [sbStatusMsg, setSbStatusMsg] = useState<string | null>(null);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await parseExcelFile(file);
      setExcelParseResult(res);
      setImportMessage({
        type: 'success',
        text: `「${file.name}」の解析に成功しました（シート数: ${res.sheetNames.length}, 解析試合数: ${res.records.length}件）。下の「取り込みを実行」ボタンを押してください。`,
      });
    } catch (err: any) {
      setImportMessage({
        type: 'error',
        text: `Excelファイルの解析に失敗しました: ${err.message}`,
      });
    }
  };

  const applyExcelImport = () => {
    if (!excelParseResult) return;
    const res = importRecords(excelParseResult.records, importMode);
    setImportMessage({
      type: 'success',
      text: `Excelからの取り込みが完了しました（新規追加: ${res.added}件, 更新: ${res.updated}件）。`,
    });
    setExcelParseResult(null);
  };

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
    setSbStatusMsg('接続設定を保存しました。次回の認証確認からSupabaseのRLS保護されたデータを使用します。');
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Excel (.xlsx) Export */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-[#003882] dark:text-blue-400">
                <FileSpreadsheet className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Excel (.xlsx) 出力</h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                全17シート集計構造（観戦一覧・年度別・対戦相手・球場・曜日・先発・費用）を含むExcelブックを出力。
              </p>
              <button
                onClick={() => exportRecordsToExcel(records)}
                className="w-full py-2 px-3 text-xs font-bold text-white bg-[#003882] hover:bg-[#002868] rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excelを出力 (.xlsx)</span>
              </button>
            </div>

            {/* CSV Export */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-600">
                <FileSpreadsheet className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">CSVエクスポート</h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Excelやスプレッドシートで閲覧・再集計できるUTF-8 BOM付きCSV形式で出力します。
              </p>
              <button
                onClick={exportToCSV}
                className="w-full py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSVを出力</span>
              </button>
            </div>

            {/* JSON Export */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-blue-600">
                <Download className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">JSON完全バックアップ</h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                詳細イニング、投手情報、座席、費用分割明細を含む完全バックアップJSONを保存します。
              </p>
              <button
                onClick={exportToJSON}
                className="w-full py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSONを出力</span>
              </button>
            </div>

            {/* Reset to Demo Data */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-600">
                <RefreshCw className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">初期データ復元</h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                動作確認用の初期サンプル観戦記録（中日1軍・2軍・侍ジャパン・予定）へ初期化します。
              </p>
              <button
                onClick={() => {
                  if (window.confirm('初期デモデータにリセットしますか？現在のローカル変更は上書きされます。')) {
                    resetToDemoData();
                  }
                }}
                className="w-full py-2 px-3 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 rounded-xl border border-amber-200 dark:border-amber-800 transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>初期状態にリセット</span>
              </button>
            </div>
          </div>

          {/* Excel File Import Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Excelファイル（観戦記録.xlsx）の取り込み</span>
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                .xlsx / .xls / .csv 対応
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                お持ちの「観戦記録.xlsx」をブラウザ上で解析し、直接インポートできます:
              </p>
              <p>
                「日付」「球場」「ホーム/ビジター」「スコア」「席種」「列」「席番号」「費用」「同行者」「先発投手」などの列ヘッダーを自動認識してデータ化します。
              </p>
            </div>

            {/* File Upload Zone */}
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl p-6 text-center transition-all bg-slate-50/40 dark:bg-slate-950/20">
              <input
                type="file"
                id="excelFileInput"
                accept=".xlsx, .xls, .csv"
                onChange={handleExcelUpload}
                className="hidden"
              />
              <label
                htmlFor="excelFileInput"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#003882] dark:text-blue-400 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    ファイルを選択
                  </span>
                  <span className="text-xs text-slate-500"> またはここに「観戦記録.xlsx」をドラッグ＆ドロップ</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Microsoft Excel (.xlsx), CSV形式に対応（複数シート自動検出）
                </span>
              </label>
            </div>

            {/* Excel Parsing Status or Preview */}
            {excelParseResult && (
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    検出シート: {excelParseResult.sheetNames.join(', ')}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {excelParseResult.records.length} 件の試合データを解析
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-blue-200/60 dark:border-blue-800/60">
                  <div className="flex items-center gap-4 text-xs">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="excelImportMode"
                        value="merge"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="text-blue-600"
                      />
                      <span>既存データと統合</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="excelImportMode"
                        value="replace"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-blue-600"
                      />
                      <span>現在のデータを全件置換</span>
                    </label>
                  </div>

                  <button
                    onClick={applyExcelImport}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{excelParseResult.records.length}件を取り込む</span>
                  </button>
                </div>
              </div>
            )}

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
          </div>

          {/* JSON Restore */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>JSON直接貼り付けインポート</span>
            </h3>

            <div className="space-y-3">
              <textarea
                rows={4}
                placeholder="JSONテキストをここに貼り付けてインポート（例: [{'id': 'rec_01', 'date': '2026-09-12', ...}]）"
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
              Supabase Project URLとPublishable Keyを設定すると、認証済み本人のデータをRLS経由で読み書きします。
              service_roleキーは使用せず、未認証・未承認時にデモデータへ自動フォールバックしません。
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
                Supabase Publishable Key (※service_roleは絶対に入力しないでください)
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
