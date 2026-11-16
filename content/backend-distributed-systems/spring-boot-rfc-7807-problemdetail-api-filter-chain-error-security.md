---
title: "Modern RFC 7807 Standard, ProblemDetail API & Production Security Hardening"
slug: spring-boot-rfc-7807-problemdetail-api-filter-chain-error-security
subject: backend-distributed-systems
abstract: An architectural, mentor-led guide to standardized API error contracts and production security hardening in Spring Boot 3. Master the IETF RFC 7807 and RFC 9457 Problem Details specifications, implement Spring Boot 3's native ProblemDetail API with custom diagnostic extensions, solve the notorious Filter-Chain Security Blindspot using HandlerExceptionResolver delegation, understand container-level BasicErrorController fallbacks, and prevent CWE-209 sensitive information leaks in production.
tags:
  - problem-detail
  - rfc-7807
  - rfc-9457
  - api-security
  - spring-boot-3
  - spring-mvc
  - java
published: true
publishDate: Nov 16, 2026
updatedDate: Nov 16, 2026
readTime: 24m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
---

# Modern RFC 7807 Standard, ProblemDetail API & Production Security Hardening

In our journey through error handling, we have advanced step-by-step from the core runtime to centralized web advisories:
1. In [Lesson 11.1: Java & Spring Exception Foundations](/notes/spring-boot-java-spring-exception-foundations-jvm-hierarchy-domain-architecture), we explored how the JVM unwinds stack frames, why Spring abandoned checked exceptions in favor of unchecked **Exception Translation**, and how to design clean domain hierarchies (`ResourceNotFoundException`, `BusinessConflictException`).
2. In [Lesson 11.2: Diagnosing & Tracing Errors](/notes/spring-boot-diagnosing-tracing-errors-stack-trace-anatomy-caused-by-mdc), we mastered reading dense stack traces, identifying root causes at the bottom of the `Caused by:` chain, and correlating failures across microservices using SLF4J MDC and `traceId`.
3. In [Lesson 11.3: Centralized Exception Handling](/notes/spring-boot-centralized-exception-handling-restcontrolleradvice-exceptionhandler-responseentityexceptionhandler), we learned how `DispatcherServlet` routes errors through `ExceptionHandlerExceptionResolver`, how to build `@RestControllerAdvice` classes, and why extending `ResponseEntityExceptionHandler` preserves standard framework error handling.

Now, we address the final, critical frontier of enterprise error architecture:

> *"In an ecosystem of hundreds of public APIs and internal microservices, how do we stop inventing custom error formats and adopt an internationally standardized error contract? How do we handle security exceptions thrown in Servlet Filters before the `DispatcherServlet` is even reached? And how do we harden our application against leaking sensitive database schemas and stack traces to potential attackers?"*

```
+-----------------------------------------------------------------------------------------+
|                  THE PRODUCTION ERROR ARCHITECTURE CHECKLIST                            |
+-----------------------------------------------------------------------------------------+
|  1. STANDARDIZATION : Replace custom ad-hoc JSON with IETF RFC 7807 / RFC 9457          |
|  2. FRAMEWORK API   : Use Spring Boot 3's native ProblemDetail class                    |
|  3. FILTER BRIDGING : Route pre-controller filter exceptions to @RestControllerAdvice   |
|  4. SECURITY        : Eliminate CWE-209 stack trace and internal schema leakage         |
+-----------------------------------------------------------------------------------------+
```

---

## 01. The Problem Space: The API Error Fragmentation Crisis

### What Is Error Fragmentation?

In software engineering, **API Error Fragmentation** refers to the chaotic state where different engineering teams, third-party vendors, and microservices each invent their own unique JSON structure to communicate failures.

To understand why this is a crisis, imagine you are a frontend engineer building a checkout application that talks to three services:
- **Service A (Auth)** returns: `{ "error": "Invalid token", "code": 401 }`
- **Service B (Inventory)** returns: `{ "status": "OUT_OF_STOCK", "message": "Item unavailable" }`
- **Service C (Payments)** returns: `{ "errors": [ { "field": "cvv", "issue": "invalid" } ] }`

