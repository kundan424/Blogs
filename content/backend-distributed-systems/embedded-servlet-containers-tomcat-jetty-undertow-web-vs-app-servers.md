---
title: "Embedded Servlet Containers: Tomcat, Jetty & Undertow"
slug: embedded-servlet-containers-tomcat-jetty-undertow-web-vs-app-servers
subject: backend-distributed-systems
abstract: An architectural, first-principles deep dive into modern Java server runtimes. Demystify the structural and use-case paradigms separating Web Servers, Servlet Containers, and Application Servers. Discover why the embedded revolution rendered standalone WAR deployments obsolete, explore the internal threading models of Apache Tomcat, Eclipse Jetty, and Red Hat Undertow, and examine how Java 21 Virtual Threads (Project Loom) rewrite the server concurrency equation.
tags:
  - tomcat
  - jetty
  - undertow
  - servlet-containers
  - architecture
  - virtual-threads
  - spring-boot
  - java
published: true
publishDate: Nov 13, 2026
updatedDate: Nov 13, 2026
readTime: 22m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
---

# Embedded Servlet Containers: Tomcat, Jetty & Undertow

In our previous explorations of the Spring Boot 3 runtime ([What is Spring Boot?](/notes/what-is-spring-boot-opinionated-conventions-initializr-anatomy) and [Anatomy of @SpringBootApplication](/notes/anatomy-spring-boot-application-configuration-autoconfiguration-componentscan)), we saw how executing `SpringApplication.run(...)` seamlessly spins up an HTTP server on port `8080` in less than two seconds.

Yet, if you ask engineers what is actually listening on port `8080`, you will often hear terms used interchangeably:

> *"Is Tomcat a web server or an application server? Where does NGINX fit in? Why did Spring Boot choose Tomcat over Jetty or Undertow? And in a world of cloud-native microservices and Java 21 Virtual Threads, does your container choice even matter anymore?"*

To make informed architectural decisions, you must peel back the marketing jargon and understand the **underlying networking models, thread allocation strategies, and architectural boundaries** of Java server runtimes.

In this deep dive, we will explore:
1. The architectural taxonomy: **Web Server vs. Servlet Container vs. Application Server**.
2. The **Embedded Revolution** that inverted the Java enterprise deployment model.
3. The internal mechanics, thread architectures, and trade-offs of **Apache Tomcat**, **Eclipse Jetty**, and **Red Hat Undertow**.
4. How **Java 21 Virtual Threads (Project Loom)** fundamentally transform the container concurrency equation.

---

## 01. The Three Tiers: Web Server vs. Servlet Container vs. Application Server

Before comparing embedded containers, we must establish clear boundaries between three distinct categories of server software that are frequently conflated:

```
+--------------------------------------------------------------------------+
|                     THE THREE-TIER SERVER TAXONOMY                       |
+--------------------------------------------------------------------------+
|                                                                          |
|  TIER 1: Web Server (NGINX, Apache HTTPD)                                |
|  * Static files (HTML/CSS/Images), Reverse Proxy, TLS termination        |
|  * Event-driven C/C++ engine, zero knowledge of Java or JVM              |
|                                    |                                     |
|                                    v (HTTP Reverse Proxy)                |
|                                                                          |
|  TIER 2: Servlet Container / Web Container (Tomcat, Jetty, Undertow)     |
|  * Implements Jakarta Servlet Specification (jakarta.servlet)            |
|  * Translates raw HTTP TCP sockets into HttpServletRequest/Response      |
|  * Mounts Spring MVC DispatcherServlet; executes Java bytecode           |
|                                                                          |
|  TIER 3: Full Application Server (WebSphere, WebLogic, WildFly/JBoss)    |
|  * Implements complete Jakarta EE / Java EE enterprise stack             |
|  * Tier 2 (Servlets) + EJB, JTA distributed 2PC transactions, JMS, JNDI  |
|                                                                          |
+--------------------------------------------------------------------------+
```

### 1. Tier 1: Web Server (e.g., NGINX, Apache HTTP Server, Caddy)

