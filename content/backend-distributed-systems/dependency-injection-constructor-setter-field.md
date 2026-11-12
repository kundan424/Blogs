---
title: "Types of Dependency Injection in Spring"
slug: dependency-injection-constructor-setter-field
subject: backend-distributed-systems
abstract: An exhaustive, first-principles tutorial on Dependency Injection variants in Spring Boot 3 and Java 21. Master the fundamental object construction contract, discover why Constructor Injection is the industry gold standard for immutability and fail-fast null safety, learn where Setter Injection fits for optional dependencies, and uncover the five technical reasons why Field Injection is a dangerous production anti-pattern.
tags:
  - spring-core
  - dependency-injection
  - spring-boot
  - java
  - architecture
  - clean-code
  - testing
published: true
publishDate: Nov 12, 2026
updatedDate: Nov 12, 2026
readTime: 20m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
---

# Types of Dependency Injection in Spring

Pull up a chair. In [Lesson 3.1: Why Dependency Injection?](file:///e:/projects/Blog/content/backend-distributed-systems/why-dependency-injection-decoupling-testability-separation-of-concerns.md), we established the foundational *why*: hardcoding object instantiation with the `new` keyword couples high-level business rules to low-level infrastructure, destroys unit testability, and violates the Dependency Inversion Principle (DIP).

Now comes the practical, day-to-day engineering question:

> *"Once we agree that the container should provide dependencies to our class, **how** should our class receive them?"*

The Spring Framework provides three distinct delivery mechanisms:
1. **Constructor Injection**
2. **Setter Injection**
3. **Field Injection**

At first glance, junior developers often assume these three approaches are interchangeable cosmetic styles—merely a matter of personal syntax preference. After all, if all three put an instance of `OrderRepository` into `OrderService`, what difference does it make?

It makes an enormous difference. The mechanism you choose dictates whether your classes are immutable or mutable, whether bugs fail fast at compile time or blow up at 2:00 AM in production with `NullPointerException`s, whether your unit tests run in 2 milliseconds or require a 15-second Spring context boot, and whether circular dependencies are caught on startup or masked until runtime.

In this deep dive, we will explore each injection variant from first principles. We will inspect vanilla Java memory models, demystify what the Spring IoC container does under the hood, and examine why the Spring engineering team, the official documentation, and enterprise software architects unanimously consider Field Injection an anti-pattern and Constructor Injection the gold standard.

---

## 01. First Principles: The Object Construction Contract

Before we look at a single Spring annotation or framework class, let's step away from frameworks entirely and look at plain, vanilla Java objects (POJOs).

In object-oriented software engineering, every class has an implicit or explicit **Construction Contract**. That contract answers one fundamental question:

> **What does this object strictly require in order to exist in a valid, usable state?**

Think about building a physical car:
- Can a car function without an engine? **No.** An engine is a **mandatory dependency**. A car without an engine is not a car; it is a two-ton paperweight.
- Can a car function without an air conditioner? **Yes.** An air conditioner is an **optional dependency**. The car can safely start, steer, and brake even if the AC unit is omitted.

```text
┌────────────────────────────────────────────────────────┐
│                      CAR OBJECT                        │
├────────────────────────────────────────────────────────┤
│  Mandatory Dependency: Engine                         │
│  ├── Must be supplied at creation time                 │
│  └── Object is broken/invalid without it               │
├────────────────────────────────────────────────────────┤
│  Optional Dependency:  AirConditioner                  │
│  ├── Can be supplied later or defaulted to null/noop   │
│  └── Object remains valid and operable without it      │
└────────────────────────────────────────────────────────┘
```

Now translate this to backend enterprise services:
- An `OrderService` cannot process an order without an `OrderRepository` and a `PaymentGateway`. Those dependencies are **mandatory**.
- An `OrderService` might optionally send an audit ping to a `MetricsCollector`. If the metrics collector is absent, the service can safely fall back to a no-op logger. The metrics collector is **optional**.

### The Cardinal Rule of Object Construction

> **An object should never be exposed to the rest of the application in a half-baked, partially initialized, or invalid state.**

The moment `new OrderService(...)` finishes executing, the caller should have a 100% guarantee that every mandatory collaborator is present, non-null, and ready for work. If a mandatory collaborator is missing, the object should **fail fast immediately** at construction time, rather than letting callers invoke methods that explode later with an unexpected `NullPointerException`.

Keep this construction contract in mind. It is the architectural compass that separates good injection patterns from bad ones.

---

## 02. Constructor Injection (The Gold Standard)

In **Constructor Injection**, all required dependencies are passed as explicit arguments into the class's constructor at instantiation time.

Let's look at how this looks in plain Java first:

### Pure Java (No Framework Required)

```java
public class OrderService {

    // 1. Mandatory dependencies declared as final
    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway;

    // 2. Explicit constructor enforcing the contract
    public OrderService(OrderRepository orderRepository, PaymentGateway paymentGateway) {
        if (orderRepository == null) {
            throw new IllegalArgumentException("orderRepository cannot be null");
        }
        if (paymentGateway == null) {
            throw new IllegalArgumentException("paymentGateway cannot be null");
        }
        this.orderRepository = orderRepository;
        this.paymentGateway = paymentGateway;
    }

    public OrderResponse placeOrder(OrderRequest request) {
        // Safe: orderRepository and paymentGateway are guaranteed non-null
        paymentGateway.charge(request.amount());
        return orderRepository.save(new Order(request));
    }
}
```

Notice what is happening here:
1. There are **zero framework annotations**. No `@Autowired`, no Spring imports, no reflection.
2. The compiler physically prevents anyone from writing `new OrderService()` without supplying both collaborators.

### Modern Spring Boot 3 Implementation

How does Spring handle constructor injection? 

In historical versions of Spring (prior to Spring 4.3), you had to annotate the constructor with `@Autowired`. In modern Spring (Spring 4.3+, Spring Boot 2.x, and Spring Boot 3.x), **if a class has only one constructor, the `@Autowired` annotation is completely optional**:

```java
package com.company.billing.service;

import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway;

    // @Autowired is optional in Spring 4.3+ when there is only one constructor!
    public OrderService(OrderRepository orderRepository, PaymentGateway paymentGateway) {
        this.orderRepository = orderRepository;
        this.paymentGateway = paymentGateway;
    }

    public OrderResponse placeOrder(OrderRequest request) {
        paymentGateway.charge(request.amount());
        return orderRepository.save(new Order(request));
    }
}
```

When the Spring IoC container starts:
1. It scans for `@Service`, finds `OrderService`, and inspects its constructor.
2. It looks up the registered beans matching `OrderRepository` and `PaymentGateway`.
3. It passes those beans directly into the constructor and registers the newly created `OrderService` singleton into the `ApplicationContext`.

---

### The 4 Superpowers of Constructor Injection

Why is Constructor Injection universally recommended by the Spring team and industry experts? Because it provides four indispensable guarantees:

#### 1. True Immutability (`final` Fields)
Because dependencies are assigned inside the constructor, their fields can—and should—be marked with the Java **`final`** keyword:

```java
private final OrderRepository orderRepository;
```

Once initialized, these references **cannot be reassigned or mutated** by any method in the class, any other thread, or any malicious code. This makes your service inherently thread-safe in high-throughput multi-threaded web environments.

#### 2. Fail-Fast & Null Safety
You can never have an `OrderService` instance where `orderRepository` is `null`. The constructor acts as a strict bouncer at the door: either all required dependencies are present and valid, or the object is never created at all.

#### 3. Lightning-Fast Unit Testing (No Spring Context Needed)
Because the constructor is public, testing this class in a unit test requires **zero Spring framework overhead**. You do not need `@SpringBootTest`, you do not need `@ExtendWith(SpringExtension.class)`, and you do not need reflection hacks.

You test it as pure Java:

```java
@Test
void shouldPlaceOrderSuccessfully() {
    // Plain, instant instantiation in < 1 millisecond
    OrderRepository mockRepo = mock(OrderRepository.class);
    PaymentGateway mockGateway = mock(PaymentGateway.class);

    OrderService service = new OrderService(mockRepo, mockGateway);

    OrderResponse response = service.placeOrder(new OrderRequest(100.0));
    assertNotNull(response);
}
```

#### 4. Instant Circular Dependency Detection on Startup
If `ServiceA` requires `ServiceB` in its constructor, and `ServiceB` requires `ServiceA` in its constructor, Java cannot instantiate either object (who gets created first?).

Spring detects this during container startup and immediately aborts with a clear, readable exception:

```text
BeanCurrentlyInCreationException: Error creating bean with name 'serviceA': 
Requested bean is currently in creation: Is there an unresolvable circular reference?
```

This prevents insidious runtime deadlocks and forces you to fix the underlying architectural flaw (e.g., extracting shared logic into a `ServiceC`).

---

## 03. Setter Injection (For True Optionals & Reconfiguration)

In **Setter Injection**, the class provides a default (or parameterized) constructor, and dependencies are supplied after object instantiation via public setter methods annotated with `@Autowired`:

```java
package com.company.billing.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

    private NotificationChannel notificationChannel; // Not final!

    // Default constructor allows Spring to create the object first
    public ReportService() {}

    // Dependency injected after instantiation via setter
    @Autowired(required = false)
    public void setNotificationChannel(NotificationChannel notificationChannel) {
        this.notificationChannel = notificationChannel;
    }

    public void generateReport() {
        // Business logic...
        
        // Defensive null-check mandatory because the setter may never have been called!
        if (notificationChannel != null) {
            notificationChannel.notifyComplete();
        }
    }
}
```

### How Spring Executes Setter Injection Under the Hood

When Spring wires this bean, it performs a multi-step sequence:
1. **Phase 1 (Instantiation):** Spring calls the default constructor: `ReportService reportService = new ReportService();`.
2. **Phase 2 (Population):** Spring inspects all methods annotated with `@Autowired` and calls `reportService.setNotificationChannel(channelBean)`.

### When Setter Injection Makes Sense (Legitimate Use Cases)

Setter injection is not an anti-pattern when used for its intended purpose: **truly optional dependencies or dynamic reconfiguration**.

1. **Optional Plugins & Fallbacks:** A service that can optionally ping Slack or send an SMS if configured, but functions perfectly fine without it.
2. **JMX Dynamic Telemetry:** Reconfiguring a connection pool size or logging sink at runtime via JMX beans without restarting the application.

### The Trade-offs & Risks of Setter Injection

1. **Loss of Immutability:** Fields injected via setters **cannot be `final`**. Any code with access to the instance could theoretically invoke `setNotificationChannel(...)` later and mutate the collaborator.
2. **Temporal Coupling (The Half-Baked Object Hazard):** There is a brief window of time between when `new ReportService()` completes and when `setNotificationChannel(...)` is invoked where the object exists in an uninitialized state. If another thread invokes a business method during this window, it hits a `NullPointerException`.
3. **Mandatory Defensive Code:** Every method in your class must constantly perform null-checks (`if (channel != null)`) before using the collaborator.

---

## 04. Field Injection (The Seductive Anti-Pattern)

Now let's examine **Field Injection**—the mechanism that developers use most often when starting out, and that experienced architects fight to remove from production codebases.

In Field Injection, `@Autowired` is placed directly on `private` member variables, with no constructors and no setter methods:

```java
package com.company.billing.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void registerUser(String email, String password) {
        String hash = passwordEncoder.encode(password);
        userRepository.save(new User(email, hash));
        emailService.sendWelcome(email);
    }
}
```

### Why Developers Are Suced by Field Injection

Look at the code above. It looks clean, minimal, and elegant:
- No verbose constructor definitions.
- No boilerplate getters or setters.
- Just three private variables with annotations on top.

It looks so clean that developers often ask: *"Why would anyone write a 10-line constructor when I can just type `@Autowired`?"*

The answer is that Field Injection pushes the complexity out of your source code and hides it as **technical debt and runtime failure risks**.

---

### The 5 Production Landmines of Field Injection

```text
┌────────────────────────────────────────────────────────┐
│             THE 5 TRAPS OF FIELD INJECTION             │
├────────────────────────────────────────────────────────┤
│ 1. Reflection Magic:   Bypasses JVM encapsulation      │
│ 2. Testing Paralysis:  Cannot test as pure POJO        │
│ 3. Masked SRP Bloat:   15 dependencies look "clean"    │
│ 4. Hidden Cycles:      Circular dependencies masked    │
│ 5. Zero Immutability:  Fields can never be final       │
└────────────────────────────────────────────────────────┘
```

#### 1. It Violates Encapsulation & Relies on Reflection Magic
In standard Java, a `private` field cannot be modified from outside the class. So how does Spring inject `userRepository` when there are no constructors and no setters?

Spring uses **Java Reflection**:

```java
// What Spring has to do under the hood for Field Injection:
Field field = UserService.class.getDeclaredField("userRepository");
field.setAccessible(true); // Bypasses private security modifier!
field.set(userServiceInstance, repositoryBean);
```

By using field injection, you are breaking the core object-oriented contract of encapsulation. Your class cannot initialize itself; it requires an external reflection engine to break into its private members and wire them up.

#### 2. The Unit Testing Nightmare
Suppose you want to write a fast, isolated unit test for `UserService`:

```java
@Test
void shouldRegisterUser() {
    UserRepository mockRepo = mock(UserRepository.class);
    EmailService mockEmail = mock(EmailService.class);

    UserService service = new UserService(); // Calls default constructor

    // CRASH! How do you give mockRepo to service?
    // service.userRepository is PRIVATE!
    // There is no constructor, and there are no setters!
    service.registerUser("test@example.com", "secret"); // Throws NullPointerException!
}
```

Because `userRepository` is private and there is no constructor or setter, **you cannot pass your mock into the service**!

To test a class written with field injection, you are forced into bad workarounds:
- **Workaround A (Reflection Hacks):** Using `ReflectionTestUtils.setField(service, "userRepository", mockRepo)`. This is fragile: if you rename the field in your class, your unit tests compile fine but fail at runtime because the string name broke.
- **Workaround B (Booting Spring):** Annotating your test with `@SpringBootTest`. Now, instead of your unit test running in 2 milliseconds, it boots an entire Spring `ApplicationContext`, taking 10 to 20 seconds. If you have 500 unit tests, your test suite slows from 2 seconds to 15 minutes!

#### 3. It Masks Violations of the Single Responsibility Principle (SRP)
When you use Constructor Injection, every dependency adds a parameter to the constructor:

```java
public OrderService(
    OrderRepo r1, PaymentGate r2, EmailService r3,
    AuditLogger r4, InventoryClient r5, TaxCalculator r6,
    FraudDetector r7, ShippingService r8, MetricsSink r9) { ... }
```

When you see a constructor with nine parameters, your developer instinct immediately screams: *"Wait! This constructor is huge! This class is doing too much. It violates SRP. We need to refactor!"*

With Field Injection, this code smell is completely hidden. Stacking nine `@Autowired` annotations takes up minimal vertical space and looks deceptively tidy. It is common to find production classes with 15 or 20 field-injected dependencies that have become massive, unmaintainable "God classes" because nobody felt the pain of the constructor.

#### 4. It Masks Circular Dependencies
With constructor injection, circular dependencies fail immediately on startup.

With field injection, Spring instantiates both beans using their default no-args constructors first, and only populates the fields later via reflection. This masks the circular dependency during instantiation, allowing unhealthy architectural coupling to fester until runtime bugs or subtle deadlocks occur during bean destruction or proxying.

#### 5. Immutability is Completely Impossible
A `final` variable in Java must be assigned either at declaration or within a constructor:

```java
@Autowired
private final UserRepository userRepository; // COMPILE ERROR!
```

Because field injection happens *after* the constructor runs via reflection, fields injected with `@Autowired` **can never be `final`**. Your class is permanently open to accidental internal mutation.

---

## 05. Modern Production Idioms (Java 21 & Spring Boot 3)

In modern enterprise Spring Boot 3 development, two idioms give you all the architectural benefits of Constructor Injection with zero boilerplate.

### 1. Lombok `@RequiredArgsConstructor`

By far the most widespread industry standard is combining Lombok's `@RequiredArgsConstructor` with `private final` fields:

```java
package com.company.billing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    // All mandatory dependencies marked private final
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public void registerUser(String email, String password) {
        String hash = passwordEncoder.encode(password);
        userRepository.save(new User(email, hash));
        emailService.sendWelcome(email);
    }
}
```

#### What Happens at Compile Time:
Lombok detects all `final` fields that do not have an initializer and automatically generates the exact constructor behind the scenes:

```java
// Generated by Lombok in bytecode:
public UserService(UserRepository userRepository, EmailService emailService, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.emailService = emailService;
    this.passwordEncoder = passwordEncoder;
}
```

You get:
- Full immutability (`final` fields).
- Clean, short, readable source code.
- Zero reflection overhead.
- Flawless unit testability.

### 2. Java 21 Record Components

In Java 17 and Java 21, **Records** are immutable data carriers with auto-generated canonical constructors. You can even use Records for lightweight Spring components and configuration clients:

```java
package com.company.billing.client;

import org.springframework.stereotype.Component;

@Component
public record CurrencyExchangeClient(
    RestClient restClient,
    ExchangeProperties properties
) {
    public BigDecimal getRate(String sourceCurrency, String targetCurrency) {
        return restClient.get()
            .uri(properties.baseUrl() + "/rates/" + sourceCurrency)
            .retrieve()
            .body(BigDecimal.class);
    }
}
```

Because a Record's components are implicitly `private final`, Spring Boot 3 uses the record's canonical constructor to wire dependencies automatically!

---

## 06. Unit Testing Ergonomics: A Side-by-Side Showdown

To see why the industry abandoned field injection, compare the developer experience of writing a unit test for both approaches.

```text
CONSTRUCTOR INJECTION TEST                  FIELD INJECTION TEST
┌────────────────────────────────┐         ┌────────────────────────────────┐
│ @Test                          │         │ @SpringBootTest // SLOW!       │
│ void testOrder() {             │         │ class OrderServiceTest {       │
│   var repo = mock(Repo.class); │         │   @Autowired OrderService svc; │
│   var svc = new Service(repo); │         │   @MockBean Repo repo;         │
│   svc.execute();               │         │   @Test void test() { ... }    │
│ }                              │         │ }                              │
└────────────────────────────────┘         └────────────────────────────────┘
 Execution time: ~2ms                       Execution time: ~12,000ms
```

### Testing Constructor Injection (Pure Java, 2ms)

```java
class OrderServiceTest {

    @Test
    void shouldCalculateTotal() {
        // 1. Create mocks
        OrderRepository mockRepo = mock(OrderRepository.class);
        PaymentGateway mockGateway = mock(PaymentGateway.class);

        // 2. Instantiate cleanly using constructor
        OrderService service = new OrderService(mockRepo, mockGateway);

        // 3. Execute and verify
        service.placeOrder(new OrderRequest(50.0));
        verify(mockGateway).charge(50.0);
    }
}
```
* **Speed:** ~2 milliseconds.
* **Dependencies:** None. Runs anywhere, in any IDE, without Spring on the classpath.

### Testing Field Injection (Spring Boot Context Boot, 12,000ms)

```java
@SpringBootTest
class OrderServiceTest {

    @Autowired
    private OrderService service; // Injected via reflection

    @MockBean
    private OrderRepository mockRepo; // Replaces real bean in container

    @MockBean
    private PaymentGateway mockGateway;

    @Test
    void shouldCalculateTotal() {
        service.placeOrder(new OrderRequest(50.0));
        verify(mockGateway).charge(50.0);
    }
}
```
* **Speed:** ~12,000 milliseconds (boots complete Spring container, Tomcat server, datasource configurations).
* **Brittleness:** If one configuration bean fails to initialize anywhere in your application, your unrelated unit test fails.

---

## 07. Architectural Decision Matrix

Here is how the three dependency injection variants compare across all architectural dimensions:

| Architectural Dimension | Constructor Injection | Setter Injection | Field Injection |
| :--- | :--- | :--- | :--- |
| **Immutability (`final`)** | **Yes** (`private final`) | No (must be mutable) | No (cannot be `final`) |
| **Null Safety (Fail-Fast)** | **Compile & Init Time** | At Runtime (null checks) | At Runtime (NPE hazard) |
| **Testing without Framework** | **Trivial** (`new Service(...)`) | Moderate (`new` + setters) | **Impossible without reflection** |
| **Circular Dependency Check** | **Fails at startup** | Allowed / Delayed | Allowed / Masked |
| **Single Responsibility Guard** | **Visible parameter smell** | Moderate | **Hidden / Masked** |
| **Framework Independence** | **100% POJO** | Mostly POJO | **100% Coupled to Spring** |
| **Official Recommendation** | **Recommended Standard** | For Optionals Only | **Strongly Discouraged** |

---

## 08. Production Checklist & Summary

Whenever you design a Spring Boot component, apply these simple production rules of thumb:

1. **Default to Constructor Injection for 99% of dependencies.**
   - All mandatory dependencies must be declared `private final`.
   - Use Lombok's `@RequiredArgsConstructor` to eliminate constructor boilerplate.
   - Omit `@Autowired` when your class has a single constructor.
2. **Use Setter Injection strictly for true optional dependencies.**
   - If your service can function normally when the dependency is omitted (e.g. optional telemetry or caching fallback), use a setter annotated with `@Autowired(required = false)`.
   - Always perform a defensive null check before invoking methods on a setter-injected dependency.
3. **Treat Field Injection (`@Autowired` on private fields) as technical debt.**
   - Never write new code with field injection.
   - When maintaining legacy classes with field injection, refactor them to constructor injection during maintenance sprints to unlock fast, isolated unit testing.

---

## 09. Authoritative References & Further Reading

For deeper study and official architectural guidelines, explore these standard documentation links and seminal papers:

- [Spring Framework Official Documentation: Dependencies & Collaborators](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)  
  *The authoritative reference on how the Spring IoC container resolves dependencies.*
- [Spring Framework Official Documentation: Constructor-based vs. Setter-based DI](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html#beans-setter-injection)  
  *Official rationale explaining why the Spring team promotes constructor injection for mandatory collaborators.*
- [Martin Fowler: Inversion of Control Containers and the Dependency Injection Pattern (2004)](https://martinfowler.com/articles/injection.html)  
  *The landmark architectural essay that originally coined the term "Dependency Injection" and analyzed Constructor vs. Setter injection.*
- [Clean Architecture & SOLID Principles by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2014/05/11/FrameworkBound.html)  
  *Foundational guidance on why business domain logic should never be bound to framework reflection engines.*