Your frontend code cannot write a universal error-handling interceptor. Every single API integration requires custom parsing logic, custom UI banner renderers, and defensive checks for missing fields. 

If a backend team decides to rename `"error"` to `"errorMessage"`, mobile applications crash in production.

---

### The Solution: The IETF RFC 7807 & RFC 9457 Standards

To eliminate this fragmentation, the **Internet Engineering Task Force (IETF)** published **RFC 7807 (Problem Details for HTTP APIs)**, which was later refined and superseded by **RFC 9457**.

**What is RFC 7807 / RFC 9457?**  
In plain words: It is an international standard that defines a single, uniform JSON and XML document format for reporting machine-readable errors from HTTP APIs.

Instead of guessing what fields an error response will contain, every client in the world knows that an RFC-compliant API will emit a predictable schema registered under a dedicated MIME media type:

```http
Content-Type: application/problem+json
```

---

## 02. Deconstructing the RFC 7807 / RFC 9457 Specification

An RFC 9457 Problem Detail document consists of **five standard members**, accompanied by optional **extension members**.

```
+-----------------------------------------------------------------------------------------+
|                     ANATOMY OF AN RFC 9457 PROBLEM DETAIL WIRE FRAME                    |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   HTTP/1.1 409 Conflict                                                                 |
|   Content-Type: application/problem+json                                                |
|                                                                                         |
|   {                                                                                     |
|     "type": "https://api.store.com/errors/out-of-stock",    <── Standard Member 1      |
|     "title": "Inventory Exhausted",                         <── Standard Member 2      |
|     "status": 409,                                          <── Standard Member 3      |
|     "detail": "Product SKU-9821 has 0 available units.",    <── Standard Member 4      |
|     "instance": "/api/v1/orders/ORD-98421/items",           <── Standard Member 5      |
|                                                                                         |
|     "invalid-params": [                                     <── Extension Member 1     |
|       { "name": "quantity", "reason": "Requested 5, available 0" }                     |
|     ],                                                                                  |
|     "traceId": "4bf92f3577b34da6",                          <── Extension Member 2     |
|     "timestamp": "2026-11-16T22:15:00Z"                     <── Extension Member 3     |
|   }                                                                                     |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

---

### The Five Standard Members Explained in Words

1. **`type` (URI Reference)**:  
   A URI that identifies the specific category of the problem. When entered into a web browser, it should ideally lead to documentation explaining what the error means and how a developer can resolve it. If no specific documentation exists, RFC specifies the fallback value `"about:blank"`.
2. **`title` (String)**:  
   A short, human-readable summary of the problem type. **Critical Rule**: The title should be static and not change between occurrences of the same error (e.g., always `"Inventory Exhausted"` or `"Resource Not Found"`).
3. **`status` (Integer)**:  
   The HTTP status code generated by the origin server for this occurrence (`404`, `409`, `422`, `500`). It must match the actual status code in the HTTP response line.
4. **`detail` (String)**:  
   A human-readable explanation specific to *this exact occurrence* of the failure. Unlike the title, the detail is dynamic and contains contextual details (e.g., `"Product SKU-9821 has 0 available units"`).
5. **`instance` (URI Reference)**:  
   A relative or absolute URI identifying the specific endpoint or entity that experienced the problem (e.g., `/api/v1/orders/ORD-98421/items`).

---

### Extension Members ("Custom Properties")

Real-world enterprise systems need to convey diagnostic data beyond the five standard fields—such as distributed tracing tokens (`traceId`), timestamps, and field-level validation errors.

RFC 9457 explicitly permits **Extension Members**: custom JSON keys placed at the root level of the problem object. Client libraries parse the five standard fields generically, while domain-specific clients can inspect the extension members for deeper automation.

---

## 03. Spring Boot 3's Native `ProblemDetail` Architecture

### What Is the `ProblemDetail` Class?

Prior to Spring Boot 3, implementing RFC 7807 required third-party libraries (such as Zalando Problem) or manual DTO creation.

Starting in **Spring Boot 3 and Spring Framework 6**, Spring introduced native, built-in support via:

```
org.springframework.http.ProblemDetail
```

This class encapsulates all standard RFC members alongside a dynamic `Map<String, Object>` for custom extension properties.

---

### Auto-Configuration: Enabling Problem Details Globally

Spring Boot 3 provides an out-of-the-box configuration property that activates RFC 7807 across the entire framework.

#### What We Are Doing in the Below Configuration:
We are instructing Spring Boot's internal `ResponseEntityExceptionHandler` to automatically convert all standard Spring MVC framework exceptions (such as `HttpRequestMethodNotSupportedException`, `MethodArgumentNotValidException`, and `NoResourceFoundException`) into standard `application/problem+json` payloads without requiring any custom code.

```yaml
# application.yml
spring:
  mvc:
    problemdetails:
      enabled: true
