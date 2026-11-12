---
title: "Spring Bean Definitions, Naming & Scopes"
slug: spring-bean-definitions-naming-scopes
subject: backend-distributed-systems
abstract: An architectural, first-principles exploration of Spring Beans in modern enterprise systems. Master the blueprint concept behind Bean Definitions, understand container naming and lookup strategies, explore Singleton, Prototype, Request, and Session scopes through real-world applications, avoid the catastrophic multi-user race conditions of mutable Singletons, and solve the classic Scope Mismatch trap.
tags:
  - spring-core
  - spring-boot
  - beans
  - bean-scopes
  - architecture
  - concurrency
  - java
published: true
publishDate: Nov 12, 2026
updatedDate: Nov 12, 2026
readTime: 22m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
---

# Spring Bean Definitions, Naming & Scopes

Welcome back. In our previous sessions on Inversion of Control ([Why Dependency Injection?](/notes/why-dependency-injection-decoupling-testability-separation-of-concerns) and [Types of Dependency Injection](/notes/dependency-injection-constructor-setter-field)), we established that your application's domain logic should never manually instantiate its collaborators with the `new` operator. Instead, a central coordinator—the Inversion of Control (IoC) container—manufactures, configures, and injects dependencies on your behalf.

That naturally brings us to the centerpiece of the entire Spring ecosystem:

> *"What actually is a **Bean**? Why does Spring need a **Bean Definition** before allocating memory? And how does the container decide whether an object is created once, created thousands of times, or tied to an incoming HTTP request?"*

In this deep dive, we will step away from dry framework jargon and explore the **core architecture, memory dynamics, and production applications** of Spring Beans from first principles.

---

## 01. What is a "Bean" Really? (The Mental Model)

In plain Java, an object is simply a chunk of heap memory allocated when your program executes the `new` keyword:

```java
// Vanilla Java: You own the instantiation, configuration, and destruction
PaymentGateway gateway = new StripePaymentGateway("https://api.stripe.com", 30000);
OrderService orderService = new OrderService(gateway);
```

You are entirely responsible for:
1. Finding the right constructor parameters.
2. Initializing any internal caches or database connections.
3. Ensuring other threads can access it safely.
4. Cleaning up resources when your application shuts down.

In enterprise systems containing thousands of classes, managing these manual allocations across disparate packages quickly devolves into an unmaintainable tangle of boilerplate and tight coupling.

```
+--------------------------------------------------------------------------+
|                           THE ARCHITECTURAL SHIFT                        |
+--------------------------------------------------------------------------+
|                                                                          |
|  [ Vanilla Java Object ]               [ Spring Managed Bean ]           |
|                                                                          |
|  +------------------------+            +------------------------------+  |
|  | Created with `new`     |            | Created by Spring IoC        |  |
|  | Configured manually    |   ====>    | Configured via Blueprint     |  |
|  | Unaware of lifecycle   |            | Lifecycle hooks managed      |  |
|  | You manage references  |            | Injected into collaborators  |  |
|  +------------------------+            +------------------------------+  |
|                                                                          |
+--------------------------------------------------------------------------+
```

### The Definition of a Bean

A **Spring Bean** is not a special compiler construct, a bytecode-altered entity, or an esoteric framework wrapper. 

> **Core Principle:** A **Bean** is simply an ordinary Plain Old Java Object (POJO) that has surrendered its lifecycle, configuration, and wiring to the Spring IoC container.

When Spring takes ownership of a class, it assumes three distinct responsibilities:
1. **Creation:** Determining when and how to invoke the class's constructor or factory method.
2. **Assembly:** Inspecting the object's dependencies and injecting the appropriate collaborators.
3. **Lifecycle Management:** Executing initialization callbacks (e.g. warming caches, opening socket pools) and destruction callbacks (e.g. flushing buffers, closing database handles).

---

## 02. The Blueprint Principle: Anatomy of a Bean Definition

