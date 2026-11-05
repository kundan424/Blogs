# dev.notes /learnings — Living Engineering Knowledge Base

A Bauhaus-inspired, editorial engineering knowledge base and technical blog platform built with **React**, **TypeScript**, and **Tailwind CSS**, implemented from the Stitch design specifications.

---

## 🎨 Design Philosophy & Tokens

The application follows the **Warm Cream Editorial** Bauhaus aesthetic:
- **Canvas (`#fdfcfc`)**: Warm off-white eggshell paper avoiding digital glare.
- **Taupe Surfaces (`#f5f3f1`)**: Secondary surface plates and cards creating quiet separation.
- **Hairline Stone (`#ebe8e4`)**: Hairline borders, dividers, and icon plates.
- **Ink (`#000000`)**: Deep black typography and filled pill buttons.
- **Sparks**:
  - **Vivid Violet (`#0447ff`)**: AI indicator badges, technical moments, reading state pulses.
  - **Ember Orange (`#ff4704`)**: Active highlights, series progress, telemetry indicators.
- **Typography**:
  - **Inter**: Whisper-weight display headlines (`font-light`, weight 300) and readable body copy.
  - **Geist & Geist Mono**: Technical micro-copy, telemetry metrics, and code blocks.

---

## 🏗️ Architecture & Component Reusability

The application adheres to standard enterprise React architectural patterns without duplicating components across pages:

```
src/
├── types/                 # Strict TypeScript domain interfaces
│   └── index.ts           # Subject, Topic, Note, Series, Author models
├── data/                  # Strongly-typed datasets mirroring the designs
│   ├── subjects.ts        # 6 Core Subjects with metrics and top notes
│   ├── topics.ts          # 24 Technical Topics with domain reach
│   ├── notes.ts           # Engineering deep dives & learning notes
│   └── series.ts          # Multi-part learning series curriculum
├── context/               # Global state management
│   ├── SearchModalContext.tsx  # Global ⌘K Command Palette state & listeners
│   └── ToastContext.tsx        # Floating action toast notifications
├── components/
│   ├── common/            # Atomic reusable UI components
│   │   ├── Breadcrumb.tsx      # Configurable hierarchical breadcrumbs
│   │   ├── Pill.tsx            # Multi-variant pills (filter, hash, status, tag)
│   │   ├── SearchInput.tsx     # Search input with keyboard shortcut & clear button
│   │   ├── MetricItem.tsx      # Standard telemetry counter widget
│   │   └── Icon.tsx            # Material Symbols icon wrapper
│   ├── cards/             # Reusable card components
│   │   ├── NoteCard.tsx        # Multi-layout note card with tags and reading pace
│   │   ├── SubjectCard.tsx     # Bento-grid & directory-grid subject card
│   │   └── SeriesCard.tsx      # Interactive series curriculum stepper
│   ├── interactive/       # Interactive widgets
│   │   ├── FilterBar.tsx       # Horizontal scrollable filter pill bar
│   │   ├── ReadingProgressBar.tsx # Smooth viewport reading progress indicator
│   │   ├── CodeBlock.tsx       # Syntax code block with one-click copy feedback
│   │   └── PoolCalculator.tsx  # Interactive HikariCP connection pool calculator
│   ├── layout/            # Layout shell & global navigation
│   │   ├── Navbar.tsx          # Sticky navigation with ⌘K trigger & theme toggle
│   │   ├── Footer.tsx          # Bauhaus grid footer with status & links
│   │   ├── CommandPalette.tsx  # Unified ⌘K modal for instant search
│   │   └── Layout.tsx          # Unified page shell
│   └── sidebar/           # Reusable sidebar panels
│       ├── HomeSidebar.tsx     # Series progress, popular tag cloud, digest form
│       └── ArticleSidebar.tsx  # Sticky author rail & scroll-spy Table of Contents
└── pages/                 # Composed page views
    ├── HomePage.tsx            # 1. Main Knowledge Base Landing Page
    ├── SubjectsPage.tsx        # 2. Subjects & Knowledge Domains Directory
    ├── SubjectHubPage.tsx      # 3. Domain Hub #01 (Backend & Distributed Systems)
    ├── TopicHubPage.tsx        # 4. Topic Hub (#postgresql Knowledge Base)
    ├── NoteDetailPage.tsx      # 5. Article Deep Dive (HikariCP Connection Pooling)
    ├── SeriesPage.tsx          # Curated Learning Series Masterclasses
    └── AboutPage.tsx           # Philosophy & Editorial Manifesto
```

---

## 📄 Implemented Pages

| Page | Route | Description |
|------|-------|-------------|
| **1. Engineering Knowledge Base** | `/` | Hero section, ⌘K trigger, Bento Grid of 4 architectural panels, dynamic topic filter, chronological notes feed, and sticky discovery sidebar. |
| **2. Subjects Directory** | `/subjects` | Aggregate metrics row, live search filter with ESC clear, sorting controls (Most Notes, Updated, A-Z), and 2-column subject grid. |
| **3. Subject Hub** | `/subjects/:slug` | Domain Hub #01 banner, curator profile, sub-topic pills filter, note listing, sub-topic breakdown, and canonical references. |
| **4. Topic Hub** | `/topics/:slug` | Hash topic badge, telemetry metrics (total matches, domain reach), subject tabs filter, co-occurring topics cloud, and matching feed. |
| **5. Engineering Deep Dive** | `/notes/:slug` | Top reading progress bar, author rail (copy permalink, bookmark, applause counter), mathematical heuristics, interactive pool calculator widget, production code blocks, and discussion thread. |

---

## 🚀 Getting Started

### Development Server
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```
