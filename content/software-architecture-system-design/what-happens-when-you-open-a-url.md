---
title: "What Happens When You Open a URL? The Complete Request Lifecycle"
slug: what-happens-when-you-open-a-url
subject: software-architecture-system-design
abstract: The definitive, microscopic end-to-end breakdown of what occurs when a user types a URL and presses Enter. From hardware keyboard interrupts and browser HSTS preloads to ARP discovery, BGP routing, TLS 1.3 handshakes, OS kernel epoll ingress, database query execution, and the browser's Critical Rendering Path.
tags:
  - networking
  - request-lifecycle
  - system-design
  - interview-guide
  - architecture
  - browser-internals
published: true
publishDate: Nov 13, 2026
updatedDate: Nov 13, 2026
readTime: 22m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
learningPath:
  slug: system-design
  name: "System Design"
  module: "sd-mod-0-0"
  moduleName: "Networking Fundamentals for System Design"
  lesson: "0.0.8"
---

# What Happens When You Open a URL? The Complete Request Lifecycle

It is the most famous question in software engineering interviews:

> *"What happens when you type `https://store.com/products/42` into your browser's address bar and press Enter?"*

Interviewers at Google, Amazon, Netflix, and Meta don't ask this question to test trivia memorization. They ask it because it is the **ultimate diagnostic test of your mental model of computing**. It exposes whether an engineer views software as a collection of magical abstractions or deeply understands how hardware, operating systems, networking protocols, distributed databases, and rendering engines physically collaborate across the planet.

In this deep dive, we will trace the journey of that request from the mechanical click of your keyboard to the photodiode firing on your screen—connecting every protocol and system boundary we study in this foundational curriculum.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 THE 7 CHRONOLOGICAL PHASES OF A WEB REQUEST                 │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Phase 1: Client Hardware & Browser Omnibox ]
   Keyboard Scan Codes ──► Browser Omnibox Heuristic ──► HSTS Preload Check
                                │
                                ▼
 [ Phase 2: Local Caches & Address Resolution ]
   Browser Cache ──► OS /etc/hosts ──► Recursive DNS ──► ARP Gateway MAC
                                │
                                ▼
 [ Phase 3: Crossing the Physical Planet ]
   Wi-Fi Radio Waves ──► Fiber Optic Light ──► BGP Routing ──► Anycast PoP
                                │
                                ▼
 [ Phase 4: Transport & Cryptographic Handshake ]
   TCP 3-Way Handshake (SYN/ACK) ──► TLS 1.3 ECDHE Key Exchange (1-RTT)
                                │
                                ▼
 [ Phase 5: Server Ingress & Reverse Proxy Routing ]
   NIC DMA ──► Linux Softirq ──► Socket Buffer ──► Epoll ──► Nginx Ingress
                                │
                                ▼
 [ Phase 6: Application Processing & Data Tier ]
   JWT Auth ──► Redis Cache Lookup ──► PostgreSQL B-Tree Scan ──► JSON Serializer
                                │
                                ▼
 [ Phase 7: Client Parsing & Critical Rendering Path ]
   TCP Stream Assembly ──► DOM & CSSOM ──► Render Tree ──► Layout ──► Paint
```

---

## 01. Phase 1: The Human Keystroke & Omnibox Heuristics

The journey begins the physical instant your finger depresses the **Enter** key.

```
 [ Mechanical Switch Closes ]
              │
              ▼
 [ Keyboard Microcontroller ] ──► Encodes USB Scan Code (0x28 for Enter)
              │
              ▼
 [ USB Interrupt Line (IRQ 1)] ──► CPU interrupts current thread
              │
              ▼
 [ OS Kernel Input Driver ]   ──► Translates scan code to Virtual Key Event
              │
              ▼
 [ Browser Window Event Loop ]──► Window receives WM_KEYDOWN / keypress event
```

### 1. URL Parsing vs Search Query Heuristic
Before sending a single bit onto the wire, the browser's UI thread parses the raw string in the Omnibox:
* Does the text contain a valid Top-Level Domain (TLD) like `.com`, `.org`, or `.io`?
* Does it begin with an explicit protocol scheme (`http://`, `https://`, `ftp://`)?
* Does it contain whitespace?

If you type `store products`, the browser determines there is no valid hostname and forwards the string as a query parameter to your default search engine: `https://www.google.com/search?q=store+products`.

Because you typed `https://store.com/products/42`, the browser decomposes the URI into its canonical RFC 3986 components:

