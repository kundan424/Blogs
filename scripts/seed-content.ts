import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { notes } from '../src/data/notes';
import { subjects } from '../src/data/subjects';

const CONTENT_DIR = path.resolve('content');

export function seedContent() {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  // Create subject folders and a subject.json descriptor if not exists
  for (const subject of subjects) {
    const subjectDir = path.join(CONTENT_DIR, subject.slug);
    if (!fs.existsSync(subjectDir)) {
      fs.mkdirSync(subjectDir, { recursive: true });
    }

    const descriptorPath = path.join(subjectDir, '_subject.json');
    if (!fs.existsSync(descriptorPath)) {
      fs.writeFileSync(
        descriptorPath,
        JSON.stringify(
          {
            name: subject.name,
            slug: subject.slug,
            hubNumber: subject.hubNumber,
            icon: subject.icon,
            description: subject.description,
          },
          null,
          2
        ),
        'utf8'
      );
    }
  }

  // Seed sample notes
  for (const note of notes) {
    const subjectDir = path.join(CONTENT_DIR, note.subjectSlug);
    if (!fs.existsSync(subjectDir)) {
      fs.mkdirSync(subjectDir, { recursive: true });
    }

    const filePath = path.join(subjectDir, `${note.slug}.md`);
    if (!fs.existsSync(filePath)) {
      const frontmatter = {
        title: note.title,
        slug: note.slug,
        subject: note.subjectSlug,
        abstract: note.abstract,
        tags: note.tags,
        published: true,
        publishDate: note.publishDate,
        readTime: note.readTime,
        author: note.author,
        blueprint: 'deep-dive',
      };

      const body = `## 01. Context & Architectural Overview

${note.abstract}

:::callout{type="info" title="System Invariant"}
Under surge conditions (e.g. 5,000 req/sec), connection allocation overhead grows superlinearly if worker thread pools are unbounded.
:::

## 02. Mechanical Breakdown & Heuristics

PostgreSQL adopts a dedicated backend process model per connected socket. Sizing connection pools excessively starves kernel page caches and introduces CPU context switching thrashes.

\`\`\`sql title="pg_stat_activity.sql"
SELECT pid, state, query_start, wait_event_type, wait_event
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY query_start ASC;
\`\`\`

## 03. Production Checklist & Takeaways

- [ ] Cap application connection max pool sizes to \`((cpu_cores * 2) + effective_spindle_count)\`.
- [ ] Configure HikariCP \`leakDetectionThreshold = 2000\` in production environments.
- [ ] Implement PgBouncer in transaction pooling mode for auto-scaled replica fleets.
`;

      const fileContent = matter.stringify(body, frontmatter);
      fs.writeFileSync(filePath, fileContent, 'utf8');
    }
  }

  console.log(`Content directory seeded successfully at: ${CONTENT_DIR}`);
}

seedContent();
