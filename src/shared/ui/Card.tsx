import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  glow?: boolean;
  active?: boolean;
  as?: 'div' | 'article' | 'section' | 'aside';
}

export const Card: React.FC<CardProps> = ({
  glow = false,
  active = false,
  as: Component = 'div',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'rounded-3xl transition-all duration-200 border-2 backdrop-blur-md';

  let variantClasses =
    'bg-white border-slate-200 text-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.05),0_2px_0_#cbd5e1]';

  if (active) {
    variantClasses =
      'bg-emerald-50/50 border-emerald-500 text-slate-900 ring-4 ring-emerald-100 shadow-[0_6px_16px_rgba(16,185,129,0.18),0_2px_0_#059669]';
  } else if (glow) {
    variantClasses =
      'bg-white border-emerald-300 text-slate-800 shadow-[0_8px_24px_rgba(16,185,129,0.14),0_3px_0_#10b981]';
  }

  return (
    <Component className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </Component>
  );
};
