---
title: "API Authentication & Authorization: Sessions, JWTs, OAuth2, and Distributed Identity"
slug: authentication
subject: software-architecture-system-design
abstract: Master the architectural principles of authentication and authorization in modern distributed systems. Learn the fundamental difference between AuthN and AuthZ, compare stateful session cookies against stateless JWT bearer tokens, dissect asymmetric cryptographic signing (RS256 vs HS256), master OAuth 2.0 and OpenID Connect (OIDC) flows, and discover how enterprise systems solve the token revocation paradox, secure API keys, and terminate authentication at the API Gateway edge.
tags:
  - authentication
  - security
  - jwt
  - oauth2
  - api-design
  - system-design
  - architecture
  - distributed-systems
published: true
publishDate: Nov 14, 2026
updatedDate: Nov 14, 2026
readTime: 24m read
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
  lesson: "0.4.5"
---

# API Authentication & Authorization: Sessions, JWTs, OAuth2, and Distributed Identity

In early web applications, security was deceptively simple: a user submitted a username and password into an HTML form, a single monolithic server verified the credentials against a relational database, created an in-memory session hash, and set a cookie in the user's browser. Every subsequent request hit that exact same machine, which checked its local RAM to verify the user.

Today, enterprise platforms handle hundreds of thousands of requests per second flowing from mobile devices, single-page applications (SPAs), third-party partner integrations, and internal microservice clusters spread across global regions.

In this distributed reality:
* A single customer request might traverse an Edge CDN, an API Gateway, and ten downstream microservices written in three different programming languages.
* A user might change their password or have their account terminated while hundreds of active API calls bearing their credentials are still mid-flight.
* A client could be an end-user on an iPhone, an automated cron worker, or an external SaaS platform (like Zapier) requesting delegated access to read customer spreadsheets.

How do backend systems verify identity across distributed boundaries without introducing a massive database bottleneck on every single HTTP request? When should you use **stateful session cookies**, **stateless JSON Web Tokens (JWTs)**, **hashed API keys**, or **OAuth 2.0 flows**? And how do you solve the infamous **token revocation paradox**?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THE DISTRIBUTED IDENTITY CHALLENGE                    │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Client / Mobile ] ──► [ Edge API Gateway ] ──► [ Order Service ] ──► [ Billing Service ]
                                │
                                ├── Must verify WHO you are (Authentication)
                                ├── Must verify WHAT you can do (Authorization)
                                └── Must propagate identity WITHOUT querying
                                    a central database on every microservice hop!
```

---

## 01. The Core Invariant: Authentication vs. Authorization

Before designing any security architecture, you must establish an uncompromising boundary between two distinct concepts that are frequently confused: **Authentication (AuthN)** and **Authorization (AuthZ)**.

```
┌──────────────────────────────────────┬──────────────────────────────────────┐
│        AUTHENTICATION (AuthN)        │         AUTHORIZATION (AuthZ)        │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ "Who are you?"                       │ "What are you permitted to do?"      │
│ Verifies the IDENTITY of the caller. │ Verifies the PERMISSIONS / PRIVILEGES│
│ Example: Submitting a valid password,│ Example: User Alice is allowed to    │
│ solving a 2FA TOTP code, presenting  │ READ Document #99, but NOT DELETE it.│
│ a signed cryptographically valid JWT.│                                      │
│ HTTP Failure: 401 Unauthorized       │ HTTP Failure: 403 Forbidden          │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### The Airport Analogy
* **Authentication**: You arrive at airport customs and present your **Passport**. The border officer verifies your photo, holographic watermark, and biometric chip. You have proven *who you are*.
* **Authorization**: You walk to Gate B12 to board an airplane to Tokyo. The gate agent checks your **Boarding Pass**. Even though your passport is completely genuine (AuthN succeeded), if your ticket is for Economy class, you are *not authorized* to sit in First Class (AuthZ failed).

