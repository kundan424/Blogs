---
title: "Dockerfile Architecture & Internals: Theory, BuildKit Mechanics, and Production Engineering"
slug: dockerfile-architecture-internals-production-guide
subject: devops-cloud-infrastructure
abstract: "A comprehensive, theory-style architectural guide to Dockerfiles: OCI image specifications, BuildKit Directed Acyclic Graph (DAG) solvers, content-addressable layer caching, instruction taxonomies, and a line-by-line mechanical analysis of a hardened multi-stage production Dockerfile."
tags:
  - docker
  - dockerfile
  - devops
  - buildkit
  - containers
  - cloud-infrastructure
published: true
publishDate: Nov 08, 2026
updatedDate: Nov 08, 2026
readTime: 32m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
---

# Dockerfile Architecture & Internals: Theory, BuildKit Mechanics, and Production Engineering

An architectural treatise analyzing the declarative mechanics of Dockerfiles, intermediate compiler representations, BuildKit Directed Acyclic Graphs (DAG), layer caching algorithms, instruction taxonomies, and an exhaustive line-by-line walkthrough of a production-hardened multi-stage container build.

---

## 01. What is a Dockerfile? Formal Definition & OCI Image Specification

A **Dockerfile** is a declarative, text-based manifest containing a sequential set of instructions that instruct a container builder (such as Docker BuildKit, Buildah, or Google Kaniko) on how to assemble an automated root filesystem snapshot.

A Dockerfile is not a simple shell script. It is an **abstract compilation receipt**. When parsed, the builder compiles its declarative instructions into an immutable, content-addressable artifact conforming strictly to the **Open Container Initiative (OCI) Image Specification**.

```text
       ANATOMY OF AN OCI CONTAINER IMAGE ARTIFACT
       
   ┌────────────────────────────────────────────────────────┐
   │ 1. OCI Image Manifest (manifest.json)                  │
   │    • schemaVersion: 2                                  │
   │    • config: { mediaType, digest: sha256:7b1e..., size}│
   │    • layers: [                                         │
   │        { mediaType: tar+gzip, digest: sha256:9f8e... },│
   │        { mediaType: tar+gzip, digest: sha256:a1b8... },│
   │        { mediaType: tar+gzip, digest: sha256:d4c2... } │
   │      ]                                                 │
   └───────────────────────────┬────────────────────────────┘
                               │
               Points to SHA-256 Digest References
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌─────────────────────────────┐         ┌─────────────────────────────┐
│ 2. OCI Image Config JSON    │         │ 3. Layer Tarball Blobs      │
│ • Architecture: amd64 / arm │         │ • sha256:9f8e... (Base OS)  │
│ • OS: linux                 │         │ • sha256:a1b8... (Packages) │
│ • Env: ["PATH=...", "PORT"] │         │ • sha256:d4c2... (App Code) │
│ • WorkingDir: "/app"        │         │                             │
│ • Entrypoint: ["java"]      │         │ Stored as immutable tar.gz  │
│ • User: "appuser"           │         │ filesystem delta diffs      │
└─────────────────────────────┘         └─────────────────────────────┘
```

### The Three Components of an OCI Image Artifact
When a Dockerfile is built, the compiler outputs three distinct elements:
1. **The Layer Blobs**: Compressed filesystem changesets (`.tar.gz`). Each layer contains only the **diff** (added, modified, or deleted files) relative to its parent layer. Layers are strictly read-only and indexed by the cryptographic hash of their compressed contents.
2. **The Image Config JSON**: A metadata document defining execution parameters: the entrypoint array, default arguments (`Cmd`), environment variables (`Env`), exposed ports, working directory, labels, and the history array detailing the Dockerfile instruction that generated each layer.
3. **The Image Manifest**: The root JSON descriptor binding the Image Config and its array of Layer Blobs together via content-addressable SHA-256 digests.

---

## 02. How Dockerfile Execution Works: BuildKit Engine & Low-Level Builder (LLB)