```

When this flag is `true`, if a client sends a `POST` request to a `GET`-only route, Spring MVC automatically emits an RFC-compliant response:

```http
HTTP/1.1 405 Method Not Allowed
Content-Type: application/problem+json

{
  "type": "about:blank",
  "title": "Method Not Allowed",
  "status": 405,
  "detail": "Method 'POST' is not supported.",
  "instance": "/api/v1/users/summary"
}
```

---

## 04. Customizing `ProblemDetail` in `@RestControllerAdvice`

While auto-configuration handles standard framework errors, production applications must map their own **custom domain exceptions** (from Lesson 11.1) to `ProblemDetail`.

---

### Instantiating `ProblemDetail` Programmatically

Spring's `ProblemDetail` provides clean static factory methods:

```java
// Basic factory by status
ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);

// Factory with status and dynamic detail text
ProblemDetail problem = ProblemDetail.forStatusAndDetail(
    HttpStatus.CONFLICT, 
    "Email address 'alex@store.com' is already registered."
);
```

You can then customize the standard members and attach arbitrary metadata using `.setProperty(key, value)`:

```java
problem.setType(URI.create("https://api.store.com/errors/duplicate-email"));
problem.setTitle("Email Conflict");
problem.setProperty("traceId", traceId);
problem.setProperty("timestamp", Instant.now());
```

---

### Overriding Validation Failures in `ResponseEntityExceptionHandler`

In [Lesson 11.3](/notes/spring-boot-centralized-exception-handling-restcontrolleradvice-exceptionhandler-responseentityexceptionhandler), we learned how to extend `ResponseEntityExceptionHandler`. In Spring Boot 3, the hook methods are designed specifically to work with `ProblemDetail`.

#### What We Are Doing in the Below Code:
We are creating a centralized `@RestControllerAdvice` that extends `ResponseEntityExceptionHandler`. We do three things:
1. We handle domain exceptions (`ResourceNotFoundException`, `BusinessConflictException`) and convert them into customized `ProblemDetail` objects.
2. We override `handleMethodArgumentNotValid()` to extract Jakarta validation `FieldError` items and format them into an RFC-recommended `invalid-params` extension block.
3. We inject our distributed `traceId` from SLF4J MDC into every error payload.

```java
package com.store.common.advice;

