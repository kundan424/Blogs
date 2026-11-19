---
title: "How @Transactional Works: AOP Proxies, ThreadLocal & The Self-Invocation Trap"
slug: spring-boot-how-transactional-works-aop-proxies-self-invocation-trap
subject: backend-distributed-systems
abstract: An architectural, mentor-led deep dive into the internal mechanics of Spring's @Transactional annotation. Deconstruct how Spring AOP weaves dynamic CGLIB proxies and TransactionInterceptor around your beans, understand how ThreadLocal binds database connections to worker threads, discover why private methods fail silently, and master the root causes and production resolutions of the infamous Self-Invocation proxy bypass trap.
tags:
  - transactional
  - aop-proxies
  - self-invocation
  - thread-local
  - clean-code
  - spring-boot
  - spring-boot-3
published: true
publishDate: Nov 19, 2026
updatedDate: Nov 19, 2026
readTime: 20m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
---

# How @Transactional Works: AOP Proxies, ThreadLocal & The Self-Invocation Trap

In [Lesson 16.1: ACID Fundamentals & The Spring PlatformTransactionManager Abstraction](/learning-paths/spring-boot-production-mastery), we explored the foundational mechanics of transactions: the ACID guarantees, the boilerplate of raw JDBC, and how Spring's `PlatformTransactionManager` decouples transaction boundaries from underlying persistence drivers.

In modern Spring Boot applications, you rarely manage transactions programmatically. Instead, you annotate a method with **`@Transactional`**, and Spring seamlessly coordinates connection acquisition, commits, and rollbacks.

However, `@Transactional` is not compiler magic or native Java syntax. It is an abstraction built on top of **Spring Aspect-Oriented Programming (AOP)** and **`ThreadLocal` storage**.

Because developers frequently treat `@Transactional` as a black box, it is the single most common source of subtle, high-severity production defects:
- When you annotate a method with `@Transactional`, what object is your controller *actually* talking to in memory?
- Why does placing `@Transactional` on a `private` or `protected` method fail silently without throwing an error, executing your code with **zero transaction management**?
- What is the **Self-Invocation Trap**, and why does calling `this.childTransactionalMethod()` completely bypass Spring's transaction interceptor?
- Why do asynchronous background threads (`@Async` or `CompletableFuture`) lose the parent transaction context entirely?

In this lesson, we will peel back the proxy layer. We will trace the exact execution pipeline of an intercepted method, understand how CGLIB dynamic subclasses work, dissect the self-invocation trap, and implement modern production patterns to solve it.

---

## 01. The Illusion: What `@Transactional` Actually Is

When junior developers look at a Spring service:

```java
@Service
public class OrderService {

    @Transactional
    public void processOrder(UUID orderId) {
        // Business logic...
    }
}
```

They often assume that the Java Virtual Machine (JVM) or the Java compiler instruments the `processOrder` method, inserting database connection calls directly into the compiled bytecode.

That assumption is completely false.

In standard Spring Boot:
1. **The compiled `OrderService.class` bytecode is untouched**: Your source code contains only pure business logic.
2. **`@Transactional` is merely runtime metadata**: It acts as a marker informing the Spring container: *"Wrap this bean in an AOP proxy and intercept its public method calls."*
3. **The Caller Never Calls Your Bean Directly**: When an external component (such as an `OrderController`) injects `OrderService`, Spring does not inject an instance of your actual `OrderService` class. 
4. **Spring injects an AOP Proxy**: Spring generates a synthetic subclass at runtime that wraps your bean, intercepts the invocation, opens the transaction, delegates to your real method, and then commits or rolls back.

