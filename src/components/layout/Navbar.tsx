import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSearchModal } from '../../context/SearchModalContext';
import { ModeSwitcher } from '../common/ModeSwitcher';
import { cn } from '../../utils/cn';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { openSearch } = useSearchModal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Subjects', path: '/subjects' },
    { label: 'Topics', path: '/topics/postgresql' },
    { label: 'Series', path: '/series' },
    { label: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 w-full z-[1002] bg-canvas/95 dark:bg-[#141310]/95 backdrop-blur-md border-b border-stone/40 dark:border-stone/20 transition-colors">
      <div className="h-20 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 text-ink dark:text-white group">
            <span className="flex items-center justify-center w-7 h-7 rounded-[6px] bg-[#37383c] text-white font-mono text-[12px] font-medium transition-colors">
              $_
            </span>
            <div className="flex flex-col leading-none">
              <span className="font-sans text-[15px] font-medium tracking-tight text-ink dark:text-white">
                dev.notes
              </span>
              <span className="font-mono text-[11px] text-muted dark:text-ash">/architecture</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'px-3 py-1.5 rounded-[6px] transition-colors font-sans text-[14px] leading-5',
                    isActive
                      ? 'bg-stone/50 dark:bg-stone/30 text-ink dark:text-white font-medium'
                      : 'text-muted dark:text-ash hover:bg-stone/30 hover:text-ink dark:hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={openSearch}
            className="flex items-center gap-3 px-3 py-1.5 rounded-[8px] bg-panel dark:bg-[#1f1e1a] border border-edge dark:border-stone/30 text-muted dark:text-ash hover:text-ink dark:hover:text-white hover:border-filter-edge transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span className="hidden sm:inline font-mono text-[12px]">
                Search notes...
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-canvas dark:bg-[#141310] font-mono text-[11px] text-muted border border-edge dark:border-stone/30">
              ⌘K
            </kbd>
          </button>

          {/* Source Repo */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Source Repository"
            className="p-2 rounded-[8px] text-muted hover:text-ink hover:bg-stone/40 dark:hover:bg-stone/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[19px]">code</span>
          </a>

          {/* Mode Switcher */}
          <ModeSwitcher />

          {/* Header Action: Replit Header Action Style with solid orange fill */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('feed-section') || document.getElementById('core-subjects');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ backgroundColor: '#ff3c00', color: '#ffffff' }}
            className="nav-action-btn hidden sm:inline-flex items-center justify-center bg-[#ff3c00] text-white rounded-[8px] px-4 h-[38px] text-[14px] font-medium tracking-[-0.02em] hover:bg-[#e03500] hover:opacity-95 transition-all cursor-pointer shadow-sm border border-transparent"
          >
            Explore Notes
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-[8px] text-muted hover:text-ink hover:bg-stone/40 dark:hover:bg-stone/20"
            aria-label="Toggle Mobile Menu"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-margin py-4 bg-eggshell border-t border-stone space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-body-md text-ink hover:bg-warm-taupe transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-stone flex items-center justify-between px-3 py-2">
            <span className="font-mono-data text-label-sm text-smoke">Theme Mode</span>
            <ModeSwitcher />
          </div>
        </div>
      )}
    </header>
  );
};
