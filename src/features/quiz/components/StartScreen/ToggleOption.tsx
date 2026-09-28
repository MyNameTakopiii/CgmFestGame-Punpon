import React from 'react';

export interface ToggleOptionProps {
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  id?: string;
}

export const ToggleOption: React.FC<ToggleOptionProps> = ({
  label,
  sublabel,
  icon,
  isActive,
  onClick,
  id,
}) => {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={`flex-1 p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all duration-150 cursor-pointer select-none active:translate-y-0.5 ${
        isActive
          ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 shadow-[0_4px_14px_rgba(16,185,129,0.18),0_2px_0_#059669]'
          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          {icon && <span className="text-base sm:text-lg">{icon}</span>}
          <span className="font-heading font-black text-sm sm:text-base leading-tight">
            {label}
          </span>
        </div>
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            isActive ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-transparent'
          }`}
        >
          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>
      {sublabel && (
        <p
          className={`text-[11px] sm:text-xs leading-relaxed ${
            isActive ? 'text-emerald-700 font-medium' : 'text-slate-500'
          }`}
        >
          {sublabel}
        </p>
      )}
    </button>
  );
};
