---
title: "Spring Boot CLI & Command-Line Operations: Maven Wrapper, Launch Arguments & Layertools"
slug: spring-boot-cli-command-line-operations-maven-wrapper-launch-arguments-layertools
subject: backend-distributed-systems
abstract: A comprehensive, mentor-led reference and architectural guide to mastering Spring Boot command-line operations. Discover how the Maven Wrapper (./mvnw) standardizes team builds, how the Spring Boot plugin executes applications locally with profiles and JVM arguments, how to bootstrap projects from the terminal via cURL, how Cloud Native Buildpacks generate container images with zero Dockerfiles, and how Layertools extracts optimized layers for high-speed Docker caching.
tags:
  - spring-boot
  - cli
  - maven-wrapper
  - layertools
  - devops
  - terminal
  - spring-boot-3
published: true
publishDate: Nov 19, 2026
updatedDate: Nov 19, 2026
readTime: 22m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
---

# Spring Boot CLI & Command-Line Operations: Maven Wrapper, Launch Arguments & Layertools

When learning Spring Boot, most developers interact with their application through an Integrated Development Environment (IDE) like IntelliJ IDEA, Eclipse, or VS Code. You click the green "Play" button, and the application starts.

However, in professional enterprise engineering, **production environments do not have IDEs**.

Your CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins), your cloud virtual machines, your Docker multi-stage builds, and your Kubernetes pods all interact with Spring Boot through the **Command-Line Interface (CLI)**.

If you cannot configure, profile, package, inspect, debug, and optimize a Spring Boot application from the terminal, you cannot maintain software in production:
- How does the **Maven Wrapper (`./mvnw`)** guarantee deterministic, zero-install builds across entire engineering teams and automated pipelines?
- How do you override application profiles, server ports, and JVM garbage collection flags directly from the terminal without modifying configuration files?
- How can you bootstrap a complete, production-ready Spring Boot microservice directly from your terminal using a single **`curl`** command?
- How does **`./mvnw spring-boot:build-image`** compile OCI Docker images with **zero Dockerfiles** using Cloud Native Buildpacks?
- What is **`Layertools`**, and how does `java -Djarmode=tools -jar app.jar extract` slash container build times from minutes to seconds?

In this lesson, we will deconstruct the complete catalog of Spring Boot command-line operations. We will examine how each command works under the hood, analyze execution lifecycles, and build a production-grade terminal mastery toolkit.

---

## 01. The Five Command-Line Domains of Spring Boot

Command-line operations in Spring Boot span five functional domains across the software development lifecycle:

```
+--------------------------------------------------------------------------------------------------+
|                            SPRING BOOT CLI OPERATIONAL DOMAINS                                   |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   1. PROJECT BOOTSTRAPPING (start.spring.io & CLI)                                               |
|   ────────────────────────────────────────────────                                               |
|   `curl https://start.spring.io/starter.zip ...`                                                 |
|   • Generates fresh projects directly from the terminal without opening a web browser.           |
|                                                                                                  |
|   2. LOCAL RUNTIME & PROFILING (./mvnw spring-boot:run)                                          |
|   ─────────────────────────────────────────────────                                              |
|   `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev ...`                                    |
|   • Compiles in-memory, mounts classpath, attaches debuggers, and launches embedded Tomcat.      |
|                                                                                                  |
|   3. PACKAGING & ARTIFACT GENERATION (./mvnw clean package)                                      |
|   ─────────────────────────────────────────────────────────                                      |
|   `./mvnw clean package` & `./mvnw dependency:tree`                                              |
|   • Repackages classes into an executable Fat JAR and resolves transitive dependency trees.      |
|                                                                                                  |
|   4. PRODUCTION CONTAINER BUILDPACKS (./mvnw spring-boot:build-image)                            |
|   ───────────────────────────────────────────────────────────────────                            |
|   `./mvnw spring-boot:build-image`                                                               |
|   • Generates standardized, secure OCI Docker images without authoring a Dockerfile.             |
|                                                                                                  |
|   5. RUNTIME EXECUTION & LAYER EXTRACTION (java -jar & Layertools)                               |
|   ────────────────────────────────────────────────────────────────                               |
|   `java -jar target/app.jar` & `java -Djarmode=tools -jar app.jar extract`                       |
|   • Tunes JVM heap/GC settings and splits JARs into cached layers for high-speed container builds.|
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

