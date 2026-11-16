---
title: "The Entity Leak Anti-Pattern: Encapsulation, Mass Assignment & DTO Design"
slug: spring-boot-entity-leak-anti-pattern-mass-assignment-dto-java-records
subject: backend-distributed-systems
abstract: An architectural, mentor-led guide to data transfer contracts and entity encapsulation in Spring Boot 3. Understand why JPA entities must never escape the service layer, dissect the infamous GitHub 2012 Mass Assignment (Over-Posting) vulnerability, eliminate Jackson infinite recursion crashes (StackOverflowError) in bidirectional associations, prevent detached entity LazyInitializationException in the web tier, and architect clean, immutable DTO contracts using modern Java 21 Records.
tags:
  - dto-pattern
  - java-records
  - entity-encapsulation
  - spring-boot
  - api-security
  - clean-architecture
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

# The Entity Leak Anti-Pattern: Encapsulation, Mass Assignment & DTO Design

In [Lesson 12.1: Strict Layered Architecture](/notes/spring-boot-strict-layered-architecture-controller-service-repository-isolation), we established the foundational boundaries of enterprise backends: isolating the Web Tier (`@RestController`), the Service Tier (`@Service`), and the Persistence Tier (`@Repository`). We enforced the **downward dependency rule** and decoupled circular bean references using Spring Domain Events.

Now, we must confront the most critical data boundary question in modern API engineering:

> *"What objects should flow across these tier boundaries? If a database table is represented by a `@Entity` class in Java, why can't we simply accept that entity in our `@PostMapping` controller methods and return it directly as JSON? What is the 'Entity Leak' anti-pattern, why did it allow a hacker to breach GitHub in 2012, and how do modern Java 21 Records provide an impenetrable defense?"*

```
+-----------------------------------------------------------------------------------------+
|                  THE CARDINAL DATA RULE OF ENTERPRISE BACKENDS                          |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   JPA Entities MUST NEVER escape the Service Layer.                                     |
|   - Controllers must NEVER accept JPA Entities as @RequestBody parameters.              |
|   - Controllers must NEVER return JPA Entities in ResponseEntity responses.             |
|   - The Web Tier speaks strictly in DTOs (Data Transfer Objects).                       |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

---

## 01. First Principles: What Is an Entity vs. What Is a DTO?

To understand why leaking entities collapses enterprise systems, we must first define what an Entity and a DTO actually represent in computer science.

---

### What Is an Entity? (Overview in Words)

In plain words: An **Entity** is a mutable Java object that represents a persistent record in a relational database table.

An entity is not just a collection of fields; it is an active participant in the **JPA / Hibernate Persistence Context**:
- **Identity-Driven**: It has a database primary key (`@Id`). Two entities with the same ID represent the same underlying database row, even if their in-memory fields differ.
- **Stateful Lifecycle**: An entity transitions through complex persistence states: *Transient* (newly instantiated), *Managed* (attached to an active database session), *Detached* (session closed), or *Removed* (scheduled for deletion).
- **Hibernate Dirty Checking**: When an entity is *Managed*, the Hibernate `EntityManager` tracks every setter call. At the end of the transaction, Hibernate automatically generates and executes SQL `UPDATE` queries for any modified properties without you ever calling `repository.save()`.
- **Dynamic Proxies & Lazy Loading**: Entities contain synthetic bytecode proxies (such as CGLIB or ByteBuddy proxies) that intercept getter calls to execute background SQL queries on demand (`FetchType.LAZY`).

---

### What Is a DTO (Data Transfer Object)? (Overview in Words)

In plain words: A **DTO (Data Transfer Object)** is a plain, immutable data carrier designed strictly to transport data across a network or architectural boundary.

Unlike an entity, a DTO has **zero persistence awareness**:
- **Contract-Driven**: A DTO models the public API contract between a client (mobile app, browser, external partner) and your backend service.
- **Completely Detached**: It has no connection to Hibernate, no `EntityManager`, no database session, and no dirty checking. Modifying a DTO field will never trigger a database query.
- **Behaviorless**: It contains no business logic or database annotations (`@Table`, `@Column`, `@OneToMany`). It contains only typed data fields and declarative validation rules (`@NotBlank`, `@Min`).

```
+----------------------------------------------------------------------------------------------------+
|                         ENTITY VS. DTO ARCHITECTURAL COMPARISON                                    |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   DIMENSION             JPA ENTITY (@Entity)                     DATA TRANSFER OBJECT (DTO)        |
|   ────────────────────  ───────────────────────────────────────  ────────────────────────────────  |
|   Primary Purpose       Models persistent database state         Models public network contracts   |
|   Lifecycle             Managed by Hibernate Persistence Context Completely stateless and detached |
|   Mutability            Mutable (relies on setters / mutators)   Strictly immutable (Java Records) |
|   Associations          Complex object graphs (@ManyToOne, etc.) Flattened primitives & IDs        |
|   Validation Scope      Database constraints (@Column, unique)   Client syntax validation (@Valid) |
|   Living Boundary       Internal to Service & Persistence Tiers  Crosses Web & Network Boundaries  |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

