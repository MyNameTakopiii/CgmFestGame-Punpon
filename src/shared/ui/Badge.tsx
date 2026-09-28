import React from 'react';

export type BadgeVariant = 'emerald' | 'purple' | 'amber' | 'stone' | 'rose';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm',
  purple: 'bg-purple-100 text-purple-800 border-purple-300 shadow-sm',
  amber: 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm',
  stone: 'bg-slate-100 text-slate-700 border-slate-300 shadow-sm',
  rose: 'bg-rose-100 text-rose-800 border-rose-300 shadow-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'stone',
  size = 'sm',
  className = '',
  children,
  ...props
}) => {
  const sizeStyle = size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span
      className={`inline-flex items-center font-bold font-heading rounded-full border ${sizeStyle} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export const GroupBadge: React.FC<{ group: 'CGM48' | 'BNK48'; className?: string }> = ({
  group,
  className = '',
}) => {
  return (
    <Badge variant={group === 'CGM48' ? 'emerald' : 'purple'} className={className}>
      {group}
    </Badge>
  );
};