```
+--------------------------------------------------------------------------------------------------+
|                              THE SPRING AOP PROXY ILLUSION                                       |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   WHAT DEVELOPERS THINK HAPPENS:                                                                 |
|   ┌───────────────────┐                 ┌────────────────────────────────────────────────────┐   |
|   │  OrderController  │ ──────────────► │                    OrderService                    │   |
|   └───────────────────┘  Direct Call    │ (Somehow magically opens & commits a transaction)  │   |
|                                         └────────────────────────────────────────────────────┘   |
|                                                                                                  |
|   WHAT ACTUALLY HAPPENS AT RUNTIME:                                                              |
|   ┌───────────────────┐                 ┌────────────────────────────────────────────────────┐   |
|   │  OrderController  │                 │             OrderService$$SpringCGLIB              │   |
|   └─────────┬─────────┘                 │                 (The AOP Proxy)                    │   |
|             │                           ├────────────────────────────────────────────────────┤   |
|             │ 1. Calls processOrder()   │ 2. Intercepts call via TransactionInterceptor       │   |
|             └─────────────────────────► │ 3. Asks PlatformTransactionManager for connection   │   |
|                                         │ 4. Binds connection to ThreadLocal                 │   |
|                                         │                                                    │   |
|                                         │ 5. Invokes REAL BEAN:                              │   |
|                                         │    ┌──────────────────────────────────────────┐    │   |
|                                         │    │         Target: Actual OrderService      │    │   |
|                                         │    │         (Executes business logic)        │    │   |
|                                         │    └────────────────────┬─────────────────────┘    │   |
|                                         │                         │                          │   |
|                                         │ 6. Real method returns ◄┘                          │   |
|                                         │ 7. Commits transaction & unbinds connection        │   |
|             8. Returns result to caller │ 8. Returns connection to HikariCP pool             │   |
|             ◄───────────────────────────┴────────────────────────────────────────────────────┘   |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

---

## 02. The Proxy Architecture: CGLIB Class Proxies

In Java, dynamic proxies can be created in two ways:
1. **JDK Dynamic Proxies**: Built into the standard Java runtime (`java.lang.reflect.Proxy`). They can only proxy **interfaces**. If your class does not implement an interface, JDK dynamic proxies cannot proxy it.
2. **CGLIB / ByteBuddy Class Proxies**: Generates a dynamic subclass of your target class at runtime using bytecode generation.

### Why Spring Boot 3 Defaults to CGLIB Class Proxies
In older Spring versions, if your service implemented an interface (`OrderService` implementing `IOrderService`), Spring defaulted to JDK dynamic proxies. If you tried to autowire the concrete class `OrderService`, your application failed at startup with a `BeanNotOfRequiredTypeException`.

To eliminate this friction, **Spring Boot enables CGLIB class proxies by default** (`spring.aop.proxy-target-class=true`). 

Spring generates a synthetic subclass that extends your concrete class:
```java
// Conceptual representation of what Spring generates in memory:
public class OrderService$$SpringCGLIB$$0 extends OrderService {

    private final MethodInterceptor interceptor;

    @Override
    public void processOrder(UUID orderId) {
        // Delegates to Spring's TransactionInterceptor
        interceptor.intercept(this, method, args);
    }
}
```

Because the proxy is a subclass of your service, it can be injected anywhere your service is expected.

---

## 03. The Execution Pipeline: Inside `TransactionInterceptor`

When a client invokes a method on the proxy, how does Spring transition from the proxy to the database transaction?

The execution follows a strict 7-step pipeline coordinated by **`TransactionInterceptor`** (which extends `TransactionAspectSupport`):

```
+--------------------------------------------------------------------------------------------------+
|                         THE 7-STEP TRANSACTION INTERCEPTION PIPELINE                             |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   1. INVOCATION INTERCEPTION                                                                     |
|      Caller invokes `proxy.processOrder(id)`.                                                    |
|      `TransactionInterceptor.invoke()` captures the method invocation.                           |
|                                                                                                  |
|   2. TRANSACTION ATTRIBUTE RESOLUTION                                                            |
|      Spring inspects `@Transactional` metadata (propagation, isolation, timeout, readOnly).     |
|                                                                                                  |
|   3. CONNECTION ACQUISITION & THREAD BINDING                                                     |
|      `PlatformTransactionManager.getTransaction()` acquires a database connection from HikariCP,  |
|      disables auto-commit (`conn.setAutoCommit(false)`), and binds it to the current thread      |
|      via `TransactionSynchronizationManager.bindResource(dataSource, connHolder)`.                |
|                                                                                                  |
|   4. TARGET METHOD INVOCATION (PROCEED)                                                          |
|      The interceptor invokes the actual method on the real target bean (`super.processOrder()`). |
|      Any repository calls on this thread retrieve the thread-bound connection automatically.     |
|                                                                                                  |
|   5. EXCEPTION EVALUATION                                                                        |
|      Did the method throw an exception?                                                          |
|      ├── NO:  Proceed to Step 6.                                                                 |
|      └── YES: Inspect exception type. If RuntimeException or Error, mark for ROLLBACK.            |
|               If checked Exception, COMMIT (unless configured with rollbackFor).                 |
|                                                                                                  |
|   6. TRANSACTION COMMIT OR ROLLBACK                                                              |
|      `PlatformTransactionManager.commit()` or `rollback()` is executed on the connection.       |
|                                                                                                  |
|   7. CLEANUP & CONNECTION RELEASE                                                                |
|      Unbinds connection from ThreadLocal, resets connection settings, and returns it to HikariCP.|
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

