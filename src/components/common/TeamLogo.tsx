/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { getTeam } from '../../data/teams';

interface TeamLogoProps {
  teamId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  shortName?: boolean;
  className?: string;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  teamId,
  size = 'md',
  showName = false,
  shortName = false,
  className = '',
}) => {
  const team = getTeam(teamId);

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px] font-bold',
    md: 'w-8 h-8 text-xs font-bold',
    lg: 'w-10 h-10 text-sm font-bold',
    xl: 'w-14 h-14 text-lg font-bold',
  };

  const isDragons = team.id === 'dragons' || team.id === 'dragons_farm';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center font-display tracking-wider shrink-0 transition-transform select-none shadow-xs`}
        style={{
          backgroundColor: team.color,
          color: team.textColor,
          boxShadow: isDragons ? '0 0 0 1.5px #003882' : undefined,
        }}
        title={team.name}
      >
        <span>{team.code}</span>
      </div>
      {showName && (
        <span className="font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap truncate">
          {shortName ? team.shortName : team.name}
        </span>
      )}
    </div>
  );
};
