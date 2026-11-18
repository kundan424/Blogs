---
title: "ACID Fundamentals & The Spring PlatformTransactionManager Abstraction"
slug: spring-boot-acid-fundamentals-platform-transaction-manager
subject: backend-distributed-systems
abstract: An architectural, mentor-led guide to transaction foundations in Spring Boot 3. Deconstruct the ACID guarantees from first principles, dissect the boilerplate and tight coupling failure points of raw JDBC transaction management, understand how Spring's PlatformTransactionManager SPI provides a uniform abstraction across JPA, JDBC, and JTA, and trace how TransactionSynchronizationManager uses ThreadLocal storage to bind database connections to the current thread.
tags:
  - transactions
  - acid
  - jdbc
  - platform-transaction-manager
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

# ACID Fundamentals & The Spring PlatformTransactionManager Abstraction

In [Module 15: Spring Data JPA Repositories](/learning-paths/spring-boot-production-mastery), we mastered repository abstractions, query derivation, and high-performance pagination.

However, in any real-world enterprise system, operations rarely occur in isolation.

Consider an everyday banking workflow: customer Alice transfers \$100 to customer Bob.
1. The system must deduct \$100 from Alice's balance.
2. The system must credit \$100 to Bob's balance.
3. The system must write a ledger audit record documenting the transfer.

Now, consider what happens if the server loses power, the database connection drops, or an unhandled exception is thrown *after* Step 1, but *before* Step 2. 

Without transactional guarantees, Alice's money disappears into a void, Bob never receives his funds, and the company's ledger is mathematically corrupted.

To build reliable distributed and enterprise systems, data modifications must be wrapped in **Transactions**.

Yet, many developers treat transactions as a magical black box, slapping `@Transactional` on methods without understanding the underlying mechanics:
- What are the true technical definitions of **ACID** (Atomicity, Consistency, Isolation, Durability) in modern relational engines like PostgreSQL?
- How did raw JDBC manage transactions, and why does manual connection handling completely break down in multi-layered enterprise architectures?
- How does Spring's **`PlatformTransactionManager`** abstraction decouple business logic from the underlying persistence technology (JDBC, JPA, JTA)?
- How does **`TransactionSynchronizationManager`** use `ThreadLocal` storage to transparently bind database connections to executing threads without passing connection handles down the call stack?

In this lesson, we will deconstruct transactions from first principles. We will contrast raw JDBC connection management with Spring's abstraction SPI, dissect the core transaction contracts, and understand the thread-binding architecture that powers Spring's persistence layer.

---

## 01. The First Principles of Transactions: Deconstructing ACID

### What is a Transaction?
A **Transaction** is a Logical Unit of Work (LUW) comprising one or more discrete database operations (reads, writes, updates, deletes) that must be executed as an indivisible whole.

To be considered a reliable transaction, the database engine must guarantee four foundational properties: **ACID**.

```
+--------------------------------------------------------------------------------------------------+
|                                    THE ACID GUARANTEES                                           |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   A - ATOMICITY ("All or Nothing")                                                               |
|   ────────────────────────────────────────────────────────────                                   |
|   Either all database operations in the unit of work execute successfully, or the entire         |
|   transaction is aborted and rolled back to its initial state. A partial execution is impossible.|
|                                                                                                  |
|   C - CONSISTENCY ("Invariant Preservation")                                                     |
|   ────────────────────────────────────────────────────────────                                   |
|   The database transitions strictly from one valid state to another. All schema rules,           |
|   foreign key constraints, unique indexes, and domain check constraints must be satisfied.       |
|                                                                                                  |
|   I - ISOLATION ("Concurrent Non-Interference")                                                  |
|   ────────────────────────────────────────────────────────────                                   |
|   Concurrently executing transactions cannot see or interfere with each other's intermediate,    |
|   uncommitted state. The result must appear as though transactions executed serially.            |
|                                                                                                  |
|   D - DURABILITY ("Crash Resilience")                                                            |
|   ────────────────────────────────────────────────────────────                                   |
|   Once a transaction commits, its modifications are permanently recorded in non-volatile         |
|   storage (via the database Write-Ahead Log). Changes survive system crashes, reboots, and power |
|   failures.                                                                                      |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

### How Modern Relational Databases Enforce ACID
In modern engines like PostgreSQL and MySQL InnoDB:
- **Atomicity and Durability** are enforced by the **Write-Ahead Log (WAL)** or Redo Log. Before any data page is modified in RAM or written to disk tables, the database appends the change to an append-only log file on disk (`fsync`). If the machine crashes mid-transaction, the engine replays or rolls back incomplete operations during recovery.
- **Isolation** is primarily enforced through **Multi-Version Concurrency Control (MVCC)** combined with row-level locks, ensuring that readers do not block writers and writers do not block readers.

---

## 02. The Problem: Raw JDBC Transaction Management

To appreciate why Spring's transaction architecture exists, we must first examine how developers handled transactions in Java before Spring: **Raw JDBC**.

### The Anatomy of a Raw JDBC Transaction
In standard JDBC, every database connection defaults to **Auto-Commit Mode** (`connection.getAutoCommit() == true`). 

In auto-commit mode, every single SQL statement is treated as an individual, self-contained transaction that commits immediately upon execution.

To execute multiple operations within a single atomic boundary, you had to manually disable auto-commit, manage the connection, handle exceptions, call commit or rollback, and clean up resources:

```java
// RAW JDBC TRANSACTION MANAGEMENT (PRE-SPRING ERA)
public class LegacyAccountService {

