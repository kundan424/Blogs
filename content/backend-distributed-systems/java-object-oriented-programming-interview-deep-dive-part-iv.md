---
title: "Java Object-Oriented Programming: Interview Deep Dive (Part IV)"
slug: java-object-oriented-programming-interview-deep-dive-part-iv
subject: backend-distributed-systems
abstract: "Level-4 Principal & Staff engineering deep dive analyzing real-world scenario questions 76–100: Debugging subtle HashMap memory leaks, refactoring fragile base classes, breaking circular dependencies, securing deserialization bypasses, and designing high-throughput distributed domain models."
tags:
  - java
  - oop
  - system-design
  - design-patterns
  - distributed-systems
  - refactoring
  - backend-engineering
published: true
publishDate: Nov 07, 2026
updatedDate: Nov 07, 2026
readTime: 40m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
---

# Java Object-Oriented Programming: Interview Deep Dive (Part IV)

A principal- and staff-level interview architecture manual analyzing practical production bugs, enterprise refactoring, design pattern trade-offs, and distributed systems modeling across 25 real-world scenarios (Questions 76–100).

---

## 76. The HashMap Mutable Key Bug

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** You use a custom `Employee` object as a key in a `HashMap`. After inserting the employee into the map, you update their department field via `emp.setDepartment("HR")`. When you call `map.get(emp)`, it returns `null`. Why did this happen, and how do you fix the `Employee` class design?
:::

```text
                     THE HASHMAP MUTABLE KEY TRAP
                     
1. Insertion:
   emp.department = "Engineering" ──▶ hash(emp) = 0x1A2B ──▶ Bucket #3
   ┌────────────────────────────────────────────────────────┐
   │ HashMap Array                                          │
   │ Bucket #3: [ Node (Key: emp, Hash: 0x1A2B, Value: $120k) ]
   └────────────────────────────────────────────────────────┘

2. In-Place Mutation:
   emp.setDepartment("HR"); // Mutates internal field used in hashCode()!

3. Retrieval:
   map.get(emp) ──▶ Recomputes hash(emp) = 0x9F8C ──▶ Bucket #9!
   ┌────────────────────────────────────────────────────────┐
   │ HashMap Array                                          │
   │ Bucket #9: [ NULL / EMPTY ] ──▶ RETURNS NULL!          │
   └────────────────────────────────────────────────────────┘
   (Memory Leak: The original node is orphaned forever in Bucket #3!)
```

### Why `map.get(emp)` Returned `null`
`HashMap` calculates the storage bucket using:
$$\text{bucketIndex} = (n - 1) \& \text{hash}(\text{key.hashCode()})$$
When `emp.setDepartment("HR")` was invoked, the value returned by `emp.hashCode()` changed. When `map.get(emp)` was called, the map recalculated the bucket index using the **new** hash code, searching in Bucket #9 instead of Bucket #3. Bucket #9 is empty, returning `null`.

Even if the hash code collided with Bucket #3 by pure chance, the `key.equals(targetKey)` comparison would fail if `equals()` depended on `department`. The entry becomes an **inaccessible memory leak**.

### Production Design Fix
Key objects in hash-based collections must be **deeply immutable**, or their `hashCode()` and `equals()` contracts must depend strictly on **immutable identity fields** (e.g., `employeeId`):

```java title="ImmutableEmployeeKey.java"
// Solution 1: Java Record (Deeply Immutable Value Type)
public record EmployeeKey(String employeeId, String tenantId) {
    public EmployeeKey {
        Objects.requireNonNull(employeeId, "employeeId required");
        Objects.requireNonNull(tenantId, "tenantId required");
    }
}

// Solution 2: Class with Invariant Identity in equals/hashCode
public final class Employee {
    private final String employeeId; // Immutable identity
    private volatile String department; // Mutable business attribute

    public Employee(String employeeId, String department) {
        this.employeeId = Objects.requireNonNull(employeeId);
        this.department = Objects.requireNonNull(department);
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Employee that)) return false;
        return Objects.equals(employeeId, that.employeeId); // Only compare immutable identity
    }

    @Override
    public int hashCode() {
        return Objects.hash(employeeId); // Stable across entire object lifecycle
    }
}
```

---

## 77. The Fragile Base Class Problem: `CustomHashSet` Double Counting

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** You have a `CustomHashSet` that extends `HashSet` to count how many elements have ever been added. You override `add()` and `addAll()` to increment a counter before calling `super.add()` and `super.addAll()`. When you call `addAll()` with 3 items, the counter increments by 6 instead of 3. Why did this happen inside `HashSet`, and how do you fix your design using Composition?
:::

```text
       WHY INHERITANCE DOUBLED THE ADD COUNT
       
  Client calls: customSet.addAll(List.of("A", "B", "C"));
       │
       ▼
  1. CustomHashSet.addAll() executes:
     count += 3; (count = 3)
     calls super.addAll(c);
       │
       ▼
  2. java.util.HashSet.addAll() executes:
     for (E e : c) {
         this.add(e); // DYNAMIC DISPATCH TRAP! 'this' is CustomHashSet!
     }
       │
       ▼
  3. CustomHashSet.add() executes 3 times:
     count++; (count = 4)
     count++; (count = 5)
     count++; (count = 6!)
  ==> Final count: 6 instead of 3!
```

### Why It Broke
Inheritance exposes implementation details. `HashSet.addAll()` delegates internally to `this.add()`. Because virtual methods use Dynamic Method Dispatch (late binding), `super.addAll()` dispatched back down to the overridden `CustomHashSet.add()`, incrementing the counter twice for every element.

