import React from 'react';
import { cn } from '../../utils/cn';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  shortcutBadge?: string;
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Filter notes or topics...',
  className,
  shortcutBadge,
  onClear,
}) => {
  return (
    <div className={cn('relative w-full', className)}>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-muted-ink pointer-events-none">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[36px] w-full pl-9 pr-14 bg-white dark:bg-panel rounded-[8px] border border-edge text-[14px] text-body-ink placeholder:text-muted-ink focus:outline-none focus:border-navy dark:focus:border-focus-blue transition-colors"
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-muted-ink hover:text-navy dark:hover:text-white text-[16px] material-symbols-outlined cursor-pointer"
            title="Clear"
          >
            cancel
          </button>
        )}
        {shortcutBadge && (
          <kbd className="px-1.5 py-0.5 rounded-[4px] bg-canvas border border-edge font-mono text-[11px] text-muted-ink pointer-events-none">
            {shortcutBadge}
          </kbd>
        )}
      </div>
    </div>
  );
};