Why doesn't Spring simply run around scanning your classpath with reflection and instantly instantiate every `@Component` class it encounters?

Consider building a skyscraper. A general contractor does not start pouring concrete the moment building materials arrive at the job site. First, they review an **architectural blueprint**. The blueprint documents:
- What type of structure is being built?
- Does it depend on electrical conduits or plumbing lines being installed first?
- Should this component be prefabricated in bulk (prototype), or is it a central singular infrastructure piece (singleton)?
- Should it be constructed immediately on startup, or delayed until a tenant requests it (lazy initialization)?

In Spring, this architectural blueprint is known as a **Bean Definition**.

```
+--------------------------------------------------------------------------+
|                    THE TWO-PHASE CONTAINER BOOTSTRAP                     |
+--------------------------------------------------------------------------+
|                                                                          |
|  Phase 1: Configuration Discovery & Blueprint Compilation                |
|  +---------------------+                                                 |
|  | @Component Classes  | \                                               |
|  | @Configuration Beans| ---> [ BeanDefinition Registry ]               |
|  | XML / Functional Reg| /    (Catalog of all recipes in memory)         |
|  +---------------------+                                                 |
|                                     |                                    |
|                                     v                                    |
|  Phase 2: Dependency Graph Resolution & Instantiation                    |
|  +--------------------------------------------------------------------+  |
|  | 1. Sort dependencies topologically (A requires B, B requires C)    |  |
|  | 2. Instantiate collaborators in strict dependency order            |  |
|  | 3. Populate properties & inject constructor dependencies           |  |
|  | 4. Fire initialization hooks (@PostConstruct)                       |  |
|  | 5. Store live, ready-to-serve objects in the Container Cache       |  |
|  +--------------------------------------------------------------------+  |
|                                                                          |
+--------------------------------------------------------------------------+
```

### What Information Lives in a Bean Definition?

Before Spring allocates even a single byte of memory for your service, it registers a `BeanDefinition` metadata record containing:

| Blueprint Attribute | Architectural Meaning |
| :--- | :--- |
| **Bean Class** | The fully qualified Java class name (`com.myapp.service.OrderService`). |
| **Scope** | How the instance is shared across callers (`singleton`, `prototype`, `request`, `session`). |
| **Constructor Arguments** | The list of references or values required to satisfy the constructor. |
| **Autowire Candidate** | Whether this bean is eligible to be injected into other collaborators. |
| **Primary Flag** | Whether this bean should take precedence when multiple implementations exist. |
| **Lazy Initialization** | Whether instantiation should occur at container startup or upon first request. |
| **Lifecycle Callbacks** | The specific methods to invoke upon initialization and destruction. |

By separating the **recipe** (`BeanDefinition`) from the **cooked meal** (the live object instance), Spring achieves immense flexibility: it can analyze your entire dependency graph for circular dependencies, apply decorators and proxies (like `@Transactional`), and alter configurations *before* any object is instantiated.

---

## 03. Bean Naming & Container Discovery

When your application context contains hundreds of beans, how does the container catalog and retrieve them?

The Spring container acts like an indexed enterprise catalog. Every bean registered in the container possesses:
1. At least one **primary bean name** (its primary identifier).
2. Zero or more **aliases** (alternative identifiers pointing to the same instance).

```java
// Lookup by Type (The standard, type-safe approach)
OrderService orderService = context.getBean(OrderService.class);

// Lookup by Name (When multiple implementations of an interface exist)
PaymentGateway gateway = context.getBean("stripeGateway", PaymentGateway.class);
```

### The Default Naming Convention: Decapitalization

When you register a component using stereotype annotations (`@Component`, `@Service`, `@Repository`, `@Controller`), Spring automatically derives the bean name using the standard JavaBeans decapitalization algorithm:

```
Rule: Take the unadorned class name and lowercase the first letter.
```