## 02. The Four Fatal Dangers of the "Entity Leak" Anti-Pattern

When developers take shortcuts and expose JPA entities directly to the web tier, they introduce four catastrophic failure modes into production.

---

### Danger 1: The Mass Assignment / Over-Posting Vulnerability (CWE-915)

#### What Is Mass Assignment? (Overview in Words)
In plain words: **Mass Assignment** (also known as Over-Posting) is a security vulnerability that occurs when a web framework automatically binds incoming JSON payload fields directly to an internal domain object or database entity without filtering.

If an attacker includes extra JSON properties that the developer did not intend for the user to modify, the framework happily populates them.

---

### The Real-World Incident: The GitHub 2012 Exploit

In March 2012, Russian security researcher **Egor Homakov** discovered a critical mass assignment vulnerability in GitHub's Ruby on Rails platform.

1. GitHub had an endpoint allowing users to add an SSH public key to their account:
   ```http
   POST /keys
   ```
2. The controller bound the incoming HTTP form parameters directly to the underlying `PublicKey` database model.
3. The `PublicKey` model had an internal foreign key column: `user_id`.
4. Homakov sent a request containing his own SSH public key, but injected an extra parameter:
   ```json
   {
     "key": "ssh-rsa AAAAB3NzaC1yc2E...",
     "user_id": 1
   }
   ```
5. `user_id = 1` belonged to a GitHub administrator. The framework assigned Homakov's SSH key to the administrator's account!
6. Homakov then used that key to push an unauthorized commit directly to the `rails/rails` master repository, demonstrating that mass assignment can compromise an entire tech ecosystem.

---

### How Mass Assignment Breaks Spring Boot

Consider a naive Spring Boot controller that binds directly to a `UserEntity`:

```java
// CATASTROPHIC SECURITY VULNERABILITY: Direct Entity Binding!
@RestController
@RequestMapping("/api/v1/users")
public class VulnerableUserController {

    private final UserRepository userRepository;

    public VulnerableUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<UserEntity> registerUser(@RequestBody UserEntity user) {
        // Attacker sends: { "username": "attacker", "password": "123", "role": "ADMIN", "isVerified": true }
        // Jackson populates user.setRole("ADMIN") and user.setIsVerified(true)!
        UserEntity savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }
}
```

```
+-----------------------------------------------------------------------------------------+
|                  THE ANATOMY OF A SPRING BOOT MASS ASSIGNMENT ATTACK                    |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   Attacker HTTP Request Payload:                                                        |
|   {                                                                                     |
|     "username": "hacker_99",                                                            |
|     "email": "hacker@evil.com",                                                         |
|     "password": "secretPassword123",                                                    |
|     "role": "SUPER_ADMIN",        <── ATTACKER INJECTS PRIVILEGED FIELD!                |
|     "walletBalance": 1000000.00,  <── ATTACKER INJECTS FINANCIAL BALANCE!               |
|     "isVerified": true            <── ATTACKER BYPASSES KYC EMAIL VERIFICATION!         |
|   }                                                                                     |
|           │                                                                             |
|           ▼                                                                             |
|   Jackson Deserializer reads UserEntity.class:                                          |
|   - Finds setRole() ──► Executes: user.setRole("SUPER_ADMIN")                           |
|   - Finds setWalletBalance() ──► Executes: user.setWalletBalance(1000000.00)            |
|   - Finds setIsVerified() ──► Executes: user.setIsVerified(true)                        |
|           │                                                                             |
|           ▼                                                                             |
|   userRepository.save(user) commits attacker as SUPER_ADMIN with $1,000,000 balance!    |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

Because `UserEntity` represents the complete database table, any writable property on that entity is exposed to the internet. 

**The Remedy**: With a strict `RegisterUserRequest` DTO, the DTO contains **only** `username`, `email`, and `password`. The fields `role`, `walletBalance`, and `isVerified` do not exist on the DTO; Jackson physically cannot bind them, rendering mass assignment impossible!

---

### Danger 2: The Jackson Infinite Recursion Crash (`StackOverflowError`)

#### What Is Bidirectional Association? (Overview in Words)
In relational database modeling, relationships are frequently bidirectional. For example:
- A `CustomerEntity` has a `@OneToMany` list of `OrderEntity` records.
- Each `OrderEntity` has a `@ManyToOne` reference back to its parent `CustomerEntity`.

#### What Happens During JSON Serialization:
When a controller returns `CustomerEntity` directly in a `ResponseEntity`, Spring delegates to Jackson's `MappingJackson2HttpMessageConverter`:

```
1. Jackson starts serializing CustomerEntity:
   Writes: { "id": 1, "name": "Alice", "orders": [ ... ] }