Modern container builds are powered by **Docker BuildKit**, a next-generation container build engine that replaces the legacy Docker daemon builder.

![Dockerfile BuildKit DAG Architecture](/images/content/dockerfile-buildkit-dag-architecture.svg)

### The Build Execution Pipeline

### Phase 1: Context Packaging & Filtering
When `docker build -t my-app .` is executed:
1. The Docker CLI reads the target directory (`.`).
2. It evaluates the **`.dockerignore`** file, stripping build artifacts, local secrets (`.env`), version control history (`.git`), and dependencies (`node_modules`, `target/`).
3. The remaining files are packaged into a stream and sent to the BuildKit daemon via a Unix domain socket.

### Phase 2: Translation to Low-Level Builder (LLB) DAG
BuildKit does not parse instructions naively line-by-line. Instead, it translates the high-level Dockerfile into an intermediate binary representation called **LLB (Low-Level Builder)**:
- LLB models the build as a **Directed Acyclic Graph (DAG)** of operations.
- **Concurrent Execution**: Independent build stages (e.g., compiling a Go backend and building a React frontend in separate stages) have no dependencies between them in the graph. BuildKit executes them **simultaneously in parallel** across multiple CPU threads.
- **Pruning Unused Stages**: If a target stage does not depend on an intermediate stage defined in the Dockerfile, BuildKit prunes that stage from the execution graph entirely, executing zero commands for it.

### Phase 3: The Cache Evaluation Algorithm
Before executing any instruction, BuildKit checks its local content-addressable cache:

```text
       BUILDKIT CACHE EVALUATION LOGIC
       
   Is the instruction a RUN command?
   ├── Compare: Parent Layer Digest + Command String ("RUN apt-get update")
   │   ├── Match: CACHE HIT ──▶ Instantly reuse previous layer snapshot.
   │   └── No Match: CACHE MISS ──▶ Invalidate this layer and ALL subsequent layers.
   │
   Is the instruction a COPY or ADD command?
   └── Compare: Parent Layer Digest + File Content Checksums (SHA-256)
       ├── Checksums Match: CACHE HIT ──▶ Reuse layer.
       └── Checksum Changed: CACHE MISS ──▶ Invalidate cache from this step forward!
```

### Layer Creation vs. Metadata Mutation
Not every instruction in a Dockerfile produces a physical filesystem layer blob:
- **Layer-Generating Instructions** (`FROM`, `RUN`, `COPY`, `ADD`): Execute filesystem modifications. They create an ephemeral container via `runc`, capture the filesystem delta diff (`diff/`), compress it into a `.tar.gz` blob, and compute its SHA-256 hash.
- **Metadata-Only Instructions** (`WORKDIR`, `ENV`, `EXPOSE`, `USER`, `VOLUME`, `ENTRYPOINT`, `CMD`, `LABEL`, `STOPSIGNAL`): Do **not** create filesystem disk layers. They modify properties in the **Image Config JSON** document without consuming storage.

---

## 03. Complete Taxonomy of Dockerfile Instructions & Mechanics

```text
              DOCKERFILE INSTRUCTION TAXONOMY
              
  BUILD STAGE DEFINITION:         FILESYSTEM MUTATION:
  ├── FROM (Base image / stage)   ├── COPY (Inject host files)
  └── WORKDIR (Set execution dir) ├── ADD (Extract tar / fetch URLs)
                                  └── RUN (Execute shell commands)

  CONFIGURATION & METADATA:       EXECUTION & RUNTIME:
  ├── ENV (Persistent runtime)    ├── ENTRYPOINT (Primary process)
  ├── ARG (Build-time ephemeral)  ├── CMD (Default parameters)
  ├── USER (Unprivileged UID)     ├── HEALTHCHECK (Heartbeat probe)
  ├── EXPOSE (Port documentation) └── STOPSIGNAL (Termination code)
  └── VOLUME (Storage boundary)
```