```
  https://store.com:443/products/42?ref=nav#reviews
  └──┬──┘ └───┬───┘ └─┬─┘ └────┬────┘ └───┬───┘ └───┬───┘
   Scheme   Host     Port     Path       Query   Fragment
```

### 2. The HSTS Preload Check (Preventing SSL Stripping)
Before checking DNS, modern browsers check their internal hardcoded **HSTS (HTTP Strict Transport Security) Preload List**:

:::callout{type="warning" title="Security Invariant: The SSL Stripping Attack"}
If a user types `store.com`, a naive browser first issues an unencrypted HTTP request to `http://store.com:80`. A rogue actor at a public coffee shop Wi-Fi router can intercept that first plaintext packet, strip the redirect to HTTPS, and proxy all traffic unencrypted.
:::

If `store.com` is registered in Chrome's HSTS database, the browser immediately rewrites the URL to `https://store.com` in memory with an internal synthetic `307 Internal Redirect`—**before any packet touches the Wi-Fi card**.

---

## 02. Phase 2: Address Discovery: DNS & The Local Network

Your browser now knows it must contact `store.com` over HTTPS. But internet routers cannot forward packets based on English text. They require a 32-bit (IPv4) or 128-bit (IPv6) numerical coordinate.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DNS CACHE RESOLUTION WATERFALL                        │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Browser DNS Cache ] ──── Hit? ───► Done! (Instant 0ms)
          │ Miss
          ▼
 [ OS Kernel DNS Cache ] ── Hit? ───► Done! (e.g. systemd-resolved / GetAddrInfo)
          │ Miss
          ▼
 [ Local hosts File ] ───── Hit? ───► Done! (/etc/hosts or C:\Windows\System32\drivers\etc\hosts)
          │ Miss
          ▼
 [ Router / Gateway Cache ] Hit? ───► Done! (Home Wi-Fi router DNS cache)
          │ Miss
          ▼
 [ ISP Recursive Resolver ] ────────► Hierarchical Traversal:
                                      Root (.) ──► TLD (.com) ──► Authoritative
```

### 1. Hierarchical Recursive Resolution
If every local cache misses, the OS sends a UDP packet on port 53 to your configured Recursive Resolver (e.g., your local ISP or Cloudflare `1.1.1.1`):
1. **Root Nameserver:** The recursive resolver asks the Root: *"Where is `.com`?"* The Root returns the IP addresses of the 13 Top-Level Domain (TLD) authoritative servers.
2. **TLD Nameserver:** The resolver asks the `.com` TLD server: *"Where is `store.com`?"* The TLD server responds with the Nameserver (NS) records for `ns1.store.com`.
3. **Authoritative Nameserver:** The resolver asks `ns1.store.com`: *"What is the `A` record for `store.com`?"* It returns `198.51.100.42` with a Time-to-Live (TTL) of 300 seconds.

### 2. Address Resolution Protocol (ARP): Reaching the Gateway
The browser now has the destination IP: `198.51.100.42`. 

Your computer wants to send an IP packet to this address. However, your computer is not directly plugged into `198.51.100.42`. It is plugged into a local network switch or connected via Wi-Fi to a local router (Default Gateway, e.g., `192.168.1.1`).

At the Data Link Layer (OSI Layer 2), network interface cards (NICs) communicate using **physical 48-bit MAC addresses**:

```
 [ Your Laptop: 192.168.1.50 ]                      [ Gateway Router: 192.168.1.1 ]
 [ MAC: 3c:22:fb:a1:04:72    ]                      [ MAC: a4:93:3f:6b:11:89      ]
              │                                                   │
              │ 1. ARP Request Broadcast (Ethernet FF:FF:FF:FF:FF:FF):
              │    "Who has IP 192.168.1.1? Tell 192.168.1.50!"  │
              │──────────────────────────────────────────────────►│
              │                                                   │
              │ 2. ARP Reply (Unicast):                           │
              │    "192.168.1.1 is at a4:93:3f:6b:11:89"          │
              │◄──────────────────────────────────────────────────│
