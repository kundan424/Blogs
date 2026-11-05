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
    <div className="w-full bg-eggshell min-h-screen py-8">
      <div className="max-w-6xl w-full mx-auto px-4 md:px-8 space-y-8">
        {/* Zone 1: Topic Header Banner */}
        <header className="w-full pb-6 border-b border-stone flex flex-col md:flex-row md:items-end justify-between gap-6">
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

            {/* Topic Title with Bauhaus Hash Badge */}
            <div className="flex items-center gap-3">
              <span className="bg-warm-taupe text-ink shadow-[0_0_0_1px_#ebe8e4] px-2.5 py-1 rounded-full font-mono-data text-mono-data inline-flex items-center gap-1">
                <span className="text-ember-orange">#</span>topic
              </span>
              <h1 className="font-headline-xl text-headline-xl text-ink tracking-tight font-light lowercase">
                {currentTopic.name}
              </h1>
            </div>

            <p className="font-body-md text-body-md text-smoke leading-relaxed">
              All learning notes, architectural breakdowns, and implementations tagged with{' '}
              <span className="font-mono-data text-ink bg-warm-taupe px-1.5 py-0.5 rounded text-label-sm border border-stone">
                #{currentTopic.name}
              </span>{' '}
              across {currentTopic.domainReach} core subjects.
            </p>
          </div>

          {/* Telemetry Metric Row */}
          <div className="flex items-center gap-4 sm:gap-6 bg-surface-container-lowest dark:bg-[#1a1815] p-3.5 rounded-xl shadow-[0_0_0_1px_#ebe8e4] dark:shadow-[0_0_0_1px_#332e27] shrink-0 border border-stone dark:border-[#332e27]">
            <div className="flex flex-col">
              <span className="font-mono-data text-label-sm text-smoke uppercase tracking-wider">
                Total Matches
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-headline-sm text-headline-sm text-ink font-light">
                  {currentTopic.count}
                </span>
                <span className="font-mono-data text-label-sm text-smoke">notes</span>
              </div>
            </div>
            <div className="w-px h-8 bg-stone dark:bg-[#332e27]" />
            <div className="flex flex-col">
              <span className="font-mono-data text-label-sm text-smoke uppercase tracking-wider">
                Domain Reach
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-headline-sm text-headline-sm text-ink font-light">
                  0{currentTopic.domainReach}
                </span>
                <span className="font-mono-data text-label-sm text-smoke">subjects</span>
              </div>
            </div>
            <div className="w-px h-8 bg-stone dark:bg-[#332e27]" />
            <div className="flex flex-col">
              <span className="font-mono-data text-label-sm text-smoke uppercase tracking-wider">
                Last Revision
              </span>
              <span className="font-mono-data text-mono-data text-ink mt-1">
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
            <div className="pb-4 border-b border-stone dark:border-[#332e27]">
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
                <div className="py-16 text-center rounded-xl bg-warm-taupe dark:bg-[#1a1815] border border-stone dark:border-[#332e27]">
                  <span className="material-symbols-outlined text-[32px] text-smoke">
                    search_off
                  </span>
                  <p className="mt-2 font-headline-sm text-headline-sm text-ink">
                    No notes matching this subject filter
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedSubjectFilter('all')}
                    className="mt-4 rounded-full bg-ink px-4 py-2 font-label-md text-label-md text-on-primary hover:bg-graphite transition-colors shadow-sm"
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
              <div className="p-space-lg rounded-xl bg-warm-taupe dark:bg-[#1a1815] border border-stone/80 dark:border-[#332e27] shadow-sm">
                <div className="font-mono-data text-label-sm uppercase tracking-wider text-smoke mb-3 font-semibold">
                  CO-OCCURRING TOPICS
                </div>
                <div className="flex flex-wrap gap-2">
                  {coOccurringTopics.map((item) => (
                    <Link
                      key={item.name}
                      to={`/topics/${item.name}`}
                      className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest dark:bg-[#201d19] border border-stone/50 dark:border-[#332e27] hover:bg-ink hover:text-white transition-colors"
                    >
                      <span className="font-mono-data text-label-sm">
                        #{item.name}
                      </span>
                      <span className="font-mono-data text-[11px] text-smoke group-hover:text-white/80">
                        {item.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Related Subjects Cards */}
              <div className="p-space-lg rounded-xl bg-surface-container-lowest dark:bg-[#1a1815] border border-stone/80 dark:border-[#332e27] shadow-sm">
                <div className="font-mono-data text-label-sm uppercase tracking-wider text-smoke mb-3 font-semibold">
                  INTERSECTING SUBJECTS
                </div>
                <div className="space-y-3">
                  {intersectingSubjects.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/subjects/${sub.slug}`}
                      className="block p-3 rounded-lg bg-warm-taupe dark:bg-[#201d19] border border-stone/50 dark:border-[#332e27] hover:bg-stone/60 dark:hover:bg-[#282420] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-ink">
                          {sub.icon}
                        </span>
                        <span className="font-label-md text-label-md font-medium text-ink">
                          {sub.name}
                        </span>
                      </div>
                      <span className="font-mono-data text-label-sm text-smoke mt-1 block">
                        {sub.notesCount} {sub.notesCount === 1 ? 'note' : 'notes'} • {sub.hubNumber}
                      </span>
                    </Link>
                  ))}
                  {intersectingSubjects.length === 0 && (
                    <p className="font-mono-data text-label-sm text-smoke py-1">
                      No intersecting subjects indexed.
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Canonical References */}
              <div className="p-space-lg rounded-xl bg-warm-taupe dark:bg-[#1a1815] border border-stone/80 dark:border-[#332e27] shadow-sm">
                <div className="font-mono-data text-label-sm uppercase tracking-wider text-smoke mb-3 font-semibold">
                  EXTERNAL SPECS &amp; REFS
                </div>
                <div className="space-y-2 font-mono-data text-label-sm">
                  <a
                    href="https://www.postgresql.org/docs/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-graphite hover:text-ink hover:underline py-1"
                  >
                    <span>PostgreSQL 16 Reference Manual</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                  <div className="h-px bg-stone dark:bg-[#332e27]" />
                  <a
                    href="https://github.com/brettwooldridge/HikariCP"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-graphite hover:text-ink hover:underline py-1"
                  >
                    <span>HikariCP Connection Pool Heuristics</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                  <div className="h-px bg-stone dark:bg-[#332e27]" />
                  <a
                    href="https://www.pgbouncer.org/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-graphite hover:text-ink hover:underline py-1"
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
