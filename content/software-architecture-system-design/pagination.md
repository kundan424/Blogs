---
title: "API Pagination Architecture: Offset vs. Keyset / Cursor-Based Pagination"
slug: pagination
subject: software-architecture-system-design
abstract: Master the mechanics of API pagination from first principles. Discover why unpaginated endpoints trigger catastrophic OutOfMemory (OOM) crashes, why OFFSET queries degrade exponentially on deep pages (the O(N) B-Tree scan penalty), how cursor-based pagination achieves flat O(1) database performance at scale, how to structure opaque Base64 tokens like Stripe and Slack, and why high-scale systems eliminate SELECT COUNT(*) entirely.
tags:
  - pagination
  - cursor-pagination
  - sql
  - performance
  - api-design
  - system-design
  - architecture
published: true
publishDate: Nov 14, 2026
updatedDate: Nov 14, 2026
readTime: 22m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
learningPath:
  slug: system-design
  name: "System Design"
  module: "sd-mod-0-4"
  moduleName: "API Design Basics"
  lesson: "0.4.6"
---

# API Pagination Architecture: Offset vs. Keyset / Cursor-Based Pagination

Imagine you are building an e-commerce platform or a social network. During the early days of development, your `orders` table has only 150 rows. A client requests `GET /api/v1/orders`, and your backend executes:

```sql
SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC;
```

The database answers in 1.2 milliseconds. The JSON response is a light 35 kilobytes. The customer's mobile phone parses it instantly.

Now fast-forward two years. The platform has scaled. An active merchant or a viral creator has accumulated **4,000,000 transactions**. An automated script or a merchant's dashboard issues the exact same request: `GET /api/v1/orders`.

Catastrophe strikes in three simultaneous stages:
1. **Database Disk & Cache Thrashing**: The database engine performs a massive sequential scan or traverses millions of index leaf pages, evicting frequently queried hot tables from its buffer pool memory (RAM).
2. **Application Server Out-Of-Memory (OOM)**: The backend web server pulls 4,000,000 rows into memory, instantiating millions of Java/Node.js objects. Garbage collection halts all threads in a multi-second Stop-The-World pause before crashing the process with `java.lang.OutOfMemoryError: Java heap space`.
3. **Network Saturation**: If the server somehow survives, it attempts to serialize a 1.8-gigabyte JSON payload across the network interface card (NIC), freezing mobile apps and blowing up client data plans.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 THE UNPAGINATED QUERY RESOURCE EXHAUSTION                   │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Client ] ──► GET /api/v1/orders (No Pagination!)
                      │
                      ▼
 ┌───────────────────────────────────────────────────────────────────────────┐
 │ 1. DATABASE TIER: Evicts buffer pool, reads 4,000,000 rows from SSD      │
 ├───────────────────────────────────────────────────────────────────────────┤
 │ 2. APPLICATION TIER: Allocates 2GB of DTOs in RAM ──► OOM CRASH!          │
 ├───────────────────────────────────────────────────────────────────────────┤
 │ 3. NETWORK TIER: Transmits gigabytes of JSON ──► Bandwidth saturation!    │
 └───────────────────────────────────────────────────────────────────────────┘
