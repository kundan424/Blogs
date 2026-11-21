import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLearningPathBySlug, getLearningPathsBySubject } from '../utils/learningPathLoader';
import { getSubjectBySlug } from '../utils/contentLoader';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { PixelSymbol } from '../components/common/PixelSymbol';
import { EndpointCapsule } from '../components/common/EndpointCapsule';
import { cn } from '../utils/cn';

export const LearningPathDetailPage: React.FC = () => {
  const { pathSlug } = useParams<{ pathSlug: string }>();
  const navigate = useNavigate();

  // Track open/collapsed state of each module. Default: first module open
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [milestonesExpanded, setMilestonesExpanded] = useState(false);

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
    setExpandedModules((prev) => ({ ...prev, [moduleId]: true }));
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

  const siblingPaths = useMemo(() => {
    if (!learningPath) return [];
    return getLearningPathsBySubject(learningPath.subjectSlug).filter(
      (p) => p.slug !== learningPath.slug
    );
  }, [learningPath]);

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

  useEffect(() => {
    if (learningPath && learningPath.modules.length > 0 && Object.keys(expandedModules).length === 0) {
      setExpandedModules({ [learningPath.modules[0].id]: true });
    }
  }, [learningPath]);

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
      <div className="w-full bg-bright-white dark:bg-[#161616] text-[#161616] dark:text-[#fafafa] min-h-screen py-16">
        <div className="max-w-[1190px] mx-auto px-6 text-center space-y-4">
          <span className="material-symbols-outlined text-[48px] text-[#161616] dark:text-[#fafafa]">
            search_off
          </span>
          <h1 className="heading-xl text-[#161616] dark:text-[#fafafa]">
            Curriculum Roadmap Not Found
          </h1>
          <p className="font-sans text-[#616161] dark:text-[#a3a3a3] max-w-md mx-auto">
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

  const getSymbolVariant = (p: typeof learningPath) => {
    const slug = p.slug.toLowerCase();
    if (slug.includes('database') || slug.includes('storage')) return 'database';
    if (slug.includes('microservices') || slug.includes('distributed')) return 'network';
    if (slug.includes('docker') || slug.includes('container')) return 'container';
    if (slug.includes('system-design')) return 'architecture';
    if (slug.includes('spring') || slug.includes('java')) return 'runtime';
    return 'workflow';
  };

  return (
    <div className="w-full bg-bright-white dark:bg-[#161616] text-[#161616] dark:text-[#fafafa] min-h-screen py-10 transition-colors">
      <div className="max-w-[1190px] mx-auto w-full px-6 space-y-10">
        
        {/* ZONE 1: ROADMAP HERO HEADER */}
        <header className="p-8 sm:p-10 rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333]">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/', icon: 'home' },
              { label: 'Subjects', href: '/subjects' },
              { label: subjectName, href: `/subjects/${subjectSlug}` },
              { label: learningPath.title },
            ]}
            className="mb-5"
          />

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            {/* Title & Syllabus Summary */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-[16px] bg-bright-white dark:bg-[#303030] text-[#161616] dark:text-[#fafafa] flex items-center justify-center shrink-0 border border-[#d9d9d9] dark:border-[#474747]">
                  <PixelSymbol variant={getSymbolVariant(learningPath)} size={32} />
                </span>
                <EndpointCapsule>
                  STRUCTURED CURRICULUM
                </EndpointCapsule>
                <span className="font-mono text-[11px] text-[#8f8f8f] uppercase tracking-[0.02em]">
                  {learningPath.level || 'Production Scale'}
                </span>
              </div>

              <h1 className="heading-xl text-[#161616] dark:text-[#fafafa]">
                {learningPath.title}
              </h1>

              <p className="font-sans text-[16px] leading-[1.35] text-[#616161] dark:text-[#a3a3a3]">
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
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </Link>
                ) : null}

                <Link
                  to={`/subjects/${subjectSlug}`}
                  className="btn-secondary"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_back
                  </span>
                  <span>Back to {subjectName}</span>
                </Link>
              </div>
            </div>

            {/* Metrics & Overall Progress Panel */}
            <div className="p-6 bg-bright-white dark:bg-[#161616] rounded-[24px] border border-[#d9d9d9] dark:border-[#333333] space-y-4 w-full lg:w-80 shrink-0">
              <div className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] font-medium flex items-center justify-between pb-2 border-b border-[#d9d9d9] dark:border-[#333333]">
                <span>CURRICULUM METRICS</span>
                <span className="text-[#161616] dark:text-[#fafafa]">VERIFIED</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-sans text-[32px] font-medium text-[#161616] dark:text-[#fafafa] leading-none block">
                    {learningPath.modules.length}
                  </span>
                  <span className="font-mono text-[11px] text-[#8f8f8f] uppercase tracking-[0.02em] mt-1 block">
                    Modules
                  </span>
                </div>

                <div>
                  <span className="font-sans text-[32px] font-medium text-[#161616] dark:text-[#fafafa] leading-none block">
                    {learningPath.totalLessons}
                  </span>
                  <span className="font-mono text-[11px] text-[#8f8f8f] uppercase tracking-[0.02em] mt-1 block">
                    Total Lessons
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#d9d9d9] dark:border-[#333333] space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[11.5px] uppercase tracking-[0.02em] text-[#8f8f8f]">
                  <span>Published Lessons</span>
                  <span className="font-medium text-[#161616] dark:text-[#fafafa]">
                    {learningPath.publishedLessons} / {learningPath.totalLessons}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#f0f0f0] dark:bg-[#303030] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#161616] dark:bg-[#ffffff] transition-all duration-500"
                    style={{ width: `${Math.max(4, learningPath.progressPercentage)}%` }}
                  />
                </div>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.02em] text-[#8f8f8f] block pt-0.5 text-right">
                  {learningPath.progressPercentage}% Completed Roadmap
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ZONE 2: SEQUENTIAL ROADMAP TIMELINE & LESSONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Roadmap Timeline Spine (8 cols) */}
          <section className="lg:col-span-8 space-y-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#d9d9d9] dark:border-[#333333] gap-3 shrink-0">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] font-medium block">
                  SEQUENTIAL SYLLABUS
                </span>
                <h2 className="text-[20px] font-medium text-[#161616] dark:text-[#fafafa] tracking-tight">
                  Organized Learning Milestones
                </h2>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.02em]">
                <button
                  type="button"
                  onClick={() => setAllExpanded(true)}
                  className="px-3 py-1.5 rounded-full bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] text-[#161616] dark:text-[#fafafa] hover:border-[#161616] transition-all cursor-pointer"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={() => setAllExpanded(false)}
                  className="px-3 py-1.5 rounded-full bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] text-[#161616] dark:text-[#fafafa] hover:border-[#161616] transition-all cursor-pointer"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Scrollable Modules Container */}
            <div
              ref={modulesScrollContainerRef}
              style={asideHeight ? { maxHeight: `${Math.max(asideHeight - 84, 460)}px` } : undefined}
              className="overflow-y-auto max-h-[calc(100vh-14rem)] lg:max-h-[680px] pr-2 sm:pr-4 py-2 custom-scrollbar focus:outline-hidden"
            >
              <div className="space-y-6 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#d9d9d9] dark:before:bg-[#333333]">
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
                      <div className="absolute left-3.5 top-0 -translate-x-1/2 w-7 h-7 rounded-full bg-[#212121] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#212121] flex items-center justify-center font-mono text-[11px] font-medium shadow-xs ring-4 ring-[#fafafa] dark:ring-[#161616]">
                        {module.number}
                      </div>

                      {/* Unified Module Container Card */}
                      <div
                        className={cn(
                          'rounded-[20px] border overflow-hidden transition-all duration-200',
                          isExpanded
                            ? 'border-[#161616] dark:border-[#ffffff] bg-bright-white dark:bg-[#212121]'
                            : 'border-[#d9d9d9] dark:border-[#333333] hover:border-[#161616] dark:hover:border-[#ffffff] bg-bright-white dark:bg-[#212121]'
                        )}
                      >
                        {/* Interactive Collapsible Module Header */}
                        <button
                          type="button"
                          onClick={() => toggleModule(module.id)}
                          className="w-full p-4 sm:p-5 text-left transition-colors cursor-pointer select-none space-y-1.5 group hover:bg-[#f0f0f0]/50 dark:hover:bg-[#303030]/50"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full font-mono text-[10.5px] uppercase tracking-[0.02em] font-medium bg-[#f0f0f0] dark:bg-[#303030] text-[#161616] dark:text-[#fafafa] border border-[#d9d9d9] dark:border-[#474747]">
                                MODULE {module.number}
                              </span>
                              <span className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f]">
                                {module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'} ({publishedCount} published)
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-[10px] uppercase tracking-[0.02em] text-[#161616] dark:text-[#fafafa] bg-[#161616]/5 dark:bg-white/10 px-2 py-0.5 rounded-full font-medium">
                                {publishedCount === module.lessons.length
                                   ? 'ALL PUBLISHED'
                                  : `${module.lessons.length - publishedCount} UPCOMING`}
                              </span>
                              <span
                                className={cn(
                                  'material-symbols-outlined text-[18px] text-[#8f8f8f] transition-transform duration-200',
                                  isExpanded ? 'rotate-180' : ''
                                )}
                              >
                                expand_more
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <h3 className="text-[16px] sm:text-[17px] font-medium text-[#161616] dark:text-[#fafafa] tracking-tight group-hover:text-[#161616] dark:group-hover:text-[#ffffff] group-hover:underline transition-colors">
                              {module.title}
                            </h3>
                            <span className="font-mono text-[10.5px] uppercase tracking-[0.02em] text-[#8f8f8f] shrink-0 hidden sm:inline">
                              {isExpanded ? 'Collapse' : 'Expand'}
                            </span>
                          </div>

                          {module.description && (
                            <p className="text-[13px] text-[#616161] dark:text-[#a3a3a3] leading-relaxed">
                              {module.description}
                            </p>
                          )}
                        </button>

                        {/* Attached Lessons */}
                        {isExpanded && (
                          <div className="border-t border-[#d9d9d9] dark:border-[#333333] bg-bright-white dark:bg-[#1a1a1a] divide-y divide-[#d9d9d9] dark:divide-[#303030]">
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
                                    'py-3 px-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors',
                                    isPublished
                                      ? 'hover:bg-bright-white dark:hover:bg-[#262626] cursor-pointer group'
                                      : 'opacity-65'
                                  )}
                                >
                                  {/* Left: Sequence + Title + Status */}
                                  <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono text-[10.5px] uppercase tracking-[0.02em] font-medium px-2 py-0.5 rounded-full bg-[#f0f0f0] dark:bg-[#303030] text-[#161616] dark:text-[#fafafa] border border-[#d9d9d9] dark:border-[#474747]">
                                        LESSON {lesson.number}
                                      </span>

                                      {isPublished ? (
                                        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.02em] text-[#161616] dark:text-[#fafafa] bg-[#161616]/5 dark:bg-white/10 border border-[#d9d9d9] dark:border-[#474747] px-2 py-0.5 rounded-full font-medium">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#161616] dark:bg-[#ffffff]" />
                                          <span>Published</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.02em] text-[#8f8f8f] bg-[#f0f0f0] dark:bg-[#303030] border border-[#d9d9d9] dark:border-[#474747] px-2 py-0.5 rounded-full">
                                          <span>Scheduled</span>
                                        </span>
                                      )}

                                      {lesson.readTime && isPublished && (
                                        <span className="font-mono text-[11px] text-[#8f8f8f]">
                                          • {lesson.readTime}
                                        </span>
                                      )}
                                    </div>

                                    <h4
                                      className={cn(
                                        'text-[14px] font-medium leading-snug tracking-tight',
                                        isPublished
                                          ? 'text-[#161616] dark:text-[#fafafa] group-hover:text-[#161616] dark:group-hover:text-[#ffffff] group-hover:underline transition-colors'
                                          : 'text-[#8f8f8f]'
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
                                        className="btn-primary h-8 px-3 text-[11.5px] gap-1"
                                      >
                                        <span>Read Lesson</span>
                                        <span className="material-symbols-outlined text-[13px]">
                                          arrow_forward
                                        </span>
                                      </Link>
                                    ) : (
                                      <span className="font-mono text-[10px] uppercase tracking-[0.02em] text-[#8f8f8f] px-2.5 py-1 rounded-full bg-[#f0f0f0] dark:bg-[#303030] border border-[#d9d9d9] dark:border-[#474747]">
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
                <div className="p-6 rounded-[24px] bg-[#212121] text-[#fafafa] border border-[#303030] space-y-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] font-medium block">
                    RECOMMENDED STARTING POINT
                  </span>
                  <h4 className="text-[17px] font-medium leading-snug">
                    {firstPublishedLesson.lesson.title}
                  </h4>
                  <p className="text-[13px] text-[#8f8f8f] leading-relaxed">
                    Begin this learning path with the architectural foundations and request lifecycle mechanics.
                  </p>
                  <Link
                    to={`/notes/${firstPublishedLesson.lesson.noteSlug}`}
                    className="btn-primary w-full mt-2"
                  >
                    <span>Read Inaugural Lesson</span>
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              )}

              {/* Module Quick Jump Index */}
              <div className="p-6 rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#d9d9d9] dark:border-[#333333]">
                  <span className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#161616] dark:text-[#fafafa] font-medium">
                    ROADMAP MILESTONES
                  </span>
                  <span className="font-mono text-[11px] text-[#8f8f8f]">
                    {learningPath.modules.length} Modules
                  </span>
                </div>

                <div
                  className={cn(
                    'space-y-1.5 font-mono text-[12px] uppercase tracking-[0.02em] overflow-y-auto custom-scrollbar pr-1.5 transition-all duration-200',
                    milestonesExpanded ? 'max-h-[560px]' : 'max-h-[280px]'
                  )}
                >
                  {learningPath.modules.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleJumpToModule(m.id, m.number)}
                      className="w-full flex items-center justify-between p-2 rounded-full hover:bg-bright-white dark:hover:bg-[#303030] text-[#161616] dark:text-[#fafafa] transition-colors cursor-pointer text-left group"
                    >
                      <span className="truncate pr-2">
                        <strong className="text-[#161616] dark:text-[#fafafa] mr-1">
                          {m.number}.
                        </strong>
                        {m.title}
                      </span>
                      <span className="text-[#8f8f8f] text-[10.5px] shrink-0">
                        {m.lessons.length} lessons
                      </span>
                    </button>
                  ))}
                </div>

                {learningPath.modules.length > 7 && (
                  <div className="pt-2 border-t border-[#d9d9d9] dark:border-[#333333] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMilestonesExpanded(!milestonesExpanded)}
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-[#161616] dark:text-[#fafafa] hover:underline cursor-pointer uppercase tracking-[0.02em]"
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
                    <span className="font-mono text-[10px] text-[#8f8f8f]">
                      Scroll to view
                    </span>
                  </div>
                )}
              </div>

              {/* Sibling Pathways in this Subject */}
              {siblingPaths.length > 0 && (
                <div className="p-6 rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] space-y-3">
                  <div className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#161616] dark:text-[#fafafa] font-medium pb-2 border-b border-[#d9d9d9] dark:border-[#333333]">
                    RELATED PATHS IN {subjectName.toUpperCase()}
                  </div>

                  <div className="space-y-2">
                    {siblingPaths.map((sibling) => (
                      <Link
                        key={sibling.id}
                        to={`/learning-paths/${sibling.slug}`}
                        className="p-3 rounded-[16px] bg-bright-white dark:bg-[#161616] border border-[#d9d9d9] dark:border-[#333333] hover:border-[#161616] dark:hover:border-[#ffffff] group block transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-sans text-[13.5px] font-medium text-[#161616] dark:text-[#fafafa] group-hover:text-[#161616] dark:group-hover:text-[#ffffff] group-hover:underline transition-colors">
                            {sibling.title}
                          </h5>
                          <span className="font-mono text-[10.5px] text-[#161616] dark:text-[#fafafa]">
                            {sibling.progressPercentage}%
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-[#8f8f8f] block mt-1 uppercase tracking-[0.02em]">
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
                className="btn-secondary w-full text-[12px]"
              >
                <span className="material-symbols-outlined text-[15px]">
                  arrow_back
                </span>
                <span>All {subjectName} Articles</span>
              </Link>
            </div>
          </aside>
        </div>

      </div>
    </div>
  );
};
