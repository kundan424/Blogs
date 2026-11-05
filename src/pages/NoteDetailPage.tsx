import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { notes } from '../data/notes';
import { getNoteBySlug, getAllNotes } from '../utils/contentLoader';
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { ReadingProgressBar } from '../components/interactive/ReadingProgressBar';
import { ArticleAuthorRail, TableOfContents } from '../components/sidebar/ArticleSidebar';
import { useToast } from '../context/ToastContext';

interface CommentItem {
  id: number;
  author: string;
  role: string;
  date: string;
  content: string;
}

export const NoteDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { showToast } = useToast();

  const contentNote = slug ? getNoteBySlug(slug) : undefined;
  const fallbackNote = notes.find((n) => n.slug === slug) || notes[0];
  const note = contentNote || fallbackNote;
  const isDraft = (note as any).isDraft || (note as any).published === false;

  const allNotes = useMemo(() => {
    const loaded = getAllNotes();
    return loaded.length > 0 ? loaded : notes;
  }, []);

  const currentIndex = allNotes.findIndex((n) => n.slug === note.slug);
  const prevNote =
    currentIndex > 0
      ? allNotes[currentIndex - 1]
      : allNotes[allNotes.length - 1];
  const nextNote =
    currentIndex >= 0 && currentIndex < allNotes.length - 1
      ? allNotes[currentIndex + 1]
      : allNotes[0];

  const [comments, setComments] = useState<CommentItem[]>(() => {
    try {
      const stored = localStorage.getItem(`blog_comments_${note.slug}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const sections = useMemo(() => note.sections || [], [note.sections]);

  const allSectionIds = useMemo(() => {
    const list: string[] = [];
    for (const sec of sections) {
      list.push(sec.id);
      if (sec.subsections) {
        for (const sub of sec.subsections) {
          list.push(sub.id);
        }
      }
    }
    return list;
  }, [sections]);

  const [activeSection, setActiveSection] = useState(
    sections.length > 0 ? sections[0].id : ''
  );
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  // ScrollSpy: Keep "On This Page" sidebar synced as user scrolls down the article
  useEffect(() => {
    if (!sections || sections.length === 0) return;

    // Reset initial active section
    setActiveSection(sections[0].id);

    const handleScroll = () => {
      const sectionElements: { id: string; top: number }[] = [];

      for (const id of allSectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          sectionElements.push({
            id,
            top: rect.top,
          });
        }
      }

      if (sectionElements.length === 0) return;

      // Threshold from viewport top: navbar (~64px) + breathing room
      const TOP_OFFSET = 140;

      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight;
      const isAtBottom = windowHeight + scrollY >= docHeight - 60;

      // When scrolled near bottom of the article, highlight the last section
      if (isAtBottom) {
        setActiveSection(sectionElements[sectionElements.length - 1].id);
        return;
      }

      // If at top of the page, highlight the first section
      if (scrollY < 120) {
        setActiveSection(sectionElements[0].id);
        return;
      }

      // Find the last section whose top is <= TOP_OFFSET
      let currentActive = sectionElements[0].id;
      for (const sec of sectionElements) {
        if (sec.top <= TOP_OFFSET) {
          currentActive = sec.id;
        } else {
          break;
        }
      }

      setActiveSection(currentActive);
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run an initial check after mounting
    const timer = setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, [sections, allSectionIds, slug]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const navbarOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment: CommentItem = {
      id: Date.now(),
      author: 'Kundan',
      role: 'Software Engineer',
      date: 'Just now',
      content: commentText.trim(),
    };
    const updated = [...comments, newComment];
    setComments(updated);
    try {
      localStorage.setItem(`blog_comments_${note.slug}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    setCommentText('');
    showToast('Comment submitted to discussion thread');
  };

  return (
    <div className="w-full bg-eggshell min-h-screen">
      {/* Top Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Main Editorial Container */}
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* ZONE 1: ARTICLE HEADER BLOCK */}
        <header className="mb-10 lg:mb-14 border-b border-stone dark:border-[#332e27] pb-8">
          {/* Breadcrumbs */}
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Subjects', href: '/subjects' },
              { label: note.subjectName, href: `/subjects/${note.subjectSlug}` },
              { label: note.title },
            ]}
            className="mb-6"
          />

          {/* Local Draft Mode Alert Banner */}
          {isDraft && (
            <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400 flex flex-wrap items-center justify-between gap-2 font-mono-data text-label-sm shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-semibold uppercase tracking-wider">Local Draft Mode</span>
                <span className="text-smoke text-[11px]">({(note as any).filePath || 'Draft File'})</span>
              </div>
              <span className="text-[11px] text-smoke">published: false (visible only in development)</span>
            </div>
          )}

          {/* Metadata Badges Row */}
          <div className="flex flex-wrap items-center gap-space-sm mb-4">
            <Link
              to={`/subjects/${note.subjectSlug}`}
              className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-warm-taupe dark:bg-[#1a1815] text-graphite font-label-md text-label-md hover:bg-surface-container transition-colors border border-stone dark:border-[#332e27]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-ember-orange" />
              {note.subjectName}
            </Link>
            <span className="font-mono-data text-mono-data text-smoke flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">calendar_today</span>
              {note.publishDate}
            </span>
            {note.updatedDate && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container dark:bg-[#201d19] font-mono-data text-label-sm text-ink border border-stone/50 dark:border-[#332e27]">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-spark animate-pulse" />
                Updated {note.updatedDate}
              </span>
            )}
            <span className="font-mono-data text-mono-data text-smoke flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">timer</span>
              {note.readTime}
            </span>
          </div>

          {/* Main Display Headline */}
          <h1 className="font-display-lg text-headline-lg md:text-display text-ink tracking-tight font-light mb-4 leading-tight max-w-4xl">
            {note.title}
          </h1>

          {/* Compact Author Byline in Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-ink text-on-primary flex items-center justify-center font-mono-data text-label-sm font-semibold ring-1 ring-stone dark:ring-[#332e27]">
              {(note.author?.name || 'Kundan').split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-label-md text-ink font-medium">{note.author?.name || 'Kundan'}</span>
              <span className="text-smoke font-mono-data text-label-sm">{note.author?.role || 'Software Engineer'}</span>
              <span className="text-smoke font-mono-data text-label-sm hidden sm:inline">• {note.author?.handle || '@kundan'}</span>
            </div>
          </div>

          {/* Executive Abstract */}
          <p className="font-mono-data text-body-md text-graphite leading-relaxed max-w-3xl mb-8">
            {note.abstract}
          </p>

          {/* Topic Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {note.tags.map((tag) => (
              <Link
                key={tag}
                to={`/topics/${tag}`}
                className="px-3 py-1 rounded-full bg-surface-container font-mono-data text-label-sm text-on-surface-variant hover:text-ink hover:bg-warm-taupe transition-colors border border-stone/60"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </header>

        {/* MOBILE TABLE OF CONTENTS (< 1024px) */}
        {sections.length > 0 && (
          <aside className="block lg:hidden mb-10 bg-warm-taupe dark:bg-[#1a1815] rounded-xl p-space-md shadow-sm border border-stone dark:border-[#332e27]">
            <div
              className="flex items-center justify-between font-mono-data text-label-md text-ink font-medium cursor-pointer"
              onClick={() => setMobileTocOpen(!mobileTocOpen)}
            >
              <span className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-ember-orange">
                  toc
                </span>
                ON THIS PAGE (TABLE OF CONTENTS)
              </span>
              <span className="material-symbols-outlined transition-transform duration-200">
                {mobileTocOpen ? 'expand_less' : 'expand_more'}
              </span>
            </div>
            {mobileTocOpen && (
              <div className="mt-4 pt-4 border-t border-stone dark:border-[#332e27] space-y-1.5 font-mono-data text-label-sm text-smoke">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      scrollToSection(sec.id);
                      setMobileTocOpen(false);
                    }}
                    className={`block w-full text-left py-1.5 px-2.5 rounded-lg transition-colors ${
                      activeSection === sec.id
                        ? 'text-ink dark:text-white font-medium bg-surface-container-lowest dark:bg-[#26221d] border-l-2 border-violet-spark pl-3'
                        : 'hover:text-ink hover:bg-surface-container-lowest/50 dark:hover:bg-[#201d19]'
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </div>
            )}
          </aside>
        )}

        {/* 12-COL EDITORIAL LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Slim Interactive Action & Author Rail (1 col) */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-24">
            <ArticleAuthorRail
              author={note.author}
              readTime={note.readTime}
              slug={note.slug}
              initialClaps={note.claps || 0}
            />
          </aside>

          {/* Center Column: Article Rich Content (8 cols - 67% width) */}
          <article className="lg:col-span-8 space-y-10 leading-relaxed font-body-md text-ink">
            {(note as any).markdownBody ? (
              <MarkdownRenderer content={(note as any).markdownBody} />
            ) : (
              <div className="py-16 text-center text-smoke border border-dashed border-stone dark:border-[#332e27] rounded-2xl">
                <span className="material-symbols-outlined text-[32px] mb-2">article</span>
                <p className="font-body-md text-ink">No markdown content available for this note.</p>
                <p className="font-mono-data text-label-sm text-smoke mt-1">Slug: {note.slug}</p>
              </div>
            )}

            {/* Next / Prev Article Navigation Pager */}
            <div className="pt-8 border-t border-stone dark:border-[#332e27] grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevNote && (
                <Link
                  to={`/notes/${prevNote.slug}`}
                  className="group flex flex-col justify-between p-4 rounded-xl bg-warm-taupe dark:bg-[#2c2927] border border-stone/80 dark:border-[#332e27] hover:border-graphite/40 dark:hover:border-[#4d463b] hover:shadow-sm transition-all text-left"
                >
                  <div className="flex items-center gap-1.5 font-mono-data text-[11px] text-smoke uppercase tracking-wider mb-2 group-hover:text-ink dark:group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[14px] transition-transform group-hover:-translate-x-1">
                      arrow_back
                    </span>
                    <span>PREVIOUS NOTE</span>
                  </div>
                  <span className="font-label-md text-label-md text-ink group-hover:text-violet-spark transition-colors font-medium line-clamp-1">
                    {prevNote.title}
                  </span>
                  <span className="font-mono-data text-[11px] text-smoke mt-1.5">
                    {prevNote.subjectName} • {prevNote.readTime}
                  </span>
                </Link>
              )}

              {nextNote && (
                <Link
                  to={`/notes/${nextNote.slug}`}
                  className="group flex flex-col justify-between p-4 rounded-xl bg-warm-taupe dark:bg-[#2c2927] border border-stone/80 dark:border-[#332e27] hover:border-graphite/40 dark:hover:border-[#4d463b] hover:shadow-sm transition-all sm:text-right"
                >
                  <div className="flex items-center sm:justify-end gap-1.5 font-mono-data text-[11px] text-smoke uppercase tracking-wider mb-2 group-hover:text-ink dark:group-hover:text-white transition-colors">
                    <span>NEXT NOTE</span>
                    <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </div>
                  <span className="font-label-md text-label-md text-ink group-hover:text-violet-spark transition-colors font-medium line-clamp-1">
                    {nextNote.title}
                  </span>
                  <span className="font-mono-data text-[11px] text-smoke mt-1.5">
                    {nextNote.subjectName} • {nextNote.readTime}
                  </span>
                </Link>
              )}
            </div>

            {/* Discussion / Responses Section */}
            <section className="pt-10 border-t border-stone dark:border-[#332e27] space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-ink font-light">
                  Discussion &amp; Runbook Notes ({comments.length})
                </h3>
                <span className="font-mono-data text-label-sm text-smoke">
                  Peer Review
                </span>
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="space-y-3">
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share production war stories, benchmark findings, or ask technical questions..."
                  className="w-full p-3.5 rounded-xl bg-warm-taupe dark:bg-[#1a1815] border border-stone dark:border-[#332e27] font-body-sm text-ink placeholder:text-smoke focus:outline-none focus:border-ink transition-colors"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-ink text-on-primary font-label-md text-label-md hover:bg-graphite transition-colors shadow-sm"
                  >
                    Post Comment
                  </button>
                </div>
              </form>

              {/* Existing Comments List */}
              <div className="space-y-4 pt-4">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-surface-container-lowest dark:bg-[#1a1815] border border-stone dark:border-[#332e27] shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between font-mono-data text-label-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink">{c.author}</span>
                        <span className="text-smoke">• {c.role}</span>
                      </div>
                      <span className="text-smoke text-[11px]">{c.date}</span>
                    </div>
                    <p className="font-body-sm text-graphite leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="py-8 text-center rounded-xl bg-warm-taupe/40 dark:bg-[#1a1815] border border-dashed border-stone dark:border-[#332e27]">
                    <span className="material-symbols-outlined text-[24px] text-smoke">forum</span>
                    <p className="mt-1 font-body-sm text-smoke">
                      No comments yet. Share your architecture heuristics or benchmark questions above.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </article>

          {/* Right Column: Dynamic Table of Contents (3 cols) */}
          {sections.length > 0 && (
            <aside className="hidden lg:block lg:col-span-3 sticky top-24">
              <div className="p-4 rounded-xl bg-warm-taupe/80 dark:bg-[#1a1815] border border-stone/80 dark:border-[#332e27] shadow-sm">
                <TableOfContents
                  sections={sections}
                  activeId={activeSection}
                  onSelect={scrollToSection}
                />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
