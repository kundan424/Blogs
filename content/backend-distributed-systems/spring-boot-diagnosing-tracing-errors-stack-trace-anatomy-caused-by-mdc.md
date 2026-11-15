---
title: "Diagnosing & Tracing Spring Boot Errors: Stack Trace Anatomy, 'Caused By' Chains & MDC Distributed Tracing"
slug: spring-boot-diagnosing-tracing-errors-stack-trace-anatomy-caused-by-mdc
subject: backend-distributed-systems
abstract: An exhaustive first-principles guide to mastering error diagnostics and distributed observability in Spring Boot 3. Learn how to dissect dense JVM stack traces, isolate the true root cause in 'Caused by' exception chains, filter out hundreds of lines of framework proxy and reflection noise, correlate multi-threaded and microservice failures using SLF4J MDC (Mapped Diagnostic Context) with W3C traceId/spanId standards, and avoid catastrophic logging anti-patterns in production.
tags:
  - stack-traces
  - debugging
  - distributed-tracing
  - observability
  - spring-boot
  - java
  - backend-engineering
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

# Diagnosing & Tracing Spring Boot Errors: Stack Trace Anatomy, 'Caused By' Chains & MDC Distributed Tracing

In [Lesson 11.1: Java & Spring Exception Foundations](/notes/spring-boot-java-spring-exception-foundations-jvm-hierarchy-domain-architecture), we explored how the JVM constructs exception objects on the heap, the performance cost of native stack walking via `fillInStackTrace()`, and how to design clean domain exception hierarchies.

Now, we face the daily reality of engineering production systems:

> *"A critical customer transaction crashes. The client receives an opaque `500 Internal Server Error`. In your centralized logging dashboard, a 70-line wall of red text appears. How do you cut through dozens of lines of Tomcat worker threads, Spring CGLIB proxies, and reflection frames to find the exact line of code that broke? And when your system runs across 15 microservice pods handling 10,000 requests per second, how do you correlate that single failure back to the specific user request?"*

Writing code to handle exceptions is only half the discipline. The other, often more difficult half is **forensic error diagnosis and distributed tracing**.

```
+-----------------------------------------------------------------------------------+
|                     THE ERROR OBSERVABILITY TRIAD IN SPRING BOOT                  |
+-----------------------------------------------------------------------------------+
|  1. THE STACK TRACE    : The black-box flight recorder (What exploded and where)  |
|  2. "CAUSED BY" CHAINS : The forensic timeline of failure translation             |
|  3. MDC & TRACE IDS    : The digital fingerprint correlating logs across systems  |
+-----------------------------------------------------------------------------------+
```

---

## 01. First Principles: The Crime Scene Analogy

When a microservice fails in production, treat the failure like a **forensic crime scene investigation**:

- **The Stack Trace is the Black-Box Flight Recorder**: It captures the state of the thread's execution stack at the exact millisecond of the crash. It preserves every method activation record from the initial TCP socket connection down to the offending instruction.
- **The "Caused by:" Chain is the Sequence of Events**: In enterprise software, low-level physical failures (such as a database connection drop or a unique constraint violation) trigger secondary application failures (transaction rollbacks, service aborts). The `Caused by:` chain records this progression in reverse chronological order.
- **MDC (Mapped Diagnostic Context) & `traceId` is the Fingerprint**: In a cloud deployment with 20 pods running concurrently, thousands of users are executing operations simultaneously. Without a unique correlation identifier stamped onto every log line, matching a user's bug report to a specific stack trace in your log aggregator is like finding a needle in a haystack.

---

## 02. Anatomy of a JVM Stack Trace: Reading the Flight Recorder

### What Is a Stack Trace?

As established in Lesson 11.1, when an exception is instantiated, the JVM walks the current thread's call stack and creates an array of `java.lang.StackTraceElement` objects. 

Each line in a printed stack trace represents one **activation record (stack frame)**:

```text
at com.store.order.service.OrderService.processOrder(OrderService.java:84)
   |─────────────────────────────────| |──────────| |───────────────| |--|
              Declaring Class            Method Name    Source File   Line
```

- **Declaring Class**: The fully qualified package and class name (`com.store.order.service.OrderService`).
- **Method Name**: The specific method where execution was paused (`processOrder`).
- **Source File**: The compiled `.java` source file (`OrderService.java`).
- **Line Number**: The exact source code line (`84`) compiled into the bytecode's `LineNumberTable` corresponding to the Program Counter (PC).

---

### The Chronological Inversion: Why Stack Traces Read Backwards

The most critical mental model to grasp is that **stack traces are printed in reverse chronological order**:

```
+-----------------------------------------------------------------------------------------+
|                  STACK FRAME CALL SEQUENCE VS. PRINTED STACK TRACE                      |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   EXECUTION ORDER (Time Moves Forward)         PRINTED STACK TRACE (Reads Top-to-Bottom)|
|                                                                                         |
|   1. ThreadPoolWorker.run()            ───►   [TOP OF TRACE] (Most Recent / Explosion)  |
|   2. DispatcherServlet.doDispatch()    ───►    at OrderRepository.save(Line 88)         |
|   3. OrderController.createOrder()     ───►    at OrderService.processOrder(Line 42)    |
|   4. OrderService.processOrder()       ───►    at OrderController.createOrder(Line 25)  |
|   5. OrderRepository.save() [BOOM!]    ───►    at DispatcherServlet.doDispatch(Line 980)|
|                                               [BOTTOM OF TRACE] (Origin / Entry Point)  |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

1. **The Top Line of Any Block**: The instruction that was executing at the exact instant the exception was thrown.
2. **Each Successive Line Down**: The caller that invoked the method above it.
3. **The Bottom Line**: The thread entry point—typically Tomcat's worker thread pool (`TaskThread.java`) or Spring Boot's application runner.

---

## 03. The "Caused By" Chain & The Bottom-Up Rule

### Why Do Chained Exceptions Exist?

In [Lesson 11.1](/notes/spring-boot-java-spring-exception-foundations-jvm-hierarchy-domain-architecture), we learned how Spring revolutionized enterprise Java using **Exception Translation**: low-level technical exceptions (e.g., PostgreSQL driver errors) are caught by persistence frameworks (Hibernate/Spring Data) and wrapped into unchecked domain or data access exceptions (`DataIntegrityViolationException`).

When one exception is wrapped inside another, Java chains them using `Throwable.initCause(Throwable cause)`:

```java
try {
    jdbcTemplate.execute(sql);
} catch (SQLException sqlEx) {
    // Exception Translation: Chaining original root cause
    throw new DataIntegrityViolationException("Database execution failed", sqlEx);
}
```

This creates a singly linked list of `Throwable` instances on the heap:

```
[ TransactionSystemException ] ──► cause ──► [ ConstraintViolationException ] ──► cause ──► [ PSQLException ]
     (Top Wrapper: Spring)                       (Middle Layer: Hibernate)                   (Root Cause: DB)
