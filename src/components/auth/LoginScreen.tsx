import React, { useState } from 'react';
import { AlertTriangle, LockKeyhole, LogIn, Settings } from 'lucide-react';
import { useBaseball } from '../../context/BaseballContext';

export const LoginScreen: React.FC = () => {
  const { signIn, supabaseConfig, updateSupabaseConfig, authError } = useBaseball();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState(supabaseConfig.url);
  const [publishableKey, setPublishableKey] = useState(supabaseConfig.anonKey);
  const [showConfig, setShowConfig] = useState(!supabaseConfig.url || !supabaseConfig.anonKey);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveConfig = () => {
    if (!url.trim() || !publishableKey.trim()) {
      setError('Supabase Project URLとPublishable Keyを入力してください。');
      return;
    }
    try {
      updateSupabaseConfig({
        url: url.trim(),
        anonKey: publishableKey.trim(),
        isConnected: true,
      });
      setError(null);
      setShowConfig(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '接続設定を保存できません。');
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'ログインに失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <section className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-7 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
            <LockKeyhole className="w-6 h-6 text-[#003882] dark:text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">観戦ログへログイン</h1>
          <p className="text-xs text-slate-500">承認済みの本人アカウントでログインしてください。</p>
        </div>

        {(error || authError) && (
          <div className="flex gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 text-xs text-red-700 dark:text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error || authError}</span>
          </div>
        )}

        {showConfig ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              <Settings className="w-4 h-4" /> Supabase接続設定
            </div>
            <p className="text-xs text-slate-500">Publishable Keyのみ使用します。service_roleキーは入力しないでください。</p>
            <input value={url} onChange={event => setUrl(event.target.value)} placeholder="https://your-project.supabase.co" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm" />
            <input value={publishableKey} onChange={event => setPublishableKey(event.target.value)} placeholder="sb_publishable_..." type="password" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm" />
            <button onClick={saveConfig} className="w-full rounded-xl bg-[#003882] py-2.5 text-sm font-bold text-white">接続設定を保存</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input value={email} onChange={event => setEmail(event.target.value)} type="email" autoComplete="email" required placeholder="メールアドレス" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm" />
            <input value={password} onChange={event => setPassword(event.target.value)} type="password" autoComplete="current-password" required placeholder="パスワード" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm" />
            <button disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#003882] py-2.5 text-sm font-bold text-white disabled:opacity-50">
              <LogIn className="w-4 h-4" /> {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </button>
            <button type="button" onClick={() => setShowConfig(true)} className="w-full text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
              接続設定を変更
            </button>
          </form>
        )}
      </section>
    </main>
  );
};
