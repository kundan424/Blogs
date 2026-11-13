---
title: "The Transport Handshake: TCP 3-Way Handshake & TLS 1.3 Cryptography"
slug: the-transport-handshake-tcp-three-way-and-tls-negotiation
subject: software-architecture-system-design
abstract: An architectural, first-principles deep dive into transport layer connection establishment and cryptographic negotiation. Demystify the TCP 3-way handshake, sequence number synchronization, sliding window flow control, SYN flood defense with SYN cookies, and the quantum leap to TLS 1.3 1-RTT handshakes, Ephemeral Diffie-Hellman key exchange, Perfect Forward Secrecy, and 0-RTT replay attack vulnerabilities.
tags:
  - tcp
  - tls
  - security
  - cryptography
  - networking
  - system-design
  - architecture
  - performance
published: true
publishDate: Nov 13, 2026
updatedDate: Nov 13, 2026
readTime: 24m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
learningPath:
  slug: system-design-roadmap-scale
  name: "System Design: From 1 User to 100 Million Users"
  module: "sd-mod-01"
  moduleName: "Ingress & Network Protocol Mechanics"
  lesson: "1.2"
---

# The Transport Handshake: TCP 3-Way Handshake & TLS 1.3 Cryptography

Welcome back to **The System Design Roadmap: From 1 User to 100 Million Users**. 

In our previous lesson ([Lesson 1.1: The Journey of a Packet: DNS Recursive Resolution to IP Discovery](/notes/the-journey-of-a-packet-dns-recursive-resolution-to-ip-discovery)), we followed a client's query across the global DNS hierarchy until the authoritative name server handed us a physical destination: `198.51.100.42`.

Our client now knows *where* the server resides on the planet.

Yet, if you ask many software engineers what happens next, they will say:
> *"The browser sends an HTTP `GET /api/v1/products` request to that IP address, and the server returns JSON."*

If the internet were a private copper wire running directly between your laptop and your server, that might be true. But in reality, the internet is an **unreliable, congested, adversarial public mesh**. 

Between your browser and that server sit dozens of intermediate routers, noisy undersea fiber repeaters, cellular towers, and untrusted public Wi-Fi access points.

If your client simply blasted application data into the network:
1. **Packets would arrive out of order, corrupted, or completely lost.** The underlying Internet Protocol (IP) provides only "best-effort" delivery. It makes zero promises that packet #2 won't overtake packet #1, or that a congested router won't silently drop your checkout payload into the void.
2. **Anyone listening on the wire could read your users' passwords and credit cards.** Every router between the user and the datacenter can inspect raw packets in plaintext.
3. **An attacker could modify your data in flight (Man-in-the-Middle).** A compromised proxy could alter the destination bank account in a financial wire transfer without either party noticing.

To solve these physical and cryptographic realities, two distinct transport protocols must negotiate agreements before a single byte of HTTP data is allowed to travel:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      THE DUAL-LAYER TRANSPORT HANDSHAKE                     │
└─────────────────────────────────────────────────────────────────────────────┘
  1. TCP Handshake (Layer 4)  ──► Establishes reliability, sequence ordering,
                                  and flow control across an unreliable network.
             │
             ▼
  2. TLS Handshake (Layer 5/6)──► Establishes cryptographic encryption, server
                                  identity authentication, and tamper protection.
             │
             ▼
  3. HTTP Application Data    ──► Finally! Safe, ordered, encrypted JSON payloads.
```

In this deep dive, we will demystify both handshakes from first principles. For every mechanism, we will examine **why it exists**, **what failure mode it prevents**, and **how it functions on the physical wire**.

---

## 01. Why Can't We Just Send Data? The Chaos of Packet-Switched Networks

To understand why the Transmission Control Protocol (TCP) exists, we must understand the fundamental limitation of the protocol underneath it: the **Internet Protocol (IP)**.

The internet is a **packet-switched network**. When you send a 5 MB image, your operating system breaks that file into thousands of small, discrete chunks called IP packets (typically around 1,500 bytes each, bounded by the Maximum Transmission Unit, or MTU).

Each IP packet travels independently across the internet. Packet #1 might travel via Chicago, while Packet #2 is routed through Atlanta because of a sudden fiber congestion spike.

```
[ Client ] ─── Packet 1 (Via Chicago: Fast) ────────────► [ Server ]
     │                                                         ▲
     └──────── Packet 2 (Via Atlanta: Delayed Router) ─────────┘
