import React from 'react';
import { Zap } from 'lucide-react';

/**
 * Standardized Rush Badge for high-priority fast-track jobs across all ERP/MES stages.
 */
export const RushBadge = ({ size = 'sm', className = '' }) => {
  const iconSize = size === 'xs' ? 9 : size === 'lg' ? 12 : 10;
  const textClass = size === 'xs' 
    ? 'text-[9px] px-1 py-0.2' 
    : size === 'lg' 
    ? 'text-xs px-2 py-0.5' 
    : 'text-xxs px-1.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-0.5 font-bold font-mono text-rose-700 bg-rose-100 border border-rose-300 rounded shadow-2xs shrink-0 select-none ${textClass} ${className}`}
      title="Expedited Fast-Track Rush Order"
    >
      <Zap size={iconSize} className="text-rose-600 animate-pulse shrink-0" />
      <span>[RUSH]</span>
    </span>
  );
};