```

---

### The "Bottom-Up Rule" of Root Cause Analysis

> **The Golden Rule**: The top line of a Spring Boot error log tells you how the framework reacted. The **last `Caused by:` block at the very bottom** tells you what actually happened.

Beginner developers often stop reading at the very first line of a stack trace:

```text
org.springframework.transaction.TransactionSystemException: Could not commit JPA transaction
```

They waste hours attempting to debug "JPA transaction settings." In reality, `TransactionSystemException` is just a high-level wrapper. The transaction could not commit because a database query failed three layers below!

---

### Step-by-Step Forensic Walkthrough of a Real Spring Boot Stack Trace

Examine this production failure log resulting from a concurrent user registration:

```text
org.springframework.transaction.TransactionSystemException: Could not commit JPA transaction
    at org.springframework.orm.jpa.JpaTransactionManager.doCommit(JpaTransactionManager.java:565)
    at org.springframework.transaction.support.AbstractPlatformTransactionManager.processCommit(AbstractPlatformTransactionManager.java:795)
    at org.springframework.transaction.support.AbstractPlatformTransactionManager.commit(AbstractPlatformTransactionManager.java:758)
    at org.springframework.transaction.interceptor.TransactionAspectSupport.commitTransactionAfterReturning(TransactionAspectSupport.java:658)
    at org.springframework.transaction.interceptor.TransactionAspectSupport.invokeWithinTransaction(TransactionAspectSupport.java:407)
    at org.springframework.transaction.interceptor.TransactionInterceptor.invoke(TransactionInterceptor.java:119)
    at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:186)
    at org.springframework.aop.framework.CglibAopProxy$CglibMethodInvocation.proceed(CglibAopProxy.java:763)
    at com.store.user.service.UserService$$SpringCGLIB$$0.registerUser(<generated>)
    at com.store.user.web.UserController.register(UserController.java:34)
    at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
    ... 45 lines of Spring MVC and Tomcat internals omitted ...
Caused by: org.hibernate.exception.ConstraintViolationException: could not execute statement [ERROR: duplicate key value violates unique constraint "users_email_key"]
    at org.hibernate.exception.internal.SQLStateConverter.convert(SQLStateConverter.java:95)
    at org.hibernate.exception.internal.StandardSQLExceptionConverter.convert(StandardSQLExceptionConverter.java:58)
    at org.hibernate.engine.jdbc.spi.SqlExceptionHelper.convert(SqlExceptionHelper.java:108)
    at org.hibernate.engine.jdbc.internal.ResultSetReturnImpl.executeUpdate(ResultSetReturnImpl.java:206)
    at org.hibernate.persister.entity.AbstractEntityPersister.insert(AbstractEntityPersister.java:3400)
    ... 28 lines omitted ...
Caused by: org.postgresql.util.PSQLException: ERROR: duplicate key value violates unique constraint "users_email_key"
  Detail: Key (email)=(alex.dev@enterprise.com) already exists.
    at org.postgresql.core.v3.QueryExecutorImpl.receiveErrorResponse(QueryExecutorImpl.java:2713)
    at org.postgresql.core.v3.QueryExecutorImpl.processResults(QueryExecutorImpl.java:2401)
    at org.postgresql.core.v3.QueryExecutorImpl.execute(QueryExecutorImpl.java:368)
    at org.postgresql.jdbc.PgStatement.executeInternal(PgStatement.java:498)
    at com.store.user.service.UserService.registerUser(UserService.java:56)
