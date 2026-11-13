import { LearningModule } from '../../../types';

export const stage7Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // STAGE 7: PLANET-SCALE ARCHITECTURE — GLOBAL MULTI-REGION & EDGE
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-15',
    number: '15',
    title: 'Planet-Scale Tier — Global Ingress & Edge Compute',
    description:
      'The speed of light physical barrier, GeoDNS vs BGP Anycast routing, and running serverless V8 workers directly at CDN edge Points of Presence.',
    lessons: [
      {
        id: 'sd-15-1',
        number: '15.1',
        title: 'The Physical Speed of Light: Global Latency Constraints & Fiber Delays',
        noteSlug: 'the-physical-speed-of-light-global-latency-constraints',
        description:
          'Photon propagation speed through fiber glass (~200,000 km/s), transatlantic RTT boundaries, and why software optimization cannot beat physics.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['speed-of-light', 'physics', 'latency', 'networking', 'global-systems'],
      },
      {
        id: 'sd-15-2',
        number: '15.2',
        title: 'Global Traffic Routing: GeoDNS Resolution vs BGP Anycast Single-IP Convergence',
        noteSlug: 'global-traffic-routing-geodns-vs-bgp-anycast',
        description:
          'GeoDNS resolution mechanics and TTL failover delays vs Border Gateway Protocol (BGP) Anycast announcing identical IPs for instant edge convergence.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['geodns', 'anycast', 'bgp', 'routing', 'dns'],
      },
      {
        id: 'sd-15-3',
        number: '15.3',
        title: 'Edge Computing: Running V8 Serverless Workers at CDN Points of Presence',
        noteSlug: 'edge-computing-running-v8-workers-at-cdn-pops',
        description:
          'V8 isolate runtimes with Cloudflare Workers and AWS Lambda@Edge; moving auth validation, bot protection, and A/B experiments to the 20ms boundary.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['edge-compute', 'cloudflare-workers', 'serverless', 'cdn'],
      },
    ],
  },
  {
    id: 'sd-mod-16',
    number: '16',
    title: 'Planet-Scale Tier — Multi-Region Active-Active Databases & Consensus',
    description:
      'Active-Passive DR vs Active-Active multi-master database topologies, Last-Write-Wins clock skew traps, CRDT deterministic merging, and Google Spanner TrueTime.',
    lessons: [
      {
        id: 'sd-16-1',
        number: '16.1',
        title: 'Multi-Region Database Topologies: Active-Passive (DR) vs Active-Active Multi-Master',
        noteSlug: 'multi-region-database-topologies-active-passive-vs-active-active',
        description:
          'RPO and RTO in Active-Passive failover vs Active-Active multi-region writes, local write latency reduction, and concurrent update collision hazards.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['multi-region', 'active-active', 'disaster-recovery', 'rpo-rto'],
      },
      {
        id: 'sd-16-2',
        number: '16.2',
        title: 'Multi-Master Conflict Resolution: The Fatal Clock Skew Trap of Last-Write-Wins (LWW)',
        noteSlug: 'multi-master-conflict-resolution-the-fatal-clock-skew-trap-of-lww',
        description:
          'Why server wall-clock timestamps cannot be trusted, NTP clock drift errors, and how a 50ms skew silently destroys newer, valid production writes.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['clock-skew', 'last-write-wins', 'ntp', 'distributed-clocks'],
      },
      {
        id: 'sd-16-3',
        number: '16.3',
        title: 'Conflict-Free Replicated Data Types (CRDTs): Mathematical Deterministic Merging',
        noteSlug: 'conflict-free-replicated-data-types-crdts-deterministic-merging',
        description:
          'Semilattice mathematics (Associative, Commutative, Idempotent operations); CvRDT state vs CmRDT op models; G-Counter, PN-Counter, and real-world collaborative apps.',
        status: 'upcoming',
        readTime: '26m read',
        topics: ['crdts', 'distributed-math', 'collaborative-apps', 'conflict-resolution'],
      },
      {
        id: 'sd-16-4',
        number: '16.4',
        title: 'Planet-Scale External Consistency: Google Cloud Spanner & The TrueTime Atomic Clock API',
        noteSlug: 'planet-scale-external-consistency-google-spanner-truetime',
        description:
          'Atomic clocks and GPS receivers in every Google datacenter; bounding clock uncertainty (epsilon ~7ms) to achieve global serializable ACID transactions.',
        status: 'upcoming',
        readTime: '26m read',
        topics: ['google-spanner', 'truetime', 'atomic-clocks', 'linearizability', 'acid'],
      },
    ],
  },
];