### 1. `FROM`
```dockerfile
FROM [--platform=<platform>] <image>[:<tag>] [AS <stage-name>]
```
- **Semantics**: Initializes a new build stage and sets the foundational base image for subsequent instructions.
- **Mechanics**: Queries the local image store; if missing, pulls the OCI manifest list from the configured registry.
- **The `--platform` Flag**: Allows building multi-architecture images explicitly (e.g., `--platform=linux/amd64` on Apple Silicon).
- **The `scratch` Target**: A special, empty base image ($0\text{ bytes}$) used for deploying statically compiled standalone binaries (Go, Rust).
- **The `AS <name>` Identifier**: Names the stage to enable **Multi-Stage Builds**, allowing subsequent stages to copy artifacts via `COPY --from=<name>`.

### 2. `WORKDIR`
```dockerfile
WORKDIR /path/to/directory
```
- **Semantics**: Sets the current working directory for all following `RUN`, `CMD`, `ENTRYPOINT`, `COPY`, and `ADD` instructions.
- **Mechanics**: Automatically creates the directory (`mkdir -p`) if it does not already exist. It updates the `WorkingDir` property in the Image Config JSON.
- **Crucial Rule**: Never use `RUN cd /app`. Every `RUN` instruction executes in an isolated subshell container; the subshell exits immediately after execution, resetting the working directory to `/` for the next line.

### 3. `COPY` vs. `ADD`
```dockerfile
COPY [--chown=<user>:<group>] [--from=<stage>] <src>... <dest>
ADD  [--chown=<user>:<group>] <src>... <dest>
```
- **`COPY` (Standard)**: Copies files or directories from the local build context (or another build stage via `--from`) into the container filesystem.
- **`ADD` (Magic Behaviors)**:
  1. Auto-extracts local tar archives into the destination directory (`ADD rootfs.tar.gz /`).
  2. Downloads remote URLs (`ADD https://... /tmp/`).
- **Production Invariant**: **Prefer `COPY` over `ADD`.** `ADD`'s automatic tar extraction can overwrite system libraries unexpectedly. Downloading remote files via `ADD` prevents cleaning up intermediate archives in the same layer, bloating image sizes. Use `RUN curl ... && tar ... && rm ...` instead.