```

#### How to Read This in Under 5 Seconds:

```
Step 1: Glance at Top Line  ──► "TransactionSystemException" (Acknowledge, but do not stop here)
Step 2: Scroll to Bottom    ──► Find the last "Caused by:" block
Step 3: Read Root Cause     ──► "PSQLException: duplicate key value violates unique constraint"
Step 4: Read Detail Text    ──► "Key (email)=(alex.dev@enterprise.com) already exists."
Step 5: Find Your Code Line ──► "UserService.java:56" (The exact line where the entity was saved)
```

Within seconds, the diagnosis is crystal clear: A user attempted to register with an email that was inserted concurrently by another request. The remedy is not fixing transaction configs—it is adding a duplicate email check or catching `DataIntegrityViolationException` to return an HTTP `409 Conflict`.

---

## 04. Filtering the "Framework Noise"

In an enterprise Spring Boot microservice, a single stack trace often spans **80 to 120 lines**. Over 80% of those lines are framework plumbing that you will never need to modify.

To debug effectively, train your eyes to categorize and filter out the four layers of **Framework Noise**:

```
+-----------------------------------------------------------------------------------------+
|                         FILTERING THE FOUR LAYERS OF FRAMEWORK NOISE                    |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   LAYER 1: Container Thread Pool & Sockets (IGNORE)                                     |
|   - org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun()                     |
|   - org.apache.catalina.core.StandardEngineValve.invoke()                              |
|                                                                                         |
|   LAYER 2: Servlet Filter Chain (IGNORE UNLESS DEBUGGING AUTH/CORS)                     |
|   - org.springframework.security.web.FilterChainProxy.doFilter()                       |
|   - org.springframework.web.filter.OncePerRequestFilter.doFilter()                     |
|                                                                                         |
|   LAYER 3: Spring MVC Dispatching (IGNORE UNLESS DEBUGGING ARGUMENT RESOLUTION)         |
|   - org.springframework.web.servlet.DispatcherServlet.doDispatch()                     |
|   - org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter |
|                                                                                         |
|   LAYER 4: Dynamic Proxies, AOP & Reflection (IGNORE)                                   |
|   - com.store.service.UserService$$SpringCGLIB$$0                                      |
|   - org.springframework.aop.framework.CglibAopProxy                                    |
|   - jdk.internal.reflect.DirectMethodHandleAccessor.invoke                              |
|                                                                                         |
|   ===================================================================================   |
|   >>> THE SIGNAL: Your Application Packages (FOCUS HERE!) <<<                           |
|   - com.store.user.service.UserService.registerUser(UserService.java:56)                |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

### Visual Log Filtering Strategy

When reviewing logs in an IDE console or terminal, use your logging framework's pattern configuration to de-emphasize framework noise:

```xml
<!-- logback-spring.xml -->
<configuration>
    <!-- Truncate logger names to 30 characters and colorize output -->
    <property name="CONSOLE_LOG_PATTERN" 
              value="%d{HH:mm:ss.SSS} %highlight(%-5level) [%cyan(%thread)] %logger{30}: %msg%n%rootException"/>
    
    <!-- Mute noisy third-party frameworks to WARN or ERROR in production -->
    <logger name="org.apache.catalina" level="WARN"/>
    <logger name="org.springframework.web" level="INFO"/>
    <logger name="org.hibernate" level="WARN"/>
    
    <!-- Keep application code verbose -->
    <logger name="com.store" level="DEBUG"/>
</configuration>
```

---

## 05. The Distributed Observability Crisis: Why Local Logging Fails in Production

In local development, you run a single JVM instance on `localhost`. When an error occurs, you look at your IDE terminal, and the cause is immediately visible.

In production, architecture looks completely different:

```
[ Client Request ]
       │
       ▼
[ Cloudflare CDN ]
       │
       ▼
[ Kubernetes Ingress / Envoy Gateway ]
       │
       ├─────────────────────────────────┬─────────────────────────────────┐
       ▼                                 ▼                                 ▼
[ Pod: order-service-a1 ]       [ Pod: order-service-b2 ]       [ Pod: order-service-c3 ]
       │                                 │                                 │
       └─────────────────────────────────┼─────────────────────────────────┘
                                         ▼
            [ Centralized Log Aggregator: Datadog / Elasticsearch / Loki ]
            (Ingesting 25,000 log lines per second from 50 different microservices)
```

Now, consider this naive log statement written by a developer:

```java
// USELESS PRODUCTION LOG
catch (Exception e) {
    logger.error("Failed to process order: " + e.getMessage());
}
```

In your centralized logging dashboard (Datadog, Kibana, or CloudWatch), this produces:

```text
2026-11-16 00:35:10.142 ERROR 1 --- [order-service] [nio-8080-exec-4] : Failed to process order: Connection reset
```

#### Why This Log Is Completely Useless:
1. **Zero Context**: Which customer experienced this? What was the order ID? What was the total amount?
2. **Missing Stack Trace**: Because the developer used string concatenation (`+ e.getMessage()`) instead of passing `e` as an argument, **the entire stack trace was discarded**. You have no idea which class or line number failed.
3. **No Correlation**: Out of 500 orders processed that second across 3 pods, which incoming HTTP request triggered this failure?

