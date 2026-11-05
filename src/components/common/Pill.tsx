import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface PillProps {
  label: string;
  count?: number | string;
  to?: string;
  onClick?: () => void;
  active?: boolean;
  variant?: 'tag' | 'filter' | 'hash' | 'status' | 'outline';
  className?: string;
  prefix?: React.ReactNode;
}

export const Pill: React.FC<PillProps> = ({
  label,
  count,
  to,
  onClick,
  active = false,
  variant = 'tag',
  className,
  prefix,
}) => {
  const baseClasses =
    'inline-flex items-center gap-1.5 transition-all font-mono-data rounded-full whitespace-nowrap cursor-pointer select-none';

  let variantClasses = '';
  switch (variant) {
    case 'filter':
      variantClasses = active
        ? 'bg-ink text-eggshell dark:bg-[#fdfcfc] dark:text-[#100f0d] font-mono-data text-[12px] leading-tight tracking-wide font-medium shadow-sm px-3 py-1'
        : 'bg-warm-taupe dark:bg-[#1a1815] border border-stone/60 dark:border-[#332e27] text-graphite dark:text-[#d4cfc9] hover:text-ink dark:hover:text-white hover:bg-stone/60 dark:hover:bg-[#25221e] font-mono-data text-[10px] leading-tight tracking-wide px-3 py-1';
      break;
    case 'hash':
      variantClasses =
        'bg-surface-container dark:bg-[#201d19] border border-stone/50 dark:border-[#332e27] font-mono-data text-label-sm text-on-surface-variant hover:text-ink dark:hover:text-white hover:bg-warm-taupe dark:hover:bg-[#2b2723] transition-colors px-3 py-1';
      break;
    case 'status':
      variantClasses =
        'bg-secondary-container text-secondary font-mono-data text-label-sm font-medium px-2.5 py-0.5';
      break;
    case 'outline':
      variantClasses =
        'bg-warm-taupe dark:bg-[#1a1815] text-ink dark:text-[#fdfcfc] shadow-[0_0_0_1px_#ebe8e4] dark:shadow-[0_0_0_1px_#332e27] font-mono-data text-label-sm px-2.5 py-1';
      break;
    case 'tag':
    default:
      variantClasses =
        'bg-warm-taupe dark:bg-[#221f1b] border border-stone/50 dark:border-[#332e27] px-2.5 py-0.5 text-graphite dark:text-[#d4cfc9] hover:bg-stone/70 dark:hover:bg-[#2d2822] hover:text-ink dark:hover:text-white font-mono-data text-label-sm';
      break;
  }

  const content = (
    <>
      {prefix}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'px-1.5 py-0.2 rounded text-[12px]',
            active ? 'text-white/80 dark:text-[#100f0d]/80' : 'text-smoke'
          )}
        >
          {count}
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cn(baseClasses, variantClasses, className)}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(baseClasses, variantClasses, className)}
    >
      {content}
    </button>
  );
};
