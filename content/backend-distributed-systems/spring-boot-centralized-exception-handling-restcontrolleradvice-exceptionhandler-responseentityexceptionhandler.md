---
title: "Centralized Exception Handling: @RestControllerAdvice, @ExceptionHandler & ResponseEntityExceptionHandler"
slug: spring-boot-centralized-exception-handling-restcontrolleradvice-exceptionhandler-responseentityexceptionhandler
subject: backend-distributed-systems
abstract: An architectural, mentor-led guide to centralized error handling in Spring Boot 3. Understand how the Spring MVC DispatcherServlet dispatches exceptions through HandlerExceptionResolverComposite, master the mechanics of @RestControllerAdvice and @ExceptionHandler resolution algorithms, leverage the standard ResponseEntityExceptionHandler base class to gracefully intercept 15+ built-in framework failures without breaking framework contracts, map Jakarta validation FieldErrors to clean user-facing schemas, and integrate distributed traceId correlation into error payloads.
tags:
  - rest-controller-advice
  - exception-handler
  - response-entity-exception-handler
  - spring-mvc
  - spring-boot
  - java
  - architecture
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

# Centralized Exception Handling: @RestControllerAdvice, @ExceptionHandler & ResponseEntityExceptionHandler

In our previous discussions, we established two foundational pillars of backend engineering:
1. In [Lesson 11.1: Java & Spring Exception Foundations](/notes/spring-boot-java-spring-exception-foundations-jvm-hierarchy-domain-architecture), we explored how the JVM unwinds stack frames, why Spring abandoned checked exceptions in favor of unchecked **Exception Translation**, and how to design clean domain hierarchies (`ResourceNotFoundException`, `BusinessConflictException`).
2. In [Lesson 11.2: Diagnosing & Tracing Errors](/notes/spring-boot-diagnosing-tracing-errors-stack-trace-anatomy-caused-by-mdc), we learned how to read dense stack traces, isolate the true root cause at the bottom of the `Caused by:` chain, and correlate distributed failures using SLF4J MDC and `traceId`.

Now, we bring these threads together to solve a central architectural challenge:

> *"When a service or database throws an exception during an HTTP request, how do we catch it globally, log it with full diagnostic context, and translate it into a clean, deterministic, and standards-compliant HTTP response without cluttering our controllers with hundreds of repetitive `try-catch` blocks?"*