```

Because IP is strictly a **stateless, best-effort delivery mechanism**:
- **Packets arrive out of order:** Packet #2 may arrive before Packet #1.
- **Packets vanish silently:** If an intermediate router's memory buffer fills up during a traffic burst, it drops incoming packets directly into the bit-bucket. It does not inform you.
- **Packets get duplicated:** Flaky Wi-Fi links or switch retransmissions can cause the receiver to receive the same packet three times.

If an application tried to parse an HTTP request over raw IP, your backend JSON parser would receive jumbled, corrupt fragments.

> **The Core Purpose of TCP:**  
> TCP is a stateful software abstraction that runs inside the operating system kernel. It takes chaotic, unreliable, out-of-order IP datagrams and converts them into a **guaranteed, ordered, duplicate-free, continuous stream of bytes**.

Before TCP can guarantee an ordered stream, the client and server must agree on a shared timeline. That agreement is the **TCP 3-Way Handshake**.

---

## 02. The TCP 3-Way Handshake: Synchronizing State Across Space

Why does it take three packets to start a connection? Why not one? Why not two?

This question is rooted in a famous theoretical computer science problem known as the **Two Generals' Problem**: two entities communicating over an unreliable channel can never achieve 100% certainty that both sides have agreed, unless they acknowledge each other's acknowledgments.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE TCP 3-WAY HANDSHAKE                             │
└─────────────────────────────────────────────────────────────────────────────┘

 Client (Browser)                                            Server
   │                                                           │
   │  1. SYN (seq = X)                                         │
   │  "Hey! I want to talk. My starting byte count is X."       │
   ├──────────────────────────────────────────────────────────►│
   │                                                           │
   │  2. SYN-ACK (seq = Y, ack = X + 1)                        │
   │  "Got X! I expect byte X+1 next.                          │
   │   I also want to talk. My starting byte count is Y."      │
   │◄──────────────────────────────────────────────────────────┤
   │                                                           │
   │  3. ACK (seq = X + 1, ack = Y + 1)                        │
   │  "Got Y! I expect byte Y+1 next. We are connected!"       │
   ├──────────────────────────────────────────────────────────►│
   │  (Client can now attach HTTP payload to this packet!)     │
```

Let's break down exactly what happens during each step:

### Step 1: `SYN` (Synchronize)
The client sends an empty TCP packet with the **`SYN` control flag** set to `1` in the TCP header.
- **Why it comes into picture:** The client needs to tell the server: *"I want to open a connection, and here is my starting sequence number."*
- **What it contains:** A 32-bit number called the **Initial Sequence Number (ISN)**, let's call it $X$ (e.g., `10,000`).
- **Client State Transition:** Moves from `CLOSED` to `SYN_SENT`.

### Step 2: `SYN-ACK` (Synchronize + Acknowledge)
The server receives the `SYN` packet and replies with both the **`SYN`** and **`ACK`** flags set to `1`.
- **Why it comes into picture:** The server must accomplish two things:
  1. Confirm that it received the client's starting number ($X$). It does this by setting the **Acknowledgment Number** to $X + 1$ (meaning: *"I received byte $X$, so I expect byte $X + 1$ next"*).
  2. Inform the client of the server's *own* starting sequence number ($Y$), because communication is bidirectional.
- **Server State Transition:** Moves from `LISTEN` to `SYN_RECEIVED`.