---

## 06. MDC (Mapped Diagnostic Context) & Distributed Tracing Deep Dive

To solve the distributed observability crisis, the software industry standardizes on **Contextual Logging** using **MDC (Mapped Diagnostic Context)** and **Distributed Tracing**.

---

### What Is MDC?

Provided by SLF4J (and natively implemented by Logback and Log4j2), **MDC** is a thread-local key-value store designed specifically for logging.

```
                  +-----------------------------------+
                  |   ThreadLocal<Map<String, String>>|
                  |-----------------------------------|
                  | "traceId" : "4bf92f3577b34da6"    |
                  | "userId"  : "USR-9921"            |
                  | "tenant"  : "EU-WEST"             |
                  +-----------------+-----------------+
                                    │
           Accessed automatically by Logback Appenders
                                    ▼
       Appended to EVERY log statement executed on this thread!
```

When a key-value pair is placed into `MDC`, you do **not** need to manually pass it to your logger calls. Every subsequent log statement executed by that thread automatically inherits those contextual tags!

---

### Implementing a Production `MdcLoggingFilter`

In Spring Boot, the entry point for HTTP requests is a Servlet Filter. We create an `MdcLoggingFilter` that intercepts every incoming request, extracts or generates a unique **`traceId`**, and populates the MDC:

```java
package com.store.common.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE) // Must run before Security and Controller advisories
public class MdcLoggingFilter extends OncePerRequestFilter {

    public static final String TRACE_ID_KEY = "traceId";
    public static final String TRACE_HEADER = "X-Trace-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        // 1. Inherit traceId from upstream API Gateway or generate a fresh UUID
        String traceId = request.getHeader(TRACE_HEADER);
        if (traceId == null || traceId.isBlank()) {
            traceId = UUID.randomUUID().toString().replace("-", "");
        }

        // 2. Attach traceId to outgoing HTTP response headers for client tracking
        response.setHeader(TRACE_HEADER, traceId);

        try {
            // 3. Bind to current thread's MDC context
            MDC.put(TRACE_ID_KEY, traceId);

            // 4. Proceed down the filter chain to controllers and business services
            filterChain.doFilter(request, response);
        } finally {
            // 5. CRITICAL: Clear MDC to prevent Thread-Pool pollution!
            MDC.remove(TRACE_ID_KEY);
            // Alternatively: MDC.clear();
        }
    }
}
```

---

### The Critical Invariant: Why You Must Clear MDC in `finally`

In Servlet containers like Tomcat or Undertow, worker threads are **pooled and reused**:

```
Request 1 arrives ──► Tomcat assigns Thread-1 ──► Sets MDC traceId="AAA" ──► Finishes
Request 2 arrives ──► Tomcat reuses Thread-1  ──► (If not cleared, Thread-1 still has traceId="AAA"!)
```

If you fail to call `MDC.remove()` or `MDC.clear()` inside a `finally` block:
- When Thread-1 is assigned to a completely different user 5 milliseconds later, it will still retain the previous user's `traceId`!
- Your logs will show logs from User B tagged with User A's ID, completely corrupting your audit trails and debugging metrics.
- In virtual thread runtimes (Java 21 Project Loom), un-cleared thread locals prevent virtual thread carrier memory reclamation, causing subtle memory leaks.

---

### Configuring Logback to Output the `traceId`

In `logback-spring.xml`, reference the MDC key using **`%X{traceId}`**:

```xml
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <!-- Pattern includes [%X{traceId}] -->
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%X{traceId}] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE" />
    </root>
</configuration>
```

Now, every log line produced during that request automatically carries the trace token:

```text
2026-11-16 00:40:01.102 [4bf92f3577b34da6] INFO  c.s.o.s.OrderService - Validating inventory for SKU-9821
2026-11-16 00:40:01.145 [4bf92f3577b34da6] INFO  c.s.o.s.PaymentService - Charging payment method token
2026-11-16 00:40:01.210 [4bf92f3577b34da6] ERROR c.s.o.s.OrderService - Insufficient inventory for SKU-9821
```

When a user submits a support ticket with `X-Trace-Id: 4bf92f3577b34da6`, an engineer enters that token into Kibana or Datadog and sees **only the log statements from that exact transaction**, completely isolated from thousands of other concurrent requests!

---

### Modern Spring Boot 3 Standard: Micrometer Tracing & W3C TraceContext

In Spring Boot 3, manual MDC filters are often superseded by **Micrometer Tracing** (the production successor to Spring Cloud Sleuth):

```xml
<!-- pom.xml -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>
```

Micrometer Tracing natively implements the **W3C Trace Context specification**, automatically injecting two standardized variables into your logs:
- **`traceId`**: Identifies the entire end-to-end distributed transaction across all microservices (e.g., Gateway → Order Service → Payment Service).
- **`spanId`**: Identifies the specific unit of work within a single microservice.

```text
2026-11-16 00:40:01.102 [order-service,4bf92f3577b34da6,00f067aa0ba902b7] INFO ...
                         |───────────| |───────────────| |───────────────|
                          App Name         traceId            spanId
```

---

## 07. The Top 4 Spring Boot "Crime Scenes" (Failure Signatures)

Let us examine the four most notorious exception signatures in Spring Boot backend development, how they present in stack traces, and how to resolve them:

---

### Crime Scene 1: `LazyInitializationException` (The Hibernate Session Trap)

#### The Stack Trace Signature:
```text
org.hibernate.LazyInitializationException: failed to lazily initialize a collection of role: 
com.store.customer.domain.Customer.orders: could not initialize proxy - no Session
    at org.hibernate.collection.spi.AbstractPersistentCollection.throwLazyInitializationException(AbstractPersistentCollection.java:634)
    at org.hibernate.collection.spi.AbstractPersistentCollection.withTemporarySessionIfNeeded(AbstractPersistentCollection.java:271)
    at org.hibernate.collection.spi.AbstractPersistentCollection.readSize(AbstractPersistentCollection.java:188)
    at com.store.customer.web.CustomerController.getCustomerSummary(CustomerController.java:42)
```

#### Forensic Diagnosis:
1. `Customer.orders` is configured with `FetchType.LAZY` (the default for `@OneToMany`).
2. The service method loaded the `Customer` inside a `@Transactional` boundary and returned it to `CustomerController`.
3. When the service method finished, Spring's transaction manager closed the database transaction and detached the Hibernate `Session`.
4. At line 42 of `CustomerController`, code called `customer.getOrders().size()`. Because the session was already closed, Hibernate could not issue a SQL query to load the collection, throwing `LazyInitializationException`.

#### Production Fix:
Never access lazy database collections in the controller tier. Fetch the required data within the service transaction using a **`JOIN FETCH` query**, an **`@EntityGraph`**, or map the entity to a clean **DTO** before leaving the service layer.

---

### Crime Scene 2: `HttpMessageNotReadableException` (Malformed Ingress JSON)

#### The Stack Trace Signature:
```text
org.springframework.http.converter.HttpMessageNotReadableException: JSON parse error: 
Cannot deserialize value of type `com.store.order.domain.OrderStatus` from String "shipped": not one of the values accepted for Enum class: [PENDING, SHIPPED, DELIVERED]
    at org.springframework.http.converter.json.AbstractJackson2HttpMessageConverter.readJavaType(AbstractJackson2HttpMessageConverter.java:406)
    ...
Caused by: com.fasterxml.jackson.databind.exc.InvalidFormatException: Cannot deserialize value of type `com.store.order.domain.OrderStatus` from String "shipped": not one of the values accepted for Enum class: [PENDING, SHIPPED, DELIVERED]
 at [Source: (org.springframework.util.StreamUtils$NonClosingInputStream); line: 3, column: 15] (through reference chain: com.store.order.dto.CreateOrderRequest["status"])
```