import com.store.common.exception.BusinessConflictException;
import com.store.common.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice
public class ModernProblemDetailsHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ModernProblemDetailsHandler.class);
    private static final String DOCS_BASE_URI = "https://api.store.com/errors/";

    // =========================================================================
    // 1. DOMAIN EXCEPTION HANDLERS
    // =========================================================================

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleResourceNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        String traceId = resolveTraceId();
        log.warn("Resource missing: {} [traceId={}]", ex.getMessage(), traceId);

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setType(URI.create(DOCS_BASE_URI + "resource-not-found"));
        problem.setTitle("Resource Not Found");
        problem.setInstance(URI.create(request.getRequestURI()));

        // Attach custom diagnostic extension properties
        problem.setProperty("traceId", traceId);
        problem.setProperty("timestamp", Instant.now());
        problem.setProperty("metadata", ex.getMetadata());

        return problem;
    }

    @ExceptionHandler(BusinessConflictException.class)
    public ProblemDetail handleBusinessConflict(BusinessConflictException ex, HttpServletRequest request) {
        String traceId = resolveTraceId();
        log.warn("Conflict detected: {} [traceId={}]", ex.getMessage(), traceId);

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setType(URI.create(DOCS_BASE_URI + "business-conflict"));
        problem.setTitle("Business State Conflict");
        problem.setInstance(URI.create(request.getRequestURI()));

        problem.setProperty("traceId", traceId);
        problem.setProperty("timestamp", Instant.now());
        problem.setProperty("errorCode", ex.getErrorCode());

        return problem;
    }

    // =========================================================================
    // 2. OVERRIDDEN FRAMEWORK HOOKS (Spring Boot 3 ProblemDetail Structure)
    // =========================================================================

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        String traceId = resolveTraceId();
        String requestUri = (request instanceof ServletWebRequest swr) ? swr.getRequest().getRequestURI() : "/";
        log.warn("Payload validation failed on URI: {} [traceId={}]", requestUri, traceId);

        // Build base ProblemDetail with 422 Unprocessable Content
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.UNPROCESSABLE_ENTITY, 
                "Validation failed for one or more payload arguments."
        );
        problem.setType(URI.create(DOCS_BASE_URI + "validation-error"));
        problem.setTitle("Invalid Request Content");
        problem.setInstance(URI.create(requestUri));

        // Format field violations into an RFC 9457 extension array
        List<Map<String, String>> invalidParams = new ArrayList<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            invalidParams.add(Map.of(
                    "name", fe.getField(),
                    "reason", fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value"
            ));
        }

        problem.setProperty("invalid-params", invalidParams);
        problem.setProperty("traceId", traceId);
        problem.setProperty("timestamp", Instant.now());

        return new ResponseEntity<>(problem, headers, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    private String resolveTraceId() {
        String traceId = MDC.get("traceId");
        return (traceId != null && !traceId.isBlank()) ? traceId : UUID.randomUUID().toString().replace("-", "");
    }
}
```

---

## 05. The Filter-Chain Security Blindspot: Handling Pre-DispatcherServlet Exceptions

### What Is the Filter-Chain Blindspot?

In production Spring Boot applications, security verification (e.g., verifying JWT tokens, checking API keys, or applying rate limits) is performed inside **Servlet Filters**, such as Spring Security's `FilterChainProxy`.

Here is the architectural boundary that catches many engineering teams by surprise:

```
+-----------------------------------------------------------------------------------------+
|                  THE FILTER-CHAIN VS. DISPATCHERSERVLET BOUNDARY                        |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   1. Client HTTP Request (with Expired JWT Token)                                       |
|           │                                                                             |
|           ▼                                                                             |
|   [ Embedded Tomcat Engine ]                                                            |
|           │                                                                             |
|           ▼                                                                             |
|   [ Servlet Filter Chain ]                                                              |
|   ┌─────────────────────────────────────────────────────────────────────────────────┐   |
|   │ JwtAuthenticationFilter                                                         │   |
|   │ ──► Validates JWT Signature                                                     │   |
|   │ ──► [EXCEPTION THROWN!] throw new ExpiredJwtException("Token expired");         │   |
|   └───────────────────────────────────────┬─────────────────────────────────────────┘   |
|                                           │                                             |
|                                           │ (NEVER REACHED!)                            |
|                                           ▼                                             |
|   +─────────────────────────────────────────────────────────────────────────────────+   |
|   | DispatcherServlet (Spring MVC Front Controller)                                 |   |
|   |   └── GlobalExceptionHandler (@RestControllerAdvice)                            |   |
|   +─────────────────────────────────────────────────────────────────────────────────+   |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

