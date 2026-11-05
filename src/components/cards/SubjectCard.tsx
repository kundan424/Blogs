import React from 'react';
import { Link } from 'react-router-dom';
import { Subject } from '../../types';
import { cn } from '../../utils/cn';

interface SubjectCardProps {
  subject: Subject;
  variant?: 'bento' | 'directory';
  colSpan?: string;
  accentColor?: 'violet' | 'orange';
  className?: string;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  variant = 'directory',
  colSpan,
  accentColor = 'violet',
  className,
}) => {
  const hoverAccentClass =
    accentColor === 'orange'
      ? 'group-hover:text-ember-orange'
      : 'group-hover:text-violet-spark';

  if (variant === 'bento') {
    return (
      <div
        className={cn(
          'group relative flex flex-col justify-between rounded-xl bg-warm-taupe p-space-xl transition-all duration-300 hover:shadow-lg border border-stone/80 dark:border-[#332e27] dark:bg-[] hover:border-graphite/40 dark:hover:border-[#4d463b] shadow-sm',
          colSpan,
          className
        )}
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-lowest text-ink shadow-sm border border-stone/60 dark:border-[#332e27] dark:bg-[#221f1b]">
              <span className="material-symbols-outlined text-[24px]">
                {subject.icon}
              </span>
            </div>
            <span className="rounded-full bg-surface-container-lowest px-3 py-1 font-mono-data text-label-sm text-graphite shadow-sm border border-stone/60 dark:border-[#332e27] dark:bg-[#221f1b]">
              {subject.notesCount} Notes
            </span>
          </div>

          <h3
            className={cn(
              'mt-space-lg font-headline-md text-headline-md text-ink transition-colors',
              hoverAccentClass
            )}
          >
            <Link to={`/subjects/${subject.slug}`}>{subject.name}</Link>
          </h3>
          <p className="mt-space-xs font-body-md text-body-md text-smoke leading-relaxed">
            {subject.description}
          </p>
        </div>

        {subject.featuredNotes && subject.featuredNotes.length > 0 && (
          <div className="mt-space-xl space-y-space-xs rounded-lg bg-surface-container-lowest p-space-md shadow-sm border border-stone/60 dark:border-[#332e27] dark:bg-[#13110f]">
            <div className="font-mono-data text-label-sm text-smoke uppercase tracking-wider mb-2 font-medium">
              Featured Research Notes
            </div>
            {subject.featuredNotes.map((fn, idx) => (
              <React.Fragment key={fn.slug}>
                {idx > 0 && <div className="h-px w-full bg-stone my-1" />}
                <Link
                  to={`/notes/${fn.slug}`}
                  className={cn(
                    'flex items-center justify-between py-1 text-ink transition-colors group/link',
                    accentColor === 'orange'
                      ? 'hover:text-ember-orange'
                      : 'hover:text-violet-spark'
                  )}
                >
                  <span className="font-body-md text-body-md truncate">
                    {fn.title}
                  </span>
                  <span className="font-mono-data text-label-sm text-smoke ml-2 shrink-0 group-hover/link:text-ink">
                    {fn.readTime}
                  </span>
                </Link>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Directory Variant
  return (
    <article
      className={cn(
        'subject-card flex flex-col justify-between p-6 bg-warm-taupe border border-stone/80 dark:border-[#332e27] dark:bg-[#1a1815] rounded-2xl transition-all duration-150 hover:border-graphite/40 dark:hover:border-[#4d463b] shadow-sm',
        className
      )}
    >
      <div className="space-y-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#2c2927] border border-stone dark:border-[#332e27] flex items-center justify-center text-ink shadow-sm">
              <span className="material-symbols-outlined text-[20px]">
                {subject.icon}
              </span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-ink font-light hover:underline cursor-pointer">
                <Link to={`/subjects/${subject.slug}`}>{subject.name}</Link>
              </h2>
              <span className="font-mono-data text-label-sm text-smoke">
                {subject.hubNumber}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono-data text-label-sm px-2.5 py-0.5 rounded-full bg-white dark:bg-[#221f1b] border border-stone dark:border-[#332e27] text-graphite">
              {subject.notesCount} {subject.notesCount === 1 ? 'note' : 'notes'}
            </span>
            <span className="font-mono-data text-label-sm text-smoke hidden sm:inline">
              {subject.notesCount === 0
                ? 'No notes yet'
                : subject.updatedDaysAgo === 0
                ? 'Updated today'
                : subject.updatedDaysAgo === 1
                ? 'Updated 1d ago'
                : `Updated ${subject.updatedDaysAgo}d ago`}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="font-mono-data text-body-md text-smoke line-clamp-2">
          {subject.description}
        </p>

        {/* Sub-topics Preview */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {subject.featuredTopics.map((topic) => (
            <Link
              key={topic}
              to={`/topics/${topic}`}
              className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#221f1b] border border-stone/80 dark:border-[#332e27] font-mono-data text-label-sm text-graphite hover:border-ink hover:text-ink transition-colors"
            >
              #{topic}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Meta Row */}
      <div className="pt-6 mt-6 border-t border-stone/80 flex items-center justify-between text-label-sm font-mono-data">
        <div className="flex items-center gap-1.5 text-smoke truncate max-w-[200px] sm:max-w-xs">
          <span className="material-symbols-outlined text-[14px] text-ember-orange">
            history_edu
          </span>
          <span className="truncate">
            {subject.featuredNotes && subject.featuredNotes.length > 0 ? (
              <>
                Latest:{' '}
                <Link
                  to={`/notes/${subject.featuredNotes[0].slug}`}
                  className="text-graphite hover:text-ink hover:underline"
                >
                  {subject.featuredNotes[0].title}
                </Link>
              </>
            ) : (
              <span>No notes published yet</span>
            )}
          </span>
        </div>
        <Link
          to={`/subjects/${subject.slug}`}
          className="inline-flex items-center gap-1 text-ink font-label-md hover:translate-x-0.5 transition-transform shrink-0 font-medium ml-2"
        >
          <span>View Hub</span>
          <span className="text-[12px] material-symbols-outlined">arrow_forward</span>
        </Link>
      </div>
    </article>
  );
};