:::callout{type="danger" title="The Golden Rule of Distributed Identity"}
**Never trust client-supplied identity identifiers in the request body or path.**  
A junior vulnerability often looks like this:
```http
POST /api/v1/transfer HTTP/1.1
Content-Type: application/json

{ "from_user_id": 42, "to_user_id": 99, "amount": 1000 }
```
An attacker simply changes `"from_user_id": 100` to drain an arbitrary victim's account!  
**Rule**: The caller's identity must be cryptographically extracted from the authenticated security context (the verified session cookie or cryptographically signed bearer token), **never** from an unauthenticated request parameter.
:::

---

## 02. The Historical Evolution: Why Auth Models Changed

To understand modern API authentication, we must trace why previous approaches broke under scale.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          THE AUTHENTICATION TIMELINE                        │
└─────────────────────────────────────────────────────────────────────────────┘

 1996: HTTP Basic Auth  ──► Credentials sent on every request (Base64 encoded)
 2000: Stateful Cookies ──► Server stores session in RAM / Redis; sets Cookie
 2010: Stateless Tokens ──► JWTs; cryptographically self-contained; zero DB lookup
 2015: OAuth 2.0 / OIDC ──► Delegated authorization; third-party login federation
 2020: Zero-Trust & mTLS──► Service-to-service mutual TLS; cryptographic workload IDs
```

### 1. HTTP Basic Authentication (RFC 7617)
The earliest standard. The client concatenates `username:password`, encodes it in Base64, and places it in every request:
```http
Authorization: Basic YWxpY2U6c2VjcmV0cGFzc3dvcmQ=
```
* **Why it failed for modern apps**: Base64 is not encryption; anyone sniffing the packet reads the plaintext password. Furthermore, storing the user's raw password on a mobile device or browser localStorage means any cross-site scripting (XSS) vulnerability compromises the master password.

### 2. Stateful Server-Side Sessions
The industry moved to centralized sessions:
1. User submits credentials once via `POST /login`.
2. Server verifies the password hash, creates a cryptographic session ID (`sess_8f3a91...`), and stores session metadata in server memory or a centralized **Redis** cluster.
3. Server returns the ID via a `Set-Cookie` header.
4. On every subsequent request, the browser sends `Cookie: session_id=sess_8f3a91...`.
5. The server looks up `sess_8f3a91...` in Redis to retrieve `user_id`, `role`, and `permissions`.

```
[ Browser ] ─── GET /profile (Cookie: sess_123) ───► [ Web Server ] ──► [ Redis Session Store ]
                                                                             │
                                                                   Query: GET sess_123 (1-2ms)
                                                                   Returns: { user_id: 42 }
```

#### Why Stateful Sessions Struggle in Large Distributed Systems:
1. **The Central Point of Failure & Scaling Bottleneck**: At 500,000 requests per second, your Redis cluster must serve 500,000 read queries every single second just to check who is making the requests. If Redis has a network blip, the entire company goes down.
2. **Cross-Origin & Mobile Friction**: Native mobile apps (iOS/Android) and third-party developer integrations do not handle cookies natively as cleanly as web browsers. Cookies also introduce Cross-Site Request Forgery (**CSRF**) risks.

---

## 03. Stateless Authentication: JSON Web Tokens (JWT)

To eliminate the centralized Redis bottleneck, the industry formalized **RFC 7519: JSON Web Tokens (JWT)**.

Instead of storing a session on the server and handing the client a random pointer ID, the server encodes the user's identity and permissions directly into a structured token, **cryptographically signs it**, and hands it to the client.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           THE ANATOMY OF A JWT                              │
└─────────────────────────────────────────────────────────────────────────────┘

  eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfNDIiLCJuYW1lIjoiQWxp
  Y2UiLCJyb2xlIjoiQURNSU4iLCJleHAiOjE3NjM4MjAwMDB9.k7P9xQzL5mNvW2...
  └──────────────────┬─────────────────┘└──────────────────┬────────────────┘└──────────────┬─────────────┘
                     │                                     │                                │
                 1. HEADER                             2. PAYLOAD                       3. SIGNATURE
         Algorithm & Token Type                 Claims & Metadata              Cryptographic Proof
```

