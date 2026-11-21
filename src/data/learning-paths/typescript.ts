import { LearningPath, LearningModule } from '../../types';

export const typescriptModules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // Module 0 — Orientation: from Java to TypeScript (Weight 5% · ~2 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ts-mod-00',
    number: '00',
    title: 'Orientation: From Java to TypeScript',
    description:
      'Goal: understand what TypeScript is and how its type system differs from Java\'s, before writing a line of it (Weight 5% · ~2 hrs).',
    lessons: [
      {
        id: 'ts-0-1',
        number: '0.1',
        title: 'How to Learn TypeScript for React: Mental Model, Study Guide & Roadmap',
        description:
          'Why Java developers learn TypeScript faster, how to use the read-type-break-build loop, and what advanced type gymnastics to deliberately skip on the first pass.',
        status: 'upcoming',
        noteSlug: 'how-to-learn-typescript-for-react-guide',
        readTime: '12m read',
        topics: ['typescript', 'mental-model', 'learning-guide', 'react'],
      },
      {
        id: 'ts-0-2',
        number: '0.2',
        title: 'TypeScript as a Static Type Checker & Erasure Runtime',
        description:
          'Types exist solely at compile time and are completely erased during emit. Why nothing about TypeScript types exists in the JavaScript runtime.',
        status: 'published',
        noteSlug: 'typescript-static-type-checker-erasure-runtime',
        readTime: '14m read',
        topics: ['typescript', 'compiler', 'type-erasure', 'javascript'],
      },
      {
        id: 'ts-0-3',
        number: '0.3',
        title: 'Structural Typing vs Java’s Nominal Typing: Shape-Based Compatibility',
        description:
          'Why two types with the exact same shape are interchangeable without inheritance or shared interfaces: the Car vs Golfer problem demystified.',
        status: 'published',
        noteSlug: 'structural-typing-vs-java-nominal-typing',
        readTime: '16m read',
        topics: ['typescript', 'structural-typing', 'java-comparison', 'type-system'],
      },
      {
        id: 'ts-0-4',
        number: '0.4',
        title: 'Types as Sets of Values: Set Theory & Union Semantics',
        description:
          'Thinking about types as sets of allowable values. Why unions (string | number) represent the mathematical union of two value domains.',
        status: 'published',
        noteSlug: 'types-as-sets-unions-string-or-number',
        readTime: '16m read',
        topics: ['typescript', 'set-theory', 'unions', 'type-system'],
      },
      {
        id: 'ts-0-5',
        number: '0.5',
        title: 'TypeScript in 5 Minutes: Rapid Tour of Inference, Interfaces & Generics',
        description:
          'A high-speed walkthrough connecting inference, interfaces, unions, and generics with runnable code snippets.',
        status: 'upcoming',
        noteSlug: 'typescript-rapid-tour-inference-interfaces-generics',
        readTime: '08m read',
        topics: ['typescript', 'quickstart', 'syntax', 'generics'],
      },
      {
        id: 'ts-0-6',
        number: '0.6',
        title: 'Free Functions and Data: Why Code Does Not Have to Live Inside a Class',
        description:
          'Moving away from Java’s "everything must be inside a class" constraint: module-level functions, closures, and plain data structures.',
        status: 'upcoming',
        noteSlug: 'free-functions-and-data-first-class-functions',
        readTime: '09m read',
        topics: ['typescript', 'functional-programming', 'modular-design'],
      },
      {
        id: 'ts-0-7',
        number: '0.7',
        title: 'Module 0 Mini-Build: Installing TSC & Observing Type Erasure',
        description:
          'Set up a TypeScript development sandbox with npm, write a typed greeting script, compile with tsc, and inspect the emitted clean JavaScript.',
        status: 'upcoming',
        noteSlug: 'module-0-mini-build-tsc-type-erasure',
        readTime: '15m read',
        topics: ['typescript', 'hands-on', 'tsc', 'build-tools'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 1 — Core types and everyday types (Weight 20% · ~8 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ts-mod-01',
    number: '01',
    title: 'Core Types and Everyday Types',
    description:
      'Goal: learn the vocabulary every React file uses — primitives, unions, interfaces, aliases, inference, and null handling (Weight 20% · ~8 hrs).',
    lessons: [
      {
        id: 'ts-1-1',
        number: '1.1',
        title: 'The Basics: Static vs Dynamic Typing & Non-Exception Failures',
        description:
          'What the TypeScript compiler catches before runtime, why tsc emits JavaScript even when errors occur, and how to configure strict compilation.',
        status: 'upcoming',
        noteSlug: 'typescript-basics-static-vs-dynamic-typing',
        readTime: '10m read',
        topics: ['typescript', 'static-typing', 'compiler-options'],
      },
      {
        id: 'ts-1-2',
        number: '1.2',
        title: 'TypeScript Primitives: string, number, and boolean',
        description:
          'Working with lowercase primitives versus JavaScript wrapper objects (String, Number, Boolean), and template string literals.',
        status: 'upcoming',
        noteSlug: 'typescript-primitives-string-number-boolean',
        readTime: '08m read',
        topics: ['typescript', 'primitives', 'types'],
      },
      {
        id: 'ts-1-3',
        number: '1.3',
        title: 'Arrays and Fixed Tuples in TypeScript',
        description:
          'Declaring T[] vs Array<T>, readonly arrays, and fixed-length tuples like the pair returned by React useState.',
        status: 'upcoming',
        noteSlug: 'typescript-arrays-and-tuples',
        readTime: '09m read',
        topics: ['typescript', 'arrays', 'tuples', 'immutability'],
      },
      {
        id: 'ts-1-4',
        number: '1.4',
        title: 'Special Types: any vs unknown vs never vs void',
        description:
          'Understanding top types (any, unknown), the bottom type (never), and void return semantics: when to use unknown instead of any.',
        status: 'upcoming',
        noteSlug: 'special-types-any-unknown-never-void',
        readTime: '12m read',
        topics: ['typescript', 'any', 'unknown', 'never', 'type-safety'],
      },
      {
        id: 'ts-1-5',
        number: '1.5',
        title: 'Type Annotations vs Type Inference: The Java Habit to Unlearn',
        description:
          'Why over-annotating harms readability: letting the compiler infer variable, return, and expression types naturally.',
        status: 'upcoming',
        noteSlug: 'type-annotations-vs-type-inference',
        readTime: '10m read',
        topics: ['typescript', 'inference', 'best-practices', 'java-comparison'],
      },
      {
        id: 'ts-1-6',
        number: '1.6',
        title: 'Typing Functions: Parameter & Return Annotations and Promise<T>',
        description:
          'Annotating parameters, optional arguments, inferred return types, and typing asynchronous operations returning Promise<T>.',
        status: 'upcoming',
        noteSlug: 'typing-functions-parameters-returns-promises',
        readTime: '11m read',
        topics: ['typescript', 'functions', 'promises', 'async'],
      },
      {
        id: 'ts-1-7',
        number: '1.7',
        title: 'Contextual Typing of Callbacks and Event Handlers',
        description:
          'How the compiler automatically infers parameter types of anonymous functions and callbacks based on their call location.',
        status: 'upcoming',
        noteSlug: 'contextual-typing-callbacks-event-handlers',
        readTime: '09m read',
        topics: ['typescript', 'callbacks', 'contextual-typing'],
      },
      {
        id: 'ts-1-8',
        number: '1.8',
        title: 'Object Types, Optional Properties (?), and the Optional Chaining Operator (?.)',
        description:
          'Defining anonymous object types, marking optional properties with ?, and combining with runtime optional chaining (?.) and nullish coalescing (??).',
        status: 'upcoming',
        noteSlug: 'object-types-optional-properties-chaining',
        readTime: '11m read',
        topics: ['typescript', 'objects', 'optional-properties', 'null-safety'],
      },
      {
        id: 'ts-1-9',
        number: '1.9',
        title: 'Union and Intersection Types: Composing Shapes with | and &',
        description:
          'Expressing values that can be one of several types (|) versus combining multiple object specifications into a single combined contract (&).',
        status: 'upcoming',
        noteSlug: 'union-and-intersection-types',
        readTime: '10m read',
        topics: ['typescript', 'unions', 'intersections', 'composition'],
      },
      {
        id: 'ts-1-10',
        number: '1.10',
        title: 'Literal Types for UI Status and Component Variant Props',
        description:
          'Using exact string literals ("primary" | "secondary" | "danger", "open" | "closed") to create strict, self-documenting component props.',
        status: 'upcoming',
        noteSlug: 'literal-types-status-variant-props',
        readTime: '09m read',
        topics: ['typescript', 'literal-types', 'react-props', 'ui-design'],
      },
      {
        id: 'ts-1-11',
        number: '1.11',
        title: 'Type Aliases vs Interfaces: When to Prefer Each',
        description:
          'Evaluating type vs interface: declaration merging, extension ergonomics, compiler error caching, and the standard convention for React props.',
        status: 'upcoming',
        noteSlug: 'type-aliases-vs-interfaces-comparison',
        readTime: '10m read',
        topics: ['typescript', 'interfaces', 'type-aliases', 'architecture'],
      },
      {
        id: 'ts-1-12',
        number: '1.12',
        title: 'Strict Null Checks: Handling null and undefined Under strictNullChecks',
        description:
          'Why strictNullChecks prevents the "billion-dollar mistake", and how to safely narrow optional props before reading properties.',
        status: 'upcoming',
        noteSlug: 'strict-null-checks-null-and-undefined',
        readTime: '11m read',
        topics: ['typescript', 'strict-null-checks', 'null-safety', 'debugging'],
      },
      {
        id: 'ts-1-13',
        number: '1.13',
        title: 'Module 1 Mini-Build: Typed Command-Line Student Records with Zero any',
        description:
          'Build a strict command-line record system with interfaces, Promise returns, status literal unions, and zero occurrences of any.',
        status: 'upcoming',
        noteSlug: 'module-1-mini-build-typed-student-records',
        readTime: '20m read',
        topics: ['typescript', 'hands-on', 'mini-build', 'strict-mode'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 2 — Narrowing and control flow (Weight 12% · ~5 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ts-mod-02',
    number: '02',
    title: 'Narrowing and Control Flow',
    description:
      'Goal: understand how the compiler refines a type inside a branch — the mechanism behind most TypeScript error messages (Weight 12% · ~5 hrs).',
    lessons: [
      {
        id: 'ts-2-1',
        number: '2.1',
        title: 'typeof Type Guards and Truthiness Narrowing',
        description:
          'Refining broad types using typeof (string, number, boolean) and truthiness checks, with caution around empty strings and 0.',
        status: 'upcoming',
        noteSlug: 'typeof-type-guards-truthiness-narrowing',
        readTime: '10m read',
        topics: ['typescript', 'narrowing', 'type-guards', 'control-flow'],
      },
      {
        id: 'ts-2-2',
        number: '2.2',
        title: 'The typeof null === "object" Trap and Safe Null Discrimination',
        description:
          'JavaScript’s infamous historical quirk where typeof null returns "object", and how to write rock-solid defensive guards.',
        status: 'upcoming',
        noteSlug: 'typeof-null-object-trap',
        readTime: '08m read',
        topics: ['typescript', 'gotchas', 'javascript-quirks', 'null-checks'],
      },
      {
        id: 'ts-2-3',
        number: '2.3',
        title: 'Equality Narrowing with === and != null',
        description:
          'Using strict equality (===, !==) and loose equality (!= null) to eliminate null and undefined in a single check.',
        status: 'upcoming',
        noteSlug: 'equality-narrowing-strict-loose-equality',
        readTime: '09m read',
        topics: ['typescript', 'equality-narrowing', 'operators'],
      },
      {
        id: 'ts-2-4',
        number: '2.4',
        title: 'The "in" Operator for Property Existence Narrowing',
        description:
          'Narrowing unshared properties between candidate object shapes using the "in" operator (e.g., "fly" in animal).',
        status: 'upcoming',
        noteSlug: 'in-operator-property-narrowing',
        readTime: '08m read',
        topics: ['typescript', 'in-operator', 'narrowing', 'objects'],
      },
      {
        id: 'ts-2-5',
        number: '2.5',
        title: 'instanceof Narrowing for Error Classes and DOM Nodes',
        description:
          'Branching based on prototype chain verification for custom error classes and DOM element hierarchies (HTMLElement, HTMLInputElement).',
        status: 'upcoming',
        noteSlug: 'instanceof-narrowing-classes-dom',
        readTime: '09m read',
        topics: ['typescript', 'instanceof', 'error-handling', 'dom'],
      },
      {
        id: 'ts-2-6',
        number: '2.6',
        title: 'Discriminated Unions: Modeling State & API Responses in React',
        description:
          'The single most important modeling pattern in React: using a shared literal discriminant field (status: "loading" | "ok" | "error").',
        status: 'upcoming',
        noteSlug: 'discriminated-unions-state-api-responses',
        readTime: '13m read',
        topics: ['typescript', 'discriminated-unions', 'react-state', 'api-design'],
      },
      {
        id: 'ts-2-7',
        number: '2.7',
        title: 'Exhaustiveness Checking with the never Type',
        description:
          'Making the compiler mathematically prove you have handled every possible union branch using the assertNever helper.',
        status: 'upcoming',
        noteSlug: 'exhaustiveness-checking-with-never',
        readTime: '10m read',
        topics: ['typescript', 'never-type', 'exhaustiveness', 'compiler-checks'],
      },
      {
        id: 'ts-2-8',
        number: '2.8',
        title: 'Custom Type Predicates: The "x is T" Return Signature',
        description:
          'Authoring user-defined type guard functions with custom return predicates, and using them to filter typed arrays safely.',
        status: 'upcoming',
        noteSlug: 'custom-type-predicates-x-is-type',
        readTime: '11m read',
        topics: ['typescript', 'type-predicates', 'type-guards', 'arrays'],
      },
      {
        id: 'ts-2-9',
        number: '2.9',
        title: 'Assertion Functions and Invariant Checks',
        description:
          'Typing functions that throw errors if an invariant condition fails using the asserts condition and asserts val is T syntax.',
        status: 'upcoming',
        noteSlug: 'assertion-functions-asserts-condition',
        readTime: '09m read',
        topics: ['typescript', 'assertions', 'invariants', 'defensive-programming'],
      },
      {
        id: 'ts-2-10',
        number: '2.10',
        title: 'Module 2 Mini-Build: Discriminated Union API Fetcher with Exhaustive Switch',
        description:
          'Construct an end-to-end async data handler modeling ApiState as a discriminated union, with exhaustive compile-time verification.',
        status: 'upcoming',
        noteSlug: 'module-2-mini-build-discriminated-api-fetcher',
        readTime: '20m read',
        topics: ['typescript', 'hands-on', 'mini-build', 'discriminated-unions'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 3 — Functions in depth (Weight 10% · ~4 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ts-mod-03',
    number: '03',
    title: 'Functions in Depth',
    description:
      'Goal: type functions the way React needs them — callbacks, handlers, and generic helpers (Weight 10% · ~4 hrs).',
    lessons: [
      {
        id: 'ts-3-1',
        number: '3.1',
        title: 'Function Type Expressions vs Call Signatures',
        description:
          'Writing concise arrow function types ((a: string) => void) versus object call signatures, and choosing the right form for props.',
        status: 'upcoming',
        noteSlug: 'function-type-expressions-vs-call-signatures',
        readTime: '10m read',
        topics: ['typescript', 'functions', 'signatures', 'react-props'],
      },
      {
        id: 'ts-3-2',
        number: '3.2',
        title: 'Generic Functions: Type Parameters & Call-Site Inference',
        description:
          'Writing functions that operate over arbitrary types while preserving relationship constraints: first<T>(items: T[]): T | undefined.',
        status: 'upcoming',
        noteSlug: 'generic-functions-type-parameters-inference',
        readTime: '11m read',
        topics: ['typescript', 'generics', 'type-inference', 'functions'],
      },
      {
        id: 'ts-3-3',
        number: '3.3',
        title: 'Generic Constraints: Constraining Type Parameters with extends',
        description:
          'Restricting generic parameters to shapes satisfying a minimum contract using <T extends { length: number }>.',
        status: 'upcoming',
        noteSlug: 'generic-constraints-with-extends',
        readTime: '10m read',
        topics: ['typescript', 'generics', 'constraints', 'extends'],
      },
      {
        id: 'ts-3-4',
        number: '3.4',
        title: 'Optional, Default, and Rest Parameters',
        description:
          'Rules for ordering optional parameters (x?: number), default parameter values (x = 10), and typing variable-length rest parameters (...rest).',
        status: 'upcoming',
        noteSlug: 'optional-default-rest-parameters',
        readTime: '09m read',
        topics: ['typescript', 'functions', 'parameters', 'rest-parameters'],
      },
      {
        id: 'ts-3-5',
        number: '3.5',
        title: 'Understanding void Return Types in Callbacks',
        description:
          'Why a callback typed as () => void can return a non-void value without error: substitution rules and React onClick compatibility.',
        status: 'upcoming',
        noteSlug: 'void-return-types-callbacks-handlers',
        readTime: '09m read',
        topics: ['typescript', 'void', 'callbacks', 'subtyping'],
      },
      {
        id: 'ts-3-6',
        number: '3.6',
        title: 'Function Overloads: Reading Library Declarations vs Writing Them',
        description:
          'How TypeScript library types declare multiple signatures for the same function, and why application code should prefer unions or generics.',
        status: 'upcoming',
        noteSlug: 'function-overloads-reading-vs-writing',
        readTime: '10m read',
        topics: ['typescript', 'function-overloads', 'library-types'],
      },
      {
        id: 'ts-3-7',
        number: '3.7',
        title: 'This Types and Construct Signatures: What to Know & What to Skip',
        description:
          'Recognizing new () => T construct signatures and this parameters in library .d.ts files without complicating your React functional code.',
        status: 'upcoming',
        noteSlug: 'this-types-and-construct-signatures',
        readTime: '08m read',
        topics: ['typescript', 'this-type', 'construct-signatures', 'scoping'],
      },
      {
        id: 'ts-3-8',
        number: '3.8',
        title: 'Module 3 Mini-Build: Generic Utility Helpers (filter, groupBy, pluck)',
        description:
          'Implement a suite of typed utility functions from scratch with generic type parameters, constraints, and strict test assertions.',
        status: 'upcoming',
        noteSlug: 'module-3-mini-build-generic-utility-helpers',
        readTime: '20m read',
        topics: ['typescript', 'hands-on', 'mini-build', 'generics'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 4 — Object types and interfaces (Weight 10% · ~4 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ts-mod-04',
    number: '04',
    title: 'Object Types and Interfaces',
    description:
      'Goal: model props, state, and API payloads as object types, and know when an interface beats a type alias (Weight 10% · ~4 hrs).',
    lessons: [
      {
        id: 'ts-4-1',
        number: '4.1',
        title: 'Property Modifiers: readonly and Optional (?) Properties',
        description:
          'Enforcing compile-time immutability on domain model IDs and state objects using readonly, and handling optional object fields.',
        status: 'upcoming',
        noteSlug: 'property-modifiers-readonly-and-optional',
        readTime: '10m read',
        topics: ['typescript', 'readonly', 'immutability', 'object-types'],
      },
      {
        id: 'ts-4-2',
        number: '4.2',
        title: 'Extending Interfaces: Composing Component Shapes',
        description:
          'Composing base UI contracts into specialized variants: interface PrimaryButtonProps extends BaseButtonProps.',
        status: 'upcoming',
        noteSlug: 'extending-interfaces-composing-component-shapes',
        readTime: '09m read',
        topics: ['typescript', 'interfaces', 'inheritance', 'react-props'],
      },
      {
        id: 'ts-4-3',
        number: '4.3',
        title: 'Interface Extension vs Intersection Types: Structural Differences',
        description:
          'Comparing extends with intersection operators (&): error reporting clarity, property type conflict resolution, and performance.',
        status: 'upcoming',
        noteSlug: 'interface-extension-vs-intersection-types',
        readTime: '10m read',
        topics: ['typescript', 'interfaces', 'intersections', 'architecture'],
      },
      {
        id: 'ts-4-4',
        number: '4.4',
        title: 'Index Signatures for Dictionary Objects & Their Limits',
        description:
          'Typing dynamic key-value lookups with [key: string]: ValueType, understanding why undefined can leak, and comparing with Record<K, V>.',
        status: 'upcoming',
        noteSlug: 'index-signatures-dictionary-objects-limits',
        readTime: '10m read',
        topics: ['typescript', 'index-signatures', 'dictionaries', 'records'],
      },
      {
        id: 'ts-4-5',
        number: '4.5',
        title: 'Generic Object Types: Parameterized Interfaces & Payloads',
        description:
          'Designing reusable container interfaces like ApiResponse<T>, Paginated<T>, and DropdownOption<T> for enterprise React apps.',
        status: 'upcoming',
        noteSlug: 'generic-object-types-parameterized-payloads',
        readTime: '10m read',
        topics: ['typescript', 'generics', 'interfaces', 'api-contracts'],
      },
      {
        id: 'ts-4-6',
        number: '4.6',
        title: 'Interfaces vs Type Aliases: Practical Guidelines for React',
        description:
          'Clear rules of thumb: use interface for props, state shapes, and public contracts; use type for unions, tuples, and computed types.',
        status: 'upcoming',
        noteSlug: 'interfaces-vs-type-aliases-react-guidelines',
        readTime: '09m read',
        topics: ['typescript', 'interfaces', 'type-aliases', 'conventions'],
      },
      {
        id: 'ts-4-7',
        number: '4.7',
        title: 'Module 4 Mini-Build: Modeling Blog Domain Entities (Post, Author, Comment)',
        description:
          'Design and validate a complete domain model for a blog engine with shared base entity interfaces, readonly IDs, and optional relations.',
        status: 'upcoming',
        noteSlug: 'module-4-mini-build-blog-domain-entities',
        readTime: '20m read',
        topics: ['typescript', 'hands-on', 'mini-build', 'domain-modeling'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 5 — Generics and creating types from types (Weight 10% · ~5 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ts-mod-05',
    number: '05',
    title: 'Generics and Creating Types from Types',
    description:
      'Goal: write reusable typed code with generics, and derive new types from existing ones instead of repeating yourself (Weight 10% · ~5 hrs).',
    lessons: [
      {
        id: 'ts-5-1',
        number: '5.1',
        title: 'Generics in Classes and Data Structures',
        description:
          'Building generic collections and data buffers: type parameters, default types (<T = string>), and static member generic restrictions.',
        status: 'upcoming',
        noteSlug: 'generics-in-classes-data-structures',
        readTime: '10m read',
        topics: ['typescript', 'generics', 'classes', 'data-structures'],
      },
      {
        id: 'ts-5-2',
        number: '5.2',
        title: 'The keyof Type Operator: Extracting Object Keys as Unions',
        description:
          'Extracting the union of string and numeric keys from an object type: keyof Person produces "id" | "name" | "email".',
        status: 'upcoming',
        noteSlug: 'keyof-type-operator-extracting-keys',
        readTime: '09m read',
        topics: ['typescript', 'keyof', 'type-operators', 'unions'],
      },
      {
        id: 'ts-5-3',
        number: '5.3',
        title: 'The typeof Type Operator: Deriving Types from JavaScript Values',
        description:
          'Capturing the type of runtime constants, config objects, and action dictionaries into type space without writing manual interfaces.',
        status: 'upcoming',
        noteSlug: 'typeof-type-operator-deriving-types-from-values',
        readTime: '10m read',
        topics: ['typescript', 'typeof', 'type-queries', 'dry-code'],
      },
      {
        id: 'ts-5-4',
        number: '5.4',
        title: 'Indexed Access Types: Looking Up Properties with T[K]',
        description:
          'Drilling down into complex types: accessing nested properties (User["address"]["city"]) and array element types (UsersArray[number]).',
        status: 'upcoming',
        noteSlug: 'indexed-access-types-property-lookup',
        readTime: '09m read',
        topics: ['typescript', 'indexed-access', 'lookup-types', 'nested-types'],
      },
      {
        id: 'ts-5-5',
        number: '5.5',
        title: 'The Universal get Helper: Combining Generics, keyof, and Indexed Access',
        description:
          'Anatomy of function get<T, K extends keyof T>(obj: T, key: K): T[K] — how TypeScript’s type system guarantees complete key-value type safety.',
        status: 'upcoming',
        noteSlug: 'universal-get-helper-generics-keyof-indexed-access',
        readTime: '11m read',
        topics: ['typescript', 'generics', 'keyof', 'indexed-access'],
      },
      {
        id: 'ts-5-6',
        number: '5.6',
        title: 'Advanced Type-Level Awareness: Conditional, Mapped & Template Literal Types',
        description:
          'Recognizing advanced type constructs in library definitions: T extends U ? X : Y, [P in K]: T, and `on${Capitalize<string>}` without trying to author them yet.',
        status: 'upcoming',
        noteSlug: 'advanced-type-level-awareness-conditional-mapped',
        readTime: '12m read',
        topics: ['typescript', 'conditional-types', 'mapped-types', 'template-literals'],
      },
      {
        id: 'ts-5-7',
        number: '5.7',
        title: 'Module 5 Mini-Build: Typed In-Memory Store with get, set, update & pluck',
        description:
          'Construct a fully typed in-memory reactive store supporting safe key updates via Partial<T> and generic pluck operations.',
        status: 'upcoming',
        noteSlug: 'module-5-mini-build-typed-in-memory-store',
        readTime: '20m read',
        topics: ['typescript', 'hands-on', 'mini-build', 'state-store'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 6 — Classes, fast pass (Weight 4% · ~2 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ts-mod-06',
    number: '06',
    title: 'Classes, Fast Pass',
    description:
      'Goal: map your Java class knowledge onto TypeScript and note only the differences. React barely uses classes now, so keep this short (Weight 4% · ~2 hrs).',
    lessons: [
      {
        id: 'ts-6-1',
        number: '6.1',
        title: 'Fields, Constructors, and Parameter Properties',
        description:
          'Using concise constructor parameter properties (constructor(public id: string, private secret: string)) to eliminate Java boilerplate.',
        status: 'upcoming',
        noteSlug: 'class-fields-constructors-parameter-properties',
        readTime: '09m read',
        topics: ['typescript', 'classes', 'parameter-properties', 'oop'],
      },
      {
        id: 'ts-6-2',
        number: '6.2',
        title: 'Access Modifiers: public, private, protected vs JavaScript #private',
        description:
          'TypeScript compile-time access modifiers versus ECMAScript hard private fields (#field), and their respective runtime visibility.',
        status: 'upcoming',
        noteSlug: 'access-modifiers-public-private-protected-hash-private',
        readTime: '09m read',
        topics: ['typescript', 'access-modifiers', 'encapsulation', 'javascript'],
      },
      {
        id: 'ts-6-3',
        number: '6.3',
        title: 'Class Inheritance: implements, extends, and Abstract Classes',
        description:
          'Translating Java inheritance paradigms: implementing multiple interfaces, overriding methods, calling super(), and declaring abstract templates.',
        status: 'upcoming',
        noteSlug: 'class-inheritance-implements-extends-abstract',
        readTime: '10m read',
        topics: ['typescript', 'inheritance', 'abstract-classes', 'interfaces'],
      },
      {
        id: 'ts-6-4',
        number: '6.4',
        title: 'Structural Compatibility Between Classes: The Car and Golfer Puzzle',
        description:
          'Why two distinct class instances with identical public member shapes can be substituted for one another in TypeScript, unlike Java.',
        status: 'upcoming',
        noteSlug: 'structural-compatibility-between-classes',
        readTime: '10m read',
        topics: ['typescript', 'structural-typing', 'classes', 'type-compatibility'],
      },
      {
        id: 'ts-6-5',
        number: '6.5',
        title: 'What to Skip in Classes: Decorators, Mixins, and Legacy OOP in React',
        description:
          'Why modern React uses functional components and hooks instead of class inheritance, and why experimental decorators should be deferred.',
        status: 'upcoming',
        noteSlug: 'classes-what-to-skip-decorators-mixins',
        readTime: '08m read',
        topics: ['typescript', 'react', 'oop-vs-functional', 'what-to-skip'],
      },
      {
        id: 'ts-6-6',
        number: '6.6',
        title: 'Module 6 Mini-Build: Interchanging Class Instances with Domain Interfaces',
        description:
          'Convert a domain data interface into a class with parameter properties and demonstrate structural assignability in strict code.',
        status: 'upcoming',
        noteSlug: 'module-6-mini-build-interchanging-classes-interfaces',
        readTime: '15m read',
        topics: ['typescript', 'hands-on', 'mini-build', 'classes'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 7 — Modules and project setup (Weight 8% · ~3 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ts-mod-07',
    number: '07',
    title: 'Modules and Project Setup',
    description:
      'Goal: organise code into files and configure a real project so the compiler checks it the way React tooling expects (Weight 8% · ~3 hrs).',
    lessons: [
      {
        id: 'ts-7-1',
        number: '7.1',
        title: 'ES Module Syntax: Named, Default, and Wildcard Exports',
        description:
          'Mastering ES modules: export const, default export ergonomics, export * re-exports, and standard module organization conventions in React.',
        status: 'upcoming',
        noteSlug: 'es-module-syntax-named-default-wildcard-exports',
        readTime: '09m read',
        topics: ['typescript', 'modules', 'es-modules', 'exports'],
      },
      {
        id: 'ts-7-2',
        number: '7.2',
        title: 'Type-Only Imports and Exports: import type and export type',
        description:
          'Using import type and verbatimModuleSyntax to ensure types are stripped cleanly without leaving residual runtime JavaScript imports.',
        status: 'upcoming',
        noteSlug: 'type-only-imports-and-exports',
        readTime: '09m read',
        topics: ['typescript', 'import-type', 'tree-shaking', 'bundle-size'],
      },
      {
        id: 'ts-7-3',
        number: '7.3',
        title: 'File Extensions: .ts vs .tsx and the JSX Transformation',
        description:
          'When .tsx is mandatory, how the JSX compiler parses angle brackets, and avoiding parsing ambiguities with generic arrow functions (<T,>).',
        status: 'upcoming',
        noteSlug: 'file-extensions-ts-vs-tsx-jsx-transform',
        readTime: '09m read',
        topics: ['typescript', 'tsx', 'jsx', 'compiler'],
      },
      {
        id: 'ts-7-4',
        number: '7.4',
        title: 'tsconfig.json Essentials: strict, target, lib, and module',
        description:
          'Demystifying the critical tsconfig flags: target, lib, module, jsx, and the full strict family (noImplicitAny, strictNullChecks).',
        status: 'upcoming',
        noteSlug: 'tsconfig-json-essentials-strict-target-lib',
        readTime: '11m read',
        topics: ['typescript', 'tsconfig', 'configuration', 'strict-mode'],
      },
      {
        id: 'ts-7-5',
        number: '7.5',
        title: 'Bundler Settings: moduleResolution "bundler", noEmit, and verbatimModuleSyntax',
        description:
          'Configuring TypeScript for modern bundlers like Vite and Next.js where bundlers handle code generation and tsc acts solely as a type checker.',
        status: 'upcoming',
        noteSlug: 'bundler-settings-module-resolution-noemit',
        readTime: '10m read',
        topics: ['typescript', 'bundler', 'vite', 'module-resolution'],
      },
      {
        id: 'ts-7-6',
        number: '7.6',
        title: 'Scaffolding Vite React-TS & Debugging "Cannot Find Module" Errors',
        description:
          'Setting up a clean Vite + React + TS starter, configuring path aliases (@/*), and fixing common module resolution gotchas.',
        status: 'upcoming',
        noteSlug: 'scaffolding-vite-react-ts-debugging-module-resolution',
        readTime: '11m read',
        topics: ['typescript', 'vite', 'react', 'path-aliases', 'troubleshooting'],
      },
      {
        id: 'ts-7-7',
        number: '7.7',
        title: 'Module 7 Mini-Build: Multi-File Blog Types & Component Integration with tsc --noEmit',
        description:
          'Organize domain interfaces into a shared types.ts module, consume them across components, and verify a clean tsc --noEmit pass.',
        status: 'upcoming',
        noteSlug: 'module-7-mini-build-multi-file-blog-types-noemit',
        readTime: '15m read',
        topics: ['typescript', 'hands-on', 'mini-build', 'tsc-noemit'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 8 — TypeScript in React (Weight 15% · ~7 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ts-mod-08',
    number: '08',
    title: 'TypeScript in React',
    description:
      'Goal: apply everything so far to React — typed components, hooks, events, and data fetching (Weight 15% · ~7 hrs).',
    lessons: [
      {
        id: 'ts-8-1',
        number: '8.1',
        title: 'Typing Component Props: Interfaces, Optional Props, and Defaults',
        description:
          'Defining clean prop interfaces, handling optional props with destructured defaults, and why React.FC is considered unnecessary boilerplate.',
        status: 'upcoming',
        noteSlug: 'typing-component-props-interfaces-defaults',
        readTime: '11m read',
        topics: ['react', 'typescript', 'props', 'components'],
      },
      {
        id: 'ts-8-2',
        number: '8.2',
        title: 'Typing useState: Primitive State, Union States, and Lazy Initialization',
        description:
          'Inferred state vs explicit generic state (<User | null>), functional state updates, and typing lazy initializer functions.',
        status: 'upcoming',
        noteSlug: 'typing-use-state-unions-lazy-initialization',
        readTime: '10m read',
        topics: ['react', 'typescript', 'use-state', 'hooks'],
      },
      {
        id: 'ts-8-3',
        number: '8.3',
        title: 'Typing useEffect and Cleanup Functions',
        description:
          'Why effect callbacks must return void or a cleanup destructor (() => void), and why passing an async function directly causes compile errors.',
        status: 'upcoming',
        noteSlug: 'typing-use-effect-cleanup-functions',
        readTime: '09m read',
        topics: ['react', 'typescript', 'use-effect', 'cleanup'],
      },
      {
        id: 'ts-8-4',
        number: '8.4',
        title: 'Typing useRef: DOM Refs vs Mutable Value Containers',
        description:
          'The critical difference between useRef<HTMLInputElement>(null) (read-only current for DOM nodes) and useRef<number>(0) (mutable instance variables).',
        status: 'upcoming',
        noteSlug: 'typing-use-ref-dom-refs-mutable-containers',
        readTime: '11m read',
        topics: ['react', 'typescript', 'use-ref', 'dom'],
      },
      {
        id: 'ts-8-5',
        number: '8.5',
        title: 'Typing useReducer: Discriminated Union Actions and State Reducers',
        description:
          'Modeling complex component state transitions with typed action unions ({ type: "set_filter"; payload: string }) and exhaustive reducers.',
        status: 'upcoming',
        noteSlug: 'typing-use-reducer-discriminated-union-actions',
        readTime: '12m read',
        topics: ['react', 'typescript', 'use-reducer', 'discriminated-unions'],
      },
      {
        id: 'ts-8-6',
        number: '8.6',
        title: 'Typing useMemo and useCallback: Dependencies and Return Types',
        description:
          'Inference of memoized values and handler references, typing event callback arguments, and avoiding stale closures with typed dependency arrays.',
        status: 'upcoming',
        noteSlug: 'typing-use-memo-and-use-callback',
        readTime: '10m read',
        topics: ['react', 'typescript', 'use-memo', 'use-callback'],
      },
      {
        id: 'ts-8-7',
        number: '8.7',
        title: 'Typing DOM & Form Events: ChangeEvent, MouseEvent, and FormEvent',
        description:
          'Typing HTML event handlers accurately: React.ChangeEvent<HTMLInputElement>, React.MouseEvent<HTMLButtonElement>, and React.FormEvent.',
        status: 'upcoming',
        noteSlug: 'typing-dom-form-events-change-mouse-submit',
        readTime: '11m read',
        topics: ['react', 'typescript', 'events', 'forms'],
      },
      {
        id: 'ts-8-8',
        number: '8.8',
        title: 'Typing Children: React.ReactNode vs React.ReactElement',
        description:
          'Understanding the React component hierarchy: why children: React.ReactNode is the standard for wrapper components and slots.',
        status: 'upcoming',
        noteSlug: 'typing-children-react-node-vs-react-element',
        readTime: '09m read',
        topics: ['react', 'typescript', 'children', 'react-node'],
      },
      {
        id: 'ts-8-9',
        number: '8.9',
        title: 'Generic Components: Building a Typed List<T> and Dropdown<T>',
        description:
          'Authoring components that accept arbitrary data arrays and render items with full type inference: function List<T>({ items, renderItem }).',
        status: 'upcoming',
        noteSlug: 'generic-components-typed-list-and-dropdown',
        readTime: '12m read',
        topics: ['react', 'typescript', 'generic-components', 'ui-patterns'],
      },
      {
        id: 'ts-8-10',
        number: '8.10',
        title: 'Typing Async API Data: Fetch Responses and Discriminated UI States',
        description:
          'Connecting backend contracts to UI states: typing fetch results, narrowing loading/success/error discriminated states in component renders.',
        status: 'upcoming',
        noteSlug: 'typing-async-api-data-fetch-responses-discriminated-states',
        readTime: '12m read',
        topics: ['react', 'typescript', 'data-fetching', 'async-ui'],
      },
      {
        id: 'ts-8-11',
        number: '8.11',
        title: 'Typing React Context: createContext and the Undefined Default Dilemma',
        description:
          'Solving the undefined default value problem in createContext<T | undefined>(undefined) with a custom useAuth() validation hook.',
        status: 'upcoming',
        noteSlug: 'typing-react-context-undefined-default-dilemma',
        readTime: '11m read',
        topics: ['react', 'typescript', 'context-api', 'custom-hooks'],
      },
      {
        id: 'ts-8-12',
        number: '8.12',
        title: 'Utility Component Types: ComponentProps, ComponentPropsWithoutRef, and JSX.Element',
        description:
          'Building polymorphic UI controls that mirror native HTML button/input attributes without retyping standard DOM properties.',
        status: 'upcoming',
        noteSlug: 'utility-component-types-component-props-without-ref',
        readTime: '10m read',
        topics: ['react', 'typescript', 'component-props', 'polymorphism'],
      },
      {
        id: 'ts-8-13',
        number: '8.13',
        title: 'Module 8 Mini-Build: Searchable List App with Public API, Forms & Zero any',
        description:
          'Assemble a complete typed React micro-application: public API fetch, typed state machine, generic list rendering, and typed form submission.',
        status: 'upcoming',
        noteSlug: 'module-8-mini-build-searchable-list-app',
        readTime: '25m read',
        topics: ['react', 'typescript', 'hands-on', 'mini-build'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 9 — Utility types (Weight 6% · ~3 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ts-mod-09',
    number: '09',
    title: 'Utility Types',
    description:
      'Goal: use the ten built-in utility types that replace most hand-written type gymnastics in React code (Weight 6% · ~3 hrs).',
    lessons: [
      {
        id: 'ts-9-1',
        number: '9.1',
        title: 'Shaping Object Types: Partial<T> for Form Edits and Drafts',
        description:
          'Constructing types where all properties are optional: drafting form inputs, patch payloads, and state updates.',
        status: 'upcoming',
        noteSlug: 'utility-types-partial-form-edits-drafts',
        readTime: '09m read',
        topics: ['typescript', 'utility-types', 'partial', 'forms'],
      },
      {
        id: 'ts-9-2',
        number: '9.2',
        title: 'Shaping Object Types: Required<T> and Readonly<T>',
        description:
          'Making all properties mandatory with Required<T>, and preventing state mutation bugs using Readonly<T> on immutable configurations.',
        status: 'upcoming',
        noteSlug: 'utility-types-required-and-readonly',
        readTime: '08m read',
        topics: ['typescript', 'utility-types', 'required', 'readonly'],
      },
      {
        id: 'ts-9-3',
        number: '9.3',
        title: 'Picking and Omitting Properties: Pick<T, K> and Omit<T, K>',
        description:
          'Slicing object types for lightweight UI previews (Pick<User, "id" | "name">) and stripping unwanted props (Omit<ButtonProps, "onClick">).',
        status: 'upcoming',
        noteSlug: 'utility-types-pick-and-omit',
        readTime: '10m read',
        topics: ['typescript', 'utility-types', 'pick', 'omit'],
      },
      {
        id: 'ts-9-4',
        number: '9.4',
        title: 'Dictionary Collections: Record<K, V> for Maps and Caches',
        description:
          'Typing key-value lookup dictionaries, permission maps, and local caches: Record<string, User> and Record<Status, ColorBadge>.',
        status: 'upcoming',
        noteSlug: 'utility-types-record-maps-caches',
        readTime: '09m read',
        topics: ['typescript', 'utility-types', 'record', 'dictionaries'],
      },
      {
        id: 'ts-9-5',
        number: '9.5',
        title: 'Shaping Union Types: Exclude<T, U> and Extract<T, U>',
        description:
          'Refining unions by filtering out unwanted variants (Exclude<Status, "archived">) or extracting shared subtypes (Extract<Event, ClickEvent>).',
        status: 'upcoming',
        noteSlug: 'utility-types-exclude-and-extract',
        readTime: '09m read',
        topics: ['typescript', 'utility-types', 'exclude', 'extract', 'unions'],
      },
      {
        id: 'ts-9-6',
        number: '9.6',
        title: 'Null Removal: NonNullable<T>',
        description:
          'Stripping null and undefined from an input type: ensuring API response fields are strictly present before passing to UI renderers.',
        status: 'upcoming',
        noteSlug: 'utility-types-non-nullable',
        readTime: '08m read',
        topics: ['typescript', 'utility-types', 'non-nullable', 'null-safety'],
      },
      {
        id: 'ts-9-7',
        number: '9.7',
        title: 'Function & Promise Reflection: ReturnType<T>, Parameters<T>, and Awaited<T>',
        description:
          'Extracting return values and parameter tuples from functions, and unwrapping nested async promise types with Awaited<ReturnType<typeof fetchUsers>>.',
        status: 'upcoming',
        noteSlug: 'utility-types-return-type-parameters-awaited',
        readTime: '11m read',
        topics: ['typescript', 'utility-types', 'return-type', 'awaited', 'reflection'],
      },
      {
        id: 'ts-9-8',
        number: '9.8',
        title: 'Decision Matrix: Built-in Utility Types vs Hand-Written Custom Types',
        description:
          'When to use built-in utility types versus when custom handwritten interfaces yield clearer error messages and better maintainability.',
        status: 'upcoming',
        noteSlug: 'decision-matrix-utility-types-vs-custom-handwritten',
        readTime: '09m read',
        topics: ['typescript', 'utility-types', 'architecture', 'best-practices'],
      },
      {
        id: 'ts-9-9',
        number: '9.9',
        title: 'Module 9 Mini-Build: Refactoring React App Types with Built-In Utilities',
        description:
          'Refactor an existing typed codebase to eliminate redundant interface declarations using Partial, Pick, Record, and Awaited.',
        status: 'upcoming',
        noteSlug: 'module-9-mini-build-refactoring-react-types-utilities',
        readTime: '18m read',
        topics: ['typescript', 'hands-on', 'mini-build', 'refactoring'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 10 — Capstone project & Beyond (No new reading · ~6 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ts-mod-10',
    number: '10',
    title: 'Capstone Project & Beyond',
    description:
      'Goal: prove the syllabus is absorbed by shipping one complete typed React app, with no tutorial to copy from, and knowing what to skip vs learn next (Weight ~6 hrs).',
    lessons: [
      {
        id: 'ts-10-1',
        number: '10.1',
        title: 'Capstone Project Architecture & Requirements: Typed Task Manager',
        description:
          'Project blueprint: Task and User domain interfaces, discriminated union state machines, API integration, and complete application specification.',
        status: 'upcoming',
        noteSlug: 'capstone-project-typed-task-manager-architecture',
        readTime: '12m read',
        topics: ['capstone', 'typescript', 'react', 'project-architecture'],
      },
      {
        id: 'ts-10-2',
        number: '10.2',
        title: 'Implementing Typed State & Custom Hooks for the Task Manager',
        description:
          'Authoring typed useState, useEffect data synchronization, useRef input focus controllers, and useMemo filter computation.',
        status: 'upcoming',
        noteSlug: 'capstone-project-implementing-typed-state-hooks',
        readTime: '15m read',
        topics: ['capstone', 'react', 'typescript', 'hooks'],
      },
      {
        id: 'ts-10-3',
        number: '10.3',
        title: 'Implementing Generic UI Components & Typed Form Event Handlers',
        description:
          'Writing the generic List<T> component, typed dropdown filters, form submit handlers with input validation, and task detail inspection.',
        status: 'upcoming',
        noteSlug: 'capstone-project-generic-components-event-handlers',
        readTime: '15m read',
        topics: ['capstone', 'react', 'typescript', 'generic-components', 'forms'],
      },
      {
        id: 'ts-10-4',
        number: '10.4',
        title: 'Passing strict Mode & The Extensibility Test: Adding New Features Safely',
        description:
          'Verifying zero any under strict mode, passing tsc --noEmit, and proving maintainability by adding task sorting driven entirely by compiler errors.',
        status: 'upcoming',
        noteSlug: 'capstone-project-strict-mode-extensibility-test',
        readTime: '15m read',
        topics: ['capstone', 'strict-mode', 'type-driven-development', 'tsc-noemit'],
      },
      {
        id: 'ts-10-5',
        number: '10.5',
        title: 'What to Skip for Now: Decorators, Namespaces, Enums, and Deep Metaprogramming',
        description:
          'Strategic omissions: why string union literals beat numeric enums, why namespaces and decorators wait, and avoiding premature type gymnastics.',
        status: 'upcoming',
        noteSlug: 'typescript-what-to-skip-decorators-namespaces-enums',
        readTime: '10m read',
        topics: ['typescript', 'what-to-skip', 'enums', 'decorators', 'best-practices'],
      },
      {
        id: 'ts-10-6',
        number: '10.6',
        title: 'After the Syllabus: TanStack Query, Typed State Management & Real-World Habits',
        description:
          'Next steps in your frontend journey: adopting TanStack Query for typed server state, typed state management (Zustand/Redux), and daily Handbook lookup habits.',
        status: 'upcoming',
        noteSlug: 'after-the-syllabus-react-query-typed-state-next-steps',
        readTime: '11m read',
        topics: ['typescript', 'react', 'tanstack-query', 'learning-roadmap'],
      },
    ],
  },
];

export const typescriptPath: LearningPath = {
  id: 'typescript',
  slug: 'typescript',
  title: 'TypeScript Syllabus for React',
  description:
    'The TypeScript you need to read and write real React code — in the right order, with the right articles, and nothing extra on the first pass. Designed for Java developers transitioning to modern typed frontend engineering.',
  subjectSlug: 'typescript',
  icon: 'data_object',
  level: 'Intermediate',
  estimatedDuration: '11 Modules • 93 Lessons',
  modules: typescriptModules,
};