2. Jackson serializes the first OrderEntity inside "orders":
   Writes: { "orderId": 101, "total": 49.99, "customer": { ... } }

3. Jackson serializes the CustomerEntity inside "customer":
   Writes: { "id": 1, "name": "Alice", "orders": [ ... ] }

4. Jackson serializes the OrderEntity inside "orders":
   Writes: { "orderId": 101, "total": 49.99, "customer": { ... } }
...
INFINITE RECURSION!
```

Within milliseconds, the JVM exhausts the thread stack memory and crashes violently:

```text
java.lang.StackOverflowError: null
    at com.fasterxml.jackson.databind.ser.std.BeanSerializerBase.serializeFields(...)
    at com.store.customer.domain.CustomerEntity.toString(...)
    at com.store.order.domain.OrderEntity.toString(...)
```

---

### The Band-Aid Anti-Patterns: `@JsonIgnore` and `@JsonManagedReference`

Beginners often attempt to stop the crash by placing Jackson annotations directly on their JPA entities:

```java
// BAND-AID ANTI-PATTERN: Polluting database entities with web JSON annotations
@Entity
public class CustomerEntity {
    @OneToMany(mappedBy = "customer")
    @JsonManagedReference // BAD!
    private List<OrderEntity> orders;
}

@Entity
public class OrderEntity {
    @ManyToOne
    @JsonBackReference // BAD!
    private CustomerEntity customer;
}
```

#### Why This Fails in Enterprise Applications:
1. **Couples Database Models to Web Formats**: Your JPA entities now import `com.fasterxml.jackson.annotation.*`. Why should a database model care about JSON? What if an external system communicates via XML, Protobuf, or gRPC?
2. **One Size Does Not Fit All**: In the Customer Details view, you want to include orders. But in the Order Summary view, you want to include the customer! `@JsonIgnore` is a static, compile-time annotation. It silences the field globally across all endpoints, making context-specific representations impossible.

---

### Danger 3: The Detached Entity `LazyInitializationException`

As we established in [Lesson 11.2: Diagnosing & Tracing Errors](/notes/spring-boot-diagnosing-tracing-errors-stack-trace-anatomy-caused-by-mdc):
1. A service method retrieves an entity inside a `@Transactional` method.
2. When the service method returns, Spring's transaction manager commits the transaction and **closes the Hibernate Session**. The entity transitions into the **Detached** state.
3. The controller attempts to serialize the entity into JSON.
4. When Jackson calls `customer.getOrders()`, Hibernate discovers an uninitialized lazy proxy without an active database session.
5. Jackson crashes with:
   ```text
   org.hibernate.LazyInitializationException: failed to lazily initialize a collection: 
   could not initialize proxy - no Session
   ```

---

### Danger 4: Database Schema Lock-In & Accidental Information Leaks

When you return JPA entities directly:
1. **Accidental Credential Leaks**: If `UserEntity` contains a `passwordHash` or `mfaSecret` column, unless you remember to annotate it with `@JsonIgnore`, that hashed password is transmitted over the wire in every API response!
2. **Schema Lock-In**: If your database administrator renames the table column from `cust_addr_line1` to `street_address`, your public API JSON contract immediately changes, breaking third-party mobile applications.

---

## 03. The DTO Pattern: Architecture & Taxonomy

To isolate the internal database schema from the external public contract, we implement the **DTO (Data Transfer Object) Pattern**.

```
+----------------------------------------------------------------------------------------------------+
|                         THE STRICT ENTITY-DTO BOUNDARY TOPOLOGY                                    |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   EXTERNAL CLIENT                                                                                  |
|         │                                                                                          |
|         │ 1. Submits: CreateOrderRequest (Command DTO)                                             |
|         ▼                                                                                          |
|   [ OrderController ] (Web Tier)                                                                   |
|         │                                                                                          |
|         │ 2. Validates & passes CreateOrderRequest to Service                                      |
|         ▼                                                                                          |
|   [ OrderService ] (Service Tier - The Isolation Boundary!)                                        |
|         │                                                                                          |
|         ├─► 3. Maps Request DTO into OrderEntity                                                   |
|         ├─► 4. Calls OrderRepository.save(OrderEntity)                                             |
|         │                                                                                          |
|         ▼                                                                                          |
|   [ OrderRepository ] ──► Interacts with Database Table (Persistence Tier)                         |
|         │                                                                                          |
|         ▼                                                                                          |
|   [ OrderService ]                                                                                 |
|         │                                                                                          |
|         ├─► 5. Maps saved OrderEntity into OrderResponse (Representation DTO)                      |
|         │                                                                                          |
|         ▼                                                                                          |
|   [ OrderController ] ◄── Receives OrderResponse (Never sees OrderEntity!)                         |
|         │                                                                                          |
|         │ 6. Emits 201 Created with OrderResponse JSON                                             |
|         ▼                                                                                          |
|   EXTERNAL CLIENT                                                                                  |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

