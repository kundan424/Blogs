import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NoteSection } from '../../types';
import { cn } from '../../utils/cn';

interface EmbeddedArticleSidebarProps {
  sections: NoteSection[];
  activeId?: string;
  onSelect: (id: string) => void;
  subjectTitle?: string;
  readTime?: string;
  className?: string;
  onToggleCollapse?: () => void;
}

export const EmbeddedArticleSidebar: React.FC<EmbeddedArticleSidebarProps> = ({
  sections,
  activeId,
  onSelect,
  subjectTitle = 'ON THIS PAGE',
  readTime,
  className = '',
  onToggleCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navRef = useRef<HTMLElement | null>(null);

  // Smoothly synchronize sidebar navigation with the active article topic
  useEffect(() => {
    if (!activeId || !navRef.current) return;

    const rafId = requestAnimationFrame(() => {
      const nav = navRef.current;
      if (!nav) return;

      const activeEl =
        nav.querySelector<HTMLElement>('[data-active-exact="true"]') ||
        nav.querySelector<HTMLElement>('[data-active="true"]');
      if (!activeEl) return;

      const navRect = nav.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();

      const isAbove = elRect.top < navRect.top + 32;
      const isBelow = elRect.bottom > navRect.bottom - 32;

      if (isAbove || isBelow) {
        const currentScroll = nav.scrollTop;
        const relativeOffset = elRect.top - navRect.top;
        const targetScroll = currentScroll + relativeOffset - (nav.clientHeight / 2) + (elRect.height / 2);

        nav.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth',
        });
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [activeId]);

  const parsedSections = useMemo(() => {
    return sections.map((sec, idx) => {
      const numMatch = sec.title.match(/^(\d+)\.\s*(.*)$/);
      const number = numMatch ? numMatch[1].padStart(2, '0') : String(idx + 1).padStart(2, '0');
      const cleanTitle = numMatch ? numMatch[2] : sec.title;
      return {
        ...sec,
        displayNumber: number,
        cleanTitle,
      };
    });
  }, [sections]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return parsedSections;
    const q = searchQuery.toLowerCase().trim();
    return parsedSections.filter((sec) => {
      const matchParent =
        sec.cleanTitle.toLowerCase().includes(q) || sec.displayNumber.includes(q);
      const matchChild = sec.subsections?.some((sub) =>
        sub.title.toLowerCase().includes(q)
      );
      return matchParent || matchChild;
    });
  }, [parsedSections, searchQuery]);

  return (
    <div
      className={cn(
        'flex flex-col select-none text-[#161616] dark:text-[#fafafa] transition-colors duration-200',
        className || 'bg-bright-white/90 dark:bg-[#212121] border-r border-[#d9d9d9] dark:border-[#333333]'
      )}
    >
      {/* Top Header Section */}
      <div className="p-3 border-b border-[#d9d9d9] dark:border-[#333333] shrink-0">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-[10.5px] font-medium tracking-[0.02em] uppercase text-[#8f8f8f] truncate">
              {subjectTitle}
            </span>
            {readTime && (
              <span className="font-mono text-[10px] text-[#8f8f8f] shrink-0">
                • {readTime}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-[#161616] dark:bg-[#fafafa]" />
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Hide sidebar (expand reading view)"
                className="p-1 rounded-full text-[#8f8f8f] hover:text-[#161616] dark:hover:text-[#fafafa] hover:bg-[#f0f0f0] dark:hover:bg-[#303030] transition-colors cursor-pointer"
                aria-label="Hide sidebar"
              >
                <span className="material-symbols-outlined text-[16px]">dock_to_left</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative mt-2">
          <span className="material-symbols-outlined text-[14px] absolute left-2.5 top-2 text-[#8f8f8f]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${sections.length} topics...`}
            className="w-full pl-8 pr-6 py-1.5 rounded-full bg-[#f0f0f0] dark:bg-[#161616] border border-[#d9d9d9] dark:border-[#333333] text-[11.5px] text-[#161616] dark:text-[#fafafa] placeholder:text-[#8f8f8f] focus:outline-none focus:border-[#161616] dark:focus:border-[#ffffff] transition-colors font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-[#8f8f8f] hover:text-[#161616] dark:hover:text-[#fafafa] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[13px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Embedded Lessons Navigation Tree */}
      <nav
        ref={navRef}
        className="flex-1 overflow-y-auto px-2 py-2.5 space-y-1 custom-scrollbar"
      >
        {filteredSections.map((section) => {
          const isDirectActive = activeId === section.id;
          const isSubActive = section.subsections?.some((sub) => sub.id === activeId);
          const isCurrentSection = isDirectActive || isSubActive;

          return (
            <div key={section.id} className="space-y-0.5">
              {/* Parent Section Header Item */}
              <button
                type="button"
                data-active={isCurrentSection ? 'true' : undefined}
                data-active-exact={isDirectActive ? 'true' : undefined}
                onClick={() => onSelect(section.id)}
                className={`group flex items-center w-full text-left px-2.5 py-1.5 rounded-full transition-all duration-150 cursor-pointer ${
                  isCurrentSection
                    ? 'bg-[#212121] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#212121] font-medium shadow-xs'
                    : 'text-[#616161] hover:text-[#161616] dark:hover:text-[#fafafa] hover:bg-[#f0f0f0] dark:hover:bg-[#262626]'
                }`}
              >
                {/* 2-Digit Section Number Badge */}
                <span
                  className={`font-mono text-[10px] w-5 shrink-0 transition-colors ${
                    isCurrentSection
                      ? 'text-[#fafafa] dark:text-[#161616] font-medium'
                      : 'text-[#8f8f8f] group-hover:text-[#161616] dark:group-hover:text-[#fafafa]'
                  }`}
                >
                  {section.displayNumber}
                </span>

                {/* Section Title */}
                <span
                  className={`text-[11.5px] leading-snug flex-1 line-clamp-1 transition-colors ${
                    isCurrentSection
                      ? 'font-medium'
                      : 'font-normal text-[#616161] dark:text-[#a3a3a3] group-hover:text-[#161616] dark:group-hover:text-[#fafafa]'
                  }`}
                >
                  {section.cleanTitle}
                </span>

                {/* Active Indicator or Chevron */}
                {section.subsections && section.subsections.length > 0 && (
                  <span
                    className={`material-symbols-outlined text-[13px] shrink-0 ml-1 transition-transform duration-200 ${
                      isCurrentSection
                        ? 'text-[#fafafa] dark:text-[#161616] rotate-180'
                        : 'text-[#8f8f8f] group-hover:text-[#161616] dark:group-hover:text-[#fafafa]'
                    }`}
                  >
                    expand_more
                  </span>
                )}
              </button>

              {/* Expanded Nested Subsections when Section is Active */}
              {isCurrentSection && (
                <div className="mt-0.5 ml-3 pl-2 border-l border-[#d9d9d9] dark:border-[#333333] space-y-0.5 py-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* Topic Overview link */}
                  <button
                    type="button"
                    data-active-exact={isDirectActive ? 'true' : undefined}
                    onClick={() => onSelect(section.id)}
                    className={`flex items-center gap-1.5 w-full text-left px-2 py-0.5 rounded-full text-[10.5px] transition-colors cursor-pointer ${
                      isDirectActive
                        ? 'bg-[#f0f0f0] dark:bg-[#303030] text-[#161616] dark:text-[#fafafa] font-medium'
                        : 'text-[#616161] hover:text-[#161616] dark:text-[#a3a3a3] dark:hover:text-[#fafafa]'
                    }`}
                  >
                    <span className={`w-1 h-1 rounded-full ${isDirectActive ? 'bg-[#161616] dark:bg-[#fafafa]' : 'bg-[#161616]/40 dark:bg-[#fafafa]/40'}`} />
                    <span>Topic Overview</span>
                  </button>

                  {/* Child Subsections */}
                  {section.subsections &&
                    section.subsections.map((sub) => {
                      const isSubCurrent = activeId === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          data-active-exact={isSubCurrent ? 'true' : undefined}
                          onClick={() => onSelect(sub.id)}
                          className={`group flex items-start gap-1.5 w-full text-left px-2 py-1 rounded-full text-[11px] leading-snug transition-colors cursor-pointer ${
                            isSubCurrent
                              ? 'bg-[#f0f0f0] dark:bg-[#303030] text-[#161616] dark:text-[#fafafa] font-medium'
                              : 'text-[#616161] hover:text-[#161616] dark:text-[#a3a3a3] dark:hover:text-[#fafafa]'
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[12px] shrink-0 mt-0.5 ${
                              isSubCurrent
                                ? 'text-[#161616] dark:text-[#fafafa]'
                                : 'text-[#8f8f8f] group-hover:text-[#161616] dark:group-hover:text-[#fafafa]'
                            }`}
                          >
                            menu_book
                          </span>
                          <span className="line-clamp-2">
                            {sub.title}
                          </span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div className="py-6 text-center text-[#8f8f8f] text-[11px] font-mono">
            No sections match &quot;{searchQuery}&quot;
          </div>
        )}
      </nav>
    </div>
  );
};

export const TableOfContents = EmbeddedArticleSidebar;