    private final DataSource dataSource;

    public LegacyAccountService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void transferFunds(long fromAccountId, long toAccountId, BigDecimal amount) throws SQLException {
        Connection conn = null;
        try {
            // 1. Acquire connection from the connection pool
            conn = dataSource.getConnection();

            // 2. Disable auto-commit to begin an atomic transaction
            conn.setAutoCommit(false);

            // 3. Execute Step 1: Debit sender
            try (PreparedStatement debitStmt = conn.prepareStatement(
                    "UPDATE accounts SET balance = balance - ? WHERE id = ?")) {
                debitStmt.setBigDecimal(1, amount);
                debitStmt.setLong(2, fromAccountId);
                debitStmt.executeUpdate();
            }

            // 4. Execute Step 2: Credit receiver
            try (PreparedStatement creditStmt = conn.prepareStatement(
                    "UPDATE accounts SET balance = balance + ? WHERE id = ?")) {
                creditStmt.setBigDecimal(1, amount);
                creditStmt.setLong(2, toAccountId);
                creditStmt.executeUpdate();
            }

            // 5. Commit all operations permanently to disk
            conn.commit();

        } catch (SQLException ex) {
            // 6. Rollback if any error occurs
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException rollbackEx) {
                    rollbackEx.printStackTrace();
                }
            }
            throw ex;
        } finally {
            // 7. Reset connection state and return to pool
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException closeEx) {
                    closeEx.printStackTrace();
                }
            }
        }
    }
}
```

### Why Raw JDBC Collapses in Enterprise Architectures
Look closely at the code above. Out of 50 lines of code, only **6 lines** represent actual business logic. The remaining 44 lines are error-prone plumbing.

Beyond the boilerplate, this approach creates three fatal architectural defects:

```
+--------------------------------------------------------------------------------------------------+
|                            THE THREE FLAWS OF RAW JDBC TRANSACTIONS                              |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   1. TIGHT COUPLING & PARAMETER POLLUTION                                                        |
|   ───────────────────────────────────────                                                        |
|   To share a transaction across multiple DAO methods (e.g., accountDao.debit(),                  |
|   auditDao.logTransfer()), you are forced to pass the `java.sql.Connection` object down through  |
|   every method signature! This pollutes clean domain interfaces with database driver classes.    |
|                                                                                                  |
|   2. PERSISTENCE TECHNOLOGY LOCK-IN                                                              |
|   ─────────────────────────────────                                                              |
|   If you migrate a module from JDBC to Hibernate/JPA, your transaction code must be completely   |
|   rewritten from `conn.commit()` to `session.getTransaction().commit()`.                         |
|                                                                                                  |
|   3. CHECKED EXCEPTION PROPAGATION                                                               |
|   ────────────────────────────────                                                               |
|   `SQLException` is a checked exception. It leaks low-level SQL concerns into your service and   |
|   controller layers, forcing repetitive and brittle try-catch blocks everywhere.                 |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

---

## 03. Spring's Solution: The `PlatformTransactionManager` SPI

To solve these problems permanently, Spring introduced a core architectural principle: **The Separation of Transaction Boundaries from Transaction Execution**.

Your business service layer should define *where* a transaction begins and ends, but it should not know *how* the underlying persistence provider (JDBC, JPA, JTA) actually implements that commit or rollback.

