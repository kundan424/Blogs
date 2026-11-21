import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { topics } from '../data/topics';
import { getEnrichedTopics, getTopicBySlug, getSubjectBySlug, getAllNotes } from '../utils/contentLoader';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { NoteCard } from '../components/cards/NoteCard';
import { FilterBar, FilterItem } from '../components/interactive/FilterBar';
import { EndpointCapsule } from '../components/common/EndpointCapsule';

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
    <div className="w-full bg-bright-white dark:bg-[#161616] text-[#161616] dark:text-[#fafafa] min-h-screen py-10 transition-colors">
      <div className="max-w-[1190px] w-full mx-auto px-6 space-y-10">
        
        {/* Zone 1: Topic Header Banner */}
        <header className="p-8 sm:p-10 rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Subjects', href: '/subjects' },
                { label: 'Topics', href: '/subjects' },
                { label: `#${currentTopic.name}` },
              ]}
            />

            <div className="flex items-center gap-3">
              <EndpointCapsule>
                #{currentTopic.name}
              </EndpointCapsule>
            </div>

            <h1 className="heading-xl text-[#161616] dark:text-[#fafafa] lowercase">
              #{currentTopic.name}
            </h1>

            <p className="font-sans text-[16px] text-[#616161] dark:text-[#a3a3a3] leading-[1.35]">
              All learning notes, architectural breakdowns, and implementations tagged with{' '}
              <span className="font-mono text-[#161616] dark:text-[#fafafa] bg-bright-white dark:bg-[#161616] px-2 py-0.5 rounded-full border border-[#d9d9d9] dark:border-[#333333]">
                #{currentTopic.name}
              </span>{' '}
              across {currentTopic.domainReach} core subjects.
            </p>
          </div>

          {/* Telemetry Metric Row */}
          <div className="flex items-center gap-5 sm:gap-7 bg-bright-white dark:bg-[#161616] p-5 rounded-[20px] border border-[#d9d9d9] dark:border-[#333333] shrink-0">
            <div className="flex flex-col items-center text-center min-w-[80px]">
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-sans text-[32px] font-medium text-[#161616] dark:text-[#fafafa] leading-none text-center">
                  {currentTopic.count}
                </span>
                <span className="font-mono text-[11px] uppercase text-[#8f8f8f]">notes</span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] mt-1.5 text-center">
                Total Matches
              </span>
            </div>
            <div className="w-px h-10 bg-[#d9d9d9] dark:bg-[#333333]" />
            <div className="flex flex-col items-center text-center min-w-[80px]">
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-sans text-[32px] font-medium text-[#161616] dark:text-[#fafafa] leading-none text-center">
                  0{currentTopic.domainReach}
                </span>
                <span className="font-mono text-[11px] uppercase text-[#8f8f8f]">domains</span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] mt-1.5 text-center">
                Domain Reach
              </span>
            </div>
            <div className="w-px h-10 bg-[#d9d9d9] dark:bg-[#333333]" />
            <div className="flex flex-col items-center text-center min-w-[80px]">
              <span className="font-mono text-[13px] font-medium text-[#161616] dark:text-[#fafafa] text-center">
                {currentTopic.lastRevision}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] mt-1.5 text-center">
                Last Revision
              </span>
            </div>
          </div>
        </header>

        {/* Asymmetric Two-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Feed Column (8 cols) */}
          <section className="lg:col-span-8 space-y-6">
            {/* Filter Tabs */}
            <div className="pb-3 border-b border-[#d9d9d9] dark:border-[#333333]">
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
                <div className="py-16 text-center rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] p-8">
                  <span className="material-symbols-outlined text-[32px] text-[#161616] dark:text-[#fafafa]">
                    search_off
                  </span>
                  <p className="mt-2 text-[16px] font-medium text-[#161616] dark:text-[#fafafa]">
                    No notes matching this subject filter
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedSubjectFilter('all')}
                    className="btn-primary mt-4"
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
              <div className="p-6 rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333]">
                <div className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] mb-3 font-medium">
                  CO-OCCURRING TOPICS
                </div>
                <div className="flex flex-wrap gap-2">
                  {coOccurringTopics.map((item) => (
                    <Link
                      key={item.name}
                      to={`/topics/${item.name}`}
                      className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bright-white dark:bg-[#161616] border border-[#d9d9d9] dark:border-[#333333] hover:border-[#161616] dark:hover:border-[#ffffff] transition-all"
                    >
                      <span className="font-mono text-[12px] text-[#161616] dark:text-[#fafafa] group-hover:text-[#161616] dark:group-hover:text-[#ffffff] group-hover:underline">
                        #{item.name}
                      </span>
                      <span className="font-mono text-[10.5px] text-[#8f8f8f]">
                        {item.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Related Subjects Cards */}
              <div className="p-6 rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333]">
                <div className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] mb-3 font-medium">
                  INTERSECTING SUBJECTS
                </div>
                <div className="space-y-2">
                  {intersectingSubjects.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/subjects/${sub.slug}`}
                      className="block p-3 rounded-[16px] bg-bright-white dark:bg-[#161616] border border-[#d9d9d9] dark:border-[#333333] hover:border-[#161616] dark:hover:border-[#ffffff] transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#161616] dark:text-[#fafafa]">
                          {sub.icon}
                        </span>
                        <span className="text-[13.5px] font-medium text-[#161616] dark:text-[#fafafa] group-hover:text-[#161616] dark:group-hover:text-[#ffffff] group-hover:underline">
                          {sub.name}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[#8f8f8f] mt-1 block uppercase tracking-[0.02em]">
                        {sub.notesCount} {sub.notesCount === 1 ? 'note' : 'notes'} • {sub.hubNumber}
                      </span>
                    </Link>
                  ))}
                  {intersectingSubjects.length === 0 && (
                    <p className="font-mono text-[12px] text-[#8f8f8f] py-1">
                      No intersecting subjects indexed.
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Canonical References */}
              <div className="p-6 rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333]">
                <div className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] mb-3 font-medium">
                  EXTERNAL SPECS &amp; REFS
                </div>
                <div className="space-y-2 font-mono text-[12px]">
                  <a
                    href="https://www.postgresql.org/docs/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-[#616161] hover:text-[#161616] dark:hover:text-[#ffffff] dark:text-[#a3a3a3] py-1 transition-colors"
                  >
                    <span>PostgreSQL 16 Reference Manual</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                  <div className="h-px bg-[#d9d9d9] dark:bg-[#333333]" />
                  <a
                    href="https://github.com/brettwooldridge/HikariCP"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-[#616161] hover:text-[#161616] dark:hover:text-[#ffffff] dark:text-[#a3a3a3] py-1 transition-colors"
                  >
                    <span>HikariCP Connection Pool Heuristics</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                  <div className="h-px bg-[#d9d9d9] dark:bg-[#333333]" />
                  <a
                    href="https://www.pgbouncer.org/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-[#616161] hover:text-[#161616] dark:hover:text-[#ffffff] dark:text-[#a3a3a3] py-1 transition-colors"
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
