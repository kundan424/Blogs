import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { getEnrichedSubjects, getSubjectBySlug, getAllNotes } from '../utils/contentLoader';
import { getLearningPathsBySubject } from '../utils/learningPathLoader';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { NoteCard } from '../components/cards/NoteCard';
import { FilterBar, FilterItem } from '../components/interactive/FilterBar';
import { CuratedPathCard } from '../components/curriculum/CuratedPathCard';
import { PixelSymbol } from '../components/common/PixelSymbol';
import { EndpointCapsule } from '../components/common/EndpointCapsule';
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
  const [subTopicsExpanded, setSubTopicsExpanded] = useState(false);

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

  const getSymbolVariant = (slugName: string) => {
    const s = slugName.toLowerCase();
    if (s.includes('database') || s.includes('storage')) return 'database';
    if (s.includes('distributed') || s.includes('backend')) return 'network';
    if (s.includes('cloud') || s.includes('devops') || s.includes('docker')) return 'container';
    if (s.includes('system') || s.includes('architecture')) return 'architecture';
    if (s.includes('runtime') || s.includes('java')) return 'runtime';
    return 'workflow';
  };

  return (
    <div className="w-full bg-bright-white dark:bg-[#161616] text-[#161616] dark:text-[#fafafa] min-h-screen py-10 transition-colors">
      <div className="max-w-[1190px] mx-auto w-full px-6 space-y-10">
        
        {/* Zone 1: Subject Banner Header with Dotted Workbench */}
        <header className="p-8 sm:p-10 rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333]">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/', icon: 'home' },
              { label: 'Subjects', href: '/subjects' },
              { label: currentSubject.name },
            ]}
            className="mb-5"
          />

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Identity */}
            <div className="space-y-3.5 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-[16px] bg-bright-white dark:bg-[#303030] text-[#161616] dark:text-[#fafafa] flex items-center justify-center shrink-0 border border-[#d9d9d9] dark:border-[#474747]">
                  <PixelSymbol variant={getSymbolVariant(currentSubject.slug)} size={32} />
                </span>
                <EndpointCapsule>
                  {currentSubject.hubNumber || 'DOMAIN HUB'}
                </EndpointCapsule>
              </div>
              <h1 className="heading-xl text-[#161616] dark:text-[#fafafa]">
                {currentSubject.name}
              </h1>
              <p className="font-sans text-[16px] leading-[1.35] text-[#616161] dark:text-[#a3a3a3]">
                {currentSubject.description}
              </p>
            </div>

            {/* Metrics Overview Panel */}
            <div className="flex flex-row flex-wrap sm:flex-nowrap items-stretch gap-4 p-5 bg-bright-white dark:bg-[#161616] rounded-[20px] shrink-0 self-start border border-[#d9d9d9] dark:border-[#333333]">
              <div className="px-3 py-1 flex flex-col justify-center items-center text-center min-w-[80px]">
                <span className="font-sans text-[32px] font-medium text-[#161616] dark:text-[#fafafa] leading-none text-center">
                  {subjectLearningPaths.length}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] mt-1.5 text-center">
                  Learning Paths
                </span>
              </div>
              <div className="w-px bg-[#d9d9d9] dark:bg-[#333333] my-1" />
              <div className="px-3 py-1 flex flex-col justify-center items-center text-center min-w-[90px]">
                <span className="font-sans text-[32px] font-medium text-[#161616] dark:text-[#fafafa] leading-none text-center">
                  {currentSubject.notesCount}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] mt-1.5 text-center">
                  Notes Published
                </span>
              </div>
              <div className="w-px bg-[#d9d9d9] dark:bg-[#333333] my-1" />
              <div className="px-3 py-1 flex flex-col justify-center items-center text-center min-w-[80px]">
                <span className="font-sans text-[32px] font-medium text-[#161616] dark:text-[#fafafa] leading-none text-center">
                  {currentSubject.topicsCount.toString().padStart(2, '0')}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] mt-1.5 text-center">
                  Sub-Topics
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* View Mode Toggle Bar (42px Soft Pill Buttons) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 bg-[#f0f0f0] dark:bg-[#212121] rounded-full border border-[#d9d9d9] dark:border-[#333333]">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setViewMode('curriculum')}
              className={cn(
                'h-[42px] px-5 rounded-full font-mono text-[13px] uppercase tracking-[0.02em] inline-flex items-center gap-2 transition-all cursor-pointer select-none border',
                viewMode === 'curriculum'
                  ? 'bg-[#212121] text-[#fafafa] border-[#212121] dark:bg-[#fafafa] dark:text-[#212121] dark:border-[#fafafa] font-medium'
                  : 'bg-transparent text-[#616161] dark:text-[#a3a3a3] border-transparent hover:text-[#161616] dark:hover:text-[#fafafa]'
              )}
            >
              <span className="material-symbols-outlined text-[18px]">schema</span>
              <span>Learning Paths Curriculum ({subjectLearningPaths.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('feed')}
              className={cn(
                'h-[42px] px-5 rounded-full font-mono text-[13px] uppercase tracking-[0.02em] inline-flex items-center gap-2 transition-all cursor-pointer select-none border',
                viewMode === 'feed'
                  ? 'bg-[#212121] text-[#fafafa] border-[#212121] dark:bg-[#fafafa] dark:text-[#212121] dark:border-[#fafafa] font-medium'
                  : 'bg-transparent text-[#616161] dark:text-[#a3a3a3] border-transparent hover:text-[#161616] dark:hover:text-[#fafafa]'
              )}
            >
              <span className="material-symbols-outlined text-[18px]">view_stream</span>
              <span>All Articles &amp; Notes ({subjectNotes.length})</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.02em] text-[#8f8f8f] pr-4">
            <span>Sequenced from foundations to scale</span>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Column (8 cols) */}
          <section className="lg:col-span-8 space-y-6">
            {viewMode === 'curriculum' ? (
              /* =============================================================
                 CURRICULUM LEARNING PATHS VIEW
                 ============================================================= */
              <div className="space-y-6">
                <div className="p-5 rounded-[20px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#161616] dark:bg-[#ffffff]" />
                      <h3 className="text-[16px] font-medium text-[#161616] dark:text-[#fafafa]">
                        Curated Engineering Pathways
                      </h3>
                    </div>
                    <p className="text-[13.5px] text-[#616161] dark:text-[#a3a3a3] leading-relaxed">
                      Select any pathway below to open its dedicated sequential curriculum roadmap, syllabus modules, and technical deep-dives.
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-[#161616] dark:text-[#fafafa] bg-bright-white dark:bg-[#161616] px-3 py-1 rounded-full border border-[#d9d9d9] dark:border-[#333333] uppercase tracking-[0.02em] shrink-0">
                    {subjectLearningPaths.length} Curated Tracks
                  </span>
                </div>

                {subjectLearningPaths.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {subjectLearningPaths.map((path, idx) => (
                      <CuratedPathCard key={path.id} path={path} index={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] p-8">
                    <span className="material-symbols-outlined text-[32px] text-[#161616] dark:text-[#fafafa]">
                      auto_stories
                    </span>
                    <h3 className="mt-2 text-[17px] font-medium text-[#161616] dark:text-[#fafafa]">
                      Curriculum tracks being mapped for this domain
                    </h3>
                    <p className="mt-1 text-[13.5px] text-[#616161] dark:text-[#a3a3a3] max-w-md mx-auto">
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
                <div className="space-y-3 bg-[#f0f0f0] dark:bg-[#212121] p-4 rounded-[20px] border border-[#d9d9d9] dark:border-[#333333]">
                  <div className="flex items-center justify-between pb-2 border-b border-[#d9d9d9] dark:border-[#333333]">
                    <span className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] font-medium">
                      FILTER SUB-TOPICS
                    </span>
                    <span className="font-mono text-[11px] text-[#8f8f8f]">
                      {subjectNotes.length} matching notes
                    </span>
                  </div>

                  <FilterBar
                    items={topicFilters}
                    selectedId={selectedTag}
                    onSelect={(tagId) => setSelectedTag(tagId)}
                  />
                </div>

                <div className="space-y-4">
                  {subjectNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onTagClick={(tag) => setSelectedTag(tag)}
                    />
                  ))}

                  {subjectNotes.length === 0 && (
                    <div className="py-16 text-center rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333]">
                      <span className="material-symbols-outlined text-[32px] text-[#161616] dark:text-[#fafafa]">
                        search_off
                      </span>
                      <p className="mt-2 text-[16px] font-medium text-[#161616] dark:text-[#fafafa]">
                        No notes found in this sub-topic
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedTag('all')}
                        className="btn-primary mt-4"
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Right Sidebar Column (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-20 space-y-6">
              
              {/* Domain Curator Card */}
              <div className="p-6 rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333]">
                <div className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] mb-3">
                  DOMAIN CURATOR
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#212121] dark:bg-[#fafafa] text-[#fafafa] dark:text-[#212121] flex items-center justify-center font-mono text-[13px] font-medium">
                    K
                  </div>
                  <div>
                    <h4 className="text-[15px] font-medium text-[#161616] dark:text-[#fafafa]">
                      Kundan
                    </h4>
                    <span className="font-mono text-[11px] text-[#8f8f8f] block uppercase tracking-[0.02em]">
                      Systems Engineering Lead
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-[13.5px] text-[#616161] dark:text-[#a3a3a3] leading-relaxed border-t border-[#d9d9d9] dark:border-[#333333] pt-3">
                  Author &amp; Curator focusing on backend architecture, distributed systems, memory models, and performance tuning.
                </p>
              </div>

              {/* Learning Tracks Quick Index */}
              {subjectLearningPaths.length > 0 && (
                <div className="p-6 rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333]">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#d9d9d9] dark:border-[#333333]">
                    <h4 className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#161616] dark:text-[#fafafa] font-medium">
                      LEARNING TRACKS
                    </h4>
                    <span className="font-mono text-[11px] text-[#8f8f8f]">
                      {subjectLearningPaths.length} Active
                    </span>
                  </div>
                  <div className="space-y-2">
                    {subjectLearningPaths.map((lp) => (
                      <Link
                        key={lp.id}
                        to={`/learning-paths/${lp.slug}`}
                        className="w-full text-left p-3 rounded-[16px] bg-bright-white dark:bg-[#161616] border border-[#d9d9d9] dark:border-[#333333] hover:border-[#161616] dark:hover:border-[#ffffff] group transition-all block"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-[13.5px] font-medium text-[#161616] dark:text-[#fafafa] group-hover:text-[#161616] dark:group-hover:text-[#ffffff] group-hover:underline">
                            {lp.title}
                          </span>
                          <span className="font-mono text-[10.5px] text-[#161616] dark:text-[#fafafa] shrink-0 ml-2 font-medium">
                            {lp.progressPercentage}%
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-[#8f8f8f] block mt-0.5 uppercase tracking-[0.02em]">
                          {lp.modules.length} Modules • {lp.publishedLessons}/{lp.totalLessons} Lessons
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Topics Breakdown List */}
              <div className="p-6 rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#d9d9d9] dark:border-[#333333]">
                  <h4 className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#161616] dark:text-[#fafafa] font-medium">
                    SUB-TOPICS BREAKDOWN
                  </h4>
                  <span className="font-mono text-[11px] text-[#8f8f8f]">
                    {subTopicsBreakdown.length} Topics
                  </span>
                </div>
                <div
                  className={cn(
                    'space-y-1.5 overflow-y-auto custom-scrollbar pr-1.5 transition-all duration-200',
                    subTopicsExpanded ? 'max-h-[500px]' : 'max-h-[250px]'
                  )}
                >
                  {subTopicsBreakdown.map(({ topic, count }) => (
                    <Link
                      key={topic}
                      to={`/topics/${topic}`}
                      className="flex items-center justify-between p-2.5 rounded-[12px] bg-bright-white dark:bg-[#161616] border border-[#d9d9d9] dark:border-[#333333] hover:border-[#161616] dark:hover:border-[#ffffff] group transition-all"
                    >
                      <span className="font-mono text-[12px] text-[#161616] dark:text-[#fafafa] group-hover:text-[#161616] dark:group-hover:text-[#ffffff] group-hover:underline">
                        #{topic}
                      </span>
                      <span className="font-mono text-[11px] text-[#8f8f8f]">
                        {count} {count === 1 ? 'note' : 'notes'}
                      </span>
                    </Link>
                  ))}
                  {subTopicsBreakdown.length === 0 && (
                    <p className="text-[#8f8f8f] font-mono text-[12px] py-2">
                      No sub-topics indexed in this domain yet.
                    </p>
                  )}
                </div>

                {subTopicsBreakdown.length > 5 && (
                  <div className="pt-2 border-t border-[#d9d9d9] dark:border-[#333333] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSubTopicsExpanded(!subTopicsExpanded)}
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-[#161616] dark:text-[#fafafa] hover:underline cursor-pointer uppercase tracking-[0.02em]"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {subTopicsExpanded ? 'unfold_less' : 'unfold_more'}
                      </span>
                      <span>
                        {subTopicsExpanded
                          ? 'Show Less'
                          : `Show All (${subTopicsBreakdown.length})`}
                      </span>
                    </button>
                    <span className="font-mono text-[10px] text-[#8f8f8f]">
                      Scroll to view
                    </span>
                  </div>
                )}
              </div>

              {/* Canonical References */}
              <div className="p-6 rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333]">
                <div className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#161616] dark:text-[#fafafa] font-medium mb-3">
                  CANONICAL REFERENCES
                </div>
                <div className="space-y-2 font-mono text-[12px]">
                  <a
                    href="https://docs.spring.io/spring-boot/docs/current/reference/html/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-[#616161] hover:text-[#161616] dark:hover:text-[#ffffff] dark:text-[#a3a3a3] py-1 transition-colors"
                  >
                    <span>Spring Boot Reference Docs</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                  <div className="h-px bg-[#d9d9d9] dark:bg-[#333333]" />
                  <a
                    href="https://microservices.io/patterns/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-[#616161] hover:text-[#161616] dark:hover:text-[#ffffff] dark:text-[#a3a3a3] py-1 transition-colors"
                  >
                    <span>Microservice Pattern Catalog</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                  <div className="h-px bg-[#d9d9d9] dark:bg-[#333333]" />
                  <a
                    href="https://www.postgresql.org/docs/current/internals.html"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-[#616161] hover:text-[#161616] dark:hover:text-[#ffffff] dark:text-[#a3a3a3] py-1 transition-colors"
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
