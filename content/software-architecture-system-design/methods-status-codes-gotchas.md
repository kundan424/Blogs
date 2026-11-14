---
title: "HTTP Methods, Status Codes & Production Gotchas: Safe, Idempotent, and Resilient API Semantics"
slug: methods-status-codes-gotchas
subject: software-architecture-system-design
abstract: Master HTTP semantics from first principles. Understand the mathematical guarantees of safety vs idempotence, navigate the deep differences between PUT, POST, and PATCH, decode the complete 2xx/3xx/4xx/5xx status taxonomy, and discover why subtle architectural mistakes like the '200 OK with error body' anti-pattern or violating GET safety can bring down entire production systems.
tags:
  - http
  - status-codes
  - rest
  - api-design
  - system-design
  - architecture
  - best-practices
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
  lesson: "0.4.4"
---

# HTTP Methods, Status Codes & Production Gotchas: Safe, Idempotent, and Resilient API Semantics

Every day across global distributed systems, millions of microservices communicate over HTTP. Yet, a staggering number of production incidents, data corruptions, and architectural failures stem not from complex distributed consensus bugs, but from a fundamental misunderstanding of **HTTP protocol semantics**.

Consider these real-world production post-mortems:
* A team implements an administrative button using an HTTP `GET /api/v1/users/delete?id=123`. A search engine spider or an aggressive browser pre-fetcher crawls the link, silently wiping tens of thousands of active customer accounts from the database.
* A payment microservice retries a failed network call using `POST /v1/charges` without an idempotency key, double-billing thousands of credit cards during a momentary upstream gateway timeout.
* A legacy monolithic service returns `200 OK` for all responses—even when a database query throws a fatal deadlock exception—burying `{ "error": "Internal Error", "code": 500 }` inside the JSON payload. Downstream API gateways, load balancers, and Cloudflare edge caches cheerfully cache the failure, and automated circuit breakers fail to trip, cascading the outage across the entire platform.

Understanding the precise mathematical and operational contract of HTTP verbs, status codes, and headers is the difference between fragile, bug-ridden web hooks and resilient, self-healing distributed platforms.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE CORE GUARANTEES OF HTTP VERBS                        │
└─────────────────────────────────────────────────────────────────────────────┘

                  Safe? (No side effects on server)
                  │
                  ├── YES ──► GET, HEAD, OPTIONS, TRACE
                  │           (Read-only, cacheable, pre-fetchable)
                  │
                  └── NO  ──► Idempotent? (Repeated calls = same state)
                              │
                              ├── YES ──► PUT, DELETE
                              │           (Safe for automated retries)
                              │
                              └── NO  ──► POST, PATCH
                                          (Requires idempotency keys to retry)