### The Three Components Under the Microscope

#### 1. The Header
Defines the metadata of the token and the cryptographic algorithm used to sign it:
```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "auth-key-2026-v1"
}
```

#### 2. The Payload (The Claims)
The actual user data and statements. RFC 7519 defines standard **registered claims**:
* `sub` (Subject): The unique user ID (`usr_42`).
* `iss` (Issuer): Who generated the token (`https://auth.company.com`).
* `aud` (Audience): Who the token is intended for (`https://api.company.com`).
* `exp` (Expiration Time): Unix timestamp after which the token is invalid.
* `iat` (Issued At): When the token was minted.

You can also attach **custom claims**:
```json
{
  "sub": "usr_42",
  "iss": "https://auth.company.com",
  "exp": 1763820000,
  "role": "ADMIN",
  "tenant_id": "org_9918"
}
```

#### 3. The Signature (The Tamper-Proof Seal)
This is what makes a JWT trustworthy without querying a database. The signature is computed over the Base64URL-encoded header and payload:

$$
\text{Signature} = \text{CryptoSign}(\text{Base64Url}(\text{Header}) + "." + \text{Base64Url}(\text{Payload}), \text{Key})
$$

If an attacker modifies the payload (e.g., changing `"role": "USER"` to `"role": "ADMIN"`), the cryptographic signature will no longer match. The receiving server immediately rejects the token.

---

### Symmetric (HS256) vs. Asymmetric (RS256 / ES256) Signing

This is one of the most critical architectural decisions in system design interviews:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 SYMMETRIC (HS256) VS ASYMMETRIC (RS256)                     │
└─────────────────────────────────────────────────────────────────────────────┘

 SYMMETRIC (HMAC with SHA-256):
   [ Auth Server ] ──(Shared Secret: "super-secret-key")──► [ Microservice A ]
   [ Auth Server ] ──(Shared Secret: "super-secret-key")──► [ Microservice B ]
   DANGER: Every microservice holds the ability to SIGN new tokens! 
           If one service is compromised, the entire platform is hacked.

 ASYMMETRIC (RSA / Elliptic Curve):
   [ Auth Server ] ── Holds PRIVATE KEY (Signs Tokens)
         │
         ▼ (Publishes Public Key via JWKS endpoint: /.well-known/jwks.json)
   [ Microservice A ] ── Holds PUBLIC KEY (Can ONLY VERIFY, cannot forge tokens!)
   [ Microservice B ] ── Holds PUBLIC KEY (Can ONLY VERIFY, cannot forge tokens!)
