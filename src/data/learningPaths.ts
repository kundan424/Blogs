import { LearningPath } from '../types';

export const learningPaths: LearningPath[] = [
  // =========================================================================
  // SUBJECT: BACKEND & DISTRIBUTED SYSTEMS
  // =========================================================================
  {
    id: 'spring-boot-production-mastery',
    slug: 'spring-boot-production-mastery',
    title: 'Spring Boot Production Mastery',
    description:
      'A rigorous sequential engineering roadmap through Spring Boot runtime mechanics, auto-configuration conditions, HikariCP transaction pooling, web filter dispatchers, and native GraalVM deployment.',
    subjectSlug: 'backend-distributed-systems',
    icon: 'developer_mode',
    level: 'Production Scale',
    estimatedDuration: '3 Modules • 7 Lessons',
    modules: [
      {
        id: 'sb-mod-01',
        number: '01',
        title: 'Core Architecture & Runtime Mechanics',
        description:
          'Bootstrap sequence, auto-configuration heuristics, and executable packaging.',
        lessons: [
          {
            id: 'sb-1-1',
            number: '1.1',
            title: 'Request Lifecycle & Auto-Configuration Mechanics',
            description:
              'Deep mechanical breakdown of SpringApplication.run(), ConditionEvaluationReport, and embedded container initialization.',
            status: 'published',
            noteSlug: 'spring-boot-internal-architecture-request-lifecycle-auto-configuration',
            readTime: '12m read',
            topics: ['spring-boot', 'architecture', 'jvm-internals'],
          },
          {
            id: 'sb-1-2',
            number: '1.2',
            title: 'Build, Packaging & Deployment Mechanics',
            description:
              'Fat JAR layout, PropertiesLauncher, CDS class data sharing, and multi-stage container optimization.',
            status: 'published',
            noteSlug: 'spring-boot-architecture-build-packaging-deployment-interview-guide',
            readTime: '10m read',
            topics: ['spring-boot', 'devops', 'containers'],
          },
          {
            id: 'sb-1-3',
            number: '1.3',
            title: 'IoC Container, Bean Lifecycle & Post-Processors',
            description:
              'BeanFactory vs ApplicationContext, BeanPostProcessor execution order, circular dependency resolution, and proxy generation.',
            status: 'upcoming',
            readTime: '08m read',
            topics: ['spring-boot', 'ioc', 'dependency-injection'],
          },
        ],
      },
      {
        id: 'sb-mod-02',
        number: '02',
        title: 'Persistence, Pooling & Transaction Management',
        description:
          'HikariCP connection pool dynamics, Spring @Transactional semantics, and lock contention.',
        lessons: [
          {
            id: 'sb-2-1',
            number: '2.1',
            title: 'HikariCP Connection Pool Sizing & Spike Contention',
            description:
              'Pool sizing mathematics (Pool = 2 * CPU_cores + effective_spindle_count), leak detection thresholds, and P99 latency isolation.',
            status: 'upcoming',
            readTime: '11m read',
            topics: ['hikaricp', 'database', 'postgresql'],
          },
          {
            id: 'sb-2-2',
            number: '2.2',
            title: 'Spring @Transactional Propagation & Dynamic Proxies',
            description:
              'CGLIB proxy bypass pitfalls, physical vs logical transactions, and rollback rule mechanics.',
            status: 'upcoming',
            readTime: '09m read',
            topics: ['spring-boot', 'transactions', 'database'],
          },
        ],
      },
      {
        id: 'sb-mod-03',
        number: '03',
        title: 'REST Dispatcher, Security & Native Compilation',
        description:
          'Servlet vs reactive pipelines, production actuator endpoints, and GraalVM AOT images.',
        lessons: [
          {
            id: 'sb-3-1',
            number: '3.1',
            title: 'Servlet Filter Chain vs WebFlux Reactive Pipeline',
            description:
              'Thread-per-request Tomcat model vs Netty EventLoop architecture and backpressure handling.',
            status: 'upcoming',
            readTime: '10m read',
            topics: ['spring-boot', 'reactive', 'webflux'],
          },
          {
            id: 'sb-3-2',
            number: '3.2',
            title: 'Production Actuator Observability & GraalVM AOT Native Images',
            description:
              'Micrometer metrics exporter, health check probes, and GraalVM reachability metadata generation.',
            status: 'upcoming',
            readTime: '12m read',
            topics: ['spring-boot', 'graalvm', 'observability'],
          },
        ],
      },
    ],
  },
  {
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
  },
  {
    id: 'java-core-oop-deep-dives',
    slug: 'java-core-oop-deep-dives',
    title: 'Java Core & Object-Oriented Deep Dives',
    description:
      'From virtual method tables and JVM memory layouts to robust SOLID enterprise architecture and clean code mechanics.',
    subjectSlug: 'backend-distributed-systems',
    icon: 'terminal',
    level: 'Intermediate',
    estimatedDuration: '1 Module • 4 Lessons',
    modules: [
      {
        id: 'java-mod-01',
        number: '01',
        title: 'Object-Oriented Architecture & Runtime Execution',
        description:
          'Deep architectural analysis of OOP pillars, JVM method dispatch, and object identity contracts.',
        lessons: [
          {
            id: 'java-1-1',
            number: '1.1',
            title: 'Encapsulation, Polymorphism & Abstraction Mechanics',
            description:
              'Practical object-oriented principles tested against production engineering interview scenarios.',
            status: 'published',
            noteSlug: 'java-object-oriented-progamming-interview-questions-i',
            readTime: '10m read',
            topics: ['java', 'oop', 'jvm-internals'],
          },
          {
            id: 'java-1-2',
            number: '1.2',
            title: 'Inheritance, Virtual Method Tables & Method Dispatch',
            description:
              'vtable lookup mechanics, invokevirtual vs invokeinterface bytecode, and composition tradeoffs.',
            status: 'published',
            noteSlug: 'java-object-oriented-programming-interview-deep-dive-part-ii',
            readTime: '11m read',
            topics: ['java', 'oop', 'bytecode'],
          },
          {
            id: 'java-1-3',
            number: '1.3',
            title: 'Object Class Internals, HashCode & Equals Contracts',
            description:
              'HashMap bucket collision behavior, identity vs semantic equality, and immutable domain types.',
            status: 'published',
            noteSlug: 'java-object-oriented-programming-interview-deep-dive-part-iii',
            readTime: '09m read',
            topics: ['java', 'oop', 'collections'],
          },
          {
            id: 'java-1-4',
            number: '1.4',
            title: 'SOLID Principles & Architectural Clean Code',
            description:
              'Single responsibility, open-closed, and dependency inversion verified through real-world refactorings.',
            status: 'published',
            noteSlug: 'java-object-oriented-programming-interview-deep-dive-part-iv',
            readTime: '12m read',
            topics: ['java', 'solid-principles', 'architecture'],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // SUBJECT: DEVOPS & CLOUD INFRASTRUCTURE
  // =========================================================================
  {
    id: 'docker-container-runtime-mastery',
    slug: 'docker-container-runtime-mastery',
    title: 'Docker & Container Runtime Mastery',
    description:
      'Linux namespaces, cgroups, BuildKit caching layers, rootless daemon security, and production multi-stage image optimization.',
    subjectSlug: 'devops-cloud-infrastructure',
    icon: 'cloud_sync',
    level: 'Intermediate',
    estimatedDuration: '1 Module • 3 Lessons',
    modules: [
      {
        id: 'docker-mod-01',
        number: '01',
        title: 'Container Foundations & Engine Mechanics',
        description:
          'Container engine architecture, Dockerfile layer cache optimization, and multi-stage builds.',
        lessons: [
          {
            id: 'docker-1-1',
            number: '1.1',
            title: 'Container Architecture & CLI Foundations',
            description:
              'Container runtime vs virtual machine hypervisors, process isolation, and CLI lifecycle commands.',
            status: 'published',
            noteSlug: 'docker-interview-deep-dive-part-i-foundations-cli',
            readTime: '08m read',
            topics: ['docker', 'containers', 'devops'],
          },
          {
            id: 'docker-1-2',
            number: '1.2',
            title: 'Dockerfile Internals & Production Architecture Guide',
            description:
              'OverlayFS union mounts, layer immutability, build cache optimization, and signal propagation.',
            status: 'published',
            noteSlug: 'dockerfile-architecture-internals-production-guide',
            readTime: '10m read',
            topics: ['docker', 'dockerfile', 'buildkit'],
          },
          {
            id: 'docker-1-3',
            number: '1.3',
            title: 'Optimizing Images: From Naive to Production',
            description:
              'Multi-stage builds, distroless runtimes, non-root user execution, and trimming image sizes by 90%.',
            status: 'published',
            noteSlug: 'dockerfile-deep-dive-from-naive-to-production',
            readTime: '09m read',
            topics: ['docker', 'performance', 'security'],
          },
        ],
      },
    ],
  },
];
