import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { notes } from '../data/notes';
import { getNoteBySlug, getAllNotes } from '../utils/contentLoader';
import { getAllLearningPaths } from '../utils/learningPathLoader';
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer';
import { Breadcrumb } from '../components/common/Breadcrumb';
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

  // Check if this note is part of any structured learning path
  const linkedCurriculum = useMemo(() => {
    const paths = getAllLearningPaths();
    for (const p of paths) {
      for (const m of p.modules) {
        const match = m.lessons.find((l) => l.noteSlug === note.slug);
        if (match) {
          return {
            path: p,
            module: m,
            lesson: match,
          };
        }
      }
    }
    return undefined;
  }, [note.slug]);

  const [comments, setComments] = useState<CommentItem[]>(() => {
    try {
      const stored = localStorage.getItem(`blog_comments_${note.slug}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const sections = useMemo(() => note.sections || [], [note.sections]);

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
      // Find all rendered heading elements in document order
      const headingElements = Array.from(
        document.querySelectorAll<HTMLElement>('article h2[id], article h3[id]')
      );

      if (headingElements.length === 0) return;

      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight;
      const isAtBottom = windowHeight + scrollY >= docHeight - 80;

      if (isAtBottom) {
        setActiveSection(headingElements[headingElements.length - 1].id);
        return;
      }

      if (scrollY < 140) {
        setActiveSection(headingElements[0].id);
        return;
      }

      const TRIGGER_OFFSET = 160;
      let currentActive = headingElements[0].id;

      for (const el of headingElements) {
        const top = el.getBoundingClientRect().top;
        if (top <= TRIGGER_OFFSET) {
          currentActive = el.id;
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
    const timer = setTimeout(handleScroll, 120);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, [sections, slug]);

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
    <div className="w-full bg-product-frost dark:bg-[#0c0f17] text-body-ink min-h-screen flex flex-col transition-colors selection:bg-ice/50 selection:text-navy">
      {/* MOBILE ON-THIS-PAGE ACCORDION BAR (< 1024px) */}
      {sections.length > 0 && (
        <div className="block lg:hidden border-b border-edge bg-white dark:bg-panel px-4 py-3 sticky top-16 z-30 shadow-xs">
          <button
            type="button"
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="flex items-center justify-between w-full font-mono text-[12px] text-navy dark:text-ice font-medium cursor-pointer"
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
            <div className="mt-3 pt-3 border-t border-edge max-h-72 overflow-y-auto space-y-1.5 font-mono text-[12px]">
              {sections.map((sec, idx) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    scrollToSection(sec.id);
                    setMobileTocOpen(false);
                  }}
                  className={`flex items-center gap-2.5 w-full text-left py-2 px-3 rounded-[6px] transition-colors cursor-pointer ${
                    activeSection === sec.id
                      ? 'bg-gradient-to-r from-[#3e5199]/15 to-[#5568ad]/10 dark:from-[#3e5199]/35 dark:to-[#5568ad]/20 text-[#1b2d70] dark:text-ice font-semibold border-l-[3.5px] border-[#3e5199] dark:border-focus-blue'
                      : 'text-secondary-ink hover:text-navy dark:hover:text-white hover:bg-canvas'
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      activeSection === sec.id
                        ? 'text-[#3e5199] dark:text-focus-blue'
                        : 'text-proof-green'
                    }`}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className={`truncate ${activeSection === sec.id ? 'text-[#1b2d70] dark:text-ice font-semibold' : /reference/i.test(sec.title) ? 'text-[#3e5199] dark:text-focus-blue font-medium hover:underline' : ''}`}>
                    {sec.title.replace(/^\d+\.\s*/, '')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2-COLUMN DOCUMENTATION LAYOUT (DEDICATED SIDEBAR PANE + ARTICLE SECTION) */}
      <div className="w-full flex flex-1 items-start">
        {/* LEFT COLUMN: DEDICATED NAVIGATION SIDEBAR PANE (NO GAP, 1PX RIGHT BORDER) */}
        {!sidebarHidden && sections.length > 0 && (
          <aside className="hidden lg:block w-[280px] xl:w-[300px] shrink-0 sticky top-16 h-[calc(100vh-64px)] border-r border-edge bg-canvas/40 dark:bg-[#0e111a] overflow-hidden self-start">
            <EmbeddedArticleSidebar
              sections={sections}
              activeId={activeSection}
              onSelect={scrollToSection}
              onToggleCollapse={toggleSidebar}
              subjectTitle={
                linkedCurriculum
                  ? linkedCurriculum.path.title.toUpperCase()
                  : note.subjectName
                    ? `${note.subjectName.toUpperCase()} TOPICS`
                    : 'ON THIS PAGE'
              }
              readTime={note.readTime}
              className="w-full h-full border-r-0 bg-transparent"
            />
          </aside>
        )}

        {/* RIGHT COLUMN: ARTICLE SECTION (EXPANDS TO 100% WIDTH WHEN SIDEBAR IS COLLAPSED) */}
        <div className="flex-1 min-w-0 w-full px-4 sm:px-6 lg:px-8 py-5 space-y-4">
          {/* TOP NAV BAR: [Hide menu] Button + Breadcrumbs lockup (MATCHES USER IMAGE) */}
          <div className="flex items-center gap-3 flex-wrap">
            {sections.length > 0 && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-white dark:bg-panel border border-edge text-secondary-ink hover:text-navy dark:hover:text-white hover:border-[#3e5199] dark:hover:border-focus-blue transition-all shadow-2xs cursor-pointer font-mono text-[11.5px]"
                title={sidebarHidden ? 'Show menu' : 'Hide menu'}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {sidebarHidden ? 'dock_to_right' : 'dock_to_left'}
                </span>
                <span>{sidebarHidden ? 'Show menu' : 'Hide menu'}</span>
              </button>
            )}

            {/* Breadcrumbs right beside the menu toggle */}
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: note.subjectName, href: `/subjects/${note.subjectSlug}` },
                ...(linkedCurriculum
                  ? [
                      {
                        label: linkedCurriculum.path.title,
                        href: `/learning-paths/${linkedCurriculum.path.slug}`,
                      },
                    ]
                  : []),
                { label: note.title },
              ]}
              className="text-muted-ink"
            />
          </div>

          {/* ARTICLE CONTENT CARD (ITS OWN SEPARATE SECTION) */}
          <main className="w-full bg-white dark:bg-panel p-6 sm:p-10 lg:p-12 rounded-[12px] border border-edge shadow-catalog-edge transition-colors">
            <div className="w-full space-y-10">
            {/* ZONE 1: ARTICLE HEADER BLOCK */}
            <header className="border-b border-edge pb-8">
              {/* Learning Path Curriculum Ribbon */}
              {linkedCurriculum && (
                <div className="mb-6 p-3.5 rounded-[8px] bg-panel/70 dark:bg-panel/40 border border-edge/80 flex flex-wrap items-center justify-between gap-3 text-[12px] font-mono shadow-2xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="material-symbols-outlined text-[17px] text-proof-green">
                      schema
                    </span>
                    <span className="text-muted-ink uppercase tracking-wider text-[10.5px]">
                      Learning Path:
                    </span>
                    <Link
                      to={`/learning-paths/${linkedCurriculum.path.slug}`}
                      className="font-semibold text-navy dark:text-white hover:underline"
                    >
                      {linkedCurriculum.path.title}
                    </Link>
                    <span className="text-muted-ink">•</span>
                    <span className="text-secondary-ink dark:text-muted-ink">
                      Module {linkedCurriculum.module.number} (Lesson {linkedCurriculum.lesson.number})
                    </span>
                  </div>
                  <Link
                    to={`/learning-paths/${linkedCurriculum.path.slug}`}
                    className="inline-flex items-center gap-1 text-proof-green hover:underline font-medium text-[11.5px]"
                  >
                    <span>Full Curriculum</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </Link>
                </div>
              )}

              {/* Local Draft Mode Alert Banner */}
              {isDraft && (
                <div className="mb-6 rounded-[8px] border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-800 dark:text-amber-300 flex flex-wrap items-center justify-between gap-2 font-mono text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-semibold uppercase tracking-wider">Local Draft Mode</span>
                    <span className="text-muted-ink text-[11px]">({(note as any).filePath || 'Draft File'})</span>
                  </div>
                  <span className="text-[11px] text-muted-ink">published: false (visible only in development)</span>
                </div>
              )}

              {/* Metadata Badges & Interaction Action Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/subjects/${note.subjectSlug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-canvas dark:bg-[#121620] text-navy dark:text-ice font-mono text-[12px] hover:border-navy transition-colors border border-edge"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-proof-green" />
                    {note.subjectName}
                  </Link>
                  <span className="font-mono text-[12px] text-muted-ink flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {note.publishDate}
                  </span>
                  {note.updatedDate && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[8px] bg-canvas font-mono text-[11px] text-secondary-ink border border-edge">
                      <span className="w-1.5 h-1.5 rounded-full bg-proof-green animate-pulse" />
                      Updated {note.updatedDate}
                    </span>
                  )}
                  <span className="font-mono text-[12px] text-muted-ink flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">timer</span>
                    {note.readTime}
                  </span>
                </div>

              </div>

              {/* Main Display Headline */}
              <h1 className="text-[26px] sm:text-[34px] lg:text-[30px] text-navy dark:text-white tracking-[-0.03em] font-medium mb-4 leading-[1.15]">
                {note.title}
              </h1>

              {/* Executive Abstract */}
              <p className="text-[16px] sm:text-[17px] text-secondary-ink dark:text-ash leading-relaxed max-w-3xl mb-6 font-normal">
                {note.abstract}
              </p>

              {/* Topic Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {note.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/topics/${tag}`}
                    className="px-3 py-1 rounded-[8px] bg-canvas dark:bg-[#121620] font-mono text-[11.5px] text-secondary-ink hover:text-navy dark:hover:text-white hover:border-navy transition-colors border border-edge"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </header>

            {/* ZONE 2: ARTICLE BODY CONTENT */}
            <article className="space-y-8 leading-relaxed font-body text-body-ink">
              {(note as any).markdownBody ? (
                <MarkdownRenderer content={(note as any).markdownBody} />
              ) : (
                <div className="py-16 text-center text-muted-ink border border-dashed border-edge rounded-[8px]">
                  <span className="material-symbols-outlined text-[32px] mb-2">article</span>
                  <p className="font-body text-navy dark:text-white">No markdown content available for this note.</p>
                  <p className="font-mono text-[12px] text-muted-ink mt-1">Slug: {note.slug}</p>
                </div>
              )}

              {/* Interactive Engagement Bar: Claps, Bookmarks & Share */}
             
              <div className="pt-8 border-t border-edge grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevNote && (
                  <Link
                    to={`/notes/${prevNote.slug}`}
                    className="group flex flex-col justify-between p-4 rounded-[8px] bg-canvas dark:bg-[#121620] border border-edge hover:border-navy transition-all text-left shadow-secondary-btn"
                  >
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-ink uppercase tracking-wider mb-2 group-hover:text-navy dark:group-hover:text-ice transition-colors">
                      <span className="material-symbols-outlined text-[14px] transition-transform group-hover:-translate-x-1">
                        arrow_back
                      </span>
                      <span>PREVIOUS NOTE</span>
                    </div>
                    <span className="text-[14px] text-navy hover:underline hover:text-blue-500 dark:text-white font-medium line-clamp-1">
                      {prevNote.title}
                    </span>
                    <span className="font-mono text-[11px] text-muted-ink mt-1.5">
                      {prevNote.subjectName} • {prevNote.readTime}
                    </span>
                  </Link>
                )}

                {nextNote && (
                  <Link
                    to={`/notes/${nextNote.slug}`}
                    className="group flex flex-col justify-between p-4 rounded-[8px] bg-canvas dark:bg-[#121620] border border-edge hover:border-navy transition-all sm:text-right shadow-secondary-btn"
                  >
                    <div className="flex items-center sm:justify-end gap-1.5 font-mono text-[11px] text-muted-ink uppercase tracking-wider mb-2 group-hover:text-navy dark:group-hover:text-ice transition-colors">
                      <span>NEXT NOTE</span>
                      <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-1">
                        arrow_forward
                      </span>
                    </div>
                    <span className="text-[14px] text-navy hover:underline hover:text-blue-500 dark:text-white font-medium line-clamp-1">
                      {nextNote.title}
                    </span>
                    <span className="font-mono text-[11px] text-muted-ink mt-1.5">
                      {nextNote.subjectName} • {nextNote.readTime}
                    </span>
                  </Link>
                )}
              </div>

              {/* Discussion / Responses Section */}
              <section className="pt-10 border-t border-edge space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] text-navy dark:text-white font-medium">
                    Discussion &amp; Runbook Notes ({comments.length})
                  </h3>
                  <span className="font-mono text-[12px] text-muted-ink">
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
                    className="w-full p-3.5 rounded-[8px] bg-canvas dark:bg-[#121620] border border-edge text-body-ink placeholder:text-muted-ink focus:outline-none focus:border-navy dark:focus:border-focus-blue transition-colors text-[13.5px]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn-primary cursor-pointer inline-flex items-center justify-center"
                    >
                      Post Comment
                    </button>
                  </div>
                </form>

                {/* Existing Comments List */}
                <div className="space-y-3 pt-2">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-[8px] bg-canvas dark:bg-[#121620] border border-edge space-y-2"
                    >
                      <div className="flex items-center justify-between font-mono text-[12px]">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-navy dark:text-white">{c.author}</span>
                          <span className="text-muted-ink">• {c.role}</span>
                        </div>
                        <span className="text-muted-ink text-[11px]">{c.date}</span>
                      </div>
                      <p className="text-secondary-ink dark:text-ash leading-relaxed text-[13.5px]">
                        {c.content}
                      </p>
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <div className="py-8 text-center rounded-[8px] bg-canvas border border-dashed border-edge">
                      <span className="material-symbols-outlined text-[24px] text-muted-ink">forum</span>
                      <p className="mt-1 text-muted-ink text-[13px]">
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
  </div>
);
};