```
+-----------------------------------------------------------------------------------------+
|                  THE EVOLUTION OF CONTROLLER ERROR HANDLING                             |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   LEVEL 1: Ad-Hoc Try-Catch Blocks Inside Controller Methods                            |
|            - Catastrophic boilerplate: 50 endpoints require 50 duplicate catch blocks   |
|            - Hard to test; tightly couples web transport to business failures           |
|                                                                                         |
|   LEVEL 2: Controller-Local @ExceptionHandler Methods                                    |
|            - Scoped only to the declaring controller class                              |
|            - Duplicated across dozens of controller files                               |
|                                                                                         |
|   LEVEL 3: Centralized Cross-Cutting Advisory (@RestControllerAdvice)                   |
|            - Intercepts exceptions across ALL controllers via Spring AOP                |
|            - Extends ResponseEntityExceptionHandler for built-in framework failures    |
|            - Decouples domain logic from HTTP status code translation                   |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

---

## 01. The Problem Space: Why Local Try-Catch Blocks Destroy Clean Architecture

Consider what happens when a team handles errors locally inside each controller method:

```java
// ANTI-PATTERN: Ad-Hoc Try-Catch Clutter in Controllers
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        try {
            OrderResponse response = orderService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (CustomerNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", ex.getMessage()));
        } catch (InsufficientInventoryException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", ex.getMessage()));
        } catch (PaymentGatewayException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("error", "Payment failed. Try again."));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred."));
        }
    }
}
```

### Why This Fails in Enterprise Applications:
1. **The Boilerplate Avalanche**: In an application with 50 controllers and 300 endpoints, you write and maintain the exact same `catch (CustomerNotFoundException)` logic hundreds of times. If the business decides to add a new `errorCode` field or update the response format, you must edit hundreds of files.
2. **Obscured Business Intent**: The core purpose of the endpoint (`orderService.createOrder(request)`) is only two lines of code, buried beneath twenty lines of defensive error scaffolding.
3. **Inconsistent Error Contracts**: Team Member A returns `{ "error": "msg" }`, Team Member B returns `{ "errorMessage": "msg" }`, and Team Member C returns `{ "message": "msg", "code": 404 }`. Frontend applications break because error schemas differ across endpoints.
4. **Unit Testing Nightmare**: Testing every controller requires writing mocks for every caught exception type to verify that the controller returns the correct status code.

---

## 02. First Principles: The Spring MVC Exception Resolution Pipeline

To understand how Spring MVC centralizes error handling, we must trace what happens inside the `DispatcherServlet` when an unhandled exception escapes a controller method.

### The DispatcherServlet `doDispatch` Catch Block

Recall from [Lesson 9.1: Spring MVC Architecture](/notes/spring-mvc-architecture-dispatcherservlet-handlermappings-httpmessageconverters) that all HTTP requests are orchestrated by `DispatcherServlet.doDispatch()`.

Here is the internal structure of that execution loop:

```
+----------------------------------------------------------------------------------------------------+
|                         SPRING MVC INTERNAL EXCEPTION RESOLUTION PIPELINE                          |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   1. HTTP Request (e.g., POST /api/v1/orders)                                                      |
|           │                                                                                        |
|           ▼                                                                                        |
|   DispatcherServlet.doDispatch()                                                                   |
|   ┌────────────────────────────────────────────────────────────────────────────────────────────┐   |
|   │ try {                                                                                      │   |
|   │     HandlerExecutionChain mappedHandler = getHandler(processedRequest);                    │   |
|   │     HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());                     │   |
|   │     ha.handle(processedRequest, response, mappedHandler.getHandler());                      │   |
|   │     // Controller throws: throw new CustomerNotFoundException(id);                         │   |
|   │ } catch (Exception ex) {                                                                   │   |
|   │     dispatchException = ex; // Exception caught by Front Controller!                       │   |
|   │ }                                                                                          │   |
|   │ processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);   │   |
|   └──────────────────────────────────────────────┬─────────────────────────────────────────────┘   |
|                                                  │                                                 |
|                                                  ▼                                                 |
|   processDispatchResult() invokes:                                                                 |
|   HandlerExceptionResolverComposite.resolveException(request, response, handler, ex)               |
|           │                                                                                        |
|           ├─► 1. ExceptionHandlerExceptionResolver                                                 |
|           │      Scans @ControllerAdvice / @RestControllerAdvice for matching @ExceptionHandler    |
|           │      [MATCH FOUND!] ──► Executes advisory method ──► Writes HTTP Response Body         |
|           │                                                                                        |
|           ├─► 2. ResponseStatusExceptionResolver (Fallback)                                        |
|           │      Checks for @ResponseStatus on exception class                                     |
|           │                                                                                        |
|           └─► 3. DefaultHandlerExceptionResolver (Fallback)                                        |
|                  Handles standard Spring MVC exceptions (404, 405, 415)                            |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

### The Chain of Resolvers: `HandlerExceptionResolverComposite`

When an unhandled exception reaches `processDispatchResult()`, Spring does not immediately crash the thread or dump a 500 error. Instead, it delegates to a composite chain of **`HandlerExceptionResolver`** beans:

1. **`ExceptionHandlerExceptionResolver` (Primary)**:
   - This is the engine behind `@ExceptionHandler` and `@RestControllerAdvice`.
   - It maintains an internal cache of all advisory beans registered in the `ApplicationContext`.
   - When an exception occurs, it inspects the exception type, resolves the best-matching `@ExceptionHandler` method, executes it via reflection, and writes the resulting `ResponseEntity` to the client.
2. **`ResponseStatusExceptionResolver` (Secondary Fallback)**:
   - If no `@ExceptionHandler` matches, Spring checks if the exception class itself is annotated with `@ResponseStatus` (as discussed in Lesson 11.1).
3. **`DefaultHandlerExceptionResolver` (Tertiary Fallback)**:
   - Converts standard Spring MVC framework exceptions (such as `HttpRequestMethodNotSupportedException` or `MethodArgumentNotValidException`) into basic HTTP error codes.

