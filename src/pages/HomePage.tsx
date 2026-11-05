import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllNotes, getEnrichedSubjects, getEnrichedTopics } from '../utils/contentLoader';
import { SubjectCard } from '../components/cards/SubjectCard';
import { NoteCard } from '../components/cards/NoteCard';
import { FilterBar, FilterItem } from '../components/interactive/FilterBar';
import { HomeSidebar } from '../components/sidebar/HomeSidebar';
import { useSearchModal } from '../context/SearchModalContext';
import { ReadingProgressBar } from '../components/interactive/ReadingProgressBar';

export const HomePage: React.FC = () => {
  const { openSearch } = useSearchModal();
  const [selectedTopic, setSelectedTopic] = useState('all');

  const allNotes = useMemo(() => getAllNotes(), []);
  const enrichedSubjects = useMemo(() => getEnrichedSubjects(), []);
  const enrichedTopics = useMemo(() => getEnrichedTopics(), []);

  const filterTopics: FilterItem[] = useMemo(() => {
    return [
      { id: 'all', label: 'All Topics' },
      ...enrichedTopics.slice(0, 8).map((t) => ({
        id: t.slug,
        label: `#${t.name}`,
      })),
    ];
  }, [enrichedTopics]);

  const filteredNotes = useMemo(() => {
    if (selectedTopic === 'all') return allNotes;
    return allNotes.filter((n) =>
      n.tags.some((t) => t.toLowerCase() === selectedTopic.toLowerCase())
    );
  }, [selectedTopic, allNotes]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col w-full">
      <ReadingProgressBar />
      {/* SECTION 1: HERO & QUICK-DISCOVERY HEADER */}
      <section className="relative w-full overflow-hidden bg-eggshell py-space-xl lg:py-24">
        {/* Bauhaus subtle geometric ambient background patterns */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-between opacity-40">
          <div className="h-96 w-96 -translate-x-1/2 rounded-full bg-warm-taupe/60 blur-3xl" />
          <div className="h-80 w-80 translate-x-1/3 rounded-full bg-surface-container/50 blur-2xl" />
        </div>

        <div className="mx-auto max-w-7xl px-margin lg:px-margin-desktop">
          {/* Editorial Overline Badge */}
          <div className="mb-space-lg flex items-center gap-space-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-warm-taupe px-3.5 py-1.5 shadow-sm border border-stone/60">
              <span className="text-[14px]">📚</span>
              <span className="font-mono-data text-label-sm uppercase tracking-wider text-graphite font-medium">
                Living Engineering Knowledge Base
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-violet-spark animate-ping" />
            </div>
          </div>

          {/* Whisper-Weight Editorial Headline */}
          <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <h1 className="font-serif text-display-lg text-ink font-light leading-none tracking-tight">
                Documenting systems & architecture.
              </h1>
              <p className="mt-space-lg max-w-2xl font-body-lg text-body-lg text-smoke leading-relaxed">
                A structured repository of hands-on software engineering notes, deep dives, and production post-mortems categorized across core subjects and granular topics.
              </p>
            </div>

            {/* Quick Monospace Metric Indicators */}
            <div className="flex flex-wrap gap-space-sm lg:col-span-4 lg:flex-col lg:items-end">
              <div className="flex items-center gap-3 rounded-xl bg-warm-taupe dark:bg-[#1a1815] px-4 py-2.5 shadow-sm border border-stone/60 dark:border-[#332e27]">
                <span className="font-mono-data text-label-sm text-smoke">ARCHIVE_SIZE:</span>
                <span className="font-mono-data text-label-md font-medium text-ink">{allNotes.length} Notes Published</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-warm-taupe dark:bg-[#1a1815] px-4 py-2.5 shadow-sm border border-stone/60 dark:border-[#332e27]">
                <span className="font-mono-data text-label-sm text-smoke">DOMAIN_TREE:</span>
                <span className="font-mono-data text-label-md font-medium text-ink">{enrichedSubjects.length} Core Subjects</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-warm-taupe dark:bg-[#1a1815] px-4 py-2.5 shadow-sm border border-stone/60 dark:border-[#332e27]">
                <span className="font-mono-data text-label-sm text-smoke">INDEXED_TAGS:</span>
                <span className="font-mono-data text-label-md font-medium text-ink">{enrichedTopics.length} Technical Topics</span>
              </div>
            </div>
          </div>

          {/* Command Palette Trigger & Direct Action CTA */}
          <div className="mt-space-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md">
            <button
              type="button"
              onClick={openSearch}
              className="group flex flex-1 items-center justify-between rounded-xl bg-surface-container-lowest dark:bg-[#1a1815] px-space-lg py-3.5 shadow-sm hover:shadow-md transition-all text-left max-w-xl border border-stone/80 dark:border-[#332e27]"
            >
              <div className="flex items-center gap-space-sm text-smoke group-hover:text-ink transition-colors">
                <span className="material-symbols-outlined text-[20px] text-graphite">search</span>
                <span className="font-mono-data text-body-md text-smoke">Quick search topics, RFCs, internals...</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="rounded bg-warm-taupe dark:bg-[#221f1b] px-2 py-1 font-mono-data text-label-sm text-graphite shadow-sm border border-stone/50 dark:border-[#332e27]">⌘</kbd>
                <kbd className="rounded bg-warm-taupe dark:bg-[#221f1b] px-2 py-1 font-mono-data text-label-sm text-graphite shadow-sm border border-stone/50 dark:border-[#332e27]">K</kbd>
              </div>
            </button>

            <div className="flex items-center gap-space-sm">
              <button
                type="button"
                onClick={() => scrollToSection('core-subjects')}
                className="inline-flex items-center justify-center rounded-full bg-ink px-space-lg py-3 font-label-md text-label-md text-on-primary hover:bg-graphite transition-colors shadow-sm"
              >
                Browse Core Subjects →
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('feed-section')}
                className="inline-flex items-center justify-center rounded-full bg-warm-taupe dark:bg-[#1a1815] px-space-md py-3 font-label-md text-label-md text-ink hover:bg-surface-container transition-colors border border-stone/60 dark:border-[#332e27]"
              >
                Latest Notes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: EXPLORE BY SUBJECT BENTO GRID */}
      <section className="w-full bg-surface-container-lowest dark:bg-[#141210] py-space-xl lg:py-24 border-y border-stone/50 dark:border-[#2e2924]" id="core-subjects">
        <div className="mx-auto max-w-7xl px-margin lg:px-margin-desktop">
          {/* Section Title & Anchor */}
          <div className="mb-space-xl flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
            <div>
              <div className="font-mono-data text-label-sm uppercase tracking-wider text-smoke font-medium">
                TAXONOMY / HIERARCHY
              </div>
              <h2 className="mt-space-xs font-headline-md text-headline-md text-ink font-light">
                Core Technical Subjects
              </h2>
            </div>
            <Link
              to="/subjects"
              className="group inline-flex items-center gap-1 font-label-md text-label-md text-violet-spark hover:underline"
            >
              <span>View all 6 subjects &amp; taxonomy</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* Bento Grid (4 Architectural Panels) */}
          <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-12">
            {enrichedSubjects[0] && (
              <SubjectCard
                subject={enrichedSubjects[0]}
                variant="bento"
                colSpan="lg:col-span-7"
                accentColor="violet"
              />
            )}
            {enrichedSubjects[1] && (
              <SubjectCard
                subject={enrichedSubjects[1]}
                variant="bento"
                colSpan="lg:col-span-5"
                accentColor="orange"
              />
            )}
            {enrichedSubjects[2] && (
              <SubjectCard
                subject={enrichedSubjects[2]}
                variant="bento"
                colSpan="lg:col-span-5"
                accentColor="violet"
              />
            )}
            {enrichedSubjects[3] && (
              <SubjectCard
                subject={enrichedSubjects[3]}
                variant="bento"
                colSpan="lg:col-span-7"
                accentColor="orange"
              />
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3 & 4: ASYMMETRIC FEED (2/3) + STICKY DISCOVERY SIDEBAR (1/3) */}
      <section className="w-full bg-eggshell py-space-xl lg:py-24" id="feed-section">
        <div className="mx-auto max-w-7xl px-margin lg:px-margin-desktop">
          <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-12">
            {/* LEFT COLUMN: TOPIC FILTER & POST FEED (8 COLS) */}
            <div className="lg:col-span-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
                <div>
                  <span className="font-mono-data text-label-sm uppercase tracking-wider text-smoke font-medium">
                    CHRONOLOGICAL FEED
                  </span>
                  <h2 className="font-headline-md text-headline-md text-ink font-light">
                    Recent Technical Notes
                  </h2>
                </div>
                <div className="font-mono-data text-label-sm text-smoke">
                  Showing <span className="text-ink font-medium">{filteredNotes.length}</span> notes
                </div>
              </div>

              {/* Dynamic Topic Filter Pills */}
              <div className="mb-space-lg">
                <FilterBar
                  items={filterTopics}
                  selectedId={selectedTopic}
                  onSelect={(topicId) => setSelectedTopic(topicId)}
                />
              </div>

              {/* Feed Articles List */}
              <div className="space-y-space-md">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onTagClick={(tag) => setSelectedTopic(tag)}
                  />
                ))}

                {/* Empty State Fallback */}
                {filteredNotes.length === 0 && (
                  <div className="py-16 text-center rounded-xl bg-warm-taupe border border-stone">
                    <span className="material-symbols-outlined text-[32px] text-smoke">
                      search_off
                    </span>
                    <p className="mt-2 font-headline-sm text-headline-sm text-ink">
                      No notes match this filter
                    </p>
                    <p className="font-body-md text-body-md text-smoke mt-1">
                      Try selecting another topic tag or resetting the filter.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedTopic('all')}
                      className="mt-4 rounded-full bg-ink px-4 py-2 font-label-md text-label-md text-on-primary hover:bg-graphite transition-colors shadow-sm"
                    >
                      Show All Notes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: STICKY DISCOVERY SIDEBAR (4 COLS) */}
            <HomeSidebar
              activeTopic={selectedTopic}
              onSelectTopic={(tag) => {
                setSelectedTopic(tag);
                scrollToSection('feed-section');
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