---

## 02. Domain 1: Terminal-First Project Bootstrapping via cURL

### Scenario: Bootstrapping a Microservice on a Remote Server
Imagine you are working in a remote Linux terminal, a cloud jump box, or an automated setup script. You need to scaffold a new microservice named `order-service` with Java 21, Spring Web, Spring Data JPA, Actuator, and PostgreSQL driver.

Instead of switching to a desktop browser to navigate `start.spring.io`, you can generate and unpack the entire project directly from your terminal using **`curl`**.

### The Command Walkthrough
Before running the command, understand the query parameters accepted by the Spring Initializr API:
- `dependencies`: Comma-separated list of starter IDs (`web`, `data-jpa`, `postgresql`, `actuator`).
- `type`: Build tool choice (`maven-project` or `gradle-project`).
- `javaVersion`: Target JVM version (`21`, `17`).
- `bootVersion`: Target Spring Boot version (e.g., `3.4.0`).
- `baseDir`: The folder name inside the zip archive.

```bash
# Execute in terminal:
curl https://start.spring.io/starter.zip \
  -d dependencies=web,data-jpa,postgresql,actuator \
  -d type=maven-project \
  -d javaVersion=21 \
  -d bootVersion=3.4.0 \
  -d groupId=com.example \
  -d artifactId=order-service \
  -d name=order-service \
  -d baseDir=order-service \
  -o order-service.zip && \
unzip order-service.zip && \
rm order-service.zip && \
cd order-service
```

### How it Works Under the Hood
1. `curl` sends an HTTP `POST` request to `start.spring.io`.
2. The Spring Initializr backend dynamically compiles the `pom.xml`, generates the standard directory structure (`src/main/java`, `src/main/resources`), bundles the Maven Wrapper binaries (`mvnw`, `mvnw.cmd`, `.mvn/`), and streams a compressed ZIP archive back to your terminal.
3. The piped `unzip` command extracts the project, immediately ready for compilation without requiring Maven to be pre-installed on your system!

---

## 03. Domain 2: Local Execution via the Maven Wrapper (`./mvnw`)

### What is the Maven Wrapper?
The **Maven Wrapper** consists of small scripts (`./mvnw` for Linux/macOS and `mvnw.cmd` for Windows) committed directly into your Git repository.

When you execute `./mvnw`, the wrapper checks if the exact version of Maven declared in `.mvn/wrapper/maven-wrapper.properties` exists locally on your machine:
- If present, it executes it immediately.
- If missing, it downloads the exact Maven distribution from the Apache mirrors, stores it in `~/.m2/wrapper/dists/`, and executes the build.

This eliminates the classic *"works on my machine"* syndrome: every developer and every CI pipeline runs on the exact same Maven runtime.

```
+--------------------------------------------------------------------------------------------------+
|                            HOW ./mvnw spring-boot:run OPERATES                                   |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   1. Developer runs: `./mvnw spring-boot:run`                                                    |
|                                                                                                  |
|   2. Wrapper verifies Maven runtime in `~/.m2/wrapper/`.                                         |
|                                                                                                  |
|   3. Compiles Java source files to `target/classes`.                                             |
|                                                                                                  |
|   4. Assembles runtime classpath: `target/classes` + all downloaded dependency JARs.             |
|                                                                                                  |
|   5. Inspects compiled classes to discover the class containing `@SpringBootApplication`.        |
|                                                                                                  |
|   6. Forks a child JVM process and executes `OrderApplication.main(args)`.                       |
|                                                                                                  |
|   7. Embedded Tomcat starts on port 8080 and begins listening for HTTP requests.                 |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

### Scenario A: Running the Application Locally
To launch the application from the project root:

```bash
# Linux / macOS:
./mvnw spring-boot:run

# Windows PowerShell:
.\mvnw spring-boot:run
```

---

### Scenario B: Activating Environment Profiles from Terminal
Suppose your project defines `application.yml` (default) and `application-dev.yml` (which enables local database connections and detailed SQL logging).

To run locally with the `dev` profile active, pass the `-Dspring-boot.run.profiles` system property to the Maven plugin:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

You can activate multiple comma-separated profiles simultaneously:
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev,local-metrics
```

