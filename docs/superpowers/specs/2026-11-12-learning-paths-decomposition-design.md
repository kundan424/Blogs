# Design Document: Learning Paths Hierarchical Decomposition

- **Date:** 2026-11-12
- **Topic:** Decomposing `learningPaths.ts` into a modular, hierarchical track and phase architecture.
- **Status:** Approved Architecture / Ready for Implementation

---

## 1. Intent & The Why

`src/data/learningPaths.ts` has grown to over 1,350 lines, containing 4 separate tracks. The flagship track, "Spring Boot 3 & Microservices Architecture", alone spans 35 modules across 9 distinct pedagogical phases (72 defined lessons, estimated at 75 in metadata).

As more lessons, curriculum topics, and tracks are added:
- Navigating and editing a monolithic file causes cognitive overhead and friction.
- Concurrent contributions or updates to different curriculum tracks/phases suffer from high merge-conflict risk.
- There is no domain isolation between foundational tracks (e.g. Docker, Java Core) and deep enterprise tracks (e.g. Spring Boot).

Decomposing this monolithic data structure into modular, hierarchical TypeScript files makes curriculum content maintainable, scalable, and isolated, while maintaining 100% type safety and zero runtime regressions for existing consumers.

---

## 2. Goals, Non-Goals, & Anti-Goals

### Goals
- **Modular Directory Structure:** Split `learningPaths.ts` into a clean hierarchy under `src/data/learning-paths/`.
- **Chronological Phase Slicing for Spring Boot:** Subdivide the 35 modules of Spring Boot across 9 cleanly isolated phase files matching the existing roadmap phases and sequential order (Modules 01–35).
- **Individual Track Files:** Separate other tracks (`microservices`, `java-core`, `docker`) into dedicated individual files.
- **Seamless Consumption:** Ensure `learningPathLoader.ts` and all consumer pages (`LearningPathDetailPage`, `SubjectHubPage`, `NoteDetailPage`) require zero breaking changes.
- **Preserve Full Type Safety:** Keep all entities typed with `LearningPath`, `LearningModule`, and `Lesson` from `src/types`.
- **100% Backward Compatibility:** Maintain `src/data/learningPaths.ts` as a re-export from `./learning-paths` so existing imports continue to resolve without issue.

### Non-Goals
- Changing the schema or interfaces of `LearningPath`, `LearningModule`, or `Lesson` in `src/types/index.ts`.
- Migrating to external YAML/JSON or database models.
- Modifying UI components or page routing.
- Reorganizing or reordering modules or pedagogical progression.

### Anti-Goals
- Introducing dynamic asynchronous loading (`async`/`await` / `Promise`) into synchronous loader functions (`getAllLearningPaths()`), which would break existing React component synchronous rendering.
- Modifying or dropping any lesson, module, topic, or description.

---

## 3. Constraints
- Must pass `npm run build` (`tsc && vite build`) without type errors or broken imports.
- Must preserve exact module IDs, lesson IDs, titles, descriptions, status, read times, topics, and noteSlug mappings without data loss or reordering.
- The exported `learningPaths` array must contain exactly 4 tracks, 40 modules, and 88 lessons matching the existing data structure identically.

---

## 4. Approaches Considered

1. **Flat Track-Level Modularization (`src/data/learning-paths/*.ts`)**
   - *Trade-off:* While it splits separate tracks, `spring-boot.ts` remains a single ~1,100-line monolith, leaving the primary scalability issue unresolved.
2. **Content-Driven JSON / YAML Files with Dynamic Vite Glob**
   - *Trade-off:* Loses compile-time TypeScript type checking without adding a runtime schema validation layer like Zod; requires modifying synchronous loaders.
3. **Hierarchical Track & Phase Decomposition (Selected & Approved)**
   - *Rationale:* Combines modularity, domain clarity, and compile-time type safety. Large tracks are subdivided by curriculum phase; smaller tracks are kept in concise single files.

---

## 5. Architectural Design

