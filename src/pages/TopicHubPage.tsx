import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { topics } from '../data/topics';
import { getEnrichedTopics, getTopicBySlug, getSubjectBySlug, getAllNotes } from '../utils/contentLoader';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { NoteCard } from '../components/cards/NoteCard';
import { FilterBar, FilterItem } from '../components/interactive/FilterBar';

export const TopicHubPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const allNotes = useMemo(() => getAllNotes(), []);

  const currentTopic = useMemo(() => {
    return (
      (slug ? getTopicBySlug(slug) : undefined) ||
      getEnrichedTopics()[0] ||
      topics[0]
    );
  }, [slug]);

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');

  const notesWithTopic = useMemo(() => {
    return allNotes.filter((n) =>
      n.tags.some((t) => t.toLowerCase() === currentTopic.name.toLowerCase())
    );
  }, [allNotes, currentTopic.name]);

  const matchingNotes = useMemo(() => {
    if (selectedSubjectFilter === 'all') return notesWithTopic;
    return notesWithTopic.filter((n) => n.subjectSlug === selectedSubjectFilter);
  }, [notesWithTopic, selectedSubjectFilter]);

  const intersectingSubjects = useMemo(() => {
    return currentTopic.subjects
      .map((subSlug) => getSubjectBySlug(subSlug))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
  }, [currentTopic.subjects]);

  const subjectFilterItems = useMemo<FilterItem[]>(() => {
    const items: FilterItem[] = [
      { id: 'all', label: `All Subjects (${notesWithTopic.length})` },
    ];

    const subSlugs = Array.from(new Set(notesWithTopic.map((n) => n.subjectSlug)));
    for (const subSlug of subSlugs) {
      const count = notesWithTopic.filter((n) => n.subjectSlug === subSlug).length;
      const foundSub = getSubjectBySlug(subSlug);
      const name = foundSub ? foundSub.name : subSlug;
      items.push({
        id: subSlug,
        label: `${name} (${count})`,
      });
    }
    return items;
  }, [notesWithTopic]);

  const coOccurringTopics = useMemo(() => {
    const tagMap: Record<string, number> = {};
    for (const n of notesWithTopic) {
      for (const t of n.tags) {
        const lower = t.toLowerCase();
        if (lower !== currentTopic.name.toLowerCase()) {
          tagMap[lower] = (tagMap[lower] || 0) + 1;
        }
      }
    }
    return Object.entries(tagMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [notesWithTopic, currentTopic.name]);

  return (
    <div className="w-full bg-canvas text-body-ink min-h-screen py-10 transition-colors">
      <div className="max-w-column w-full mx-auto px-5 space-y-10">
        {/* Zone 1: Topic Header Banner */}
        <header className="w-full pb-8 border-b border-edge flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Subjects', href: '/subjects' },
                { label: 'Topics', href: '/subjects' },
                { label: `#${currentTopic.name}` },
              ]}
            />

            {/* Topic Title with Column Hash Badge */}
            <div className="flex items-center gap-3">
              <span className="bg-ice/40 dark:bg-deep-teal text-navy dark:text-ice px-2.5 py-1 rounded-[8px] font-mono text-[12px] border border-ice/60 dark:border-ice/20 inline-flex items-center gap-1 font-medium">
                <span className="text-proof-green">#</span>topic
              </span>
              <h1 className="text-[32px] sm:text-[44px] font-medium leading-[1.1] tracking-[-0.03em] text-navy dark:text-white lowercase">
                {currentTopic.name}
              </h1>
            </div>

            <p className="text-[15px] sm:text-[16px] text-secondary-ink dark:text-ash leading-relaxed">
              All learning notes, architectural breakdowns, and implementations tagged with{' '}
              <span className="font-mono text-navy dark:text-white bg-white dark:bg-panel px-1.5 py-0.5 rounded-[4px] border border-edge">
                #{currentTopic.name}
              </span>{' '}
              across {currentTopic.domainReach} core subjects.
            </p>
          </div>

          {/* Telemetry Metric Row */}
          <div className="flex items-center gap-4 sm:gap-6 bg-white dark:bg-panel p-4 rounded-[8px] border border-edge shadow-catalog-edge shrink-0">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-ink">
                Total Matches
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[26px] font-medium text-navy dark:text-white leading-none">
                  {currentTopic.count}
                </span>
                <span className="font-mono text-[11px] text-muted-ink">notes</span>
              </div>
            </div>
            <div className="w-px h-8 bg-edge" />
            <div className="flex flex-col">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-ink">
                Domain Reach
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[26px] font-medium text-navy dark:text-white leading-none">
                  0{currentTopic.domainReach}
                </span>
                <span className="font-mono text-[11px] text-muted-ink">subjects</span>
              </div>
            </div>
            <div className="w-px h-8 bg-edge" />
            <div className="flex flex-col">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-ink">
                Last Revision
              </span>
              <span className="font-mono text-[13px] text-body-ink mt-1">
                {currentTopic.lastRevision}
              </span>
            </div>
          </div>
        </header>

        {/* Asymmetric Two-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Feed Column (8 cols) */}
          <section className="lg:col-span-8 space-y-6">
            {/* Filter Tabs */}
            <div className="pb-4 border-b border-edge">
              <FilterBar
                items={subjectFilterItems}
                selectedId={selectedSubjectFilter}
                onSelect={(id) => setSelectedSubjectFilter(id)}
              />
            </div>

            {/* Matching Notes Feed */}
            <div className="space-y-4">
              {matchingNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}

              {matchingNotes.length === 0 && (
                <div className="py-16 text-center rounded-[8px] bg-panel border border-edge">
                  <span className="material-symbols-outlined text-[32px] text-muted-ink">
                    search_off
                  </span>
                  <p className="mt-2 text-[16px] font-medium text-navy dark:text-white">
                    No notes matching this subject filter
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedSubjectFilter('all')}
                    className="btn-primary mt-4 inline-flex items-center justify-center cursor-pointer"
                  >
                    Show All Matching Notes
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Right Sidebar Column (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-20 space-y-6">
              {/* Co-occurring Topics Tag Cloud */}
              <div className="p-5 rounded-[8px] bg-white dark:bg-panel border border-edge shadow-catalog-edge">
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted-ink mb-3 font-semibold">
                  CO-OCCURRING TOPICS
                </div>
                <div className="flex flex-wrap gap-2">
                  {coOccurringTopics.map((item) => (
                    <Link
                      key={item.name}
                      to={`/topics/${item.name}`}
                      className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-canvas dark:bg-[#121620] border border-edge hover:border-navy hover:text-navy dark:hover:text-white transition-all"
                    >
                      <span className="font-mono text-[12px] text-body-ink group-hover:text-navy dark:group-hover:text-white">
                        #{item.name}
                      </span>
                      <span className="font-mono text-[11px] text-muted-ink group-hover:text-navy/80 dark:group-hover:text-white/80">
                        {item.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Related Subjects Cards */}
              <div className="p-5 rounded-[8px] bg-white dark:bg-panel border border-edge shadow-catalog-edge">
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted-ink mb-3 font-semibold">
                  INTERSECTING SUBJECTS
                </div>
                <div className="space-y-2.5">
                  {intersectingSubjects.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/subjects/${sub.slug}`}
                      className="block p-3 rounded-[8px] bg-canvas dark:bg-[#121620] border border-edge hover:border-navy hover:text-navy dark:hover:text-white transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-navy dark:text-ice">
                          {sub.icon}
                        </span>
                        <span className="text-[13px] font-medium text-navy dark:text-white">
                          {sub.name}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-muted-ink mt-1 block">
                        {sub.notesCount} {sub.notesCount === 1 ? 'note' : 'notes'} • {sub.hubNumber}
                      </span>
                    </Link>
                  ))}
                  {intersectingSubjects.length === 0 && (
                    <p className="font-mono text-[12px] text-muted-ink py-1">
                      No intersecting subjects indexed.
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Canonical References */}
              <div className="p-5 rounded-[8px] bg-white dark:bg-panel border border-edge shadow-catalog-edge">
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted-ink mb-3 font-semibold">
                  EXTERNAL SPECS &amp; REFS
                </div>
                <div className="space-y-2 font-mono text-[12px]">
                  <a
                    href="https://www.postgresql.org/docs/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-secondary-ink hover:text-navy dark:hover:text-white py-1 transition-colors"
                  >
                    <span>PostgreSQL 16 Reference Manual</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                  <div className="h-px bg-edge" />
                  <a
                    href="https://github.com/brettwooldridge/HikariCP"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-secondary-ink hover:text-navy dark:hover:text-white py-1 transition-colors"
                  >
                    <span>HikariCP Connection Pool Heuristics</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                  <div className="h-px bg-edge" />
                  <a
                    href="https://www.pgbouncer.org/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-secondary-ink hover:text-navy dark:hover:text-white py-1 transition-colors"
                  >
                    <span>PgBouncer Transaction Pooling Guide</span>
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
