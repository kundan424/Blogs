import { LearningModule } from '../../../types';

export const stage6Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // 6.0 Observability
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-6-0',
    number: '6.0',
    title: 'Observability',
    description: 'Logs, metrics and traces.',
    lessons: [
      {
        id: 'sd-6-0-1',
        number: '6.0.1',
        title: 'Observability',
        noteSlug: 'observability',
        description: 'The three pillars: structured JSON logs, dimensional time-series metrics, and distributed tracing with OpenTelemetry (W3C trace context).',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['observability', 'opentelemetry', 'tracing', 'metrics'],
      },
      {
        id: 'sd-6-0-2',
        number: '6.0.2',
        title: 'Design a logging system',
        noteSlug: 'design-a-logging-system',
        description: 'Interview blueprint: designing a distributed logging architecture (FluentBit, Kafka, ClickHouse/Elasticsearch) ingesting 1M log lines/sec.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['system-design', 'interview-guide', 'logging', 'distributed-systems'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 6.1 SLI, SLO, SLA and Error Budgets
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-6-1',
    number: '6.1',
    title: 'SLI, SLO, SLA and Error Budgets',
    description: 'Promises you can measure.',
    lessons: [
      {
        id: 'sd-6-1-1',
        number: '6.1.1',
        title: 'SLIs, SLOs, error budgets',
        noteSlug: 'slis-slos-error-budgets',
        description: 'Service Level Indicators vs Objectives vs contractual SLAs; calculating error budgets and gating feature releases when budgets burn.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['sre', 'slo', 'sli', 'error-budgets', 'reliability'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 6.2 Resilience Patterns
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-6-2',
    number: '6.2',
    title: 'Resilience Patterns',
    description: 'Timeouts, retries, breakers, bulkheads.',
    lessons: [
      {
        id: 'sd-6-2-1',
        number: '6.2.1',
        title: 'Resilience patterns',
        noteSlug: 'resilience-patterns',
        description: 'Circuit Breakers (Closed/Open/Half-Open states), exponential backoff with full jitter, strict call timeouts, and thread pool bulkheads.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['resilience', 'circuit-breaker', 'bulkhead', 'retries'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 6.3 Graceful Degradation
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-6-3',
    number: '6.3',
    title: 'Graceful Degradation',
    description: 'Doing less instead of failing.',
    lessons: [
      {
        id: 'sd-6-3-1',
        number: '6.3.1',
        title: 'Graceful degradation',
        noteSlug: 'graceful-degradation',
        description: 'Serving cached stale data during outages, disabling non-critical UI widgets (recommendations), and preserving core payment paths.',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['graceful-degradation', 'fault-tolerance', 'resilience', 'architecture'],
      },
      {
        id: 'sd-6-3-2',
        number: '6.3.2',
        title: 'Load shedding',
        noteSlug: 'load-shedding',
        description: 'Rejecting excess traffic early: CoDel queue management, prioritizing authenticated VIP users, and dropping low-priority background requests.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['load-shedding', 'backpressure', 'rate-limiting', 'high-availability'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 6.4 Auto-Scaling and Capacity Planning
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-6-4',
    number: '6.4',
    title: 'Auto-Scaling and Capacity Planning',
    description: 'Enough servers, not too many.',
    lessons: [
      {
        id: 'sd-6-4-1',
        number: '6.4.1',
        title: 'Autoscaling',
        noteSlug: 'autoscaling',
        description: 'Horizontal Pod Autoscaler (HPA), KEDA event-driven scaling, metric cooldown periods, and handling traffic spikes faster than VM spin-up.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['autoscaling', 'kubernetes', 'hpa', 'keda'],
      },
      {
        id: 'sd-6-4-2',
        number: '6.4.2',
        title: 'Capacity planning',
        noteSlug: 'capacity-planning-ops',
        description: 'Forecasting hardware needs for Black Friday / Prime Day, provisioning buffer margins, and load testing with k6 and Locust.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['capacity-planning', 'load-testing', 'benchmarking', 'ops'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 6.5 Deployment Strategies
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-6-5',
    number: '6.5',
    title: 'Deployment Strategies',
    description: 'Shipping without taking the site down.',
    lessons: [
      {
        id: 'sd-6-5-1',
        number: '6.5.1',
        title: 'Canary, blue-green, flags',
        noteSlug: 'canary-blue-green-flags',
        description: 'Blue-Green environment swapping, Canary progressive delivery (1% -> 5% -> 25% -> 100%), and runtime Feature Flags.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['canary', 'blue-green', 'feature-flags', 'continuous-delivery'],
      },
      {
        id: 'sd-6-5-2',
        number: '6.5.2',
        title: 'Design a CI/CD system',
        noteSlug: 'design-a-ci-cd-system',
        description: 'Interview blueprint: designing a distributed build and deployment pipeline with ephemeral runners, artifact caching, and rollback automation.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['system-design', 'interview-guide', 'ci-cd', 'devops'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 6.6 Chaos Engineering
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-6-6',
    number: '6.6',
    title: 'Chaos Engineering',
    description: 'Breaking things on purpose.',
    lessons: [
      {
        id: 'sd-6-6-1',
        number: '6.6.1',
        title: 'Chaos engineering',
        noteSlug: 'chaos-engineering',
        description: 'Chaos Monkey, Litmus, injecting artificial packet loss, server terminates, and DNS blackholes to prove high-availability in production.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['chaos-engineering', 'netflix', 'resilience', 'sre'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 6.7 Incident Management
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-6-7',
    number: '6.7',
    title: 'Incident Management',
    description: 'When it breaks at 3 a.m.',
    lessons: [
      {
        id: 'sd-6-7-1',
        number: '6.7.1',
        title: 'Incident response',
        noteSlug: 'incident-response',
        description: 'On-call escalation paths, Incident Commander (IC) protocol, war rooms, status page communications, and triage workflows.',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['incident-response', 'on-call', 'sre', 'operations'],
      },
      {
        id: 'sd-6-7-2',
        number: '6.7.2',
        title: 'Postmortems',
        noteSlug: 'postmortems',
        description: 'Blameless root cause analysis (RCA), the 5 Whys, action item tracking, and preventing repeat outages.',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['postmortem', 'rca', 'blameless', 'engineering-culture'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 6.8 Health Checks and Readiness
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-6-8',
    number: '6.8',
    title: 'Health Checks and Readiness',
    description: 'Liveness, readiness and why they differ.',
    lessons: [
      {
        id: 'sd-6-8-1',
        number: '6.8.1',
        title: 'Health checks',
        noteSlug: 'health-checks',
        description: 'Kubernetes Liveness probes (is process dead?) vs Readiness probes (can it take traffic?), and the catastrophic cascading restart loop trap.',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['health-checks', 'kubernetes', 'liveness', 'readiness'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 6.9 Cost Optimization and FinOps
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-6-9',
    number: '6.9',
    title: 'Cost Optimization and FinOps',
    description: 'The bill is part of the design.',
    lessons: [
      {
        id: 'sd-6-9-1',
        number: '6.9.1',
        title: 'Cost-aware design',
        noteSlug: 'cost-aware-design',
        description: 'Inter-AZ data transfer fees, spot instances, egress network costs, storage lifecycles, and rightsizing compute for unit economics.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['finops', 'cloud-costs', 'aws-billing', 'architecture'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 6.10 Platform Engineering
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-6-10',
    number: '6.10',
    title: 'Platform Engineering',
    description: 'Paved roads for every team.',
    lessons: [
      {
        id: 'sd-6-10-1',
        number: '6.10.1',
        title: 'Platform engineering',
        noteSlug: 'platform-engineering',
        description: 'Internal Developer Platforms (IDP), Backstage, self-service infrastructure with Terraform/Crossplane, and paved paths.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['platform-engineering', 'devops', 'internal-developer-platform', 'backstage'],
      },
      {
        id: 'sd-6-10-2',
        number: '6.10.2',
        title: 'Design a SaaS platform',
        noteSlug: 'design-a-saas-platform',
        description: 'Interview blueprint: designing a multi-tenant application hosting platform with isolated namespaces, secrets injection, and ingress.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['system-design', 'interview-guide', 'platform', 'kubernetes'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 6.11 Disaster Recovery
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-6-11',
    number: '6.11',
    title: 'Disaster Recovery',
    description: 'RPO, RTO and the restore you tested.',
    lessons: [
      {
        id: 'sd-6-11-1',
        number: '6.11.1',
        title: 'Disaster recovery',
        noteSlug: 'disaster-recovery',
        description: 'Recovery Point Objective (RPO) vs Recovery Time Objective (RTO), backup snapshots, pilot light vs warm standby, and restore drills.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['disaster-recovery', 'rpo', 'rto', 'backups', 'high-availability'],
      },
    ],
  },
];
