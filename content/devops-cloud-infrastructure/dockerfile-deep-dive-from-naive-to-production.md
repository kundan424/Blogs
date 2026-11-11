---
title: "A Deep-Dive Guide to Writing Dockerfiles"
slug: dockerfile-deep-dive-from-naive-to-production
subject: devops-cloud-infrastructure
abstract: "A progressive engineering tutorial on Dockerfiles: from understanding the mental model (Dockerfile vs. Image vs. Container), through writing a naive single-stage build, to engineering a hardened multi-stage production image with layer caching, non-root users, healthchecks, and build-time vs. run-time configuration."
tags:
  - docker
  - dockerfile
  - devops
  - containers
  - spring-boot
  - cloud-infrastructure
published: true
publishDate: Nov 09, 2026
updatedDate: Nov 09, 2026
readTime: 38m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
---

# From Fat JAR to Production Container: A Deep-Dive Guide to Writing Dockerfiles

A progressive engineering tutorial on Dockerfiles: from understanding the mental model (Dockerfile vs. Image vs. Container), through writing a naive single-stage build, to engineering a hardened multi-stage production image with layer caching, non-root users, healthchecks, and build-time vs. run-time configuration.

---

## 01. The Deployment Problem: Why Dockerfiles Exist

Every backend engineer eventually experiences the exact same deployment horror story.

Your REST API passes every single unit and integration test on your local workstation. You execute `./mvnw clean package`, take the resulting compiled `.jar` file, and copy it over `scp` to a freshly provisioned cloud virtual machine. You SSH into the server, start the process with `java -jar`, and your application immediately crashes on boot.

Maybe the production server had OpenJDK 17 installed by default while your code relies on Java 21 virtual threads (`UnsupportedClassVersionError: 65.0`). Maybe an operating-system-level C library (`glibc` or `musl`) differs between your macOS/Windows developer workstation and the cloud Ubuntu host. Or even worse: you are attempting to run two microservices on the exact same host, and they require conflicting system libraries or fight over the same OS resources.

### The Old Way: "Snowflake Servers" and Manual Provisioning

Before containerization became the standard operating model across software engineering, deploying an application meant managing the **host operating system directly**. To get a single backend service running in production, you were forced to:

1. **SSH into a bare-metal server or VM** (`ssh ubuntu@203.0.113.10`) and manually run OS package managers (`apt update && apt install openjdk-21-jre-headless`).
2. **Transfer build artifacts over the network** via `scp` or `rsync` into directories like `/var/www/app/`.
3. **Write custom OS process supervisor scripts** (`/etc/systemd/system/app.service`) so the Linux `systemd` init system would keep the process alive in the background and restart it on failure.
4. **Maintain configuration drift** across staging and production machines by manually editing `.env` files and system environment variables on each individual server.

Over months of hotfixes, security patches, and emergency configuration edits, these servers inevitably transformed into **"Snowflake Servers"**—unique, fragile environments that could not be reliably reproduced. If traffic surged during a product launch and you needed five new instances behind your cloud load balancer, nobody on the team could guarantee that the new VMs would match the first one byte-for-byte.

![The Paradigm Shift: Manual VM Deployment vs. Declarative Dockerfile](/images/content/devops-cloud-infrastructure/docker/devops-cloud-infrastructure_docker_mod-01_lesson-1.3_manual-vs-container-deployment.svg)

---

### Enter the `Dockerfile`: Environment as Code

Instead of shipping *just* your application artifact (`app.jar`) and hoping that the destination server is configured identically to your local machine, Docker flips the paradigm: **you ship the entire runtime environment alongside your application code.**

At the center of this workflow is the **`Dockerfile`**—a plain-text, version-controlled manifest that lives directly in the root of your Git repository. It acts as an automated assembly receipt that declares to the Docker Engine:

* **What minimal OS and runtime foundation to start from** (e.g., Alpine Linux pre-installed with Eclipse Temurin JRE 21).
* **How to compile your source code and cache third-party dependencies** inside an isolated sandbox.
* **Which exact network port and unprivileged system user** the process should utilize at runtime.
* **What startup command** (`ENTRYPOINT`) should execute when the container boots.

