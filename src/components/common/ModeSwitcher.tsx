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
        : `Switched to ${mode === 'dark' ? 'Workbench Dark' : 'Light Canvas'} Mode`
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
      {/* Trigger Button: Pill icon button */}
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        onDoubleClick={toggleTheme}
        aria-label="Theme mode switcher (double click to quick toggle)"
        title={`Theme: ${theme.toUpperCase()} (click for options, double-click to toggle)`}
        className="h-[36px] w-[36px] rounded-full text-[#616161] hover:text-[#161616] dark:text-[#a3a3a3] dark:hover:text-[#fafafa] bg-bright-white dark:bg-[#161616] hover:bg-[#d9d9d9]/60 dark:hover:bg-[#303030] transition-colors flex items-center justify-center cursor-pointer border border-[#d9d9d9] dark:border-[#333333]"
      >
        <span className="material-symbols-outlined text-[17px] transition-transform duration-200">
          {currentIcon}
        </span>
      </button>

      {/* Popover Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-[20px] bg-bright-white dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] shadow-2xs p-2 z-50 animate-in fade-in zoom-in-95 duration-100 font-mono text-[12.5px] uppercase tracking-[0.02em]">
          <div className="px-3 py-1.5 text-[10.5px] text-[#8f8f8f] font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#161616] dark:bg-[#ffffff]" />
            <span>Appearance</span>
          </div>

          <button
            type="button"
            onClick={() => handleSelectMode('light')}
            className={cn(
              'flex items-center justify-between w-full px-3 py-2 rounded-full text-left transition-colors cursor-pointer',
              theme === 'light'
                ? 'bg-[#f0f0f0] text-[#161616] font-medium border border-[#d9d9d9]'
                : 'text-[#616161] hover:bg-[#f0f0f0] hover:text-[#161616] dark:text-[#a3a3a3] dark:hover:text-[#fafafa] dark:hover:bg-[#303030]'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">
                light_mode
              </span>
              <span>Bright White</span>
            </div>
            {theme === 'light' && (
              <span className="material-symbols-outlined text-[15px] text-[#161616]">
                check
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode('dark')}
            className={cn(
              'flex items-center justify-between w-full px-3 py-2 rounded-full text-left transition-colors cursor-pointer',
              theme === 'dark'
                ? 'bg-[#303030] text-[#fafafa] font-medium border border-[#474747]'
                : 'text-[#616161] hover:bg-[#f0f0f0] hover:text-[#161616] dark:text-[#a3a3a3] dark:hover:text-[#fafafa] dark:hover:bg-[#303030]'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">
                dark_mode
              </span>
              <span>Workbench Dark</span>
            </div>
            {theme === 'dark' && (
              <span className="material-symbols-outlined text-[15px] text-[#ffffff]">
                check
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode('system')}
            className={cn(
              'flex items-center justify-between w-full px-3 py-2 rounded-full text-left transition-colors cursor-pointer',
              theme === 'system'
                ? 'bg-[#f0f0f0] dark:bg-[#303030] text-[#161616] dark:text-[#fafafa] font-medium border border-[#d9d9d9] dark:border-[#474747]'
                : 'text-[#616161] hover:bg-[#f0f0f0] hover:text-[#161616] dark:text-[#a3a3a3] dark:hover:text-[#fafafa] dark:hover:bg-[#303030]'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">
                computer
              </span>
              <span>System Sync</span>
            </div>
            {theme === 'system' && (
              <span className="material-symbols-outlined text-[15px] text-[#161616] dark:text-[#ffffff]">
                check
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
