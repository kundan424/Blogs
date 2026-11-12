import { LearningModule } from '../../../types';

export const phase5Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // PHASE 5: TRANSITIONING TO MICROSERVICES & DOMAIN DESIGN
  // -----------------------------------------------------------------------
  {
    id: 'sb-mod-21',
    number: '21',
    title: 'Monolith vs. Microservices Architectural Trade-offs',
    description:
      'Modular monolith design, distributed computing fallacies, organizational coupling, and service extraction criteria.',
    lessons: [
      {
        id: 'sb-21-1',
        number: '21.1',
        title: 'Modular Monoliths vs Microservices & The Fallacies of Distributed Computing',
        description:
          'When microservices are the wrong choice, modular boundaries with Spring Modulith, and the 8 Fallacies of Distributed Computing (latency is not zero, network is unreliable).',
        status: 'upcoming',
        readTime: '11m read',
        topics: ['architecture', 'microservices', 'modular-monolith'],
      },
    ],
  },
  {
    id: 'sb-mod-22',
    number: '22',
    title: 'Domain-Driven Design (DDD) Fundamentals',
    description:
      'Strategic domain modeling, ubiquitous language, bounded contexts, and preventing distributed monoliths.',
    lessons: [
      {
        id: 'sb-22-1',
        number: '22.1',
        title: 'Strategic DDD: Bounded Contexts, Ubiquitous Language & Context Mapping',
        description:
          'Decomposing enterprise domains: identifying core, supporting, and generic subdomains, establishing context boundaries, and defining upstream/downstream context maps.',
        status: 'upcoming',
        readTime: '12m read',
        topics: ['ddd', 'domain-driven-design', 'system-design'],
      },
      {
        id: 'sb-22-2',
        number: '22.2',
        title: 'Subdomain Classification & Preventing the Distributed Monolith Anti-Pattern',
        description:
          'Identifying anti-patterns: shared domain models, synchronized lockstep deployments, and chatty inter-service synchronous dependency webs.',
        status: 'upcoming',
        readTime: '10m read',
        topics: ['anti-patterns', 'microservices', 'architecture'],
      },
    ],
  },
  {
    id: 'sb-mod-23',
    number: '23',
    title: 'Database per Microservice & Data Boundaries',
    description:
      'Service data isolation, multi-tenancy models, and eventual consistency across distributed boundaries.',
    lessons: [
      {
        id: 'sb-23-1',
        number: '23.1',
        title: 'Service Autonomy & Multi-Tenant Database Isolation Strategies',
        description:
          'Why microservices must never share a database, comparative analysis of Database-per-tenant, Schema-per-tenant, and Column Discriminator models.',
        status: 'published',
        noteSlug: 'designing-multi-tenant-database-isolation-saas',
        readTime: '12m read',
        topics: ['microservices', 'database', 'multi-tenancy', 'saas'],
      },
      {
        id: 'sb-23-2',
        number: '23.2',
        title: 'Distributed Data Synchronization & Consistency Challenges',
        description:
          'Embracing eventual consistency: eliminating distributed database foreign keys, asynchronous replication streams, and event-driven data hydration.',
        status: 'upcoming',
        readTime: '11m read',
        topics: ['distributed-systems', 'eventual-consistency', 'database'],
      },
    ],
  },
];
