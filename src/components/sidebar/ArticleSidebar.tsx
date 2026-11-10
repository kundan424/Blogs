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

      // Check if active element is outside or close to the edge of the sidebar visible viewport
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

  // Extract pure number (e.g., "01", "10") and clean title from section
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

  // Filter sections by search query
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
        'flex flex-col select-none text-body-ink transition-colors duration-200',
        className || 'bg-white/90 dark:bg-panel border-r border-edge'
      )}
    >
      {/* Top Header Section */}
      <div className="p-3 border-b border-edge shrink-0">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-[10.5px] font-medium tracking-wider uppercase text-muted-ink truncate">
              {subjectTitle}
            </span>
            {readTime && (
              <span className="font-mono text-[10px] text-muted-ink/80 shrink-0">
                • {readTime}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-proof-green animate-pulse" />
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Hide sidebar (expand reading view)"
                className="p-1 rounded-[6px] text-muted-ink hover:text-navy dark:hover:text-white hover:bg-canvas transition-colors cursor-pointer"
                aria-label="Hide sidebar"
              >
                <span className="material-symbols-outlined text-[16px]">dock_to_left</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative mt-2">
          <span className="material-symbols-outlined text-[14px] absolute left-2.5 top-2 text-muted-ink">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${sections.length} topics...`}
            className="w-full pl-8 pr-6 py-1.5 rounded-[8px] bg-canvas dark:bg-[#121620] border border-edge text-[11px] text-body-ink placeholder:text-muted-ink focus:outline-none focus:border-navy dark:focus:border-focus-blue transition-colors font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-muted-ink hover:text-navy dark:hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-[13px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Embedded Lessons Navigation Tree */}
      <nav
        ref={navRef}
        className="flex-1 overflow-y-auto px-2 py-2.5 space-y-1 scrollbar-thin scrollbar-thumb-edge scrollbar-track-transparent"
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
                className={`group flex items-center w-full text-left px-2.5 py-2 rounded-[8px] transition-all duration-150 cursor-pointer ${
                  isCurrentSection
                    ? 'bg-gradient-to-r from-[#3e5199]/15 via-[#3e5199]/10 to-transparent dark:from-[#3e5199]/35 dark:via-[#3e5199]/20 dark:to-transparent border-l-[3.5px] border-l-[#3e5199] dark:border-l-focus-blue border-t-transparent border-b-transparent border-r-transparent text-[#1b2d70] dark:text-ice shadow-2xs font-semibold'
                    : 'text-secondary-ink hover:text-navy dark:hover:text-white hover:bg-canvas border-l-[3.5px] border-l-transparent'
                }`}
              >
                {/* 2-Digit Section Number Badge */}
                <span
                  className={`font-mono text-[10.5px] w-6 shrink-0 transition-colors ${
                    isCurrentSection
                      ? 'text-[#3e5199] dark:text-focus-blue font-bold'
                      : 'text-muted-ink group-hover:text-navy dark:group-hover:text-white font-medium'
                  }`}
                >
                  {section.displayNumber}
                </span>

                {/* Section Title */}
                <span
                  className={`text-[12px] leading-snug flex-1 line-clamp-1 transition-colors ${
                    isCurrentSection
                      ? 'font-semibold text-[#1b2d70] dark:text-ice'
                      : 'font-normal text-secondary-ink group-hover:text-navy dark:group-hover:text-white'
                  }`}
                >
                  {section.cleanTitle}
                </span>

                {/* Active Indicator or Chevron */}
                {section.subsections && section.subsections.length > 0 && (
                  <span
                    className={`material-symbols-outlined text-[14px] shrink-0 ml-1 transition-transform duration-200 ${
                      isCurrentSection
                        ? 'text-[#3e5199] dark:text-focus-blue rotate-180 font-bold'
                        : 'text-muted-ink group-hover:text-navy dark:group-hover:text-white'
                    }`}
                  >
                    expand_more
                  </span>
                )}
              </button>

              {/* Expanded Nested Subsections when Section is Active */}
              {isCurrentSection && (
                <div className="mt-0.5 ml-3 pl-2.5 border-l-2 border-[#3e5199]/30 dark:border-focus-blue/30 space-y-0.5 py-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* Module Overview link */}
                  <button
                    type="button"
                    data-active-exact={isDirectActive ? 'true' : undefined}
                    onClick={() => onSelect(section.id)}
                    className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded-[6px] text-[11px] transition-colors cursor-pointer ${
                      isDirectActive
                        ? 'bg-[#3e5199]/15 dark:bg-[#3e5199]/35 border-l-2 border-[#3e5199] dark:border-focus-blue text-[#1b2d70] dark:text-ice font-semibold pl-1.5'
                        : 'text-secondary-ink hover:text-navy dark:hover:text-white hover:bg-canvas'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isDirectActive ? 'bg-[#3e5199] dark:bg-focus-blue' : 'bg-proof-green'}`} />
                    <span className={isDirectActive ? 'text-[#1b2d70] dark:text-ice font-semibold' : ''}>
                      Topic Overview
                    </span>
                  </button>

                  {/* Child Subsections / Detailed In-Depth Anchors */}
                  {section.subsections &&
                    section.subsections.map((sub) => {
                      const isSubCurrent = activeId === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          data-active-exact={isSubCurrent ? 'true' : undefined}
                          onClick={() => onSelect(sub.id)}
                          className={`group flex items-start gap-2 w-full text-left px-2 py-1 rounded-[6px] text-[11.5px] leading-snug transition-colors cursor-pointer ${
                            isSubCurrent
                              ? 'bg-[#3e5199]/15 dark:bg-[#3e5199]/35 text-[#1b2d70] dark:text-ice font-semibold border-l-2 border-[#3e5199] dark:border-focus-blue pl-1.5 shadow-2xs'
                              : 'text-secondary-ink hover:text-navy dark:hover:text-white hover:bg-canvas'
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[13px] shrink-0 mt-0.5 ${
                              isSubCurrent
                                ? 'text-[#3e5199] dark:text-focus-blue font-bold'
                                : 'text-muted-ink group-hover:text-navy dark:group-hover:text-white'
                            }`}
                          >
                            menu_book
                          </span>
                          <span className={`line-clamp-2 ${isSubCurrent ? 'text-[#1b2d70] dark:text-ice font-semibold' : ''}`}>
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
          <div className="py-6 text-center text-muted-ink text-[11px] font-mono">
            No sections match "{searchQuery}"
          </div>
        )}
      </nav>
    </div>
  );
};

// Re-export TableOfContents for backward compatibility
export const TableOfContents = EmbeddedArticleSidebar;
