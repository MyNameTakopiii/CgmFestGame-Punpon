import React from 'react';

export type ButtonVariant = 'primary' | 'glow' | 'secondary' | 'accent' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-heading font-semibold transition-all duration-150 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';

  let variantStyle = '';

  switch (variant) {
    case 'glow':
      variantStyle =
        'py-4 px-8 rounded-2xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 text-white text-lg sm:text-xl font-extrabold shadow-[0_6px_0_#047857,0_12px_24px_rgba(5,150,105,0.3)] hover:brightness-105 active:translate-y-1.5 active:shadow-[0_1px_0_#047857]';
      break;
    case 'primary':
      variantStyle =
        'px-6 py-2.5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white text-sm font-bold shadow-[0_4px_0_#047857,0_6px_12px_rgba(5,150,105,0.25)] hover:brightness-105 active:translate-y-1 active:shadow-none';
      break;
    case 'accent':
      variantStyle =
        'py-3.5 px-6 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 text-slate-900 font-extrabold text-sm shadow-[0_4px_0_#b45309,0_6px_12px_rgba(217,119,6,0.25)] hover:brightness-105 active:translate-y-1 active:shadow-none';
      break;
    case 'secondary':
      variantStyle =
        'p-1.5 rounded-xl bg-white border-2 border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 shadow-sm active:translate-y-0.5';
      break;
    case 'icon':
      variantStyle =
        'p-2 rounded-xl bg-white border-2 border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-300 shadow-sm active:translate-y-0.5';
      break;
  }

  return (
    <button className={`${base} ${variantStyle} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
};