Spring achieves this using the **Strategy Pattern** via the **`PlatformTransactionManager`** Service Provider Interface (SPI).

```
+--------------------------------------------------------------------------------------------------+
|                           THE SPRING TRANSACTION ABSTRACTION SPI                                 |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|                                 ┌───────────────────────────────┐                                |
|                                 │   PlatformTransactionManager  │                                |
|                                 │           (Interface)         │                                |
|                                 └───────────────┬───────────────┘                                |
|                                                 │                                                |
|                  ┌──────────────────────────────┼──────────────────────────────┐                 |
|                  ▼                              ▼                              ▼                 |
|   ┌─────────────────────────────┐┌─────────────────────────────┐┌─────────────────────────────┐  |
|   │ DataSourceTransactionManager││    JpaTransactionManager    ││     JtaTransactionManager   │  |
|   ├─────────────────────────────┤├─────────────────────────────┤├─────────────────────────────┤  |
|   │ Used for: Raw JDBC,         ││ Used for: Hibernate,        ││ Used for: Distributed XA    │  |
|   │ JdbcTemplate, MyBatis       ││ Jakarta Persistence, JPA    ││ transactions across multiple│  |
|   │ Operates on:                ││ Operates on:                ││ databases or message brokers│  |
|   │ java.sql.Connection         ││ jakarta.persistence.EM      ││ Operates on:                │  |
|   │                             ││ (and underlying Connection) ││ javax.transaction.UserTx    │  |
|   └─────────────────────────────┘└─────────────────────────────┘└─────────────────────────────┘  |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

### The Three Core Contracts of Spring Transactions
Spring's transaction architecture revolves around three fundamental interfaces in the `org.springframework.transaction` package:

#### 1. `PlatformTransactionManager` (The Engine)
```java
package org.springframework.transaction;

public interface PlatformTransactionManager extends TransactionManager {

    // Begins or joins a transaction based on the provided definition
    TransactionStatus getTransaction(TransactionDefinition definition) throws TransactionException;

    // Commits the transaction associated with the given status
    void commit(TransactionStatus status) throws TransactionException;

    // Rolls back the transaction associated with the given status
    void rollback(TransactionStatus status) throws TransactionException;
}
```

#### 2. `TransactionDefinition` (The Configuration Blueprint)
Specifies the attributes and boundaries of a transaction:
- **Propagation**: How transactions behave when calling other transactional methods (`REQUIRED`, `REQUIRES_NEW`, etc.).
- **Isolation Level**: The degree of concurrent isolation (`READ_COMMITTED`, `REPEATABLE_READ`, etc.).
- **Timeout**: Maximum execution time before automatic rollback.
- **Read-Only**: Whether Hibernate should bypass dirty checking and route to read replicas.

#### 3. `TransactionStatus` (The Execution State)
Represents the current state of an active transaction:
- Is this a newly created physical transaction or an existing joined transaction?
- Does this transaction have a savepoint?
- Has this transaction been marked as **Rollback-Only**?
- Has the transaction completed?

---

## 04. Under the Hood: ThreadLocal & `TransactionSynchronizationManager`

Now consider the core problem:
If your service method does **not** pass a `Connection` down to your repositories, how does `JpaRepository` or `JdbcTemplate` know which database connection belongs to the current transaction?

Spring solves this using **Thread-Bound Resource Management** via **`TransactionSynchronizationManager`**.

```
+--------------------------------------------------------------------------------------------------+
|                        TRANSACTION SYNCHRONIZATION & THREADLOCAL BINDING                         |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   HTTP Worker Thread (e.g., "http-nio-8080-exec-1")                                              |
|   ────────────────────────────────────────────────                                               |
|   1. Enters @Transactional Service Method                                                        |
|                                                                                                  |
|   2. PlatformTransactionManager executes:                                                        |
|      Connection conn = dataSource.getConnection();                                               |
|      conn.setAutoCommit(false);                                                                  |
|                                                                                                  |
|   3. Binds Connection to the Current Thread:                                                     |
|      TransactionSynchronizationManager.bindResource(dataSource, new ConnectionHolder(conn));     |
|                                                                                                  |
|                                      ThreadLocal Map                                             |
|                     ┌───────────────────────────────────────────────┐                            |
|                     │ KEY: DataSource instance                      │                            |
|                     │ VALUE: ConnectionHolder (holds `conn` handle) │                            |
|                     └───────────────────────┬───────────────────────┘                            |
|                                             │                                                    |
|   4. Service calls Repository A:            │                                                    |
|      accountRepository.save(account);       │                                                    |
|      └── Repository retrieves connection ───┘ (Zero parameters passed!)                          |
|                                             │                                                    |
|   5. Service calls Repository B:            │                                                    |
|      auditRepository.save(auditLog);        │                                                    |
|      └── Repository retrieves SAME conn ────┘ (Operates in the same atomic transaction!)         |
|                                                                                                  |
|   6. Transaction commits:                                                                        |
|      conn.commit();                                                                              |
|      TransactionSynchronizationManager.unbindResource(dataSource);                               |
|      conn.close(); // Returns to HikariCP pool                                                   |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