---

## 03. Deconstructing `@RestControllerAdvice` & `@ExceptionHandler`

### The Meta-Annotation Breakdown

Spring provides two annotations for declaring centralized advisories:

```
                  +-----------------------------------+
                  |        @ControllerAdvice          |
                  |-----------------------------------|
                  | Centralized AOP interceptor for   |
                  | Spring MVC controller methods     |
                  +-----------------+-----------------+
                                    ^
                                    | composed with
                  +-----------------+-----------------+
                  |          @ResponseBody            |
                  |-----------------------------------|
                  | Automatically serializes method   |
                  | return values to JSON via Jackson |
                  +-----------------+-----------------+
                                    ║
                                    ▼ produces
                  +===================================+
                  |       @RestControllerAdvice       |
                  |===================================|
                  | The standard annotation for REST  |
                  | APIs returning JSON error payloads|
                  +===================================+
```

When you annotate a class with `@RestControllerAdvice`:
- It is automatically detected during **`@ComponentScan`** as a Spring-managed singleton bean.
- Every method inside it annotated with `@ExceptionHandler` acts as an interceptor for exceptions bubbling out of any `@RestController` in the application.
- You do **not** need to put `@ResponseBody` on every method; return values (e.g., `ResponseEntity<ErrorResponse>`) are automatically serialized into JSON.

---

### The `@ExceptionHandler` Resolution Algorithm: How Spring Picks the Winner

What happens when an exception class is part of an inheritance hierarchy, and multiple `@ExceptionHandler` methods exist?

Consider our domain hierarchy from Lesson 11.1:

```
java.lang.Throwable
   └── java.lang.Exception
        └── java.lang.RuntimeException
             └── BaseDomainException
                  └── ResourceNotFoundException
                       └── CustomerNotFoundException
```

Suppose your `@RestControllerAdvice` declares three handlers:

```java
@ExceptionHandler(CustomerNotFoundException.class) // Handler A: Exact match
public ResponseEntity<?> handleCustomerNotFound(...) { ... }

@ExceptionHandler(ResourceNotFoundException.class) // Handler B: Parent class
public ResponseEntity<?> handleResourceNotFound(...) { ... }

@ExceptionHandler(Exception.class)                 // Handler C: Universal fallback
public ResponseEntity<?> handleGeneralException(...) { ... }
```

When `CustomerNotFoundException` is thrown:

```
+-----------------------------------------------------------------------------------------+
|                  SPRING EXCEPTION HANDLER DISTANCE MATCHING ALGORITHM                   |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   Target Thrown Exception: CustomerNotFoundException                                    |
|                                                                                         |
|   Candidate Handler A: @ExceptionHandler(CustomerNotFoundException.class)               |
|   └── Distance: 0 (Exact Match) ──► WINNER!                                             |
|                                                                                         |
|   Candidate Handler B: @ExceptionHandler(ResourceNotFoundException.class)               |
|   └── Distance: 1 (Direct Superclass)                                                   |
|                                                                                         |
|   Candidate Handler C: @ExceptionHandler(Exception.class)                               |
|   └── Distance: 4 (Grandparent Superclass)                                              |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

1. **Exact Match Always Wins**: If an `@ExceptionHandler` explicitly names the thrown class, Spring invokes it immediately (Distance = 0).
2. **Closest Superclass Rule**: If no exact match exists, Spring calculates the "inheritance distance" up the class hierarchy. It selects the handler for the nearest ancestor class.
3. **Ambiguity Trap**: If two handlers declare sibling classes and an exception matches both equally, Spring throws an `IllegalStateException` at startup warning of an ambiguous exception mapping.

---

### Supported Method Parameters and Return Types

Methods annotated with `@ExceptionHandler` are dynamically invoked by `ExceptionHandlerExceptionResolver`. Spring uses reflection to inject any of these supported parameters:

| Supported Parameter Type | Purpose & Practical Use Case |
| :--- | :--- |
| **`T extends Throwable`** | The actual exception instance that was thrown. Contains the message, metadata, and root cause. |
| **`HttpServletRequest`** | Inspect the incoming HTTP request URI, HTTP verb, or remote IP address. |
| **`WebRequest`** | Generic web request abstraction; convenient for extracting headers without Servlet coupling. |
| **`Locale`** | The resolved user locale; used for multi-language internationalized (i18n) error messages. |

For return types, REST APIs should almost exclusively return:
- **`ResponseEntity<T>`**: Allows full programmatic control over the HTTP status code, response headers, and serialized body.
- **`ProblemDetail`** (Spring Boot 3 / RFC 7807): Standardized IETF error descriptor (covered in depth in Lesson 11.4).

---

## 04. The Foundational Base Class: `ResponseEntityExceptionHandler`

### The Common Pitfall: The Naive Catch-All

Many developers write a global exception advisory that looks like this:

```java
// NAIVE ANTI-PATTERN: Breaks Spring MVC internal error handling
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllExceptions(Exception ex) {
        return ResponseEntity.status(500)
                .body(new ErrorResponse("INTERNAL_ERROR", ex.getMessage()));
    }
}
```

#### Why This Breaks Your Application:
Spring MVC throws dozens of internal framework exceptions during request processing:
- If a client sends an invalid HTTP verb (`POST` to a `GET`-only route), Spring throws `HttpRequestMethodNotSupportedException`.
- If a client sends malformed JSON syntax, Jackson throws `HttpMessageNotReadableException`.
- If a client omits a required query parameter, Spring throws `MissingServletRequestParameterException`.

Under RFC standards, these are **4xx Client Errors** (`405 Method Not Allowed`, `400 Bad Request`). 

However, because your naive `@ExceptionHandler(Exception.class)` catches everything, it intercepts these framework exceptions and **converts them all into HTTP 500 Internal Server Errors**! You have broken HTTP semantics, corrupted your monitoring metrics, and confused API clients.

---

### The Remedy: Extending `ResponseEntityExceptionHandler`

To prevent this architectural flaw, Spring provides **`ResponseEntityExceptionHandler`**.

This is an abstract base class specifically engineered to handle all standard Spring MVC framework exceptions out of the box:

```java
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    // Automatically inherits robust handling for 15+ standard Spring MVC exceptions!
}
```

```
+-----------------------------------------------------------------------------------------+
|                  EXCEPTIONS HANDLED BY RESPONSEENTITYEXCEPTIONHANDLER                   |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   Framework Exception                         HTTP Status   Semantic Outcome            |
|   ──────────────────────────────────────────  ───────────   ──────────────────────────  |
|   HttpRequestMethodNotSupportedException      405           Method Not Allowed (+Allow) |
|   HttpMediaTypeNotSupportedException          415           Unsupported Media Type      |
|   HttpMediaTypeNotAcceptableException         406           Not Acceptable              |
|   MissingPathVariableException                500           Internal Server Error       |
|   MissingServletRequestParameterException     400           Bad Request                 |
|   MethodArgumentNotValidException             400 / 422     Validation Failure          |
|   NoResourceFoundException (Spring Boot 3)    404           Static Resource Missing     |
|   HttpMessageNotReadableException             400           Malformed Ingress JSON      |
|   AsyncRequestTimeoutException                503           Service Unavailable         |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

---

### The Template Method Pattern in Action

`ResponseEntityExceptionHandler` uses the **Template Method Pattern**. 

Instead of writing your own `@ExceptionHandler(MethodArgumentNotValidException.class)`, you simply **override** the protected hook methods provided by the base class:

```java
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        
        // Custom logic to format validation errors
        Map<String, String> errors = extractFieldErrors(ex);
        
        ErrorResponse body = new ErrorResponse("VALIDATION_FAILED", "Invalid request payload", errors);
        return new ResponseEntity<>(body, headers, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
```

By extending `ResponseEntityExceptionHandler`:
1. You guarantee that all standard Spring MVC exceptions emit RFC-compliant status codes.
2. You can override only the specific framework failures you wish to customize.
3. You use clean `@ExceptionHandler` methods for your own **custom domain exceptions**.

---

## 05. Handling Request Validation Failures (`MethodArgumentNotValidException`)

When a client sends a payload to a controller method annotated with `@Valid @RequestBody`:

```java
public record CreateUserRequest(
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    String username,

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a well-formed email address")
    String email,

    @NotNull(message = "Age is required")
    @Min(value = 18, message = "Must be at least 18 years old")
    Integer age
) {}
```

If the client submits:

```json
{
  "username": "a",
  "email": "not-an-email",
  "age": 15
}
```

Spring's validator intercepts the payload before controller execution and throws **`MethodArgumentNotValidException`**.

This exception wraps a **`BindingResult`** object containing a collection of `FieldError` instances.

---

### Extracting and Structuring Field Errors

A raw `MethodArgumentNotValidException` produces a noisy, unreadable stack trace. In an enterprise API, frontend teams expect a clean, key-value mapping of field names to violation messages.

Here is how to extract and transform `BindingResult` into an immutable map using Java Streams:

```java
private Map<String, String> formatValidationErrors(BindingResult bindingResult) {
    Map<String, String> errors = new HashMap<>();

    for (FieldError fieldError : bindingResult.getFieldErrors()) {
        // If a field has multiple constraint violations, preserve the first or merge them
        errors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
    }

    return Collections.unmodifiableMap(errors);
}
```

This transforms raw internal validation errors into a clean, developer-friendly response:

```json
{
  "success": false,
  "errorCode": "VALIDATION_FAILED",
  "message": "Input validation failed for 3 fields.",
  "errors": {
    "username": "Username must be between 3 and 20 characters",
    "email": "Must be a well-formed email address",
    "age": "Must be at least 18 years old"
  },
  "traceId": "4bf92f3577b34da6",
  "timestamp": "2026-11-16T18:45:00Z"
}
```

---

## 06. Integrating MDC & Distributed Tracing into the Advisory

In [Lesson 11.2](/notes/spring-boot-diagnosing-tracing-errors-stack-trace-anatomy-caused-by-mdc), we established that every production log line must carry a correlation identifier via **SLF4J MDC (Mapped Diagnostic Context)**.

The centralized exception handler is the final, authoritative bridge between your application logs and the client response. It must perform two duties:

1. **Inject the `traceId` into the Error Response Body**: So the client can quote the ID in customer support tickets or bug reports.
2. **Enforce Logging Hygiene**: Log a single, structured log entry without creating noisy duplicate stack traces.

```
+-----------------------------------------------------------------------------------------+
|                  CENTRALIZED ADVISORY OBSERVABILITY BRIDGE                              |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   1. Exception Escapes Controller                                                       |
|           │                                                                             |
|           ▼                                                                             |
|   GlobalExceptionHandler Intercepts                                                     |
|   ┌─────────────────────────────────────────────────────────────────────────────────┐   |
|   │ String traceId = MDC.get("traceId");                                            │   |
|   │ if (traceId == null) traceId = resolveOrGenerateTraceId(request);               │   |
|   └───────────────────────────────┬─────────────────────────────────────────────────┘   |
|                                   │                                                     |
|         Is it a 4xx Client Error  │  or a 5xx Server Error?                             |
|                  ┌────────────────┴────────────────┐                                    |
|                  │                                 │                                    |
|                  ▼ (4xx: Expected Mistake)         ▼ (5xx: Unexpected Crash)            |
|   ┌─────────────────────────────────────────┐   ┌───────────────────────────────────┐   |
|   │ logger.warn("Client error: {} [{}]",    │   │ logger.error("Server crash: [{}]",│   |
|   │             ex.getMessage(), traceId);  │   │              traceId, ex);        │   |
|   │ (NO STACK TRACE - Prevents log clutter) │   │ (FULL STACK TRACE FOR ON-CALL)    │   |
|   └─────────────────────────────────────────┘   └───────────────────────────────────┘   |
|                  │                                 │                                    |
|                  └────────────────┬────────────────┘                                    |
|                                   ▼                                                     |
|   2. Construct Unified Error Response Payload                                           |
|      (Injects traceId + Timestamp into JSON body)                                       |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

---

## 07. Production Blueprint: An Enterprise `GlobalExceptionHandler`

Let us synthesize all concepts into a clean, complete, and production-hardened `GlobalExceptionHandler` using Java 21 Records, Spring Boot 3 standards, and our domain hierarchy from Lesson 11.1.

### 1. The Standardized Error Payload DTO

```java
package com.store.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiErrorResponse(
        boolean success,
        String errorCode,
        String message,
        Map<String, String> validationErrors,
        Map<String, Object> metadata,
        String traceId,
        Instant timestamp
) {
    public static ApiErrorResponse of(String errorCode, String message, String traceId) {
        return new ApiErrorResponse(false, errorCode, message, null, null, traceId, Instant.now());
    }

    public static ApiErrorResponse withValidation(String errorCode, String message, Map<String, String> errors, String traceId) {
        return new ApiErrorResponse(false, errorCode, message, errors, null, traceId, Instant.now());
    }

    public static ApiErrorResponse withMetadata(String errorCode, String message, Map<String, Object> metadata, String traceId) {
        return new ApiErrorResponse(false, errorCode, message, null, metadata, traceId, Instant.now());
    }
}
```

---

### 2. The Comprehensive `GlobalExceptionHandler` Implementation

```java
package com.store.common.advice;

