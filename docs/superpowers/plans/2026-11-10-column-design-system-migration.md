# Column Design System Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the visual identity and layout of the entire dev.notes application to strictly match the **"Column — infrastructure in soft focus"** design specification.

**Architecture:** 
1. Re-architect design tokens in `tailwind.config.js` and `src/index.css` with Column's palette (Navy `#111a4a`, Deep teal `#011821`, Cool canvas `#f6f6f8`, Proof green `#167e6c`, Closing gray `#eeeff2`, etc.), SuisseIntl/Inter typography recipes, and container constraints (`max-w-[1112px]`).
2. Add global announcement strip and update Navbar to Column's transparent navigation with 36px physical key controls and 8px radii.
3. Overhaul `HomePage.tsx` to match the Column section recipes: 880px Atmospheric Opening with mint-blue halftone dot artwork and floating translucent glass interface card, Light Quantified Proof with 24px green metrics, bounded Deep Teal `#011821` capability chapter with dot grid, and low-relief catalog cards.
4. Transform `Footer.tsx` into Column's signature Closing Destination (12px-inset, 12px-rounded `#eeeff2` panel with 60px closing headline, three 209px glass route cards with 11x11 dot-matrix icons, and integrated link directory).
5. Refactor `NoteCard.tsx` and `SubjectCard.tsx` to Column's 8px-radius, hairline-bordered catalog cards.
6. Align `SubjectsPage.tsx`, `SubjectHubPage.tsx`, `TopicHubPage.tsx`, and `NoteDetailPage.tsx` to Column's typography, spacing, and container shell.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, SVG Graphics, Vite.

**Spec:** Provided in prompt (`Column — infrastructure in soft focus`).

---

### Task 1: Design Tokens & Tailwind Configuration
**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/index.css`
- Modify: `index.html`

- [ ] **Step 1: Update `tailwind.config.js`**
  Add Column color tokens:
  - `navy: '#111a4a'`, `navy-sub: 'rgba(17,26,74,0.6)'`
  - `deep-teal: '#011821'`, `ice: '#c1e8ef'`
  - `canvas: '#f6f6f8'`, `panel: '#eeeff2'`, `edge: '#e3e4e8'`
  - `proof-green: '#167e6c'`, `dot-blue: '#4575cd'`, `focus-blue: '#a2c1ed'`
  - `banner-start: '#3e5199'`, `banner-end: '#5568ad'`
  - `muted-ink: '#7c7f88'`, `secondary-ink: '#575a64'`, `body-ink: '#3b3e47'`, `control-ink: '#232730'`, `heading-ink: '#12161e'`
  - Max width shell: `column: '1112px'`.
- [ ] **Step 2: Update `src/index.css`**
  Define CSS variables, button styles (`.btn-primary`, `.btn-secondary`), `.floating-glass`, `.closing-card`, `.dot-matrix`, and `.deep-teal-chapter`.
- [ ] **Step 3: Update `index.html`**
  Set body background to `#f6f6f8` (`bg-canvas text-body-ink`).
- [ ] **Step 4: Verify compilation**
  Run: `npx tsc --noEmit`

---

### Task 2: Navbar & Announcement Strip
**Files:**
- Modify: `src/components/layout/Navbar.tsx`

- [ ] **Step 1: Add Announcement Strip**
  Implement 40px top banner with `background: linear-gradient(90deg, #3e5199 0%, #5568ad 100%)`.
- [ ] **Step 2: Update Header Navigation**
  8px rounded nav links, 14px SuisseIntl/Inter font, wordmark with navy ink, 36px primary button with right chevron and secondary search button.

---

### Task 3: Footer as Column Closing Destination
**Files:**
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Build Closing Destination Container**
  Implement 12px-inset, 12px-rounded `#eeeff2` panel with 1px `#e3e4e8` edge.
- [ ] **Step 2: Add 60px Closing Headline & Route Cards**
  60px headline ("Start building today"), 18px single-line support, and three 344px-by-209px glass route cards with 11x11 dot-matrix SVG icons.
- [ ] **Step 3: Integrated Directory**
  Add spacious 4-column directory with 72px padding and subtle hairline separator.

---

### Task 4: NoteCard & SubjectCard Catalog Components
**Files:**
- Modify: `src/components/cards/NoteCard.tsx`
- Modify: `src/components/cards/SubjectCard.tsx`

- [ ] **Step 1: Refactor `NoteCard.tsx`**
  Adopt 8px radius, low-relief shadow (`0px 0px 0px 1px rgba(0,0,0,0.05), 0px 1px 3px 0px rgba(0,0,0,0.05)`), Navy headings with tight tracking, 14px small body descriptions, and clean topic tags.
- [ ] **Step 2: Refactor `SubjectCard.tsx`**
  8px radius, Column milk white surface (`rgba(255,255,255,0.7)`), 24px line icon, bottom-pinned link.

---

### Task 5: HomePage Transformation (Column Section Recipes)
**Files:**
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: Atmospheric Opening Scene (Hero)**
  880px tall stage on `#f6f6f8` with mint-blue halftone dot artwork, 52px/1.1 two-line display headline ("Deconstruct infrastructure at scale"), 20px light support, paired 36px physical key buttons, and floating translucent glass interface card on the right.
- [ ] **Step 2: Light Quantified Proof Chapter**
  Headline with 4-column row of 24px `#167e6c` green figures and 12px captions.
- [ ] **Step 3: Deep Teal Platform Chapter**
  Bounded `#011821` dark chapter with 12px corners, 12px outer margins, radial dot lattice, 48px `#c1e8ef` icy headline, and technical request/response glass trays.
- [ ] **Step 4: Output Discovery Catalog**
  Category directory and low-relief catalog cards.

---

### Task 6: Align Supporting Pages (Subjects, SubjectHub, TopicHub, NoteDetail)
**Files:**
- Modify: `src/pages/SubjectsPage.tsx`
- Modify: `src/pages/SubjectHubPage.tsx`
- Modify: `src/pages/TopicHubPage.tsx`
- Modify: `src/pages/NoteDetailPage.tsx`

- [ ] **Step 1: Update container shells**
  Enforce `max-w-[1112px] px-5` across pages.
- [ ] **Step 2: Update palettes & typography**
  Replace warm oranges and taupes with Column's navy ink, proof green, and cool canvas.

---

### Task 7: Build Verification & Polish
- [ ] **Step 1: Run `npm run build`**
- [ ] **Step 2: Verify responsive layouts across desktop and mobile**