### The Fix: Forwarding Decorator via Composition
```java title="InstrumentedSet.java"
public class InstrumentedSet<E> implements Set<E> {
    private final Set<E> delegate;
    private int addCount = 0;

    public InstrumentedSet(Set<E> delegate) {
        this.delegate = Objects.requireNonNull(delegate);
    }

    @Override
    public boolean add(E e) {
        addCount++;
        return delegate.add(e);
    }

    @Override
    public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return delegate.addAll(c); // Safe: Forwarding avoids internal recursion bugs!
    }

    public int getAddCount() { return addCount; }

    // Standard delegation for remaining Set methods
    @Override public int size() { return delegate.size(); }
    @Override public boolean isEmpty() { return delegate.isEmpty(); }
    @Override public boolean contains(Object o) { return delegate.contains(o); }
    @Override public Iterator<E> iterator() { return delegate.iterator(); }
    @Override public void clear() { delegate.clear(); }
}
```

---

## 78. Payment Gateway Extensibility: Refactoring God `if-else` Blocks

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** You are building an e-commerce checkout system supporting Credit Card, UPI, and PayPal. Currently, a 500-line `if-else` block handles payment processing. Next month, you need to add Apple Pay and Crypto without modifying the core checkout class. How do you refactor this using OOP principles and Design Patterns?
:::

```text
   BEFORE (Violates OCP): 500-Line if-else God Method
   if (type == CREDIT_CARD) { ... }
   else if (type == UPI) { ... }
   else if (type == PAYPAL) { ... }

   AFTER (Satisfies OCP): Strategy + Factory Registry
   CheckoutService ──▶ PaymentStrategyRegistry
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   ┌───────────┐       ┌───────────┐       ┌───────────┐
   │CreditCard │       │UpiStrategy│       │ApplePay   │ (New plugin class)
   │Strategy   │       │           │       │Strategy   │
   └───────────┘       └───────────┘       └───────────┘
```

### The Strategy & Registry Architecture

```java title="PaymentStrategyArchitecture.java"
public interface PaymentStrategy {
    PaymentResult process(PaymentRequest request);
    PaymentMethod getMethod();
}

@Component
public class ApplePayStrategy implements PaymentStrategy {
    @Override
    public PaymentResult process(PaymentRequest req) {
        // Encapsulated Apple Pay tokenized charge logic
        return PaymentResult.success(UUID.randomUUID().toString());
    }

    @Override
    public PaymentMethod getMethod() { return PaymentMethod.APPLE_PAY; }
}

@Service
public class CheckoutService {
    private final Map<PaymentMethod, PaymentStrategy> registry;

    // Open for Extension: Spring aggregates all strategy beans automatically!
    public CheckoutService(List<PaymentStrategy> strategies) {
        this.registry = strategies.stream()
            .collect(Collectors.toUnmodifiableMap(PaymentStrategy::getMethod, Function.identity()));
    }

    public PaymentResult checkout(PaymentRequest request) {
        PaymentStrategy strategy = registry.get(request.getMethod());
        if (strategy == null) {
            throw new UnsupportedOperationException("Payment method unsupported: " + request.getMethod());
        }
        return strategy.process(request);
    }
}
```

---

## 79. Immutable Class State Leak via Mutable References

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** A junior developer writes an `ImmutableUser` class with `private final String name` and `private final List<String> roles`, initialized via constructor with no setters. Yet, in production, unauthorized roles are being added to users at runtime. How is the state being mutated, and what exact code change fixes it?
:::

```text
       WHERE THE IMMUTABILITY LEAK OCCURS
       
  1. Constructor Leak (Caller retains reference):
     List<String> inputRoles = new ArrayList<>();
     inputRoles.add("USER");
     ImmutableUser user = new ImmutableUser("Alice", inputRoles);
     inputRoles.add("ADMIN"); // BUG: Mutates user's internal list!

  2. Getter Leak (Consumer receives internal reference):
     user.getRoles().add("SUPERUSER"); // BUG: Direct heap mutation!
```

### The Root Cause
Declaring a field `private final List<String> roles` only makes the **reference pointer** immutable (it cannot point to a different `List` instance). The underlying heap array remains completely mutable.

### The Exact Production Fix
```java title="SecureImmutableUser.java"
public final class ImmutableUser {
    private final String name;
    private final List<String> roles;

    public ImmutableUser(String name, List<String> roles) {
        this.name = Objects.requireNonNull(name, "name required");
        // FIX 1: Defensive copy on constructor input using Java 10+ List.copyOf
        // (Guarantees an unmodifiable, null-safe, detached copy)
        this.roles = List.copyOf(roles);
    }

    public String getName() {
        return name;
    }

    public List<String> getRoles() {
        // FIX 2: Returns unmodifiable view; mutations throw UnsupportedOperationException
        return roles; 
    }
}
```

---

## 80. API Evolution Without Breaking Downstream Clients

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** You maintain a core payment library used by 40 microservices via a `PaymentProcessor` interface. You must add a new method `processRefund()` to the interface, but you cannot force all 40 teams to update their implementation classes immediately. How do you evolve the interface safely?
:::

```text
       EVOLVING CORE INTERFACES SAFELY
       
  Old PaymentProcessor Contract:
  void processPayment(Payment p);
              │
              ├──▶ Team A (Service 1)
              ├──▶ Team B (Service 2)
              └──▶ Team C (Service 40)
              
  Adding 'void processRefund(Refund r);':
  - Without default method: All 40 microservices FAIL compilation on upgrade!
  - With default method: Fully binary and source backwards-compatible!
```

