---
title: "Derived Queries & Custom JPQL / Native Queries with @Query"
slug: spring-boot-derived-queries-custom-jpql-native-sql-modifying
subject: backend-distributed-systems
abstract: An architectural, mentor-led guide to mastering query execution in Spring Data JPA. Learn how method name derivation works under the hood via the PartTree parser, when derived queries turn into unmaintainable anti-patterns, how to write robust, portable JPQL with named parameters, when to break out into database-specific Native SQL, and how to safely execute bulk updates and deletions using @Modifying without corrupting the Hibernate first-level cache.
tags:
  - spring-data-jpa
  - jpql
  - native-sql
  - derived-queries
  - query-optimization
  - hibernate
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

# Derived Queries & Custom JPQL / Native Queries with @Query

In [Lesson 15.1: Repository Hierarchy: CrudRepository to JpaRepository Abstractions](/learning-paths/spring-boot-production-mastery), we dissected how Spring Data constructs dynamic runtime proxies and how `SimpleJpaRepository` handles basic CRUD operations like `save()` and `findById()`.

However, real-world enterprise applications cannot survive on primary key lookups alone. 

You need to search accounts by email and tenant ID, filter orders by status and date ranges, join customer profiles, and execute bulk price updates across millions of inventory rows.

In Spring Data JPA, you have three primary mechanisms to retrieve and manipulate data:
1. **Derived Queries**: Declaring descriptive method names (`findByEmailAndStatus`) that Spring parses into SQL automatically.
2. **Custom JPQL Queries**: Writing object-oriented queries with `@Query` that operate on Java entity types and attributes.
3. **Native SQL Queries**: Writing database-specific SQL (`@Query(nativeQuery = true)`) to leverage proprietary database engine features.

In addition, executing bulk updates and deletes introduces **`@Modifying`**, which carries one of the most dangerous persistence traps in Spring Boot: **the stale First-Level Cache problem**.

In this lesson, we will deconstruct these query strategies from first principles. We will examine the `PartTree` parser, establish rules for when to abandon derived queries, contrast JPQL with Native SQL, and master safe bulk modifications with `@Modifying`.

---

## 01. The Three Query Strategies: Architectural Overview

Before looking at syntax, let's understand how the three query strategies compare from an architectural standpoint:

```
+--------------------------------------------------------------------------------------------------+
|                            SPRING DATA JPA QUERY STRATEGY SPECTRUM                               |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   1. DERIVED QUERIES (Method Name Derivation via PartTree)                                       |
|   ────────────────────────────────────────────────────────                                       |
|   findByEmailAndStatus(String email, AccountStatus status)                                       |
|   • Parsed at application bootstrap from the method name.                                        |
|   • Best for: Simple 1-2 parameter lookups.                                                      |
|   • Limitation: Method names become unreadable and brittle when queries involve complex logic.   |
|                                                                                                  |
|   2. CUSTOM JPQL QUERIES (@Query)                                                                |
|   ───────────────────────────────                                                                |
|   @Query("SELECT a FROM Account a WHERE a.email = :email AND a.status = :status")                |
|   • Operates on Java Entity and Field names (Object-Relational abstraction).                     |
|   • Validated at startup by Hibernate. Fully portable across database engines.                   |
|   • Best for: Medium-to-complex queries, joins, projections, and standard business logic.        |
|                                                                                                  |
|   3. NATIVE SQL QUERIES (@Query(nativeQuery = true))                                             |
|   ──────────────────────────────────────────────────                                             |
|   @Query(value = "SELECT * FROM accounts WHERE metadata->>'tier' = :tier", nativeQuery = true)   |
|   • Dispatched directly to the database wire (operates on physical tables and columns).          |
|   • Best for: Engine-specific features (PostgreSQL JSONB, CTEs, window functions, full-text).    |
|   • Limitation: Vendor lock-in, zero startup validation, requires explicit count queries.        |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

---

## 02. Mechanism 1: Derived Queries (Method Name Derivation)

### How Spring Parses Method Names
When you declare a method in a repository interface, Spring Data's **`PartTree`** parser analyzes the method name using a formal grammar.

The method name is split into two primary components:
1. **The Subject**: Determines *what* the query returns (e.g., entity, count, boolean existence, slice).
2. **The Predicate**: Determines *how* to filter the data (the `WHERE` clause).

```
+--------------------------------------------------------------------------------------------------+
|                              ANATOMY OF A DERIVED QUERY METHOD                                   |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|       findDistinctFirst5By  TenantIdAndStatus  OrderByCreatedAtDesc                              |
|       └─────────┬────────┘  └───────┬────────┘ └──────────┬─────────┘                            |
|                 │                   │                     │                                      |
|                 ▼                   ▼                     ▼                                      |
|            THE SUBJECT         THE PREDICATE        ORDERING CLAUSE                              |
|          (Return Top 5       (WHERE tenant_id = ?   (ORDER BY created_at                         |
|           Distinct Entities)  AND status = ?)        DESC)                                       |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

