import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnrichedLearningPath } from '../../utils/learningPathLoader';
import { cn } from '../../utils/cn';
import { PixelSymbol } from '../common/PixelSymbol';
import { EndpointCapsule } from '../common/EndpointCapsule';

interface CuratedPathCardProps {
  path: EnrichedLearningPath;
  index: number;
  className?: string;
  compact?: boolean;
}

export const CuratedPathCard: React.FC<CuratedPathCardProps> = ({
  path,
  index,
  className,
  compact = false,
}) => {
  const navigate = useNavigate();
  const pathUrl = `/learning-paths/${path.slug}`;

  const getSymbolVariant = (p: EnrichedLearningPath) => {
    const slug = p.slug.toLowerCase();
    if (slug.includes('database') || slug.includes('storage')) return 'database';
    if (slug.includes('microservices') || slug.includes('distributed')) return 'network';
    if (slug.includes('docker') || slug.includes('container')) return 'container';
    if (slug.includes('system-design')) return 'architecture';
    if (slug.includes('spring') || slug.includes('java')) return 'runtime';
    return 'workflow';
  };

  return (
    <article
      onClick={() => navigate(pathUrl)}
      className={cn(
        // Solid bright white surface with subtle monochrome base
        'group relative flex flex-col justify-between rounded-[22px]',
        'bg-white dark:bg-[#212121]',
        'bg-gradient-to-b from-[#ffffff] via-[#ffffff] to-[#f5f5f5] dark:from-[#212121] dark:via-[#212121] dark:to-[#1a1a1a]',
        'border border-[#d9d9d9] dark:border-[#333333]',
        'transition-all duration-200 cursor-pointer overflow-hidden',
        compact ? 'p-4 sm:p-5' : 'p-6 sm:p-7 rounded-[24px]',
        'hover:border-[#161616] dark:hover:border-[#ffffff] hover:-translate-y-0.5',
        'shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.4)]',
        className
      )}
    >
      {/* Absolute Stretched Link */}
      <Link
        to={pathUrl}
        className={cn(
          "absolute inset-0 z-0 focus:outline-hidden focus:ring-1 focus:ring-[#161616] dark:focus:ring-[#ffffff]",
          compact ? "rounded-[22px]" : "rounded-[24px]"
        )}
        aria-label={`Open curriculum roadmap for ${path.title}`}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Subtle Monochrome Base Wash */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/[0.03] via-black/[0.01] to-transparent dark:from-white/[0.04] dark:via-white/[0.01] to-transparent pointer-events-none" />

      {/* Monochrome Base Bottom Edge Line */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#161616]/30 to-transparent dark:via-white/40 pointer-events-none" />

      <div className={cn("relative z-10", compact ? "space-y-3" : "space-y-4")}>
        {/* Top Header Row: Roadmap Track Pill + Level Badge + Phases count */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <EndpointCapsule className={cn(compact ? "text-[10px] py-0.5 px-2.5" : "text-[11px] py-0.5 px-3")}>
              ROADMAP {String(index + 1).padStart(2, '0')}
            </EndpointCapsule>
            <span className="font-mono text-[10.5px] text-[#616161] dark:text-[#8f8f8f] uppercase tracking-[0.02em] hidden sm:inline">
              {path.level || 'Production Scale'}
            </span>
          </div>

          <span className="font-mono text-[10px] text-[#616161] dark:text-[#8f8f8f] bg-[#f0f0f0] dark:bg-[#303030] px-2 py-0.5 rounded-full border border-[#d9d9d9] dark:border-[#474747] uppercase tracking-[0.02em] shrink-0">
            {path.modules.length} {path.modules.length === 1 ? 'Phase' : 'Phases'}
          </span>
        </div>

        {/* Title & Icon Lockup */}
        <div className="flex items-start gap-3">
          <div className={cn(
            "rounded-[14px] bg-[#f7f7f7] dark:bg-[#2b2b2b] border border-[#d9d9d9] dark:border-[#474747] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs",
            compact ? "w-10 h-10" : "w-12 h-12 rounded-[16px]"
          )}>
            <PixelSymbol variant={getSymbolVariant(path)} size={compact ? 22 : 28} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={cn(
              "font-medium text-[#161616] dark:text-[#fafafa] leading-[1.25] tracking-[-0.01em] group-hover:underline transition-colors line-clamp-1",
              compact ? "text-[16px] sm:text-[17px]" : "text-[19px] sm:text-[21px]"
            )}>
              <Link
                to={pathUrl}
                className="focus:outline-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {path.title}
              </Link>
            </h3>
            <span className="font-mono text-[10.5px] text-[#8f8f8f] mt-0.5 block uppercase tracking-[0.02em]">
              {path.totalLessons} Lessons • {path.publishedLessons} Available
            </span>
          </div>
        </div>

        {/* Narrative Description */}
        <p className={cn(
          "text-[#616161] dark:text-[#a3a3a3] line-clamp-2 font-sans",
          compact ? "text-[12px] sm:text-[12.5px] leading-snug" : "text-[14px] leading-[1.35]"
        )}>
          {path.description}
        </p>

        {/* Minimal Modular Curriculum Outline */}
        <div className={cn(
          "rounded-[14px] bg-[#fafafa] dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#303030] font-mono uppercase tracking-[0.02em]",
          compact ? "p-2 sm:p-2.5 space-y-1.5" : "p-3 space-y-2 rounded-[16px]"
        )}>
          <div className="text-[9.5px] sm:text-[10px] text-[#8f8f8f] font-medium flex items-center justify-between pb-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#161616] dark:bg-[#fafafa]" />
              <span>CURRICULUM PHASES</span>
            </span>
            <span className="text-[#161616] dark:text-[#fafafa] font-semibold">{path.modules.length} MODULES</span>
          </div>

          {/* Minimal Modular Chips / Pills */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            {path.modules.slice(0, 3).map((mod) => {
              const cleanTitle = mod.title.replace(/^(Phase\s*\d+:|Module\s*\d+:|\d+\.\s*)/i, '').trim();
              return (
                <span
                  key={mod.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] bg-white dark:bg-[#262626] border border-[#e2e2e2] dark:border-[#363636] text-[#161616] dark:text-[#fafafa] truncate max-w-[130px]"
                  title={mod.title}
                >
                  <span className="text-[#161616] dark:text-[#fafafa] font-bold">{mod.number}</span>
                  <span className="truncate">{cleanTitle}</span>
                </span>
              );
            })}
            {path.modules.length > 3 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-[6px] text-[9.5px] bg-[#f0f0f0] dark:bg-[#2b2b2b] text-[#8f8f8f] border border-[#e2e2e2] dark:border-[#363636]">
                +{path.modules.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Progress Bar + Open Roadmap Button */}
      <div className={cn(
        "relative z-10 border-t border-[#e8e8e8] dark:border-[#333333]",
        compact ? "mt-3 pt-2.5 space-y-2" : "mt-5 pt-3.5 space-y-3"
      )}>
        {/* Progress Bar Monochrome */}
        <div className="space-y-1">
          <div className="flex items-center justify-between font-mono text-[10px] text-[#8f8f8f] uppercase tracking-[0.02em]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#161616] dark:bg-[#fafafa]" />
              <span>{path.publishedLessons} of {path.totalLessons} published</span>
            </span>
            <span className="font-semibold text-[#161616] dark:text-[#fafafa]">
              {path.progressPercentage}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#ebebeb] dark:bg-[#303030] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#161616] dark:bg-[#ffffff] transition-all duration-500"
              style={{ width: `${Math.max(6, path.progressPercentage)}%` }}
            />
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.02em] text-[#8f8f8f] flex items-center gap-1">
            <span>Structured Path</span>
          </span>

          <span className={cn(
            "btn-primary",
            compact ? "h-[30px] px-3 text-[11px]" : "h-[34px] px-3.5 text-[12px]"
          )}>
            <span>Explore</span>
            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </article>
  );
};