### The Three Core DTO Archetypes

In a mature enterprise application, DTOs are divided into three distinct archetypes based on their architectural intent:

#### 1. Command / Request DTOs (`CreateUserRequest`, `UpdateAddressRequest`)
- Models incoming input data from clients.
- Enforces declarative syntax validation constraints (`@NotBlank`, `@Email`, `@Size`, `@Min`).
- Strictly excludes sensitive or system-managed fields (e.g., `id`, `createdAt`, `updatedAt`, `role`, `accountBalance`).

#### 2. Representation / Response DTOs (`UserResponse`, `OrderSummaryResponse`)
- Models outgoing data sent back to clients.
- Strips all internal database metadata (passwords, salts, tenant IDs, optimistic locking versions).
- Flattens complex entity relationships into simple, readable objects or summary IDs.

#### 3. Projection DTOs / Read Models (`ProductCatalogItem`)
- Lightweight, read-only DTOs optimized for high-throughput listing and search queries (e.g., fetching only `id`, `title`, and `price` to populate a mobile search grid without loading full entity graphs).

---

## 04. Modeling DTOs with Modern Java 21 Records

Historically, creating DTOs in Java was notoriously tedious: developers had to write private final fields, constructors, getters, `equals()`, `hashCode()`, and `toString()`, or rely on third-party annotation processors like Lombok (`@Value`, `@Builder`).

In modern Spring Boot 3, **Java 21 Records** are the definitive, standard vehicle for DTO design.

---

### What Is a Java Record? (Overview in Words)

In plain words: A **Record** is a transparent, immutable data carrier class introduced into the Java language specification.

When you declare a `record`, the Java compiler automatically generates:
- Private, `final` fields for each component.
- Public accessor methods matching the component name (e.g., `user.username()` instead of `user.getUsername()`).
- Canonical constructor initializing all components.
- Value-based `equals()` and `hashCode()` implementations comparing internal components.
- Human-readable `toString()` output.

---

### The Power of Compact Constructors for Defensive Invariants

A record allows you to declare a **Compact Constructor** without repeating component parameters. This is the ideal location to perform data normalization, defensive copying, and invariant checks.

#### What We Are Doing in the Below Code:
We model an immutable `CreateUserRequest` DTO using a Java 21 Record. We apply Jakarta Bean Validation annotations directly to the record components. In the compact constructor, we automatically sanitize the incoming data (trimming whitespace and lowercasing the email address) and create an unmodifiable defensive copy of the `roles` set to guarantee immutability.