### The Mechanism Step-by-Step
1. When a transaction starts, `PlatformTransactionManager` obtains a database connection from HikariCP.
2. It wraps the connection in a `ConnectionHolder` (or `EntityManagerHolder` for JPA) and registers it inside a `ThreadLocal` map managed by **`TransactionSynchronizationManager`**.
3. Any downstream repository, component, or `EntityManager` executed by that same thread calls:
   ```java
   ConnectionHolder holder = (ConnectionHolder) 
       TransactionSynchronizationManager.getResource(dataSource);
   Connection conn = holder.getConnection();
   ```
4. All components access the exact same underlying database connection without needing connection parameters passed through method signatures.
5. Upon method completion, Spring commits or rolls back, unbinds the resource from the thread's `ThreadLocal` map, and returns the connection safely to HikariCP.

> [!IMPORTANT]
> Because Spring's transaction synchronization relies on `ThreadLocal`, **transactions are bound to the executing thread**. 
> If your transactional service method spawns an asynchronous background thread (`CompletableFuture.runAsync()`, `@Async`, or a custom thread pool), the new thread will **NOT** inherit the parent's transaction! It will operate without a transaction or start a completely separate connection.

---

## 05. The Hierarchy of Transaction Managers in Spring Boot

When you use Spring Boot with `spring-boot-starter-data-jpa`:
- Spring Boot's auto-configuration detects Hibernate and Jakarta Persistence on your classpath.
- It automatically configures an instance of **`JpaTransactionManager`** as the primary `PlatformTransactionManager` bean.

Let's examine how `JpaTransactionManager` coordinates both JPA and raw JDBC operations:

```
+--------------------------------------------------------------------------------------------------+
|                              JpaTransactionManager UNIFIED CONTROL                               |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   JpaTransactionManager                                                                          |
|   ├── Manages: Jakarta EntityManager (Hibernate Session)                                         |
|   ├── Exposes: Underlying raw JDBC java.sql.Connection                                           |
|   └── Advantage: Allows Spring Data JPA and raw JdbcTemplate queries to participate in the       |
|                  EXACT SAME physical database transaction seamlessly!                            |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

If you execute a `JpaRepository.save()` followed by a raw `JdbcTemplate.update()` within the same `@Transactional` method, `JpaTransactionManager` ensures that both access the same physical database connection and commit or rollback together atomically.

---

## 06. Complete Code Reference: Programmatic & Declarative Foundations

Let's explore a concrete implementation demonstrating how Spring's transaction abstraction works in practice.

### Step 1: The Domain Entity
```java
package com.example.domain.account;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String accountNumber;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal balance;

    protected Account() {}

    public Account(String accountNumber, BigDecimal initialBalance) {
        this.accountNumber = accountNumber;
        this.balance = initialBalance;
    }

    public void debit(BigDecimal amount) {
        if (this.balance.compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient funds in account: " + accountNumber);
        }
        this.balance = this.balance.subtract(amount);
    }

    public void credit(BigDecimal amount) {
        this.balance = this.balance.add(amount);
    }

    public UUID getId() { return id; }
    public String getAccountNumber() { return accountNumber; }
    public BigDecimal getBalance() { return balance; }
}
```

### Step 2: The Repository
```java
package com.example.domain.account;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {
    Optional<Account> findByAccountNumber(String accountNumber);
}
```

### Step 3: Demonstrating `PlatformTransactionManager` Programmatically
While 95% of production code uses the declarative `@Transactional` annotation (which we will deep-dive into in Lesson 16.2), understanding how to use `PlatformTransactionManager` directly reveals the core abstraction without any magic:

```java
package com.example.service;

import com.example.domain.account.Account;
import com.example.domain.account.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import java.math.BigDecimal;

@Service
public class DirectTransactionManagerDemo {

