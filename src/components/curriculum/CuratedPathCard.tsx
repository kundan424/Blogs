import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnrichedLearningPath } from '../../utils/learningPathLoader';
import { cn } from '../../utils/cn';

interface CuratedPathCardProps {
  path: EnrichedLearningPath;
  index: number;
  className?: string;
}

interface ThemeConfig {
  bgGradient: string;
  borderColor: string;
  hoverBorder: string;
  hoverShadow: string;
  iconGradient: string;
  badgeBg: string;
  progressBarGradient: string;
  btnBg: string;
  accentText: string;
}

const THEMES: Record<string, ThemeConfig> = {
  // 1. Spring Boot (Indigo / Periwinkle theme)
  'spring-boot-production-mastery': {
    bgGradient:
      'bg-gradient-to-br from-[#f0f3ff] via-[#f7f9ff] to-[#ffffff] dark:from-[#11162b] dark:via-[#141829] dark:to-[#0c0f17]',
    borderColor: 'border-[#c7d2fe] dark:border-[#273256]',
    hoverBorder: 'hover:border-[#3e5199] dark:hover:border-[#6366f1]',
    hoverShadow: 'hover:shadow-[0_12px_28px_rgba(62,81,153,0.12)]',
    iconGradient: 'bg-gradient-to-br from-[#3e5199] to-[#5568ad]',
    badgeBg:
      'bg-[#3e5199]/10 text-[#3e5199] dark:text-[#a5b4fc] border-[#3e5199]/20',
    progressBarGradient: 'from-[#3e5199] via-[#5568ad] to-[#818cf8]',
    btnBg: 'bg-[#111a4a] text-white hover:bg-[#1f2963]',
    accentText: 'text-[#3e5199] dark:text-[#a5b4fc]',
  },
  // 2. Microservices (Teal / Proof Green theme)
  'production-microservices-distributed-architecture': {
    bgGradient:
      'bg-gradient-to-br from-[#ecfdf5] via-[#f2faf7] to-[#ffffff] dark:from-[#0a1f1d] dark:via-[#0e2421] dark:to-[#0c0f17]',
    borderColor: 'border-[#a7f3d0] dark:border-[#1b3d39]',
    hoverBorder: 'hover:border-[#167e6c] dark:hover:border-[#2dd4bf]',
    hoverShadow: 'hover:shadow-[0_12px_28px_rgba(22,126,108,0.14)]',
    iconGradient: 'bg-gradient-to-br from-[#167e6c] to-[#0d9488]',
    badgeBg:
      'bg-[#167e6c]/10 text-[#167e6c] dark:text-[#6ee7b7] border-[#167e6c]/20',
    progressBarGradient: 'from-[#167e6c] via-[#0d9488] to-[#2dd4bf]',
    btnBg: 'bg-[#167e6c] text-white hover:bg-[#126859]',
    accentText: 'text-[#167e6c] dark:text-[#6ee7b7]',
  },
  // 3. Java Core & OOP (Customer Ember / Amber theme)
  'java-core-oop-deep-dives': {
    bgGradient:
      'bg-gradient-to-br from-[#fff7ed] via-[#fefaf6] to-[#ffffff] dark:from-[#211510] dark:via-[#221813] dark:to-[#0c0f17]',
    borderColor: 'border-[#fed7aa] dark:border-[#3d291e]',
    hoverBorder: 'hover:border-[#ec652b] dark:hover:border-[#fb923c]',
    hoverShadow: 'hover:shadow-[0_12px_28px_rgba(236,101,43,0.12)]',
    iconGradient: 'bg-gradient-to-br from-[#ec652b] to-[#f97316]',
    badgeBg:
      'bg-[#ec652b]/10 text-[#ec652b] dark:text-[#fdba74] border-[#ec652b]/20',
    progressBarGradient: 'from-[#ec652b] via-[#f97316] to-[#fbbf24]',
    btnBg: 'bg-[#ec652b] text-white hover:bg-[#d4541e]',
    accentText: 'text-[#ec652b] dark:text-[#fdba74]',
  },
  // 4. Docker / Container (Dot Blue / Cyan theme)
  'docker-container-runtime-mastery': {
    bgGradient:
      'bg-gradient-to-br from-[#f0f9ff] via-[#f5fbff] to-[#ffffff] dark:from-[#0f1d2e] dark:via-[#112033] dark:to-[#0c0f17]',
    borderColor: 'border-[#bae6fd] dark:border-[#1e3a5f]',
    hoverBorder: 'hover:border-[#4575cd] dark:hover:border-[#38bdf8]',
    hoverShadow: 'hover:shadow-[0_12px_28px_rgba(69,117,205,0.14)]',
    iconGradient: 'bg-gradient-to-br from-[#4575cd] to-[#38bdf8]',
    badgeBg:
      'bg-[#4575cd]/10 text-[#4575cd] dark:text-[#7dd3fc] border-[#4575cd]/20',
    progressBarGradient: 'from-[#4575cd] via-[#0284c7] to-[#38bdf8]',
    btnBg: 'bg-[#4575cd] text-white hover:bg-[#3462b5]',
    accentText: 'text-[#4575cd] dark:text-[#7dd3fc]',
  },
};

