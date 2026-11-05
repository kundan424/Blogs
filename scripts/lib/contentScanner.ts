import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { titleCaseFromSlug } from './slugify';

export interface SubjectDiscovery {
  slug: string;
  name: string;
  count: number;
  hubNumber?: string;
  icon?: string;
}

export interface TagDiscovery {
  tag: string;
  count: number;
}

export interface SeriesDiscovery {
  name: string;
  highestPart: number;
  totalParts?: number;
  articlesCount: number;
}

export interface ArticleSummary {
  title: string;
  slug: string;
  subjectSlug: string;
  tags: string[];
  published: boolean;
  publishDate?: string;
  series?: {
    name: string;
    part: number;
  };
  filePath: string;
}

export interface DiscoveryResult {
  subjects: SubjectDiscovery[];
  tags: TagDiscovery[];
  series: SeriesDiscovery[];
  totalArticles: number;
  draftsCount: number;
  publishedCount: number;
  articles: ArticleSummary[];
  findSimilarTag: (candidate: string) => string | null;
  findSimilarSubject: (candidate: string) => string | null;
}

/**
 * Stage 1: Dynamic Discovery
 * Scans the /content directory before presenting any interactive terminal prompts.
 * Reads existing subject folders, parses article frontmatter, and collects canonical tags & series.
 */
export function scanContentDirectory(contentDir: string = path.resolve('content')): DiscoveryResult {
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  const entries = fs.readdirSync(contentDir, { withFileTypes: true });
  const subjectFolders = entries.filter((e) => e.isDirectory() && !e.name.startsWith('.'));

  const subjectsMap = new Map<string, SubjectDiscovery>();
  const tagsMap = new Map<string, number>();
  const seriesMap = new Map<string, { highestPart: number; count: number }>();
  const articles: ArticleSummary[] = [];

  let draftsCount = 0;
  let publishedCount = 0;

  // 1. Scan Subject Subfolders
  for (const folder of subjectFolders) {
    const slug = folder.name;
    const folderPath = path.join(contentDir, slug);
    let name = titleCaseFromSlug(slug);
    let hubNumber: string | undefined;
    let icon: string | undefined;

    // Check for _subject.json descriptor
    const descriptorPath = path.join(folderPath, '_subject.json');
    if (fs.existsSync(descriptorPath)) {
      try {
        const desc = JSON.parse(fs.readFileSync(descriptorPath, 'utf8'));
        if (desc.name) name = desc.name;
        if (desc.hubNumber) hubNumber = desc.hubNumber;
        if (desc.icon) icon = desc.icon;
      } catch {
        // Fallback to titleCaseFromSlug
      }
    }

    subjectsMap.set(slug, {
      slug,
      name,
      count: 0,
      hubNumber,
      icon,
    });

    // 2. Parse Markdown Files in Subject Folder
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const filePath = path.join(folderPath, file);
        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          const { data } = matter(raw);

          const title = data.title || file.replace(/\.mdx?$/, '');
          const articleSlug = data.slug || file.replace(/\.mdx?$/, '');
          const isPublished = data.published === true;
          const articleTags: string[] = Array.isArray(data.tags) ? data.tags : [];

          if (isPublished) {
            publishedCount++;
          } else {
            draftsCount++;
          }

          // Update subject count
          const subj = subjectsMap.get(slug);
          if (subj) {
            subj.count++;
          }

          // Collect Topic Tags
          for (const rawTag of articleTags) {
            const normalized = rawTag.toLowerCase().trim().replace(/^#/, '');
            tagsMap.set(normalized, (tagsMap.get(normalized) || 0) + 1);
          }

          // Collect Series
          if (data.series && data.series.name) {
            const seriesName = data.series.name.trim();
            const partNum = typeof data.series.part === 'number' ? data.series.part : 1;
            const current = seriesMap.get(seriesName) || { highestPart: 0, count: 0 };
            seriesMap.set(seriesName, {
              highestPart: Math.max(current.highestPart, partNum),
              count: current.count + 1,
            });
          }

          articles.push({
            title,
            slug: articleSlug,
            subjectSlug: slug,
            tags: articleTags,
            published: isPublished,
            publishDate: data.publishDate,
            series: data.series,
            filePath,
          });
        } catch {
          // Skip corrupt file
        }
      }
    }
  }

  // Convert maps to sorted arrays
  const subjects = Array.from(subjectsMap.values()).sort((a, b) => b.count - a.count);
  const tags = Array.from(tagsMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  const series = Array.from(seriesMap.entries()).map(([name, data]) => ({
    name,
    highestPart: data.highestPart,
    articlesCount: data.count,
  }));

  // Levenshtein / substring similarity helper to prevent duplicate tags
  const findSimilarTag = (candidate: string): string | null => {
    const clean = candidate.toLowerCase().trim().replace(/^#/, '');
    for (const { tag } of tags) {
      if (tag === clean) return tag;
      // Substring check (e.g. postgres vs postgresql)
      if (clean.length >= 4 && (tag.startsWith(clean) || clean.startsWith(tag))) {
        return tag;
      }
    }
    return null;
  };

  const findSimilarSubject = (candidate: string): string | null => {
    const clean = candidate.toLowerCase().trim();
    for (const subj of subjects) {
      if (subj.slug === clean || subj.name.toLowerCase() === clean) {
        return subj.name;
      }
    }
    return null;
  };

  return {
    subjects,
    tags,
    series,
    totalArticles: articles.length,
    draftsCount,
    publishedCount,
    articles,
    findSimilarTag,
    findSimilarSubject,
  };
}
