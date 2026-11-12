# Design Document: Git Architecture & Production Workflows (First Principles)

- **Date:** 2026-11-12
- **Topic:** In-depth mentor-led article explaining how Git works under the hood and core production Git commands from first principles.
- **Location:** `content/backend-distributed-systems/git-architecture-advanced-workflows-branching-merging-rebase.md`
- **Learning Path:** Spring Boot 3 & Microservices Architecture $\rightarrow$ Module 01 (Prerequisites & Engineering Workflow), Lesson 1.2 (`sb-1-2`).

---

## 1. Intent & Pedagogical Goals

Developers frequently struggle with Git because they treat it as a black box of magic CLI commands to memorize. When an unexpected state occurs (merge conflicts, detached HEAD, misplaced commits), panic ensues.

This article teaches Git **from the ground up, starting with how Git works under the hood**:
- Demystify Git's internal engine: the content-addressable object store (`.git/objects`), the 4 internal object types (Blob, Tree, Commit, Tag), why Git stores full snapshots rather than diffs, the Index/Staging binary cache, and branch pointers.
- Demystify only the **frequently used and indispensable commands in real-world engineering teams and production environments**.
- Ground every concept in realistic scenarios so readers intuitively understand *what Git is doing behind the scenes* without memorizing commands.

---

## 2. Core Working Principles: How Git Works Under the Hood

### 2.1 Git is a Content-Addressable Key-Value Store
At its core, Git is not a file tracker—it is a simple, high-performance content-addressable key-value store with a VCS user interface on top:
- When you pass data to Git, it computes a cryptographic SHA hash of `header + content`.
- It compresses the content with `zlib` and writes it to `.git/objects/<2-char-folder>/<38-char-hash>`.
- The hash is the key; the compressed content is the value. If the content does not change, the hash is identical (automatic deduplication).

### 2.2 The 4 Core Object Types
1. **Blob**: Stores pure file content. It has no filename, no directory path, and no permissions.
2. **Tree**: Represents a directory. Maps filenames, executable permissions, and points to child Blobs (files) or other Trees (subdirectories). This forms a **Merkle Tree**.
3. **Commit**: A small text object pointing to:
   - The root **Tree** SHA (the snapshot of the entire project at that instant).
   - Parent commit SHA(s) (zero for initial commit, one for normal, two for merge).
   - Author, committer, timestamp metadata, and commit message.
4. **Annotated Tag**: A permanent named reference pointing to a specific commit with message and signature.

### 2.3 Snapshots vs. Delta Diffs
- Traditional VCS (SVN, CVS) stored delta differences: "File A added line 12; File B deleted line 4".
- Git stores **complete snapshots** of your entire project at every commit. If 99 out of 100 files are unchanged, the new Tree simply references the existing 99 Blob hashes. Zero duplication, blazing fast traversal.

### 2.4 The Three Trees
- **Working Tree**: Real files unpacked on your disk that you edit with your IDE.
- **Index (Staging Area)**: A binary file (`.git/index`) caching the exact tree prepared for the next commit.
- **Repository (`HEAD` / Object Database)**: The committed graph of snapshots stored permanently in `.git/objects`.

### 2.5 References and HEAD
- **Branch**: A 41-byte text file in `.git/refs/heads/<name>` containing a single 40-character commit SHA. Creating a branch costs 41 bytes and 0 milliseconds.
- **`HEAD`**: A text file (`.git/HEAD`) containing a symbolic reference pointing to your active branch (e.g. `ref: refs/heads/main`). In detached HEAD state, it points directly to a commit SHA.

---

## 3. In-Scope Daily Production Scenarios & Commands

1. **Inspecting & Contextualizing**:
   - `git status` (comparing Working Directory vs Index vs HEAD).
   - `git diff` (working dir vs index) and `git diff --staged` (index vs HEAD).
   - `git log --oneline --graph` (viewing the DAG structure).
2. **Branching & Context Switching**:
   - `git switch -c <branch>` / `git checkout -b <branch>` (creating branch ref and moving HEAD).
   - `git switch <branch>` / `git checkout <branch>` (moving HEAD and updating working files).
3. **Integrating Changes (Merging & Rebasing)**:
   - **Fast-Forward Merge** (`git merge <branch>` when main hasn't moved): moving the pointer forward with zero merge commits.
   - **3-Way Merge** (`git merge <branch>` when main and branch both moved): common ancestor calculation, conflict resolution, and crafting a merge commit with 2 parents.
   - **Rebase** (`git rebase main` on a feature branch): unwinding local commits and replaying them on top of latest main for clean linear history.
   - *Production Rule:* When to merge vs when to rebase (never rebase shared public branches).
4. **Stashing Incomplete Work**:
   - `git stash` and `git stash pop` (saving untracked/staged work when switching contexts for an urgent hotfix).
5. **Undoing & Fixing Mistakes in Production**:
   - `git reset --soft HEAD~1` (moving branch pointer back without touching index or working tree).
   - `git revert <commit-sha>` (the safe, non-destructive production way to undo deployed code on shared branches).
   - `git branch -d` vs `git branch -D` (safe vs forced branch deletion).
6. **The Safety Net (The Time Machine)**:
   - `git reflog` (how Git preserves every pointer movement, allowing recovery of deleted branches or abandoned commits).
7. **Syncing with Team Remotes**:
   - `git fetch` (downloading remote objects and updating `origin/main` without touching local files) vs `git pull` (fetch + merge).
   - `git push origin <branch>` (publishing local commit graph to remote).

---

## 4. Curriculum Integration

In `src/data/learning-paths/spring-boot/phase-0-prerequisites.ts`:
- Update `sb-mod-01`:
  - Title: `Build Tools & Version Control (Maven & Git)`
  - Description: `Build lifecycle management, POM coordinates, and production Git version control workflows from first principles.`
  - Add Lesson `sb-1-2`:
    - `id: 'sb-1-2'`
    - `number: '1.2'`
    - `title: 'Git Architecture & Production Workflows: Under the Hood, DAG & Branching'`
    - `noteSlug: 'git-architecture-advanced-workflows-branching-merging-rebase'`
    - `description: 'Understand Git from first principles: object store internals (Blobs, Trees, Commits), DAG graphs, branch pointers, fast-forward vs 3-way merges, rebasing, and emergency recovery with reflog.'`
    - `status: 'published'`
    - `readTime: '24m read'`
    - `topics: ['git', 'version-control', 'devops', 'backend']`

---

## 5. Verification Target
- Article markdown renders cleanly without formatting issues.
- `npm run scan` discovers the new article and classifies it under `backend-distributed-systems`.
- `scripts/test-learning-paths.ts` passes with updated snapshot (40 modules, 89 lessons, matching metadata).
- `npm run build` (`tsc && vite build`) succeeds without error.
