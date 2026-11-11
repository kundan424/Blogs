---
title: "HTTP Protocol Internals: Methods, Status Codes, Headers & Cookies"
slug: http-protocol-methods-status-codes-headers-cookies
subject: backend-distributed-systems
abstract: An interactive, mentor-led guide to HTTP protocol fundamentals for Spring Boot and microservices developers. Master request/response wire framing, idempotency across GET/POST/PUT/DELETE/PATCH, the complete 2xx/3xx/4xx/5xx status code taxonomy, header negotiation, and secure cookie architecture with hands-on curl walkthroughs and Spring Boot 3 production implementations.
tags:
  - http
  - networking
  - rest-api
  - spring-boot
  - microservices
  - backend
published: true
publishDate: Nov 11, 2026
updatedDate: Nov 11, 2026
readTime: 22m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
---

# HTTP Protocol Internals: Methods, Status Codes, Headers & Cookies

This guide is intended as a reference for those working with HTTP and REST APIs in Spring Boot 3 for the first time, but is also intended to serve as a cookbook with self-contained references and solutions for common real-world use cases. For first-time engineers, it is recommended that you step through the material in a sequential fashion. For engineers already familiar with HTTP, this guide endeavours to provide a quick, dependable solution for the need at hand.

It is assumed at this point that you have a basic grasp of running a Java application and using a terminal. If you haven't yet explored Maven and project build lifecycles, you may want to review our [Maven Architecture & Build Lifecycle Guide](/notes/maven-architecture-build-lifecycle-pom-plugins-phases).

Ok, so you are building backend services with Spring Boot and you are ready to connect them across the network. Before we jump into annotations like `@GetMapping`, `@PostMapping`, and `@RequestParam`, we will very briefly go over what HTTP actually is and how understanding its wire mechanics will make you a significantly more effective distributed systems engineer. 

Spring Boot will, of course, do a tremendous amount of heavy lifting out of the box. But when your Kubernetes Ingress controller drops incoming traffic with `504 Gateway Timeout`, when your React frontend refuses to read authentication credentials due to `SameSite` cookie restrictions, or when an aggressive client retry loop doubles a customer's credit card billing because an endpoint wasn't idempotent—Spring Boot cannot save you if you do not understand HTTP. You can leave the wire transport to HTTP, but you must know how it speaks!

---

### Sections