```

| Architectural Vector | Symmetric (HS256) | Asymmetric (RS256 / EdDSA) |
| :--- | :--- | :--- |
| **Keys Required** | Single shared secret string | Public / Private key pair |
| **Token Creation** | Anyone holding the secret | Only the Auth Server (holds Private Key) |
| **Token Verification**| Requires the same secret | Any service holding the Public Key |
| **Security Blast Radius**| **Extreme**: Leak in 1 service compromises all | **Minimal**: Leaked public key cannot sign tokens |
| **Performance** | Extremely fast (simple hashing) | Slightly higher CPU cost for verification |
| **Production Standard** | Internal monoliths or single services | **Universal standard for microservice clouds** |

---

## 04. The Token Revocation Paradox & The Dual-Token Pattern

Stateless tokens give you incredible scalability: downstream microservices verify the signature locally in memory using the public key without making a single database call.

**However, this introduces a terrifying architectural dilemma:**

> *"If a JWT is valid for 1 hour, and an employee is fired, an account is suspended, or a phone is stolen... how do you revoke a stateless token immediately?"*

Because the microservice validates the token purely using math (cryptography), the token remains valid until its `exp` timestamp expires! The server has no memory of issued tokens.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE DUAL-TOKEN ARCHITECTURE (ACCESS + REFRESH)           │
└─────────────────────────────────────────────────────────────────────────────┘

  [ Mobile App / Browser ]              [ API Gateway / Resource ]          [ Central Auth Server ]
             │                                       │                                 │
             │ 1. POST /login (user, pass)           │                                 │
             │────────────────────────────────────────────────────────────────────────►│
             │                                       │                                 │
             │ 2. Returns Token Pair                 │                                 │
             │    • Access Token (JWT, TTL: 10 mins) │                                 │
             │    • Refresh Token (Opaque UUID, TTL: 30 days, Stored in DB)            │
             │◄────────────────────────────────────────────────────────────────────────│
             │                                       │                                 │
             │ 3. API Call: GET /v1/orders           │                                 │
             │    Authorization: Bearer <Access Token>                                 │
             │──────────────────────────────────────►│ (Verifies RS256 in memory!)     │
             │                                       │ Returns 200 OK                  │
             │◄──────────────────────────────────────│                                 │
             │                                       │                                 │
   ... 10 Minutes Later (Access Token Expires) ...   │                                 │
             │                                       │                                 │
             │ 4. API Call: GET /v1/orders           │                                 │
             │    Authorization: Bearer <Expired JWT>                                  │
             │──────────────────────────────────────►│ (Fails: Token Expired!)         │
             │ 5. HTTP 401 Unauthorized              │                                 │
             │◄──────────────────────────────────────│                                 │
             │                                       │                                 │
             │ 6. Silent Background Refresh:         │                                 │
             │    POST /v1/auth/refresh              │                                 │
             │    { "refresh_token": "uuid-99182" }  │                                 │
             │────────────────────────────────────────────────────────────────────────►│
             │                                       │                                 │ Checks DB / Redis:
             │                                       │                                 │ • Is refresh token valid?
             │                                       │                                 │ • Has user been banned?
             │                                       │                                 │ If OK: Mints new JWT!
             │ 7. Returns NEW Access Token (10m)     │                                 │
             │◄────────────────────────────────────────────────────────────────────────│
```

### How the Dual-Token Pattern Solves the Dilemma:
1. **Short-Lived Access Tokens (5 to 15 minutes)**: If an access token is compromised, the attacker's window of opportunity is bounded by minutes.
2. **Long-Lived Refresh Tokens (7 to 30 days)**: Stored securely in a database or Redis.
3. **Instant Revocation**: If an admin revokes access or a user logs out, the backend deletes the **Refresh Token** from the database. When the client's short-lived access token expires 5 minutes later, the client attempts to refresh—the Auth Server sees the refresh token is revoked, rejects the request, and boots the user out.
4. **Emergency Immediate Revocation (The Edge Blacklist)**: For high-security zero-trust platforms that cannot wait 5 minutes, the API Gateway maintains an in-memory **Bloom filter or Redis blacklist** of revoked user IDs. The Gateway checks the blacklist at the edge, rejecting revoked users before traffic ever reaches microservices.

---

## 05. API Keys: Machine-to-Machine & Developer APIs

When you use developer platforms like **Stripe**, **Twilio**, or **OpenAI**, you don't log in with a username and password, and you don't run a 3-legged browser redirect. You pass an **API Key**:

```http
GET /v1/models HTTP/1.1
Host: api.openai.com
Authorization: Bearer sk-proj-9aB2c...
```

### Anatomy of a Production API Key
A professional API key is never just a random UUID. Look at how Stripe designs keys:
`sk_live_51Mz...` or `pk_test_48a...`

```
  sk   _   live   _   51Mz981249bA...
  ▲        ▲          ▲
  │        │          └── Secret Entropy (High-randomness cryptographic bytes)
  │        └───────────── Environment (live vs test)
  └────────────────────── Key Type (sk = secret key, pk = publishable public key)
```

**Why Prefixes Matter in Production:**
1. **Instant Routing**: The API Gateway reads the prefix `pk_test_` and routes the request to the sandbox mock environment without touching production databases.
2. **Automated Secret Scanning**: GitHub, GitGuardian, and AWS continuously scan public code repositories for leaked secrets using regex like `sk_live_[0-9a-zA-Z]{24}`. If a developer accidentally commits a key, GitHub automatically invalidates it within seconds!

