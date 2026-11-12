import { LearningPath } from '../../types';

export const microservicesPath: LearningPath = {
  id: 'production-microservices-distributed-architecture',
  slug: 'production-microservices-distributed-architecture',
  title: 'Production Microservices & Distributed Architecture',
  description:
    'Architectural principles for resilient microservices: bounded contexts, multi-tenant database partitioning, distributed consensus, and idempotent event streams.',
  subjectSlug: 'backend-distributed-systems',
  icon: 'hub',
  level: 'Advanced',
  estimatedDuration: '2 Modules • 5 Lessons',
  modules: [
    {
      id: 'ms-mod-01',
      number: '01',
      title: 'Service Boundaries & Multi-Tenancy',
      description:
        'Domain decomposition, tenancy models, and database isolation strategies.',
      lessons: [
        {
          id: 'ms-1-1',
          number: '1.1',
          title: 'Multi-Tenant Database Isolation in SaaS',
          description:
            'Comparative architectural analysis of Database-per-tenant, Schema-per-tenant, and Discriminator Column isolation.',
          status: 'published',
          noteSlug: 'designing-multi-tenant-database-isolation-saas',
          readTime: '12m read',
          topics: ['saas', 'postgresql', 'distributed-systems'],
        },
        {
          id: 'ms-1-2',
          number: '1.2',
          title: 'Strangler Fig Migration: Decomposing the Monolith',
          description:
            'Incremental edge interception, schema replication pipelines, and zero-downtime service extraction.',
          status: 'upcoming',
          readTime: '10m read',
          topics: ['microservices', 'system-design', 'refactoring'],
        },
      ],
    },
    {
      id: 'ms-mod-02',
      number: '02',
      title: 'Ingress, Distributed Transactions & Resilience',
      description:
        'API gateway topology, outbox CDC streaming, and compensating distributed sagas.',
      lessons: [
        {
          id: 'ms-2-1',
          number: '2.1',
          title: 'API Gateway Routing, Rate Limiting & Circuit Breakers',
          description:
            'Token bucket rate-limiting algorithms, Envoy filter chains, and Resilience4j state machines.',
          status: 'upcoming',
          readTime: '11m read',
          topics: ['microservices', 'api-gateway', 'resilience'],
        },
        {
          id: 'ms-2-2',
          number: '2.2',
          title: 'Transactional Outbox Pattern with Kafka CDC',
          description:
            'Eliminating two-phase commit (2PC) using Postgres WAL tailing and Debezium for at-least-once message delivery.',
          status: 'upcoming',
          readTime: '14m read',
          topics: ['kafka', 'distributed-systems', 'wal'],
        },
        {
          id: 'ms-2-3',
          number: '2.3',
          title: 'Distributed Sagas: Orchestration vs Choreography',
          description:
            'Compensating transactions, temporal deadlocks, and event storming for distributed consistency.',
          status: 'upcoming',
          readTime: '12m read',
          topics: ['distributed-systems', 'saga', 'microservices'],
        },
      ],
    },
  ],
};
