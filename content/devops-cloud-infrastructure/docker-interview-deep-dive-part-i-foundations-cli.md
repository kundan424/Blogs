---
title: "Docker Architecture & CLI: Interview Deep Dive (Part I - Foundations & Core Mechanics)"
slug: docker-interview-deep-dive-part-i-foundations-cli
subject: devops-cloud-infrastructure
abstract: "Staff-level DevOps deep dive analyzing Docker Foundations & CLI mechanics: Linux kernel virtualization vs hypervisors, Copy-on-Write storage, client-daemon architecture, volume lifecycles, and POSIX signal propagation across 25 interview scenarios."
tags:
  - docker
  - devops
  - containers
  - cloud-infrastructure
  - linux-kernel
published: true
publishDate: Nov 08, 2026
updatedDate: Nov 08, 2026
readTime: 36m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
---

# Docker Architecture & CLI: Interview Deep Dive (Part I - Foundations & Core Mechanics)

An enterprise DevOps and systems engineering interview manual analyzing the Linux kernel primitives, client-daemon socket interactions, Copy-on-Write storage drivers, and runtime lifecycles behind containerization across 25 core foundational questions (Questions 1–25).

---

## 01. Containers vs. Virtual Machines: Kernel-Level Architecture

:::callout{type="info" title="Interview Question"}
**Question:** How do containers differ from hypervisor-based Virtual Machines at the OS kernel, hypervisor, and hardware levels?
:::

![Container vs. Virtual Machine Architectural Topology](/images/content/container-vs-vm-architecture.svg)

### Mechanical Breakdown
- **Virtual Machines (Hardware-Level Virtualization)**:
  A hypervisor (Type 1 bare-metal like KVM/ESXi, or Type 2 hosted like VirtualBox) abstracts physical hardware (CPU, MMU, NIC, Disk) into virtual hardware. Every guest VM runs its **own fully independent OS kernel**, an init system (`systemd`), and device drivers. CPU instructions execute via hardware-assisted virtualization (Intel VT-x / AMD-V), but privileged kernel operations trap into the hypervisor, creating measurable hypercall overhead. Memory must be pre-allocated or dynamically reclaimed via balloon drivers.
- **Containers (Operating System-Level Virtualization)**:
  Containers are **not virtual machines**. A container is simply a standard Linux process running directly on the host CPU, constrained by two fundamental Linux kernel subsystems:
  1. **Namespaces** (what the process can *see*): `pid`, `net`, `mnt`, `ipc`, `uts`, `user`.
  2. **Control Groups (cgroups)** (what the process can *consume*): limits on CPU shares, memory ceilings, disk I/O, and maximum PIDs.

| Dimension | Virtual Machines (VMs) | Linux Containers (Docker) |
| :--- | :--- | :--- |
| **Virtualization Boundary** | Hardware abstraction layer (Hypervisor) | OS Kernel syscall boundary (Namespaces & cgroups) |
| **Operating System Kernel** | Each VM runs its own dedicated Guest Kernel | All containers **share the exact same Host Linux Kernel** |
| **Boot Latency** | 30 to 120 seconds (BIOS $\to$ GRUB $\to$ Kernel $\to$ Systemd) | **Sub-second (5 to 50 milliseconds)** (Direct `clone()` syscall) |
| **Memory Footprint** | Gigabytes (Guest OS memory, buffer cache, page tables) | Megabytes (Only the application memory + thin metadata) |
| **I/O Performance** | Virtualized block devices with hypervisor indirection | **Near-native bare-metal execution** |

---

## 02. Images vs. Containers: The Structural Relationship

:::callout{type="info" title="Interview Question"}
**Question:** What is the strict architectural relationship between a Docker Image and a Docker Container?
:::

```text
       CLASS VS. INSTANCE: IMAGE TO CONTAINER MAPPING
       
   ┌────────────────────────────────────────────────────────┐
   │ Docker Image (Static Blueprint / Immutable Class)      │
   │ • Manifest JSON + Config (Entrypoint, Env, Ports)      │
   │ • Stack of Read-Only Content-Addressable tar layers    │
   └───────────────────────────┬────────────────────────────┘
                               │
               docker run (Instantiation)
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                                               ▼
┌─────────────────────────────┐         ┌─────────────────────────────┐
│ Container 1 (Running Proc)  │         │ Container 2 (Running Proc)  │
│ • Linux PID: 14892          │         │ • Linux PID: 14930          │
│ • Isolated net/mnt/pid ns   │         │ • Isolated net/mnt/pid ns   │
│ • Thin Read-Write Layer A   │         │ • Thin Read-Write Layer B   │
└─────────────────────────────┘         └─────────────────────────────┘
```

An **Image** is a static, immutable, cryptographically verifiable archive of root filesystem layers paired with execution metadata (working directory, environment variables, exposed ports, and default entrypoint). It is stored on disk in content-addressable storage chunks (blobs) indexed by SHA-256 hashes.