---

### Scenario C: Overriding Configuration Properties Directly
Suppose port `8080` is already in use by another application, or you need to test with Actuator endpoints exposed without editing `application.yml`.

Pass program arguments using `-Dspring-boot.run.arguments`:

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=9090 --management.endpoints.web.exposure.include=health,info,metrics"
```

How it works: The plugin passes `--server.port=9090` directly into `String[] args` of your `main` method. Because command-line arguments have the highest precedence in Spring Boot's configuration hierarchy, they override any port defined in `application.yml`.

---

### Scenario D: Tuning JVM Heap Memory & Garbage Collection
To test how your microservice behaves under realistic container memory constraints (e.g., 512MB RAM with the Z Garbage Collector):

```bash
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xmx512m -Xms512m -XX:+UseZGC"
```

---

### Scenario E: Remote Debugging from the Terminal
If you need to connect your IDE's remote debugger to an application running inside a terminal:

```bash
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
```
The JVM opens port `5005`, allowing any IDE debugger to attach and inspect live breakpoints.

---

### Gradle Equivalent Reference
If your team uses Gradle, the Gradle Wrapper (`./gradlew`) provides equivalent commands via `bootRun`:

```bash
# Standard run:
./gradlew bootRun

# Passing active profiles:
./gradlew bootRun --args='--spring.profiles.active=dev'

# Overriding port:
./gradlew bootRun --args='--server.port=9090'

# Passing JVM memory limits:
./gradlew bootRun --jvmArgs='-Xmx512m -XX:+UseZGC'
```

---

## 04. Domain 3: Packaging, Verification & Dependency Diagnostics

### Scenario: Packaging for Production Deployment
When building an artifact for production, we do not use `spring-boot:run`. We package an **Executable Fat JAR**:

```bash
# Standard production build (compiles, runs tests, and packages):
./mvnw clean package

# Fast packaging (skipping test execution for quick local verification):
./mvnw clean package -DskipTests
```

### What `spring-boot-maven-plugin` Does Under the Hood
1. Maven compiles your code into `target/order-service-1.0.0.jar`.
2. The `spring-boot-maven-plugin` executes its `repackage` goal.
3. It renames the original thin JAR to `order-service-1.0.0.jar.original`.
4. It creates a brand-new **Executable Fat JAR** containing:
   - Your compiled code under `BOOT-INF/classes/`.
   - All third-party library JARs under `BOOT-INF/lib/`.
   - The Spring Boot custom class loader under `org/springframework/boot/loader/`.
   - The manifest file pointing to `org.springframework.boot.loader.launch.JarLauncher`.

---

### Scenario: Diagnosing Dependency Hell with `dependency:tree`
One of the most valuable terminal skills is identifying where an unwanted library version or conflicting JAR originated.

Suppose your application encounters a `NoSuchMethodError` in Jackson, or a vulnerability scanner flags a vulnerable library.

To inspect the full dependency graph:

```bash
# Print the entire transitive dependency tree:
./mvnw dependency:tree

# Filter the tree specifically for Jackson dependencies:
./mvnw dependency:tree -Dincludes=com.fasterxml.jackson.core:*
```

The terminal prints a clear hierarchy showing exactly which starter introduced the dependency:

```text
[INFO] com.example:order-service:jar:1.0.0
[INFO] +- org.springframework.boot:spring-boot-starter-web:jar:3.4.0:compile
[INFO] |  +- org.springframework.boot:spring-boot-starter-json:jar:3.4.0:compile
[INFO] |  |  +- com.fasterxml.jackson.core:jackson-databind:jar:2.18.1:compile
[INFO] |  |  |  +- com.fasterxml.jackson.core:jackson-annotations:jar:2.18.1:compile
[INFO] |  |  |  \- com.fasterxml.jackson.core:jackson-core:jar:2.18.1:compile
```

---

## 05. Domain 4: Cloud Native Container Building (Zero Dockerfile)

### Scenario: Building OCI Container Images Without Writing a Dockerfile
Traditionally, deploying Spring Boot to Docker or Kubernetes required writing a custom `Dockerfile`. Developers frequently got it wrong: using bloated base images, running as root, and missing JVM memory limits.

Spring Boot natively integrates with **Cloud Native Buildpacks (CNB)**, allowing you to compile a production-ready, highly secure OCI Docker image directly from the command line with **no Dockerfile whatsoever**:

```bash
# Build a local Docker image using Paketo Cloud Native Buildpacks:
./mvnw spring-boot:build-image

