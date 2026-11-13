import { LearningModule } from '../../../types';

export const stage2Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // STAGE 2: SCALING THE READ PATH — CACHING STRATEGIES & CDNS
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-05',
    number: '05',
    title: 'Read Path — Multi-Tier Caching & Invalidation Patterns',
    description:
      'The multi-tier caching hierarchy from browser to database buffer pools, Cache-Aside vs Write-Through vs Write-Back, and memory eviction policies.',
    lessons: [
      {
        id: 'sd-5-1',
        number: '5.1',
        title: 'The Multi-Tier Caching Hierarchy: From Browser to Database Buffer Pools',
        noteSlug: 'the-multi-tier-caching-hierarchy-browser-to-db-buffer-pools',
        description:
          'Browser caching, CDN edge points of presence, distributed application memory (Redis/Memcached), and DBMS internal buffer pools.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['caching', 'redis', 'cdn', 'performance', 'architecture'],
      },
      {
        id: 'sd-5-2',
        number: '5.2',
        title: 'Cache Access Patterns: Cache-Aside (Lazy Loading) vs Write-Through',
        noteSlug: 'cache-access-patterns-cache-aside-vs-write-through',
        description:
          'Lazy loading trade-offs, cold-start query penalties, synchronous dual-write overhead, and maintaining consistency between cache and primary datastores.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['cache-aside', 'write-through', 'caching-patterns', 'redis'],
      },
      {
        id: 'sd-5-3',
        number: '5.3',
        title: 'Asynchronous Cache Writes: Write-Back (Write-Behind) and Durability Risks',
        noteSlug: 'asynchronous-cache-writes-write-back-and-durability-risks',
        description:
          'In-memory mutation speed, asynchronous batch database flushing, handling cache node power failures, and write durability guarantees.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['write-behind', 'durability', 'performance', 'caching'],
      },
      {
        id: 'sd-5-4',
        number: '5.4',
        title: 'Memory Reclamation & Eviction Policies: LRU, LFU, FIFO & Sliding TTL',
        noteSlug: 'memory-reclamation-and-eviction-policies-lru-lfu-ttl',
        description:
          'Doubly-linked list + hash map mechanics in LRU, frequency counters in LFU, active vs passive TTL expiration passes, and Redis memory management.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['lru', 'lfu', 'eviction', 'redis-internals', 'memory'],
      },
    ],
  },
  {
    id: 'sd-mod-06',
    number: '06',
    title: 'Read Path — Edge Delivery & The Three Classic Cache Disasters',
    description:
      'Edge CDN acceleration and surviving the three fatal cache failure modes: Cache Penetration, Cache Breakdown (Thundering Herd), and Cache Avalanche.',
    lessons: [
      {
        id: 'sd-6-1',
        number: '6.1',
        title: 'Edge Delivery & CDNs: Geographically Distributed Static & Dynamic Delivery',
        noteSlug: 'edge-delivery-and-cdns-static-and-dynamic-acceleration',
        description:
          'Anycast edge points of presence, Origin Shielding, surrogate-key cache invalidation, and achieving >99% cache hit ratios for static and dynamic media.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['cdn', 'edge', 'cloudflare', 'caching', 'networking'],
      },
      {
        id: 'sd-6-2',
        number: '6.2',
        title: 'Cache Disaster 1: Cache Penetration & Space-Efficient Bloom Filters in RAM',
        noteSlug: 'cache-penetration-and-space-efficient-bloom-filters',
        description:
          'Attackers querying non-existent keys to bypass cache and hammer databases; bit-array hashing math, zero false negatives, and O(1) RAM pre-checks.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['bloom-filters', 'cache-penetration', 'data-structures', 'security'],
      },
      {
        id: 'sd-6-3',
        number: '6.3',
        title: 'Cache Disaster 2: Cache Breakdown (The Thundering Herd) & Single-Flight Mutexes',
        noteSlug: 'cache-breakdown-thundering-herd-and-single-flight-mutexes',
        description:
          'Sudden expiration of ultra-hot keys causing 50,000 concurrent database queries; distributed mutex locking (SETNX) and probabilistic early expiration (XFetch).',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['thundering-herd', 'cache-breakdown', 'concurrency', 'distributed-locks'],
      },
      {
        id: 'sd-6-4',
        number: '6.4',
        title: 'Cache Disaster 3: Cache Avalanche & TTL Jitter Engineering',
        noteSlug: 'cache-avalanche-and-ttl-jitter-engineering',
        description:
          'Simultaneous expiration of thousands of keys crashing downstream datastores; implementing randomized TTL jitter and resilient cache-warming strategies.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['cache-avalanche', 'ttl', 'resilience', 'reliability'],
      },
    ],
  },
];