### How to Store API Keys Securely on the Backend

:::callout{type="danger" title="Never Store Raw API Keys in Your Database!"}
If an attacker exploits a SQL injection vulnerability or gains read access to your database backups, **every customer API key is compromised**.  
API keys must be treated with the exact same rigor as passwords.
:::

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SECURE API KEY STORAGE ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────────────────────┘

 1. GENERATION (Shown to customer EXACTLY ONCE upon creation):
    Full Key: sk_live_abc123_SECRET_ENTROPY_99999999999999999999

 2. STORAGE IN DATABASE:
    ┌───────────────────────────┬─────────────────────────────────────────────┐
    │ key_prefix (Public lookup)│ key_hash (SHA-256 of full key)              │
    ├───────────────────────────┼─────────────────────────────────────────────┤
    │ sk_live_abc123            │ e3b0c44298fc1c149afbf4c8996fb92427ae41e46...│
    └───────────────────────────┴─────────────────────────────────────────────┘

 3. INCOMING VERIFICATION:
    Client sends: sk_live_abc123_SECRET_ENTROPY_99999999999999999999
    • Step A: Extract prefix "sk_live_abc123" ──► Fast index lookup in DB/Cache
    • Step B: Compute SHA-256 of the submitted key
    • Step C: Constant-time comparison: SHA256(received) == DB.key_hash
```

---

## 06. Delegated Authorization: OAuth 2.0 & OpenID Connect (OIDC)

What happens when an application needs to access resources hosted on another platform on behalf of a user?

### The Historical Anti-Pattern: Password Sharing
In 2007, before OAuth, if you wanted **Yelp** to find which of your friends were on Yelp, Yelp would show a screen saying:
> *"Enter your Gmail username and password, and we will log into your email account and scrape your address book."*

This was an architectural nightmare:
* You gave Yelp your master Google password.
* Yelp could now read your private emails, delete your photos, or change your password.
* The only way to revoke Yelp's access was to change your Google password, breaking every other application.

### The Solution: OAuth 2.0 (RFC 6749)
OAuth 2.0 is a framework for **delegated authorization**. It allows a third-party application to obtain limited access to an HTTP service on behalf of a resource owner.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE 4 ROLES OF OAUTH 2.0 ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────────────────┘

 1. Resource Owner  ──► The User (e.g., Alice).
 2. Client          ──► The Third-Party App wanting access (e.g., Spotify).
 3. Auth Server     ──► Owns user identity and issues tokens (e.g., Google Accounts).
 4. Resource Server ──► Holds the user's data (e.g., Google Drive API).
```

### The Gold Standard: Authorization Code Flow with PKCE

For web applications and mobile apps, **Authorization Code Flow with PKCE (Proof Key for Code Exchange)** is the universally mandated standard.

```
[ User Browser / App ]            [ Spotify Client ]         [ Google Auth Server ]      [ Google API ]
          │                              │                             │                       │
          │ 1. Clicks "Log in with Google"                             │                       │
          │─────────────────────────────►│                             │                       │
          │                              │ Generates:                  │                       │
          │                              │ • code_verifier (random)    │                       │
          │                              │ • code_challenge = SHA256(v)│                       │
          │                              │                             │                       │
          │ 2. Redirect to Google Auth with code_challenge              │                       │
          │◄─────────────────────────────│                             │                       │
          │                                                            │                       │
          │ 3. User authenticates & grants consent                     │                       │
          │───────────────────────────────────────────────────────────►│                       │
          │                                                            │                       │
          │ 4. Redirects back to Spotify with temporary auth_code      │                       │
          │◄───────────────────────────────────────────────────────────│                       │
          │                                                            │                       │
          │ 5. Sends auth_code to Spotify Backend                      │                       │
          │─────────────────────────────►│                             │                       │
          │                              │ 6. POST /token              │                       │
          │                              │    (auth_code + code_verifier)                      │
          │                              │────────────────────────────►│                       │
          │                              │                             │ Verifies:             │
          │                              │                             │ SHA256(code_verifier) │
          │                              │                             │ == code_challenge     │
          │                              │ 7. Returns Access Token     │                       │
          │                              │◄────────────────────────────│                       │
          │                              │                                                     │
          │                              │ 8. GET /v1/userinfo (Bearer <Access Token>)         │
          │                              │────────────────────────────────────────────────────►│
          │                              │ 9. Returns user profile & email                     │
          │                              │◄────────────────────────────────────────────────────│
```

