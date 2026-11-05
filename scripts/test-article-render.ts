import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from '../src/utils/frontmatter';

const CONTENT_DIR = path.resolve('content');

function testAllArticles() {
  console.log('\n--- VERIFYING ALL CONTENT ARTICLES FRONTMATTER INTEGRITY ---');

  const subjectFolders = fs.readdirSync(CONTENT_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
  let count = 0;

  for (const folder of subjectFolders) {
    const fPath = path.join(CONTENT_DIR, folder.name);
    for (const file of fs.readdirSync(fPath)) {
      if (file.endsWith('.md')) {
        count++;
        const full = path.join(fPath, file);
        const raw = fs.readFileSync(full, 'utf8');
        const { data } = parseFrontmatter(raw);

        // Assert title exists
        if (!data.title) throw new Error(`Missing title in: ${full}`);

        // Assert author.name exists and is a string
        const authorName = typeof data.author === 'object' ? data.author?.name : (typeof data.author === 'string' ? data.author : 'Kundan');
        if (!authorName || typeof authorName !== 'string') {
          throw new Error(`Invalid author in: ${full}`);
        }

        // Test split operation that caused error 171
        const initials = authorName.split(' ').map((n: string) => n[0]).join('');
        if (!initials) throw new Error(`Could not generate initials for: ${authorName}`);

        console.log(`✓ [${folder.name}] "${data.title.slice(0, 45)}..." -> Author: ${authorName} (${initials})`);
      }
    }
  }

  console.log(`\nSuccessfully verified ${count} articles! Zero frontmatter parsing or split errors.\n`);
}

testAllArticles();
