import { LearningModule } from '../../../types';

export const stage5Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // STAGE 5: ASYNCHRONOUS PROCESSING & EVENT-DRIVEN ARCHITECTURE
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-11',
    number: '11',
    title: 'Async Tier — Queues vs Distributed Event Streams',
    description:
      'Eliminating fragile synchronous HTTP chains, point-to-point worker queues with RabbitMQ/SQS, and distributed commit logs with Apache Kafka.',
    lessons: [
      {
        id: 'sd-11-1',
        number: '11.1',
        title: 'The Fragility of Synchronous Chains: Decoupling Systems in Time and Space',
        noteSlug: 'the-fragility-of-synchronous-chains-decoupling-in-time-and-space',
        description:
          'Cascading latency in synchronous HTTP chains, temporal and spatial coupling, and returning HTTP 200 in 5ms via asynchronous event emission.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['async', 'event-driven', 'microservices', 'architecture'],
      },
      {
        id: 'sd-11-2',
        number: '11.2',
        title: 'Point-to-Point Work Queues: RabbitMQ / SQS Message Lifecycle & Acks',
        noteSlug: 'point-to-point-work-queues-rabbitmq-and-sqs-message-lifecycle',
        description:
          'Work queue topology, producer-consumer semantics, message ACKs and NACKs, competing consumers, and message destruction upon consumption.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['rabbitmq', 'sqs', 'message-queues', 'amqp', 'worker-threads'],
      },
      {
        id: 'sd-11-3',
        number: '11.3',
        title: 'Distributed Event Streams: Apache Kafka Append-Only Commit Log Architecture',
        noteSlug: 'distributed-event-streams-apache-kafka-append-only-commit-log',
        description:
          'Why event streaming differs from queues: immutable append-only commit logs on disk, multi-subscriber fan-out, and replaying events from offset zero.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['kafka', 'event-streaming', 'pub-sub', 'commit-log'],
      },
    ],
  },
  {
    id: 'sd-mod-12',
    number: '12',
    title: 'Async Tier — Kafka Deep Dive, Delivery Guarantees & Idempotency',
    description:
      'Apache Kafka topic partitions, consumer group rebalancing, message delivery guarantees, consumer idempotency, and Dead Letter Queues (DLQ).',
    lessons: [
      {
        id: 'sd-12-1',
        number: '12.1',
        title: 'Apache Kafka Internals: Topics, Partitions, Offsets & OS Page Cache Sequential I/O',
        noteSlug: 'apache-kafka-internals-topics-partitions-offsets-and-sequential-io',
        description:
          'Horizontal stream scaling via partitions, sequential disk I/O performance, Linux page cache utilization, and zero-copy network transfer with sendfile.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['kafka-internals', 'partitions', 'offsets', 'disk-io', 'zero-copy'],
      },
      {
        id: 'sd-12-2',
        number: '12.2',
        title: 'Scaling Consumers: Consumer Groups, Rebalancing & Partition Assignment',
        noteSlug: 'scaling-consumers-consumer-groups-rebalancing-and-partition-assignment',
        description:
          'Consumer group scaling rules, eager vs cooperative sticky rebalancing, partition re-assignment protocols, and consumer lag telemetry.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['consumer-groups', 'rebalancing', 'kafka-scaling', 'monitoring'],
      },
      {
        id: 'sd-12-3',
        number: '12.3',
        title: 'Message Delivery Guarantees & Consumer Idempotency (f(f(x)) = f(x))',
        noteSlug: 'message-delivery-guarantees-and-consumer-idempotency',
        description:
          'At-most-once vs at-least-once vs exactly-once semantics, duplicate message risks, and implementing idempotent consumers using client keys and DB constraints.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['idempotency', 'delivery-guarantees', 'data-integrity', 'kafka'],
      },
      {
        id: 'sd-12-4',
        number: '12.4',
        title: 'Poison-Pill Handling: Dead Letter Queues (DLQ) & Exponential Backoff Retries',
        noteSlug: 'poison-pill-handling-dead-letter-queues-and-exponential-backoff',
        description:
          'Isolating poisoned payloads that cause infinite worker crash loops, retry topics with graduated backoff, and DLQ operational recovery pipelines.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['dlq', 'dead-letter-queue', 'error-handling', 'resilience'],
      },
    ],
  },
];