A **Container** is a live, dynamic instance of an image. At the kernel level, creating a container involves:
1. Allocating an isolated set of Linux namespaces.
2. Attaching cgroup limits for CPU and memory.
3. Mounting the image's read-only layers using a UnionFS storage driver (Overlay2).
4. Stacking a thin, mutable **Read-Write Layer** on top.
5. Invoking the Linux `clone()` syscall with flags `CLONE_NEWPID | CLONE_NEWNET | CLONE_NEWNS` to execute the image's entrypoint binary.

---

## 03. Docker Engine Architecture: Client, Daemon, and Registries

:::callout{type="info" title="Interview Question"}
**Question:** Explain the roles of the Docker Client (CLI), Docker Daemon (`dockerd`), and Docker Registries.
:::

![Docker Engine Client-Daemon-Registry Architecture](/images/content/docker-architecture-client-daemon-registry.svg)

1. **Docker Client (`docker`)**:
   A lightweight command-line interface and REST client. It does **no container execution or image building itself**. When you type `docker run`, it serializes the parameters into an HTTP REST request and dispatches it to the daemon over a local Unix domain socket (`/var/run/docker.sock`) or secure remote mutual-TLS TCP socket (`tcp://0.0.0.0:2376`).
2. **Docker Daemon (`dockerd`)**:
   A persistent background service managing the local container ecosystem:
   - Exposes the Docker Engine REST API.
   - Coordinates with **BuildKit** to assemble layered images.
   - Manages virtual network interfaces (`veth` pairs, bridge `docker0`, iptables rules).
   - Manages volumes in `/var/lib/docker/volumes/`.
   - Delegates container execution down to **`containerd`** and **`runc`**.
3. **Docker Registry (Distribution Layer)**:
   A content-addressable storage repository for OCI-compliant image manifests and layer blobs (e.g., Docker Hub, AWS ECR, Google Artifact Registry). When an image is requested, the daemon queries the registry manifest, checks which layer SHA-256 digests already exist in its local graph driver cache, and pulls only the missing layers in parallel.

---

## 04. Copy-on-Write (CoW) & Overlay2 Storage Driver

:::callout{type="info" title="Interview Question"}
**Question:** What happens to the underlying filesystem when a container writes to a file that belongs to an immutable base image?
:::

![Overlay2 UnionFS & Copy-on-Write Mechanics](/images/content/docker-image-layers-copy-on-write.svg)

Docker uses the Linux kernel's **Overlay2** union filesystem driver to merge multiple directory trees into a single coherent view.

### The Four Overlay2 Directories
- `lowerdir`: The read-only stack of image layers (e.g., base OS, libraries, app binary).
- `upperdir`: The container's private, mutable read-write filesystem layer.
- `workdir`: An internal scratch directory used by Overlay2 to prepare atomic file operations before committing them to `upperdir`.
- `merged`: The combined virtual mount point that the containerized process sees as its root filesystem (`/`).

### What Happens During File Operations?
1. **Reading a File**: The kernel scans from the top `upperdir` down through `lowerdir` layers. The first instance found is returned.
2. **Modifying an Existing File (Copy-on-Write)**:
   - When a process opens a lower-layer file with write intent (`O_WRONLY` or `O_RDWR`), the kernel intercepts the syscall.
   - The entire file is copied up from `lowerdir` into `upperdir`.
   - The process writes its changes exclusively to the copy in `upperdir`.
   - The underlying image file in `lowerdir` remains completely untouched on disk.
3. **Deleting a File (Whiteout)**:
   - Deleting a file that exists in an immutable lower layer cannot remove it from `lowerdir`.
   - Instead, Overlay2 writes a special **whiteout character device** (`c 0 0`) with the prefix `.wh.<filename>` into `upperdir`.
   - The union mount masks the file, making it completely invisible inside the container's `merged` view.

:::callout{type="warning" title="Production Performance Hazard"}
Copy-on-Write introduces disk latency when large files (e.g., a 10GB database file or search index) located in an image layer are modified for the first time, because the entire 10GB must be duplicated up to `upperdir`. Always use **Docker Volumes** for database files to bypass the union filesystem and achieve raw native I/O speed.
:::

---

## 05. Port Publishing (`-p`) vs. Port Exposing (`EXPOSE`)

:::callout{type="info" title="Interview Question"}
**Question:** What is the fundamental difference between the `EXPOSE` instruction in a `Dockerfile` and the `-p` / `-P` flags in `docker run`?
:::

