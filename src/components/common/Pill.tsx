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
    'inline-flex items-center gap-1.5 transition-all font-mono rounded-[8px] whitespace-nowrap cursor-pointer select-none text-[13px]';

  let variantClasses = '';
  switch (variant) {
    case 'filter':
      variantClasses = active
        ? 'h-[36px] px-3.5 bg-gradient-to-r from-[#3e5199] to-[#5568ad] text-white border border-[#3e5199] font-medium shadow-sm'
        : 'h-[36px] px-3.5 bg-white dark:bg-panel border border-edge text-body-ink hover:text-[#3e5199] dark:hover:text-white hover:border-[#3e5199] hover:bg-[#3e5199]/5 dark:hover:bg-white/5 shadow-xs';
      break;
    case 'hash':
      variantClasses = active
        ? 'h-[32px] px-3 bg-gradient-to-r from-[#3e5199] to-[#5568ad] text-white border border-[#3e5199] font-medium shadow-sm'
        : 'h-[32px] px-3 bg-white dark:bg-panel border border-edge text-body-ink hover:text-[#3e5199] dark:hover:text-white hover:border-[#3e5199] hover:bg-[#3e5199]/5 shadow-xs';
      break;
    case 'status':
      variantClasses =
        'bg-ice/40 text-deep-teal border border-ice font-medium px-2.5 py-0.5 text-[12px]';
      break;
    case 'outline':
      variantClasses =
        'h-[36px] px-3.5 bg-white dark:bg-panel text-[#3e5199] dark:text-white border border-edge hover:border-[#3e5199] shadow-xs';
      break;
    case 'tag':
    default:
      variantClasses = active
        ? 'h-[30px] px-2.5 bg-gradient-to-r from-[#3e5199] to-[#5568ad] text-white border border-[#3e5199] font-medium shadow-sm text-[12px]'
        : 'h-[30px] px-2.5 bg-white dark:bg-panel border border-edge text-body-ink hover:border-[#3e5199] hover:text-[#3e5199] hover:bg-[#3e5199]/5 dark:hover:text-white text-[12px] shadow-2xs';
      break;
  }

  const content = (
    <>
      {prefix}
      <span className={active ? 'text-white font-semibold' : 'text-body-ink'}>
        {label}
      </span>
      {count !== undefined && (
        <span
          className={cn(
            'px-1.5 py-0.5 rounded-[4px] text-[11px] font-mono leading-none',
            active
              ? 'bg-white/25 text-white font-semibold'
              : 'bg-panel dark:bg-white/10 text-muted-ink'
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
