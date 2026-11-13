---
title: "Real-Time Communication: WebSockets, SSE & Long Polling"
slug: websockets-sse-long-polling
subject: software-architecture-system-design
abstract: An architectural, first-principles deep dive into real-time web protocols. Discover why standard HTTP request-response cycles fail for instantaneous push updates, how Long Polling and Server-Sent Events (SSE) bridge the gap, how WebSockets achieve true full-duplex framing, how OpenAI streams tokens, how Discord scales chat, and how to horizontally scale stateful socket clusters using Redis Pub/Sub backplanes.
tags:
  - websockets
  - sse
  - real-time
  - networking
  - system-design
  - architecture
published: true
publishDate: Nov 13, 2026
updatedDate: Nov 13, 2026
readTime: 20m read
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
  lesson: "0.0.9"
---

# Real-Time Communication: WebSockets, SSE & Long Polling

In our previous lesson ([Lesson 0.0.8: What Happens When You Open a URL](/notes/what-happens-when-you-open-a-url)), we traced the complete journey of a traditional web request. That entire architecture rested upon a single foundational premise:

> **The client speaks first, the server answers, and the interaction completes.**

This half-duplex, client-initiated model is ideal for loading news articles, searching products, or submitting checkout forms. But what happens when the physics of your application invert?

* What happens when an **Uber driver accepts your ride**, and your phone must update their GPS location on a map every 500 milliseconds?
* What happens when an **LLM (like ChatGPT or Claude) generates tokens**, and the UI must display words one by one as they are synthesized?
* What happens when **two designers edit the same canvas in Figma**, moving cursors and shifting layers 60 times a second?

The server has the data, but the client doesn't know it exists. If the client has to ask *"Do you have new data yet?"* every 100 milliseconds, your infrastructure will quickly melt under millions of redundant queries.

In this lesson, we will deconstruct the evolution of real-time web protocols from first principles: from the bandwidth waste of **Short Polling** to the hack of **Long Polling**, the elegance of **Server-Sent Events (SSE)**, the raw power of **WebSockets**, and the architectural challenge of scaling stateful socket connections across distributed clusters.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 THE EVOLUTION OF REAL-TIME COMMUNICATION                    │
└─────────────────────────────────────────────────────────────────────────────┘

 1. SHORT POLLING (The Inefficient Loop)
    Client ─── "Any updates?" ──► Server ─── "No." ──► Client
    Client ─── "Any updates?" ──► Server ─── "No." ──► Client
    Client ─── "Any updates?" ──► Server ─── "Yes: [Order Shipped]" ──► Client

 2. LONG POLLING (The Suspended Request)
    Client ─── "Any updates?" ──► [Server Holds Connection Open 30s...]
                                  [Event Occurs: Payment Received!]
    Client ◄── "Yes: [Paid]" ──── Server (Connection Closes)
    Client ─── "Any updates?" ──► [Server Holds Connection Open...]

 3. SERVER-SENT EVENTS (Unidirectional Push over HTTP)
    Client ─── GET /stream (Accept: text/event-stream) ──► Server
    Client ◄── event: token \n data: "Hello" ──────────── Server
    Client ◄── event: token \n data: "World" ──────────── Server (Permanent Stream)

 4. WEBSOCKETS (Bidirectional Full-Duplex Sockets)
    Client ─── HTTP 101 Upgrade ──► Server (Connection switches to binary frames)
    Client ◄──────── Frame: Cursor moved to (X: 104, Y: 220) ────────► Server
    Client ◄──────── Frame: Layer resized (Width: 400px) ─────────────► Server
