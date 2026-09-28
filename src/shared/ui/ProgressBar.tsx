import React from 'react';

export interface ProgressBarProps {
  progressPercent: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progressPercent, className = '' }) => {
  const clamped = Math.min(100, Math.max(0, progressPercent));

  return (
    <div
      className={`w-full h-3 bg-slate-200/90 border border-slate-300 rounded-full overflow-hidden shadow-inner p-0.5 ${className}`}
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 rounded-full transition-all duration-300 shadow-sm"
        style={{ width: `${clamped}%` }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
};