### Supported Subject Keywords
- **Entity Retrieval**: `findBy...`, `readBy...`, `getBy...`, `queryBy...`, `searchBy...`, `streamBy...`
- **Existence Checks**: `existsBy...` (Compiles to an optimized `SELECT 1 ... WHERE ... LIMIT 1`)
- **Count Queries**: `countBy...` (Compiles to `SELECT COUNT(*) ... WHERE ...`)
- **Deletion**: `deleteBy...`, `removeBy...` (Loads and deletes entities matching predicate)
- **Limiting**: `findFirstBy...`, `findTop3By...`, `findDistinctBy...`

### Supported Predicate Keywords
Spring Data maps method keywords directly into SQL conditional operators:

```
+--------------------------------------------------------------------------------------------------+
|                            COMMON DERIVED QUERY PREDICATE KEYWORDS                               |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   KEYWORD               METHOD SIGNATURE EXAMPLE               TRANSLATED SQL CONDITION          |
|   ────────────────────  ─────────────────────────────────────  ───────────────────────────────── |
|   And                   findByEmailAndStatus(...)              WHERE email = ? AND status = ?    |
|   Or                    findByEmailOrUsername(...)             WHERE email = ? OR username = ?   |
|   Is, Equals            findByStatus(Status.ACTIVE)            WHERE status = ?                  |
|   Between               findByCreatedAtBetween(start, end)     WHERE created_at BETWEEN ? AND ?  |
|   LessThan / GreaterThan findByAgeGreaterThan(18)              WHERE age > ?                     |
|   IsNull / IsNotNull    findByDeletedAtIsNull()                WHERE deleted_at IS NULL          |
|   Like / StartingWith   findByEmailStartingWith("admin")       WHERE email LIKE 'admin%'         |
|   Containing            findByBioContaining("engineer")        WHERE bio LIKE '%engineer%'       |
|   In / NotIn            findByStatusIn(Set<Status> statuses)   WHERE status IN (?, ?, ?)         |
|   True / False          findByActiveTrue()                     WHERE active = true               |
|   IgnoreCase            findByEmailIgnoreCase(email)           WHERE UPPER(email) = UPPER(?)     |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

### Handling Property Path Ambiguity with Underscores (`_`)
When traversing nested entities, property names can occasionally collide. 

Imagine an `Account` entity with an `Address address` property, and `Address` has a `String zipCode` property. 
If `Account` also has a field named `addressZipCode`, writing:
```java
List<Account> findByAddressZipCode(String zipCode);
```
creates an ambiguity: does this refer to `account.addressZipCode` or `account.address.zipCode`?

To resolve this, Spring Data reserves the underscore (`_`) as an explicit **property traversal delimiter**:
```java
// Explicitly navigates: account -> address -> zipCode
List<Account> findByAddress_ZipCode(String zipCode);
```

### The Breaking Point: When Derived Queries Become an Anti-Pattern
Derived queries are fantastic for simple lookups (`findByEmail`, `existsByAccountNumber`).

However, as business requirements evolve, developers frequently fall into the **Method Name Explosion Anti-Pattern**:

```java
// NEVER DO THIS: The Method Name Explosion Anti-Pattern
List<Account> findByTenantIdAndStatusAndCreatedAtGreaterThanEqualAndOwnerEmailContainingIgnoreCaseOrderByCreatedAtDesc(
    UUID tenantId, AccountStatus status, Instant cutoff, String emailFragment
);
```

Why is this an anti-pattern?
1. **Unreadable**: The method signature stretches across three lines of code.
2. **Brittle Refactoring**: Renaming a single field on the entity breaks the method name silently until compilation.
3. **No Index Control**: It obscures what SQL query is actually being executed, making database performance analysis difficult during code reviews.

> [!TIP]
> **The Rule of Two**: If your query requires more than **two** predicate parameters, or requires table joins, abandon derived query names immediately and switch to **`@Query`**.

---

## 03. Mechanism 2: Custom JPQL Queries with `@Query`

### What is JPQL?
The **Jakarta Persistence Query Language (JPQL)** is an object-oriented query language defined by the JPA specification.

Instead of operating on physical database tables and snake_case column names, JPQL operates on **Java Entity classes and their attributes**:

```
+--------------------------------------------------------------------------------------------------+
|                                    JPQL VS. SQL COMPARISON                                       |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   JPQL (Object-Oriented Domain Query):                                                           |
|   SELECT a FROM Account a WHERE a.ownerEmail = :email AND a.status = :status                     |
|          │      ▲       │          ▲                       ▲                                     |
|          │      │       │          │                       │                                     |
|   Entity ┘      │       │   Entity Property         Entity Property                              |
|   Alias    Entity Name  │                                                                        |
|                         ▼                                                                        |
|   TRANSLATED RELATIONAL SQL (PostgreSQL Dialect):                                                |
|   SELECT id, account_num, owner_email, status FROM accounts WHERE owner_email = ? AND status = ? |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