    private final PlatformTransactionManager transactionManager;
    private final AccountRepository accountRepository;

    public DirectTransactionManagerDemo(
            PlatformTransactionManager transactionManager,
            AccountRepository accountRepository) {
        this.transactionManager = transactionManager;
        this.accountRepository = accountRepository;
    }

    /**
     * Demonstrating how Spring manages transactions under the hood
     * using the PlatformTransactionManager SPI.
     */
    public void executeFundTransfer(String fromAccNumber, String toAccNumber, BigDecimal amount) {
        // 1. Define the transaction attributes
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setName("FundTransferTransaction");
        def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);
        def.setIsolationLevel(TransactionDefinition.ISOLATION_READ_COMMITTED);

        // 2. Begin transaction: PlatformTransactionManager binds connection to current thread
        TransactionStatus status = transactionManager.getTransaction(def);

        try {
            // 3. Execute business logic within the atomic boundary
            Account from = accountRepository.findByAccountNumber(fromAccNumber)
                    .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
            Account to = accountRepository.findByAccountNumber(toAccNumber)
                    .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

            from.debit(amount);
            to.credit(amount);

            // 4. Commit transaction: Flushes changes and releases connection back to HikariCP
            transactionManager.commit(status);

        } catch (Exception ex) {
            // 5. Rollback on failure: Discards all changes and releases connection
            transactionManager.rollback(status);
            throw ex;
        }
    }
}
```

---

## 07. Production Anti-Pattern Case Study: The Mixed Connection Split-Brain

### The Incident
A fast-growing fintech platform processed instant loan disbursements. 

A developer wrote a service to record loan disbursements:
- The borrower's ledger was updated using Spring Data JPA (`loanRepository.save(loan)`).
- An audit record was written to an external reporting schema using raw JDBC (`dataSource.getConnection()`) inside the same method.

```java
// BUGGY PRODUCTION SERVICE
@Service
public class LoanDisbursementService {

    private final LoanRepository loanRepository;
    private final DataSource dataSource;

    public LoanDisbursementService(LoanRepository loanRepository, DataSource dataSource) {
        this.loanRepository = loanRepository;
        this.dataSource = dataSource;
    }

    @Transactional
    public void disburseLoan(UUID loanId, BigDecimal amount) throws SQLException {
        // Step 1: JPA entity update (participates in Spring transaction)
        Loan loan = loanRepository.findById(loanId).orElseThrow();
        loan.markDisbursed(amount);

        // Step 2: FATAL MISTAKE: Manual raw connection bypass
        try (Connection conn = dataSource.getConnection()) {
            // Because auto-commit is TRUE by default on pool connections,
            // this statement commits IMMEDIATELY on its own separate connection!
            try (PreparedStatement stmt = conn.prepareStatement(
                    "INSERT INTO audit_logs (loan_id, action) VALUES (?, 'DISBURSED')")) {
                stmt.setObject(1, loanId);
                stmt.executeUpdate();
            }
        }

        // Step 3: Simulating downstream network failure
        throw new RuntimeException("Payment Gateway Timeout!");
    }
}
```

### The Disaster
During a peak load event, the payment gateway timed out in Step 3, triggering a runtime exception.
- Spring's `JpaTransactionManager` caught the exception and correctly rolled back Step 1 (the `Loan` status remained `PENDING`).
- However, Step 2 had acquired a separate raw connection from the pool where **`autoCommit = true`**. The audit row had committed **instantly** to the database!
- The system was left in a split-brain state: the audit log stated the loan was disbursed, but the borrower's loan record was rolled back to pending!

### The Root Cause Analysis (RCA)
Calling `dataSource.getConnection()` directly asks HikariCP for a **new, unmanaged connection**, completely bypassing Spring's `TransactionSynchronizationManager`! 

The manual connection had its own separate transactional lifecycle and auto-committed independently.

### The Remediation
1. Never call `dataSource.getConnection()` directly inside a Spring-managed application.
2. If raw SQL or JDBC is needed alongside JPA, use **`JdbcTemplate`** or **`DataSourceUtils.getConnection(dataSource)`**, which properly retrieve the connection bound to the current thread by `TransactionSynchronizationManager`:

```java
// SAFE PRODUCTION CODE: Using JdbcTemplate participates in Spring's transaction
@Autowired
private JdbcTemplate jdbcTemplate;