```

---

## 01. Why HTTP Semantics Exist: The Core Problem

In the early 1990s, when Tim Berners-Lee authored the original HTTP specifications, HTTP was conceived as a hypermedia transfer protocol. When Roy Fielding formalized **REST (Representational State Transfer)** in RFC 2616 (and later updated in RFC 7231 and RFC 9110), the Web was designed around a set of **universal architectural constraints**.

### The Problem of Distributed Intermediaries
When a client sends a request to an origin server, the packet does not travel over a private point-to-point cable. It traverses an arbitrary chain of **intermediaries**:
* Forward proxies and corporate firewalls
* Content Delivery Networks (CDNs) like Cloudflare and Fastly
* Reverse proxies and Ingress Controllers like Nginx, HAProxy, and Envoy
* Client-side HTTP caches inside mobile SDKs and web browsers

```
[Mobile / Web Client] ──► [Browser Cache] ──► [Edge CDN] ──► [API Gateway] ──► [Microservice]
```

If the protocol did not have **standardized semantics**, these intermediaries could not safely optimize traffic:
1. **How does an edge CDN know if it can cache a response?** (If verbs were arbitrary, CDNs could not distinguish between a catalog read and a balance deduction).
2. **How does an API gateway know if it can automatically retry a dropped request?** (If a TCP connection drops mid-flight, retrying a non-idempotent operation risks duplicate processing).
3. **How does an ingress controller know if an upstream service is dead versus returning a business validation error?** (Status codes tell infrastructure proxies whether to mark an upstream node unhealthy).

Standardized HTTP methods and status codes establish a **universal shared language** between clients, infrastructure intermediaries, and backend services.

---

## 02. The Mathematical Guarantees: Safety vs. Idempotence

When designing distributed systems, two formal properties govern every HTTP method: **Safety** and **Idempotence**.

### 1. Safety (Read-Only Semantics)
An HTTP method is **safe** if calling it does not alter the resource state on the origin server. Formally, safe methods represent read-only operations.

$$
\text{State}_{\text{server}}(t_1) = \text{State}_{\text{server}}(t_0)
$$

* **Safe Methods**: `GET`, `HEAD`, `OPTIONS`, `TRACE`.
* **Implications**: Because safe requests have no side effects, clients, browsers, and proxies are free to:
  * Pre-fetch them in the background (e.g., browser link pre-rendering).
  * Cache the responses aggressively at edge CDNs.
  * Re-issue them automatically whenever network connections fail.

:::callout{type="danger" title="The Google Web Accelerator Disaster"}
In 2005, Google released the *Google Web Accelerator*, a browser plugin designed to speed up page loads by aggressively pre-fetching all `<a>` tags in the background. 

Disaster struck thousands of websites whose developers had built delete buttons using:
`<a href="/forum/message/delete?id=492">Delete Message</a>`

As soon as a user running the accelerator visited a discussion board, the pre-fetcher followed every single delete link on the page, systematically obliterating user accounts, threads, and shopping carts across the internet. 

**Rule**: Safe methods (`GET`, `HEAD`) must **never** mutate resource state.
:::

### 2. Idempotence (Deterministic State Mutation)
An HTTP method is **idempotent** if the side effects of making $N > 0$ identical requests are identical to the side effects of making a single request.

$$
f(f(x)) = f(x)
$$

* **Idempotent Methods**: `GET`, `HEAD`, `OPTIONS`, `PUT`, `DELETE`.
* **Non-Idempotent Methods**: `POST`, `PATCH`.

```
First Call:    PUT /v1/users/42  {"status": "ACTIVE"}  ──► User 42 status = ACTIVE
Second Call:   PUT /v1/users/42  {"status": "ACTIVE"}  ──► User 42 status = ACTIVE
Tenth Call:    PUT /v1/users/42  {"status": "ACTIVE"}  ──► User 42 status = ACTIVE
                                                           (State unchanged!)
```

Contrast this with a non-idempotent operation:
```
First Call:    POST /v1/accounts/42/charges  {"amount": 50} ──► Balance deducted: $50
Second Call:   POST /v1/accounts/42/charges  {"amount": 50} ──► Balance deducted: $100 ($50 more!)
```

### The Safety vs. Idempotence Matrix

| HTTP Method | Safe? | Idempotent? | RFC 9110 Specification | Primary Distributed Use Case |
| :--- | :---: | :---: | :--- | :--- |
| **`GET`** | **Yes** | **Yes** | Transfer current representation | Fetching resource state, querying read-models |
| **`HEAD`** | **Yes** | **Yes** | Identical to GET without body | Checking resource existence, ETag, last-modified |
| **`OPTIONS`** | **Yes** | **Yes** | Communication options | CORS pre-flight handshake, discovery of allowed verbs |
| **`PUT`** | **No** | **Yes** | Replace state / Upsert | Complete resource replacement or creation at known URI |
| **`DELETE`** | **No** | **Yes** | Delete resource | Removing resources, soft/hard deletion |
| **`POST`** | **No** | **No** | Process payload / Create | Resource creation at server-generated URI, command triggers |
| **`PATCH`** | **No** | **No** | Apply partial modifications | Delta updates (RFC 6902 / RFC 7396) |

---

## 03. The Core Verbs: Mechanics, Traps & Distinctions

Let's dissect how each HTTP method operates under the hood and where distributed applications break down.

### 1. `GET` and `HEAD`: Cache-Aware Reads
`GET` retrieves the complete representation of a resource. 

`HEAD` is identical to `GET`, except that the server **must not** return a message body in the response. The headers returned in a `HEAD` response should match those returned to an identical `GET` request.

```http
HEAD /v1/firmware/v2.4.0.bin HTTP/1.1
Host: cdn.firmware.internal

