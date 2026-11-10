import React from 'react';
import { Link } from 'react-router-dom';
import { Subject } from '../../types';
import { cn } from '../../utils/cn';

interface SubjectCardProps {
  subject: Subject;
  variant?: 'bento' | 'directory';
  colSpan?: string;
  className?: string;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  variant = 'directory',
  colSpan,
  className,
}) => {
  return (
    <article
      className={cn(
        'catalog-card group relative flex flex-col justify-between transition-all duration-200',
        variant === 'bento' ? 'p-7 min-h-[250px]' : 'p-6',
        colSpan,
        className
      )}
    >
      <div>
        {/* Top Header: Icon + Domain Hub Eyebrow + Notes Count */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-panel dark:bg-panel/60 text-navy dark:text-ice border border-edge/80 shadow-2xs shrink-0">
              <span className="material-symbols-outlined text-[20px]">
                {subject.icon}
              </span>
            </div>
            <div>
              <span className="font-mono text-[10.5px] font-medium text-muted-ink uppercase tracking-wider block">
                {subject.hubNumber || 'DOMAIN HUB'}
              </span>
              <h3 className="text-[18px] sm:text-[20px] font-semibold leading-tight tracking-tight text-navy dark:text-white group-hover:text-dot-blue dark:group-hover:text-ice transition-colors">
                <Link to={`/subjects/${subject.slug}`}>{subject.name}</Link>
              </h3>
            </div>
          </div>

          <span className="rounded-[4px] bg-panel dark:bg-panel/60 px-2.5 py-1 font-mono text-[11px] font-medium text-secondary-ink dark:text-muted-ink border border-edge/60 shrink-0">
            {subject.notesCount} {subject.notesCount === 1 ? 'note' : 'notes'}
          </span>
        </div>

        {/* Description */}
        <p className="mt-3 text-[13.5px] leading-relaxed text-secondary-ink dark:text-body-ink line-clamp-2">
          {subject.description}
        </p>

        {/* Featured Research Notes box */}
        {subject.featuredNotes && subject.featuredNotes.length > 0 && (
          <div className="mt-4 space-y-1.5 rounded-[6px] bg-canvas/70 dark:bg-canvas/30 p-3 border border-edge/80 dark:border-edge/30">
            <span className="font-mono text-[10.5px] text-muted-ink uppercase tracking-wider block font-medium">
              Featured Notes
            </span>
            {subject.featuredNotes.map((fn, idx) => (
              <React.Fragment key={fn.slug}>
                {idx > 0 && <div className="h-px w-full bg-edge/60 dark:bg-edge/20 my-1" />}
                <Link
                  to={`/notes/${fn.slug}`}
                  className="flex items-center justify-between py-0.5 text-heading-ink dark:text-white hover:text-dot-blue dark:hover:text-ice transition-colors font-sans"
                >
                  <span className="text-[13px] truncate">{fn.title}</span>
                  <span className="font-mono text-[11px] text-muted-ink ml-2 shrink-0">
                    {fn.readTime}
                  </span>
                </Link>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="mt-5 pt-3.5 border-t border-edge/60 dark:border-edge/30 flex items-center justify-between font-mono text-[12.5px]">
        <span className="text-muted-ink text-[11.5px]">
          {subject.updatedDaysAgo === 0
            ? 'Updated today'
            : subject.updatedDaysAgo === 1
            ? 'Updated 1d ago'
            : `Updated ${subject.updatedDaysAgo}d ago`}
        </span>
        <Link
          to={`/subjects/${subject.slug}`}
          className="inline-flex items-center gap-1.5 font-medium text-navy dark:text-ice hover:underline group-hover:translate-x-0.5 transition-transform"
        >
          <span>Explore Hub</span>
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </Link>
      </div>
    </article>
  );
};
