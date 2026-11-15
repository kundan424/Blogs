---
title: "REST Controllers: @RestController, Path Variables, Request Bodies & Headers"
slug: spring-boot-rest-controllers-path-variables-request-bodies-headers
subject: backend-distributed-systems
abstract: An architectural, first-principles deep dive into building production-grade RESTful APIs in Spring Boot 3. Understand how @RestController coordinates with @ResponseBody to bypass HTML view rendering, master the RFC 9110 HTTP verb contracts (safe vs. idempotent), cleanly separate resource identification (@PathVariable) from retrieval modification (@RequestParam), enforce fail-fast validation on @RequestBody with Java 21 Records, capture protocol metadata with @RequestHeader, and craft deterministic HTTP responses using ResponseEntity and Location headers.
tags:
  - rest-controllers
  - spring-mvc
  - rest-api
  - spring-boot
  - architecture
  - api-design
  - java
published: true
publishDate: Nov 15, 2026
updatedDate: Nov 15, 2026
readTime: 25m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
---

# REST Controllers: @RestController, Path Variables, Request Bodies & Headers

In our previous exploration of [Spring MVC Architecture](/notes/spring-mvc-architecture-dispatcherservlet-handlermappings-httpmessageconverters), we investigated the internal mechanics of the `DispatcherServlet` pipeline: how incoming TCP sockets are parsed, mapped via `HandlerMapping`, executed through `HandlerAdapter`, and serialized via `HttpMessageConverter`.

Now, we shift our focus from the internal plumbing to the **developer-facing API surface**:

> *"How do you design and implement clean, robust, and standards-compliant RESTful APIs in Spring Boot? What are the underlying rules governing `@PathVariable`, `@RequestParam`, `@RequestBody`, and `@RequestHeader`? And why does violating HTTP semantics (such as misusing `PUT` vs. `PATCH` or returning `200 OK` for resource creation) break distributed caching, API gateways, and client resilience?"*

In high-scale backend engineering, controllers are not merely dumping grounds for business logic; they serve as the **formal protocol boundary** of your microservice. A well-architected controller cleanly translates stateless HTTP wire protocols into strongly-typed domain operations, enforces strict validation contracts before business services execute, and emits deterministic status codes.

In this deep dive, we will explore:
1. **The Paradigm Shift**: Deconstructing `@RestController` into `@Controller` and `@ResponseBody`.
2. **The HTTP Verb Taxonomy**: RFC 9110 semantic contracts (Safe vs. Idempotent vs. Non-Idempotent operations).
3. **Resource Addressing**: The architectural boundary separating `@PathVariable` from `@RequestParam`.
4. **Payload Ingress**: Binding and validating `@RequestBody` payloads using Java 21 Records and Jakarta Bean Validation.
5. **Protocol Metadata Ingress**: Extracting authentication tokens, correlation IDs, and idempotency keys with `@RequestHeader`.
6. **Response Engineering**: Mastering `ResponseEntity<T>`, status codes, and the `Location` header contract.
7. **Production Anti-Patterns**: The `PUT` vs. `PATCH` trap, primitive unboxing bugs, and URI naming conventions.

---

## 01. The Paradigm Shift: From `@Controller` to `@RestController`

To understand how modern REST APIs operate in Spring Boot, we must trace how Spring transitioned from traditional server-rendered web applications to headless JSON APIs.

### 1. Traditional MVC: The `@Controller` Model
In classic Spring MVC, classes were annotated with `@Controller`. A controller method's primary job was to prepare a `Model` and return a `String` representing a **View name**:

```
[ Incoming Request ] ──► OrderController.showOrder() ──► Returns "orders/detail"
                                                                │
                                                                ▼
                                                       [ ViewResolver ]
                                                                │
                                                                ▼
                                                    Renders orders/detail.html
```

The returned string `"orders/detail"` was intercepted by a `ViewResolver` (such as Thymeleaf or JSP engine) to locate an HTML file on the classpath, inject model attributes, and render server-side HTML markup to the client browser.

---

### 2. Headless APIs: The `@ResponseBody` Revolution
When distributed systems, Single-Page Applications (React, Vue), and mobile apps emerged, clients no longer wanted HTML pages from the server; they wanted raw **structured data** (JSON or Protocol Buffers).