HTTP/1.1 200 OK
Content-Type: application/octet-stream
Content-Length: 4294967296
ETag: "9b1e-5f2c-49a0"
Last-Modified: Fri, 14 Nov 2026 04:00:00 GMT
```

**Why use HEAD in Production?**
1. **Pre-flight bandwidth checks**: An IoT device or mobile app can check `Content-Length` before initiating a 4GB download over an expensive cellular connection.
2. **Cache validation**: Checking whether `ETag` or `Last-Modified` has changed without paying the CPU and egress cost of serializing and transferring the full payload.

---

### 2. `PUT` vs. `PATCH`: The Full Replacement Trap

One of the most frequent architectural mistakes in REST APIs is treating `PUT` as a partial update.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PUT: COMPLETE REPLACEMENT                         │
└─────────────────────────────────────────────────────────────────────────────┘

 Current Server State:
 {
   "id": "usr_100",
   "name": "Alice",
   "role": "ADMIN",
   "phone": "+1-555-0199"
 }

 Client sends PUT /v1/users/usr_100:
 {
   "name": "Alice Smith"
 }

 Correct Result under RFC 9110:
 {
   "id": "usr_100",
   "name": "Alice Smith",
   "role": null,         <── Missing fields are wiped out!
   "phone": null
 }
```

**The PUT Specification**: Under RFC 9110, `PUT` requests that the state of the target resource be created or replaced with the state defined by the representation enclosed in the request message payload.
* If a field is omitted from a `PUT` payload, the server must either set that field to its default/null state or reject the request with `400 Bad Request`.
* If you want to update only the user's phone number without transmitting the rest of their profile, **`PUT` is the wrong verb**.

#### The Solution: `PATCH` (RFC 5789)
`PATCH` applies a **delta** (partial modification) to a resource.

There are two primary industry standards for structuring `PATCH` payloads:

#### A. JSON Merge Patch (RFC 7396)
The client sends only the fields to be updated. Keys with `null` values represent deletion:

```http
PATCH /v1/users/usr_100 HTTP/1.1
Host: api.example.com
Content-Type: application/merge-patch+json

{
  "phone": "+1-555-9999",
  "bio": null
}
```
* **Limitation**: Cannot set a field to literal `null` if `null` signifies deletion.

#### B. JSON Patch (RFC 6902)
The client sends an explicit sequence of atomic operations:

```http
PATCH /v1/users/usr_100 HTTP/1.1
Host: api.example.com
Content-Type: application/json-patch+json

[
  { "op": "replace", "path": "/phone", "value": "+1-555-9999" },
  { "op": "remove", "path": "/legacy_token" },
  { "op": "add", "path": "/tags/0", "value": "vip" }
]
```
* **Advantage**: Explicit, atomic, and capable of operating directly on arrays and nested properties.

---

### 3. `DELETE` and The Idempotency Paradox

A question that frequently trips up senior engineers during architectural reviews:

> *"If a client sends `DELETE /v1/orders/99`, the server deletes the order and returns `204 No Content`. If the client sends the exact same request a second time, the server returns `404 Not Found`. Does returning a different status code violate idempotence?"*

**The Answer**: **No!**

RFC 9110 states that idempotence applies to the **intended effect on the server's resource state**, not the HTTP status code returned to the client:
* Before the first request: Order 99 exists.
* After the first request: Order 99 does not exist.
* After the second request: Order 99 still does not exist.
* After the 100th request: Order 99 still does not exist.

Because the state of the server after $N$ calls is identical to the state after 1 call, `DELETE` is fully idempotent.

```
Client ──► DELETE /v1/orders/99 ──► Server (deletes record) ──► 204 No Content
Client ──► DELETE /v1/orders/99 ──► Server (already gone)   ──► 404 Not Found
           (Server state is identical in both cases: the order does not exist)
```

