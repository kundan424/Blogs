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
    <header className="fixed top-0 w-full z-40 bg-eggshell/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-stone/40">
      <div className="h-16 max-w-7xl mx-auto px-margin lg:px-margin-desktop flex items-center justify-between gap-space-md">
        {/* Left: Brand + Nav */}
        <div className="flex items-center gap-space-lg">
          <Link to="/" className="flex items-center gap-space-sm text-ink group">
            <span className="flex items-center justify-center w-7 h-7 rounded bg-warm-taupe text-ink font-mono-data text-mono-data group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
              $_
            </span>
            <div className="flex flex-col leading-none">
              <span className="font-label-md text-label-md tracking-tight text-ink font-medium">
                dev.notes
              </span>
              <span className="font-label-sm text-label-sm text-smoke">/learnings</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-space-xs">
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
                    'px-space-sm py-space-xs rounded transition-colors font-label-md text-label-md',
                    isActive
                      ? 'bg-warm-taupe text-on-surface font-medium'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-space-sm">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={openSearch}
            className="flex items-center gap-space-md px-space-sm py-space-xs rounded-lg bg-warm-taupe text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span className="hidden sm:inline font-mono-data text-mono-data">
                Search notes...
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container-lowest font-mono-data text-label-sm text-smoke">
              ⌘K
            </kbd>
          </button>

          {/* Source Repo */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Source Repository"
            className="p-space-xs rounded text-on-surface-variant hover:text-on-surface hover:bg-warm-taupe transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">code</span>
          </a>

          {/* Mode Switcher */}
          <ModeSwitcher />

          {/* Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-[18px]">
              person
            </span>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-space-xs rounded text-on-surface-variant hover:text-on-surface hover:bg-warm-taupe"
            aria-label="Toggle Mobile Menu"
          >
            <span className="material-symbols-outlined text-[24px]">
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
