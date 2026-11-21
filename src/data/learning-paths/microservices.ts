import { LearningPath, LearningModule } from '../../types';

export const microservicesModules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // Module 0 — Why microservices at all (Weight 6% · ~3 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ms-mod-00',
    number: '00',
    title: 'Why microservices at all',
    description:
      'Goal: decide with a cost model, not hype — know exactly what you are buying and what you are paying before you split anything.',
    lessons: [
      {
        id: 'ms-0-1',
        number: '0.1',
        title: 'The Definition That Matters: Nine Characteristics Beyond the Checklist',
        description:
          'Small services in their own processes, built around business capabilities, automated deployment, and lightweight communication mechanisms.',
        status: 'upcoming',
        noteSlug: 'microservices-definition-nine-characteristics',
        readTime: '12m read',
        topics: ['microservices', 'architecture', 'fundamentals'],
      },
      {
        id: 'ms-0-2',
        number: '0.2',
        title: 'Independent Deployability: The One-Sentence Litmus Test',
        description:
          'Can this service go to production without any other service going with it? The defining boundary between real microservices and distributed monoliths.',
        status: 'upcoming',
        noteSlug: 'independent-deployability-the-litmus-test',
        readTime: '10m read',
        topics: ['microservices', 'deployment', 'ci-cd'],
      },
      {
        id: 'ms-0-3',
        number: '0.3',
        title: 'Conway’s Law: How Organizational Structure Dictates Architecture',
        description:
          'System shapes mirror communication shapes. Team boundaries as the natural first draft of service boundaries.',
        status: 'upcoming',
        noteSlug: 'conways-law-and-service-boundaries',
        readTime: '11m read',
        topics: ['conways-law', 'team-topology', 'architecture'],
      },
      {
        id: 'ms-0-4',
        number: '0.4',
        title: 'The Microservice Premium: Calculating the Concrete Cost of Distribution',
        description:
          'Automated deployment, observability, failure handling, and eventual consistency as a tangible engineering tax.',
        status: 'upcoming',
        noteSlug: 'the-microservice-premium-cost-model',
        readTime: '13m read',
        topics: ['microservices', 'trade-offs', 'cost-model'],
      },
      {
        id: 'ms-0-5',
        number: '0.5',
        title: 'Monolith First: Why Starting with Microservices on Greenfield Fails',
        description:
          'Why moving boundaries inside a monolith is cheap, while moving boundaries across services is expensive. Evolving from modular monoliths.',
        status: 'upcoming',
        noteSlug: 'monolith-first-evolutionary-architecture',
        readTime: '12m read',
        topics: ['monolith-first', 'domain-modeling', 'evolutionary-architecture'],
      },
      {
        id: 'ms-0-6',
        number: '0.6',
        title: 'The Distributed Monolith: Diagnosing the Worst-of-Both-Worlds Anti-Pattern',
        description:
          'Shared databases, synchronous call chains, and lockstep releases. How to detect a distributed monolith on sight from deployment behavior.',
        status: 'upcoming',
        noteSlug: 'diagnosing-the-distributed-monolith',
        readTime: '14m read',
        topics: ['anti-patterns', 'distributed-monolith', 'resilience'],
      },
      {
        id: 'ms-0-7',
        number: '0.7',
        title: 'Module 0 Exit Check & Mini-Build: EduNest Decision Memo & Modular Monolith Boundary',
        description:
          'Formulate a 1-page decision memo: split or stay monolith for EduNest, quantify the premium, and draw the modular monolith boundary on paper.',
        status: 'upcoming',
        noteSlug: 'module-0-exit-check-edunest-decision-memo',
        readTime: '15m read',
        topics: ['capstone', 'decision-memo', 'edunest'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 1 — Thinking in distributed systems (Weight 16% · ~9 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ms-mod-01',
    number: '01',
    title: 'Thinking in distributed systems',
    description:
      'Goal: internalise that the network changes the physics — every pattern from Module 3 onwards is an answer to a fact in this module.',
    lessons: [
      {
        id: 'ms-1-1',
        number: '1.1',
        title: 'The Eight Fallacies of Distributed Computing & Real Outage Case Studies',
        description:
          'Reliability, latency, bandwidth, security, topology, administration, transport cost, and homogeneity. The production outage behind each fallacy.',
        status: 'upcoming',
        noteSlug: 'eight-fallacies-of-distributed-computing-deep-dive',
        readTime: '16m read',
        topics: ['distributed-systems', 'fallacies', 'networking'],
      },
      {
        id: 'ms-1-2',
        number: '1.2',
        title: 'Latency Budgets: Nanosecond In-Process Calls vs Millisecond Network Hops',
        description:
          'In-process calls cost nanoseconds; network calls cost milliseconds. Fanning out to five services pays that penalty 5x or waits on the p99 slowest.',
        status: 'upcoming',
        noteSlug: 'latency-budgets-and-fan-out-penalties',
        readTime: '12m read',
        topics: ['latency', 'networking', 'performance'],
      },
      {
        id: 'ms-1-3',
        number: '1.3',
        title: 'Partial Failure & The Timeout Dilemma: The State of Not Knowing',
        description:
          'In one process, a call succeeds or fails. Over the network, it can time out, succeed silently, or succeed twice. The root cause of distributed complexity.',
        status: 'upcoming',
        noteSlug: 'partial-failure-and-the-timeout-dilemma',
        readTime: '15m read',
        topics: ['partial-failure', 'timeouts', 'distributed-systems'],
      },
      {
        id: 'ms-1-4',
        number: '1.4',
        title: 'Delivery Guarantees: Why Exactly-Once Message Delivery Does Not Exist',
        description:
          'At-most-once (drop messages), at-least-once (duplicate messages), and proving mathematically why exactly-once physical delivery is impossible over networks.',
        status: 'upcoming',
        noteSlug: 'delivery-guarantees-at-least-once-vs-exactly-once',
        readTime: '14m read',
        topics: ['messaging', 'delivery-guarantees', 'distributed-systems'],
      },
      {
        id: 'ms-1-5',
        number: '1.5',
        title: 'Effectively-Once Delivery: Combining At-Least-Once with Idempotent Receivers',
        description:
          'How to buy effectively-once semantics using idempotency keys, unique database constraints, and deduplication tables in Spring Boot.',
        status: 'upcoming',
        noteSlug: 'effectively-once-delivery-and-idempotency-keys',
        readTime: '15m read',
        topics: ['idempotency', 'spring-boot', 'distributed-systems'],
      },
      {
        id: 'ms-1-6',
        number: '1.6',
        title: 'Retry Storms & Multiplicative Amplification: When Resilience Turns Deadly',
        description:
          '3 retries at each of 3 layers is 27 requests. How naive retry logic turns localized blips into cascading total cluster outages.',
        status: 'upcoming',
        noteSlug: 'retry-storms-and-multiplicative-amplification',
        readTime: '13m read',
        topics: ['retries', 'resilience', 'outages'],
      },
      {
        id: 'ms-1-7',
        number: '1.7',
        title: 'CAP Theorem Said Correctly: Network Partitions Are Not an Option',
        description:
          'Why "Pick Two" is a flawed slogan. When network partitions occur, choosing between consistency and availability is forced by the physics of the network.',
        status: 'upcoming',
        noteSlug: 'cap-theorem-said-correctly-partitions-inevitable',
        readTime: '14m read',
        topics: ['cap-theorem', 'consistency', 'availability'],
      },
      {
        id: 'ms-1-8',
        number: '1.8',
        title: 'The PACELC Model: The Daily Trade-Off Between Latency and Consistency',
        description:
          'If there is a Partition (P), trade Availability (A) vs Consistency (C); Else (E), trade Latency (L) vs Consistency (C). The real-world production equation.',
        status: 'upcoming',
        noteSlug: 'pacelc-model-latency-vs-consistency-in-practice',
        readTime: '13m read',
        topics: ['pacelc', 'latency', 'consistency'],
      },
      {
        id: 'ms-1-9',
        number: '1.9',
        title: 'Consistency Models in Action: Strong Linearizability vs Eventual Convergence',
        description:
          'Strong consistency at the price of waiting vs eventual consistency. Designing systems around what users experience while data converges.',
        status: 'upcoming',
        noteSlug: 'consistency-models-strong-vs-eventual-experience',
        readTime: '14m read',
        topics: ['consistency-models', 'eventual-consistency', 'ux'],
      },
      {
        id: 'ms-1-10',
        number: '1.10',
        title: 'Coupling in Time vs Space: Synchronous RPC vs Asynchronous Event Decoupling',
        description:
          'Synchronous calls couple systems in both time (both must be up right now) and space (caller knows endpoint). Events decouple both at the price of complexity.',
        status: 'upcoming',
        noteSlug: 'coupling-in-time-vs-space-rpc-vs-events',
        readTime: '13m read',
        topics: ['coupling', 'events', 'asynchronous'],
      },
      {
        id: 'ms-1-11',
        number: '1.11',
        title: 'Module 1 Exit Check & Mini-Build: Two Spring Boot Services with HTTP Failure & Idempotency',
        description:
          'Kill downstream service mid-call, observe HTTP timeout, implement exponential backoff retry, and enforce idempotency keys on receiver.',
        status: 'upcoming',
        noteSlug: 'module-1-exit-check-network-failure-idempotency-lab',
        readTime: '16m read',
        topics: ['spring-boot', 'lab', 'idempotency'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 2 — Boundaries: where to cut (Weight 12% · ~7 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ms-mod-02',
    number: '02',
    title: 'Boundaries: where to cut',
    description:
      'Goal: draw boundaries the business already has, so a service owns one idea that changes for one reason.',
    lessons: [
      {
        id: 'ms-2-1',
        number: '2.1',
        title: 'Bounded Contexts: One Model and Language per Boundary',
        description:
          'Why a "Course" in the catalogue (title, description, price) is NOT the same "Course" in enrolment (seats, schedule) or billing. Avoiding the unified god model.',
        status: 'upcoming',
        noteSlug: 'bounded-contexts-and-semantic-model-isolation',
        readTime: '14m read',
        topics: ['ddd', 'bounded-context', 'domain-modeling'],
      },
      {
        id: 'ms-2-2',
        number: '2.2',
        title: 'Ubiquitous Language: When Vocabulary Conflicts Reveal Architectural Seams',
        description:
          'The words business teams actually use. Translating terms at context boundaries and using linguistic disagreement to identify microservice boundaries.',
        status: 'upcoming',
        noteSlug: 'ubiquitous-language-and-linguistic-seams',
        readTime: '12m read',
        topics: ['ddd', 'ubiquitous-language', 'context-mapping'],
      },
      {
        id: 'ms-2-3',
        number: '2.3',
        title: 'Decomposing by Business Capability: Building Services Along What the Business Does',
        description:
          'Catalogue, enrolment, payment, certification. Why capability cuts remain stable even when company technical stacks undergo churn.',
        status: 'upcoming',
        noteSlug: 'decompose-by-business-capability-patterns',
        readTime: '13m read',
        topics: ['microservices', 'business-capabilities', 'decomposition'],
      },
      {
        id: 'ms-2-4',
        number: '2.4',
        title: 'Decomposing by Subdomain: Core, Supporting, and Generic Domains in DDD',
        description:
          'Differentiating competitive differentiators (Core) from supporting features and generic utilities (Auth, Email) in microservice scoping.',
        status: 'upcoming',
        noteSlug: 'decompose-by-subdomain-core-supporting-generic',
        readTime: '13m read',
        topics: ['ddd', 'subdomains', 'strategic-design'],
      },
      {
        id: 'ms-2-5',
        number: '2.5',
        title: 'Aggregates & Invariants: Clustering Entities That Must Stay Consistent',
        description:
          'An Order and its Line Items belong in one service. If a business invariant spans two separate services, your boundary cut is structurally wrong.',
        status: 'upcoming',
        noteSlug: 'aggregates-and-invariants-boundary-enforcement',
        readTime: '15m read',
        topics: ['aggregates', 'invariants', 'data-modeling'],
      },
      {
        id: 'ms-2-6',
        number: '2.6',
        title: 'Anti-Pattern Smells: Table-per-Service, Layer-per-Service & The Entity User Service',
        description:
          'Smelling bad cuts: anemic CRUD table-services, technical "data services", and god "User Services" that every other team must modify.',
        status: 'upcoming',
        noteSlug: 'anti-pattern-smells-in-service-decomposition',
        readTime: '14m read',
        topics: ['anti-patterns', 'code-smells', 'refactoring'],
      },
      {
        id: 'ms-2-7',
        number: '2.7',
        title: 'The Deploy-Alone Test & Change-Together Smell: Detecting Trench Coats',
        description:
          'If two services always change, build, and deploy together, they are one service wearing a trench coat. Merging and refactoring boundaries.',
        status: 'upcoming',
        noteSlug: 'deploy-alone-test-and-change-together-smell',
        readTime: '12m read',
        topics: ['coupling', 'cohesion', 'deployment'],
      },
      {
        id: 'ms-2-8',
        number: '2.8',
        title: 'Module 2 Exit Check & Mini-Build: Event Storming EduNest & Mapping Contexts',
        description:
          'Run an event-storming session for EduNest enrolment flow. Map commands, events, aggregates, and establish a formal context map.',
        status: 'upcoming',
        noteSlug: 'module-2-exit-check-edunest-event-storming-context-map',
        readTime: '16m read',
        topics: ['event-storming', 'context-map', 'edunest'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 3 — Communication between services (Weight 12% · ~7 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ms-mod-03',
    number: '03',
    title: 'Communication between services',
    description:
      'Goal: choose the right coupling for each interaction, and keep the choice explicit so it can change later.',
    lessons: [
      {
        id: 'ms-3-1',
        number: '3.1',
        title: 'The Synchronous vs Asynchronous Decision Framework: Caller Urgency',
        description:
          'Ask: "Does the caller need the answer right now?" Browsing catalogue needs an instant answer; sending welcome emails does not. Business needs dictate protocol.',
        status: 'upcoming',
        noteSlug: 'synchronous-vs-asynchronous-decision-framework',
        readTime: '12m read',
        topics: ['communication', 'sync-vs-async', 'architecture'],
      },
      {
        id: 'ms-3-2',
        number: '3.2',
        title: 'REST Contracts & Versioning: Expand-and-Contract & The Tolerant Reader',
        description:
          'Contracts as promises to strangers. Evolving APIs without breaking callers: adding fields, migrating consumers, and reading payloads tolerantly.',
        status: 'upcoming',
        noteSlug: 'rest-contracts-versioning-and-tolerant-reader',
        readTime: '14m read',
        topics: ['rest', 'api-versioning', 'contract-design'],
      },
      {
        id: 'ms-3-3',
        number: '3.3',
        title: 'gRPC & Protocol Buffers: High-Throughput Binary Internal Communication',
        description:
          'Contracts as code, binary serialization, multiplexed HTTP/2 streams, and bi-directional streaming. When to adopt gRPC vs plain JSON REST.',
        status: 'upcoming',
        noteSlug: 'grpc-and-protocol-buffers-internal-communication',
        readTime: '15m read',
        topics: ['grpc', 'protobuf', 'high-performance'],
      },
      {
        id: 'ms-3-4',
        number: '3.4',
        title: 'Queues vs Event Logs: RabbitMQ Message Queues vs Kafka Replayable Logs',
        description:
          'Queues deliver to one consumer and destroy messages; logs append facts for many consumers to replay. Smart endpoints and dumb pipes.',
        status: 'upcoming',
        noteSlug: 'queues-vs-event-logs-rabbitmq-vs-kafka',
        readTime: '15m read',
        topics: ['kafka', 'rabbitmq', 'event-driven'],
      },
      {
        id: 'ms-3-5',
        number: '3.5',
        title: 'The API Gateway Pattern: Ingress Routing, SSL Termination & Rate Limiting',
        description:
          'One front door for external traffic: routing, cross-cutting auth, token validation, rate-limiting, and clustering to prevent single points of failure.',
        status: 'upcoming',
        noteSlug: 'api-gateway-pattern-routing-and-cross-cutting',
        readTime: '14m read',
        topics: ['api-gateway', 'spring-cloud-gateway', 'security'],
      },
      {
        id: 'ms-3-6',
        number: '3.6',
        title: 'Backend for Frontend (BFF): Decoupling Web and Mobile API Contracts',
        description:
          'Why a single gateway serving web browsers and native mobile apps serves neither. Tailoring payloads, latency profiles, and aggregations per client.',
        status: 'upcoming',
        noteSlug: 'backend-for-frontend-bff-tailored-contracts',
        readTime: '13m read',
        topics: ['bff', 'api-gateway', 'mobile-architecture'],
      },
      {
        id: 'ms-3-7',
        number: '3.7',
        title: 'Service Discovery: Client-Side Eureka vs Kubernetes Native DNS',
        description:
          'Dynamic instance IP allocation: Eureka service registries vs platform-native Kubernetes Service DNS records. Knowing when Eureka is obsolete.',
        status: 'upcoming',
        noteSlug: 'service-discovery-eureka-vs-kubernetes-dns',
        readTime: '14m read',
        topics: ['service-discovery', 'eureka', 'kubernetes'],
      },
      {
        id: 'ms-3-8',
        number: '3.8',
        title: 'Module 3 Exit Check & Mini-Build: Spring Cloud Gateway with Eureka & Mobile Route Shaping',
        description:
          'Configure Spring Cloud Gateway in front of two Spring Boot services with Eureka discovery, rate limit routes, and shape a mobile-tailored response.',
        status: 'upcoming',
        noteSlug: 'module-3-exit-check-spring-cloud-gateway-lab',
        readTime: '16m read',
        topics: ['spring-cloud-gateway', 'eureka', 'lab'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 4 — Data in a distributed world (Weight 16% · ~9 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ms-mod-04',
    number: '04',
    title: 'Data in a distributed world',
    description:
      'Goal: accept that data consistency is now a design problem, not a database feature — and design it on purpose.',
    lessons: [
      {
        id: 'ms-4-1',
        number: '4.1',
        title: 'Database per Service: The Non-Negotiable Rule of Independent Deployability',
        description:
          'Each service owns its private database. No foreign keys, no cross-service table joins. Why shared databases are distributed monoliths with latency.',
        status: 'published',
        noteSlug: 'designing-multi-tenant-database-isolation-saas',
        readTime: '12m read',
        topics: ['database-per-service', 'data-isolation', 'postgresql'],
      },
      {
        id: 'ms-4-2',
        number: '4.2',
        title: 'The Only Two Distributed Data Problems: Cross-Service Writes & Cross-Service Queries',
        description:
          'When databases are split, you only face two fundamental problems: multi-service transactions and multi-service queries. All data patterns solve one of these.',
        status: 'upcoming',
        noteSlug: 'cross-service-writes-and-cross-service-queries',
        readTime: '11m read',
        topics: ['distributed-data', 'transactions', 'queries'],
      },
      {
        id: 'ms-4-3',
        number: '4.3',
        title: 'The Saga Pattern: Coordinating Distributed Transactions with Compensations',
        description:
          'Replacing Two-Phase Commit (2PC) with a sequence of local transactions. Undoing failed steps with business compensations (refunds instead of rollbacks).',
        status: 'upcoming',
        noteSlug: 'saga-pattern-distributed-transactions-compensations',
        readTime: '16m read',
        topics: ['saga', 'distributed-transactions', 'compensations'],
      },
      {
        id: 'ms-4-4',
        number: '4.4',
        title: 'Saga Coordination Styles: Event Choreography vs Centralized Orchestration',
        description:
          'Choreography (services react to domain events) vs Orchestration (state machine coordinator). Why orchestration is mandatory past three transaction steps.',
        status: 'upcoming',
        noteSlug: 'saga-choreography-vs-orchestration-tradeoffs',
        readTime: '15m read',
        topics: ['saga', 'choreography', 'orchestration'],
      },
      {
        id: 'ms-4-5',
        number: '4.5',
        title: 'The Dual-Write Problem: The Quietest and Deadliest Bug in Distributed Systems',
        description:
          'Why you cannot atomically commit to a local database and publish an event to a message broker. Analyzing crashes between commit and publish.',
        status: 'upcoming',
        noteSlug: 'the-dual-write-problem-in-distributed-systems',
        readTime: '13m read',
        topics: ['dual-write', 'atomicity', 'data-integrity'],
      },
      {
        id: 'ms-4-6',
        number: '4.6',
        title: 'The Transactional Outbox Pattern: Atomic Publishing via DB Commit & CDC',
        description:
          'Writing events into an outbox table within the same local transaction. Relaying events via Debezium CDC and Postgres WAL tailing.',
        status: 'upcoming',
        noteSlug: 'transactional-outbox-pattern-and-cdc-relay',
        readTime: '16m read',
        topics: ['transactional-outbox', 'cdc', 'debezium'],
      },
      {
        id: 'ms-4-7',
        number: '4.7',
        title: 'CQRS (Command Query Responsibility Segregation): Decoupling Writes from Reads',
        description:
          'Separating the write domain model from denormalized read views. Building lightning-fast query projections from domain event streams.',
        status: 'upcoming',
        noteSlug: 'cqrs-command-query-responsibility-segregation',
        readTime: '16m read',
        topics: ['cqrs', 'read-models', 'event-driven'],
      },
      {
        id: 'ms-4-8',
        number: '4.8',
        title: 'Event Sourcing: Storing Facts as an Immutable Ledger of Historical Events',
        description:
          'State as a fold over events. Event replay, point-in-time auditing, snapshots, and the heavy price of immutable event schema versioning.',
        status: 'upcoming',
        noteSlug: 'event-sourcing-immutable-event-ledgers',
        readTime: '16m read',
        topics: ['event-sourcing', 'audit-log', 'event-store'],
      },
      {
        id: 'ms-4-9',
        number: '4.9',
        title: 'Designing for Eventual Consistency: Transparent UI and User Psychology',
        description:
          'While a saga is in flight, data disagrees. Designing honest user experiences: "Enrolment Processing" vs deceptive spinners that fake completion.',
        status: 'upcoming',
        noteSlug: 'designing-for-eventual-consistency-in-ui',
        readTime: '12m read',
        topics: ['eventual-consistency', 'ux-design', 'distributed-systems'],
      },
      {
        id: 'ms-4-10',
        number: '4.10',
        title: 'API Composition: Pragmatic Cross-Service Queries Before Reaching for CQRS',
        description:
          'Calling two services and joining in memory at the gateway or BFF. Slow and simple: use it until query volume demands CQRS read projections.',
        status: 'upcoming',
        noteSlug: 'api-composition-pragmatic-distributed-queries',
        readTime: '12m read',
        topics: ['api-composition', 'queries', 'microservices'],
      },
      {
        id: 'ms-4-11',
        number: '4.11',
        title: 'Module 4 Exit Check & Mini-Build: Choreographed Enrolment Saga with Outbox in EduNest',
        description:
          'Implement enrolment -> payment -> seat reservation saga with Outbox tables. Simulate payment failure and verify compensating rollback executions.',
        status: 'upcoming',
        noteSlug: 'module-4-exit-check-edunest-saga-outbox-lab',
        readTime: '18m read',
        topics: ['saga', 'lab', 'edunest'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 5 — Reliability: designing for failure (Weight 10% · ~6 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ms-mod-05',
    number: '05',
    title: 'Reliability: designing for failure',
    description:
      'Goal: make failure boring and bounded, so one slow service cannot take the system down with it.',
    lessons: [
      {
        id: 'ms-5-1',
        number: '5.1',
        title: 'Cascading Failures: How One Slow Dependency Causes Total System Blackouts',
        description:
          'Service A waits on B, B waits on C, C is slow. Thread exhaustion cascades upstream until A dies without having a single bug of its own.',
        status: 'upcoming',
        noteSlug: 'cascading-failures-and-thread-exhaustion',
        readTime: '13m read',
        topics: ['cascading-failures', 'reliability', 'outages'],
      },
      {
        id: 'ms-5-2',
        number: '5.2',
        title: 'Timeouts as Architectural Contracts: Deadlines and Failure Propagation',
        description:
          'Timeouts are design decisions, not configuration values. Propagating request deadlines and why timeouts without fallbacks are fast failures.',
        status: 'upcoming',
        noteSlug: 'timeouts-deadlines-and-fallback-architecture',
        readTime: '12m read',
        topics: ['timeouts', 'deadlines', 'resilience'],
      },
      {
        id: 'ms-5-3',
        number: '5.3',
        title: 'Circuit Breakers with Resilience4j: Closed, Open, and Half-Open State Machines',
        description:
          'The electrical breaker applied to HTTP. Stopping calls to dying downstream services and allowing them grace periods to recover.',
        status: 'upcoming',
        noteSlug: 'circuit-breakers-resilience4j-state-machine',
        readTime: '15m read',
        topics: ['circuit-breaker', 'resilience4j', 'fault-tolerance'],
      },
      {
        id: 'ms-5-4',
        number: '5.4',
        title: 'The Bulkhead Pattern: Isolating Thread and Connection Pools per Dependency',
        description:
          'Ship bulkheads preventing hull breaches from sinking the vessel. Isolate thread pools so payment delays never exhaust catalogue worker pools.',
        status: 'upcoming',
        noteSlug: 'bulkhead-pattern-thread-and-connection-isolation',
        readTime: '13m read',
        topics: ['bulkhead', 'thread-pools', 'resilience4j'],
      },
      {
        id: 'ms-5-5',
        number: '5.5',
        title: 'Retries Done Right: Bounded Attempts, Exponential Backoff & Jitter',
        description:
          'Why retries without jitter are synchronized thundering herds. Bounding retries and avoiding retrying non-idempotent failed mutations.',
        status: 'upcoming',
        noteSlug: 'retries-exponential-backoff-and-jitter',
        readTime: '13m read',
        topics: ['retries', 'backoff', 'jitter'],
      },
      {
        id: 'ms-5-6',
        number: '5.6',
        title: 'Rate Limiting & Load Shedding: Dropping 10% to Protect 100% of the System',
        description:
          'Refusing requests fast with HTTP 429 when overloaded. Dropping non-critical background requests to protect revenue-generating user flows.',
        status: 'upcoming',
        noteSlug: 'rate-limiting-and-load-shedding-heuristics',
        readTime: '14m read',
        topics: ['rate-limiting', 'load-shedding', 'scalability'],
      },
      {
        id: 'ms-5-7',
        number: '5.7',
        title: 'Graceful Degradation and Fallbacks: Providing Degraded Service Instead of Errors',
        description:
          'Showing cached recommendations with "stale prices" notes beats rendering 500 error screens. Planning degraded modes per feature.',
        status: 'upcoming',
        noteSlug: 'graceful-degradation-and-fallback-strategies',
        readTime: '13m read',
        topics: ['graceful-degradation', 'caching', 'fallbacks'],
      },
      {
        id: 'ms-5-8',
        number: '5.8',
        title: 'Health Checks Done Right: Liveness Probes vs Readiness Probes',
        description:
          'Liveness (is process deadlocked? restart pod) vs Readiness (can service handle traffic? route traffic). Avoiding restart death loops.',
        status: 'upcoming',
        noteSlug: 'health-checks-liveness-vs-readiness-probes',
        readTime: '12m read',
        topics: ['health-checks', 'kubernetes', 'spring-boot-actuator'],
      },
      {
        id: 'ms-5-9',
        number: '5.9',
        title: 'Module 5 Exit Check & Mini-Build: Resilience4j Circuit Breaker, Bulkhead & Timeout Lab',
        description:
          'Instrument two Spring Boot services with Resilience4j circuit breakers and bulkheads. Load-test failure to observe breaker transitions under load.',
        status: 'upcoming',
        noteSlug: 'module-5-exit-check-resilience4j-lab',
        readTime: '16m read',
        topics: ['resilience4j', 'lab', 'load-testing'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 6 — Observability: seeing the system (Weight 8% · ~5 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ms-mod-06',
    number: '06',
    title: 'Observability: seeing the system',
    description:
      'Goal: answer “which service, and why” in minutes, not hours — because a bug spread across five log files is a guessing game without it.',
    lessons: [
      {
        id: 'ms-6-1',
        number: '6.1',
        title: 'Monitoring vs Observability: Debugging the Known vs Investigating the Unknown',
        description:
          'Monitoring watches dashboards for predefined metrics; observability allows answering novel questions across distributed service graphs.',
        status: 'upcoming',
        noteSlug: 'monitoring-vs-observability-fundamentals',
        readTime: '11m read',
        topics: ['observability', 'monitoring', 'sre'],
      },
      {
        id: 'ms-6-2',
        number: '6.2',
        title: 'The Three Telemetry Signals: Metrics, Structured Logs & Distributed Traces',
        description:
          'Metrics show what is happening; logs show why it happened; traces show where requests traversed. Combining all three for rapid triage.',
        status: 'upcoming',
        noteSlug: 'three-telemetry-signals-metrics-logs-traces',
        readTime: '13m read',
        topics: ['metrics', 'logs', 'traces'],
      },
      {
        id: 'ms-6-3',
        number: '6.3',
        title: 'Correlation IDs & W3C TraceContext: Propagating traceparent Across Hops',
        description:
          'Attaching traceparent headers across HTTP and Kafka hops. Unifying logs from 5 independent services into a single coherent incident story.',
        status: 'upcoming',
        noteSlug: 'correlation-ids-w3c-trace-context-propagation',
        readTime: '14m read',
        topics: ['correlation-id', 'opentelemetry', 'context-propagation'],
      },
      {
        id: 'ms-6-4',
        number: '6.4',
        title: 'Distributed Tracing Anatomy: Spans, Child Spans & Waterfall Analysis',
        description:
          'Units of work, parent-child spans, error tags, and reading flame charts in Jaeger to pinpoint the slowest span in a call hierarchy.',
        status: 'upcoming',
        noteSlug: 'distributed-tracing-spans-and-waterfall-analysis',
        readTime: '14m read',
        topics: ['jaeger', 'opentelemetry', 'distributed-tracing'],
      },
      {
        id: 'ms-6-5',
        number: '6.5',
        title: 'The Four Golden Signals: Measuring Latency Percentiles (p95/p99), Traffic, Errors & Saturation',
        description:
          'Why average latency hides user suffering. Monitoring p95 and p99 percentiles, throughput rates, failure percentages, and queue saturation.',
        status: 'upcoming',
        noteSlug: 'four-golden-signals-latency-percentiles-saturation',
        readTime: '15m read',
        topics: ['golden-signals', 'prometheus', 'sre'],
      },
      {
        id: 'ms-6-6',
        number: '6.6',
        title: 'Alerting on Symptoms vs Causes: Eliminating On-Call Alert Fatigue',
        description:
          'Alerting on user-facing symptoms ("checkout error rate > 1%") instead of internal causes ("disk queue depth"). Creating actionable alerts.',
        status: 'upcoming',
        noteSlug: 'alerting-on-symptoms-vs-causes',
        readTime: '12m read',
        topics: ['alerting', 'sre', 'on-call'],
      },
      {
        id: 'ms-6-7',
        number: '6.7',
        title: 'SLOs, SLIs, and Error Budgets: Governing Engineering Reliability Trade-Offs',
        description:
          'Agreeing on what "reliable enough" means (99.9% under 200ms). Spending error budgets on shipping velocity rather than chasing 100% uptime.',
        status: 'upcoming',
        noteSlug: 'slos-slis-and-error-budgets-governance',
        readTime: '14m read',
        topics: ['slo', 'sli', 'error-budgets'],
      },
      {
        id: 'ms-6-8',
        number: '6.8',
        title: 'Metric Cardinality Explosions: Why User IDs in Prometheus Bankrupt Backends',
        description:
          'Every label combination creates a distinct time-series memory buffer. Keeping high-cardinality values in traces, not in metrics.',
        status: 'upcoming',
        noteSlug: 'metric-cardinality-explosions-in-prometheus',
        readTime: '12m read',
        topics: ['prometheus', 'cardinality', 'metrics-storage'],
      },
      {
        id: 'ms-6-9',
        number: '6.9',
        title: 'Module 6 Exit Check & Mini-Build: OpenTelemetry Java Agent, Jaeger & Prometheus Lab',
        description:
          'Attach OpenTelemetry Java agent to services, trace end-to-end enrolment in Jaeger, and formulate Prometheus golden-signal dashboards.',
        status: 'upcoming',
        noteSlug: 'module-6-exit-check-opentelemetry-jaeger-lab',
        readTime: '16m read',
        topics: ['opentelemetry', 'jaeger', 'prometheus', 'lab'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 7 — Deployment, scaling and operations (Weight 8% · ~5 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ms-mod-07',
    number: '07',
    title: 'Deployment, scaling and operations',
    description:
      'Goal: treat deployment as a property of the design — a service that only its author can deploy is not a microservice.',
    lessons: [
      {
        id: 'ms-7-1',
        number: '7.1',
        title: 'The Twelve-Factor App Contract: The Baseline Platform Standard',
        description:
          'Codebase isolation, explicit dependencies, config in environment, stateless processes, port binding, and dev/prod parity evaluated against Spring Boot.',
        status: 'upcoming',
        noteSlug: 'twelve-factor-app-contract-for-microservices',
        readTime: '14m read',
        topics: ['twelve-factor', 'cloud-native', 'architecture'],
      },
      {
        id: 'ms-7-2',
        number: '7.2',
        title: 'Containers as Immutable Artifacts: Multi-Stage Docker Builds',
        description:
          'Build once, run anywhere. Compiling slim JRE runtimes, non-root user execution, and guaranteeing staging artifacts match production bit-for-bit.',
        status: 'upcoming',
        noteSlug: 'containers-as-immutable-artifacts-docker',
        readTime: '13m read',
        topics: ['docker', 'containers', 'packaging'],
      },
      {
        id: 'ms-7-3',
        number: '7.3',
        title: 'Kubernetes Desired State & The Reconciliation Loop Mental Model',
        description:
          'Declaring intent: "ensure three replicas of catalogue service exist". How control loops continuously drive cluster reality to match desired state.',
        status: 'upcoming',
        noteSlug: 'kubernetes-desired-state-reconciliation-loop',
        readTime: '12m read',
        topics: ['kubernetes', 'control-loops', 'devops'],
      },
      {
        id: 'ms-7-4',
        number: '7.4',
        title: 'Pods, Deployments, and Services: The Core Trio of Kubernetes Workloads',
        description:
          'Pods as ephemeral compute units, Deployments managing replica rolling updates, and Services providing stable cluster DNS virtual IPs.',
        status: 'upcoming',
        noteSlug: 'kubernetes-pods-deployments-and-services',
        readTime: '14m read',
        topics: ['kubernetes', 'pods', 'deployments', 'services'],
      },
      {
        id: 'ms-7-5',
        number: '7.5',
        title: 'Horizontal vs Vertical Scaling: Stateless Processes & Autoscaling',
        description:
          'Why adding stateless instances beats scaling up CPU cores. Configuring Kubernetes Horizontal Pod Autoscalers (HPA) on load metrics.',
        status: 'upcoming',
        noteSlug: 'horizontal-vs-vertical-scaling-stateless-hpa',
        readTime: '12m read',
        topics: ['scaling', 'hpa', 'statelessness'],
      },
      {
        id: 'ms-7-6',
        number: '7.6',
        title: 'Zero-Downtime Deployment Strategies: Rolling Updates, Blue-Green & Canaries',
        description:
          'Progressive rolling updates, blue-green environment switches, and canary traffic slicing using weighted ingress gateways.',
        status: 'upcoming',
        noteSlug: 'zero-downtime-deployments-rolling-blue-green-canary',
        readTime: '15m read',
        topics: ['deployments', 'canary', 'blue-green'],
      },
      {
        id: 'ms-7-7',
        number: '7.7',
        title: 'Configuration & Secrets Management: ConfigMaps, Secrets & Dynamic Injection',
        description:
          'Injecting application settings at boot time without rebuilding Docker images. Mounting Kubernetes ConfigMaps and Secrets as environment variables.',
        status: 'upcoming',
        noteSlug: 'configuration-and-secrets-management-kubernetes',
        readTime: '13m read',
        topics: ['configmaps', 'secrets', 'kubernetes'],
      },
      {
        id: 'ms-7-8',
        number: '7.8',
        title: 'Zero-Downtime Database Migrations: The Expand-and-Contract Schema Pattern',
        description:
          'Ensuring databases tolerate both old and new microservice versions simultaneously during rolling deployments. Safe column and table migrations.',
        status: 'upcoming',
        noteSlug: 'zero-downtime-database-migrations-expand-contract',
        readTime: '14m read',
        topics: ['database-migrations', 'zero-downtime', 'flyway'],
      },
      {
        id: 'ms-7-9',
        number: '7.9',
        title: 'Module 7 Exit Check & Mini-Build: Docker Compose Orchestration & Kubernetes Rolling Update Lab',
        description:
          'Containerize EduNest microservices with Docker Compose, deploy one service to local minikube/kind, and execute zero-downtime rolling update.',
        status: 'upcoming',
        noteSlug: 'module-7-exit-check-docker-kubernetes-lab',
        readTime: '16m read',
        topics: ['docker-compose', 'kubernetes', 'lab'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 8 — Security and configuration (Weight 6% · ~4 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ms-mod-08',
    number: '08',
    title: 'Security and configuration',
    description:
      'Goal: assume the network is hostile, including inside — Fallacy 4 (“the network is secure”) is the one that gets companies breached.',
    lessons: [
      {
        id: 'ms-8-1',
        number: '8.1',
        title: 'Zero Trust Architecture: Rejecting Perimeter Security Inside the Cluster',
        description:
          'Why assuming internal cluster networks are safe leads to catastrophic lateral breaches. Authenticating and authorizing every internal hop.',
        status: 'upcoming',
        noteSlug: 'zero-trust-architecture-internal-security',
        readTime: '13m read',
        topics: ['zero-trust', 'security', 'distributed-systems'],
      },
      {
        id: 'ms-8-2',
        number: '8.2',
        title: 'Service Identity & Mutual TLS (mTLS): Cryptographic Machine-to-Machine Auth',
        description:
          'Proving service identity via X.509 certificates and encrypting all cluster communication bidirectionally without code modifications.',
        status: 'upcoming',
        noteSlug: 'service-identity-and-mutual-tls-mtls',
        readTime: '14m read',
        topics: ['mtls', 'cryptography', 'service-identity'],
      },
      {
        id: 'ms-8-3',
        number: '8.3',
        title: 'Authentication vs Authorization: Edge Identity vs Service-Level Permissions',
        description:
          'Who you are (Identity) vs what you are permitted to do (Permissions). Scoped RBAC/ABAC role enforcement across distributed endpoints.',
        status: 'upcoming',
        noteSlug: 'authentication-vs-authorization-in-microservices',
        readTime: '12m read',
        topics: ['authn', 'authz', 'rbac'],
      },
      {
        id: 'ms-8-4',
        number: '8.4',
        title: 'Token Architecture: OAuth2, OpenID Connect & Stateless JWT Verification',
        description:
          'Identity providers issuing signed JWT tokens. Asymmetric key verification (JWKS) allowing microservices to validate signatures without network lookups.',
        status: 'upcoming',
        noteSlug: 'token-architecture-oauth2-oidc-jwt',
        readTime: '15m read',
        topics: ['oauth2', 'jwt', 'oidc'],
      },
      {
        id: 'ms-8-5',
        number: '8.5',
        title: 'The Gateway Security Edge: Authenticate Once at Ingress, Propagate Claims Downstream',
        description:
          'Gateway validates client credentials and injects sanitized internal tokens (UserContext headers) into downstream microservice requests.',
        status: 'upcoming',
        noteSlug: 'gateway-security-edge-token-propagation',
        readTime: '14m read',
        topics: ['api-gateway', 'security', 'token-propagation'],
      },
      {
        id: 'ms-8-6',
        number: '8.6',
        title: 'Secrets Management & Rotation: HashiCorp Vault, Kubernetes Secrets & Dynamic Leases',
        description:
          'Never baking passwords or API keys into source code or Docker images. Storing secrets in external vaults with short-lived leases and automatic rotation.',
        status: 'upcoming',
        noteSlug: 'secrets-management-and-dynamic-rotation',
        readTime: '13m read',
        topics: ['vault', 'secrets', 'rotation'],
      },
      {
        id: 'ms-8-7',
        number: '8.7',
        title: 'Least Privilege & Blast Radius Minimization: Restricting Service Permissions',
        description:
          'The Enrolment service may call Payment, but must never call the billing database directly or read admin queues. Limiting breach blast radius.',
        status: 'upcoming',
        noteSlug: 'least-privilege-and-blast-radius-minimization',
        readTime: '13m read',
        topics: ['least-privilege', 'blast-radius', 'security'],
      },
      {
        id: 'ms-8-8',
        number: '8.8',
        title: 'Module 8 Exit Check & Mini-Build: Gateway JWT Authentication & Downstream Token Propagation Lab',
        description:
          'Configure JWT validation on Spring Cloud Gateway, propagate user identity headers to services, and extract secret tokens to runtime environment variables.',
        status: 'upcoming',
        noteSlug: 'module-8-exit-check-jwt-propagation-lab',
        readTime: '16m read',
        topics: ['jwt', 'spring-security', 'lab'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 9 — Testing and evolving the system (Weight 6% · ~4 hrs)
  // -----------------------------------------------------------------------
  {
    id: 'ms-mod-09',
    number: '09',
    title: 'Testing and evolving the system',
    description:
      'Goal: change the system safely while it is running — because the system never stops for you to test it.',
    lessons: [
      {
        id: 'ms-9-1',
        number: '9.1',
        title: 'The Reshaped Testing Pyramid: Unit, Component, Contract & E2E Tests',
        description:
          'Inverting the inverted pyramid: fast unit tests, component tests with Testcontainers, boundary contract tests, and a small suite of golden-path E2E tests.',
        status: 'upcoming',
        noteSlug: 'reshaped-testing-pyramid-for-microservices',
        readTime: '14m read',
        topics: ['testing', 'test-pyramid', 'testcontainers'],
      },
      {
        id: 'ms-9-2',
        number: '9.2',
        title: 'Consumer-Driven Contract Testing with Pact: The Load-Bearing Test Layer',
        description:
          'Consumers write tests declaring expected payloads; providers verify contracts in their CI pipelines. Catching breaking API changes before deployment.',
        status: 'upcoming',
        noteSlug: 'consumer-driven-contracts-with-pact',
        readTime: '16m read',
        topics: ['contract-testing', 'pact', 'ci-cd'],
      },
      {
        id: 'ms-9-3',
        number: '9.3',
        title: 'Why End-to-End Tests Fail at Scale: Environmental Flakiness & Maintenance Nightmares',
        description:
          'Why full-system E2E test suites with 50+ services become untrusted maintenance liabilities that train developers to ignore pipeline failures.',
        status: 'upcoming',
        noteSlug: 'why-end-to-end-tests-fail-at-scale',
        readTime: '12m read',
        topics: ['e2e-testing', 'anti-patterns', 'flaky-tests'],
      },
      {
        id: 'ms-9-4',
        number: '9.4',
        title: 'Testing in Production: Feature Flags, Canary Slicing & Shadow Traffic',
        description:
          'The only tests that exercise real data and real user behavior. Feature flags as instant kill-switches and shadow traffic mirroring.',
        status: 'upcoming',
        noteSlug: 'testing-in-production-flags-canary-shadowing',
        readTime: '13m read',
        topics: ['feature-flags', 'shadow-traffic', 'production-testing'],
      },
      {
        id: 'ms-9-5',
        number: '9.5',
        title: 'The Strangler Fig Migration Pattern: Incremental Monolith Decomposition',
        description:
          'Never do a big-bang rewrite. Place a routing facade in front of the monolith, extract one service at a time, and shrink the monolith until zero legacy code remains.',
        status: 'upcoming',
        noteSlug: 'strangler-fig-migration-pattern-deep-dive',
        readTime: '15m read',
        topics: ['strangler-fig', 'monolith-migration', 'refactoring'],
      },
      {
        id: 'ms-9-6',
        number: '9.6',
        title: 'Service Extraction Order: Least Coupled and Highest Learning Value First',
        description:
          'Extracting the service that teaches the most about deployment infrastructure with the least coupling. Leaving complex relational tables for later phases.',
        status: 'upcoming',
        noteSlug: 'service-extraction-order-heuristics',
        readTime: '13m read',
        topics: ['extraction-order', 'architecture-strategy', 'migration'],
      },
      {
        id: 'ms-9-7',
        number: '9.7',
        title: 'The Reverse Gear: Merging Microservices Back When Boundaries Prove Wrong',
        description:
          'Recognizing when service cuts create friction, chatty network hops, or coordination bottlenecks. Overcoming ego and merging services back together.',
        status: 'upcoming',
        noteSlug: 'the-reverse-gear-merging-services-back',
        readTime: '12m read',
        topics: ['refactoring', 'merging-services', 'pragmatism'],
      },
      {
        id: 'ms-9-8',
        number: '9.8',
        title: 'Module 9 Exit Check & Mini-Build: Pact Consumer-Driven Contract Testing Lab',
        description:
          'Author a Pact contract for the catalogue-to-enrolment boundary. Break the provider contract intentionally to verify CI build failure before deployment.',
        status: 'upcoming',
        noteSlug: 'module-9-exit-check-pact-contract-testing-lab',
        readTime: '16m read',
        topics: ['pact', 'contract-testing', 'lab'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Module 10 — Capstone: split EduNest (~6 hrs · no new reading)
  // -----------------------------------------------------------------------
  {
    id: 'ms-mod-10',
    number: '10',
    title: 'Capstone: split EduNest',
    description:
      'Goal: prove the whole course on a system you already know — a design document and a working skeleton, not a demo that only works on your laptop.',
    lessons: [
      {
        id: 'ms-10-1',
        number: '10.1',
        title: 'Capstone Deconstruction: Splitting EduNest into Four Microservices',
        description:
          'Catalogue (courses, search), Enrolment (seats, enrolment flow), User (profiles, roles), and Payment stub (simulated transactions with controlled failure rates).',
        status: 'upcoming',
        noteSlug: 'capstone-edunest-four-service-decomposition',
        readTime: '16m read',
        topics: ['capstone', 'edunest', 'decomposition'],
      },
      {
        id: 'ms-10-2',
        number: '10.2',
        title: 'Data Architecture & Distributed Enrolment Saga Implementation',
        description:
          'Database-per-service for all four domains, API composition for catalog views, and an enrolment -> payment -> seat reservation saga with compensating actions.',
        status: 'upcoming',
        noteSlug: 'capstone-edunest-database-per-service-and-saga',
        readTime: '18m read',
        topics: ['capstone', 'saga', 'database-per-service'],
      },
      {
        id: 'ms-10-3',
        number: '10.3',
        title: 'Gateway, Resilience & Distributed Observability Pipeline Wiring',
        description:
          'Spring Cloud Gateway ingress with Eureka discovery, Resilience4j circuit breakers on payment calls, and OpenTelemetry end-to-end trace correlation in Jaeger.',
        status: 'upcoming',
        noteSlug: 'capstone-edunest-gateway-resilience-observability',
        readTime: '18m read',
        topics: ['capstone', 'resilience4j', 'opentelemetry'],
      },
      {
        id: 'ms-10-4',
        number: '10.4',
        title: 'Production Deliverables & The Failure Walkthrough Exit Defense',
        description:
          'Authoring the Bounded Context Design Document, the 1-page Decision Log, and narrating the complete failure lifecycle when payment goes down during enrolment.',
        status: 'upcoming',
        noteSlug: 'capstone-edunest-production-artifacts-and-exit-defense',
        readTime: '20m read',
        topics: ['capstone', 'adr', 'exit-defense'],
      },
    ],
  },
];

export const microservicesPath: LearningPath = {
  id: 'microservices',
  slug: 'microservices',
  title: 'Microservices from First Principles',
  description:
    'Learn microservices the way real engineers think about them — distribution changes the physics, every pattern is a trade-off, and the tool is never the point.',
  subjectSlug: 'backend-distributed-systems',
  icon: 'hub',
  level: 'Production Scale',
  estimatedDuration: '11 Modules • 92 Lessons',
  modules: microservicesModules,
};