### The Solution: Interface Default Methods with Fail-Fast Semantics
In Java 8+, introduce the new capability as a `default` method. Provide a fail-fast fallback so un-upgraded teams are not broken on compile, but receive clear runtime signals if called:

```java title="PaymentProcessor.java"
public interface PaymentProcessor {

    void processPayment(Payment payment);

    /**
     * Evolved method with backward compatibility.
     * Implementing classes can override at their own deployment pace.
     */
    default RefundResult processRefund(RefundRequest refund) {
        throw new UnsupportedOperationException(
            "Refunds are not implemented by: " + getClass().getSimpleName()
        );
    }
}
```

---

## 81. Notification Combinatorial Explosion: The Decorator Pattern

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** You have a `Notifier` class. Subclasses include `EmailNotifier`, `SMSNotifier`, and `SlackNotifier`. Now product management wants combinations: `EmailAndSMSNotifier`, `EmailAndSlackNotifier`, and `AllThreeNotifier`. Using inheritance is creating dozens of classes. How do you redesign this hierarchy?
:::

```text
       COMBINATORIAL EXPLOSION (Inheritance: O(2^N) Classes)
       Notifier
       ├── EmailNotifier
       ├── SMSNotifier
       ├── SlackNotifier
       ├── EmailAndSMSNotifier
       ├── EmailAndSlackNotifier
       └── EmailAndSMSAndSlackNotifier... (Unmaintainable!)

       DECORATOR PATTERN (Composition: O(N) Classes)
       BaseNotifier ──▶ SMSDecorator ──▶ SlackDecorator ──▶ EmailDecorator
       (Arbitrary combinations chained dynamically at runtime!)
```

### Refactoring to the Decorator Pattern

```java title="NotifierDecorator.java"
public interface Notifier {
    void send(String message);
}

// Concrete Core Component
public class EmailNotifier implements Notifier {
    @Override
    public void send(String message) {
        System.out.println("Email dispatched: " + message);
    }
}

// Base Abstract Decorator
public abstract class NotifierDecorator implements Notifier {
    protected final Notifier wrapped;
    protected NotifierDecorator(Notifier wrapped) { this.wrapped = wrapped; }
    @Override public void send(String message) { wrapped.send(message); }
}

public class SmsDecorator extends NotifierDecorator {
    public SmsDecorator(Notifier wrapped) { super(wrapped); }
    @Override
    public void send(String message) {
        super.send(message);
        System.out.println("SMS dispatched: " + message);
    }
}

public class SlackDecorator extends NotifierDecorator {
    public SlackDecorator(Notifier wrapped) { super(wrapped); }
    @Override
    public void send(String message) {
        super.send(message);
        System.out.println("Slack message dispatched: " + message);
    }
}

// Client Dynamic Composition at Runtime:
Notifier customNotifier = new SlackDecorator(new SmsDecorator(new EmailNotifier()));
customNotifier.send("Service latency spike alert!");
```

---

## 82. Thread-Safe Configuration Manager with Zero Lock Contention

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** Your application reads database and API configurations at startup. Multiple threads read this config concurrently, and once every hour a background thread refreshes the config altogether. How do you design the `Config` object using OOP and immutability so readers never see partially updated state and don't suffer lock contention?
:::

```text
       ATOMIC REFERENCE COPY-ON-WRITE CONFIGURATION
       
  Concurrent Reader Threads (Zero Locking / Non-Blocking):
  Thread 1 ──▶ configRef.get() ──▶ [ ImmutableAppConfig (v1) ]
  Thread 2 ──▶ configRef.get() ──▶ [ ImmutableAppConfig (v1) ]
                                                ▲
  Hourly Background Refresh:                    │ Atomic Pointer Swap
  1. Reads DB & builds ImmutableAppConfig (v2)  │ (CAS / volatile write)
  2. configRef.set(v2Config); ──────────────────┘
  (Readers instantly transition to v2 with zero partial state or locks!)
```

```java title="ConfigurationManager.java"
public record AppConfig(String dbUrl, int poolSize, int timeoutMs, Map<String, String> featureFlags) {
    public AppConfig {
        featureFlags = Map.copyOf(featureFlags); // Deeply immutable snapshot
    }
}

public class ConfigurationManager {
    // AtomicReference ensures atomic visibility across threads
    private final AtomicReference<AppConfig> activeConfig;

    public ConfigurationManager(AppConfig initialConfig) {
        this.activeConfig = new AtomicReference<>(initialConfig);
    }

    // High-throughput reader: 100% lock-free, zero contention
    public AppConfig getConfig() {
        return activeConfig.get();
    }

    // Hourly background worker: creates brand-new immutable instance and swaps pointer
    public void refreshConfiguration() {
        AppConfig freshConfig = fetchFromRemoteStore();
        activeConfig.set(freshConfig); // Atomic volatile pointer update
    }

    private AppConfig fetchFromRemoteStore() {
        return new AppConfig("jdbc:postgresql://aurora-cluster", 64, 2500, Map.of("beta", "true"));
    }
}
```

---

## 83. Legacy Third-Party Integration: The Adapter Pattern

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** Your system expects all analytics providers to implement your `AnalyticsService` interface with `trackEvent(Event e)`. However, you just licensed a new third-party SDK whose class is final and uses a completely different method signature: `sendMetric(String name, Map<String, Object> payload)`. How do you integrate it cleanly without touching your existing business logic?
:::