| Engineering Dimension | Without a Dockerfile (Manual Host VM) | With a Dockerfile (Containerized) |
| :--- | :--- | :--- |
| **Environment Setup** | Manual, undocumented CLI commands (`apt install`) executed over SSH. | Declarative instructions (`FROM`, `RUN`, `COPY`) tracked in Git commits. |
| **Runtime Consistency** | Vulnerable to OS/JDK drift between developer laptops and cloud servers. | 100% byte-for-byte immutable across Local, CI/CD, and Production. |
| **Multi-App Isolation** | Shared libraries and conflicting port bindings collide on the host. | Each container gets its own isolated filesystem, PID, and network namespace. |
| **Scaling & Rollbacks** | Provisioning a new VM or reverting a failed JAR takes hours. | Spin up 10 replicas or roll back to a previous image tag in milliseconds. |

### What You Will Learn in This Guide

In this tutorial, we will avoid dumping a dry, disconnected glossary of instructions. Instead, we follow an architectural **"Problem → Mental Model → Naive Implementation → Production Optimization"** engineering arc using a **Spring Boot REST API (`url-shortener-api`)** as our running practical example:

1. **The Core Mental Model:** Demystifying the fundamental triad: `Dockerfile` vs. `Docker Image` vs. `Docker Container`.
2. **Version 1 (The Naive Dockerfile):** Writing our first working single-stage Dockerfile and breaking down `FROM`, `WORKDIR`, `COPY`, `EXPOSE`, and `ENTRYPOINT`.
3. **Under the Hood of Layers & Caching:** How the Union File System (`OverlayFS`) works and why instruction order cuts build times from 3 minutes to 2 seconds.
4. **Version 2 (The Production Multi-Stage Refactor):** Slashing an **800 MB** bloated image down to a hardened, non-root **175 MB** production container.
5. **Runtime Configuration & Probes:** Injecting dynamic environment configuration (`ARG` vs. `ENV`) and setting up automated healthchecks.
6. **Anti-Patterns Cheat Sheet:** Real-world pitfalls and staff-level solutions.

---

## 02. The Core Mental Model: Dockerfile vs. Image vs. Container

Before writing a single line of code, we must eliminate the single most pervasive point of confusion in container engineering: **a `Dockerfile`, a `Docker Image`, and a `Docker Container` are three completely different artifacts.** Beginners frequently use "image" and "container" interchangeably, making debugging build failures or runtime networking issues significantly more difficult.

If you come from an Object-Oriented Programming (OOP) background, this mental model maps directly to concepts you use every day:

* **`Dockerfile` = The `.java` Source File:** A human-readable text file containing declarative instructions. By itself, it is passive; it occupies ~1 KB on disk and does nothing until compiled.
* **`Docker Image` = The Compiled `.class` / `.jar` Bytecode Artifact:** When you pass your `Dockerfile` to the `docker build` engine, it executes your instructions sequentially and produces a **read-only, immutable snapshot**. This snapshot contains the minimal Linux OS root filesystem, the Java Virtual Machine runtime, third-party libraries, and your compiled application JAR. It is packaged with a cryptographic SHA-256 digest.
* **`Docker Container` = An Instantiated Object in RAM (`new App()`):** When you pass that image to `docker run`, the Docker Engine creates an active Linux process. It places a thin **read-write layer** on top of the immutable image, assigns an isolated PID namespace and virtual IP address, and boots your Spring Boot application in memory. Just as you can instantiate ten separate objects from a single Java class, you can run ten isolated containers simultaneously from a single Docker Image.

![The Docker Lifecycle: From Blueprint to Running Containers](/images/content/devops-cloud-infrastructure/docker/devops-cloud-infrastructure_docker_mod-01_lesson-1.3_lifecycle-mental-model.svg)

---

### The Build-Time vs. Run-Time Boundary

The second mental hurdle is understanding **when** each line in your Dockerfile actually executes. A Dockerfile mixes two completely distinct execution phases inside the same manifest:

1. **Build-Time (`docker build`):** Instructions like `FROM`, `WORKDIR`, `COPY`, `RUN`, and `ARG` execute **once** while the image is being compiled on your developer workstation or CI/CD runner. For example, `RUN ./mvnw clean package` compiles your Java source files into bytecode and commits that state as an immutable image layer. It **never** runs again when the container is deployed in production.
2. **Run-Time (`docker run`):** Instructions like `ENTRYPOINT` and `CMD` do **not** run during `docker build`. Instead, they are stored as execution metadata inside the image configuration JSON. They instruct the Docker runtime: *"When someone boots a container from this image, start `/usr/bin/java -jar app.jar` as PID 1 inside the container namespace."*

