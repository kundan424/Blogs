import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEnrichedSubjects, getSubjectBySlug, getAllNotes } from '../utils/contentLoader';
import { seriesList } from '../data/series';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { NoteCard } from '../components/cards/NoteCard';
import { FilterBar, FilterItem } from '../components/interactive/FilterBar';
import { SeriesCard } from '../components/cards/SeriesCard';

export const SubjectHubPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const currentSubject = useMemo(() => {
    return (
      (slug ? getSubjectBySlug(slug) : undefined) ||
      getEnrichedSubjects()[0]
    );
  }, [slug]);

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
    <div className="w-full bg-eggshell min-h-screen py-8">
      <div className="max-w-6xl mx-auto w-full px-margin md:px-margin-desktop space-y-space-xl">
        {/* Zone 1: Subject Banner Header */}
        <header className="w-full pb-space-lg border-b border-stone">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Home', href: '/', icon: 'home' },
              { label: 'Subjects', href: '/subjects' },
              { label: currentSubject.name },
            ]}
            className="mb-space-md"
          />

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-space-lg">
            {/* Identity */}
            <div className="space-y-space-sm max-w-2xl">
              <div className="flex items-center gap-space-sm">
                <span className="w-9 h-9 rounded-lg bg-ink text-eggshell flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">
                    {currentSubject.icon}
                  </span>
                </span>
                <span className="font-mono-data text-label-sm uppercase tracking-wider text-violet-spark bg-tertiary-fixed px-2.5 py-0.5 rounded-full font-medium">
                  {currentSubject.hubNumber}
                </span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-ink font-light tracking-tight">
                {currentSubject.name}
              </h1>
              <p className="font-body-lg text-body-lg text-graphite leading-relaxed">
                {currentSubject.description}
              </p>
            </div>

            {/* Metrics Overview Panel */}
            <div className="flex flex-row flex-wrap sm:flex-nowrap items-stretch gap-space-md p-space-sm bg-warm-taupe dark:bg-[#1a1815] rounded-xl shrink-0 self-start shadow-sm border border-stone dark:border-[#332e27]">
              <div className="px-space-md py-space-xs flex flex-col justify-center">
                <span className="font-headline-md text-headline-md text-ink font-light leading-none">
                  {currentSubject.notesCount}
                </span>
                <span className="font-mono-data text-label-sm text-smoke mt-1">
                  Notes Published
                </span>
              </div>
              <div className="w-px bg-stone dark:bg-[#332e27] my-1" />
              <div className="px-space-md py-space-xs flex flex-col justify-center">
                <span className="font-headline-md text-headline-md text-ink font-light leading-none">
                  {currentSubject.topicsCount.toString().padStart(2, '0')}
                </span>
                <span className="font-mono-data text-label-sm text-smoke mt-1">
                  Sub-Topics
                </span>
              </div>
              <div className="w-px bg-stone dark:bg-[#332e27] my-1" />
              <div className="px-space-md py-space-xs flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-ember-orange" />
                  <span className="font-mono-data text-mono-data text-ink">
                    {currentSubject.lastRevision}
                  </span>
                </div>
                <span className="font-mono-data text-label-sm text-smoke mt-1">
                  Last Revision
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Two-Column Asymmetric Bauhaus Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* Main Feed Column */}
          <section className="lg:col-span-8 space-y-space-lg">
            {/* Zone 2: Interactive Controls & Filters */}
            <div className="space-y-space-md bg-warm-taupe dark:bg-[#1a1815] p-space-md rounded-xl border border-stone dark:border-[#332e27]">
              <div className="flex items-center justify-between pb-2 border-b border-stone/60 dark:border-[#332e27]">
                <span className="font-mono-data text-label-sm uppercase tracking-wider text-graphite font-medium">
                  FILTER SUB-TOPICS
                </span>
                <span className="font-mono-data text-label-sm text-smoke">
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
                <div className="py-16 text-center rounded-xl bg-warm-taupe dark:bg-[#1a1815] border border-stone dark:border-[#332e27]">
                  <span className="material-symbols-outlined text-[32px] text-smoke">
                    search_off
                  </span>
                  <p className="mt-2 font-headline-sm text-headline-sm text-ink">
                    No notes found in this sub-topic
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedTag('all')}
                    className="mt-4 rounded-full bg-ink text-on-primary px-4 py-2 font-label-md text-label-md hover:bg-graphite transition-colors shadow-sm"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Right Sidebar Column */}
          <aside className="lg:col-span-4 space-y-space-lg">
            <div className="sticky top-20 space-y-space-lg">
              {/* Domain Curator Card */}
              <div className="p-space-lg rounded-xl bg-warm-taupe dark:bg-[#1a1815] border border-stone/80 dark:border-[#332e27] shadow-sm">
                <div className="font-mono-data text-label-sm uppercase tracking-wider text-smoke mb-3">
                  DOMAIN CURATOR
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-ink text-on-primary flex items-center justify-center font-mono-data text-label-md font-semibold ring-1 ring-stone dark:ring-[#332e27]">
                    K
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md font-medium text-ink">
                      Kundan
                    </h4>
                    <span className="font-mono-data text-label-sm text-smoke block">
                      Software Engineer @ Core Architecture
                    </span>
                  </div>
                </div>
                <p className="mt-3 font-body-sm text-body-sm text-smoke leading-relaxed border-t border-stone/60 dark:border-[#332e27] pt-3">
                  Author &amp; Curator focusing on backend architecture, distributed systems, memory models, and performance tuning.
                </p>
              </div>

              {/* Sub-Topics Breakdown List */}
              <div className="p-space-lg rounded-xl bg-warm-taupe dark:bg-[#1a1815] border border-stone/80 dark:border-[#332e27] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-title-md text-title-md text-ink">
                    Sub-Topics Breakdown
                  </h4>
                  <span className="font-mono-data text-label-sm text-smoke">
                    {subTopicsBreakdown.length} Topics
                  </span>
                </div>
                <div className="space-y-2.5">
                  {subTopicsBreakdown.map(({ topic, count }) => (
                    <Link
                      key={topic}
                      to={`/topics/${topic}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest dark:bg-[#201d19] border border-stone/50 dark:border-[#332e27] hover:bg-ink hover:text-white group transition-colors"
                    >
                      <span className="font-mono-data text-label-sm text-graphite group-hover:text-white">
                        #{topic}
                      </span>
                      <span className="font-mono-data text-label-sm text-smoke group-hover:text-white/80">
                        {count} {count === 1 ? 'note' : 'notes'}
                      </span>
                    </Link>
                  ))}
                  {subTopicsBreakdown.length === 0 && (
                    <p className="text-smoke font-mono-data text-label-sm py-2">
                      No sub-topics indexed in this domain yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Featured Series in this Domain */}
              {seriesList[1] && <SeriesCard series={seriesList[1]} />}

              {/* Subject References Links */}
              <div className="p-space-lg rounded-xl bg-surface-container-lowest dark:bg-[#1a1815] border border-stone/80 dark:border-[#332e27] shadow-sm">
                <div className="font-mono-data text-label-sm uppercase tracking-wider text-smoke mb-3">
                  CANONICAL REFERENCES
                </div>
                <div className="space-y-2 font-mono-data text-label-sm">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-graphite hover:text-ink hover:underline py-1"
                  >
                    <span>Spring Framework 6.x Javadoc</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                  <div className="h-px bg-stone dark:bg-[#332e27]" />
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-graphite hover:text-ink hover:underline py-1"
                  >
                    <span>Redis Raft Consensus Specification</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                  <div className="h-px bg-stone dark:bg-[#332e27]" />
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-graphite hover:text-ink hover:underline py-1"
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
