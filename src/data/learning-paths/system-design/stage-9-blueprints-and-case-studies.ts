import { LearningModule } from '../../../types';

export const stage9Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // STAGE 9: THE SYSTEM DESIGN BLUEPRINT & ICONIC CASE STUDIES
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-19',
    number: '19',
    title: 'The 4-Step System Design Blueprint',
    description:
      'The repeatable 4-step framework: scoping requirements, back-of-the-envelope capacity estimations, high-level component topologies, and deep-dive bottleneck resolution.',
    lessons: [
      {
        id: 'sd-19-1',
        number: '19.1',
        title: 'Step 1 & 2: Clarifying Scope, SLAs & Back-of-the-Envelope Capacity Estimations',
        noteSlug: 'step-1-and-2-clarifying-scope-and-back-of-the-envelope-calculations',
        description:
          'Scoping functional vs non-functional requirements, availability SLAs, calculating average and peak QPS, 5-year storage growth, and network bandwidth in MB/s.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['interview-prep', 'framework', 'capacity-estimation', 'math'],
      },
      {
        id: 'sd-19-2',
        number: '19.2',
        title: 'Step 3 & 4: High-Level Component Topology, API Contracts & Bottleneck Deep Dives',
        noteSlug: 'step-3-and-4-high-level-topology-api-contracts-and-bottlenecks',
        description:
          'Drafting API contracts (REST/gRPC), drawing end-to-end component data flows, modeling schemas, and systematically resolving single points of failure.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['high-level-design', 'api-contracts', 'bottlenecks', 'system-design'],
      },
    ],
  },
  {
    id: 'sd-mod-20',
    number: '20',
    title: 'Iconic Case Study 1 — Planet-Scale URL Shortener (TinyURL / Bitly)',
    description:
      'Designing a sub-10ms URL shortening system: Base62 encoding, distributed 64-bit ID generators, 301 vs 302 redirects, and partitioned key-value storage.',
    lessons: [
      {
        id: 'sd-20-1',
        number: '20.1',
        title: 'URL Shortener Architecture: Base62 Encoding, Distributed ID Generation & 301 vs 302',
        noteSlug: 'url-shortener-architecture-base62-distributed-ids-and-redirects',
        description:
          'Base62 encoding across 7 characters (3.5 trillion URLs), collision-free 64-bit IDs using Twitter Snowflake and ZooKeeper ranges, and 301 vs 302 redirect analytics.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['tinyurl', 'base62', 'snowflake-ids', 'http-redirects', 'case-study'],
      },
      {
        id: 'sd-20-2',
        number: '20.2',
        title: 'URL Shortener Scaling: Partitioned Key-Value Stores, Hot Key Caching & Analytics',
        noteSlug: 'url-shortener-scaling-partitioned-kv-stores-and-analytics',
        description:
          'Partitioning DynamoDB/Cassandra by hash of alias, multi-tiered Redis caching for viral links, and asynchronous clickstream tracking via Kafka.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['nosql', 'dynamodb', 'caching', 'clickstream-analytics', 'case-study'],
      },
    ],
  },
  {
    id: 'sd-mod-21',
    number: '21',
    title: 'Iconic Case Study 2 — High-Throughput Social Timeline (Twitter / Instagram)',
    description:
      'Designing a dynamic social media timeline: Fan-out on write (push) vs Fan-out on read (pull), in-memory Redis feed storage, and solving the Celebrity Problem.',
    lessons: [
      {
        id: 'sd-21-1',
        number: '21.1',
        title: 'Social Feed Fundamentals: Fan-Out-on-Write (Push) vs Fan-Out-on-Read (Pull)',
        noteSlug: 'social-feed-fundamentals-fan-out-on-write-vs-fan-out-on-read',
        description:
          'Pre-computing follower inboxes in Redis lists for O(1) instant reads vs querying and merge-sorting tweets on the fly at read time.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['feed-design', 'fan-out', 'twitter-architecture', 'redis', 'case-study'],
      },
      {
        id: 'sd-21-2',
        number: '21.2',
        title: 'Solving the Celebrity Problem: Hybrid Dynamic Feed Generation & In-Memory Redis Inboxes',
        noteSlug: 'solving-the-celebrity-problem-hybrid-dynamic-feed-generation',
        description:
          'Why the push model collapses when a user with 180M followers posts; the hybrid architecture: push for regular users and dynamic query merge for celebrities.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['celebrity-problem', 'hybrid-feed', 'redis-inbox', 'performance', 'case-study'],
      },
    ],
  },
  {
    id: 'sd-mod-22',
    number: '22',
    title: 'Iconic Case Study 3 — Real-Time Geospatial Dispatch (Uber / Lyft)',
    description:
      'Real-time geospatial matching: Geohash vs Google S2 vs Uber H3 hexagonal spatial indexing, persistent WebSockets, and sub-second ride dispatch engines.',
    lessons: [
      {
        id: 'sd-22-1',
        number: '22.1',
        title: 'Geospatial Partitioning: Geohashes vs Google S2 & Uber H3 Hexagonal Hierarchies',
        noteSlug: 'geospatial-partitioning-geohash-vs-google-s2-and-uber-h3',
        description:
          'Why SQL radius queries choke under 1M driver pings; base32 Geohash prefixes vs Uber H3 discrete global hexagonal grid decomposition.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['geospatial', 'geohash', 'uber-h3', 'google-s2', 'case-study'],
      },
      {
        id: 'sd-22-2',
        number: '22.2',
        title: 'Real-Time Ride Matching: WebSocket Location Ingress, Redis GEO & Sub-Second Dispatch',
        noteSlug: 'real-time-ride-matching-websocket-ingress-and-redis-geo',
        description:
          'Persistent bi-directional WebSocket location streaming, Redis GEO sorted set radius queries, and distributed state machines matching riders to nearby drivers.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['websockets', 'redis-geo', 'uber-dispatch', 'real-time', 'case-study'],
      },
    ],
  },
  {
    id: 'sd-mod-23',
    number: '23',
    title: 'Master Reference, Trade-off Matrix & The Hall of Fame',
    description:
      'The 0-to-100M Scale Milestone Matrix, production readiness architectural checklist, and curated Hall of Fame engineering resources and blogs.',
    lessons: [
      {
        id: 'sd-23-1',
        number: '23.1',
        title: 'The 0-to-100M Scale Milestone Matrix & Production Architecture Checklist',
        noteSlug: 'the-zero-to-100m-scale-milestone-matrix-and-checklist',
        description:
          'The master reference matrix mapping Stages 0 through 9 by user scale, core architectural questions, and the production readiness verification checklist.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['reference-matrix', 'scale-roadmap', 'production-checklist', 'cheatsheet'],
      },
      {
        id: 'sd-23-2',
        number: '23.2',
        title: 'The Hall of Fame: Essential Books, Interactive Sandboxes & Planet-Scale Engineering Blogs',
        noteSlug: 'system-design-hall-of-fame-books-sandboxes-and-blogs',
        description:
          'The definitive library of distributed systems classics: DDIA, System Design Primer, visual consensus sandboxes, and engineering blogs from Uber, Netflix, and Discord.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['resources', 'books', 'engineering-blogs', 'learning-path'],
      },
    ],
  },
];
