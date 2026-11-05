/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MatchResult } from '../../types/baseball';

interface ScoreboardBadgeProps {
  result: MatchResult;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ScoreboardBadge: React.FC<ScoreboardBadgeProps> = ({
  result,
  size = 'md',
  className = '',
}) => {
  const configs = {
    win: {
      label: '勝',
      longLabel: '勝利',
      textColor: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/60',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    loss: {
      label: '敗',
      longLabel: '敗戦',
      textColor: 'text-rose-700 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/60',
      borderColor: 'border-rose-200 dark:border-rose-800',
    },
    draw: {
      label: '分',
      longLabel: '引分',
      textColor: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/60',
      borderColor: 'border-amber-200 dark:border-amber-800',
    },
    scheduled: {
      label: '予定',
      longLabel: '予定',
      textColor: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-100 dark:bg-slate-800/60',
      borderColor: 'border-slate-200 dark:border-slate-700',
    },
    cancelled: {
      label: '中止',
      longLabel: '中止',
      textColor: 'text-zinc-500 dark:text-zinc-400',
      bgColor: 'bg-zinc-100 dark:bg-zinc-800/50',
      borderColor: 'border-zinc-300 dark:border-zinc-700',
    },
  };

  const current = configs[result] || configs.scheduled;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 rounded font-semibold',
    md: 'text-xs px-2.5 py-1 rounded-md font-bold',
    lg: 'text-sm px-3 py-1.5 rounded-md font-bold',
  };

  return (
    <span
      className={`inline-flex items-center justify-center border font-sans tracking-tight shrink-0 whitespace-nowrap ${current.bgColor} ${current.textColor} ${current.borderColor} ${sizeClasses[size]} ${className}`}
    >
      {current.label}
    </span>
  );
};