#### Why `@RestControllerAdvice` Fails Here:
- The Servlet Filter Chain executes **outside and before** the `DispatcherServlet`.
- When an exception is thrown inside a filter, execution never enters `DispatcherServlet.doDispatch()`.
- Because the exception never reaches the `DispatcherServlet`, Spring MVC's **`ExceptionHandlerExceptionResolver` is never invoked**.
- By default, the exception bubbles directly back into the Tomcat container, which prints an unformatted white-label error page or an empty `403 Forbidden` response, completely bypassing your RFC 7807 `ProblemDetail` contracts!

---

### The Architectural Remedy: `HandlerExceptionResolver` Delegation

To solve this blindspot, we must manually bridge the gap between the Servlet Filter Chain and Spring MVC's exception resolver pipeline.

```
+-----------------------------------------------------------------------------------------+
|                  BRIDGING THE FILTER GAP VIA HANDLEREXCEPTIONRESOLVER                   |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   JwtAuthenticationFilter intercepts Request                                            |
|   ┌─────────────────────────────────────────────────────────────────────────────────┐   |
|   │ try {                                                                           │   |
|   │     validateToken(jwt);                                                         │   |
|   │     filterChain.doFilter(request, response);                                    │   |
|   │ } catch (JwtException ex) {                                                     │   |
|   │     // MANUALLY DELEGATE TO SPRING MVC'S RESOLVER!                              │   |
|   │     handlerExceptionResolver.resolveException(request, response, null, ex);     │   |
|   │ }                                                                               │   |
|   └───────────────────────────────────────┬─────────────────────────────────────────┘   |
|                                           │                                             |
|                                           ▼                                             |
|   HandlerExceptionResolver forwards exception directly into:                            |
|   @RestControllerAdvice ──► Generates RFC 9457 ProblemDetail ──► Returns clean JSON!    |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

---

### Implementation: Production `JwtAuthenticationFilter` with Resolver Delegation

#### What We Are Doing in the Below Code:
We create a custom security filter extending `OncePerRequestFilter`. We inject the primary `HandlerExceptionResolver` bean using `@Qualifier("handlerExceptionResolver")`. 

If JWT validation fails (e.g., token is expired, tampered with, or malformed), we catch the exception inside the filter and invoke `handlerExceptionResolver.resolveException()`. This seamlessly routes the security failure into our `@RestControllerAdvice`, outputting a clean RFC 7807 `401 Unauthorized` `ProblemDetail`.

```java
package com.store.security.filter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final HandlerExceptionResolver resolver;

    // Inject the primary Spring MVC HandlerExceptionResolver
    public JwtAuthenticationFilter(@Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver) {
        this.resolver = resolver;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");

        // Skip non-authenticated endpoints
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);
            validateAndAuthenticateToken(token); // May throw JwtException (e.g. ExpiredJwtException)
            
            // If valid, proceed down the chain to DispatcherServlet
            filterChain.doFilter(request, response);
            
        } catch (JwtException ex) {
            // BRIDGE THE GAP: Delegate filter exception to @RestControllerAdvice
            resolver.resolveException(request, response, null, ex);
        }
    }

    private void validateAndAuthenticateToken(String token) {
        // Validation logic: parses token claims, verifies cryptographic signature
        if (token.equals("expired-token")) {
            throw new JwtException("Authentication token has expired. Please refresh your session.");
        }
    }
}
```

#### Handling the Security Exception in `@RestControllerAdvice`:
Now, our centralized advisory can catch `JwtException` just like any standard controller exception:

```java
@ExceptionHandler(JwtException.class)
public ProblemDetail handleJwtException(JwtException ex, HttpServletRequest request) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
    problem.setType(URI.create("https://api.store.com/errors/unauthorized"));
    problem.setTitle("Authentication Required");
    problem.setInstance(URI.create(request.getRequestURI()));
    problem.setProperty("traceId", MDC.get("traceId"));
    return problem;
}
```

---

## 06. Container-Level Fallbacks: `BasicErrorController` & `/error`

### What Is the Container Fallback?

What happens if an error occurs so early or so deep that neither your controllers nor your filters can catch it?
- A client requests a URL that Tomcat rejects before Spring initializes (e.g., malformed HTTP header bytes).
- A static asset is requested that does not exist and no controller matches.
- An unhandled exception occurs inside a filter that did not use `HandlerExceptionResolver`.

In the Servlet specification, whenever an unhandled error reaches the container, the container issues an internal forward to a designated error path: **`/error`**.

---

### Spring Boot's Built-In `BasicErrorController`

Spring Boot provides a pre-configured controller to catch container-level forwards:

```
org.springframework.boot.autoconfigure.web.servlet.error.BasicErrorController
```

`BasicErrorController` inspects the request context and extracts failure attributes from `DefaultErrorAttributes`.

**The Modern Spring Boot 3 Behavior**:  
If `spring.mvc.problemdetails.enabled=true` is set, `BasicErrorController` automatically returns an RFC 7807 `ProblemDetail` document rather than the legacy Spring Boot error map:

```http
HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "detail": "No static resource favicon.ico.",
  "instance": "/favicon.ico"
}
```

---

## 07. Production Security Hardening: Preventing CWE-209 Information Leakage

### What Is CWE-209?

**CWE-209: Generation of Error Message Containing Sensitive Information** is a top OWASP vulnerability where an application reveals internal implementation details to external clients inside error responses.

```
+-----------------------------------------------------------------------------------------+
|                  ANATOMY OF A DANGEROUS CWE-209 INFORMATION LEAK                        |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   HTTP/1.1 500 Internal Server Error                                                    |
|   {                                                                                     |
|     "error": "PSQLException: relation 'app_user_credentials' does not exist",           |
|     "trace": "org.postgresql.util.PSQLException: ERROR: ...                            |
|               at com.bank.auth.dao.UserCredentialDao.findByEmail(Line 42)              |
|               at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor..."             |
|   }                                                                                     |
|                                                                                         |
|   WHAT THE ATTACKER LEARNS:                                                             |
|   1. Target Database Engine : PostgreSQL (and specific driver versions)                 |
|   2. Table Names            : 'app_user_credentials' (targets for SQL injection)        |
|   3. Internal Package Names : 'com.bank.auth.dao'                                       |
|   4. Server Container Engine: Apache Tomcat                                             |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