```text
   Domain Layer Expected Contract:                Third-Party SDK (final class):
   ┌─────────────────────────────┐                ┌───────────────────────────────┐
   │ AnalyticsService            │                │ SegmentSDK (final)            │
   ├─────────────────────────────┤                ├───────────────────────────────┤
   │ + trackEvent(Event e)       │                │ + sendMetric(name, payloadMap)│
   └──────────────▲──────────────┘                └───────────────▲───────────────┘
                  │                                               │
                  └──────────────┬────────────────────────────────┘
                                 │ Wraps and converts data
                    ┌────────────┴───────────────┐
                    │ SegmentAnalyticsAdapter    │
                    └────────────────────────────┘
```

```java title="AnalyticsAdapter.java"
public record Event(String eventName, String userId, Map<String, Object> metadata) {}

public interface AnalyticsService {
    void trackEvent(Event event);
}

// Adapter bridges the signature and behavioral mismatch
public final class SegmentAnalyticsAdapter implements AnalyticsService {
    private final SegmentSDK segmentClient;

    public SegmentAnalyticsAdapter(SegmentSDK segmentClient) {
        this.segmentClient = Objects.requireNonNull(segmentClient);
    }

    @Override
    public void trackEvent(Event event) {
        // Transform domain Event object into third-party SDK signature
        Map<String, Object> payload = new HashMap<>(event.metadata());
        payload.put("userId", event.userId());
        segmentClient.sendMetric(event.eventName(), payload);
    }
}
```

---

## 84. Memory Leak in the Observer Pattern (Lapsed Listener Problem)

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** You implemented an event listener system where UI components register themselves with a global `EventManager` singleton. Even after UI screens are closed, heap dumps show they are never garbage collected, eventually causing an `OutOfMemoryError`. Why is this happening from an object-reference perspective, and how do you solve it?
:::

```text
                     THE LAPSED LISTENER MEMORY LEAK
                     
   Long-Lived Singleton                          Short-Lived UI / Screen
  ┌─────────────────────────┐                   ┌─────────────────────────┐
  │ EventManager (Root)     │                   │ OrderDashboardScreen    │
  │ List<EventListener> ────┼──Strong Reference─┼─▶ (Retained in Heap!)   │
  │                         │                   │ Holds 50MB bitmap cache │
  └─────────────────────────┘                   └─────────────────────────┘
                                                User closes window;
                                                Garbage Collector CANNOT collect!
```

### Why the OutOfMemoryError Occurs
The long-lived singleton holds strong references to listeners in its collection. Even when UI components are disposed and discarded by the UI thread, **the root reference path from the `EventManager` singleton prevents the garbage collector from reclaiming the component**, leaking memory on every screen transition.

### The Solutions
1. **Explicit Unregistration**: Implement `AutoCloseable` on the listener registration.
2. **Weak References (`WeakHashMap`)**: The listener collection holds weak references; GC reclaims them automatically when no other strong references exist:

```java title="WeakEventManager.java"
public class EventManager {
    // Weak reference set: Listeners collected automatically if no other strong references exist
    private final Set<EventListener> listeners = 
        Collections.newSetFromMap(new WeakHashMap<>());

    public synchronized void subscribe(EventListener listener) {
        listeners.add(listener);
    }

    public synchronized void publish(Event e) {
        for (EventListener listener : listeners) {
            listener.onEvent(e);
        }
    }
}
```

---

## 85. Cross-Cutting Logging & Auditing: The Dynamic Proxy Pattern

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** You have 30 service classes implementing business interfaces. A compliance requirement mandates logging execution time and checking user roles before every method call. You are forbidden from copying and pasting logging code into all 30 classes. How do you architect this in Java?
:::

```text
   Client Request
        │
        ▼
   ┌────────────────────────────────────────────────────────┐
   │ AuditLoggingProxy (InvocationHandler)                  │
   │ 1. Verify User Role ("ROLE_ADMIN")                     │
   │ 2. Start NanoTimer                                     │
   │ 3. targetService.method(...) executes                  │
   │ 4. Log: "Executed OrderService.process in 1.4ms"       │
   └────────────────────────────────────────────────────────┘
```

Using JDK Dynamic Proxies, cross-cutting logic is centralized in one place without touching the 30 service classes:

```java title="SecurityAuditProxy.java"
public class SecurityAuditProxy implements InvocationHandler {
    private final Object target;

    public SecurityAuditProxy(Object target) {
        this.target = target;
    }

    @SuppressWarnings("unchecked")
    public static <T> T wrap(T target, Class<T> interfaceType) {
        return (T) Proxy.newProxyInstance(
            interfaceType.getClassLoader(),
            new Class<?>[]{interfaceType},
            new SecurityAuditProxy(target)
        );
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        long start = System.nanoTime();
        SecurityContext.assertAuthorized(method.getName());
        try {
            return method.invoke(target, args);
        } catch (InvocationTargetException e) {
            throw e.getTargetException(); // Unwrap real exception
        } finally {
            long duration = (System.nanoTime() - start) / 1_000_000;
            System.out.printf("AUDIT: [%s] completed in %d ms%n", method.getName(), duration);
        }
    }
}
```

---

## 86. Bird Hierarchy: Liskov Substitution Principle (LSP) Restructuring

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** You are designing a simulation game with a base class `Bird` containing `fly()`. You add `Eagle` and `Sparrow`, which work fine. Then you add `Ostrich` and `Penguin`, which throw `UnsupportedOperationException` inside `fly()`. Why is this a bad OOP design, and how do you restructure the classes/interfaces?
:::

