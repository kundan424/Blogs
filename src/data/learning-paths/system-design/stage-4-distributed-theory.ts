import { LearningModule } from '../../../types';

export const stage4Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // STAGE 4: DISTRIBUTED SYSTEMS THEORY — THE FUNDAMENTAL LAWS OF PHYSICS
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-09',
    number: '09',
    title: 'Distributed Theory — The Fallacies & The Trade-Off Theorems',
    description:
      'The 8 Fallacies of Distributed Computing, deconstructing the CAP Theorem, and the PACELC trade-off theorem during normal vs partitioned operating states.',
    lessons: [
      {
        id: 'sd-9-1',
        number: '9.1',
        title: 'The 8 Fallacies of Distributed Computing: Designing for Partial Failure',
        noteSlug: 'the-eight-fallacies-of-distributed-computing-and-partial-failure',
        description:
          'Why the network is not reliable, latency is not zero, and bandwidth is not infinite; handling packet drops, jitter, and GC stop-the-world pauses.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['fallacies', 'distributed-systems', 'partial-failure', 'networking'],
      },
      {
        id: 'sd-9-2',
        number: '9.2',
        title: 'The CAP Theorem Deconstructed: Why Network Partitions Make "CA" Impossible',
        noteSlug: 'the-cap-theorem-deconstructed-why-ca-is-impossible',
        description:
          'Consistency vs Availability vs Partition Tolerance; why network splits are physical realities, and how systems choose between CP and AP guarantees.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['cap-theorem', 'theory', 'consistency', 'availability', 'partitions'],
      },
      {
        id: 'sd-9-3',
        number: '9.3',
        title: 'The PACELC Theorem: Trade-Offs in Normal vs Partitioned Operating States',
        noteSlug: 'the-pacelc-theorem-normal-vs-partitioned-trade-offs',
        description:
          'Extending CAP to normal operations: evaluating Latency vs Consistency when no partition exists; contrasting DynamoDB (PA/EL) with Spanner (PC/EC).',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['pacelc', 'distributed-storage', 'tradeoffs', 'system-design'],
      },
    ],
  },
  {
    id: 'sd-mod-10',
    number: '10',
    title: 'Distributed Theory — Consistency Models & Distributed Consensus',
    description:
      'The spectrum of distributed consistency models, the split-brain dilemma, quorum intersection math, and consensus via Paxos and Raft.',
    lessons: [
      {
        id: 'sd-10-1',
        number: '10.1',
        title: 'The Spectrum of Distributed Consistency: Strong, Linearizable, Causal & Eventual',
        noteSlug: 'the-spectrum-of-distributed-consistency-linearizable-to-eventual',
        description:
          'Linearizability, Sequential Consistency, Causal Consistency, Monotonic Reads, and Eventual Consistency across distributed storage nodes.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['consistency-models', 'linearizability', 'causality', 'distributed-systems'],
      },
      {
        id: 'sd-10-2',
        number: '10.2',
        title: 'The Split-Brain Dilemma & Quorum Mathematics (floor(N/2) + 1)',
        noteSlug: 'the-split-brain-dilemma-and-quorum-mathematics',
        description:
          'Preventing split-brain dual leaders during network partitions; quorum intersection equations (R + W > N) and why odd-numbered clusters are mandatory.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['split-brain', 'quorum', 'consensus', 'fault-tolerance'],
      },
      {
        id: 'sd-10-3',
        number: '10.3',
        title: 'Distributed Consensus Protocols: Paxos and The Raft State Machine',
        noteSlug: 'distributed-consensus-protocols-paxos-and-the-raft-state-machine',
        description:
          'The Raft consensus protocol: Leader election terms, replicated state machine logs, heartbeat leases, and commit index progression.',
        status: 'upcoming',
        readTime: '26m read',
        topics: ['raft', 'paxos', 'consensus', 'state-machine-replication'],
      },
      {
        id: 'sd-10-4',
        number: '10.4',
        title: 'Production Consensus Engines: etcd, ZooKeeper & HashiCorp Consul',
        noteSlug: 'production-consensus-engines-etcd-zookeeper-consul',
        description:
          'How production systems apply consensus: etcd for Kubernetes state leases, ZooKeeper for Kafka broker metadata, and Consul for service mesh coordination.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['etcd', 'zookeeper', 'consul', 'kubernetes', 'infrastructure'],
      },
    ],
  },
];