### Step 3: `ACK` (Acknowledge)
The client receives the `SYN-ACK` and sends a final packet with the **`ACK` flag** set to `1`.
- **Why it comes into picture:** The server needs confirmation that the client received its sequence number ($Y$). The client sets the acknowledgment number to $Y + 1$.
- **Crucial Optimization:** In modern HTTP, the client does not need to send an empty `ACK` packet and wait! **The client can immediately append the first bytes of application data (e.g., the TLS Client Hello or HTTP request) inside this third packet.**
- **State Transition:** Both client and server are now in the `ESTABLISHED` state.

:::callout{type="info" title="The 1-RTT Latency Tax"}
The 3-way handshake requires exactly **one full Round-Trip Time (1-RTT)** before any application data can be processed by the server. If your user is in Sydney and your server is in Virginia, and the physical network ping is 100ms, the TCP handshake costs an unavoidable **100ms delay** before a single byte of application code runs.
:::

---

## 03. TCP Sequence Numbers & The SYN Flood Attack (SYN Cookies)

### Why Are Initial Sequence Numbers (ISNs) Randomized?
Why doesn't every TCP connection simply start at byte `0`?

If every connection started at sequence number `0`, an architectural catastrophe occurs when connections close and reopen rapidly:
1. Connection #1 sends Packet #3, but an intermediate router gets congested and delays the packet for 2 seconds.
2. The client times out, terminates Connection #1, and opens Connection #2 to the same server IP and port, starting again at byte `0`.
3. Suddenly, the delayed Packet #3 from the *old dead connection* arrives at the server! The server would mistakenly accept stale bytes from Connection #1 and inject them into Connection #2, silently corrupting the application payload!

To prevent sequence collision, the TCP specification requires that the **Initial Sequence Number (ISN) is pseudo-randomly generated** using a cryptographic clock algorithm. An attacker cannot easily guess the sequence numbers to forge malicious packets.

---

### The Disaster: The SYN Flood Attack
Because the TCP handshake is stateful, it creates a dangerous asymmetric vulnerability.

When a server receives a `SYN` packet (Step 1), it must allocate memory in its operating system kernel:
- It creates a **Transmission Control Block (TCB)** in RAM to remember the client's IP, port, sequence number, and window size.
- It places this connection into the **SYN Backlog Queue** (the half-open connections table).

```
Attacker                                                Victim Server
   │                                                           │
   │─── SYN (Spoofed IP 1) ───────────────────────────────────►│ [ Allocates RAM Buffer ]
   │─── SYN (Spoofed IP 2) ───────────────────────────────────►│ [ Allocates RAM Buffer ]
   │─── SYN (Spoofed IP 3) ───────────────────────────────────►│ [ Allocates RAM Buffer ]
   │─── SYN (Spoofed IP 4) ───────────────────────────────────►│ [ Allocates RAM Buffer ]
   │                                                           │
   │ (Attacker never sends final ACK!)                         ▼
   │                                                SYN Backlog Memory EXHAUSTED!
   │                                                Server drops legitimate users!
```

An attacker can use a script to blast 500,000 fake `SYN` packets per second with forged, non-existent source IPs. The server sends `SYN-ACK`s to ghosts, waits for the final `ACK` until a timeout expires (often 30–60 seconds), and its SYN backlog table completely exhausts. Legitimate users are denied connection.

---

### The Solution: Stateless SYN Cookies
How do high-scale Linux servers survive massive SYN floods without allocating memory for half-open sockets?

The answer is **SYN Cookies** (`tcp_syncookies = 1` in Linux kernel tuning).

When the server's SYN backlog queue fills up, **it stops allocating memory for incoming `SYN` packets entirely.**

Instead of storing state in RAM, the server encodes the connection's vital parameters directly into the server's own Initial Sequence Number ($Y$):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SYN COOKIE BIT ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────────────┘
  Bit 0-4 (5 bits)    : Counter that increments every 64 seconds (prevents replay)
  Bit 5-7 (3 bits)    : Encoded Maximum Segment Size (MSS) choice
  Bit 8-31 (24 bits)  : Cryptographic hash of (Client IP, Client Port, Server IP,
                        Server Port, Secret Server Key)