```

**Rule 0 of API Architecture**: Any endpoint returning a collection of resources **must be paginated by default**, enforced by a strict server-side maximum limit ceiling.

In this lesson, we will explore the two dominant pagination paradigms—**Offset-Based Pagination** and **Keyset / Cursor-Based Pagination**—dissecting their algorithmic complexities, their failure modes on deep pages, their page-drift bugs, and how industry titans like Stripe, Slack, and Twitter structure resilient pagination contracts.

---

## 01. Offset-Based Pagination: The Traditional Model

Offset-based pagination is the oldest and most intuitive pagination mechanism. It mirrors the way humans read physical books: *"Skip the first N records, then give me the next K records."*

### The API Contract
The client supplies two integer query parameters:
* `page`: The 1-indexed target page number (or `offset`: number of rows to skip).
* `limit` (or `page_size`): The number of items to return per page.

```http
GET /api/v1/orders?page=3&limit=20 HTTP/1.1
Host: api.store.com
```

### The Database Query
The backend translates the request directly into SQL `LIMIT` and `OFFSET` clauses:

```text
OFFSET = (page - 1) * limit
```

```sql
-- Fetching Page 3 (Rows 41 to 60)
SELECT id, user_id, amount_cents, status, created_at
FROM orders
WHERE user_id = 42
ORDER BY created_at DESC
LIMIT 20 OFFSET 40;
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     OFFSET PAGINATION: HOW IT WORKS                         │
└─────────────────────────────────────────────────────────────────────────────┘

 Page 1:  [ 1  2  3 ... 20 ]  (OFFSET 0, LIMIT 20)
 Page 2:  [ 21 22 23 ... 40 ] (OFFSET 20, LIMIT 20)
 Page 3:  [ 41 42 43 ... 60 ] (OFFSET 40, LIMIT 20) ◄── Returned to Client!
```

---

### Why Offset Pagination is Widely Used
1. **Intuitive UI Mapping**: Directly enables traditional desktop pagination bars (`[1] [2] [3] ... [10] [Next]`).
2. **Arbitrary Page Jumping**: A user can click directly to Page 47 without needing to retrieve pages 1 through 46 first.
3. **Stateless Implementation**: The server does not need to remember any state or cursor pointer between requests.

---

## 02. The Two Fatal Flaws of Offset Pagination

Despite its popularity in simple admin panels, offset-based pagination contains two architectural flaws that make it unusable for high-scale distributed systems.

### Flaw 1: The O(N) Deep Paging Performance Penalty

What happens when a user, an automated web crawler (like Googlebot), or a batch export job requests page 50,000?

```http
GET /api/v1/orders?page=50000&limit=20
```

The database must execute:
```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 1000000;
```

A common misconception among junior developers is assuming that because an index exists on `created_at`, the database can perform an instantaneous `O(1)` leap directly to the 1,000,000th row.

**This is physically impossible in B-Tree index architecture.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              THE B-TREE TRAVERSAL PENALTY ON OFFSET 1,000,000               │
└─────────────────────────────────────────────────────────────────────────────┘

                          [ Root Node ]
                         /             \
                 [ Branch ]           [ Branch ]
                 /        \           /        \
              [Leaf]    [Leaf]     [Leaf]    [Leaf]
              ──────    ──────     ──────    ──────
              Postgres / MySQL MUST SCAN AND DISCARD 1,000,000 LEAF ENTRIES!
              ┌─────────────────────────────────────────────────────────┐
              │ [Row 1] [Row 2] ... [Row 1,000,000] ──► THROWN AWAY!    │
              └─────────────────────────────────────────────────────────┘
                                                │
                                                ▼
              ┌─────────────────────────────────────────────────────────┐
              │ [Row 1,000,001] to [Row 1,000,020]  ──► RETURNED!       │
              └─────────────────────────────────────────────────────────┘
```

#### The Physical Execution Cost:
1. The database engine must scan **1,000,020 rows** through the index.
2. If the query is not a covering index, the database must perform **1,000,020 random page reads** on the table heap off disk to read visibility metadata (MVCC tuples).
3. The database counts 1,000,000 rows, **discards all of them into the trash**, and returns only the final 20 rows!

#### The Latency Benchmark Curve:

```
 Query: SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET N;

 Offset: 0       (Page 1)      ──► 1.4 ms   ██
 Offset: 1,000   (Page 50)     ──► 4.2 ms   ████
 Offset: 100,000 (Page 5,000)  ──► 380 ms   ████████████████████
 Offset: 1,000,000 (Page 50k)  ──► 4,200 ms ████████████████████████████████████ (TIMEOUT!)
```

