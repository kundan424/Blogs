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
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#161616]/60 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSearch();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-[24px] bg-bright-white dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] shadow-2xs transition-all">
        {/* Search Input Header */}
        <div className="relative flex items-center bg-[#f0f0f0] dark:bg-[#262626] px-5 py-3.5 border-b border-[#d9d9d9] dark:border-[#333333]">
          <span className="material-symbols-outlined text-[20px] text-[#8f8f8f]">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, notes, tags, or concepts..."
            spellCheck="false"
            autoComplete="off"
            className="ml-3 flex-1 bg-transparent font-mono text-[14px] text-[#161616] dark:text-[#fafafa] placeholder:text-[#8f8f8f] focus:outline-none"
          />
          <button
            type="button"
            onClick={closeSearch}
            className="rounded-full p-1.5 text-[#8f8f8f] hover:bg-[#d9d9d9] dark:hover:bg-[#333333] hover:text-[#161616] dark:hover:text-[#fafafa] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {/* Category: Subjects */}
          {filteredSubjects.length > 0 && (
            <div>
              <div className="px-3 pb-2 font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#161616] dark:bg-[#fafafa]" />
                <span>Core Subjects</span>
              </div>
              <div className="space-y-1">
                {filteredSubjects.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelect(`/subjects/${s.slug}`)}
                    className="palette-item flex cursor-pointer items-center justify-between rounded-[14px] px-3.5 py-2.5 text-[#161616] dark:text-[#fafafa] hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-[#8f8f8f]">
                        {s.icon}
                      </span>
                      <div>
                        <div className="font-sans font-medium text-[14px]">{s.name}</div>
                        <div className="text-[12px] text-[#8f8f8f] line-clamp-1">
                          {s.description}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] px-2.5 py-0.5 rounded-full bg-[#f0f0f0] dark:bg-[#303030] shrink-0 border border-[#d9d9d9] dark:border-[#474747]">
                      {s.notesCount} notes
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category: Notes */}
          {filteredNotes.length > 0 && (
            <div>
              <div className="px-3 pb-2 font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#161616] dark:bg-[#fafafa]" />
                <span>Published Notes &amp; RFCs</span>
              </div>
              <div className="space-y-1">
                {filteredNotes.slice(0, 8).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleSelect(`/notes/${n.slug}`)}
                    className="palette-item flex cursor-pointer items-center justify-between rounded-[14px] px-3.5 py-2.5 text-[#161616] dark:text-[#fafafa] hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <span className="material-symbols-outlined text-[18px] text-[#8f8f8f] shrink-0">
                        description
                      </span>
                      <div className="truncate">
                        <div className="font-sans font-medium text-[14px] truncate">{n.title}</div>
                        <div className="text-[12px] text-[#8f8f8f] truncate font-mono">
                          {n.subjectName} • {n.publishDate}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-[#8f8f8f] shrink-0">
                      {n.readTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category: Topics */}
          {filteredTopics.length > 0 && (
            <div>
              <div className="px-3 pb-2 font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#161616] dark:bg-[#fafafa]" />
                <span>Topics &amp; Internals</span>
              </div>
              <div className="flex flex-wrap gap-2 px-3">
                {filteredTopics.slice(0, 10).map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => handleSelect(`/topics/${t.slug}`)}
                    className="px-3 py-1 rounded-full bg-[#f0f0f0] dark:bg-[#161616] border border-[#d9d9d9] dark:border-[#333333] font-mono text-[12px] uppercase tracking-[0.02em] text-[#616161] dark:text-[#a3a3a3] hover:text-[#161616] dark:hover:text-[#fafafa] hover:border-[#161616] dark:hover:border-[#ffffff] transition-colors cursor-pointer"
                  >
                    #{t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredSubjects.length === 0 && filteredNotes.length === 0 && (
            <div className="py-12 text-center text-[#8f8f8f]">
              <span className="material-symbols-outlined text-[32px] text-[#161616] dark:text-[#fafafa]">search_off</span>
              <p className="mt-2 text-[14px]">No matches found for &quot;{query}&quot;</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-3 bg-[#f0f0f0] dark:bg-[#1c1c1c] border-t border-[#d9d9d9] dark:border-[#333333] flex items-center justify-between text-[11.5px] font-mono uppercase tracking-[0.02em] text-[#8f8f8f]">
          <span>Navigate with click or Enter</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