A **Web Server** is an operating system process designed for ultra-high-speed static content delivery and TCP connection management. 

- **Primary Duties:** TLS/SSL certificate termination, HTTP/2 and HTTP/3 multiplexing, static file caching (images, JavaScript, CSS), gzip/brotli compression, rate limiting, and Layer-7 reverse proxy routing.
- **Java Awareness:** **Zero.** A pure web server does not contain a Java Virtual Machine (JVM). It cannot execute Java bytecode, does not understand Spring, and has no concept of what a "Servlet" is. It simply receives an incoming client request and passes raw bytes over a Unix socket or loopback TCP connection to an upstream application.

### 2. Tier 2: Servlet Container / Web Container (e.g., Apache Tomcat, Eclipse Jetty, Red Hat Undertow)

A **Servlet Container** is a Java runtime engine that implements the **Jakarta Servlet Specification** (formerly Java Servlet, package `jakarta.servlet` in Spring Boot 3).

- **Primary Duties:**
  1. Opens an OS network socket (e.g., `:8080`) and listens for incoming HTTP/1.1 or HTTP/2 connections.
  2. Parses the raw HTTP request stream into a strongly-typed Java object: `HttpServletRequest`.
  3. Prepares a response buffer: `HttpServletResponse`.
  4. Routes the request through a configured pipeline of `Filter`s and dispatches it to a `Servlet` (in Spring Boot, the `DispatcherServlet`).
  5. Manages servlet thread allocation, HTTP session state, and output stream flushing.
- **Scope:** It executes Java web components (Servlets, Filters, Listeners, WebSockets), but intentionally omits complex enterprise infrastructure like Enterprise JavaBeans (EJB) or distributed two-phase commit transaction managers.

### 3. Tier 3: Application Server (e.g., IBM WebSphere, Oracle WebLogic, WildFly / JBoss EAP, GlassFish)

An **Application Server** is an expansive, heavyweight enterprise platform that implements the **complete Jakarta EE (formerly Java EE) specification profile**.

In the 2000s and early 2010s, enterprise Java assumed that business software required a massive, centralized platform. A Full Application Server included:
- A built-in Servlet Container (for web traffic).
- An Enterprise JavaBeans (EJB) container (for distributed remoting via RMI/CORBA).
- A Java Transaction API (JTA) engine (for distributed two-phase commit transactions across multiple distinct databases).
- A built-in Java Message Service (JMS) message broker.
- A Java Naming and Directory Interface (JNDI) directory for looking up resources.
- Centralized administrator consoles, clustering agents, and complex proprietary classloaders.

---

### The Fall of the Monolithic Application Server

Why did enterprise software almost universally abandon Tier 3 Application Servers over the past decade?

| Architectural Dimension | Heavyweight Application Server (Legacy) | Cloud-Native Embedded Servlet Container (Modern) |
| :--- | :--- | :--- |
| **Deployment Unit** | Multiple `.war` / `.ear` archives deployed into one giant shared server process | **Self-contained Executable Fat JAR** (`java -jar`) containing its own server |
| **Process Boundary** | Shared JVM hosting 10–20 unrelated applications | **One Process Per Container** (1:1 mapping with Docker container) |
| **Clustering & Failover** | Proprietary app-server session replication & clustering | **Kubernetes / Cloud Load Balancers** managing stateless Pod replicas |
| **Transactions** | Heavyweight JTA Two-Phase Commit (2PC) coordinators | Event-driven Sagas, Outbox Pattern, local database transactions |
| **Startup Latency** | 3 to 15 minutes to boot the application server | **1 to 3 seconds** to boot embedded Tomcat / Undertow |
| **Memory Footprint** | 2 GB to 4 GB baseline RAM before running any code | **150 MB to 350 MB** total heap footprint |

In modern cloud architectures, **Kubernetes handles clustering, routing, scaling, and health monitoring**, while **Spring Boot provides the business frameworks**. The complex distributed services that Application Servers used to provide are now handled externally by cloud-native infrastructure (Kafka, PostgreSQL, Redis, Envoy, K8s). 

All your application needs from a Java runtime is a fast, lightweight **Servlet Container**.

