import { LearningModule } from '../../../types';

export const stage1Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // STAGE 1: SCALING COMPUTE — HORIZONTAL SCALING & LOAD BALANCING
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-03',
    number: '03',
    title: 'Compute Tier — Statelessness & Session Decoupling',
    description:
      'Transitioning from vertical to horizontal scaling, decoupling compute from state, and choosing between distributed Redis sessions and stateless JWTs.',
    lessons: [
      {
        id: 'sd-3-1',
        number: '3.1',
        title: 'Scaling Out vs Scaling Up: Decoupling State from Application Compute',
        noteSlug: 'scaling-out-vs-scaling-up-decoupling-state-from-compute',
        description:
          'The golden rule of horizontal scaling: app servers must be stateless; why sticky sessions break dynamic auto-scaling and failover.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['horizontal-scaling', 'stateless', 'cloud-architecture', 'compute'],
      },
      {
        id: 'sd-3-2',
        number: '3.2',
        title: 'Session Management at Scale: Distributed Redis Sessions vs Stateless JWTs',
        noteSlug: 'session-management-at-scale-distributed-redis-vs-stateless-jwts',
        description:
          'Centralized session caching in Redis clusters vs cryptographically signed JWTs, token revocation challenges, blacklist caching, and bandwidth overhead.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['sessions', 'redis', 'jwt', 'auth', 'security'],
      },
    ],
  },
  {
    id: 'sd-mod-04',
    number: '04',
    title: 'Compute Tier — Load Balancing Topologies & Layer Mechanics',
    description:
      'L4 transport routing vs L7 application routing, traffic distribution algorithms, health check polling, and active-passive load balancer high availability.',
    lessons: [
      {
        id: 'sd-4-1',
        number: '4.1',
        title: 'Load Balancing Topologies: L4 Transport (NLB/IPVS) vs L7 Application (ALB/Nginx)',
        noteSlug: 'load-balancing-topologies-l4-transport-vs-l7-application',
        description:
          'OSI layer mechanics: IP and TCP port routing with Linux IPVS and AWS NLB vs HTTP header inspection, path routing, and SSL termination with Nginx and AWS ALB.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['load-balancing', 'networking', 'l4-l7', 'nginx', 'haproxy'],
      },
      {
        id: 'sd-4-2',
        number: '4.2',
        title: 'Traffic Distribution Algorithms: Round Robin, Least Connections & Consistent Hashing',
        noteSlug: 'traffic-distribution-algorithms-round-robin-least-connections-hash',
        description:
          'Evaluating Round Robin, Weighted Round Robin, Least Connections, Peak EWMA, and IP Hash algorithms across heterogeneous server fleets.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['algorithms', 'load-balancing', 'traffic-shaping', 'routing'],
      },
      {
        id: 'sd-4-3',
        number: '4.3',
        title: 'Health Checks, Fast Eviction & High-Availability Load Balancers (VRRP & Keepalived)',
        noteSlug: 'health-checks-fast-eviction-and-ha-load-balancers-vrrp',
        description:
          'Active heartbeat probes, sub-second dead node eviction under OOM crashes, redundant Active-Passive load balancer pairs, and Virtual IP (VIP) failover with VRRP.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['high-availability', 'health-checks', 'failover', 'vrrp', 'devops'],
      },
    ],
  },
];