### 5.1 Directory Structure
```text
src/data/
├── learningPaths.ts                                # Barrel re-export for backwards compatibility
└── learning-paths/
    ├── index.ts                                    # Central aggregator exporting learningPaths: LearningPath[]
    ├── microservices.ts                            # Microservices track (~80 lines, 2 modules, 5 lessons)
    ├── java-core.ts                                # Java Core & OOP track (~120 lines, 2 modules, 8 lessons)
    ├── docker.ts                                   # Docker container runtime track (~55 lines, 1 module, 3 lessons)
    └── spring-boot/
        ├── index.ts                                # Assembles track metadata + modules array
        ├── phase-0-prerequisites.ts                # Modules 01–02: Build Tools & Network/DB
        ├── phase-1-spring-core.ts                  # Modules 03–07: Spring Framework Core
        ├── phase-2-spring-boot.ts                  # Modules 08–12: Spring Boot 3 Essentials & REST APIs
        ├── phase-3-data-access.ts                  # Modules 13–17: Data Persistence & Transaction Internals
        ├── phase-4-production-essentials.ts        # Modules 18–20: Security, Testing & Observability
        ├── phase-5-microservices-transition.ts     # Modules 21–23: Transitioning to Microservices & DDD
        ├── phase-6-spring-cloud.ts                 # Modules 24–27: Core Spring Cloud Infrastructure
        ├── phase-7-distributed-messaging.ts        # Modules 28–32: Distributed Patterns & Async Messaging
        └── phase-8-cloud-native.ts                 # Modules 33–35: Containerization, Kubernetes & CI/CD
```

### 5.2 Phase Breakdown & Module Mapping
| Phase File | Phase Title | Modules Included |
|---|---|---|
| `phase-0-prerequisites.ts` | Phase 0: Prerequisites | `sb-mod-01` (Maven), `sb-mod-02` (Networking & Relational DBs) |
| `phase-1-spring-core.ts` | Phase 1: Spring Framework Core | `sb-mod-03` (IoC/DI), `sb-mod-04` (Bean Lifecycle), `sb-mod-05` (Configuration), `sb-mod-06` (AOP), `sb-mod-07` (Events) |
| `phase-2-spring-boot.ts` | Phase 2: Spring Boot 3 Essentials & REST APIs | `sb-mod-08` (Auto-config), `sb-mod-09` (REST APIs), `sb-mod-10` (Error Handling), `sb-mod-11` (Validation), `sb-mod-12` (Actuator) |
| `phase-3-data-access.ts` | Phase 3: Data Persistence & Transaction Internals | `sb-mod-13` (JPA/Hibernate), `sb-mod-14` (Spring Data JPA), `sb-mod-15` (Transactions), `sb-mod-16` (Auditing), `sb-mod-17` (Flyway/Liquibase) |
| `phase-4-production-essentials.ts` | Phase 4: Production-Grade Essentials | `sb-mod-18` (Spring Security 6), `sb-mod-19` (Testing), `sb-mod-20` (Observability & Health Checks) |
| `phase-5-microservices-transition.ts` | Phase 5: Transitioning to Microservices & Domain Design | `sb-mod-21` (Monolith vs Microservices), `sb-mod-22` (DDD Fundamentals), `sb-mod-23` (Database per Microservice) |
| `phase-6-spring-cloud.ts` | Phase 6: Core Spring Cloud Infrastructure | `sb-mod-24` (Spring Cloud Config), `sb-mod-25` (Eureka Discovery), `sb-mod-26` (OpenFeign & WebClient), `sb-mod-27` (Spring Cloud Gateway) |
| `phase-7-distributed-messaging.ts` | Phase 7: Distributed Patterns & Asynchronous Messaging | `sb-mod-28` (Resilience4j), `sb-mod-29` (Kafka & RabbitMQ), `sb-mod-30` (Saga & Outbox Patterns), `sb-mod-31` (Distributed Tracing), `sb-mod-32` (Security Token Relay) |
| `phase-8-cloud-native.ts` | Phase 8: Containerization, Kubernetes & Cloud-Native Deployment | `sb-mod-33` (Docker & Buildpacks), `sb-mod-34` (Kubernetes Fundamentals), `sb-mod-35` (CI/CD Automation) |

### 5.3 Module Data Flow
1. **Phase files** export typed `LearningModule[]` arrays (e.g. `export const phase0Modules: LearningModule[] = [...]`).
2. **`spring-boot/index.ts`** imports each phase module array, flattens them into `springBootPath.modules: LearningModule[]`, and exports `export const springBootPath: LearningPath = { ... }`.
3. **`learning-paths/index.ts`** imports `springBootPath`, `microservicesPath`, `javaCorePath`, and `dockerPath`, exporting:
   ```typescript
   export const learningPaths: LearningPath[] = [
     springBootPath,
     microservicesPath,
     javaCorePath,
     dockerPath,
   ];
   ```
4. **`src/data/learningPaths.ts`** re-exports:
   ```typescript
   export { learningPaths } from './learning-paths';
   ```

---

## 6. Verification Target
- Run verification script to compare the new modular data structure against the original:
  - Total learning paths: exactly 4
  - Total modules: exactly 40 (Spring Boot: 35, Microservices: 2, Java Core: 2, Docker: 1)
  - Total lessons: exactly 88 (Spring Boot: 72, Microservices: 5, Java Core: 8, Docker: 3)
  - Deep equality: JSON structure matches existing array 100%.
- `npm run build` succeeds with zero TypeScript or packaging errors.