### 4. `RUN`
```dockerfile
# Shell form: executes in /bin/sh -c (Linux) or cmd /S /C (Windows)
RUN apt-get update && apt-get install -y nginx

# Exec form: executes binary directly without shell
RUN ["/bin/bash", "-c", "echo 'Hello'"]

# BuildKit Cache Mount (Advanced):
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests
```
- **Semantics**: Executes commands inside an ephemeral container and commits the resulting filesystem diff as a new immutable image layer.
- **Chain Commands with `&& \`**: Group dependent commands and cleanup routines in a single `RUN` statement. If you install a package in one `RUN` and delete the cache in the next `RUN`, the cache remains permanently recorded in the previous layer.

### 5. `ENV` vs. `ARG`
```dockerfile
ARG VERSION=1.0.0      # Build-time only: Not available inside running containers
ENV PORT=8080          # Runtime persistent: Available in build AND running container
```

| Dimension | `ARG` (Build Argument) | `ENV` (Environment Variable) |
| :--- | :--- | :--- |
| **Availability Scope** | Available **only during image build** | Available **during build AND container runtime** |
| **Persistence** | Excluded from final running container state | **Persisted permanently** into Image Config JSON |
| **Overridability** | Overridden via `docker build --build-arg` | Overridden via `docker run -e` or `docker-compose` |
| **Security Risk** | Appears in `docker history` if used in `RUN` | Readily exposed in plaintext via `docker inspect` |

:::callout{type="danger" title="Security Warning on Secrets"}
Never pass database passwords, API tokens, or private SSH keys via `ARG` or `ENV`. Both are recorded in plaintext in the image configuration metadata. Use BuildKit secret mounts (`--mount=type=secret`) instead.
:::

### 6. `USER`
```dockerfile
USER <user>[:<group>] or <UID>[:<GID>]
```
- **Semantics**: Sets the effective User ID (UID) and Group ID (GID) for all subsequent `RUN`, `CMD`, and `ENTRYPOINT` instructions.
- **Production Standard**: By default, containers execute as **`root` (UID 0)**. Running as root allows container-escape vulnerabilities to compromise the host kernel. Always create an unprivileged user (`appuser`, UID 10001) and switch to it.

### 7. `EXPOSE`
```dockerfile
EXPOSE <port>[/<protocol>]
```
- **Semantics**: Acts as documentation metadata indicating which ports the application listens on.
- **Mechanics**: Does **not** publish or bind the port on the host operating system. Port publishing is exclusively enforced at runtime using `docker run -p <host_port>:<container_port>`.

### 8. `VOLUME`
```dockerfile
VOLUME ["/var/log/app", "/data"]
```
- **Semantics**: Creates a designated mount point and marks it as holding externally mounted storage from the host or other containers.
- **Mechanics Warning**: Once a path is declared as a `VOLUME`, any subsequent `RUN` commands in the Dockerfile that attempt to modify that directory will execute inside an ephemeral container, but their changes will be **discarded upon commit**. Place all file initialization instructions *before* the `VOLUME` declaration.

### 9. `ENTRYPOINT` vs. `CMD`: Exec Form vs. Shell Form

```text
       EXEC FORM VS. SHELL FORM EXECUTION
       
   EXEC FORM (Preferred):
   ENTRYPOINT ["java", "-jar", "app.jar"]
   ┌────────────────────────────────────────────────────────┐
   │ Direct Execution via execve():                         │
   │ The Java process BECOMES PID 1 directly.               │
   │ Captures POSIX OS signals (SIGTERM, SIGINT) instantly! │
   └────────────────────────────────────────────────────────┘

   SHELL FORM (Hazardous):
   ENTRYPOINT java -jar app.jar
   ┌────────────────────────────────────────────────────────┐
   │ Subshell Wrapping:                                     │
   │ /bin/sh -c "java -jar app.jar" becomes PID 1.          │
   │ Java runs as child PID 2!                              │
   │ /bin/sh IGNORES SIGTERM! Graceful shutdown breaks!     │
   └────────────────────────────────────────────────────────┘
```

#### The Interaction Matrix between `ENTRYPOINT` and `CMD`
When combined, `ENTRYPOINT` defines the **fixed command**, while `CMD` supplies the **default overridable arguments**:

```dockerfile title="EntrypointCmdCombination.dockerfile"
ENTRYPOINT ["/usr/bin/traffic-router"]
CMD ["--port", "8080", "--mode", "production"]
```
- Default Execution (`docker run router`):  
  Executes: `/usr/bin/traffic-router --port 8080 --mode production`
- Overridden Execution (`docker run router --debug`):  
  Executes: `/usr/bin/traffic-router --debug` (Overrides `CMD`, preserves `ENTRYPOINT`)

---

## 04. Rules & Production Engineering Principles for Writing Dockerfiles

```text
   PRODUCTION DOCKERFILE HEURISTICS
   
   ┌────────────────────────────────────────────────────────┐
   │ 1. Cache Optimization: Order by frequency of change   │
   │    System packages ──▶ Dependencies ──▶ App source code│
   ├────────────────────────────────────────────────────────┤
   │ 2. Security: Drop root privilege & use minimal base    │
   │    USER 10001 + Distroless / Alpine / Debian-slim      │
   ├────────────────────────────────────────────────────────┤
   │ 3. Signal Handling: Always use Exec Form               │
   │    ENTRYPOINT ["executable", "arg1"]                   │
   ├────────────────────────────────────────────────────────┤
   │ 4. BuildKit Secrets: Never leak credentials            │
   │    RUN --mount=type=secret,id=mvn_settings ...         │
   └────────────────────────────────────────────────────────┘
