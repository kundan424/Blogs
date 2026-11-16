---
title: "Strict Layered Architecture: Controller, Service & Repository Isolation"
slug: spring-boot-strict-layered-architecture-controller-service-repository-isolation
subject: backend-distributed-systems
abstract: An architectural, mentor-led guide to mastering multi-tier layered architecture in Spring Boot 3. Understand the separation of concerns across Web (@RestController), Service (@Service), and Persistence (@Repository) tiers, enforce directional dependency invariants, avoid the catastrophic 'skip-a-layer' anti-pattern where controllers query databases directly, and decouple circular bean dependencies using Spring Domain Events and the Mediator pattern.
tags:
  - layered-architecture
  - spring-boot
  - clean-architecture
  - dependency-inversion
  - software-design
  - java
published: true
publishDate: Nov 16, 2026
updatedDate: Nov 16, 2026
readTime: 22m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
---

# Strict Layered Architecture: Controller, Service & Repository Isolation

In our journey through [Building RESTful APIs with Spring MVC](/notes/spring-boot-rest-controllers-path-variables-request-bodies-headers) and [Global Exception Handling](/notes/spring-boot-centralized-exception-handling-restcontrolleradvice-exceptionhandler-responseentityexceptionhandler), we examined how HTTP requests ingress through controllers and how errors are formatted into standard RFC 9457 payloads.

Now, we step back from individual endpoints to address the fundamental structural blueprint of enterprise software:

> *"How do we organize thousands of lines of backend code so that user interface changes, business rule updates, and database migrations do not collapse the system like a house of cards? Why must controllers never execute database queries directly? And how do we permanently eliminate the dreaded circular dependency error in Spring Boot?"*

```
+-----------------------------------------------------------------------------------------+
|                  THE CORE PRINCIPLES OF STRICT LAYERED ARCHITECTURE                    |
+-----------------------------------------------------------------------------------------+
|  1. SINGLE RESPONSIBILITY : Each layer has exactly one reason to change                |
|  2. DIRECTIONAL INVARIANT : Dependencies flow strictly downward (Web -> Service -> DB)  |
|  3. ISOLATION OF CONCERNS : Web never touches SQL; Service never touches HTTP           |
|  4. EVENT DECOUPLING      : Circular flows are decoupled using Spring Domain Events     |
+-----------------------------------------------------------------------------------------+
```

---

## 01. First Principles: Why Multi-Tier Layering Exists

### What Is Layered Architecture?

In plain words: **Layered Architecture** is an architectural pattern that organizes a software system into distinct horizontal tiers, where each tier possesses a specific responsibility and communicates only with adjacent tiers.

To understand why layering is essential, consider the alternative: the **Big Ball of Mud** (or Spaghetti Codebase).

In an unlayered application, a single class handles everything:
1. It reads HTTP request headers and parses JSON strings.
2. It validates credit card formats.
3. It opens raw JDBC database connections and issues SQL `SELECT` queries.
4. It calculates local sales taxes and checks inventory rules.
5. It formats an HTML or JSON string and writes bytes back to the TCP socket.

When business requirements change—such as migrating from PostgreSQL to MongoDB, or replacing an HTTP endpoint with a Kafka message consumer—the entire class must be rewritten, introducing bugs across unrelated features.

---

### The Corporate Headquarters Analogy

To build an intuitive mental model, compare a backend application to an **international corporate headquarters**:

- **The Web Tier is the Front Desk Receptionist**:  
  The receptionist greets external visitors, checks security badges, validates visitor check-in forms, and routes guests to the proper department. The receptionist **never** opens the financial vault, recalculates executive salaries, or writes database ledger records.
- **The Service Tier is the Executive Operations Management**:  
  Managers enforce company policies, verify financial balances, approve contracts, coordinate multiple departments, and make business decisions. Management does not care whether a visitor arrived via taxi, bicycle, or helicopter (HTTP, Kafka, or CLI); they only care about executing the business workflow.
