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
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-smoke pointer-events-none">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-14 py-2 bg-eggshell rounded-lg border border-stone text-body-md text-ink placeholder:text-smoke focus:outline-none focus:border-ink transition-colors"
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-smoke hover:text-ink text-[16px] material-symbols-outlined"
            title="Clear"
          >
            cancel
          </button>
        )}
        {shortcutBadge && (
          <kbd className="px-1.5 py-0.5 rounded bg-warm-taupe border border-stone font-mono-data text-label-sm text-smoke pointer-events-none">
            {shortcutBadge}
          </kbd>
        )}
      </div>
    </div>
  );
};
