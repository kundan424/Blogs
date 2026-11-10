import React, { useState, useMemo } from 'react';
import { getEnrichedSubjects, getAllNotes } from '../utils/contentLoader';
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
    <div className="w-full bg-canvas text-body-ink min-h-screen py-10 transition-colors">
      <div className="max-w-column mx-auto w-full px-5 space-y-10">
        {/* ZONE 1: Page Header & Global Summary Bar */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end pb-8 gap-6 border-b border-edge">
          <div className="space-y-3 max-w-2xl">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Subjects' },
              ]}
            />
            <div className="column-eyebrow text-muted-ink">DOMAIN DIRECTORY</div>
            <h1 className="text-[32px] sm:text-[44px] font-medium leading-[1.1] tracking-[-0.03em] text-navy dark:text-white">
              Subjects &amp; Knowledge Domains
            </h1>
            <p className="text-[15px] sm:text-[16px] leading-relaxed text-secondary-ink dark:text-ash">
              Foundational engineering pillars categorizing in-depth architectural RFCs, production runbooks, internals, and implementation notes.
            </p>
          </div>

          {/* Aggregated Metrics Row */}
          <div className="flex items-center gap-6 sm:gap-8 self-stretch md:self-auto justify-between md:justify-end pt-4 md:pt-0">
            <div className="flex flex-col">
              <span className="text-[28px] sm:text-[32px] font-medium text-navy dark:text-white leading-none">
                {subjects.length}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-ink mt-1.5">
                Total Subjects
              </span>
            </div>
            <div className="h-8 w-px bg-edge" />
            <div className="flex flex-col">
              <span className="text-[28px] sm:text-[32px] font-medium text-proof-green leading-none">
                {allNotes.length}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-ink mt-1.5">
                Published Notes
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
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-ink mr-1 shrink-0 inline">
              Sort:
            </span>
            <button
              type="button"
              onClick={() => setSortBy('notes')}
              className={`h-[36px] px-4 rounded-[8px] text-[13px] font-mono transition-all border cursor-pointer select-none inline-flex items-center justify-center ${
                sortBy === 'notes'
                  ? 'bg-gradient-to-r from-[#3e5199] to-[#5568ad] text-white border-[#3e5199] shadow-sm font-semibold'
                  : 'bg-white dark:bg-panel text-body-ink border-edge hover:border-[#3e5199] hover:text-[#3e5199] hover:bg-[#3e5199]/5 shadow-xs'
              }`}
            >
              <span>Most Notes</span>
            </button>
            <button
              type="button"
              onClick={() => setSortBy('updated')}
              className={`h-[36px] px-4 rounded-[8px] text-[13px] font-mono transition-all border cursor-pointer select-none inline-flex items-center justify-center ${
                sortBy === 'updated'
                  ? 'bg-gradient-to-r from-[#3e5199] to-[#5568ad] text-white border-[#3e5199] shadow-sm font-semibold'
                  : 'bg-white dark:bg-panel text-body-ink border-edge hover:border-[#3e5199] hover:text-[#3e5199] hover:bg-[#3e5199]/5 shadow-xs'
              }`}
            >
              <span>Recently Updated</span>
            </button>
            <button
              type="button"
              onClick={() => setSortBy('alpha')}
              className={`h-[36px] px-4 rounded-[8px] text-[13px] font-mono transition-all border cursor-pointer select-none inline-flex items-center justify-center ${
                sortBy === 'alpha'
                  ? 'bg-gradient-to-r from-[#3e5199] to-[#5568ad] text-white border-[#3e5199] shadow-sm font-semibold'
                  : 'bg-white dark:bg-panel text-body-ink border-edge hover:border-[#3e5199] hover:text-[#3e5199] hover:bg-[#3e5199]/5 shadow-xs'
              }`}
            >
              <span>Alphabetical (A-Z)</span>
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
            <div className="py-16 text-center rounded-[12px] bg-panel border border-edge">
              <span className="material-symbols-outlined text-[36px] text-muted-ink">
                search_off
              </span>
              <p className="mt-3 text-[18px] font-medium text-navy dark:text-white">
                No subjects found matching "{searchQuery}"
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="btn-primary mt-4 cursor-pointer inline-flex items-center justify-center"
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