```text
       PORT EXPOSING VS. PORT PUBLISHING
       
   Dockerfile: EXPOSE 8080
   ┌────────────────────────────────────────────────────────┐
   │ METADATA ONLY: Documentation flag in Image Config JSON.│
   │ Does NOT alter host iptables!                          │
   │ External traffic cannot reach the container!           │
   └────────────────────────────────────────────────────────┘

   docker run -p 80:8080 nginx
   ┌────────────────────────────────────────────────────────┐
   │ ACTIVE NETWORK ROUTING:                                │
   │ 1. Docker daemon injects DNAT rule into Linux iptables │
   │ 2. Host Port 80 (eth0) ──DNAT──▶ Container IP:8080     │
   │ External world can reach the service!                  │
   └────────────────────────────────────────────────────────┘
```

### The Exact Distinction
1. **`EXPOSE <port>` (Documentation Metadata)**:
   - Written inside the `Dockerfile`.
   - It **does not open any ports** on the host operating system.
   - It acts purely as architectural metadata between image authors and operators.
   - The only functional impact is when the container is run with `-P` (capital P): Docker picks random ephemeral host ports ($>32768$) and maps them to all `EXPOSE`d ports.
2. **`-p <host_port>:<container_port>` (Active NAT Port Forwarding)**:
   - Defined at runtime in `docker run`.
   - Configures the host's Linux kernel network stack by injecting a **DNAT (Destination Network Address Translation)** rule into the `iptables` `PREROUTING` and `DOCKER` chains.
   - Any packet arriving at the host on `<host_port>` is translated and forwarded across the bridge interface (`docker0`) to the container's virtual IP address.

```bash title="iptables-inspection.sh"
# Inspect the actual kernel DNAT rule created by -p 80:8080
sudo iptables -t nat -L DOCKER -n -v

# Output:
# DNAT  tcp  --  *  *  0.0.0.0/0  0.0.0.0/0  tcp dpt:80 to:172.17.0.2:8080
```

---

## 06. Container Lifecycle States & State Transitions

:::callout{type="info" title="Interview Question"}
**Question:** Trace the lifecycle transitions between `created`, `running`, `paused`, `stopped`, and `dead`.
:::

```text
                     DOCKER CONTAINER LIFECYCLE STATES
                     
                         docker create
                               │
                               ▼
                        ┌─────────────┐
                        │   CREATED   │
                        └──────┬──────┘
                               │ docker start
                               ▼
        ┌─────────────────────────────────────────────┐
        │                   RUNNING                   │◀─────────────┐
        └──────┬───────────────────────┬──────────────┘              │
               │                       │                             │
  docker pause │          docker stop  │ docker restart              │ docker unpause
               ▼          (SIGTERM)    ▼                             │
        ┌─────────────┐         ┌─────────────┐                      │
        │   PAUSED    │         │   STOPPED   │                      │
        │ (cgroups    │         │ (Exited     │                      │
        │  freezer)   │         │  status)    │                      │
        └──────┬──────┘         └──────┬──────┘                      │
               │                       │                             │
               └───────────────────────┴─────────────────────────────┘
                                       │
                                       │ Fatal unmount failure
                                       ▼
                                ┌─────────────┐
                                │    DEAD     │ ──▶ Requires docker rm -f
                                └─────────────┘
```

1. **Created**: Root filesystem and network namespaces are allocated, but the main container process has not been executed.
2. **Running**: The primary entrypoint process (`PID 1` inside the container) is active, consuming CPU and memory.
3. **Paused**: The process is frozen at the kernel level using the **cgroups freezer subsystem**. All CPU cycles are suspended instantly without terminating the process or dropping open socket descriptors.
4. **Stopped (Exited)**: The primary process has terminated (either via exit code 0, uncaught signal, or `SIGKILL`). The container's writable filesystem layer remains preserved on disk.
5. **Dead**: A corrupted state where the daemon failed to cleanly unmount the container's filesystem resources or release file locks during teardown.

---

## 07. Graceful Termination vs. Forceful Termination: `docker stop` vs. `docker kill`

:::callout{type="info" title="Interview Question"}
**Question:** What POSIX signals do `docker stop` and `docker kill` emit, and what is the standard grace period timeout?
:::

```text
       DOCKER STOP: GRACEFUL SHUTDOWN TIMELINE
       
   0.0s: docker stop container_id
         │
         ├──▶ Daemon sends SIGTERM (Signal 15) to PID 1 inside container
         │    Process stops accepting new traffic, drains connection pool,
         │    flushes write-ahead logs, and commits transactions.
         │
   10.0s: Standard grace period expires (configurable via -t)
         │
         └──▶ Process failed to exit in time!
              Daemon sends SIGKILL (Signal 9) to host PID
              Kernel terminates process immediately. Exit Code: 137.
```

- **`docker stop` (Graceful)**:
  1. Emits `SIGTERM` (Signal 15) to PID 1 inside the container.
  2. Starts a countdown timer (default: **10 seconds**).
  3. If the process terminates before the timeout, it exits with the application's clean exit status.
  4. If the timer reaches zero and the process is still running, Docker sends `SIGKILL` (Signal 9), which cannot be caught or ignored by any process.
