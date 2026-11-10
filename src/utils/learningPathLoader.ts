import { LearningPath, LearningModule, Lesson } from '../types';
import { learningPaths as baseLearningPaths } from '../data/learningPaths';
import { getAllNotes } from './contentLoader';

export interface EnrichedLearningPath extends LearningPath {
  totalLessons: number;
  publishedLessons: number;
  progressPercentage: number;
}

/**
 * Calculates progress statistics for any given learning path.
 */
export function calculatePathProgress(path: LearningPath): {
  totalLessons: number;
  publishedLessons: number;
  progressPercentage: number;
} {
  let totalLessons = 0;
  let publishedLessons = 0;

  for (const mod of path.modules) {
    for (const lesson of mod.lessons) {
      totalLessons++;
      if (lesson.status === 'published') {
        publishedLessons++;
      }
    }
  }

  const progressPercentage =
    totalLessons > 0 ? Math.round((publishedLessons / totalLessons) * 100) : 0;

  return {
    totalLessons,
    publishedLessons,
    progressPercentage,
  };
}

/**
 * Enriches learning paths with dynamic article status from the content repository.
 * If a note is published in /content matching the lesson noteSlug, it ensures the lesson is marked 'published'.
 */
export function getAllLearningPaths(): EnrichedLearningPath[] {
  const allNotes = getAllNotes({ includeDrafts: true });
  const publishedSlugs = new Set(
    allNotes.filter((n) => (n as any).published === true).map((n) => n.slug)
  );

  return baseLearningPaths.map((path) => {
    const updatedModules: LearningModule[] = path.modules.map((mod) => {
      const updatedLessons: Lesson[] = mod.lessons.map((lesson) => {
        const isActuallyPublished =
          lesson.noteSlug && publishedSlugs.has(lesson.noteSlug);

        // Find the matched note if available for live metadata sync
        const matchedNote = lesson.noteSlug
          ? allNotes.find((n) => n.slug === lesson.noteSlug)
          : undefined;

        return {
          ...lesson,
          status: isActuallyPublished ? 'published' : lesson.status,
          readTime: matchedNote?.readTime || lesson.readTime || '10m read',
        };
      });

      return {
        ...mod,
        lessons: updatedLessons,
      };
    });

    const enrichedPath: LearningPath = {
      ...path,
      modules: updatedModules,
    };

    const stats = calculatePathProgress(enrichedPath);

    return {
      ...enrichedPath,
      ...stats,
    };
  });
}

/**
 * Retrieves all learning paths associated with a given subject slug.
 */
export function getLearningPathsBySubject(subjectSlug: string): EnrichedLearningPath[] {
  const paths = getAllLearningPaths();
  return paths.filter((p) => p.subjectSlug === subjectSlug);
}

/**
 * Retrieves a specific learning path by its slug.
 */
export function getLearningPathBySlug(slug: string): EnrichedLearningPath | undefined {
  const paths = getAllLearningPaths();
  return paths.find((p) => p.slug === slug);
}
