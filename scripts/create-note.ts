import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { select, input, checkbox, confirm } from '@inquirer/prompts';
import matter from 'gray-matter';
import { scanContentDirectory } from './lib/contentScanner';
import { slugify } from './lib/slugify';
import { BLUEPRINTS } from './lib/blueprints';
import { learningPaths } from '../src/data/learningPaths';

const CONTENT_DIR = path.resolve('content');

interface NoteMetadata {
  title: string;
  slug: string;
  subject: string;
  abstract: string;
  tags: string[];
  published: boolean;
  publishDate: string;
  readTime: string;
  author: {
    name: string;
    role: string;
    handle: string;
  };
  blueprint: string;
  series?: {
    name: string;
    part: number;
  };
  learningPath?: {
    slug: string;
    name: string;
    module: string;
    moduleName?: string;
    lesson: string;
  };
}

async function runWizard() {
  console.clear();
  console.log('===========================================================');
  console.log('   STAGE 2: INTERACTIVE ARTICLE SCAFFOLDING WIZARD        ');
  console.log('===========================================================');

  // STAGE 1 BACKGROUND DISCOVERY
  process.stdout.write('\n Scanning /content repository for existing taxonomy...');
  const discovery = scanContentDirectory(CONTENT_DIR);
  console.log(` Done! Found ${discovery.subjects.length} subjects & ${discovery.tags.length} topic tags.\n`);

  // 1. SUBJECT ASSIGNMENT
  const subjectChoices = discovery.subjects.map((s) => ({
    name: `${s.name.padEnd(38)} (${s.count} notes)`,
    value: s.slug,
  }));
  subjectChoices.push({
    name: '+ [Create New Subject Folder]',
    value: '__CREATE_NEW_SUBJECT__',
  });

  let selectedSubjectSlug = await select({
    message: 'Step 1/6: Assign to Subject Category:',
    choices: subjectChoices,
  });

  let subjectName = '';
  if (selectedSubjectSlug === '__CREATE_NEW_SUBJECT__') {
    const newSubjectName = await input({
      message: 'Enter new Subject Name (e.g. Distributed Consensus):',
      validate: (val) => val.trim().length > 0 || 'Subject name cannot be empty',
    });
    selectedSubjectSlug = slugify(newSubjectName);
    subjectName = newSubjectName.trim();

    // Create the subject folder & _subject.json
    const newSubjectDir = path.join(CONTENT_DIR, selectedSubjectSlug);
    if (!fs.existsSync(newSubjectDir)) {
      fs.mkdirSync(newSubjectDir, { recursive: true });
      fs.writeFileSync(
        path.join(newSubjectDir, '_subject.json'),
        JSON.stringify(
          {
            name: subjectName,
            slug: selectedSubjectSlug,
            hubNumber: `Domain Hub #${String(discovery.subjects.length + 1).padStart(2, '0')}`,
            icon: 'folder',
            description: `Curated deep-dives and engineering notes on ${subjectName}.`,
          },
          null,
          2
        ),
        'utf8'
      );
      console.log(`  Created new subject folder: /content/${selectedSubjectSlug}`);
    }
  } else {
    subjectName = discovery.subjects.find((s) => s.slug === selectedSubjectSlug)?.name || selectedSubjectSlug;
  }

  // 2. TITLE & SLUG GENERATION
  const articleTitle = await input({
    message: 'Step 2/6: Article Title:',
    validate: (val) => val.trim().length > 3 || 'Title must be at least 4 characters long',
  });

  let articleSlug = slugify(articleTitle);
  console.log(`  Auto-generated URL slug: "${articleSlug}"`);

  // Check if file already exists
  const targetDir = path.join(CONTENT_DIR, selectedSubjectSlug);
  const targetFilePath = path.join(targetDir, `${articleSlug}.md`);
  if (fs.existsSync(targetFilePath)) {
    const overwrite = await confirm({
      message: `Warning: "${articleSlug}.md" already exists in ${selectedSubjectSlug}. Overwrite?`,
      default: false,
    });
    if (!overwrite) {
      const suffix = await input({
        message: 'Provide a unique slug suffix (e.g. part-2):',
        default: 'v2',
      });
      articleSlug = `${articleSlug}-${slugify(suffix)}`;
    }
  }

  // 3. SUMMARY CAPTURE
  const abstract = await input({
    message: 'Step 3/6: Executive Abstract (1-2 sentences for preview cards):',
    default: 'A mechanical breakdown of architectural trade-offs and production heuristics.',
  });

  // 4. TOPIC TAGGING (WITH DEDUPLICATION & TYPO PREVENTION)
  const tagChoices = discovery.tags.map((t) => ({
    name: `#${t.tag.padEnd(20)} (${t.count} notes)`,
    value: t.tag,
  }));

  const selectedTags: string[] = await checkbox({
    message: 'Step 4/6: Select Topic Tags (Spacebar to toggle, Enter to confirm):',
    choices: tagChoices,
  });

  const customTagInput = await input({
    message: 'Optional: Add new or custom tags (comma-separated, or Enter to skip):',
  });

  if (customTagInput.trim()) {
    const rawCustomTags = customTagInput.split(',').map((t) => t.trim().toLowerCase().replace(/^#/, ''));
    for (const rawTag of rawCustomTags) {
      if (!rawTag) continue;
      const similar = discovery.findSimilarTag(rawTag);
      if (similar && similar !== rawTag) {
        console.log(`  Typo Guard: Matched "${rawTag}" to existing canonical tag: #${similar}`);
        if (!selectedTags.includes(similar)) selectedTags.push(similar);
      } else {
        const cleanTag = slugify(rawTag);
        if (!selectedTags.includes(cleanTag)) selectedTags.push(cleanTag);
      }
    }
  }

  // 5. CURRICULUM & LEARNING PATH ASSIGNMENT (OPTIONAL)
  let learningPathData:
    | {
        slug: string;
        name: string;
        module: string;
        moduleName?: string;
        lesson: string;
      }
    | undefined;

  const availablePaths = learningPaths.filter((lp) => lp.subjectSlug === selectedSubjectSlug);

  const pathChoices = [
    { name: 'None (Standalone Article)', value: '__NONE__' },
    ...availablePaths.map((lp) => ({
      name: `Attach to Curriculum: "${lp.title}" (${lp.modules.length} modules)`,
      value: lp.slug,
    })),
    { name: '+ Create New Learning Path for this Subject', value: '__NEW_PATH__' },
  ];

  const chosenPath = await select({
    message: 'Step 5/6: Attach to a Structured Learning Path / Curriculum?',
    choices: pathChoices,
  });

  if (chosenPath === '__NEW_PATH__') {
    const newPathTitle = await input({
      message: 'Enter New Learning Path Title (e.g. Distributed Systems & Consensus):',
      validate: (v) => v.trim().length > 0 || 'Title cannot be empty',
    });
    const newModuleTitle = await input({
      message: 'Enter Initial Module Title (e.g. Core Architecture & Runtime Mechanics):',
      default: 'Core Architecture & Foundations',
    });
    const lessonNum = await input({
      message: 'Enter Lesson Sequence Number (e.g. 1.1):',
      default: '1.1',
    });
    learningPathData = {
      slug: slugify(newPathTitle),
      name: newPathTitle.trim(),
      module: '01',
      moduleName: newModuleTitle.trim(),
      lesson: lessonNum.trim(),
    };
  } else if (chosenPath !== '__NONE__') {
    const selectedPathObj = availablePaths.find((lp) => lp.slug === chosenPath);
    if (selectedPathObj) {
      const moduleChoices = [
        ...selectedPathObj.modules.map((m) => ({
          name: `Module ${m.number}: ${m.title} (${m.lessons.length} lessons)`,
          value: m.number,
        })),
        { name: '+ Add New Module to this Path', value: '__NEW_MODULE__' },
      ];

      const chosenModuleNum = await select({
        message: 'Select Target Module:',
        choices: moduleChoices,
      });

      if (chosenModuleNum === '__NEW_MODULE__') {
        const newModTitle = await input({
          message: 'Enter New Module Title:',
        });
        const nextModNum = String(selectedPathObj.modules.length + 1).padStart(2, '0');
        const lessonNum = await input({
          message: `Enter Lesson Number (e.g. ${selectedPathObj.modules.length + 1}.1):`,
          default: `${selectedPathObj.modules.length + 1}.1`,
        });
        learningPathData = {
          slug: selectedPathObj.slug,
          name: selectedPathObj.title,
          module: nextModNum,
          moduleName: newModTitle.trim(),
          lesson: lessonNum.trim(),
        };
      } else {
        const modObj = selectedPathObj.modules.find((m) => m.number === chosenModuleNum);
        const nextLessonIdx = (modObj?.lessons.length || 0) + 1;
        const defaultLessonNum = `${parseInt(chosenModuleNum, 10)}.${nextLessonIdx}`;
        const lessonNum = await input({
          message: 'Enter Lesson Sequence Number:',
          default: defaultLessonNum,
        });

        learningPathData = {
          slug: selectedPathObj.slug,
          name: selectedPathObj.title,
          module: chosenModuleNum,
          moduleName: modObj?.title,
          lesson: lessonNum.trim(),
        };
      }
    }
  }

  // 6. BLUEPRINT SELECTION
  const blueprintChoices = Object.values(BLUEPRINTS).map((bp) => ({
    name: `${bp.name.padEnd(36)} — ${bp.description}`,
    value: bp.id,
  }));

  const selectedBlueprintId = await select({
    message: 'Step 6/6: Choose Editorial Blueprint Template:',
    choices: blueprintChoices,
  });

  const blueprint = BLUEPRINTS[selectedBlueprintId];

  // 7. ASSEMBLE METADATA & FRONTMATTER
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const metadata: NoteMetadata = {
    title: articleTitle.trim(),
    slug: articleSlug,
    subject: selectedSubjectSlug,
    abstract: abstract.trim(),
    tags: selectedTags,
    published: false, // DRAFT MODE DEFAULT
    publishDate: todayFormatted,
    readTime: '8 min read',
    author: {
      name: 'Kundan',
      role: 'Software Engineer',
      handle: '@kundan',
    },
    blueprint: selectedBlueprintId,
  };

  if (learningPathData) {
    metadata.learningPath = learningPathData;
  }

  // 8. GENERATE MARKDOWN FILE
  const bodyContent = blueprint.template(articleTitle, abstract);
  const fileContent = matter.stringify(bodyContent, metadata);

  const finalFilePath = path.join(CONTENT_DIR, selectedSubjectSlug, `${articleSlug}.md`);
  fs.writeFileSync(finalFilePath, fileContent, 'utf8');

  // Count lines to first heading (usually line ~20)
  const lines = fileContent.split('\n');
  const firstHeadingLineIndex = lines.findIndex((l) => l.startsWith('## 01.'));
  const cursorLine = firstHeadingLineIndex >= 0 ? firstHeadingLineIndex + 1 : 18;

  console.log('\n===========================================================');
  console.log('   ARTICLE SCAFFOLDED SUCCESSFULLY!                        ');
  console.log('===========================================================');
  console.log(`  File Location : ${finalFilePath}`);
  console.log(`  Subject       : ${subjectName} [${selectedSubjectSlug}]`);
  console.log(`  Status        : DRAFT (published: false)`);
  console.log(`  Blueprint     : ${blueprint.name}`);
  console.log(`  Topic Tags    : ${selectedTags.map((t) => `#${t}`).join(', ') || 'None'}`);
  if (learningPathData) {
    console.log(`  Curriculum    : "${learningPathData.name}" [Module ${learningPathData.module} • Lesson ${learningPathData.lesson}]`);
  }
  console.log('-----------------------------------------------------------');
  console.log(` Launching editor at line ${cursorLine}...`);

  // 9. AUTOMATICALLY OPEN IN VS CODE / CURSOR
  openInIDE(finalFilePath, cursorLine);
}

function openInIDE(filePath: string, line: number) {
  // Try VS Code first with cursor position
  exec(`code -g "${filePath}":${line}:1`, (err) => {
    if (!err) {
      console.log('  Opened in VS Code with cursor at the first section heading!');
      return;
    }
    // Try Cursor IDE
    exec(`cursor -g "${filePath}":${line}:1`, (err2) => {
      if (!err2) {
        console.log('  Opened in Cursor IDE!');
        return;
      }
      // General OS open fallback
      const cmd = process.platform === 'win32' ? `start "" "${filePath}"` : `open "${filePath}"`;
      exec(cmd, () => {
        console.log(`  File ready at: file:///${filePath.replace(/\\/g, '/')}`);
      });
    });
  });
}

// Run the wizard
runWizard().catch((err) => {
  if (err.name === 'ExitPromptError') {
    console.log('\nWizard canceled by user.');
  } else {
    console.error('Wizard error:', err);
  }
});