---

## 02. The Embedded Revolution: Inverting the Deployment Model

Historically, the deployment model in Java enterprise was **server-centric**:

```
Traditional Model (Server Owns the Application):
OS Process -> [ Standalone Tomcat Server Process ] -> Loads /webapps/billing-service.war
```

You had to provision an operating system, install a JDK, download and install Apache Tomcat, configure `server.xml`, set environment variables, and copy your compiled `.war` file into the `/webapps` directory.

### The Inversion: Application Owns the Server

Spring Boot completely inverted this paradigm:

```
Modern Embedded Model (Application Owns the Server):
OS Process -> [ java -jar billing-service.jar ] -> In-process Embedded Tomcat Library
```

In an embedded architecture:
- Tomcat, Jetty, or Undertow is **not** an external server. It is simply a set of **JAR files on your classpath** (e.g. `tomcat-embed-core.jar`).
- Your application's `main()` method executes first.
- Spring Boot creates the `ApplicationContext`, instantiates your beans, and then programmatically constructs and starts the web server inside the same JVM process!

This design adheres strictly to the **Cloud-Native 12-Factor App Methodology (Factor VII: Port Binding)**: the application is completely self-contained and exports HTTP services by binding directly to a network port.

---

## 03. Apache Tomcat: The Battle-Tested Workhorse

Apache Tomcat is the **default embedded container** in Spring Boot (`spring-boot-starter-web`). It has been the backbone of Java web infrastructure for over twenty-five years.

```
+--------------------------------------------------------------------------+
|                  APACHE TOMCAT EMBEDDED NIO ARCHITECTURE                 |
+--------------------------------------------------------------------------+
|                                                                          |
|  Incoming HTTP Requests (OS Network Socket :8080)                        |
|                     |                                                    |
|                     v                                                    |
|  +--------------------------------------------------------------------+  |
|  | [ Acceptor Thread ]                                                |  |
|  | - Performs non-blocking TCP serverSocket.accept()                  |  |
|  | - Configures TCP socket options & hands channel to Poller         |  |
|  +--------------------------------------------------------------------+  |
|                     |                                                    |
|                     v                                                    |
|  +--------------------------------------------------------------------+  |
|  | [ Poller Thread (Java NIO Selector Loop) ]                         |  |
|  | - Uses OS epoll / kqueue to monitor sockets for READ events        |  |
|  | - When request bytes arrive, borrows a Worker Thread               |  |
|  +--------------------------------------------------------------------+  |
|                     |                                                    |
|                     v                                                    |
|  +--------------------------------------------------------------------+  |
|  | [ Worker Thread Pool (Standard Executor: max-threads = 200) ]      |  |
|  |                                                                    |  |
|  |  Thread 1: [ Parse HTTP ] -> [ Filter Chain ] -> [ DispatcherServlet]|
|  |  Thread 2: [ Parse HTTP ] -> [ Filter Chain ] -> [ DispatcherServlet]|
|  |  Thread 3: [ Idle in pool waiting for task queue ]                 |  |
|  +--------------------------------------------------------------------+  |
|                                                                          |
+--------------------------------------------------------------------------+
```

### How Tomcat NIO Processes an Incoming Request

Since Tomcat 8.5+, Tomcat's primary connector is the **NIO (Non-Blocking I/O) Connector**:

1. **Acceptor Thread:** A small, dedicated thread pool (typically 1 thread) that does nothing but loop on `serverSocket.accept()`. Its sole job is to accept incoming TCP handshakes from the operating system backlog.
2. **Poller Thread:** Uses a Java NIO `Selector` (backed by Linux `epoll` or macOS `kqueue`) to monitor hundreds or thousands of open TCP sockets simultaneously. It waits until request data actually arrives over the network wire.
3. **Worker Thread Pool (`max-threads`):** Once a socket has bytes ready to be parsed, the Poller thread allocates a **Worker Thread** from the pool. This worker thread parses the HTTP headers, creates `HttpServletRequest`, executes your Spring `@RestController`, waits for database queries to complete, writes the response bytes back to the socket, and returns itself to the pool.

