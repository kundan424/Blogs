import { LearningModule } from '../../../types';

export const phase3Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // PHASE 3: DATA PERSISTENCE WITH SPRING DATA JPA & HIBERNATE
  // -----------------------------------------------------------------------
  {
    id: 'sb-mod-13',
    number: '13',
    title: 'ORM Fundamentals & Hibernate Entity Mapping',
    description:
      'Object-relational impedance mismatch, JDBC vs JPA vs Hibernate architecture, entity lifecycle, primary keys, schema constraints, and value types.',
    lessons: [
      {
        id: 'sb-13-1',
        number: '13.1',
        title: 'The Object-Relational Impedance Mismatch',
        noteSlug: 'spring-boot-object-relational-impedance-mismatch-raw-jdbc-orm-foundations',
        description:
          'First principles of why Java objects and relational database tables clash (granularity, inheritance, identity vs. equality, associations, and data navigation), why raw JDBC becomes boilerplate-heavy at scale, and what problem an ORM actually solves.',
        status: 'published',
        readTime: '20m read',
        topics: ['impedance-mismatch', 'orm', 'jdbc', 'jpa', 'database-design'],
      },
      {
        id: 'sb-13-2',
        number: '13.2',
        title: 'JDBC vs. JPA vs. Hibernate: How the Stack Fits Together',
        noteSlug: 'spring-boot-jdbc-jpa-hibernate-spring-data-persistence-stack-architecture',
        description:
          'Clarifying the exact architectural boundary between the JDBC API (driver layer), Jakarta Persistence / JPA (specification), Hibernate (implementation provider), and Spring Data JPA (repository abstraction layer).',
        status: 'published',
        readTime: '22m read',
        topics: ['jdbc', 'jpa', 'hibernate', 'spring-data-jpa', 'architecture'],
      },
      {
        id: 'sb-13-3',
        number: '13.3',
        title: 'Anatomy of a JPA Entity & Lifecycle Rules',
        noteSlug: 'spring-boot-anatomy-jpa-entity-lifecycle-rules-equals-hashcode',
        description:
          'Writing a clean @Entity and @Table class from scratch: the mandatory no-arg constructor (protected vs. public), why entities must not be final, and safely implementing equals() and hashCode() without breaking Hibernate proxies or Set collections.',
        status: 'published',
        readTime: '22m read',
        topics: ['jpa', 'hibernate', 'entity-lifecycle', 'equals-hashcode', 'clean-code'],
      },
      {
        id: 'sb-13-4',
        number: '13.4',
        title: 'Primary Key Strategies & ID Generation in Production',
        noteSlug: 'spring-boot-primary-key-strategies-id-generation-sequence-identity-uuidv7',
        description:
          '@Id and @GeneratedValue mechanics: deep dive into production strategies: SEQUENCE (Hibernate pooled optimizer for PostgreSQL/Oracle), IDENTITY (MySQL mechanics and why it disables JDBC batch inserts), and UUID (UUIDv4 vs time-ordered UUIDv7 for B-Tree index performance).',
        status: 'published',
        readTime: '24m read',
        topics: ['primary-keys', 'sequence-generator', 'uuidv7', 'hibernate-performance', 'postgresql'],
      },
      {
        id: 'sb-13-5',
        number: '13.5',
        title: 'Column Mapping, Nullability & Schema Constraints',
        noteSlug: 'spring-boot-column-mapping-nullability-schema-constraints-transient',
        description:
          'Mapping Java fields to database columns with @Column (nullable, unique, length, precision, scale, columnDefinition), the critical difference between Java-side validation (@NotNull) and database-level DDL constraints (nullable = false), and @Transient non-persisted fields.',
        status: 'published',
        readTime: '22m read',
        topics: ['column-mapping', 'schema-constraints', 'validation', 'ddl', 'jpa'],
      },
      {
        id: 'sb-13-6',
        number: '13.6',
        title: 'Enums, Dates & Auditing Timestamps',
        noteSlug: 'spring-boot-enums-dates-auditing-timestamps-hibernate-mapping',
        description:
          'Mapping non-primitive standard types safely: why @Enumerated(EnumType.STRING) is mandatory over ORDINAL, mapping java.time (Instant, LocalDate, OffsetDateTime) without timezone bugs, and automating createdAt / updatedAt with @CreationTimestamp and @UpdateTimestamp.',
        status: 'published',
        readTime: '22m read',
        topics: ['enums', 'java-time', 'auditing', 'timestamps', 'hibernate'],
      },
      {
        id: 'sb-13-7',
        number: '13.7',
        title: 'Value Objects, Embeddables & JSON Columns',
        description:
          'Modeling rich domain concepts without extra tables: @Embeddable and @Embedded value objects (Address, Money), @AttributeOverrides for multiple embeddables in one entity, and Hibernate 6 native @JdbcTypeCode(SqlTypes.JSON) for flexible JSONB payloads.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['embeddables', 'value-objects', 'jsonb', 'postgresql', 'hibernate-6'],
      },
    ],
  },
  {
    id: 'sb-mod-14',
    number: '14',
    title: 'Entity Relationships & Performance Tuning',
    description:
      'Associations, owning sides, cascading, solving N+1 query storms, disabling OSIV, and high-performance DTO projections.',
    lessons: [
      {
        id: 'sb-14-1',
        number: '14.1',
        title: '@ManyToOne & @OneToMany: Owning Sides and Bidirectional Sync',
        noteSlug: 'spring-boot-many-to-one-one-to-many-owning-side-bidirectional-sync',
        description:
          'Foreign key ownership in relational schemas, why FetchType.LAZY is mandatory on all associations, and implementing synchronized addChild() / removeChild() helper methods.',
        status: 'published',
        readTime: '22m read',
        topics: ['many-to-one', 'one-to-many', 'jpa-relationships', 'lazy-loading', 'hibernate'],
      },
      {
        id: 'sb-14-2',
        number: '14.2',
        title: '@OneToOne with @MapsId & Join Entities vs. @ManyToMany',
        noteSlug: 'spring-boot-one-to-one-maps-id-join-entities-vs-many-to-many',
        description:
          'Shared primary key @OneToOne with @MapsId to eliminate eager proxy traps and extra indexes, and replacing naive @ManyToMany with an explicit Join Entity for real-world domain models.',
        status: 'published',
        readTime: '20m read',
        topics: ['one-to-one', 'maps-id', 'join-entity', 'many-to-many', 'database-design'],
      },
      {
        id: 'sb-14-3',
        number: '14.3',
        title: 'Cascade Types, orphanRemoval & Reference Proxies',
        noteSlug: 'spring-boot-cascade-types-orphan-removal-reference-proxies',
        description:
          'CascadeType.PERSIST and MERGE semantics, why CascadeType.REMOVE on child sides is dangerous, orphanRemoval = true for aggregate roots, and getReferenceById() to avoid redundant SELECTs.',
        status: 'published',
        readTime: '20m read',
        topics: ['cascade-types', 'orphan-removal', 'entity-proxies', 'get-reference-by-id', 'clean-code'],
      },
      {
        id: 'sb-14-4',
        number: '14.4',
        title: 'Persistence Context, Dirty Checking & Disabling OSIV',
        description:
          'Entity state transitions in the persistence context, why calling save() inside @Transactional is redundant, and disabling Spring Boot Open Session in View (OSIV) to prevent connection leaks.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['persistence-context', 'dirty-checking', 'osiv', 'open-session-in-view', 'connection-management'],
      },
      {
        id: 'sb-14-5',
        number: '14.5',
        title: 'Solving the N+1 Problem: JOIN FETCH, @EntityGraph & Batch Fetching',
        description:
          'Diagnosing SQL query storms in logs, resolving single-collection N+1s with JPQL JOIN FETCH and @EntityGraph, and using default_batch_fetch_size for safe multi-collection fetching.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['n-plus-one', 'join-fetch', 'entity-graph', 'batch-fetching', 'performance-tuning'],
      },
      {
        id: 'sb-14-6',
        number: '14.6',
        title: 'Pagination Pitfalls & DTO Projections (Records & Interfaces)',
        description:
          'Why combining JOIN FETCH with Pageable triggers fatal in-memory pagination warnings (HHH90003004), and how Spring Data JPA Record and Interface DTO Projections eliminate entity overhead.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['pagination', 'dto-projections', 'java-records', 'query-optimization', 'spring-data-jpa'],
      },
    ],
  },
  {
    id: 'sb-mod-15',
    number: '15',
    title: 'Spring Data JPA Repositories',
    description:
      'Repository abstraction layers, derived queries, JPQL vs native SQL, and server-side pagination.',
    lessons: [
      {
        id: 'sb-15-1',
        number: '15.1',
        title: 'Repository Hierarchy: CrudRepository to JpaRepository Abstractions',
        noteSlug: 'spring-boot-repository-hierarchy-crud-repository-jpa-repository',
        description:
          'Repository → CrudRepository → PagingAndSortingRepository → JpaRepository contract hierarchy and query method proxy generation.',
        status: 'published',
        readTime: '20m read',
        topics: ['spring-data-jpa', 'repositories'],
      },
      {
        id: 'sb-15-2',
        number: '15.2',
        title: 'Derived Queries & Custom JPQL / Native Queries with @Query',
        noteSlug: 'spring-boot-derived-queries-custom-jpql-native-sql-modifying',
        description:
          'Method name query derivation heuristics (findByEmailAndStatus), type-safe JPQL vs database-specific Native SQL, and bulk updates with @Modifying.',
        status: 'published',
        readTime: '20m read',
        topics: ['spring-data-jpa', 'jpql', 'native-sql', 'derived-queries', 'query-optimization'],
      },
      {
        id: 'sb-15-3',
        number: '15.3',
        title: 'Pagination, Sorting & Slice Query Execution',
        noteSlug: 'spring-boot-pagination-sorting-slice-query-execution',
        description:
          'High-volume query pagination: Pageable, Sort orders, comparing Page<T> (executes count(*) query) vs Slice<T> (infinite scrolling with zero count overhead).',
        status: 'published',
        readTime: '20m read',
        topics: ['pagination', 'sorting', 'slice', 'keyset-pagination', 'performance-tuning', 'spring-data-jpa'],
      },
    ],
  },
  {
    id: 'sb-mod-16',
    number: '16',
    title: 'Transaction Management with @Transactional',
    description:
      'ACID transactional boundaries, AOP proxies, propagation levels, isolation mechanics, locking strategies, and programmatic synchronization.',
    lessons: [
      {
        id: 'sb-16-1',
        number: '16.1',
        title: 'ACID Fundamentals & The Spring PlatformTransactionManager Abstraction',
        description:
          'First principles of transactions, why raw JDBC transaction management fails at scale, and how Spring abstracts persistence engines via PlatformTransactionManager.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['transactions', 'acid', 'jdbc', 'platform-transaction-manager', 'spring-boot'],
      },
      {
        id: 'sb-16-2',
        number: '16.2',
        title: 'How @Transactional Works: AOP Proxies, ThreadLocal & The Self-Invocation Trap',
        description:
          'Deconstructing Spring AOP transaction interception, ThreadLocal connection binding, why private methods fail silently, and solving the self-invocation proxy bypass trap.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['transactional', 'aop-proxies', 'self-invocation', 'thread-local', 'clean-code'],
      },
      {
        id: 'sb-16-3',
        number: '16.3',
        title: 'Transaction Propagation: REQUIRED, REQUIRES_NEW & Connection Pool Deadlocks',
        description:
          'Deep dive into all 7 propagation behaviors, transaction suspension, and avoiding the catastrophic HikariCP connection pool starvation deadlock with REQUIRES_NEW.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['propagation', 'requires-new', 'hikaricp', 'connection-pool', 'deadlock-prevention'],
      },
      {
        id: 'sb-16-4',
        number: '16.4',
        title: 'Isolation Levels, Concurrency Anomalies & Locking Strategies',
        description:
          'Dirty reads, non-repeatable reads, phantom reads, comparing READ_COMMITTED vs REPEATABLE_READ, and choosing between @Version optimistic locking and PESSIMISTIC_WRITE.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['isolation-levels', 'optimistic-locking', 'pessimistic-locking', 'concurrency', 'acid'],
      },
      {
        id: 'sb-16-5',
        number: '16.5',
        title: 'Rollback Mechanics, Checked Exceptions & The readOnly = true Optimization',
        description:
          'Why checked exceptions do not trigger rollbacks by default, configuring rollbackFor, how readOnly = true bypasses Hibernate dirty-checking, and routing to read replicas.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['rollback-rules', 'checked-exceptions', 'readonly-transactions', 'performance-tuning', 'hibernate'],
      },
      {
        id: 'sb-16-6',
        number: '16.6',
        title: 'Programmatic Transactions with TransactionTemplate & After-Commit Events',
        description:
          'Why long-running @Transactional methods wrapping HTTP calls are an anti-pattern, using TransactionTemplate for micro-transactions, and @TransactionalEventListener for outbox patterns.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['transaction-template', 'transactional-event-listener', 'transactional-outbox', 'microservices', 'clean-architecture'],
      },
    ],
  },
  {
    id: 'sb-mod-17',
    number: '17',
    title: 'Database Migrations with Flyway & Liquibase',
    description:
      'Deterministic database versioning, zero-downtime schema evolution, and production migration best practices.',
    lessons: [
      {
        id: 'sb-17-1',
        number: '17.1',
        title: 'Automated Schema Evolution: Versioned Migrations with Flyway in Production',
        description:
          'Why ddl-auto: update destroys production data, SQL migration naming conventions (V1__init.sql, R__views.sql), schema baseline tables, and backward-compatible schema changes.',
        status: 'upcoming',
        readTime: '10m read',
        topics: ['flyway', 'database-migrations', 'devops'],
      },
    ],
  },
];
