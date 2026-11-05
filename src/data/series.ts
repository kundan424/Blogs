import { Series } from '../types';

export const seriesList: Series[] = [
  {
    id: 'multi-tenant-saas-gateway',
    slug: 'multi-tenant-saas-gateway',
    title: 'Building a Multi-Tenant SaaS API Gateway',
    description: 'End-to-end production architecture walk-through from auth edge proxies to tenant shard routing.',
    currentPart: 3,
    totalParts: 4,
    progressPercent: 75,
    steps: [
      {
        number: 1,
        title: '1. JWT Validation & Token Exchange',
        status: 'completed',
        meta: 'Published • 12m read',
        slug: 'jwt-validation-token-exchange',
      },
      {
        number: 2,
        title: '2. Distributed Rate Limiting Engine',
        status: 'completed',
        meta: 'Published • 15m read',
        slug: 'distributed-rate-limiting-engine',
      },
      {
        number: 3,
        title: '3. Tenant Context Routing & Upstreams',
        status: 'current',
        meta: 'Currently Reading',
        slug: 'tenant-context-routing-upstreams',
      },
      {
        number: 4,
        title: '4. Observability & Distributed Tracing',
        status: 'upcoming',
        meta: 'Next Chapter',
      },
    ],
  },
  {
    id: 'spring-boot-high-throughput',
    slug: 'spring-boot-high-throughput',
    title: 'Spring Boot High-Throughput Patterns',
    description: 'Techniques for driving 50k+ req/sec on single JVM instances with virtual threads and zero allocation.',
    currentPart: 2,
    totalParts: 5,
    progressPercent: 40,
    steps: [
      {
        number: 1,
        title: '1. Virtual Threads vs WebFlux Reactive Benchmarks',
        status: 'completed',
        meta: 'Published • 14m read',
        slug: 'virtual-threads-webflux-benchmarks',
      },
      {
        number: 2,
        title: '2. Connection Pool Tuning with HikariCP',
        status: 'current',
        meta: 'Published • 8m read',
        slug: 'optimizing-postgresql-connection-pooling-in-hikaricp-engineering-deep-dive',
      },
      {
        number: 3,
        title: '3. Off-Heap Caching with ChronicleMap',
        status: 'upcoming',
        meta: 'Drafting • In Review',
      },
      {
        number: 4,
        title: '4. Zero-Copy Serialization & Netty Transport',
        status: 'upcoming',
        meta: 'Upcoming',
      },
      {
        number: 5,
        title: '5. Production Linux Kernel TCP Sysctl Tuning',
        status: 'upcoming',
        meta: 'Upcoming',
      },
    ],
  },
];
