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
        'group relative rounded-xl transition-all duration-200 font-mono-data cursor-pointer',
        variant === 'card' &&
        'bg-[#f4f8fe] hover:bg-[#e8f1fd] dark:bg-[#0f141f] dark:hover:bg-[#162032] p-space-lg hover:-translate-y-0.5 hover:shadow-md border border-[#d6e4f9] dark:border-[#1d273a] hover:border-[#93c5fd] dark:hover:border-[#2d4264] shadow-xs',
        variant === 'compact' &&
        'p-4 bg-[#f4f8fe] hover:bg-[#e8f1fd] dark:bg-[#0f141f] dark:hover:bg-[#162032] border border-[#d6e4f9] dark:border-[#1d273a] hover:border-[#93c5fd] dark:hover:border-[#2d4264] hover:shadow-sm',
        variant === 'flat' &&
        'p-space-lg bg-[#f0f6ff]/70 hover:bg-[#e8f1fd] dark:bg-[#0f141f] dark:hover:bg-[#162032] border border-[#d6e4f9] dark:border-[#1d273a]',
        className
      )}
    >
      {/* Stretched primary clickable link spanning the complete note card */}
      <Link
        to={`/notes/${note.slug}`}
        className="absolute inset-0 z-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-spark/30"
        aria-label={note.title}
      />

      {/* Top Metadata Row (Relative so buttons/links remain clickable) */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 font-mono-data text-label-sm text-smoke">
        <div className="flex items-center gap-2">
          {((note as any).isDraft || (note as any).published === false) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono-data bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              LOCAL DRAFT
            </span>
          )}
          {note.subjectName && (
            <Link
              to={`/subjects/${note.subjectSlug}`}
              className="rounded bg-blue-100/70 dark:bg-[#162032] border border-blue-200/80 dark:border-[#223048] px-2 py-0.5 text-blue-900 dark:text-[#93c5fd] hover:text-ink dark:hover:text-white hover:bg-blue-200/80 dark:hover:bg-[#1f2b42] transition-colors font-mono-data"
            >
              {note.subjectName}
            </Link>
          )}
          <span>•</span>
          <span>{note.publishDate}</span>
        </div>
        <span className="font-mono-data text-graphite dark:text-smoke">{note.readTime}</span>
      </div>

      {/* Title - Stable text color without text-hover color change */}
      <h3 className="relative z-10 mt-space-sm font-mono-data text-[15px] sm:text-[14px] font-medium text-ink dark:text-[#f8fafc] leading-snug">
        <Link to={`/notes/${note.slug}`} className="focus:outline-none">
          {note.title}
        </Link>
      </h3>

      {note.abstract && (
        <p className="relative z-10 mt-space-xs font-mono-data text-[12px] text-smoke dark:text-[#a19a91] line-clamp-2 leading-relaxed">
          {note.abstract}
        </p>
      )}

      {note.tags && note.tags.length > 0 && (
        <div className="relative z-10 mt-space-md flex flex-wrap items-center gap-2">
          {note.tags.map((tag) => (
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
              className="rounded-full bg-blue-50/90 dark:bg-[#151c2a] border border-blue-100 dark:border-[#202b3d] px-2.5 py-0.5 font-mono-data text-label-sm text-graphite dark:text-[#cbd5e1] hover:text-ink dark:hover:text-white hover:bg-blue-100 dark:hover:bg-[#1f2b42] transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </article>
  );
};
