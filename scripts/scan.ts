import { scanContentDirectory } from './lib/contentScanner';

function formatStage1Summary() {
  console.log('\n======================================================');
  console.log('       STAGE 1: DYNAMIC CONTENT DISCOVERY SCAN        ');
  console.log('======================================================\n');

  const start = performance.now();
  const discovery = scanContentDirectory();
  const durationMs = (performance.now() - start).toFixed(1);

  console.log(`Scan completed in ${durationMs}ms`);
  console.log(`Discovered Articles : ${discovery.totalArticles} (${discovery.publishedCount} published, ${discovery.draftsCount} drafts)\n`);

  console.log('--- 1. SUBJECTS DISCOVERED (' + discovery.subjects.length + ') ---');
  discovery.subjects.forEach((s) => {
    console.log(`  - ${s.name.padEnd(36)} [${s.slug}] (${s.count} notes)`);
  });

  console.log('\n--- 2. UNIQUE TOPIC TAGS DISCOVERED (' + discovery.tags.length + ') ---');
  const tagList = discovery.tags.map((t) => `#${t.tag} (${t.count})`).join('  ');
  console.log(`  ${tagList}`);

  if (discovery.series.length > 0) {
    console.log('\n--- 3. ACTIVE SERIES DISCOVERED (' + discovery.series.length + ') ---');
    discovery.series.forEach((ser) => {
      console.log(`  - "${ser.name}" (Highest Part: ${ser.highestPart}, Total Articles: ${ser.articlesCount})`);
    });
  }

  console.log('\n--- 4. DUPLICATE PREVENTION CHECK ---');
  const testCandidate = 'postgres';
  const match = discovery.findSimilarTag(testCandidate);
  if (match) {
    console.log(`  Typo guard test: Candidate "${testCandidate}" -> matched existing canonical tag: "#${match}"`);
  }

  console.log('\n======================================================');
  console.log(' Stage 1 Ready: Data pre-loaded for Terminal Wizard   ');
  console.log('======================================================\n');
}

formatStage1Summary();