- **The Persistence Tier is the Secure Underground Archive**:  
  Archivists organize filing cabinets, retrieve folders by document ID, and enforce physical storage integrity. Archivists do not make business decisions; they strictly store and retrieve data as instructed by management.

```
+----------------------------------------------------------------------------------------------------+
|                         THE 3-TIER ENTERPRISE ARCHITECTURAL TOPOLOGY                               |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   EXTERNAL CALLERS (Browsers, Mobile Apps, Microservices, Kafka Events)                            |
|           │                                                                                        |
|           ▼                                                                                        |
|   +────────────────────────────────────────────────────────────────────────────────────────────+   |
|   | 1. WEB TIER: Protocol Boundary (@RestController, Interceptors, Filters)                    |   |
|   |    - Parses HTTP headers, query params, path variables, and JSON bodies                    |   |
|   |    - Enforces declarative syntax validation (@Valid)                                       |   |
|   |    - Emits HTTP status codes (201 Created, 204 No Content) and Location headers            |   |
|   +──────────────────────────────────────────────┬─────────────────────────────────────────────+   |
|                                                  │ (Calls Service Methods via DTOs)                |
|                                                  ▼                                                 |
|   +────────────────────────────────────────────────────────────────────────────────────────────+   |
|   | 2. SERVICE TIER: Business Engine (@Service, @Transactional, Security)                      |   |
|   |    - Orchestrates domain business rules and entity state transitions                       |   |
|   |    - Defines transactional boundaries (Atomicity, Rollback on failure)                     |   |
|   |    - Coordinates multiple repositories and calls external payment/notification gateways    |   |
|   +──────────────────────────────────────────────┬─────────────────────────────────────────────+   |
|                                                  │ (Queries Database via Entities)                 |
|                                                  ▼                                                 |
|   +────────────────────────────────────────────────────────────────────────────────────────────+   |
|   | 3. PERSISTENCE TIER: Storage Abstraction (@Repository, Spring Data JPA)                    |   |
|   |    - Maps relational database tables or documents into entity objects                      |   |
|   |    - Translates domain criteria into optimized SQL queries                                 |   |
|   |    - Handles database indexing, pagination, and sorting                                    |   |
|   +──────────────────────────────────────────────┬─────────────────────────────────────────────+   |
|                                                  │ (TCP Socket Queries)                            |
|                                                  ▼                                                 |
|   PHYSICAL STORAGE (PostgreSQL, MySQL, Redis, MongoDB)                                             |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

## 02. Deconstructing the Responsibilities of Each Tier

To keep an application maintainable, every layer must have a strictly defined contract.

---

### Tier 1: The Web Tier (`@RestController`)

The Web Tier is the **protocol adapter**. Its sole responsibility is to bridge the gap between external network protocols (HTTP, REST, JSON) and internal Java application calls.

#### What the Web Tier Owns:
- **Routing**: Mapping HTTP verbs and URL patterns to Java methods (`@GetMapping`, `@PostMapping`).
- **Input Deserialization & Syntax Validation**: Transforming JSON byte streams into typed Java records and triggering Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Min`).
- **Response Formatting**: Setting HTTP status codes (`201 Created`), protocol headers (`Location`, `ETag`, `Cache-Control`), and wrapping data in enterprise envelopes.

#### What the Web Tier Must NEVER Do:
- Never execute business calculations (e.g., calculating interest rates or discount codes).
- Never interact with the database directly (never inject or call a `@Repository`).
- Never manage transactions (never use `@Transactional` on a controller method).

---

### Tier 2: The Service Tier (`@Service`)

The Service Tier is the **heart of the application**. It models the business workflows of the enterprise.

#### What the Service Tier Owns:
- **Business Invariant Enforcement**: Verifying rules that require business logic (e.g., "A customer cannot transfer more than their available balance" or "An order cannot be cancelled once shipped").
- **Transaction Demarcation**: Declaring atomic units of work using **`@Transactional`** to ensure that all database operations succeed together or roll back on failure.
- **Orchestration**: Coordinating multiple repositories, calling external microservices (e.g., Stripe, SendGrid), and publishing domain events.

