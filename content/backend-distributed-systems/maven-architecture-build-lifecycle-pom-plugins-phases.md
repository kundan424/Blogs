---
title: "Maven Architecture & Build Lifecycle: POM Anatomy, Plugins & Phased Execution"
slug: maven-architecture-build-lifecycle-pom-plugins-phases
subject: backend-distributed-systems
abstract: An interactive, mentor-led guide to Apache Maven. Learn how the POM, Super POM, GAV coordinates, plugin execution goals, dependency scopes, and the three build lifecycles operate under the hood with hands-on terminal runs, clear ASCII diagrams, and production engineering practices.
tags:
  - maven
  - build-tools
  - devops
  - java
  - backend
published: true
publishDate: Nov 11, 2026
updatedDate: Nov 11, 2026
readTime: 20m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
---

# Maven Architecture & Build Lifecycle: POM Anatomy, Plugins & Phased Execution

Pull up a chair. If you have ever stared at a `pom.xml` file with hundreds of lines of XML tags, watched thousands of JAR files download to your hard drive, or spent three hours fighting an invisible `ClassNotFoundException` caused by two conflicting libraries, you are not alone.

At first glance, Apache Maven looks like an obstinate XML beast. But once someone explains the mental model behind it, Maven becomes one of the most reliable, predictable, and elegant tools in your engineering toolkit.

In this guide, we are going to look under the hood together. We will start from an empty terminal, construct a project from scratch, inspect the directory structure, demystify the coordinates and dependency graph, and trace how Maven's lifecycle engine binds plugins to turn plain text into a production-ready JAR.

---

## 01. Why Build Tools Exist (The Chaos Before Maven)

Before we run a single command, let's understand the problem Maven was created to solve.

Imagine you are building a Java application in 2002. You write ten classes. To compile them, you open your terminal and run:

```bash
javac -d bin src/com/company/*.java
```

That works. But then you want to write unit tests with JUnit. You download `junit.jar` from a website, place it in a folder named `lib/`, and now your compilation command becomes:

```bash
javac -cp "lib/junit.jar" -d bin src/com/company/*.java
```

Six months later, your team adds a logging library, a database driver, an XML parser, and a JSON serializer. Your `lib/` folder now has 45 JAR files. 

Then the real nightmare begins:
1. **Transitive Dependency Hell:** Library A requires `commons-codec-1.4.jar`, but Library B requires `commons-codec-1.15.jar`. Which one do you put on your classpath? If you pick the wrong one, your app crashes at 2:00 AM with `NoSuchMethodError`.
2. **"Works on My Machine":** Alice has Java 11 with custom classpath settings in Eclipse; Bob has Java 17 in IntelliJ; the production build server is running an old Ant script. The build fails on CI despite passing on both laptops.
3. **Directory Anarchy:** Every team structures their project differently. One developer puts source files in `src/`, another in `source/java/`, another in `code/`. Every time you join a new project, you spend your first two days figuring out how to build it.

### Enter Apache Maven: Convention Over Configuration

In 2004, Jason van Zyl and the Apache team introduced Maven with a radically simple philosophy:

> **Convention over Configuration.** If every Java project in the world follows the exact same folder structure and the exact same build phases, nobody has to write custom build scripts anymore.

When you adopt Maven:
- You don't tell the computer *how* to compile step-by-step.
- You declare *what* your project is, *what* it depends on, and Maven's engine figures out the rest.

---

## 02. The Standard Directory Layout (Your Project's Map)

Let's verify this in practice. When you create a standard Maven project, it follows an unyielding, predictable filesystem convention.

Here is the exact layout:

```text
my-backend-service/
├── pom.xml                                 <-- Project Object Model (The Brain)
└── src/
    ├── main/                               <-- Production Application Code
    │   ├── java/                           <-- Java source files (.java)
    │   │   └── com/example/service/
    │   │       └── Application.java
    │   └── resources/                      <-- Configs, properties, templates
    │       ├── application.properties
    │       └── logback.xml
    └── test/                               <-- Test Code (Never packaged in JAR)
        ├── java/                           <-- Test source files (*Test.java)
        │   └── com/example/service/
        │       └── ApplicationTest.java
        └── resources/                      <-- Test-only fixtures, mocks, SQL
            └── test-data.sql
```

Look at that layout closely. Notice two critical design decisions:

1. **Separation of Concerns:** `src/main` and `src/test` are strictly parallel. When Maven builds your production JAR, it compiles `src/main/java` and packages `src/main/resources`. Everything inside `src/test` is compiled, executed during test verification, and completely discarded from the final artifact. Your unit tests and test databases never accidentally bloat your production artifact.
2. **Zero Configuration Needed:** You never have to configure where your source code is. Maven's compiler plugin already assumes Java files live in `src/main/java`. If you put them anywhere else, Maven won't find them unless you write painful overrides. Stick to the convention.