const DEFAULT_THEME: ThemeConfig = {
  bgGradient:
    'bg-gradient-to-br from-[#f6f6f8] to-[#ffffff] dark:from-[#141824] dark:to-[#0c0f17]',
  borderColor: 'border-edge',
  hoverBorder: 'hover:border-navy dark:hover:border-ice',
  hoverShadow: 'hover:shadow-md',
  iconGradient: 'bg-navy text-white',
  badgeBg: 'bg-panel text-secondary-ink border-edge',
  progressBarGradient: 'from-banner-start via-dot-blue to-proof-green',
  btnBg: 'btn-primary',
  accentText: 'text-navy dark:text-white',
};

export const CuratedPathCard: React.FC<CuratedPathCardProps> = ({
  path,
  index,
  className,
}) => {
  const navigate = useNavigate();
  const theme = THEMES[path.slug] || DEFAULT_THEME;
  const pathUrl = `/learning-paths/${path.slug}`;

  return (
    <article
      onClick={() => navigate(pathUrl)}
      className={cn(
        'group relative flex flex-col justify-between p-6 sm:p-7 rounded-[12px] border transition-all duration-300 cursor-pointer overflow-hidden shadow-2xs',
        theme.bgGradient,
        theme.borderColor,
        theme.hoverBorder,
        theme.hoverShadow,
        'hover:-translate-y-1',
        className
      )}
    >
      {/* Absolute Stretched Link for accessibility & keyboard navigation */}
      <Link
        to={pathUrl}
        className="absolute inset-0 z-0 rounded-[12px] focus:outline-hidden focus:ring-2 focus:ring-focus-blue"
        aria-label={`Open curriculum roadmap for ${path.title}`}
        onClick={(e) => e.stopPropagation()}
      />

      <div className="relative z-10 space-y-5">
        {/* Top Header Row: Roadmap Track Pill + Level Badge */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'px-2.5 py-1 rounded-[6px] font-mono text-[11px] font-semibold uppercase tracking-wider border',
                theme.badgeBg
              )}
            >
              ROADMAP {String(index + 1).padStart(2, '0')}
            </span>
            <span className="font-mono text-[11px] text-muted-ink uppercase tracking-wider">
              {path.level || 'Production Scale'}
            </span>
          </div>

          <span className="font-mono text-[11px] text-muted-ink bg-white/70 dark:bg-panel/70 px-2 py-0.5 rounded-[4px] border border-edge/60">
            {path.estimatedDuration || `${path.modules.length} Modules`}
          </span>
        </div>

        {/* Title & Icon Lockup */}
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              'w-11 h-11 rounded-[8px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs',
              theme.iconGradient
            )}
          >
            <span className="material-symbols-outlined text-[22px] text-white">
              {path.icon || 'schema'}
            </span>
          </div>
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-semibold text-navy dark:text-white leading-tight tracking-tight group-hover:text-dot-blue dark:group-hover:text-ice transition-colors">
              <Link
                to={pathUrl}
                className="focus:outline-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {path.title}
              </Link>
            </h3>
            <span className="font-mono text-[11.5px] text-muted-ink mt-0.5 block">
              {path.totalLessons} Lessons • {path.publishedLessons} Available Now
            </span>
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-[13.5px] sm:text-[14px] text-secondary-ink dark:text-body-ink leading-relaxed line-clamp-2">
          {path.description}
        </p>

        {/* Module Outline Roadmap Preview */}
        <div className="p-3 rounded-[8px] bg-white/60 dark:bg-panel/50 border border-edge/60 space-y-2 font-mono text-[11.5px]">
          <div className="text-[10.5px] uppercase tracking-wider text-muted-ink font-semibold flex items-center justify-between pb-1 border-b border-edge/40">
            <span>CURRICULUM MODULES</span>
            <span className="flex items-center gap-1.5">
              <span>{path.modules.length} Modules</span>
              {path.modules.length > 5 && (
                <span className="text-[9.5px] text-muted-ink/80 font-normal lowercase">(scroll)</span>
              )}
            </span>
          </div>
          <div
            className="max-h-[145px] overflow-y-auto custom-scrollbar pr-1.5 space-y-1.5 focus:outline-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {path.modules.map((mod) => (
              <div
                key={mod.id}
                className="flex items-center justify-between text-body-ink dark:text-muted-ink hover:text-navy dark:hover:text-white transition-colors truncate py-0.5"
              >
                <span className="truncate pr-2">
                  <span className={cn('font-semibold mr-1.5', theme.accentText)}>
                    {mod.number}.
                  </span>
                  {mod.title}
                </span>
                <span className="text-muted-ink shrink-0 text-[10.5px]">
                  {mod.lessons.length} {mod.lessons.length === 1 ? 'lesson' : 'lessons'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer: Progress Bar + Open Roadmap Button */}
      <div className="relative z-10 mt-6 pt-4 border-t border-edge/60 dark:border-edge/30 space-y-3">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between font-mono text-[11px] text-muted-ink">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-proof-green" />
              <span>{path.publishedLessons} of {path.totalLessons} lessons published</span>
            </span>
            <span className="font-medium text-navy dark:text-white">
              {path.progressPercentage}% Complete
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                theme.progressBarGradient
              )}
              style={{ width: `${Math.max(4, path.progressPercentage)}%` }}
            />
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-mono text-[12px] text-muted-ink flex items-center gap-1">
            <span>Structured Path</span>
          </span>

          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] font-sans text-[13px] font-medium transition-all shadow-2xs group-hover:shadow-xs',
              theme.btnBg
            )}
          >
            <span>Explore Roadmap</span>
            <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </span>
        </div>
      </div>
    </article>
  );
};
