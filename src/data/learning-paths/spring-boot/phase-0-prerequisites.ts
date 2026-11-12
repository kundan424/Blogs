import { LearningModule } from '../../../types';

export const phase0Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // PHASE 0: PREREQUISITES (BUILD TOOLS & NETWORK/DB)
  // -----------------------------------------------------------------------
  {
    id: 'sb-mod-01',
    number: '01',
    title: 'Build Tools & Version Control (Maven & Git)',
    description:
      'Build lifecycle management, POM coordinates, dependency resolution graphs, plugins, and production Git version control workflows from first principles.',
    lessons: [
      {
        id: 'sb-1-1',
        number: '1.1',
        title: 'Maven Architecture & Build Lifecycle (POM, Plugins, Lifecycle Phases)',
        noteSlug: 'maven-architecture-build-lifecycle-pom-plugins-phases',
        description:
          'Coordinates (groupId, artifactId, version), dependency tree scopes, plugin execution goals, and standard lifecycle phases (compile, test, package, install).',
        status: 'published',
        readTime: '20m read',
        topics: ['maven', 'build-tools', 'devops'],
      },
      {
        id: 'sb-1-2',
        number: '1.2',
        title: 'Git Architecture & Production Workflows: Under the Hood, DAG & Branching',
        noteSlug: 'git-architecture-advanced-workflows-branching-merging-rebase',
        description:
          'Understand Git from first principles: object store internals (Blobs, Trees, Commits), DAG graphs, branch pointers, fast-forward vs 3-way merges, rebasing, and emergency recovery with reflog.',
        status: 'published',
        readTime: '24m read',
        topics: ['git', 'version-control', 'devops', 'backend'],
      },
    ],
  },
  {
    id: 'sb-mod-02',
    number: '02',
    title: 'Basic Networking & Relational Databases',
    description:
      'HTTP wire protocol, status code semantics, header negotiation, SQL query mechanics, and ACID guarantees.',
    lessons: [
      {
        id: 'sb-2-1',
        number: '2.1',
        title: 'HTTP Protocol Internals: Methods, Status Codes, Headers & Cookies',
        noteSlug: 'http-protocol-methods-status-codes-headers-cookies',
        description:
          'HTTP request/response framing, idempotency across GET/PUT/DELETE/PATCH, cache headers, cookies, and 2xx/3xx/4xx/5xx status code taxonomy.',
        status: 'published',
        readTime: '22m read',
        topics: ['http', 'networking', 'rest-api', 'spring-boot'],
      },
      {
        id: 'sb-2-2',
        number: '2.2',
        title: 'Relational Database Fundamentals: SQL Joins, Indexes, ACID & Normalization',
        noteSlug: 'relational-database-fundamentals-sql-joins-indexes-acid-normalization',
        description:
          'Relational modeling, inner/outer joins, B-Tree index scan vs sequential scan, normalization forms, and ACID transaction guarantees under load.',
        status: 'published',
        readTime: '24m read',
        topics: ['sql', 'database', 'rdbms', 'acid'],
      },
    ],
  },
];
