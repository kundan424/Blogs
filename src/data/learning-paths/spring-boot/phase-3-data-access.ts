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
        description:
          'Mapping Java fields to database columns with @Column (nullable, unique, length, precision, scale, columnDefinition), the critical difference between Java-side validation (@NotNull) and database-level DDL constraints (nullable = false), and @Transient non-persisted fields.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['column-mapping', 'schema-constraints', 'validation', 'ddl', 'jpa'],
      },
      {
        id: 'sb-13-6',
        number: '13.6',
        title: 'Enums, Dates & Auditing Timestamps',
        description:
          'Mapping non-primitive standard types safely: why @Enumerated(EnumType.STRING) is mandatory over ORDINAL, mapping java.time (Instant, LocalDate, OffsetDateTime) without timezone bugs, and automating createdAt / updatedAt with @CreationTimestamp and @UpdateTimestamp.',
        status: 'upcoming',
        readTime: '16m read',
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
      'Bidirectional associations, cascade propagation, fetch strategies, and resolving N+1 select queries.',
    lessons: [
      {
        id: 'sb-14-1',
        number: '14.1',
        title: 'Associations & Cascade Strategies: @OneToMany, @ManyToOne, @ManyToMany',
        description:
          'Owning vs inverse side (mappedBy), bidirectional sync helper methods, CascadeType semantics (PERSIST, MERGE, REMOVE), and orphanRemoval.',
        status: 'upcoming',
        readTime: '13m read',
        topics: ['jpa', 'hibernate', 'relationships'],
      },
      {
        id: 'sb-14-2',
        number: '14.2',
        title: 'Eliminating the N+1 Query Problem: JOIN FETCH & Dynamic @EntityGraph',
        description:
          'Why FetchType.EAGER is a production hazard, lazy loading mechanics, bytecode enhancement, and solving N+1 query storms using JOIN FETCH queries and JPA @EntityGraph.',
        status: 'upcoming',
        readTime: '14m read',
        topics: ['performance', 'hibernate', 'query-optimization'],
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
        description:
          'Repository → CrudRepository → PagingAndSortingRepository → JpaRepository contract hierarchy and query method proxy generation.',
        status: 'upcoming',
        readTime: '08m read',
        topics: ['spring-data-jpa', 'repositories'],
      },
      {
        id: 'sb-15-2',
        number: '15.2',
        title: 'Derived Queries & Custom JPQL / Native Queries with @Query',
        description:
          'Method name query derivation heuristics (findByEmailAndStatus), type-safe JPQL vs database-specific Native SQL, and bulk updates with @Modifying.',
        status: 'upcoming',
        readTime: '11m read',
        topics: ['spring-data-jpa', 'jpql', 'sql'],
      },
      {
        id: 'sb-15-3',
        number: '15.3',
        title: 'Pagination, Sorting & Slice Query Execution',
        description:
          'High-volume query pagination: Pageable, Sort orders, comparing Page<T> (executes count(*) query) vs Slice<T> (infinite scrolling with zero count overhead).',
        status: 'upcoming',
        readTime: '09m read',
        topics: ['pagination', 'performance', 'spring-data-jpa'],
      },
    ],
  },
  {
    id: 'sb-mod-16',
    number: '16',
    title: 'Transaction Management with @Transactional',
    description:
      'ACID transactional boundaries, propagation levels, isolation mechanics, and dynamic proxy bypass traps.',
    lessons: [
      {
        id: 'sb-16-1',
        number: '16.1',
        title: 'Transaction Boundaries: Propagation, Isolation Levels, readOnly & Rollback Semantics',
        description:
          'REQUIRED vs REQUIRES_NEW, isolation levels (READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE), readOnly = true dirty-checking bypass, and self-invocation proxy bypass pitfalls.',
        status: 'upcoming',
        readTime: '13m read',
        topics: ['transactions', 'acid', 'spring-boot', 'database'],
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