#### What the Service Tier Must NEVER Do:
- Never import classes from `jakarta.servlet.http.*` (such as `HttpServletRequest` or `HttpServletResponse`).
- Never reference HTTP status codes (`HttpStatus.NOT_FOUND`).
- Never accept or return web-specific JSON annotations.

---

### Tier 3: The Persistence Tier (`@Repository`)

The Persistence Tier is the **data access abstraction**. It provides an object-oriented view of the database.

#### What the Persistence Tier Owns:
- **Query Execution**: Translating method calls into SQL, JPQL, or native database queries.
- **Data Pagination & Sorting**: Executing `Pageable` and `Sort` queries against indexed columns.
- **Entity Hydration**: Reading relational row sets and instantiating domain entities.

#### What the Persistence Tier Must NEVER Do:
- Never enforce business rules (e.g., verifying customer age or credit limits).
- Never invoke external network services (such as sending emails or calling payment APIs).

---

## 03. The Directional Dependency Invariant (The Downward Rule)

### What Is the Downward Rule?

In a layered architecture, **dependencies must strictly flow downward**:
- The Web Tier depends on the Service Tier.
- The Service Tier depends on the Persistence Tier.
- The Persistence Tier depends on the Database.

**A layer must never depend on a layer above it.**

---

### The "Skip-a-Layer" Anti-Pattern: Controller Querying Repository Directly

A frequent mistake made by junior developers is bypassing the Service layer for simple read operations:

> *"This endpoint only retrieves a list of products. Why should I write a service method that just forwards the call to the repository? It's faster to inject the Repository directly into the Controller!"*

#### What the Anti-Pattern Looks Like:
Below, the controller injects `ProductRepository` directly, skipping the service tier entirely.

```java
// ANTI-PATTERN: Controller calls Repository directly!
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductRepository productRepository; // DANGEROUS!

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable UUID id) {
        // Bypasses Service layer completely
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
```

---

### Why Skipping the Service Layer Destroys Enterprise Applications

While skipping the service layer seems harmless for a one-line query, it introduces catastrophic architectural debt:

1. **Bypasses Transaction Boundaries**:  
   Spring's `@Transactional` annotation belongs on the service layer. When a controller invokes a repository directly, there is no active transactional context. If the entity has lazy-loaded relationships (`@OneToMany`), accessing them in the controller throws `LazyInitializationException` (as we diagnosed in Lesson 11.2).
2. **Bypasses Security & Authorization Checks**:  
   In enterprise systems, method-level security (`@PreAuthorize("hasRole('MANAGER')")`) and tenant isolation checks are enforced at the service boundary. Direct repository access circumvents these security filters, exposing unauthorized data.
3. **Bypasses Auditing & Caching**:  
   If the business later requires caching product lookups with `@Cacheable("products")` or logging audit records in an `AuditLogService`, you are forced to refactor every single controller endpoint that bypassed the service layer.
4. **Tight Web-to-Database Coupling**:  
   If you migrate the product catalog from JPA to an Elasticsearch index, your web controller breaks because it is hard-coupled to a relational repository.

---

### The Correct Implementation: Preserving the Service Boundary

#### What We Are Doing in the Below Code:
We maintain strict layer isolation:
1. `ProductController` communicates exclusively with `ProductService`, dealing only with clean request and response DTOs.
2. `ProductService` demarcates the transaction boundary (`@Transactional(readOnly = true)`) and calls `ProductRepository`.
3. `ProductRepository` remains isolated inside the persistence tier.

```java
// 1. THE WEB TIER: Only talks to ProductService
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable UUID id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(response);
    }
}
```

```java
// 2. THE SERVICE TIER: Manages transactions and talks to ProductRepository
@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID id) {
        return productRepository.findById(id)
                .map(ProductResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }
}
```

