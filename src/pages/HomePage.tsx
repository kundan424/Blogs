import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllNotes, getEnrichedSubjects, getEnrichedTopics } from '../utils/contentLoader';
import { NoteCard } from '../components/cards/NoteCard';
import { SubjectCard } from '../components/cards/SubjectCard';
import { FilterBar, FilterItem } from '../components/interactive/FilterBar';
import { useSearchModal } from '../context/SearchModalContext';

export const HomePage: React.FC = () => {
  const { openSearch } = useSearchModal();
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'alpha'>('recent');

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
    let result = allNotes.filter((note) => {
      const matchesTopic =
        selectedTopic === 'all' ||
        note.tags.some((t) => t.toLowerCase() === selectedTopic.toLowerCase()) ||
        note.subjectSlug === selectedTopic;

      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        note.title.toLowerCase().includes(q) ||
        note.abstract.toLowerCase().includes(q) ||
        note.tags.some((t) => t.toLowerCase().includes(q)) ||
        note.subjectName.toLowerCase().includes(q);

      return matchesTopic && matchesQuery;
    });

    if (sortBy === 'popular') {
      result = [...result].sort((a, b) => (b.claps || 0) - (a.claps || 0));
    } else if (sortBy === 'alpha') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // default recent
      result = [...result].sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    }

    return result;
  }, [selectedTopic, searchQuery, sortBy, allNotes]);

  return (
    <div className="flex flex-col w-full bg-canvas text-body-ink transition-colors">

      {/* =========================================================================
          SECTION 1: FIRST SCREEN — COLUMN ATMOSPHERIC OPENING
          Streamlined hero scene with mint-blue halftone dot artwork,
          display headline, 36px physical buttons, and a floating telemetry card.
          ========================================================================= */}
      <section className="relative w-full py-12 sm:py-16 lg:py-20 overflow-hidden flex items-center border-b border-edge/80 dark:border-edge/40">
        {/* Mint-Blue Halftone Dot Atmosphere */}
        <div className="halftone-atmosphere" />

        <div className="max-w-column w-full mx-auto px-5 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            {/* Left Column: Display & Actions (7 cols) */}
            <div className="lg:col-span-7 space-y-5 max-w-xl">
              {/* Monospace Eyebrow with terminal cursor */}
              <div className="column-eyebrow">
                INFRASTRUCTURE IN SOFT FOCUS
              </div>

              {/* Display Headline with tighter tracking */}
              <h1 className="font-sans text-[36px] sm:text-[44px] md:text-[48px] font-semibold text-navy dark:text-white leading-[1.1] tracking-tightest">
                Deconstruct infrastructure at scale.
              </h1>

              {/* Hero Support */}
              <p className="font-sans text-[15.5px] sm:text-[17px] text-secondary-ink dark:text-muted-ink leading-[1.45] font-light max-w-[460px]">
                Practical capabilities, concrete runtime mechanisms, and production runbooks synthesized for software engineers.
              </p>

              {/* Paired 36px Physical Key Controls */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <Link to="/subjects" className="btn-primary">
                  <span>Explore Subjects</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>

                <button
                  type="button"
                  onClick={openSearch}
                  className="btn-secondary"
                >
                  <span className="material-symbols-outlined text-[16px]">search</span>
                  <span>Search Knowledge Base</span>
                </button>
              </div>

              {/* Subtle Trust Line */}
              <div className="pt-2 flex items-center gap-3 text-[12px] font-mono text-muted-ink flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-proof-green" />
                  <span>100% Technical Depth</span>
                </div>
                <span>•</span>
                <span>Zero Marketing Fluff</span>
                <span>•</span>
                <span>MIT Licensed</span>
              </div>
            </div>

            {/* Right Column: Floating Glass Card (5 cols) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="floating-glass w-full max-w-[360px] p-5 text-body-ink">
                {/* Header Row */}
                <div className="flex items-center justify-between pb-3 border-b border-edge/60 dark:border-edge/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-proof-green animate-pulse" />
                    <span className="font-mono text-[11px] font-semibold text-navy dark:text-white uppercase tracking-wider">
                      Runtime Telemetry
                    </span>
                  </div>
                  <span className="font-mono text-[10.5px] text-proof-green bg-proof-green/10 px-2 py-0.5 rounded-[4px] font-medium">
                    ACTIVE
                  </span>
                </div>

                {/* Metric Bars inside card */}
                <div className="mt-3.5 space-y-2.5 font-mono text-[11.5px]">
                  <div className="flex justify-between items-center p-2.5 rounded-[6px] bg-canvas/60 dark:bg-canvas/20 border border-edge/60">
                    <span className="text-secondary-ink dark:text-muted-ink">Ingress Port</span>
                    <span className="font-medium text-navy dark:text-ice">:8080 • HTTP/2</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-[6px] bg-canvas/60 dark:bg-canvas/20 border border-edge/60">
                    <span className="text-secondary-ink dark:text-muted-ink">HikariCP Pool</span>
                    <span className="font-medium text-navy dark:text-ice">24/32 conns (P99 4.2ms)</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-[6px] bg-canvas/60 dark:bg-canvas/20 border border-edge/60">
                    <span className="text-secondary-ink dark:text-muted-ink">Virtual Threads</span>
                    <span className="font-medium text-proof-green">52,400 req/sec</span>
                  </div>
                </div>

                {/* Tail status */}
                <div className="mt-3.5 pt-2.5 border-t border-edge/60 dark:border-edge/30 flex items-center justify-between text-[11px] font-mono text-muted-ink">
                  <span>GC Pause: 0.18ms</span>
                  <span>Heap: 512MB / 4GB</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: LIGHT QUANTIFIED PROOF
          Marked lead, 28px heading, and four 24px green metrics with 12px captions
          ========================================================================= */}
      <section className="w-full py-10 sm:py-14 border-b border-edge/80 dark:border-edge/40">
        <div className="max-w-column mx-auto px-5">
          <div className="max-w-xl mb-8">
            <div className="column-eyebrow mb-2">VERIFIED EVIDENCE</div>
            <h2 className="font-sans text-[24px] sm:text-[26px] font-medium text-navy dark:text-white leading-[1.1] tracking-tight">
              Defensible proof from production systems.
            </h2>
            <p className="mt-2 text-[13.5px] text-secondary-ink dark:text-muted-ink">
              Concrete measurements and validated architectural parameters derived from real failure investigations.
            </p>
          </div>

          {/* 4 Metric Pairs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 pt-4">
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[24px] font-medium text-proof-green leading-[1.1] tracking-tight">
                50k+ req/s
              </span>
              <span className="font-sans text-[12px] text-secondary-ink dark:text-muted-ink leading-[1.2]">
                Single-instance virtual thread throughput under load.
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-sans text-[24px] font-medium text-proof-green leading-[1.1] tracking-tight">
                P99 &lt; 8ms
              </span>
              <span className="font-sans text-[12px] text-secondary-ink dark:text-muted-ink leading-[1.2]">
                PostgreSQL connection allocation latency with HikariCP.
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-sans text-[24px] font-medium text-proof-green leading-[1.1] tracking-tight">
                Zero Downtime
              </span>
              <span className="font-sans text-[12px] text-secondary-ink dark:text-muted-ink leading-[1.2]">
                Database schema migrations using row-level locks.
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-sans text-[24px] font-medium text-proof-green leading-[1.1] tracking-tight">
                100% Deterministic
              </span>
              <span className="font-sans text-[12px] text-secondary-ink dark:text-muted-ink leading-[1.2]">
                Verified ConditionEvaluationReport auto-configuration.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: BOUNDED DEEP TEAL PLATFORM CHAPTER
          #011821 background, 16px dot lattice, 12px corners, 12px outer margin,
          48px/1.1 icy cyan headline, and translucent technical trays.
          ========================================================================= */}
      <section className="py-12">
        <div className="deep-platform-chapter py-16 sm:py-24 px-6 sm:px-12 text-white overflow-hidden">
          <div className="max-w-column mx-auto">
            {/* Header */}
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-ice/80 block mb-2">
                STRUCTURED LEARNING PATHWAYS
              </span>
              <h2 className="font-sans text-[36px] sm:text-[44px] md:text-[48px] font-medium text-ice leading-[1.1] tracking-tighter">
                Curated learning paths from core to production scale.
              </h2>
              <p className="mt-3 text-[15px] sm:text-[16px] text-ice/70 font-light leading-relaxed max-w-xl">
                Master backend architecture and distributed engineering through modular curricula — organized by subject, learning roadmap, and lesson.
              </p>
            </div>

            {/* 3 Technical Capability Trays */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pathway 1: Spring Boot */}
              <Link
                to="/learning-paths/spring-boot-production-mastery"
                className="group p-6 rounded-[8px] bg-white/5 border border-white/10 hover:border-ice/50 hover:bg-white/10 backdrop-blur-md space-y-3 transition-all block text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-proof-green uppercase font-semibold">
                    01 • CORE RUNTIME &amp; ARCHITECTURE
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-ice/60 group-hover:text-ice group-hover:translate-x-1 transition-all">
                    arrow_forward
                  </span>
                </div>
                <h3 className="font-sans text-[18px] font-medium text-white group-hover:text-ice transition-colors">
                  Spring Boot Production Mastery
                </h3>
                <p className="text-[13.5px] text-white/70 leading-relaxed font-light">
                  Bootstrap lifecycle, auto-configuration heuristics, embedded container tuning, actuator observability, and GraalVM native compilation.
                </p>
                <span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-ice/80 pt-1">
                  Active Learning Path • 3 Modules • 7 Lessons
                </span>
              </Link>

              {/* Pathway 2: Microservices */}
              <Link
                to="/learning-paths/production-microservices-distributed-architecture"
                className="group p-6 rounded-[8px] bg-white/5 border border-white/10 hover:border-ice/50 hover:bg-white/10 backdrop-blur-md space-y-3 transition-all block text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-ice uppercase font-semibold">
                    02 • CLOUD &amp; DISTRIBUTED SCALE
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-ice/60 group-hover:text-ice group-hover:translate-x-1 transition-all">
                    arrow_forward
                  </span>
                </div>
                <h3 className="font-sans text-[18px] font-medium text-white group-hover:text-ice transition-colors">
                  Production Microservices &amp; Architecture
                </h3>
                <p className="text-[13.5px] text-white/70 leading-relaxed font-light">
                  Service discovery, API gateways, multi-tenant DB isolation, transactional outbox with Kafka CDC, and distributed sagas.
                </p>
                <span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-ice/80 pt-1">
                  Active Learning Path • 2 Modules • 5 Lessons
                </span>
              </Link>

              {/* Pathway 3: Database Internals */}
              <Link
                to="/subjects/database-internals-storage"
                className="group p-6 rounded-[8px] bg-white/5 border border-white/10 hover:border-ice/50 hover:bg-white/10 backdrop-blur-md space-y-3 transition-all block text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-dot-blue uppercase font-semibold">
                    03 • LOW-LATENCY STORAGE
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-ice/60 group-hover:text-ice group-hover:translate-x-1 transition-all">
                    arrow_forward
                  </span>
                </div>
                <h3 className="font-sans text-[18px] font-medium text-white group-hover:text-ice transition-colors">
                  Database Internals &amp; Concurrency
                </h3>
                <p className="text-[13.5px] text-white/70 leading-relaxed font-light">
                  HikariCP pool sizing, PostgreSQL MVCC locking internals, Redis distributed caching, and zero thread-thrashing concurrency.
                </p>
                <span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-ice/80 pt-1">
                  Active Learning Path • 6 Modules
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: DOMAIN HUBS (CURATED DIRECTORY)
          Catalog cards for the 4 core engineering domains.
          ========================================================================= */}
      <section id="core-subjects" className="w-full py-16 sm:py-24 border-b border-edge/80 dark:border-edge/40">
        <div className="max-w-column mx-auto px-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="column-eyebrow mb-2">CURATED SUBJECTS</div>
              <h2 className="font-sans text-[32px] sm:text-[36px] font-semibold text-navy dark:text-white leading-[1.1] tracking-tight">
                Engineering domain hubs.
              </h2>
            </div>
            <Link to="/subjects" className="text-[14px] font-medium text-proof-green hover:underline">
              Browse all subjects →
            </Link>
          </div>

          {/* 4 Domain Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {enrichedSubjects.slice(0, 4).map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: OUTPUT DISCOVERY FEED & SEARCH
          Catalog cards with live interactive search filter.
          ========================================================================= */}
      <section id="feed-section" className="w-full py-16 sm:py-24">
        <div className="max-w-column mx-auto px-5">
          {/* Section Lead */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="column-eyebrow mb-2">TECHNICAL KNOWLEDGE BASE</div>
              <h2 className="font-sans text-[32px] sm:text-[36px] font-semibold text-navy dark:text-white leading-[1.1] tracking-tight">
                Published notes &amp; runbooks.
              </h2>
            </div>
            <span className="font-mono text-[12px] text-muted-ink">
              Showing {filteredNotes.length} notes
            </span>
          </div>

          {/* Filter Bar & Sort Controls Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div className="overflow-x-auto pb-1 lg:pb-0">
              <FilterBar
                items={filterTopics}
                selectedId={selectedTopic}
                onSelect={(id) => setSelectedTopic(id)}
              />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 shrink-0">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-ink mr-1 shrink-0 inline">
                Sort:
              </span>
              <button
                type="button"
                onClick={() => setSortBy('recent')}
                className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-mono transition-all border cursor-pointer select-none inline-flex items-center justify-center ${
                  sortBy === 'recent'
                    ? 'bg-gradient-to-r from-[#3e5199] to-[#5568ad] text-white border-[#3e5199] shadow-sm font-semibold'
                    : 'bg-white dark:bg-panel text-body-ink border-edge hover:border-[#3e5199] hover:text-[#3e5199] hover:bg-[#3e5199]/5 shadow-xs'
                }`}
              >
                <span>Most Recent</span>
              </button>
              <button
                type="button"
                onClick={() => setSortBy('popular')}
                className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-mono transition-all border cursor-pointer select-none inline-flex items-center justify-center ${
                  sortBy === 'popular'
                    ? 'bg-gradient-to-r from-[#3e5199] to-[#5568ad] text-white border-[#3e5199] shadow-sm font-semibold'
                    : 'bg-white dark:bg-panel text-body-ink border-edge hover:border-[#3e5199] hover:text-[#3e5199] hover:bg-[#3e5199]/5 shadow-xs'
                }`}
              >
                <span>Most Notes</span>
              </button>
              <button
                type="button"
                onClick={() => setSortBy('alpha')}
                className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-mono transition-all border cursor-pointer select-none inline-flex items-center justify-center ${
                  sortBy === 'alpha'
                    ? 'bg-gradient-to-r from-[#3e5199] to-[#5568ad] text-white border-[#3e5199] shadow-sm font-semibold'
                    : 'bg-white dark:bg-panel text-body-ink border-edge hover:border-[#3e5199] hover:text-[#3e5199] hover:bg-[#3e5199]/5 shadow-xs'
                }`}
              >
                <span>Alphabetical</span>
              </button>
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} onTagClick={(t) => setSelectedTopic(t)} />
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <div className="py-16 text-center rounded-[8px] bg-panel dark:bg-panel/40 border border-edge">
              <span className="material-symbols-outlined text-[32px] text-muted-ink">search_off</span>
              <p className="mt-2 text-[16px] font-medium text-navy dark:text-white">
                No articles found matching your criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedTopic('all');
                  setSearchQuery('');
                }}
                className="btn-secondary mt-4"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};