### Named Parameters vs. Positional Parameters
In JPQL, you can bind method arguments using positional numbers (`?1`, `?2`) or named parameters (`:paramName`):

```java
// FRAGILE: Positional parameters break if argument order changes
@Query("SELECT a FROM Account a WHERE a.ownerEmail = ?1 AND a.status = ?2")
Optional<Account> findByEmailAndStatusPositional(String email, AccountStatus status);

// ROBUST: Named parameters are explicit and resilient to refactoring
@Query("SELECT a FROM Account a WHERE a.ownerEmail = :email AND a.status = :status")
Optional<Account> findByEmailAndStatus(
    @Param("email") String email, 
    @Param("status") AccountStatus status
);
```

*(Note: In modern Java compilers with the `-parameters` flag enabled, Spring Data can infer parameter names automatically, but using `@Param` remains best practice for enterprise clarity).*

### Performing Joins in JPQL
JPQL allows you to express joins directly along object association paths:

```java
public interface OrderRepository extends JpaRepository<Order, UUID> {

    // Inner join along the entity association path:
    @Query("""
        SELECT o FROM Order o
        JOIN o.items item
        WHERE item.product.sku = :sku AND o.status = :status
        """)
    List<Order> findAllOrdersContainingSku(
        @Param("sku") String sku, 
        @Param("status") OrderStatus status
    );
}
```

### Key Advantages of JPQL
1. **Startup Syntax Validation**: When your Spring Boot application starts up, Hibernate parses and validates every `@Query` JPQL string. If you mistype a field name (`a.emaiil` instead of `a.ownerEmail`), the application fails fast at startup with an `InvalidPathException` instead of blowing up in production.
2. **Database Portability**: The same JPQL query runs identically on PostgreSQL, MySQL, MariaDB, or Oracle. Hibernate handles the dialect translation.

---

## 04. Mechanism 3: Native SQL Queries (`nativeQuery = true`)

While JPQL covers 90% of business operations, relational database engines have powerful, proprietary features that cannot be expressed in standard object-oriented JPQL.

For these cases, Spring Data provides **Native SQL queries** via `@Query(nativeQuery = true)`:

```java
public interface AccountRepository extends JpaRepository<Account, UUID> {

    @Query(value = """
        SELECT * FROM accounts 
        WHERE metadata ->> 'plan' = :planName 
          AND created_at >= NOW() - INTERVAL '30 days'
        """, nativeQuery = true)
    List<Account> findRecentAccountsByPlan(@Param("planName") String planName);
}
```

### When is Native SQL Justified?
- **JSON / JSONB Column Queries**: Using PostgreSQL operators (`->>`, `@>`, `jsonb_path_query`).
- **Common Table Expressions (CTEs)**: Recursive queries (`WITH RECURSIVE org_tree AS (...)`).
- **Window Functions**: Calculating rolling averages or ranks (`ROW_NUMBER() OVER (PARTITION BY ...)`).
- **Full-Text Search Engine Syntax**: PostgreSQL `to_tsvector` and `tsquery`.
- **Database-Specific Performance Hints**: Query planner index hints or lock timeouts.

### The Pitfalls of Native SQL
1. **Zero Startup Validation**: Hibernate does **not** validate native SQL strings at startup. A misspelled column name will only fail at runtime when a customer executes the endpoint.
2. **Vendor Lock-In**: A native query using PostgreSQL's `NOW() - INTERVAL '30 days'` will crash immediately if run on MySQL or Oracle.
3. **The Native Pagination Trap (Count Query Requirement)**:
   When paginating a JPQL query, Spring Data automatically generates the `count(*)` query. 
   With complex native queries, Spring Data's query parser cannot reliably guess how to count rows. You **must** provide an explicit `countQuery`:

```java
// MANDATORY: Explicit countQuery when paginating complex native SQL
@Query(
    value = """
        SELECT a.* FROM accounts a 
        INNER JOIN account_settings s ON a.id = s.account_id 
        WHERE s.notifications_enabled = true
        """,
    countQuery = """
        SELECT count(*) FROM accounts a 
        INNER JOIN account_settings s ON a.id = s.account_id 
        WHERE s.notifications_enabled = true
        """,
    nativeQuery = true
)
Page<Account> findAllWithNotificationsEnabled(Pageable pageable);
```

---

## 05. Mechanism 4: Bulk Updates & Deletes with `@Modifying`

### The Problem: Why Loop Updates Kill Production Databases
Suppose your platform needs to deactivate accounts that have been dormant for over a year.

A junior developer might write this:
```java
// DISASTROUS PRODUCTION CODE: The Loop Update Anti-Pattern
@Transactional
public void deactivateDormantAccounts(Instant cutoff) {
    List<Account> dormantAccounts = accountRepository.findAllByLastLoginBefore(cutoff);
    for (Account account : dormantAccounts) {
        account.setStatus(AccountStatus.SUSPENDED);
        accountRepository.save(account);
    }
}
```

If there are 50,000 dormant accounts:
- 50,000 entity instances are pulled across the network into the JVM heap.
- Hibernate executes **50,000 individual `UPDATE` statements** across the network!
- Database connections lock rows, transaction logs bloat, and the job takes minutes to complete.

### The Solution: Bulk JPQL Updates with `@Modifying`
Instead of loading entities into memory, we execute a single set-based `UPDATE` directly inside the database engine:

```java
public interface AccountRepository extends JpaRepository<Account, UUID> {

    @Modifying
    @Query("""
        UPDATE Account a 
        SET a.status = :newStatus 
        WHERE a.lastLoginAt < :cutoff AND a.status = :activeStatus
        """)
    int bulkUpdateStatus(
        @Param("newStatus") AccountStatus newStatus,
        @Param("activeStatus") AccountStatus activeStatus,
        @Param("cutoff") Instant cutoff
    );
}
```

This executes a single, atomic SQL statement:
```sql
UPDATE accounts 
SET status = 'SUSPENDED' 
WHERE last_login_at < '2025-11-19...' AND status = 'ACTIVE';
```
The operation completes in **4 milliseconds** instead of minutes.

---

## 06. The Critical Stale Cache Trap in `@Modifying` Queries

Bulk updates are fast, but they harbor one of the most insidious bugs in Hibernate: **the Persistence Context Desynchronization Trap**.