- **`docker kill` (Forceful & Immediate)**:
  - Bypasses the grace period entirely.
  - Sends `SIGKILL` (or a user-specified signal like `docker kill -s SIGHUP`) directly to the container process.

:::callout{type="tip" title="Configuring Custom Grace Periods"}
For database clusters (PostgreSQL, Cassandra) or stateful event consumers (Kafka), 10 seconds is rarely enough to flush memory buffers. Configure `--stop-timeout`:
```bash
docker run -d --stop-timeout 45 my-kafka-consumer:v1
```
:::

---

## 08. Environment Variable Injection: Precedence & Security

:::callout{type="info" title="Interview Question"}
**Question:** How do `-e`, `--env-file`, and Dockerfile `ENV` instructions differ in precedence and runtime accessibility?
:::

### Precedence Hierarchy (Highest to Lowest)
When variables with identical keys collide, Docker resolves them in this strict order:
$$\text{CLI Flag } (\texttt{-e KEY=val}) \;\;>\;\; \text{Env File } (\texttt{--env-file .env}) \;\;>\;\; \text{Dockerfile } (\texttt{ENV KEY=val})$$

```bash title="env-precedence-demo.sh"
# Dockerfile contains: ENV APP_ENV=production

# 1. Default (reads Dockerfile ENV):
docker run --rm alpine printenv APP_ENV
# Output: production

# 2. Overridden via --env-file (.env contains APP_ENV=staging):
docker run --rm --env-file .env alpine printenv APP_ENV
# Output: staging

# 3. Overridden via CLI flag -e:
docker run --rm --env-file .env -e APP_ENV=development alpine printenv APP_ENV
# Output: development
```

### Security Considerations
- `ENV` declared in a `Dockerfile` is baked directly into the **Image Config JSON metadata**. Anyone who runs `docker inspect <image>` or pulls the image can read these values in plaintext. Never put database passwords or API keys in `ENV` instructions!
- `--env-file` and `-e` inject variables at container instantiation time, keeping them out of the static image layers.

---

## 09. Persistent Storage Architecture: Volumes vs. Bind Mounts vs. `tmpfs`

:::callout{type="info" title="Interview Question"}
**Question:** What is the difference between Volumes, Bind Mounts, and `tmpfs` mounts?
:::

![Docker Storage Mount Topologies](/images/content/docker-storage-mount-types.svg)

| Storage Type | Host Storage Location | Host Dependency | Ideal Use Case |
| :--- | :--- | :--- | :--- |
| **Named Volume** | `/var/lib/docker/volumes/<name>/_data` | Managed entirely by Docker daemon | Production databases (PostgreSQL, MySQL), shared data between containers |
| **Bind Mount** | Any arbitrary path (e.g., `/home/dev/src`) | Tightly coupled to host directory structure | Local development (hot code reload), mounting host configs (`/etc/resolv.conf`) |
| **`tmpfs` Mount** | Host System RAM (Virtual memory) | Never written to physical disk | Sensitive cryptographic keys, high-throughput temporary caches |

```bash title="storage-mounts-cheatsheet.sh"
# 1. Named Volume (syntax: volume_name:container_path)
docker run -d -v pg_data:/var/lib/postgresql/data postgres:16

# 2. Bind Mount (syntax: /absolute/host/path:container_path)
docker run -d -v $(pwd)/src:/app/src node:20

# 3. tmpfs Mount (in-memory only)
docker run -d --tmpfs /tmp/secrets:rw,noexec,nosuid redis:7
```

---

## 10. Volume Lifecycle Management & Orphan Prevention

:::callout{type="info" title="Interview Question"}
**Question:** When you delete a container with `docker rm`, what happens to its associated named volume? How does `-v` prevent orphaned volumes?
:::

```text
       VOLUME ORPHANING HAZARD
       
   docker run -v my_data:/data ...
   ┌────────────────────────────────────────────────────────┐
   │ Named Volume: my_data                                  │
   │ Path: /var/lib/docker/volumes/my_data/_data            │
   └───────────────────────────▲────────────────────────────┘
                               │ Mounted
   ┌───────────────────────────┴────────────────────────────┐
   │ Container: api_server (ID: 4f1a...)                    │
   └────────────────────────────────────────────────────────┘
                               │
                   docker rm api_server
                               │
   ┌───────────────────────────▼────────────────────────────┐
   │ Container deleted!                                     │
   │ Volume my_data SURVIVES ON DISK INDEFINITELY!           │
   │ (Leaves orphaned disk clutter over time)               │
   └────────────────────────────────────────────────────────┘
```

By default, **Docker never deletes volumes automatically when a container is removed**. This is a safety feature to prevent catastrophic data loss.

