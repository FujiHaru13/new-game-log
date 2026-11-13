/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Plus, Search, X } from 'lucide-react';

export interface NameCandidate {
  name: string;
  /** 使用件数（その名前を含む記録の件数） */
  count: number;
}

interface CandidateListProps {
  candidates: NameCandidate[];
  query: string;
  isSelected: (name: string) => boolean;
  onPick: (name: string) => void;
  /** 新規登録を選んだとき（query をそのまま名前として使う） */
  onCreate: (name: string) => void;
}

const CandidateList: React.FC<CandidateListProps> = ({ candidates, query, isSelected, onPick, onCreate }) => {
  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return candidates;
    return candidates.filter(c => c.name.includes(q));
  }, [candidates, query]);

  const queryTrimmed = query.trim();
  const hasExact = candidates.some(c => c.name === queryTrimmed);

  if (filtered.length === 0 && !queryTrimmed) {
    return <p className="px-3 py-3 text-xs text-slate-400">まだ登録された名前がありません。下の検索欄に入力すると新規登録できます。</p>;
  }

  return (
    <div className="max-h-56 overflow-y-auto py-1">
      {queryTrimmed && !hasExact && (
        <button
          type="button"
          onClick={() => onCreate(queryTrimmed)}
          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-[#003882] dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="truncate">『{queryTrimmed}』を新規登録</span>
        </button>
      )}
      {filtered.map(candidate => {
        const selected = isSelected(candidate.name);
        return (
          <button
            key={candidate.name}
            type="button"
            onClick={() => onPick(candidate.name)}
            aria-pressed={selected}
            className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
              selected ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className={`w-4 h-4 shrink-0 flex items-center justify-center rounded border ${
              selected ? 'bg-[#003882] border-[#003882] text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'
            }`}>
              <Check className="w-3 h-3" />
            </span>
            <span className="flex-1 truncate">{candidate.name}</span>
            <span className="text-[11px] text-slate-400 tabular-nums shrink-0">{candidate.count}件</span>
          </button>
        );
      })}
      {filtered.length === 0 && queryTrimmed && hasExact && (
        <p className="px-3 py-2 text-xs text-slate-400">一致する候補がありません。</p>
      )}
    </div>
  );
};

const searchInputClass =
  'w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm';

/** 単一選択式の検索パネル（投手欄用）。タップで開き、検索→選択で閉じる。 */
export const NameSearchField: React.FC<{
  value: string;
  candidates: NameCandidate[];
  placeholder?: string;
  onChange: (name: string) => void;
}> = ({ value, candidates, placeholder = '名前を選択・入力', onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const close = () => {
    setIsOpen(false);
    setQuery('');
  };
  const pick = (name: string) => {
    onChange(name);
    close();
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-left"
      >
        <span className={`flex-1 truncate text-sm ${value ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        {value && (
          <span
            role="button"
            aria-label="クリア"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="text-slate-400 hover:text-rose-500 shrink-0"
          >
            <X className="w-4 h-4" />
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
          <div className="relative p-2 pb-0">
            <Search className="absolute left-5 top-1/2 -translate-y-1/3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const q = query.trim();
                  if (q) pick(q);
                }
                if (e.key === 'Escape') close();
              }}
              placeholder="名前で絞り込み検索"
              className={searchInputClass}
            />
          </div>
          <CandidateList
            candidates={candidates}
            query={query}
            isSelected={(name) => name === value}
            onPick={pick}
            onCreate={pick}
          />
        </div>
      )}
    </div>
  );
};

/**
 * 複数選択式の検索パネル（本塁打選手・同行者用）。
 * パネルを開いたまま連続選択でき、選択中はチップ表示、チップから取り消し可。
 */
export const NameMultiSearchField: React.FC<{
  selected: string[];
  candidates: NameCandidate[];
  addLabel?: string;
  onChange: (names: string[]) => void;
}> = ({ selected, candidates, addLabel = '名前を選択・追加', onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(n => n !== name));
    } else {
      onChange([...selected, name]);
    }
  };
  const create = (name: string) => {
    if (!selected.includes(name)) onChange([...selected, name]);
    setQuery('');
  };

  return (
    <div>
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {selected.map(name => (
            <span
              key={name}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-[#003882] dark:border-blue-500 text-slate-900 dark:text-slate-100 font-semibold text-sm"
            >
              {name}
              <button type="button" onClick={() => toggle(name)} aria-label={`${name}を外す`} className="text-slate-400 hover:text-rose-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-[#003882] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 rounded-xl"
      >
        <Plus className="w-4 h-4" />
        {addLabel}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
          <div className="relative p-2 pb-0">
            <Search className="absolute left-5 top-1/2 -translate-y-1/3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const q = query.trim();
                  if (q) create(q);
                }
                if (e.key === 'Escape') setIsOpen(false);
              }}
              placeholder="名前で絞り込み検索（連続選択できます）"
              className={searchInputClass}
            />
          </div>
          <CandidateList
            candidates={candidates}
            query={query}
            isSelected={(name) => selected.includes(name)}
            onPick={toggle}
            onCreate={create}
          />
          <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#003882] hover:bg-[#002868] rounded-lg"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
