---
title: Implementing Distributed Rate Limiting with Redis Token Bucket
slug: implementing-distributed-rate-limiting-redis-token-bucket
subject: backend-distributed-systems
abstract: >-
  Writing atomic Lua scripts in Redis to execute token bucket replenishment
  without racing. Integration patterns with Spring Cloud Gateway and zero packet
  drops.
tags:
  - redis
  - spring-boot
  - architecture
  - distributed-systems
published: true
publishDate: 'May 08, 2025'
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

Writing atomic Lua scripts in Redis to execute token bucket replenishment without racing. Integration patterns with Spring Cloud Gateway and zero packet drops.

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