### Preventing Orphaned Storage Bloat
1. **Atomic Deletion with Container**:
   Pass the `-v` flag when removing containers to purge anonymous volumes attached to that container:
   ```bash
   docker rm -v <container_id>
   ```
2. **Pruning Abandoned Volumes**:
   Identify and delete all volumes no longer referenced by at least one existing container:
   ```bash
   # Dry-run inspection
   docker volume ls -f dangling=true

   # Complete cleanup
   docker volume prune -f
   ```

---

## 11. Inspection & Telemetry: `docker inspect` vs. `docker stats`

:::callout{type="info" title="Interview Question"}
**Question:** How does `docker inspect` differ from `docker stats`, and what low-level JSON metadata does `inspect` expose?
:::

- **`docker inspect` (Static Configuration & State Dump)**:
  Extracts the complete declarative JSON configuration of an image, volume, network, or container directly from the daemon's runtime state database. It details:
  - Exact IP addresses, gateway, MAC address, and subnet masks.
  - Mount points (source, destination, propagation modes, R/W status).
  - GraphDriver storage details (paths to `upperdir`, `lowerdir`, `merged`).
  - Executable entrypoint and arguments array.
  - Healthcheck logs and exit codes.

```bash title="inspect-jq-recipes.sh"
# Extract exact container IP address using Go template
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' nginx-web

# Extract container restart count and OOMKilled status
docker inspect -f 'RestartCount: {{.RestartCount}} | OOMKilled: {{.State.OOMKilled}}' api-worker
```

- **`docker stats` (Live Resource Streaming)**:
  Polls the Linux kernel **cgroup controllers** in real-time, streaming CPU utilization percentage, active memory usage vs limits, network I/O bytes sent/received, and block disk I/O throughput.

---

## 12. Container Logging Architecture & Disk Exhaustion Traps

:::callout{type="info" title="Interview Question"}
**Question:** How does the default `json-file` logging driver capture stdout/stderr, and why can it cause disk space leaks?
:::

```text
       CONTAINER LOGGING PIPELINE
       
   Container Process (stdout / stderr)
                 │
                 ▼
     Linux Pipe (file descriptor 1 & 2)
                 │
                 ▼
       dockerd Logging Subsystem
                 │
                 ▼
   /var/lib/docker/containers/<id>/<id>-json.log
   (Grows unbounded by default until Host Disk is 100% full!)
```

### The Root Cause
By default, Docker uses the `json-file` logging driver. It serializes every line emitted to stdout/stderr into a JSON payload with timestamps and appends it to `/var/lib/docker/containers/<id>/<id>-json.log`. **Docker does not enable log rotation by default.** A chatty application can generate gigabytes of logs per day, eventually exhausting the host's root disk partition.

### The Production Fix: Enforcing Log Rotation
Configure global log rotation rules inside `/etc/docker/daemon.json`:

```json title="/etc/docker/daemon.json"
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "5"
  }
}
```
*Effect: Caps log retention to a maximum of $5 \times 50\text{MB} = 250\text{MB}$ per container before rotating out the oldest logs.*

---

## 13. Image Tagging & Immutability: The `:latest` Anti-Pattern

:::callout{type="info" title="Interview Question"}
**Question:** Why is the `latest` tag considered an anti-pattern in production deployments? How do SHA256 image digests solve this?
:::

### The Danger of `:latest`
1. **Non-Deterministic Builds**: `latest` is simply a mutable pointer. It does not mean "the most stable" or "the most recent build"; it is simply the default tag assigned when no tag is specified.
2. **Irreproducible Deployments**: If Container Host A pulls `my-app:latest` at 10:00 AM and Host B pulls `my-app:latest` at 10:30 AM after a new push, the two nodes run completely different application binaries under the identical version name.
3. **Rollback Impossibility**: You cannot roll back to "the previous latest".

### The Solution: Content-Addressable Cryptographic Digests
Every image manifest has an immutable SHA-256 digest calculated over its serialized metadata and layer tarballs. Referencing by digest guarantees **100% reproducible deployments**:

```bash title="digest-deployment.sh"
# Fragile & Non-deterministic:
docker run -d my-service:latest

# Enterprise Production Standard (Content-Addressable Digest):
docker run -d my-service@sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
```

---

## 14. Base Image Archetypes: Scratch, Alpine, Distroless, and Debian

:::callout{type="info" title="Interview Question"}
**Question:** Differentiate between `scratch`, Alpine, Debian-slim, and Ubuntu base images in terms of glibc, size, and CVE footprints.
:::

| Base Image | Size | C Standard Library | Package Manager | Vulnerability Surface | Best For |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`scratch`** | **0 MB** | None | None | **Zero CVEs** | Statically linked binaries (Go, Rust) |
| **`alpine`** | ~7 MB | **`musl libc`** | `apk` | Extremely Low | Lightweight microservices (Caveat: musl DNS) |
| **`debian-slim`** | ~75 MB | **`glibc`** | `apt` | Low to Moderate | Java (JVM), Python, Node.js runtime compatibility |
| **`ubuntu`** | ~180 MB | **`glibc`** | `apt` | Moderate to High | Legacy enterprise software, dev containers |