- [What is HTTP and Why Does It Matter for Spring Boot Microservices?](#01-what-is-http-and-why-does-it-matter-for-spring-boot-microservices)
- [How Does an HTTP Message Look on the Wire? (Request & Response Framing)](#02-how-does-an-http-message-look-on-the-wire-request--response-framing)
- [How Do HTTP Methods Work, and What Makes a Method Safe or Idempotent?](#03-how-do-http-methods-work-and-what-makes-a-method-safe-or-idempotent)
- [How Do HTTP Status Codes Communicate Outcome? (2xx, 3xx, 4xx, 5xx)](#04-how-do-http-status-codes-communicate-outcome-the-2xx-3xx-4xx-5xx-taxonomy)
- [How Do HTTP Headers Control Metadata, Content Negotiation, and Security?](#05-how-do-http-headers-control-metadata-content-negotiation-and-security)
- [How Do Cookies and Session State Work Over a Stateless Protocol?](#06-how-do-cookies-and-session-state-work-over-a-stateless-protocol)
- [How Do I Put This Together in Spring Boot 3? (REST Controller Cookbook)](#07-how-do-i-put-this-together-in-spring-boot-3-rest-controller-cookbook)
- [The Senior Backend Engineer's HTTP & API Design Checklist](#08-the-senior-backend-engineers-http--api-design-checklist)
- [Summary & Mental Model Review](#09-summary--mental-model-review)

---

## 01. What is HTTP and Why Does It Matter for Spring Boot Microservices?

At first glance, HTTP (Hypertext Transfer Protocol) can appear deceptively simple: you type a URL into a browser, and a web page appears. 

In a nutshell, HTTP is an **application-layer, request-response, stateless client-server protocol** originally drafted in 1991 (HTTP/0.9) and standardized in RFC 1945 (HTTP/1.0), RFC 2616 (HTTP/1.1), RFC 7540 (HTTP/2), and RFC 9114 (HTTP/3).


![HTTP Client-Server TCP Connection & Request-Response Lifecycle](/images/content/backend-distributed-systems/http/backend-distributed-systems_http_mod-02_lesson-2.1_client-server-tcp-lifecycle.svg "HTTP Client-Server TCP Connection & Request-Response Lifecycle")

1. **Client-Server Architecture:** The client initiates the conversation by opening a network socket (typically TCP port 80 for plaintext HTTP or port 443 for TLS-encrypted HTTPS) and transmitting an HTTP request message. The server listens, parses the message, executes application logic, and returns an HTTP response message.
2. **Stateless Nature:** The protocol itself has zero memory. The server does not inherently remember previous requests from the same client. Request #2 knows nothing about Request #1 unless the client explicitly passes state identifiers (such as session tokens, JWTs, or cookies) inside the message.
3. **Application-Layer Protocol:** HTTP does not concern itself with routing packets across the internet (IP) or guaranteeing that bytes arrive in order without corruption (TCP). It assumes a reliable underlying transport stream and focuses exclusively on message framing, resource addressing, and semantics.
4. **Media-Independent:** Although HTTP was originally designed to transfer HTML documents ("hypertext"), it can transfer any binary payload: JSON, XML, Protobuf, Avro, JPEG images, or streaming video.

### Why Care About HTTP Wire Details in Spring Boot 3?

In Spring Boot, you might write:

```java
@GetMapping("/orders/{id}")
public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
    return ResponseEntity.ok(orderService.findById(id));
}
```

This looks like an ordinary Java method. But when your code runs, an embedded servlet engine (Apache Tomcat by default in Spring Boot) receives a raw byte stream from an incoming TCP socket, decodes ASCII/binary delimiters, creates an `HttpServletRequest`, executes Spring's `DispatcherServlet`, runs filters and interceptors, invokes your controller, serializes your Java object into a JSON byte array with Jackson, writes headers, sets the status code, and sends bytes back out over the wire.

When things go wrong in distributed systems—when timeouts cascade, when proxies rewrite headers, when caches serve stale data, or when security firewalls reject requests—the abstractions strip away. If you understand the wire protocol, you can diagnose any network problem in seconds.

Now that we have covered the purpose of HTTP, let's get into some real wire examples to get you up and running!

---

## 02. How Does an HTTP Message Look on the Wire? (Request & Response Framing)

To demystify HTTP, let's strip away all frameworks, libraries, and browsers. Let's look at raw text transmitted over a TCP socket.

In HTTP/1.1, an HTTP request and an HTTP response are simply plaintext messages formatted with strict delimiter rules. Every line ends with a carriage return and line feed sequence (`\r\n`, commonly written as CRLF).

### The HTTP Request Wire Anatomy

Here is an actual raw HTTP/1.1 request sent by a client wanting to fetch an order:

```http
GET /api/v1/orders/8842 HTTP/1.1
Host: api.store.com
User-Agent: curl/8.4.0
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

```

Notice the four distinct components:

![HTTP Request Wire Anatomy](/images/content/backend-distributed-systems/http/backend-distributed-systems_http_mod-02_lesson-2.1_request-wire-anatomy.svg "HTTP Request Wire Anatomy (Request Line, Headers, CRLF Delimiter, Body)")

Now let's examine an HTTP request that **does** carry a message body (e.g., creating a new customer with `POST`):

```http
POST /api/v1/customers HTTP/1.1
Host: api.store.com
Content-Type: application/json
Content-Length: 68
Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...

{"name":"Alice Smith","email":"alice@example.com","tier":"PLATINUM"}
```

Pay special attention to the empty line separating the headers from the payload. That empty line is not decorative—it is the protocol delimiter. Without it, the receiving parser cannot know where metadata ends and application data begins!

### The HTTP Response Wire Anatomy

When the server receives that `POST` request, it processes the customer creation and sends back an HTTP response message over the same TCP connection:

```http
HTTP/1.1 201 Created
Date: Wed, 11 Nov 2026 13:05:22 GMT
Content-Type: application/json; charset=UTF-8
Content-Length: 94
Location: /api/v1/customers/1029
Set-Cookie: sessionId=a9f82d1c; Path=/; Secure; HttpOnly; SameSite=Strict
X-Trace-Id: 4bf92f3577b34da6a3ce929d0e0e4736

{"id":1029,"name":"Alice Smith","email":"alice@example.com","tier":"PLATINUM","active":true}
```

Let's dissect the response structure:

![HTTP Response Wire Anatomy](/images/content/backend-distributed-systems/http/backend-distributed-systems_http_mod-02_lesson-2.1_response-wire-anatomy.svg "HTTP Response Wire Anatomy (Status Line, Headers, CRLF Delimiter, Body)")

### Seeing the Wire with cURL

You don't need any special packet sniffer to see this in action. Open your terminal and run `curl` with the `-v` (verbose) flag against any public API:

```bash
curl -v https://httpbin.org/get
```

Upon executing this command, you will see output like the following:

```text
* Connected to httpbin.org (54.161.222.85) port 443
* Using HTTP2, server supports multiplexing
> GET /get HTTP/2
> Host: httpbin.org
> User-Agent: curl/8.4.0
> Accept: */*
> 
< HTTP/2 200 
< date: Wed, 11 Nov 2026 13:08:14 GMT
< content-type: application/json
< content-length: 255
< server: gunicorn/19.9.0
< 
{
  "args": {}, 
  "headers": {
    "Accept": "*/*", 
    "Host": "httpbin.org", 
    "User-Agent": "curl/8.4.0"
  }, 
  "origin": "203.0.113.195", 
  "url": "https://httpbin.org/get"
}
```

Notice the lines prefixed with `>`: that is the raw HTTP request sent from your machine.
Notice the lines prefixed with `<`: that is the raw HTTP response returned by the server.

:::callout{type="info" title="What Changed in HTTP/2 and HTTP/3?"}
While HTTP/1.1 transmits messages as plaintext ASCII streams with `\r\n` delimiters, **HTTP/2** (2015) introduced binary framing. Instead of plain text, HTTP/2 splits messages into binary frames (HEADERS frame, DATA frame) and multiplexes multiple concurrent requests over a single TCP connection, eliminating head-of-line blocking at the application layer. **HTTP/3** (2022) replaces TCP with QUIC over UDP, eliminating head-of-line blocking caused by TCP packet loss.

However, the **logical semantics**—methods, status codes, headers, and bodies—are identical across HTTP/1.1, HTTP/2, and HTTP/3! Once you understand the concepts here, they apply across every version of the web.
:::

---

## 03. How Do HTTP Methods Work, and What Makes a Method Safe or Idempotent?

Now that we know what a message looks like on the wire, let's look at the very first word in the request line: the **HTTP Method** (also called the HTTP verb).

HTTP defines a set of request methods to indicate the desired action to be performed on the identified resource. But in distributed systems and REST architecture, methods are not just arbitrary strings: they are governed by strict mathematical and architectural contracts: **Safety** and **Idempotency**.

### Understanding Safe vs. Idempotent Methods

Before we look at the individual methods, let's nail down these two core concepts once and for all:

1. **Safe Method:** An HTTP method is safe if calling it **does not modify server state**. Safe methods are strictly read-only. A client can call a safe method a billion times or zero times, and the database on the server remains untouched.
2. **Idempotent Method:** An HTTP method is idempotent if the side-effects of making $N > 0$ identical requests is the exact same as making a single request. In other words:
   
$$\text{State after } 1 \text{ request} = \text{State after } 100 \text{ identical requests}$$

Note that idempotency applies to the **server state**, not necessarily the return payload.

### The Complete HTTP Method Matrix

| Method | Safe? | Idempotent? | RFC | Typical Use Case in Spring Boot | Can have Request Body? |
| :--- | :---: | :---: | :--- | :--- | :---: |
| **`GET`** | **YES** | **YES** | RFC 9110 | Retrieve resource representation (e.g., fetch user profile) | No (Ignored if present) |
| **`POST`** | **NO** | **NO** | RFC 9110 | Create child resource, submit form, execute non-idempotent action | **YES** |
| **`PUT`** | **NO** | **YES** | RFC 9110 | Completely replace resource, or create at client-specified URI | **YES** |
| **`PATCH`** | **NO** | **NO** * | RFC 5789 | Apply partial delta modification to an existing resource | **YES** |
| **`DELETE`** | **NO** | **YES** | RFC 9110 | Remove the specified resource | Allowed, but rare |
| **`HEAD`** | **YES** | **YES** | RFC 9110 | Identical to GET, but server returns headers only (no body) | No |
| **`OPTIONS`**| **YES** | **YES** | RFC 9110 | Query allowed communication options (used by CORS preflight) | Optional |

*\* Note on PATCH:* While RFC 5789 specifies that PATCH is not guaranteed to be idempotent in the general case (e.g., a patch command that says "increment balance by \$10" is non-idempotent), many REST APIs use JSON Merge Patch (RFC 7396) where fields are set explicitly (e.g., `{"status": "ACTIVE"}`), making those specific operations practically idempotent.

Let's walk through each primary method step-by-step so you understand when and why to use it.

---

### 1. The `GET` Method

Use `GET` when you want to retrieve a representation of a resource without altering anything on the server.

```http
GET /api/v1/products/4921 HTTP/1.1
Host: api.store.com
Accept: application/json
```

**Key Characteristics:**
- **Safe & Idempotent:** Fetching a product description ten times does not change the product description in the database.
- **Cacheable:** Responses to `GET` requests can be cached by browsers, CDNs (Cloudflare, AWS CloudFront), and API gateways.
- **No Request Body:** While technically a TCP packet with a `GET` request *could* include bytes after the empty line, RFC 9110 explicitly warns that request bodies on `GET` have no defined semantic meaning. Proxies, CDNs, and Spring Boot's Tomcat server may reject, drop, or ignore a `GET` body. Pass parameters in query strings (`/products?category=books&page=2`), never in the body.

### 2. The `POST` Method

Use `POST` when you want to create a new subordinate resource under a collection, or execute an operation that causes a side-effect (like charging a credit card or triggering an email).

```http
POST /api/v1/orders HTTP/1.1
Host: api.store.com
Content-Type: application/json

{
  "customerId": 8842,
  "items": [{"productId": 101, "quantity": 2}],
  "paymentMethod": "CARD_VISA_8812"
}
```

**Key Characteristics:**
- **Neither Safe Nor Idempotent:** If you send this `POST` request twice because of a temporary network hiccup, the server will create **two separate orders** and charge the customer's credit card twice unless you implement distributed deduplication (an Idempotency Key)!
- **Creates New URI:** Notice the URI in the request is `/api/v1/orders` (the collection). The server assigns a unique identifier (e.g., order ID `99401`) and returns a `201 Created` with a `Location: /api/v1/orders/99401` header.

### 3. The `PUT` Method

Use `PUT` when you want to **completely replace** an existing resource with a fresh representation, or create a resource when the client specifies the exact target URI.

```http
PUT /api/v1/users/8842 HTTP/1.1
Host: api.store.com
Content-Type: application/json

{
  "firstName": "Robert",
  "lastName": "Martin",
  "email": "unclebob@example.com",
  "bio": "Clean Code evangelist"
}
```

**Key Characteristics:**
- **Idempotent:** If you execute this exact request once, the user record becomes Robert Martin. If a network timeout occurs and your client re-sends this request five times, the user record still becomes Robert Martin. The final server state is identical.
- **Complete Replacement Contract:** This is where many junior engineers make a catastrophic mistake. If you execute a `PUT` request with only `{"bio": "New bio"}`, the server is expected to **replace the entire user record**. Any fields you omitted (like `firstName`, `lastName`, and `email`) should be overwritten with `null` or default values! If you only want to update one or two fields without touching the rest, you must use `PATCH`, not `PUT`.

### 4. The `PATCH` Method

Use `PATCH` when you want to apply **partial modifications** to an existing resource.

```http
PATCH /api/v1/users/8842 HTTP/1.1
Host: api.store.com
Content-Type: application/merge-patch+json

{
  "bio": "Speaker, Author, and Clean Coder."
}
```

**Key Characteristics:**
- Only the attributes present in the payload are updated. Unmentioned fields (`firstName`, `email`) remain untouched in the database.
- Significantly saves network bandwidth when resources have dozens of columns or nested objects.

### 5. The `DELETE` Method

Use `DELETE` when you want to remove an identified resource.

```http
DELETE /api/v1/users/8842 HTTP/1.1
Host: api.store.com
```

**Key Characteristics:**
- **Idempotent:** If you delete user `8842`, the user is gone. If you delete user `8842` again, the user is still gone. 
- *A subtle point about status codes:* The first `DELETE` might return `204 No Content` (or `200 OK`). The second `DELETE` might return `404 Not Found`. Does this violate idempotency? **No!** Idempotency guarantees that the *state of the server* is identical, not that the HTTP response code must be identical. In both cases, user `8842` does not exist on the server.

---

## 04. How Do HTTP Status Codes Communicate Outcome? (The 2xx, 3xx, 4xx, 5xx Taxonomy)

Now that you can send requests and understand safe versus idempotent methods, you'll want to know how the server tells the client what happened. This is done via the **HTTP Status Code**.

An HTTP status code is a three-digit integer placed in the response status line. The first digit defines the **class** of response:

![HTTP Status Code Classification Taxonomy](/images/content/backend-distributed-systems/http/backend-distributed-systems_http_mod-02_lesson-2.1_status-code-taxonomy.svg "HTTP Status Code Classification Taxonomy (1xx to 5xx Specifications)")

Let's dissect each critical status code that every backend engineer must know cold.

---

### 1. The 2xx Class: Success

When your service successfully executes the client's request, choose the exact 2xx code that expresses the semantics of the outcome:

#### `200 OK`
The standard response for successful HTTP requests.
- When used with `GET`: The payload contains the requested resource representation.
- When used with `PUT` or `PATCH`: The payload contains the updated resource representation.

#### `201 Created`
The request has been fulfilled and has resulted in one or more **new resources being created**.
- Standard response for `POST /items`.
- **Golden Rule:** When returning `201 Created`, you **MUST** include a `Location` header containing the absolute or relative URL of the newly created resource (e.g., `Location: /api/v1/orders/99401`).

#### `202 Accepted`
The request has been accepted for processing, but the processing **has not been completed** (and might indeed fail later).
- Essential for asynchronous, event-driven architectures and microservices.
- Example: Submitting a video for transcoding or triggering a batch report generation that takes 10 minutes. Return `202 Accepted` immediately along with a tracking URL (`Location: /api/v1/jobs/job-5501`) so the client does not keep a thread blocked for 10 minutes!

#### `204 No Content`
The server has successfully fulfilled the request and there is **no additional content to send in the response payload**.
- Commonly returned for `DELETE /items/10` or a `PUT`/`PATCH` where the client does not need the returned entity.
- The response message contains headers followed immediately by the terminating empty line—there is strictly zero bytes of body.

---

### 2. The 3xx Class: Redirection

Redirection status codes inform the client that the requested resource is located elsewhere.

#### `301 Moved Permanently`
The requested resource has been assigned a new permanent URI. Any future references to this URI ought to use one of the returned URIs in the `Location` header.
- Browsers and search engine web crawlers cache `301` responses very aggressively.

#### `302 Found` (Formerly "Moved Temporarily")
The target resource resides temporarily under a different URI.
- *Historical quirk:* Many HTTP/1.0 clients incorrectly changed the HTTP method from `POST` to `GET` upon following a `302` redirect.

#### `304 Not Modified`
Informs the client that the resource has not changed since the version specified in the request's conditional headers (`If-None-Match` or `If-Modified-Since`).
- The server does **not** transmit a message body.
- The client serves the resource directly out of its local disk cache. This single status code saves terabytes of bandwidth across the internet every second!

#### `307 Temporary Redirect` & `308 Permanent Redirect`
The modern, unambiguous versions of `302` and `301`.
- RFC 9110 guarantees that the client **MUST NOT** change the HTTP method when redirecting. If a client sent a `POST` with a JSON body to `/v1/checkout`, and the server returns `307` to `/v2/checkout`, the client re-sends the exact same `POST` with the exact same JSON body to the new URL.

---

### 3. The 4xx Class: Client Errors

When a client sends an invalid request, the server must reject it with a 4xx error. Crucially, **4xx errors mean the problem is on the caller's side—the server did not crash.**

#### `400 Bad Request`
The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed JSON syntax, invalid query parameters, or missing required fields).

#### `401 Unauthorized` vs. `403 Forbidden`
This is one of the most frequently confused pairs in API design:

![401 Unauthorized vs. 403 Forbidden Comparison](/images/content/backend-distributed-systems/http/backend-distributed-systems_http_mod-02_lesson-2.1_401-vs-403-comparison.svg "401 Unauthorized (Unauthenticated) vs. 403 Forbidden (Unauthorized)")

#### `404 Not Found`
The origin server did not find a current representation for the target resource, or is not willing to disclose that one exists.

#### `405 Method Not Allowed`
The method received in the request-line is known by the origin server but not supported by the target resource.
- Example: Client sends `POST /users/8842` (when `/users/8842` only supports `GET`, `PUT`, `DELETE`).
- **RFC Requirement:** When returning `405`, the server **MUST** generate an `Allow` header listing the permitted methods:
  ```http
  HTTP/1.1 405 Method Not Allowed
  Allow: GET, PUT, DELETE
  ```

#### `409 Conflict`
The request could not be completed due to a conflict with the current state of the target resource.
- Classic microservices use cases:
  1. Trying to register a user with an email address that is already registered (unique constraint violation).
  2. Optimistic locking failure (two concurrent threads attempt to update version 3 of a row simultaneously).

#### `415 Unsupported Media Type`
The origin server is refusing to service the request because the payload format is in an unsupported format.
- Example: The endpoint expects `Content-Type: application/json`, but the caller sent `Content-Type: application/xml` or `text/plain`.

#### `422 Unprocessable Content` (RFC 9110 / formerly WebDAV)
The server understands the content type of the request payload, and the syntax of the request payload is correct, but it was unable to process the contained instructions.
- Standard status code in Spring Boot for Bean Validation failures (`@Valid`): e.g., the JSON was syntactically perfect, but `age` was negative or `email` was missing an `@` symbol.

#### `429 Too Many Requests` (RFC 6585)
The user has sent too many requests in a given amount of time ("rate limiting").
- Modern APIs include a `Retry-After: 30` header indicating how many seconds the client must wait before retrying.

---

### 4. The 5xx Class: Server Errors

When the server encounters an unexpected condition that prevents it from fulfilling a valid request, it returns a 5xx status code. **5xx errors mean your backend or infrastructure has failed.**

![5xx Server Error Flow](/images/content/backend-distributed-systems/http/backend-distributed-systems_http_mod-02_lesson-2.1_5xx-server-error-flow.svg "5xx Server Error Propagation Topology (Ingress 502/504 vs. Pod 500/503)")

#### `500 Internal Server Error`
A generic error message, given when an unexpected condition was encountered and no more specific message is suitable. In Spring Boot, this occurs when an unhandled `RuntimeException` escapes your controllers.

#### `502 Bad Gateway`
The server, while acting as a gateway or proxy (like NGINX, Kong, AWS ALB, or Envoy), received an **invalid response** from the inbound server it accessed while attempting to fulfill the request.
- *Root Cause in Microservices:* The upstream Spring Boot container crashed (OOMKilled), closed the TCP socket abruptly, or was not running when the proxy routed the connection.

#### `503 Service Unavailable`
The server is currently unable to handle the request due to temporary overloading or maintenance of the server.
- Used in microservices when a circuit breaker (e.g., Resilience4j) trips OPEN, or when a thread pool is completely saturated.

#### `504 Gateway Timeout`
The server, while acting as a gateway or proxy, **did not receive a timely response** from the upstream server.
- *Root Cause in Microservices:* Your Spring Boot service is stuck in a slow SQL query or thread deadlock. The reverse proxy waited for its configured timeout window (e.g., 30 seconds), gave up, closed the connection to the client, and returned `504`.

---

## 05. How Do HTTP Headers Control Metadata, Content Negotiation, and Security?

If methods are the verbs and status codes are the punctuation, **HTTP Headers** are the control plane of the web. 

Headers are case-insensitive key-value pairs formatted as `Name: Value` that allow the client and the server to pass additional metadata about the request, the response, or the payload.

Let's group the most critical headers into five functional categories:

### 1. Representation & Content Negotiation Headers

Content negotiation allows a client and a server to agree upon the data format, character set, and compression algorithm used for the payload.

```text
Client Request:               "I understand JSON or XML, compressed with Gzip"
                              Accept: application/json, application/xml
                              Accept-Encoding: gzip

Server Response:              "Here is JSON, compressed with Gzip"
                              Content-Type: application/json; charset=UTF-8
                              Content-Encoding: gzip
```

- **`Content-Type`**: Indicates the MIME media type of the body being sent.
  - `application/json`: Standard REST payload.
  - `application/x-www-form-urlencoded`: Classic HTML form submission.
  - `multipart/form-data`: Used for file uploads (mix of binary data and text parameters).
- **`Accept`**: Sent by the client to tell the server what media types it can process (e.g., `Accept: application/json`). If the server cannot satisfy this request, it should return `406 Not Acceptable`.
- **`Content-Length`**: The size of the message body in octets (bytes). Crucial for HTTP/1.1 persistent connections so the receiver knows when one message ends and the next begins.
- **`Content-Encoding`**: Specifies any compression applied to the body (e.g., `gzip`, `br` for Brotli).

### 2. Caching & Conditional Request Headers

Caching prevents redundant computations and saves immense network transfer costs.

- **`Cache-Control`**: Directives for caching mechanisms in both requests and responses.
  - `Cache-Control: no-store` → Never cache this response anywhere (mandatory for sensitive banking/PII data).
  - `Cache-Control: no-cache` → You may store the response, but you **must revalidate** with the server before using it.
  - `Cache-Control: max-age=3600, public` → Any intermediary cache or browser can reuse this response for 1 hour without contacting the server.
- **`ETag` (Entity Tag)**: An opaque hash or version token representing the exact contents of a resource (e.g., `ETag: "686897696a7c7"`).
- **`If-None-Match`**: A conditional header sent by the client containing its cached ETag. If the resource hasn't changed, the server returns `304 Not Modified` with an empty body!

![HTTP ETag Conditional Caching Flow](/images/content/backend-distributed-systems/http/backend-distributed-systems_http_mod-02_lesson-2.1_etag-conditional-caching-flow.svg "HTTP Conditional Caching & ETag Revalidation Lifecycle")

### 3. Security & Authentication Headers

- **`Authorization`**: Contains the credentials to authenticate a user agent with a server.
  - `Authorization: Bearer <JWT-or-OAuth2-Token>`
  - `Authorization: Basic <base64(username:password)>`
- **`WWW-Authenticate`**: Sent by the server in a `401 Unauthorized` response to indicate the authentication scheme supported (e.g., `WWW-Authenticate: Bearer realm="Access to API"`).

### 4. Cross-Origin Resource Sharing (CORS) Headers

When a frontend web app running on `https://myfrontend.com` makes an asynchronous fetch call to an API on `https://api.mybackend.com`, modern browsers block the response unless the backend explicitly grants permission using CORS headers:

- **`Origin`**: Sent automatically by the browser indicating where the script originated (e.g., `Origin: https://myfrontend.com`).
- **`Access-Control-Allow-Origin`**: Sent by the server specifying allowed origins (e.g., `Access-Control-Allow-Origin: https://myfrontend.com`).
- **`Access-Control-Allow-Methods`**: Permitted verbs (e.g., `GET, POST, PUT, DELETE`).
- **`Access-Control-Allow-Headers`**: Permitted custom headers (e.g., `Authorization, Content-Type, X-Request-ID`).
- **`Access-Control-Allow-Credentials`**: If set to `true`, tells the browser it may expose the response to the frontend when cookies or authorization headers are included.

### 5. Distributed Tracing & Observability Headers

In a microservices mesh, a single user click might traverse 12 different Spring Boot services. How do you trace a failure across all 12 services?

Using distributed tracing headers:
- **`traceparent` (W3C Trace Context Standard)**:
  `traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`
  - Version (`00`)
  - Trace ID (`4bf92f3577b34da6a3ce929d0e0e4736`) - remains identical across every microservice in the call graph!
  - Parent/Span ID (`00f067aa0ba902b7`) - unique to each individual service hop.
  - Trace Flags (`01` = sampled for logging).
- **`X-Request-ID`**: A UUID generated by the API Gateway and propagated down every service to correlate log files.

---

## 06. How Do Cookies and Session State Work Over a Stateless Protocol?

We established in Section 01 that HTTP is completely stateless. Every request is born an orphan.

So how do web applications remember that you logged in ten minutes ago? The primary mechanism historically built into HTTP is the **HTTP Cookie** (RFC 6265).

### The Cookie Lifecycle

![HTTP Stateful Cookie & Session Lifecycle](/images/content/backend-distributed-systems/http/backend-distributed-systems_http_mod-02_lesson-2.1_cookie-session-lifecycle.svg "Stateful Session Management via HTTP Cookies")

1. **Server issues the cookie:** After verifying credentials, the server adds a `Set-Cookie` header to the HTTP response.
2. **Client stores the cookie:** The browser stores the key-value pair in its local encrypted cookie jar, scoped to the server's domain and path.
3. **Client automatically attaches the cookie:** On every subsequent request matching the domain and path, the browser automatically attaches the `Cookie` header:
   ```http
   Cookie: sid=abc123xyz; theme=dark
   ```

### Anatomy of a Production `Set-Cookie` Header

Here is what a secure, production-grade cookie header looks like:

```http
Set-Cookie: JSESSIONID=9D7A5C22B4; Path=/; Domain=api.company.com; Max-Age=3600; Secure; HttpOnly; SameSite=Strict
```

Let's dissect each directive:

| Attribute | Purpose | Security Impact if Omitted |
| :--- | :--- | :--- |
| **`Path=/`** | Restricts cookie to requests starting with this path. | Defaults to current request path, causing subtle multi-page session bugs. |
| **`Domain=...`** | Restricts cookie to specified host and subdomains. | Defaults to exact host only. |
| **`Max-Age=3600`** | Lifetime in seconds (1 hour). Supersedes legacy `Expires`. | Without `Max-Age` or `Expires`, it becomes a **Session Cookie** that expires when browser is closed. |
| **`Secure`** | Instructs browser to **only transmit over HTTPS**. | Cookie transmitted in plaintext over HTTP, allowing packet sniffers on public Wi-Fi to hijack the session! |
| **`HttpOnly`** | Forbids client-side JavaScript (`document.cookie`) from reading the cookie. | Vulnerable to **XSS (Cross-Site Scripting)** attacks. If an attacker injects a malicious script, they can steal the session token. |
| **`SameSite`** | Controls cross-site cookie transmission to prevent **CSRF (Cross-Site Request Forgery)**. | Default varies by browser; omitting it can leave users open to CSRF attacks. |

### The Three SameSite Policies

![The Three SameSite Cookie Policies](/images/content/backend-distributed-systems/http/backend-distributed-systems_http_mod-02_lesson-2.1_samesite-cookie-policies.svg "RFC 6265bis: SameSite=Strict vs. SameSite=Lax vs. SameSite=None")

### Cookies vs. `Authorization: Bearer <Token>` in Microservices

In modern Spring Boot architectures, you will encounter two primary patterns for passing identity:

```text
Pattern A: Browser-Facing Web Apps (BFF / MVC)
[Browser] ── Cookie: SESSION=xyz (HttpOnly, Secure, SameSite) ──► [Spring Cloud Gateway / BFF]

Pattern B: Internal Microservices Communication
[Gateway] ── Authorization: Bearer eyJhbGciOi... (Stateless JWT) ─► [Order Service] ─► [Payment Service]
```

- **Cookies** shine for browser-to-backend communication because browsers manage them automatically and `HttpOnly` shields tokens from JavaScript XSS attacks.
- **Authorization Headers (JWTs)** shine for service-to-service communication because microservices are not browsers, don't maintain cookie jars, and benefit from stateless cryptographic verification without hitting a centralized session database.

---

## 07. How Do I Put This Together in Spring Boot 3? (REST Controller Cookbook)

Now let's see how all of this theory translates directly into clean, idiomatic Spring Boot 3 code.

Spring Boot 3 (which requires Java 17+ and Spring Framework 6) provides first-class abstractions for every single HTTP concept we just dissected:
- `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, `@PatchMapping`
- `@RequestHeader`, `@CookieValue`, and `ResponseCookie`
- `ResponseEntity<T>` for programmatic status codes and headers
- RFC 9457 `ProblemDetail` for standardized error reporting

Here is a complete, self-contained `@RestController` that demonstrates these patterns in action:

```java title="OrderController.java"
package com.company.store.controller;

import com.company.store.dto.CreateOrderRequest;
import com.company.store.dto.OrderResponse;
import com.company.store.dto.UpdateOrderPatch;
import com.company.store.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // 1. GET: Fetch with Content Negotiation & ETag Caching
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable Long id,
            @RequestHeader(value = HttpHeaders.IF_NONE_MATCH, required = false) String ifNoneMatch) {

        OrderResponse order = orderService.findById(id);
        String currentEtag = "\"" + order.hashCode() + "\"";

        // Conditional GET: 304 Not Modified check
        if (currentEtag.equals(ifNoneMatch)) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();
        }

        return ResponseEntity.ok()
                .eTag(currentEtag)
                .header(HttpHeaders.CACHE_CONTROL, "max-age=60, must-revalidate")
                .body(order);
    }

    // 2. POST: Create Resource, Return 201 Created + Location Header + Secure Cookie
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @RequestHeader(value = "X-Correlation-ID", defaultValue = "UNKNOWN") String correlationId) {

        OrderResponse created = orderService.createOrder(request, correlationId);
        URI location = URI.create("/api/v1/orders/" + created.id());

        // Issue a secure, modern HTTP-only tracking cookie
        ResponseCookie orderTrackingCookie = ResponseCookie.from("last_order_id", String.valueOf(created.id()))
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(Duration.ofDays(7))
                .sameSite("Strict")
                .build();

        return ResponseEntity.created(location)
                .header(HttpHeaders.SET_COOKIE, orderTrackingCookie.toString())
                .body(created);
    }

    // 3. PUT: Complete Replacement (Idempotent)
    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> replaceOrder(
            @PathVariable Long id,
            @Valid @RequestBody CreateOrderRequest request) {

        OrderResponse replaced = orderService.replaceOrder(id, request);
        return ResponseEntity.ok(replaced);
    }

    // 4. PATCH: Partial Update
    @PatchMapping("/{id}")
    public ResponseEntity<OrderResponse> patchOrder(
            @PathVariable Long id,
            @RequestBody UpdateOrderPatch patch) {

        OrderResponse updated = orderService.patchOrder(id, patch);
        return ResponseEntity.ok(updated);
    }

    // 5. DELETE: Remove Resource (Idempotent, 204 No Content)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteById(id);
        return ResponseEntity.noContent().build(); // HTTP 204
    }

    // 6. Reading Cookies & Headers directly
    @GetMapping("/preferences")
    public ResponseEntity<String> readClientContext(
            @CookieValue(name = "last_order_id", defaultValue = "none") String lastOrderId,
            @RequestHeader(HttpHeaders.USER_AGENT) String userAgent) {

        String summary = String.format("Client User-Agent: %s, Last Order: %s", userAgent, lastOrderId);
        return ResponseEntity.ok(summary);
    }
}
```

### Standardized Error Responses with RFC 9457 `ProblemDetail`

In Spring Boot 3, error responses have been standardized following RFC 9457 (Problem Details for HTTP APIs). Rather than returning inconsistent JSON maps, implement a global `@RestControllerAdvice`:

```java title="GlobalExceptionHandler.java"
package com.company.store.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle Resource Not Found -> 404
    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Resource Not Found");
        problem.setType(URI.create("https://api.store.com/errors/not-found"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    // Handle Validation Errors -> 422 Unprocessable Content
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, "Validation failed");
        problem.setTitle("Invalid Request Payload");
        problem.setType(URI.create("https://api.store.com/errors/validation"));
        problem.setProperty("invalidFields", ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .toList());
        return problem;
    }
}
```

When a validation error occurs, Spring Boot 3 automatically outputs an RFC-compliant response:

```http
HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{
  "type": "https://api.store.com/errors/validation",
  "title": "Invalid Request Payload",
  "status": 422,
  "detail": "Validation failed",
  "invalidFields": [
    "email: must be a well-formed email address",
    "items: must not be empty"
  ]
}
```

---

## 08. The Senior Backend Engineer's HTTP & API Design Checklist

Before you ship any REST API to production, run through this battle-tested engineering checklist:

### 1. Guarantee Safe Methods are Strictly Read-Only
Never write endpoints where a `GET` request alters database state (e.g., `GET /users/delete?id=12`). Web crawlers (like Googlebot), browser link pre-fetchers, and caching proxies crawl `GET` links automatically and will unintentionally wipe out your data!

### 2. Implement Idempotency Keys on All Critical `POST` Endpoints
Network timeouts are inevitable in distributed systems. When a mobile client sends `POST /payments` and experiences a socket timeout after 5 seconds, it has no idea whether the request failed before reaching the server or whether the payment succeeded and only the response was lost. 
- Require an `Idempotency-Key: <UUID>` header.
- Store the key in Redis with a short TTL (e.g., 24 hours).
- If a duplicate key arrives, return the cached result of the original execution instead of charging the card again.

### 3. Always Pair `201 Created` with a `Location` Header
When your API creates a resource, never leave the client guessing where the resource lives. Always populate `Location: /api/v1/resources/{id}`.

### 4. Lock Down Your Cookies
Every cookie carrying session identifiers or sensitive claims must have:
- `Secure` (strictly HTTPS)
- `HttpOnly` (inaccessible to JavaScript)
- `SameSite=Lax` or `SameSite=Strict` (CSRF defense)

### 5. Never Blindly Return `200 OK` for Business Errors
A notorious anti-pattern is returning `HTTP 200 OK` with a body like `{"success": false, "error": "User not found"}`. This breaks HTTP caches, causes API monitoring tools (Datadog, Prometheus) to register failed requests as 100% healthy, and forces callers to write custom parsing code. Use the proper HTTP status code (`404`, `409`, `422`, `500`).

### 6. Respect Content Negotiation
Explicitly set `Content-Type: application/json; charset=UTF-8` on your responses and validate that incoming payloads match expected media types. Return `415 Unsupported Media Type` when clients send incompatible encodings.

---

## 09. Summary & Mental Model Review

Let's recap what we have deconstructed:

1. **HTTP is an Application-Layer Protocol:** It runs on top of TCP/IP or QUIC, framing messages using simple delimiters (`\r\n` CRLF) in HTTP/1.1 and binary multiplexed frames in HTTP/2 and HTTP/3.
2. **Safe vs. Idempotent:**
   - **Safe:** Does not modify server state (`GET`, `HEAD`, `OPTIONS`).
   - **Idempotent:** Executing $N > 0$ times leaves the server in the exact same state (`GET`, `PUT`, `DELETE`).
   - **`POST` is neither safe nor idempotent;** handle retries with idempotency keys.
3. **Status Codes Categorize Outcome:**
   - `2xx`: Success (`200 OK`, `201 Created` with `Location`, `202 Accepted` for async, `204 No Content`).
   - `3xx`: Redirection (`301` vs `302`, `304 Not Modified` for caching, `307`/`308` for method preservation).
   - `4xx`: Client errors (`401` unauthenticated vs `403` unauthorized, `404`, `405`, `409` conflict, `422` validation, `429` rate limit).
   - `5xx`: Server/Infrastructure errors (`500` app crash, `502` upstream pod dead, `503` overloaded, `504` proxy timeout).
4. **Headers are the Control Plane:** Use them for content negotiation (`Content-Type`, `Accept`), caching (`Cache-Control`, `ETag`), security (`Authorization`, CORS), and distributed tracing (`traceparent`).
5. **Cookies Bridge Statelessness:** Secure them with `HttpOnly`, `Secure`, and `SameSite` flags.
6. **Spring Boot 3 Unifies It All:** Use `ResponseEntity`, `ResponseCookie`, and RFC 9457 `ProblemDetail` to speak clean, standardized HTTP.

Now, whenever you write a Spring Boot controller, inspect a network trace in DevTools, or configure an API gateway route, you aren't guessing—you can visualize every byte traveling across the wire.