---

## 04. The Private Method Trap: Why `@Transactional` Fails Silently

Consider this code written by a developer who wants to isolate a database update into an internal helper method:

```java
// FATAL FLAW: @Transactional on a private method
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void registerUser(String email) {
        // Step 1: Public method (NOT annotated with @Transactional)
        saveUserRecord(email);
    }

    // Step 2: Developer annotates the private method:
    @Transactional
    private void saveUserRecord(String email) {
        User user = new User(email);
        userRepository.save(user);
    }
}
```

What happens when `registerUser()` is called?

**Zero transactions are created. The `@Transactional` annotation is completely ignored!**

### Why Does This Happen?
To understand why, remember how CGLIB class proxies work:
1. CGLIB creates a dynamic subclass: `UserService$$SpringCGLIB extends UserService`.
2. In Java, **a subclass cannot override a `private` method of its parent class!**
3. Because the proxy subclass cannot override `saveUserRecord()`, it cannot wrap it with `TransactionInterceptor`.
4. Spring's AOP framework inspects bean methods at startup. When it encounters `@Transactional` on a `private` method, it simply skips it. It does not throw an exception; it fails silently!

> [!WARNING]
> **Production Rule**: `@Transactional` **only works on `public` methods**. 
> If you put `@Transactional` on `private`, `protected`, or package-private methods (under default proxy mode), Spring will silently ignore the annotation, and your database operations will execute in auto-commit mode without transactional atomicity.

---

## 05. The #1 Production Bug: The Self-Invocation Trap

Now we come to the most pervasive, high-severity transaction bug in Spring applications: **The Self-Invocation Proxy Bypass Trap**.

### The Real-World Scenario: Order Processing with Audit Logging
Consider a financial payment platform:
- When a customer places an order, the system processes payment and updates inventory (`processOrder`).
- To ensure compliance, every attempt must be recorded in an audit log (`recordAuditLog`).
- The developer wants the audit log to persist **even if the main order fails and rolls back**.
- Therefore, the developer annotates `recordAuditLog` with `Propagation.REQUIRES_NEW`:

```java
// BUGGY PRODUCTION SERVICE: The Self-Invocation Trap
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final AuditLogRepository auditLogRepository;

    public OrderService(OrderRepository orderRepository, AuditLogRepository auditLogRepository) {
        this.orderRepository = orderRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void checkout(UUID orderId) {
        // Step 1: Log the attempt in an independent transaction (REQUIRES_NEW)
        this.recordAuditLog(orderId, "CHECKOUT_INITIATED"); // <-- THE TRAP!

        // Step 2: Process order
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.markPaid();

        // Step 3: Simulate payment failure
        throw new IllegalStateException("Payment Gateway Declined!");
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordAuditLog(UUID orderId, String action) {
        auditLogRepository.save(new AuditLog(orderId, action));
    }
}
```

### What Happens in Production?
The developer tests this code:
1. `checkout()` begins a transaction (Transaction A).
2. `recordAuditLog()` is called.
3. An exception is thrown in Step 3.
4. Transaction A rolls back.

The developer inspects the `audit_logs` database table, expecting to see the `CHECKOUT_INITIATED` audit record.

**The audit record does not exist! It was completely rolled back!**

### Why Did `REQUIRES_NEW` Fail?
Look closely at line 14:
```java
this.recordAuditLog(orderId, "CHECKOUT_INITIATED");
```