### Why `Ostrich extends Bird` Throwing `UnsupportedOperationException` Is Broken
A client written to accept `Bird` expects that calling `bird.fly()` is a valid, safe operation. When `Ostrich` throws `UnsupportedOperationException`, it breaks caller assumptions and violates the Liskov Substitution Principle.

```text
       RESTRUCTURED CAPABILITY-BASED HIERARCHY
       
                     ┌───────────────┐
                     │     Bird      │ (eat, sleep, getWeight)
                     └───────┬───────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   ┌─────────────────┐               ┌─────────────────┐
   │    «interface»  │               │   «interface»   │
   │     Flyable     │               │    Swimmable    │
   │  + fly()        │               │   + swim()      │
   └────────┬────────┘               └────────┬────────┘
            │                                 │
     ┌──────┴──────┐                   ┌──────┴──────┐
     ▼             ▼                   ▼             ▼
┌─────────┐   ┌─────────┐         ┌─────────┐   ┌─────────┐
│  Eagle  │   │ Sparrow │         │ Penguin │   │  Duck   │ (Flyable & Swimmable)
└─────────┘   └─────────┘         └─────────┘   └─────────┘
```

```java title="LspBirdHierarchy.java"
public abstract class Bird {
    public abstract void eat();
}

public interface Flyable {
    void fly();
}

public interface Swimmable {
    void swim();
}

// Implementations only inherit valid capabilities
public class Eagle extends Bird implements Flyable {
    @Override public void eat() { /* hunt */ }
    @Override public void fly() { /* soaring */ }
}

public class Penguin extends Bird implements Swimmable {
    @Override public void eat() { /* fish */ }
    @Override public void swim() { /* diving */ }
}
```

---

## 87. Connection Pool Exhaustion: Implementing `AutoCloseable`

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** Developers on your team keep creating database connections and file streams inside service objects, forgetting to close them when exceptions occur. How do you design your custom resource wrapper class so that Java's `try-with-resources` block automatically closes the connection?
:::

```java title="ManagedDatabaseLease.java"
public final class ManagedDatabaseLease implements AutoCloseable {
    private final Connection connection;
    private final AtomicBoolean isClosed = new AtomicBoolean(false);

    public ManagedDatabaseLease(DataSource dataSource) throws SQLException {
        this.connection = dataSource.getConnection();
    }

    public PreparedStatement prepareStatement(String sql) throws SQLException {
        if (isClosed.get()) throw new IllegalStateException("Lease is closed");
        return connection.prepareStatement(sql);
    }

    @Override
    public void close() {
        if (isClosed.compareAndSet(false, true)) {
            try {
                connection.close(); // Returns connection to HikariCP pool
            } catch (SQLException e) {
                // Log and discard to prevent swallowing primary try exceptions
                System.err.println("Failed to return connection: " + e.getMessage());
            }
        }
    }
}

// Idiomatic Usage: Guaranteed resource return even on RuntimeException
public void queryAccount(String id) throws Exception {
    try (ManagedDatabaseLease lease = new ManagedDatabaseLease(dataSource);
         PreparedStatement ps = lease.prepareStatement("SELECT * FROM accounts WHERE id = ?")) {
        ps.setString(1, id);
        // Execute query
    } // lease.close() called automatically by JVM!
}
```

---

## 88. Deep Cloning a Complex Invoice: Fixing Object Graph Aliasing

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** In a billing system, users can create a "Duplicate Invoice" from a template invoice. When a user edits line items on the duplicated invoice, the original template invoice in memory also changes. Explain the bug and write the cleanest OOP approach to clone the object graph.
:::

### The Bug
The duplication logic executed a shallow clone: `new Invoice(original.id, original.items)`. Both invoices held references to the **exact same `ArrayList<LineItem>`**. When line items were modified on the duplicated invoice, the shared instances inside the original template were mutated.

```java title="DeepCopyInvoice.java"
public record LineItem(String sku, int quantity, BigDecimal unitPrice) {
    // Records are shallowly immutable, so safe to reuse if components are immutable
}

public final class Invoice {
    private final String invoiceId;
    private final List<LineItem> lineItems;

    public Invoice(String invoiceId, List<LineItem> lineItems) {
        this.invoiceId = invoiceId;
        // Deep copy collection of line items
        this.lineItems = new ArrayList<>(lineItems.size());
        for (LineItem item : lineItems) {
            this.lineItems.add(new LineItem(item.sku(), item.quantity(), item.unitPrice()));
        }
    }

    // Copy Constructor for Deep Cloning
    public Invoice(Invoice source, String newInvoiceId) {
        this(newInvoiceId, source.lineItems);
    }

    public List<LineItem> getLineItems() {
        return Collections.unmodifiableList(lineItems);
    }
}
```

---

## 89. Multi-Criteria Dynamic Sorting: `Comparable` vs. `Comparator`

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** You have an `Employee` class (`id`, `name`, `salary`, `joiningDate`). The default sorting across the app should always be by `id`. However, the HR dashboard needs to sort by `salary` descending, and if salaries are equal, by `name` alphabetically. How do you implement both without breaking the default sort?
:::