The time complexity of offset pagination is `O(N)` with respect to the offset depth. On large datasets, malicious callers or scrapers can easily launch Denial of Service (DoS) attacks simply by querying high offset values (`?page=999999`).

---

### Flaw 2: The "Page Drift" & Data Inconsistency Trap

In real-time production systems, data is not static. Records are continuously inserted, updated, and deleted. Offset pagination suffers from severe **data inconsistency anomalies**:

#### Scenario A: The Duplicate Record Anomaly (Skipping and Repeating)
Imagine an endless social feed or live order list sorted newest first:

```
Initial State:
Row 1: Order #100
Row 2: Order #99
Row 3: Order #98
Row 4: Order #97
Row 5: Order #96
```

1. Client fetches **Page 1** (`limit=3, offset=0`):
   * Client receives: `[Order #100, Order #99, Order #98]`.
2. While the user is scrolling, another customer places **Order #101**. The table shifts:
   * Position 1: **Order #101** (NEW!)
   * Position 2: Order #100
   * Position 3: Order #99
   * Position 4: Order #98 (Pushed from position 3 to 4!)
   * Position 5: Order #97
3. The user scrolls down and requests **Page 2** (`limit=3, offset=3`):
   * The database skips the first 3 rows (`#101, #100, #99`) and reads rows 4 through 6.
   * Client receives: `[Order #98, Order #97, Order #96]`.

:::callout{type="danger" title="The Page Drift Bug"}
Notice what happened: **Order #98 was shown to the user on Page 1, and is shown AGAIN on Page 2!**  
Conversely, if an item on Page 1 had been deleted while the user was viewing it, an item from Page 2 would have shifted into Page 1 and been **completely skipped and never shown to the user**.
:::

For financial ledgers, audit trails, and data crawlers, silent duplicates and skipped records can cause critical data corruption.

---

## 03. Keyset / Cursor-Based Pagination: The Modern Solution

To solve both the `O(N)` deep-paging latency explosion and the page-drift anomaly, modern distributed platforms (such as Stripe, Slack, Twitter, and GitHub) utilize **Keyset / Cursor-Based Pagination**.

### The Conceptual Shift
Instead of asking the database to *"skip 1,000,000 rows"*, cursor pagination asks:
> *"Give me the next 20 rows whose sort key is STRICTLY GREATER than the last item I saw."*

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CURSOR PAGINATION: HOW IT WORKS                          │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Page 1 ] ──► SELECT * FROM orders ORDER BY id ASC LIMIT 20;
                Last item returned has ID = 104820
                      │
                      ▼ (Client passes cursor = 104820)
 [ Page 2 ] ──► SELECT * FROM orders WHERE id > 104820 ORDER BY id ASC LIMIT 20;
                Last item returned has ID = 104840
                      │
                      ▼ (Client passes cursor = 104840)
 [ Page 3 ] ──► SELECT * FROM orders WHERE id > 104840 ORDER BY id ASC LIMIT 20;
