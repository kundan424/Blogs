import { LearningModule } from '../../../types';

export const stage1Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // 1.0 Scalability
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-1-0',
    number: '1.0',
    title: 'Scalability',
    description: "Why adding servers doesn't fix everything.",
    lessons: [
      {
        id: 'sd-1-0-1',
        number: '1.0.1',
        title: 'Scalability',
        noteSlug: 'scalability',
        description: 'Defining scalability vs performance, throughput ceilings, resource bottlenecks, and the limits of compute.',
        status: 'upcoming',
        readTime: '15m read',
        topics: ['scalability', 'system-design', 'architecture', 'performance'],
      },
      {
        id: 'sd-1-0-2',
        number: '1.0.2',
        title: 'Vertical vs horizontal',
        noteSlug: 'vertical-vs-horizontal',
        description: 'Scaling up hardware limits, exponential pricing, downtime, vs scaling out stateless commodity nodes with load balancing.',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['scaling', 'horizontal-scaling', 'vertical-scaling', 'infrastructure'],
      },
      {
        id: 'sd-1-0-3',
        number: '1.0.3',
        title: 'Performance vs scalability',
        noteSlug: 'performance-vs-scalability',
        description: 'Fast for one user vs maintaining response times when traffic surges by 100x; Amdahl’s Law and Universal Scalability Law.',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['performance', 'scalability', 'benchmarking', 'system-design'],
      },
      {
        id: 'sd-1-0-4',
        number: '1.0.4',
        title: 'Stateful vs stateless',
        noteSlug: 'stateful-vs-stateless',
        description: 'Eliminating sticky session traps, offloading session state to Redis, and designing completely stateless application tiers.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['stateless', 'stateful', 'session-management', 'architecture'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 1.1 Latency and Throughput
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-1-1',
    number: '1.1',
    title: 'Latency and Throughput',
    description: 'Fast for one user is not the same as fast for a million.',
    lessons: [
      {
        id: 'sd-1-1-1',
        number: '1.1.1',
        title: 'Latency vs throughput',
        noteSlug: 'latency-vs-throughput',
        description: 'Understanding execution delay vs requests per second, Little’s Law, concurrency, and queueing theory basics.',
        status: 'upcoming',
        readTime: '15m read',
        topics: ['latency', 'throughput', 'littles-law', 'metrics'],
      },
      {
        id: 'sd-1-1-2',
        number: '1.1.2',
        title: 'Tail latency and p99',
        noteSlug: 'tail-latency-and-p99',
        description: 'Why averages lie: p50, p95, p99, p99.9 latencies, coordinated omission, GC pauses, and hedging fan-out queries.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['tail-latency', 'p99', 'observability', 'performance'],
      },
      {
        id: 'sd-1-1-3',
        number: '1.1.3',
        title: 'Why is it slow?',
        noteSlug: 'why-is-it-slow',
        description: 'Systematic diagnosis: CPU saturation, I/O wait, lock contention, network hops, memory leaks, and GC overhead.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['debugging', 'profiling', 'performance', 'bottlenecks'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 1.2 Availability and Reliability
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-1-2',
    number: '1.2',
    title: 'Availability and Reliability',
    description: "Why 99.9% and 99.99% are very different promises.",
    lessons: [
      {
        id: 'sd-1-2-1',
        number: '1.2.1',
        title: 'Availability and the nines',
        noteSlug: 'availability-and-the-nines',
        description: 'Calculating downtime: 99.9% (8.76h/yr) vs 99.99% (52.6m/yr) vs 99.999% (5.26m/yr), and what each extra 9 costs.',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['availability', 'sla', 'reliability', 'nines'],
      },
      {
        id: 'sd-1-2-2',
        number: '1.2.2',
        title: 'Single points of failure',
        noteSlug: 'single-points-of-failure',
        description: 'Identifying SPOFs across DNS, load balancers, master databases, power supplies, switches, and deployment pipelines.',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['spof', 'reliability', 'architecture', 'fault-tolerance'],
      },
      {
        id: 'sd-1-2-3',
        number: '1.2.3',
        title: 'Failover',
        noteSlug: 'failover',
        description: 'Active-passive vs active-active failover, heartbeat detection, split-brain hazards, and automatic DNS failovers.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['failover', 'active-passive', 'active-active', 'high-availability'],
      },
      {
        id: 'sd-1-2-4',
        number: '1.2.4',
        title: 'Fault tolerance',
        noteSlug: 'fault-tolerance',
        description: 'Designing systems that degrade gracefully under component death without cascading failure or data corruption.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['fault-tolerance', 'resilience', 'system-design', 'chaos'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 1.3 Consistency Models
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-1-3',
    number: '1.3',
    title: 'Consistency Models',
    description: 'What a reader is allowed to see after a write.',
    lessons: [
      {
        id: 'sd-1-3-1',
        number: '1.3.1',
        title: 'Linearizable, causal, eventual',
        noteSlug: 'linearizable-causal-eventual',
        description: 'The spectrum of consistency guarantees: real-time global ordering vs causal dependency vs eventual convergence.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['consistency-models', 'linearizability', 'causality', 'distributed-systems'],
      },
      {
        id: 'sd-1-3-2',
        number: '1.3.2',
        title: 'Strong vs eventual',
        noteSlug: 'strong-vs-eventual-consistency',
        description: 'Performance and availability penalties of synchronous coordination vs stale reads and conflict reconciliation in AP stores.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['strong-consistency', 'eventual-consistency', 'cap-theorem', 'trade-offs'],
      },
      {
        id: 'sd-1-3-3',
        number: '1.3.3',
        title: 'Read-your-writes',
        noteSlug: 'read-your-writes',
        description: 'Preventing the ghost update bug: routing recent user writes to the primary, version cookies, and sticky master reads.',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['read-your-writes', 'replication-lag', 'consistency', 'databases'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 1.4 Back-of-the-Envelope Estimation
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-1-4',
    number: '1.4',
    title: 'Back-of-the-Envelope Estimation',
    description: 'Sizing a system before you draw it.',
    lessons: [
      {
        id: 'sd-1-4-1',
        number: '1.4.1',
        title: 'Estimation',
        noteSlug: 'estimation',
        description: 'Converting DAU to QPS, read/write ratios, peak multipliers (2x-5x), and rounding rules of thumb.',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['back-of-envelope', 'estimation', 'interview-guide', 'capacity-planning'],
      },
      {
        id: 'sd-1-4-2',
        number: '1.4.2',
        title: 'Numbers to know',
        noteSlug: 'numbers-to-know',
        description: 'Powers of two, seconds in a day (86,400), Jeff Dean latency numbers (L1 cache, RAM, SSD, datacenter round trip).',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['latency-numbers', 'hardware', 'rules-of-thumb', 'performance'],
      },
      {
        id: 'sd-1-4-3',
        number: '1.4.3',
        title: 'Capacity planning',
        noteSlug: 'capacity-planning',
        description: 'Calculating storage volume over 5 years, memory cache requirements (80/20 Pareto rule), and network bandwidth egress.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['capacity-planning', 'storage-sizing', 'bandwidth', 'system-design'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 1.5 How to Approach a System Design Question
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-1-5',
    number: '1.5',
    title: 'How to Approach a System Design Question',
    description: 'The round, the framework and the traps.',
    lessons: [
      {
        id: 'sd-1-5-1',
        number: '1.5.1',
        title: 'How the round works',
        noteSlug: 'how-the-round-works',
        description: 'What staff and principal interviewers evaluate: communication, trade-off depth, breadth, ownership, and failure recovery.',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['interview-guide', 'framework', 'system-design', 'career'],
      },
      {
        id: 'sd-1-5-2',
        number: '1.5.2',
        title: 'The delivery framework',
        noteSlug: 'the-delivery-framework',
        description: '45-minute blueprint: Scope & Requirements (5m), Back-of-envelope (5m), High-Level Design (10m), Deep Dives (20m), Wrap-up (5m).',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['framework', 'interview-guide', 'system-design', 'communication'],
      },
      {
        id: 'sd-1-5-3',
        number: '1.5.3',
        title: 'Common mistakes',
        noteSlug: 'common-mistakes',
        description: 'Jumping to solutions too early, buzzword bingo, ignoring failure modes, forgetting scale constraints, and defensive arguing.',
        status: 'upcoming',
        readTime: '15m read',
        topics: ['interview-mistakes', 'traps', 'system-design', 'best-practices'],
      },
      {
        id: 'sd-1-5-4',
        number: '1.5.4',
        title: 'Interview checkpoint',
        noteSlug: 'interview-checkpoint',
        description: 'Self-assessment checklist to verify your preparedness before stepping into big tech senior/staff design loops.',
        status: 'upcoming',
        readTime: '14m read',
        topics: ['checklist', 'interview-guide', 'prep', 'system-design'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 1.6 Trade-off Thinking
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-1-6',
    number: '1.6',
    title: 'Trade-off Thinking',
    description: 'Every choice gives something up. Say what.',
    lessons: [
      {
        id: 'sd-1-6-1',
        number: '1.6.1',
        title: 'Ten design principles',
        noteSlug: 'ten-design-principles',
        description: 'Fundamental heuristics: KISS, YAGNI, fail fast, idempotency, loose coupling, defence in depth, and telemetry-first.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['design-principles', 'architecture', 'best-practices', 'heuristics'],
      },
      {
        id: 'sd-1-6-2',
        number: '1.6.2',
        title: 'Sync vs async',
        noteSlug: 'sync-vs-async',
        description: 'Synchronous blocking RPCs vs asynchronous message brokers: latency, coupling, backpressure, and error propagation.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['sync-vs-async', 'messaging', 'architecture', 'trade-offs'],
      },
      {
        id: 'sd-1-6-3',
        number: '1.6.3',
        title: 'Push vs pull',
        noteSlug: 'push-vs-pull',
        description: 'Fan-out on write (push) vs fan-out on read (pull): Twitter timeline architecture, celebrity hot keys, and hybrid designs.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['push-vs-pull', 'fan-out', 'social-media', 'architecture'],
      },
      {
        id: 'sd-1-6-4',
        number: '1.6.4',
        title: 'Cloud design patterns',
        noteSlug: 'cloud-design-patterns',
        description: 'Sidecar, Ambassador, Scatter-Gather, Circuit Breaker, Saga, Strangler Fig, and Competing Consumers patterns.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['design-patterns', 'cloud', 'microservices', 'architecture'],
      },
    ],
  },
];
