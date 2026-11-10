export type LessonStatus = 'published' | 'upcoming' | 'draft';

export interface Lesson {
  id: string;
  number: string; // e.g. "1.1", "1.2"
  title: string;
  description?: string;
  status: LessonStatus;
  noteSlug?: string; // links to /notes/:slug when published
  readTime?: string;
  topics?: string[];
}

export interface LearningModule {
  id: string;
  number: string; // e.g. "01", "02"
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface LearningPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  subjectSlug: string;
  icon?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Production Scale';
  estimatedDuration?: string; // e.g. "3 Modules • 7 Lessons"
  modules: LearningModule[];
}

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
  learningPaths?: LearningPath[];
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
  learningPath?: {
    slug: string;
    name: string;
    module: string;
    moduleName?: string;
    lesson: string;
  };
}
