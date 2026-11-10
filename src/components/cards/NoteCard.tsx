import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(`/notes/${note.slug}`)}
      className={cn(
        'catalog-card group relative flex flex-col justify-between transition-all duration-200 cursor-pointer',
        variant === 'compact' && 'p-4',
        variant === 'flat' && 'p-5 bg-white/50 dark:bg-panel/40',
        className
      )}
    >
      {/* Stretched primary clickable link spanning the complete note card */}
      <Link
        to={`/notes/${note.slug}`}
        className="absolute inset-0 z-0 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-focus-blue"
        aria-label={note.title}
        onClick={(e) => e.stopPropagation()}
      />

      <div>
        {/* Top Metadata Row: Subject Domain Tag + Date + Reading Time */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 font-mono text-[11.5px] text-muted-ink">
          <div className="flex items-center gap-2">
            {note.subjectName && (
              <span className="rounded-[4px] bg-panel dark:bg-panel/60 border border-edge/80 px-2 py-0.5 text-navy dark:text-ice font-normal uppercase tracking-wider text-[10.5px]">
                {note.subjectName.split('&')[0]}
              </span>
            )}
            <span className="opacity-50">•</span>
            <span>{note.publishDate}</span>
          </div>
          <span className="text-secondary-ink dark:text-muted-ink">{note.readTime}</span>
        </div>

        {/* Title: Refined Medium Font Weight */}
        <h3 className="relative z-10 mt-3 text-[17px] sm:text-[18px] font-medium leading-snug tracking-tight text-navy dark:text-white group-hover:text-dot-blue dark:group-hover:text-ice transition-colors">
          <Link
            to={`/notes/${note.slug}`}
            className="focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {note.title}
          </Link>
        </h3>

        {/* Abstract */}
        {note.abstract && (
          <p className="relative z-10 mt-2 text-[13.5px] text-secondary-ink dark:text-body-ink line-clamp-2 leading-relaxed">
            {note.abstract}
          </p>
        )}
      </div>

      {/* Base Row: Topic tags on left & Read link on right */}
      <div className="relative z-10 mt-5 pt-3.5 border-t border-edge/60 dark:border-edge/30 flex items-center justify-between gap-3">
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {note.tags && note.tags.length > 0 ? (
            note.tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTagClick) {
                    onTagClick(tag);
                  }
                }}
                className="rounded-[4px] bg-canvas dark:bg-canvas/40 border border-edge/80 dark:border-edge/40 px-2 py-0.5 font-mono text-[11px] text-secondary-ink dark:text-muted-ink hover:text-navy dark:hover:text-white hover:border-navy transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))
          ) : (
            <span className="font-mono text-[11px] text-muted-ink">#internals</span>
          )}
        </div>

        {/* Read action: explicit Link so clicking arrow or text navigates immediately */}
        <Link
          to={`/notes/${note.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[13px] font-normal text-navy dark:text-ice group-hover:translate-x-1 hover:underline transition-transform shrink-0 cursor-pointer"
          aria-label={`Read note: ${note.title}`}
        >
          <span>Read note</span>
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </Link>
      </div>
    </article>
  );
};