:::callout{type="danger" title="The Alpine musl libc Production Trap"}
Alpine replaces the standard GNU C Library (`glibc`) with `musl libc`. Certain native runtimes (Python wheels with C-extensions, Java JVM memory profilers, Golang binaries compiled with cgo) suffer from performance degradation, memory fragmentation, or DNS resolution differences when running under `musl`. When running enterprise JVM or Python stacks, **`debian-slim`** is generally preferred over Alpine.
:::

---

## 15. Interactive Execution: `docker run -it` vs. `docker exec -it`

:::callout{type="info" title="Interview Question"}
**Question:** What is the mechanical difference between `docker run -it` and `docker exec -it`?
:::

```text
   docker run -it ubuntu /bin/bash
   ┌────────────────────────────────────────────────────────┐
   │ BRAND NEW CONTAINER:                                   │
   │ Allocates new namespaces, cgroups, and writable layer. │
   │ /bin/bash runs as PID 1 inside the new container.      │
   └────────────────────────────────────────────────────────┘

   docker exec -it <existing_id> /bin/bash
   ┌────────────────────────────────────────────────────────┐
   │ JOIN EXISTING CONTAINER:                               │
   │ Calls setns() syscall to enter already running ns.     │
   │ /bin/bash runs as PID 42 alongside existing PID 1.     │
   └────────────────────────────────────────────────────────┘
```

- **`-i` (`--interactive`)**: Keeps standard input (`stdin`) open to the container process even if unattached.
- **`-t` (`--tty`)**: Allocates a pseudo-TTY terminal device, enabling ANSI color codes, tab completion, and line editing.
- **`docker run -it`**: **Creates a brand-new container instance** from the image and assigns the requested command as `PID 1`.
- **`docker exec -it`**: **Enters an already running container**. Uses the Linux kernel `setns()` system call to attach a new child process to the target container's existing namespaces without restarting it.

---

## 16. Container Auto-Restart Policies

:::callout{type="info" title="Interview Question"}
**Question:** Compare restart policies: `no`, `on-failure`, `always`, and `unless-stopped`.
:::

| Policy | On Clean Exit (Code 0) | On Crash (Non-Zero Exit) | On Docker Daemon Restart / Host Reboot |
| :--- | :--- | :--- | :--- |
| **`no`** (Default) | Do not restart | Do not restart | Do not restart |
| **`on-failure[:max]`** | Do not restart | **Restart** (up to optional max retry limit) | Only restarts if it was running when daemon crashed |
| **`always`** | **Restart** | **Restart** | **Restart** (Even if manually stopped prior to reboot!) |
| **`unless-stopped`** | **Restart** | **Restart** | **Restart**, **UNLESS** the user explicitly stopped it with `docker stop` |

:::callout{type="tip" title="Enterprise Recommendation"}
Use **`unless-stopped`** for production daemon containers. Unlike `always`, if a systems engineer manually shuts down a container for maintenance (`docker stop container_name`), `unless-stopped` respects that state and **does not resurrect the container** upon the next server reboot.
:::

---

## 17. Dangling vs. Unused Images

:::callout{type="info" title="Interview Question"}
**Question:** What is a dangling image (`<none>:<none>`), why does it occur during rebuilds, and how does `docker image prune` clean it?
:::

### What Causes `<none>:<none>`?
When you rebuild an image with an existing tag:
```bash
docker build -t my-api:v1 . # Builds initial image (ID: 0a1b2c)
# Code is modified...
docker build -t my-api:v1 . # Builds new image (ID: 9f8e7d)
```
The tag `my-api:v1` is detached from image `0a1b2c` and reassigned to the new image `9f8e7d`. The old image still exists on disk, but has no repository or tag names pointing to it. It becomes a **Dangling Image**.

```bash title="image-cleanup.sh"
# 1. Clean ONLY dangling images (unreferenced by any tag):
docker image prune -f

# 2. Clean ALL unused images (not currently referenced by at least one container):
docker image prune -a -f
```

---

## 18. The Build Context and `.dockerignore`

:::callout{type="info" title="Interview Question"}
**Question:** Why is `.dockerignore` critical for performance and security, and what happens to the build context if it is omitted?
:::

When you execute:
```bash
docker build -t my-app:v1 .
```
The `.` specifies the **Build Context**. Before any instructions in the `Dockerfile` run, the Docker CLI archives the **entire directory** into a tarball and uploads it over the socket to the Docker daemon.

