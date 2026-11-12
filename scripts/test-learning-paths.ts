import fs from 'node:fs';
import path from 'node:path';
import { learningPaths } from '../src/data/learningPaths';

export function verifyLearningPaths(paths = learningPaths, benchmarkPath?: string) {
  console.log('\n--- VERIFYING LEARNING PATHS INTEGRITY ---');

  if (!Array.isArray(paths) || paths.length !== 4) {
    throw new Error(`Expected exactly 4 learning paths, found: ${paths?.length}`);
  }

  const expectedSlugs = [
    'spring-boot-production-mastery',
    'production-microservices-distributed-architecture',
    'java-core-oop-deep-dives',
    'docker-container-runtime-mastery',
  ];

  const actualSlugs = paths.map((p) => p.slug);
  for (const slug of expectedSlugs) {
    if (!actualSlugs.includes(slug)) {
      throw new Error(`Missing expected learning path slug: ${slug}`);
    }
  }

  const totalModules = paths.reduce((acc, p) => acc + p.modules.length, 0);
  if (totalModules !== 40) {
    throw new Error(`Expected 40 total modules, found: ${totalModules}`);
  }

  const totalLessons = paths.reduce(
    (acc, p) => acc + p.modules.reduce((mAcc, m) => mAcc + m.lessons.length, 0),
    0
  );
  if (totalLessons !== 88) {
    throw new Error(`Expected 88 total lessons, found: ${totalLessons}`);
  }

  console.log(`✓ Total Paths: ${paths.length}`);
  console.log(`✓ Total Modules: ${totalModules}`);
  console.log(`✓ Total Lessons: ${totalLessons}`);

  if (benchmarkPath && fs.existsSync(benchmarkPath)) {
    const benchmarkRaw = fs.readFileSync(benchmarkPath, 'utf8');
    const currentRaw = JSON.stringify(paths, null, 2);
    if (benchmarkRaw !== currentRaw) {
      throw new Error('Deep JSON equality check failed against benchmark snapshot!');
    }
    console.log('✓ Deep JSON equality matched baseline snapshot perfectly!');
  }

  console.log('✓ All Learning Path integrity checks passed!\n');
}

// Create or verify benchmark snapshot
const snapshotFile = path.resolve('scripts/lib/learningPaths-snapshot.json');
if (!fs.existsSync(snapshotFile)) {
  fs.mkdirSync(path.dirname(snapshotFile), { recursive: true });
  fs.writeFileSync(snapshotFile, JSON.stringify(learningPaths, null, 2), 'utf8');
  console.log(`Created baseline snapshot at: ${snapshotFile}`);
}

verifyLearningPaths(learningPaths, snapshotFile);
