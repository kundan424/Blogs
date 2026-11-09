import React, { useState, useMemo } from 'react';
import { NoteSection } from '../../types';

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
    <aside
      className={`flex flex-col bg-warm-taupe/80 dark:bg-[#0d0e15] border-r border-stone/70 dark:border-[#1e2029] select-none text-ink dark:text-[#e2e8f0] transition-colors duration-200 ${className}`}
    >
      {/* Top Header Section */}
      <div className="p-3 border-b border-stone/70 dark:border-[#1b1c28] shrink-0">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-[10.5px] font-semibold tracking-wider uppercase text-smoke dark:text-[#a5b4fc] truncate">
              {subjectTitle}
            </span>
            {readTime && (
              <span className="font-mono text-[10px] text-smoke/70 dark:text-[#818cf8] shrink-0">
                • {readTime}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-spark dark:bg-[#818cf8] animate-pulse" />
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Hide sidebar (expand reading view)"
                className="p-1 rounded text-smoke dark:text-[#94a3b8] hover:text-ink dark:hover:text-white hover:bg-stone/30 dark:hover:bg-[#1a1c28] transition-colors"
                aria-label="Hide sidebar"
              >
                <span className="material-symbols-outlined text-[16px]">dock_to_left</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative mt-2">
          <span className="material-symbols-outlined text-[14px] absolute left-2.5 top-2 text-smoke dark:text-[#64748b]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${sections.length} topics...`}
            className="w-full pl-8 pr-6 py-1.5 rounded-lg bg-surface-container-lowest dark:bg-[#08090d] border border-stone/80 dark:border-[#232533] text-[11px] text-ink dark:text-[#e2e8f0] placeholder:text-smoke dark:placeholder-[#64748b] focus:outline-none focus:border-violet-spark dark:focus:border-[#7c3aed] transition-colors font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-smoke dark:text-[#64748b] hover:text-ink dark:hover:text-[#e2e8f0]"
            >
              <span className="material-symbols-outlined text-[13px]">close</span>
            </button>
          )}
        </div>
       
      </div>

      {/* Embedded Lessons Navigation Tree */}
      <nav className="flex-1 overflow-y-auto px-2 py-2.5 space-y-0.5 scrollbar-thin scrollbar-thumb-stone dark:scrollbar-thumb-[#232536] scrollbar-track-transparent">
        {filteredSections.map((section) => {
          const isDirectActive = activeId === section.id;
          const isSubActive = section.subsections?.some((sub) => sub.id === activeId);
          const isCurrentSection = isDirectActive || isSubActive;

          return (
            <div key={section.id} className="space-y-0.5">
              {/* Parent Section Header Item */}
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                className={`group flex items-center w-full text-left px-2.5 py-1.5 rounded-lg transition-all duration-150 ${
                  isCurrentSection
                    ? 'bg-violet-spark/10 dark:bg-[#1f1837] border border-violet-spark/40 dark:border-[#6b21a8]/50 text-ink dark:text-[#f5f3ff] shadow-xs'
                    : 'text-graphite dark:text-[#94a3b8] hover:text-ink dark:hover:text-[#f8fafc] hover:bg-stone/30 dark:hover:bg-[#131420] border border-transparent'
                }`}
              >
                {/* 2-Digit Section Number Badge */}
                <span
                  className={`font-mono text-[11px] font-medium w-6 shrink-0 transition-colors ${
                    isCurrentSection
                      ? 'text-violet-spark dark:text-[#c084fc] font-semibold'
                      : 'text-smoke dark:text-[#64748b] group-hover:text-violet-spark dark:group-hover:text-[#a5b4fc]'
                  }`}
                >
                  {section.displayNumber}
                </span>

                {/* Section Title */}
                <span
                  className={`text-[12px] leading-snug flex-1 line-clamp-1 transition-colors ${
                    isCurrentSection ? 'font-medium text-ink dark:text-[#f1f5f9]' : 'font-normal'
                  }`}
                >
                  {section.cleanTitle}
                </span>

                {/* Active Indicator or Chevron */}
                {section.subsections && section.subsections.length > 0 && (
                  <span
                    className={`material-symbols-outlined text-[13px] shrink-0 ml-1 transition-transform duration-200 ${
                      isCurrentSection
                        ? 'text-violet-spark dark:text-[#c084fc] rotate-180'
                        : 'text-ash dark:text-[#475569] group-hover:text-smoke dark:group-hover:text-[#94a3b8]'
                    }`}
                  >
                    expand_more
                  </span>
                )}
              </button>

              {/* Expanded Nested Subsections when Section is Active */}
              {isCurrentSection && (
                <div className="mt-0.5 ml-3 pl-2.5 border-l border-violet-spark/30 dark:border-[#35255e]/60 space-y-0.5 py-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* Module Overview link */}
                  <button
                    type="button"
                    onClick={() => onSelect(section.id)}
                    className={`flex items-center gap-1.5 w-full text-left px-2 py-1 rounded-md text-[11px] transition-colors ${
                      isDirectActive
                        ? 'bg-violet-spark/15 dark:bg-[#291e4a] text-violet-spark dark:text-[#e9d5ff] font-medium'
                        : 'text-smoke dark:text-[#94a3b8] hover:text-ink dark:hover:text-[#f8fafc] hover:bg-stone/20 dark:hover:bg-[#181928]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-spark dark:bg-[#a855f7]" />
                    <span>Topic Overview</span>
                  </button>

                  {/* Child Subsections / Detailed In-Depth Anchors */}
                  {section.subsections &&
                    section.subsections.map((sub) => {
                      const isSubCurrent = activeId === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => onSelect(sub.id)}
                          className={`group flex items-start gap-1.5 w-full text-left px-2 py-1 rounded-md text-[11px] leading-snug transition-colors ${
                            isSubCurrent
                              ? 'bg-violet-spark/20 dark:bg-[#2b204f] text-violet-spark dark:text-white font-medium border-l-2 border-violet-spark dark:border-[#a855f7] pl-1.5'
                              : 'text-smoke dark:text-[#94a3b8] hover:text-ink dark:hover:text-[#f8fafc] hover:bg-stone/20 dark:hover:bg-[#161726]'
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[12px] shrink-0 mt-0.5 ${
                              isSubCurrent
                                ? 'text-violet-spark dark:text-[#c084fc]'
                                : 'text-ash dark:text-[#64748b]'
                            }`}
                          >
                            subdirectory_arrow_right
                          </span>
                          <span className="line-clamp-2">{sub.title}</span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div className="py-6 text-center text-smoke dark:text-[#64748b] text-[11px] font-mono">
            No sections match "{searchQuery}"
          </div>
        )}
      </nav>
    </aside>
  );
};

// Re-export TableOfContents for backward compatibility
export const TableOfContents = EmbeddedArticleSidebar;