To achieve this, Spring introduced `@ResponseBody`. When applied to a method, `@ResponseBody` tells the dispatch pipeline:

> *"Do not look for a ViewResolver. Take the returned Java object directly, pass it to the HttpMessageConverter pipeline (Jackson), serialize it into JSON bytes, and write it straight to the HTTP response stream."*

---

### 3. Deconstructing `@RestController`
In Spring Boot, writing `@Controller` and `@ResponseBody` on every single class became tedious. Spring solved this by introducing `@RestController` as a **composite meta-annotation**:

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Controller
@ResponseBody
public @interface RestController {
    @AliasFor(annotation = Controller.class)
    String value() default "";
}
```

When you annotate a class with `@RestController`:
1. It registers the class as a Spring component in the IoC container via `@Controller`.
2. It automatically applies `@ResponseBody` semantics to **every method** in that class.
3. Behind the scenes, `RequestMappingHandlerAdapter` delegates execution to `RequestResponseBodyMethodProcessor`, which bypasses HTML view resolution entirely and writes the serialized payload directly to the client socket.

---

## 02. The HTTP Verb Taxonomy & RFC 9110 Semantics

A primary mark of a senior backend engineer is respecting **RFC 9110 (HTTP Semantics)**. HTTP verbs are not interchangeable labels; they represent formal contracts that infrastructure components (such as API gateways, reverse proxies, and CDN caches) rely upon to manage caching, retries, and connection safety.

```
+---------------------------------------------------------------------------------------------------+
|                                  THE HTTP VERB CONTRACT TAXONOMY                                  |
+---------------------------------------------------------------------------------------------------+
|  HTTP Verb  | Spring Annotation | Primary CRUD Action       | Safe?  | Idempotent? | Cacheable?   |
+-------------+-------------------+---------------------------+--------+-------------+--------------+
|  GET        | @GetMapping       | Read resource state       | YES    | YES         | YES          |
|  POST       | @PostMapping      | Create new resource       | NO     | NO          | Conditional  |
|  PUT        | @PutMapping       | Replace complete resource | NO     | YES         | NO           |
|  PATCH      | @PatchMapping     | Partial resource update   | NO     | NO (varies) | NO           |
|  DELETE     | @DeleteMapping    | Remove resource           | NO     | YES         | NO           |
|  HEAD       | @RequestMapping   | Retrieve headers only     | YES    | YES         | YES          |
|  OPTIONS    | @RequestMapping   | Query allowed verbs (CORS)| YES    | YES         | NO           |
+---------------------------------------------------------------------------------------------------+
```

### Safe vs. Idempotent: The Architectural Difference

Two fundamental properties govern REST semantics:

#### 1. Safe Methods (`GET`, `HEAD`)
An HTTP method is **safe** if calling it produces **no observable side effects** on the server's state. 
- Calling `GET /api/v1/orders/100` must only read state, never modify it.
- Because safe methods do not mutate state, web browsers, API gateways, and web spiders can pre-fetch, cache, and aggressively parallelize them without risk.

#### 2. Idempotent Methods (`GET`, `PUT`, `DELETE`, `HEAD`)
An HTTP method is **idempotent** if executing it **$N$ times consecutively leaves the server in the exact same state as executing it 1 time**:

$$f(f(x)) = f(x)$$

- **`PUT` is idempotent**: If you send `PUT /api/v1/customers/42` with `{ "name": "Alice" }`, executing that request once updates the name to Alice. Executing it 50 times in a row leaves the customer named Alice with the exact same data.
- **`DELETE` is idempotent**: Calling `DELETE /api/v1/orders/99` deletes the order. Calling `DELETE /api/v1/orders/99` a second time still results in the order being absent. (The second response status code may be `404 Not Found`, but the *server state* remains unchanged).
- **`POST` is NOT idempotent**: Sending `POST /api/v1/orders` creates an order. Sending it 5 times creates 5 distinct order records and bills the customer's credit card 5 times!

> [!IMPORTANT]
> Network proxies and service mesh sidecars (like Envoy and Istio) automatically retry failed idempotent requests (`GET`, `PUT`, `DELETE`) on TCP socket resets. If you mistakenly implement a resource-creating operation under `PUT` or `GET`, automated infrastructure retries will corrupt your database with duplicate operations.

---

## 03. Resource Addressing: `@PathVariable` vs. `@RequestParam`

One of the most frequent design decisions in REST API architecture is choosing how clients supply identifiers and query criteria. Spring MVC provides two complementary annotations:

```
URI Anatomy:
https://api.example.com/api/v1/departments/{departmentId}/employees/{employeeId}?status=ACTIVE&page=0
                       └──────────────────┬──────────────────┘ └──────┬──────┘
                                    @PathVariable                   @RequestParam
                            (Identifies the Resource)         (Modifies Retrieval Behavior)