---

## 03. POM Anatomy & The "GAV" Coordinates

At the root of every project sits `pom.xml` (Project Object Model). It is an XML declaration of your project identity, its dependencies, its configuration, and its build plugins.

Let's look at a clean, production-grade `pom.xml`:

```xml title="pom.xml"
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
                             https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- 1. The GAV Coordinates -->
    <groupId>com.company.payment</groupId>
    <artifactId>payment-gateway</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>Payment Gateway Core</name>
    <description>Core transaction processing engine</description>

    <!-- 2. Project Properties -->
    <properties>
        <maven.compiler.release>21</maven.compiler.release>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <jackson.version>2.17.0</jackson.version>
    </properties>

    <!-- 3. Dependencies -->
    <dependencies>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>${jackson.version}</version>
            <scope>compile</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

Let's dissect this piece by piece.

### 1. The "GAV" Coordinates: Software's GPS System

In Maven, every single library, framework, and project in the global Java ecosystem is uniquely identified by three coordinates known as **GAV**:

### The "GAV" Coordinates

| Coordinate | Meaning | Real-World Example |
| :--- | :--- | :--- |
| `groupId` | The organization, company, or reversed domain name | `com.fasterxml.jackson.core`<br>`org.springframework.boot` |
| `artifactId` | The specific project or module name | `jackson-databind`<br>`spring-boot-starter-web` |
| `version` | The specific release or development iteration | `2.17.0`<br>`3.2.4` |

When you publish this project, Maven builds an artifact named:
```text
${artifactId}-${version}.${packaging}
-> payment-gateway-1.0.0-SNAPSHOT.jar
```

### What does `-SNAPSHOT` mean?

Notice the `-SNAPSHOT` suffix. In Maven terminology:
- **`SNAPSHOT` (Development version):** Tells Maven this artifact is under active development. Maven will routinely check the remote repository for newer builds of the same version.
- **`Release` (e.g., `1.0.0` without SNAPSHOT):** Immutable. Once a release version is deployed to a repository, Maven assumes it will **never change**. If you deploy `1.0.0` and later modify the code, Maven will not re-download it on other machines because it caches release versions indefinitely.

### 2. The Invisible Ancestor: The Super POM

You might look at our `pom.xml` above and ask:
> *"Where did we configure that `src/main/java` should be compiled? Where did we specify that output goes to `target/`?"*

The answer is **inheritance**. Every Maven `pom.xml` implicitly inherits from the **Super POM** embedded inside the Maven runtime (`maven-model-builder.jar`).

To see your project's complete, merged configuration after combining your `pom.xml` with the Super POM, run this command in your terminal:

```bash
mvn help:effective-pom
```

Maven will print hundreds of lines of XML. You will discover default directories, default repository URLs (pointing to Maven Central), and default plugin bindings that you never had to write manually!

---

## 04. Dependency Scopes (Controlling Classpath Boundaries)

When you declare a dependency, you must specify *when* and *where* that JAR should be visible. Maven controls this through **dependency scopes**.

### Maven Dependency Scopes Matrix

| Scope | Compile CP (`src/main`) | Test CP (`src/test`) | Runtime (JVM Run) | Packaged into JAR? | Example Library |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`compile`** *(default)* | YES | YES | YES | YES | Jackson, Guava |
| **`provided`** | YES | YES | NO | NO | Servlet API, Lombok |
| **`runtime`** | NO | YES | YES | YES | PostgreSQL JDBC Driver |
| **`test`** | NO | YES | NO | NO | JUnit 5, Mockito |
| **`system`** | YES | YES | NO | NO | Local JAR *(Legacy, requires absolute filesystem path)* |
| **`import`** | N/A | N/A | N/A | NO | Spring BOM *(Only inside `<dependencyManagement>`)* |

Let's understand why this matters through real scenarios:

### Scenario A: The `provided` Scope (Lombok & Servlet Containers)
If you use **Project Lombok**, you only need it while compiling code so its annotation processor can generate getters and setters. Once the `.class` files are compiled, Lombok is useless at runtime. By setting `<scope>provided</scope>`, you ensure Lombok is never bundled into your final production JAR.

Similarly, if you deploy a WAR to Tomcat, Tomcat already provides the `servlet-api.jar`. If you bundle your own `servlet-api.jar` in your WAR, the two classloaders will collide and throw `ClassCastException`. Marking it `provided` keeps your artifact clean.

### Scenario B: The `runtime` Scope (Database Drivers)
Consider a PostgreSQL database driver:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.3</version>
    <scope>runtime</scope>
</dependency>
```
Your Java application should only write code against the standard `java.sql.Connection` and `java.sql.PreparedStatement` interfaces. You should **never** import `org.postgresql.PGConnection` directly into your business logic, because doing so tightly couples your code to Postgres. 

