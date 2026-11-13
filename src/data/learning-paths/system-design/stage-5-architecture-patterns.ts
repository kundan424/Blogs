import { LearningModule } from '../../../types';

export const stage5Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // 5.0 Monolith vs Microservices
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-5-0',
    number: '5.0',
    title: 'Monolith vs Microservices',
    description: 'When to split, and where.',
    lessons: [
      {
        id: 'sd-5-0-1',
        number: '5.0.1',
        title: 'Monolith vs microservices',
        noteSlug: 'monolith-vs-microservices',
        description: 'Single deployable unit simplicity vs independent deployment velocities, operational tax, distributed debugging, and network latency.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['monolith', 'microservices', 'architecture', 'trade-offs'],
      },
      {
        id: 'sd-5-0-2',
        number: '5.0.2',
        title: 'Service boundaries with DDD',
        noteSlug: 'service-boundaries-with-ddd',
        description: 'Domain-Driven Design: Bounded Contexts, ubiquitous language, aggregate roots, and preventing distributed monolith anti-patterns.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['ddd', 'bounded-context', 'microservices', 'domain-modeling'],
      },
      {
        id: 'sd-5-0-3',
        number: '5.0.3',
        title: 'Choosing a style',
        noteSlug: 'choosing-an-architecture-style',
        description: 'Modular monoliths, microservices, serverless, or event-driven: matching architecture to team size and organizational maturity.',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['architecture-selection', 'conways-law', 'team-topology', 'system-design'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 5.1 Event-Driven Architecture
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-5-1',
    number: '5.1',
    title: 'Event-Driven Architecture',
    description: 'Services that react instead of call.',
    lessons: [
      {
        id: 'sd-5-1-1',
        number: '5.1.1',
        title: 'Event-driven architecture',
        noteSlug: 'event-driven-architecture',
        description: 'Inversion of communication: event producers notify without caring who listens; temporal decoupling and high throughput.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['event-driven', 'eda', 'messaging', 'architecture'],
      },
      {
        id: 'sd-5-1-2',
        number: '5.1.2',
        title: 'Choreography vs orchestration',
        noteSlug: 'choreography-vs-orchestration',
        description: 'Decentralized choreography (services react to peer events) vs centralized orchestration (workflow engine directs step-by-step).',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['choreography', 'orchestration', 'sagas', 'temporal'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 5.2 CQRS
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-5-2',
    number: '5.2',
    title: 'CQRS',
    description: 'Separate models for reads and writes.',
    lessons: [
      {
        id: 'sd-5-2-1',
        number: '5.2.1',
        title: 'CQRS',
        noteSlug: 'cqrs',
        description: 'Command Query Responsibility Segregation: separating state-altering commands from view queries with independent data models.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['cqrs', 'architecture', 'read-write-split', 'ddd'],
      },
      {
        id: 'sd-5-2-2',
        number: '5.2.2',
        title: 'Scaling reads',
        noteSlug: 'scaling-reads',
        description: 'Projecting normalized writes into denormalized read-optimized materialized views, Redis caches, and Elasticsearch indexes.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['cqrs', 'read-projections', 'materialized-views', 'performance'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 5.3 Event Sourcing
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-5-3',
    number: '5.3',
    title: 'Event Sourcing',
    description: 'Store what happened, derive the rest.',
    lessons: [
      {
        id: 'sd-5-3-1',
        number: '5.3.1',
        title: 'Event sourcing',
        noteSlug: 'event-sourcing',
        description: 'Storing state as an immutable sequence of business events rather than mutating current database rows; ledger auditability.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['event-sourcing', 'immutable-ledger', 'audit', 'distributed-systems'],
      },
      {
        id: 'sd-5-3-2',
        number: '5.3.2',
        title: 'Snapshots and replays',
        noteSlug: 'snapshots-and-replays',
        description: 'Accelerating state reconstitution with periodic aggregate snapshots, replaying events for bug reproduction and schema evolution.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['event-sourcing', 'snapshots', 'replayability', 'eventstore'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 5.4 Serverless
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-5-4',
    number: '5.4',
    title: 'Serverless',
    description: 'No servers to run, other limits to respect.',
    lessons: [
      {
        id: 'sd-5-4-1',
        number: '5.4.1',
        title: 'Serverless',
        noteSlug: 'serverless',
        description: 'FaaS (AWS Lambda, Google Cloud Functions): event triggers, instant autoscaling to zero, pay-per-request pricing, and cold starts.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['serverless', 'lambda', 'cloud', 'faas'],
      },
      {
        id: 'sd-5-4-2',
        number: '5.4.2',
        title: 'Long-running jobs',
        noteSlug: 'long-running-jobs',
        description: 'Overcoming execution timeout limits (15-min Lambda ceiling), containerized tasks (AWS ECS/Fargate), and async job batching.',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['serverless', 'batch-jobs', 'fargate', 'containers'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 5.5 Backend for Frontend
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-5-5',
    number: '5.5',
    title: 'Backend for Frontend',
    description: 'One backend per client shape.',
    lessons: [
      {
        id: 'sd-5-5-1',
        number: '5.5.1',
        title: 'BFF and composition',
        noteSlug: 'bff-and-composition',
        description: 'Dedicated edge adaptors for iOS, Android, Desktop Web, and IoT; optimizing payload size, network round-trips, and client battery.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['bff', 'api-composition', 'mobile', 'web-performance'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 5.6 Strangler Fig
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-5-6',
    number: '5.6',
    title: 'Strangler Fig',
    description: 'Replacing a legacy system piece by piece.',
    lessons: [
      {
        id: 'sd-5-6-1',
        number: '5.6.1',
        title: 'Strangler fig',
        noteSlug: 'strangler-fig',
        description: 'Iterative migration: routing incremental traffic to new microservices at the reverse proxy while the legacy monolith shrinks.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['strangler-fig', 'legacy-migration', 'modernization', 'refactoring'],
      },
      {
        id: 'sd-5-6-2',
        number: '5.6.2',
        title: 'Online migrations',
        noteSlug: 'online-migrations',
        description: 'Zero-downtime database and system migrations: dual writing, backfilling, shadow reading, and atomic traffic cutover.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['online-migration', 'dual-write', 'shadow-traffic', 'zero-downtime'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 5.7 Hexagonal and Clean Architecture
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-5-7',
    number: '5.7',
    title: 'Hexagonal and Clean Architecture',
    description: 'Keeping the core free of frameworks.',
    lessons: [
      {
        id: 'sd-5-7-1',
        number: '5.7.1',
        title: 'Ports and adapters',
        noteSlug: 'ports-and-adapters',
        description: 'Isolating pure business domain entities from external databases, HTTP frameworks, and message queues using interfaces.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['hexagonal-architecture', 'ports-and-adapters', 'clean-code', 'ddd'],
      },
      {
        id: 'sd-5-7-2',
        number: '5.7.2',
        title: 'Clean architecture layers',
        noteSlug: 'clean-architecture-layers',
        description: 'Dependency rule: source code dependencies only point inward toward business rules; testability without DB mocks.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['clean-architecture', 'dependency-inversion', 'solid', 'architecture'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 5.8 Multi-Region Architecture
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-5-8',
    number: '5.8',
    title: 'Multi-Region Architecture',
    description: 'Serving the world, surviving a region.',
    lessons: [
      {
        id: 'sd-5-8-1',
        number: '5.8.1',
        title: 'Multi-region and active-active',
        noteSlug: 'multi-region-and-active-active',
        description: 'Active-active multi-region deployment, latency reduction, cross-region replication, and failover during total cloud region outages.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['multi-region', 'active-active', 'disaster-recovery', 'cloud'],
      },
      {
        id: 'sd-5-8-2',
        number: '5.8.2',
        title: 'Cell-based architecture',
        noteSlug: 'cell-based-architecture',
        description: 'Partitioning entire systems into isolated, self-contained "cells" (e.g. AWS Availability Zone or customer shard) to contain blast radius.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['cell-based-architecture', 'blast-radius', 'fault-isolation', 'scale'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 5.9 Multi-Tenancy
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-5-9',
    number: '5.9',
    title: 'Multi-Tenancy',
    description: 'Many customers, one platform.',
    lessons: [
      {
        id: 'sd-5-9-1',
        number: '5.9.1',
        title: 'Silo, pool and bridge',
        noteSlug: 'silo-pool-and-bridge',
        description: 'Tenant isolation models: Silo (dedicated compute/storage) vs Pool (fully shared infrastructure) vs Bridge (hybrid tiers).',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['multi-tenancy', 'saas', 'silo-pool', 'architecture'],
      },
      {
        id: 'sd-5-9-2',
        number: '5.9.2',
        title: 'Control plane vs data plane',
        noteSlug: 'control-plane-vs-data-plane',
        description: 'Separating tenant onboarding, provisioning, and billing (control plane) from low-latency user request execution (data plane).',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['control-plane', 'data-plane', 'saas', 'system-design'],
      },
      {
        id: 'sd-5-9-3',
        number: '5.9.3',
        title: 'Isolating tenant data',
        noteSlug: 'isolating-tenant-data',
        description: 'Row-level security (PostgreSQL RLS), tenant-per-schema, tenant-per-database, and preventing cross-tenant data leaks.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['tenant-isolation', 'security', 'row-level-security', 'compliance'],
      },
      {
        id: 'sd-5-9-4',
        number: '5.9.4',
        title: 'Noisy neighbours',
        noteSlug: 'noisy-neighbours',
        description: 'Preventing one heavy tenant from starving CPU/DB resources: tenant-level rate limiting, tier quotas, and dedicated worker pools.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['noisy-neighbors', 'rate-limiting', 'fair-sharing', 'saas'],
      },
      {
        id: 'sd-5-9-5',
        number: '5.9.5',
        title: 'Metering and billing',
        noteSlug: 'metering-and-billing',
        description: 'Usage aggregation, Stripe/Metronome integration, real-time event counting, and audit-grade financial billing engines.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['billing-engine', 'metering', 'fintech', 'saas'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 5.10 CRDT Applications
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-5-10',
    number: '5.10',
    title: 'CRDT Applications',
    description: 'Yjs, Automerge and local-first software.',
    lessons: [
      {
        id: 'sd-5-10-1',
        number: '5.10.1',
        title: 'Yjs and Automerge',
        noteSlug: 'yjs-and-automerge',
        description: 'High-performance CRDT libraries in production: memory footprint, binary format compression, and peer-to-peer WebRTC sync.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['crdt', 'yjs', 'automerge', 'local-first'],
      },
      {
        id: 'sd-5-10-2',
        number: '5.10.2',
        title: 'Local-first software',
        noteSlug: 'local-first-software',
        description: 'User data stored locally on device, offline-ready instant interactions, and background multi-device syncing.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['local-first', 'offline-first', 'p2p', 'crdt'],
      },
      {
        id: 'sd-5-10-3',
        number: '5.10.3',
        title: 'Design Google Docs',
        noteSlug: 'design-google-docs',
        description: 'Interview blueprint: designing real-time collaborative document editing with Operational Transformation (OT) vs CRDTs.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['system-design', 'interview-guide', 'google-docs', 'collaborative-editing'],
      },
    ],
  },
];