#### Forensic Diagnosis:
1. Look at the `Caused by: com.fasterxml.jackson.databind.exc.InvalidFormatException`.
2. Notice: `line: 3, column: 15` in the JSON body.
3. The client sent lowercase `"shipped"`, but the Java enum defines uppercase `[PENDING, SHIPPED, DELIVERED]`.
4. This is a client error (`400 Bad Request`), not an internal server crash.

---

### Crime Scene 3: `ObjectOptimisticLockingFailureException` (Concurrent Updates)

#### The Stack Trace Signature:
```text
org.springframework.orm.ObjectOptimisticLockingFailureException: Object of class [com.store.inventory.domain.Stock] with identifier [SKU-100]: optimistic locking failed
    at org.springframework.orm.jpa.vendor.HibernateJpaDialect.convertHibernateAccessException(HibernateJpaDialect.java:316)
    ...
Caused by: org.hibernate.StaleObjectStateException: Row was updated or deleted by another transaction (or unsaved-value mapping was incorrect) : [com.store.inventory.domain.Stock#SKU-100]
```

#### Forensic Diagnosis:
1. The entity uses `@Version` for optimistic locking.
2. Two concurrent transactions read the stock record at version 4.
3. Transaction A committed first, bumping the version to 5.
4. When Transaction B attempted to commit, Hibernate executed `UPDATE stock WHERE id = 'SKU-100' AND version = 4`. Because 0 rows were updated, Hibernate detected a race condition and aborted.
5. In an API, this should be caught and translated to **`409 Conflict`** or automatically retried using Spring Retry.

---

### Crime Scene 4: `BeanCreationException` / `NoSuchBeanDefinitionException` (Startup Crash)

#### The Stack Trace Signature:
```text
org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'orderController': 
Unsatisfied dependency expressed through constructor parameter 0: No qualifying bean of type 'com.store.payment.PaymentClient' available
    at org.springframework.beans.factory.support.ConstructorResolver.createArgumentArray(ConstructorResolver.java:800)
    ...
Caused by: org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'com.store.payment.PaymentClient' available: expected at least 1 bean which qualifies as autowire candidate.
```

#### Forensic Diagnosis:
1. `OrderController` requires a `PaymentClient` bean in its constructor.
2. Spring's `ApplicationContext` scanned the classpath but found zero beans implementing `PaymentClient`.
3. Root cause: The developer forgot to annotate `PaymentClientImpl` with `@Service` or `@Component`, or it resides in a package outside the `@ComponentScan` base package.

---

## 08. Logging Hygiene: Avoiding Catastrophic Production Anti-Patterns

### Anti-Pattern 1: The "Log and Throw" Double-Logging Disaster

Consider a typical 3-tier enterprise architecture:

```java
// REPOSITORY TIER
public User findById(UUID id) {
    try {
        return jdbcTemplate.queryForObject(...);
    } catch (EmptyResultDataAccessException e) {
        logger.error("User not found in DB: " + id, e); // LOG #1
        throw new UserNotFoundException(id, e);
    }
}

// SERVICE TIER
public User getUser(UUID id) {
    try {
        return userRepository.findById(id);
    } catch (UserNotFoundException e) {
        logger.error("Service error retrieving user: " + id, e); // LOG #2
        throw e;
    }
}

// CONTROLLER TIER
@GetMapping("/{id}")
public UserResponse getUser(@PathVariable UUID id) {
    try {
        return userService.getUser(id);
    } catch (Exception e) {
        logger.error("Controller failed for user: " + id, e); // LOG #3
        throw e;
    }
}
```