* **What PKCE Solves**: On mobile devices, malicious apps can intercept custom URI redirect schemes (e.g. `spotify://oauth-callback`). Without PKCE, an attacker stealing the `auth_code` could exchange it for a token. With PKCE, only the original client that holds the secret in-memory `code_verifier` can complete the token exchange!

### OpenID Connect (OIDC): Identity on Top of OAuth 2.0
OAuth 2.0 was designed strictly for **Authorization** (returning an `access_token` to call APIs). It explicitly did *not* tell the client who the user was.

**OpenID Connect (OIDC)** is an identity layer built directly on top of OAuth 2.0. It introduces the **`id_token`** (a signed JWT containing verified identity claims like `name`, `email`, and `profile_picture`), providing a standardized protocol for Single Sign-On (SSO).

---

## 07. Enterprise Edge Architecture: Gateway Authentication Offloading

In a microservice ecosystem, how should authentication be enforced?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               ANTI-PATTERN: DISTRIBUTED AUTH DUPLICATION                    │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Client ] ──► [ Gateway ] ──► [ Order Service ]    ──► [ User Service DB ] (Auth check)
                            ──► [ Billing Service ]  ──► [ User Service DB ] (Auth check)
                            ──► [ Shipping Service ] ──► [ User Service DB ] (Auth check)
 (Every microservice independently verifies JWTs, parses headers, and hits the DB!)
```

### The Modern Solution: Edge Authentication & Identity Propagation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE EDGE AUTHENTICATION GATEWAY PATTERN                  │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Public Internet ]
         │
         │ (Incoming external request with Bearer JWT)
         ▼
 ┌────────────────────────────────────────────────────────┐
 │           EDGE API GATEWAY (Kong, Envoy, AWS APIGW)    │
 │                                                        │
 │ 1. Validates external JWT signature using cached JWKS  │
 │ 2. Validates expiration and audience                   │
 │ 3. Enforces rate limits per customer ID                │
 │ 4. Strips untrusted client headers (e.g. X-User-Id)    │
 │ 5. INJECTS TRUSTED INTERNAL HEADERS:                   │
 │    • X-User-Id: usr_42                                 │
 │    • X-User-Roles: ADMIN,EDITOR                        │
 │    • X-Tenant-Id: org_991                              │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼ (Secure Private Internal VPC / Service Mesh)
               ┌────────────┴────────────┐
               ▼                         ▼
      [ Order Microservice ]   [ Billing Microservice ]
      (Reads X-User-Id directly! Zero cryptographic overhead, zero DB calls!)
```

#### Why the Edge Gateway Pattern Wins:
1. **Centralized Security Enforcement**: Bug fixes, TLS ciphers, and JWT algorithm updates are managed in one gateway layer, rather than updated across 50 separate microservices.
2. **Lightning-Fast Downstream Services**: Internal microservices do not need complex JWT verification libraries. They simply read trusted HTTP headers injected by the gateway over a private, firewalled network.
3. **Mutual TLS (mTLS) Inside the Mesh**: For zero-trust compliance, service meshes (like Istio or Linkerd) wrap internal traffic in automatic mTLS with ephemeral X.509 certificates, ensuring that even if an attacker gains access to the internal network, they cannot spoof internal headers.

---

## 08. Architectural Comparison Matrix