### The Classic Limitation: Thread-Per-Request Blocking

In traditional Spring MVC with Tomcat, **one worker thread is tied up for the entire duration of each active HTTP request**.

If your default Tomcat worker pool has 200 threads, and each request makes a slow downstream database query or third-party API call taking 500 milliseconds:
- Your service can process at most:  
  $$\text{Throughput} = \frac{200 \text{ threads}}{0.5 \text{ seconds}} = 400 \text{ requests per second}$$
- If 201 concurrent requests arrive, the 201st request must wait in the operating system connection queue (`accept-count`). Once that queue fills up, Tomcat rejects incoming traffic with `Connection Refused`.

### Essential Production Tuning Properties

```properties
# Maximum number of worker threads allocated to execute requests (Default: 200)
server.tomcat.threads.max=200

# Minimum number of worker threads kept alive permanently (Default: 10)
server.tomcat.threads.min-spare=20

# Maximum queue length for incoming connection requests when all worker threads are busy (Default: 100)
server.tomcat.accept-count=100

# Maximum time the server will wait for request headers before closing the connection (Default: 20000ms / 20s)
server.tomcat.connection-timeout=20000

# Maximum size of the HTTP request header (Default: 8KB)
server.max-http-request-header-size=8KB
```

---

## 04. Eclipse Jetty: The Lightweight Async Maestro

