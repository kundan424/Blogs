import { LearningModule } from '../../../types';

export const stage3Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // 3.0 Consensus Protocols
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-3-0',
    number: '3.0',
    title: 'Consensus Protocols',
    description: 'Getting machines to agree on one answer.',
    lessons: [
      {
        id: 'sd-3-0-1',
        number: '3.0.1',
        title: 'Raft, Paxos, leader election',
        noteSlug: 'raft-paxos-leader-election',
        description: 'Replicated state machines, leader election terms, log replication, safety invariants, and commit quorum mechanics.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['consensus', 'raft', 'paxos', 'distributed-systems'],
      },
      {
        id: 'sd-3-0-2',
        number: '3.0.2',
        title: 'Distributed locks',
        noteSlug: 'distributed-locks',
        description: 'Redis Redlock vs ZooKeeper/etcd leases, fencing tokens, clock drift hazards, and Martin Kleppmann’s critique.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['distributed-locking', 'redlock', 'zookeeper', 'fencing-tokens'],
      },
      {
        id: 'sd-3-0-3',
        number: '3.0.3',
        title: 'Design a distributed lock',
        noteSlug: 'design-a-distributed-lock',
        description: 'Interview blueprint: designing a fault-tolerant distributed locking service with lease renewal, heartbeat threads, and fencing tokens.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['system-design', 'interview-guide', 'distributed-locks', 'etcd'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 3.1 Consistency Deep Dive
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-3-1',
    number: '3.1',
    title: 'Consistency Deep Dive',
    description: 'From linearizable to eventual, and what each costs.',
    lessons: [
      {
        id: 'sd-3-1-1',
        number: '3.1.1',
        title: 'Linearizability and causal consistency',
        noteSlug: 'linearizability-and-causal-consistency',
        description: 'Global real-time clock illusion vs tracking "happens-before" relationships with Lamport timestamps and vector clocks.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['linearizability', 'causality', 'consistency', 'distributed-systems'],
      },
      {
        id: 'sd-3-1-2',
        number: '3.1.2',
        title: 'Session guarantees: read-your-writes',
        noteSlug: 'session-guarantees-read-your-writes',
        description: 'Monotonic reads, monotonic writes, and read-your-writes in distributed multi-datacenter environments.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['session-guarantees', 'read-your-writes', 'replication', 'consistency'],
      },
      {
        id: 'sd-3-1-3',
        number: '3.1.3',
        title: 'Strong vs eventual, and what each costs',
        noteSlug: 'strong-vs-eventual-and-what-each-costs',
        description: 'Coordination overhead, network round-trips, throughput penalties, and choosing the right model per domain entity.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['trade-offs', 'strong-consistency', 'eventual-consistency', 'architecture'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 3.2 Quorums and Replication
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-3-2',
    number: '3.2',
    title: 'Quorums and Replication',
    description: 'R + W > N, and when it lies.',
    lessons: [
      {
        id: 'sd-3-2-1',
        number: '3.2.1',
        title: 'Quorums',
        noteSlug: 'quorums',
        description: 'Strict quorum math (R + W > N), overlap guarantees, concurrent write conflicts, and phantom reads under partial failures.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['quorums', 'replication', 'cassandra', 'distributed-systems'],
      },
      {
        id: 'sd-3-2-2',
        number: '3.2.2',
        title: 'Sloppy quorums and hinted handoff',
        noteSlug: 'sloppy-quorums-and-hinted-handoff',
        description: 'High availability during network partitions: temporary storage on healthy fallback nodes and hinted handoff delivery.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['sloppy-quorums', 'hinted-handoff', 'dynamo', 'availability'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 3.3 CAP and PACELC
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-3-3',
    number: '3.3',
    title: 'CAP and PACELC',
    description: "What you give up when the network splits, and when it doesn't.",
    lessons: [
      {
        id: 'sd-3-3-1',
        number: '3.3.1',
        title: 'CAP and PACELC',
        noteSlug: 'cap-and-pacelc',
        description: 'CAP Theorem limitations, PACELC formulation: If Partition (P) choose Availability (A) or Consistency (C); Else (E) choose Latency (L) or Consistency (C).',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['cap-theorem', 'pacelc', 'distributed-systems', 'trade-offs'],
      },
      {
        id: 'sd-3-3-2',
        number: '3.3.2',
        title: 'CP vs AP in practice',
        noteSlug: 'cp-vs-ap-in-practice',
        description: 'Comparing real-world databases: etcd/Spanner (CP) vs Cassandra/DynamoDB (AP), and how architectures mix both.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['cp', 'ap', 'databases', 'system-design'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 3.4 Clocks and Ordering
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-3-4',
    number: '3.4',
    title: 'Clocks and Ordering',
    description: 'Why "which came first" is hard.',
    lessons: [
      {
        id: 'sd-3-4-1',
        number: '3.4.1',
        title: 'Clocks and ordering',
        noteSlug: 'clocks-and-ordering',
        description: 'Physical wall clocks vs monotonic clocks, NTP clock skew, leap seconds, and why Last-Write-Wins (LWW) silently loses data.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['clocks', 'clock-skew', 'ntp', 'distributed-systems'],
      },
      {
        id: 'sd-3-4-2',
        number: '3.4.2',
        title: 'Lamport and vector clocks',
        noteSlug: 'lamport-and-vector-clocks',
        description: 'Logical timestamps for causal ordering, vector clocks for detecting concurrent conflicting writes, and version vectors.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['lamport-clocks', 'vector-clocks', 'causality', 'concurrency'],
      },
      {
        id: 'sd-3-4-3',
        number: '3.4.3',
        title: 'Hybrid logical clocks',
        noteSlug: 'hybrid-logical-clocks',
        description: 'Combining physical time with logical counters: HLCs in CockroachDB and MongoDB, bounded clock uncertainty, and TrueTime.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['hlc', 'hybrid-logical-clocks', 'cockroachdb', 'truetime'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 3.5 CRDTs
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-3-5',
    number: '3.5',
    title: 'CRDTs',
    description: 'Data types that merge without conflicts.',
    lessons: [
      {
        id: 'sd-3-5-1',
        number: '3.5.1',
        title: 'CRDT basics',
        noteSlug: 'crdt-basics',
        description: 'Conflict-Free Replicated Data Types: state-based (CvRDT) semilattices vs operation-based (CmRDT) commutative messages.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['crdt', 'distributed-systems', 'eventual-consistency', 'data-structures'],
      },
      {
        id: 'sd-3-5-2',
        number: '3.5.2',
        title: 'Counters, sets and registers',
        noteSlug: 'counters-sets-and-registers',
        description: 'PN-Counters, G-Sets, 2P-Sets, OR-Sets (Observed-Remove), and LWW-Element-Sets in collaborative applications.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['crdt', 'pn-counter', 'or-set', 'concurrency'],
      },
      {
        id: 'sd-3-5-3',
        number: '3.5.3',
        title: 'Collaborative text',
        noteSlug: 'collaborative-text',
        description: 'Sequence CRDTs (RGA, Fugue, YATA), character insertion/deletion interleaving, and powering Google Docs / Figma.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['crdt', 'collaborative-editing', 'yjs', 'automerge'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 3.6 Distributed Transactions
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-3-6',
    number: '3.6',
    title: 'Distributed Transactions',
    description: 'Keeping several services in step.',
    lessons: [
      {
        id: 'sd-3-6-1',
        number: '3.6.1',
        title: '2PC vs sagas',
        noteSlug: 'two-phase-commit-vs-sagas',
        description: 'Two-Phase Commit (2PC) blocking coordinator bottleneck vs Saga pattern with forward local transactions and compensating actions.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['2pc', 'sagas', 'distributed-transactions', 'microservices'],
      },
      {
        id: 'sd-3-6-2',
        number: '3.6.2',
        title: 'Transactional outbox',
        noteSlug: 'transactional-outbox',
        description: 'Dual-write problem prevention: saving domain entities and outbox events in a single DB transaction, CDC relay to Kafka.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['transactional-outbox', 'cdc', 'debezium', 'event-driven'],
      },
      {
        id: 'sd-3-6-3',
        number: '3.6.3',
        title: 'Workflow engines',
        noteSlug: 'workflow-engines',
        description: 'Temporal, Cadence, AWS Step Functions: durable code execution, automatic retries, event history replay, and state recovery.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['temporal', 'workflow-engines', 'orchestration', 'distributed-systems'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 3.7 Idempotency and Exactly-Once
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-3-7',
    number: '3.7',
    title: 'Idempotency and Exactly-Once',
    description: "Retries that don't charge twice.",
    lessons: [
      {
        id: 'sd-3-7-1',
        number: '3.7.1',
        title: 'At-least-once and exactly-once',
        noteSlug: 'at-least-once-and-exactly-once',
        description: 'Network packet duplicates, at-least-once delivery semantics, and why end-to-end "exactly-once" requires idempotent consumers.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['delivery-guarantees', 'at-least-once', 'exactly-once', 'messaging'],
      },
      {
        id: 'sd-3-7-2',
        number: '3.7.2',
        title: 'Idempotent consumers',
        noteSlug: 'idempotent-consumers',
        description: 'Deduplication tables, unique request IDs, optimistic concurrency control, and atomic write-then-publish patterns.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['idempotency', 'kafka', 'consumers', 'deduplication'],
      },
      {
        id: 'sd-3-7-3',
        number: '3.7.3',
        title: 'Design a unique ID generator',
        noteSlug: 'design-a-unique-id-generator',
        description: 'Interview blueprint: Twitter Snowflake, 64-bit ID layout (timestamp, worker ID, sequence), zero coordination, and clock skew guards.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['system-design', 'interview-guide', 'snowflake', 'distributed-id'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 3.8 Failure Detection
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-3-8',
    number: '3.8',
    title: 'Failure Detection',
    description: 'Telling slow from dead.',
    lessons: [
      {
        id: 'sd-3-8-1',
        number: '3.8.1',
        title: 'Heartbeats and timeouts',
        noteSlug: 'heartbeats-and-timeouts',
        description: 'Fixed timeouts vs adaptive phi-accrual failure detectors, false positives under GC pauses, and lease management.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['failure-detection', 'heartbeats', 'phi-accrual', 'timeouts'],
      },
      {
        id: 'sd-3-8-2',
        number: '3.8.2',
        title: 'Gossip',
        noteSlug: 'gossip-protocol',
        description: 'Decentralized peer-to-peer epidemic protocols: SWIM algorithm, suspicion mechanism, state dissemination, and cluster membership.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['gossip-protocol', 'swim', 'cassandra', 'consul'],
      },
      {
        id: 'sd-3-8-3',
        number: '3.8.3',
        title: 'Backend failure modes',
        noteSlug: 'backend-failure-modes',
        description: 'Gray failures, silent data corruption, slow disk degradation, thundering herds, and partial network partitions.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['failure-modes', 'reliability', 'distributed-systems', 'resilience'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 3.9 Consistent Hashing
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-3-9',
    number: '3.9',
    title: 'Consistent Hashing',
    description: 'Adding a server without moving everything.',
    lessons: [
      {
        id: 'sd-3-9-1',
        number: '3.9.1',
        title: 'Consistent hashing',
        noteSlug: 'consistent-hashing',
        description: 'Modulo hash failure on rebalancing ($O(N)$ key migration) vs the hash ring ($O(K/N)$ keys remapped), binary search lookups.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['consistent-hashing', 'hash-ring', 'sharding', 'caching'],
      },
      {
        id: 'sd-3-9-2',
        number: '3.9.2',
        title: 'Virtual nodes',
        noteSlug: 'consistent-hashing-virtual-nodes',
        description: 'Solving non-uniform key distribution on the ring: allocating 100-256 virtual nodes per physical machine to smooth variance.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['virtual-nodes', 'consistent-hashing', 'load-balancing', 'algorithms'],
      },
      {
        id: 'sd-3-9-3',
        number: '3.9.3',
        title: 'Design a key-value store',
        noteSlug: 'design-a-key-value-store',
        description: 'Interview blueprint: designing a distributed key-value store (Dynamo clone) with consistent hashing, virtual nodes, quorums, and vector clocks.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['system-design', 'interview-guide', 'key-value-store', 'dynamo'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 3.10 Merkle Trees and Anti-Entropy
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-3-10',
    number: '3.10',
    title: 'Merkle Trees and Anti-Entropy',
    description: 'Finding which replicas drifted, cheaply.',
    lessons: [
      {
        id: 'sd-3-10-1',
        number: '3.10.1',
        title: 'Merkle trees',
        noteSlug: 'merkle-trees',
        description: 'Cryptographic hash trees, hierarchical range comparison, $O(\log N)$ difference discovery, and git/blockchain internals.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['merkle-trees', 'cryptography', 'data-structures', 'anti-entropy'],
      },
      {
        id: 'sd-3-10-2',
        number: '3.10.2',
        title: 'Read repair and anti-entropy',
        noteSlug: 'read-repair-and-anti-entropy',
        description: 'Active background anti-entropy sync with Merkle trees vs opportunistic read repair during client read quorums.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['read-repair', 'anti-entropy', 'cassandra', 'replication'],
      },
    ],
  },
];
