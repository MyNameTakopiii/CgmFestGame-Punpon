import React from 'react';
import type { GameOption } from '../../types';
import { GroupBadge } from '../../../../shared/ui';
import { Check, X } from 'lucide-react';

export interface AnswerCardProps {
  option: GameOption;
  index: number;
  isResult: boolean;
  isTarget: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const stampColors = [
  'bg-rose-500 text-white',
  'bg-sky-500 text-white',
  'bg-amber-500 text-white',
  'bg-emerald-600 text-white',
];

export const AnswerCard: React.FC<AnswerCardProps> = ({
  option,
  index,
  isResult,
  isTarget,
  isSelected,
  onSelect,
}) => {
  let cardStyle =
    'bg-white border-2 border-slate-200 text-slate-800 shadow-[0_4px_0_#cbd5e1,0_6px_14px_rgba(15,23,42,0.05)] hover:border-emerald-400 hover:shadow-[0_6px_0_#059669,0_10px_20px_rgba(16,185,129,0.15)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#cbd5e1]';

  if (isResult) {
    if (isTarget) {
      cardStyle =
        'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-[0_4px_0_#059669,0_8px_20px_rgba(16,185,129,0.2)] scale-[1.02]';
    } else if (isSelected && !isTarget) {
      cardStyle =
        'bg-rose-50 border-2 border-rose-500 text-rose-950 shadow-[0_4px_0_#e11d48,0_8px_20px_rgba(244,63,94,0.2)] animate-shake';
    } else {
      cardStyle = 'bg-slate-50 border-2 border-slate-200 text-slate-400 opacity-60 shadow-none';
    }
  }

  const stampClass = stampColors[index % stampColors.length];

  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      disabled={isResult}
      aria-pressed={isSelected}
      className={`relative flex flex-col justify-between p-4 min-h-[100px] rounded-2xl transition-all duration-150 text-left cursor-pointer disabled:cursor-default ${cardStyle}`}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <span
          className={`w-7 h-7 flex items-center justify-center rounded-xl text-xs font-mono font-black shadow-sm ${stampClass}`}
        >
          {String.fromCharCode(65 + index)}
        </span>

        <div className="flex items-center gap-1.5">
          <GroupBadge group={option.group} />
          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {option.year}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between w-full mt-auto">
        <span className="font-heading font-bold text-base sm:text-lg leading-snug line-clamp-2 text-slate-900">
          {option.title}
        </span>

        {isResult && isTarget && (
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 ml-2 animate-bounce shadow-md">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
        )}
        {isResult && isSelected && !isTarget && (
          <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 ml-2 shadow-md">
            <X className="w-4 h-4 stroke-[3]" />
          </div>
        )}
      </div>
    </button>
  );
};
