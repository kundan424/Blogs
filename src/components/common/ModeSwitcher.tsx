import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';

interface ModeSwitcherProps {
  className?: string;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ className }) => {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMode = (mode: ThemeMode) => {
    setTheme(mode);
    setDropdownOpen(false);
    showToast(
      mode === 'system'
        ? `Applied System theme (${isDark ? 'Dark' : 'Light'})`
        : `Switched to ${mode === 'dark' ? 'Dark' : 'Light'} Bauhaus Mode`
    );
  };

  const currentIcon =
    theme === 'system'
      ? 'computer'
      : isDark
      ? 'dark_mode'
      : 'light_mode';

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        onDoubleClick={toggleTheme}
        aria-label="Theme mode switcher (double click to quick toggle)"
        title={`Theme: ${theme.toUpperCase()} (click for options, double-click to toggle)`}
        className="p-1.5 rounded-[8px] text-secondary-ink hover:text-navy dark:hover:text-white hover:bg-canvas transition-colors flex items-center justify-center cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px] transition-transform duration-200">
          {currentIcon}
        </span>
      </button>

      {/* Popover Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-[8px] bg-white dark:bg-panel border border-edge shadow-catalog-edge p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-mono text-[12px]">
          <div className="px-2.5 py-1 text-[10.5px] uppercase tracking-wider text-muted-ink font-medium">
            Appearance
          </div>

          <button
            type="button"
            onClick={() => handleSelectMode('light')}
            className={cn(
              'flex items-center justify-between w-full px-2.5 py-1.5 rounded-[6px] text-left transition-colors cursor-pointer',
              theme === 'light'
                ? 'bg-canvas text-navy dark:text-white font-semibold'
                : 'text-secondary-ink hover:bg-canvas hover:text-navy dark:hover:text-white'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-navy dark:text-white">
                light_mode
              </span>
              <span>Light Canvas</span>
            </div>
            {theme === 'light' && (
              <span className="material-symbols-outlined text-[14px] text-proof-green">
                check
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode('dark')}
            className={cn(
              'flex items-center justify-between w-full px-2.5 py-1.5 rounded-[6px] text-left transition-colors cursor-pointer',
              theme === 'dark'
                ? 'bg-canvas text-navy dark:text-white font-semibold'
                : 'text-secondary-ink hover:bg-canvas hover:text-navy dark:hover:text-white'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-navy dark:text-ice">
                dark_mode
              </span>
              <span>Dark Theme</span>
            </div>
            {theme === 'dark' && (
              <span className="material-symbols-outlined text-[14px] text-proof-green">
                check
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode('system')}
            className={cn(
              'flex items-center justify-between w-full px-2.5 py-1.5 rounded-[6px] text-left transition-colors cursor-pointer',
              theme === 'system'
                ? 'bg-canvas text-navy dark:text-white font-semibold'
                : 'text-secondary-ink hover:bg-canvas hover:text-navy dark:hover:text-white'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-muted-ink">
                computer
              </span>
              <span>System Sync</span>
            </div>
            {theme === 'system' && (
              <span className="material-symbols-outlined text-[14px] text-proof-green">
                check
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
