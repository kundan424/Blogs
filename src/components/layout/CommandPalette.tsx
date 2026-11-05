import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchModal } from '../../context/SearchModalContext';
import { getEnrichedSubjects, getEnrichedTopics, getAllNotes } from '../../utils/contentLoader';

export const CommandPalette: React.FC = () => {
  const { isOpen, closeSearch } = useSearchModal();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const allAvailableNotes = useMemo(() => getAllNotes(), []);
  const allSubjects = useMemo(() => getEnrichedSubjects(), []);
  const allTopics = useMemo(() => getEnrichedTopics(), []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredSubjects = allSubjects.filter(
    (s) =>
      q === '' ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.featuredTopics.some((t) => t.toLowerCase().includes(q))
  );

  const filteredNotes = allAvailableNotes.filter(
    (n) =>
      q === '' ||
      n.title.toLowerCase().includes(q) ||
      n.abstract.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
  );

  const filteredTopics = allTopics.filter(
    (t) => q === '' || t.name.toLowerCase().includes(q)
  );

  const handleSelect = (path: string) => {
    closeSearch();
    navigate(path);
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-ink/40 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSearch();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-eggshell border border-stone shadow-2xl transition-all">
        {/* Search Input Header */}
        <div className="relative flex items-center bg-surface-container-lowest px-4 py-3.5 border-b border-stone shadow-sm">
          <span className="material-symbols-outlined text-[22px] text-smoke">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, notes, tags, or concepts..."
            spellCheck="false"
            autoComplete="off"
            className="ml-3 flex-1 bg-transparent font-mono-data text-body-md text-ink placeholder:text-smoke focus:outline-none"
          />
          <button
            type="button"
            onClick={closeSearch}
            className="rounded p-1 text-smoke hover:bg-warm-taupe hover:text-ink transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Category: Subjects */}
          {filteredSubjects.length > 0 && (
            <div>
              <div className="px-2 pb-1 font-mono-data text-label-sm uppercase tracking-wider text-smoke">
                Core Subjects
              </div>
              <div className="space-y-1">
                {filteredSubjects.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelect(`/subjects/${s.slug}`)}
                    className="palette-item flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-ink hover:bg-warm-taupe transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-graphite">
                        {s.icon}
                      </span>
                      <span className="font-body-md text-body-md">{s.name}</span>
                    </div>
                    <span className="font-mono-data text-label-sm text-smoke">
                      {s.notesCount} Notes
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category: Notes */}
          {filteredNotes.length > 0 && (
            <div>
              <div className="px-2 pb-1 font-mono-data text-label-sm uppercase tracking-wider text-smoke">
                Technical Notes
              </div>
              <div className="space-y-1">
                {filteredNotes.slice(0, 6).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleSelect(`/notes/${n.slug}`)}
                    className="palette-item flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-ink hover:bg-warm-taupe transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                      <span className="material-symbols-outlined text-[18px] text-graphite shrink-0">
                        description
                      </span>
                      <span className="font-body-md text-body-md truncate">
                        {n.title}
                      </span>
                    </div>
                    <span className="font-mono-data text-label-sm text-smoke shrink-0 ml-2">
                      {n.readTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category: Topics & Tags */}
          {filteredTopics.length > 0 && (
            <div>
              <div className="px-2 pb-1 font-mono-data text-label-sm uppercase tracking-wider text-smoke">
                Topic Tags
              </div>
              <div className="flex flex-wrap gap-1.5 px-2 pt-1">
                {filteredTopics.slice(0, 10).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelect(`/topics/${t.slug}`)}
                    className="cursor-pointer rounded-full bg-warm-taupe px-2.5 py-1 font-mono-data text-label-sm text-graphite hover:bg-ink hover:text-on-primary transition-colors"
                  >
                    #{t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredSubjects.length === 0 &&
            filteredNotes.length === 0 &&
            filteredTopics.length === 0 && (
              <div className="py-8 text-center text-smoke font-body-md">
                No matching results found for "{query}"
              </div>
            )}
        </div>

        {/* Modal Bottom Hints */}
        <div className="flex items-center justify-between px-4 py-2 bg-warm-taupe/80 border-t border-stone font-mono-data text-label-sm text-smoke">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white text-ink shadow-sm">ESC</kbd> to close</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white text-ink shadow-sm">↵</kbd> to select</span>
          </div>
          <span>dev.notes index v2.4</span>
        </div>
      </div>
    </div>
  );
};