```java
// 3. THE PERSISTENCE TIER: Interacts strictly with the database
@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {
    // Pure data access
}
```

---

## 04. The Upward Pollution Anti-Pattern: Leaking Web Concerns Downward

Just as layers must not skip downward, **lower layers must never be polluted with concerns from upper layers**.

### What Is Upward Pollution?

Upward pollution occurs when a developer passes web-specific objects—such as `HttpServletRequest`, `HttpSession`, `Principal`, or `HttpHeaders`—into service or repository methods.

#### What the Anti-Pattern Looks Like:
Below, the service method accepts a raw `HttpServletRequest` to extract an IP address or an authorization token.

```java
// ANTI-PATTERN: Service method coupled to Java Servlet API
@Service
public class PaymentService {

    // LEAK: Importing jakarta.servlet.http.HttpServletRequest into core business logic!
    public PaymentResult processPayment(PaymentRequest request, HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");
        // ...
    }
}
```

---

### Why Leaking Web Objects Ruins Portability

If `PaymentService` requires an `HttpServletRequest`:
1. **Destroys Alternative Triggers**: You can never invoke `processPayment()` from a background batch job (`@Scheduled`), a Kafka message consumer, a WebSocket handler, or a CLI command because **there is no HTTP request in those environments**.
2. **Breaks Unit Testing**: To test `PaymentService` in JUnit, you cannot simply pass a string. You are forced to mock complex Servlet interfaces (`MockHttpServletRequest`), slowing down your test suite.

#### The Correct Fix: Extract Primitives at the Controller Boundary
The controller must unpack web-specific objects into plain Java primitives before calling the service:

```java
// CONTROLLER: Extracts web metadata and passes clean domain primitives
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> pay(
            @Valid @RequestBody PaymentRequest request,
            HttpServletRequest servletRequest) {

        // Unpack web concerns into clean domain values
        String clientIp = servletRequest.getRemoteAddr();
        
        PaymentResult result = paymentService.processPayment(request, clientIp);
        return ResponseEntity.ok(PaymentResponse.from(result));
    }
}
```

---

## 05. Circular Bean Dependencies: The Architectural Gordian Knot

### What Is a Circular Dependency?

In plain words: A **Circular Dependency** occurs when Class A requires Class B to be instantiated, but Class B requires Class A to be instantiated.

```
+───────────────────────────+
|                           ▼
|   [ OrderService ] ───► requires ───► [ CustomerService ]
|         ▲                                    │
|         └─────────────── requires ───────────┘
```

Consider this real-world scenario:
- `OrderService` needs `CustomerService` to update customer loyalty points when an order completes.
- `CustomerService` needs `OrderService` to calculate a customer's lifetime order spend when evaluating VIP status.

When Spring starts up, it attempts to construct `OrderService`. It sees a constructor argument for `CustomerService`, so it halts and attempts to construct `CustomerService`. But `CustomerService` demands `OrderService`! 

The JVM enters an impossible loop, and Spring aborts with a fatal startup error:

```text
***************************
APPLICATION FAILED TO START
***************************
Description:
The dependencies of some of the beans in the application form a cycle:
┌─────┐
|  orderService (field private final com.store.customer.service.CustomerService)
↑     ↓
|  customerService (field private final com.store.order.service.OrderService)
└─────┘
```

---

### Spring Boot 2.6+ Circular Dependency Ban

Historically, Spring allowed circular dependencies by using dirty setter/field injection tricks (three-stage singleton caching). 

However, in **Spring Boot 2.6 and Spring Boot 3**, **circular references are strictly disabled by default** (`spring.main.allow-circular-references=false`).

Why? Because circular dependencies are a symptom of **architectural decay**. They prove that class boundaries have collapsed and that two distinct domain concepts have become tightly coupled.

---

### The Band-Aid Anti-Pattern: Why `@Lazy` Is Dangerous

Many developers attempt to "fix" the startup crash by slapping `@Lazy` on one of the constructor arguments:

```java
// BAND-AID ANTI-PATTERN: Hiding design flaws behind @Lazy
@Service
public class OrderService {
    private final CustomerService customerService;

    public OrderService(@Lazy CustomerService customerService) { // BAD!
        this.customerService = customerService;
    }
}
```

#### Why `@Lazy` Fails in Production:
`@Lazy` tells Spring to inject a synthetic CGLIB dynamic proxy instead of the real bean at startup. While this allows the application to boot:
- It masks the underlying architectural coupling.
- It introduces subtle concurrency bugs and deadlock risks when the proxy resolves the real bean mid-transaction under heavy load.
- It makes the codebase harder to reason about and refactor.

---

### The Architectural Solution: Decoupling via Spring Domain Events

The clean, production-grade way to eliminate circular dependencies is **Event-Driven Decoupling** using Spring's **`ApplicationEventPublisher`**.

Instead of `OrderService` reaching directly into `CustomerService` to update loyalty points, `OrderService` simply **publishes an event**: `"An order was placed."`

`CustomerService` listens for that event and updates loyalty points independently. **`OrderService` no longer knows that `CustomerService` exists!**

```
+----------------------------------------------------------------------------------------------------+
|                         DECOUPLING CIRCULAR DEPENDENCIES VIA DOMAIN EVENTS                         |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   BEFORE (Tight Coupling & Circular Failure):                                                      |
|   [ OrderService ] ◄────────────────────────────────────────► [ CustomerService ]                  |
|                                                                                                    |
|   AFTER (Clean Event-Driven Separation):                                                           |
|   [ OrderService ] ──► publishes ──► [ OrderPlacedEvent ] ──► received by ──► [ CustomerService ]  |
|                                                                                                    |
|   OrderService has ZERO knowledge of CustomerService! Circular loop is permanently broken.         |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

### Implementation: Decoupling with Spring Domain Events

#### What We Are Doing in the Below Code:
1. We define an immutable Java 21 Record, `OrderPlacedEvent`, representing the domain event.
2. In `OrderService`, we inject `ApplicationEventPublisher`. When an order is saved, we publish the event. Notice that `OrderService` has zero dependencies on `CustomerService`.
3. In `CustomerService`, we annotate a listener method with `@TransactionalEventListener`. When the event arrives, it updates the loyalty points.

```java
// 1. THE DOMAIN EVENT (Immutable Java Record)
package com.store.order.event;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderPlacedEvent(
        UUID orderId,
        UUID customerId,
        BigDecimal totalAmount
) {}
```

```java
// 2. THE PUBLISHER (OrderService: Has NO dependency on CustomerService)
package com.store.order.service;

import com.store.order.domain.OrderEntity;
import com.store.order.event.OrderPlacedEvent;
import com.store.order.repository.OrderRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher eventPublisher;

    public OrderService(OrderRepository orderRepository, ApplicationEventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public OrderEntity placeOrder(UUID customerId, BigDecimal amount) {
        OrderEntity order = new OrderEntity(customerId, amount);
        OrderEntity savedOrder = orderRepository.save(order);

        // Fire event: Decouples OrderService from CustomerService!
        eventPublisher.publishEvent(new OrderPlacedEvent(savedOrder.getId(), customerId, amount));

        return savedOrder;
    }
}
```

```java
// 3. THE SUBSCRIBER (CustomerService: Listens independently)
package com.store.customer.service;

import com.store.order.event.OrderPlacedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Service
public class CustomerService {