```java title="EmployeeSortingArchitecture.java"
public class Employee implements Comparable<Employee> {
    private final long id;
    private final String name;
    private final BigDecimal salary;

    public Employee(long id, String name, BigDecimal salary) {
        this.id = id; this.name = name; this.salary = salary;
    }

    public long getId() { return id; }
    public String getName() { return name; }
    public BigDecimal getSalary() { return salary; }

    // 1. Natural Default Sorting across the application: By ID Ascending
    @Override
    public int compareTo(Employee other) {
        return Long.compare(this.id, other.id);
    }

    // 2. Specialized HR Comparator: Salary Descending, then Name Alphabetical
    public static final Comparator<Employee> HR_SALARY_COMPARATOR = Comparator
        .comparing(Employee::getSalary, Comparator.reverseOrder())
        .thenComparing(Employee::getName);
}

// Execution:
List<Employee> staff = getEmployees();
Collections.sort(staff); // Default sort by ID
staff.sort(Employee.HR_SALARY_COMPARATOR); // HR Multi-criteria sort
```

---

## 90. Preventing Subclass Tampering in Security SDKs

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** You are writing a `SecurityTokenValidator` class for an internal banking SDK. External developers need to use this class, and maybe extend some helper methods, but they must never be able to override the core `validateSignature()` algorithm, or alternatively, never subclass the validator at all. How do you enforce both levels of restriction?
:::

### Requirement 1: Prevent Overriding a Single Core Algorithm
Use the **Template Method Pattern** with a `final` method:

```java title="TemplateTokenValidator.java"
public abstract class BaseTokenValidator {

    // Final method: Core cryptographic validation cannot be overridden or tampered with!
    public final boolean validateSignature(String token, byte[] signature) {
        byte[] expectedHash = computeSha256(token);
        boolean isValid = MessageDigest.isEqual(expectedHash, signature);
        onValidationComplete(token, isValid); // Optional hook
        return isValid;
    }

    // Protected hook: Subclasses can customize logging or metrics, but not the math
    protected void onValidationComplete(String token, boolean success) {}

    private byte[] computeSha256(String token) { /* Native crypto */ return new byte[32]; }
}
```

### Requirement 2: Completely Prevent Subclassing
Mark the class `final`, or use Java 17 `sealed` classes to restrict subtyping to verified packages:
```java
// Alternative A: Absolute prevention
public final class SecurityTokenValidator {}

// Alternative B: Modern package-restricted sealing
public sealed class SecurityTokenValidator permits InternalTrustedValidator {}
```

---

## 91. Constructor Parameter Overload: Refactoring via Builder Pattern

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** You are designing an `HttpRequest` class that requires a `url`, `method`, `headers`, `queryParams`, `body`, `timeout`, `followRedirects`, and `retryCount`. Most callers only need `url` and `method`. Creating 8 overloaded constructors has become unmaintainable. How do you refactor this class?
:::

```java title="HttpRequestBuilder.java"
public final class HttpRequest {
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final byte[] body;
    private final int timeoutMs;

    private HttpRequest(Builder b) {
        this.url = b.url;
        this.method = b.method;
        this.headers = Map.copyOf(b.headers);
        this.body = b.body;
        this.timeoutMs = b.timeoutMs;
    }

    public static class Builder {
        // Required parameters
        private final String url;
        private final String method;

        // Optional parameters with production defaults
        private final Map<String, String> headers = new HashMap<>();
        private byte[] body = new byte[0];
        private int timeoutMs = 5000;

        public Builder(String url, String method) {
            this.url = Objects.requireNonNull(url, "URL cannot be null");
            this.method = Objects.requireNonNull(method, "Method cannot be null");
        }

        public Builder header(String k, String v) { headers.put(k, v); return this; }
        public Builder body(byte[] body) { this.body = body; return this; }
        public Builder timeoutMs(int timeoutMs) { this.timeoutMs = timeoutMs; return this; }

        public HttpRequest build() { return new HttpRequest(this); }
    }
}
```

---

## 92. Eliminating Deep Null Checks: `Optional` Monadic Composition

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** An `Order` has a `Customer`, a `Customer` has an `Address`, and an `Address` has a `ZipCode`. Deep null checks (`if (order != null && order.getCustomer() != null...)`) are polluting your service layer. How do you use OOP practices (such as `Optional<T>` or the Null Object Pattern) to eliminate this clutter?
:::

### The Legacy Anti-Pattern
```java
// Fragile, cluttered null checks:
if (order != null) {
    Customer c = order.getCustomer();
    if (c != null) {
        Address a = c.getAddress();
        if (a != null && a.getZipCode() != null) {
            return a.getZipCode();
        }
    }
}
return "UNKNOWN";
```

### The Clean OOP Monadic Solution
```java title="OptionalNullElimination.java"
public record ZipCode(String code) {}
public record Address(ZipCode zip) {}
public record Customer(Address address) {}
public record Order(Customer customer) {}

public String extractZipCode(Order order) {
    return Optional.ofNullable(order)
        .map(Order::customer)
        .map(Customer::address)
        .map(Address::zip)
        .map(ZipCode::code)
        .filter(Predicate.not(String::isBlank))
        .orElse("UNKNOWN");
}
```

---

## 93. State Machine Transitions: Smart State Enums

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** An e-commerce `Order` goes through states: `CREATED -> PAID -> SHIPPED -> DELIVERED`, or `CANCELLED`. Currently, state is stored as a `String`, and scattered `if` statements check if an order can be cancelled (e.g., you cannot cancel a `DELIVERED` order). How do you refactor this using the State Design Pattern or smart Java Enums?
:::

```text
       E-COMMERCE ORDER STATE MACHINE
       
       ┌───────────┐         pay()         ┌───────────┐
       │  CREATED  │ ────────────────────▶ │   PAID    │
       └─────┬─────┘                       └─────┬─────┘
             │ cancel()                          │ ship()
             ▼                                   ▼
       ┌───────────┐                       ┌───────────┐
       │ CANCELLED │                       │  SHIPPED  │
       └───────────┘                       └─────┬─────┘
                                                 │ deliver()
                                                 ▼
                                           ┌───────────┐
                                           │ DELIVERED │ (Terminal state)
                                           └───────────┘
```