With `runtime` scope, the compiler will refuse to compile any file that attempts to directly import Postgres classes. But when your app runs, the driver is present on the classpath ready to handle connections. That is architectural enforcement at the build level!

---

## 05. The Maven Architecture: Under the Hood

Now, let's lift the hood of Maven itself. How does it work?

Here is a vital truth that shocks many developers:

> **Maven Core knows almost nothing about building software.**
> Maven Core doesn't know how to compile Java. It doesn't know how to run JUnit tests. It doesn't even know how to build a JAR file!

Maven Core is simply an **orchestration engine**. Its sole responsibilities are:
1. Parsing the `pom.xml`.
2. Resolving dependencies and downloading them into your local cache (`~/.m2`).
3. Managing the lifecycle phases.
4. Calling **Plugins** to do the actual heavy lifting.

![Maven Engine Architecture](/images/content/backend-distributed-systems/maven/backend-distributed-systems_maven_mod-01_lesson-1.1_maven-engine-architecture.svg "Maven Engine Architecture: POM Parsing, Dependency Resolution Graph, Repositories, Lifecycle Pipeline & Plugin Bindings")

Notice the flow: when you trigger a phase, Maven's Lifecycle Engine checks its internal registry, looks up which plugin goals are bound to that phase, downloads the plugins if needed, and executes them.

---

## 06. The 3 Lifecycles & Their Phased Assembly Line

Maven has three completely built-in, independent lifecycles:

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      clean      │       │     default     │       │      site       │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ Deletes build   │       │ Compiles, tests,│       │ Generates HTML  │
│ output directory│       │ packages, and   │       │ documentation & │
│ (target/)       │       │ deploys app     │       │ project reports │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

These three lifecycles do **not** depend on each other. If you run `mvn clean`, it runs the clean lifecycle. If you run `mvn package`, it runs the default lifecycle. They only run together if you specify both on the command line: `mvn clean package`.

### The Phased Assembly Line (Default Lifecycle)

Think of Maven's default lifecycle as an **automobile assembly line**. Each step is called a **Phase**, and they execute in strict sequential order:

```text
  [validate]
      │   Verifies project is correct and all information is available.
      ▼
  [compile]
      │   Compiles source code (src/main/java) into target/classes.
      ▼
  [test]
      │   Runs unit tests using Surefire. If a test fails, build stops!
      ▼
  [package]
      │   Takes compiled classes and packages them into a JAR or WAR.
      ▼
  [verify]
      │   Runs integration tests (Failsafe) and checks quality gates.
      ▼
  [install]
      │   Copies the packaged JAR into your local cache (~/.m2/repository).
      ▼
  [deploy]
          Copies the final JAR to a remote shared repository (Nexus/Artifactory).
```



### The Golden Rule of Lifecycles

> **When you call a phase, Maven automatically executes every single phase that comes before it.**

If you run:
```bash
mvn package
```
Maven does not simply build a JAR. It automatically executes:
1. `validate`
2. `generate-sources`
3. `process-sources`
4. `generate-resources`
5. `process-resources`
6. `compile`
7. `process-classes`
8. `generate-test-sources`
9. `process-test-sources`
10. `generate-test-resources`
11. `process-test-resources`
12. `test-compile`
13. `process-test-classes`
14. `test` (runs your unit tests)
15. `prepare-package`
16. `package` (finally creates the JAR)

If any unit test fails during the `test` phase, the assembly line immediately halts with a **BUILD FAILURE**. The `package` phase is never reached, preventing broken code from ever being bundled into an artifact!

---

## 07. Plugins & Goals: The Real Workers

We mentioned earlier that plugins do the actual work. But what is a plugin, technically?

- A **Plugin** is a collection of one or more **Goals**.
- A **Goal** is an executable task (a specific unit of work).

The notation used by Maven is `pluginPrefix:goalName`.

For example:
- `compiler:compile` → Goal `compile` inside the `maven-compiler-plugin`.
- `surefire:test` → Goal `test` inside the `maven-surefire-plugin`.
- `jar:jar` → Goal `jar` inside the `maven-jar-plugin`.
- `dependency:tree` → Goal `tree` inside the `maven-dependency-plugin`.

### Invoking Goals Directly vs. Triggering Lifecycles

