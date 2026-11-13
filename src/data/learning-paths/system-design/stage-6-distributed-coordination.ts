import { LearningModule } from '../../../types';

export const stage6Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // STAGE 6: DISTRIBUTED COORDINATION, TRANSACTIONS & SAGAS
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-13',
    number: '13',
    title: 'Coordination Tier — Distributed Transactions & Sagas',
    description:
      'Why Two-Phase Commit fails at scale, compensating transactions in the Saga pattern, and decentralized choreography vs centralized orchestration.',
    lessons: [
      {
        id: 'sd-13-1',
        number: '13.1',
        title: 'The Death of Two-Phase Commit (2PC) at Scale: Blocking Latency & Resource Starvation',
        noteSlug: 'the-death-of-two-phase-commit-at-scale-blocking-latency',
        description:
          'Phase 1 prepare and Phase 2 commit mechanics, coordinator crash vulnerabilities, and why long-held distributed locks freeze entire clusters.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['two-phase-commit', '2pc', 'distributed-transactions', 'concurrency'],
      },
      {
        id: 'sd-13-2',
        number: '13.2',
        title: 'The Saga Pattern: Distributed Transactions via Local Commits & Compensating Actions',
        noteSlug: 'the-saga-pattern-local-commits-and-compensating-actions',
        description:
          'Decomposing distributed workflows into local database transactions, forward vs backward recovery, and designing compensating undo actions.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['saga-pattern', 'eventual-consistency', 'compensation', 'microservices'],
      },
      {
        id: 'sd-13-3',
        number: '13.3',
        title: 'Saga Architectures: Decentralized Choreography vs Centralized Orchestration',
        noteSlug: 'saga-architectures-decentralized-choreography-vs-centralized-orchestration',
        description:
          'Event-driven reactive choreography vs centralized state machines with Temporal and AWS Step Functions; avoiding event spaghetti at enterprise scale.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['orchestration', 'choreography', 'temporal', 'step-functions', 'workflow-engine'],
      },
    ],
  },
  {
    id: 'sd-mod-14',
    number: '14',
    title: 'Coordination Tier — The Dual-Write Problem, Outbox & CQRS',
    description:
      'The dual-write race condition, atomic outbox persistence with Change Data Capture (Debezium), and splitting command and query models via CQRS.',
    lessons: [
      {
        id: 'sd-14-1',
        number: '14.1',
        title: 'The Dual-Write Problem: Why Database Updates and Message Publishes Diverge',
        noteSlug: 'the-dual-write-problem-why-database-and-broker-diverge',
        description:
          'The fatal race condition between database commit and message broker publish; analyzing split-brain scenarios where events are lost or phantom data is emitted.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['dual-write', 'distributed-systems', 'race-conditions', 'data-integrity'],
      },
      {
        id: 'sd-14-2',
        number: '14.2',
        title: 'The Transactional Outbox Pattern & Change Data Capture (CDC with Debezium)',
        noteSlug: 'the-transactional-outbox-pattern-and-change-data-capture',
        description:
          'Inserting outbound events into an outbox table in the same local ACID transaction; tailing the database WAL with Debezium for guaranteed delivery.',
        status: 'upcoming',
        readTime: '26m read',
        topics: ['transactional-outbox', 'cdc', 'debezium', 'wal', 'kafka'],
      },
      {
        id: 'sd-14-3',
        number: '14.3',
        title: 'Command Query Responsibility Segregation (CQRS): Splitting Write & Read Models',
        noteSlug: 'command-query-responsibility-segregation-cqrs-splitting-models',
        description:
          'Optimizing normalized relational write models for transactional integrity while syncing denormalized query stores (Elasticsearch/Redis) for sub-5ms lookups.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['cqrs', 'read-models', 'write-models', 'elasticsearch', 'redis'],
      },
    ],
  },
];