@Transactional
public void disburseLoan(UUID loanId, BigDecimal amount) {
    Loan loan = loanRepository.findById(loanId).orElseThrow();
    loan.markDisbursed(amount);

    // JdbcTemplate automatically looks up the thread-bound connection!
    jdbcTemplate.update("INSERT INTO audit_logs (loan_id, action) VALUES (?, 'DISBURSED')", loanId);
}
```

---

## 08. Architectural Mental Map & Summary

To retain how Spring's transaction architecture operates from first principles, commit this mental model to memory:

```
+==================================================================================================+
|                        SPRING TRANSACTION ARCHITECTURAL MENTAL MAP                               |
+==================================================================================================+
|                                                                                                  |
|   1. THE FOUNDATIONAL SPI CONTRACTS                                                              |
|      ──────────────────────────────────────────────────────────────────────────                  |
|      PlatformTransactionManager          ──► The Strategy SPI (commit, rollback, getTransaction)  |
|        ├── JpaTransactionManager         ──► For JPA / Hibernate (Default in Spring Boot Data JPA)|
|        ├── DataSourceTransactionManager  ──► For raw JDBC / JdbcTemplate / MyBatis              |
|        └── JtaTransactionManager         ──► For distributed XA multi-database transactions      |
|                                                                                                  |
|   2. THE EXECUTION MECHANICS (UNDER THE HOOD)                                                    |
|      ──────────────────────────────────────────────────────────────────────────                  |
|      TransactionDefinition               ──► Blueprint: Propagation, Isolation, Timeout, ReadOnly|
|      TransactionStatus                   ──► State: isNew?, hasSavepoint?, isRollbackOnly?       |
|      TransactionSynchronizationManager   ──► ThreadLocal Map binding Connection to Worker Thread |
|                                                                                                  |
|   3. THE GOLDEN RULES OF TRANSACTION MANAGEMENT                                                 |
|      ┌─────────────────────────────┬─────────────────────────────────────────────────────────┐   |
|      │ RULE                        │ ARCHITECTURAL REASON                                    │   |
|      ├─────────────────────────────┼─────────────────────────────────────────────────────────┤   |
|      │ Never call getConnection()  │ Bypasses ThreadLocal synchronization; causes split-brain│   |
|      │ directly on DataSource      │ commits. Always use JdbcTemplate or DataSourceUtils.    │   |
|      ├─────────────────────────────┼─────────────────────────────────────────────────────────┤   |
|      │ Never spawn async threads   │ ThreadLocal does NOT cross thread boundaries. Child     │   |
|      │ inside @Transactional       │ threads run outside the parent transaction!             │   |
|      ├─────────────────────────────┼─────────────────────────────────────────────────────────┤   |
|      │ Let Spring manage commits   │ Eliminates 90% boilerplate; translates checked          │   |
|      │ and rollbacks               │ SQLExceptions into unchecked DataAccessExceptions.      │   |
|      └─────────────────────────────┴─────────────────────────────────────────────────────────┘   |
|                                                                                                  |
+==================================================================================================+
```

In the next lesson, **[Lesson 16.2: How @Transactional Works: AOP Proxies, ThreadLocal & The Self-Invocation Trap](/learning-paths/spring-boot-production-mastery)**, we will look deep inside Spring AOP: deconstructing how dynamic proxies intercept method execution, why `@Transactional` on `private` methods fails silently, and how to fix the notorious self-invocation proxy bypass bug.

---

## 09. Authoritative References & Further Reading

For deeper study into transaction internals, ACID mechanics, and the Spring transaction abstraction, consult these canonical resources:

* [Spring Framework Documentation: Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction.html) - The definitive guide to Spring's transaction abstraction, SPI interfaces, and synchronization.
* [Martin Fowler: Patterns of Enterprise Application Architecture (Unit of Work)](https://martinfowler.com/eaaCatalog/unitOfWork.html) - Architectural foundations of transactional units of work and persistence contexts.
* [Vlad Mihalcea: How Does Spring Transaction Management Work?](https://vladmihalcea.com/how-does-spring-transactional-work/) - Deep dive into TransactionInterceptor, connection acquisition, and ThreadLocal binding.
* [PostgreSQL Documentation: Chapter 13. Concurrency Control & WAL](https://www.postgresql.org/docs/current/mvcc.html) - Official explanation of how modern relational engines enforce ACID via MVCC and WAL logs.
* [Baeldung: Spring PlatformTransactionManager](https://www.baeldung.com/spring-platformtransactionmanager) - Practical walkthrough of programmatic transactions using PlatformTransactionManager and TransactionDefinition.