- `OrderService` $\rightarrow$ `orderService`
- `PostgresOrderRepository` $\rightarrow$ `postgresOrderRepository`
- `NotificationDispatcher` $\rightarrow$ `notificationDispatcher`

#### The Acronym Edge Case

There is one critical edge case developers frequently encounter when naming classes with acronyms:

```
If BOTH the first and second characters of the class name are uppercase,
Spring leaves the entire string unchanged.
```

- `URLValidator` $\rightarrow$ `URLValidator` (NOT `uRLValidator`)
- `PDFReportGenerator` $\rightarrow$ `PDFReportGenerator` (NOT `pDFReportGenerator`)
- `IOStreamHandler` $\rightarrow$ `IOStreamHandler` (NOT `iOStreamHandler`)

This behavior adheres to the official `java.beans.Introspector.decapitalize` specification to preserve readable acronyms.

### Explicit Custom Naming & Aliasing

In production architectures, relying on implicit class names can be fragile if you have multiple implementations of a common interface:

```java
package com.myapp.billing;

import org.springframework.stereotype.Service;

// Custom explicit name assigned to the stereotype
@Service("stripePaymentGateway")
public class StripePaymentGateway implements PaymentGateway {
    @Override
    public void processPayment(BigDecimal amount) {
        // Stripe integration logic
    }
}
```

When using `@Configuration` and `@Bean` factory methods, the method name becomes the default bean name, but you can define explicit names and aliases:

```java
package com.myapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class PaymentInfrastructureConfig {

    // Bean name defaults to the method name: "paypalGateway"
    // Aliases "primaryGateway" and "defaultBillingProvider" point to the exact same bean
    @Bean(name = {"paypalGateway", "primaryGateway", "defaultBillingProvider"})
    public PaymentGateway paypalGateway() {
        return new PaypalPaymentGateway();
    }
}
```

---

## 04. Singleton Scope: The Enterprise Default & Thread Safety

In standard software engineering, the classic Gang of Four (GoF) *Singleton Pattern* ensures that a class has only one instance per ClassLoader by using a private constructor and a global static variable (`getInstance()`).

Spring's **Singleton Scope** is different and far more flexible:

> **Spring Singleton Principle:** There is exactly **one shared instance per Spring IoC Container (`ApplicationContext`)**, not per ClassLoader.

```
+--------------------------------------------------------------------------+
|                  THE SPRING SINGLETON ARCHITECTURE                       |
+--------------------------------------------------------------------------+
|                                                                          |
|  Incoming HTTP Requests (Concurrent Threads)                            |
|                                                                          |
|  Thread 1 (User A) ----\                                                 |
|  Thread 2 (User B) ------> [ Single Shared OrderService Instance ]       |
|  Thread 3 (User C) ----/   (Cached in DefaultSingletonBeanRegistry)      |
|                                          |                               |
|                                          v                               |
|                             [ Single Shared Database Pool ]              |
|                                                                          |
+--------------------------------------------------------------------------+
```

### Why is Singleton the Default?

Over 95% of components in enterprise applications—controllers, domain services, repositories, validators, message listeners—are stateless processing pipelines. 

If Spring created a new `OrderService` and a new `UserRepository` for every incoming HTTP request on a server handling 10,000 requests per second:
1. The JVM heap would churn through millions of short-lived objects every minute.
2. The garbage collector would suffer severe stop-the-world pauses.
3. CPU cycles would be wasted repeatedly manufacturing identical stateless objects.

By creating each stateless service **once** at container startup and caching it in memory, Spring ensures lightning-fast execution and minimal memory footprint.

### The Cardinal Rule: Singletons Must Be Stateless

Because a Singleton bean is shared simultaneously across all incoming web request threads, it **must never store mutable, request-specific state in its instance fields**.

#### The Catastrophic Production Bug: The Leaky Cart

Examine this seemingly innocent code:

```java
// DANGEROUS ANTI-PATTERN: DO NOT USE IN PRODUCTION
@Service
public class CheckoutService {

    // CRITICAL BUG: Mutable instance field in a Singleton bean!
    private List<OrderItem> currentCartItems = new ArrayList<>();
    
    private final PaymentGateway paymentGateway;

    public CheckoutService(PaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;
    }

    public void addItemToCart(OrderItem item) {
        // Mutating shared singleton state!
        this.currentCartItems.add(item);
    }

    public void processCheckout(String customerId) {
        BigDecimal total = calculateTotal(this.currentCartItems);
        paymentGateway.charge(customerId, total);
        
        // Clear cart for next time
        this.currentCartItems.clear();
    }
}
```

#### What Happens Under Concurrent Load?

1. **User A** (buying a \$1,500 Laptop) calls `addItemToCart()`.
2. Simultaneously, **User B** (buying a \$15 Book) calls `addItemToCart()`.
3. Because both threads execute against the **exact same `CheckoutService` memory reference**, `currentCartItems` now holds both items!
4. User B hits `processCheckout()`. The system charges User B's credit card for **\$1,515** and ships both items to User B's address!
5. User B's thread clears the list, leaving User A's transaction in a corrupted state.

#### The Correct Architectural Pattern: Stack Confinement

To make Singleton beans 100% thread-safe, all state must be passed through **method arguments** and confined to the executing thread's local call stack:

```java
// PRODUCTION IDIOM: 100% Stateless & Thread-Safe
@Service
public class CheckoutService {

    // Only immutable, thread-safe collaborators are stored as instance fields
    private final PaymentGateway paymentGateway;
    private final OrderRepository orderRepository;

    public CheckoutService(PaymentGateway paymentGateway, OrderRepository orderRepository) {
        this.paymentGateway = paymentGateway;
        this.orderRepository = orderRepository;
    }

    // State is passed as a method parameter (stack-confined to the calling thread)
    public OrderConfirmation processCheckout(String customerId, List<OrderItem> cartItems) {
        BigDecimal total = calculateTotal(cartItems);
        paymentGateway.charge(customerId, total);
        
        Order order = new Order(customerId, List.copyOf(cartItems), total);
        return orderRepository.save(order);
    }

    private BigDecimal calculateTotal(List<OrderItem> items) {
        return items.stream()
            .map(OrderItem::price)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
```

In this architecture, 10,000 threads can call `processCheckout()` at the exact same millisecond with zero locks, zero synchronization overhead, and zero data leakage.

---

## 05. Prototype Scope: Independent Work Units

What if your class legitimately requires mutable state that cannot be shared across threads or workflows?

This is where the **Prototype Scope** applies:

```
Rule: The container creates a brand new object instance every single time
the bean is requested or injected.
```

```java
package com.myapp.batch;

import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;

@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE) // Equivalent to @Scope("prototype")
public class ReportCompilationTask {

    // Safe in a prototype bean: state is isolated to this specific task execution
    private final List<String> errorLog = new ArrayList<>();
    private int processedRowCount = 0;

    public void processRow(String rowData) {
        this.processedRowCount++;
        // Accumulate row-level metrics
    }

    public TaskSummary complete() {
        return new TaskSummary(processedRowCount, List.copyOf(errorLog));
    }
}
```

```
+--------------------------------------------------------------------------+
|                     PROTOTYPE ALLOCATION MECHANICS                       |
+--------------------------------------------------------------------------+
|                                                                          |
|  Caller A (Batch Job 1) ----> getBean("reportTask") ---> [ New Task #1 ] |
|                                                                          |
|  Caller B (Batch Job 2) ----> getBean("reportTask") ---> [ New Task #2 ] |
|                                                                          |
|  Caller C (Batch Job 3) ----> getBean("reportTask") ---> [ New Task #3 ] |
|                                                                          |
+--------------------------------------------------------------------------+
```

