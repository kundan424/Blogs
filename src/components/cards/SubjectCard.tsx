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
  accentColor = 'orange',
  className,
}) => {
  const hoverAccentClass =
    accentColor === 'violet'
      ? 'group-hover:text-violet-spark dark:group-hover:text-violet-spark'
      : 'group-hover:text-accent dark:group-hover:text-accent';

  if (variant === 'bento') {
    return (
      <div
        className={cn(
          'group relative flex flex-col justify-between rounded-[20px] bg-[#f5f0e9] dark:bg-[#1e1c18] hover:bg-[#ede5da] dark:hover:bg-[#27241f] p-6 transition-all duration-200 hover:shadow-xs hover:-translate-y-0.5 border-2 border-[#e6dfd6] dark:border-[#38322a] hover:border-accent/60 dark:hover:border-accent/60 shadow-xs',
          colSpan,
          className
        )}
      >
        <div>
          {/* Header Row: Icon & Notes Count Badge */}
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-white/90 dark:bg-[#28241e] text-accent shadow-xs border border-[#ded5c8] dark:border-[#3d372e]">
              <span className="material-symbols-outlined text-[22px]">
                {subject.icon}
              </span>
            </div>
            <span className="rounded-full bg-white/90 dark:bg-[#28241e] px-3 py-1 font-mono text-[12px] font-medium text-strong dark:text-[#ede8e1] shadow-xs border border-[#ded5c8] dark:border-[#3d372e]">
              {subject.notesCount} {subject.notesCount === 1 ? 'Note' : 'Notes'}
            </span>
          </div>

          {/* Title & Description */}
          <h3
            className={cn(
              'mt-4 text-[20px] sm:text-[22px] font-normal leading-snug tracking-tight text-strong dark:text-[#faf6f1] transition-colors',
              hoverAccentClass
            )}
          >
            <Link to={`/subjects/${subject.slug}`}>{subject.name}</Link>
          </h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#5c5957] dark:text-[#b8b2a8] line-clamp-2 font-normal">
            {subject.description}
          </p>
        </div>

        {/* Retained Featured Research Notes box */}
        {subject.featuredNotes && subject.featuredNotes.length > 0 && (
          <div className="mt-5 space-y-1.5 rounded-[14px] bg-white/70 dark:bg-[#161512] p-3.5 sm:p-4 border border-[#e2d8cb] dark:border-[#302c25] transition-colors group-hover:border-accent/30">
            <div className="font-mono text-[10.5px] text-muted dark:text-[#a8a29a] uppercase tracking-technical mb-2 font-medium">
              Featured Research Notes
            </div>
            {subject.featuredNotes.map((fn, idx) => (
              <React.Fragment key={fn.slug}>
                {idx > 0 && <div className="h-px w-full bg-[#ded6ca] dark:bg-[#27231d] my-1" />}
                <Link
                  to={`/notes/${fn.slug}`}
                  className="flex items-center justify-between py-1 text-strong dark:text-[#ede8e1] hover:text-accent dark:hover:text-accent transition-colors group/link font-sans"
                >
                  <span className="text-[13px] truncate">
                    {fn.title}
                  </span>
                  <span className="font-mono text-[11px] text-muted dark:text-[#9c958c] ml-2 shrink-0 group-hover/link:text-accent">
                    {fn.readTime}
                  </span>
                </Link>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Footer Link */}
        <div className="mt-5 pt-4 border-t border-[#ded5c8] dark:border-[#332f28] flex items-center justify-between font-mono text-[13px]">
          <span className="text-muted dark:text-[#a8a29a] text-[12px]">{subject.hubNumber}</span>
          <Link
            to={`/subjects/${subject.slug}`}
            style={{ color: '#ff3c00' }}
            className="inline-flex items-center gap-1.5 font-medium text-accent dark:text-accent hover:underline group-hover:translate-x-0.5 transition-transform"
          >
            <span>Explore Hub</span>
            <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:translate-x-1" style={{ color: '#ff3c00' }}>
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    );
  }

  // Directory Variant (Subjects Directory Page)
  return (
    <article
      className={cn(
        'subject-card group relative flex flex-col justify-between p-6 sm:p-7 bg-[#f5f0e9] dark:bg-[#1e1c18] hover:bg-[#ede5da] dark:hover:bg-[#27241f] border-2 border-[#e6dfd6] dark:border-[#38322a] hover:border-accent/60 dark:hover:border-accent/60 rounded-[20px] transition-all duration-200 hover:shadow-xs hover:-translate-y-0.5 shadow-xs',
        className
      )}
    >
      <div className="space-y-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-[10px] bg-white/90 dark:bg-[#28241e] border border-[#ded5c8] dark:border-[#3d372e] flex items-center justify-center text-accent shadow-xs shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[22px]">
                {subject.icon}
              </span>
            </div>
            <div>
              <span className="font-mono text-[11px] font-medium text-muted dark:text-[#a8a29a] uppercase tracking-technical block mb-1">
                {subject.hubNumber || 'DOMAIN HUB'}
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-normal leading-snug tracking-tight text-strong dark:text-[#faf6f1] group-hover:text-accent dark:group-hover:text-accent transition-colors">
                <Link to={`/subjects/${subject.slug}`}>{subject.name}</Link>
              </h2>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
            <span className="font-mono text-[12px] font-medium px-3 py-1 rounded-full bg-white/90 dark:bg-[#28241e] border border-[#ded5c8] dark:border-[#3d372e] text-strong dark:text-[#ede8e1] shadow-xs">
              {subject.notesCount} {subject.notesCount === 1 ? 'note' : 'notes'}
            </span>
            <span className="font-mono text-[12px] text-muted dark:text-[#a8a29a] hidden sm:inline">
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
        <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-[#5c5957] dark:text-[#b8b2a8] line-clamp-2 font-normal">
          {subject.description}
        </p>

        {/* Sub-topics Preview */}
        {subject.featuredTopics && subject.featuredTopics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {subject.featuredTopics.map((topic) => (
              <Link
                key={topic}
                to={`/topics/${topic}`}
                className="px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-[#28241e] border border-[#ded5c8] dark:border-[#3d372e] font-mono text-[11px] text-muted dark:text-[#b8b2a8] hover:border-accent dark:hover:border-accent hover:text-accent dark:hover:text-accent hover:bg-white dark:hover:bg-[#332e27] transition-colors"
              >
                #{topic}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer Meta Row */}
      <div className="mt-6 pt-5 border-t border-[#ded5c8] dark:border-[#332f28] flex items-center justify-between text-[13px] font-mono text-muted">
        <div className="flex items-center gap-2 text-muted dark:text-[#a8a29a] truncate max-w-[200px] sm:max-w-xs">
          <span className="material-symbols-outlined text-[15px] text-accent">
            history_edu
          </span>
          <span className="truncate">
            {subject.featuredNotes && subject.featuredNotes.length > 0 ? (
              <>
                <span className="text-muted dark:text-[#9c958c]">Latest:</span>{' '}
                <Link
                  to={`/notes/${subject.featuredNotes[0].slug}`}
                  className="text-strong dark:text-[#ede8e1] hover:text-accent dark:hover:text-accent hover:underline font-normal"
                >
                  {subject.featuredNotes[0].title}
                </Link>
              </>
            ) : (
              <span className="text-muted dark:text-[#9c958c]">No notes published yet</span>
            )}
          </span>
        </div>
        <Link
          to={`/subjects/${subject.slug}`}
          style={{ color: '#ff3c00' }}
          className="inline-flex items-center gap-1.5 font-mono text-[13px] font-medium text-accent dark:text-accent hover:underline group-hover:translate-x-0.5 transition-transform shrink-0 ml-2"
        >
          <span>Explore Hub</span>
          <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:translate-x-1" style={{ color: '#ff3c00' }}>
            arrow_forward
          </span>
        </Link>
      </div>
    </article>
  );
};