```

Your computer caches this MAC address in its kernel ARP table (`arp -a`). It wraps the IP packet inside an Ethernet frame with:
* **Destination MAC:** `a4:93:3f:6b:11:89` (Your local router).
* **Destination IP:** `198.51.100.42` (The remote web server).

---

## 03. Phase 3: The Physical Transit: BGP & Anycast Routing

Your laptop's Wi-Fi card converts the digital frame into high-frequency 5 GHz electromagnetic radio waves. Your home access point captures the radio waves, extracts the Ethernet frame, and sends it down a copper or fiber line to your Internet Service Provider (ISP).

```
 [ Home Wi-Fi Router ]
          │ (Radio Frequency)
          ▼
 [ Cable Modem / ONT Fiber Terminal ]
          │ (Light pulses down glass fiber)
          ▼
 [ ISP Central Office / Edge Router ]
          │
          ▼
 [ Autonomous System (AS) Border Router ] ── BGP Peering ──► [ Internet Exchange (IXP) ]
                                                                      │
                                                                      ▼
                                                             [ Edge Anycast CDN PoP ]
                                                             (e.g., Cloudflare/AWS)
```

### 1. Autonomous Systems and BGP
The global internet is a network of over 100,000 independent networks called **Autonomous Systems (AS)**. 

To determine the fastest path from your home ISP (e.g., Comcast AS7922) to the server's cloud provider (e.g., AWS AS16509), routers run the **Border Gateway Protocol (BGP)**. BGP routers continuously exchange routing tables based on network hops, latency agreements, and peering contracts.

### 2. Anycast Routing: Hitting the Edge
In modern architectures, `198.51.100.42` does not point to a single computer sitting in a basement. It is an **Anycast IP address** announced simultaneously by hundreds of data centers worldwide. 

Because of BGP Anycast, your packet is automatically routed across the shortest physical fiber path to the nearest **Content Delivery Network (CDN) Point of Presence (PoP)**—perhaps just 5 miles from your house.

---

## 04. Phase 4: Establishing Transport & Security: TCP & TLS 1.3

Having reached the physical edge server, your browser must establish a reliable, encrypted channel.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMBINED TCP + TLS 1.3 HANDSHAKE (2-RTT)                 │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Client ]                                                    [ Edge Server ]
     │                                                               │
     │ ────────────────── 1. TCP SYN (Seq=X) ───────────────────────►│ (RTT 1: TCP)
     │ ◄───────────────── 2. TCP SYN-ACK (Seq=Y, Ack=X+1) ───────────│
     │ ────────────────── 3. TCP ACK + TLS Client Hello ────────────►│ (RTT 2: TLS 1.3)
     │                       (CipherSuites, ECDHE Key Share: g^a)    │
     │                                                               │
     │ ◄───────────────── 4. TLS Server Hello ───────────────────────│
     │                       (Server ECDHE: g^b, Certificate, Handshake Finished)
     │                                                               │
     │ [ Master Secret Derived! Symmetric Encryption Active ]        │
     │                                                               │
     │ ────────────────── 5. HTTP GET /products/42 ─────────────────►│ (RTT 3: Data)
     │                       (Encrypted Application Payload)         │
```

### 1. The TCP 3-Way Handshake
1. **SYN:** The client picks a pseudo-random Initial Sequence Number ($X$) and sends a TCP SYN packet.
2. **SYN-ACK:** The server acknowledges with $ACK = X + 1$ and picks its own sequence number $Y$.
3. **ACK:** The client acknowledges with $ACK = Y + 1$. 

The connection is now `ESTABLISHED`. Both operating systems have allocated socket buffers for flow control.

### 2. The TLS 1.3 Cryptographic Handshake
In legacy TLS 1.2, negotiating encryption required an additional 2 Round-Trip Times (RTT). In modern **TLS 1.3**, this is reduced to **1 RTT**:
* **Speculative Key Exchange:** In the very first message (`Client Hello`), the browser guesses the server's cryptographic curve (almost universally `X25519`) and proactively includes its Ephemeral Diffie-Hellman public key share ($g^a$).
* **Server Response:** The server accepts the cipher suite (e.g., `TLS_AES_256_GCM_SHA384`), provides its public key share ($g^b$), and sends an encrypted certificate.
* Both sides independently compute the shared secret ($g^{ab}$). All subsequent application bytes are encrypted using symmetric AES-256-GCM.

*(Note: If using **HTTP/3 over QUIC**, the TCP handshake and TLS handshake are merged into a single 1-RTT UDP exchange!)*

---

## 05. Phase 5: Server Ingress: From Kernel Ring Buffers to Reverse Proxy

The encrypted HTTP request arrives at the data center. What happens inside the host server?

