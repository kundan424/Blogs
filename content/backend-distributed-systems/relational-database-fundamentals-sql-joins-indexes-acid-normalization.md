---
title: "Relational Database Fundamentals: SQL Joins, Indexes, ACID & Normalization"
slug: relational-database-fundamentals-sql-joins-indexes-acid-normalization
subject: backend-distributed-systems
abstract: An exhaustive, cookbook-style reference guide to relational database engineering for backend developers. Master the relational model, INNER/LEFT/RIGHT/FULL/CROSS joins, B-Tree index internals, O(N) vs O(log N) query access paths, the ACID transactional guarantee framework, MVCC isolation levels, and step-by-step database normalization from 1NF to 3NF with production SQL and Spring Boot 3 implementations.
tags:
  - sql
  - database
  - rdbms
  - acid
  - postgresql
  - spring-boot
  - backend
published: true
publishDate: Nov 11, 2026
updatedDate: Nov 11, 2026
readTime: 24m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
---

# Relational Database Fundamentals: SQL Joins, Indexes, ACID & Normalization

This guide is intended as a reference for those working with relational databases and SQL in backend applications for the first time, but is also intended to serve as a cookbook with self-contained references and solutions for common real-world use cases. For first-time engineers, it is recommended that you step through the material in a sequential fashion. For engineers already familiar with SQL, this guide endeavours to provide a quick, dependable solution for the need at hand.

It is assumed at this point that you have a local relational database running (such as PostgreSQL 16 or MySQL 8) or have access to a SQL playground. If you are building microservices on top of Spring Boot 3, this guide directly bridges raw SQL concepts to Spring Data JPA and Hibernate mechanics.

Ok, so you have your database connected and we are ready to go. Before we dive into query execution and join algorithms, we will very briefly go over what a relational database actually is and how understanding its low-level storage and indexing mechanics will dramatically improve the performance and reliability of your backend microservices.

---

### Sections

