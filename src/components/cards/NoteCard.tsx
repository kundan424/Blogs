import React from 'react';
import { Link } from 'react-router-dom';
import { Note } from '../../types';
import { cn } from '../../utils/cn';

interface NoteCardProps {
  note: Note;
  variant?: 'card' | 'compact' | 'flat';
  onTagClick?: (tag: string) => void;
  className?: string;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  variant = 'card',
  onTagClick,
  className,
}) => {
  return (
    <article
      className={cn(
        'group relative rounded-[16px] transition-all duration-200 cursor-pointer font-sans flex flex-col justify-between',
        variant === 'card' &&
          'bg-preview dark:bg-[#1c1a17] hover:bg-[#f2eee9] dark:hover:bg-[#25221c] p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-xs border border-edge/80 dark:border-[#332f28] hover:border-accent/50 dark:hover:border-accent/60',
        variant === 'compact' &&
          'p-4 bg-preview dark:bg-[#1c1a17] hover:bg-[#f2eee9] dark:hover:bg-[#25221c] border border-edge/80 dark:border-[#332f28] hover:border-accent/50 dark:hover:border-accent/60 hover:shadow-xs',
        variant === 'flat' &&
          'p-5 sm:p-6 bg-preview/80 hover:bg-[#f2eee9] dark:bg-[#1c1a17] dark:hover:bg-[#25221c] border border-edge/80 dark:border-[#332f28] hover:border-accent/50 dark:hover:border-accent/60',
        className
      )}
    >
      {/* Stretched primary clickable link spanning the complete note card */}
      <Link
        to={`/notes/${note.slug}`}
        className="absolute inset-0 z-0 rounded-[16px] focus:outline-none focus:ring-2 focus:ring-accent/30"
        aria-label={note.title}
      />

      <div>
        {/* Top Metadata Row */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 font-mono text-[12px] text-muted dark:text-[#a8a29a]">
          <div className="flex items-center gap-2">
            {((note as any).isDraft || (note as any).published === false) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                LOCAL DRAFT
              </span>
            )}
            {note.subjectName && (
              <Link
                to={`/subjects/${note.subjectSlug}`}
                className="rounded-[6px] bg-[#f0ebe3] dark:bg-[#28241e] border border-edge/80 dark:border-[#3d3830] px-2 py-0.5 text-strong dark:text-[#dcd6cc] hover:text-accent dark:hover:text-accent hover:border-accent/40 dark:hover:border-accent/40 transition-colors font-mono text-[11px] font-medium uppercase tracking-technical"
              >
                {note.subjectName.split('&')[0]}
              </Link>
            )}
            <span className="text-muted/60 dark:text-[#6f6c6a]">•</span>
            <span className="text-muted dark:text-[#a8a29a]">{note.publishDate}</span>
          </div>
          <span className="font-mono text-muted dark:text-[#a8a29a]">{note.readTime}</span>
        </div>

        {/* Title - Clean Diatype / grotesk heading */}
        <h3 className="relative z-10 mt-3 text-[18px] sm:text-[20px] font-normal leading-snug tracking-[-0.03em] text-strong dark:text-[#faf6f1] group-hover:text-accent dark:group-hover:text-accent transition-colors">
          <Link to={`/notes/${note.slug}`} className="focus:outline-none">
            {note.title}
          </Link>
        </h3>

        {/* Abstract */}
        {note.abstract && (
          <p className="relative z-10 mt-2 text-[13.5px] text-[#5c5957] dark:text-[#b8b2a8] line-clamp-2 leading-relaxed font-normal">
            {note.abstract}
          </p>
        )}
      </div>

      {/* Base Row: Topic tags on left & "Read now →" arrow on right side */}
      <div className="relative z-10 mt-5 pt-3.5 border-t border-edge/60 dark:border-[#2f2b25] flex items-center justify-between gap-3">
        {/* Left: Tags */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {note.tags && note.tags.length > 0 ? (
            note.tags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  if (onTagClick) {
                    e.preventDefault();
                    e.stopPropagation();
                    onTagClick(tag);
                  }
                }}
                className="rounded-full bg-canvas dark:bg-[#25221c] border border-filter-edge dark:border-[#38332c] px-2.5 py-0.5 font-mono text-[11px] text-muted dark:text-[#b8b2a8] hover:text-strong dark:hover:text-white hover:border-accent/60 dark:hover:border-accent/60 hover:bg-[#f6f2ec] dark:hover:bg-[#2f2a24] transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))
          ) : (
            <span className="font-mono text-[11px] text-muted dark:text-[#a8a29a]">#internals</span>
          )}
        </div>

        {/* Right side: Read now link button */}
        <Link
          to={`/notes/${note.slug}`}
          style={{ color: '#ff3c00' }}
          className="relative z-20 shrink-0 inline-flex items-center gap-1.5 font-mono text-[12px] sm:text-[13px] font-medium text-accent hover:text-accent/90 dark:text-accent dark:hover:text-accent/90 hover:underline group-hover:underline ml-auto cursor-pointer"
          aria-label={`Read ${note.title} now`}
        >
          <span>Read now</span>
          <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:translate-x-1" style={{ color: '#ff3c00' }}>
            arrow_forward
          </span>
        </Link>
      </div>
    </article>
  );
};
