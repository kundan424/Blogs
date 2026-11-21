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
    <div className="sticky top-0 z-[1002] w-full pt-3 px-4 sm:px-6 pointer-events-none">
      <header className="max-w-[1344px] mx-auto pointer-events-auto">
        {/* Navigation capsule: 50px height, 9999px pill, soft gray, action-label text */}
        <div className="nav-capsule shadow-nav-float backdrop-blur-md">
          {/* Brand mark on left */}
          <div className="flex items-center gap-6 pl-2">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#212121] dark:bg-[#fafafa] text-[#fafafa] dark:text-[#212121] font-mono text-[12px] font-medium transition-transform group-hover:scale-105">
                $_
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-sans font-medium text-[16px] tracking-tight text-[#161616] dark:text-[#fafafa]">
                  dev.notes
                </span>
                <span className="hidden sm:inline font-mono text-[11px] text-[#616161] dark:text-[#8f8f8f] uppercase tracking-[0.02em]">
                  /learnings
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links in center: action-label (14px/18px uppercase mono) */}
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
                      'px-3.5 py-1.5 rounded-full font-mono text-[13px] uppercase tracking-[0.02em] transition-all',
                      isActive
                        ? 'bg-bright-white dark:bg-[#303030] text-[#161616] dark:text-[#fafafa] font-medium shadow-xs'
                        : 'text-[#616161] dark:text-[#a3a3a3] hover:text-[#161616] dark:hover:text-[#fafafa] hover:bg-[#d9d9d9]/40 dark:hover:bg-[#303030]/40'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions: Search trigger, Mode switcher, Primary Teal pill */}
          <div className="flex items-center gap-2 pr-1">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={openSearch}
              className="h-[36px] px-3 rounded-full bg-bright-white dark:bg-[#161616] border border-[#d9d9d9] dark:border-[#333333] flex items-center gap-2 font-mono text-[12px] uppercase text-[#616161] dark:text-[#a3a3a3] hover:text-[#161616] dark:hover:text-[#fafafa] hover:border-[#161616] dark:hover:border-[#ffffff] transition-all cursor-pointer"
              aria-label="Search documentation"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-[#f0f0f0] dark:bg-[#212121] text-[10px] text-[#616161] dark:text-[#a3a3a3]">
                ⌘K
              </kbd>
            </button>

            {/* Dark Mode Switcher */}
            <ModeSwitcher />

            {/* Primary Action Button: Monochrome pill control (#161616 / #ffffff) */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('catalog-section') || document.getElementById('feed-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/subjects';
                }
              }}
              className="btn-primary btn-primary-compact hidden sm:inline-flex"
            >
              <span>Explore Notes</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-[#161616] dark:text-[#fafafa] hover:bg-[#d9d9d9] dark:hover:bg-[#303030]"
              aria-label="Toggle Navigation Menu"
            >
              <span className="material-symbols-outlined text-[20px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-3 bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] rounded-[24px] space-y-1 shadow-nav-float">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-full font-mono text-[13px] uppercase tracking-[0.02em] font-medium text-[#161616] dark:text-[#fafafa] hover:bg-bright-white dark:hover:bg-[#303030] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-[#d9d9d9] dark:border-[#333333]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById('catalog-section') || document.getElementById('feed-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full btn-primary"
              >
                <span>Explore Notes</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};