```java title="OrderStateTransition.java"
public enum OrderState {
    CREATED {
        @Override public OrderState pay() { return PAID; }
        @Override public OrderState cancel() { return CANCELLED; }
    },
    PAID {
        @Override public OrderState ship() { return SHIPPED; }
        @Override public OrderState cancel() { return CANCELLED; }
    },
    SHIPPED {
        @Override public OrderState deliver() { return DELIVERED; }
    },
    DELIVERED,
    CANCELLED;

    // Default: Disallow illegal transitions
    public OrderState pay() { throw illegal("pay"); }
    public OrderState ship() { throw illegal("ship"); }
    public OrderState deliver() { throw illegal("deliver"); }
    public OrderState cancel() { throw illegal("cancel"); }

    private IllegalStateException illegal(String action) {
        return new IllegalStateException("Cannot " + action + " an order in state: " + this);
    }
}
```

---

## 94. Resolving Diamond Conflict with Interface Default Methods

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** Your `SmartPhone` class implements both `Camera` and `Phone` interfaces. Both interfaces have a default method `powerSavingMode()`. The code refuses to compile. What are your exact options in Java to resolve this compilation error?
:::

```java title="DiamondConflictDisambiguation.java"
public interface Camera {
    default void powerSavingMode() {
        System.out.println("Camera: Low refresh rate, sensor power down");
    }
}

public interface Phone {
    default void powerSavingMode() {
        System.out.println("Phone: Throttle CPU, disable 5G radio");
    }
}

public class SmartPhone implements Camera, Phone {

    // Mandatory: Must override to resolve ambiguity
    @Override
    public void powerSavingMode() {
        // Option 1: Invoke specific interface default
        Camera.super.powerSavingMode();
        Phone.super.powerSavingMode();

        // Option 2: Provide complete custom implementation
        System.out.println("SmartPhone: Unified power down routine complete.");
    }
}
```

---

## 95. Protecting Sensitive Data in Logs: Masked String Representations

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** During a security audit, you discover that whenever an exception occurs and a `Customer` object is logged (`logger.error("Failed for " + customer)`), the customer's plaintext password and SSN are printed to Splunk via `toString()`. Especially if using Lombok `@ToString` or Java records, how do you prevent sensitive fields from leaking?
:::

```java title="MaskedCustomer.java"
public record CustomerRecord(String id, String email, String ssn, String passwordHash) {

    // Override canonical toString to mask sensitive PII
    @Override
    public String toString() {
        return "CustomerRecord[" +
            "id='" + id + '\'' +
            ", email='" + email + '\'' +
            ", ssn='***-**-" + (ssn != null && ssn.length() >= 4 ? ssn.substring(ssn.length() - 4) : "****") + '\'' +
            ", passwordHash='[PROTECTED]'" +
            ']';
    }
}
```

*Lombok Alternative*: Use `@ToString(exclude = {"ssn", "passwordHash"})` or annotate fields with `@ToString.Exclude`.

---

## 96. Decomposing the "God Page" Anti-Pattern in Test Automation

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** In a UI automation framework, every page class extends a 3,000-line `BasePage` class containing wait utilities, screenshot logic, database helpers, and Excel readers. Any change to `BasePage` risks breaking 100 test classes. How do you decompose this "God Class" into a clean OOP architecture?
:::

```text
   BEFORE: 3,000-Line BasePage God Class (Inheritance)
   BasePage (Contains wait, screenshot, database, Excel, assert...)
   └── LoginPage (Inherits all 3,000 lines!)

   AFTER: Composition & Single Responsibility Components
   ┌────────────────┐
   │   LoginPage    │ ──holds──▶ WaitService
   │                │ ──holds──▶ WebDriverActions
   └────────────────┘ ──holds──▶ ScreenshotService
```

```java title="DecomposedPageArchitecture.java"
public final class LoginPage {
    private final WebDriverActions actions;
    private final WaitService wait;

    // Composition: Only inject capabilities the Login Page actually uses
    public LoginPage(WebDriverActions actions, WaitService wait) {
        this.actions = actions;
        this.wait = wait;
    }

    public void login(String username, String password) {
        wait.untilVisible(By.id("username")).sendKeys(username);
        actions.click(By.id("submit"));
    }
}
```

---

## 97. Enforcing Invariants During Deserialization

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** You designed a `BankAccount` class where the constructor strictly validates that balance cannot be negative. However, a malicious client sends a crafted byte stream via Java Serialization with a negative balance, bypassing the constructor entirely. How does deserialization bypass constructors, and how do you enforce invariants during deserialization (or by using Java records)?
:::

### How Deserialization Bypasses Constructors
Standard Java Deserialization uses internal reflection (`ReflectionFactory.newConstructorForSerialization()`) to instantiate objects **without invoking the class's constructor**, allowing corrupted or malicious streams to populate invalid state.

### Solution 1: Implement `readObject()` Validation
```java title="ValidatedSerializable.java"
public class BankAccount implements Serializable {
    private static final long serialVersionUID = 1L;
    private double balance;

    private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
        ois.defaultReadObject(); // Reads state
        if (balance < 0.0) {     // Enforces invariant!
            throw new InvalidObjectException("Negative balance not permitted: " + balance);
        }
    }
}
```

