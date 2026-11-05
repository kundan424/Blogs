import React, { useState } from 'react';
import { NoteAuthor, NoteSection } from '../../types';
import { useToast } from '../../context/ToastContext';

export const ArticleAuthorRail: React.FC<{
  author: NoteAuthor;
  readTime: string;
  slug?: string;
  initialClaps?: number;
}> = ({ author, readTime, slug, initialClaps = 0 }) => {
  const { showToast } = useToast();
  const [claps, setClaps] = useState(() => {
    if (slug) {
      try {
        const stored = localStorage.getItem(`blog_claps_${slug}`);
        if (stored) return Number(stored);
      } catch {}
    }
    return initialClaps;
  });

  const [bookmarked, setBookmarked] = useState(() => {
    if (slug) {
      try {
        const stored = localStorage.getItem(`blog_bookmark_${slug}`);
        if (stored) return stored === 'true';
      } catch {}
    }
    return false;
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Permalink copied to clipboard');
  };

  const handleClap = () => {
    const nextClaps = claps + 1;
    setClaps(nextClaps);
    if (slug) {
      try {
        localStorage.setItem(`blog_claps_${slug}`, String(nextClaps));
      } catch {}
    }
    showToast(`Applauded note (+1) — Total: ${nextClaps}`);
  };

  const handleBookmark = () => {
    const nextState = !bookmarked;
    setBookmarked(nextState);
    if (slug) {
      try {
        localStorage.setItem(`blog_bookmark_${slug}`, String(nextState));
      } catch {}
    }
    showToast(nextState ? 'Saved note to reading list' : 'Removed from reading list');
  };

  return (
    <div className="flex flex-col items-center gap-4 py-3.5 px-1.5 rounded-2xl bg-warm-taupe/90 dark:bg-[#1a1815] border border-stone/80 dark:border-[#332e27] shadow-sm w-full max-w-[64px] mx-auto">
      {/* Author Avatar with Hover Popover */}
      <div className="group relative flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-ink text-on-primary flex items-center justify-center font-mono-data text-label-sm font-semibold cursor-default shadow-sm ring-1 ring-stone dark:ring-[#332e27]">
          {(author?.name || 'Kundan').split(' ').map((n) => n[0]).join('')}
        </div>
        {/* Hover Popover Card */}
        <div className="absolute left-full ml-3 top-0 hidden group-hover:block w-56 p-3.5 rounded-xl bg-warm-taupe dark:bg-[#1e1b18] border border-stone dark:border-[#332e27] shadow-xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100 font-sans">
          <p className="font-label-md text-label-md font-medium text-ink">{author?.name || 'Kundan'}</p>
          <span className="font-mono-data text-[11px] text-smoke block mt-0.5">{author?.role || 'Software Engineer'}</span>
          {author?.bio && (
            <p className="font-body-sm text-[12px] text-smoke mt-2 border-t border-stone/60 dark:border-[#332e27] pt-1.5 leading-snug">
              {author.bio}
            </p>
          )}
        </div>
      </div>

      <div className="w-6 h-px bg-stone dark:bg-[#332e27]" />

      {/* Claps Button with Count Badge */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={handleClap}
          title="Applaud note"
          className="w-9 h-9 rounded-xl bg-surface-container-lowest dark:bg-[#221f1b] hover:bg-warm-taupe border border-stone/80 dark:border-[#332e27] text-graphite hover:text-ember-orange flex items-center justify-center transition-all group shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px] text-ember-orange group-hover:scale-110 transition-transform">
            favorite
          </span>
        </button>
        <span className="font-mono-data text-[11px] text-graphite font-medium">
          {claps}
        </span>
      </div>

      {/* Bookmark Button */}
      <button
        type="button"
        onClick={handleBookmark}
        title={bookmarked ? 'Saved to reading list' : 'Save note for later'}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border shadow-sm ${
          bookmarked
            ? 'bg-ink text-on-primary border-ink'
            : 'bg-surface-container-lowest dark:bg-[#221f1b] hover:bg-warm-taupe text-graphite hover:text-ink border-stone/80 dark:border-[#332e27]'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">
          {bookmarked ? 'bookmark_added' : 'bookmark'}
        </span>
      </button>

      {/* Copy Permalink Button */}
      <button
        type="button"
        onClick={handleCopyLink}
        title="Copy permalink"
        className="w-9 h-9 rounded-xl bg-surface-container-lowest dark:bg-[#221f1b] hover:bg-warm-taupe border border-stone/80 dark:border-[#332e27] text-graphite hover:text-ink flex items-center justify-center transition-all shadow-sm"
      >
        <span className="material-symbols-outlined text-[18px]">link</span>
      </button>

      <div className="w-6 h-px bg-stone dark:bg-[#332e27]" />

      {/* Reading Time Badge */}
      <div className="flex flex-col items-center text-center px-1" title={`Reading Pace: ${readTime}`}>
        <span className="material-symbols-outlined text-[15px] text-smoke">schedule</span>
        <span className="font-mono-data text-[10px] text-smoke leading-tight mt-0.5 whitespace-nowrap">
          {readTime.replace(' min read', 'm')}
        </span>
      </div>
    </div>
  );
};

export const TableOfContents: React.FC<{
  sections: NoteSection[];
  activeId?: string;
  onSelect: (id: string) => void;
}> = ({ sections, activeId, onSelect }) => {
  return (
    <div className="space-y-3">
      <div className="font-mono-data text-label-sm uppercase tracking-wider text-smoke flex items-center gap-1.5 pb-2 border-b border-stone dark:border-[#332e27] font-semibold">
        <span className="material-symbols-outlined text-[16px] text-ember-orange">
          toc
        </span>
        <span>ON THIS PAGE</span>
      </div>

      <nav className="space-y-1 font-mono-data text-label-sm max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
        {sections.map((section) => {
          const isDirectActive = activeId === section.id;
          const isSubActive = section.subsections?.some((sub) => sub.id === activeId);
          const isActive = isDirectActive || isSubActive;

          return (
            <div key={section.id} className="space-y-1">
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                className={`block w-full text-left py-1.5 px-2.5 rounded-lg transition-all leading-snug ${
                  isActive
                    ? 'bg-surface-container-lowest dark:bg-[#26221d] text-ink dark:text-white font-medium border-l-2 border-violet-spark pl-3 shadow-xs'
                    : 'text-smoke hover:text-ink hover:bg-surface-container-lowest/60 dark:hover:bg-[#201d19] dark:text-[#a8a29e]'
                }`}
              >
                {section.title}
              </button>

              {section.subsections && section.subsections.length > 0 && (
                <div className="pl-3 ml-2 border-l border-stone/50 dark:border-[#2e2924] space-y-1">
                  {section.subsections.map((sub) => {
                    const isCurrent = activeId === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => onSelect(sub.id)}
                        className={`block w-full text-left py-1 px-2 rounded text-[12px] transition-all leading-snug ${
                          isCurrent
                            ? 'text-violet-spark font-medium'
                            : 'text-smoke/80 hover:text-ink dark:text-[#8c827a]'
                        }`}
                      >
                        {sub.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};
