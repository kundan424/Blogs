import { LearningModule } from '../../../types';

export const stage3Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // STAGE 3: SCALING THE DATA TIER — REPLICATION & PARTITIONING
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-07',
    number: '07',
    title: 'Data Tier — Storage Paradigms & Database Replication',
    description:
      'The polyglot persistence spectrum, Relational ACID vs NoSQL storage engines, Primary-Replica replication, WAL streaming, and the Read-Your-Own-Writes pattern.',
    lessons: [
      {
        id: 'sd-7-1',
        number: '7.1',
        title: 'The Polyglot Persistence Spectrum: Relational ACID vs NoSQL Engines',
        noteSlug: 'polyglot-persistence-spectrum-relational-acid-vs-nosql',
        description:
          'ACID transactional guarantees, B-Trees, relational normalization, and why modern architectures trade away SQL joins for horizontal scale.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['rdbms', 'acid', 'nosql', 'databases', 'system-design'],
      },
      {
        id: 'sd-7-2',
        number: '7.2',
        title: 'Specialized NoSQL Paradigms: Key-Value, Document & Wide-Column (Cassandra)',
        noteSlug: 'specialized-nosql-paradigms-key-value-document-wide-column',
        description:
          'In-memory key-value lookups, document BSON trees, and wide-column SSTable/LSM-tree append-only logs for massive write workloads.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['cassandra', 'mongodb', 'dynamodb', 'nosql', 'storage-engines'],
      },
      {
        id: 'sd-7-3',
        number: '7.3',
        title: 'Scaling Read Throughput: Primary-Replica Architecture & WAL Streaming',
        noteSlug: 'scaling-read-throughput-primary-replica-and-wal-streaming',
        description:
          'Primary master handling 100% of mutations, asynchronous Write-Ahead Log (WAL) streaming, read replicas, and consensus-driven automated failover.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['replication', 'postgresql', 'wal', 'high-availability', 'databases'],
      },
      {
        id: 'sd-7-4',
        number: '7.4',
        title: 'The Replication Lag Dilemma: Eventual Consistency & Read-Your-Own-Writes',
        noteSlug: 'replication-lag-eventual-consistency-and-read-your-own-writes',
        description:
          'Asynchronous network propagation delays, stale replica reads, and routing active user mutations to the primary via the Read-Your-Own-Writes pattern.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['eventual-consistency', 'replication-lag', 'patterns', 'distributed-data'],
      },
    ],
  },
  {
    id: 'sd-mod-08',
    number: '08',
    title: 'Data Tier — Horizontal Partitioning & Consistent Hashing',
    description:
      'Database sharding keys, consistent hashing rings, virtual nodes for hotspot mitigation, and resolving cross-shard joins and distributed transactions.',
    lessons: [
      {
        id: 'sd-8-1',
        number: '8.1',
        title: 'Database Sharding Strategies: Range-Based vs Hash-Based Partitioning',
        noteSlug: 'database-sharding-strategies-range-vs-hash-partitioning',
        description:
          'Horizontal vs vertical partitioning, choosing effective sharding keys, range-based skew pitfalls, and why modulo hashing causes catastrophic resharding.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['sharding', 'partitioning', 'database-scaling', 'architecture'],
      },
      {
        id: 'sd-8-2',
        number: '8.2',
        title: 'Consistent Hashing: The 2^32 - 1 Virtual Ring & Key Remapping Math',
        noteSlug: 'consistent-hashing-the-virtual-ring-and-key-remapping',
        description:
          'Mapping servers and keys onto a circular keyspace, clockwise traversal, and the mathematical proof that node changes only remap K/N keys.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['consistent-hashing', 'algorithms', 'distributed-systems', 'hash-ring'],
      },
      {
        id: 'sd-8-3',
        number: '8.3',
        title: 'Virtual Nodes in Consistent Hashing: Eliminating Hotspots & Data Skew',
        noteSlug: 'virtual-nodes-in-consistent-hashing-eliminating-hotspots',
        description:
          'Why small clusters produce unbalanced hash ring segments, implementing virtual token assignments, and accommodating heterogeneous server capacities.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['virtual-nodes', 'consistent-hashing', 'load-balancing', 'algorithms'],
      },
      {
        id: 'sd-8-4',
        number: '8.4',
        title: 'The Hidden Costs of Sharding: Cross-Shard Joins & Distributed Transactions',
        noteSlug: 'the-hidden-costs-of-sharding-cross-shard-joins-and-transactions',
        description:
          'Scatter-gather network queries, application-layer joins, Two-Phase Commit penalties, and Instagram entity co-location patterns.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['sharding-tradeoffs', 'cross-shard-joins', 'distributed-transactions', 'databases'],
      },
    ],
  },
];