# Specifying a custom image name and registry tag:
./mvnw spring-boot:build-image -Dspring-boot.build-image.imageName=registry.example.com/order-service:1.0.0
```

```
+--------------------------------------------------------------------------------------------------+
|                        HOW spring-boot:build-image OPERATES                                      |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   1. Communicates with the local Docker daemon socket (`/var/run/docker.sock`).                  |
|                                                                                                  |
|   2. Downloads the official Paketo Buildpacks builder image.                                     |
|                                                                                                  |
|   3. Detects Java 21 and automatically provisions a hardened, minimal Linux OS image             |
|      (Ubuntu or Distroless) and an optimized Eclipse Temurin JRE.                                |
|                                                                                                  |
|   4. Configures a non-root system user for security compliance.                                  |
|                                                                                                  |
|   5. Automatically injects the JVM memory calculator (prevents Kubernetes OOMKilled crashes).    |
|                                                                                                  |
|   6. Outputs a standardized OCI image directly into your local Docker registry!                  |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

To run your freshly built container image:
```bash
docker run -p 8080:8080 registry.example.com/order-service:1.0.0
```

---

## 06. Domain 5: Production Execution with `java -jar`

Once an application is packaged into `target/order-service.jar`, it runs in production via the standard JVM `java` command.

### The Anatomy of the `java` Launch Command
Understanding parameter placement on the command line is critical. The position of an argument relative to `-jar` determines how the JVM interprets it:

```
+--------------------------------------------------------------------------------------------------+
|                                 ANATOMY OF THE JVM LAUNCH COMMAND                                |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   java  -Xmx1g -XX:+UseZGC  -Dspring.profiles.active=prod  -jar app.jar  --server.port=8080      |
|   └──┬┘ └────────┬────────┘ └──────────────┬─────────────┘ └──┬─── └──┬──┘ └─────────┬─────────┘  |
|      │           │                         │                  │       │               │          |
|     JVM      JVM Flags             System Properties       Execute  Target         Program       |
|    Binary  (Memory & GC)         (Interpreted by JVM)       Jar    Archive        Arguments      |
|                                                                             (Interpreted by      |
|                                                                               Spring Boot)       |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

### 1. Standard Production Launch
```bash
java -jar target/order-service-1.0.0.jar
```

### 2. Passing the Production Profile
```bash
java -Dspring.profiles.active=prod -jar target/order-service-1.0.0.jar
```

### 3. Container-Aware Memory & Modern GC Flags
When running inside a Kubernetes pod with a memory limit (e.g., 2GB RAM):
```bash
java -XX:+UseContainerSupport \
     -XX:MaxRAMPercentage=75.0 \
     -XX:+UseZGC \
     -jar target/order-service-1.0.0.jar
```
- `-XX:+UseContainerSupport`: Instructs the JVM to read cgroup limits instead of physical host RAM.
- `-XX:MaxRAMPercentage=75.0`: Dynamically allocates 75% of the container's memory limit to the Java Heap, leaving 25% for Metaspace and thread stacks.
- `-XX:+UseZGC`: Enables the low-latency Z Garbage Collector for sub-millisecond pauses.

### 4. Overriding Database Credentials via Command-Line Flags
In automated deployment scripts:
```bash
java -jar target/order-service-1.0.0.jar \
  --server.port=8080 \
  --spring.datasource.url=jdbc:postgresql://db.prod.internal:5432/orders \
  --spring.datasource.username=order_admin \
  --spring.datasource.password=super_secret_vault_token
```

### 5. Loading External Configuration Files
To load an external configuration file mounted from a Kubernetes Secret or ConfigMap:
```bash
java -jar target/order-service-1.0.0.jar \
  --spring.config.additional-location=file:/etc/secrets/application-secrets.yml
