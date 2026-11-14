---
title: "API Design for Interviews: Frameworks, Signatures & Production Best Practices"
slug: api-design-for-interviews
subject: software-architecture-system-design
abstract: Master the art of designing production-grade APIs in high-stakes system design interviews. Learn the 5-step delivery framework used by Staff engineers, how to avoid junior anti-patterns like verbs in URIs and naked arrays, how to design cursor-based pagination, and how industry titans like Stripe and Twitter structure resilient contracts.
tags:
  - api-design
  - interview-guide
  - system-design
  - rest
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
  lesson: "0.4.3"
---

# API Design for Interviews: Frameworks, Signatures & Production Best Practices

In a standard 45-minute system design interview, candidates typically spend the first 10 minutes clarifying requirements and calculating back-of-the-envelope capacity estimations. Then comes the pivotal transition to **Step 2: Defining the System Interface (API Design)**.

This is the exact moment where interviewers separate junior developers from senior and staff systems architects:

* **The Junior Candidate** hastily scribbles vague, ad-hoc function names across the whiteboard:
  ```text
  getUserData()
  postTweet()
  deletePost()
  ```
* **The Staff Engineer** takes a deep breath, identifies the core domain entities, and systematically presents **ergonomic, resource-oriented HTTP/gRPC contracts** complete with pagination cursors, idempotency guarantees, authentication contexts, and deterministic error envelopes.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE ANATOMY OF A MATURE INTERVIEW API                    │
└─────────────────────────────────────────────────────────────────────────────┘

 POST /v1/tweets HTTP/1.1
 Host: api.twitter.com
 Authorization: Bearer eyJhbGciOi...     <-- Never pass userId in the body!
 Idempotency-Key: 8f3a-41b9-92c1...      <-- Guarantees network retry safety!
 Content-Type: application/json

 {
   "text": "Hello world from System Design!",
   "media_ids": ["img_99182"],
   "reply_settings": "MENTIONED_ONLY"
 }

 ─────────────────────────────────────────────────────────────────────────────
 201 Created
 Location: /v1/tweets/tweet_104829
 Content-Type: application/json

 {
   "id": "tweet_104829",
   "text": "Hello world from System Design!",
   "author_id": "usr_42",
   "created_at": "2026-11-14T12:00:00Z"
 }
```

Why do top tech companies (Google, Meta, Stripe, Netflix) scrutinize API design so heavily during system architecture rounds? Because **your API is the public contract of your system**. A database schema can be migrated behind the scenes, but a broken, leaky, or non-scalable API contract will plague client applications, mobile devices, and partner integrations for years.

In this lesson, we will deconstruct API design for system design interviews from first principles: exploring the 5-step whiteboard delivery framework, dissecting real-world case studies from Twitter and Stripe, exposing the common traps that trigger immediate red flags, and analyzing the exact rubric interviewers use to grade your architecture.

---

## 01. The Interviewer's Mental Rubric: What Are They Looking For?

Before writing a single endpoint on the whiteboard, you must understand the hiring committee's evaluation criteria. Interviewers are not looking for encyclopedic knowledge of RFC standards. They are assessing your **engineering maturity**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      THE CANDIDATE LEVELING SPECTRUM                        │
└─────────────────────────────────────────────────────────────────────────────┘

 JUNIOR CANDIDATE
 • Treats API as simple RPC functions: /createPost, /getFeed
 • Leaks internal database column names directly into JSON keys
 • Returns unbounded arrays: GET /followers returns 10 million items
 • HTTP 200 OK for everything: { "success": false, "error": "Crash" }

 MID-LEVEL CANDIDATE
 • Uses standard REST nouns and verbs: POST /posts, GET /feed
 • Implements basic offset pagination: ?page=2&limit=50
 • Uses standard HTTP status codes: 200, 201, 400, 404, 500

 SENIOR & STAFF CANDIDATE
 • Treats API as a stable business boundary and encapsulation wall
 • Uses Keyset/Cursor pagination to prevent missing/duplicate items on feeds
 • Enforces Idempotency Keys on mutating financial and order endpoints
 • Avoids security leaks (extracts caller identity from validated JWT context)
 • Standardizes on RFC 7807 problem details error envelopes
 • Articulates rate-limiting headers and backward-compatibility versioning
```