```
 [ Physical Network Interface Card (NIC) ]
              │
              ▼ (Direct Memory Access - DMA)
 [ Kernel RX Ring Buffer in RAM ]
              │
              ▼ (Hardware Interrupt -> NAPI Polling)
 [ Linux Softirq Daemon (ksoftirqd) ]
              │
              ▼ (IP Reassembly & TCP Checksum Verification)
 [ Socket Receive Buffer (SO_RCVBUF) ]
              │
              ▼ (epoll_wait wakes worker thread)
 [ Nginx / Envoy Reverse Proxy (User Space) ]
```

### 1. Kernel Network Ingress
1. **DMA to RAM:** The NIC receives electrical or optical pulses, checks the frame CRC checksum, and writes the packet directly into host RAM via **Direct Memory Access (DMA)** without using CPU cycles.
2. **NAPI Softirq:** The NIC raises a hardware interrupt. The Linux kernel switches to polling mode via the **NAPI (New API)** subsystem to drain packets from the ring buffer without causing interrupt livelock.
3. **Socket Buffer:** The kernel TCP stack unwraps the IP envelope, reorders any out-of-order packets using sequence numbers, and appends the decrypted byte stream into the socket's `SO_RCVBUF`.
4. **Epoll Notification:** An asynchronous event loop (`epoll_wait`) wakes up an **Nginx worker process** that was sleeping while waiting for activity on that socket file descriptor.

### 2. Reverse Proxy Ingress & TLS Termination
The reverse proxy (Nginx, Envoy, or HAProxy):
1. **Terminates TLS:** Decrypts the payload using its private SSL key.
2. **Evaluates Routing Rules:** Inspects the request path `/products/42`.
3. **Load Balancing:** Checks the health of internal upstream application instances and forwards the request via an internal private VPC connection (e.g., `http://10.0.4.15:8080`) using **Least Connections** or **Round Robin**.

---

## 06. Phase 6: Application Execution & Data Retrieval

The internal request reaches your application runtime (e.g., a Spring Boot Java microservice running in a Docker container).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 APPLICATION RUNTIME & DATA TIER RETRIEVAL                   │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Ingress Request ] ──► [ Security Filter Chain ] ──► Validates JWT Signature
                                 │
                                 ▼
                         [ Controller / Handler ] ─► GET /products/42
                                 │
                                 ▼
                     [ Cache Layer (Redis) ]
                     Query: GET product:42
                                 │
                 ┌───────────────┴───────────────┐
                 │ Cache Hit (0.5ms)             │ Cache Miss
                 ▼                               ▼
       [ Return Cached JSON ]          [ Database Tier (PostgreSQL) ]
                                       Acquire connection from HikariCP Pool
                                                 │
                                                 ▼
                                       Query: SELECT * FROM products WHERE id = 42;
                                       B-Tree Index Scan on Primary Key
                                                 │
                                                 ▼
                                       Read buffer pool RAM ──► Row serialized to DTO
                                                 │
                                                 ▼
                                       Write-through to Redis cache (TTL: 1 hour)
```

### 1. Authentication & Security Middleware
The incoming request passes through an interceptor chain:
* Extracts `Authorization: Bearer <JWT>` from headers.
* Verifies the cryptographic HMAC or RSA signature of the token against public keys.
* Verifies token expiration (`exp`) and extracts claims (`userId: 1049`).

### 2. Multi-Tier Cache-Aside Pattern
The application checks its high-speed in-memory store:
```bash
REDIS: GET product:42
```
* **Cache Hit:** If found in Redis, the serialized JSON is returned in under **1 millisecond**, completely bypassing the relational database.
* **Cache Miss:** If not cached, the application leases a database connection from its connection pool (**HikariCP**).

### 3. Database Execution
The database (e.g., PostgreSQL) receives the SQL query:
```sql
SELECT id, title, price_cents, stock_count, description 
FROM products 
WHERE id = 42;
```
1. **Query Planner:** Checks cached query plans. It recognizes that `id` is the primary key.
2. **Index Lookup:** Performs an $O(\log N)$ search down the table's **B-Tree index** to locate the exact disk page address.
3. **Buffer Pool:** PostgreSQL checks its `shared_buffers` cache in RAM. If the page is already cached, it reads it directly; otherwise, it triggers a synchronous SSD read.
4. **Result Set:** The row is returned over the database socket to Spring Boot.

### 4. Response Dispatch
The application serializes the internal DTO into a JSON string, writes it to the HTTP response body with status `200 OK`, applies **gzip or Brotli compression**, and sends it back to the reverse proxy, which streams it back across the internet to the client.

```http title="HTTP/2 200 OK Response Stream"
HTTP/2 200 OK
content-type: application/json; charset=utf-8
content-encoding: br
cache-control: public, max-age=3600, stale-while-revalidate=60
etag: W/"4f2a-89bc10"
content-length: 1248
date: Fri, 13 Nov 2026 19:25:00 GMT

