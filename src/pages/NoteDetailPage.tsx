import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { notes } from '../data/notes';
import { getNoteBySlug, getAllNotes } from '../utils/contentLoader';
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { ReadingProgressBar } from '../components/interactive/ReadingProgressBar';
import { EmbeddedArticleSidebar } from '../components/sidebar/ArticleSidebar';
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

  // Claps State & Handler
  const [claps, setClaps] = useState(() => {
    if (note.slug) {
      try {
        const stored = localStorage.getItem(`blog_claps_${note.slug}`);
        if (stored) return Number(stored);
      } catch {}
    }
    return note.claps || 0;
  });

  const handleClap = () => {
    const nextVal = claps + 1;
    setClaps(nextVal);
    if (note.slug) {
      try {
        localStorage.setItem(`blog_claps_${note.slug}`, String(nextVal));
      } catch {}
    }
    showToast(`Applauded note (+1) • Total: ${nextVal}`);
  };

  // Bookmark State & Handler
  const [bookmarked, setBookmarked] = useState(() => {
    if (note.slug) {
      try {
        const stored = localStorage.getItem(`blog_bookmark_${note.slug}`);
        if (stored) return stored === 'true';
      } catch {}
    }
    return false;
  });

  const handleBookmark = () => {
    const nextState = !bookmarked;
    setBookmarked(nextState);
    if (note.slug) {
      try {
        localStorage.setItem(`blog_bookmark_${note.slug}`, String(nextState));
      } catch {}
    }
    showToast(nextState ? 'Saved note to reading list' : 'Removed from reading list');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Permalink copied to clipboard');
  };

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
  const [sidebarHidden, setSidebarHidden] = useState(() => {
    try {
      return localStorage.getItem('blog_sidebar_hidden') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('blog_sidebar_hidden', String(next));
      } catch {}
      return next;
    });
  };

  // ScrollSpy: Keep "On This Page" sidebar synced as user scrolls down the article
  useEffect(() => {
    if (!sections || sections.length === 0) return;

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

      const TOP_OFFSET = 140;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight;
      const isAtBottom = windowHeight + scrollY >= docHeight - 60;

      if (isAtBottom) {
        setActiveSection(sectionElements[sectionElements.length - 1].id);
        return;
      }

      if (scrollY < 120) {
        setActiveSection(sectionElements[0].id);
        return;
      }

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
      role: 'Staff Engineer',
      date: 'Just now',
      content: commentText.trim(),
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    try {
      localStorage.setItem(`blog_comments_${note.slug}`, JSON.stringify(updated));
    } catch {}
    setCommentText('');
    showToast('Comment submitted to discussion thread');
  };

  return (
    <div className="w-full bg-eggshell dark:bg-[#090a0f] text-ink dark:text-[#e2e8f0] min-h-screen flex flex-col transition-colors duration-200 selection:bg-warm-taupe dark:selection:bg-[#38265a] selection:text-ink dark:selection:text-[#f5f3ff]">
      {/* Top Reading Progress Bar */}
      <ReadingProgressBar />

      {/* MOBILE ON-THIS-PAGE ACCORDION BAR (< 1024px) */}
      {sections.length > 0 && (
        <div className="block lg:hidden border-b border-stone/80 dark:border-[#1e2029] bg-warm-taupe dark:bg-[#0d0e15] px-4 py-3 sticky top-16 z-30 shadow-xs">
          <button
            type="button"
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="flex items-center justify-between w-full font-mono text-[12px] text-violet-spark dark:text-[#c084fc] font-medium"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>ON THIS PAGE ({sections.length} LESSON TOPICS)</span>
            </span>
            <span className="material-symbols-outlined text-[18px]">
              {mobileTocOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {mobileTocOpen && (
            <div className="mt-3 pt-3 border-t border-stone/70 dark:border-[#1e2029] max-h-72 overflow-y-auto space-y-1.5 font-mono text-[12px]">
              {sections.map((sec, idx) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    scrollToSection(sec.id);
                    setMobileTocOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg transition-colors ${
                    activeSection === sec.id
                      ? 'bg-violet-spark/10 dark:bg-[#1f1837] text-violet-spark dark:text-[#e9d5ff] font-semibold border-l-2 border-violet-spark dark:border-[#a855f7]'
                      : 'text-graphite dark:text-[#94a3b8] hover:text-ink dark:hover:text-white hover:bg-stone/20 dark:hover:bg-[#151624]'
                  }`}
                >
                  <span className="text-violet-spark dark:text-[#a855f7] font-semibold">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="truncate">{sec.title.replace(/^\d+\.\s*/, '')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Reopen Sidebar Button when collapsed */}
      {sidebarHidden && sections.length > 0 && (
        <button
          type="button"
          onClick={toggleSidebar}
          className="fixed left-4 top-20 z-30 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-warm-taupe/95 dark:bg-[#10111a]/95 border border-stone/80 dark:border-[#25283b] text-graphite dark:text-[#cbd5e1] hover:text-ink dark:hover:text-white shadow-lg backdrop-blur-md transition-all font-mono text-[11.5px] hover:scale-105"
          title="Open table of contents sidebar"
        >
          <span className="material-symbols-outlined text-[15px] text-violet-spark dark:text-[#a855f7]">
            dock_to_right
          </span>
          <span className="font-medium">On This Page ({sections.length})</span>
        </button>
      )}

      {/* 2-COLUMN VIEW: EMBEDDED LEFT SIDEBAR + ARTICLE SCROLL AREA */}
      <div className="w-full max-w-[1720px] mx-auto flex flex-1">
        {/* LEFT COLUMN: EMBEDDED ON THIS PAGE SIDEBAR (SHRUNK COMPACT: 250px - 280px) */}
        {!sidebarHidden && sections.length > 0 && (
          <div className="hidden lg:block w-[250px] lg:w-[270px] xl:w-[280px] shrink-0 sticky top-16 h-[calc(100vh-64px)] z-20">
            <EmbeddedArticleSidebar
              sections={sections}
              activeId={activeSection}
              onSelect={scrollToSection}
              subjectTitle={
                note.subjectName
                  ? `${note.subjectName.toUpperCase()} ONE-STOP INTERVIEW PREP`
                  : 'JAVA ONE-STOP INTERVIEW PREP'
              }
              readTime={note.readTime}
              onToggleCollapse={toggleSidebar}
              className="w-full h-full"
            />
          </div>
        )}

        {/* RIGHT COLUMN: ARTICLE SCROLL CANVAS (RESPONSIVE FOR LIGHT & DARK MODE) */}
        <main
          className={`flex-1 min-w-0 bg-[#faf8f5] dark:bg-[#0a0b10] py-8 lg:py-12 border-l border-stone/60 dark:border-[#1a1b26] transition-colors duration-200 ${
            sidebarHidden
              ? 'px-6 sm:px-12 lg:px-20 max-w-5xl mx-auto'
              : 'px-6 sm:px-10 lg:pl-12 lg:pr-10 xl:pl-16 xl:pr-14'
          }`}
        >
          <div className="max-w-4xl mx-auto space-y-10">
            {/* ZONE 1: ARTICLE HEADER BLOCK */}
            <header className="border-b border-stone/80 dark:border-[#1e2029] pb-8">
              {/* Breadcrumbs */}
              <Breadcrumb
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Subjects', href: '/subjects' },
                  { label: note.subjectName, href: `/subjects/${note.subjectSlug}` },
                  { label: note.title },
                ]}
                className="mb-6 text-smoke dark:text-[#94a3b8]"
              />

              {/* Local Draft Mode Alert Banner */}
              {isDraft && (
                <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-800 dark:text-amber-400 flex flex-wrap items-center justify-between gap-2 font-mono text-label-sm shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-semibold uppercase tracking-wider">Local Draft Mode</span>
                    <span className="text-smoke text-[11px]">({(note as any).filePath || 'Draft File'})</span>
                  </div>
                  <span className="text-[11px] text-smoke dark:text-[#94a3b8]">published: false (visible only in development)</span>
                </div>
              )}

              {/* Metadata Badges & Interaction Action Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/subjects/${note.subjectSlug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm-taupe dark:bg-[#131520] text-graphite dark:text-[#cbd5e1] font-mono text-[12px] hover:bg-surface-container dark:hover:bg-[#1e2133] hover:text-ink dark:hover:text-white transition-colors border border-stone/80 dark:border-[#23273d]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-spark dark:bg-[#c084fc]" />
                    {note.subjectName}
                  </Link>
                  <span className="font-mono text-[12px] text-smoke dark:text-[#94a3b8] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {note.publishDate}
                  </span>
                  {note.updatedDate && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high dark:bg-[#121626] font-mono text-[11px] text-graphite dark:text-[#a5b4fc] border border-stone/70 dark:border-[#202747]">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-spark dark:bg-[#818cf8] animate-pulse" />
                      Updated {note.updatedDate}
                    </span>
                  )}
                  <span className="font-mono text-[12px] text-smoke dark:text-[#94a3b8] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">timer</span>
                    {note.readTime}
                  </span>
                </div>

                {/* Quick Interactive Actions (Applaud, Bookmark, Permalink) */}
                <div className="flex items-center gap-1.5 bg-warm-taupe/90 dark:bg-[#10121a] p-1 rounded-xl border border-stone/80 dark:border-[#1e2029]">
                  <button
                    type="button"
                    onClick={handleClap}
                    title="Applaud note"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-graphite dark:text-[#cbd5e1] hover:text-ember-orange dark:hover:text-[#fb7185] hover:bg-stone/30 dark:hover:bg-[#1a1c28] transition-all text-[12px] font-mono"
                  >
                    <span className="material-symbols-outlined text-[16px] text-ember-orange dark:text-[#f43f5e]">favorite</span>
                    <span>{claps}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleBookmark}
                    title={bookmarked ? 'Saved to reading list' : 'Save for later'}
                    className={`p-1.5 rounded-lg transition-all ${
                      bookmarked
                        ? 'bg-ink text-on-primary dark:bg-[#7c3aed] dark:text-white'
                        : 'text-smoke dark:text-[#94a3b8] hover:text-ink dark:hover:text-white hover:bg-stone/30 dark:hover:bg-[#1a1c28]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {bookmarked ? 'bookmark_added' : 'bookmark'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    title="Copy permalink"
                    className="p-1.5 rounded-lg text-smoke dark:text-[#94a3b8] hover:text-ink dark:hover:text-white hover:bg-stone/30 dark:hover:bg-[#1a1c28] transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">link</span>
                  </button>
                </div>
              </div>

              {/* Main Display Headline */}
              <h1 className="font-sans text-[28px] sm:text-[36px] lg:text-[42px] text-ink dark:text-[#f8fafc] tracking-tight font-light mb-4 leading-tight">
                {note.title}
              </h1>

              {/* Author Byline */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-ink text-on-primary dark:bg-[#1e2133] dark:text-[#c084fc] flex items-center justify-center font-mono text-[12px] font-semibold ring-1 ring-stone dark:ring-[#31354c]">
                  {(note.author?.name || 'Kundan').split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
                  <span className="text-ink dark:text-[#f1f5f9] font-medium">{note.author?.name || 'Kundan'}</span>
                  <span className="text-smoke dark:text-[#94a3b8] font-mono text-[12px]">{note.author?.role || 'Software Engineer'}</span>
                  <span className="text-smoke/70 dark:text-[#64748b] font-mono text-[12px] hidden sm:inline">• {note.author?.handle || '@kundan'}</span>
                </div>
              </div>

              {/* Executive Abstract */}
              <p className="font-body-lg sm:text-display-sm  text-graphite dark:text-[#151515] leading-relaxed max-w-3xl mb-6">
                {note.abstract}
              </p>

              {/* Topic Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {note.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/topics/${tag}`}
                    className="px-3 py-1 rounded-full bg-warm-taupe dark:bg-[#11131c] font-mono text-[11.5px] text-graphite dark:text-[#94a3b8] hover:text-ink dark:hover:text-white hover:bg-stone/50 dark:hover:bg-[#1c1f2e] transition-colors border border-stone/70 dark:border-[#1e2130]"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </header>

            {/* ZONE 2: ARTICLE BODY CONTENT */}
            <article className="space-y-10 leading-relaxed font-body-md text-graphite dark:text-[#cbd5e1]">
              {(note as any).markdownBody ? (
                <MarkdownRenderer content={(note as any).markdownBody} />
              ) : (
                <div className="py-16 text-center text-smoke dark:text-[#64748b] border border-dashed border-stone dark:border-[#1e2029] rounded-2xl">
                  <span className="material-symbols-outlined text-[32px] mb-2">article</span>
                  <p className="font-body-md text-ink dark:text-[#f1f5f9]">No markdown content available for this note.</p>
                  <p className="font-mono text-[12px] text-smoke dark:text-[#64748b] mt-1">Slug: {note.slug}</p>
                </div>
              )}

              {/* Next / Prev Article Navigation Pager */}
              <div className="pt-8 border-t border-stone/80 dark:border-[#1e2029] grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevNote && (
                  <Link
                    to={`/notes/${prevNote.slug}`}
                    className="group flex flex-col justify-between p-4 rounded-xl bg-warm-taupe dark:bg-[#0d0e15] border border-stone/80 dark:border-[#1e2029] hover:border-violet-spark/50 dark:hover:border-[#6366f1]/50 hover:bg-surface-container-lowest dark:hover:bg-[#11131c] transition-all text-left"
                  >
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-smoke dark:text-[#64748b] uppercase tracking-wider mb-2 group-hover:text-violet-spark dark:group-hover:text-[#a5b4fc] transition-colors">
                      <span className="material-symbols-outlined text-[14px] transition-transform group-hover:-translate-x-1">
                        arrow_back
                      </span>
                      <span>PREVIOUS NOTE</span>
                    </div>
                    <span className="text-[14px] text-ink dark:text-[#f1f5f9] group-hover:text-violet-spark dark:group-hover:text-[#c084fc] transition-colors font-medium line-clamp-1">
                      {prevNote.title}
                    </span>
                    <span className="font-mono text-[11px] text-smoke dark:text-[#64748b] mt-1.5">
                      {prevNote.subjectName} • {prevNote.readTime}
                    </span>
                  </Link>
                )}

                {nextNote && (
                  <Link
                    to={`/notes/${nextNote.slug}`}
                    className="group flex flex-col justify-between p-4 rounded-xl bg-warm-taupe dark:bg-[#0d0e15] border border-stone/80 dark:border-[#1e2029] hover:border-violet-spark/50 dark:hover:border-[#6366f1]/50 hover:bg-surface-container-lowest dark:hover:bg-[#11131c] transition-all sm:text-right"
                  >
                    <div className="flex items-center sm:justify-end gap-1.5 font-mono text-[11px] text-smoke dark:text-[#64748b] uppercase tracking-wider mb-2 group-hover:text-violet-spark dark:group-hover:text-[#a5b4fc] transition-colors">
                      <span>NEXT NOTE</span>
                      <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-1">
                        arrow_forward
                      </span>
                    </div>
                    <span className="text-[14px] text-ink dark:text-[#f1f5f9] group-hover:text-violet-spark dark:group-hover:text-[#c084fc] transition-colors font-medium line-clamp-1">
                      {nextNote.title}
                    </span>
                    <span className="font-mono text-[11px] text-smoke dark:text-[#64748b] mt-1.5">
                      {nextNote.subjectName} • {nextNote.readTime}
                    </span>
                  </Link>
                )}
              </div>

              {/* Discussion / Responses Section */}
              <section className="pt-10 border-t border-stone/80 dark:border-[#1e2029] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-[20px] text-ink dark:text-[#f8fafc] font-light">
                    Discussion &amp; Runbook Notes ({comments.length})
                  </h3>
                  <span className="font-mono text-[12px] text-smoke dark:text-[#64748b]">
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
                    className="w-full p-3.5 rounded-xl bg-warm-taupe dark:bg-[#0d0e15] border border-stone/80 dark:border-[#1e2029] font-body-sm text-ink dark:text-[#f1f5f9] placeholder:text-smoke dark:placeholder-[#64748b] focus:outline-none focus:border-violet-spark dark:focus:border-[#7c3aed] transition-colors text-[13.5px]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-ink text-on-primary dark:bg-[#7c3aed] dark:text-white font-mono text-[12px] font-medium hover:bg-graphite dark:hover:bg-[#6d28d9] transition-colors shadow-xs"
                    >
                      Post Comment
                    </button>
                  </div>
                </form>

                {/* Existing Comments List */}
                <div className="space-y-4 pt-2">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-surface-container-lowest dark:bg-[#0d0e15] border border-stone/80 dark:border-[#1e2029] space-y-2"
                    >
                      <div className="flex items-center justify-between font-mono text-[12px]">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink dark:text-[#f1f5f9]">{c.author}</span>
                          <span className="text-smoke dark:text-[#64748b]">• {c.role}</span>
                        </div>
                        <span className="text-smoke dark:text-[#64748b] text-[11px]">{c.date}</span>
                      </div>
                      <p className="font-body-sm text-graphite dark:text-[#cbd5e1] leading-relaxed text-[13px]">
                        {c.content}
                      </p>
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <div className="py-8 text-center rounded-xl bg-warm-taupe/40 dark:bg-[#0c0d13] border border-dashed border-stone dark:border-[#1e2029]">
                      <span className="material-symbols-outlined text-[24px] text-smoke dark:text-[#64748b]">forum</span>
                      <p className="mt-1 font-body-sm text-smoke dark:text-[#64748b] text-[13px]">
                        No comments yet. Share your architecture heuristics or benchmark questions above.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </article>
          </div>
        </main>
      </div>
    </div>
  );
};
