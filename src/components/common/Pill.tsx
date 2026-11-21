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
    'inline-flex items-center gap-1.5 transition-all font-sans rounded-full whitespace-nowrap cursor-pointer select-none text-[12px] font-medium tracking-normal';

  let variantClasses = '';
  switch (variant) {
    case 'filter':
      variantClasses = active
        ? 'h-[32px] sm:h-[34px] px-3 bg-[#161616] text-[#ffffff] dark:bg-[#ffffff] dark:text-[#161616] font-medium shadow-xs'
        : 'h-[32px] sm:h-[34px] px-3 bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] text-[#616161] dark:text-[#a3a3a3] hover:text-[#161616] dark:hover:text-[#fafafa] hover:border-[#161616] dark:hover:border-[#ffffff] hover:bg-[#e8e8e8] dark:hover:bg-[#303030]';
      break;
    case 'hash':
      variantClasses = active
        ? 'h-[30px] px-2.5 bg-[#161616] text-[#ffffff] dark:bg-[#ffffff] dark:text-[#161616] font-medium text-[11.5px]'
        : 'h-[30px] px-2.5 bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] text-[#616161] dark:text-[#a3a3a3] hover:text-[#161616] dark:hover:text-[#fafafa] hover:border-[#161616] dark:hover:border-[#ffffff] text-[11.5px]';
      break;
    case 'status':
      variantClasses =
        'bg-[#f0f0f0] dark:bg-[#303030] text-[#161616] dark:text-[#fafafa] border border-[#d9d9d9] dark:border-[#474747] font-medium px-2 py-0.5 text-[10.5px] rounded-full';
      break;
    case 'outline':
      variantClasses =
        'h-[32px] sm:h-[34px] px-3 bg-transparent text-[#161616] dark:text-[#fafafa] border border-[#d9d9d9] dark:border-[#474747] hover:border-[#161616] dark:hover:border-[#ffffff]';
      break;
    case 'tag':
    default:
      variantClasses =
        'h-[26px] px-2 bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] text-[#616161] dark:text-[#a3a3a3] hover:text-[#161616] dark:hover:text-[#fafafa] hover:border-[#161616] dark:hover:border-[#ffffff] text-[10.5px]';
      break;
  }

  const content = (
    <>
      {prefix}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'text-[11px] px-1.5 py-0.2 rounded-full font-mono',
            active
              ? 'bg-white/20 text-white dark:bg-black/20 dark:text-[#161616]'
              : 'bg-[#d9d9d9] dark:bg-[#303030] text-[#161616] dark:text-[#fafafa]'
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