```

### The Database Engine Mechanics: O(log N) Seek
Look at what happens inside the database B-Tree index:

```sql
SELECT id, user_id, amount_cents, status, created_at
FROM orders
WHERE id > 1000000
ORDER BY id ASC
LIMIT 20;
```

1. The database utilizes the B-Tree index on `id` to perform a single **`O(log N)` root-to-leaf binary search** directly to `id = 1000000`.
2. Once the leaf node is located, the engine reads **exactly 20 contiguous rows** off the leaf linked list.
3. **Zero rows are scanned and discarded.**

#### The Performance Benchmark Comparison:

| Pagination Depth | Offset Pagination Latency | Cursor Pagination Latency |
| :--- | :--- | :--- |
| **Page 1 (First 20)** | 1.4 ms | **1.2 ms** |
| **Page 100 (Row 2,000)** | 5.8 ms | **1.2 ms** |
| **Page 5,000 (Row 100,000)** | 380 ms | **1.3 ms** |
| **Page 50,000 (Row 1,000,000)** | 4,200 ms (Timeout!) | **1.3 ms** |
| **Page 500,000 (Row 10,000,000)**| Total Database Crash | **1.4 ms** |

Under cursor pagination, response latency is **completely flat (`O(1)` amortized)** regardless of whether the user is reading page 1 or page 500,000!

Furthermore, **page drift is impossible**: if new orders are inserted at the beginning or deleted behind the cursor, the condition `WHERE id > 1000000` remains absolute.

---

## 04. Designing Production Cursors: Multi-Column & Opaque Encodings

While cursor pagination is straightforward when sorting by a unique auto-incrementing `id`, real-world applications almost never sort by `id` alone. Users want to sort by **`created_at DESC`**, **`price ASC`**, or **`popularity DESC`**.

This introduces two critical engineering hurdles:
1. **The Non-Unique Column Tiebreaker Trap**.
2. **The Leaky Abstraction Vulnerability**.

---

### Challenge 1: The Non-Unique Column Tiebreaker Trap

What happens if you paginate by `created_at DESC`, and 10 orders share the exact same millisecond timestamp?

```
Order 1: created_at = 12:00:00.000, id = 99
Order 2: created_at = 12:00:00.000, id = 98
Order 3: created_at = 12:00:00.000, id = 97
Order 4: created_at = 12:00:00.000, id = 96
```

If your query is:
```sql
WHERE created_at < '12:00:00.000' LIMIT 2;
```
The database will skip all subsequent orders that share `12:00:00.000`, causing silent data loss!

#### The Fix: Composite Cursor (The Deterministic Tiebreaker)
You must combine the primary sort column with a guaranteed unique column (usually the primary key `id`):

```sql
-- Composite Seek Query
SELECT * FROM orders
WHERE (created_at < :last_created_at)
   OR (created_at = :last_created_at AND id < :last_id)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

To make this query fast, you **must create a matching composite index**:
```sql
CREATE INDEX idx_orders_pagination ON orders (created_at DESC, id DESC);
```

Modern database engines (PostgreSQL 10+, MySQL 8+) allow the cleaner row-tuple syntax:
```sql
WHERE (created_at, id) < (:last_created_at, :last_id)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

---

### Challenge 2: The Leaky Abstraction & Opaque Base64 Tokens

A junior API design leaks raw database internals directly into the query string:
```http
GET /api/v1/orders?last_created_at=1763120000&last_id=98124
```

**Why this is dangerous in production:**
1. **Exposes Database Schema**: Clients now depend on your internal column names (`last_id`, `created_at`). If you migrate from an integer `id` to a UUID or change the table schema, you break all existing clients.
2. **Data Scraping & Competitor Intelligence**: Monotonically increasing IDs leak your business metrics (e.g. competitors calculating how many orders you process per day).
3. **URL Parameter Clutter**: If you sort by 3 columns, the URL becomes unmanageable.

#### The Senior Solution: The Opaque Cursor Token
Pack the cursor state into a compact JSON object, serialize it, and **Base64URL encode** it into an opaque string:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MINTING AN OPAQUE BASE64 CURSOR                        │
└─────────────────────────────────────────────────────────────────────────────┘

 1. Internal Cursor State (JSON):
    {
      "c": 1763120000,
      "id": 98124
    }
           │
           ▼
 2. Base64URL Encoding:
    eyJjIjoxNzYzMTIwMDAwLCJpZCI6OTgxMjR9
           │
           ▼
 3. Public API Contract:
    GET /api/v1/orders?limit=20&starting_after=eyJjIjoxNzYzMTIwMDAwLCJpZCI6OTgxMjR9
```

When your server receives `starting_after`, it decodes the Base64 string, extracts `c` and `id`, and executes the composite index seek. The client treats the cursor string as a **completely opaque token**.

---

## 05. Production Response Envelopes & Navigation Standards

How should your API format paginated responses so mobile apps, web frontends, and automated SDKs can navigate cleanly?

