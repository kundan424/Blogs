import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { getEnrichedSubjects, getSubjectBySlug, getAllNotes } from '../utils/contentLoader';
import { getLearningPathsBySubject } from '../utils/learningPathLoader';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { NoteCard } from '../components/cards/NoteCard';
import { FilterBar, FilterItem } from '../components/interactive/FilterBar';
import { CuratedPathCard } from '../components/curriculum/CuratedPathCard';
import { cn } from '../utils/cn';

export const SubjectHubPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentSubject = useMemo(() => {
    return (
      (slug ? getSubjectBySlug(slug) : undefined) ||
      getEnrichedSubjects()[0]
    );
  }, [slug]);

  // Learning Paths for this subject
  const subjectLearningPaths = useMemo(() => {
    return getLearningPathsBySubject(currentSubject.slug);
  }, [currentSubject.slug]);

  // View Mode: 'curriculum' (default when paths exist) vs 'feed'
  const viewParam = searchParams.get('view');
  const viewMode: 'curriculum' | 'feed' =
    viewParam === 'feed'
      ? 'feed'
      : subjectLearningPaths.length > 0
      ? 'curriculum'
      : 'feed';

  const setViewMode = (mode: 'curriculum' | 'feed') => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (mode === 'feed') {
          next.set('view', 'feed');
        } else {
          next.delete('view');
        }
        return next;
      },
      { replace: true }
    );
  };

  // Auto-scroll to target path if ?path=slug is in the URL
  useEffect(() => {
    const targetPathSlug = searchParams.get('path');
    if (targetPathSlug) {
      const el = document.getElementById(targetPathSlug);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [searchParams]);

  const [selectedTag, setSelectedTag] = useState('all');

  const allNotes = useMemo(() => {
    return getAllNotes();
  }, []);

  // Real sub-topics breakdown for this subject with exact note counts
  const subTopicsBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    const notesInThisSubject = allNotes.filter((n) => n.subjectSlug === currentSubject.slug);
    for (const note of notesInThisSubject) {
      if (Array.isArray(note.tags)) {
        for (const t of note.tags) {
          const lower = t.toLowerCase().trim();
          if (lower) {
            map[lower] = (map[lower] || 0) + 1;
          }
        }
      }
    }
    return Object.entries(map)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);
  }, [allNotes, currentSubject.slug]);

  const topicFilters: FilterItem[] = useMemo(() => {
    const countInSubject = allNotes.filter((n) => n.subjectSlug === currentSubject.slug).length;
    return [
      { id: 'all', label: `All (${countInSubject})` },
      ...subTopicsBreakdown.map(({ topic, count }) => ({
        id: topic,
        label: `#${topic} (${count})`,
      })),
    ];
  }, [allNotes, currentSubject.slug, subTopicsBreakdown]);

  const subjectNotes = useMemo(() => {
    return allNotes.filter((n) => {
      const matchesSubject = n.subjectSlug === currentSubject.slug;
      if (!matchesSubject) return false;

      if (selectedTag === 'all') return true;
      return n.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
    });
  }, [allNotes, currentSubject.slug, selectedTag]);

  return (
    <div className="w-full bg-canvas text-body-ink min-h-screen py-10 transition-colors">
      <div className="max-w-column mx-auto w-full px-5 space-y-10">
        {/* Zone 1: Subject Banner Header */}
        <header className="w-full pb-8 border-b border-edge">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Home', href: '/', icon: 'home' },
              { label: 'Subjects', href: '/subjects' },
              { label: currentSubject.name },
            ]}
            className="mb-4"
          />

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Identity */}
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-[8px] bg-navy text-white flex items-center justify-center shrink-0 shadow-primary-btn">
                  <span className="material-symbols-outlined text-[20px]">
                    {currentSubject.icon}
                  </span>
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-navy dark:text-ice bg-ice/40 dark:bg-deep-teal px-2.5 py-1 rounded-[8px] border border-ice/60 dark:border-ice/20 font-medium">
                  {currentSubject.hubNumber}
                </span>
              </div>
              <h1 className="text-[32px] sm:text-[44px] font-medium leading-[1.1] tracking-[-0.03em] text-navy dark:text-white">
                {currentSubject.name}
              </h1>
              <p className="text-[15px] sm:text-[16px] leading-relaxed text-secondary-ink dark:text-ash">
                {currentSubject.description}
              </p>
            </div>

            {/* Metrics Overview Panel */}
            <div className="flex flex-row flex-wrap sm:flex-nowrap items-stretch gap-4 p-4 bg-white dark:bg-panel rounded-[8px] shrink-0 self-start border border-edge shadow-catalog-edge">
              <div className="px-3 py-1 flex flex-col justify-center">
                <span className="text-[26px] font-medium text-navy dark:text-white leading-none">
                  {subjectLearningPaths.length}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-ink mt-1.5">
                  Learning Paths
                </span>
              </div>
              <div className="w-px bg-edge my-1" />
              <div className="px-3 py-1 flex flex-col justify-center">
                <span className="text-[26px] font-medium text-proof-green leading-none">
                  {currentSubject.notesCount}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-ink mt-1.5">
                  Notes Published
                </span>
              </div>
              <div className="w-px bg-edge my-1" />
              <div className="px-3 py-1 flex flex-col justify-center">
                <span className="text-[26px] font-medium text-navy dark:text-white leading-none">
                  {currentSubject.topicsCount.toString().padStart(2, '0')}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-ink mt-1.5">
                  Sub-Topics
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* View Mode Toggle Bar (Column 36px Key Controls) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 bg-white dark:bg-panel rounded-[8px] border border-edge shadow-catalog-edge">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setViewMode('curriculum')}
              className={cn(
                'h-[36px] px-4 rounded-[8px] font-mono text-[13px] inline-flex items-center gap-2 transition-all cursor-pointer select-none border',
                viewMode === 'curriculum'
                  ? 'bg-gradient-to-r from-[#3e5199] to-[#5568ad] text-white border-[#3e5199] font-semibold shadow-sm'
                  : 'bg-white dark:bg-panel text-body-ink border-edge hover:border-[#3e5199] hover:text-[#3e5199] hover:bg-[#3e5199]/5 shadow-xs'
              )}
            >
              <span className="material-symbols-outlined text-[17px]">schema</span>
              <span>Learning Paths Curriculum ({subjectLearningPaths.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('feed')}
              className={cn(
                'h-[36px] px-4 rounded-[8px] font-mono text-[13px] inline-flex items-center gap-2 transition-all cursor-pointer select-none border',
                viewMode === 'feed'
                  ? 'bg-gradient-to-r from-[#3e5199] to-[#5568ad] text-white border-[#3e5199] font-semibold shadow-sm'
                  : 'bg-white dark:bg-panel text-body-ink border-edge hover:border-[#3e5199] hover:text-[#3e5199] hover:bg-[#3e5199]/5 shadow-xs'
              )}
            >
              <span className="material-symbols-outlined text-[17px]">view_stream</span>
              <span>All Articles &amp; Notes ({subjectNotes.length})</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-muted-ink pr-2">
            <span>Organized sequentially from fundamentals to production scale</span>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Column */}
          <section className="lg:col-span-8 space-y-6">
            {viewMode === 'curriculum' ? (
              /* =============================================================
                 CURRICULUM LEARNING PATHS VIEW (Colorful Curated Cards)
                 ============================================================= */
              <div className="space-y-6">
                {/* Intro Explanatory Ribbon */}
                <div className="p-4 sm:p-5 rounded-[12px] bg-white dark:bg-panel border border-edge/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-proof-green">
                        school
                      </span>
                      <h3 className="text-[16px] font-semibold text-navy dark:text-white">
                        Curated Engineering Pathways
                      </h3>
                    </div>
                    <p className="text-[13px] text-secondary-ink dark:text-muted-ink leading-relaxed">
                      Select any pathway below to open its dedicated sequential curriculum roadmap, syllabus modules, and technical deep-dives.
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-muted-ink bg-panel dark:bg-canvas px-3 py-1 rounded-[6px] border border-edge shrink-0">
                    {subjectLearningPaths.length} Curated Tracks
                  </span>
                </div>

                {/* 3 Colorful Curated Path Cards */}
                {subjectLearningPaths.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {subjectLearningPaths.map((path, idx) => (
                      <CuratedPathCard key={path.id} path={path} index={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center rounded-[8px] bg-panel border border-edge">
                    <span className="material-symbols-outlined text-[32px] text-muted-ink">
                      auto_stories
                    </span>
                    <h3 className="mt-2 text-[17px] font-semibold text-navy dark:text-white">
                      Curriculum tracks being mapped for this domain
                    </h3>
                    <p className="mt-1 text-[13.5px] text-secondary-ink max-w-md mx-auto">
                      All research notes published under {currentSubject.name} are available in the notes feed.
                    </p>
                    <button
                      type="button"
                      onClick={() => setViewMode('feed')}
                      className="btn-primary mt-4"
                    >
                      Browse All Articles
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* =============================================================
                 NOTES FEED & TOPIC FILTER VIEW
                 ============================================================= */
              <div className="space-y-6">
                {/* Zone 2: Interactive Controls & Filters */}
                <div className="space-y-3 bg-white dark:bg-panel p-4 rounded-[8px] border border-edge shadow-catalog-edge">
                  <div className="flex items-center justify-between pb-2 border-b border-edge">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-ink font-medium">
                      FILTER SUB-TOPICS
                    </span>
                    <span className="font-mono text-[11px] text-muted-ink">
                      {subjectNotes.length} matching notes
                    </span>
                  </div>

                  {/* Row A: Sub-topic Pills */}
                  <FilterBar
                    items={topicFilters}
                    selectedId={selectedTag}
                    onSelect={(tagId) => setSelectedTag(tagId)}
                  />
                </div>

                {/* Feed Notes List */}
                <div className="space-y-4">
                  {subjectNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onTagClick={(tag) => setSelectedTag(tag)}
                    />
                  ))}

                  {subjectNotes.length === 0 && (
                    <div className="py-16 text-center rounded-[8px] bg-panel border border-edge">
                      <span className="material-symbols-outlined text-[32px] text-muted-ink">
                        search_off
                      </span>
                      <p className="mt-2 text-[16px] font-medium text-navy dark:text-white">
                        No notes found in this sub-topic
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedTag('all')}
                        className="btn-primary mt-4 inline-flex items-center justify-center cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Right Sidebar Column */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-20 space-y-6">
              {/* Domain Curator Card */}
              <div className="p-5 rounded-[8px] bg-white dark:bg-panel border border-edge shadow-catalog-edge">
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted-ink mb-3">
                  DOMAIN CURATOR
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[8px] bg-navy text-white flex items-center justify-center font-mono text-[14px] font-medium shadow-primary-btn">
                    K
                  </div>
                  <div>
                    <h4 className="text-[14px] font-medium text-navy dark:text-white">
                      Kundan
                    </h4>
                    <span className="font-mono text-[11px] text-muted-ink block">
                      Software Engineer @ Core Architecture
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-[13px] text-secondary-ink leading-relaxed border-t border-edge pt-3">
                  Author &amp; Curator focusing on backend architecture, distributed systems, memory models, and performance tuning.
                </p>
              </div>

              {/* Learning Paths Quick Index */}
              {subjectLearningPaths.length > 0 && (
                <div className="p-5 rounded-[8px] bg-white dark:bg-panel border border-edge shadow-catalog-edge">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-mono text-[11px] uppercase tracking-wider text-muted-ink">
                      LEARNING TRACKS
                    </h4>
                    <span className="font-mono text-[11px] text-muted-ink">
                      {subjectLearningPaths.length} Active
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {subjectLearningPaths.map((lp) => (
                      <Link
                        key={lp.id}
                        to={`/learning-paths/${lp.slug}`}
                        className="w-full text-left p-2.5 rounded-[8px] bg-canvas dark:bg-[#121620] border border-edge hover:border-navy hover:text-navy dark:hover:text-white group transition-all block"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-[13px] font-medium text-body-ink group-hover:text-navy dark:group-hover:text-white">
                            {lp.title}
                          </span>
                          <span className="font-mono text-[10.5px] text-proof-green shrink-0 ml-2">
                            {lp.progressPercentage}%
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-muted-ink block mt-0.5">
                          {lp.modules.length} Modules • {lp.publishedLessons}/{lp.totalLessons} Lessons
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Topics Breakdown List */}
              <div className="p-5 rounded-[8px] bg-white dark:bg-panel border border-edge shadow-catalog-edge">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-muted-ink">
                    SUB-TOPICS BREAKDOWN
                  </h4>
                  <span className="font-mono text-[11px] text-muted-ink">
                    {subTopicsBreakdown.length} Topics
                  </span>
                </div>
                <div className="space-y-2">
                  {subTopicsBreakdown.map(({ topic, count }) => (
                    <Link
                      key={topic}
                      to={`/topics/${topic}`}
                      className="flex items-center justify-between p-2.5 rounded-[8px] bg-canvas dark:bg-[#121620] border border-edge hover:border-navy hover:text-navy dark:hover:text-white group transition-all"
                    >
                      <span className="font-mono text-[12px] text-body-ink group-hover:text-navy dark:group-hover:text-white">
                        #{topic}
                      </span>
                      <span className="font-mono text-[11px] text-muted-ink group-hover:text-navy/80 dark:group-hover:text-white/80">
                        {count} {count === 1 ? 'note' : 'notes'}
                      </span>
                    </Link>
                  ))}
                  {subTopicsBreakdown.length === 0 && (
                    <p className="text-muted-ink font-mono text-[12px] py-2">
                      No sub-topics indexed in this domain yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Subject References Links */}
              <div className="p-5 rounded-[8px] bg-white dark:bg-panel border border-edge shadow-catalog-edge">
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted-ink mb-3">
                  CANONICAL REFERENCES
                </div>
                <div className="space-y-2 font-mono text-[12px]">
                  <a
                    href="https://docs.spring.io/spring-boot/docs/current/reference/html/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-secondary-ink hover:text-navy dark:hover:text-white py-1 transition-colors"
                  >
                    <span>Spring Boot Reference Docs</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                  <div className="h-px bg-edge" />
                  <a
                    href="https://microservices.io/patterns/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-secondary-ink hover:text-navy dark:hover:text-white py-1 transition-colors"
                  >
                    <span>Microservice Pattern Catalog</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                  <div className="h-px bg-edge" />
                  <a
                    href="https://www.postgresql.org/docs/current/internals.html"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-secondary-ink hover:text-navy dark:hover:text-white py-1 transition-colors"
                  >
                    <span>PostgreSQL 16 Source Internals</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
