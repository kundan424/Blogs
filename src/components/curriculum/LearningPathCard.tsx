import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnrichedLearningPath } from '../../utils/learningPathLoader';
import { cn } from '../../utils/cn';
import { PixelSymbol } from '../common/PixelSymbol';
import { EndpointCapsule } from '../common/EndpointCapsule';

interface LearningPathCardProps {
  path: EnrichedLearningPath;
  defaultExpandedModuleIndex?: number;
  className?: string;
}

export const LearningPathCard: React.FC<LearningPathCardProps> = ({
  path,
  defaultExpandedModuleIndex = -1,
  className,
}) => {
  // Track open state for each module accordion. Default: all open (-1) for immediate discoverability
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    path.modules.forEach((mod, idx) => {
      initialState[mod.id] =
        defaultExpandedModuleIndex === -1 ? true : idx === defaultExpandedModuleIndex;
    });
    return initialState;
  });

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

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
      id={path.slug}
      className={cn(
        'relative flex flex-col p-6 sm:p-8 rounded-[24px] bg-white dark:bg-[#212121] bg-gradient-to-b from-[#ffffff] via-[#ffffff] to-[#f5f5f5] dark:from-[#212121] dark:via-[#212121] dark:to-[#1a1a1a] border border-[#d9d9d9] dark:border-[#333333] transition-all duration-200 overflow-hidden shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.4)]',
        className
      )}
    >
      {/* Subtle Monochrome Base Wash */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/[0.03] via-black/[0.01] to-transparent dark:from-white/[0.04] dark:via-white/[0.01] to-transparent pointer-events-none" />

      {/* Monochrome Base Bottom Edge Line */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#161616]/30 to-transparent dark:via-white/40 pointer-events-none" />

      {/* =====================================================================
          PATH HEADER: ICON, TITLE, LEVEL & PROGRESS
          ===================================================================== */}
      <div className="relative z-10 pb-6 border-b border-[#d9d9d9] dark:border-[#333333]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#f0f0f0] dark:bg-[#303030] text-[#161616] dark:text-[#fafafa] border border-[#d9d9d9] dark:border-[#474747] shrink-0">
              <PixelSymbol variant={getSymbolVariant(path)} size={32} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <EndpointCapsule className="text-[11px] py-0.5 px-3">
                  CURATED LEARNING PATH
                </EndpointCapsule>
                <span className="text-[#8f8f8f] text-[10px]">•</span>
                <span className="font-mono text-[11px] text-[#8f8f8f] uppercase tracking-[0.02em]">
                  {path.level || 'Production Scale'}
                </span>
              </div>
              <h3 className="text-[22px] sm:text-[24px] font-medium text-[#161616] dark:text-[#fafafa] leading-tight tracking-[-0.01em] mt-1">
                {path.title}
              </h3>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[12px] uppercase tracking-[0.02em]">
            <span className="px-3 py-1 rounded-full bg-[#f0f0f0] dark:bg-[#303030] border border-[#d9d9d9] dark:border-[#474747] text-[#616161] dark:text-[#a3a3a3]">
              {path.modules.length} {path.modules.length === 1 ? 'Module' : 'Modules'}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#f0f0f0] dark:bg-[#303030] border border-[#d9d9d9] dark:border-[#474747] text-[#616161] dark:text-[#a3a3a3]">
              {path.totalLessons} Lessons
            </span>
          </div>
        </div>

        {/* Path Description */}
        <p className="mt-3.5 text-[14px] sm:text-[15px] text-[#616161] dark:text-[#a3a3a3] leading-[1.35] font-sans">
          {path.description}
        </p>

        {/* Linear Progress Bar Monochrome */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[11.5px] font-mono uppercase tracking-[0.02em] text-[#8f8f8f]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#161616] dark:bg-[#fafafa]" />
              <span>
                Roadmap Progress: {path.publishedLessons} of {path.totalLessons} Lessons Published
              </span>
            </span>
            <span className="font-medium text-[#161616] dark:text-[#fafafa]">
              {path.progressPercentage}% Complete
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#f0f0f0] dark:bg-[#303030] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#161616] dark:bg-[#ffffff] transition-all duration-500"
              style={{ width: `${Math.max(4, path.progressPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* =====================================================================
          PATH MODULES ACCORDION LIST
          ===================================================================== */}
      <div className="relative z-10 mt-6 space-y-4">
        {path.modules.map((module) => {
          const isOpen = Boolean(openModules[module.id]);
          const publishedCount = module.lessons.filter(
            (l) => l.status === 'published'
          ).length;

          return (
            <div
              key={module.id}
              className="rounded-[16px] border border-[#d9d9d9] dark:border-[#333333] bg-bright-white dark:bg-[#1c1c1c] overflow-hidden transition-all"
            >
              {/* Module Header Bar (Accordion Trigger) */}
              <button
                type="button"
                onClick={() => toggleModule(module.id)}
                className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 bg-[#f0f0f0] dark:bg-[#262626] hover:bg-[#e6e6e6] dark:hover:bg-[#303030] transition-colors text-left cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#212121] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#212121] font-mono text-[11px] uppercase tracking-[0.02em] font-medium shrink-0">
                    MODULE {module.number}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-sans text-[15px] sm:text-[16px] font-medium text-[#161616] dark:text-[#fafafa] truncate">
                      {module.title}
                    </h4>
                    {module.description && (
                      <p className="text-[12px] text-[#8f8f8f] truncate hidden sm:block">
                        {module.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f]">
                    {publishedCount}/{module.lessons.length} published
                  </span>
                  <span
                    className={cn(
                      'material-symbols-outlined text-[18px] text-[#8f8f8f] transition-transform duration-200',
                      isOpen && 'rotate-180'
                    )}
                  >
                    expand_more
                  </span>
                </div>
              </button>

              {/* Module Lessons Content */}
              {isOpen && (
                <div className="divide-y divide-[#d9d9d9] dark:divide-[#303030] px-3 sm:px-5 py-1">
                  {module.lessons.map((lesson) => {
                    const isPublished = lesson.status === 'published';

                    return (
                      <div
                        key={lesson.id}
                        className={cn(
                          'py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors rounded-[8px] px-2',
                          isPublished && 'hover:bg-[#f0f0f0] dark:hover:bg-[#262626]'
                        )}
                      >
                        {/* Left: Lesson Number + Title + Description */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11.5px] font-medium text-[#161616] dark:text-[#fafafa] bg-[#f0f0f0] dark:bg-[#303030] px-2 py-0.5 rounded-full border border-[#d9d9d9] dark:border-[#474747]">
                              {lesson.number}
                            </span>

                            {isPublished ? (
                              <Link
                                to={`/notes/${lesson.noteSlug}`}
                                className="font-sans text-[14.5px] font-medium text-[#161616] dark:text-[#fafafa] hover:underline transition-colors"
                              >
                                {lesson.title}
                              </Link>
                            ) : (
                              <span className="font-sans text-[14.5px] font-normal text-[#8f8f8f]">
                                {lesson.title}
                              </span>
                            )}

                            {/* Status Badge */}
                            {isPublished ? (
                              <span className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.02em] text-[#161616] dark:text-[#fafafa] bg-[#161616]/10 dark:bg-white/10 border border-[#161616]/20 dark:border-white/20 px-2 py-0.5 rounded-full font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#161616] dark:bg-[#fafafa]" />
                                <span>Published</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.02em] text-[#8f8f8f] bg-[#f0f0f0] dark:bg-[#303030] border border-[#d9d9d9] dark:border-[#474747] px-2 py-0.5 rounded-full">
                                <span>Upcoming</span>
                              </span>
                            )}
                          </div>

                          {/* Lesson Summary Description */}
                          {lesson.description && (
                            <p className="text-[12.5px] text-[#616161] dark:text-[#8f8f8f] leading-relaxed pl-7">
                              {lesson.description}
                            </p>
                          )}
                        </div>

                        {/* Right Action: Button or Reading Time */}
                        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center pl-7 sm:pl-0">
                          {isPublished ? (
                            <div className="flex items-center gap-2">
                              {lesson.readTime && (
                                <span className="font-mono text-[11px] text-[#8f8f8f] hidden md:inline">
                                  {lesson.readTime}
                                </span>
                              )}
                              <Link
                                to={`/notes/${lesson.noteSlug}`}
                                className="btn-primary h-8 px-3 text-[12px] gap-1 shadow-xs"
                              >
                                <span>Read Note</span>
                                <span className="material-symbols-outlined text-[13px]">
                                  arrow_forward
                                </span>
                              </Link>
                            </div>
                          ) : (
                            <span className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] px-2.5 py-1 rounded-full bg-[#f0f0f0] dark:bg-[#303030] border border-[#d9d9d9] dark:border-[#474747]">
                              Scheduled
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
};