There are two dominant industry standards:

### Standard 1: The Opaque Envelope Pattern (Stripe & Slack Style)

The API returns a dedicated `pagination` metadata object alongside the list of items:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": [
    { "id": "ord_101", "amount": 4900, "status": "PAID" },
    { "id": "ord_102", "amount": 1250, "status": "PAID" }
  ],
  "pagination": {
    "has_more": true,
    "next_cursor": "eyJjIjoxNzYzMTIwMDAwLCJpZCI6OTgxMjR9",
    "prev_cursor": "eyJjIjoxNzYzMTIwMDAwLCJpZCI6MTA0OTJ9"
  }
}
```

#### How the Frontend Navigates:
* **Next Page**: If `has_more == true`, pass `?starting_after=` with `next_cursor`.
* **Previous Page**: Pass `?ending_before=` with `prev_cursor`.
* **End of Data**: If `has_more == false`, the mobile app disables infinite scroll.

---

### Standard 2: RFC 8288 Web Linking (`Link` Headers - GitHub Style)

The **GitHub REST API** avoids wrapping JSON arrays in metadata envelopes, returning pure arrays in the body and encoding pagination links directly in the HTTP headers:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Link: <https://api.github.com/user/repos?page=3&per_page=20>; rel="next",
      <https://api.github.com/user/repos?page=50&per_page=20>; rel="last",
      <https://api.github.com/user/repos?page=1&per_page=20>; rel="first",
      <https://api.github.com/user/repos?page=1&per_page=20>; rel="prev"

[
  { "id": 1, "name": "linux" },
  { "id": 2, "name": "kubernetes" }
]
```

Standard `rel` link relations:
* `rel="next"`: The immediate next page.
* `rel="prev"`: The immediate previous page.
* `rel="first"`: The first page.
* `rel="last"`: The final page.

---

## 06. The `SELECT COUNT(*)` Trap at Scale

In offset pagination, frontends often demand to display:
> *"Showing items 1-20 of 14,284,910 items (Page 1 of 714,246)"*

To provide this, backend engineers write:
```sql
SELECT COUNT(*) FROM orders WHERE user_id = 42;
```

:::callout{type="danger" title="The Million-Dollar Query"}
In relational databases with MVCC (like PostgreSQL and MySQL InnoDB), **`SELECT COUNT(*)` is an expensive table scan or full index scan**.  
Because MVCC must evaluate transaction snapshot visibility for every single row, the database cannot simply read a cached number from a table header.
:::

On a table with 50 million rows, running `SELECT COUNT(*)` on every single paginated HTTP request consumes vast amounts of CPU and disk I/O, causing connection pools to starve.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE COST OF COUNT(*) ON HIGH-SCALE TABLES                │
└─────────────────────────────────────────────────────────────────────────────┘

 Data Query:  SELECT * FROM orders WHERE ... LIMIT 20; ──► 1.5 ms  (Fast!)
 Count Query: SELECT COUNT(*) FROM orders WHERE ...;   ──► 850 ms  (Kills the DB!)
 Total Request Latency: 851.5 ms!