```text
       BUILD CONTEXT TRANSFER HAZARD
       
   Project Directory:
   ├── src/ (2 MB)
   ├── node_modules/ (650 MB)  <-- Should NOT be transferred!
   ├── .git/ (400 MB)          <-- Contains repo history & secrets!
   └── .env (1 KB)             <-- Plaintext credentials!
                 │
                 ▼ Without .dockerignore
   CLI transfers 1.05 GB over Unix socket before build even begins!
   Build takes minutes; image layers bloat; secrets leak!
```

### Essential Production `.dockerignore`
```gitignore title=".dockerignore"
.git
.gitignore
node_modules
target/
build/
.env*
*.pem
*.key
Dockerfile
README.md
```

---

## 19. Filesystem Injection: `COPY` vs. `ADD`

:::callout{type="info" title="Interview Question"}
**Question:** What additional capabilities does `ADD` possess over `COPY` (URL fetching, tar auto-extraction), and why does Docker best practice favor `COPY`?
:::

```text
       COPY VS. ADD FUNCTIONALITY
       
                  ┌───────────────┐
                  │  COPY src dst │
                  └───────┬───────┘
                          │ Pure, explicit, predictable file copy
                          ▼
            Copies local files into container

                  ┌───────────────┐
                  │   ADD src dst │
                  └───────┬───────┘
                          │ Magic behaviors:
                          ├── 1. Fetches remote URLs: ADD http://...
                          └── 2. Auto-extracts tarballs: ADD rootfs.tar.gz /
```

### Why Docker Best Practice Strongly Favors `COPY`
1. **Explicit Predictability**: `COPY` does one thing: copies local files/folders into the container.
2. **Layer Bloat Avoidance with URLs**: If you use `ADD https://example.com/package.tar.gz /tmp/`, the downloaded archive becomes an immutable part of that image layer even if a subsequent `RUN rm` deletes it. Best practice is to use `RUN curl ... && tar ... && rm` in a single chained command.
3. **The Only Valid Use Case for `ADD`**: Injecting and auto-extracting a local tarball directly into a container filesystem root (e.g., creating a base image: `ADD alpine-minirootfs.tar.gz /`).

---

## 20. Working Directory: `WORKDIR` vs. `RUN cd`

:::callout{type="info" title="Interview Question"}
**Question:** Why should you never use `RUN cd /app` in a Dockerfile, and how does `WORKDIR` preserve state across subsequent instructions?
:::

```dockerfile title="BrokenDockerfile.dockerfile"
# BROKEN ANTI-PATTERN:
FROM alpine:3.19
RUN cd /app               # Step runs in subshell Container A and exits!
RUN touch config.json     # Runs in fresh Container B at root / ! config.json is in / NOT /app!
```

### Why `RUN cd` Fails
Every single `RUN` instruction in a `Dockerfile` executes in an **independent, isolated subshell container** that commits a new image layer upon completion. When `RUN cd /app` finishes, its shell process terminates. The next `RUN` command launches a brand new shell at the default directory (`/`), completely forgetting the previous `cd` command.

### The Correct Pattern: `WORKDIR`
```dockerfile title="CorrectDockerfile.dockerfile"
FROM alpine:3.19
WORKDIR /app              # Sets working directory metadata in image config JSON
RUN touch config.json     # Safely executed inside /app/config.json!
```
*`WORKDIR` automatically creates the target directory if it does not exist and ensures all subsequent `RUN`, `CMD`, `ENTRYPOINT`, and `COPY` instructions execute within that context.*

---

## 21. User Identity & Root Security Hazards inside Containers

:::callout{type="info" title="Interview Question"}
**Question:** What user does a container run as by default, and why is running as `root` an enterprise security hazard?
:::

### The Hazard of Running as Root (UID 0)
By default, containers execute as **`root` (UID 0)**. While Linux namespaces restrict what this root process can see, **it has UID 0 privileges inside its namespace**. If an attacker finds an application vulnerability (e.g., remote code execution via log4j) and escapes the container via a kernel exploit or misconfigured volume mount, **they possess root permissions on the host operating system**.

