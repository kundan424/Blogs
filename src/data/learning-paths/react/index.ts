import { LearningPath, LearningModule } from '../../../types';

export const reactModules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // Module 0 — Orientation and setup (Weight 4% · ~2 hrs · 1 doc article)
  // -----------------------------------------------------------------------
  {
    id: 'react-mod-0',
    number: '00',
    title: 'Orientation and setup',
    description:
      'Goal: hold the mental model — declarative UI, UI = f(state) — and have a working React app before learning any API.',
    lessons: [
      {
        id: 'react-0-1',
        number: '0.1',
        title: 'How to Learn from this Syllabus: Study Guide, Mental Model & What to Skip',
        description:
          'The master syllabus guide: declarative UI mental model (UI = f(state)), read-type-break-build loop, study pacing, TypeScript pairing, and what to deliberately skip.',
        status: 'published',
        noteSlug: 'how-to-learn-react-from-first-principles',
        readTime: '15m read',
        topics: ['react', 'mental-model', 'learning-guide', 'typescript'],
      },
      {
        id: 'react-0-2',
        number: '0.2',
        title: 'Quick Start — React docs',
        description:
          'The 80% tour: components, JSX, conditions, lists, events, state, and sharing data. Read it end to end, in the docs sandbox, before touching your own project.',
        status: 'upcoming',
        noteSlug: 'react-quick-start-declarative-ui-mental-model',
        readTime: '12m read',
        topics: ['react', 'jsx', 'vite', 'typescript'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 1 — Describing the UI (Weight 14% · ~7 hrs · 7 doc articles)
  // -----------------------------------------------------------------------
  {
    id: 'react-mod-1',
    number: '01',
    title: 'Describing the UI',
    description:
      'Goal: build any static screen from data using components, props, conditions, and lists — with correct keys and pure components.',
    lessons: [
      {
        id: 'react-1-1',
        number: '1.1',
        title: 'Describing the UI',
        description:
          'The chapter hub: read it first for the map, then the pages below in order.',
        status: 'upcoming',
        noteSlug: 'react-describing-the-ui',
        readTime: '10m read',
        topics: ['react', 'components', 'ui-architecture'],
      },
      {
        id: 'react-1-2',
        number: '1.2',
        title: 'Your First Component',
        description:
          'Declaring and using components; nesting; capital-letter rule.',
        status: 'upcoming',
        noteSlug: 'react-your-first-component',
        readTime: '11m read',
        topics: ['react', 'components', 'jsx'],
      },
      {
        id: 'react-1-3',
        number: '1.3',
        title: 'Passing Props to a Component',
        description:
          'Props as read-only inputs; passing any value, including JSX and functions; children.',
        status: 'upcoming',
        noteSlug: 'react-passing-props-to-a-component',
        readTime: '13m read',
        topics: ['react', 'props', 'typescript'],
      },
      {
        id: 'react-1-4',
        number: '1.4',
        title: 'Conditional Rendering',
        description:
          'if, ternary, and &&; the 0 trap.',
        status: 'upcoming',
        noteSlug: 'react-conditional-rendering-guardrails',
        readTime: '10m read',
        topics: ['react', 'conditional-rendering', 'javascript'],
      },
      {
        id: 'react-1-5',
        number: '1.5',
        title: 'Rendering Lists',
        description:
          'filter and map over data; choosing keys from your data, not from the index.',
        status: 'upcoming',
        noteSlug: 'react-rendering-lists-keys-identity',
        readTime: '14m read',
        topics: ['react', 'lists', 'keys', 'reconciliation'],
      },
      {
        id: 'react-1-6',
        number: '1.6',
        title: 'Keeping Components Pure',
        description:
          'Why components must be pure, and what breaks when they are not.',
        status: 'upcoming',
        noteSlug: 'react-keeping-components-pure',
        readTime: '12m read',
        topics: ['react', 'pure-functions', 'immutability'],
      },
      {
        id: 'react-1-7',
        number: '1.7',
        title: 'Using TypeScript — React docs',
        description:
          'The typing companion for this module: props, children, hooks, and events. Also TypeScript syllabus Module 8 — revisit it here, in React context.',
        status: 'upcoming',
        noteSlug: 'react-using-typescript-strict-guide',
        readTime: '16m read',
        topics: ['react', 'typescript', 'types'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 2 — Thinking in React (Weight 8% · ~4 hrs · 1 doc article)
  // -----------------------------------------------------------------------
  {
    id: 'react-mod-2',
    number: '02',
    title: 'Thinking in React',
    description:
      "Goal: design a React app on paper before writing it, using the docs' own five-step method.",
    lessons: [
      {
        id: 'react-2-1',
        number: '2.1',
        title: 'Thinking in React',
        description:
          'The five steps worked through on a searchable product table. Do the whole tutorial, including its challenges.',
        status: 'upcoming',
        noteSlug: 'react-thinking-in-react-five-step-method',
        readTime: '15m read',
        topics: ['react', 'architecture', 'state-design'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 3 — State and the render cycle (Weight 18% · ~9 hrs · 1 doc article)
  // -----------------------------------------------------------------------
  {
    id: 'react-mod-3',
    number: '03',
    title: 'State and the render cycle',
    description:
      'Goal: make components interactive and understand exactly what happens when state changes — the module that explains most React bugs.',
    lessons: [
      {
        id: 'react-3-1',
        number: '3.1',
        title: 'Adding Interactivity',
        description:
          'The whole chapter in order: Responding to Events; State: A Component’s Memory; Render and Commit; State as a Snapshot; Queueing a Series of State Updates; Updating Objects in State; Updating Arrays in State; Reacting to Input with State. Do every challenge.',
        status: 'upcoming',
        noteSlug: 'react-state-render-cycle-interactivity',
        readTime: '20m read',
        topics: ['react', 'state', 'usestate', 'batching'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 4 — How rendering actually works (Weight 12% · ~7 hrs · 1 doc article)
  // -----------------------------------------------------------------------
  {
    id: 'react-mod-4',
    number: '04',
    title: 'How rendering actually works',
    description:
      'Goal: explain, from first principles, what React does between your setState call and the pixels changing.',
    lessons: [
      {
        id: 'react-4-1',
        number: '4.1',
        title: 'React Fiber Architecture',
        description:
          'The engine, end to end: the stack reconciler vs Fiber, the work loop, time-slicing, lanes, and the render/commit split. Read it after the re-reads, not before.',
        status: 'upcoming',
        noteSlug: 'react-fiber-architecture-reconciliation-engine',
        readTime: '22m read',
        topics: ['react', 'fiber-architecture', 'reconciliation', 'internals'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 5 — Structuring and sharing state (Weight 10% · ~5 hrs · 1 doc article)
  // -----------------------------------------------------------------------
  {
    id: 'react-mod-5',
    number: '05',
    title: 'Structuring and sharing state',
    description:
      'Goal: put each piece of state in the right place, and share it without prop drilling, using the three tools in order: lift, reducer, context.',
    lessons: [
      {
        id: 'react-5-1',
        number: '5.1',
        title: 'Managing State',
        description:
          'The whole chapter in order: Reacting to Input with State (re-read); Choosing the State Structure; Sharing State Between Components; Preserving and Resetting State (re-read); Extracting State Logic into a Reducer; Passing Data Deeply with Context; Scaling Up with Reducer and Context.',
        status: 'upcoming',
        noteSlug: 'react-managing-state-structure-reducers-context',
        readTime: '18m read',
        topics: ['react', 'state-management', 'usereducer', 'context-api'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 6 — Refs and effects (Weight 12% · ~7 hrs · 7 doc articles)
  // -----------------------------------------------------------------------
  {
    id: 'react-mod-6',
    number: '06',
    title: 'Refs and effects',
    description:
      'Goal: step outside React only where you must — refs for values and DOM nodes, effects for synchronization — and delete the effects you do not need.',
    lessons: [
      {
        id: 'react-6-1',
        number: '6.1',
        title: 'Escape Hatches',
        description:
          'The chapter hub; read it first for the map, then the pages below in order.',
        status: 'upcoming',
        noteSlug: 'react-escape-hatches-overview',
        readTime: '11m read',
        topics: ['react', 'escape-hatches', 'hooks'],
      },
      {
        id: 'react-6-2',
        number: '6.2',
        title: 'Referencing Values with Refs',
        description:
          'Refs as memory that does not trigger renders; timeout ids and other non-render values.',
        status: 'upcoming',
        noteSlug: 'react-referencing-values-with-refs',
        readTime: '13m read',
        topics: ['react', 'useref', 'memory'],
      },
      {
        id: 'react-6-3',
        number: '6.3',
        title: 'Manipulating the DOM with Refs',
        description:
          'Focus, scroll, and measure; the rules for touching DOM React manages.',
        status: 'upcoming',
        noteSlug: 'react-manipulating-dom-with-refs',
        readTime: '14m read',
        topics: ['react', 'useref', 'dom', 'browser'],
      },
      {
        id: 'react-6-4',
        number: '6.4',
        title: 'Synchronizing with Effects',
        description:
          'Effects as synchronization; setup, cleanup, and dependencies.',
        status: 'upcoming',
        noteSlug: 'react-synchronizing-with-effects',
        readTime: '18m read',
        topics: ['react', 'useeffect', 'synchronization'],
      },
      {
        id: 'react-6-5',
        number: '6.5',
        title: 'You Might Not Need an Effect',
        description:
          'The most important page in this module: which effects to delete, and what to write instead.',
        status: 'upcoming',
        noteSlug: 'react-you-might-not-need-an-effect',
        readTime: '16m read',
        topics: ['react', 'useeffect', 'clean-code', 'derived-state'],
      },
      {
        id: 'react-6-6',
        number: '6.6',
        title: 'Removing Effect Dependencies',
        description:
          'Make effects re-run less often, honestly.',
        status: 'upcoming',
        noteSlug: 'react-removing-effect-dependencies',
        readTime: '15m read',
        topics: ['react', 'useeffect', 'dependencies'],
      },
      {
        id: 'react-6-7',
        number: '6.7',
        title: 'Reusing Logic with Custom Hooks',
        description:
          'Extracting and sharing hook logic between components.',
        status: 'upcoming',
        noteSlug: 'react-custom-hooks-rules-of-hooks',
        readTime: '17m read',
        topics: ['react', 'custom-hooks', 'rules-of-hooks'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 7 — Async UI: Suspense and transitions (Weight 8% · ~5 hrs · 1 doc article)
  // -----------------------------------------------------------------------
  {
    id: 'react-mod-7',
    number: '07',
    title: 'Async UI: Suspense and transitions',
    description:
      'Goal: keep the interface responsive while data loads, by declaring loading states and marking updates as non-urgent.',
    lessons: [
      {
        id: 'react-7-1',
        number: '7.1',
        title: 'React API Reference (Suspense, Transitions, useDeferredValue, use, lazy)',
        description:
          'The reference index. Read the Suspense, useTransition, useDeferredValue, use, and lazy pages (linked from the index). This is a lookup chapter: read those five pages, not the whole reference.',
        status: 'upcoming',
        noteSlug: 'react-async-ui-suspense-transitions-deferred-value',
        readTime: '17m read',
        topics: ['react', 'suspense', 'transitions', 'concurrency'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 8 — Server React (Weight 8% · ~5 hrs · 1 doc article)
  // -----------------------------------------------------------------------
  {
    id: 'react-mod-8',
    number: '08',
    title: 'Server React',
    description:
      'Goal: decide what runs on the server and what runs in the browser, and build a page that fetches on the server with zero client JavaScript for its static parts.',
    lessons: [
      {
        id: 'react-8-1',
        number: '8.1',
        title: 'Server Components',
        description:
          'The official reference: what Server Components are, what can and cannot cross the boundary, and the use client / use server directives. Also read the Server Functions page linked from it.',
        status: 'upcoming',
        noteSlug: 'react-server-components-rsc-server-functions',
        readTime: '20m read',
        topics: ['react', 'rsc', 'server-components', 'nextjs'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 9 — Performance and production (Weight 6% · ~4 hrs · 1 doc article)
  // -----------------------------------------------------------------------
  {
    id: 'react-mod-9',
    number: '09',
    title: 'Performance and production',
    description:
      'Goal: measure first, optimize only what the measurement shows, and let the compiler do the memoization you used to do by hand.',
    lessons: [
      {
        id: 'react-9-1',
        number: '9.1',
        title: 'React Compiler',
        description:
          'The official guide: what the compiler does, how to install it, and the rules your code must follow for it to work. Also read the memo, useMemo, and useCallback pages linked from the React API reference.',
        status: 'upcoming',
        noteSlug: 'react-performance-react-compiler-memoization',
        readTime: '18m read',
        topics: ['react', 'performance', 'react-compiler', 'profiler'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 10 — Capstone project (~6 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'react-mod-10',
    number: '10',
    title: 'Capstone project',
    description:
      'Goal: prove the syllabus is absorbed by rebuilding your e-learning frontend in typed React, with a written state design and a written re-render chain.',
    lessons: [
      {
        id: 'react-10-1',
        number: '10.1',
        title: 'Capstone Project: Rebuilding the E-Learning Frontend in Typed React',
        description:
          'Rebuild the Lumina / EduNest e-learning frontend in React + TypeScript (Vite starter, or Next.js App Router if you did Module 8): course catalog, search and filter, course detail, and an enrol form.',
        status: 'upcoming',
        noteSlug: 'react-capstone-project-elearning-frontend',
        readTime: '25m read',
        topics: ['react', 'capstone', 'typescript', 'project'],
      },
    ],
  },
];

export const reactPath: LearningPath = {
  id: 'react-from-first-principles',
  slug: 'react-from-first-principles',
  title: 'React from First Principles',
  description:
    'Learn React the way it actually works — declarative UI, state, rendering, effects, and the server — in the right order, with the right articles, and nothing extra on the first pass.',
  subjectSlug: 'frontend-engineering-ui-systems',
  icon: 'desktop_windows',
  level: 'Production Scale',
  estimatedDuration: '11 Modules • 24 Lessons',
  modules: reactModules,
};