:::callout{type="warning" title="Production Gotcha: Build-Time Network Sandboxing"}
Never place database migration scripts (Flyway or Liquibase) or remote API queries inside a `RUN` command! During `docker build`, the container builder runs in an isolated sandbox that should not have access to production network VPCs or live PostgreSQL instances. Database migrations must always run at **Run-Time** when the container boots via `ENTRYPOINT`.
:::

![Execution Timeline: Build-Time vs. Run-Time Instructions](/images/content/devops-cloud-infrastructure/docker/devops-cloud-infrastructure_docker_mod-01_lesson-1.3_buildtime-vs-runtime.svg)

---

### Summary Table: The Triad at a Glance

| Property | `Dockerfile` | `Docker Image` | `Docker Container` |
| :--- | :--- | :--- | :--- |
| **What is it?** | Plain-text compilation manifest | Layered, read-only filesystem snapshot (OS + JRE + JAR) | Active Linux process running inside isolated namespaces |
| **Mutability** | **Editable** (in your IDE) | **100% Immutable** (rebuild required to alter) | **Stateful/Ephemeral** (writes saved to temporary R/W layer) |
| **Storage Location** | Local Git repository (`./Dockerfile`) | Disk image cache or Remote Registry (Docker Hub, ECR) | System RAM, CPU schedules, and kernel namespace tables |
| **Spring Boot CLI** | Written in IDE | `docker build -t url-shortener-api:1.0 .` | `docker run -p 8080:8080 url-shortener-api:1.0` |

---

## 03. Version 1: The "Naive" Single-Stage Dockerfile

Let's begin with a hands-on scenario. You have built a Spring Boot REST API for a URL shortener service. Locally, you compiled the project using your host Maven wrapper:

```bash
./mvnw clean package -DskipTests
```

This leaves an executable fat JAR sitting on your local disk at `target/url-shortener-api-1.0.0.jar`. Your goal is to containerize this JAR so that anyone on your team can run it without needing Java installed on their machine.

Here is the standard 5-line "naive" Dockerfile that most developers write on their first try:

```dockerfile title="Dockerfile.v1"
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY target/url-shortener-api-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

While this Dockerfile works and boots successfully, it contains several critical engineering flaws that will haunt you in production. Let's analyze what each line does before critiquing it.

---

### Line-by-Line Breakdown

#### 1. `FROM eclipse-temurin:21-jdk`: Base Image Selection
Every Dockerfile must start with a `FROM` instruction. It specifies the parent image from which your container filesystem is initialized. Instead of creating an entire Linux distribution from scratch, Docker pulls a pre-packaged base image from an OCI registry (by default, Docker Hub).

The tag format follows `[registry/][repository:]tag`:
- **Repository**: `eclipse-temurin` (official Eclipse Foundation OpenJDK builds).
- **Tag**: `21-jdk` (Ubuntu Linux base pre-installed with the Java Development Kit 21).

| Base Image Option | Base OS | Runtime / Tools | Image Size | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| `eclipse-temurin:21-jdk` | Ubuntu | Full JDK (`javac`, jdb, jshell) | ~480 MB | Local compilation / CI build stages |
| `eclipse-temurin:21-jdk-alpine` | Alpine Linux | Full JDK + BusyBox utilities | ~330 MB | Lightweight compilation stages |
| `eclipse-temurin:21-jre-alpine` | Alpine Linux | Headless JRE only (no compiler) | ~180 MB | Production runtime environments |
| `gcr.io/distroless/java21-debian12` | Distroless | JRE only (no shell, no package manager) | ~120 MB | Zero-attack-surface enterprise prod |

*Notice the flaw here: we used a full **JDK** (`480 MB`) just to run a pre-compiled JAR that only needs a **JRE** (`180 MB`). We are shipping compilers, debuggers, and terminal utilities into our production environment!*

#### 2. `WORKDIR /app`: Establishing the Working Directory
The `WORKDIR` instruction sets the execution directory inside the container for all subsequent instructions (`COPY`, `RUN`, `ENTRYPOINT`).

Why is `WORKDIR /app` preferred over running `RUN mkdir -p /app && cd /app`?
- **Process State Persistence:** In Docker, each `RUN` command executes inside a brand new shell subshell. If you run `RUN cd /app`, the directory change is discarded the moment that shell process exits! Subsequent commands will execute in root (`/`).
- **Automatic Creation:** If the directory `/app` does not exist in the base image, `WORKDIR` automatically creates it (`mkdir -p`) with root permissions.

#### 3. `COPY target/url-shortener-api-1.0.0.jar app.jar`: Importing Artifacts
The `COPY` instruction copies files from your host machine (the **Build Context**) into the container's virtual filesystem.

Why `COPY` instead of `ADD`?
- `COPY` has one singular, predictable responsibility: copy files from source to destination.
- `ADD` has legacy side-effects: it can download files from remote URLs, and if the source is a recognized compressed tarball (`.tar.gz`, `.tar.bz2`), it automatically unpacks the archive into the destination directory.
- **Production Standard:** Always use `COPY` unless you explicitly require `ADD`'s automatic tar decompression feature.

#### 4. `EXPOSE 8080`: Operational Documentation
The `EXPOSE` instruction tells Docker that the application inside the container listens on network port 8080.

:::callout{type="info" title="The EXPOSE Myth"}
`EXPOSE 8080` does **not** publish the port to the host or open any firewall rules! It is purely architectural metadata meant for developers and container orchestrators (like Kubernetes Service controllers). To actually access port 8080 from your laptop's browser, you must explicitly bind the port at runtime using `docker run -p 8080:8080`.
:::

#### 5. `ENTRYPOINT ["java", "-jar", "app.jar"]`: The PID 1 Exec Form
The `ENTRYPOINT` instruction specifies the fixed binary executable that launches when the container boots. Notice we formatted it as a JSON array (`["java", "-jar", "app.jar"]`). This is called the **Exec Form**.

Compare the two syntax forms:
1. **Exec Form (Mandatory for Production):** `ENTRYPOINT ["java", "-jar", "app.jar"]`  
   Executes the binary directly via the Linux `execve()` system call. The Java Virtual Machine becomes **PID 1** (Process ID 1) inside the container namespace.
2. **Shell Form (Hazardous Anti-Pattern):** `ENTRYPOINT java -jar app.jar`  
   Docker implicitly wraps your command in `/bin/sh -c "java -jar app.jar"`. The shell becomes PID 1, and your Java application runs as a child process (PID 2).

Why does this matter? When you issue `docker stop`, the Docker daemon sends a POSIX `SIGTERM` signal to PID 1. If PID 1 is `/bin/sh`, the shell ignores `SIGTERM` and fails to forward it to your Java application. Spring Boot's shutdown hooks (closing HikariCP database connections, finishing in-flight HTTP requests) never trigger! After a 10-second timeout, Docker forcibly kills the container with `SIGKILL` (`Exit Code 137`), abruptly terminating active database transactions.

---

### Building and Running: The Verification Proof

Let's test this naive Dockerfile:

```bash
# 1. Build the image and tag it as 'v1'
docker build -t url-shortener-api:v1 .

# 2. Launch the container in detached mode with port mapping
docker run -d --name shortener-v1 -p 8080:8080 url-shortener-api:v1

# 3. Test the live health endpoint
curl http://localhost:8080/actuator/health
# Response: {"status":"UP"}