```

1. The server computes this 32-bit cryptographic cookie, sets it as its sequence number, and sends the `SYN-ACK`. **Zero bytes of memory are allocated in kernel RAM.**
2. If the client is a real user, it replies with Step 3 (`ACK`), returning an acknowledgment number equal to the cookie $+ 1$.
3. The server subtracts `1` from the incoming acknowledgment number, re-computes the cryptographic hash, and verifies that the signature matches.
4. If valid, the server *only now* allocates memory for the fully established connection! The SYN flood is completely neutralized.

---

## 04. Controlling the Flood: Flow Control & The Sliding Window

Once the connection is established, how fast can the client send bytes?

If a client connected to a 10 Gbps fiber line blasts data at full speed to a cheap smartphone connected to a 3G network, the smartphone's kernel network buffers will overflow in milliseconds, dropping 99% of the packets.

TCP solves this using **Flow Control** via the **Sliding Window**.

### The Receive Window (`rwnd`)
Inside every TCP header, both the client and server include a 16-bit field called the **Window Size (`rwnd`)**.

The window size says:  
> *"My operating system network buffer currently has 64 KB of free space. You are permitted to transmit up to 64 KB of unacknowledged data. If you hit 64 KB without an ACK from me, **you must physically stop transmitting and wait.**"*

```
                     THE TCP SLIDING WINDOW IN RAM
               
 [ Byte 1 | Byte 2 | Byte 3 ] [ Byte 4 | Byte 5 | Byte 6 ] [ Byte 7 | Byte 8 ]
 └──────────┬───────────────┘ └──────────┬───────────────┘ └────────┬────────┘
            │                            │                          │
       ACKNOWLEDGED                 WINDOW IN FLIGHT           CANNOT SEND YET
     (Freed from RAM)             (Sent; awaiting ACK)        (Exceeds Receiver rwnd)
```

As the receiving application reads bytes out of the kernel socket buffer using system calls, the buffer empties. The receiver sends an updated `ACK` packet advertising a larger window:  
*"I have processed the data! My window is open again."* 

The transmission window slides forward across the byte stream. This prevents fast senders from drowning slow receivers.

---

## 05. Why We Need TLS: Confidentiality, Integrity & Authentication

TCP gave us an ordered, reliable byte stream. But TCP was drafted in the 1970s, an era when the internet connected a few dozen university research labs who trusted each other.

TCP has **zero security**:
- Every byte is sent in plaintext.
- Anyone can forge or tamper with packet contents.
- There is no guarantee that the IP address you connected to is actually GitHub or your bank, rather than an imposter who spoofed the route.

To solve this, we place a cryptographic layer directly on top of TCP: **Transport Layer Security (TLS)**.

```
┌─────────────────────────────────────────────────────────────┐
│                      THE SECURITY TRIAD                     │
├─────────────────────────────────────────────────────────────┤
│ 1. Confidentiality  ──► Encrypts data with symmetric cipher │
│                         (AES-GCM / ChaCha20).               │
│ 2. Integrity        ──► Cryptographic hash (HMAC / Poly1305)│
│                         proves data was not modified.       │
│ 3. Authentication   ──► X.509 Certificates prove the server │
│                         is who it claims to be.             │
└─────────────────────────────────────────────────────────────┘
```

The goal of the TLS handshake is simple:  
**How can two computers that have never met before agree on a secret cryptographic key across an insecure public wire, without any eavesdropper learning what that key is?**

---

## 06. How Ephemeral Diffie-Hellman (ECDHE) Works (The Color Mixing Analogy)

The breakthrough algorithm that makes modern internet encryption possible is **Diffie-Hellman Key Exchange** (specifically, **Elliptic Curve Diffie-Hellman Ephemeral**, or **ECDHE**).

It sounds mathematically terrifying, but conceptually it is as simple as mixing paint.

### The Paint Mixing Mental Model

Imagine Alice (Client) and Bob (Server) want to create a secret paint color without Eve (an eavesdropper tapping the wire) discovering it:

```
          Alice (Client)                                 Bob (Server)
                │                                              │
                │         1. PUBLIC COMMON COLOR: YELLOW       │
                ├──────────────────────────────────────────────┤
                │         (Everyone, including Eve, sees it)   │
                │                                              │
        [ Secret Color: RED ]                         [ Secret Color: BLUE ]
        (Alice keeps secret!)                         (Bob keeps secret!)
                │                                              │
                ▼                                              ▼
        MIX: Yellow + Red                              MIX: Yellow + Blue
        = [ ORANGE ]                                   = [ GREEN ]
                │                                              │
                │        2. SWAP THE MIXTURES ACROSS WIRE      │
                │─────── Alice sends ORANGE ──────────────────►│
                │◄────── Bob sends GREEN ──────────────────────│
                │                                              │
                ▼                                              ▼
        Add Secret: RED                                Add Secret: BLUE
        Orange + RED = [ BROWN ]                       Green + BLUE = [ BROWN ]
                │                                              │
                └─────────────── SHARED SECRET ────────────────┘