### Solution 2: Modern Java Records (Gold Standard)
In modern Java, **records are guaranteed to deserialize through their canonical constructor**. Invariants validated in compact constructors can never be bypassed:
```java
public record BankAccount(String accountId, BigDecimal balance) {
    public BankAccount {
        if (balance.compareTo(BigDecimal.ZERO) < 0) throw new IllegalArgumentException("Negative balance");
    }
}
```

---

## 98. Polymorphic JSON Serialization in REST APIs

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** You have a REST endpoint returning a `List<Vehicle>`, where items at runtime are instances of `Car` (has `trunkCapacity`) and `Truck` (has `towingCapacity`). When serialized to JSON, only the base `Vehicle` fields appear, stripping out subclass-specific fields. Why does this happen, and how is polymorphic serialization configured in Java?
:::

### Why Subclass Fields Are Stripped
By default, JSON libraries like Jackson serialize an object based on the **static reference type** (`Vehicle`). If a method returns `List<Vehicle>`, Jackson only inspects `Vehicle` getter methods unless configured with polymorphic type information.

### The Solution: `@JsonTypeInfo` and `@JsonSubTypes`
```java title="PolymorphicVehicleModel.java"
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "vehicleType" // Injected discriminator property in JSON
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = Car.class, name = "CAR"),
    @JsonSubTypes.Type(value = Truck.class, name = "TRUCK")
})
public abstract class Vehicle {
    private final String vin;
    protected Vehicle(String vin) { this.vin = vin; }
    public String getVin() { return vin; }
}

public class Car extends Vehicle {
    private final int trunkCapacity;
    public Car(String vin, int trunkCapacity) { super(vin); this.trunkCapacity = trunkCapacity; }
    public int getTrunkCapacity() { return trunkCapacity; }
}

public class Truck extends Vehicle {
    private final int towingCapacity;
    public Truck(String vin, int towingCapacity) { super(vin); this.towingCapacity = towingCapacity; }
    public int getTowingCapacity() { return towingCapacity; }
}
```

---

## 99. Breaking Circular Dependencies Between Domain Services

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** Class `OrderService` depends on `CustomerService` in its constructor, and `CustomerService` depends on `OrderService` in its constructor. The application fails to start due to a circular dependency. From an OOP design perspective, what does this smell indicate, and how do you decouple them?
:::

```text
       CIRCULAR DEPENDENCY SMELL
       OrderService ──depends on──▶ CustomerService
            ▲                              │
            └──────────depends on──────────┘
```

### Architectural Solutions
1. **Event-Driven Asynchronous Decoupling**: Instead of calling `CustomerService` directly, `OrderService` publishes an `OrderCreatedEvent`. `CustomerService` listens via `@EventListener` or Kafka.
2. **Extract Mediator / Orchestrator**: Create a higher-level `CheckoutOrchestrator` that coordinates both services without them referencing each other.

```java title="EventDrivenDecoupling.java"
@Service
public class OrderService {
    private final ApplicationEventPublisher publisher;

    public OrderService(ApplicationEventPublisher publisher) {
        this.publisher = publisher; // No dependency on CustomerService!
    }

    public void completeOrder(Order order) {
        // Complete checkout
        publisher.publishEvent(new OrderCompletedEvent(order.id(), order.customerId()));
    }
}

@Service
public class CustomerService {
    @EventListener
    public void onOrderCompleted(OrderCompletedEvent event) {
        // Update customer loyalty points asynchronously
    }
}
```

---

## 100. Restricting Domain Subtypes with Sealed Interfaces

:::callout{type="info" title="Scenario Problem Statement"}
**Question:** You are building a financial ledger where a `Transaction` can only ever be a `Credit`, `Debit`, or `Refund`. You want the compiler to guarantee that no developer in another package can create a new subclass of `Transaction`, enabling exhaustive switch checks without a default branch. How do you model this in modern Java (Java 17+)?
:::

```java title="LedgerTransaction.java"
// Java 17+ Sealed Interface: Restricts subtypes across the entire JVM
public sealed interface Transaction 
    permits CreditTransaction, DebitTransaction, RefundTransaction {

    BigDecimal amount();
    String transactionId();
}

public final record CreditTransaction(String transactionId, BigDecimal amount) implements Transaction {}
public final record DebitTransaction(String transactionId, BigDecimal amount) implements Transaction {}
public final record RefundTransaction(String transactionId, BigDecimal amount, String originalTxId) implements Transaction {}

public class LedgerEngine {

    // Compiler guarantees all variants are handled; NO default branch needed!
    public void process(Transaction tx) {
        switch (tx) {
            case CreditTransaction c -> applyCredit(c.amount());
            case DebitTransaction d   -> applyDebit(d.amount());
            case RefundTransaction r  -> applyRefund(r.amount(), r.originalTxId());
        }
    }
}
```

---

## 101. Production Architectural Blueprint & System Design Checklist

| Scenario | Anti-Pattern | Staff-Level Architectural Solution |
| :--- | :--- | :--- |
| **Hash Collections** | Mutable keys (`emp.setDept()`) | Make keys immutable; use records or stable identity in `hashCode()`. |
| **Extensibility** | Fragile base classes (`extends HashSet`) | Favor composition via Forwarding Decorators. |
| **Business Logic** | 500-line `if-else` cascades | Strategy Pattern with Spring dependency collection maps. |
| **Immutability** | Constructor reference leaks | Defensive copies on both input and output (`List.copyOf`). |
| **Concurrency** | Lock-heavy configuration reads | `AtomicReference` with immutable snapshot objects. |
| **Domain Safety** | Open arbitrary subtyping | Java 17 Sealed Interfaces with exhaustive pattern matching. |