[Eclipse Jetty](https://eclipse.dev/jetty/) was engineered from day one with a focus on **lightweight footprints, asynchronous I/O, and extreme embeddability**.

Jetty is historically famous for powering Google App Engine, Apache Hadoop, and Eclipse IDE internal runtimes.

```
+--------------------------------------------------------------------------+
|                     ECLIPSE JETTY THREADING ARCHITECTURE                 |
+--------------------------------------------------------------------------+
|                                                                          |
|  Incoming Connections                                                    |
|           |                                                              |
|           v                                                              |
|  [ QueuedThreadPool (QTP) ]                                              |
|  * Unified thread pool where threads dynamically switch roles:           |
|                                                                          |
|  +--------------------+    +--------------------+    +----------------+  |
|  | Acceptor Role      |    | Selector Role      |    | Execution Role |  |
|  | (Accepts TCP conns)|    | (Monitors epoll)   |    | (Runs Servlets)|  |
|  +--------------------+    +--------------------+    +----------------+  |
|                                                                          |
+--------------------------------------------------------------------------+
```

### Core Architectural Distinctions

1. **`QueuedThreadPool` (Eat-What-You-Kill Strategy):** Unlike Tomcat's rigid separation between Acceptor, Poller, and Worker thread pools, Jetty's `QueuedThreadPool` uses an adaptive scheduler where worker threads can temporarily transition between selecting I/O events and processing request tasks, minimizing CPU cache misses and thread context switches.
2. **WebSocket & Long-Polling Supremacy:** Jetty was designed around asynchronous HTTP and WebSockets. If an application maintains 50,000 persistent, idle WebSocket or Server-Sent Event (SSE) connections, Jetty uses significantly less memory per connection than Tomcat.
3. **Tiny Memory Footprint:** Jetty's minimal distribution footprint makes it popular in resource-constrained IoT gateways and edge microservices.

### How to Switch to Jetty in Spring Boot 3

In your `pom.xml`, exclude Tomcat and include the Jetty starter:

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <exclusions>
            <exclusion>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-tomcat</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jetty</artifactId>
    </dependency>
</dependencies>
```

---

## 05. Red Hat Undertow: The High-Throughput Non-Blocking Champion

Developed by Red Hat as the web engine for WildFly, [Undertow](https://undertow.io/) is a flexible, ultra-high-performance web server built on top of **JBoss XNIO**.

In independent TechEmpower web benchmarks, Undertow consistently ranks among the fastest JVM-based HTTP engines in raw throughput and response latency.

```
+--------------------------------------------------------------------------+
|                     RED HAT UNDERTOW XNIO ARCHITECTURE                   |
+--------------------------------------------------------------------------+
|                                                                          |
|  Incoming HTTP Requests                                                  |
|           |                                                              |
|           v                                                              |
|  +--------------------------------------------------------------------+  |
|  | [ Fixed XNIO I/O Selector Threads ]                                |  |
|  | - Sized strictly to CPU cores (e.g., 4 to 8 threads)               |  |
|  | - Performs non-blocking socket reads/writes; NEVER BLOCKS!         |  |
|  +--------------------------------------------------------------------+  |
|           |                                                              |
|           | (Hands off blocking request tasks)                           |
|           v                                                              |
|  +--------------------------------------------------------------------+  |
|  | [ Undertow Worker Task Thread Pool ]                               |  |
|  | - Sized to handle blocking business logic: CPU cores * 8 (or tuned)|  |
|  | - Executes Servlet Filter Chain and Spring Controller logic        |  |
|  +--------------------------------------------------------------------+  |
|                                                                          |
+--------------------------------------------------------------------------+
```

### Core Architectural Distinctions

1. **JBoss XNIO Foundation:** Undertow completely separates non-blocking network I/O from blocking task execution. Its I/O threads run in a tight event loop matching your hardware core count and **never perform blocking operations**.
2. **Handler Composition:** Internally, Undertow is built as a chain of small, composable handlers rather than a monolithic servlet container. The Jakarta Servlet container is just an optional handler sitting on top of its core non-blocking HTTP engine.
3. **Buffer Pools:** Undertow manages its own direct byte buffer pools off-heap, dramatically reducing JVM garbage collector pressure during high-throughput JSON processing.

### How to Switch to Undertow in Spring Boot 3

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <exclusions>
            <exclusion>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-tomcat</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-undertow</artifactId>
    </dependency>
</dependencies>
```

---

## 06. The Java 21 Virtual Threads Revolution (Project Loom)

For years, the debate over Tomcat vs. Jetty vs. Undertow centered on one painful trade-off:

> *"Tomcat's thread-per-request model is intuitive to write and debug, but blocks expensive operating system threads. Non-blocking reactive servers (Netty, WebFlux) handle massive scale, but force you to rewrite code using complex reactive streams (Mono/Flux) and break standard thread locals."*

In **Java 21 and Spring Boot 3.2+**, **Virtual Threads (Project Loom)** completely dissolved this dilemma.

```
+--------------------------------------------------------------------------+
|                  TOMCAT WITH JAVA 21 VIRTUAL THREADS                     |
+--------------------------------------------------------------------------+
|                                                                          |
|  Traditional Tomcat (Platform OS Threads):                               |
|  1 HTTP Request = 1 Heavy OS Kernel Thread (200 threads maximum)         |
|  [ Thread Blocks on SQL query ] ===> OS thread sits idle, consuming 1MB  |
|                                                                          |
|  Spring Boot 3 + Java 21 Virtual Threads:                                |
|  1 HTTP Request = 1 Lightweight Virtual Thread (Millions possible)       |
|  [ Virtual Thread Blocks on SQL ] ===> Unmounted from OS carrier thread! |
|                                        Carrier thread serves other tasks!|
|                                                                          |
+--------------------------------------------------------------------------+
```

### The 1-Line Configuration

In Spring Boot 3.2+ running on Java 21, you enable Virtual Threads with a single configuration property:

```properties
spring.threads.virtual.enabled=true
```

### What Happens Under the Hood?

When this property is enabled:
1. Spring Boot configures embedded Apache Tomcat to use a **Virtual Thread Executor** instead of its standard 200-thread OS pool.
2. For every incoming HTTP request, Tomcat spawns a brand-new **Virtual Thread**.
3. When your code performs a blocking I/O operation (like executing a SQL query with JDBC or calling an external REST API with `RestClient`), the JVM **unmounts the virtual thread from the underlying OS carrier thread**.
4. The OS carrier thread immediately processes other incoming HTTP requests! When the database query finishes, the JVM remounts the virtual thread on any available carrier thread and resumes execution.

> [!IMPORTANT]
> **Architectural Paradigm Shift:** With Java 21 Virtual Threads enabled, **Apache Tomcat can easily serve 50,000+ concurrent blocking requests** without running out of threads or rejecting connections, matching the scalability of non-blocking reactive servers while retaining straightforward, synchronous Spring MVC code!

---

## 07. Container Architectural Decision Matrix

Use this matrix to select the optimal container for your production workloads:

| Architectural Metric | Apache Tomcat *(Default)* | Eclipse Jetty | Red Hat Undertow |
| :--- | :--- | :--- | :--- |
| **Spring Boot Starter** | `spring-boot-starter-tomcat` | `spring-boot-starter-jetty` | `spring-boot-starter-undertow` |
| **Default Worker Threads** | 200 (OS Platform Threads) | Dynamic (QueuedThreadPool) | CPU Cores $\times$ 8 |
| **Base Memory Overhead** | Moderate (~40 MB container heap) | Low (~25 MB container heap) | Very Low (~20 MB container heap) |
| **Raw JSON Throughput** | Very High | High | **Exceptional** (Top Tier) |
| **WebSocket Scalability** | Good | **Outstanding** | Excellent |
| **Non-Blocking Architecture** | Java NIO Connector | Async QTP Schedulers | JBoss XNIO Core Engine |
| **Virtual Thread Support** | **First-Class** (Spring Boot 3) | **First-Class** (Spring Boot 3) | Supported |
| **Enterprise Adoption** | Industry Standard (~80% share) | Widespread in Cloud/Edge (~8%)| Widespread in FinTech (~12%) |

---

## 08. Production Checklist & Summary

When architecting Spring Boot web runtimes, apply these battle-tested rules of thumb:

1. **Stick with Apache Tomcat for 90% of enterprise workloads.**
   - Tomcat is the primary target tested by the Spring engineering team. It has the most extensive community documentation, bulletproof stability, and seamless monitoring integration.
2. **Enable Java 21 Virtual Threads before switching containers.**
   - If your service is suffering from thread pool exhaustion (`server.tomcat.threads.max` saturation) due to slow blocking database or microservice calls, simply set `spring.threads.virtual.enabled=true` on Java 21 before considering container rewrites or reactive refactoring.
3. **Choose Red Hat Undertow for ultra-high-throughput, low-latency microservices.**
   - If you are building high-volume payment routing or telemetry ingestion pipelines where shaving every millisecond and byte of memory matters, Undertow delivers best-in-class performance.
4. **Choose Eclipse Jetty for long-lived WebSocket or IoT gateways.**
   - Jetty's asynchronous event handling and memory efficiency per idle connection excel in chat systems, real-time collaboration dashboards, and edge device clusters.
5. **Always put a Layer-7 Web Server (NGINX/Cloudflare/Envoy) in front of your container.**
   - Never expose your embedded container directly to public internet traffic. Let NGINX, AWS ALB, or Envoy handle public TLS termination, DDoS mitigation, and HTTP connection buffering.

---

## 09. Authoritative References & Further Reading

For deeper study and official architectural specifications, explore these standard documentation links:

- [Spring Boot Official Documentation: Embedded Web Servers](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.servlet.embedded-container)  
  *The authoritative guide on configuring and switching embedded servlet containers in Spring Boot.*
- [Apache Tomcat Official Documentation: The HTTP Connector](https://tomcat.apache.org/tomcat-10.1-doc/config/http.html)  
  *Detailed specification of Tomcat NIO Connector, Acceptor/Poller threads, and pool tuning.*
- [Eclipse Jetty Official Documentation: Architecture Overview](https://eclipse.dev/jetty/documentation/jetty-12/programming-guide/index.html)  
  *Comprehensive guide to Jetty's QueuedThreadPool and asynchronous handler pipelines.*
- [Red Hat Undertow Official Documentation: Architecture & Handlers](https://undertow.io/undertow-docs/undertow-docs-2.1.0/index.html)  
  *Deep dive into JBoss XNIO non-blocking networking and Undertow handler composition.*
- [Spring Boot Official Documentation: Virtual Threads (Java 21)](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.spring-application.virtual-threads)  
  *Official reference on configuring Project Loom Virtual Threads with embedded containers.*
