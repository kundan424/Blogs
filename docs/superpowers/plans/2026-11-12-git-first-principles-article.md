# Git Architecture & Production Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author a comprehensive, mentor-led engineering deep-dive on how Git works under the hood and essential production workflows, publishing it as Lesson 1.2 under Module 01 in the Spring Boot 3 & Microservices roadmap.

**Architecture:** Create `content/backend-distributed-systems/git-architecture-advanced-workflows-branching-merging-rebase.md` following the blog's mentor-led deep-dive pattern. Register the lesson (`sb-1-2`) in `src/data/learning-paths/spring-boot/phase-0-prerequisites.ts`, update `scripts/test-learning-paths.ts` and the baseline snapshot for 89 lessons, and verify dynamic content discovery and build output.

**Tech Stack:** Markdown, TypeScript 5.7, Vite 6.1, frontmatter (gray-matter), tsx.

**Spec:** [`docs/superpowers/specs/2026-11-12-git-first-principles-article-design.md`](file:///e:/projects/Blog/docs/superpowers/specs/2026-11-12-git-first-principles-article-design.md)

---

## Global Constraints

- Must pass `npm run build` (`tsc && vite build`) and `npm run scan` with zero errors.
- The article must strictly adopt the mentor-led, first-principles tone ("Pull up a chair...", clear ASCII/structural diagrams, practical real-world production scenarios).
- Module 01 in `phase-0-prerequisites.ts` must be updated with title `Build Tools & Version Control (Maven & Git)` and contain both Lesson 1.1 (`sb-1-1`) and Lesson 1.2 (`sb-1-2`).
- The learning path verification test (`scripts/test-learning-paths.ts`) must pass with updated target of 89 total lessons.

---

## Review Focus

1. **First-Principles Coverage:** Does the article clearly explain Git's internal engine: Content-addressable store (`.git/objects`), 4 object types (Blobs, Trees, Commits, Tags), Snapshots vs Deltas, the Three Trees, and Refs/HEAD?
2. **Production Scenarios:** Are the daily commands (`status`, `diff`, `log --graph`, `switch`, `merge` FF vs 3-way, `rebase`, `stash`, `reset --soft`, `revert`, `reflog`, `fetch`/`pull`/`push`) explained through intuitive scenarios rather than memorization lists?
3. **Frontmatter Integrity:** Are slug, title, abstract, tags, published state, author metadata, and readTime accurately configured matching existing articles?
4. **Curriculum Linking:** Does `getLearningPathBySlug('spring-boot-production-mastery')` correctly associate lesson `sb-1-2` with the article slug?
5. **Dynamic Content Discovery:** Does `npm run scan` successfully parse and register the article under `backend-distributed-systems`?

---

## Implementation Tasks

### Task 1: Update Curriculum Roadmap & Verification Baseline

**Files:**
- Modify: `src/data/learning-paths/spring-boot/phase-0-prerequisites.ts`
- Modify: `scripts/test-learning-paths.ts`
- Modify: `scripts/lib/learningPaths-snapshot.json`

**Interfaces:**
- Consumes: `LearningModule`, `Lesson` from `src/types`
- Produces: Updated Module 01 with Lesson 1.2 (`sb-1-2`), snapshot reflecting 89 total lessons.

- [ ] **Step 1: Update `phase-0-prerequisites.ts` with Lesson 1.2**
  Update Module `sb-mod-01`:
  - `title`: `'Build Tools & Version Control (Maven & Git)'`
  - `description`: `'Build lifecycle management, POM coordinates, and production Git version control workflows from first principles.'`
  - Add Lesson `sb-1-2`:
    ```typescript
    {
      id: 'sb-1-2',
      number: '1.2',
      title: 'Git Architecture & Production Workflows: Under the Hood, DAG & Branching',
      noteSlug: 'git-architecture-advanced-workflows-branching-merging-rebase',
      description:
        'Understand Git from first principles: object store internals (Blobs, Trees, Commits), DAG graphs, branch pointers, fast-forward vs 3-way merges, rebasing, and emergency recovery with reflog.',
      status: 'published',
      readTime: '24m read',
      topics: ['git', 'version-control', 'devops', 'backend'],
    }
    ```

- [ ] **Step 2: Update verification script `scripts/test-learning-paths.ts`**
  Update expected total lessons from 88 to 89:
  ```typescript
  if (totalLessons !== 89) {
    throw new Error(`Expected 89 total lessons, found: ${totalLessons}`);
  }
  ```

- [ ] **Step 3: Update `scripts/lib/learningPaths-snapshot.json`**
  Regenerate or update the snapshot file to reflect the 89 lessons.

- [ ] **Step 4: Run verification test**
  Run: `npx tsx scripts/test-learning-paths.ts`
  Expected: PASS with 4 Paths, 40 Modules, 89 Lessons, and 100% deep equality.

- [ ] **Step 5: Commit roadmap update**
  ```bash
  git add src/data/learning-paths/spring-boot/phase-0-prerequisites.ts scripts/test-learning-paths.ts scripts/lib/learningPaths-snapshot.json
  git commit -m "feat(curriculum): add lesson 1.2 on git architecture and workflows to module 01"
  ```

---

### Task 2: Author the First-Principles Git Deep-Dive Article

**Files:**
- Create: `content/backend-distributed-systems/git-architecture-advanced-workflows-branching-merging-rebase.md`

**Interfaces:**
- Consumes: Frontmatter schema (`title`, `slug`, `subject`, `abstract`, `tags`, `published`, `publishDate`, `readTime`, `author`, `blueprint`)
- Produces: Comprehensive markdown article (>400 lines) with ASCII diagrams, callouts, and real-world scenarios.

- [ ] **Step 1: Write article content**
  Author `content/backend-distributed-systems/git-architecture-advanced-workflows-branching-merging-rebase.md`:
  - **Section 01: The Chaos Before Git (Why Linus Built It in 10 Days)**: BitKeeper crisis, central lock servers, and the requirement for speed, distributed trust, and integrity.
  - **Section 02: Under the Hood: Git is a Content-Addressable Key-Value Store**: Exploring `.git/objects`, SHA-1/SHA-256 content hashing, zlib compression, and deduplication.
  - **Section 03: The 4 Core Objects (The Anatomy of a Commit)**: Deep dive into Blobs, Trees (Merkle directories), Commits (pointers to Tree + parent), and Tags with ASCII visual models.
  - **Section 04: Snapshots, Not Diffs**: Why Git does NOT store delta diffs, and why full tree snapshots make branch switching and diffing instant.
  - **Section 05: The Three Trees (Working Dir, Index, HEAD)**: How `git add` constructs the binary index and prepares the next Tree object.
  - **Section 06: Branches & HEAD: Pointers Demystified**: Why branches are 41-byte text files in `.git/refs/heads/`, and what `HEAD` does.
  - **Section 07: Fast-Forward vs. 3-Way Merges**: Scenario walkthrough: what happens when main hasn't moved vs when both branches moved. The common ancestor algorithm and why you shouldn't push main before merging locally.
  - **Section 08: Merge vs. Rebase: Rewriting History vs Preserving Reality**: What `git rebase` actually does under the hood (unwinding and replaying commits) and the golden rule of rebase.
  - **Section 09: Production Survival Scenarios**:
    - Scenario A: Pausing work for an urgent hotfix (`git stash` / `stash pop`).
    - Scenario B: "I committed to the wrong branch / need to fix the commit" (`git reset --soft HEAD~1`).
    - Scenario C: Reverting deployed code safely (`git revert`).
    - Scenario D: The Emergency Time Machine (`git reflog` recovering "deleted" branches).
  - **Section 10: Syncing with Team Remotes**: `git fetch` (updating `origin/*` refs) vs `git pull` (fetch + merge), and atomic `git push`.
  - **Section 11: Production Summary Checklist**: Key takeaways and mental models.

- [ ] **Step 2: Run scan to verify article ingestion**
  Run: `npm run scan`
  Expected: PASS, discovering 16 articles (16 published, 0 drafts), with `git-architecture-advanced-workflows-branching-merging-rebase` registered under `backend-distributed-systems`.

- [ ] **Step 3: Commit the new article**
  ```bash
  git add content/backend-distributed-systems/git-architecture-advanced-workflows-branching-merging-rebase.md
  git commit -m "feat(content): add git architecture and production workflows article"
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
  Expected: PASS (16 articles discovered).

- [ ] **Step 3: Run full TypeScript compilation and Vite build**
  Run: `npm run build`
  Expected: PASS (`tsc && vite build` succeeds with zero errors).

- [ ] **Step 4: Verify loader enrichment for the new lesson**
  Run: `npx tsx -e "import { getLearningPathBySlug } from './src/utils/learningPathLoader'; const p = getLearningPathBySlug('spring-boot-production-mastery'); const l = p?.modules[0].lessons[1]; console.log('Enriched Lesson:', l?.id, l?.status, l?.title); if (l?.status !== 'published') process.exit(1);"`
  Expected: "Enriched Lesson: sb-1-2 published Git Architecture & Production Workflows: Under the Hood, DAG & Branching" and exit code 0.