```

### How High-Scale Systems Eliminate `COUNT(*)`

1. **The `has_more` Pattern (Fetch N + 1 Rows)**:
   If the client asks for `limit=20`, query the database for `LIMIT 21`:
   * If the database returns 21 rows: You return the first 20 rows to the client and set `"has_more": true`.
   * If the database returns ≤ 20 rows: You know you have reached the end of the collection, and set `"has_more": false`.
   * **Result**: You eliminate the `COUNT(*)` query completely!
2. **Approximate Counting**:
   If an estimate is acceptable, PostgreSQL allows instant `O(1)` statistical row estimates from system catalogs:
   ```sql
   SELECT reltuples::bigint AS estimate FROM pg_class WHERE relname = 'orders';
   ```
3. **Decoupled Asynchronous Counter Caches**:
   Maintain an asynchronous counter in Redis or a dedicated summary table. When a write occurs, increment the Redis counter (`INCR orders:count:usr_42`). Read the counter from Redis in sub-millisecond memory rather than scanning relational tables.

---

## 07. Deep Architectural Comparison Matrix

| Architectural Vector | Offset-Based Pagination | Keyset / Cursor Pagination | Time-Window / Chunked |
| :--- | :--- | :--- | :--- |
| **Time Complexity (Page 1)** | `O(limit)` | `O(limit)` | `O(limit)` |
| **Time Complexity (Page 50k)**| **`O(N)` (Scans & discards N rows)**| **`O(1)` (Direct B-Tree seek)** | `O(1)` |
| **Page Drift Vulnerability** | **High** (Duplicates / skips on insert/delete)| **Immune** (Anchored to cursor value) | Immune |
| **Jump to Arbitrary Page?** | **Yes** (Can jump directly to Page 40) | **No** (Must traverse sequentially) | No (Queries by date range) |
| **Index Requirements** | Standard B-Tree on sort column | Composite Index `(sort_col, id)` | Index on timestamp |
| **Implementation Simplicity**| **Trivial** (Built-in framework support) | Moderate (Requires opaque tokens) | Simple |
| **Total Count Required?** | Usually yes (for page numbers) | **No** (Uses `has_more` / next pointer)| No |
| **Ideal Production Use Case** | Admin panels, static tables < 50,000 rows | **Feeds, Mobile SPAs, Public APIs, Ledgers**| Metrics, Audit Logs, Time-Series |

---

## 08. Senior Systems Engineer's Production Checklist for Pagination

When reviewing pull requests or designing high-throughput data APIs, enforce these critical safeguards:

* [ ] **Enforce Hard Upper Bounds on `limit`**: Never allow clients to pass unbounded queries like `?limit=1000000`. Set a sensible default (e.g., `limit=20`) and enforce a hard cap (e.g., `max_limit=100`):
  ```java
  int safeLimit = Math.min(requestLimit != null ? requestLimit : 20, 100);
  ```
* [ ] **Eliminate `SELECT COUNT(*)` on Public Collection APIs**: Adopt the fetch-ahead pattern (`LIMIT N + 1`) to calculate `has_more` without paying the database count penalty.
* [ ] **Create Matching Composite B-Tree Indexes for Cursors**: If your cursor query filters by `(tenant_id, created_at, id)`, verify that an exact composite index exists in the database:
  ```sql
  CREATE INDEX idx_tenant_orders ON orders (tenant_id, created_at DESC, id DESC);
  ```
* [ ] **Make Cursors Opaque & Tamper-Proof**: Encode cursors in Base64URL. For sensitive multi-tenant systems, cryptographically sign or encrypt cursors using HMAC to prevent clients from altering filter bounds or injecting malicious parameters.
* [ ] **Handle Sorting Ties Deterministically**: Always include a unique column (such as the primary key `id` or UUID) as the final tiebreaker in cursor sorting orders to prevent skipped rows on identical timestamps.
* [ ] **Prevent Negative or Zero Limit Exploits**: Validate that `limit > 0` to prevent integer underflow or invalid database query syntax errors.

---

## 09. Summary & Forward Bridge

Pagination is not merely an aesthetic UI convenience; it is a fundamental stability mechanism protecting database disks, server memory, and network throughput from cascading failures. While offset-based pagination is acceptable for small, static internal tools, **keyset/cursor-based pagination is the mandatory standard for high-scale, real-time distributed platforms**.

Now that our APIs can securely authenticate users and paginate through billions of rows with flat `O(1)` latency, how do we allow callers to slice, filter, and sort that data dynamically without spawning thousands of un-indexed, database-destroying queries?

In our next lesson, **[Lesson 0.4.7: Filtering and Sorting](/notes/filtering-and-sorting)**, we will explore query parameter conventions, dynamic multi-attribute filtering, index intersection, and full-text search integration!