---

## 02. The 5-Step Whiteboard Delivery Framework

To deliver an exceptional API design under the tight time constraints of an interview, never jump straight to writing JSON. Follow this **5-Step Delivery Framework**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE 5-STEP API DESIGN INTERVIEW FLOW                     │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Step 1: Identify Core Nouns ] ────────► Map business requirements to Resources
               │                           (Users, Tweets, Rides, Orders)
               ▼
 [ Step 2: Map CRUD & Actions ] ─────────► Assign standard HTTP verbs
               │                           (POST, GET, PUT, PATCH, DELETE)
               ▼
 [ Step 3: Define Request Signatures ] ──► Specify Headers, Path Params & Body
               │                           (Auth, Idempotency-Key, Payload)
               ▼
 [ Step 4: Define Response Schemas ] ────► Structure envelopes & status codes
               │                           (201 Created, 200 OK, 409 Conflict)
               ▼
 [ Step 5: Address Scale Mechanics ] ────► Defend against scale traps
                                           (Cursor Pagination, Rate Limiting)
```

### Step 1: Identify the Core Domain Entities (Nouns)
Look at the functional requirements you gathered in Step 1 of the interview:
* *"User can post a tweet"* $\rightarrow$ Entity: `Tweet`
* *"User can follow another user"* $\rightarrow$ Relationship: `Follow`
* *"User can view their home timeline"* $\rightarrow$ Derived Resource: `Timeline`

### Step 2: Map HTTP Verbs to Resource URIs
Never use verbs in URIs. Let HTTP verbs convey the intent:
* `POST /v1/tweets` (Create)
* `GET /v1/tweets/{tweet_id}` (Read)
* `DELETE /v1/tweets/{tweet_id}` (Delete)
* `POST /v1/users/{user_id}/followers` (Follow a user)

### Step 3: Define Request Contracts (Headers, Parameters, Body)
Explicitly state:
* Where does authentication sit? (`Authorization: Bearer <token>`)
* Where does entity filtering sit? (`?status=ACTIVE&category=TECH`)
* Where does mutation data sit? (JSON Request Body)

### Step 4: Define Response Envelopes & Status Codes
Avoid returning raw strings or naked JSON primitives. Wrap responses in deterministic data envelopes with explicit HTTP status codes (`201 Created`, `200 OK`, `204 No Content`).

### Step 5: Address Resilience & Scale Mechanics
Proactively bring up edge cases before the interviewer prompts you:
* *"Since a user can have 50 million followers, this endpoint must not return an unbounded array. I will use cursor-based pagination."*
* *"Since mobile networks are unreliable and users may tap 'Pay' multiple times during packet drops, I will require an `Idempotency-Key` header."*

---

## 03. Real-World Case Study 1: Designing Twitter / X API

Let's apply this framework to the quintessential system design problem: **Design Twitter / X**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      TWITTER API ARCHITECTURAL CONTRACT                     │
└─────────────────────────────────────────────────────────────────────────────┘

 1. CREATE TWEET
    POST /v1/tweets
    Headers:
      Authorization: Bearer <jwt>
      Idempotency-Key: <uuid>
    Body:
      {
        "text": "Streaming systems from first principles!",
        "media_ids": ["media_8812"],
        "reply_to_tweet_id": null
      }
    Response: 201 Created

 2. FETCH HOME TIMELINE (Cursor Pagination)
    GET /v1/timelines/home?limit=20&max_id=tweet_104820
    Headers:
      Authorization: Bearer <jwt>
    Response: 200 OK
```

### Why Offset Pagination Breaks at Twitter Scale

In junior interviews, candidates frequently suggest offset pagination for timelines:
```http
GET /v1/timelines/home?page=2&limit=20
```

:::callout{type="danger" title="The Infinite Scroll 'Duplicate Item' Bug"}
Imagine you are scrolling through Twitter. Page 1 returns Tweets 1 to 20.  
While you are reading, **three new tweets are posted by people you follow**.  
When your phone requests `page=2`, the database offset skips the first 20 records. But because 3 new tweets were inserted at the top of the timeline, **Tweets 18, 19, and 20 shift down into page 2!**  
The user scrolls down and sees the exact same tweets repeated. Even worse, if you delete a tweet, items are skipped entirely!
:::

