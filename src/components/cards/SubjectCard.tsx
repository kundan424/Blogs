import React from 'react';
import { Link } from 'react-router-dom';
import { Subject } from '../../types';
import { cn } from '../../utils/cn';
import { PixelSymbol } from '../common/PixelSymbol';
import { EndpointCapsule } from '../common/EndpointCapsule';

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
  // Map subject slug or icon to appropriate pixel symbol
  const getSymbolVariant = (s: Subject) => {
    const slug = s.slug.toLowerCase();
    if (slug.includes('database') || slug.includes('storage') || slug.includes('data')) return 'database';
    if (slug.includes('distributed') || slug.includes('backend')) return 'network';
    if (slug.includes('cloud') || slug.includes('devops') || slug.includes('docker')) return 'container';
    if (slug.includes('system') || slug.includes('architecture')) return 'architecture';
    if (slug.includes('runtime') || slug.includes('java')) return 'runtime';
    if (slug.includes('typescript') || slug.includes('terminal')) return 'terminal';
    return 'workflow';
  };

  return (
    <article
      className={cn(
        'group relative flex flex-col justify-between bg-bright-white dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] rounded-[20px] p-4 sm:p-5 transition-all duration-300 shadow-xs hover:shadow-lg',
        'hover:border-[#161616] dark:hover:border-[#ffffff] hover:-translate-y-0.5',
        variant === 'bento' ? 'min-h-[220px]' : '',
        colSpan,
        className
      )}
    >
      <div>
        {/* Top Header: Pixel Symbol + Hub Capsule + Notes Count Pill */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#f7f7f7] dark:bg-[#2b2b2b] text-[#161616] dark:text-[#fafafa] border border-[#e0e0e0] dark:border-[#404040] shrink-0 group-hover:scale-105 group-hover:border-[#161616] dark:group-hover:border-[#ffffff] transition-all">
              <PixelSymbol variant={getSymbolVariant(subject)} size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <EndpointCapsule className="text-[9.5px] py-0.5 px-2">
                  {subject.hubNumber || 'DOMAIN HUB'}
                </EndpointCapsule>
              </div>
              <h3 className="mt-1 text-[17px] sm:text-[18.5px] font-medium leading-[1.2] tracking-[-0.015em] text-[#161616] dark:text-[#fafafa] group-hover:underline transition-colors">
                <Link to={`/subjects/${subject.slug}`}>{subject.name}</Link>
              </h3>
            </div>
          </div>

          <span className="rounded-full bg-[#f0f0f0] dark:bg-[#2b2b2b] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.02em] font-medium text-[#161616] dark:text-[#fafafa] border border-[#d9d9d9] dark:border-[#404040] shrink-0">
            {subject.notesCount} {subject.notesCount === 1 ? 'note' : 'notes'}
          </span>
        </div>

        {/* Narrative Description */}
        <p className="mt-2.5 text-[13px] leading-relaxed text-[#616161] dark:text-[#a3a3a3] line-clamp-2 font-sans">
          {subject.description}
        </p>

        {/* Featured Topics Micro-Pills */}
        {subject.featuredTopics && subject.featuredTopics.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1">
            {subject.featuredTopics.slice(0, 4).map((topic) => (
              <span
                key={topic}
                className="px-2 py-0.5 rounded-full bg-bright-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#303030] font-mono text-[9.5px] uppercase tracking-[0.02em] text-[#616161] dark:text-[#8f8f8f]"
              >
                #{topic}
              </span>
            ))}
          </div>
        )}

        {/* Featured Research Notes in Recessed Cell */}
        {subject.featuredNotes && subject.featuredNotes.length > 0 && (
          <div className="mt-3.5 space-y-1.5 rounded-[14px] bg-[#f7f7f7] dark:bg-[#1a1a1a] p-2.5 sm:p-3 border border-[#e5e5e5] dark:border-[#2e2e2e]">
            <div className="flex items-center justify-between pb-1 border-b border-[#e5e5e5] dark:border-[#2e2e2e]">
              <span className="font-mono text-[9.5px] text-[#8f8f8f] uppercase tracking-[0.02em] flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#161616] dark:bg-[#fafafa]" />
                Curated Deep Dives ({subject.featuredNotes.length})
              </span>
              <span className="font-mono text-[9px] text-[#161616] dark:text-[#fafafa] uppercase tracking-[0.02em] font-medium">
                Verified
              </span>
            </div>

            <div className="space-y-1 pt-0.5">
              {subject.featuredNotes.map((fn, idx) => (
                <Link
                  key={fn.slug}
                  to={`/notes/${fn.slug}`}
                  className="group/item flex items-center justify-between py-0.5 px-1 rounded-[6px] hover:bg-bright-white dark:hover:bg-[#242424] text-[#161616] dark:text-[#fafafa] transition-colors font-sans"
                >
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <span className="font-mono text-[9.5px] text-[#161616] dark:text-[#fafafa] font-medium shrink-0">
                      0{idx + 1}.
                    </span>
                    <span className="text-[12px] font-normal truncate group-hover/item:underline transition-colors">
                      {fn.title}
                    </span>
                  </div>
                  <span className="font-mono text-[9.5px] text-[#8f8f8f] shrink-0">
                    {fn.readTime}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Link & Action Button */}
      <div className="mt-4 pt-3 border-t border-[#e5e5e5] dark:border-[#303030] flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.02em]">
        <span className="text-[#8f8f8f] text-[10.5px]">
          {subject.updatedDaysAgo === 0
            ? 'Updated today'
            : subject.updatedDaysAgo === 1
            ? 'Updated 1d ago'
            : `Updated ${subject.updatedDaysAgo}d ago`}
        </span>
        <Link
          to={`/subjects/${subject.slug}`}
          className="btn-primary h-[32px] px-3 text-[11px] flex items-center gap-1.5 group-hover:translate-x-0.5 transition-all shadow-2xs"
        >
          <span>Explore Hub</span>
          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
        </Link>
      </div>
    </article>
  );
};