You can run a plugin goal directly from your terminal without going through the lifecycle:

```bash
mvn dependency:tree
```
Here, you bypassed the lifecycle. Maven simply loaded the `maven-dependency-plugin` and executed its `tree` goal, printing your project's complete dependency graph.

### Binding Goals to Lifecycle Phases

Normally, you don't call goals directly. Instead, goals are **bound** to lifecycle phases.

Here is how you configure a plugin to bind to a specific lifecycle phase in your `pom.xml`:

```xml title="pom.xml"
<build>
    <plugins>
        <!-- Configure Java 21 Compiler -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.13.0</version>
            <configuration>
                <release>21</release>
            </configuration>
        </plugin>

        <!-- Generate a Git Commit Hash during package phase -->
        <plugin>
            <groupId>io.github.git-commit-id</groupId>
            <artifactId>git-commit-id-maven-plugin</artifactId>
            <version>8.0.2</version>
            <executions>
                <execution>
                    <id>get-the-git-infos</id>
                    <goals>
                        <goal>revision</goal>
                    </goals>
                    <phase>initialize</phase>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

In this snippet:
- We configured the standard `maven-compiler-plugin` to target Java 21.
- We added a third-party plugin `git-commit-id-maven-plugin` and explicitly bound its `revision` goal to the `initialize` phase. Whenever you run `mvn compile` or `mvn package`, Maven will automatically record your current Git SHA into a properties file!

---

## 08. Hands-On: A Walkthrough of Common Commands

Let's pull up our terminal and see what happens when we execute everyday Maven commands.

### 1. `mvn clean`
```bash
$ mvn clean
[INFO] Scanning for projects...
[INFO] -------------------< com.company.payment:payment-gateway >-------------------
[INFO] Building Payment Gateway Core 1.0.0-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO] 
[INFO] --- clean:3.3.2:clean (default-clean) @ payment-gateway ---
[INFO] Deleting E:\projects\payment-gateway\target
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] Total time:  0.420 s
```
**What just happened?**
The `maven-clean-plugin` ran its `clean` goal and wiped out the entire `target/` directory. All previous bytecode, test reports, and generated JARs are gone.

---

### 2. `mvn test`
```bash
$ mvn test
[INFO] --- resources:3.3.1:resources (default-resources) @ payment-gateway ---
[INFO] Copying 2 resources from src/main/resources to target/classes
[INFO] 
[INFO] --- compiler:3.13.0:compile (default-compile) @ payment-gateway ---
[INFO] Recompiling the module because of changed source code.
[INFO] Compiling 8 source files with javac [debug release 21] to target/classes
[INFO] 
[INFO] --- resources:3.3.1:testResources (default-testResources) @ payment-gateway ---
[INFO] Copying 1 resource from src/test/resources to target/test-classes
[INFO] 
[INFO] --- compiler:3.13.0:testCompile (default-testCompile) @ payment-gateway ---
[INFO] Compiling 4 source files with javac [debug release 21] to target/test-classes
[INFO] 
[INFO] --- surefire:3.2.5:test (default-test) @ payment-gateway ---
[INFO] Using auto detected provider: org.apache.maven.surefire.junitplatform.JUnitPlatformProvider
[INFO] Running com.company.payment.PaymentServiceTest
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.185 s -- in com.company.payment.PaymentServiceTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] BUILD SUCCESS
```
**What just happened?**
Look at the sequence printed in the log:
1. `resources:resources` copied files to `target/classes`.
2. `compiler:compile` compiled your production code.
3. `resources:testResources` copied test fixtures to `target/test-classes`.
4. `compiler:testCompile` compiled your test classes.
5. `surefire:test` launched the test runner and executed our test suite.

---

### 3. `mvn install`
```bash
$ mvn install
...
[INFO] --- jar:3.4.1:jar (default-jar) @ payment-gateway ---
[INFO] Building jar: E:\projects\payment-gateway\target\payment-gateway-1.0.0-SNAPSHOT.jar
[INFO] 
[INFO] --- install:3.1.2:install (default-install) @ payment-gateway ---
[INFO] Installing E:\projects\payment-gateway\pom.xml to C:\Users\user\.m2\repository\com\company\payment\payment-gateway\1.0.0-SNAPSHOT\payment-gateway-1.0.0-SNAPSHOT.pom
[INFO] Installing E:\projects\payment-gateway\target\payment-gateway-1.0.0-SNAPSHOT.jar to C:\Users\user\.m2\repository\com\company\payment\payment-gateway\1.0.0-SNAPSHOT\payment-gateway-1.0.0-SNAPSHOT.jar
[INFO] BUILD SUCCESS
```

**What is the difference between `mvn package` and `mvn install`?**
- `mvn package`: Creates the JAR file in your local project's `target/` folder.
- `mvn install`: Creates the JAR in `target/` **and then copies it into your machine's global repository cache (`~/.m2/repository`)**.

Why would you want it in `~/.m2/repository`? 
Because if you have another project on your machine that declares a dependency on `com.company.payment:payment-gateway:1.0.0-SNAPSHOT`, it can now find and use it without needing you to deploy it to an external server!

---

## 09. Dependency Resolution: How Maven Resolves Conflicts

What happens when your project depends on two libraries that require different versions of the same transitive dependency?

```text
                     Your Project
                     ├── Library-A:1.0
                     │   └── Shared-Lib:1.2  <-- Depth: 2
                     │
                     └── Library-B:2.0
                         └── Intermediate-Lib:3.0
                             └── Shared-Lib:1.0  <-- Depth: 3