```

### Rule 1: Order Instructions by Invalidation Volatility
Organize your instructions from **least frequently changing to most frequently changing**:
1. Base image declaration (`FROM`).
2. System packages and security updates (`RUN apt-get update && ...`).
3. Dependency manifests (`COPY package.json`, `COPY pom.xml`).
4. Dependency installation (`RUN npm ci`, `RUN mvn dependency:go-offline`).
5. Application source code (`COPY src/ ./src`).
6. Runtime entrypoints and ports.

*If you edit one line of application source code, Docker reuses the cached layers for steps 1–4 and rebuilds only step 5 onwards, slashing build times from minutes to seconds.*

### Rule 2: Multi-Stage Separation of Build Tools and Runtime
Never ship compilers (GCC, Go SDK, Maven, JDK) or build tools into a production environment. Build the binary in a dedicated build stage, then copy **only the final artifact** into a stripped-down runtime image.

### Rule 3: Enforce `.dockerignore` Hygiene
Prevent non-production assets, secrets, and local platform binaries from poisoning the build context.

---

## 05. Line-by-Line Breakdown of a Hardened Production Dockerfile

The following Dockerfile models an enterprise Java/Spring Boot microservice demonstrating:
- Multi-stage architecture
- BuildKit dependency caching
- Dedicated unprivileged system user
- Secure JVM ergonomics inside cgroups
- Non-root health monitoring

```dockerfile title="Dockerfile"
# =========================================================================
# STAGE 1: BUILD ENVIRONMENT (JDK + Maven)
# =========================================================================
# Line 1: Declare the build environment base image and name the stage
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build-stage

# Line 2: Set the isolated working directory for compilation
WORKDIR /workspace

# Line 3: Copy only dependency descriptors to leverage layer caching
COPY pom.xml .

# Line 4: Download external dependencies using BuildKit persistent cache
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B

# Line 5: Copy the application source tree
COPY src ./src

# Line 6: Compile, test, and package the executable fat JAR
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -DskipTests -B