### How the Trap Occurs
To understand why, trace what happens inside the JVM memory during a single transaction:

```
+--------------------------------------------------------------------------------------------------+
|                          THE FIRST-LEVEL CACHE DESYNCHRONIZATION TRAP                            |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   STEP 1: Application loads Account #101 into memory:                                            |
|   Account account = accountRepository.findById(101).get();                                       |
|   • Account #101 is cached in Persistence Context with status = ACTIVE.                          |
|                                                                                                  |
|   STEP 2: Bulk update executes directly in the database:                                         |
|   accountRepository.bulkUpdateStatus(SUSPENDED, ACTIVE, cutoff);                                 |
|   • Database row is updated: accounts.status becomes 'SUSPENDED'.                                |
|   • DANGER: The First-Level Cache is completely bypassed!                                        |
|   • The in-memory Account #101 instance STILL HAS status = ACTIVE!                               |
|                                                                                                  |
|   STEP 3: Application reads Account #101 again in the same transaction:                          |
|   Account sameAccount = accountRepository.findById(101).get();                                   |
|   • Hibernate returns the CACHED instance (status = ACTIVE)!                                     |
|   • Application logic operates on FALSE, STALE data!                                             |
|                                                                                                  |
|   STEP 4: Transaction commits:                                                                   |
|   • Hibernate dirty checking compares cached Account #101 (ACTIVE) and flushes it back!          |
|   • OVERWRITES THE DATABASE ROW BACK TO 'ACTIVE'! The bulk update is silently undone!            |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

### The Fix: `clearAutomatically` and `flushAutomatically`
To prevent stale in-memory state and avoid overwriting bulk changes, `@Modifying` provides two essential configuration flags:

```java
@Modifying(flushAutomatically = true, clearAutomatically = true)
@Query("UPDATE Account a SET a.status = :status WHERE a.lastLoginAt < :cutoff")
int bulkDeactivate(@Param("status") AccountStatus status, @Param("cutoff") Instant cutoff);
```

Let's dissect what these two flags do:
1. **`flushAutomatically = true`**: Before executing the bulk query, Hibernate flushes any pending entity modifications currently buffered in memory to the database. This ensures your bulk query sees the latest changes.
2. **`clearAutomatically = true`**: Immediately after executing the bulk query, Hibernate completely clears the Persistence Context (`EntityManager.clear()`). Any subsequent `findById()` call within that transaction will be forced to re-read the fresh, updated rows directly from the database!

---

## 07. Production Case Study: The Silent Ghost Status Reversion

### The Incident
A fast-growing fintech platform offered automatic credit card locking for delinquent accounts. An automated billing cron job ran every morning:

```java
// BUGGY TRANSACTIONAL WORKFLOW
@Transactional
public void processDailyDelinquencies() {
    // 1. Fetch VIP user account to check priority flags:
    Account vipAccount = accountRepository.findById(vipAccountId).orElseThrow();
    
    // 2. Perform bulk suspension of all accounts past due:
    accountRepository.bulkSuspendPastDueAccounts(Instant.now().minus(30, ChronoUnit.DAYS));

    // 3. Log notification for the VIP account:
    if (vipAccount.getStatus() == AccountStatus.SUSPENDED) {
        notificationService.sendAccountLockedAlert(vipAccount);
    }
}
```

The database query logs confirmed that the bulk update executed successfully:
```sql
UPDATE accounts SET status = 'SUSPENDED' WHERE past_due_date < '2026-10-20';
```
Yet, hours later, customer support discovered that `vipAccount` was still active in the database and was able to execute debit transactions!

### The Root Cause Analysis (RCA)
1. In Step 1, `vipAccount` was loaded into the First-Level Cache with `status = ACTIVE`.
2. In Step 2, `bulkSuspendPastDueAccounts` was annotated with `@Modifying`, but without `clearAutomatically = true`. The database row for `vipAccount` was changed to `SUSPENDED`, but the cached entity remained `ACTIVE`.
3. In Step 3, the notification check read `vipAccount.getStatus()`, which returned `ACTIVE`. The notification was never sent.
4. At the end of `processDailyDelinquencies()`, the `@Transactional` method committed. 
5. During commit, Hibernate's dirty checking mechanism inspected all managed entities in the First-Level Cache. It saw that `vipAccount` in memory had `status = ACTIVE`, and issued:
   ```sql
   UPDATE accounts SET status = 'ACTIVE' WHERE id = '...';
   ```
   **Hibernate silently reverted the database row back to ACTIVE upon transaction commit!**

### The Remediation
The team updated the repository method to include `clearAutomatically = true` and `flushAutomatically = true`:

```java
@Modifying(flushAutomatically = true, clearAutomatically = true)
@Query("UPDATE Account a SET a.status = 'SUSPENDED' WHERE a.pastDueDate < :cutoff")
int bulkSuspendPastDueAccounts(@Param("cutoff") Instant cutoff);
```

With `clearAutomatically = true`, the stale `vipAccount` instance was evicted from the persistence context, forcing subsequent lookups to fetch the true, suspended database row and permanently resolving the reversion bug.

---

## 08. Complete Production Code Reference

Let's assemble all three query mechanisms and safe bulk updates into a clean, complete production repository:

### Step 1: The Domain Entity
```java
package com.example.domain.account;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String accountNumber;

    @Column(nullable = false)
    private String ownerEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountStatus status = AccountStatus.ACTIVE;

    @Column(nullable = false)
    private Instant lastLoginAt = Instant.now();

    protected Account() {}

    public Account(String accountNumber, String ownerEmail) {
        this.accountNumber = accountNumber;
        this.ownerEmail = ownerEmail;
    }

    public UUID getId() { return id; }
    public String getAccountNumber() { return accountNumber; }
    public String getOwnerEmail() { return ownerEmail; }
    public AccountStatus getStatus() { return status; }
    public Instant getLastLoginAt() { return lastLoginAt; }
}

