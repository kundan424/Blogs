export interface Blueprint {
  id: string;
  name: string;
  description: string;
  template: (title: string, abstract: string) => string;
}

export const BLUEPRINTS: Record<string, Blueprint> = {
  'deep-dive': {
    id: 'deep-dive',
    name: 'Concept Deep-Dive',
    description: 'Mechanical breakdown: Abstract -> Architecture Theory -> Benchmarks -> Checklist',
    template: (_title, abstract) => `## 01. Context & Architectural Overview

${abstract || 'Provide an overview of why this subsystem or pattern is critical under high-load production workloads.'}

:::callout{type="info" title="System Invariant"}
State the core invariant, latency threshold, or physical hardware boundary being analyzed.
:::

## 02. Mechanical Breakdown & Execution Heuristics

Explain what happens beneath the abstraction layer: thread allocation, memory buffers, network sockets, or OS kernel primitives.

\`\`\`typescript title="architecture-spec.ts"
// Key data structure or algorithm implementation
export interface ConcurrencyHeuristic {
  maxThreshold: number;
  evictionPolicy: 'LRU' | 'FIFO' | 'SLOT_STEALING';
}
\`\`\`

## 03. Performance Profiling & Production Benchmarks

Detail the empirical telemetry, latency distribution (p50, p99, p99.9), and throughput trade-offs observed under load.

| Concurrency (Clients) | P99 Latency (ms) | Socket Allocation | CPU Utilization |
| :--- | :--- | :--- | :--- |
| **1,000** | 1.8ms | 24 | 14% |
| **5,000** | 4.2ms | 48 | 38% |
| **10,000** | 12.6ms | 64 | 68% |

## 04. Production Checklist & Architectural Takeaways

- [ ] **Cap Resource Allocation:** Never size thread or connection pools beyond physical core bounds.
- [ ] **Active Telemetry:** Expose Prometheus / OpenTelemetry histograms for latency monitoring.
- [ ] **Circuit Breaking:** Enforce fail-fast boundaries before downstream queues overwhelm memory.
`,
  },

  guide: {
    id: 'guide',
    name: 'Step-by-Step Implementation Guide',
    description: 'Practical build guide: Prerequisites -> Architecture -> Step-by-Step -> Verification',
    template: (_title, abstract) => `## 01. Prerequisites & Topology Setup

${abstract || 'Define what tools, frameworks, and foundational concepts are required before following this guide.'}

:::callout{type="tip" title="Prerequisites"}
- Runtime: Node.js 20+ / JDK 21+ / Go 1.22+
- Storage: Redis 7.x cluster or PostgreSQL 16+
:::

## 02. Architectural Design & Component Diagram

Explain the moving parts and how requests traverse through the system components.

\`\`\`bash title="setup.sh"
# Initialize environment and verification dependencies
docker compose up -d postgres redis
\`\`\`

## 03. Core Implementation Walkthrough

Walk through the actual code step-by-step with typed examples and defensive programming patterns.

\`\`\`typescript title="service.ts"
export async function handleExecutionPipeline() {
  // 1. Validate payload
  // 2. Acquire lock or lease
  // 3. Commit state transition
}
\`\`\`

## 04. Verification & Integration Testing

Demonstrate how to write regression tests, simulate network partition, and verify zero data corruption.
`,
  },

  incident: {
    id: 'incident',
    name: 'Debugging War Story (Post-Mortem)',
    description: 'Post-mortem anatomy: The Incident Surge -> Root Cause Heuristics -> Fix & Guardrails',
    template: (_title, abstract) => `## 01. The Incident: Anomaly Symptoms & Surge Load

${abstract || 'At 14:22 UTC, alerting triggered indicating p99 latency spikes exceeding 3,000ms and connection timeouts.'}

:::callout{type="danger" title="Impact Radius"}
- **Downtime / Degradation:** 18 minutes
- **Affected Endpoints:** \`/api/v2/checkout\`, \`/api/v2/transact\`
- **Root Trigger:** Sudden traffic surge + unindexed foreign key lock contention
:::

## 02. Hypotheses Tested & Disproven

Detail the initial diagnostic steps taken by the on-call engineer and what was ruled out:
- *Hypothesis 1 (CPU Starvation):* Checked node metrics, CPU was below 40%.
- *Hypothesis 2 (Network Partition):* Packet loss between clusters was nominal.

## 03. The Smoking Gun: Root Cause Analysis

Explain the mechanical flaw uncovered in heap dumps, kernel logs, or query execution plans.

\`\`\`sql title="offending_query.sql"
-- The unindexed scan locking parent rows across concurrent transactions
EXPLAIN ANALYZE
SELECT id FROM transactions WHERE status = 'PENDING' FOR UPDATE;
\`\`\`

## 04. The Permanent Patch & Remediation Guardrails

- [ ] **Database Migration:** Added missing composite index concurrently.
- [ ] **Timeout Safeguards:** Enforced \`statement_timeout = 2000ms\` at pool configuration.
- [ ] **Runbook Update:** Documented lock triage heuristics in internal engineering wiki.
`,
  },

  minimal: {
    id: 'minimal',
    name: 'Clean Minimal Outline',
    description: 'Lightweight starting skeleton for flexible technical notes',
    template: (_title, abstract) => `## 01. Introduction

${abstract || 'Brief overview of the concept, technology, or problem statement.'}

## 02. Core Concept & Mechanics

Explain the core principles and implementation details.

## 03. Key Takeaways

- Core insight or finding #1
- Core insight or finding #2
`,
  },
};
