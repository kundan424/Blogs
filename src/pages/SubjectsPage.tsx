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
    <div className="w-full bg-canvas text-ink min-h-screen py-10 transition-colors">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 space-y-10">
        {/* ZONE 1: Page Header & Global Summary Bar */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end pb-8 gap-6 border-b border-edge/80 dark:border-stone/30">
          <div className="space-y-3 max-w-2xl">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Subjects' },
              ]}
            />
            <h1 className="text-[32px] sm:text-[42px] font-normal leading-tight tracking-tight text-strong dark:text-white">
              Subjects &amp; Knowledge Domains
            </h1>
            <p className="text-[15px] leading-relaxed text-muted dark:text-ash">
              Foundational engineering pillars categorizing in-depth architectural RFCs, production runbooks, internals, and implementation notes.
            </p>
          </div>

          {/* Aggregated Metrics Row */}
          <div className="flex items-center gap-6 sm:gap-8 self-stretch md:self-auto justify-between md:justify-end pt-4 md:pt-0">
            <div className="flex flex-col">
              <span className="text-[28px] sm:text-[32px] font-normal text-strong dark:text-white leading-none">
                {subjects.length}
              </span>
              <span className="font-mono text-[12px] text-muted dark:text-ash mt-1">
                Total Subjects
              </span>
            </div>
            <div className="h-8 w-px bg-edge/80 dark:bg-stone/30" />
            <div className="flex flex-col">
              <span className="text-[28px] sm:text-[32px] font-normal text-strong dark:text-white leading-none">
                {allNotes.length}
              </span>
              <span className="font-mono text-[12px] text-muted dark:text-ash mt-1">
                Published Notes
              </span>
            </div>
            <div className="h-8 w-px bg-edge/80 dark:bg-stone/30" />
            <div className="flex flex-col">
              <span className="text-[28px] sm:text-[32px] font-normal text-strong dark:text-white leading-none">
                {seriesList.length}
              </span>
              <span className="font-mono text-[12px] text-muted dark:text-ash mt-1">
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
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="font-mono text-[12px] text-muted dark:text-ash mr-1 hidden md:inline">
              Sort:
            </span>
            <button
              type="button"
              onClick={() => setSortBy('notes')}
              className={`h-[36px] px-[16px] rounded-full text-[13px] font-mono transition-all border cursor-pointer ${
                sortBy === 'notes'
                  ? 'bg-[#191818] text-white border-[#191818] dark:bg-white dark:text-[#191818] shadow-xs'
                  : 'bg-transparent text-muted dark:text-ash border-edge hover:border-filter-edge dark:border-stone/40 hover:text-strong dark:hover:text-white'
              }`}
            >
              Most Notes
            </button>
            <button
              type="button"
              onClick={() => setSortBy('updated')}
              className={`h-[36px] px-[16px] rounded-full text-[13px] font-mono transition-all border cursor-pointer ${
                sortBy === 'updated'
                  ? 'bg-[#191818] text-white border-[#191818] dark:bg-white dark:text-[#191818] shadow-xs'
                  : 'bg-transparent text-muted dark:text-ash border-edge hover:border-filter-edge dark:border-stone/40 hover:text-strong dark:hover:text-white'
              }`}
            >
              Recently Updated
            </button>
            <button
              type="button"
              onClick={() => setSortBy('alpha')}
              className={`h-[36px] px-[16px] rounded-full text-[13px] font-mono transition-all border cursor-pointer ${
                sortBy === 'alpha'
                  ? 'bg-[#191818] text-white border-[#191818] dark:bg-white dark:text-[#191818] shadow-xs'
                  : 'bg-transparent text-muted dark:text-ash border-edge hover:border-filter-edge dark:border-stone/40 hover:text-strong dark:hover:text-white'
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
            <div className="py-16 text-center rounded-[20px] bg-preview dark:bg-[#1a1815] border border-edge/80 dark:border-stone/30">
              <span className="material-symbols-outlined text-[36px] text-muted">
                search_off
              </span>
              <p className="mt-3 text-[18px] font-normal text-strong dark:text-white">
                No subjects found matching "{searchQuery}"
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ backgroundColor: '#ff3c00', color: '#ffffff' }}
                className="btn-primary-accent mt-4 rounded-[8px] bg-[#ff3c00] px-5 py-2.5 text-[14px] text-white hover:bg-[#e03500] hover:opacity-95 transition-all cursor-pointer font-medium shadow-xs"
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
