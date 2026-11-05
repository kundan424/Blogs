import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const CONTENT_DIR = path.resolve('content');

const KUNDAN_AUTHOR = {
  name: 'Kundan',
  role: 'Software Engineer',
  handle: '@kundan',
  bio: 'Software Engineer focusing on backend architecture, distributed systems, and performance tuning.',
};

function updateAllContentAuthors() {
  const subjectFolders = fs.readdirSync(CONTENT_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
  let count = 0;

  for (const folder of subjectFolders) {
    const fPath = path.join(CONTENT_DIR, folder.name);
    for (const file of fs.readdirSync(fPath)) {
      if (file.endsWith('.md')) {
        const full = path.join(fPath, file);
        const raw = fs.readFileSync(full, 'utf8');
        const parsed = matter(raw);

        parsed.data.author = KUNDAN_AUTHOR;
        const updated = matter.stringify(parsed.content, parsed.data);
        fs.writeFileSync(full, updated, 'utf8');
        count++;
        console.log(`Updated author in: ${file}`);
      }
    }
  }

  console.log(`\nSuccessfully updated author to "Kundan" across all ${count} content files!`);
}

updateAllContentAuthors();