### The Critical Prototype Gotcha: The Container Hands Off

There is a fundamental difference in how the Spring container manages the lifecycle of Singletons versus Prototypes:

| Lifecycle Phase | Singleton Bean | Prototype Bean |
| :--- | :--- | :--- |
| **Instantiation** | Managed by Spring | Managed by Spring |
| **Dependency Injection** | Managed by Spring | Managed by Spring |
| **Initialization (`@PostConstruct`)** | Invoked by Spring | Invoked by Spring |
| **Tracking in Container Registry** | **Yes** (cached permanently) | **No** (handed off to caller) |
| **Destruction (`@PreDestroy`)** | **Invoked on container shutdown** | **NEVER INVOKED BY SPRING** |

> [!WARNING]
> **Production Memory Warning:** Spring does **not** manage the complete lifecycle of prototype beans. Once a prototype bean is configured and handed to the caller, the container forgets about it. 
> 
> If your prototype bean allocates native operating system resources, file handles, or open sockets, annotating a cleanup method with `@PreDestroy` **will never be called automatically**. Your client code must clean up those resources manually, or you will create a severe resource leak!

---

## 06. Web Scopes: Request & Session in Distributed Architectures

In web-aware Spring applications (such as Spring MVC and Spring Boot Starter Web), Spring provides specialized scopes whose lifecycles are bound to HTTP communication:

```
+--------------------------------------------------------------------------+
|                       WEB-AWARE SCOPE BOUNDARIES                         |
+--------------------------------------------------------------------------+
|                                                                          |
|  HTTP Request 1 (Client A) ---> [ RequestScope: UserTenantContext #1 ]   |
|                                 (Destroyed when HTTP response completes) |
|                                                                          |
|  HTTP Session (Client A) -----> [ SessionScope: ShoppingCart #1 ]        |
|                                 (Lives across requests until timeout)    |
|                                                                          |
+--------------------------------------------------------------------------+
```

### 1. Request Scope (`@RequestScope`)

A **Request-scoped** bean lives for the duration of a single HTTP request. Every incoming HTTP request receives its own unique instance, which is discarded as soon as the HTTP response is dispatched.

#### Real-World Application: Multi-Tenancy & Audit Tracing

In SaaS platforms, every HTTP request carries tenant headers and correlation IDs. Storing this context in a request-scoped bean allows any service downstream to inspect it without polluting method signatures:

```java
package com.myapp.tenant;

import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

@Component
@RequestScope // Equivalent to @Scope(value = WebApplicationContext.SCOPE_REQUEST)
public class RequestExecutionContext {

    private String tenantId;
    private String correlationId;
    private String authenticatedUser;

    public void initialize(String tenantId, String correlationId, String user) {
        this.tenantId = tenantId;
        this.correlationId = correlationId;
        this.authenticatedUser = user;
    }

    public String getTenantId() { return tenantId; }
    public String getCorrelationId() { return correlationId; }
    public String getAuthenticatedUser() { return authenticatedUser; }
}
```

### 2. Session Scope (`@SessionScope`)

A **Session-scoped** bean lives for the lifecycle of an HTTP Session. It is created upon the first request from a user browser, stored in the server's session store (or distributed Redis session cache), and discarded when the session expires or is invalidated.

#### Real-World Application: Conversational Workflows

```java
package com.myapp.cart;

import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.SessionScope;
import java.io.Serializable;

@Component
@SessionScope // Equivalent to @Scope(value = WebApplicationContext.SCOPE_SESSION)
public class UserSessionCart implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private final List<CartItem> items = new ArrayList<>();

    public void addItem(CartItem item) {
        items.add(item);
    }

    public List<CartItem> getItems() {
        return List.copyOf(items);
    }
}
```

---

## 07. The Scope Mismatch Gotcha & Clean Architectural Solutions

Now comes one of the most subtle architectural pitfalls in Spring development: **The Scope Mismatch**.

