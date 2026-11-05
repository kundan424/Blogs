import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { scanContentDirectory } from './lib/contentScanner';
import { slugify } from './lib/slugify';
import { BLUEPRINTS } from './lib/blueprints';

const CONTENT_DIR = path.resolve('content');

function runTest() {
  console.log('\n--- TESTING STAGE 2 SCAFFOLDING ENGINE PROGRAMMATICALLY ---');

  const title = 'B-Tree Node Page Layout and Vacuum Heuristics';
  const slug = slugify(title);
  const subjectSlug = 'database-internals-storage';
  const abstract = 'Anatomy of 8KB page frames in PostgreSQL, free space maps, and vacuuming.';
  const tags = ['postgresql', 'indexing', 'storage-engines'];
  const blueprintId = 'deep-dive';

  const blueprint = BLUEPRINTS[blueprintId];
  if (!blueprint) throw new Error('Blueprint not found');

  const metadata = {
    title,
    slug,
    subject: subjectSlug,
    abstract,
    tags,
    published: false, // DRAFT
    publishDate: 'Nov 05, 2026',
    readTime: '9 min read',
    author: {
      name: 'Kundan',
      role: 'Software Engineer',
      handle: '@kundan',
    },
    blueprint: blueprintId,
  };

  const bodyContent = blueprint.template(title, abstract);
  const fileContent = matter.stringify(bodyContent, metadata);

  const targetPath = path.join(CONTENT_DIR, subjectSlug, `${slug}.md`);
  fs.writeFileSync(targetPath, fileContent, 'utf8');
  console.log(`✓ File written to: ${targetPath}`);

  // Verify file on disk
  if (!fs.existsSync(targetPath)) throw new Error('Generated file does not exist on disk');
  const readBack = matter(fs.readFileSync(targetPath, 'utf8'));
  if (readBack.data.published !== false) throw new Error('Article should be marked as draft (published: false)');
  if (readBack.data.title !== title) throw new Error('Title does not match');
  console.log('✓ Frontmatter verification passed: published: false (Draft mode)');

  // Verify Stage 1 scanner detects the new draft
  const discovery = scanContentDirectory(CONTENT_DIR);
  console.log(`✓ Scanner detected total articles: ${discovery.totalArticles}`);
  console.log(`✓ Scanner detected drafts: ${discovery.draftsCount}`);

  const found = discovery.articles.find((a) => a.slug === slug);
  if (!found) throw new Error('New article not discovered by scanner');
  if (found.published !== false) throw new Error('Scanner should report article as draft');

  console.log('✓ Stage 2 Scaffolding & Stage 1 Discovery verified successfully!\n');
}

runTest();