| Authentication Vector | Stateful Sessions (Cookies) | Stateless JWTs (Bearer Tokens) | Hashed API Keys | OAuth 2.0 / OIDC | Mutual TLS (mTLS) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **State Location** | Central DB / Redis | Completely Stateless (Client holds) | DB / Edge Cache | Auth Server | In-memory X.509 certs |
| **Verification Overhead** | Network/DB lookup per request | Local CPU cryptographic signature | Hash & DB/Cache lookup | Gateway validates token | TLS Handshake at connection |
| **Instant Revocation** | **Trivial** (Delete session from DB) | **Difficult** (Requires dual-token / blacklists)| **Trivial** (Disable key in DB) | **Trivial** (Revoke refresh token) | Revoke certificate / CRL |
| **Client Type** | Traditional Web Browsers | Mobile Apps, SPAs, Microservices | Developers, CLI tools, B2B SaaS | Third-party partner apps, SSO | Internal Microservice Meshes |
| **Vulnerability Vectors** | CSRF attacks, Redis outages | Secret key leak, Token theft, Bloat | Plaintext key leak in Git | Token interception, Redirect hijacking | Expired cert management |
| **Payload Size** | Tiny (`~32 bytes` UUID) | Medium to Large (`500B - 2KB` Base64) | Small (`~40 bytes` string) | Medium (`1KB` JWT) | Handshake only (zero HTTP overhead) |

---

## 09. Senior Systems Engineer's Production Checklist for API Security

Before promoting any authentication or authorization architecture to production, audit your system against these essential controls:

* [ ] **Enforce Asymmetric Signing (RS256 / EdDSA):** Never use symmetric HS256 secrets in multi-service environments. The Auth service holds the private key; all consumers verify with public keys via a dynamic JWKS endpoint (`/.well-known/jwks.json`).
* [ ] **Prevent the `alg: "none"` Attack:** Configure your JWT verification libraries to explicitly whitelist accepted algorithms (`["RS256"]`). Never allow the token header's `alg` field to dictate the verification algorithm dynamically.
* [ ] **Implement the Dual-Token Architecture:** Keep Access Tokens strictly ephemeral (TTL $\le 15$ minutes). Use rotating Refresh Tokens stored in secure, revocable storage.
* [ ] **Secure Storage in Web Browsers:** For web SPAs, store tokens in **`HttpOnly; Secure; SameSite=Strict`** cookies to make them completely inaccessible to malicious JavaScript and Cross-Site Scripting (XSS) scrapers. Never store long-lived sensitive tokens in `localStorage`.
* [ ] **Hash API Keys with SHA-256:** Never store raw developer API keys in databases. Store a cryptographic hash and an unhashed prefix for indexed retrieval.
* [ ] **Strip & Sanitize Ingress Headers:** Ensure the Edge API Gateway strips all inbound `X-User-*` or `X-Forwarded-*` headers sent by external clients before injecting authoritative identity headers downstream.
* [ ] **Set Clock Skew Tolerances:** Network clocks drift. Configure JWT verification with a modest leeway (e.g., 60 seconds) on `exp` and `nbf` claims to prevent false 401 rejections caused by NTP clock drift across cloud instances.
* [ ] **Rate Limit Authentication Endpoints:** Apply strict IP-based and username-based leaky-bucket rate limiting on `/login`, `/auth/refresh`, and `/password-reset` routes to prevent credential stuffing and brute-force attacks.

---

## 10. Summary & Forward Bridge

Authentication and authorization form the bedrock of distributed system trust. By decoupling identity verification at the edge API gateway, leveraging asymmetric cryptographic tokens for high-speed downstream processing, and enforcing rigorous token rotation lifecycles, you build platforms that remain impenetrable without sacrificing horizontal scalability.

Now that our APIs are fully authenticated and secure, how do we efficiently transmit large volumes of data back to our consumers without overwhelming server memory or freezing mobile clients? In the next lesson, we dive into **Lesson 0.4.6: Pagination — Offset-Based vs. Keyset / Cursor-Based Pagination**.