#### The Production Impact:
- A single missing user generates **three duplicate 60-line stack traces** in your production logs (180 lines of log clutter!).
- Centralized log ingestion quotas (Datadog / Splunk) are consumed 3x faster, driving up infrastructure costs.
- Automated alert triggers (e.g., Slack alerts on error spikes) fire 3 times for a single event.

> **The Architectural Rule of Law**: **Log it OR Throw it. Never both.**  
> If an exception is recoverable, handle it and log it. If it is unrecoverable, wrap it and rethrow it. Allow the **outermost boundary** (`@RestControllerAdvice`) to perform the single, authoritative log entry.

---

### Anti-Pattern 2: The "Forgotten Cause" (String Concatenation Trap)

```java
// CATASTROPHIC ANTI-PATTERN: Discards stack trace
catch (SQLException e) {
    logger.error("Database query failed: " + e.getMessage());
}
```

When an exception is concatenated into a string (`+ e.getMessage()`), Java invokes `e.toString()`. The resulting log output contains only the message text. **The entire stack trace array is dropped on the floor and lost forever.**

#### The Correct Fix:
Pass the exception instance as the final argument to SLF4J:

```java
// IDIOMATIC SLF4J: Preserves full stack trace
catch (SQLException e) {
    logger.error("Database query failed for account ID {}", accountId, e);
}
```

SLF4J recognizes `Throwable` as the final parameter, formats the parameterized string (`{}`), and automatically appends the complete stack trace to the log event.

---

### Anti-Pattern 3: Logging Stack Traces for 4xx Client Errors

When a client submits an invalid password, an expired token, or a non-existent order ID:

```java
// DANGEROUS: Wakes up on-call engineers for client typos
@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<ProblemDetail> handleNotFound(ResourceNotFoundException ex) {
    logger.error("Resource not found", ex); // Emits ERROR with full stack trace!
    return ResponseEntity.status(404).body(...);
}
```

#### Why This Is Damaging:
- Monitoring systems alert on `ERROR`-level log spikes. If an external bot scans your site requesting random URLs, thousands of 404s will flood your monitoring dashboards with red `ERROR` alerts, fatiguing on-call engineering teams.
- A 404 or 422 is an ordinary, expected client mistake—not an application crash.

#### Production Logging Hierarchy:
- **`ERROR` with full stack trace**: Reserved strictly for unhandled 5xx server failures, database crashes, and unexpected runtime bugs.
- **`WARN` with concise one-line message (no stack trace)**: Used for 4xx client errors, invalid credentials, rate-limiting triggers, or expected fallback activations:
  ```java
  logger.warn("Resource not found: {} (traceId={})", ex.getMessage(), traceId);
  ```

---

## 09. Authoritative References & Further Reading

To explore JVM stack trace mechanics, SLF4J logging internals, and distributed tracing architectures at the source, consult these canonical resources:

- [SLF4J Official Documentation — Mapped Diagnostic Context (MDC)](https://www.slf4j.org/manual.html#mdc)  
  *The authoritative specification and programming guide for thread-local diagnostic contextual logging.*
- [W3C Recommendation — Trace Context Standard](https://www.w3.org/TR/trace-context/)  
  *The international standard defining the traceparent and tracestate HTTP headers for distributed context propagation.*
- [Spring Boot 3 Official Documentation — Observability & Tracing](https://docs.spring.io/spring-boot/reference/actuator/observability.html)  
  *Comprehensive guide to Micrometer Tracing, OpenTelemetry bridges, and automated log correlation.*
- [Logback Architecture & Encoder Patterns](https://logback.qos.ch/manual/layouts.html)  
  *Detailed reference on Logback conversion words, %X MDC pattern extraction, and root exception converters.*
- [Martin Fowler — Microservice Observability & Distributed Tracing](https://martinfowler.com/articles/distributed-tracing-patterns.html)  
  *Foundational architectural patterns governing request tracing, correlation identifiers, and forensic failure analysis across microservices.*
