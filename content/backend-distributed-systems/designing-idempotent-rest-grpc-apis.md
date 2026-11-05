---
title: Designing Idempotent REST & gRPC APIs with Redis Deduplication
slug: designing-idempotent-rest-grpc-apis
subject: backend-distributed-systems
abstract: >-
  How to safely handle network timeouts and client retries without duplicate
  billing charges or orphaned order records. Distributed lock deduplication
  patterns.
tags:
  - spring-boot
  - redis
  - architecture
  - system-design
published: true
publishDate: 'Mar 10, 2025'
readTime: 6 min read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
  bio: >-
    Software Engineer focusing on backend architecture, distributed systems, and
    performance tuning.
blueprint: deep-dive
---
## 01. Context & Architectural Overview

How to safely handle network timeouts and client retries without duplicate billing charges or orphaned order records. Distributed lock deduplication patterns.

:::callout{type="info" title="System Invariant"}
Under surge conditions (e.g. 5,000 req/sec), connection allocation overhead grows superlinearly if worker thread pools are unbounded.
:::

## 02. Mechanical Breakdown & Heuristics

PostgreSQL adopts a dedicated backend process model per connected socket. Sizing connection pools excessively starves kernel page caches and introduces CPU context switching thrashes.

```sql title="pg_stat_activity.sql"
SELECT pid, state, query_start, wait_event_type, wait_event
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY query_start ASC;
```

## 03. Production Checklist & Takeaways

- [ ] Cap application connection max pool sizes to `((cpu_cores * 2) + effective_spindle_count)`.
- [ ] Configure HikariCP `leakDetectionThreshold = 2000` in production environments.
- [ ] Implement PgBouncer in transaction pooling mode for auto-scaled replica fleets.