:::callout{type="tip" title="Production Soft Deletes Pattern"}
In enterprise systems, financial records, audit logs, and compliance regulations (e.g. GDPR, HIPAA) forbid physical row deletion (`DELETE FROM orders WHERE id = 99`). 
Instead, production APIs implement **soft deletion**:
```http
DELETE /v1/orders/99 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "ord_99",
  "status": "ARCHIVED",
  "deleted_at": "2026-11-14T12:00:00Z"
}
```
Subsequent `DELETE` calls continue to return `200 OK` or `204 No Content`, making both the server state *and* the response code completely deterministic.
:::

---

## 04. The Complete HTTP Status Code Taxonomy

HTTP status codes are divided into five discrete classes. Let's explore the ones that matter in production architecture.

```
1xx Informational ──► Protocol upgrades, early hints
2xx Success       ──► Action completed, payload enclosed or queued
3xx Redirection   ──► Resource location altered, caching instructions
4xx Client Error  ──► Caller made a mistake (syntax, auth, business rule)
5xx Server Error  ──► Server / infrastructure broke (bug, upstream timeout)
```

---

### 1. The 2xx Success Class

```
200 OK ──────────► Standard synchronous query or update response.
201 Created ─────► Resource created; includes Location header.
202 Accepted ────► Asynchronous job queued; returns polling URL / task ID.
204 No Content ──► Action succeeded; no body returned (e.g., DELETE).
```

* **`200 OK`**: The default success status. Contains an entity payload representing the result of the action.
* **`201 Created`**: The request has succeeded and led to the creation of a new resource.
  * **RFC Mandate**: The response **must** include a `Location` header pointing to the newly created resource's canonical URI:
    ```http
    HTTP/1.1 201 Created
    Location: https://api.stripe.com/v1/customers/cus_N4k28a
    Content-Type: application/json
    ```
* **`202 Accepted`**: The request has been accepted for processing, but the processing has not been completed. This is the cornerstone of **asynchronous event-driven architectures**:
  ```http
  POST /v1/video-renders HTTP/1.1
  Host: api.render.io

  HTTP/1.1 202 Accepted
  Location: /v1/tasks/task_98124
  Retry-After: 30

  {
    "task_id": "task_98124",
    "status": "QUEUED",
    "check_status_url": "/v1/tasks/task_98124"
  }
  ```
* **`204 No Content`**: The server has successfully fulfilled the request and that there is no additional content to send in the response payload. Commonly used for `DELETE` operations or `PUT` updates where the client already has the representation.

---

### 2. The 3xx Redirection Class: The Method Rewriting Trap

When redirecting an HTTP request, using the wrong 3xx code can corrupt data.

```
           ┌────────────────────────┬────────────────────────┐
           │ Legacy (Method Mutates)│ Modern (Method Locked) │
┌──────────┼────────────────────────┼────────────────────────┤
│ Temporary│      302 Found         │ 307 Temporary Redirect │
│          │ (May mutate POST ──►GET│ (Guarantees POST stays)│
├──────────┼────────────────────────┼────────────────────────┤
│ Permanent│  301 Moved Permanently │ 308 Permanent Redirect │
│          │ (May mutate POST ──►GET│ (Guarantees POST stays)│
└──────────┴────────────────────────┴────────────────────────┘
```

#### The Historical Flaw: `301` and `302`
When HTTP/1.0 introduced `301 Moved Permanently` and `302 Found`, web browsers universally implemented an undocumented behavior: **they changed `POST` requests into `GET` requests upon receiving the redirect!**

If a client submitted a checkout form via `POST /pay` and received a `302 Found` pointing to `/checkout/summary`, the browser followed the redirect using `GET /checkout/summary`. 

#### The Modern Standard: `307` and `308` (RFC 7231 / RFC 7538)
To fix this ambiguity, HTTP/1.1 introduced:
* **`307 Temporary Redirect`**: The target resource resides temporarily under a different URI. The client **must not** change the request method if it performs an automatic redirection.
* **`308 Permanent Redirect`**: The target resource has been assigned a new permanent URI. The client **must not** change the request method.

