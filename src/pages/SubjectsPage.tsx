import React, { useState, useMemo } from 'react';
import { getEnrichedSubjects, getAllNotes } from '../utils/contentLoader';
import { seriesList } from '../data/series';
import { SubjectCard } from '../components/cards/SubjectCard';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { SearchInput } from '../components/common/SearchInput';

export const SubjectsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'notes' | 'updated' | 'alpha'>('notes');

  const subjects = useMemo(() => getEnrichedSubjects(), []);
  const allNotes = useMemo(() => getAllNotes(), []);

  const filteredAndSortedSubjects = useMemo(() => {
    let result = subjects.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.featuredTopics.some((t) => t.toLowerCase().includes(q))
      );
    });

    if (sortBy === 'notes') {
      result = [...result].sort((a, b) => b.notesCount - a.notesCount);
    } else if (sortBy === 'updated') {
      result = [...result].sort((a, b) => a.updatedDaysAgo - b.updatedDaysAgo);
    } else if (sortBy === 'alpha') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [subjects, searchQuery, sortBy]);

  return (
    <div className="w-full bg-eggshell min-h-screen py-10">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 space-y-10">
        {/* ZONE 1: Page Header & Global Summary Bar */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end pb-8 gap-6 border-b border-stone">
          <div className="space-y-3 max-w-2xl">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Subjects' },
              ]}
            />
            <h1 className="font-headline-xl text-headline-xl text-ink font-light tracking-tight">
              Subjects &amp; Knowledge Domains
            </h1>
            <p className="font-body-md text-body-md text-smoke leading-relaxed">
              Foundational engineering pillars categorizing in-depth architectural RFCs, production runbooks, internals, and implementation notes.
            </p>
          </div>

          {/* Aggregated Metrics Row */}
          <div className="flex items-center gap-6 sm:gap-8 self-stretch md:self-auto justify-between md:justify-end pt-4 md:pt-0">
            <div className="flex flex-col">
              <span className="font-headline-lg text-headline-lg text-ink font-light leading-none">
                {subjects.length}
              </span>
              <span className="font-mono-data text-label-sm text-smoke mt-1">
                Total Subjects
              </span>
            </div>
            <div className="h-8 w-px bg-stone" />
            <div className="flex flex-col">
              <span className="font-headline-lg text-headline-lg text-ink font-light leading-none">
                {allNotes.length}
              </span>
              <span className="font-mono-data text-label-sm text-smoke mt-1">
                Published Notes
              </span>
            </div>
            <div className="h-8 w-px bg-stone" />
            <div className="flex flex-col">
              <span className="font-headline-lg text-headline-lg text-ink font-light leading-none">
                {seriesList.length}
              </span>
              <span className="font-mono-data text-label-sm text-smoke mt-1">
                Active Series
              </span>
            </div>
          </div>
        </section>

        {/* ZONE 2: Filter & View Control Bar */}
        <section className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 py-2">
          {/* Search Input */}
          <div className="w-full sm:w-80">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Filter subjects or sub-topics..."
              shortcutBadge="ESC"
              onClear={() => setSearchQuery('')}
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="font-mono-data text-label-sm text-smoke mr-2 hidden md:inline">
              Sort:
            </span>
            <button
              type="button"
              onClick={() => setSortBy('notes')}
              className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-colors ${
                sortBy === 'notes'
                  ? 'bg-ink text-white font-medium shadow-sm'
                  : 'bg-warm-taupe text-smoke hover:text-ink hover:bg-stone/50'
              }`}
            >
              Most Notes
            </button>
            <button
              type="button"
              onClick={() => setSortBy('updated')}
              className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-colors ${
                sortBy === 'updated'
                  ? 'bg-ink text-white font-medium shadow-sm'
                  : 'bg-warm-taupe text-smoke hover:text-ink hover:bg-stone/50'
              }`}
            >
              Recently Updated
            </button>
            <button
              type="button"
              onClick={() => setSortBy('alpha')}
              className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-colors ${
                sortBy === 'alpha'
                  ? 'bg-ink text-white font-medium shadow-sm'
                  : 'bg-warm-taupe text-smoke hover:text-ink hover:bg-stone/50'
              }`}
            >
              Alphabetical (A-Z)
            </button>
          </div>
        </section>

        {/* ZONE 3: Primary Subject Directory Grid */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedSubjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} variant="directory" />
            ))}
          </div>

          {filteredAndSortedSubjects.length === 0 && (
            <div className="py-16 text-center rounded-2xl bg-warm-taupe border border-stone">
              <span className="material-symbols-outlined text-[32px] text-smoke">
                search_off
              </span>
              <p className="mt-2 font-headline-sm text-headline-sm text-ink">
                No subjects found matching "{searchQuery}"
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 rounded-full bg-ink px-4 py-2 font-label-md text-label-md text-on-primary hover:bg-graphite transition-colors shadow-sm"
              >
                Reset Search
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
