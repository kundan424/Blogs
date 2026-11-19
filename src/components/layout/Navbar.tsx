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
    { label: 'About', path: '/about' },
  ];

  return (
    <>
      {/* =========================================================================
          COLUMN ANNOUNCEMENT STRIP
          40px height, gradient #3e5199 to #5568ad, 14px/1.1 weight 500
          ========================================================================= */}
      <aside
        aria-label="Announcement"
        style={{ background: 'linear-gradient(90deg, #3e5199 0%, #5568ad 100%)' }}
        className="w-full h-10 px-4 sm:px-5 flex items-center justify-center gap-2 text-white text-[12.5px] sm:text-[14px] font-medium leading-none hover:brightness-105 transition-all shadow-xs"
      >
        <Link
          to="/subjects"
          className="inline-flex items-center gap-1.5 sm:gap-2 hover:underline text-white font-medium truncate max-w-full"
          style={{ color: '#ffffff' }}
        >
          <span className="font-semibold tracking-wide text-white shrink-0" style={{ color: '#ffffff' }}>
            Infrastructure Knowledge Base
          </span>
          <span className="text-white/90 inline truncate" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>
            — Deep systems, concurrency &amp; database internals
          </span>
          <span className="material-symbols-outlined text-[15px] translate-y-0.5 text-white shrink-0" style={{ color: '#ffffff' }}>
            arrow_forward
          </span>
        </Link>
      </aside>

      {/* =========================================================================
          COLUMN NAVIGATION HEADER
          Transparent / cool canvas header aligned to 1112px shell with 20px padding
          ========================================================================= */}
      <header className="sticky top-0 w-full z-[1002] bg-canvas/90 dark:bg-[#0c0f17]/90 backdrop-blur-md border-b border-edge/80 dark:border-edge/40 transition-colors">
        <div className="h-16 max-w-column mx-auto px-5 flex items-center justify-between gap-4">
          {/* Left: Brand Wordmark */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group text-navy dark:text-white">
              <span className="flex items-center justify-center w-7 h-7 rounded-[6px] bg-navy text-white font-mono text-[12px] font-medium transition-transform group-hover:scale-105">
                $_
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-sans text-[15.5px] font-semibold tracking-tight text-heading-ink dark:text-white">
                  dev.notes
                </span>
             
              </div>
            </Link>

            {/* Desktop Navigation Links */}
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
                      'px-3.5 py-1.5 rounded-[8px] font-sans text-[14px] font-medium transition-all',
                      isActive
                        ? 'bg-panel dark:bg-panel/40 text-navy dark:text-white shadow-2xs'
                        : 'text-secondary-ink dark:text-secondary-ink hover:text-navy dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5">
            {/* Search Trigger (36px Secondary key button) */}
            <button
              type="button"
              onClick={openSearch}
              className="btn-secondary h-9 px-3 gap-2 text-secondary-ink dark:text-control-ink"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span className="hidden sm:inline font-sans text-[13.5px]">Search docs</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[10.5px] text-muted-ink">
                ⌘K
              </kbd>
            </button>

            {/* Dark Mode Switcher */}
            <ModeSwitcher />

            {/* Primary Action Button (Column 36px Navy Key) */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('explore-catalog') || document.getElementById('feed-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary hidden sm:inline-flex"
            >
              <span>Explore Notes</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-[8px] text-secondary-ink hover:text-navy hover:bg-panel"
              aria-label="Toggle Mobile Menu"
            >
              <span className="material-symbols-outlined text-[20px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden px-5 py-4 bg-canvas dark:bg-[#0c0f17] border-t border-edge space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-[8px] text-[14px] font-medium text-heading-ink dark:text-white hover:bg-panel transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
};