- [01. What is a Relational Database and Why Does It Matter for Backend Services?](#01-what-is-a-relational-database-and-why-does-it-matter-for-backend-services)
- [02. The Relational Model: Tables, Primary Keys & Foreign Key Constraints](#02-the-relational-model-tables-primary-keys--foreign-key-constraints)
- [03. Mastering SQL Joins: Visual Mechanics & Real Query Examples](#03-mastering-sql-joins-visual-mechanics--real-query-examples)
- [04. Query Performance & Database Indexes: B-Tree Internals & Scan Types](#04-query-performance--database-indexes-b-tree-internals--scan-types)
- [05. The ACID Properties: Deep Technical Deconstruction](#05-the-acid-properties-deep-technical-deconstruction)
- [06. Transaction Isolation Levels & Concurrency Anomalies](#06-transaction-isolation-levels--concurrency-anomalies)
- [07. Database Normalization: 1NF to BCNF Step-by-Step](#07-database-normalization-1nf-to-bcnf-step-by-step)
- [08. When to Denormalize: Pragmatic Production Trade-offs](#08-when-to-denormalize-pragmatic-production-trade-offs)
- [09. Bridging SQL to Spring Boot 3 & Spring Data JPA](#09-bridging-sql-to-spring-boot-3--spring-data-jpa)
- [10. Summary & Mental Model Review](#10-summary--mental-model-review)

---

## 01. What is a Relational Database and Why Does It Matter for Backend Services?

In 1970, Edgar F. Codd published a landmark paper titled *"A Relational Model of Data for Large Shared Data Banks"*. Prior to Codd's model, software applications stored data in hierarchical or network databases (such as IBM's IMS), where accessing a record required hardcoding physical pointer navigation paths directly into application code. If the database administrator restructured a storage record on disk, every application program that traversed those pointers broke immediately.

Codd proposed a radical separation: **separate the logical representation of data from its physical on-disk storage**. 

In the relational model:
1. **Data is organized into Relations (Tables):** Mathematically, a relation is an unordered set of tuples (rows).
2. **Tuples consist of Attributes (Columns):** Each attribute belongs to a defined domain (data type).
3. **Data access is Declarative (SQL):** You state **what** data you want, rather than **how** the computer should traverse disk tracks to fetch it.

```text
Imperative Code (Legacy / Application) : "Open file 'orders.dat', loop record-by-record, if customer_id == 8842, collect."
Declarative SQL (Relational Model)    : "SELECT * FROM orders WHERE customer_id = 8842;"
```

The component responsible for bridging your declarative SQL to physical disk blocks is the **RDBMS Query Engine**.

![RDBMS Internal Execution Architecture](/images/content/backend-distributed-systems/sql/backend-distributed-systems_sql_mod-02_lesson-2.2_relational-database-engine-architecture.svg "RDBMS Internal Execution Architecture: Parsing, Optimization, Execution, and Storage")

When you issue a SQL statement over a TCP connection (e.g., via JDBC to PostgreSQL port 5432):
1. **Parser & Lexer:** Validates syntax against the SQL grammar and checks the database catalog to ensure tables and columns exist, building an **Abstract Syntax Tree (AST)**.
2. **Cost-Based Optimizer (CBO):** Evaluates dozens of mathematically equivalent execution strategies. It calculates an estimated I/O cost using table statistics (row counts, null fractions, page estimates) to decide whether to use a B-Tree Index Scan, a Sequential Scan, a Hash Join, or a Nested Loop.
3. **Execution Engine:** Executes the chosen physical plan using the Volcano iterator model (`open()`, `next()`, `close()`), streaming matching tuples.
4. **Buffer Pool (Shared Buffers):** Checks memory RAM cache before issuing expensive disk read I/O operations.
5. **Storage Engine & WAL:** Manages persistent disk page blocks (typically 8KB in PostgreSQL, 16KB in MySQL InnoDB) and appends changes to the **Write-Ahead Log (WAL)** to guarantee durability.

---

## 02. The Relational Model: Tables, Primary Keys & Foreign Key Constraints

To explore real queries throughout this cookbook, let's establish a clean, production-grade e-commerce schema consisting of customers, products, orders, and order items.

Here is the exact DDL (Data Definition Language) script:

```sql
-- 1. Customers Table
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    tier VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0.00),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0)
);

-- 3. Orders Table
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Order Items Junction Table (Composite Key Modeling)
CREATE TABLE order_items (
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0.00),
    PRIMARY KEY (order_id, product_id)
);
```

### Key Relational Constraints Explained

- **`PRIMARY KEY`**: Enforces entity uniqueness and prevents duplicate records. In modern databases, declaring a primary key automatically creates an underlying unique B-Tree index.
- **`FOREIGN KEY ... REFERENCES ...`**: Enforces **Referential Integrity**. It guarantees that an `order` cannot reference a non-existent `customer_id`.
- **`ON DELETE CASCADE`**: When an `order` is deleted, the database engine automatically deletes all child rows in `order_items`.
- **`ON DELETE RESTRICT`**: Prevents a customer from being deleted if they have existing records in `orders`.
- **`CHECK` Constraints**: Enforces domain-level business invariants directly at the database engine layer (e.g., preventing negative order quantities or invalid prices).

### Seed Data Walkthrough

Let's populate our tables with test fixtures to use in our join examples:

```sql
-- Insert Customers
INSERT INTO customers (id, name, email, tier) VALUES
(1, 'Alice Smith', 'alice@company.com', 'PLATINUM'),
(2, 'Bob Jones',   'bob@company.com',   'GOLD'),
(3, 'Charlie Day', 'charlie@paddys.com', 'STANDARD');

-- Insert Products
INSERT INTO products (id, sku, title, price, stock_quantity) VALUES
(10, 'TECH-001', 'Ergonomic Mechanical Keyboard', 149.99, 50),
(20, 'TECH-002', 'Ultra-Wide 34-inch Monitor',    499.99, 15),
(30, 'TECH-003', 'Wireless Vertical Mouse',        79.99, 80);

-- Insert Orders
INSERT INTO orders (id, customer_id, status, total_amount) VALUES
(101, 1, 'DELIVERED', 229.98),
(102, 1, 'CONFIRMED', 499.99),
(103, 2, 'SHIPPED',   149.99);
-- Note: Customer 3 (Charlie Day) has 0 orders.
-- Note: Order #104 has no customer (simulated legacy orphan order in outer join scenarios).

-- Insert Order Items
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(101, 10, 1, 149.99),
(101, 30, 1, 79.99),
(102, 20, 1, 499.99),
(103, 10, 1, 149.99);
```

---

## 03. Mastering SQL Joins: Visual Mechanics & Real Query Examples

A **Join** combines columns from one or more tables based on a related column between them. Conceptually, a join evaluates the **Cartesian Product** ($N \times M$) of both relations and filters the paired tuples according to the **Join Predicate** specified in the `ON` clause.

![SQL Relational Joins Taxonomy](/images/content/backend-distributed-systems/sql/backend-distributed-systems_sql_mod-02_lesson-2.2_sql-joins-visual-mental-model.svg "SQL Relational Joins Taxonomy: INNER, LEFT, RIGHT, and FULL Joins")

![SQL Relational Joins Venn Suite](/images/content/backend-distributed-systems/sql/backend-distributed-systems_sql_mod-02_lesson-2.2_sql-joins-venn-diagram-suite.svg "SQL Relational Joins Venn Diagram Suite: Inner, Left, Right, and Full Joins")

### 1. The `INNER JOIN` (Intersection Only)

An `INNER JOIN` returns only the rows where there is a match in **both** the left and right tables. If a row in the left table does not match any row in the right table (or vice versa), it is dropped from the result set.

```sql
SELECT 
    c.id AS customer_id,
    c.name,
    o.id AS order_id,
    o.status,
    o.total_amount
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id;
```

#### Result Set:
| customer_id | name | order_id | status | total_amount |
| :--- | :--- | :--- | :--- | :--- |
| `1` | Alice Smith | `101` | DELIVERED | 229.98 |
| `1` | Alice Smith | `102` | CONFIRMED | 499.99 |
| `2` | Bob Jones | `103` | SHIPPED | 149.99 |

> [!NOTE]
> Notice that **Charlie Day (id=3)** does not appear in this result set at all, because Charlie has placed zero orders. If you need a report of *all* registered customers regardless of order activity, an `INNER JOIN` is the wrong tool.

---

### 2. The `LEFT (OUTER) JOIN` (Preserve Left Table)

![Left Join Venn Diagram](/images/content/backend-distributed-systems/sql/backend-distributed-systems_sql_mod-02_lesson-2.2_venn-left-join.svg "Left Join Venn Diagram: Preserves all rows from table 1")

A `LEFT JOIN` returns **all rows from the left table**, along with the matched rows from the right table. When no match exists in the right table for a given left row, the engine outputs `NULL` for all columns coming from the right table.

```sql
SELECT 
    c.id AS customer_id,
    c.name,
    o.id AS order_id,
    COALESCE(o.status, 'NO_ORDERS') AS order_status,
    COALESCE(o.total_amount, 0.00) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id;
```

#### Result Set:
| customer_id | name | order_id | order_status | total_spent |
| :--- | :--- | :--- | :--- | :--- |
| `1` | Alice Smith | `101` | DELIVERED | 229.98 |
| `1` | Alice Smith | `102` | CONFIRMED | 499.99 |
| `2` | Bob Jones | `103` | SHIPPED | 149.99 |
| `3` | Charlie Day | `NULL` | NO_ORDERS | 0.00 |

#### The "Anti-Join" Pattern (Find Missing Relations)

![Left Anti-Join Venn Diagram](/images/content/backend-distributed-systems/sql/backend-distributed-systems_sql_mod-02_lesson-2.2_venn-left-anti-join.svg "Left Anti-Join Venn Diagram: table 1 rows with no matching table 2 records")

A common interview and production problem is finding records that **lack** a relationship (e.g., "Find all users who have never placed an order"). You achieve this by combining a `LEFT JOIN` with a `WHERE ... IS NULL` check:

```sql
SELECT 
    c.id, 
    c.name, 
    c.email
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL;
```

#### Result:
| id | name | email |
| :--- | :--- | :--- |
| `3` | Charlie Day | charlie@paddys.com |

---

### 3. The `RIGHT (OUTER) JOIN`

A `RIGHT JOIN` returns all rows from the right table, along with matching rows from the left table. If no match exists, the left columns contain `NULL`.

```sql
SELECT 
    c.name,
    o.id AS order_id,
    o.total_amount
FROM customers c
RIGHT JOIN orders o ON c.id = o.customer_id;
```

> [!TIP]
> In production engineering teams, `RIGHT JOIN` is almost universally avoided by convention. Any `RIGHT JOIN` can be rewritten as a `LEFT JOIN` simply by swapping table positions. Keeping the primary entity on the left makes complex multi-table joins significantly easier for teammates to read sequentially from top to bottom.

---

### 4. The `FULL (OUTER) JOIN` (Set Union)

A `FULL JOIN` combines the results of both `LEFT JOIN` and `RIGHT JOIN`. It returns all rows from both tables, filling in `NULL` on whichever side lacks a corresponding predicate match.

```sql
SELECT 
    c.name AS customer_name,
    o.id AS order_id,
    o.total_amount
FROM customers c
FULL OUTER JOIN orders o ON c.id = o.customer_id;
```

---

### 5. Multi-Table Joins in Production

Real microservice reporting queries frequently join across 3 or 4 tables in a single transactional query:

```sql
SELECT 
    c.name AS customer_name,
    o.id AS order_id,
    p.title AS product_name,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS line_item_subtotal
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id
ORDER BY o.id, p.title;
```

---

## 04. Query Performance & Database Indexes: B-Tree Internals & Scan Types

Imagine an unindexed table containing 10,000,000 order records stored in 150,000 physical 8KB disk pages. When you execute:

```sql
SELECT * FROM orders WHERE customer_id = 8842;
```

Without an index, the database engine has no choice but to perform a **Sequential Scan (Table Scan)**. The disk head must visit every page sequentially from block 0 to block 150,000, checking every tuple in memory. This consumes seconds of execution time and saturates disk I/O channels.

![B-Tree Index Search vs. Sequential Scan](/images/content/backend-distributed-systems/sql/backend-distributed-systems_sql_mod-02_lesson-2.2_btree-index-search-vs-seq-scan.svg "B-Tree Balanced Tree Traversal vs. O(N) Sequential Heap Disk Scan")

### B-Tree Index Architecture ($O(\log N)$)

A **B-Tree (Balanced Tree)** index is a self-balancing tree data structure that keeps data sorted and allows searches, sequential access, insertions, and deletions in logarithmic time ($O(\log N)$).

A typical database B-Tree index has three layers:
1. **Root Page (Depth 0):** The entry point page in memory containing range boundary keys and child page pointers.
2. **Branch / Internal Pages (Depth 1):** Sub-divides key spaces further.
3. **Leaf Pages (Depth 2+):** The bottom-most pages. Each entry in a leaf page stores a **sorted index key** paired with a physical row identifier:
   - In PostgreSQL: A tuple pointer known as `ctid` (page number, tuple offset within page).
   - In MySQL InnoDB: The row's Primary Key (clustered index lookup).

For a table with 10,000,000 rows, a B-Tree depth rarely exceeds 3 or 4 levels. Finding row `customer_id = 8842` requires reading **only 3 index pages**, followed by a single random read of the target heap page.

```sql
-- Creating an index on customer_id
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
```

### Composite Indexes & The Leftmost Prefix Rule

When queries filter on multiple columns, a **Composite Index (Multi-Column Index)** is vastly superior to multiple individual single-column indexes:

```sql
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
```

> [!IMPORTANT]
> **The Leftmost Prefix Rule:** A composite index `(A, B)` is physically sorted first by `A`, and then within identical values of `A`, sorted by `B`.
>
> - `WHERE A = 10 AND B = 'PAID'` $\rightarrow$ **Uses Index!** (Both columns matched)
> - `WHERE A = 10` $\rightarrow$ **Uses Index!** (Leftmost prefix matched)
> - `WHERE B = 'PAID'` $\rightarrow$ **CANNOT Use Index!** (Leftmost column missing; requires Seq Scan!)

### Covering Indexes (`Index-Only Scan`)

If every column requested in your `SELECT` clause and `WHERE` predicate exists inside the index leaf page, the engine performs an **Index-Only Scan**. It satisfies the entire query directly out of RAM/index memory without touching the heap table on disk!

```sql
-- In PostgreSQL: Include non-key payload columns in index leaf nodes
CREATE INDEX idx_orders_customer_covering ON orders(customer_id) INCLUDE (status, total_amount);

-- Query hits index-only scan (0 table heap reads):
SELECT status, total_amount FROM orders WHERE customer_id = 8842;
```

---

## 05. The ACID Properties: Deep Technical Deconstruction

When multiple microservices read and write database records concurrently, software bugs, network partitions, and server crashes will happen. Relational databases maintain data integrity through the **ACID** guarantee framework.

![ACID Transactional Guarantees](/images/content/backend-distributed-systems/sql/backend-distributed-systems_sql_mod-02_lesson-2.2_acid-transaction-guarantees.svg "The Four ACID Guarantees: Atomicity, Consistency, Isolation, and Durability")

### 1. Atomicity ("All or Nothing")

A transaction is an indivisible unit of work. Either all SQL modifications execute successfully, or the entire transaction is rolled back with zero side effects.

Consider a bank transfer from Account #1 to Account #2:

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100.00 WHERE id = 1;
-- System crash, network timeout, or JVM exception occurs here!
UPDATE accounts SET balance = balance + 100.00 WHERE id = 2;
COMMIT;
```

If the database crashes after the debit but before the credit, the engine's crash recovery process inspects the **Write-Ahead Log (WAL)** upon reboot. Recognizing an uncommitted transaction, it triggers a rollback using **Undo Logs**, restoring Account #1's \$100.00.

---

### 2. Consistency (Invariant Preservation)

A transaction must transition the database from one valid state to another valid state, satisfying all declared schema invariants:
- Primary key uniqueness
- Foreign key parent-child relationships
- Column data types and non-nullability
- Explicit `CHECK` constraints

If a transaction executes `UPDATE accounts SET balance = -50.00 WHERE id = 1;` against a table with `CHECK (balance >= 0.00)`, the engine rejects the statement, terminates the transaction, and rolls back all preceding writes within that transaction block.

---

### 3. Isolation (Concurrent Execution Shield)

Concurrent transactions must execute without interfering with one another. If Transaction A and Transaction B run concurrently, the final state must appear as if they ran sequentially (one after the other).

RDBMS engines achieve isolation using **MVCC (Multi-Version Concurrency Control)** paired with row-level locks. Under MVCC, when a row is updated, the engine does not overwrite the old data in place. Instead, it creates a new version of the row tagged with a transaction ID (`xmin`, `xmax`). 

> [!TIP]
> **MVCC Golden Rule:** Readers never block writers, and writers never block readers. A query executing a long-running report reads a consistent historical snapshot of data without holding locks that block incoming update transactions.

---

### 4. Durability (Crash-Resilient Persistence)

Once a transaction commits, its modifications are permanently recorded on non-volatile storage. Even if the server suffers an abrupt power loss 5 milliseconds later, committed data is guaranteed to survive.

To balance high write throughput with durability, databases use the **Write-Ahead Log (WAL)**:
1. Writing random data pages to disk is slow (random disk I/O).
2. Appending transaction log entries to the WAL is extremely fast (sequential disk I/O).
3. Before a `COMMIT` statement acknowledges success to the client, the engine issues a synchronous `fsync()` operating system call to flush the WAL buffer from kernel cache to physical SSD storage.
4. Dirty memory data pages in the buffer pool are written to table files later asynchronously via background checkpoint workers.

---

## 06. Transaction Isolation Levels & Concurrency Anomalies

The SQL standard defines four transaction isolation levels. Higher isolation levels provide stronger correctness guarantees but reduce concurrent throughput by increasing lock contention.

### The Three Classic Concurrency Anomalies

1. **Dirty Read:** Transaction A reads data modified by Transaction B that has **not yet committed**. If Transaction B rolls back, Transaction A operated on invalid phantom data.
2. **Non-Repeatable Read (Fuzzy Read):** Transaction A reads a row. Transaction B modifies that same row and commits. Transaction A re-reads the row and discovers the data has changed beneath its feet.
3. **Phantom Read:** Transaction A executes a range query (`WHERE price > 100`). Transaction B inserts a **new row** matching the range and commits. Transaction A re-executes the query and sees a new "phantom" record.

### SQL Isolation Level Matrix

| Isolation Level | Dirty Reads Permitted? | Non-Repeatable Reads? | Phantom Reads? | Primary Mechanism |
| :--- | :---: | :---: | :---: | :--- |
| **`READ UNCOMMITTED`** | **Yes** | **Yes** | **Yes** | No shared read locks; raw memory dirty reads. |
| **`READ COMMITTED`** | **No** | **Yes** | **Yes** | Fresh snapshot taken at each statement (PostgreSQL Default). |
| **`REPEATABLE READ`** | **No** | **No** | **No** *(PostgreSQL MVCC)* | Single snapshot taken at transaction start (MySQL Default). |
| **`SERIALIZABLE`** | **No** | **No** | **No** | Strict Serializable Snapshot Isolation (SSI) / Predicate Locks. |

---

## 07. Database Normalization: 1NF to BCNF Step-by-Step

Database **Normalization** is the systematic process of organizing relational tables to minimize data redundancy and eliminate **data modification anomalies**.

![Database Normalization Progression](/images/content/backend-distributed-systems/sql/backend-distributed-systems_sql_mod-02_lesson-2.2_normalization-1nf-to-3nf-progression.svg "Database Normalization Progression: 1NF to 3NF Entity Decomposition")

### The Three Data Modification Anomalies

Suppose an application stores orders and products in a single unnormalized spreadsheet table:

```text
Unnormalized Orders Table:
order_id | customer_name | customer_city | product_details
---------------------------------------------------------------------------------
101      | Alice Smith   | Seattle       | "Keyboard ($150), Mouse ($80)"
102      | Alice Smith   | Seattle       | "Monitor ($500)"
```

- **Update Anomaly:** If Alice moves to "Chicago", updating her city in Order #101 but missing Order #102 leaves the database in an inconsistent state.
- **Insertion Anomaly:** You cannot add a new product to your catalog without inventing a fake dummy order and customer.
- **Deletion Anomaly:** If you delete Order #102, you inadvertently delete the only record proving that the "Monitor" product exists in your store!

---

### Step 1: First Normal Form (1NF) — Atomic Values

A relation is in **1NF** if:
1. Every attribute contains only **atomic (indivisible) values** (no comma-delimited strings, JSON arrays, or repeating groups).
2. Each record has a unique identity via a **Primary Key**.

```sql
-- 1NF Decomposed Order Items Table
CREATE TABLE order_items_1nf (
    order_id BIGINT,
    item_position INT,
    product_name VARCHAR(100),
    product_price NUMERIC(10, 2),
    PRIMARY KEY (order_id, item_position)
);
```

---

### Step 2: Second Normal Form (2NF) — Full Functional Dependency

A relation is in **2NF** if:
1. It is already in **1NF**.
2. It contains **no Partial Dependencies**: Every non-key column must depend on the **entire Primary Key**, not just a subset of a composite key.

In `order_items_1nf (order_id, product_id, product_name, quantity, unit_price)`:
- `quantity` depends on the combination of `(order_id, product_id)` $\rightarrow$ **Full Dependency.**
- `product_name` depends **only** on `product_id` $\rightarrow$ **Partial Dependency Violation!**

To achieve 2NF, decompose into two distinct entities:

```sql
-- Table A: Products (depends only on product_id)
CREATE TABLE products_2nf (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);

-- Table B: Order Items (depends on both keys)
CREATE TABLE order_items_2nf (
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL REFERENCES products_2nf(id),
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);
```

---

### Step 3: Third Normal Form (3NF) — No Transitive Dependencies

A relation is in **3NF** if:
1. It is already in **2NF**.
2. It contains **no Transitive Dependencies**: Non-key attributes must not depend on other non-key attributes ($A \rightarrow B \rightarrow C$).

> [!NOTE]
> *The Famous 3NF Maxim:* Every non-key attribute must depend on **the key, the whole key, and nothing but the key** (so help me Codd).

Consider: `customers (id, name, zip_code, city, state)`
- `id` (Primary Key) $\rightarrow$ determines `zip_code`.
- `zip_code` $\rightarrow$ determines `city` and `state`.
- Therefore, `city` depends transitively on `id` via `zip_code`!

If 10,000 customers live in Seattle ZIP code `98101`, the string `"Seattle"` is redundantly duplicated 10,000 times. If the city name changes, 10,000 rows must be modified.

To achieve 3NF, extract the transitive lookup into its own relation:

```sql
CREATE TABLE zip_codes (
    zip_code VARCHAR(10) PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL
);

CREATE TABLE customers_3nf (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    zip_code VARCHAR(10) NOT NULL REFERENCES zip_codes(zip_code)
);
```

---

## 08. When to Denormalize: Pragmatic Production Trade-offs

While 3NF eliminates redundancy and update anomalies, strict normalization carries an architectural trade-off: **Query Latency under High Concurrency**.

Fetching an order invoice in 3NF requires joining `orders`, `order_items`, `products`, `customers`, `zip_codes`, and `discounts`. At 50,000 requests per second, performing 6-way joins across millions of rows saturates database CPU cores.

### Practical Denormalization Patterns

1. **Snapshot Data Duplication (Point-in-Time History):** In e-commerce, storing `unit_price` directly inside `order_items` is not a normalization violation—it is an architectural requirement. If the product's catalog price increases next year from \$149 to \$199, historical order records must remain immutable.
2. **Aggregated Summary Columns:** Storing `orders.total_amount` or `customers.total_lifetime_spend` eliminates expensive `SUM()` aggregates across millions of line item records during real-time user dashboard loads.
3. **Read-Heavy Materialized Views:** Pre-joining tables into cached materialized views updated via background triggers or periodic cron jobs.

```sql
CREATE MATERIALIZED VIEW mv_customer_order_summary AS
SELECT 
    c.id AS customer_id,
    c.name,
    COUNT(o.id) AS total_orders,
    SUM(o.total_amount) AS lifetime_value
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name;

-- Fast index scan on aggregated view:
CREATE UNIQUE INDEX idx_mv_customer_id ON mv_customer_order_summary(customer_id);
```

---

## 09. Bridging SQL to Spring Boot 3 & Spring Data JPA

In modern Java microservices, developers interact with relational databases through Spring Data JPA and Hibernate. However, abstracting SQL behind an ORM (Object-Relational Mapping) layer introduces dangerous hidden traps if you do not understand the underlying SQL generated.

### 1. The Notorious N+1 Query Problem

Consider this standard Spring Data JPA relationship:

```java
@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(mappedBy = "customer", fetch = FetchType.LAZY)
    private List<Order> orders = new ArrayList<>();
}
```

When you fetch all customers and iterate through their orders:

```java
// Spring Data Repository Call:
List<Customer> customers = customerRepository.findAll();

// In your service layer:
for (Customer customer : customers) {
    System.out.println(customer.getName() + " has " + customer.getOrders().size() + " orders");
}
```

#### What Happens on the SQL Wire:
- **1 Query** to fetch all customers: `SELECT * FROM customers;` (Returns 100 rows).
- **100 Separate Queries** executed in a loop as Hibernate lazily initializes `orders` for each customer:
  ```sql
  SELECT * FROM orders WHERE customer_id = 1;
  SELECT * FROM orders WHERE customer_id = 2;
  ...
  SELECT * FROM orders WHERE customer_id = 100;
  ```
That is **101 round-trip network socket calls** to the database! Under high traffic, this exhausts connection pools and destroys API response latencies.

#### The Fix: Join Fetch in JPQL

Use an inner join fetch to instruct Hibernate to issue a single SQL `INNER JOIN` over the wire:

```java
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @Query("SELECT DISTINCT c FROM Customer c LEFT JOIN FETCH c.orders")
    List<Customer> findAllWithOrders();
}
```

Generated SQL (Single round-trip):
```sql
SELECT c.id, c.name, o.id, o.customer_id, o.status, o.total_amount
FROM customers c
LEFT OUTER JOIN orders o ON c.id = o.customer_id;
```

---

### 2. Spring Declarative Transaction Management

Spring Boot provides declarative transaction boundaries via `@Transactional`:

```java
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional(
        isolation = Isolation.READ_COMMITTED,
        timeout = 5,
        rollbackFor = Exception.class
    )
    public OrderResponse createOrder(CreateOrderRequest request) {
        // Step 1: Deduct inventory (issues UPDATE with row-level lock)
        productRepository.deductStock(request.productId(), request.quantity());

        // Step 2: Persist order entity
        Order order = new Order(request.customerId(), request.totalAmount());
        orderRepository.save(order);

        return new OrderResponse(order.getId(), "CONFIRMED");
    }
}
```

- **`Isolation.READ_COMMITTED`:** Configures the JDBC connection isolation level.
- **`timeout = 5`:** Sets a 5-second transaction deadline to prevent slow queries from holding locks indefinitely.
- **`rollbackFor = Exception.class`:** By default, Spring only rolls back on unchecked (`RuntimeException`) exceptions. Setting this ensures checked exceptions also trigger an atomic rollback.

---

## 10. Summary & Mental Model Review

Let's summarize the key mental models covered in this guide:

### Relational Engineering Cheat Sheet

| Domain | Core Concept | Golden Rule / Mental Model |
| :--- | :--- | :--- |
| **Relational Model** | Declarative SQL | Tell the database **what** data you need; let the Cost-Based Optimizer choose **how**. |
| **Joins** | Set Intersection | `INNER` drops unmatched rows. `LEFT` preserves all left-hand tuples (crucial for parent-child listings). |
| **B-Tree Indexes** | Logarithmic Search | Leftmost prefix rule dictates multi-column efficiency. Index leaf pages eliminate sequential heap scans. |
| **Atomicity** | Undo Logs / WAL | Transactions are all-or-nothing; failures trigger automatic rollback of intermediate mutations. |
| **Consistency** | Invariant Safety | Constraints (`CHECK`, `FK`, `UNIQUE`) prevent illegal database states. |
| **Isolation** | MVCC Snapshots | Prevents dirty reads and phantoms without allowing readers to block writers. |
| **Durability** | `fsync()` WAL Flush | Committed data survives power failure via sequential Write-Ahead Logging before acknowledging commit. |
| **Normalization** | 1NF $\rightarrow$ 3NF | Eliminates update, insert, and delete anomalies by ensuring non-key attributes depend only on the primary key. |
| **Spring Data JPA** | N+1 Prevention | Never blindly loop over `@OneToMany` lazy collections; always use `JOIN FETCH` or `@EntityGraph`. |