import com.store.common.exception.BaseDomainException;
import com.store.common.exception.BusinessConflictException;
import com.store.common.exception.ResourceNotFoundException;
import com.store.common.response.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String TRACE_ID_KEY = "traceId";

    // =========================================================================
    // 1. DOMAIN EXCEPTION HANDLERS
    // =========================================================================

    /**
     * Handles 404 Not Found: Entity or resource does not exist.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {

        String traceId = resolveTraceId();
        log.warn("Resource not found: {} [traceId={}]", ex.getMessage(), traceId);

        ApiErrorResponse body = ApiErrorResponse.withMetadata(
                ex.getErrorCode(),
                ex.getMessage(),
                ex.getMetadata(),
                traceId
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    /**
     * Handles 409 Conflict: Optimistic locking, duplicate keys, or business collision.
     */
    @ExceptionHandler(BusinessConflictException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessConflict(
            BusinessConflictException ex, HttpServletRequest request) {

        String traceId = resolveTraceId();
        log.warn("Business conflict encountered: {} [traceId={}]", ex.getMessage(), traceId);

        ApiErrorResponse body = ApiErrorResponse.withMetadata(
                ex.getErrorCode(),
                ex.getMessage(),
                ex.getMetadata(),
                traceId
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    /**
     * Handles BaseDomainException: Catch-all for specialized domain validation errors (422).
     */
    @ExceptionHandler(BaseDomainException.class)
    public ResponseEntity<ApiErrorResponse> handleDomainException(
            BaseDomainException ex, HttpServletRequest request) {

        String traceId = resolveTraceId();
        log.warn("Domain invariant violated: {} [traceId={}]", ex.getMessage(), traceId);

        ApiErrorResponse body = ApiErrorResponse.withMetadata(
                ex.getErrorCode(),
                ex.getMessage(),
                ex.getMetadata(),
                traceId
        );

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(body);
    }

    // =========================================================================
    // 2. OVERRIDDEN SPRING MVC FRAMEWORK HOOKS
    // =========================================================================

    /**
     * Overrides framework validation failure hook for @Valid @RequestBody payloads (422).
     */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        String traceId = resolveTraceId();
        Map<String, String> fieldErrors = extractFieldErrors(ex.getBindingResult());

        log.warn("Validation failed for request with {} errors [traceId={}]", fieldErrors.size(), traceId);

        ApiErrorResponse body = ApiErrorResponse.withValidation(
                "VALIDATION_FAILED",
                "Input payload failed business validation constraints.",
                fieldErrors,
                traceId
        );

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(body);
    }

    // =========================================================================
    // 3. UNIVERSAL UNHANDLED SAFETY NET (500)
    // =========================================================================

    /**
     * Catch-all safety net for unexpected runtime failures.
     * Sanitizes response to prevent CWE-209 stack trace leakage while logging full trace.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnhandledException(
            Exception ex, HttpServletRequest request) {

        String traceId = resolveTraceId();

        // Log full stack trace for on-call engineers
        log.error("Unhandled system exception occurred on route: {} [traceId={}]", 
                request.getRequestURI(), traceId, ex);

        // Sanitize client response: never leak raw exception messages or SQL details
        ApiErrorResponse body = ApiErrorResponse.of(
                "INTERNAL_SERVER_ERROR",
                "An unexpected internal system error occurred. Please contact support quoting your traceId.",
                traceId
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private String resolveTraceId() {
        String traceId = MDC.get(TRACE_ID_KEY);
        return (traceId != null && !traceId.isBlank()) ? traceId : UUID.randomUUID().toString().replace("-", "");
    }

    private Map<String, String> extractFieldErrors(BindingResult bindingResult) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : bindingResult.getFieldErrors()) {
            errors.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        return Collections.unmodifiableMap(errors);
    }
}
```

---

## 08. Subtle Gotchas & Production Anti-Patterns

### Gotcha 1: Catching `Throwable.class` Instead of `Exception.class`

```java
// DANGEROUS ANTI-PATTERN: Never catch Throwable in an advisory
@ExceptionHandler(Throwable.class)
public ResponseEntity<?> handleAll(Throwable t) { ... }
```

As we learned in Lesson 11.1, `Throwable` is the parent of `java.lang.Error`. 

If you write `@ExceptionHandler(Throwable.class)`, your advisory will catch **`OutOfMemoryError`**, `StackOverflowError`, and `VirtualMachineError`. The controller advice will attempt to allocate new JSON strings on an exhausted heap, fail, and leave the JVM in a zombie state.

> **Rule of Law**: Catch `Exception.class`, **never** `Throwable.class`. Allow fatal `Error` instances to crash the container so Kubernetes can restart the pod.

---

### Gotcha 2: Advisory Ordering in Multi-Module Projects

When an application contains multiple `@RestControllerAdvice` beans (e.g., one in a shared enterprise security library and one in your local service), which one takes precedence?

By default, Spring does not guarantee the discovery order of advisories. If both declare `@ExceptionHandler(Exception.class)`, the wrong handler might execute.

**The Solution**: Always define explicit order using **`@Order`**:

```java
@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE) // Evaluated first!
public class BusinessExceptionHandler { ... }

@RestControllerAdvice
@Order(Ordered.LOWEST_PRECEDENCE)  // Fallback safety net!
public class FallbackExceptionHandler { ... }
```

---

### Gotcha 3: The Filter-Chain Blindspot (Preview of Lesson 11.4)

A common point of confusion for mid-level developers is when an authentication failure occurs:

```
[ Incoming Request ]
        │
        ▼
[ JwtAuthenticationFilter ] <── Throws ExpiredJwtException here!
        │
        ▼  (Never reaches DispatcherServlet!)
[ DispatcherServlet ]
        │
        ▼
[ GlobalExceptionHandler ] <── WHY DIDN'T MY ADVISORY CATCH THIS?!
```

If an exception is thrown inside a **Servlet Filter** (such as a Spring Security JWT filter or CORS filter), your `@RestControllerAdvice` **will never execute**. 

Why? Because the Filter Chain runs **before** the `DispatcherServlet` is even entered! In our next lesson, we will explore how to bridge this gap cleanly using `HandlerExceptionResolver` and master the modern RFC 7807 `ProblemDetail` specification.

---

## 09. Authoritative References & Further Reading

To explore Spring MVC exception resolution internals, advisory architecture, and controller exception handling at the source, consult these canonical resources:

- [Spring Framework Official Documentation — Controller Advisories](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-advice.html)  
  *Comprehensive guide to @ControllerAdvice, @RestControllerAdvice, and target scoping.*
- [Spring Framework Official Documentation — ExceptionHandlerExceptionResolver](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/exceptionhandlers.html)  
  *Detailed specification of the HandlerExceptionResolverComposite pipeline and resolution algorithms.*
- [Spring Framework API Reference — ResponseEntityExceptionHandler](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/ResponseEntityExceptionHandler.html)  
  *Complete Javadoc listing of all 15+ standard framework exception hooks and template methods.*
- [Jakarta Bean Validation Official Specification](https://jakarta.ee/specifications/bean-validation/3.0/)  
  *Authoritative reference governing constraint violation extraction, BindingResult, and FieldError models.*
- [OWASP Secure Coding Guidelines — Error Handling & Logging (CWE-209)](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html)  
  *Industry security standards for preventing sensitive data and stack trace leakage in web API responses.*