```

Which version of `Shared-Lib` will Maven pick: `1.2` or `1.0`?

Maven uses a simple, deterministic rule:

### Rule: "Nearest Definition Wins"

Maven measures the distance (depth) of each dependency from the root of your project:
- `Shared-Lib:1.2` has a depth of **2** (Your Project → Library-A → Shared-Lib).
- `Shared-Lib:1.0` has a depth of **3** (Your Project → Library-B → Intermediate-Lib → Shared-Lib).

Because version `1.2` is closer to the root, **Maven selects `Shared-Lib:1.2`** and completely ignores `1.0`.

### What if the depth is identical?
If both were at depth 2, Maven uses **"First Declared Wins"**: whichever dependency appears first in your `pom.xml` wins.

### How to Inspect and Fix Conflicts

When a version conflict causes runtime errors, run this command:
```bash
mvn dependency:tree -Dverbose
```
Maven will print your entire tree, explicitly marking conflicts with `(omitted for conflict with 1.2)`.

If you ever need to force a specific version across your entire project, use `<dependencyManagement>`:

```xml title="pom.xml"
<dependencyManagement>
    <dependencies>
        <!-- Force version 1.2 everywhere, overriding all transitive versions -->
        <dependency>
            <groupId>com.company.common</groupId>
            <artifactId>shared-lib</artifactId>
            <version>1.2</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

`<dependencyManagement>` does not add a dependency to your classpath; it acts as a **central version lookup table**. Any dependency declared in `<dependencies>` (directly or transitively) will use the version defined here.

---

## 10. The Senior Engineer's Production Checklist

Before we finish, here are the production practices every senior backend engineer lives by:

### 1. Always Commit the Maven Wrapper (`mvnw`)
Never require teammates or CI build servers to manually install Maven. Generate the Maven wrapper in your repository:
```bash
mvn wrapper:wrapper
```
This generates:
- `mvnw` (Linux/macOS shell script)
- `mvnw.cmd` (Windows batch script)
- `.mvn/wrapper/maven-wrapper.properties` (pins the exact Maven version, e.g., 3.9.6)

Now, anyone can clone your repository and build it immediately without installing Maven:
```bash
./mvnw clean package
```

### 2. Never Use Range Versions in Dependencies
Maven allows version ranges like `[1.0, 2.0)`. **Never use them in production.** A new release pushed by a third party on a Friday evening could automatically be pulled into your Monday morning CI build and break production without any code changes on your branch. Pin explicit versions.

### 3. Use Dependency Convergence Checks
In enterprise microservices, add the `maven-enforcer-plugin` with the `<dependencyConvergence/>` rule. This plugin will intentionally fail the build if any two dependencies bring in conflicting versions of the same library, forcing developers to explicitly resolve version ambiguities.

---

## Summary & Mental Model Review

Let's recap what we have deconstructed:

1. **Convention over Configuration:** Keep code in `src/main/java` and tests in `src/test/java`. Let Maven handle the paths.
2. **The GAV Coordinates:** `groupId`, `artifactId`, and `version` uniquely identify every library in existence.
3. **The 3 Lifecycles:** `clean`, `default`, and `site` are completely distinct.
4. **Phased Assembly Line:** Calling `mvn package` runs every prior phase in sequence (`validate` → `compile` → `test` → `package`).
5. **Plugins are the Workers:** Maven core only orchestrates; plugin goals do the compiling, testing, and packaging.
6. **Nearest Wins:** In dependency conflicts, the dependency closest to your `pom.xml` in the tree wins.

Now, the next time you look at a `pom.xml` or run `./mvnw package`, you aren't just memorizing commands—you can visualize the entire engine running beneath your fingertips.