In Java, the keyword **`this`** refers to the **current, raw instance of `OrderService`** on the JVM heap. 
It does **NOT** refer to the Spring AOP Proxy (`OrderService$$SpringCGLIB`)!

```
+--------------------------------------------------------------------------------------------------+
|                                THE SELF-INVOCATION BYPASS TRAP                                   |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   EXTERNAL CALL (Goes through Proxy):                                                            |
|   Controller ──► OrderService Proxy ──► TransactionInterceptor ──► Real OrderService.checkout() |
|                                                                            │                     |
|   INTERNAL CALL (Bypasses Proxy!):                                         │                     |
|   `this.recordAuditLog()` ─────────────────────────────────────────────────┘                     |
|   │                                                                                              |
|   ├── Calls `this` directly on the local JVM heap instance!                                      |
|   ├── The Spring AOP Proxy is NEVER reached!                                                     |
|   ├── TransactionInterceptor is NEVER executed!                                                  |
|   └── Propagation.REQUIRES_NEW is COMPLETELY IGNORED!                                            |
|                                                                                                  |
|   NET RESULT:                                                                                    |
|   `recordAuditLog` executes inside Transaction A instead of creating a new transaction.          |
|   When Transaction A throws an exception, the audit log is wiped out!                            |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

Because `recordAuditLog` was invoked via `this`, the call was a regular, non-intercepted Java method invocation. Spring never intercepted the call, never evaluated `Propagation.REQUIRES_NEW`, and never opened a second transaction.

---

## 06. How to Solve the Self-Invocation Trap in Production

There are three ways to resolve the self-invocation trap. Let's evaluate them in order of architectural preference.

### Solution 1: Architectural Separation (Recommended & Cleanest)
The cleanest, most maintainable solution is to adhere to the **Single Responsibility Principle (SRP)**:
If a method requires an independent transactional lifecycle (like audit logging, email notifications, or payment gateway attempts), **move it into its own dedicated Spring bean**.

```
+--------------------------------------------------------------------------------------------------+
|                          SOLUTION 1: ARCHITECTURAL SEPARATION                                    |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   OrderService (Bean A)                             AuditLoggingService (Bean B)                 |
|   ┌───────────────────────────────┐                 ┌────────────────────────────────────────┐   |
|   │ checkout() {                  │                 │ @Transactional(REQUIRES_NEW)           │   |
|   │   auditService.log(...); ─────┼───────────────► │ recordAuditLog(...) {                  │   |
|   │ }                             │   Goes through  │   // Opens independent transaction     │   |
|   └───────────────────────────────┘   Audit Proxy!  │ }                                      │   |
|                                                     └────────────────────────────────────────┘   |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

#### Step 1: Create the Dedicated Audit Service
```java
package com.example.service;

import com.example.domain.audit.AuditLog;
import com.example.domain.audit.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditLoggingService {

    private final AuditLogRepository auditLogRepository;

    public AuditLoggingService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Runs in an independent physical transaction.
     * Commits even if the caller transaction rolls back.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordAuditLog(UUID orderId, String action) {
        auditLogRepository.save(new AuditLog(orderId, action));
    }
}
```

#### Step 2: Inject the Dedicated Service into `OrderService`
```java
package com.example.service;

import com.example.domain.order.Order;
import com.example.domain.order.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final AuditLoggingService auditLoggingService; // Injected separate bean

    public OrderService(OrderRepository orderRepository, AuditLoggingService auditLoggingService) {
        this.orderRepository = orderRepository;
        this.auditLoggingService = auditLoggingService;
    }

    @Transactional
    public void checkout(UUID orderId) {
        // Properly intercepted by Spring AOP because it calls another bean!
        auditLoggingService.recordAuditLog(orderId, "CHECKOUT_INITIATED");

        Order order = orderRepository.findById(orderId).orElseThrow();
        order.markPaid();

        // Even if this exception is thrown, the audit record remains safely committed!
        throw new IllegalStateException("Payment Gateway Timeout!");
    }
}
```

Because `auditLoggingService` is a distinct Spring bean, `orderService` calls the **`AuditLoggingService$$SpringCGLIB` proxy**, properly activating `Propagation.REQUIRES_NEW`.