```
Client ──► POST /v1/charge (body: $50) ──► 308 Permanent Redirect (Location: /v2/charge)
Client ──► POST /v2/charge (body: $50) ──► Success (Preserves POST and payload!)
```

---

### 3. The 4xx Client Error Class

4xx codes inform the client that they made an error. **The client should not repeat the identical request without modifications.**

#### The Authentication vs. Authorization Duality
* **`401 Unauthorized` (Actually: Unauthenticated)**: The client has not provided valid authentication credentials. The server does not know who you are.
  * *RFC Requirement*: The response **must** include a `WWW-Authenticate` header indicating the supported auth schemes:
    ```http
    HTTP/1.1 401 Unauthorized
    WWW-Authenticate: Bearer realm="api.enterprise.com", error="invalid_token"
    ```
* **`403 Forbidden`**: The server understands who you are (authentication succeeded), but refuses to authorize the action. You do not have permission.
  * Sending the credentials again will **not** change the outcome.

#### Conflict vs. Validation
* **`400 Bad Request`**: Malformed request syntax, unparseable JSON, or corrupted HTTP framing.
* **`422 Unprocessable Content` (RFC 9110 / RFC 4918)**: The syntax is valid JSON, but the semantics are invalid (e.g., negative loan amount, birth date in the future, missing required business field).
* **`409 Conflict`**: The request could not be completed due to a conflict with the current state of the resource.
  * Used in **optimistic concurrency control**: A client attempts to update a document, but its `version` or `ETag` does not match the server's current state.

```
Client A ──► GET /doc/1 ──────────► Returns ETag: "v1"
Client B ──► GET /doc/1 ──────────► Returns ETag: "v1"
Client A ──► PUT /doc/1 (If-Match: "v1") ──► Success (Server now has "v2")
Client B ──► PUT /doc/1 (If-Match: "v1") ──► 409 Conflict / 412 Precondition Failed!
```

* **`429 Too Many Requests` (RFC 6585)**: The client has exceeded their rate limit.
  * Production systems **must** include the `Retry-After` header telling the client how many seconds or at what UTC timestamp they can safely retry:
    ```http
    HTTP/1.1 429 Too Many Requests
    Retry-After: 60
    X-RateLimit-Limit: 100
    X-RateLimit-Remaining: 0
    X-RateLimit-Reset: 1763121600
    ```

---

### 4. The 5xx Server Error Class: Diagnosing the Ingress Chain

When a client receives a 5xx error, the failure occurred inside the server infrastructure. Unlike 4xx errors, **5xx errors may be retried** (provided the operation is idempotent or protected by an idempotency key).

```
[Client] ──► [Cloudflare CDN] ──► [Envoy Gateway] ──► [Microservice Pod]
                 │                      │                    │
                 │                      │                    └── Throws NullPointer: 500
                 │                      │
                 │                      └── Upstream Pod dead / down: 502 Bad Gateway
                 │                      └── Upstream Pod takes > 30s: 504 Gateway Timeout
                 │
                 └── Whole Origin Cluster Unreachable: 503 / 521 Origin Down
```

* **`500 Internal Server Error`**: An unhandled exception occurred inside the application code (e.g., unhandled `NullPointerException`, database query timeout, out-of-memory).
* **`502 Bad Gateway`**: An edge proxy, reverse proxy, or API gateway (e.g., Nginx, Envoy, AWS ALB) attempted to connect to the upstream backend microservice, but received an invalid response (e.g., connection immediately reset, upstream TCP socket closed, or malformed HTTP header).
* **`503 Service Unavailable`**: The server is currently unable to handle the request due to temporary overloading or scheduled maintenance.
  * Used during **Kubernetes pod rolling restarts**: When a pod enters the termination lifecycle and begins draining connections, its readiness probe fails, causing the ingress router to return `503`.
* **`504 Gateway Timeout`**: An intermediary proxy forwarded the request to the upstream application, but the application failed to return a response within the proxy's configured `proxy_read_timeout` (e.g., long-running database report holding the thread).

---