```java
package com.store.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Collections;
import java.util.Set;

public record CreateUserRequest(
        @NotBlank(message = "Username cannot be blank")
        @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
        String username,

        @NotBlank(message = "Email cannot be blank")
        @Email(message = "Must be a valid email format")
        String email,

        @NotBlank(message = "Password cannot be blank")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        Set<String> roles
) {
    // COMPACT CONSTRUCTOR: Data normalization & defensive copying
    public CreateUserRequest {
        // 1. Sanitize text inputs
        username = (username != null) ? username.trim() : null;
        email = (email != null) ? email.trim().toLowerCase() : null;

        // 2. Defensive copy: Ensure roles collection cannot be mutated externally
        roles = (roles != null) ? Collections.unmodifiableSet(roles) : Collections.emptySet();
    }
}
```

---

## 05. Entity Encapsulation: Designing Rich Domain Models

While DTOs should be immutable, **JPA Entities must be properly encapsulated**.

### The Anemic Domain Model Anti-Pattern

A major design flaw in enterprise applications is generating public getters and public setters for every single column on a database entity:

```java
// ANTI-PATTERN: Anemic Domain Model (Leaky Setters)
@Entity
public class OrderEntity {
    private String status;

    public void setStatus(String status) { // DANGEROUS!
        this.status = status;
    }
}
```

#### Why Public Setters Destroy Domain Integrity:
If `setStatus()` is public, any developer across any service can execute:
```java
order.setStatus("CANCELLED");
```
This bypasses all business invariants! Did anyone check if the order was already shipped? Did anyone issue a refund to the payment gateway? Did anyone replenish the warehouse inventory?

---

### Designing a Rich Domain Entity

A production-grade JPA entity protects its invariants through **Encapsulation**:
- Fields are `private`.
- Public setters are **completely removed**.
- State transitions are performed through **explicit domain methods** with business intent (e.g., `cancel()`, `ship()`, `applyDiscount()`).
- A `protected` no-argument constructor is provided strictly to satisfy the JPA/Hibernate reflection proxy specification.

#### What We Are Doing in the Below Code:
We design a rich, encapsulated `UserEntity`. Notice that sensitive fields like `passwordHash` have no public setters. Changing a password requires invoking the business method `updatePassword()`, which enforces business validation rules.

```java
package com.store.user.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "app_users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 30)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    // Required by JPA / Hibernate reflection proxy mechanics
    protected UserEntity() {}

    // Controlled constructor for new domain entity creation
    public UserEntity(String username, String email, String passwordHash) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = UserRole.CUSTOMER; // Enforces default role safely!
        this.active = true;
        this.createdAt = Instant.now();
    }

    // Explicit domain operations instead of naked setters
    public void updatePassword(String newPasswordHash) {
        if (newPasswordHash == null || newPasswordHash.isBlank()) {
            throw new IllegalArgumentException("Password hash cannot be empty.");
        }
        this.passwordHash = newPasswordHash;
    }

    public void deactivate() {
        this.active = false;
    }

    // Read-only getters
    public UUID getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public UserRole getRole() { return role; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }
}
```

---

## 06. The Response DTO: Sanitizing and Flattening Data

When sending data back to the client, we construct a dedicated Response DTO that exposes only safe, public fields.

#### What We Are Doing in the Below Code:
We model `UserResponse` as an immutable Java 21 Record. It contains a static factory method `fromEntity(UserEntity entity)` that extracts the public fields from the entity. 

Notice what is **missing**: `passwordHash` is completely excluded from the record components. It is physically impossible for the client to receive the password hash, eliminating credential leakage.

```java
package com.store.user.dto;

import com.store.user.domain.UserEntity;
import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String username,
        String email,
        String role,
        boolean active,
        Instant memberSince
) {
    // Static factory for clean entity-to-DTO projection
    public static UserResponse fromEntity(UserEntity entity) {
        return new UserResponse(
                entity.getId(),
                entity.getUsername(),
                entity.getEmail(),
                entity.getRole().name(),
                entity.isActive(),
                entity.getCreatedAt()
        );
    }
}
```

---

## 07. The Complete End-to-End Enterprise Flow

Let us assemble all the pieces into a cohesive, production-grade microservice workflow showing strict layer isolation and entity encapsulation.

---

### Step 1: The Controller (Web Tier)

#### What We Are Doing in the Below Code:
The controller receives the `CreateUserRequest` DTO, triggers syntax validation via `@Valid`, invokes the business service, and returns a `201 Created` status with the canonical `Location` header and the `UserResponse` DTO.

```java
package com.store.user.web;

import com.store.user.dto.CreateUserRequest;
import com.store.user.dto.UserResponse;
import com.store.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> register(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.registerUser(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable UUID id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }
}
```

---