    private static final Logger log = LoggerFactory.getLogger(CustomerService.class);

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderPlaced(OrderPlacedEvent event) {
        log.info("Processing loyalty rewards for customer {} following order {}", 
                event.customerId(), event.orderId());
        
        // Update loyalty points cleanly without circular bean references
    }
}
```

---

## 06. Testing Each Layer in Complete Isolation

One of the greatest benefits of strict layered architecture is that **each layer can be tested in isolation**, matching the classic Testing Pyramid.

```
+-----------------------------------------------------------------------------------------+
|                         ISOLATED LAYER TESTING IN SPRING BOOT                           |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   LAYER          TEST SLICE ANNOTATION      TEST SPEED       SCOPE                      |
|   ─────────────  ─────────────────────────  ───────────────  ─────────────────────────  |
|   Web Tier       @WebMvcTest                Fast (~500 ms)   Only controllers & JSON    |
|   Service Tier   Plain JUnit 5 + Mockito    Instant (~5 ms)  Pure Java business logic   |
|   Persistence    @DataJpaTest               Medium (~2 sec)  Only repositories & SQL    |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

---

### 1. Testing the Web Tier with `@WebMvcTest`

#### What We Are Doing in the Below Code:
We use `@WebMvcTest(ProductController.class)` to test the web tier in isolation. Spring boots **only** the web infrastructure (DispatcherServlet, Jackson, validation). It does not start a database or the full ApplicationContext. We mock `ProductService` using `@MockBean` to verify HTTP status codes and JSON serialization in milliseconds.

```java
package com.store.product.web;

import com.store.product.dto.ProductResponse;
import com.store.product.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Test
    void getProduct_Returns200AndJson() throws Exception {
        UUID id = UUID.randomUUID();
        ProductResponse mockResponse = new ProductResponse(id, "Mechanical Keyboard", new BigDecimal("129.99"));

        given(productService.getProductById(id)).willReturn(mockResponse);

        mockMvc.perform(get("/api/v1/products/{id}", id)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("Mechanical Keyboard"))
                .andExpect(jsonPath("$.price").value(129.99));
    }
}
```

---

### 2. Testing the Service Tier with Pure JUnit 5 & Mockito

#### What We Are Doing in the Below Code:
We test `ProductService` as a pure Java unit test using Mockito (`@ExtendWith(MockitoExtension.class)`). We do **not** boot Spring at all. This tests business logic, exception throwing, and repository coordination in under 5 milliseconds.

```java
package com.store.product.service;

import com.store.common.exception.ResourceNotFoundException;
import com.store.product.domain.ProductEntity;
import com.store.product.dto.ProductResponse;
import com.store.product.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void getProductById_WhenFound_ReturnsDto() {
        UUID id = UUID.randomUUID();
        ProductEntity entity = new ProductEntity(id, "Monitor", new BigDecimal("349.99"));
        given(productRepository.findById(id)).willReturn(Optional.of(entity));

        ProductResponse response = productService.getProductById(id);

        assertThat(response.id()).isEqualTo(id);
        assertThat(response.name()).isEqualTo("Monitor");
    }

    @Test
    void getProductById_WhenNotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        given(productRepository.findById(id)).willReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(id))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product");
    }
}
```

---

## 07. Production Blueprint: An Enterprise Layered Order Fulfillment Service

To synthesize all concepts explored in this lesson, let us examine an enterprise-grade Order Fulfillment implementation showcasing strict tier boundaries, DTO mapping, and domain event decoupling.

```
+----------------------------------------------------------------------------------------------------+
|                         COMPLETE PRODUCTION TIER ARCHITECTURE                                      |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   1. OrderController (Web Tier)                                                                    |
|      - Extracts @Valid CreateOrderRequest DTO                                                      |
|      - Calls OrderFulfillmentService                                                               |
|      - Returns ResponseEntity.created() with canonical Location header                             |
|                                                                                                    |
|   2. OrderFulfillmentService (Service Tier)                                                        |
|      - Manages @Transactional boundary                                                             |
|      - Validates customer credit & inventory invariants                                            |
|      - Coordinates OrderRepository & InventoryRepository                                           |
|      - Emits OrderPlacedEvent via ApplicationEventPublisher (breaks circular coupling)             |
|                                                                                                    |
|   3. OrderRepository (Persistence Tier)                                                            |
|      - Executes pure JPA database operations                                                       |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

### 1. The Controller Implementation

#### What We Are Doing in the Below Code:
The controller handles only web concerns: parameter binding, validation, calling the service, and returning a `201 Created` status with a canonical `Location` header.

```java
package com.store.order.web;