```

---

## 07. Domain 6: Container Optimization via Layertools

### The Problem with Traditional Docker Builds
In a naive Dockerfile:
```dockerfile
# UNOPTIMIZED DOCKERFILE
FROM eclipse-temurin:21-jre
COPY target/order-service.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

When you change a single line of Java code:
- Your application classes change (about 200 KB).
- But because the entire `order-service.jar` (80 MB) is copied in a single layer, Docker's cache is completely invalidated!
- Every build re-uploads the entire 80 MB JAR across your network to Amazon ECR or Docker Hub.

### The Solution: Spring Boot Layertools
Spring Boot allows an executable JAR to be queried and extracted into discrete layers based on change frequency:

```
+--------------------------------------------------------------------------------------------------+
|                                    JAR LAYER TAXONOMY                                            |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   LAYER NAME               CONTENTS                        CHANGE FREQUENCY     CACHE BENEFIT    |
|   ───────────────────────  ──────────────────────────────  ───────────────────  ──────────────── |
|   dependencies             Third-party library JARs        Rarely changes       CACHED FOREVER   |
|   spring-boot-loader       JarLauncher & loader classes    Almost never changes CACHED FOREVER   |
|   snapshot-dependencies    Internal team snapshot libs     Occasionally changes REBUILT AS NEEDED|
|   application              Your compiled business classes  CHANGES EVERY COMMIT REBUILT (200 KB) |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

### Step 1: Inspecting Layers from the Terminal
In Spring Boot 3.3+:
```bash
java -Djarmode=tools -jar target/order-service-1.0.0.jar list-layers
```
*(In Spring Boot 3.0–3.2, use `-Djarmode=layertools`)*

The terminal outputs:
```text
dependencies
spring-boot-loader
snapshot-dependencies
application
```

### Step 2: Extracting Layers
To extract the layers into a destination directory:
```bash
java -Djarmode=tools -jar target/order-service-1.0.0.jar extract --destination extracted/
```

Inside `extracted/`, you now have four separate folders:
```text
extracted/
├── dependencies/
├── spring-boot-loader/
├── snapshot-dependencies/
└── application/
```

### Step 3: The Production Multi-Stage Layered Dockerfile
Here is how you use Layertools in a production multi-stage Docker build:

```dockerfile
# Stage 1: Extract layers using Layertools
FROM eclipse-temurin:21-jre-jammy AS builder
WORKDIR /builder
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
RUN java -Djarmode=tools -jar app.jar extract --destination extracted

# Stage 2: Minimal, secure runtime image
FROM eclipse-temurin:21-jre-jammy
WORKDIR /application

# Create unprivileged non-root user for security
RUN useradd -u 10001 springboot && chown -R springboot:springboot /application
USER springboot

# Copy layers in order of least-frequent to most-frequent changes:
COPY --from=builder /builder/extracted/dependencies/ ./
COPY --from=builder /builder/extracted/spring-boot-loader/ ./
COPY --from=builder /builder/extracted/snapshot-dependencies/ ./
COPY --from=builder /builder/extracted/application/ ./