```

---

## 01. The Naive Baseline: Short Polling & The Header Tax

When software engineers first needed live updates in web browsers, they relied on the only tool available: the JavaScript `setInterval()` timer.

```javascript title="short-polling.js"
// Poll the order status endpoint every 1000 milliseconds
setInterval(async () => {
  const response = await fetch('/api/v1/orders/8842/status');
  const data = await response.json();
  if (data.status === 'DELIVERED') {
    renderSuccessBanner();
  }
}, 1000);
```

### Why Short Polling Destroys Scale (First Principles)

Consider a food delivery application with **100,000 active users** tracking their meals simultaneously:

1. **Massive Database Saturation:**  
   Polling every 1 second generates **100,000 Requests Per Second (QPS)** hitting your ingress proxies, API gateways, and database replicas.
2. **The 99% Empty Response Rate:**  
   A delivery driver takes 20 minutes (1,200 seconds) to deliver a meal. Out of 1,200 requests dispatched by the user's phone, **1,199 return an identical status**: `{"status": "PREPARING"}`. You are burning CPU cycles, database connection pools, and server memory to communicate *nothing*.
3. **The HTTP Header Tax:**  
   Every HTTP/1.1 request carries an overhead of **500 to 1,500 bytes** of plaintext headers:
   ```http
   GET /api/v1/orders/8842/status HTTP/1.1
   Host: delivery.com
   User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...
   Accept: application/json, text/plain, */*
   Accept-Language: en-US,en;q=0.9
   Cookie: session_id=e9a1b4...; auth_token=eyJhbGciOi... (800 bytes!)
   ```
   To transfer a 2-byte empty response (`{}`), your client and server exchange over 1 KB of metadata over the network. At 100,000 QPS, that translates to **800 Mbps of wasted ingress bandwidth** purely dedicated to transmitting cookies and user-agent strings!
4. **Mobile Battery Destruction:**  
   On mobile smartphones, the cellular radio stays in a low-power dormant state when idle. Firing an HTTP request every second forces the cellular baseband chip into high-power transmission mode (`DCH`), draining user batteries within hours.

---

## 02. The First Evolution: HTTP Long Polling (The Comet Era)

To eliminate millions of empty responses, engineers at early internet giants (such as Meebo and early Facebook Chat) pioneered **HTTP Long Polling** (popularly known as the *Comet* pattern).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          HTTP LONG POLLING LIFECYCLE                        │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Client ]                                                    [ Server ]
     │                                                             │
     │ 1. GET /api/chat/updates (Client asks for new messages)     │
     │────────────────────────────────────────────────────────────►│
     │                                                             │ 2. No messages yet!
     │                                                             │    Server SUSPENDS request
     │                                                             │    (Holds socket open for 30s)
     │                                                             │    ...
     │                                                             │ 3. [14 seconds later]
     │                                                             │    New message arrives from Alice!
     │ 4. HTTP 200 OK: {"msg": "Hey Bob!"}                         │
     │◄────────────────────────────────────────────────────────────│ 5. Connection Closes!
     │                                                             │
     │ 6. Client IMMEDIATELY opens new Long Poll:                  │
     │    GET /api/chat/updates                                    │
     │────────────────────────────────────────────────────────────►│
     │                                                             │ 7. Server suspends request...
```

### How Long Polling Works
1. The client issues a standard HTTP request to the server.
2. The server **does not return immediately**. Instead, it holds the TCP connection open (suspending the thread using asynchronous non-blocking event loops like epoll or Node.js event loops).
3. The server sits idle until one of two events occurs:
   * **An event occurs:** The server immediately flushes the data to the client with `200 OK` and terminates the HTTP connection.
   * **A timeout is reached (e.g., 30 seconds):** The server returns a `204 No Content` or `304 Not Modified` to prevent intermediate proxies and NAT firewalls from dropping the idle TCP socket.
4. The client receives the response and **immediately issues another long-poll request**, ensuring an open listening ear is almost always available on the server.

### Real-World Use Case: The Early Uber Dispatch Engine
In the early days of Uber (2012–2015), driver matching was executed using long polling. When a rider requested a car, their mobile app opened a long poll: `POST /api/match_driver`. 

The server suspended the connection while searching for drivers within a 2-mile radius. As soon as a nearby driver tapped "Accept," the dispatch service completed the suspended request, sending the driver's name, license plate, and car model back down the wire in a single round-trip.

### Why Long Polling Fails for High-Frequency Systems
* **Connection Churn Overhead:** Because the HTTP connection terminates after *every single event*, sending 10 updates per second requires establishing, tearing down, and re-negotiating **10 separate TCP/TLS handshakes every second**.
* **Out-of-Order Delivery:** If Event B fires during the 50ms window while the client is reconnecting after receiving Event A, messages can be dropped or delivered out of sequence unless complex sequence numbering is implemented.

---

## 03. Unidirectional Streaming: Server-Sent Events (SSE)

In many system designs, real-time communication is **fundamentally one-directional**: the server generates data that the client simply needs to consume.

```
 CLIENT ──────────────────────────────────────────────────────────► SERVER
 (Watches read-only data, does not push high-frequency updates)
```

Examples:
* **LLM Output:** An AI model streaming tokens as they are inferred.
* **Financial Tickers:** A stock exchange broadcasting live market prices.
* **Notification Feeds:** Twitter/X streaming follower alerts and retweets.

For these architectures, **Server-Sent Events (SSE)** (standardized in HTML5) provide an extraordinarily simple, lightweight solution natively supported by browsers via the `EventSource` API.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SERVER-SENT EVENTS (SSE) WIRE FORMAT                  │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Client ]                                                    [ Server ]
     │                                                             │
     │ 1. GET /api/ai/stream                                       │
     │    Accept: text/event-stream                                │
     │────────────────────────────────────────────────────────────►│
     │                                                             │ 2. HTTP 200 OK
     │                                                             │    Content-Type: text/event-stream
     │                                                             │    Transfer-Encoding: chunked
     │                                                             │    Cache-Control: no-cache
     │ 3. Connection REMAINS OPEN indefinitely                     │
     │◄────────────────────────────────────────────────────────────│
     │                                                             │
     │ 4. event: token \n data: {"word": "System"} \n\n            │
     │◄────────────────────────────────────────────────────────────│
     │ 5. event: token \n data: {"word": "Design"} \n\n            │
     │◄────────────────────────────────────────────────────────────│
     │ 6. event: done \n data: {} \n\n                             │
     │◄────────────────────────────────────────────────────────────│
```

### The SSE Protocol Specification
Unlike standard HTTP, which closes the connection once `Content-Length` bytes are sent, an SSE server sets:
```http
Content-Type: text/event-stream
Transfer-Encoding: chunked
Cache-Control: no-cache
```

The server keeps the HTTP connection alive permanently and writes plain UTF-8 text formatted with two newlines (`\n\n`) as the message boundary:

```text title="Raw Wire Capture of an SSE Stream"
id: 101
event: price_update
data: {"ticker": "AAPL", "price": 182.45}

id: 102
event: price_update
data: {"ticker": "GOOGL", "price": 140.12}

: this is an optional heartbeat keep-alive comment
```

### The Built-in Superpower: Automatic Reconnection with `Last-Event-ID`
One of the greatest engineering advantages of SSE over WebSockets is its **built-in state recovery**:
1. Every event sent by the server can include an `id: <integer>` line.
2. If the user drives into an underground tunnel and loses cellular signal, the browser's native `EventSource` engine automatically retries every 3 seconds.
3. Upon reconnecting, the browser automatically injects the HTTP header:
   ```http
   Last-Event-ID: 102
   ```
4. The server inspects this header, queries its Kafka or Redis log, and replays all missed messages from ID 103 onward!

### Real-World Use Case: Why OpenAI & Anthropic Chose SSE
When you ask ChatGPT a question, words stream onto the screen one by one. Many developers assume this uses WebSockets. **It uses Server-Sent Events.**

:::callout{type="info" title="Why LLM Providers Use SSE instead of WebSockets"}
1. **Unidirectional by nature:** The user asks one prompt (a standard HTTP POST); the AI responds with 500 consecutive tokens. The client does not need to send messages back while the model is thinking.
2. **Built on Standard HTTP:** SSE works seamlessly with existing HTTP/2 multiplexing, corporate firewalls, API gateways, AWS CloudFront CDNs, and edge proxies without requiring special WebSocket upgrade configurations.
3. **Transparent Compression:** SSE can be compressed using standard Brotli or Gzip streaming compression.
:::

---

## 04. True Full-Duplex: The WebSocket Protocol (RFC 6455)

When your application demands **bidirectional, low-latency, high-frequency communication**, HTTP is no longer adequate. You need **WebSockets**.

```
 CLIENT ◄────────────────────────────────────────────────────────► SERVER
 (Both sides can send messages simultaneously at any millisecond)
```

WebSockets establish a persistent, bidirectional, full-duplex TCP socket between client and server. Once connected, either party can send binary or text frames without the overhead of HTTP headers.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 THE WEBSOCKET HANDSHAKE & FRAMING UPGRADE                   │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Client ]                                                    [ Server ]
     │                                                             │
     │ 1. HTTP GET /ws HTTP/1.1                                    │
     │    Upgrade: websocket                                       │
     │    Connection: Upgrade                                      │
     │    Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==              │
     │    Sec-WebSocket-Version: 13                                │
     │────────────────────────────────────────────────────────────►│
     │                                                             │ 2. Validates Key
     │                                                             │    HTTP/1.1 101 Switching Protocols
     │                                                             │    Upgrade: websocket
     │                                                             │    Connection: Upgrade
     │                                                             │    Sec-WebSocket-Accept: s3pPLMBiTxa...
     │◄────────────────────────────────────────────────────────────│
     │                                                             │
     │ =========================================================== │
     │          HTTP PROTOCOL IS NOW DETACHED FROM SOCKET!         │
     │     RAW BINARY / TEXT WEBSOCKET FRAMING ACTIVATED           │
     │ =========================================================== │
     │                                                             │
     │ 3. Client Frame: 2-byte header + Payload (Masked)           │
     │────────────────────────────────────────────────────────────►│
     │ 4. Server Frame: 2-byte header + Payload (Unmasked)         │
     │◄────────────────────────────────────────────────────────────│
```

### The 101 Switching Protocols Handshake
WebSockets don't use a separate network port—they begin their life on standard HTTP Port 80 or HTTPS Port 443. 

1. **Client Upgrade Request:** The browser sends a standard HTTP/1.1 request requesting a protocol upgrade:
   ```http
   GET /live/chat HTTP/1.1
   Host: discord.com
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
   Sec-WebSocket-Version: 13
   ```
2. **Server Agreement:** If the server supports WebSockets, it calculates a SHA-1 hash of the `Sec-WebSocket-Key` concatenated with a magic UUID (`258EAFA5-E914-47DA-95CA-C5AB0DC85B11`), base64-encodes it, and returns status code **101 Switching Protocols**:
   ```http
   HTTP/1.1 101 Switching Protocols
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
   ```
3. **The Transformation:** At this precise instant, the HTTP parser is completely detached from the underlying TCP socket. The socket stays open, and both machines switch to the **WebSocket Framing Protocol**.

### The Minimalist Frame Header (2 Bytes vs 1,000 Bytes)
While an HTTP request carries 1 KB of header baggage, a WebSocket frame carries a header of **just 2 to 10 bytes**:

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
|     Masking-key (32 bits, if MASK set)                        |
+-------------------------------+-------------------------------+
|                     Payload Data                              |
+---------------------------------------------------------------+
```

* **FIN bit (1 bit):** Indicates if this is the final fragment of a message.
* **Opcode (4 bits):** Defines what the frame is:
  * `0x1`: Text data (UTF-8).
  * `0x2`: Binary data (raw bytes).
  * `0x8`: Connection Close.
  * `0x9`: Ping (Heartbeat).
  * `0xA`: Pong (Heartbeat response).
* **Payload Length (7 bits):** If `< 126`, the payload size fits directly in the first byte.

:::callout{type="warning" title="Why Client Frames are Masked (Security Invariant)"}
Notice the `MASK` bit. All frames sent from the **Client to the Server** MUST be XOR-masked with a random 32-bit key.  
Why? In 2011, researchers discovered that malicious JavaScript could send forged HTTP-like packets over unmasked WebSockets, poisoning transparent caching proxies between the client and server. The random XOR mask scrambles the bytes on the wire, making it impossible for an attacker to predict packet contents and bypass proxy security.
:::

---

## 05. Real-World Architectural Case Studies

To see how these protocols behave in production, let's examine two industry standards: **Discord** and **Figma**.

### Case Study 1: Discord's Chat Gateway
Discord connects over 200 million monthly active users. When you type in a channel, see someone else typing, or receive a direct message, you are communicating over their **Gateway Server**.

```
 [ Discord Client ] ──► [ Discord Gateway (Elixir / Erlang BEAM) ]
                         • Millions of concurrent open WebSockets
                         • Zlib-stream compressed frames
                         • Heartbeat PING every 41.25 seconds
```

* **Why WebSockets?** Discord requires bidirectional real-time communication: sending messages, receiving messages, broadcasting typing indicators (`"User is typing..."`), and syncing voice channel participant states.
* **Payload Compression:** Discord wraps its WebSocket messages in continuous **Zlib stream compression**, reducing JSON payload sizes by over 80%.
* **Heartbeat Mechanism:** The client and server exchange `PING`/`PONG` frames every 40 seconds. If two consecutive pings fail, the socket is terminated to prune dead mobile connections.

### Case Study 2: Figma's Multiplayer Engine
When multiple designers collaborate in Figma, you can see their cursors moving across the artboard at 60 frames per second.

* **Why HTTP Polling/SSE Fails:** A designer moving their mouse generates **60 coordinate events per second**. Sending 60 HTTP requests per second with 1KB headers would consume 60 KB/s per user and introduce 100ms+ network jitter.
* **The WebSocket Implementation:** Figma uses WebSockets to stream compact binary Protobuf frames (just 12 bytes: `User_ID`, `X_coord`, `Y_coord`). The message travels to an Elixir server, which broadcasts the coordinate to all other active session participants with sub-10ms latency.

---

## 06. The Architectural Nightmare: Scaling WebSockets Horizontally

Stateless HTTP servers are trivial to scale: you launch an AWS Autoscaling Group, put an Application Load Balancer in front, and route requests randomly. If Server 1 crashes, Server 2 handles the next request seamlessly.

**WebSockets completely break this stateless paradigm.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 THE CROSS-NODE WEBSOCKET ROUTING PROBLEM                    │
└─────────────────────────────────────────────────────────────────────────────┘

 [ User A (Bob) ]                                           [ User B (Alice) ]
        │                                                           │
        ▼ (Open TCP Socket)                                         ▼ (Open TCP Socket)
 ┌──────────────┐                                            ┌──────────────┐
 │ WS Server 1  │                                            │ WS Server 2  │
 └──────┬───────┘                                            └──────▲───────┘
        │                                                           │
        │ Bob sends message: "Hi Alice!"                            │
        │ Server 1 checks local memory:                             │
        │ "Where is Alice's socket?"                                │
        │ NOT FOUND! Alice is connected to Server 2!                │
        │                                                           │
        └───────────────────────────┬───────────────────────────────┘
                                    │
                                    ▼
                     [ THE DISTRIBUTED PUB/SUB BACKPLANE ]
                            (Redis Pub/Sub / Kafka)
```

### The Statefulness Dilemma
When Bob establishes a WebSocket connection, his TCP socket is tied to **one physical server process** (e.g., WS Server 1). When Alice connects, her socket lands on WS Server 2.

If Bob sends a message to Alice:
1. WS Server 1 receives Bob's frame.
2. WS Server 1 inspects its local process memory for Alice's socket file descriptor.
3. **It fails:** Alice's socket does not exist in Server 1's RAM. It exists in Server 2's RAM across the data center.

### The Solution: The Pub/Sub Backplane
To scale WebSockets horizontally, every production architecture decouples **connection management** from **event distribution** using an in-memory Pub/Sub backplane (typically **Redis Pub/Sub**, **NATS**, or **Apache Kafka**):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 HORIZONTAL WEBSOCKET CLUSTER WITH REDIS PUB/SUB             │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Client: Bob ]                                            [ Client: Alice ]
        │                                                           ▲
        ▼ (Socket FD #42)                                           │ (Socket FD #91)
 ┌──────────────┐                                            ┌──────┴───────┐
 │ WS Node 1    │                                            │ WS Node 2    │
 └──────┬───────┘                                            └──────▲───────┘
        │                                                           │
        │ 1. Publish event to Redis                                 │ 3. Delivers to
        │    channel "room_99"                                      │    Alice's socket!
        ▼                                                           │
 ┌──────────────────────────────────────────────────────────────────┴───────┐
 │                       REDIS PUB/SUB MESSAGE BROKER                       │
 │  Channel: "room_99"                                                      │
 │  • WS Node 1 is subscribed                                               │
 │  • WS Node 2 is subscribed ──────────────────────────────────────────────┘
 └──────────────────────────────────────────────────────────────────────────┘
```

1. When Alice joins chat room `room_99`, WS Node 2 registers a subscription to Redis topic `room_99`.
2. When Bob posts a message to `room_99`, WS Node 1 publishes the JSON/binary payload to Redis: `PUBLISH room_99 {"user": "Bob", "text": "Hi"}`.
3. Redis instantly broadcasts the message to all subscribed cluster nodes.
4. WS Node 2 receives the Redis broadcast, locates Alice's local socket file descriptor (`#91`), and writes the frame directly onto her connection.

---

## 07. Architectural Comparison Matrix

| Architectural Vector | Short Polling | HTTP Long Polling | Server-Sent Events (SSE) | WebSockets |
| :--- | :--- | :--- | :--- | :--- |
| **Communication Direction**| Half-Duplex (Client-driven) | Half-Duplex (Emulated push) | **Unidirectional (Server $\rightarrow$ Client)** | **Full-Duplex (Bidirectional)** |
| **Underlying Protocol** | HTTP/1.1 or HTTP/2 | HTTP/1.1 | Standard HTTP/1.1 or HTTP/2 | Custom WS Protocol (RFC 6455) |
| **Frame / Header Overhead**| **Extreme** (500–1500B per poll) | High (Headers on every event) | **Low** (Few bytes per event) | **Minimal (2 to 10 bytes)** |
| **Connection Lifespan** | Ephemeral (Closed instantly) | Short-lived (Closed per event)| **Permanent** (Single open stream) | **Permanent** (Single open socket) |
| **Auto-Reconnection** | N/A (Client loop) | Manual client code | **Native in Browser** (`EventSource`)| Manual client implementation |
| **Proxy & Firewall Traversal**| Seamless | Seamless | Seamless (Standard HTTP) | Can be blocked by legacy proxies |
| **Horizontal Scaling** | Trivially Stateless | Stateless (with timeouts) | Stateless connection tier | **Complex (Requires Pub/Sub)** |
| **Ideal Production Use Case**| Infrequent background sync | Legacy notifications, SMS gateways | **AI token streaming, Stock tickers** | **Chat apps, Multiplayer games, Figma** |

---

## 08. The Production Decision Tree: Which Protocol Should You Choose?

When an interviewer asks you to design a real-time system, use this systematic heuristic to select the correct transport:

```
                          DO YOU NEED REAL-TIME UPDATES?
                                        │
                                        ├──► NO: Use standard REST / GraphQL / gRPC.
                                        │
                                        ▼ YES
                     DOES THE CLIENT NEED TO SEND FREQUENT DATA 
                          BACK TO THE SERVER OVER THE SAME PIPE?
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼ YES                                   ▼ NO
     [ WEBSOCKETS ]                               DO YOU REQUIRE UNIDIRECTIONAL
     • Full-duplex required                       SERVER-TO-CLIENT PUSH ONLY?
     • Chat applications (Slack, Discord)                   │
     • Multiplayer collaborative tools (Figma)              ▼ YES
     • Real-time trading order books              [ SERVER-SENT EVENTS (SSE) ]
                                                  • LLM token streaming (ChatGPT)
                                                  • Live sports scores & tickers
                                                  • Dashboard metrics & logs
                                                  • Push notifications
```

---

## 09. Senior Systems Engineer's Production Checklist

When deploying real-time infrastructure at scale (Nginx, Node.js, Spring Boot, Envoy), enforce these concrete production configurations:

- [ ] **Configure Reverse Proxy WebSocket Upgrades:**  
  Nginx closes WebSocket connections by default unless explicitly instructed to pass the hop-by-hop `Upgrade` headers:
  ```nginx title="nginx.conf"
  location /ws/ {
      proxy_pass http://upstream_websocket_cluster;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "Upgrade";
      proxy_set_header Host $host;
      
      # Prevent Nginx from closing idle sockets after 60s
      proxy_read_timeout 3600s;
      proxy_send_timeout 3600s;
  }
  ```
- [ ] **Implement Active Application-Level Heartbeats (Ping/Pong):**  
  Do not rely on TCP Keep-Alives. Mobile carriers and cloud NAT gateways silently drop idle TCP connections after 60 to 120 seconds. Send an explicit WebSocket Ping frame every 30 to 45 seconds to keep the route warm.
- [ ] **Tune OS File Descriptor Limits:**  
  Every active WebSocket or SSE connection consumes one socket file descriptor (`FD`). The default Linux limit is 1,024 FDs per process. Boost this limit to 1,000,000 for high-density edge gateways:
  ```bash
  # /etc/security/limits.conf
  * soft nofile 1048576
  * hard nofile 1048576
  ```
- [ ] **Enforce Jittered Exponential Backoff on Reconnection:**  
  If a WebSocket server restarts, 50,000 clients will disconnect simultaneously. If all 50,000 reconnect at the exact same second, your cluster will suffer a **Thundering Herd** collapse. Always calculate client reconnect delay as:
  $$\text{Delay} = \min(\text{Base} \times 2^{\text{attempt}}, \text{Max}) \pm \text{Random Jitter}$$
- [ ] **Handle SSL Termination at the Edge:**  
  Always use `wss://` (WebSocket Secure) over TLS port 443. Unencrypted `ws://` traffic on port 80 is frequently inspected, corrupted, or dropped by corporate firewalls and ISP proxies.

---

## 10. Summary & Bridge to Lesson 0.0.10

We have reached the end of our deep dive into real-time web mechanics:

1. **Short Polling:** Simple to write, but creates massive database load, wastes 99% of requests, and incurs an unsustainable HTTP header tax.
2. **Long Polling:** Suspends the HTTP request until data is available; vastly improves efficiency over short polling, but suffers from connection churn and re-handshake latency.
3. **Server-Sent Events (SSE):** The ideal solution for unidirectional streaming; lightweight, built on standard HTTP/2, supports automatic reconnection with `Last-Event-ID`, and powers modern AI token streaming.
4. **WebSockets:** The undisputed champion of low-latency bidirectional communication; replaces HTTP with a 2-byte binary framing layer, but requires stateful architectural plumbing (Redis Pub/Sub) to scale horizontally.

### What Comes Next?

Whether sending a 2-byte WebSocket ping or downloading a 50 MB video asset, every packet must obey the immutable laws of physics.

* Why does a cross-country fiber cable always have at least 70 milliseconds of round-trip delay, no matter how fast your broadband speed is?
* What is the critical distinction between **Latency** (how fast a single bit travels) and **Bandwidth** (how many bits fit in the pipe)?
* And why does increasing bandwidth fail to make web applications faster once you cross a certain threshold?

In our next lesson, **[Lesson 0.0.10: Latency and bandwidth](/notes/latency-and-bandwidth)**, we will explore the physical laws that dictate the performance boundaries of all distributed systems!