## 05. The Subtle Production Gotchas

Let's examine the insidious anti-patterns that plague production web systems and how senior architects eliminate them.

### Gotcha 1: The "Everything is 200 OK" Anti-Pattern

```json
// ANTI-PATTERN: The False 200
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": false,
  "errorCode": "ERR_DB_DEADLOCK",
  "message": "Payment processing failed"
}
```

Why do developers do this? Often because older client libraries made catching non-2xx responses tedious. 

**Why this causes catastrophic cascading outages in production:**
1. **Broken Edge Caching**: CDNs and reverse proxies cache responses based on the HTTP status code. If an error returns `200 OK`, Cloudflare or Varnish will cache the error response and serve `"Payment processing failed"` to all subsequent users for the next 24 hours!
2. **Blind Observability & Alerting**: Site Reliability Engineers (SREs) configure Prometheus, Datadog, and Grafana alerts based on HTTP 5xx error rates. When errors masquerade as 200 OK, the platform can be 100% down while monitoring dashboards glow reassuringly green.
3. **Disabled Circuit Breakers**: Service-to-service service meshes (like Istio and Linkerd) use consecutive 5xx errors to trip circuit breakers and route traffic around failing pods. Returning 200 OK prevents circuit breakers from isolating sick instances.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE RFC 7807 / 9457 STANDARD ERROR FORMAT                │
└─────────────────────────────────────────────────────────────────────────────┘

HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{
  "type": "https://api.example.com/errors/insufficient-funds",
  "title": "Insufficient Funds",
  "status": 422,
  "detail": "Your current balance is $14.50, but the transaction was $25.00.",
  "instance": "/v1/accounts/acc_491/transactions/tx_8819",
  "invalid_params": [
    {
      "name": "amount",
      "reason": "Amount exceeds current available ledger balance"
    }
  ]
}
```

---

### Gotcha 2: The Concurrency Race Condition (The ETag Fix)

Consider two customer service agents simultaneously editing an enterprise customer's account notes:

```
Agent A fetches User 42 (Balance: $1000)
Agent B fetches User 42 (Balance: $1000)

