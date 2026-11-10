import { Note, NoteSection, Subject, Topic } from '../types';
import { parseFrontmatter } from './frontmatter';
import { subjects as baseSubjects } from '../data/subjects';
import { topics as baseTopics } from '../data/topics';

export interface NoteContent extends Note {
  markdownBody: string;
  published: boolean;
  isDraft: boolean;
  wordCount: number;
  filePath: string;
}

// Ingest all markdown files under /content/ using Vite's glob import
const rawFiles = import.meta.glob('/content/**/*.md', {
  query: '?raw',
  eager: true,
  import: 'default',
}) as Record<string, string>;

// Fallback subject name resolver
function resolveSubjectName(subjectSlug: string): string {
  const found = baseSubjects.find((s) => s.slug === subjectSlug);
  if (found) return found.name;
  return subjectSlug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Extract Table of Contents sections and subsections from markdown headings
export function extractTableOfContents(markdown: string): NoteSection[] {
  const lines = markdown.split(/\r?\n/);
  const sections: NoteSection[] = [];
  let currentSection: NoteSection | null = null;

  for (const line of lines) {
    // H2 Heading: e.g. "## 01. The Connection Overhead Conundrum"
    const h2Match = line.match(/^##\s+(?:(\d+)\.\s+)?(.*)$/);
    if (h2Match) {
      const number = h2Match[1] || `0${sections.length + 1}`;
      const title = h2Match[2].trim();
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      currentSection = {
        id,
        title: `${number}. ${title}`,
        number,
        subsections: [],
      };
      sections.push(currentSection);
      continue;
    }

    // H3 Heading: e.g. "### Sizing Formula & Heuristic"
    const h3Match = line.match(/^###\s+(.*)$/);
    if (h3Match && currentSection) {
      const subTitle = h3Match[1].trim();
      const subId = subTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      if (!currentSection.subsections) currentSection.subsections = [];
      currentSection.subsections.push({
        id: subId,
        title: subTitle,
      });
    }
  }

  return sections;
}

// Calculate dynamic word count and reading time
export function calculateReadingTime(markdown: string): { wordCount: number; readTime: string } {
  const cleanText = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/:::[\s\S]*?:::/g, '')
    .replace(/[#*`_~[\]()]/g, '')
    .trim();

  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  return {
    wordCount,
    readTime: `${String(minutes).padStart(2, '0')}m read`,
  };
}

// Parse all markdown files into unified NoteContent objects
function parseAllArticles(): NoteContent[] {
  const articles: NoteContent[] = [];

  for (const [filePath, rawContent] of Object.entries(rawFiles)) {
    if (!rawContent || typeof rawContent !== 'string') continue;

    const { data, content } = parseFrontmatter(rawContent);
    const filename = filePath.split('/').pop()?.replace(/\.md$/, '') || '';
    const slug = data.slug || filename;
    const subjectSlug = data.subject || filePath.split('/')[2] || 'general';
    const isPublished = data.published === true;
    const { wordCount, readTime } = calculateReadingTime(content);
    const sections = extractTableOfContents(content);

    // Robust author extraction
    const authorRaw = data.author;
    let author = {
      name: 'Kundan',
      role: 'Software Engineer',
      handle: '@kundan',
      bio: 'Software Engineer focusing on backend architecture, distributed systems, and performance tuning.',
    };

    if (authorRaw && typeof authorRaw === 'object' && !Array.isArray(authorRaw)) {
      author = {
        name: String(authorRaw.name || author.name),
        role: String(authorRaw.role || author.role),
        handle: String(authorRaw.handle || author.handle),
        bio: String(authorRaw.bio || author.bio),
      };
    } else if (typeof authorRaw === 'string' && authorRaw.trim()) {
      author = {
        name: authorRaw.trim(),
        role: 'Software Engineer',
        handle: `@${authorRaw.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        bio: 'Software Engineer focusing on backend architecture, distributed systems, and performance tuning.',
      };
    }

    const article: NoteContent = {
      id: slug,
      slug,
      title: data.title || filename,
      abstract: data.abstract || 'Technical analysis, internal mechanics, and production heuristics.',
      subjectName: resolveSubjectName(subjectSlug),
      subjectSlug,
      publishDate: data.publishDate || 'Draft',
      updatedDate: data.updatedDate,
      readTime: data.readTime || readTime,
      tags: Array.isArray(data.tags) ? data.tags : [],
      published: isPublished,
      isDraft: !isPublished,
      wordCount,
      sections,
      markdownBody: content,
      author,
      featured: data.featured === true,
      claps: typeof data.claps === 'number' ? data.claps : 0,
      filePath,
      learningPath: data.learningPath || undefined,
    };

    articles.push(article);
  }

  return articles.sort((a, b) => {
    if (a.isDraft && !b.isDraft) return -1;
    if (!a.isDraft && b.isDraft) return 1;
    return b.slug.localeCompare(a.slug);
  });
}

// Cached parsed articles
let cachedArticles: NoteContent[] | null = null;

export function getAllNotes(options?: { includeDrafts?: boolean }): NoteContent[] {
  if (!cachedArticles) {
    cachedArticles = parseAllArticles();
  }

  const isDev = import.meta.env.DEV;
  const allowDrafts = options?.includeDrafts !== undefined ? options.includeDrafts : isDev;

  if (allowDrafts) {
    return cachedArticles;
  }

  // Production: filter out drafts
  return cachedArticles.filter((a) => a.published === true);
}

export function getNoteBySlug(slug: string): NoteContent | undefined {
  const notes = getAllNotes({ includeDrafts: true });
  return notes.find((n) => n.slug === slug);
}

export function getNotesBySubject(subjectSlug: string): NoteContent[] {
  const notes = getAllNotes();
  return notes.filter((n) => n.subjectSlug === subjectSlug);
}

export function getNotesByTag(tag: string): NoteContent[] {
  const notes = getAllNotes();
  const normalized = tag.toLowerCase().trim().replace(/^#/, '');
  return notes.filter((n) => n.tags.some((t) => t.toLowerCase() === normalized));
}

// Convert various date formats (e.g. 'Oct 24, 2026', '2026-10-24') into numeric timestamp
function parseDateToTimestamp(dateStr?: string): number {
  if (!dateStr) return 0;
  const parsed = new Date(dateStr).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

// Calculate days elapsed since timestamp
function calculateDaysAgo(timestamp: number): number {
  if (!timestamp) return 0;
  const now = Date.now();
  const diff = now - timestamp;
  if (diff <= 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Dynamically computes real subject metadata (notesCount, topicsCount,
 * real subtopics, real lastRevision, real featuredNotes) derived from
 * the actual articles in the repository.
 */
export function getEnrichedSubjects(options?: { includeDrafts?: boolean }): Subject[] {
  const allNotes = getAllNotes(options);

  return baseSubjects.map((base) => {
    // Real notes belonging to this subject
    const subjectNotes = allNotes.filter((n) => n.subjectSlug === base.slug);

    // Collect all tags and count frequencies
    const tagCountMap: Record<string, number> = {};
    for (const note of subjectNotes) {
      if (Array.isArray(note.tags)) {
        for (const tag of note.tags) {
          const lower = tag.toLowerCase().trim();
          if (lower) {
            tagCountMap[lower] = (tagCountMap[lower] || 0) + 1;
          }
        }
      }
    }

    const uniqueTags = Object.keys(tagCountMap);
    // Sort tags by frequency descending
    const sortedTags = [...uniqueTags].sort((a, b) => tagCountMap[b] - tagCountMap[a]);

    // Determine latest note date
    let latestTimestamp = 0;
    let latestDateString = base.lastRevision;

    for (const note of subjectNotes) {
      const dateStr = note.updatedDate || note.publishDate;
      const ts = parseDateToTimestamp(dateStr);
      if (ts > latestTimestamp) {
        latestTimestamp = ts;
        latestDateString = dateStr;
      }
    }

    const updatedDaysAgo = latestTimestamp > 0 ? calculateDaysAgo(latestTimestamp) : base.updatedDaysAgo;

    // Real featured notes from this subject (up to 3)
    const featuredNotes = subjectNotes.slice(0, 3).map((n) => ({
      title: n.title,
      slug: n.slug,
      readTime: n.readTime,
    }));

    return {
      ...base,
      notesCount: subjectNotes.length,
      topicsCount: uniqueTags.length,
      featuredTopics: sortedTags.length > 0 ? sortedTags : base.featuredTopics,
      lastRevision: subjectNotes.length > 0 ? latestDateString : base.lastRevision,
      updatedDaysAgo: subjectNotes.length > 0 ? updatedDaysAgo : base.updatedDaysAgo,
      featuredNotes: featuredNotes.length > 0 ? featuredNotes : base.featuredNotes,
    };
  });
}

export function getSubjectBySlug(slug: string, options?: { includeDrafts?: boolean }): Subject | undefined {
  const subjects = getEnrichedSubjects(options);
  return subjects.find((s) => s.slug === slug);
}

/**
 * Dynamically computes real topics/tags metadata (count, domainReach,
 * real subjects) derived from the actual articles in the repository.
 */
export function getEnrichedTopics(options?: { includeDrafts?: boolean }): Topic[] {
  const allNotes = getAllNotes(options);

  const tagDataMap: Record<
    string,
    { count: number; subjects: Set<string>; latestTs: number; latestDateStr: string }
  > = {};

  for (const note of allNotes) {
    const dateStr = note.updatedDate || note.publishDate;
    const ts = parseDateToTimestamp(dateStr);

    if (Array.isArray(note.tags)) {
      for (const rawTag of note.tags) {
        const tag = rawTag.toLowerCase().trim();
        if (!tag) continue;

        if (!tagDataMap[tag]) {
          tagDataMap[tag] = {
            count: 0,
            subjects: new Set<string>(),
            latestTs: 0,
            latestDateStr: '',
          };
        }

        tagDataMap[tag].count += 1;
        if (note.subjectSlug) {
          tagDataMap[tag].subjects.add(note.subjectSlug);
        }
        if (ts > tagDataMap[tag].latestTs) {
          tagDataMap[tag].latestTs = ts;
          tagDataMap[tag].latestDateStr = dateStr;
        }
      }
    }
  }

  // Merge with baseTopics descriptions if available
  const result: Topic[] = Object.entries(tagDataMap).map(([tag, data]) => {
    const foundBase = baseTopics.find((t) => t.slug === tag || t.name.toLowerCase() === tag);
    const domainReach = data.subjects.size;
    const subjectList = Array.from(data.subjects);

    return {
      id: tag,
      slug: tag,
      name: tag,
      count: data.count,
      description:
        foundBase?.description ||
        `All learning notes, architectural breakdowns, and implementations tagged with #${tag} across ${domainReach} core ${domainReach === 1 ? 'subject' : 'subjects'}.`,
      domainReach,
      lastRevision: data.latestDateStr || foundBase?.lastRevision || 'Recently',
      subjects: subjectList.length > 0 ? subjectList : foundBase?.subjects || [],
    };
  });

  return result.sort((a, b) => b.count - a.count);
}

export function getTopicBySlug(slug: string, options?: { includeDrafts?: boolean }): Topic | undefined {
  const topics = getEnrichedTopics(options);
  const normalized = slug.toLowerCase().trim();
  return topics.find((t) => t.slug === normalized || t.name === normalized);
}
