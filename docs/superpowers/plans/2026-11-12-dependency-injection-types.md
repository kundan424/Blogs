# Types of Dependency Injection in Spring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author an exhaustive, mentor-led engineering tutorial on Dependency Injection variants (Constructor, Setter, and Field Injection) from first principles, integrating it as Lesson 3.2 in the Spring Boot 3 roadmap.

**Architecture:** Create `content/backend-distributed-systems/dependency-injection-constructor-setter-field.md` following the blog's deep-dive standard. Update `phase-1-spring-core.ts` to register Lesson 3.2 as published, update `scripts/test-learning-paths.ts` and the baseline snapshot, and verify dynamic content discovery and build output.

**Tech Stack:** Markdown, Java 21 / Spring Boot 3 examples, TypeScript 5.7, Vite 6.1, frontmatter (gray-matter), tsx.

**Spec:** [`docs/superpowers/specs/2026-11-12-dependency-injection-types-design.md`](file:///e:/projects/Blog/docs/superpowers/specs/2026-11-12-dependency-injection-types-design.md)

---

## Global Constraints

- Must pass `npm run build` (`tsc && vite build`) and `npm run scan` with zero errors.
- The article must strictly adopt the mentor-led, standard documentation tutorial tone, explaining concepts from first principles with clear Java 21 / Spring Boot 3 code blocks and architectural comparison diagrams.
- Must include authoritative external reference links to official Spring Framework Reference documentation and Martin Fowler's foundational publications.
- Lesson 3.2 (`sb-3-2`) in `phase-1-spring-core.ts` must have `noteSlug: 'dependency-injection-constructor-setter-field'` and `status: 'published'`.

---

## Review Focus

1. **Pedagogical Clarity & Tone:** Does the article explain the construction contract and mandatory vs. optional dependencies clearly before introducing Spring-specific annotations?
2. **Technical Depth & Accuracy:** Does it thoroughly analyze why field injection is an anti-pattern (reflection `setAccessible(true)` overhead, unit testing paralysis without Spring, hidden SRP violations, circular dependency masking, and lack of `final` immutability)?
3. **Realistic Code Examples:** Are there side-by-side Java 21 examples contrasting Constructor, Setter, and Field injection, plus a comparison of unit test ergonomics (`new Service(mock)` in 1ms vs `@SpringBootTest` in 15s)?
4. **Authoritative References:** Are official documentation links provided (Spring Core Reference, Martin Fowler's IoC paper)?
5. **Curriculum & Data Integrity:** Does `scripts/test-learning-paths.ts` pass with 100% deep equality against the snapshot?

---

## Implementation Tasks

### Task 1: Update Curriculum Roadmap & Snapshot Baseline

**Files:**
- Modify: `src/data/learning-paths/spring-boot/phase-1-spring-core.ts`
- Modify: `scripts/lib/learningPaths-snapshot.json`
- Test: `scripts/test-learning-paths.ts`

**Interfaces:**
- Consumes: `LearningModule`, `Lesson` from `src/types`
- Produces: Updated Lesson 3.2 marked `published` with slug `dependency-injection-constructor-setter-field`.

- [ ] **Step 1: Update `phase-1-spring-core.ts` with Lesson 3.2 metadata**
  In Module `sb-mod-03`, update lesson `sb-3-2`:
  ```typescript
  {
    id: 'sb-3-2',
    number: '3.2',
    title: 'Dependency Injection Variants: Constructor, Setter & Field Injection',
    noteSlug: 'dependency-injection-constructor-setter-field',
    description:
      'Why constructor injection is the gold standard (immutability, fail-fast null safety), setter injection for optional dependencies, and why field injection is an anti-pattern.',
    status: 'published',
    readTime: '20m read',
    topics: ['spring-core', 'dependency-injection', 'best-practices'],
  }
  ```

- [ ] **Step 2: Update snapshot baseline `scripts/lib/learningPaths-snapshot.json`**
  Regenerate the snapshot to synchronize the updated lesson metadata:
  ```bash
  npx tsx -e "import fs from 'node:fs'; import { learningPaths } from './src/data/learningPaths'; fs.writeFileSync('scripts/lib/learningPaths-snapshot.json', JSON.stringify(learningPaths, null, 2), 'utf8');"
  ```

- [ ] **Step 3: Run verification test**
  Run: `npx tsx scripts/test-learning-paths.ts`
  Expected: PASS with 4 Paths, 40 Modules, 89 Lessons, and 100% deep JSON equality.

- [ ] **Step 4: Commit curriculum update**
  ```bash
  git add src/data/learning-paths/spring-boot/phase-1-spring-core.ts scripts/lib/learningPaths-snapshot.json
  git commit -m "feat(curriculum): publish lesson 3.2 on dependency injection variants"
  ```

---

### Task 2: Author the Deep-Dive Article

**Files:**
- Create: `content/backend-distributed-systems/dependency-injection-constructor-setter-field.md`

**Interfaces:**
- Consumes: Frontmatter schema (`title`, `slug`, `subject`, `abstract`, `tags`, `published`, `publishDate`, `readTime`, `author`, `blueprint`)
- Produces: Comprehensive markdown article (>600 lines) with Java code examples, ASCII diagrams, callouts, and official reference links.

- [ ] **Step 1: Write article content**
  Author `content/backend-distributed-systems/dependency-injection-constructor-setter-field.md`:
  - **Section 01: Beyond the Magic of `@Autowired`**: Recapping Lesson 3.1, framing the "How" of dependency injection.
  - **Section 02: First Principles: The Object Construction Contract**: Mandatory vs Optional dependencies, the Car and Engine analogy, and why half-initialized objects are production hazards.
  - **Section 03: Constructor Injection (The Industry Standard)**: Vanilla Java POJO demonstration, modern Spring Boot 3 implicit constructor autowiring, and the 4 superpowers (True Immutability via `final`, Fail-Fast Null Safety, Sub-millisecond Framework-Free Testing, Early Circular Dependency Detection).
  - **Section 04: Setter Injection (For True Optional Dependencies)**: Default constructor + public setters, valid use cases (dynamic cache fallbacks, optional notification channels), and architectural tradeoffs (mutability, lack of `final`, temporal coupling).
  - **Section 05: Field Injection (The Seductive Anti-Pattern)**: Why developers love it (clean appearance), and the 5 critical production landmines:
    1. Encapsulation violation via reflection (`Field.setAccessible(true)`).
    2. Unit testing nightmare (cannot inject mocks without Spring context or reflection hacks).
    3. SRP violations masked (hides bloated classes with 12+ dependencies).
    4. Circular dependencies masked until runtime failures.
    5. Immutability impossible.
  - **Section 06: Modern Production Idioms: Lombok & Java 21 Records**: Clean boilerplate elimination with Lombok `@RequiredArgsConstructor` and `private final` fields; Java 21 Record components with canonical constructor injection.
  - **Section 07: Unit Testing Ergonomics: A Side-by-Side Showdown**: Code contrast: testing Constructor Injection (`new OrderService(mockRepo)` in 2ms) vs Field Injection (`@SpringBootTest` booting an entire ApplicationContext in 12s).
  - **Section 08: Architectural Decision Matrix**: Clean comparison table (Immutability, Null Safety, Unit Testability, Circular Dependency Detection, Industry Verdict).
  - **Section 09: Authoritative References & Further Reading**: Direct links to Spring Framework Reference Docs (Dependencies, Setter vs Constructor), Martin Fowler's 2004 IoC/DI paper, and Clean Code principles.

- [ ] **Step 2: Run scan to verify article ingestion**
  Run: `npm run scan`
  Expected: PASS, discovering 17 articles (17 published, 0 drafts), with `dependency-injection-constructor-setter-field` registered under `backend-distributed-systems`.

- [ ] **Step 3: Commit the new article**
  ```bash
  git add content/backend-distributed-systems/dependency-injection-constructor-setter-field.md
  git commit -m "feat(content): add types of dependency injection deep-dive article"
  ```

---

### Task 3: End-to-End Verification & Production Build

**Files:**
- Test: Full build and loader verification

- [ ] **Step 1: Run learning paths integrity test**
  Run: `npx tsx scripts/test-learning-paths.ts`
  Expected: PASS (4 paths, 40 modules, 89 lessons, matching snapshot).

- [ ] **Step 2: Run content discovery scan**
  Run: `npm run scan`
  Expected: PASS (17 articles discovered).

- [ ] **Step 3: Run full TypeScript compilation and Vite build**
  Run: `npm run build`
  Expected: PASS (`tsc && vite build` succeeds with zero errors).

- [ ] **Step 4: Verify lesson linkage in learning paths**
  Run: `npx tsx -e "import { learningPaths } from './src/data/learningPaths'; const sb = learningPaths.find(p => p.slug === 'spring-boot-production-mastery'); const l = sb?.modules[2].lessons[1]; console.log('Lesson:', l?.id, '|', l?.status, '|', l?.noteSlug); if (l?.status !== 'published' || l?.noteSlug !== 'dependency-injection-constructor-setter-field') process.exit(1);"`
  Expected: "Lesson: sb-3-2 | published | dependency-injection-constructor-setter-field" and exit code 0.
