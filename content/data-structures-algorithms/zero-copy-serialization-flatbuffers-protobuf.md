---
title: >-
  Zero-Copy Serialization with FlatBuffers and Protobuf in High-Throughput
  Pipelines
slug: zero-copy-serialization-flatbuffers-protobuf
subject: data-structures-algorithms
abstract: >-
  Eliminating GC pauses and heap allocations when moving gigabytes per second
  between microservices. Direct byte-buffer access benchmarks and CPU L1 cache
  locality.
tags:
  - concurrency
  - performance
  - dsa
published: true
publishDate: 'Apr 21, 2025'
readTime: 10 min read
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

Eliminating GC pauses and heap allocations when moving gigabytes per second between microservices. Direct byte-buffer access benchmarks and CPU L1 cache locality.

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