---

### Production Hardening Rule 1: Disable Framework Error Attributes in Configuration

By default, Spring Boot can be configured to completely suppress stack traces, exception class names, and internal binding errors from escaping into HTTP responses.

#### What We Are Doing in the Below Configuration:
We configure `server.error` in `application.yml` to ensure that even if an unexpected exception slips past all custom handlers and hits the `/error` fallback, Spring Boot will strictly omit stack traces, error messages, and internal validation bindings:

```yaml
# application.yml (Production Profile)
server:
  error:
    include-stacktrace: never    # Never output JVM stack traces to clients
    include-message: never       # Never output raw exception getMessage() text
    include-binding-errors: never # Omit raw Hibernate/database binding exceptions
    whitelabel:
      enabled: false             # Disable the default HTML whitelabel error page
```

---

### Production Hardening Rule 2: Message Sanitization at the Advisory Boundary

In our `@RestControllerAdvice`, technical infrastructure exceptions (`SQLException`, `TimeoutException`, `NullPointerException`) must be caught and **sanitized**.

#### What We Are Doing in the Below Code:
When an unhandled `Exception.class` occurs:
1. We log the full, un-sanitized stack trace internally at `ERROR` level, tagged with the `traceId`, so on-call engineers can diagnose it.
2. We return a clean, completely sanitized RFC 9457 `ProblemDetail` to the client. The client receives a safe, generic message alongside the `traceId`.

