import { LearningModule } from '../../../types';

export const stage8Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // STAGE 8: RELIABILITY ENGINEERING, RATE LIMITING & RESILIENCE
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-17',
    number: '17',
    title: 'Resilience Tier — Rate Limiting & Traffic Shaping',
    description:
      'Rate limiting algorithms: Token Bucket, Leaky Bucket, and Sliding Window Counter; and distributed atomic rate limiting in Redis with Lua scripts.',
    lessons: [
      {
        id: 'sd-17-1',
        number: '17.1',
        title: 'Rate Limiting Algorithms: Token Bucket vs Leaky Bucket vs Sliding Window Counter',
        noteSlug: 'rate-limiting-algorithms-token-bucket-leaky-bucket-sliding-window',
        description:
          'Burst tolerance in Token Bucket, constant-rate traffic smoothing in Leaky Bucket, and preventing double-limit abuse at window boundaries with sliding counters.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['rate-limiting', 'token-bucket', 'leaky-bucket', 'traffic-shaping'],
      },
      {
        id: 'sd-17-2',
        number: '17.2',
        title: 'Distributed Rate Limiting: Atomic Lua Scripts in Redis for Single Round-Trip Enforcement',
        noteSlug: 'distributed-rate-limiting-atomic-lua-scripts-in-redis',
        description:
          'Eliminating race conditions in multi-server fleets; executing atomic Lua scripts on Redis single-threaded loops; evaluating tokens and setting TTLs in 1 RTT.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['redis-lua', 'distributed-rate-limiting', 'concurrency', 'redis'],
      },
    ],
  },
  {
    id: 'sd-mod-18',
    number: '18',
    title: 'Resilience Tier — Fault Isolation & Graceful Degradation',
    description:
      'Circuit breakers, timeouts and distributed deadlines, exponential backoff with full jitter against retry stampedes, bulkheads, and graceful degradation.',
    lessons: [
      {
        id: 'sd-18-1',
        number: '18.1',
        title: 'The Circuit Breaker Pattern: Closed, Open & Half-Open State Machines',
        noteSlug: 'the-circuit-breaker-pattern-states-thresholds-and-resilience4j',
        description:
          'Preventing thread starvation and cascading failures; state transitions in Resilience4j and Envoy; error rate thresholds and fallback responses.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['circuit-breaker', 'resilience4j', 'fault-tolerance', 'microservices'],
      },
      {
        id: 'sd-18-2',
        number: '18.2',
        title: 'Call Resilience: Strict Timeouts, Distributed Deadlines & Context Propagation',
        noteSlug: 'call-resilience-strict-timeouts-distributed-deadlines-propagation',
        description:
          'Setting P99-based connection and read timeouts; propagating remaining execution deadlines across gRPC/HTTP headers to abort abandoned downstream processing.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['timeouts', 'deadlines', 'context-propagation', 'grpc', 'resilience'],
      },
      {
        id: 'sd-18-3',
        number: '18.3',
        title: 'Retrying Safely: Exponential Backoff with Full Jitter against Stampeding Herds',
        noteSlug: 'retrying-safely-exponential-backoff-with-full-jitter',
        description:
          'Why naive retries crush recovering downstream services into infinite re-collapse; implementing Full Jitter equations to decorrelate retry bursts.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['exponential-backoff', 'jitter', 'thundering-herd', 'retry-patterns'],
      },
      {
        id: 'sd-18-4',
        number: '18.4',
        title: 'Resource Isolation: The Bulkhead Pattern & Graceful Feature Degradation',
        noteSlug: 'resource-isolation-the-bulkhead-pattern-and-graceful-degradation',
        description:
          'Isolating thread pools and socket connections by business domain; sacrificing secondary recommendation features to protect revenue-critical checkout paths.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['bulkhead', 'graceful-degradation', 'chaos-engineering', 'netflix'],
      },
    ],
  },
];