---

### Solution 2: Self-Injection via `@Lazy` (The Pragmatic Quick Fix)
If creating a new service class introduces unnecessary overhead for a minor internal method, you can have a bean inject a reference to **its own proxy** using `@Lazy`:

```java
package com.example.service;

import com.example.domain.order.Order;
import com.example.domain.order.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class OrderSelfInjectionService {

    private final OrderRepository orderRepository;

    // Self-inject the AOP proxy instance
    @Autowired
    @Lazy
    private OrderSelfInjectionService self;

    public OrderSelfInjectionService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional
    public void checkout(UUID orderId) {
        // DO NOT CALL: this.recordAuditLog(...)
        // CALL THE PROXY: self.recordAuditLog(...)
        self.recordAuditLog(orderId, "CHECKOUT_INITIATED");

        Order order = orderRepository.findById(orderId).orElseThrow();
        order.markPaid();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordAuditLog(UUID orderId, String action) {
        // Runs in a new transaction because `self` is the AOP proxy!
    }
}
```

#### How it Works:
- `@Lazy` breaks the circular dependency during application startup.
- `self` points directly to the `OrderSelfInjectionService$$SpringCGLIB` proxy.
- Calling `self.recordAuditLog(...)` routes through the proxy, correctly triggering `TransactionInterceptor`.

---

### Solution 3: Programmatic `TransactionTemplate` (No Proxies Required)
If you want to eliminate AOP proxy complexity entirely, use Spring's **`TransactionTemplate`**. 

Because `TransactionTemplate` uses functional callbacks rather than method-level proxy interception, it is **100% immune to the self-invocation trap**:

```java
package com.example.service;

import com.example.domain.audit.AuditLog;
import com.example.domain.audit.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.UUID;

@Service
public class OrderProgrammaticService {

    private final AuditLogRepository auditLogRepository;
    private final TransactionTemplate requiresNewTemplate;

    public OrderProgrammaticService(
            AuditLogRepository auditLogRepository,
            PlatformTransactionManager transactionManager) {
        this.auditLogRepository = auditLogRepository;
        
        // Configure a dedicated template for REQUIRES_NEW
        this.requiresNewTemplate = new TransactionTemplate(transactionManager);
        this.requiresNewTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    @Transactional
    public void checkout(UUID orderId) {
        // Programmatic transaction boundary: immune to proxy bypass!
        requiresNewTemplate.executeWithoutResult(status -> {
            auditLogRepository.save(new AuditLog(orderId, "CHECKOUT_INITIATED"));
        });

        // Main transaction logic continues...
    }
}
```

---

## 07. The Asynchronous Boundary Trap: Threads & `ThreadLocal`

Now, let's explore another subtle production defect: **Spawning asynchronous threads inside `@Transactional`**.

### The Scenario
Suppose an engineer writes this:

```java
// SEVERE PRODUCTION DEFECT: Asynchronous thread inside @Transactional
@Service
public class NotificationService {

    private final UserRepository userRepository;

    public NotificationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public void updateUserAndNotify(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.markVerified(); // Modifying managed entity

        // Spawning background worker thread:
        CompletableFuture.runAsync(() -> {
            // DANGER: Running on a completely different worker thread!
            User asyncUser = userRepository.findById(userId).orElseThrow();
            sendEmail(asyncUser.getEmail());
        });
    }
}
```

### Why Does This Fail?
Remember from Lesson 16.1 that Spring's `TransactionSynchronizationManager` stores the database connection and the Hibernate `EntityManager` in a **`ThreadLocal` variable**.

- `updateUserAndNotify()` executes on HTTP Thread `http-nio-8080-exec-1`.
- `CompletableFuture.runAsync()` executes on a ForkJoinPool worker thread: `ForkJoinPool.commonPool-worker-1`.
- **`ThreadLocal` values do NOT propagate to other threads!**
- The worker thread has an **empty** `ThreadLocal` context. It does not have access to the uncommitted changes made by the main thread.
- If the background thread queries the user, it reads the old, uncommitted state from the database.
- If the background thread attempts to initialize a lazy association on an entity passed to it, it crashes with a **`LazyInitializationException: could not initialize proxy - no Session`**.

