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
        'group relative flex flex-col justify-between bg-bright-white dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] rounded-[18px] sm:rounded-[20px] transition-all duration-200 cursor-pointer overflow-hidden',
        'hover:border-[#161616] dark:hover:border-[#ffffff] hover:-translate-y-0.5 shadow-2xs hover:shadow-md',
        variant === 'compact' ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5',
        variant === 'flat' && 'bg-[#f0f0f0] dark:bg-[#212121] border-transparent',
        className
      )}
    >
      {/* Stretched primary clickable link spanning the complete note card */}
      <Link
        to={`/notes/${note.slug}`}
        className="absolute inset-0 z-0 rounded-[18px] sm:rounded-[20px] focus:outline-none focus:ring-1 focus:ring-[#161616] dark:focus:ring-[#ffffff]"
        aria-label={note.title}
        onClick={(e) => e.stopPropagation()}
      />

      <div>
        {/* Top Metadata Row: Subject Domain Tag + Date + Reading Time */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 font-mono text-[10.5px] uppercase tracking-[0.02em] text-[#8f8f8f]">
          <div className="flex items-center gap-2">
            {note.subjectName && (
              <span className="relative inline-flex items-center px-2 py-0.5 rounded-full bg-[#f0f0f0] dark:bg-[#303030] text-[#161616] dark:text-[#fafafa] font-medium border border-[#d9d9d9] dark:border-[#474747] text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#161616] dark:bg-[#fafafa] mr-1.5" />
                {note.subjectName.split('&')[0].trim()}
              </span>
            )}
            <span className="opacity-40">•</span>
            <span>{note.publishDate}</span>
          </div>
          <span className="text-[#616161] dark:text-[#a3a3a3]">{note.readTime}</span>
        </div>

        {/* Title: Medium Grotesk (Inter 500, tight tracking) */}
        <h3 className="relative z-10 mt-2 sm:mt-2.5 text-[16px] sm:text-[17.5px] font-medium leading-[1.25] tracking-[-0.01em] text-[#161616] dark:text-[#fafafa] group-hover:underline transition-colors">
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
          <p className="relative z-10 mt-1.5 text-[13px] sm:text-[13.5px] max-w-4xl text-[#616161] dark:text-[#a3a3a3] line-clamp-2 leading-relaxed font-sans">
            {note.abstract}
          </p>
        )}
      </div>

      {/* Base Row: Topic tags on left & Read link on right */}
      <div className="relative z-10 mt-3.5 pt-2.5 sm:pt-3 border-t border-[#e5e5e5] dark:border-[#303030] flex items-center justify-between gap-3">
        {/* Tags in uppercase mono pills */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {note.tags && note.tags.length > 0 ? (
            note.tags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTagClick) {
                    onTagClick(tag);
                  }
                }}
                className="rounded-full bg-[#f0f0f0] dark:bg-[#303030] border border-[#d9d9d9] dark:border-[#474747] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.02em] text-[#616161] dark:text-[#a3a3a3] hover:text-[#161616] dark:hover:text-[#fafafa] hover:border-[#161616] dark:hover:border-[#ffffff] transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.02em] text-[#8f8f8f]">#internals</span>
          )}
        </div>

        {/* Read action */}
        <Link
          to={`/notes/${note.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 font-mono text-[11.5px] uppercase tracking-[0.02em] font-medium text-[#161616] dark:text-[#fafafa] group-hover:translate-x-0.5 transition-all shrink-0 cursor-pointer"
          aria-label={`Read note: ${note.title}`}
        >
          <span>Read note</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      </div>
    </article>
  );
};