Agent A submits: PUT /users/42  {"balance": 1200} ──► Overwrites DB with $1200
Agent B submits: PUT /users/42  {"balance": 800}  ──► Overwrites DB with $800!
(Agent A's update is silently destroyed!)
```

This classic **Lost Update Problem** is solved elegantly using HTTP headers: `ETag` and `If-Match`.

```
1. Server returns initial entity with hash:
   HTTP/1.1 200 OK
   ETag: "hash_abcdef123"

2. Agent A sends update with condition:
   PUT /v1/users/42 HTTP/1.1
   If-Match: "hash_abcdef123"
   {"balance": 1200}
   ──► Server accepts, updates state, calculates new ETag: "hash_999999999"

3. Agent B attempts to update using stale condition:
   PUT /v1/users/42 HTTP/1.1
   If-Match: "hash_abcdef123"
   {"balance": 800}
   ──► Server rejects!
       HTTP/1.1 412 Precondition Failed
       {"error": "Resource was modified by another client. Please reload."}
```

---

### Gotcha 3: The POST-Redirect-GET (PRG) Pattern

Have you ever clicked "Refresh" on a web page and seen the dreaded browser popup:
> *"Confirm Form Resubmission: Are you sure you want to send the form again?"*

This occurs when a web application returns `200 OK` directly in response to a `POST` form submission. If the user hits `F5`, the browser re-executes the last HTTP request—re-submitting the `POST` payment or booking.

```
UNSAFE PATTERN:
Browser ──► POST /checkout ──► Server creates order ──► 200 OK (Renders HTML)
User presses Refresh (F5) ──► Re-sends POST /checkout! (Double purchase!)

THE PRG PATTERN:
Browser ──► POST /checkout ──► Server creates order ──► 303 See Other
                                                        (Location: /orders/8821)
Browser ──► GET /orders/8821 ──► Server returns HTML ──► 200 OK
User presses Refresh (F5) ──► Re-sends GET /orders/8821! (Safe read-only refresh)
```

The **`303 See Other`** status code explicitly tells the user-agent: *"The POST succeeded. Now retrieve the result using a safe `GET` to the URL provided in the `Location` header."*

---

## 06. Architectural Comparison Matrix

| Scenario / Goal | Correct Method | Recommended Status Code | Critical Headers to Include | Client Retry Safety |
| :--- | :--- | :--- | :--- | :--- |
| **Fetch user profile** | `GET` | `200 OK` | `Cache-Control`, `ETag` | Completely Safe & Automatic |
| **Check firmware download size** | `HEAD` | `200 OK` | `Content-Length`, `ETag` | Completely Safe & Automatic |
| **Discover supported endpoints** | `OPTIONS` | `204 No Content` | `Allow`, CORS Headers | Completely Safe & Automatic |
| **Complete replacement of record** | `PUT` | `200 OK` or `204 No Content`| `If-Match` (Optimistic lock) | Safe to Retry |
| **Partial delta field update** | `PATCH` | `200 OK` | `Content-Type: application/merge-patch+json` | Non-Safe (Requires Idempotency Key) |
| **Enqueue massive video processing**| `POST` | `202 Accepted` | `Location` (Job URL), `Retry-After` | Non-Safe (Requires Idempotency Key) |
| **Cancel / delete account** | `DELETE` | `204 No Content` or `200 OK`| `ETag` (if preventing concurrent delete)| Safe to Retry |
| **User submitted negative payment** | Any | `422 Unprocessable Content` | `Content-Type: application/problem+json`| Do NOT Retry without payload fix |
| **Rate limit exceeded** | Any | `429 Too Many Requests` | `Retry-After`, `X-RateLimit-Reset` | Retry AFTER specified delay |
| **Database deadlock in microservice**| Any | `500 Internal Server Error` | RFC 7807 error body | Retry with Exponential Backoff |
| **Upstream service timed out (>30s)**| Any | `504 Gateway Timeout` | `Retry-After` | Retry only if idempotent |

---

## 07. Senior Systems Engineer's Production Checklist

When reviewing API pull requests or architecting high-scale distributed systems, verify each item on this checklist:

* [ ] **Safety Invariance**: Are `GET`, `HEAD`, and `OPTIONS` strictly read-only? Ensure no database updates, balance changes, or audit-log state transitions occur inside `GET` handlers.
* [ ] **PUT vs. PATCH Precision**: Does `PUT` replace the whole resource? If you support partial field updates, is the endpoint explicitly routed as `PATCH` using RFC 7396 or RFC 6902?
* [ ] **Explicit Status Codes**: Are you using the full breadth of HTTP status codes? Eliminate all occurrences of `200 OK` payloads that contain `"error": "..."`.
* [ ] **401 vs. 403 Correctness**: Does `401 Unauthorized` include the mandatory `WWW-Authenticate` header? Is `403 Forbidden` used when identity is verified but permission is denied?
* [ ] **307 / 308 for Preserving POSTs**: When migrating API routes, use `308 Permanent Redirect` instead of `301` to prevent clients from converting `POST` calls to `GET`.
* [ ] **Rate Limiting Visibility**: Do `429` responses include `Retry-After` in seconds or HTTP-date?
* [ ] **Optimistic Concurrency**: Are write-heavy shared resources protected against lost updates using `ETag` and `If-Match`?
* [ ] **Standardized Error Bodies**: Do all 4xx and 5xx responses conform to the RFC 7807 (`application/problem+json`) specification?

---

## 08. Summary & Forward Bridge

HTTP is not merely an arbitrary transport pipe; it is a rich application-level state transfer protocol. By respecting safety and idempotence, leveraging the precise status code taxonomy, and eliminating subtle anti-patterns like fake 200 OK responses and lost updates, you build APIs that are inherently robust, cache-friendly, and maintainable at scale.

Now that our HTTP protocol semantics and status contracts are rock-solid, how do we secure our endpoints against unauthorized access? In the next lesson, we delve into **Lesson 0.4.5: Authentication — Sessions, JWTs, OAuth2 & Distributed Identity**.
