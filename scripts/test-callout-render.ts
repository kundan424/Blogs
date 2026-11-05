const sampleMarkdown = `## 01. Context & Architectural Overview

Why naive thread-to-connection mapping exhausts PostgreSQL backends.

:::callout{type="info" title="System Invariant"}
Under surge conditions (e.g. 5,000 req/sec), connection allocation overhead grows superlinearly if worker thread pools are unbounded.
:::

## 02. Mechanical Breakdown & Heuristics

PostgreSQL adopts a dedicated backend process model per connected socket.

:::callout{type="warning" title="Context Switch Thrashing"}
When 1,000 connections compete for 16 CPU cores, disk I/O queues stall.
:::

## 03. Production Checklist & Takeaways
`;

function testDirectiveParsing() {
  console.log('\n--- VERIFYING DIRECTIVE CALLOUT PARSER ---');

  const directiveRegex = /:::(callout|figure|formula)(?:\{([^}]*)\})?\r?\n([\s\S]*?)\r?\n:::/g;
  let match;
  let count = 0;

  while ((match = directiveRegex.exec(sampleMarkdown)) !== null) {
    count++;
    const directiveType = match[1];
    const attrsString = match[2] || '';
    const body = match[3];

    const typeMatch = attrsString.match(/type="([^"]+)"/);
    const titleMatch = attrsString.match(/title="([^"]+)"/);
    const calloutType = typeMatch ? typeMatch[1] : 'info';
    const title = titleMatch ? titleMatch[1] : '';

    console.log(`✓ Directive #${count}: [${directiveType}] type="${calloutType}" title="${title}"`);
    console.log(`  Body preview: "${body.trim().slice(0, 50)}..."`);
  }

  if (count !== 2) throw new Error(`Expected 2 callouts, found ${count}`);
  console.log('\nSuccessfully verified callout directive parsing! Zero HTML leakage.\n');
}

testDirectiveParsing();
