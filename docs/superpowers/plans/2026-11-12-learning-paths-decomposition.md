# Learning Paths Hierarchical Decomposition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the monolithic `src/data/learningPaths.ts` (1,357 lines) into a modular, hierarchical track and phase architecture under `src/data/learning-paths/`, preserving 100% data fidelity and full backward compatibility.

**Architecture:** Decompose tracks into dedicated files and folders under `src/data/learning-paths/`. The massive Spring Boot track is sliced across 9 phase files matching its roadmap progression (Modules 01–35) and assembled in `spring-boot/index.ts`. Smaller tracks (`microservices`, `java-core`, `docker`) live in dedicated track files. A central `index.ts` re-exports all paths, and `src/data/learningPaths.ts` acts as a backward-compatible proxy for [`learningPathLoader.ts`](file:///e:/projects/Blog/src/utils/learningPathLoader.ts).

**Tech Stack:** TypeScript 5.7, Vite 6.1, tsx (test/verification runner).

**Spec:** [`docs/superpowers/specs/2026-11-12-learning-paths-decomposition-design.md`](file:///e:/projects/Blog/docs/superpowers/specs/2026-11-12-learning-paths-decomposition-design.md)

---

## Global Constraints

- Must pass `npm run build` (`tsc && vite build`) without type errors or broken imports.
- Must preserve exact module IDs, lesson IDs, titles, descriptions, status, read times, topics, and noteSlug mappings without data loss or reordering.
- The exported `learningPaths` array must contain exactly 4 tracks, 40 modules, and 88 lessons matching the existing data structure identically.
- Re-export in `src/data/learningPaths.ts` must maintain identical exports (`export { learningPaths } from './learning-paths'`) so consumers in `learningPathLoader.ts` require zero changes.

---

## Review Focus

1. **Lesson/Module Ordering Discrepancy:** Sequential order of modules (`sb-mod-01` through `sb-mod-35`) or lessons (`sb-1-1` through `sb-35-1`) must not be swapped.
2. **Missing Optional Fields:** Optional lesson fields (`noteSlug`, `readTime`, `topics`, `description`) must be preserved with exact string values.
3. **Number Zero-Padding Loss:** String numbers (e.g. `'01'`, `'02'`, `'1.1'`) must remain zero-padded strings, not converted to numbers.
4. **Metadata Preservation:** Track-level metadata (`level`, `estimatedDuration`, `icon`, `subjectSlug`, `slug`, `id`) must match the original exactly.
5. **Loader Compatibility:** `getAllLearningPaths()` and `getLearningPathBySlug('spring-boot-production-mastery')` in `learningPathLoader.ts` must function without error.

---

## Implementation Tasks

### Task 1: Baseline Verification Script & Data Snapshot

**Files:**
- Create: `scripts/test-learning-paths.ts`

**Interfaces:**
- Consumes: `learningPaths` from `src/data/learningPaths.ts`
- Produces: Executable verification script verifying track count (4), module count (40), lesson count (88), and deep JSON equality against a baseline snapshot.

- [ ] **Step 1: Write baseline verification script `scripts/test-learning-paths.ts`**
  ```typescript
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
  ```

- [ ] **Step 2: Run verification script to generate snapshot and verify existing data**
  Run: `npx tsx scripts/test-learning-paths.ts`
  Expected: PASS with 4 Paths, 40 Modules, 88 Lessons, and snapshot created.

- [ ] **Step 3: Commit baseline test script and snapshot**
  ```bash
  git add scripts/test-learning-paths.ts scripts/lib/learningPaths-snapshot.json
  git commit -m "test: add learning paths verification script and baseline snapshot"
  ```

---

### Task 2: Extract Standalone Tracks

**Files:**
- Create: `src/data/learning-paths/microservices.ts`
- Create: `src/data/learning-paths/java-core.ts`
- Create: `src/data/learning-paths/docker.ts`

**Interfaces:**
- Consumes: `LearningPath` type from `src/types`
- Produces:
  - `export const microservicesPath: LearningPath`
  - `export const javaCorePath: LearningPath`
  - `export const dockerPath: LearningPath`

- [ ] **Step 1: Create `src/data/learning-paths/microservices.ts`**
  Extract the object with id `'production-microservices-distributed-architecture'` (2 modules: `ms-mod-01`, `ms-mod-02`, 5 lessons) from `src/data/learningPaths.ts`.
  Export typed as `LearningPath`: `export const microservicesPath: LearningPath = { ... };`.

- [ ] **Step 2: Create `src/data/learning-paths/java-core.ts`**
  Extract the object with id `'java-core-oop-deep-dives'` (2 modules: `java-mod-01`, `java-mod-02`, 8 lessons) from `src/data/learningPaths.ts`.
  Export typed as `LearningPath`: `export const javaCorePath: LearningPath = { ... };`.

- [ ] **Step 3: Create `src/data/learning-paths/docker.ts`**
  Extract the object with id `'docker-container-runtime-mastery'` (1 module: `docker-mod-01`, 3 lessons) from `src/data/learningPaths.ts`.
  Export typed as `LearningPath`: `export const dockerPath: LearningPath = { ... };`.

- [ ] **Step 4: Verify type checking**
  Run: `npx tsc --noEmit`
  Expected: PASS with zero errors.

- [ ] **Step 5: Commit standalone track extractions**
  ```bash
  git add src/data/learning-paths/microservices.ts src/data/learning-paths/java-core.ts src/data/learning-paths/docker.ts
  git commit -m "refactor(data): extract microservices, java-core, and docker learning paths"
  ```

---

### Task 3: Decompose Spring Boot Phases 0–4

**Files:**
- Create: `src/data/learning-paths/spring-boot/phase-0-prerequisites.ts`
- Create: `src/data/learning-paths/spring-boot/phase-1-spring-core.ts`
- Create: `src/data/learning-paths/spring-boot/phase-2-spring-boot.ts`
- Create: `src/data/learning-paths/spring-boot/phase-3-data-access.ts`
- Create: `src/data/learning-paths/spring-boot/phase-4-production-essentials.ts`

**Interfaces:**
- Consumes: `LearningModule` type from `src/types`
- Produces:
  - `export const phase0Modules: LearningModule[]` (Modules `sb-mod-01` to `sb-mod-02`)
  - `export const phase1Modules: LearningModule[]` (Modules `sb-mod-03` to `sb-mod-07`)
  - `export const phase2Modules: LearningModule[]` (Modules `sb-mod-08` to `sb-mod-12`)
  - `export const phase3Modules: LearningModule[]` (Modules `sb-mod-13` to `sb-mod-17`)
  - `export const phase4Modules: LearningModule[]` (Modules `sb-mod-18` to `sb-mod-20`)

- [ ] **Step 1: Create `src/data/learning-paths/spring-boot/phase-0-prerequisites.ts`**
  Extract Phase 0 modules (`sb-mod-01` Apache Maven, `sb-mod-02` Basic Networking & Relational DBs) from lines 22–71 of `learningPaths.ts`.
  Export as `export const phase0Modules: LearningModule[] = [...]`.

- [ ] **Step 2: Create `src/data/learning-paths/spring-boot/phase-1-spring-core.ts`**
  Extract Phase 1 modules (`sb-mod-03` IoC/DI, `sb-mod-04` Bean Lifecycle, `sb-mod-05` Configuration, `sb-mod-06` AOP, `sb-mod-07` Application Events) from lines 77–212 of `learningPaths.ts`.
  Export as `export const phase1Modules: LearningModule[] = [...]`.

- [ ] **Step 3: Create `src/data/learning-paths/spring-boot/phase-2-spring-boot.ts`**
  Extract Phase 2 modules (`sb-mod-08` Auto-configuration, `sb-mod-09` REST APIs, `sb-mod-10` Error Handling, `sb-mod-11` Validation, `sb-mod-12` Actuator & Config) from lines 217–393 of `learningPaths.ts`.
  Export as `export const phase2Modules: LearningModule[] = [...]`.

- [ ] **Step 4: Create `src/data/learning-paths/spring-boot/phase-3-data-access.ts`**
  Extract Phase 3 modules (`sb-mod-13` JPA/Hibernate, `sb-mod-14` Spring Data Repositories, `sb-mod-15` Transactions, `sb-mod-16` Auditing, `sb-mod-17` Database Migrations) from lines 398–532 of `learningPaths.ts`.
  Export as `export const phase3Modules: LearningModule[] = [...]`.

- [ ] **Step 5: Create `src/data/learning-paths/spring-boot/phase-4-production-essentials.ts`**
  Extract Phase 4 modules (`sb-mod-18` Spring Security 6, `sb-mod-19` Testing, `sb-mod-20` Observability & Actuator) from lines 537–643 of `learningPaths.ts`.
  Export as `export const phase4Modules: LearningModule[] = [...]`.

- [ ] **Step 6: Verify type checking**
  Run: `npx tsc --noEmit`
  Expected: PASS with zero errors.

- [ ] **Step 7: Commit Phases 0–4**
  ```bash
  git add src/data/learning-paths/spring-boot/phase-*.ts
  git commit -m "refactor(data): extract spring-boot phases 0 through 4"
  ```

---

### Task 4: Decompose Spring Boot Phases 5–8 & Assemble `spring-boot/index.ts`

**Files:**
- Create: `src/data/learning-paths/spring-boot/phase-5-microservices-transition.ts`
- Create: `src/data/learning-paths/spring-boot/phase-6-spring-cloud.ts`
- Create: `src/data/learning-paths/spring-boot/phase-7-distributed-messaging.ts`
- Create: `src/data/learning-paths/spring-boot/phase-8-cloud-native.ts`
- Create: `src/data/learning-paths/spring-boot/index.ts`

**Interfaces:**
- Consumes:
  - `LearningPath`, `LearningModule` from `src/types`
  - `phase0Modules` through `phase8Modules`
- Produces:
  - `export const phase5Modules: LearningModule[]` (Modules `sb-mod-21` to `sb-mod-23`)
  - `export const phase6Modules: LearningModule[]` (Modules `sb-mod-24` to `sb-mod-27`)
  - `export const phase7Modules: LearningModule[]` (Modules `sb-mod-28` to `sb-mod-32`)
  - `export const phase8Modules: LearningModule[]` (Modules `sb-mod-33` to `sb-mod-35`)
  - `export const springBootPath: LearningPath` assembled with all 35 modules in order.

- [ ] **Step 1: Create `src/data/learning-paths/spring-boot/phase-5-microservices-transition.ts`**
  Extract Phase 5 modules (`sb-mod-21` Monolith vs Microservices, `sb-mod-22` DDD, `sb-mod-23` Database per Microservice) from lines 648–725 of `learningPaths.ts`.
  Export as `export const phase5Modules: LearningModule[] = [...]`.

- [ ] **Step 2: Create `src/data/learning-paths/spring-boot/phase-6-spring-cloud.ts`**
  Extract Phase 6 modules (`sb-mod-24` Spring Cloud Config, `sb-mod-25` Eureka, `sb-mod-26` Feign/WebClient, `sb-mod-27` Spring Cloud Gateway) from lines 730–835 of `learningPaths.ts`.
  Export as `export const phase6Modules: LearningModule[] = [...]`.

- [ ] **Step 3: Create `src/data/learning-paths/spring-boot/phase-7-distributed-messaging.ts`**
  Extract Phase 7 modules (`sb-mod-28` Resilience4j, `sb-mod-29` Kafka & RabbitMQ, `sb-mod-30` Saga Pattern, `sb-mod-31` Tracing, `sb-mod-32` OAuth2 Token Relay) from lines 840–1004 of `learningPaths.ts`.
  Export as `export const phase7Modules: LearningModule[] = [...]`.

- [ ] **Step 4: Create `src/data/learning-paths/spring-boot/phase-8-cloud-native.ts`**
  Extract Phase 8 modules (`sb-mod-33` Docker & Buildpacks, `sb-mod-34` Kubernetes, `sb-mod-35` CI/CD Pipelines) from lines 1009–1097 of `learningPaths.ts`.
  Export as `export const phase8Modules: LearningModule[] = [...]`.

- [ ] **Step 5: Create `src/data/learning-paths/spring-boot/index.ts`**
  Assemble the path metadata and concatenate all 9 phase arrays:
  ```typescript
  import { LearningPath } from '../../types';
  import { phase0Modules } from './phase-0-prerequisites';
  import { phase1Modules } from './phase-1-spring-core';
  import { phase2Modules } from './phase-2-spring-boot';
  import { phase3Modules } from './phase-3-data-access';
  import { phase4Modules } from './phase-4-production-essentials';
  import { phase5Modules } from './phase-5-microservices-transition';
  import { phase6Modules } from './phase-6-spring-cloud';
  import { phase7Modules } from './phase-7-distributed-messaging';
  import { phase8Modules } from './phase-8-cloud-native';

  export const springBootPath: LearningPath = {
    id: 'spring-boot-production-mastery',
    slug: 'spring-boot-production-mastery',
    title: 'Spring Boot 3 & Microservices Architecture',
    description:
      'A comprehensive, step-by-step staircase roadmap from foundational build tools and networking to Spring Framework core, Spring Boot 3 REST APIs, JPA persistence, cloud-native infrastructure, distributed messaging, and Kubernetes orchestration.',
    subjectSlug: 'backend-distributed-systems',
    icon: 'developer_mode',
    level: 'Production Scale',
    estimatedDuration: '35 Modules • 75 Lessons',
    modules: [
      ...phase0Modules,
      ...phase1Modules,
      ...phase2Modules,
      ...phase3Modules,
      ...phase4Modules,
      ...phase5Modules,
      ...phase6Modules,
      ...phase7Modules,
      ...phase8Modules,
    ],
  };
  ```

- [ ] **Step 6: Verify module count for Spring Boot**
  Run: `npx tsx -e "import { springBootPath } from './src/data/learning-paths/spring-boot'; console.log('Modules:', springBootPath.modules.length); if (springBootPath.modules.length !== 35) process.exit(1);"`
  Expected: "Modules: 35" and exit code 0.

- [ ] **Step 7: Commit Spring Boot Track**
  ```bash
  git add src/data/learning-paths/spring-boot/
  git commit -m "refactor(data): complete spring-boot phases 5 to 8 and assemble track index"
  ```

---

### Task 5: Central Aggregator, Backward Compatibility & Verification

**Files:**
- Create: `src/data/learning-paths/index.ts`
- Modify: `src/data/learningPaths.ts`

**Interfaces:**
- Consumes: `springBootPath`, `microservicesPath`, `javaCorePath`, `dockerPath`
- Produces:
  - `src/data/learning-paths/index.ts`: `export const learningPaths: LearningPath[]`
  - `src/data/learningPaths.ts`: `export { learningPaths } from './learning-paths'`

- [ ] **Step 1: Create `src/data/learning-paths/index.ts`**
  ```typescript
  import { LearningPath } from '../../types';
  import { springBootPath } from './spring-boot';
  import { microservicesPath } from './microservices';
  import { javaCorePath } from './java-core';
  import { dockerPath } from './docker';

  export const learningPaths: LearningPath[] = [
    springBootPath,
    microservicesPath,
    javaCorePath,
    dockerPath,
  ];

  export {
    springBootPath,
    microservicesPath,
    javaCorePath,
    dockerPath,
  };
  ```

- [ ] **Step 2: Replace monolithic `src/data/learningPaths.ts` with re-export**
  ```typescript
  export { learningPaths } from './learning-paths';
  ```

- [ ] **Step 3: Run full automated verification script**
  Run: `npx tsx scripts/test-learning-paths.ts`
  Expected:
  - Total Paths: 4
  - Total Modules: 40
  - Total Lessons: 88
  - Deep JSON equality matched baseline snapshot perfectly!

- [ ] **Step 4: Run production build**
  Run: `npm run build`
  Expected: PASS (`tsc && vite build` succeeds with zero errors).

- [ ] **Step 5: Commit final aggregation and re-export**
  ```bash
  git add src/data/learning-paths/index.ts src/data/learningPaths.ts
  git commit -m "refactor(data): replace monolithic learningPaths.ts with modular architecture"
  ```