```java
@ExceptionHandler(Exception.class)
public ProblemDetail handleGeneralException(Exception ex, HttpServletRequest request) {
    String traceId = resolveTraceId();

    // 1. LOG THE FULL INTERNAL TRACE SAFELY FOR ENGINEERS
    log.error("Unhandled internal server failure on route: {} [traceId={}]", 
            request.getRequestURI(), traceId, ex);

    // 2. EMIT A CLEAN, SANITIZED EXTERNAL CONTRACT (NO INTERNAL SECRETS)
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "An unexpected internal error occurred. Please contact support quoting your traceId."
    );
    problem.setType(URI.create("https://api.store.com/errors/internal-server-error"));
    problem.setTitle("Internal Server Error");
    problem.setInstance(URI.create(request.getRequestURI()));
    
    // Provide correlation token only
    problem.setProperty("traceId", traceId);
    problem.setProperty("timestamp", Instant.now());

    return problem;
}
```

---

## 08. Complete Production Blueprint: An Enterprise RFC 9457 Architecture

Let us review the complete production architecture, synthesizing:
1. Standardized RFC 9457 `ProblemDetail` schemas.
2. Clean domain exception translation.
3. Pre-controller Filter-Chain delegation via `HandlerExceptionResolver`.
4. Structured `traceId` correlation and CWE-209 security sanitization.

```
+----------------------------------------------------------------------------------------------------+
|                         COMPLETE ENTERPRISE ERROR RESOLUTION TOPOLOGY                              |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   Client HTTP Request                                                                              |
|           │                                                                                        |
|           ▼                                                                                        |
|   [ MdcLoggingFilter ] ──► Initializes and binds unique 'traceId' to current thread                |
|           │                                                                                        |
|           ▼                                                                                        |
|   [ JwtAuthenticationFilter ]                                                                      |
|           │                                                                                        |
|           ├─► Token Invalid? ──► handlerExceptionResolver.resolveException(req, res, null, ex)    |
|           │                            │                                                           |
|           ▼ (Token Valid)              │                                                           |
|   [ DispatcherServlet ]                │                                                           |
|           │                            │                                                           |
|           ▼                            │                                                           |
|   [ OrderController ]                  │                                                           |
|           │                            │                                                           |
|           ├─► Domain Error? ───────────┤                                                           |
|           │   (throws DomainException) │                                                           |
|           │                            ▼                                                           |
|           │                  +─────────────────────────────────────────────────────────────────+   |
|           │                  | GlobalExceptionHandler (@RestControllerAdvice)                  |   |
|           │                  | - Injects MDC traceId & UTC timestamp                           |   |
|           │                  | - Maps Domain Exception to RFC 9457 ProblemDetail               |   |
|           │                  | - Sanitizes internal 500 crashes (CWE-209 safe)                 |   |
|           │                  +────────────────────────────────┬────────────────────────────────+   |
|           │                                                   │                                    |
|           ▼                                                   ▼                                    |
|   Normal 2xx Success (JSON Body)                 HTTP application/problem+json (RFC 9457)          |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

## 09. Authoritative References & Further Reading

To explore RFC specifications, Spring Boot problem detail architecture, and web security error standards at the source, consult these canonical resources:

- [IETF RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)  
  *The definitive international standard defining the application/problem+json media type, standard members, and extension semantics (obsoleting RFC 7807).*
- [Spring Framework Official Documentation — Error Responses & ProblemDetail](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-rest-exceptions.html)  
  *Authoritative architectural guide to Spring 6 and Spring Boot 3's native ProblemDetail implementation.*
- [Spring Security Reference — Filter Chain Architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html)  
  *Comprehensive guide to Servlet Filter ordering, SecurityFilterChain, and pre-DispatcherServlet authentication mechanics.*
- [OWASP Top 10 — CWE-209: Sensitive Information in Error Messages](https://cwe.mitre.org/data/definitions/209.html)  
  *Industry security standard and vulnerability classification for preventing stack trace and database metadata leakage.*
- [W3C Recommendation — Trace Context Specification](https://www.w3.org/TR/trace-context/)  
  *International standard for distributed tracing headers (traceparent, tracestate) across cloud microservices.*