# Line 7: Extract JAR layers using Spring Boot layer-tools for optimal caching
RUN java -Djarmode=layertools -jar target/*.jar extract --destination target/extracted

# =========================================================================
# STAGE 2: PRODUCTION RUNTIME ENVIRONMENT (JRE Only)
# =========================================================================
# Line 8: Base runtime using a minimal Debian-slim headless JRE
FROM eclipse-temurin:21-jre-jammy AS runtime-stage

# Line 9: Install curl for health checking, apply security patches, and clean cache in ONE step
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Line 10: Create an isolated unprivileged system group and user
RUN groupadd --system --gid 10001 appgroup && \
    useradd --system --uid 10001 --gid appgroup --shell /sbin/nologin --no-create-home appuser

# Line 11: Establish production deployment directory
WORKDIR /opt/service

# Line 12: Copy Spring Boot layers from build-stage with explicit ownership
COPY --from=build-stage --chown=appuser:appgroup /workspace/target/extracted/dependencies/ ./
COPY --from=build-stage --chown=appuser:appgroup /workspace/target/extracted/spring-boot-loader/ ./
COPY --from=build-stage --chown=appuser:appgroup /workspace/target/extracted/snapshot-dependencies/ ./
COPY --from=build-stage --chown=appuser:appgroup /workspace/target/extracted/application/ ./

# Line 13: Configure production JVM ergonomics for Linux cgroups
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"
ENV SERVER_PORT=8080

# Line 14: Document the listening HTTP port
EXPOSE 8080

# Line 15: Drop root privileges permanently
USER 10001:10001

# Line 16: Configure production healthcheck probe
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Line 17: Specify POSIX signal for graceful shutdown
STOPSIGNAL SIGTERM

# Line 18: Execute Spring Boot launcher in exec form
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
```

---

### Detailed Mechanical Breakdown (Line-by-Line)

#### Stage 1: Build Environment (Lines 1–7)

- **Line 1: `FROM maven:3.9.6-eclipse-temurin-21-jammy AS build-stage`**
  - **What it does**: Initializes the first stage named `build-stage`, pulling an image containing the Maven CLI, build tools, and full JDK 21 on top of Ubuntu Jammy.
  - **Mechanics**: Sets the base layer for compilation. The compiler marks this stage as intermediate; its heavy tools ($850\text{MB}$) will **never be copied into the final production artifact**.

- **Line 2: `WORKDIR /workspace`**
  - **What it does**: Directs the builder to set `/workspace` as the context directory.
  - **Mechanics**: Modifies the `WorkingDir` property and creates `/workspace`.

- **Line 3: `COPY pom.xml .`**
  - **What it does**: Copies **only** `pom.xml` from the host build context into `/workspace/pom.xml`.
  - **Why not `COPY . .`?**: This is the cardinal rule of build caching. Dependencies change far less often than business code. Isolating `pom.xml` ensures this layer's checksum only changes when project dependencies are modified.

- **Line 4: `RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -B`**
  - **What it does**: Downloads all external Maven dependencies into the local cache.
  - **Mechanics**: `--mount=type=cache` mounts a persistent directory from BuildKit's host cache into `/root/.m2`. Even if `pom.xml` changes slightly, previously downloaded dependencies are not re-downloaded from the internet. The `-B` flag enforces batch (non-interactive) mode.

- **Line 5: `COPY src ./src`**
  - **What it does**: Copies the application's Java source files into `/workspace/src`.
  - **Mechanics**: Computes content checksums for the source files. If a developer edits a Java controller, the build cache invalidates from this step forward, while Steps 1–4 are retrieved instantly from cache.

- **Line 6: `RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests -B`**
  - **What it does**: Compiles the Java source files, runs bytecode enhancements, and packages the application into an executable fat JAR in `/workspace/target/`.

- **Line 7: `RUN java -Djarmode=layertools -jar target/*.jar extract --destination target/extracted`**
  - **What it does**: Uses Spring Boot's internal `layertools` mode to unpackage the fat JAR into four discrete directories: `dependencies`, `spring-boot-loader`, `snapshot-dependencies`, and `application`.
  - **Why this matters**: In Step 12, copying these directories separately allows third-party libraries ($120\text{MB}$) to remain cached while only the recompiled application code ($2\text{MB}$) generates a new layer!

---

#### Stage 2: Production Runtime Environment (Lines 8–18)

- **Line 8: `FROM eclipse-temurin:21-jre-jammy AS runtime-stage`**
  - **What it does**: Discards the entire `build-stage` and initializes a fresh, clean runtime image containing only the minimal Headless Java Runtime Environment (JRE). Image size drops from $900\text{MB}$ to $220\text{MB}$.

- **Line 9: `RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*`**
  - **What it does**: Installs `curl` (needed for container health checks) while maintaining minimal image bloat.
  - **Mechanics**: 
    - `--no-install-recommends`: Skips non-essential suggested packages.
    - `rm -rf /var/lib/apt/lists/*`: Deletes the temporary package index lists in the **same execution layer**, ensuring the apt cache does not persist in the final image layer.

- **Line 10: `RUN groupadd --system --gid 10001 appgroup && useradd --system --uid 10001 --gid appgroup --shell /sbin/nologin --no-create-home appuser`**
  - **What it does**: Creates an unprivileged system user (`appuser`, UID `10001`) and group (`appgroup`, GID `10001`).
  - **Security Invariant**: 
    - `--shell /sbin/nologin`: Blocks interactive shell logins if the process is compromised.
    - `--no-create-home`: Prevents creating unnecessary home directory clutter.
    - Explicit UID/GID (`10001`): Fixed numeric IDs prevent collisions with host users and enable consistent Kubernetes `securityContext` policies.

- **Line 11: `WORKDIR /opt/service`**
  - **What it does**: Establishes the production execution path.

- **Line 12: `COPY --from=build-stage --chown=appuser:appgroup ...`**
  - **What it does**: Copies the extracted Spring Boot layers from `build-stage` into `/opt/service/`, assigning ownership directly to `appuser:appgroup`.
  - **Layer Invalidation Order**:
    1. `dependencies/` (Slowest changing: third-party dependencies).
    2. `spring-boot-loader/` (Framework launcher classes).
    3. `snapshot-dependencies/` (Internal company libraries).
    4. `application/` (Fastest changing: your compiled controllers and business logic).
  - **Why `--chown` on `COPY` is mandatory**: If you omit `--chown`, files are copied with root ownership. Running `RUN chown -R appuser:appgroup /opt/service` afterwards would duplicate all files in a second layer, doubling image size!

- **Line 13: `ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"`**
  - **What it does**: Configures production JVM container ergonomics:
    - `-XX:+UseContainerSupport`: Instructs the JVM to read cgroup limits for CPU and memory rather than host hardware limits.
    - `-XX:MaxRAMPercentage=75.0`: Dynamically allocates 75% of the container's memory limit to the JVM heap, leaving 25% for Metaspace, thread stacks, and native buffers.
    - `-XX:+ExitOnOutOfMemoryError`: Halts the JVM immediately when an OOM occurs, allowing the container orchestrator (Kubernetes/Docker) to restart the failed pod.

- **Line 14: `EXPOSE 8080`**
  - **What it does**: Documents that the application listens on port 8080.

- **Line 15: `USER 10001:10001`**
  - **What it does**: Switches the container execution context from `root` (UID 0) to `appuser` (UID 10001).
  - **Mechanics**: Drops all Linux capabilities. Any remote code execution exploit is trapped within an unprivileged sandbox.

- **Line 16: `HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 CMD curl -f http://localhost:8080/actuator/health || exit 1`**
  - **What it does**: Configures Docker's automated health monitoring probe:
    - `--interval=30s`: Probes the endpoint every 30 seconds.
    - `--timeout=3s`: Fails the check if `curl` does not respond within 3 seconds.
    - `--start-period=40s`: Warm-up grace period during JVM bootstrapping; failures during this window do not count toward `--retries`.
    - `--retries=3`: Marks the container status as `unhealthy` after 3 consecutive failures.

- **Line 17: `STOPSIGNAL SIGTERM`**
  - **What it does**: Explicitly sets POSIX signal 15 (`SIGTERM`) as the termination signal emitted on `docker stop`.

- **Line 18: `ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]`**
  - **What it does**: Boots the application.
  - **The `exec` Keyword Mechanic**: Running `exec java ...` causes the Java process to **replace the shell process**, inheriting `PID 1`. This ensures POSIX `SIGTERM` signals emitted by `docker stop` travel directly to the JVM for clean database connection draining and shutdown hooks.

---

## 06. Dockerfile Anti-Patterns vs. Production Solutions

| Anti-Pattern | Operational Failure | Staff-Level Solution |
| :--- | :--- | :--- |
| **`RUN apt-get update` on its own line** | Causes stale cache hits; subsequent builds never fetch latest security patches. | Always combine: `RUN apt-get update && apt-get install -y <pkg> && rm -rf /var/lib/apt/lists/*`. |
| **Baking Secrets into `ENV` or `ARG`** | Secrets are recorded in plaintext in image config JSON and visible via `docker inspect`. | Use BuildKit secret mounts: `RUN --mount=type=secret,id=token ./build.sh`. |
| **Running as Root (`USER root`)** | Container breakout exploits gain host root privileges. | Declare dedicated unprivileged user: `USER 10001:10001`. |
| **Using Shell Form for `ENTRYPOINT`** | Subshell swallows `SIGTERM`; container fails to stop gracefully and is killed after 10s timeout (`Exit 137`). | Use Exec Form with `exec`: `ENTRYPOINT ["java", "-jar", "app.jar"]`. |
| **Omitting `.dockerignore`** | Uploads gigabytes of local artifacts, `.git`, and `.env` secrets into the build context. | Maintain a strict `.dockerignore` file in the root directory. |
| **Monolithic Single-Stage Builds** | SDKs, compilers, test frameworks, and source code leak into production images, ballooning image sizes and CVE counts. | Enforce Multi-Stage builds: Build in stage 1, copy minimal artifact to stage 2. |
