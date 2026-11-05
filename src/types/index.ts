export interface Subject {
  id: string;
  slug: string;
  name: string;
  hubNumber: string; // e.g. "Domain Hub #01"
  icon: string;
  description: string;
  notesCount: number;
  topicsCount: number;
  lastRevision: string;
  updatedDaysAgo: number;
  featuredTopics: string[];
  featuredNotes: {
    title: string;
    slug: string;
    readTime: string;
  }[];
}

export interface Topic {
  id: string;
  slug: string;
  name: string;
  count: number;
  description: string;
  domainReach: number;
  lastRevision: string;
  subjects: string[];
}

export interface NoteAuthor {
  name: string;
  role: string;
  handle: string;
  avatarUrl?: string;
  bio?: string;
}

export interface NoteSection {
  id: string;
  title: string;
  number?: string;
  subsections?: {
    id: string;
    title: string;
  }[];
}

export interface Note {
  id: string;
  slug: string;
  title: string;
  abstract: string;
  subjectName: string;
  subjectSlug: string;
  publishDate: string;
  updatedDate?: string;
  readTime: string;
  tags: string[];
  author: NoteAuthor;
  featured?: boolean;
  claps?: number;
  sections?: NoteSection[];
}

export interface SeriesStep {
  number: number;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  meta: string;
  slug?: string;
}

export interface Series {
  id: string;
  slug: string;
  title: string;
  description: string;
  currentPart: number;
  totalParts: number;
  progressPercent: number;
  steps: SeriesStep[];
}