Furthermore, in relational databases, `OFFSET 1000000 LIMIT 20` forces the database engine to scan 1,000,020 rows, discard the first million, and return 20—causing catastrophic disk I/O and CPU spikes.

### The Production Solution: Keyset / Cursor-Based Pagination

Senior engineers always propose **Cursor-Based Pagination** using immutable Snowflake IDs:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CURSOR PAGINATION: USING SNOWFLAKE IDS                   │
└─────────────────────────────────────────────────────────────────────────────┘

 Chronological Stream of Tweets (Snowflake IDs are 64-bit time-sortable):
 [ Tweet 105 ] (Newest)
 [ Tweet 104 ]
 [ Tweet 103 ]
 [ Tweet 102 ] <--- Client currently has this as its lowest seen ID!
 [ Tweet 101 ]
 [ Tweet 100 ]

 Request for Next Page:
 GET /v1/timelines/home?limit=2&max_id=tweet_102

 Underlying Database Query:
 SELECT * FROM tweets 
 WHERE user_id = 42 AND tweet_id < 102 
 ORDER BY tweet_id DESC 
 LIMIT 2;
 (Blazing-fast B-Tree index seek: O(log N) instead of O(N) scan!)
```

```json title="Response Envelope with Pagination Metadata"
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": [
    {
      "id": "tweet_101",
      "text": "Distributed consensus deconstructed.",
      "author_id": "usr_99",
      "created_at": "2026-11-14T11:45:00Z"
    },
    {
      "id": "tweet_100",
      "text": "LSM trees vs B-Trees on NVMe drives.",
      "author_id": "usr_77",
      "created_at": "2026-11-14T11:30:00Z"
    }
  ],
  "meta": {
    "result_count": 2,
    "newest_id": "tweet_101",
    "oldest_id": "tweet_100",
    "next_cursor": "tweet_100"
  }
}
```

---

## 04. Real-World Case Study 2: Designing Financial & E-Commerce APIs (Stripe)

When designing payment, ride-hailing, or e-commerce ordering systems, interviewers are listening for one critical architectural concern: **Transaction Consistency and Network Retries**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  FINANCIAL PAYMENT API WITH IDEMPOTENCY                     │
└─────────────────────────────────────────────────────────────────────────────┘

 POST /v1/payments/charges HTTP/1.1
 Host: api.stripe.com
 Authorization: Bearer sk_live_xyz
 Idempotency-Key: 9a8b7c6d-5e4f-3a2b-1c0d-e9f8a7b6c5d4
 Content-Type: application/json

 {
   "order_id": "ord_88412",
   "amount_cents": 4999,
   "currency": "usd",
   "payment_method_id": "pm_card_visa_4242"
 }
```

### The Three Critical Elements of this Contract:

#### 1. The `Idempotency-Key` Header
When a user clicks "Pay $49.99" in a subterranean subway station, the cell signal may drop after the server debits the credit card but before the `200 OK` response packet reaches the phone. 

By requiring an `Idempotency-Key` (a unique UUID v4 generated by the mobile client), the client can safely retry the request 5 times without fear of charging the customer's card twice.

#### 2. Integer Currency Representations (`amount_cents`)
Notice the field: `"amount_cents": 4999`. 

:::callout{type="warning" title="The Floating-Point IEEE 754 Trap"}
Never use floating-point numbers (`"amount": 49.99`) for financial APIs! In floating-point binary representation:  
`0.1 + 0.2 = 0.30000000000000004`  
Over millions of transactions, rounding errors introduce silent accounting discrepancies. Elite payment systems (Stripe, Adyen, PayPal) always express currency in the smallest indivisible unit (cents, pence, yen) as 64-bit integers.
:::