### The Problem: When a Singleton Injects a Shorter-Lived Bean

Imagine a Singleton service that attempts to inject a Prototype or Request-scoped bean directly via constructor injection:

```java
// DANGEROUS SCOPE MISMATCH
@Service // Singleton (Created ONCE at application boot)
public class OrderProcessingService {

    private final ReportCompilationTask task; // Prototype bean!

    public OrderProcessingService(ReportCompilationTask task) {
        this.task = task;
    }

    public void processDailyOrders() {
        // BUG: `this.task` is the EXACT SAME instance on every call!
        task.processRow("OrderData");
    }
}
```

#### Why Does This Break?

Trace the lifecycle:
1. At application startup, the Spring container instantiates the Singleton `OrderProcessingService`.
2. To satisfy its constructor, Spring asks for an instance of `ReportCompilationTask`.
3. Because `ReportCompilationTask` is prototype-scoped, Spring mints a fresh instance and injects it into `OrderProcessingService`.
4. The `OrderProcessingService` constructor finishes. **It is never executed again.**
5. For the rest of the application's lifetime, `OrderProcessingService` holds onto that single, frozen prototype instance.

> [!CAUTION]
> **The Scope Mismatch Rule:** Injecting a prototype, request, or session-scoped bean directly into a singleton bean **degrades the shorter-lived bean into a singleton**. You defeat the purpose of the scope!

---

### Solution 1: Dynamic Scoped Proxies (`proxyMode`)

The most elegant and idiomatic solution for web scopes is a **Scoped Proxy**.

Instead of injecting the real target instance, Spring injects an intelligent CGLIB proxy surrogate. When the singleton calls a method on the proxy, the proxy dynamically queries the current HTTP request thread and forwards the call to the active thread's real bean:

```
+--------------------------------------------------------------------------+
|                       SCOPED PROXY IN ACTION                             |
+--------------------------------------------------------------------------+
|                                                                          |
|  [ Singleton OrderService ]                                              |
|            |                                                             |
|            v                                                             |
|  [ CGLIB Scoped Proxy ] <--- Implements UserTenantContext interface     |
|            |                                                             |
|            +----> Thread 1 (Req A) ---> Routes to [ Real Context #101 ]  |
|            |                                                             |
|            +----> Thread 2 (Req B) ---> Routes to [ Real Context #102 ]  |
|                                                                          |
+--------------------------------------------------------------------------+
```

To enable this, Spring's `@RequestScope` and `@SessionScope` annotations configure `proxyMode = ScopedProxyMode.TARGET_CLASS` automatically out of the box!

```java
@Component
@RequestScope // Automatically configures a CGLIB proxy surrogate!
public class RequestContext {
    private String correlationId;
    // Getters and setters
}

@Service // Singleton
public class OrderService {
    // Perfectly safe! `context` is a dynamic proxy that delegates
    // method calls to whichever HTTP thread is currently executing.
    private final RequestContext context;

    public OrderService(RequestContext context) {
        this.context = context;
    }

    public void executeOrder() {
        // Resolves the correlationId for the ACTIVE thread's request
        String traceId = context.getCorrelationId();
    }
}
```

---

### Solution 2: `ObjectProvider<T>` for Dynamic Prototypes

If you are using prototype beans outside of web requests (e.g. background batch workers), dynamic proxies are unnecessary. 

Instead, use Spring's `ObjectProvider<T>` (or `Provider<T>` from Jakarta CDI). It allows the singleton to request a brand-new prototype instance on demand at runtime:

```java
package com.myapp.batch;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

@Service // Singleton
public class BatchJobCoordinator {

    // ObjectProvider acts as a type-safe factory for fresh prototype instances
    private final ObjectProvider<ReportCompilationTask> taskProvider;

    public BatchJobCoordinator(ObjectProvider<ReportCompilationTask> taskProvider) {
        this.taskProvider = taskProvider;
    }

    public void runJob() {
        // Calls the container at runtime to mint a 100% fresh, isolated prototype instance!
        ReportCompilationTask freshTask = taskProvider.getObject();
        freshTask.processRow("Batch-Item-1");
    }
}
```

