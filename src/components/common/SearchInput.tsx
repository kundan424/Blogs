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
      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#8f8f8f] pointer-events-none">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[42px] w-full pl-10 pr-14 bg-bright-white dark:bg-[#212121] rounded-full border border-[#d9d9d9] dark:border-[#333333] text-[13.5px] font-mono text-[#161616] dark:text-[#fafafa] placeholder:text-[#8f8f8f] focus:outline-none focus:border-[#161616] dark:focus:border-[#ffffff] transition-colors"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-[#8f8f8f] hover:text-[#161616] dark:hover:text-[#fafafa] text-[16px] material-symbols-outlined cursor-pointer"
            title="Clear"
          >
            cancel
          </button>
        )}
        {shortcutBadge && (
          <kbd className="px-1.5 py-0.5 rounded-full bg-[#f0f0f0] dark:bg-[#161616] border border-[#d9d9d9] dark:border-[#333333] font-mono text-[10.5px] text-[#8f8f8f] pointer-events-none">
            {shortcutBadge}
          </kbd>
        )}
      </div>
    </div>
  );
};