```

1. Alice and Bob publicly agree on an initial common color: **Yellow**. (Eve sees this).
2. Alice picks a secret private color: **Red**. Bob picks a secret private color: **Blue**. (Neither reveals their secret color to anyone).
3. Alice mixes her secret Red with the public Yellow → produces **Orange**. She sends Orange across the wire to Bob.
4. Bob mixes his secret Blue with the public Yellow → produces **Green**. He sends Green across the wire to Alice.
5. Eve is listening. Eve sees Yellow, Orange, and Green. But because paint mixing is a "one-way function" (it is easy to mix colors, but physically impossible to un-mix Orange back into its original base colors), Eve cannot extract Alice's secret Red or Bob's secret Blue!
6. Now the magic happens:
   - Alice takes Bob's mixture (Green) and adds her secret Red: $\text{Green} + \text{Red} = \textbf{Brown}$.
   - Bob takes Alice's mixture (Orange) and adds his secret Blue: $\text{Orange} + \text{Blue} = \textbf{Brown}$.

**Both Alice and Bob now possess the exact same secret color: Brown!**  
Eve is left with useless mixtures and cannot derive the secret.

In modern cryptography, paint colors are replaced with **elliptic curve point multiplication** over finite fields ($Q = d \times G$). Multiplying points on a curve is computationally instant; reversing the multiplication (the Discrete Logarithm Problem) would take the world's fastest supercomputers billions of years.

### What Does the "E" in ECDHE Mean? (Perfect Forward Secrecy)
The **"E"** stands for **Ephemeral**.

In legacy TLS (RSA key exchange), the server encrypted the pre-master key using its permanent private SSL certificate key. 

The catastrophic danger of legacy RSA:
> If an intelligence agency or hacker records 10 terabytes of your encrypted HTTPS traffic today, and 5 years from now they break into your office and steal your server's private `.key` file, **they can retroactively decrypt all 5 years of historical traffic!**

With **Ephemeral Diffie-Hellman**, the keys are discarded:
- The private keys exist **only in server RAM for the duration of that single session**.
- Once the user closes the connection, the keys are completely wiped from memory.
- Even if a hacker steals the server's master certificate tomorrow, **they cannot decrypt yesterday's traffic**. This architectural invariant is called **Perfect Forward Secrecy (PFS)**.

---

## 07. The Evolution: Why TLS 1.3 Cuts Handshake Latency in Half (1-RTT)

For over a decade, the internet ran on **TLS 1.2**. While secure, TLS 1.2 was notoriously slow.

Let's look at the packet ladder for a connection using TCP + TLS 1.2:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  THE LEGACY TLS 1.2 HANDSHAKE (3-RTT TAX!)                  │
└─────────────────────────────────────────────────────────────────────────────┘

 Client                                                      Server
   │                                                           │
   │─── TCP SYN ──────────────────────────────────────────────►│ ──┐
   │◄── TCP SYN-ACK ───────────────────────────────────────────┤   │ RTT 1: TCP Handshake
   │─── TCP ACK ──────────────────────────────────────────────►│ ──┘
   │                                                           │
   │─── ClientHello (Supported ciphers) ──────────────────────►│ ──┐
   │◄── ServerHello + Certificate + ServerKeyExchange ────────┤   │ RTT 2: TLS Negotiation
   │                                                           │ ──┘
   │─── ClientKeyExchange + Finished ─────────────────────────►│ ──┐
   │◄── Finished (Session keys verified) ──────────────────────┤   │ RTT 3: TLS Key Exchange
   │                                                           │ ──┘
   │─── HTTP GET /api/v1/orders ──────────────────────────────►│ ◄── FINALLY! HTTP Data
```