import com.store.order.dto.CreateOrderRequest;
import com.store.order.dto.OrderResponse;
import com.store.order.service.OrderFulfillmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderFulfillmentService fulfillmentService;

    public OrderController(OrderFulfillmentService fulfillmentService) {
        this.fulfillmentService = fulfillmentService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = fulfillmentService.fulfillOrder(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }
}
```

---

### 2. The Service Implementation

#### What We Are Doing in the Below Code:
The service enforces transactional integrity, verifies business invariants, saves the entity, maps to a DTO, and fires a domain event to notify downstream consumers without creating circular dependencies.

```java
package com.store.order.service;

import com.store.common.exception.ResourceNotFoundException;
import com.store.order.domain.OrderEntity;
import com.store.order.dto.CreateOrderRequest;
import com.store.order.dto.OrderResponse;
import com.store.order.event.OrderPlacedEvent;
import com.store.order.repository.OrderRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderFulfillmentService {

    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher eventPublisher;

    public OrderFulfillmentService(OrderRepository orderRepository, ApplicationEventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public OrderResponse fulfillOrder(CreateOrderRequest request) {
        // 1. Business Invariant & Domain Logic
        OrderEntity order = new OrderEntity(request.customerId(), request.totalAmount());
        OrderEntity savedOrder = orderRepository.save(order);

        // 2. Publish Domain Event (Decoupled Notification)
        eventPublisher.publishEvent(new OrderPlacedEvent(savedOrder.getId(), savedOrder.getCustomerId(), savedOrder.getTotalAmount()));

        // 3. Return Clean DTO (Entities never escape to controllers!)
        return OrderResponse.fromEntity(savedOrder);
    }
}
```

In [Lesson 12.2: The Entity Leak Anti-Pattern](/notes/spring-boot-entity-leak-anti-pattern-mass-assignment-dto-java-records), we will investigate why returning entities directly from services to controllers exposes severe security vulnerabilities (such as the infamous GitHub 2012 Mass Assignment exploit) and how to design robust DTOs using Java 21 Records.

---

## 08. Subtle Gotchas & Production Anti-Patterns

### Gotcha 1: The "Fat Controller, Anemic Service" Trap
Placing if-else validation and orchestration logic inside controller methods results in code duplication across endpoints. Controllers should remain lightweight "thin coordinators" that delegate business execution immediately to the service tier.

### Gotcha 2: Annotating Repositories with `@Transactional`
While Spring Data provides default read-only transactions, declaring `@Transactional` directly on repository methods is an anti-pattern. Transaction boundaries must represent a complete **business use case** spanning multiple repository operations, which belongs exclusively at the `@Service` layer.

---

## 09. Authoritative References & Further Reading

To explore layered architecture, clean domain boundaries, and Spring dependency management at the source, consult these canonical resources:

- [Martin Fowler — PresentationDomainDataLayering Patterns](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)  
  *Foundational architectural treatise defining the separation between presentation, domain logic, and data source layers.*
- [Robert C. Martin — The Clean Architecture & Dependency Inversion](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)  
  *Authoritative specification governing concentric architectural boundaries and directional dependency rules.*
- [Spring Framework Official Documentation — Transaction Management Boundaries](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html)  
  *Detailed guide on declarative @Transactional demarcation, rollback policies, and proxy mechanics.*
- [Spring Framework Official Documentation — Application Events & Listeners](https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html#context-functionality-events)  
  *Comprehensive guide to ApplicationEventPublisher and @TransactionalEventListener for circular dependency decoupling.*
- [Spring Boot Official Documentation — Testing Slices (@WebMvcTest & @DataJpaTest)](https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html#testing.spring-boot-applications.autoconfigured-tests)  
  *Official reference on testing individual architectural layers in complete isolation.*