public enum AccountStatus {
    ACTIVE, SUSPENDED, CLOSED
}
```

### Step 2: The Production Repository
```java
package com.example.domain.account;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    // 1. DERIVED QUERIES: Clean & concise for 1-2 parameter lookups
    Optional<Account> findByAccountNumber(String accountNumber);
    
    boolean existsByOwnerEmail(String ownerEmail);
    
    List<Account> findTop5ByStatusOrderByLastLoginAtDesc(AccountStatus status);

    // 2. CUSTOM JPQL: Type-safe, validated at startup, portable across databases
    @Query("""
        SELECT a FROM Account a
        WHERE a.status = :status 
          AND a.lastLoginAt >= :since
        ORDER BY a.lastLoginAt DESC
        """)
    List<Account> findActiveAccountsSince(
        @Param("status") AccountStatus status, 
        @Param("since") Instant since
    );

    // 3. NATIVE SQL: For database-specific syntax (PostgreSQL text search & intervals)
    @Query(
        value = """
            SELECT * FROM accounts 
            WHERE status = 'ACTIVE' 
              AND owner_email ILIKE CONCAT('%', :domain)
            """,
        countQuery = """
            SELECT count(*) FROM accounts 
            WHERE status = 'ACTIVE' 
              AND owner_email ILIKE CONCAT('%', :domain)
            """,
        nativeQuery = true
    )
    Page<Account> findAccountsByEmailDomainNative(
        @Param("domain") String domain, 
        Pageable pageable
    );

    // 4. BULK MODIFYING OPERATION: High-performance set-based updates
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
        UPDATE Account a 
        SET a.status = :newStatus 
        WHERE a.lastLoginAt < :cutoff AND a.status = :targetStatus
        """)
    int bulkTransitionDormantAccounts(
        @Param("newStatus") AccountStatus newStatus,
        @Param("targetStatus") AccountStatus targetStatus,
        @Param("cutoff") Instant cutoff
    );
}
```

---

## 09. Architectural Mental Map & Summary

To ensure you choose the correct query strategy for every access pattern, use this operational mental map:

```
+==================================================================================================+
|                        SPRING DATA QUERY STRATEGY ARCHITECTURAL MENTAL MAP                       |
+==================================================================================================+
|                                                                                                  |
|   1. QUERY STRATEGY DECISION TREE                                                                |
|      ──────────────────────────────────────────────────────────────────────────                  |
|      Can query be expressed with 1 or 2 simple parameters?                                       |
|        ├── YES ──► Use DERIVED QUERY (findByEmail, existsByCode)                                 |
|        └── NO  ──► Does it require database-specific SQL features (JSONB, CTE, window functions)?|
|                      ├── NO  ──► Use CUSTOM JPQL (@Query("SELECT a FROM Account a..."))          |
|                      └── YES ──► Use NATIVE SQL (@Query(value = "...", nativeQuery = true))      |
|                                  (Remember explicit countQuery for pagination!)                  |
|                                                                                                  |
|   2. BULK MODIFICATION SAFETY PROTOCOL                                                           |
|      ──────────────────────────────────────────────────────────────────────────                  |
|      Modifying hundreds or thousands of rows?                                                    |
|        ├── DO NOT: Load entities in a loop and call repository.save() (N+1 update storm)         |
|        └── DO    : Use @Modifying @Query("UPDATE ...") or @Query("DELETE ...")                   |
|                    ALWAYS CONFIGURE:                                                             |
|                    • flushAutomatically = true (writes pending memory dirty checks to DB)       |
|                    • clearAutomatically = true (evicts stale cached entities from L1 cache)      |
|                                                                                                  |
|   3. FEATURE COMPARISON MATRIX                                                                   |
|      ┌───────────────────────────┬───────────────┬─────────────────┬─────────────────────────┐   |
|      │ FEATURE                   │ DERIVED QUERY │ CUSTOM JPQL     │ NATIVE SQL              │   |
|      ├───────────────────────────┼───────────────┼─────────────────┼─────────────────────────┤   |
|      │ Startup Validation        │ YES           │ YES (Hibernate) │ NO (Runtime failure)    │   |
|      │ Database Portability      │ HIGH          │ HIGH            │ NONE (Engine Lock-in)   │   |
|      │ Expressiveness / Joins    │ LOW           │ HIGH            │ UNLIMITED               │   |
|      │ Pagination Support        │ Automatic     │ Automatic       │ Requires countQuery     │   |
|      │ Readability at Scale      │ Poor (>2 args)│ Excellent       │ Excellent               │   |
|      └───────────────────────────┴───────────────┴─────────────────┴─────────────────────────┘   |
|                                                                                                  |
+==================================================================================================+
```

In the next lesson, **[Lesson 15.3: Pagination, Sorting & Slice Query Execution](/learning-paths/spring-boot-production-mastery)**, we will examine high-volume database pagination: how `Pageable` and `Sort` work under the hood, why `Page<T>` triggers a hidden `count(*)` performance tax, and how switching to `Slice<T>` or Keyset Cursor Pagination enables infinite scrolling with zero database count overhead.

---

## 10. Authoritative References & Further Reading

For deeper study into Spring Data JPA query derivation, JPQL standards, and bulk modifying operations, consult these canonical resources:

* [Spring Data JPA Reference: Defining Query Methods](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html) - Official specification on method naming keywords, PartTree parser rules, and query creation.
* [Jakarta Persistence 3.1 Specification: Chapter 4 (Query Language)](https://jakarta.ee/specifications/persistence/3.1/) - The definitive standard on JPQL syntax, path expressions, and joins.
* [Vlad Mihalcea: The Best Way to Use the Spring Data JPA @Modifying Annotation](https://vladmihalcea.com/spring-data-jpa-modifying-annotation-flush-clear/) - Detailed analysis of First-Level Cache desynchronization and the necessity of clearAutomatically.
* [Thorben Janssen: Derived Queries with Spring Data JPA](https://thorben-janssen.com/spring-data-jpa-derived-queries/) - Architectural guidelines for method name keywords and complex query boundaries.
* [Baeldung: Spring Data JPA @Query Annotation](https://www.baeldung.com/spring-data-jpa-query) - Practical walkthrough of JPQL parameters, native queries, and sorting.
