import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { notes } from '../data/notes';
import { getNoteBySlug, getAllNotes } from '../utils/contentLoader';
import { getAllLearningPaths } from '../utils/learningPathLoader';
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { EmbeddedArticleSidebar } from '../components/sidebar/ArticleSidebar';
import { EndpointCapsule } from '../components/common/EndpointCapsule';
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

  // ScrollSpy
  useEffect(() => {
    if (!sections || sections.length === 0) return;

    setActiveSection(sections[0].id);

    const handleScroll = () => {
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
      role: 'Systems Engineer',
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
    <div className="w-full bg-bright-white dark:bg-[#161616] text-[#161616] dark:text-[#fafafa] min-h-screen flex flex-col transition-colors selection:bg-[#eeeff2] selection:text-[#1a2251]">
      {/* MOBILE ON-THIS-PAGE ACCORDION BAR (< 1024px) */}
      {sections.length > 0 && (
        <div className="block lg:hidden border-b border-[#d9d9d9] dark:border-[#333333] bg-bright-white dark:bg-[#212121] px-4 py-3 sticky top-14 z-30">
          <button
            type="button"
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="flex items-center justify-between w-full font-mono text-[12px] uppercase tracking-[0.02em] text-[#161616] dark:text-[#fafafa] font-medium cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#161616] dark:text-[#fafafa]">menu_book</span>
              <span>ON THIS PAGE ({sections.length} SECTIONS)</span>
            </span>
            <span className="material-symbols-outlined text-[18px]">
              {mobileTocOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {mobileTocOpen && (
            <div className="mt-3 pt-3 border-t border-[#d9d9d9] dark:border-[#333333] max-h-72 overflow-y-auto space-y-1 font-mono text-[12px] uppercase tracking-[0.02em]">
              {sections.map((sec, idx) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    scrollToSection(sec.id);
                    setMobileTocOpen(false);
                  }}
                  className={`flex items-center gap-2.5 w-full text-left py-2 px-3 rounded-full transition-colors cursor-pointer ${
                    activeSection === sec.id
                      ? 'bg-[#161616] text-white dark:bg-[#ffffff] dark:text-[#161616] font-medium'
                      : 'text-[#616161] hover:text-[#161616] dark:text-[#a3a3a3] dark:hover:text-[#fafafa]'
                  }`}
                >
                  <span className="font-mono text-[11px] text-[#161616] dark:text-[#fafafa]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="truncate">
                    {sec.title.replace(/^\d+\.\s*/, '')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2-COLUMN DOCUMENTATION LAYOUT */}
      <div className="w-full flex flex-1 items-start">
        {/* LEFT COLUMN: DEDICATED NAVIGATION SIDEBAR PANE */}
        {!sidebarHidden && sections.length > 0 && (
          <aside className="hidden lg:block w-[280px] xl:w-[300px] shrink-0 sticky top-14 h-[calc(100vh-56px)] border-r border-[#d9d9d9] dark:border-[#333333] bg-bright-white/90 dark:bg-[#161616]/90 backdrop-blur-md overflow-hidden self-start">
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

        {/* RIGHT COLUMN: ARTICLE SECTION */}
        <div className="flex-1 min-w-0 w-full px-4 sm:px-6 lg:px-8 py-5 space-y-4">
          {/* TOP NAV BAR */}
          <div className="flex items-center gap-3 flex-wrap">
            {sections.length > 0 && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bright-white dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] text-[#616161] hover:text-[#161616] dark:hover:text-[#fafafa] hover:border-[#161616] transition-all cursor-pointer font-mono text-[11.5px] uppercase tracking-[0.02em]"
                title={sidebarHidden ? 'Show menu' : 'Hide menu'}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {sidebarHidden ? 'dock_to_right' : 'dock_to_left'}
                </span>
                <span>{sidebarHidden ? 'Show menu' : 'Hide menu'}</span>
              </button>
            )}

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
              className="text-[#8f8f8f]"
            />
          </div>

          {/* ARTICLE CONTENT CARD (24px corners) */}
          <main className="w-full bg-bright-white dark:bg-[#212121] p-6 sm:p-10 lg:p-12 rounded-[24px] border border-[#d9d9d9] dark:border-[#333333] transition-colors">
            <div className="w-full space-y-10">
              
              {/* ZONE 1: ARTICLE HEADER BLOCK */}
              <header className="border-b border-[#d9d9d9] dark:border-[#333333] pb-8">
                {/* Learning Path Curriculum Ribbon */}
                {linkedCurriculum && (
                  <div className="mb-6 p-4 rounded-[16px] bg-[#f0f0f0] dark:bg-[#1a1a1a] border border-[#d9d9d9] dark:border-[#333333] flex flex-wrap items-center justify-between gap-3 text-[12.5px] font-mono uppercase tracking-[0.02em]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="material-symbols-outlined text-[18px] text-[#161616] dark:text-[#fafafa]">
                        schema
                      </span>
                      <span className="text-[#8f8f8f]">
                        Learning Path:
                      </span>
                      <Link
                        to={`/learning-paths/${linkedCurriculum.path.slug}`}
                        className="font-medium text-[#161616] dark:text-[#fafafa] hover:underline hover:text-[#161616] dark:hover:text-[#ffffff]"
                      >
                        {linkedCurriculum.path.title}
                      </Link>
                      <span className="text-[#8f8f8f]">•</span>
                      <span className="text-[#616161] dark:text-[#a3a3a3]">
                        Module {linkedCurriculum.module.number} (Lesson {linkedCurriculum.lesson.number})
                      </span>
                    </div>
                    <Link
                      to={`/learning-paths/${linkedCurriculum.path.slug}`}
                      className="inline-flex items-center gap-1 text-[#161616] dark:text-[#fafafa] hover:underline font-medium text-[12px]"
                    >
                      <span>Full Curriculum</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                )}

                {/* Local Draft Mode Alert Banner */}
                {isDraft && (
                  <div className="mb-6 rounded-[16px] border border-[#161616] dark:border-[#ffffff] bg-[#f0f0f0] dark:bg-[#1a1a1a] px-4 py-3 text-[#161616] dark:text-[#fafafa] flex flex-wrap items-center justify-between gap-2 font-mono text-[12px] uppercase tracking-[0.02em]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#161616] dark:bg-[#ffffff] animate-pulse" />
                      <span className="font-semibold">Local Draft Mode</span>
                      <span className="text-[#8f8f8f] text-[11px]">({(note as any).filePath || 'Draft File'})</span>
                    </div>
                    <span className="text-[11px] text-[#8f8f8f]">published: false</span>
                  </div>
                )}

                {/* Metadata Badges & Interaction Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[12px] uppercase tracking-[0.02em]">
                    <Link
                      to={`/subjects/${note.subjectSlug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f0f0] dark:bg-[#303030] text-[#161616] dark:text-[#fafafa] hover:border-[#161616] dark:hover:border-[#ffffff] transition-colors border border-[#d9d9d9] dark:border-[#474747]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#161616] dark:bg-[#ffffff]" />
                      {note.subjectName}
                    </Link>
                    <span className="text-[#8f8f8f] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {note.publishDate}
                    </span>
                    {note.updatedDate && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0f0f0] dark:bg-[#303030] font-mono text-[11px] text-[#616161] dark:text-[#a3a3a3] border border-[#d9d9d9] dark:border-[#474747]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#161616] dark:bg-[#ffffff]" />
                        Updated {note.updatedDate}
                      </span>
                    )}
                    <span className="text-[#8f8f8f] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                      {note.readTime}
                    </span>
                  </div>
                </div>

                {/* Main Display Headline: Inter 500, tight tracking */}
                <h1 className="heading-lg text-[#161616] dark:text-[#fafafa] mb-4">
                  {note.title}
                </h1>

                {/* Executive Abstract */}
                <p className="font-sans text-[16px] sm:text-[18px] text-[#616161] dark:text-[#a3a3a3] leading-relaxed max-w-3xl mb-6 font-normal">
                  {note.abstract}
                </p>

                {/* Topic Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  {note.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/topics/${tag}`}
                      className="px-3 py-1 rounded-full bg-[#f0f0f0] dark:bg-[#303030] font-mono text-[11.5px] uppercase tracking-[0.02em] text-[#616161] dark:text-[#a3a3a3] hover:text-[#161616] dark:hover:text-[#fafafa] hover:border-[#161616] transition-colors border border-[#d9d9d9] dark:border-[#474747]"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </header>

              {/* ZONE 2: ARTICLE BODY CONTENT */}
              <article className="space-y-8 leading-relaxed font-sans text-[#161616] dark:text-[#fafafa]">
                {(note as any).markdownBody ? (
                  <MarkdownRenderer content={(note as any).markdownBody} />
                ) : (
                  <div className="py-16 text-center text-[#8f8f8f] border border-dashed border-[#d9d9d9] dark:border-[#333333] rounded-[24px]">
                    <span className="material-symbols-outlined text-[32px] mb-2 text-[#161616] dark:text-[#fafafa]">article</span>
                    <p className="font-sans text-[#161616] dark:text-[#fafafa]">No markdown content available for this note.</p>
                    <p className="font-mono text-[12px] text-[#8f8f8f] mt-1">Slug: {note.slug}</p>
                  </div>
                )}

                {/* Prev / Next navigation */}
                <div className="pt-8 border-t border-[#d9d9d9] dark:border-[#333333] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {prevNote && (
                    <Link
                      to={`/notes/${prevNote.slug}`}
                      className="group flex flex-col justify-between p-5 rounded-[20px] bg-[#f0f0f0] dark:bg-[#1a1a1a] border border-[#d9d9d9] dark:border-[#333333] hover:border-[#161616] dark:hover:border-[#ffffff] transition-all text-left"
                    >
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#8f8f8f] uppercase tracking-[0.02em] mb-2 group-hover:text-[#161616] dark:group-hover:text-[#ffffff] transition-colors">
                        <span className="material-symbols-outlined text-[14px] transition-transform group-hover:-translate-x-1">
                          arrow_back
                        </span>
                        <span>PREVIOUS NOTE</span>
                      </div>
                      <span className="text-[15px] text-[#161616] dark:text-[#fafafa] group-hover:text-[#161616] dark:group-hover:text-[#ffffff] group-hover:underline font-medium line-clamp-1 transition-colors">
                        {prevNote.title}
                      </span>
                      <span className="font-mono text-[11px] text-[#8f8f8f] mt-1.5">
                        {prevNote.subjectName} • {prevNote.readTime}
                      </span>
                    </Link>
                  )}

                  {nextNote && (
                    <Link
                      to={`/notes/${nextNote.slug}`}
                      className="group flex flex-col justify-between p-5 rounded-[20px] bg-[#f0f0f0] dark:bg-[#1a1a1a] border border-[#d9d9d9] dark:border-[#333333] hover:border-[#161616] dark:hover:border-[#ffffff] transition-all sm:text-right"
                    >
                      <div className="flex items-center sm:justify-end gap-1.5 font-mono text-[11px] text-[#8f8f8f] uppercase tracking-[0.02em] mb-2 group-hover:text-[#161616] dark:group-hover:text-[#ffffff] transition-colors">
                        <span>NEXT NOTE</span>
                        <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-1">
                          arrow_forward
                        </span>
                      </div>
                      <span className="text-[15px] text-[#161616] dark:text-[#fafafa] group-hover:text-[#161616] dark:group-hover:text-[#ffffff] group-hover:underline font-medium line-clamp-1 transition-colors">
                        {nextNote.title}
                      </span>
                      <span className="font-mono text-[11px] text-[#8f8f8f] mt-1.5">
                        {nextNote.subjectName} • {nextNote.readTime}
                      </span>
                    </Link>
                  )}
                </div>

                {/* Discussion / Responses Section */}
                <section className="pt-10 border-t border-[#d9d9d9] dark:border-[#333333] space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="heading-sm text-[#161616] dark:text-[#fafafa]">
                      Discussion &amp; Runbook Notes ({comments.length})
                    </h3>
                    <EndpointCapsule className="text-[11px] py-0.5 px-3">
                      Peer Review
                    </EndpointCapsule>
                  </div>

                  {/* Comment Input */}
                  <form onSubmit={handleAddComment} className="space-y-3">
                    <textarea
                      rows={3}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share production war stories, benchmark findings, or ask technical questions..."
                      className="w-full p-4 rounded-[16px] bg-[#f0f0f0] dark:bg-[#1a1a1a] border border-[#d9d9d9] dark:border-[#333333] text-[#161616] dark:text-[#fafafa] placeholder:text-[#8f8f8f] focus:outline-none focus:border-[#161616] dark:focus:border-[#ffffff] transition-colors text-[14px] font-sans"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="btn-primary"
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
                        className="p-5 rounded-[16px] bg-[#f0f0f0] dark:bg-[#1a1a1a] border border-[#d9d9d9] dark:border-[#333333] space-y-2"
                      >
                        <div className="flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.02em]">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#161616] dark:text-[#fafafa]">{c.author}</span>
                            <span className="text-[#8f8f8f]">• {c.role}</span>
                          </div>
                          <span className="text-[#8f8f8f] text-[11px]">{c.date}</span>
                        </div>
                        <p className="text-[#616161] dark:text-[#a3a3a3] leading-relaxed text-[14px] font-sans">
                          {c.content}
                        </p>
                      </div>
                    ))}

                    {comments.length === 0 && (
                      <div className="py-10 text-center rounded-[16px] bg-[#f0f0f0] dark:bg-[#1a1a1a] border border-dashed border-[#d9d9d9] dark:border-[#333333]">
                        <span className="material-symbols-outlined text-[28px] text-[#161616] dark:text-[#fafafa]">forum</span>
                        <p className="mt-2 text-[#8f8f8f] text-[13.5px]">
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
