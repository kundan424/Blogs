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
      'Object-relational impedance mismatch, JPA specification vs Hibernate provider, and core entity mapping.',
    lessons: [
      {
        id: 'sb-13-1',
        number: '13.1',
        title: 'Object-Relational Impedance Mismatch & JPA vs Hibernate Specifications',
        description:
          'The five dimensions of impedance mismatch (granularity, subtypes, identity, associations, navigation), JPA standards, and Hibernate Session / EntityManager mechanics.',
        status: 'upcoming',
        readTime: '11m read',
        topics: ['jpa', 'hibernate', 'orm', 'database'],
      },
      {
        id: 'sb-13-2',
        number: '13.2',
        title: 'Domain Entity Mapping: @Entity, Identifiers, Columns & Value Types',
        description:
          'Mapping relational tables: @Entity, @Table, @Id strategies (IDENTITY, SEQUENCE, TABLE), @Column attributes, @Enumerated (STRING vs ORDINAL), and @Embedded value objects.',
        status: 'upcoming',
        readTime: '10m read',
        topics: ['jpa', 'hibernate', 'entity-mapping'],
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
          'Repository $\rightarrow$ CrudRepository $\rightarrow$ PagingAndSortingRepository $\rightarrow$ JpaRepository contract hierarchy and query method proxy generation.',
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
