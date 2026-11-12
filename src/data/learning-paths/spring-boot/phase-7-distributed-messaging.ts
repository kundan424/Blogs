import { LearningModule } from '../../../types';

export const phase7Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // PHASE 7: DISTRIBUTED PATTERNS & ASYNCHRONOUS MESSAGING
  // -----------------------------------------------------------------------
  {
    id: 'sb-mod-28',
    number: '28',
    title: 'Resiliency & Fault Tolerance (Resilience4j)',
    description:
      'Circuit breakers, retry mechanisms with exponential backoff, rate limiters, and thread pool bulkheads.',
    lessons: [
      {
        id: 'sb-28-1',
        number: '28.1',
        title: 'Circuit Breaker State Machine: Closed, Open, Half-Open & Fallback Recovery',
        description:
          'Resilience4j circuit breaker mechanics: sliding window metrics (count-based vs time-based), failure rate thresholds, state transitions, and graceful degradation via fallbackMethod.',
        status: 'upcoming',
        readTime: '13m read',
        topics: ['circuit-breaker', 'resilience4j', 'fault-tolerance'],
      },
      {
        id: 'sb-28-2',
        number: '28.2',
        title: 'Retry with Exponential Backoff, Rate Limiter & Thread Pool Bulkheads',
        description:
          'Preventing thundering herds: exponential backoff with randomized jitter, bulkhead thread pool isolation to prevent cascading resource starvation.',
        status: 'upcoming',
        readTime: '11m read',
        topics: ['resilience4j', 'bulkhead', 'rate-limiter'],
      },
    ],
  },
  {
    id: 'sb-mod-29',
    number: '29',
    title: 'Asynchronous Messaging with Apache Kafka & RabbitMQ',
    description:
      'Event-driven communication, message broker topologies, Kafka partition mechanics, and consumer groups.',
    lessons: [
      {
        id: 'sb-29-1',
        number: '29.1',
        title: 'Message Broker Selection: Apache Kafka vs RabbitMQ Architectural Trade-offs',
        description:
          'AMQP smart broker/dumb consumer model (RabbitMQ) vs distributed append-only commit log (Kafka): throughput, message ordering, and retention semantics.',
        status: 'upcoming',
        readTime: '11m read',
        topics: ['kafka', 'rabbitmq', 'messaging', 'event-driven'],
      },
      {
        id: 'sb-29-2',
        number: '29.2',
        title: 'Kafka Fundamentals: Topics, Partitions, Offsets & Consumer Groups',
        description:
          'Kafka internal layout: log segments, partition rebalances, consumer offset commit strategies (at-most-once, at-least-once, effectively-once), and producer partition keys.',
        status: 'upcoming',
        readTime: '14m read',
        topics: ['kafka', 'partitions', 'distributed-systems'],
      },
      {
        id: 'sb-29-3',
        number: '29.3',
        title: 'Event-Driven Microservices with Spring for Apache Kafka & Spring Cloud Stream',
        description:
          'Writing resilient Kafka producers with KafkaTemplate, concurrent message listeners with @KafkaListener, error handler Dead Letter Topics (DLT), and Spring Cloud Stream functional binders.',
        status: 'upcoming',
        readTime: '13m read',
        topics: ['spring-kafka', 'spring-cloud-stream', 'dead-letter-queue'],
      },
    ],
  },
  {
    id: 'sb-mod-30',
    number: '30',
    title: 'Distributed Transactions & Data Consistency',
    description:
      'The 2PC dilemma, Saga pattern orchestration vs choreography, Transactional Outbox, and CQRS.',
    lessons: [
      {
        id: 'sb-30-1',
        number: '30.1',
        title: 'The 2PC Dilemma & Saga Pattern: Orchestration vs Choreography',
        description:
          'Why Two-Phase Commit fails in microservices, implementing Saga transactions via Choreography (event-driven reactions) vs Orchestration (central state coordinator), and compensating actions.',
        status: 'upcoming',
        readTime: '15m read',
        topics: ['saga-pattern', 'distributed-transactions', 'consistency'],
      },
      {
        id: 'sb-30-2',
        number: '30.2',
        title: 'Transactional Outbox Pattern & CDC Streaming with Debezium',
        description:
          'Eliminating dual-write inconsistencies between RDBMS and Kafka: local outbox table transactions, PostgreSQL WAL tailing with Debezium CDC for guaranteed at-least-once delivery.',
        status: 'upcoming',
        readTime: '14m read',
        topics: ['outbox-pattern', 'cdc', 'debezium', 'kafka'],
      },
      {
        id: 'sb-30-3',
        number: '30.3',
        title: 'Command Query Responsibility Segregation (CQRS) Architecture',
        description:
          'Separating write models (relational transactional stores) from read models (Elasticsearch / Redis query projections) via asynchronous materialized view streams.',
        status: 'upcoming',
        readTime: '12m read',
        topics: ['cqrs', 'event-sourcing', 'architecture'],
      },
    ],
  },
  {
    id: 'sb-mod-31',
    number: '31',
    title: 'Distributed Tracing & Centralized Observability',
    description:
      'Correlation ID propagation, Micrometer Tracing with Zipkin/Tempo, Prometheus metrics, and centralized logs.',
    lessons: [
      {
        id: 'sb-31-1',
        number: '31.1',
        title: 'Distributed Tracing with Micrometer Tracing & Zipkin / Grafana Tempo',
        description:
          'End-to-end request tracing in Spring Boot 3: replacing Sleuth with Micrometer Tracing, traceId and spanId propagation across HTTP and Kafka headers, and visualizing spans in Zipkin/Tempo.',
        status: 'upcoming',
        readTime: '12m read',
        topics: ['tracing', 'micrometer', 'zipkin', 'observability'],
      },
      {
        id: 'sb-31-2',
        number: '31.2',
        title: 'Prometheus Metrics Scraping & Centralized Logging with Loki / ELK Stack',
        description:
          'Scraping Actuator metrics via Prometheus, building Grafana telemetry dashboards (P99 latency, JVM heap, thread count), and aggregating structured JSON logs via Grafana Loki or ELK.',
        status: 'upcoming',
        readTime: '11m read',
        topics: ['prometheus', 'grafana', 'loki', 'elk-stack'],
      },
    ],
  },
  {
    id: 'sb-mod-32',
    number: '32',
    title: 'Distributed Security & OAuth2 Token Relay',
    description:
      'Centralized Identity Providers, Keycloak integration, OAuth2/OIDC PKCE flows, and token relay architectures.',
    lessons: [
      {
        id: 'sb-32-1',
        number: '32.1',
        title: 'Centralized Identity Provider Integration (Keycloak / Auth0) & OIDC PKCE Flow',
        description:
          'Setting up Keycloak realm clients, authorization code flow with Proof Key for Code Exchange (PKCE), user credential delegation, and SSO token issuance.',
        status: 'upcoming',
        readTime: '13m read',
        topics: ['keycloak', 'oauth2', 'oidc', 'security'],
      },
      {
        id: 'sb-32-2',
        number: '32.2',
        title: 'API Gateway Token Relay & Microservice Downstream JWT Verification',
        description:
          'Securing the perimeter: API Gateway validates incoming bearer tokens, extracts user claims, and relays verified JWT headers down to internal services without internal re-authentication.',
        status: 'upcoming',
        readTime: '11m read',
        topics: ['token-relay', 'api-gateway', 'jwt', 'security'],
      },
    ],
  },
];
