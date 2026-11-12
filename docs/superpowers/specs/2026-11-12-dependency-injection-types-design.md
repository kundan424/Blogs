# Design Document: Types of Dependency Injection in Spring (First Principles Deep Dive)

- **Date:** 2026-11-12
- **Topic:** Comprehensive, mentor-led tutorial deep-diving into Constructor, Setter, and Field Injection from first principles.
- **Title:** `Types of Dependency Injection in Spring`
- **Location:** `content/backend-distributed-systems/dependency-injection-constructor-setter-field.md`
- **Curriculum Coordinate:** Module 03 (IoC & DI), Lesson 3.2 (`sb-3-2`) in `phase-1-spring-core.ts`.

---

## 1. Intent & Pedagogical Goals

Junior and mid-level developers frequently use `@Autowired` on private fields without understanding what the Spring IoC container does under the hood. When unexpected `NullPointerException`s occur during unit testing, or circular dependency deadlocks manifest in production, developers struggle to diagnose the root cause.

This deep dive explains:
- The fundamental object construction contract from first principles (mandatory vs. optional dependencies, immutability, temporal coupling).
- An exhaustive analysis of all three DI variants: Constructor Injection, Setter Injection, and Field Injection.
- The technical and architectural reasons why Field Injection is considered a production anti-pattern (reflection bytecode bypass, untestable code, hidden SRP violations, circular dependency masking).
- Modern idiomatic practices in Spring Boot 3 / Java 21 (Lombok `@RequiredArgsConstructor`, implicit autowiring, Java 21 record components).
- Authoritative industry citations and documentation links.

---

## 2. Structural Breakdown

1. **The Construction Contract: What Does an Object Need to Exist?**
   - Pure POJO mechanics before frameworks.
   - Mandatory dependencies (Engine in a Car) vs. Optional dependencies (Air Conditioner in a Car).
   - The danger of partially initialized / invalid object states.

2. **Constructor Injection (The Gold Standard)**
   - How it works: Explicit parameters passed at instantiation time.
   - Modern Spring 4.3+ / Spring Boot 3 implicit `@Autowired` behavior on single constructors.
   - The 4 Architectural Superpowers:
     1. True Immutability (`final` keyword, thread safety, preventing mutation after construction).
     2. Compile-Time & Instantiation-Time Null Safety (Fail-Fast principle).
     3. Framework-Free Pure Unit Testing (`new OrderService(mockRepo)` executing in sub-milliseconds).
     4. Deterministic Circular Dependency Detection at bootstrap (`BeanCurrentlyInCreationException`).

3. **Setter Injection (For True Optional Dependencies)**
   - How it works: No-args constructor + public setter methods.
   - Real-world production use cases: Dynamic cache providers, optional notification channels, JMX telemetry reconfiguration.
   - Architectural tradeoffs: Mutability risk (cannot be `final`), Temporal Coupling (methods called before setters).

4. **Field Injection (The Seductive Anti-Pattern)**
   - How it works: `@Autowired` directly on private fields.
   - Why developers are drawn to it: Zero boilerplate, concise appearance.
   - The 5 Hidden Production Landmines:
     1. Encapsulation Violation & Reflection Overhead (`Field.setAccessible(true)` breaking JVM access controls).
     2. Unit Testing Crippled: Inability to instantiate and test without reflection or heavy `@SpringBootTest` context boots.
     3. Single Responsibility Principle (SRP) Blindspot: Constructor parameter lists visibly warn when a class has 8+ dependencies; field injection masks bloated classes with 15+ fields.
     4. Circular Dependency Masking: Hides architectural dependency cycles until runtime deadlocks occur.
     5. Complete loss of immutability (fields cannot be `final`).

5. **Modern Production Idioms (Java 21 & Spring Boot 3)**
   - Lombok `@RequiredArgsConstructor` with `private final` fields.
   - Java 21 Records with canonical constructor DI for immutable utility and configuration components.

6. **Comprehensive Architectural Decision Matrix**
   - Detailed comparison table covering Immutability, Null Safety, Unit Testability, Circular Dependency Detection, and Best Practice Status.

7. **Standard Reference Documentation & External Citations**
   - Official Spring Framework Core Documentation (Dependencies & Setter vs. Constructor).
   - Martin Fowler's "Inversion of Control Containers and the Dependency Injection Pattern".
   - SOLID Principles (Dependency Inversion Principle & Single Responsibility Principle).

---

## 3. Curriculum Integration

In `src/data/learning-paths/spring-boot/phase-1-spring-core.ts`:
- Update `sb-3-2`:
  - `title`: `'Types of Dependency Injection: Constructor, Setter & Field Injection'`
  - `noteSlug`: `'dependency-injection-constructor-setter-field'`
  - `status`: `'published'`
  - `readTime`: `'20m read'`

---

## 4. Verification Target
- `npm run scan` parses and discovers the new article under `backend-distributed-systems` (total 17 published articles).
- `scripts/test-learning-paths.ts` passes with updated snapshot (matching metadata).
- `npm run build` (`tsc && vite build`) compiles with zero errors.
