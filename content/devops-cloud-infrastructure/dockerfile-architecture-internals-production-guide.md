---
title: "Dockerfile Architecture & Internals"
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

![Dockerfile BuildKit DAG Architecture](/images/content/devops-cloud-infrastructure/docker/devops-cloud-infrastructure_docker_mod-01_lesson-1.2_buildkit-dag-architecture.svg)

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
- **The `scratch` Target**: A special, empty base image (0 bytes) used for deploying statically compiled standalone binaries (Go, Rust).
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

### How a Dockerfile Deploys an App (Concept by Concept)

To deploy a Spring Boot application properly in production, you use a **Multi-Stage Dockerfile**. Stage 1 compiles the code using Maven and the full JDK; Stage 2 copies only the final `.jar` into a lightweight JRE image so your production container isn't bloated with source code and Maven caches.

```dockerfile title="Dockerfile"
# ==========================================
# STAGE 1: Build Stage
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build

# Cache dependencies first
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .
RUN ./mvnw dependency:go-offline

# Copy source and compile fat JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests

# ==========================================
# STAGE 2: Production Runtime Stage
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy only the built artifact from Stage 1
COPY --from=builder /build/target/*.jar app.jar

# Document the port the app listens on
EXPOSE 8080

# Define the startup command
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

### Every Dockerfile Term & Concept Explained

#### `FROM <image>:<tag> [AS <name>]` (Base Image & Multi-Stage)
Every Dockerfile starts with `FROM`. Instead of building an operating system from scratch, you start from a pre-built foundation layer—here, Alpine Linux pre-installed with Eclipse Temurin Java 21. Using `AS builder` names the first stage so you can discard the heavy JDK and Maven cache later, keeping the final production image ~180MB instead of ~800MB.

#### Image Layers & Layer Caching
Every instruction (`FROM`, `COPY`, `RUN`) creates a read-only layer on top of the previous one. Docker caches these layers. Notice how `COPY pom.xml .` and `RUN ./mvnw dependency:go-offline` come before `COPY src ./src`. If you only change a Java controller and rebuild, Docker sees `pom.xml` hasn't changed, skips downloading Maven dependencies from the internet, and reuses the cached layer—cutting build times from minutes to seconds.

#### `WORKDIR /app` (Working Directory)
Sets the current directory inside the container for all subsequent commands (`RUN`, `COPY`, `ENTRYPOINT`). If the folder doesn't exist, Docker creates it automatically. This eliminates the need to write messy instructions like `RUN cd /app && ...`.

#### `COPY <src> <dest>`
Copies files from your local machine (the Build Context) into the container's filesystem. In Stage 2, `COPY --from=builder` reaches back into Stage 1's filesystem to grab the compiled `.jar` and leaves everything else behind.

#### `RUN <command>` (Build-Time Execution)
Executes a shell command while the image is being built and commits the result as a new layer. Used for compiling code, installing OS packages, or creating system users (`adduser`). It does not run when the container boots.

#### `USER <user>:<group>`
By default, Docker containers run as root (`UID 0`). If an attacker exploits a vulnerability in your app, running as root makes it easier to compromise the host. Switching to an unprivileged user (`spring`) locks down permissions.

#### `EXPOSE <port>`
Purely metadata/documentation telling developers and orchestration tools that the application inside the container listens on port 8080. It does not actually open the port on your host machine—you still map ports at runtime using `-p 8080:8080` (e.g., `docker run -p 8080:8080 myapp`), which forwards traffic from the host's port 8080 to the container's internal port 8080.

#### `ENV <key>=<value>` (Environment Variables)
Sets environment variables inside the container (e.g., `ENV SPRING_PROFILES_ACTIVE=prod`). In production, secrets like `SPRING_DATASOURCE_PASSWORD` are injected outside the Dockerfile at runtime via `docker run -e` or Docker Compose so secrets aren't baked into the image.

#### `ENTRYPOINT` vs. `CMD` (Runtime Execution)
Unlike `RUN` (which runs during `docker build`), `ENTRYPOINT` and `CMD` specify the process that starts when the container boots (`docker run`).
- `ENTRYPOINT ["java", "-jar", "app.jar"]` sets the fixed executable that the container runs. The container stays alive only as long as this process (PID 1) is running; if the Java process exits, the container stops.
- `CMD` provides default arguments to that `ENTRYPOINT` (or a default command that can be easily overridden from the CLI).

---

### Detailed Line-by-Line Command Breakdown & Mechanical Working

To understand how Docker compiles and runs this multi-stage container under the hood, let's trace every instruction step by step:

#### Stage 1: Build Stage (Lines 1–8)

- **Line 1: `FROM eclipse-temurin:21-jdk-alpine AS builder`**
  - **Command & Syntax**: `FROM <base-image> AS <stage-alias>`
  - **Under the Hood**: Pulls an Alpine Linux image bundled with Eclipse Temurin OpenJDK 21. Alpine uses `musl libc` and BusyBox utilities, yielding a minimal ~300MB compiler footprint. The `AS builder` token tags this graph branch in BuildKit's DAG, designating it as an intermediate compilation target whose intermediate layers will not leak into the production release.
  
- **Line 2: `WORKDIR /build`**
  - **Command & Syntax**: `WORKDIR <absolute-path>`
  - **Under the Hood**: Updates the OCI configuration property `WorkingDir` to `/build`. If the `/build` directory does not exist, the Docker daemon creates it automatically (`mkdir -p /build`). All subsequent relative commands (`.` and `./src`) resolve against `/build`.

- **Line 3: `COPY pom.xml .`**
  - **Command & Syntax**: `COPY <host-path> <container-path>`
  - **Under the Hood**: Copies the Maven Project Object Model file from the local workspace to `/build/pom.xml`. BuildKit computes the SHA-256 checksum of `pom.xml`. Because dependencies change far less frequently than business code, isolating `pom.xml` preserves the dependency cache layer.

- **Line 4: `COPY .mvn/ .mvn/` & `COPY mvnw .`**
  - **Command & Syntax**: `COPY <host-directory> <container-directory>` / `COPY <file> <container-dest>`
  - **Under the Hood**: Copies the Maven Wrapper engine (`mvnw` shell script and `.mvn/wrapper/maven-wrapper.properties`). This guarantees consistent build reproducibility: the container uses the exact Maven version pinned to the repository without requiring Maven to be pre-installed on the host or base image.

- **Line 5: `RUN ./mvnw dependency:go-offline`**
  - **Command & Syntax**: `RUN <build-time-shell-command>`
  - **Under the Hood**: Invokes Maven's Dependency Plugin in non-interactive batch mode to download all dependencies, plugins, and parent POMs declared in `pom.xml` into the local container directory (`/root/.m2/repository`). When this step completes, Docker snapshots this state into an immutable image layer. Subsequent builds with identical `pom.xml` will execute this step in **0.0 seconds** via cache hit.

- **Line 6: `COPY src ./src`**
  - **Command & Syntax**: `COPY <host-src-dir> <container-dest-dir>`
  - **Under the Hood**: Injects the application's Java source files, resources, and configuration into `/build/src`. This line serves as the **cache invalidation boundary**. When a software engineer edits application business logic, only this layer and downstream layers rebuild; the heavy dependency download from Line 5 remains fully cached.

- **Line 7: `RUN ./mvnw clean package -DskipTests`**
  - **Command & Syntax**: `RUN <build-time-shell-command>`
  - **Under the Hood**: Executes Maven compiler and package plugins. `clean` ensures no stale classes remain, while `package` compiles `.java` sources into `.class` bytecode and packages everything into an executable Spring Boot fat JAR inside `/build/target/*.jar`. Passing `-DskipTests` bypasses running unit/integration test suites during container image compilation, delegating test execution to dedicated CI/CD pipeline test stages.

---

#### Stage 2: Production Runtime Stage (Lines 9–17)

- **Line 8: `FROM eclipse-temurin:21-jre-alpine`**
  - **Command & Syntax**: `FROM <runtime-image>`
  - **Under the Hood**: Completely resets the build context by pulling a fresh, ultra-lightweight Alpine Linux image containing **only the Java Runtime Environment (JRE 21)**. All compilers (`javac`), source files, local `.git` metadata, and cached `.m2` repository artifacts from Stage 1 are abandoned. The final image size plummets from ~800MB to ~180MB, radically shrinking the attack surface and download latency.

- **Line 9: `WORKDIR /app`**
  - **Command & Syntax**: `WORKDIR <absolute-path>`
  - **Under the Hood**: Establishes `/app` as the execution directory for the production service container.

- **Line 10: `RUN addgroup -S spring && adduser -S spring -G spring`**
  - **Command & Syntax**: `RUN <alpine-user-creation-command>`
  - **Under the Hood**: Alpine Linux utilizes BusyBox user-management tooling:
    - `addgroup -S spring`: Creates a system-level group named `spring` with a low system GID.
    - `adduser -S spring -G spring`: Creates an unprivileged system user `spring` without root privileges, assigned to group `spring`.
    - **Security Impact**: Containers default to `root` (UID 0). Running as root means any arbitrary code execution vulnerability (such as a Log4j or serialization exploit) allows the attacker to compromise container internals and attempt kernel breakout to the host. Creating an unprivileged user establishes defense-in-depth.

- **Line 11: `USER spring:spring`**
  - **Command & Syntax**: `USER <user>:<group>`
  - **Under the Hood**: Modifies the OCI image config JSON property `User` to `spring:spring`. From this point forward in the Dockerfile and throughout container runtime, all commands and process forks run with dropped privileges.

- **Line 12: `COPY --from=builder /build/target/*.jar app.jar`**
  - **Command & Syntax**: `COPY --from=<stage-alias> <source-path> <dest-path>`
  - **Under the Hood**: Multi-stage extraction. The builder reaches across the stage boundary into the isolated filesystem of the `builder` stage, selects the compiled Spring Boot fat JAR from `/build/target/`, and copies it into `/app/app.jar`.

- **Line 13: `EXPOSE 8080`**
  - **Command & Syntax**: `EXPOSE <port>`
  - **Under the Hood**: Inscribes the metadata field `"ExposedPorts": { "8080/tcp": {} }` in the image manifest. It documents the listening port for service meshes, Kubernetes ingress, and developers. It does not publish the port on the host network automatically.

- **Line 14: `ENTRYPOINT ["java", "-jar", "app.jar"]`**
  - **Command & Syntax**: `ENTRYPOINT ["executable", "param1", "param2"]` (Exec Form)
  - **Under the Hood**: Configures the default container execution process using the JSON array **Exec Form**. The Linux kernel invokes `execve("/usr/bin/java", ["java", "-jar", "app.jar"], ...)` directly, making the JVM process **PID 1** inside the container namespace.
  - **Signal Handling Mechanics**: Because there is no intermediary subshell (`/bin/sh -c`), POSIX signals emitted by the container orchestrator (`SIGTERM` during `docker stop` or Kubernetes pod eviction) travel directly to the Java process. This triggers Spring Boot's shutdown hooks, allowing active HTTP transactions to complete and HikariCP connection pools to disconnect gracefully before timeout.

---

### From Dockerfile to Live Deployment

Once you have authored your Dockerfile, deploying the application follows a clean three-step production lifecycle:

```text
       THE 3-STEP CONTAINER DEPLOYMENT LIFECYCLE
       
   ┌────────────────────────────────────────────────────────┐
   │ 1. BUILD (Local / CI Server)                           │
   │    docker build -t username/myapp:1.0.0 .              │
   │    • Evaluates .dockerignore                           │
   │    • Executes Stage 1 (JDK compile) & Stage 2 (JRE)    │
   │    • Outputs immutable OCI image snapshot              │
   └───────────────────────────┬────────────────────────────┘
                               │
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │ 2. PUSH (Distribution)                                 │
   │    docker push username/myapp:1.0.0                    │
   │    • Uploads layer diffs to Container Registry         │
   │    • Docker Hub / AWS ECR / Google Artifact Registry   │
   └───────────────────────────┬────────────────────────────┘
                               │
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │ 3. RUN (Production Environment)                        │
   │    docker run -p 8080:8080 -e ENV=prod username/myapp  │
   │    • Server pulls immutable image layers               │
   │    • Injects environment secrets (DB password, JWT)    │
   │    • Connects to isolated virtual bridge network       │
   │    • Boots containerized JVM process as non-root       │
   └────────────────────────────────────────────────────────┘
```

1. **Build (`docker build -t username/myapp:1.0.0 .`)**:  
   The Docker daemon reads your Dockerfile, executes the multi-stage DAG, caches reusable layers, and outputs an immutable OCI image tagged `username/myapp:1.0.0`.

2. **Push (`docker push username/myapp:1.0.0`)**:  
   You upload that image to a centralized container registry (such as Docker Hub, GitHub Container Registry, AWS ECR, or Google Artifact Registry).

3. **Run (`docker run / docker compose up`)**:  
   Your production server pulls `username/myapp:1.0.0` from the registry, injects production environment variables (PostgreSQL URL, Redis host, JWT secrets), attaches persistent Volumes if local storage is needed, and starts the container on an isolated virtual Network.

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
