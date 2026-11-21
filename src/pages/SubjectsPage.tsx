import React, { useState, useMemo } from 'react';
import { getEnrichedSubjects, getAllNotes } from '../utils/contentLoader';
import { SubjectCard } from '../components/cards/SubjectCard';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { SearchInput } from '../components/common/SearchInput';
import { EndpointCapsule } from '../components/common/EndpointCapsule';

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
    <div className="w-full bg-bright-white dark:bg-[#161616] text-[#161616] dark:text-[#fafafa] min-h-screen py-10 transition-colors">
      <div className="max-w-[1190px] mx-auto w-full px-6 space-y-10">
        
        {/* ZONE 1: Page Header with Dotted Workbench & Telemetry Row */}
        <section className="p-8 sm:p-10 rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Subjects' },
              ]}
            />
            <EndpointCapsule>DOMAIN DIRECTORY</EndpointCapsule>
            <h1 className="heading-xl text-[#161616] dark:text-[#fafafa]">
              Subjects &amp; Knowledge Domains
            </h1>
            <p className="font-sans text-[16px] text-[#616161] dark:text-[#a3a3a3] leading-[1.35]">
              Foundational engineering pillars categorizing in-depth architectural RFCs, production runbooks, internals, and implementation notes.
            </p>
          </div>

          {/* Aggregated Metrics Row (Centered numbers and mono labels) */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 self-stretch md:self-auto p-5 rounded-[20px] bg-bright-white dark:bg-[#161616] border border-[#d9d9d9] dark:border-[#333333] shrink-0">
            <div className="flex flex-col items-center text-center min-w-[80px]">
              <span className="font-sans text-[36px] font-medium text-[#161616] dark:text-[#fafafa] leading-none text-center">
                {subjects.length}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] mt-1.5 text-center">
                Total Domains
              </span>
            </div>
            <div className="h-10 w-px bg-[#d9d9d9] dark:bg-[#333333]" />
            <div className="flex flex-col items-center text-center min-w-[100px]">
              <span className="font-sans text-[36px] font-medium text-[#161616] dark:text-[#fafafa] leading-none text-center">
                {allNotes.length}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] mt-1.5 text-center">
                Published Notes
              </span>
            </div>
          </div>
        </section>

        {/* ZONE 2: Filter & View Control Bar */}
        <section className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 py-1">
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

          {/* Sort Controls (42px pill buttons) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
            <span className="font-mono text-[11.5px] uppercase tracking-[0.02em] text-[#8f8f8f] mr-1 shrink-0 inline">
              Sort:
            </span>
            <button
              type="button"
              onClick={() => setSortBy('notes')}
              className={`h-[42px] px-4 rounded-full font-mono text-[12.5px] uppercase tracking-[0.02em] transition-all cursor-pointer select-none inline-flex items-center justify-center border ${
                sortBy === 'notes'
                  ? 'bg-[#212121] text-[#fafafa] border-[#212121] dark:bg-[#fafafa] dark:text-[#212121] dark:border-[#fafafa] font-medium'
                  : 'bg-[#f0f0f0] dark:bg-[#212121] text-[#616161] dark:text-[#a3a3a3] border-[#d9d9d9] dark:border-[#333333] hover:text-[#161616] dark:hover:text-[#fafafa]'
              }`}
            >
              <span>Most Notes</span>
            </button>
            <button
              type="button"
              onClick={() => setSortBy('updated')}
              className={`h-[42px] px-4 rounded-full font-mono text-[12.5px] uppercase tracking-[0.02em] transition-all cursor-pointer select-none inline-flex items-center justify-center border ${
                sortBy === 'updated'
                  ? 'bg-[#212121] text-[#fafafa] border-[#212121] dark:bg-[#fafafa] dark:text-[#212121] dark:border-[#fafafa] font-medium'
                  : 'bg-[#f0f0f0] dark:bg-[#212121] text-[#616161] dark:text-[#a3a3a3] border-[#d9d9d9] dark:border-[#333333] hover:text-[#161616] dark:hover:text-[#fafafa]'
              }`}
            >
              <span>Recently Updated</span>
            </button>
            <button
              type="button"
              onClick={() => setSortBy('alpha')}
              className={`h-[42px] px-4 rounded-full font-mono text-[12.5px] uppercase tracking-[0.02em] transition-all cursor-pointer select-none inline-flex items-center justify-center border ${
                sortBy === 'alpha'
                  ? 'bg-[#212121] text-[#fafafa] border-[#212121] dark:bg-[#fafafa] dark:text-[#212121] dark:border-[#fafafa] font-medium'
                  : 'bg-[#f0f0f0] dark:bg-[#212121] text-[#616161] dark:text-[#a3a3a3] border-[#d9d9d9] dark:border-[#333333] hover:text-[#161616] dark:hover:text-[#fafafa]'
              }`}
            >
              <span>Alphabetical</span>
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
            <div className="py-20 text-center rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] p-8">
              <span className="material-symbols-outlined text-[36px] text-[#161616] dark:text-[#fafafa]">
                search_off
              </span>
              <p className="mt-3 text-[18px] font-sans font-medium text-[#161616] dark:text-[#fafafa]">
                No subjects found matching &quot;{searchQuery}&quot;
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="btn-primary mt-5"
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