#### 3. Asynchronous State Processing (`202 Accepted`)
What happens if the bank requires a **3D-Secure Two-Factor Authentication** challenge (OTP sent to user's phone)? The payment cannot complete synchronously in 200 milliseconds.

The API must return status code **202 Accepted** with a state machine status:

```json title="HTTP 202 Accepted Response"
HTTP/1.1 202 Accepted
Content-Type: application/json

{
  "id": "pi_109283",
  "status": "REQUIRES_ACTION",
  "next_action": {
    "type": "REDIRECT_TO_URL",
    "redirect_url": "https://bank.com/verify/3ds/pi_109283"
  }
}
```

---

## 05. The Top 5 "Junior Tells" in System Design Interviews

Interviewers watch for subtle technical blunders that instantly reveal a candidate's lack of production scale experience:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE 5 CLASSIC API DESIGN RED FLAGS                       │
└─────────────────────────────────────────────────────────────────────────────┘

 1. VERBS IN THE URI PATH
    ❌ POST /api/v1/deleteUserAccount
    ✅ DELETE /api/v1/users/{user_id}

 2. PASSING CALLER IDENTITY IN THE BODY
    ❌ POST /v1/messages { "sender_id": "usr_42", "text": "Hi" }
    ✅ Extract identity from validated JWT context in Authorization header!

 3. RETURNING NAKED ARRAYS
    ❌ [ { "id": 1 }, { "id": 2 } ]
    ✅ Wrap in object: { "data": [ ... ], "pagination": { ... } }

 4. THE HTTP 200 "FALSE SUCCESS" ANTI-PATTERN
    ❌ HTTP 200 OK { "success": false, "error": "Database down" }
    ✅ HTTP 503 Service Unavailable { "code": "DB_UNAVAILABLE" }

 5. UNBOUNDED QUERY RESPONSES
    ❌ GET /v1/orders (Returns 40,000 orders in one giant JSON payload)
    ✅ GET /v1/orders?limit=50 (Mandatory pagination ceiling)
```

### Explaining the Anti-Patterns:

* **Passing `user_id` in the Request Body:** If an endpoint `POST /v1/messages` accepts `"sender_id": "usr_42"` in the JSON body, an attacker can tamper with the JSON to forge messages on behalf of any user in the database! In production, identity is extracted server-side from the cryptographically verified JWT or session cookie in the `Authorization` header.
* **Returning Naked Arrays:** If you return `[ { "id": 1 } ]`, you can never add top-level metadata (pagination cursors, rate-limit statistics, execution timing) in the future without breaking every client parser. Always return a top-level object: `{"data": [ ... ], "meta": { ... }}`.
* **HTTP 200 for Errors:** Returning HTTP 200 when a transaction fails breaks HTTP proxies, monitoring dashboards (Datadog, Prometheus), edge CDNs, and automated circuit breakers, which rely strictly on HTTP 4xx/5xx status codes to detect outages.

---

## 06. Standardization: Deterministic Error Envelopes (RFC 7807)

When designing an API on the whiteboard, don't just sketch the "happy path." Staff engineers explicitly demonstrate how the system communicates failure.

Instead of arbitrary error shapes, reference the industry standard: **RFC 7807 (Problem Details for HTTP APIs)**:

```json title="Standard RFC 7807 Error Envelope"
HTTP/1.1 409 Conflict
Content-Type: application/problem+json

{
  "type": "https://api.store.com/errors/insufficient-inventory",
  "title": "Insufficient Stock",
  "status": 409,
  "detail": "The requested SKU 'KB-42' has only 2 units available, but 5 were requested.",
  "instance": "/v1/orders/ord_8812",
  "code": "OUT_OF_STOCK",
  "invalid_params": [
    {
      "name": "quantity",
      "reason": "Must be less than or equal to current available stock (2)"
    }
  ]
}
```

### Why This Resonates with Interviewers:
1. **Machine-Readable Codes:** The `"code": "OUT_OF_STOCK"` allows frontend client code to switch on deterministic programmatic strings rather than parsing unstable human-readable English text.
2. **Field-Level Validation:** The `"invalid_params"` array lets mobile apps highlight the exact input field with an inline red border on the UI.
3. **Traceability:** The `"instance"` URI correlates directly to server-side distributed trace logs.

---

## 07. Architectural Comparison Matrix: Candidate Performance Rubric

| Assessment Dimension | Junior Level (L3) | Senior Level (L5) | Staff / Principal Level (L6+) |
| :--- | :--- | :--- | :--- |
| **URI Naming** | Procedural verbs (`/getUser`, `/saveData`) | Strict resource nouns (`/v1/users`) | Resource hierarchy with sub-collections (`/v1/orgs/{id}/members`) |
| **Pagination** | None (returns full array) | Offset/Limit (`?page=1&limit=20`) | **Keyset / Cursor (`?cursor=xyz&limit=50`)** with performance defense |
| **Authentication** | Passes `user_id` in URL or body | Mentions Bearer Token header | Extracts claims from JWT context; articulates OAuth2 scope checks |
| **Network Resilience** | Assumes network is reliable | Retries blindly on failure | **Enforces Idempotency Keys** and jittered backoff on client retries |
| **Error Handling** | String error messages or HTTP 200 | Standard status codes (400, 404, 500)| **Structured RFC 7807 envelopes** with programmatic error codes |
| **Rate Limiting** | Ignores rate limits | Mentions "we should rate limit" | **Designs quota headers** (`X-RateLimit-*`) and HTTP 429 Retry-After |

---

## 08. Senior Systems Engineer's Production & Interview Checklist

When designing APIs on a whiteboard or in production code, run through this mental checklist:

- [ ] **Are all URIs composed strictly of nouns?**  
  Verify there are zero verbs in your paths (use HTTP verbs `GET`, `POST`, `PUT`, `PATCH`, `DELETE` instead).
- [ ] **Is pagination strictly enforced on all collection endpoints?**  
  Never allow an endpoint to return an unbounded list. Use **Cursor/Keyset pagination** for continuous social feeds and event streams; use **Offset pagination** only for administrative tables with search filters.
- [ ] **Are mutations protected by Idempotency Keys?**  
  Require `Idempotency-Key` headers on non-idempotent endpoints (`POST`, `PATCH`) that process financial transactions, bookings, or notifications.
- [ ] **Is the caller identity decoupled from the payload?**  
  Never accept `current_user_id` in request bodies. Extract verified identity strictly from validated session headers (`Authorization: Bearer <token>`).
- [ ] **Are financial numbers represented as integers?**  
  Never use floating-point types for currencies. Express monetary values in the smallest indivisible unit (`amount_cents`, `currency: "USD"`).
- [ ] **Are error responses structured and machine-readable?**  
  Adopt RFC 7807 Problem Details with explicit programmatic codes (`"INVALID_COUPON"`, `"RATE_LIMIT_EXCEEDED"`).
- [ ] **Are rate-limiting semantics clearly communicated?**  
  Publish quota metadata in headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) and return `429 Too Many Requests` with `Retry-After`.

---

## 09. Summary & Bridge to Lesson 0.4.4

We have deconstructed the discipline of API design for system design interviews:

1. **The Core Philosophy:** An API is a public, immutable contract. Staff engineers treat it as an encapsulation wall that shields internal architecture from external dependencies.
2. **The 5-Step Framework:** Move methodically from Domain Nouns $\rightarrow$ HTTP Verbs $\rightarrow$ Request Signatures $\rightarrow$ Response Envelopes $\rightarrow$ Scale Mechanics.
3. **Cursor Pagination:** Eliminate the infinite scroll duplicate item bug and avoid database $O(N)$ scan penalties by ordering on immutable, time-sortable Snowflake IDs.
4. **Resilience by Design:** Guard against network drops and duplicate billing using Idempotency Keys and integer currency fields.

### What Comes Next?

Now that we master the macro-structure of API design for interviews, we must zoom in on the **micro-mechanics of the HTTP protocol itself**:

* What is the precise semantic difference between `PUT` (complete replacement) and `PATCH` (partial modification)?
* Why is `DELETE` required by the HTTP specification to be **idempotent**, even if the resource is already gone?
* What are the subtle gotchas of HTTP status codes (`401 Unauthorized` vs `403 Forbidden`, `400 Bad Request` vs `422 Unprocessable Entity`)?

In our next lesson, **[Lesson 0.4.4: Methods, status codes, gotchas](/notes/methods-status-codes-gotchas)**, we will master the exact protocol semantics and edge-case traps that senior interviewers love to probe!
