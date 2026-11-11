import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLearningPathBySlug, getLearningPathsBySubject } from '../utils/learningPathLoader';
import { getSubjectBySlug } from '../utils/contentLoader';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { cn } from '../utils/cn';

export const LearningPathDetailPage: React.FC = () => {
  const { pathSlug } = useParams<{ pathSlug: string }>();
  const navigate = useNavigate();

  // Track open/collapsed state of each module. By default all are collapsed (empty object)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [milestonesExpanded, setMilestonesExpanded] = useState(false);

  // Dynamic height synchronization with right-side cards
  const modulesScrollContainerRef = useRef<HTMLDivElement>(null);
  const rightAsideRef = useRef<HTMLDivElement>(null);
  const [asideHeight, setAsideHeight] = useState<number | undefined>(undefined);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const setAllExpanded = (expand: boolean) => {
    if (!learningPath) return;
    const next: Record<string, boolean> = {};
    learningPath.modules.forEach((m) => {
      next[m.id] = expand;
    });
    setExpandedModules(next);
  };

  const handleJumpToModule = (moduleId: string, moduleNumber: string) => {
    // Automatically expand the module so its articles are visible
    setExpandedModules((prev) => ({ ...prev, [moduleId]: true }));
    // Smooth scroll inside the scrollable container to that module
    setTimeout(() => {
      const el = document.getElementById(`module-${moduleNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 60);
  };

  const learningPath = useMemo(() => {
    return pathSlug ? getLearningPathBySlug(pathSlug) : undefined;
  }, [pathSlug]);

  const parentSubject = useMemo(() => {
    return learningPath ? getSubjectBySlug(learningPath.subjectSlug) : undefined;
  }, [learningPath]);

  // Other pathways in the same subject
  const siblingPaths = useMemo(() => {
    if (!learningPath) return [];
    return getLearningPathsBySubject(learningPath.subjectSlug).filter(
      (p) => p.slug !== learningPath.slug
    );
  }, [learningPath]);

  // First published lesson to recommend as "Start Learning"
  const firstPublishedLesson = useMemo(() => {
    if (!learningPath) return undefined;
    for (const mod of learningPath.modules) {
      for (const lesson of mod.lessons) {
        if (lesson.status === 'published' && lesson.noteSlug) {
          return {
            module: mod,
            lesson,
          };
        }
      }
    }
    return undefined;
  }, [learningPath]);

  // Synchronize modules scroll container height with right aside cards
  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth >= 1024 && rightAsideRef.current) {
        const height = rightAsideRef.current.offsetHeight;
        if (height > 300) {
          setAsideHeight(height);
        }
      } else {
        setAsideHeight(undefined);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    if (rightAsideRef.current) {
      observer.observe(rightAsideRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      observer.disconnect();
    };
  }, [learningPath]);

  if (!learningPath) {
    return (
      <div className="w-full bg-canvas text-body-ink min-h-screen py-16">
        <div className="max-w-column mx-auto px-5 text-center space-y-4">
          <span className="material-symbols-outlined text-[48px] text-muted-ink">
            search_off
          </span>
          <h1 className="text-[28px] font-semibold text-navy dark:text-white">
            Curriculum Roadmap Not Found
          </h1>
          <p className="text-secondary-ink max-w-md mx-auto">
            The requested learning path does not exist or has been restructured.
          </p>
          <Link to="/subjects" className="btn-primary inline-flex mt-4">
            Browse All Subjects
          </Link>
        </div>
      </div>
    );
  }

  const subjectName = parentSubject?.name || 'Subject Domain';
  const subjectSlug = parentSubject?.slug || learningPath.subjectSlug;

  return (
    <div className="w-full bg-canvas text-body-ink min-h-screen py-10 transition-colors">
      <div className="max-w-column mx-auto w-full px-5 space-y-10">
        
        {/* =====================================================================
            ZONE 1: ROADMAP HERO HEADER & SYLLABUS OVERVIEW
            ===================================================================== */}
        <header className="w-full pb-8 border-b border-edge">
          {/* Breadcrumbs */}
          <Breadcrumb
            items={[
              { label: 'Home', href: '/', icon: 'home' },
              { label: 'Subjects', href: '/subjects' },
              { label: subjectName, href: `/subjects/${subjectSlug}` },
              { label: learningPath.title },
            ]}
            className="mb-4"
          />

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            {/* Title & Syllabus Summary */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-[8px] bg-navy text-white flex items-center justify-center shrink-0 shadow-primary-btn">
                  <span className="material-symbols-outlined text-[22px]">
                    {learningPath.icon || 'schema'}
                  </span>
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-proof-green bg-proof-green/10 border border-proof-green/20 px-2.5 py-1 rounded-[8px] font-semibold">
                  STRUCTURED CURRICULUM ROADMAP
                </span>
                <span className="font-mono text-[11px] text-muted-ink uppercase tracking-wider">
                  {learningPath.level || 'Production Scale'}
                </span>
              </div>

              <h1 className="text-[32px] sm:text-[44px] font-medium leading-[1.1] tracking-[-0.03em] text-navy dark:text-white">
                {learningPath.title}
              </h1>

              <p className="text-[15px] sm:text-[16px] leading-relaxed text-secondary-ink dark:text-ash">
                {learningPath.description}
              </p>

              {/* Action buttons under hero */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {firstPublishedLesson ? (
                  <Link
                    to={`/notes/${firstPublishedLesson.lesson.noteSlug}`}
                    className="btn-primary"
                  >
                    <span>Start Lesson 1.1</span>
                    <span className="material-symbols-outlined text-[14px]">
                      arrow_forward
                    </span>
                  </Link>
                ) : null}

                <Link
                  to={`/subjects/${subjectSlug}`}
                  className="btn-secondary"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    arrow_back
                  </span>
                  <span>Back to {subjectName}</span>
                </Link>
              </div>
            </div>

            {/* Metrics & Overall Progress Panel */}
            <div className="p-5 bg-white dark:bg-panel rounded-[12px] border border-edge shadow-catalog-edge space-y-4 w-full lg:w-80 shrink-0">
              <div className="font-mono text-[11px] uppercase tracking-wider text-muted-ink font-semibold flex items-center justify-between pb-2 border-b border-edge">
                <span>CURRICULUM METRICS</span>
                <span className="text-proof-green">VERIFIED</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[26px] font-medium text-navy dark:text-white leading-none block">
                    {learningPath.modules.length}
                  </span>
                  <span className="font-mono text-[11px] text-muted-ink uppercase tracking-wider mt-1 block">
                    Modules
                  </span>
                </div>

                <div>
                  <span className="text-[26px] font-medium text-navy dark:text-white leading-none block">
                    {learningPath.totalLessons}
                  </span>
                  <span className="font-mono text-[11px] text-muted-ink uppercase tracking-wider mt-1 block">
                    Total Lessons
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-edge space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[11.5px] text-muted-ink">
                  <span>Published Lessons</span>
                  <span className="font-medium text-proof-green">
                    {learningPath.publishedLessons} / {learningPath.totalLessons}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-banner-start via-dot-blue to-proof-green transition-all duration-500"
                    style={{ width: `${Math.max(4, learningPath.progressPercentage)}%` }}
                  />
                </div>
                <span className="font-mono text-[10.5px] text-muted-ink block pt-0.5 text-right">
                  {learningPath.progressPercentage}% Completed Roadmap
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* =====================================================================
            ZONE 2: SEQUENTIAL ROADMAP TIMELINE & LESSONS
            ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Roadmap Timeline Spine (8 cols) */}
          <section className="lg:col-span-8 space-y-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-edge gap-3 shrink-0">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-ink font-semibold block">
                  SEQUENTIAL SYLLABUS
                </span>
                <h2 className="text-[22px] font-semibold text-navy dark:text-white tracking-tight">
                  Organized Learning Milestones
                </h2>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11.5px]">
                <button
                  type="button"
                  onClick={() => setAllExpanded(true)}
                  className="px-2.5 py-1 rounded-[6px] bg-white dark:bg-panel border border-edge text-body-ink hover:text-[#3e5199] hover:border-[#3e5199] hover:bg-[#3e5199]/5 transition-all cursor-pointer shadow-2xs"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={() => setAllExpanded(false)}
                  className="px-2.5 py-1 rounded-[6px] bg-white dark:bg-panel border border-edge text-body-ink hover:text-[#3e5199] hover:border-[#3e5199] hover:bg-[#3e5199]/5 transition-all cursor-pointer shadow-2xs"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Scrollable Modules Container with respect to right-side cards */}
            <div
              ref={modulesScrollContainerRef}
              style={asideHeight ? { maxHeight: `${Math.max(asideHeight - 84, 460)}px` } : undefined}
              className="overflow-y-auto max-h-[calc(100vh-14rem)] lg:max-h-[680px] pr-2 sm:pr-4 py-2 custom-scrollbar focus:outline-hidden"
            >
              {/* Modules Sequential Timeline */}
              <div className="space-y-6 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-edge/80 dark:before:bg-edge/40">
                {learningPath.modules.map((module) => {
                  const publishedCount = module.lessons.filter(
                    (l) => l.status === 'published'
                  ).length;
                  const isExpanded = Boolean(expandedModules[module.id]);

                  return (
                    <div
                      key={module.id}
                      id={`module-${module.number}`}
                      className="relative pl-12"
                    >
                      {/* Timeline Node Badge on spine */}
                      <div className="absolute left-3.5 top-0 -translate-x-1/2 w-7 h-7 rounded-full bg-navy text-white dark:bg-white dark:text-navy flex items-center justify-center font-mono text-[11px] font-semibold shadow-xs ring-4 ring-canvas">
                        {module.number}
                      </div>

                      {/* Unified Module Container Card */}
                      <div
                        className={cn(
                          'rounded-[10px] border overflow-hidden transition-all duration-200 shadow-catalog-edge',
                          isExpanded
                            ? 'border-[#3e5199]/40 dark:border-focus-blue/40 bg-white dark:bg-[#121622]'
                            : 'border-edge hover:border-[#3e5199]/40 bg-white/80 dark:bg-panel/80'
                        )}
                      >
                        {/* Interactive Collapsible Module Header */}
                        <button
                          type="button"
                          onClick={() => toggleModule(module.id)}
                          className="w-full p-3 sm:p-4 text-left transition-colors cursor-pointer select-none space-y-1.5 group hover:bg-canvas/30 dark:hover:bg-white/[0.015]"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded-[4px] font-mono text-[10px] font-semibold tracking-wider',
                                  isExpanded
                                    ? 'bg-[#3e5199]/15 text-[#3e5199] dark:bg-[#3e5199]/30 dark:text-ice border border-[#3e5199]/30'
                                    : 'bg-canvas dark:bg-canvas/50 text-secondary-ink dark:text-ice border border-edge/60'
                                )}
                              >
                                MODULE {module.number}
                              </span>
                              <span className="font-mono text-[11px] text-muted-ink">
                                {module.lessons.length} {module.lessons.length === 1 ? 'article' : 'articles'} ({publishedCount} published)
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-[10px] text-proof-green bg-proof-green/10 px-1.5 py-0.5 rounded font-medium">
                                {publishedCount === module.lessons.length
                                  ? 'ALL READY'
                                  : `${module.lessons.length - publishedCount} UPCOMING`}
                              </span>
                              <span
                                className={cn(
                                  'material-symbols-outlined text-[18px] text-muted-ink group-hover:text-navy dark:group-hover:text-white transition-transform duration-200',
                                  isExpanded ? 'rotate-180' : ''
                                )}
                              >
                                expand_more
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <h3 className="text-[15px] sm:text-[16.5px] font-medium text-navy dark:text-white tracking-tight group-hover:text-[#3e5199] dark:group-hover:text-ice transition-colors">
                              {module.title}
                            </h3>
                            <span className="font-mono text-[10.5px] text-muted-ink shrink-0 hidden sm:inline">
                              {isExpanded ? 'Click to collapse' : 'Click to view articles'}
                            </span>
                          </div>

                          {module.description && (
                            <p className="text-[12.5px] text-secondary-ink dark:text-muted-ink leading-relaxed">
                              {module.description}
                            </p>
                          )}
                        </button>

                        {/* Attached Lessons in this Module (Embedded directly with a subtle light background) */}
                        {isExpanded && (
                          <div className="border-t border-edge/60 dark:border-edge/30 bg-[#fbfbfd]/70 dark:bg-[#0c0e16]/30 divide-y divide-edge/40 dark:divide-edge/20">
                            {module.lessons.map((lesson) => {
                              const isPublished = lesson.status === 'published';

                              return (
                                <div
                                  key={lesson.id}
                                  onClick={() => {
                                    if (isPublished && lesson.noteSlug) {
                                      navigate(`/notes/${lesson.noteSlug}`);
                                    }
                                  }}
                                  className={cn(
                                    'py-2.5 sm:py-3 px-3.5 sm:px-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors',
                                    isPublished
                                      ? 'hover:bg-white dark:hover:bg-[#161b28] cursor-pointer group'
                                      : 'opacity-65 bg-canvas/30'
                                  )}
                                >
                                  {/* Left: Sequence + Title + Status + Read Time */}
                                  <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-canvas dark:bg-[#161a26] text-navy dark:text-ice border border-edge/60">
                                        LESSON {lesson.number}
                                      </span>

                                      {isPublished ? (
                                        <span className="inline-flex items-center gap-1 font-mono text-[9.5px] text-proof-green bg-proof-green/10 border border-proof-green/20 px-1.5 py-0.5 rounded-[4px] font-medium">
                                          <span className="w-1 h-1 rounded-full bg-proof-green" />
                                          <span>Published Article</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 font-mono text-[9.5px] text-muted-ink bg-canvas border border-edge/80 px-1.5 py-0.5 rounded-[4px]">
                                          <span>Scheduled on Roadmap</span>
                                        </span>
                                      )}

                                      {lesson.readTime && isPublished && (
                                        <span className="font-mono text-[10.5px] text-muted-ink">
                                          • {lesson.readTime}
                                        </span>
                                      )}
                                    </div>

                                    <h4
                                      className={cn(
                                        'text-[13px] sm:text-[14px] font-medium leading-snug tracking-tight',
                                        isPublished
                                          ? 'text-navy dark:text-white group-hover:text-[#3e5199] dark:group-hover:text-ice transition-colors'
                                          : 'text-secondary-ink dark:text-muted-ink'
                                      )}
                                    >
                                      {isPublished && lesson.noteSlug ? (
                                        <Link
                                          to={`/notes/${lesson.noteSlug}`}
                                          onClick={(e) => e.stopPropagation()}
                                          className="hover:underline focus:outline-hidden"
                                        >
                                          {lesson.title}
                                        </Link>
                                      ) : (
                                        lesson.title
                                      )}
                                    </h4>
                                  </div>

                                  {/* Right: Read Lesson Button */}
                                  <div className="shrink-0 self-start sm:self-center">
                                    {isPublished && lesson.noteSlug ? (
                                      <Link
                                        to={`/notes/${lesson.noteSlug}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="btn-primary h-7 px-2.5 text-[11px] gap-1 shadow-2xs group-hover:shadow-xs rounded-[5px]"
                                      >
                                        <span>Read Lesson</span>
                                        <span className="material-symbols-outlined text-[13px]">
                                          arrow_forward
                                        </span>
                                      </Link>
                                    ) : (
                                      <span className="font-mono text-[10px] text-muted-ink px-2 py-0.5 rounded bg-canvas border border-edge/60">
                                        In Development
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right Column: Sticky Roadmap Navigator (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            <div ref={rightAsideRef} className="lg:sticky lg:top-20 space-y-6">
              
              {/* "Start Here" Action Card */}
              {firstPublishedLesson && (
                <div className="p-5 rounded-[12px] bg-gradient-to-br from-[#111a4a] to-[#1b2d70] text-white shadow-md space-y-3">
                  <span className="font-mono text-[10.5px] uppercase tracking-wider text-ice font-semibold">
                    RECOMMENDED STARTING POINT
                  </span>
                  <h4 className="text-[16px] font-semibold leading-snug">
                    {firstPublishedLesson.lesson.title}
                  </h4>
                  <p className="text-[12.5px] text-white/80 leading-relaxed font-light">
                    Begin this learning path with the architectural foundations and request lifecycle mechanics.
                  </p>
                  <Link
                    to={`/notes/${firstPublishedLesson.lesson.noteSlug}`}
                    className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-[8px] bg-white text-[#111a4a] hover:bg-[#c1e8ef] hover:text-[#011821] font-sans text-[13.5px] font-semibold transition-all shadow-sm cursor-pointer"
                    style={{ color: '#111a4a' }}
                  >
                    <span style={{ color: '#111a4a' }}>Read Inaugural Lesson</span>
                    <span className="material-symbols-outlined text-[16px]" style={{ color: '#111a4a' }}>
                      arrow_forward
                    </span>
                  </Link>
                </div>
              )}

              {/* Module Quick Jump Index */}
              <div className="p-5 rounded-[10px] bg-white dark:bg-panel border border-edge shadow-catalog-edge space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-edge">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted-ink font-semibold">
                    ROADMAP MILESTONES
                  </span>
                  <span className="font-mono text-[11px] text-muted-ink">
                    {learningPath.modules.length} Modules
                  </span>
                </div>

                <div
                  className={cn(
                    'space-y-1.5 font-mono text-[12px] overflow-y-auto custom-scrollbar pr-1.5 transition-all duration-200',
                    milestonesExpanded ? 'max-h-[560px]' : 'max-h-[280px]'
                  )}
                >
                  {learningPath.modules.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleJumpToModule(m.id, m.number)}
                      className="w-full flex items-center justify-between p-2 rounded-[6px] hover:bg-canvas dark:hover:bg-canvas/40 text-body-ink hover:text-navy dark:hover:text-white transition-colors cursor-pointer text-left group"
                    >
                      <span className="truncate pr-2">
                        <strong className="text-navy dark:text-ice mr-1">
                          {m.number}.
                        </strong>
                        {m.title}
                      </span>
                      <span className="text-muted-ink text-[11px] shrink-0">
                        {m.lessons.length} lessons
                      </span>
                    </button>
                  ))}
                </div>

                {learningPath.modules.length > 7 && (
                  <div className="pt-2 border-t border-edge/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMilestonesExpanded(!milestonesExpanded)}
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-[#3e5199] dark:text-ice hover:underline cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {milestonesExpanded ? 'unfold_less' : 'unfold_more'}
                      </span>
                      <span>
                        {milestonesExpanded
                          ? 'Show Less'
                          : `Show All (${learningPath.modules.length})`}
                      </span>
                    </button>
                    <span className="font-mono text-[10px] text-muted-ink">
                      Scroll to view
                    </span>
                  </div>
                )}
              </div>

              {/* Sibling Pathways in this Subject */}
              {siblingPaths.length > 0 && (
                <div className="p-5 rounded-[10px] bg-white dark:bg-panel border border-edge shadow-catalog-edge space-y-3">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-muted-ink font-semibold pb-2 border-b border-edge">
                    RELATED PATHS IN {subjectName.toUpperCase()}
                  </div>

                  <div className="space-y-2">
                    {siblingPaths.map((sibling) => (
                      <Link
                        key={sibling.id}
                        to={`/learning-paths/${sibling.slug}`}
                        className="p-3 rounded-[8px] bg-canvas dark:bg-[#121620] border border-edge hover:border-navy group block transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-sans text-[13.5px] font-medium text-navy dark:text-white group-hover:text-dot-blue transition-colors">
                            {sibling.title}
                          </h5>
                          <span className="font-mono text-[10.5px] text-proof-green">
                            {sibling.progressPercentage}%
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-muted-ink block mt-1">
                          {sibling.modules.length} Modules • {sibling.publishedLessons}/{sibling.totalLessons} Lessons
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to Subject Directory */}
              <Link
                to={`/subjects/${subjectSlug}`}
                className="flex items-center justify-center gap-2 w-full h-[36px] rounded-[8px] border border-edge bg-white dark:bg-panel text-secondary-ink hover:text-navy dark:hover:text-white hover:border-navy transition-all font-mono text-[12.5px] shadow-xs"
              >
                <span className="material-symbols-outlined text-[15px]">
                  arrow_back
                </span>
                <span className='text-[11px]'>All {subjectName} Articles</span>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