### The Solution: Non-Root Execution
```dockerfile title="Dockerfile"
FROM eclipse-temurin:21-jre-alpine

# 1. Create a dedicated system group and unprivileged user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --chown=appuser:appgroup target/app.jar app.jar

# 2. Switch user context: drops all root privileges
USER appuser

ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 22. Registry Rate Limits & Mirror Architectures

:::callout{type="info" title="Interview Question"}
**Question:** How do pull limits affect unauthenticated pipelines, and how does configuring a private registry (or mirror) mitigate this?
:::

Docker Hub imposes strict pull rate limits on anonymous IP addresses (typically **100 pulls per 6 hours**). In enterprise Kubernetes clusters or CI/CD pipelines (GitHub Actions, GitLab CI), hundreds of builds share the same NAT gateway IP address, causing pipelines to crash with:
`HTTP 429 Too Many Requests: You have reached your unauthenticated pull rate limit.`

### Architectural Remedies
1. **Registry Pull-Through Caching**:
   Deploy an in-cluster pull-through caching proxy (e.g., Harbor or Docker Registry v2 mirror) that caches external image layers locally on your internal subnet.
2. **Daemon Mirror Configuration**:
   Configure `/etc/docker/daemon.json` to route pulls through the internal mirror automatically:
   ```json
   {
     "registry-mirrors": ["https://mirror.internal.company.net"]
   }
   ```

---

## 23. Inspecting Storage Mutations: `docker diff`

:::callout{type="info" title="Interview Question"}
**Question:** What does the `docker diff` command reveal about the container's writable filesystem layer?
:::

`docker diff <container>` inspects the container's **`upperdir` (read-write layer)** relative to the underlying immutable image layers.

```bash title="docker-diff-output.sh"
docker diff my-running-nginx

# Output:
# C /var
# C /var/run
# A /var/run/nginx.pid
# C /var/log/nginx
# A /var/log/nginx/access.log
# D /etc/nginx/conf.d/default.conf
```

- **`A` (Added)**: A brand new file or directory created in the container's writable layer.
- **`C` (Changed)**: An existing file or directory inherited from an image layer was modified (copied up via CoW and altered).
- **`D` (Deleted)**: A file from the image was deleted (represented by an OverlayFS whiteout marker in `upperdir`).

---

## 24. Process Tracking: `docker top` vs. Host System Process Views

:::callout{type="info" title="Interview Question"}
**Question:** How does `docker top` display host OS PIDs compared to the containerized process view?
:::

```text
       PID NAMESPACE TRANSLATION MATRIX
       
   HOST PROCESS TREE (Root PID Namespace):
   systemd (PID: 1)
   └── containerd (PID: 1102)
       └── containerd-shim (PID: 4520)
           └── node server.js (PID: 4545) ──▶ HOST PID: 4545
                                                  │
                 Mapped via Linux clone(CLONE_NEWPID)
                                                  │
   CONTAINER PROCESS TREE (Container PID Namespace):
   node server.js (PID: 1) ──────────────────▶ CONTAINER PID: 1
```

### Why PIDs Differ
Inside the container's isolated **PID Namespace**, the primary process believes it is **PID 1** (the init process of its private world).
However, from the vantage point of the host operating system's root PID namespace, that containerized process is simply another standard Linux task assigned a regular host PID (e.g., PID `4545`).

- `docker top <container>` displays the process mapped to its **Host PIDs**.
- `docker exec <container> ps aux` displays the process mapped to its **Container-Internal PIDs**.

---

## 25. Exporting vs. Saving Images: `export`/`import` vs. `save`/`load`

:::callout{type="info" title="Interview Question"}
**Question:** What is the structural difference between `docker export` / `import` (flattened container snapshot) and `docker save` / `load` (layered image tarball)?
:::

| Dimension | `docker export` & `docker import` | `docker save` & `docker load` |
| :--- | :--- | :--- |
| **Source Target** | Operates on a **running or stopped Container** | Operates on an **Image** |
| **Layer History** | **Flattens everything into a single layer** (All build history is lost) | **Preserves all distinct image layers**, commit history, and digests |
| **Metadata Retention**| Loses `ENTRYPOINT`, `ENV`, `WORKDIR`, `EXPOSE` metadata | **Preserves 100% of image metadata and config JSON** |
| **Primary Use Case** | Scrubbing history / exporting an arbitrary Linux rootfs | Migrating images between air-gapped systems without a registry |

```bash title="export-vs-save.sh"
# 1. Flatten container into single layer (metadata stripped):
docker export container_id > flattened_rootfs.tar
docker import flattened_rootfs.tar my-flattened-image:v1

# 2. Backup full layered image (all metadata & history intact):
docker save -o complete_image.tar my-app:v1.0.0
docker load -i complete_image.tar
```

---

## 26. Architectural Takeaways & Enterprise Level-1 Invariants

| Level-1 Domain | Staff-Level Operational Invariant |
| :--- | :--- |
| **Runtime Model** | Containers are native host Linux processes governed by namespaces and cgroups; never model them as heavy virtual machines. |
| **Storage Architecture** | Leverage Overlay2 Copy-on-Write for stateless layers; always bypass the union filesystem using named volumes for database I/O. |
| **Security Baseline** | Never run production workloads as root (UID 0); always inject dedicated unprivileged system users and avoid embedding secrets in `ENV`. |
| **Signals & Lifecycle** | Ensure PID 1 handles `SIGTERM` gracefully within the grace period before the Docker daemon enforces an abrupt `SIGKILL` (Exit 137). |
| **Registry Hygiene** | Pin images to cryptographically verifiable SHA-256 digests in production pipelines to eliminate non-deterministic build drift from `:latest`. |
