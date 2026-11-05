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
        className="p-space-xs rounded text-on-surface-variant hover:text-on-surface hover:bg-warm-taupe transition-colors flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-[20px] transition-transform duration-200">
          {currentIcon}
        </span>
      </button>

      {/* Popover Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-warm-taupe border border-stone shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-mono-data text-label-sm">
          <div className="px-2.5 py-1 text-[11px] uppercase tracking-wider text-smoke font-medium">
            Appearance
          </div>

          <button
            type="button"
            onClick={() => handleSelectMode('light')}
            className={cn(
              'flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left transition-colors',
              theme === 'light'
                ? 'bg-surface-container-lowest text-ink font-semibold shadow-sm'
                : 'text-graphite hover:bg-surface-container-lowest/70 hover:text-ink'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-ember-orange">
                light_mode
              </span>
              <span>Light Paper</span>
            </div>
            {theme === 'light' && (
              <span className="material-symbols-outlined text-[14px] text-violet-spark">
                check
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode('dark')}
            className={cn(
              'flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left transition-colors',
              theme === 'dark'
                ? 'bg-surface-container-lowest text-ink font-semibold shadow-sm'
                : 'text-graphite hover:bg-surface-container-lowest/70 hover:text-ink'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-violet-spark">
                dark_mode
              </span>
              <span>Dark Bauhaus</span>
            </div>
            {theme === 'dark' && (
              <span className="material-symbols-outlined text-[14px] text-violet-spark">
                check
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode('system')}
            className={cn(
              'flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left transition-colors',
              theme === 'system'
                ? 'bg-surface-container-lowest text-ink font-semibold shadow-sm'
                : 'text-graphite hover:bg-surface-container-lowest/70 hover:text-ink'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-smoke">
                computer
              </span>
              <span>System Sync</span>
            </div>
            {theme === 'system' && (
              <span className="material-symbols-outlined text-[14px] text-violet-spark">
                check
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