```

---

### 1. `@PathVariable`: Resource Identification
Use `@PathVariable` when a value is part of the **hierarchical identity** of a resource in your domain model:

```java
@GetMapping("/departments/{departmentId}/employees/{employeeId}")
public ResponseEntity<EmployeeResponse> getEmployee(
        @PathVariable("departmentId") Long departmentId,
        @PathVariable("employeeId") UUID employeeId) {
    
    Employee employee = employeeService.find(departmentId, employeeId);
    return ResponseEntity.ok(EmployeeResponse.from(employee));
}
```

#### How Spring Resolves Path Variables:
1. `RequestMappingHandlerMapping` parses the URI template using `PathPatternParser`.
2. The tokens inside curly braces (`{departmentId}`) are captured as URI template variables.
3. `PathVariableMethodArgumentResolver` extracts the token string from the request attributes.
4. Spring's `ConversionService` automatically converts the string into the target Java type (`Long`, `UUID`, `Integer`).

#### Advanced Path Variable Techniques:
- **Regex-Constrained Path Variables**: You can validate path token formats directly in the mapping annotation using regular expressions:
  ```java
  @GetMapping("/orders/{orderNumber:[A-Z]{3}-[0-9]{6}}")
  public OrderResponse getOrderByTrackingCode(@PathVariable String orderNumber) { ... }
  ```
  If a client calls `/orders/abc-123`, the regex fails, and Spring automatically responds with `404 Not Found` without ever invoking your controller.

---

### 2. `@RequestParam`: Query Filtering, Sorting & Pagination
Use `@RequestParam` when a parameter does not identify the entity itself, but instead **modifies how the resource collection is queried, filtered, sorted, or paginated**:

```java
@GetMapping("/orders")
public ResponseEntity<Page<OrderResponse>> listOrders(
        @RequestParam(name = "status", required = false) OrderStatus status,
        @RequestParam(name = "page", defaultValue = "0") int page,
        @RequestParam(name = "size", defaultValue = "20") int size,
        @RequestParam(name = "sort", defaultValue = "createdAt,desc") String sort) {

    Page<Order> orders = orderService.findAll(status, PageRequest.of(page, size));
    return ResponseEntity.ok(orders.map(OrderResponse::from));
}
```

#### Key Capabilities of `@RequestParam`:
- **`required = false`**: Declares that the query parameter is optional. If omitted by the caller, Spring injects `null` (or `Optional<T>`).
- **`defaultValue = "..."`**: Automatically supplies a fallback value when the client omits the parameter. Setting a default automatically implies `required = false`.
- **Collection Binding**: If a client sends multiple query parameters with the same key (`?tag=backend&tag=database`), Spring binds them directly into a `List<String>` or `Set<String>`.
- **Enum Coercion**: Spring's default converters seamlessly map strings to Java Enums (`?status=SHIPPED` → `OrderStatus.SHIPPED`), failing with `MethodArgumentTypeMismatchException` if an invalid enum string is supplied.

---

### Architectural Decision Rule: Path Variable vs. Query Param

| Scenario | Recommended Approach | Example URI |
| :--- | :--- | :--- |
| **Locating a unique resource** | `@PathVariable` | `/api/v1/invoices/INV-98214` |
| **Navigating parent-child sub-resources** | `@PathVariable` | `/api/v1/authors/42/books/7` |
| **Filtering a resource list** | `@RequestParam` | `/api/v1/invoices?status=PAID` |
| **Pagination and sorting offsets** | `@RequestParam` | `/api/v1/invoices?page=2&size=50` |
| **Text search queries** | `@RequestParam` | `/api/v1/articles?q=distributed+systems` |

---

## 04. Payload Ingress: `@RequestBody` & Declarative Validation

When an HTTP client executes a mutating operation (`POST`, `PUT`, `PATCH`), the complex domain data arrives encoded in the HTTP request body (typically as a JSON payload).

Spring MVC uses **`@RequestBody`** to deserialize this raw payload into strongly-typed Java objects.

```
Client JSON Payload               DispatcherServlet                Controller Method
┌───────────────────────┐         ┌────────────────────────┐      ┌───────────────────────────────┐
│ {                     │         │ HttpMessageConverter   │      │ createCustomer(               │
│   "email": "a@b.com", │ ──────► │ (Jackson ObjectMapper) │ ───► │   @Valid @RequestBody         │
│   "age": 28           │         │ Validates & Deserializes│     │   CreateCustomerRequest req)  │
│ }                     │         └────────────────────────┘      └───────────────────────────────┘
└───────────────────────┘
```

### 1. Modern Best Practice: Immutable Java 21 Records
In modern Spring Boot 3 applications, request payloads should always be modeled using **immutable Java Records**. Records provide built-in immutability, compact canonical constructors, and clean integration with Jackson:

```java title="CreateOrderRequest.java"
package com.example.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record CreateOrderRequest(
    @NotNull(message = "Customer ID is required")
    Long customerId,

    @NotEmpty(message = "Order must contain at least one line item")
    @Valid // Cascades validation down to nested line items!
    List<OrderItemRequest> items,

    @NotBlank(message = "Shipping address is mandatory")
    @Size(max = 255, message = "Address cannot exceed 255 characters")
    String shippingAddress
) {
    public record OrderItemRequest(
        @NotBlank String sku,
        @Positive(message = "Quantity must be greater than zero") int quantity,
        @NotNull @DecimalMin("0.01") BigDecimal unitPrice
    ) {}
}
```

---

### 2. Fail-Fast Validation with `@Valid`
Placing **`@Valid`** (from `jakarta.validation`) alongside `@RequestBody` instructs Spring MVC to execute Bean Validation before your controller code runs:

```java
@PostMapping("/api/v1/orders")
public ResponseEntity<OrderResponse> createOrder(
        @Valid @RequestBody CreateOrderRequest request) {

    // If validation fails, execution NEVER reaches this line!
    Order order = orderService.createOrder(request);
    return ResponseEntity.created(URI.create("/api/v1/orders/" + order.getId()))
                         .body(OrderResponse.from(order));
}
```

#### How the Validation Intercept Works:
1. `RequestResponseBodyMethodProcessor` delegates to Jackson to instantiate the record.
2. The validator checks every constraint (`@NotNull`, `@NotBlank`, `@Positive`).
3. If any field constraint fails, Spring halts execution immediately and throws a **`MethodArgumentNotValidException`**.
4. The exception is routed to your global `@RestControllerAdvice` (as explored in Lesson 9.1), returning a standard RFC 9457 `400 Bad Request` error envelope with a list of invalid fields.

This guarantees that domain service methods only ever receive **valid, sanitized, non-null data**.

---

## 05. Protocol Metadata Ingress: The Architecture of HTTP Headers & `@RequestHeader`

While the query string and body carry business data, HTTP headers carry **protocol-level infrastructure metadata**: authentication tokens, tracing IDs, content negotiation rules, caching directives, and idempotency guarantees.

Whether you execute an endpoint call from an API client like **Postman**, a frontend browser, or an inter-service mesh, understanding how headers work at the protocol level is essential for debugging and building resilient backend services.

---

### 1. The Mental Model: The Postal Envelope Metaphor

Think of an HTTP request like sending a physical parcel through a global courier service:

```
┌────────────────────────────────────────────────────────┐
│                   THE HTTP ENVELOPE                    │
│                                                        │
│  TO: api.example.com/v1/orders          [Request Line] │
│  FROM: Client (Postman)                                │
│  AUTH: Bearer eyJhbGciOi...             [Headers]      │
│  CONTENT-TYPE: application/json         [Headers]      │
│  TRACE-ID: 7b8f-412e-990a               [Headers]      │
│  IDEMPOTENCY-KEY: ord_98412_a1b2        [Headers]      │
│                                                        │
├────────────────────────────────────────────────────────┤
│                   THE PARCEL CONTENTS                  │
│                                                        │
│  { "customer_id": 1001, "sku": "KB-90" }[Body/Payload] │
│                                                        │
└────────────────────────────────────────────────────────┘
```

- **The Body (Payload)**: The actual goods inside the parcel (your business data: user details, order cart items, binary image bytes).
- **The Headers (Metadata)**: The shipping label on the outside of the box (delivery destination, courier handling instructions, security stamps, customs declarations, and content manifests).

Just as a courier inspects the **shipping label** before opening the parcel, a web server (Nginx, Tomcat, API Gateway) inspects HTTP headers *before* parsing the message body.

---

### 2. The Wire Frame Architecture (How Postman & Servers Transmit Headers)

At the networking layer, HTTP/1.1 is an ASCII text-based protocol operating directly over a raw TCP socket. When you click **Send** in Postman, Postman formats your request into a strict binary byte sequence defined by **RFC 9112**:

```
+-------------------------------------------------------------------------------+
|                        HTTP/1.1 RAW WIRE TRANSMISSION                         |
+-------------------------------------------------------------------------------+
|                                                                               |
|  POST /api/v1/orders HTTP/1.1                <-- 1. REQUEST LINE              |
|  Host: api.example.com                       <-- 2. HEADERS (Key-Value pairs) |
|  Authorization: Bearer eyJhbGciOi...         <--    Each line ends in CRLF    |
|  Content-Type: application/json              <--    (\r\n)                    |
|  Accept: application/json                    <--                              |
|  User-Agent: PostmanRuntime/7.43.0           <--                              |
|  Content-Length: 48                          <--                              |
|  \r\n                                        <-- 3. EMPTY LINE (Boundary)     |
|  {"customer_id": 1001, "item_sku": "KB-90"}  <-- 4. MESSAGE BODY (Payload)   |
|                                                                               |
+-------------------------------------------------------------------------------+
```

#### How the Server Processes This Stream:
1. **Zero-Payload Header Parsing**: The container worker thread reads byte lines from the TCP buffer until it encounters the **double carriage return and line feed (`\r\n\r\n`)**. This empty line marks the strict architectural boundary between headers and body.
2. **Early Fail-Fast Gatekeeping**: The server evaluates security tokens and routing rules *before* allocating heap memory to read the body. If the `Authorization` header is invalid, Nginx or Spring Security drops the connection immediately with `401 Unauthorized`, saving database and memory resources.
3. **Payload Stream Sizing**: The `Content-Length` header informs the socket reader exactly how many bytes to pull from the network buffer before terminating the input stream.

---

### 3. The 6 Core Pillars: Why Headers Are Used

Headers separate **transport control** from **domain business data** across six architectural categories:

| Pillar | Key Headers | Architectural Purpose |
| :--- | :--- | :--- |
| **1. Content Negotiation** | `Content-Type`, `Accept` | Informs the server how to parse incoming bytes, and specifies the format the client expects in return. |
| **2. Authentication & Identity** | `Authorization`, `X-API-Key`, `Cookie` | Carries zero-trust credentials (JWTs, OAuth2 access tokens, API keys). |
| **3. Routing & Transport** | `Host`, `Content-Length`, `Connection` | Guides reverse proxies (Nginx, AWS ALB) on which virtual host and port to route the raw TCP socket to. |
| **4. Caching & Performance** | `Cache-Control`, `If-None-Match`, `ETag` | Prevents redundant database hits by allowing clients and CDNs to reuse cached responses (`304 Not Modified`). |
| **5. Distributed Tracing** | `X-Correlation-ID`, `traceparent` | Propagates transaction trace IDs across microservices for unified logging (SLF4J MDC, OpenTelemetry). |
| **6. Resilience & Safety** | `Idempotency-Key`, `If-Match` | Prevents duplicate billing charges on automated network retries and prevents lost updates during concurrent edits. |

---

### 4. Concrete Failure Modes: What Happens When Headers Are Missing?

If you omit or misconfigure headers when executing calls in Postman, the server will either fail fast, reject the request, or trigger silent data corruption:

#### Scenario A: Missing `Content-Type: application/json` on a `POST` or `PUT`
- **What happens on the wire**: You provide a JSON body in Postman, but omit the `Content-Type` header.
- **Server behavior**: The server defaults to `application/octet-stream` or `text/plain`. When Spring MVC queries `HttpMessageConverter.canRead()`, Jackson refuses to deserialize the stream.
- **The Result**: **`415 Unsupported Media Type`** *(or `HttpMessageNotReadableException: Required request body is missing`)*.

#### Scenario B: Missing `Authorization` Header
- **What happens on the wire**: A call to a secured endpoint lacks `Authorization: Bearer <token>`.
- **Server behavior**: Spring Security's `SecurityFilterChain` inspects the request before `DispatcherServlet` executes. Since the token is missing, execution halts immediately.
- **The Result**: **`401 Unauthorized`**.

#### Scenario C: Missing `Host` Header
- **What happens on the wire**: Multiple microservices and virtual domains share the same public IP behind an Nginx reverse proxy or Cloudflare edge.
- **Server behavior**: RFC 9112 strictly mandates that every HTTP/1.1 request must specify a `Host` header. Without it, the reverse proxy has no routing target.
- **The Result**: **`400 Bad Request`** *(connection dropped by Nginx/ALB before reaching the application)*.

#### Scenario D: Missing `Accept` Header with Strict Negotiation
- **What happens on the wire**: An API endpoint requires explicit vendor-versioned media types (e.g., `Accept: application/vnd.company.v2+json`), but the client omits the header.
- **Server behavior**: Spring MVC cannot find a converter whose `canWrite()` matches the client's criteria.
- **The Result**: **`406 Not Acceptable`**.

#### Scenario E: Missing `Idempotency-Key` on Mutating Payment APIs
- **What happens on the wire**: An engineer triggers `POST /api/v1/charges` in Postman. Due to a momentary network hiccup, Postman times out. The engineer clicks **Send** again.
- **Server behavior**: Without a unique `Idempotency-Key` header, the server cannot recognize that both calls represent the identical transaction. It executes payment processing twice.
- **The Result**: **Duplicate Billing / Silent Data Corruption**.

#### Scenario F: Missing `User-Agent`
- **What happens on the wire**: A client or automated script strips the `User-Agent` header.
- **Server behavior**: Web Application Firewalls (Cloudflare, AWS WAF) inspect incoming headers for bot detection. Scrapers and exploit bots frequently omit `User-Agent`.
- **The Result**: **`403 Forbidden`** *(Request blocked at edge WAF)*.

---

### 5. Behind the Scenes in Postman: Hidden Auto-Headers

When you open Postman, the **Headers** tab may appear empty, but Postman is actively protecting your request by injecting standard protocol headers automatically.

If you click the **"Hidden (x)"** toggle in Postman's Headers tab, you will see the auto-generated headers:

```
┌────────────────────────────────────────────────────────────────────────┐
│ POSTMAN AUTO-GENERATED HEADERS (Revealed under "hidden")               │
├───────────────────────┬────────────────────────────────────────────────┤
│ Host                  │ Calculated automatically from your target URL  │
│ User-Agent            │ PostmanRuntime/7.43.0                          │
│ Accept                │ */* (Accepts any MIME format)                  │
│ Accept-Encoding       │ gzip, deflate, br (Enables compressed replies) │
│ Connection            │ keep-alive (Reuses TCP socket for speed)       │
│ Postman-Token         │ UUID (Unique tracking token for Postman)       │
│ Content-Length        │ Calculated automatically from Body byte count  │
└───────────────────────┴────────────────────────────────────────────────┘
```

> [!TIP]
> To inspect the **exact raw bytes and headers** sent over the TCP socket, open the **Postman Console** (`Ctrl+Alt+C` on Windows, `Cmd+Alt+C` on Mac) before clicking **Send**. Click on the sent network call and expand **Request Headers**.

---

### 6. Spring Boot Ingress: Binding Headers with `@RequestHeader`

Now that we understand the protocol architecture, how do we capture these headers inside our Spring Boot controllers? Spring MVC provides the **`@RequestHeader`** annotation:

#### A. Binding Specific Named Headers
You can inject specific headers directly into method arguments:

```java
@PostMapping("/api/v1/payments")
public ResponseEntity<PaymentResponse> processPayment(
        @RequestHeader("Idempotency-Key") String idempotencyKey,
        @RequestHeader(name = "X-Correlation-ID", required = false) String correlationId,
        @Valid @RequestBody PaymentRequest request) {

    PaymentResult result = paymentService.charge(idempotencyKey, request);
    return ResponseEntity.ok(PaymentResponse.from(result));
}
```

- **`required = true` (Default)**: If the client calls the endpoint without the `Idempotency-Key` header, Spring MVC aborts the request automatically and returns `400 Bad Request: Missing request header`.
- **`required = false`**: Marks optional metadata. If the header is missing, Spring injects `null`.

#### B. Capturing All Headers via `HttpHeaders`
When building API gateways, webhooks, or audit proxies where header names are dynamic or unknown at compile time, inject Spring's `HttpHeaders` wrapper:

```java
@PostMapping("/api/v1/webhooks/stripe")
public ResponseEntity<Void> handleWebhook(
        @RequestHeader HttpHeaders headers,
        @RequestBody String rawPayload) {

    String signature = headers.getFirst("Stripe-Signature");
    webhookVerifier.verify(rawPayload, signature);
    return ResponseEntity.noContent().build();
}
```

---

## 06. Response Engineering: `ResponseEntity<T>` & Status Codes

In REST design, the HTTP response status code is a core communication channel. Returning a plain Java object from a `@RestController` defaults to HTTP `200 OK`. However, returning `200 OK` for every situation violates HTTP semantics:
- Creating a resource must return **`201 Created`** and provide a `Location` header.
- Deleting a resource must return **`204 No Content`**.
- Asynchronous tasks must return **`202 Accepted`**.

To control the complete HTTP response envelope—status code, response headers, and body—Spring provides **`ResponseEntity<T>`**.

```
                           ResponseEntity<T> Anatomy
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │  HTTP/1.1 201 Created                                    <-- Status Code    │
 │  Location: https://api.example.com/api/v1/orders/ORD-91  <-- Response Header│
 │  Content-Type: application/json                          <-- Response Header│
 │                                                                             │
 │  {                                                       <-- Body (JSON)    │
 │    "order_id": "ORD-91",                                                    │
 │    "status": "CREATED"                                                      │
 │  }                                                                          │
 └─────────────────────────────────────────────────────────────────────────────┘
```

### 1. Fluent Response Builders in Action
`ResponseEntity` provides a fluent, type-safe builder API:

```java
// 1. Returning 200 OK with payload
return ResponseEntity.ok(orderResponse);

// 2. Returning 201 Created with Location Header
URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}")
        .buildAndExpand(order.getId())
        .toUri();
return ResponseEntity.created(location).body(orderResponse);

// 3. Returning 204 No Content (No body)
return ResponseEntity.noContent().build();

// 4. Returning 202 Accepted (Background async job)
return ResponseEntity.accepted().body(new JobStatusResponse(jobId, "PROCESSING"));

// 5. Returning Custom Cache Headers
return ResponseEntity.ok()
        .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS).cachePublic())
        .eTag(order.getVersion().toString())
        .body(orderResponse);
```

---

## 07. Comprehensive Walkthrough: Production Order Management API

Let us synthesize all concepts—`@RestController`, `@PathVariable`, `@RequestParam`, `@RequestBody`, `@RequestHeader`, and `ResponseEntity`—into a cohesive, production-ready REST controller:

```java title="OrderManagementController.java"
package com.example.controller;

import com.example.dto.*;
import com.example.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderManagementController {

    private final OrderService orderService;

    public OrderManagementController(OrderService orderService) {
        this.orderService = orderService;
    }

    // 1. CREATE: POST with @RequestBody, @Valid, @RequestHeader, and 201 Created
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody CreateOrderRequest request) {

        OrderResponse created = orderService.createOrder(idempotencyKey, request);

        // Build canonical Location URI: /api/v1/orders/{id}
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.orderId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    // 2. READ ONE: GET with @PathVariable
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID orderId) {
        OrderResponse order = orderService.findById(orderId);
        return ResponseEntity.ok(order);
    }

    // 3. READ LIST: GET with filtering & pagination via @RequestParam
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> listOrders(
            @RequestParam(required = false) OrderStatus status,
            Pageable pageable) {

        Page<OrderResponse> orders = orderService.findAll(status, pageable);
        return ResponseEntity.ok(orders);
    }

    // 4. FULL UPDATE: PUT with @PathVariable & @RequestBody
    @PutMapping("/{orderId}")
    public ResponseEntity<OrderResponse> replaceOrder(
            @PathVariable UUID orderId,
            @Valid @RequestBody UpdateOrderRequest request) {

        OrderResponse updated = orderService.replace(orderId, request);
        return ResponseEntity.ok(updated);
    }

    // 5. DELETE: DELETE with @PathVariable & 204 No Content
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancelOrder(@PathVariable UUID orderId) {
        orderService.cancel(orderId);
        return ResponseEntity.noContent().build();
    }
}
```

Notice the elegance of this controller:
- It acts strictly as an HTTP protocol gateway.
- It delegates all business rules to `orderService`.
- It adheres strictly to RFC 9110 status codes and idempotency invariants.

---

## 08. Architectural Pitfalls & Production Best Practices

### 1. The `PUT` vs. `PATCH` Trap
One of the most pervasive API design bugs in enterprise software is treating `PUT` as a partial update.

- **`PUT` means Total Replacement**: The client sends the *complete* resource representation. Any field omitted in the incoming payload must be set to `null` or its default value in the database.
- **`PATCH` means Partial Modification**: The client sends only the specific delta fields to modify (e.g., updating only `shippingAddress` without touching line items).

If you use `PUT` for partial updates, you create race conditions and data loss when two clients concurrently update different fields of the same entity.

---

### 2. The Primitive Unboxing Pitfall
When declaring parameters in `@PathVariable` or `@RequestParam`, **always use boxed objects (`Long`, `Integer`, `Boolean`) instead of primitive types (`long`, `int`, `boolean`)**:

```java
// ❌ WRONG: If client omits ?discount=, Spring tries to cast null to double -> NullPointerException!
@GetMapping("/quote")
public QuoteResponse getQuote(@RequestParam double discount) { ... }

// ✅ CORRECT: Boxed type allows null representation, or supply an explicit default
@GetMapping("/quote")
public QuoteResponse getQuote(@RequestParam(defaultValue = "0.0") Double discount) { ... }
```

If a client omits a parameter bound to a primitive `int` without a default value, Spring attempts to inject `null` into an unboxed primitive, triggering an internal `IllegalStateException` before method execution.

---

### 3. URI Design: Nouns, Not Verbs
REST URIs should model **resources (nouns)**, while the HTTP method provides the **action (verb)**:

- ❌ `/api/v1/createOrder` → Violates REST (Verb in URI)
- ❌ `/api/v1/deleteOrderById?id=10` → Violates REST (Verb in URI, ID in query)
- ❌ `/api/v1/getAllOrders` → Violates REST
- ✅ `POST /api/v1/orders` → Idiomatic REST
- ✅ `GET /api/v1/orders/10` → Idiomatic REST
- ✅ `DELETE /api/v1/orders/10` → Idiomatic REST

---

## 09. Authoritative References & Further Reading

For deeper study and official architectural specifications, explore these standard documentation links:

- [Spring Framework Official Documentation: Annotated Controllers](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html)  
  *Comprehensive guide to @RestController, @PathVariable, @RequestParam, and argument binding.*
- [Spring Framework Official Documentation: HandlerMethod Argument Resolvers](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-config/custom-argument-resolvers.html)  
  *Detailed specification of method parameter extraction and resolution mechanics.*
- [IETF RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110)  
  *The international standard specification defining Safe, Idempotent, and Cacheable HTTP verbs.*
- [Jakarta Bean Validation Official Specification](https://jakarta.ee/specifications/bean-validation/)  
  *Authoritative reference on declarative validation annotations (@Valid, @NotNull, @Size).*
- [Spring Boot Official Documentation: Building RESTful Web Services](https://docs.spring.io/spring-boot/reference/web/servlet.html#web.servlet.spring-mvc)  
  *Official Spring Boot reference on web starter configurations and JSON mapping defaults.*
