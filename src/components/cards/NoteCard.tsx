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
        'group relative rounded-xl transition-all duration-200 font-mono-data',
        variant === 'card' &&
          'bg-surface-container-lowest dark:bg-[#2c2927] p-space-lg hover:-translate-y-0.5 hover:shadow-md border border-stone/80 dark:border-[#332e27] hover:border-graphite/40 dark:hover:border-[#4d463b] shadow-sm',
        variant === 'compact' && 'p-4 bg-warm-taupe dark:bg-[#1a1815] border border-stone/80 dark:border-[#332e27] hover:shadow-sm',
        variant === 'flat' && 'p-space-lg bg-warm-taupe/80 dark:bg-[#1a1815] hover:bg-warm-taupe border border-stone/60 dark:border-[#332e27]',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono-data text-label-sm text-smoke">
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
              className="rounded bg-warm-taupe dark:bg-[#221f1b] border border-stone/50 dark:border-[#332e27] px-2 py-0.5 text-graphite dark:text-[#d4cfc9] hover:text-ink dark:hover:text-white hover:bg-stone/50 transition-colors font-mono-data"
            >
              {note.subjectName}
            </Link>
          )}
          <span>•</span>
          <span>{note.publishDate}</span>
        </div>
        <span className="font-mono-data text-graphite dark:text-smoke">{note.readTime}</span>
      </div>

      <h3 className="mt-space-sm font-mono-data text-[15px] sm:text-[14px] font-medium text-ink group-hover:text-violet-spark transition-colors leading-snug">
        <Link to={`/notes/${note.slug}`} className="focus:outline-none">
          {note.title}
        </Link>
      </h3>
        
        {note.abstract && (
        <p className="mt-space-xs font-mono-data text-[12px] text-smoke dark:text-[#a19a91] line-clamp-2 leading-relaxed">
          {note.abstract}
        </p>
      )}

      {note.tags && note.tags.length > 0 && (
        <div className="mt-space-md flex flex-wrap items-center gap-2">
          {note.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(e) => {
                if (onTagClick) {
                  e.preventDefault();
                  onTagClick(tag);
                }
              }}
              className="rounded-full bg-warm-taupe dark:bg-[#221f1b] border border-stone/50 dark:border-[#332e27] px-2.5 py-0.5 font-mono-data text-label-sm text-graphite dark:text-[#d4cfc9] hover:text-ink dark:hover:text-white hover:bg-stone/60 dark:hover:bg-[#2d2822] transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </article>
  );
};