### Step 2: The Service (Isolation Boundary)

#### What We Are Doing in the Below Code:
The service acts as the strict security boundary. It accepts `CreateUserRequest`, checks domain invariants (ensuring email uniqueness), hashes the password using BCrypt, creates the `UserEntity`, persists it via `UserRepository`, and returns `UserResponse`. 

The JPA entity is instantiated, managed, and committed **entirely within the service layer**. It never crosses into the web controller.

```java
package com.store.user.service;

import com.store.common.exception.BusinessConflictException;
import com.store.common.exception.ResourceNotFoundException;
import com.store.user.domain.UserEntity;
import com.store.user.dto.CreateUserRequest;
import com.store.user.dto.UserResponse;
import com.store.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse registerUser(CreateUserRequest request) {
        // 1. Business Invariant: Email uniqueness
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessConflictException(
                    "DUPLICATE_EMAIL", 
                    "Email is already registered: " + request.email(), 
                    Map.of("email", request.email())
            );
        }

        // 2. Hash sensitive password
        String encodedPassword = passwordEncoder.encode(request.password());

        // 3. Instantiate encapsulated domain entity
        UserEntity user = new UserEntity(request.username(), request.email(), encodedPassword);

        // 4. Persist to database
        UserEntity savedUser = userRepository.save(user);

        // 5. Transform to safe response DTO
        return UserResponse.fromEntity(savedUser);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        return userRepository.findById(id)
                .map(UserResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}
```

---

## 08. Subtle Gotchas & Production Anti-Patterns

### Gotcha 1: Reusing the Same DTO for Create and Update (`POST` vs. `PUT`/`PATCH`)

A common mistake is using a single `UserDto` for all endpoints:

```java
// ANTI-PATTERN: Single generic DTO for Create and Update
public record UserDto(UUID id, String username, String email, String password) {}
```

#### Why This Breaks Down:
- On `POST /users` (Create): `id` must be empty (generated by database), but `password` is strictly required.
- On `PUT /users/{id}` (Update): `id` comes from the URL path, but the user is not updating their password.
- If you use one DTO, your validation annotations become messy, conditional, or disabled.

> **Rule of Law**: Use separate DTOs for separate intents: `CreateUserRequest`, `UpdateProfileRequest`, `ChangePasswordRequest`, and `UserResponse`.

---

### Gotcha 2: The "Shallow Immutability" Trap with Collections in Records

While Java Records make primitive and reference fields `final`, **collections inside a record remain mutable unless explicitly defended**:

```java
// DANGEROUS: Caller can still mutate the internal list!
public record OrderDto(UUID id, List<String> tags) {}
```

If an external caller executes:
```java
orderDto.tags().add("MALICIOUS_TAG");
```
The list is modified in place!

**The Remedy**: Always use `List.copyOf()` or `Collections.unmodifiableList()` in the record's compact constructor:
```java
public record OrderDto(UUID id, List<String> tags) {
    public OrderDto {
        tags = (tags != null) ? List.copyOf(tags) : List.of();
    }
}
```

---

## 09. Authoritative References & Further Reading

To explore entity encapsulation, data transfer object architectures, and mass assignment security mitigations at the source, consult these canonical resources:

- [Martin Fowler — Data Transfer Object Pattern (P of EAA)](https://martinfowler.com/eaaCatalog/dataTransferObject.html)  
  *The foundational definition of the DTO pattern and its role in cross-boundary network communication.*
- [OWASP Top 10 API Security — API6:2023 Unrestricted Resource Consumption & Mass Assignment](https://owasp.org/API-Security/editions/2023/en/0xa6-unrestricted-resource-consumption/)  
  *Official OWASP security specification explaining the mechanics and prevention of CWE-915 Mass Assignment attacks.*
- [The Java Language Specification — Java SE 21: Record Classes](https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.10)  
  *Authoritative specification governing Java Record component semantics, compact constructors, and value-based immutability.*
- [Hibernate ORM Official Guide — Entity States & Persistence Context Lifecycle](https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#pc)  
  *Comprehensive guide to Managed, Detached, and Transient entity lifecycles and dirty checking internals.*
- [GitHub Security Incident Analysis (2012) — The Mass Assignment Vulnerability](https://github.blog/news-insights/company-news/public-key-security-vulnerability-and-mitigation/)  
  *Post-mortem analysis of the real-world mass assignment breach that compromised GitHub's public key infrastructure.*