Notice the staggering cost: **3 full Round-Trip Times (3-RTT)** before the first HTTP request can even be transmitted! 

On mobile networks with 100ms latency, the user stared at a blank screen for **300ms** just waiting for network handshakes.

---

### The Modern Revolution: TLS 1.3 (RFC 8446)
In 2018, the IETF ratified **TLS 1.3**. 

TLS 1.3 made two radical architectural design changes:
1. **Aggressive Cipher Pruning:** It completely banned legacy, insecure cryptographic primitives (RSA key exchange, CBC-mode ciphers, RC4, MD5, SHA-1). It kept only modern authenticated AEAD ciphers (AES-GCM, ChaCha20-Poly1305) that all support elliptic curves.
2. **1-RTT Handshake Design:** Because the server is guaranteed to support modern elliptic curves, the client doesn't need to ask: *"What curves do you support?"* in round 1 and send keys in round 2!

Instead, the client makes an educated guess (usually X25519) and **sends its Diffie-Hellman public key share directly inside the very first `ClientHello` packet!**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE MODERN TLS 1.3 HANDSHAKE (1-RTT!)                    │
└─────────────────────────────────────────────────────────────────────────────┘

 Client                                                      Server
   │                                                           │
   │─── TCP SYN ──────────────────────────────────────────────►│ ──┐ RTT 1:
   │◄── TCP SYN-ACK ───────────────────────────────────────────┤   │ TCP Handshake
   │─── TCP ACK ──────────────────────────────────────────────►│ ──┘
   │                                                           │
   │─── ClientHello + Key Share (ECDHE Public Key) ───────────►│ ──┐ RTT 2:
   │◄── ServerHello + Key Share + Certificate + Finished ──────┤   │ TLS 1.3 Handshake
   │                                                           │ ──┘
   │                                                           │
   │ (Symmetric keys derived! Channel is fully encrypted!)     │
   │                                                           │
   │─── HTTP GET /api/v1/orders (Encrypted) ──────────────────►│ ◄── HTTP Data in 2 RTT!
```

By collapsing cipher negotiation and key exchange into a single round trip, **TLS 1.3 shaved an entire network round-trip off every secure connection worldwide.**

---

## 08. The 0-RTT Speed Trap: Session Resumption & The Replay Attack Hazard

Can we go even faster? Can we achieve **0-RTT**?

In TLS 1.3, if a user has previously visited your website, the server can issue a **Pre-Shared Key (PSK)** ticket. 

When the user returns later to make another request:
- The client re-uses that remembered PSK to encrypt its HTTP request immediately.
- It attaches this encrypted payload (called **Early Data**) directly to the initial `ClientHello` packet!

```
[ Client ] ─── ClientHello + PSK + HTTP GET /api/v1/products ───► [ Server ]
[ Client ] ◄── ServerHello + Encrypted HTTP Response ──────────── [ Server ]
```

The application data arrives at the server in **0-RTT** (zero round-trip latency overhead for the TLS layer)!

---

### The Architectural Nightmare: The 0-RTT Replay Attack
There is no free lunch in distributed systems. 0-RTT introduces a catastrophic security vulnerability: **Replay Attacks**.

Because 0-RTT Early Data is transmitted before the server and client have completed a fresh, live handshake, the data is encrypted with a pre-shared key. 

If an attacker intercepts that raw 0-RTT packet off a public Wi-Fi network, **the attacker cannot decrypt the contents, but they can copy the packet and re-transmit it to the server 100 times!**

```
Attacker intercepts 0-RTT packet: [ Encrypted: POST /api/v1/checkout/buy-item ]
Attacker replays packet 10 times to backend server:
  Server receives Packet 1  ──► Charges credit card $50
  Server receives Packet 2  ──► Charges credit card $50
  Server receives Packet 3  ──► Charges credit card $50
  Server receives Packet 10 ──► Charges credit card $50!
