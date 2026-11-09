import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllNotes, getEnrichedSubjects, getEnrichedTopics } from '../utils/contentLoader';
import { NoteCard } from '../components/cards/NoteCard';
import { FilterBar, FilterItem } from '../components/interactive/FilterBar';
import { HomeSidebar } from '../components/sidebar/HomeSidebar';
import { useSearchModal } from '../context/SearchModalContext';
import { ReadingProgressBar } from '../components/interactive/ReadingProgressBar';
import { seriesList } from '../data/series';

export const HomePage: React.FC = () => {
  const { openSearch } = useSearchModal();
  const [composerQuery, setComposerQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [gallerySubjectFilter, setGallerySubjectFilter] = useState('all');

  const allNotes = useMemo(() => getAllNotes(), []);
  const enrichedSubjects = useMemo(() => getEnrichedSubjects(), []);
  const enrichedTopics = useMemo(() => getEnrichedTopics(), []);

  const filterTopics: FilterItem[] = useMemo(() => {
    return [
      { id: 'all', label: 'All Topics' },
      ...enrichedTopics.slice(0, 10).map((t) => ({
        id: t.slug,
        label: `#${t.name}`,
      })),
    ];
  }, [enrichedTopics]);

  // Feed filtering: filtered by selectedTopic and composerQuery
  const filteredNotes = useMemo(() => {
    return allNotes.filter((note) => {
      const matchesTopic =
        selectedTopic === 'all' ||
        note.tags.some((t) => t.toLowerCase() === selectedTopic.toLowerCase()) ||
        note.subjectSlug === selectedTopic;

      const q = composerQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        note.title.toLowerCase().includes(q) ||
        note.abstract.toLowerCase().includes(q) ||
        note.tags.some((t) => t.toLowerCase().includes(q)) ||
        note.subjectName.toLowerCase().includes(q);

      return matchesTopic && matchesQuery;
    });
  }, [selectedTopic, composerQuery, allNotes]);

  // Gallery notes filtered by gallerySubjectFilter
  const galleryNotes = useMemo(() => {
    if (gallerySubjectFilter === 'all') {
      return allNotes.slice(0, 4);
    }
    const filtered = allNotes.filter((n) => n.subjectSlug === gallerySubjectFilter);
    return filtered.length > 0 ? filtered.slice(0, 4) : allNotes.slice(0, 4);
  }, [gallerySubjectFilter, allNotes]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleComposerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    scrollToSection('feed-section');
  };

  const handleChipClick = (tag: string) => {
    setComposerQuery(tag);
    setSelectedTopic(tag);
    scrollToSection('feed-section');
  };

  // 4 Subjects mapped for capability cards
  const subject1 = enrichedSubjects[0]; // Backend & Distributed Systems
  const subject2 = enrichedSubjects[1]; // Database Internals & Storage
  const subject3 = enrichedSubjects[2]; // Data Structures & Algorithms
  const subject4 = enrichedSubjects[3]; // DevOps & Cloud Infrastructure

  return (
    <div className="flex flex-col w-full bg-canvas text-ink transition-colors">
      <ReadingProgressBar />

      {/* =========================================================================
          SECTION 1: FIRST SCREEN — TOOL INVITATION OPENING
          Spacious ivory opening, centered 64px display headline, 14px support line,
          and 650x86px interactive composer on a soft peach halo.
         ========================================================================= */}
      <section className="relative w-full pt-20 pb-24 sm:pt-28 sm:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-[1280px] w-full mx-auto flex flex-col items-center">
          
          {/* Centered 64px Regular Headline with -0.06em tracking */}
          <h1 className="text-[44px] sm:text-[56px] md:text-[64px] font-normal leading-none tracking-tightest text-[#37383c] dark:text-[#faf6f1] max-w-3xl">
            What will you explore?
          </h1>

          {/* 14px Support line (line-height 1.6, support grey #4b4d53) */}
          <p className="mt-4 sm:mt-5 text-[14px] leading-[1.6] text-support dark:text-ash max-w-xl font-normal">
            Turn complex engineering ideas into production-ready knowledge — no fluff, pure internals.
          </p>

          {/* 650x86px Prompt Composer on Composer Halo */}
          <div className="relative mt-8 sm:mt-10 w-full max-w-[650px]">
            {/* Soft Peach Composer Halo */}
            <div className="composer-glow" />

            {/* Composer Box */}
            <form
              onSubmit={handleComposerSubmit}
              className="relative z-10 w-full min-h-[86px] bg-panel dark:bg-[#1f1e1a] border border-edge dark:border-stone/30 rounded-[20px] p-3 sm:p-3.5 flex flex-col justify-between shadow-xs transition-all focus-within:border-accent/80 focus-within:ring-2 focus-within:ring-accent/10"
            >
              {/* Top: Input prompt */}
              <input
                type="text"
                value={composerQuery}
                onChange={(e) => setComposerQuery(e.target.value)}
                placeholder="Ask or search: postgresql pools, raft consensus, memory models..."
                className="w-full bg-transparent text-[15px] sm:text-[16px] text-strong dark:text-white placeholder:text-muted/70 dark:placeholder:text-ash/60 focus:outline-none px-1 pt-0.5"
              />

              {/* Bottom: Utility Controls */}
              <div className="flex items-center justify-between pt-2">
                {/* Left: Attachment & ⌘K badge */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openSearch}
                    title="Open Command Palette (⌘K)"
                    className="w-7 h-7 rounded-full bg-canvas dark:bg-[#141310] border border-edge dark:border-stone/30 text-muted hover:text-strong dark:hover:text-white flex items-center justify-center transition-colors"
                  >
                    <span className="text-[17px] leading-none select-none">+</span>
                  </button>
                  <button
                    type="button"
                    onClick={openSearch}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-canvas dark:bg-[#141310] border border-edge dark:border-stone/30 text-[11px] font-mono text-muted hover:text-strong transition-colors"
                  >
                    <span>⌘K</span>
                    <span className="hidden sm:inline">command</span>
                  </button>
                </div>

                {/* Right: Circular 36px Orange Submit Arrow */}
                <button
                  type="submit"
                  aria-label="Search notes"
                  style={{ backgroundColor: '#ff3c00', color: '#ffffff' }}
                  className="btn-primary-accent w-9 h-9 rounded-full bg-[#ff3c00] text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[19px] text-white">arrow_forward</span>
                </button>
              </div>
            </form>

            {/* Prompt suggestions / Example category chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[13px]">
              <span className="text-muted dark:text-ash font-medium text-[12px] mr-1">Try:</span>
              {[
                { label: '#postgresql', query: 'postgresql' },
                { label: '#distributed-systems', query: 'distributed-systems' },
                { label: '#raft-consensus', query: 'raft' },
                { label: '#concurrency', query: 'concurrency' },
                { label: '#storage-engine', query: 'storage' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleChipClick(chip.query)}
                  className="h-[32px] px-3.5 rounded-full border border-filter-edge dark:border-stone/40 bg-transparent hover:border-[#a8a49d] hover:bg-stone/20 dark:hover:bg-stone/10 text-footer-text dark:text-ash text-[12px] font-mono transition-colors cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 2: INTRODUCTION & DEMONSTRATION SET
          Centered intro-heading joins dark word to orange word.
          2-column set of 666x320px demonstration cards:
          - Card 1: Optical Coral Folds (Signature Artwork with radial gradient strips)
          - Card 2: Deep Olive Photographic Demonstration (Battle-tested runbooks)
          - Card 3: Interactive Simulations (Simulate & calculate with live widget)
          - Card 4: Cool Grey Demonstration (Curated Learning Paths series)
         ========================================================================= */}
      <section className="w-full py-16 sm:py-24 border-t border-edge/60 dark:border-stone/20">
        <div className="max-w-marketing mx-auto px-4 sm:px-6">
          
          {/* Centered intro-heading: 68.9px/1 regular with -0.06em tracking */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-[38px] sm:text-[54px] md:text-[68.9px] font-normal leading-none tracking-tightest text-strong dark:text-white">
              Engineered for <span className="text-accent">depth</span>.
            </h2>
            <p className="mt-4 text-[16px] leading-[1.7] text-muted dark:text-ash max-w-lg mx-auto font-normal">
              Practical capabilities and concrete architectural mechanisms synthesized for software engineers.
            </p>
          </div>

          {/* Demonstration Grid: 2 columns on top + full-width Curated Learning Paths showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* DEMO CARD 1: Optical Coral Folds (Signature Artwork) */}
            <div className="optical-fold-card h-[320px] p-8 sm:p-10 flex flex-col justify-between text-strong relative">
              {/* Layered radial-gradient coral fold strips as specified in design.md */}
              <div className="optical-strip-1" />
              <div className="optical-strip-2" />
              <div className="optical-strip-3" />

              {/* Left copy (45% width) */}
              <div className="relative z-10 max-w-[50%]">
                <span className="font-mono text-[13px] font-medium uppercase tracking-technical text-strong/80 block mb-2">
                  SYSTEM ARCHITECTURE
                </span>
                <h3 className="text-[32px] sm:text-[36px] font-normal leading-none tracking-tight text-strong">
                  Deconstruct internals.
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-strong/80 line-clamp-3">
                  Examine high-throughput engines, cache topologies, and resilient replication algorithms layer by layer.
                </p>
              </div>

              {/* Outlined Action Button */}
              <div className="relative z-10">
                <Link
                  to="/subjects/backend-distributed-systems"
                  style={{ color: '#ff3c00', borderColor: '#ff3c00' }}
                  className="btn-outline-accent inline-flex items-center gap-2 text-accent border-[1.5px] border-accent rounded-[8px] px-5 py-2.5 text-[14px] font-medium hover:bg-accent hover:text-white transition-all shadow-xs cursor-pointer"
                >
                  <span>Explore Systems</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* DEMO CARD 2: Deep Olive Photographic Demonstration */}
            <div className="relative h-[320px] rounded-[24px] p-8 sm:p-10 overflow-hidden bg-olive flex flex-col justify-between text-white">
              {/* Photographic / Terminal Texture overlay */}
              <div
                className="absolute inset-0 z-0 pointer-events-none opacity-40"
                style={{
                  backgroundImage: `radial-gradient(circle at 75% 40%, rgba(74, 222, 128, 0.15) 0%, transparent 60%), linear-gradient(135deg, rgba(255,255,255,0.03) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,0.03) 25%, transparent 25%)`,
                  backgroundSize: '100% 100%, 16px 16px, 16px 16px'
                }}
              />
              <div
                className="absolute inset-0 z-0"
                style={{
                  background: 'linear-gradient(100deg, rgba(29,34,27,0.92) 0%, rgba(29,34,27,0.6) 50%, rgba(29,34,27,0.25) 100%)'
                }}
              />

              {/* Content on left */}
              <div className="relative z-10 max-w-[55%]">
                <span className="font-mono text-[13px] font-medium uppercase tracking-technical text-white/70 block mb-2">
                  PRODUCTION POST-MORTEMS
                </span>
                <h3 className="text-[32px] sm:text-[36px] font-normal leading-none tracking-tight text-white">
                  Battle-tested runbooks.
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-white/80 line-clamp-3">
                  Real incident reviews, connection pool exhaustion fixes, and zero-downtime database migration strategies.
                </p>
              </div>

              {/* Translucent simulated terminal message strips on the right */}
              <div className="absolute right-6 top-8 bottom-8 w-[38%] hidden sm:flex flex-col justify-center gap-2.5 z-10 pointer-events-none">
                <div className="p-2.5 rounded-[8px] bg-black/40 border border-white/10 backdrop-blur-sm font-mono text-[11px] text-white/90">
                  <span className="text-amber-400">WARN:</span> pool_size &gt; 95%
                </div>
                <div className="p-2.5 rounded-[8px] bg-black/40 border border-white/10 backdrop-blur-sm font-mono text-[11px] text-white/90">
                  <span className="text-emerald-400">FIX:</span> pgbouncer tx-mode
                </div>
                <div className="p-2.5 rounded-[8px] bg-black/40 border border-white/10 backdrop-blur-sm font-mono text-[11px] text-white/90">
                  <span className="text-blue-300">P99:</span> 120ms → 8ms latency
                </div>
              </div>

              {/* Action Button */}
              <div className="relative z-10">
                <Link
                  to="/subjects/database-internals-storage"
                  className="inline-flex items-center gap-2 text-white border-[1.5px] border-white/70 rounded-[8px] px-5 py-2.5 text-[14px] font-normal hover:bg-white hover:text-olive transition-colors"
                >
                  View Runbooks →
                </Link>
              </div>
            </div>

            {/* DEMO CARD 3: CURATED LEARNING PATHS (Full-width Showcase with properly listed items) */}
            <div className="col-span-1 md:col-span-2 relative rounded-[24px] p-8 sm:p-10 overflow-hidden bg-cool-card dark:bg-[#1f1e1c] border border-edge/80 dark:border-stone/30 flex flex-col lg:flex-row items-stretch justify-between gap-8 text-strong dark:text-white">
              {/* Left narrative column */}
              <div className="relative z-10 flex flex-col justify-between max-w-xl">
                <div>
                  <span className="font-mono text-[13px] font-medium uppercase tracking-technical text-muted dark:text-ash block mb-2">
                    CURATED LEARNING PATHS
                  </span>
                  <h3 className="text-[32px] sm:text-[36px] font-normal leading-none tracking-tight text-strong dark:text-white">
                    Sequential series.
                  </h3>
                  <p className="mt-3 text-[14px] sm:text-[15px] leading-relaxed text-muted dark:text-ash">
                    End-to-end production architecture walk-throughs organized as structured multi-part masterclasses. Trace failure modes, inspect configuration matrices, and build production intuition step by step.
                  </p>
                </div>

                <div className="mt-6 pt-4">
                  <Link
                    to="/series"
                    style={{ color: '#ff3c00', borderColor: '#ff3c00' }}
                    className="btn-outline-accent inline-flex items-center gap-2 text-accent border-[1.5px] border-accent rounded-[8px] px-5 py-2.5 text-[14px] font-medium hover:bg-accent hover:text-white transition-all shadow-xs cursor-pointer"
                  >
                    <span>Explore Learning Series</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Right: Properly listed Series Chapters */}
              <div className="relative z-10 flex-1 w-full bg-canvas dark:bg-[#141310] rounded-[18px] p-5 sm:p-6 border border-edge/80 dark:border-stone/30 shadow-xs flex flex-col justify-between">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 mb-3.5 border-b border-edge/60 dark:border-stone/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="font-mono text-[12px] font-medium text-strong dark:text-white uppercase tracking-wider">
                      Featured Series: {seriesList[0]?.title || 'Building a Multi-Tenant SaaS API Gateway'}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-muted dark:text-ash">
                    Part {seriesList[0]?.currentPart || 3} of {seriesList[0]?.totalParts || 4} ({seriesList[0]?.progressPercent || 75}% Progress)
                  </span>
                </div>

                {/* List of items properly listed */}
                <div className="space-y-2.5">
                  {(seriesList[0]?.steps || [
                    { number: 1, title: 'JWT Validation & Token Exchange', status: 'completed', meta: 'Published • 12m read', slug: 'jwt-validation-token-exchange' },
                    { number: 2, title: 'Distributed Rate Limiting Engine', status: 'completed', meta: 'Published • 15m read', slug: 'distributed-rate-limiting-engine' },
                    { number: 3, title: 'Tenant Context Routing & Upstreams', status: 'current', meta: 'Currently Reading', slug: 'tenant-context-routing-upstreams' },
                    { number: 4, title: 'Observability & Distributed Tracing', status: 'upcoming', meta: 'Next Chapter' },
                  ]).map((step) => {
                    const isCompleted = step.status === 'completed';
                    const isCurrent = step.status === 'current';

                    return (
                      <Link
                        key={step.number}
                        to={step.slug ? `/notes/${step.slug}` : '/series'}
                        className={`group/item flex items-center justify-between gap-3 p-3 rounded-[10px] border transition-all ${
                          isCurrent
                            ? 'bg-panel dark:bg-[#1c1a16] border-accent/60 shadow-2xs'
                            : 'bg-canvas dark:bg-[#141310] border-edge/60 dark:border-stone/30 hover:border-filter-edge hover:bg-panel'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Number badge */}
                          <span
                            className={`w-6 h-6 rounded-[6px] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${
                              isCompleted
                                ? 'bg-accent text-white'
                                : isCurrent
                                ? 'bg-accent/15 text-accent border border-accent/40'
                                : 'bg-stone/50 dark:bg-stone/20 text-muted'
                            }`}
                          >
                            {isCompleted ? '✓' : `0${step.number}`}
                          </span>

                          {/* Title */}
                          <span
                            className={`font-sans text-[13.5px] sm:text-[14px] truncate transition-colors ${
                              isCurrent
                                ? 'font-medium text-accent'
                                : 'text-strong dark:text-white group-hover/item:text-accent'
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>

                        {/* Meta & Status pill */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="hidden sm:inline font-mono text-[11px] text-muted">
                            {step.meta}
                          </span>
                          <span
                            className={`font-mono text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${
                              isCompleted
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                : isCurrent
                                ? 'bg-accent/10 text-accent border border-accent/30'
                                : 'bg-stone/40 dark:bg-stone/20 text-muted'
                            }`}
                          >
                            {isCompleted ? 'Done' : isCurrent ? 'Reading' : 'Next'}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: OUTPUT DISCOVERY BAND (Gallery Stone #f3f2ee)
          Full-width stone band with left-aligned gallery-heading (32px/1.25),
          right-aligned Category filter row (36px pill), 4-column output gallery
          previews, and lower fade to centered Outline action.
         ========================================================================= */}
      <section className="w-full bg-gallery dark:bg-[#181714] py-20 sm:py-28 border-y border-edge/60 dark:border-stone/20 transition-colors">
        <div className="max-w-marketing mx-auto px-4 sm:px-6">
          
          {/* Header Row: Gallery heading + Category Filter pills */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
            <div>
              <span className="font-mono text-[13px] font-medium uppercase tracking-technical text-muted block mb-1">
                OUTPUT DISCOVERY
              </span>
              <h2 className="text-[28px] sm:text-[32px] font-normal leading-[1.25] text-strong dark:text-white">
                Recent Technical Notes &amp; Artifacts
              </h2>
            </div>

            {/* Category filter pills (36px height, rounded-full) */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All Artifacts' },
                ...enrichedSubjects.map((s) => ({
                  id: s.slug,
                  label: s.name.split('&')[0].trim(),
                })),
              ].map((cat) => {
                const isSelected = gallerySubjectFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setGallerySubjectFilter(cat.id)}
                    className={`h-[36px] px-[17px] rounded-full text-[13px] transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#191818] text-white border-[#191818] dark:bg-white dark:text-[#191818]'
                        : 'bg-transparent text-[#4b5563] dark:text-[#a8a29a] border-[#d8d5cf] dark:border-stone/40 hover:border-[#a8a49d]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4-Column Output Gallery Previews */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {galleryNotes.map((note) => (
              <article
                key={note.id}
                className="group relative rounded-[16px] bg-preview dark:bg-[#201e1a] border border-edge/70 dark:border-stone/30 p-5 flex flex-col justify-between hover:border-filter-edge transition-all hover:shadow-xs min-h-[230px]"
              >
                <div>
                  {/* Top: Subject + Read Time */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-2.5">
                    <span className="text-accent font-medium truncate max-w-[70%]">
                      {note.subjectName.split('&')[0]}
                    </span>
                    <span>{note.readTime}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[17px] font-normal leading-snug tracking-[-0.02em] text-strong dark:text-white group-hover:text-accent transition-colors line-clamp-2">
                    <Link to={`/notes/${note.slug}`}>{note.title}</Link>
                  </h3>

                  {/* Abstract Snippet */}
                  <p className="mt-2 text-[13px] leading-relaxed text-muted line-clamp-2">
                    {note.abstract}
                  </p>
                </div>

                {/* Bottom: Date & Tag */}
                <div className="mt-4 pt-3 border-t border-edge/40 flex items-center justify-between font-mono text-[11px] text-muted">
                  <span>{note.publishDate}</span>
                  {note.tags[0] && (
                    <span className="text-strong dark:text-ash">#{note.tags[0]}</span>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Centered Outline Action Button */}
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => scrollToSection('feed-section')}
              style={{ color: '#ff3c00', borderColor: '#ff3c00' }}
              className="btn-outline-accent inline-flex items-center gap-2 text-accent border-[1.5px] border-accent rounded-[8px] px-6 py-3 text-[14px] font-medium hover:bg-accent hover:text-white transition-all cursor-pointer shadow-xs"
            >
              <span>Browse Complete Knowledge Feed</span>
              <span className="material-symbols-outlined text-[17px]">arrow_downward</span>
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4: CAPABILITY CHAPTER (Four Pillars of Knowledge)
          Lighter, airy chapter background with soft, luminous pastel card shades
          progressing through warm sequence: White -> Soft Stone -> Soft Salmon -> Soft Coral.
          Handcrafted SVG miniature line diagrams in each card.
         ========================================================================= */}
      <section className="w-full py-20 sm:py-28 bg-[#fcfaf7] dark:bg-[#12110e] border-y border-edge/60 dark:border-stone/20 transition-colors" id="core-subjects">
        <div className="max-w-marketing mx-auto px-4 sm:px-6">
          
          {/* Centered Section Headline: 48px/1 regular with -0.06em tracking */}
          <div className="text-center mb-12 sm:mb-16">
            <span className="font-mono text-[13px] font-medium uppercase tracking-technical text-muted block mb-2">
              FOUNDATION &amp; TAXONOMY
            </span>
            <h2 className="text-[36px] sm:text-[48px] font-normal leading-none tracking-tightest text-strong dark:text-white">
              Four Pillars of the Knowledge Base
            </h2>
            <p className="mt-4 text-[16px] leading-[1.7] text-muted dark:text-ash max-w-lg mx-auto font-normal">
              Structured architectural domains spanning systems internals, storage algorithms, and distributed orchestration.
            </p>
          </div>

          {/* Capability Grid: 4 columns · gap 12px · 320x604px tall cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* TALL CARD 1: WHITE (#ffffff) — Distributed Systems */}
            <div className="bg-[#ffffff] dark:bg-[#1c1b18] rounded-[20px] p-6 h-[560px] sm:h-[604px] flex flex-col justify-between border-2 border-[#e5e0d7] dark:border-[#38332c] overflow-hidden text-strong dark:text-white shadow-xs">
              {/* Top: Category label + capability-heading (32px capitalize) */}
              <div>
                <span className="inline-block px-2.5 py-1 rounded-[6px] bg-[#f5f1eb] dark:bg-[#2a2824] border border-[#e2dcd2] font-mono text-[12px] font-medium text-strong dark:text-ash uppercase tracking-technical mb-3">
                  DOMAIN HUB #01
                </span>
                <h3 className="text-[28px] sm:text-[32px] font-normal leading-none tracking-tight capitalize text-strong dark:text-white">
                  Distributed Systems &amp; Consensus
                </h3>
              </div>

              {/* Center: Miniature Product Line Diagram (Raft Consensus) */}
              <div className="my-auto py-3 bg-[#faf7f3] dark:bg-[#171614] rounded-[14px] p-4 border border-[#eee8df] dark:border-[#2d2a24] flex flex-col items-center justify-center">
                <svg viewBox="0 0 240 180" className="w-full max-w-[220px] h-auto" fill="none">
                  {/* Leader Node with dashed orange halo */}
                  <circle cx="120" cy="40" r="28" stroke="#ff3c00" strokeWidth="1.5" strokeDasharray="4 3" />
                  <circle cx="120" cy="40" r="20" fill="#ff3c00" fillOpacity="0.1" stroke="#ff3c00" strokeWidth="1.5" />
                  <text x="120" y="44" textAnchor="middle" fill="#ff3c00" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    LEADER
                  </text>

                  {/* Connecting paths to followers */}
                  <path d="M106 56 L55 125" stroke="#37383c" strokeWidth="1.2" strokeDasharray="3 3" />
                  <path d="M134 56 L185 125" stroke="#37383c" strokeWidth="1.2" strokeDasharray="3 3" />

                  {/* Follower Nodes */}
                  <circle cx="50" cy="140" r="22" stroke="#6f6c6a" strokeWidth="1.5" fill="#f3f2ee" />
                  <text x="50" y="144" textAnchor="middle" fill="#37383c" fontSize="9" fontFamily="monospace">
                    FOLLOWER
                  </text>

                  <circle cx="190" cy="140" r="22" stroke="#6f6c6a" strokeWidth="1.5" fill="#f3f2ee" />
                  <text x="190" y="144" textAnchor="middle" fill="#37383c" fontSize="9" fontFamily="monospace">
                    FOLLOWER
                  </text>

                  {/* Replicated Log Tile */}
                  <rect x="75" y="105" width="90" height="20" rx="4" fill="#ff3c00" />
                  <text x="120" y="118" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="monospace">
                    WAL Log : Term 4
                  </text>
                </svg>
              </div>

              {/* Bottom: body-compact description & link */}
              <div>
                <p className="text-[15px] sm:text-[16px] leading-[1.25] tracking-[-0.02em] text-muted dark:text-ash mb-4">
                  Raft consensus, Paxos tradeoffs, partition tolerance, and peer-to-peer gossip topologies.
                </p>
                <Link
                  to={`/subjects/${subject1?.slug || 'backend-distributed-systems'}`}
                  className="font-mono text-[13px] text-accent hover:underline flex items-center justify-between"
                >
                  <span>{subject1?.notesCount || 4} Notes Published</span>
                  <span>Explore Hub →</span>
                </Link>
              </div>
            </div>

            {/* TALL CARD 2: LIGHT STONE (#f5f0e9) — Database Internals */}
            <div className="bg-[#f5f0e9] dark:bg-[#23201b] rounded-[20px] p-6 h-[560px] sm:h-[604px] flex flex-col justify-between border-2 border-[#e6dfd6] dark:border-[#38332a] overflow-hidden text-strong dark:text-white shadow-xs">
              {/* Top */}
              <div>
                <span className="inline-block px-2.5 py-1 rounded-[6px] bg-[#eae3d9] dark:bg-[#322d25] border border-[#ddd4c8] font-mono text-[12px] font-medium text-strong dark:text-ash uppercase tracking-technical mb-3">
                  DOMAIN HUB #02
                </span>
                <h3 className="text-[28px] sm:text-[32px] font-normal leading-none tracking-tight capitalize text-strong dark:text-white">
                  Database Internals &amp; Storage
                </h3>
              </div>

              {/* Center: Miniature Product Line Diagram (LSM-Tree & Memtable) */}
              <div className="my-auto py-3 bg-[#faf7f2] dark:bg-[#1a1815] rounded-[14px] p-4 border border-[#e6dfd6] dark:border-[#302b23] flex flex-col items-center justify-center">
                <svg viewBox="0 0 240 180" className="w-full max-w-[220px] h-auto" fill="none">
                  {/* MemTable Box */}
                  <rect x="30" y="20" width="180" height="32" rx="6" stroke="#191818" strokeWidth="1.5" fill="#ffffff" />
                  <text x="120" y="40" textAnchor="middle" fill="#191818" fontSize="10" fontFamily="monospace" fontWeight="500">
                    RAM: MemTable (SkipList)
                  </text>

                  {/* Append Arrow with orange WAL badge */}
                  <path d="M120 52 L120 85" stroke="#ff3c00" strokeWidth="1.5" markerEnd="url(#arrow)" />
                  <rect x="80" y="62" width="80" height="16" rx="4" fill="#ff3c00" />
                  <text x="120" y="74" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace">
                    fsync(WAL)
                  </text>

                  {/* Disk Level 0 SSTable */}
                  <rect x="40" y="95" width="160" height="26" rx="6" stroke="#191818" strokeWidth="1.5" fill="#ffffff" />
                  <text x="120" y="112" textAnchor="middle" fill="#191818" fontSize="9" fontFamily="monospace">
                    Level 0 SSTable (Disk)
                  </text>

                  {/* Compaction arrow to Level 1 */}
                  <path d="M120 121 L120 142" stroke="#191818" strokeWidth="1.2" strokeDasharray="2 2" />

                  {/* Disk Level 1 SSTable */}
                  <rect x="25" y="145" width="190" height="26" rx="6" stroke="#191818" strokeWidth="1.5" fill="#ffffff" />
                  <text x="120" y="162" textAnchor="middle" fill="#191818" fontSize="9" fontFamily="monospace">
                    Level 1 Compacted Tables
                  </text>
                </svg>
              </div>

              {/* Bottom */}
              <div>
                <p className="text-[15px] sm:text-[16px] leading-[1.25] tracking-[-0.02em] text-strong/80 dark:text-ash mb-4">
                  B-Trees vs LSM-Trees, MVCC snapshots, connection pools, and lock-free execution engines.
                </p>
                <Link
                  to={`/subjects/${subject2?.slug || 'database-internals-storage'}`}
                  className="font-mono text-[13px] text-accent hover:underline flex items-center justify-between"
                >
                  <span>{subject2?.notesCount || 3} Notes Published</span>
                  <span>Explore Hub →</span>
                </Link>
              </div>
            </div>

            {/* TALL CARD 3: LIGHT SALMON (#ffece5) — Algorithms & DSA */}
            <div className="bg-[#ffece5] dark:bg-[#321e17] rounded-[20px] p-6 h-[560px] sm:h-[604px] flex flex-col justify-between border-2 border-[#fedad0] dark:border-[#4d281e] overflow-hidden text-strong dark:text-white shadow-xs">
              {/* Top */}
              <div>
                <span className="inline-block px-2.5 py-1 rounded-[6px] bg-[#fedad0] dark:bg-[#4d281e] border border-[#f5c2b5] font-mono text-[12px] font-medium text-strong dark:text-ash uppercase tracking-technical mb-3">
                  DOMAIN HUB #03
                </span>
                <h3 className="text-[28px] sm:text-[32px] font-normal leading-none tracking-tight capitalize text-strong dark:text-white">
                  Data Structures &amp; Algorithms
                </h3>
              </div>

              {/* Center: Miniature Product Line Diagram (Graph & Tree Traversal) */}
              <div className="my-auto py-3 bg-[#fff6f2] dark:bg-[#22130e] rounded-[14px] p-4 border border-[#fedad0] dark:border-[#3e2017] flex flex-col items-center justify-center">
                <svg viewBox="0 0 240 180" className="w-full max-w-[220px] h-auto" fill="none">
                  {/* Root Node */}
                  <circle cx="120" cy="35" r="18" fill="#ffffff" stroke="#191818" strokeWidth="1.5" />
                  <text x="120" y="39" textAnchor="middle" fill="#191818" fontSize="10" fontFamily="monospace">
                    Root
                  </text>

                  {/* Branches */}
                  <line x1="108" y1="48" x2="65" y2="85" stroke="#191818" strokeWidth="1.2" />
                  <line x1="132" y1="48" x2="175" y2="85" stroke="#191818" strokeWidth="1.2" />

                  {/* Child Node Left (Visited / Focal Node) */}
                  <circle cx="55" cy="100" r="18" fill="#ff3c00" stroke="#191818" strokeWidth="1.5" />
                  <text x="55" y="104" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="monospace">
                    O(1)
                  </text>

                  {/* Child Node Right */}
                  <circle cx="185" cy="100" r="18" fill="#ffffff" stroke="#191818" strokeWidth="1.5" />
                  <text x="185" y="104" textAnchor="middle" fill="#191818" fontSize="10" fontFamily="monospace">
                    Node
                  </text>

                  {/* Sub-children */}
                  <line x1="45" y1="115" x2="25" y2="150" stroke="#191818" strokeWidth="1.2" />
                  <line x1="65" y1="115" x2="85" y2="150" stroke="#191818" strokeWidth="1.2" />

                  <circle cx="25" cy="155" r="12" fill="#ffffff" stroke="#191818" strokeWidth="1.2" />
                  <circle cx="85" cy="155" r="12" fill="#ffffff" stroke="#191818" strokeWidth="1.2" />

                  <rect x="135" y="145" width="90" height="20" rx="4" fill="#191818" />
                  <text x="180" y="158" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="monospace">
                    DAG Topo Sort
                  </text>
                </svg>
              </div>

              {/* Bottom */}
              <div>
                <p className="text-[15px] sm:text-[16px] leading-[1.25] tracking-[-0.02em] text-strong/80 dark:text-ash mb-4">
                  Memory-aligned layout primitives, amortized complexity proofs, and concurrent lock-free queues.
                </p>
                <Link
                  to={`/subjects/${subject3?.slug || 'data-structures-algorithms'}`}
                  className="font-mono text-[13px] text-accent hover:underline flex items-center justify-between"
                >
                  <span>{subject3?.notesCount || 2} Notes Published</span>
                  <span>Explore Hub →</span>
                </Link>
              </div>
            </div>

            {/* TALL CARD 4: LIGHT CORAL (#ffdcd4) — DevOps & Infra */}
            <div className="bg-[#ffdcd4] dark:bg-[#381810] rounded-[20px] p-6 h-[560px] sm:h-[604px] flex flex-col justify-between border-2 border-[#ffc5b8] dark:border-[#522417] overflow-hidden text-strong dark:text-white shadow-xs">
              {/* Top */}
              <div>
                <span className="inline-block px-2.5 py-1 rounded-[6px] bg-[#ffc5b8] dark:bg-[#522417] border border-[#f5aaa0] font-mono text-[12px] font-medium text-strong dark:text-ash uppercase tracking-technical mb-3">
                  DOMAIN HUB #04
                </span>
                <h3 className="text-[28px] sm:text-[32px] font-normal leading-none tracking-tight capitalize text-strong dark:text-white">
                  DevOps &amp; Infrastructure
                </h3>
              </div>

              {/* Center: Miniature Product Line Diagram (K8s Control Plane & Ingress) */}
              <div className="my-auto py-3 bg-[#fff0ec] dark:bg-[#25100a] rounded-[14px] p-4 border border-[#ffc5b8] dark:border-[#421d13] flex flex-col items-center justify-center">
                <svg viewBox="0 0 240 180" className="w-full max-w-[220px] h-auto" fill="none">
                  {/* Ingress Gateway Node */}
                  <rect x="60" y="20" width="120" height="28" rx="6" fill="#191818" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="120" y="38" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="monospace">
                    INGRESS PROXY
                  </text>

                  {/* Fan-out mesh lines */}
                  <path d="M90 48 L45 95" stroke="#ff3c00" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path d="M120 48 L120 95" stroke="#37383c" strokeWidth="1.5" />
                  <path d="M150 48 L195 95" stroke="#ff3c00" strokeWidth="1.5" strokeDasharray="3 3" />

                  {/* Pod nodes */}
                  <rect x="20" y="100" width="55" height="30" rx="6" fill="#ffffff" stroke="#e5dfd7" strokeWidth="1.2" />
                  <text x="47" y="119" textAnchor="middle" fill="#ff3c00" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    POD 01
                  </text>

                  <rect x="92" y="100" width="55" height="30" rx="6" fill="#ffffff" stroke="#e5dfd7" strokeWidth="1.2" />
                  <text x="120" y="119" textAnchor="middle" fill="#ff3c00" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    POD 02
                  </text>

                  <rect x="165" y="100" width="55" height="30" rx="6" fill="#ffffff" stroke="#e5dfd7" strokeWidth="1.2" />
                  <text x="192" y="119" textAnchor="middle" fill="#ff3c00" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    POD 03
                  </text>

                  {/* Metric indicator badge */}
                  <rect x="65" y="145" width="110" height="20" rx="4" fill="#191818" />
                  <text x="120" y="158" textAnchor="middle" fill="#4ade80" fontSize="9" fontFamily="monospace">
                    eBPF Observability: 0% loss
                  </text>
                </svg>
              </div>

              {/* Bottom */}
              <div>
                <p className="text-[15px] sm:text-[16px] leading-[1.25] tracking-[-0.02em] text-strong/80 dark:text-ash mb-4">
                  Linux kernel networking, eBPF tracing, container runtimes, and immutable infrastructure.
                </p>
                <Link
                  to={`/subjects/${subject4?.slug || 'devops-cloud-infrastructure'}`}
                  className="font-mono text-[13px] text-accent hover:underline flex items-center justify-between"
                >
                  <span>{subject4?.notesCount || 2} Notes Published</span>
                  <span>Explore Hub →</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: LOGO / TECHNOLOGY RIBBON
          Low-height proof band with repeated monochrome technology marks
          40s linear continuous scrolling.
         ========================================================================= */}
      <section className="w-full py-8 border-y border-edge/60 dark:border-stone/20 overflow-hidden bg-canvas">
        <div className="relative w-full flex overflow-x-hidden">
          <div className="animate-marquee flex items-center gap-16 whitespace-nowrap">
            {[
              'PostgreSQL Internals',
              'Apache Kafka',
              'Redis Replication',
              'Raft Consensus',
              'Go Runtime & Channels',
              'Rust Borrow Checker',
              'Linux eBPF',
              'Kubernetes Controllers',
              'ClickHouse Columnar',
              'Docker Containerd',
              'B-Tree Storage',
              'LSM Compactors',
            ].map((tech, idx) => (
              <span
                key={`${tech}-${idx}`}
                className="font-mono text-[14px] text-muted dark:text-ash uppercase tracking-wider font-medium flex items-center gap-3"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {tech}
              </span>
            ))}
          </div>
          {/* Second duplicate track for continuous infinite scrolling */}
          <div className="animate-marquee flex items-center gap-16 whitespace-nowrap" aria-hidden="true">
            {[
              'PostgreSQL Internals',
              'Apache Kafka',
              'Redis Replication',
              'Raft Consensus',
              'Go Runtime & Channels',
              'Rust Borrow Checker',
              'Linux eBPF',
              'Kubernetes Controllers',
              'ClickHouse Columnar',
              'Docker Containerd',
              'B-Tree Storage',
              'LSM Compactors',
            ].map((tech, idx) => (
              <span
                key={`dup-${tech}-${idx}`}
                className="font-mono text-[14px] text-muted dark:text-ash uppercase tracking-wider font-medium flex items-center gap-3"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: QUOTATION MOSAIC (Named proof & Trust Tiles)
          Substantial 60px rounded quote card + 70px salmon proof tile
          Text style: quotation — 26px/1.2 regular with -0.03em tracking.
         ========================================================================= */}
      <section className="w-full py-20 sm:py-28">
        <div className="max-w-marketing mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            
            {/* Left: 60px rounded white Quote Card (Lg: 8 cols) */}
            <div className="lg:col-span-8 bg-white dark:bg-[#1a1815] rounded-[40px] sm:rounded-[60px] p-8 sm:p-12 border border-edge/70 dark:border-stone/30 flex flex-col justify-between shadow-xs">
              <div>
                {/* Oversized Salmon Quotation Mark */}
                <span className="text-[64px] sm:text-[80px] font-serif leading-none text-salmon dark:text-[#ff764c] select-none block -mb-4">
                  “
                </span>
                {/* 26px/1.2 regular quotation text */}
                <p className="text-[22px] sm:text-[26px] font-normal leading-[1.2] tracking-tight text-strong dark:text-white">
                  The depth of architectural analysis and clear failure-mode walkthroughs make this engineering knowledge base an indispensable daily reference for our distributed systems team.
                </p>
              </div>

              {/* Attribution */}
              <div className="mt-8 pt-6 border-t border-edge/60 dark:border-stone/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-salmon flex items-center justify-center font-mono text-strong font-bold text-[13px]">
                  SE
                </div>
                <div>
                  <div className="font-sans font-medium text-[14px] text-strong dark:text-white">
                    Staff Distributed Systems Engineer
                  </div>
                  <div className="font-mono text-[12px] text-muted dark:text-ash">
                    High-Throughput Core Platform Infrastructure
                  </div>
                </div>
              </div>
            </div>

            {/* Right: 70px rounded Salmon Trust Tile (Lg: 4 cols) */}
            <div className="lg:col-span-4 bg-salmon dark:bg-[#4a2c20] rounded-[40px] sm:rounded-[70px] p-8 sm:p-10 flex flex-col justify-between text-strong dark:text-white">
              <div>
                <span className="font-mono text-[13px] font-medium uppercase tracking-technical text-strong/80 dark:text-ash block mb-2">
                  VERIFIED RUNBOOKS
                </span>
                <h4 className="text-[24px] sm:text-[28px] font-normal leading-tight text-strong dark:text-white">
                  Living Engineering Practice
                </h4>
                <p className="mt-2 text-[14px] leading-relaxed text-strong/80 dark:text-ash">
                  Every note is derived from actual production stress tests, benchmarks, and architectural RFCs.
                </p>
              </div>

              <div className="mt-6 space-y-3 font-mono text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span>100% Free &amp; Open Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span>Zero Sponsored Content</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span>Reproducible Benchmarks</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: CHRONOLOGICAL FEED & TOPIC FILTER (Core Functionality)
          Anchor: id="feed-section"
          8 cols of real NoteCards with topic tags & search filtering.
          4 cols of HomeSidebar with popular topics and domains.
         ========================================================================= */}
      <section className="w-full py-16 sm:py-24 border-t border-edge/60 dark:border-stone/20 bg-canvas" id="feed-section">
        <div className="max-w-marketing mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            
            {/* LEFT COLUMN: TOPIC FILTER & POST FEED (8 COLS) */}
            <div className="lg:col-span-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="font-mono text-[13px] font-medium uppercase tracking-technical text-muted block mb-1">
                    CHRONOLOGICAL FEED
                  </span>
                  <h2 className="text-[28px] sm:text-[34px] font-normal leading-none tracking-tight text-strong dark:text-white">
                    Recent Technical Notes
                  </h2>
                </div>
                <div className="font-mono text-[13px] text-muted">
                  Showing <span className="text-strong dark:text-white font-medium">{filteredNotes.length}</span> notes
                </div>
              </div>

              {/* Dynamic Topic Filter Pills */}
              <div className="mb-6">
                <FilterBar
                  items={filterTopics}
                  selectedId={selectedTopic}
                  onSelect={(topicId) => setSelectedTopic(topicId)}
                />
              </div>

              {/* Active Search Badge (if search query entered in composer) */}
              {composerQuery && (
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-stone/40 dark:bg-stone/20 font-mono text-[12px] text-strong dark:text-white">
                  <span>Filtered by: "{composerQuery}"</span>
                  <button
                    type="button"
                    onClick={() => setComposerQuery('')}
                    className="text-accent hover:underline font-bold"
                  >
                    Clear ×
                  </button>
                </div>
              )}

              {/* Feed Articles List */}
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onTagClick={(tag: string) => {
                      setSelectedTopic(tag);
                      setComposerQuery('');
                    }}
                  />
                ))}

                {/* Empty State Fallback */}
                {filteredNotes.length === 0 && (
                  <div className="py-16 text-center rounded-[20px] bg-panel dark:bg-[#1a1815] border border-edge">
                    <span className="material-symbols-outlined text-[36px] text-muted">
                      search_off
                    </span>
                    <p className="mt-3 text-[18px] font-normal text-strong dark:text-white">
                      No notes match this filter
                    </p>
                    <p className="text-[14px] text-muted mt-1">
                      Try selecting another topic tag or resetting the filter query.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTopic('all');
                        setComposerQuery('');
                      }}
                      style={{ backgroundColor: '#ff3c00', color: '#ffffff' }}
                      className="btn-primary-accent mt-5 rounded-[8px] bg-[#ff3c00] px-5 py-2.5 text-[14px] text-white hover:opacity-90 transition-opacity cursor-pointer font-medium shadow-xs"
                    >
                      Show All Notes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: POPULAR TOPICS SIDEBAR (4 COLS) */}
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

      {/* =========================================================================
          SECTION 8: CLOSING INVITATION
          Centered 56px question (-0.04em tracking), 16px/1.7 reassurance line,
          and 52px orange Primary button.
         ========================================================================= */}
      <section className="w-full py-20 sm:py-28 text-center bg-canvas">
        <div className="max-w-[1280px] mx-auto px-4 flex flex-col items-center">
          
          {/* Centered closing-heading: 56px/1 regular with -0.04em tracking */}
          <h2 className="text-[38px] sm:text-[48px] md:text-[56px] font-normal leading-none tracking-tighter text-strong dark:text-white max-w-2xl">
            What will you build next?
          </h2>

          {/* 16px/1.7 reassurance body capped at 560px */}
          <p className="mt-5 text-[16px] leading-[1.7] text-muted dark:text-ash max-w-[560px] font-normal">
            Explore open-source engineering notes, interactive calculation primitives, and deep systems benchmarks completely free.
          </p>

          {/* 52px Orange Primary Action button */}
          <div className="mt-8 sm:mt-10">
            <button
              type="button"
              onClick={() => scrollToSection('feed-section')}
              style={{ backgroundColor: '#ff3c00', color: '#ffffff' }}
              className="btn-primary-accent h-[52px] px-7 rounded-[8px] bg-[#ff3c00] text-white text-[15px] font-medium tracking-tight inline-flex items-center justify-center gap-2 hover:bg-[#e03500] hover:opacity-95 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <span>Start exploring notes</span>
              <span className="material-symbols-outlined text-[19px] text-white">arrow_forward</span>
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};