{
  "id": 42,
  "title": "Mechanical Ergonomic Keyboard",
  "price_cents": 19900,
  "in_stock": true
}
```

---

## 07. Phase 7: Client Parsing & The Critical Rendering Path

The browser receives the raw byte stream from the network card. How does it turn those binary packets into interactive pixels on your monitor?

This sequence is known as the **Critical Rendering Path (CRP)**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THE CRITICAL RENDERING PATH                           │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Bytes from Network ] ──► [ Characters ] ──► [ Tokens ] ──► [ Nodes ]
                                                                   │
                                                                   ▼
 HTML Document ──────────────────────────────────────────────► [ DOM Tree ]
                                                                   │
 CSS Stylesheets ────────────────────────────────────────────► [ CSSOM Tree ]
                                                                   │
                                                                   ▼
                                                          [ Render Tree ]
                                                    (Only visible nodes)
                                                                   │
                                                                   ▼
                                                          [ Layout / Reflow ]
                                                    (Calculate X, Y, Width, Height)
                                                                   │
                                                                   ▼
                                                          [ Paint / Rasterize ]
                                                    (Fill pixels into memory layers)
                                                                   │
                                                                   ▼
                                                          [ Compositing (GPU) ]
                                                    (Draw layers to physical screen)
```

### 1. Constructing the DOM (Document Object Model)
As HTML bytes arrive in 14KB TCP chunks, the browser parser does not wait for the whole file to download. It parses incrementally:
* **Tokenization:** Converts `<h1>` into a start tag token, text into character tokens, and `</h1>` into an end tag token.
* **Tree Construction:** Emits node objects into a parent-child hierarchy representing the **DOM Tree**.

### 2. Constructing the CSSOM (CSS Object Model)
When the parser encounters `<link rel="stylesheet" href="styles.css">`, it dispatches a network fetch.
Unlike HTML, **CSS is render-blocking**: the browser cannot render partially styled content (which would cause a jarring Flash of Unstyled Content, or FOUC). It constructs the **CSSOM Tree**, computing inherited styles for every selector.

### 3. JavaScript Execution & Parser Blocking
When the parser hits a standard `<script src="app.js">`:
* HTML parsing **halts completely**.
* The JavaScript engine (**V8** in Chrome, **SpiderMonkey** in Firefox) downloads, compiles (via JIT compilation), and executes the script.
* Why? Because JavaScript has the power to mutate the DOM using `document.write()` or DOM manipulation APIs.
* *(Modern optimization: Using `defer` or `async` attributes allows the HTML parser to continue unhindered!)*

### 4. The Render Tree
The browser combines the DOM and CSSOM into the **Render Tree**:
* Elements with `display: none` are stripped out completely (they take no space).
* Non-visual elements like `<head>`, `<meta>`, and `<script>` are excluded.
* Elements with `visibility: hidden` are retained because they still occupy physical layout space.

### 5. Layout (Reflow)
Starting at the root of the Render Tree, the browser runs a geometry calculation:
* What is the viewport width?
* Based on percentages, CSS padding, and flexbox models, what is the exact pixel width, height, and $(X, Y)$ coordinate of every single box?

### 6. Paint & Compositing
* **Painting (Rasterization):** The browser converts layout boxes into actual color pixels across multiple distinct bitmap layers in memory (text, borders, shadows, images).
* **Compositing:** The CPU uploads these layers as textures to the **GPU (Graphics Processing Unit)**. The GPU composites the layers onto your screen at 60Hz or 120Hz.

The human sees the product page!

---

## 08. The End-to-End Latency Waterfall

Where does the time actually go during this entire journey?