> [!CAUTION]
> **Production Rule**: Never pass managed JPA entities or transactional logic into asynchronous threads (`@Async`, `CompletableFuture`, `ExecutorService`). 
> Always execute asynchronous side-effects *after* the transaction has successfully committed, using **`@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`** (covered in Lesson 16.6).

---

## 08. Architectural Mental Map & Summary

To ensure you never fall into an AOP proxy trap, commit this mental model to memory:

```
+==================================================================================================+
|                        SPRING @Transactional ARCHITECTURAL MENTAL MAP                            |
+==================================================================================================+
|                                                                                                  |
|   1. THE PROXY DISPATCH MODEL                                                                    |
|      ──────────────────────────────────────────────────────────────────────────                  |
|      External Request ──► Dynamic Proxy (CGLIB) ──► TransactionInterceptor ──► Real Target Method|
|                                                     ├── Obtains Connection from HikariCP         |
|                                                     ├── Binds Connection to ThreadLocal          |
|                                                     └── Commits / Rolls back upon exit           |
|                                                                                                  |
|   2. THE THREE GOLDEN RULES OF @Transactional PROXIES                                            |
|      ┌─────────────────────────────┬─────────────────────────────────────────────────────────┐   |
|      │ RULE                        │ TECHNICAL REASON                                        │   |
|      ├─────────────────────────────┼─────────────────────────────────────────────────────────┤   |
|      │ 1. Public methods only      │ CGLIB cannot override private methods; fails silently.  │   |
|      ├─────────────────────────────┼─────────────────────────────────────────────────────────┤   |
|      │ 2. Avoid `this.method()`    │ Direct `this` dispatch bypasses the AOP proxy.          │   |
|      │    (Self-Invocation)        │ Annotations on inner methods are completely ignored!    │   |
|      ├─────────────────────────────┼─────────────────────────────────────────────────────────┤   |
|      │ 3. Never call async inside  │ ThreadLocal does NOT cross threads. Background threads  │   |
|      │    @Transactional           │ cannot access the parent transaction or EntityManager.  │   |
|      └─────────────────────────────┴─────────────────────────────────────────────────────────┘   |
|                                                                                                  |
|   3. SELF-INVOCATION REMEDIATION DECISION GUIDE                                                  |
|      Need an inner method with independent transaction (REQUIRES_NEW)?                           |
|        ├── Cleanest & Recommended: Move method to a DEDICATED SPRING BEAN (Architectural split)  |
|        ├── Pragmatic Shortcut    : Use `@Autowired @Lazy private MyService self;`                |
|        └── Functional Alternative: Use `TransactionTemplate.execute(...)` (No proxies needed)    |
|                                                                                                  |
+==================================================================================================+
```

In the next lesson, **[Lesson 16.3: Transaction Propagation: REQUIRED, REQUIRES_NEW & Connection Pool Deadlocks](/learning-paths/spring-boot-production-mastery)**, we will explore the 7 propagation types, understand transaction suspension, and uncover how `REQUIRES_NEW` can trigger catastrophic HikariCP connection starvation deadlocks under high load.

---

## 09. Authoritative References & Further Reading

For deeper study into Spring AOP proxies, transaction interceptors, and bytecode generation, consult these canonical resources:

* [Spring Framework Documentation: Understanding AOP Proxies](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html) - Official explanation of CGLIB vs. JDK dynamic proxies and self-invocation mechanics.
* [Vlad Mihalcea: How Does Spring @Transactional Really Work?](https://vladmihalcea.com/how-does-spring-transactional-work/) - Deep architectural walkthrough of TransactionInterceptor and AOP execution chains.
* [Baeldung: Methods Calling in Same Class with @Transactional](https://www.baeldung.com/spring-transactional-propagation-isolation#self-invocation) - Practical demonstrations of the self-invocation issue and self-injection workarounds.
* [Thorben Janssen: How to Avoid the Self-Invocation Problem with Spring @Transactional](https://thorben-janssen.com/how-to-avoid-the-self-invocation-problem-with-spring-transactional/) - Clear architectural breakdown of splitting services into discrete beans.
* [Spring Framework Documentation: Declarative Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html) - Complete reference on TransactionAspectSupport and transaction attributes.