```

:::callout{type="danger" title="System Invariant: The 0-RTT Golden Rule"}
**Never permit non-idempotent HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE`) in TLS 1.3 0-RTT Early Data.**  
Major reverse proxies and CDNs (Cloudflare, Nginx, Envoy) enforce this strictly: only safe, idempotent requests like `GET /` are allowed inside 0-RTT packets. Any mutating operation must be forced to wait for the full 1-RTT handshake.
:::

---

## 09. Production Dissection: Inspecting Real Handshakes with `curl` & OpenSSL

Let's see this machinery in action. Open your terminal and run a detailed trace using `curl`:

```bash
curl -Iv --trace-time https://api.github.com
```

### Dissecting the Trace Output

```text
16:55:01.102341 * Trying 140.82.112.6:443...
16:55:01.121542 * Connected to api.github.com (140.82.112.6) port 443 (#0)
```
> **What happened here?**  
> Notice the timestamp jump from `.102` to `.121` (19ms). That was the physical **TCP 3-way handshake** completing over port 443!

```text
16:55:01.121890 * ALPN: offers h2,http/1.1
16:55:01.122100 * TLSv1.3 (OUT), TLS handshake, Client hello (1):
16:55:01.141200 * TLSv1.3 (IN), TLS handshake, Server hello (2):
```
> **What happened here?**  
> 1. The client sends **ALPN** (Application-Layer Protocol Negotiation), advertising that it can speak `h2` (HTTP/2) or `http/1.1`.
> 2. The client transmits its `Client hello` containing its **ECDHE public key share**.
> 3. Exactly 19ms later, the server replies with `Server hello` and its corresponding key share!

```text
16:55:01.141500 * TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
16:55:01.141620 * TLSv1.3 (IN), TLS handshake, Certificate (11):
16:55:01.142100 * TLSv1.3 (IN), TLS handshake, CERT verify (15):
16:55:01.142500 * TLSv1.3 (IN), TLS handshake, Finished (20):
16:55:01.142610 * TLSv1.3 (OUT), TLS handshake, Finished (20):
16:55:01.142750 * SSL connection using TLSv1.3 / TLS_AES_128_GCM_SHA256
```
> **What happened here?**  
> The server proves its identity using its X.509 Certificate, verifies cryptographic signatures, and both sides declare `Finished`. The negotiated cipher suite is **`TLS_AES_128_GCM_SHA256`**!

```text
16:55:01.143000 > GET / HTTP/2
16:55:01.143000 > Host: api.github.com
16:55:01.143000 > user-agent: curl/8.4.0
16:55:01.143000 > accept: */*
```
> **Finally!** Exactly two round trips after beginning, the first encrypted HTTP GET frame is transmitted onto the wire.

---

## 10. Architectural Comparison Matrix: Handshake Overhead Across Generations

| Protocol Dimension | Plain TCP (Unencrypted) | TCP + TLS 1.2 (Legacy) | TCP + TLS 1.3 (Modern Standard) | QUIC / HTTP/3 (Next-Gen) |
| :--- | :--- | :--- | :--- | :--- |
| **Initial Connection Latency** | 1-RTT | **3-RTT** | **2-RTT** | **1-RTT** (Combined Handshake) |
| **Resumed Connection Latency** | 1-RTT | 2-RTT | **1-RTT (or 0-RTT with PSK)** | **0-RTT** |
| **Key Exchange Security** | None | Vulnerable to RSA key leaks | **Strict Ephemeral Diffie-Hellman** | Strict Ephemeral Diffie-Hellman |
| **Perfect Forward Secrecy** | ✗ No | Optional (often disabled) | **✓ Mandatory by Spec** | **✓ Mandatory by Spec** |
| **Vulnerability to SYN Floods** | High (mitigated by SYN cookies) | High | High | Immune (Runs over UDP) |
| **Underlying OS Layer** | Kernel TCP Stack | Kernel TCP Stack | Kernel TCP Stack | User-space UDP Engine |