| Phase | Physical Mechanism | Typical Latency (Cold Start) | Optimization Strategy |
| :--- | :--- | :--- | :--- |
| **DNS Resolution** | Recursive root-to-TLD network hops | **20 – 120 ms** | DNS Prefetching, long TTLs, Anycast resolvers |
| **TCP Handshake** | 1 RTT across public fiber routes | **15 – 60 ms** | TCP Keep-Alive connection reuse, QUIC |
| **TLS 1.3 Negotiation**| 1 RTT cryptographic exchange | **15 – 60 ms** | TLS 1.3 0-RTT session resumption, edge termination |
| **Time to First Byte** | Server processing + DB read | **30 – 150 ms** | Multi-tier Redis caching, Read-Replicas, CDNs |
| **Content Download** | Streaming HTML/CSS/Images | **20 – 80 ms** | Brotli compression, HTTP/2 multiplexing |
| **DOM Parsing & CSSOM**| V8 compilation & layout calculation | **50 – 200 ms** | Code splitting, `defer`/`async`, critical CSS inlining |
| **Total Page Load** | **End-to-End Journey** | **150 – 670 ms** | Edge computing, stale-while-revalidate |

---

## 09. Senior Systems Engineer's Production Checklist

When designing low-latency, resilient web systems, apply these concrete engineering rules across the request lifecycle:

- [ ] **Enforce HSTS with Preload:**  
  Add the `Strict-Transport-Security` header with `preload` to force browsers to always connect via HTTPS, eliminating the insecure HTTP-to-HTTPS redirect round-trip:
  ```http
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  ```
- [ ] **Terminate TLS at the Edge (Anycast CDN):**  
  Terminate TCP and TLS at edge PoPs (Cloudflare, Fastly, AWS CloudFront) located close to users. Let the CDN maintain persistent, warmed-up TCP pools to your origin servers.
- [ ] **Leverage Resource Hints:**  
  Instruct the browser to perform DNS lookups and TLS handshakes for third-party origins before the user even clicks:
  ```html
  <link rel="dns-prefetch" href="https://api.store.com">
  <link rel="preconnect" href="https://images.store.com" crossorigin>
  ```
- [ ] **Eliminate Render-Blocking Scripts:**  
  Always load non-critical JavaScript using `defer` or `async` so the HTML tokenizer never pauses during initial page construction:
  ```html
  <script src="analytics.js" async></script>
  <script src="bundle.js" defer></script>
  ```
- [ ] **Implement Multi-Tier Cache-Control:**  
  Configure aggressive immutable caching for hashed static assets and `stale-while-revalidate` for dynamic API endpoints:
  ```http
  Cache-Control: public, max-age=31536000, immutable
  ```
- [ ] **Optimize Critical Rendering Path CSS:**  
  Inline critical above-the-fold CSS directly into the HTML `<head>` tag; load remaining stylesheets asynchronously to avoid blocking the first contentful paint (FCP).

---

## 10. Summary & Bridge to Lesson 0.0.9

In this masterclass, we traced the complete life cycle of an internet request:

1. **Phase 1 (Input):** Keyboard scan codes trigger OS interrupts; the browser parses the Omnibox and validates HSTS preload rules.
2. **Phase 2 (Discovery):** Local browser, OS, and recursive DNS caches resolve hostnames to IP addresses; ARP discovers the local gateway's MAC address.
3. **Phase 3 (Transit):** Radio waves turn into fiber optic light pulses, routed across Autonomous Systems via BGP to the nearest Anycast edge.
4. **Phase 4 (Handshake):** TCP synchronizes sequence numbers, and TLS 1.3 performs an ephemeral Diffie-Hellman key exchange in just 1 RTT.
5. **Phase 5 (Ingress):** Server NICs stream packets via DMA; Linux NAPI softirqs drain ring buffers; `epoll` wakes Nginx to terminate TLS.
6. **Phase 6 (Execution):** Security middleware validates JWTs; Redis intercepts cache hits; PostgreSQL runs $O(\log N)$ B-Tree index scans.
7. **Phase 7 (Render):** The browser assembles the DOM, parses CSSOM, runs layout geometry reflow, and uses the GPU to paint interactive pixels.

### What Comes Next?

The traditional request-response lifecycle we just explored is fundamentally **half-duplex and client-initiated**: the client asks, the server answers, and the connection eventually closes or sits idle.

What happens when your application needs **real-time bidirectional communication**?
* How does a live chat system (WhatsApp, Slack) push messages to a client the instant they arrive without forcing the client to poll every second?
* What are the trade-offs between **WebSockets**, **Server-Sent Events (SSE)**, and **HTTP Long Polling**?

In our next lesson, **[Lesson 0.0.9: WebSockets, SSE, long polling](/notes/websockets-sse-long-polling)**, we will explore the mechanics of persistent, real-time push architectures!