# 4. Inspect the image size
docker images url-shortener-api:v1
```

```text
REPOSITORY            TAG       IMAGE ID       CREATED          SIZE
url-shortener-api     v1        a1b2c3d4e5f6   10 seconds ago   487MB
```

The container starts and responds with `HTTP 200 OK`. But let's look at what is fundamentally broken behind the scenes.

:::callout{type="danger" title="Why Version 1 Cannot Ship to Production"}
1. **Bloated Image Size (487 MB):** We bundled a 400 MB Java compiler and developer tools to serve a 40 MB JAR.
2. **Security Vulnerability (Root User):** We did not specify a user, so the container executes as **`root` (UID 0)**. If an adversary finds a remote code execution vulnerability (e.g., Log4Shell) in our REST API, they get root control inside the container and can attempt Linux kernel breakouts.
3. **Fragile Build Process:** The Dockerfile expects `target/*.jar` to already exist on the host machine. If someone runs `docker build` without running `./mvnw package` first, the build crashes!
4. **Zero Health Monitoring:** If Spring Boot suffers a thread pool deadlock or runs out of database connections, Docker has no way of detecting that the service is unresponsive.
:::

---

## 04. Under the Hood: Union File Systems & Layer Caching

To transform our naive script into a production-grade container, we must understand how Docker constructs filesystems beneath the surface: **The Union File System (UnionFS)**.

When you execute `docker build`, Docker does not create a single monolithic disk image. Instead, it stacks read-only filesystem diffs on top of each other using the Linux kernel's **OverlayFS** storage driver.

![Docker Image Layers and OverlayFS Architecture](/images/content/devops-cloud-infrastructure/docker/devops-cloud-infrastructure_docker_mod-01_lesson-1.3_overlayfs-layers.svg)

---

### How Image Layers Actually Work

Every instruction in your Dockerfile generates a distinct, immutable **layer**:

1. **`lowerdir` (Read-Only Image Layers):** When `FROM eclipse-temurin:21-jre-alpine` executes, Docker pulls the base OS tarball and assigns it a content-addressable SHA-256 digest (`sha256:9f8e...`). When `COPY app.jar` runs, Docker computes the checksum of the JAR file and commits that single file as an independent read-only layer diff.
2. **`upperdir` (Writable Container Layer):** When you run `docker run`, Docker does not copy the entire image into memory. Instead, it places a thin, mutable read-write layer directly on top of the stacked read-only layers.
3. **`merged` (Unified View):** The Linux kernel presents the combination of all lower layers plus the upper layer to the running container as a single, unified directory tree.

#### The Magic of Copy-on-Write (CoW)
What happens if your Spring Boot application creates a temporary log file inside `/app/logs/server.log`?
- OverlayFS detects that the file is being written to.
- It writes the new file directly into the **`upperdir` (Writable Layer)**. The underlying image layer containing `app.jar` remains completely untouched.
- If you spin up **50 identical containers** of `url-shortener-api:v1` across a Kubernetes cluster, all 50 containers share the exact same 175 MB read-only image layers on disk! The cluster uses 175 MB of total image storage rather than 8.7 GB (175 MB × 50).

---

### The Build Context & The Power of `.dockerignore`

When you type `docker build -t my-app .`, pay attention to the final character: the dot (`.`).

That dot specifies the **Build Context**—the local directory that the Docker CLI packages into a tarball and uploads over the local socket to the Docker build daemon.

```text
Sending build context to Docker daemon  245.8MB
```

If you forget to create a **`.dockerignore`** file in your project root, the Docker client blindly uploads:
- Your local `target/` directory (which might contain multiple 100 MB test builds).
- Your `.git/` history directory (which could be gigabytes in size).
- Local secrets, `.env` files, and IDE settings (`.idea/`, `.vscode/`).

This upload slows down your build before Docker even reads the first line of your Dockerfile!

Here is the production-ready `.dockerignore` template for Java / Spring Boot applications:

```text title=".dockerignore"
# Ignore local compilation artifacts
target/
build/
*.class

# Ignore version control metadata
.git/
.gitignore

# Ignore local environment secrets & configuration
*.env
*.env.*
*.local

# Ignore IDE configurations
.idea/
.vscode/
*.iml
*.ipr
*.iws

# Ignore documentation & local scripts
*.md
docs/
docker-compose*.yml
```

---

### The Domino Effect of Layer Cache Invalidation

Docker checks its local content-addressable cache before executing each line in your Dockerfile. It calculates a cache key using two inputs:
$$\text{Cache Key} = \text{Hash}(\text{Parent Layer Digest} + \text{Instruction String} + \text{File Content Checksums})$$

If the cache key matches an existing layer on disk, Docker prints `CACHED` and skips execution instantly (0.00 seconds). But if the key changes, Docker triggers a **Cache Miss**.

Here is the golden rule that trips up backend engineers: **Layer cache invalidation is sequential. The moment one instruction triggers a cache miss, Docker permanently invalidates the cache for EVERY instruction that follows it!**

![Layer Cache Invalidation: Bad vs. Good Ordering](/images/content/devops-cloud-infrastructure/docker/devops-cloud-infrastructure_docker_mod-01_lesson-1.3_cache-invalidation.svg)

Let's look at why naive ordering cripples productivity:

#### The Bad Pattern (Naive Ordering):
```dockerfile
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY . .                   # <-- CACHE MISS on every single line of Java code you edit!
RUN ./mvnw clean package  # <-- FORCED to re-download 400 MB of Maven plugins every build!
```
Every time you change a single controller, `COPY . .` invalidates the layer. Docker is forced to re-run Maven compilation, downloading the entire internet for 3 minutes.

#### The Staff-Level Pattern (Dependency Isolation):
```dockerfile
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# 1. Copy ONLY project descriptors first
COPY pom.xml mvnw .
COPY .mvn/ .mvn/

# 2. Download all dependencies into container cache
RUN ./mvnw dependency:go-offline

# 3. Copy application business code LAST
COPY src ./src
RUN ./mvnw clean package -DskipTests
```
Because dependencies in `pom.xml` change rarely, steps 1–2 remain permanently cached (`0.0s`). When you edit a Java class in `src/`, Docker reuses the cached dependencies and only executes the local compilation in step 3. Build time plummets from **3 minutes to 3 seconds**!

---

## 05. Version 2: The Production Multi-Stage Dockerfile

Now that we understand layers, caching, and security boundaries, we can rewrite our Dockerfile into an enterprise-grade, production-hardened artifact using **Multi-Stage Builds**.

In a Multi-Stage Dockerfile:
- **Stage 1 (Builder):** Uses a heavy image containing the full JDK, Maven wrapper, and source code. It compiles the bytecode, packages the JAR, and downloads dependencies.
- **Stage 2 (Runtime):** Uses an ultra-minimal Alpine JRE image. It reaches back into Stage 1, copies **only the single compiled `.jar` file**, and completely discards the source code, compilers, and Maven caches.

Here is the complete, hardened production Dockerfile:

```dockerfile title="Dockerfile"
# ==========================================
# STAGE 1: Build & Compilation Stage
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build

# 1. Cache Maven dependencies first (The Golden Rule)
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# 2. Copy application source tree and package fat JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ==========================================
# STAGE 2: Hardened Production Runtime Stage
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# 3. Security Hardening: Create unprivileged system user
RUN addgroup -S spring && adduser -S spring -G spring

# 4. Copy ONLY the built artifact from Stage 1
COPY --from=builder /build/target/*.jar app.jar

# 5. Drop root privileges permanently
USER spring:spring

# 6. Document standard Spring Boot HTTP port
EXPOSE 8080

# 7. Production Healthcheck Probe
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# 8. Exec-form entrypoint for direct signal propagation
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

### Code Diff: What Changed from Version 1?

```diff
- FROM eclipse-temurin:21-jdk
+ # STAGE 1: Compilation Sandbox
+ FROM eclipse-temurin:21-jdk-alpine AS builder
+ WORKDIR /build
+ COPY pom.xml .
+ COPY .mvn/ .mvn/
+ COPY mvnw .
+ RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
+ COPY src ./src
+ RUN ./mvnw clean package -DskipTests -B

+ # STAGE 2: Minimal Runtime
+ FROM eclipse-temurin:21-jre-alpine
  WORKDIR /app
- COPY target/url-shortener-api-1.0.0.jar app.jar
+ RUN addgroup -S spring && adduser -S spring -G spring
+ COPY --from=builder /build/target/*.jar app.jar
+ USER spring:spring
  EXPOSE 8080
+ HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
+     CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1
  ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

### Detailed Line-by-Line Breakdown of the Refactor

#### Stage 1: Build Sandbox
- **`FROM eclipse-temurin:21-jdk-alpine AS builder`**: Pulls a lightweight Alpine JDK image (~330 MB) and tags the build stage with the alias `builder`. BuildKit models this stage as an intermediate node in its Directed Acyclic Graph (DAG). All compiler tools will be discarded from the final release.
- **`COPY pom.xml .` & `RUN ./mvnw dependency:go-offline -B`**: Pre-downloads all dependencies into the local container layer cache before touching application code. The `-B` flag enforces batch (non-interactive) mode.
- **`RUN ./mvnw clean package -DskipTests -B`**: Compiles source code into `/build/target/*.jar`. Bypassing unit tests here accelerates builds; unit and integration tests should run in your upstream CI pipeline prior to image creation.

#### Stage 2: Production Runtime
- **`FROM eclipse-temurin:21-jre-alpine`**: Discards Stage 1 completely and starts from a fresh, pristine Alpine JRE 21 image (~180 MB).
- **`RUN addgroup -S spring && adduser -S spring -G spring`**: In Alpine Linux (BusyBox), `-S` creates a system-level group named `spring` and an unprivileged system user `spring` belonging to that group.
- **`COPY --from=builder /build/target/*.jar app.jar`**: This is the cross-stage copy mechanic. The builder reaches into the filesystem of `builder`, extracts the packaged `.jar`, and places it in `/app/app.jar`. Not a single line of `.java` source code, Maven wrapper scripts, or compiler tools makes it into production!
- **`USER spring:spring`**: Modifies the container process context. From this line forward and at runtime, the container drops all Linux root capabilities and runs as unprivileged user `spring`.
- **`HEALTHCHECK ...`**: Instructs Docker to periodically probe the application's `/actuator/health` endpoint. We use `wget --spider` (which checks HTTP status without downloading the response body) because Alpine Linux includes `wget` out of the box while omitting `curl`.

---

### Before vs. After: The Production Engineering Metrics

| Architectural Metric | Version 1 (Naive Single-Stage) | Version 2 (Hardened Multi-Stage) | Engineering Impact |
| :--- | :--- | :--- | :--- |
| **Image Size** | **487 MB** | **175 MB** | **64% reduction** in registry storage & deployment network pull latency. |
| **Attack Surface** | Full JDK, `javac`, shell tools | Minimal Headless JRE only | No compiler tools available if an adversary gains arbitrary code execution. |
| **Process Security** | `root` (UID 0) | `spring` (unprivileged) | Prevents host kernel breakouts and unauthorized filesystem manipulation. |
| **Rebuild on Code Edit** | ~3m 40s (re-downloads dependencies) | **~2.8s** (dependency cache hit) | **98% faster** developer inner-loop build times. |
| **Health Monitoring** | None (crashes go undetected) | Automated `HEALTHCHECK` probe | Docker and Kubernetes orchestrators can restart degraded containers. |
| **Hermetic Build** | Depends on host Maven setup | Fully self-contained inside container | Identical builds on macOS, Linux, Windows, and CI runners. |

---

## 06. Runtime Configuration: Environment Variables & Healthchecks

Production container images must remain completely agnostic to the environment they run in. You should build your image **once** in CI, and run that exact same binary snapshot in development, staging, and production.

To achieve this, you must separate **Build-Time Arguments** from **Run-Time Environment Variables**.

---

### `ARG` vs. `ENV`: The Critical Distinction

* **`ARG` (Build-Time Only):** Variables defined via `ARG` exist exclusively while the image is being assembled (`docker build --build-arg VERSION=1.2.0`). Once the build finishes, `ARG` values evaporate and are **not** accessible inside the running container.
* **`ENV` (Run-Time Persistent):** Variables defined via `ENV` are baked directly into the image configuration JSON. They persist across reboots and are accessible to your application via `System.getenv("KEY")`.

```dockerfile title="ArgVsEnvExample.dockerfile"
# 1. Build-time argument: Which Maven profile to activate during compile
ARG BUILD_PROFILE=prod
RUN ./mvnw clean package -P${BUILD_PROFILE}

# 2. Runtime environment variable: Default Spring configuration
ENV SPRING_PROFILES_ACTIVE=production
ENV SERVER_PORT=8080
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
```

:::callout{type="danger" title="Security Invariant: Never Bake Secrets into Dockerfiles"}
Never write database passwords, JWT signing keys, or cloud credentials in `ENV` instructions! Anyone with read access to the image can view them using `docker inspect` or `docker history`. Passwords must be injected **at runtime** using `docker run -e` or Docker Compose secrets:

```bash
docker run -d \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://db.prod:5432/shortener" \
  -e SPRING_DATASOURCE_PASSWORD="super-secret-password" \
  url-shortener-api:v2
```
:::

---

### Designing Enterprise Healthchecks

By default, Docker monitors only **process health**: as long as PID 1 (`java`) is executing, Docker considers the container `running`.

However, an enterprise Java service can easily enter a degraded "zombie" state:
- HikariCP database connection pool has become exhausted.
- An `OutOfMemoryError: Java heap space` has frozen all active threads.
- Spring Boot has deadlocked while processing asynchronous events.

In these scenarios, the Java process is alive, but every incoming HTTP request returns `500 Internal Server Error` or hangs indefinitely.

The `HEALTHCHECK` instruction solves this by probing your service from inside the container:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1
```

- **`--interval=30s`**: Docker runs the probe every 30 seconds.
- **`--timeout=3s`**: If the health endpoint takes longer than 3 seconds to respond, Docker marks that check as failed.
- **`--start-period=40s`**: A grace period for JVM bootstrapping. During these 40 seconds, health check failures are ignored so Spring Boot can warm up without triggering false alarms.
- **`--retries=3`**: If the probe fails 3 consecutive times, Docker transitions the container status from `healthy` to `unhealthy`.

You can inspect container health directly from the CLI:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
# Output:
# NAMES          STATUS
# shortener-v2   Up 2 minutes (healthy)
```

---

## 07. Common Pitfalls & Anti-Patterns Cheat Sheet

Bookmark this section. These seven anti-patterns account for over 90% of container build failures, security incidents, and performance bottlenecks in production.

| Anti-Pattern | Operational Failure | Staff-Level Solution |
| :--- | :--- | :--- |
| **Using the `:latest` Tag** | `FROM eclipse-temurin:latest` causes builds to break unpredictably when upstream releases new major Java versions. | **Pin exact versions:** Use immutable tags like `FROM eclipse-temurin:21.0.2_13-jre-alpine`. |
| **Splitting `apt update` & `install`** | `RUN apt-get update` on line 1 and `RUN apt-get install -y curl` on line 2 leads to stale cached package indices. | **Always combine into one layer:** `RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*`. |
| **Running as Root (`UID 0`)** | Any remote code execution vulnerability allows the attacker to manipulate container OS files or attempt kernel breakouts. | **Drop privileges:** Create an unprivileged user (`RUN adduser -S appuser`) and set `USER appuser`. |
| **Shell Form in `ENTRYPOINT`** | `ENTRYPOINT java -jar app.jar` starts `/bin/sh` as PID 1. The shell swallows `SIGTERM`, preventing graceful connection draining. | **Always use Exec Form:** `ENTRYPOINT ["java", "-jar", "app.jar"]` to ensure Java receives OS signals directly. |
| **Omitting `.dockerignore`** | Uploads gigabytes of local `.git/`, `target/`, and IDE caches to the build daemon, bloating contexts and leaking secrets. | **Maintain a strict `.dockerignore`:** Exclude `target/`, `.git/`, and `.env` files in project roots. |
| **Using `ADD` Instead of `COPY`** | `ADD` has unpredictable magic behaviors (auto-extracting tars and downloading URLs from the internet). | **Default to `COPY`:** Reserve `ADD` strictly for cases where you deliberately want local tar archives extracted. |
| **Baking Secrets into `ENV`** | Passwords written in `ENV` instructions are permanently recorded in plaintext in image layer metadata. | **Inject secrets at runtime:** Use `docker run -e`, Docker Compose secret blocks, or Kubernetes Secrets. |

---

## 08. Conclusion & Next Steps

Over the course of this engineering deep dive, we transitioned from a broken, manual virtual machine deployment into an automated, production-hardened containerization workflow.

### The Three Golden Rules of Dockerfiles

Whenever you author a Dockerfile for any backend stack—whether Java, Go, Node.js, or Rust—commit these three rules to memory:

1. **Order Instructions by Invalidation Volatility:** Place dependencies and descriptors (`pom.xml`, `package.json`) before application source code (`src/`). Let Docker's layer cache do the heavy lifting.
2. **Multi-Stage Everything:** Never ship compilers, testing frameworks, or package managers into production. Compile in Stage 1, copy the single artifact into Stage 2, and discard the rest.
3. **Enforce Defense-in-Depth:** Never run containers as `root`. Always create an explicit, unprivileged system user and verify signal propagation with exec-form `ENTRYPOINT`.

---

### What We Built: The Transformation

```text
               THE EVOLUTION OF OUR CONTAINER
               
   ┌────────────────────────────────────────────────────────┐
   │ 1. Naive Single-Stage Build                            │
   │    • 487 MB image size (Ubuntu + Full JDK)             │
   │    • Runs as root (UID 0)                              │
   │    • Rebuilds dependencies on every line edit (3m 40s) │
   │    • Zero health monitoring                            │
   └───────────────────────────┬────────────────────────────┘
                               │
                Architectural Refactor & Hardening
                               │
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │ 2. Production Multi-Stage Build                        │
   │    • 175 MB image size (Alpine Linux + Minimal JRE)    │
   │    • Unprivileged user:group (spring:spring)           │
   │    • Sub-3-second rebuilds via layer cache isolation   │
   │    • Automated /actuator/health monitoring probe       │
   │    • Direct PID 1 SIGTERM signal propagation           │
   └────────────────────────────────────────────────────────┘
```

---

### The Bridge: From Single Container to Microservices

A Dockerfile solves the lifecycle for **one individual service**. But real-world enterprise architectures don't live in isolation. Your URL shortener REST API needs:
- A **PostgreSQL database** to persist URL mappings.
- A **Redis cluster** to cache hot redirects.
- An **Nginx reverse proxy** to handle SSL termination and rate limiting.

Running four separate `docker run` commands and manually wiring virtual networks together quickly becomes tedious and error-prone. In our next deep dive, we will take the production image we engineered today and orchestrate it alongside databases, caches, and monitoring stacks using **Docker Compose** and **Automated CI/CD Delivery Pipelines**.
