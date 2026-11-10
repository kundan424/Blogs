import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnrichedLearningPath } from '../../utils/learningPathLoader';
import { cn } from '../../utils/cn';

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

  return (
    <article
      id={path.slug}
      className={cn(
        'catalog-card relative flex flex-col p-6 sm:p-7 transition-all duration-200 border border-edge/80 shadow-catalog-edge',
        className
      )}
    >
      {/* =====================================================================
          PATH HEADER: ICON, TITLE, LEVEL & PROGRESS
          ===================================================================== */}
      <div className="pb-6 border-b border-edge/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-navy text-white shadow-primary-btn shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                {path.icon || 'school'}
              </span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10.5px] font-semibold text-proof-green uppercase tracking-wider">
                  CURATED LEARNING PATH
                </span>
                <span className="text-muted-ink text-[10px]">•</span>
                <span className="font-mono text-[10.5px] text-muted-ink uppercase tracking-wider">
                  {path.level || 'Production Scale'}
                </span>
              </div>
              <h3 className="text-[22px] sm:text-[24px] font-semibold text-navy dark:text-white leading-tight tracking-tight mt-0.5">
                {path.title}
              </h3>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[12px]">
            <span className="px-2.5 py-1 rounded-[6px] bg-panel dark:bg-panel/60 border border-edge text-secondary-ink dark:text-muted-ink">
              {path.modules.length} {path.modules.length === 1 ? 'Module' : 'Modules'}
            </span>
            <span className="px-2.5 py-1 rounded-[6px] bg-panel dark:bg-panel/60 border border-edge text-secondary-ink dark:text-muted-ink">
              {path.totalLessons} Lessons
            </span>
          </div>
        </div>

        {/* Path Description */}
        <p className="mt-3.5 text-[14px] sm:text-[14.5px] text-secondary-ink dark:text-body-ink leading-relaxed">
          {path.description}
        </p>

        {/* Linear Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[11.5px] font-mono text-muted-ink">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-proof-green" />
              <span>
                Roadmap Progress: {path.publishedLessons} of {path.totalLessons} Lessons Published
              </span>
            </span>
            <span className="font-medium text-navy dark:text-ice">
              {path.progressPercentage}% Complete
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-edge/60 dark:bg-panel overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-banner-start via-dot-blue to-proof-green transition-all duration-500"
              style={{ width: `${Math.max(4, path.progressPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* =====================================================================
          PATH MODULES ACCORDION LIST
          ===================================================================== */}
      <div className="mt-6 space-y-4">
        {path.modules.map((module) => {
          const isOpen = Boolean(openModules[module.id]);
          const publishedCount = module.lessons.filter(
            (l) => l.status === 'published'
          ).length;

          return (
            <div
              key={module.id}
              className="rounded-[8px] border border-edge/80 dark:border-edge/40 bg-white/70 dark:bg-panel/40 overflow-hidden shadow-2xs transition-all"
            >
              {/* Module Header Bar (Accordion Trigger) */}
              <button
                type="button"
                onClick={() => toggleModule(module.id)}
                className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 bg-panel/40 dark:bg-panel/80 hover:bg-panel/70 dark:hover:bg-panel transition-colors text-left cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2 py-0.5 rounded-[4px] bg-navy text-white dark:bg-white dark:text-navy font-mono text-[11px] font-semibold shrink-0">
                    MODULE {module.number}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-sans text-[15px] sm:text-[16px] font-semibold text-navy dark:text-white truncate">
                      {module.title}
                    </h4>
                    {module.description && (
                      <p className="text-[12px] text-muted-ink truncate hidden sm:block">
                        {module.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[11px] text-muted-ink">
                    {publishedCount}/{module.lessons.length} published
                  </span>
                  <span
                    className={cn(
                      'material-symbols-outlined text-[18px] text-muted-ink transition-transform duration-200',
                      isOpen && 'rotate-180'
                    )}
                  >
                    expand_more
                  </span>
                </div>
              </button>

              {/* Module Lessons Content */}
              {isOpen && (
                <div className="divide-y divide-edge/60 dark:divide-edge/30 px-3 sm:px-5 py-1">
                  {module.lessons.map((lesson) => {
                    const isPublished = lesson.status === 'published';

                    return (
                      <div
                        key={lesson.id}
                        className={cn(
                          'py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors rounded-[6px] px-2',
                          isPublished && 'hover:bg-navy/[0.02] dark:hover:bg-white/[0.02]'
                        )}
                      >
                        {/* Left: Lesson Number + Title + Description */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11.5px] font-semibold text-navy dark:text-ice bg-panel px-1.5 py-0.5 rounded">
                              {lesson.number}
                            </span>

                            {isPublished ? (
                              <Link
                                to={`/notes/${lesson.noteSlug}`}
                                className="font-sans text-[14.5px] font-medium text-navy dark:text-white hover:text-dot-blue dark:hover:text-ice transition-colors hover:underline"
                              >
                                {lesson.title}
                              </Link>
                            ) : (
                              <span className="font-sans text-[14.5px] font-normal text-secondary-ink/80 dark:text-muted-ink">
                                {lesson.title}
                              </span>
                            )}

                            {/* Status Badge */}
                            {isPublished ? (
                              <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-proof-green bg-proof-green/10 border border-proof-green/20 px-2 py-0.5 rounded-[4px] font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-proof-green" />
                                <span>Published</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-muted-ink bg-panel border border-edge/80 px-2 py-0.5 rounded-[4px]">
                                <span>Upcoming in roadmap</span>
                              </span>
                            )}
                          </div>

                          {/* Lesson Summary Description */}
                          {lesson.description && (
                            <p className="text-[12.5px] text-secondary-ink dark:text-muted-ink leading-relaxed pl-7">
                              {lesson.description}
                            </p>
                          )}
                        </div>

                        {/* Right Action: Button or Reading Time */}
                        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center pl-7 sm:pl-0">
                          {isPublished ? (
                            <div className="flex items-center gap-2">
                              {lesson.readTime && (
                                <span className="font-mono text-[11px] text-muted-ink hidden md:inline">
                                  {lesson.readTime}
                                </span>
                              )}
                              <Link
                                to={`/notes/${lesson.noteSlug}`}
                                className="btn-primary h-8 px-3 text-[12.5px] gap-1.5 shadow-2xs hover:shadow-xs"
                              >
                                <span>Read Note</span>
                                <span className="material-symbols-outlined text-[13px]">
                                  arrow_forward
                                </span>
                              </Link>
                            </div>
                          ) : (
                            <span className="font-mono text-[11px] text-muted-ink/70 px-2.5 py-1 rounded bg-panel/50 border border-edge/40">
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