---

## 11. Senior Systems Engineer's Production Transport Checklist

When deploying edge gateways, reverse proxies, and cloud load balancers, apply these concrete operational guidelines:

- [ ] **Enforce TLS 1.3 as Primary:** Configure Nginx, Envoy, or AWS ALB to offer TLS 1.3 with a fallback to TLS 1.2 only. Explicitly disable TLS 1.0 and TLS 1.1 across all ingress points.
- [ ] **Enable Linux SYN Cookies:** Verify that your host kernel has SYN cookies active to defend against volumetric connection exhaustion:
  ```bash
  sysctl -w net.ipv4.tcp_syncookies=1
  ```
- [ ] **Enable OCSP Stapling:** During the TLS handshake, checking certificate revocation with a third-party Certificate Authority adds an extra network query. Configure your web server to cache ("staple") the CA's signed OCSP response directly inside the handshake:
  ```nginx title="nginx.conf"
  ssl_stapling on;
  ssl_stapling_verify on;
  resolver 1.1.1.1 8.8.8.8 valid=300s;
  ```
- [ ] **Configure ALPN (Application-Layer Protocol Negotiation):** Ensure your ingress reverse proxy advertises `h2` and `http/1.1` in the TLS ClientHello extension to avoid an extra protocol upgrade round-trip.
- [ ] **Gate 0-RTT to Idempotent Methods:** If you enable TLS 1.3 0-RTT on Cloudflare or Nginx (`ssl_early_data on`), configure your application gateway to reject non-idempotent HTTP methods (`POST`, `PUT`, `DELETE`) arriving via early data with HTTP status code `425 Too Early`.
- [ ] **Tune TCP Window Scaling:** Ensure RFC 1323 window scaling is enabled in your OS to allow socket buffers to scale beyond the historic 64 KB limit on high-throughput cloud links:
  ```bash
  sysctl -w net.ipv4.tcp_window_scaling=1
  ```

---

## 12. Summary & Bridge to Lesson 1.3

Let's review the physical journey of our request so far:

1. **DNS Resolution (Lesson 1.1):** We mapped human language `api.store.com` to routable physical coordinates `198.51.100.42`.
2. **TCP 3-Way Handshake (Lesson 1.2):** We synchronized starting sequence numbers ($ISN$) and established receive window limits ($rwnd$) to convert an unreliable packet-switched network into a reliable byte stream.
3. **TLS 1.3 Cryptographic Handshake (Lesson 1.2):** We leveraged Ephemeral Diffie-Hellman (ECDHE) to derive symmetric session keys in a single round-trip, guaranteeing **Confidentiality, Integrity, and Perfect Forward Secrecy**.

### What Comes Next?

Our secure, encrypted packets have now arrived at the physical network card (NIC) of our server. 

Millions of electrical and optical signals are flooding into the server's network hardware. 

How does the server's operating system take those physical electrical signals off the network wire? 
- What happens inside the **NIC Ring Buffer**?
- What is a **Hardware Interrupt** and a **Linux Softirq**?
- How do **Kernel Socket Buffers (`SO_RCVBUF` / `SO_SNDBUF`)** store bytes in memory?
- And how do modern high-concurrency servers like Nginx, Netty, Node.js, and Envoy use non-blocking event loops (**`epoll` on Linux** and **`kqueue` on BSD**) to handle 100,000 concurrent sockets without crashing the CPU?

In our next deep dive, **[Lesson 1.3: Server OS Network Ingress: Kernel Sockets, Network Buffers & Epoll](/notes/server-os-network-ingress-kernel-sockets-buffers-and-epoll)**, we will open the Linux kernel hood and trace the path of a packet from physical wire copper into application memory!