This pattern avoids injecting the heavy `ApplicationContext` directly (which would violate clean architecture and tightly couple your service to the framework), while cleanly solving the scope mismatch.

---

## 08. Architectural Decision Matrix & Scope Selection Guide

Use this comparative matrix when choosing scopes for your system components:

| Scope | Instance Count | Storage Location | Thread Safety Requirement | Destruction Handled? | Ideal Enterprise Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Singleton** *(Default)* | 1 per `ApplicationContext` | Container Cache (`DefaultSingletonBeanRegistry`) | **Strictly Required** (Must be stateless) | **Yes** (`@PreDestroy` executed at shutdown) | 95% of components: Controllers, Services, Repositories, Client Adapters. |
| **Prototype** | 1 per injection or `getObject()` | Unmanaged (Handed off to caller heap) | Isolated (Safe for mutable task state) | **No** (Caller must clean up resources) | Stateful workers, multi-step calculation builders, batch tasks. |
| **Request** | 1 per HTTP request | Thread-bound (`RequestContextHolder`) | Isolated to single HTTP request thread | **Yes** (Destroyed at end of HTTP request) | Multi-tenant headers, tracing IDs, security audit context. |
| **Session** | 1 per HTTP session | Web Session store (Memory / Redis) | Synchronized per user session | **Yes** (Destroyed on session timeout) | Shopping carts, multi-step checkout wizards, user locale. |

---

## 09. Production Checklist & Summary

When architecting Spring Boot applications, apply these rules of thumb:

1. **Default to Singleton for almost everything.**
   - Do not reach for `@Scope("prototype")` prematurely. If a method needs scratchpad state, allocate it locally on the stack inside the method rather than creating a prototype bean.
2. **Never put mutable shared fields in Singletons.**
   - Storing a mutable `List`, `Map`, or counter as an instance variable in a singleton controller or service will cause severe concurrency race conditions under production traffic.
3. **Beware of the Prototype lifecycle limitation.**
   - Remember that Spring creates a prototype bean, wires its dependencies, invokes `@PostConstruct`, and completely relinquishes ownership. It will **never** call `@PreDestroy` on a prototype bean.
4. **Use Scoped Proxies when injecting web scopes into singletons.**
   - Never inject raw request or session beans without proxies into singletons. Rely on `@RequestScope` and `@SessionScope`, which configure target-class proxies by default.
5. **Use `ObjectProvider<T>` for on-demand prototypes.**
   - Prefer `ObjectProvider<MyTask>` over injecting `ApplicationContext` directly to preserve loose coupling and unit testability.

---

## 10. Authoritative References & Further Reading

For deeper study and official architectural specifications, explore these standard documentation links:

- [Spring Framework Official Documentation: Bean Overview & Definitions](https://docs.spring.io/spring-framework/reference/core/beans/definition.html)  
  *The authoritative guide on how Spring creates and manages bean definition metadata records.*
- [Spring Framework Official Documentation: Bean Scopes](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-scopes.html)  
  *Comprehensive coverage of singleton, prototype, request, session, and application scoping mechanics.*
- [Spring Framework Official Documentation: Scoped Beans as Dependencies](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-scopes.html#beans-factory-scopes-other-injection)  
  *The official guide on solving the Scope Mismatch trap using `<aop:scoped-proxy/>` and `ScopedProxyMode`.*
- [Spring Framework Official Documentation: Customizing Bean Naming](https://docs.spring.io/spring-framework/reference/core/beans/definition.html#beans-beanname)  
  *Detailed specification on default bean naming, decapitalization, and explicit aliasing rules.*