# Launch using Spring's JarLauncher (optimized zero-unpack startup)
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
```

### The Production Result
When you push a code change:
- Docker recognizes that `dependencies` (75 MB) and `spring-boot-loader` (500 KB) are identical.
- Docker uses the existing cached layers instantly!
- Only the `application/` layer (200 KB) is rebuilt and uploaded.
- **Docker image build and push time drops from 3 minutes to 4 seconds.**

---

## 08. Production Anti-Pattern Case Study: The 12-Minute Deployment Outage

### The Incident
A fast-growing fintech company maintained 45 microservices deployed to AWS EKS. During a critical production bug hotfix, the platform engineering lead triggered an emergency deployment.

Instead of deploying in under 2 minutes:
1. Every microservice's CI pipeline took **10 to 14 minutes** to complete.
2. The team had to wait over an hour for the full cluster deployment to finish.
3. During this window, customers experienced ongoing financial transaction errors.

### The Root Cause Analysis (RCA)
The team inspected their GitHub Actions CI workflow:
- The Dockerfile used standard `COPY target/*.jar app.jar`.
- The AWS ECR network pipe became completely saturated because 45 microservices were simultaneously attempting to push 90 MB Fat JAR layers over the internet.
- AWS ECR rate-limited the concurrent image layer uploads, stalling the deployment.

### The Remediation
1. The platform team refactored all Dockerfiles to use **Spring Boot Layertools multi-stage extraction**.
2. The heavy `dependencies/` layer was pushed once and cached permanently on the build runners.
3. Subsequent commits only built and pushed the 180 KB `application/` layer.

### The Result
- Docker image size pushed over the wire dropped by **99.7%** (from 90 MB to 180 KB).
- CI/CD build and push duration plummeted from **12 minutes** to **22 seconds**.
- Emergency hotfixes deployed in under 2 minutes.

---

## 09. Architectural Mental Map & Command Cheat Sheet

To keep every Spring Boot command-line operation accessible, use this reference mental map:

```
+==================================================================================================+
|                        SPRING BOOT COMMAND-LINE OPERATIONS CHEAT SHEET                           |
+==================================================================================================+
|                                                                                                  |
|   1. PROJECT GENERATION & BOOTSTRAPPING                                                          |
|   ──────────────────────────────────────────────────────────────────────────                     |
|   curl start.spring.io/starter.zip -d dependencies=web,data-jpa,postgresql -o app.zip            |
|   • Generates fresh project scaffolding directly from terminal.                                  |
|                                                                                                  |
|   2. LOCAL DEVELOPMENT RUNTIME                                                                   |
|   ──────────────────────────────────────────────────────────────────────────                     |
|   ./mvnw spring-boot:run                                                                         |
|   • Standard local run on port 8080.                                                             |
|                                                                                                  |
|   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev                                          |
|   • Activates environment-specific profiles.                                                     |
|                                                                                                  |
|   ./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=9090"                        |
|   • Overrides application properties with highest precedence.                                    |
|                                                                                                  |
|   ./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xmx512m -XX:+UseZGC"                   |
|   • Configures JVM heap memory and garbage collector.                                            |
|                                                                                                  |
|   3. PACKAGING & DIAGNOSTICS                                                                     |
|   ──────────────────────────────────────────────────────────────────────────                     |
|   ./mvnw clean package                                                                           |
|   • Compiles, tests, and packages executable Fat JAR.                                            |
|                                                                                                  |
|   ./mvnw dependency:tree -Dincludes=groupId:*                                                    |
|   • Isolates transitive library dependencies and resolves version conflicts.                     |
|                                                                                                  |
|   4. CLOUD NATIVE CONTAINER BUILDS                                                               |
|   ──────────────────────────────────────────────────────────────────────────                     |
|   ./mvnw spring-boot:build-image                                                                 |
|   • Compiles secure, minimal OCI Docker image with zero Dockerfile using Buildpacks.             |
|                                                                                                  |
|   5. PRODUCTION JVM RUNTIME & LAYER EXTRACTION                                                   |
|   ──────────────────────────────────────────────────────────────────────────                     |
|   java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -jar target/app.jar                    |
|   • Container-aware production JVM launch.                                                       |
|                                                                                                  |
|   java -Djarmode=tools -jar target/app.jar extract --destination extracted/                      |
|   • Extracts JAR into cached layers (dependencies, loader, application) for 10x Docker builds.   |
|                                                                                                  |
+==================================================================================================+
```

---

## 10. Authoritative References & Further Reading

For deeper study into Spring Boot build tools, CLI operations, and container optimization, consult these canonical resources:

* [Spring Boot Maven Plugin Official Documentation](https://docs.spring.io/spring-boot/docs/current/maven-plugin/reference/htmlsingle/) - Comprehensive guide to `run`, `repackage`, and `build-image` goals.
* [Spring Boot Reference: Packaging Layered Jars](https://docs.spring.io/spring-boot/reference/packaging/container-images/layered-jars.html) - Official specification on Layertools, layer extraction, and Docker caching.
* [Cloud Native Buildpacks (CNB) Specification](https://buildpacks.io/docs/) - Architectural standard behind Paketo Buildpacks and `spring-boot:build-image`.
* [Paketo Buildpacks for Java](https://paketo.io/docs/howto/java/) - Deep dive into how Paketo configures JREs, memory limits, and non-root users.
* [Spring Initializr API Reference](https://github.com/spring-io/initializr) - Full parameters and endpoints for generating projects via cURL and HTTP.
