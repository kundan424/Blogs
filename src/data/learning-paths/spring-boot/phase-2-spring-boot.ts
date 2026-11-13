import { LearningModule } from '../../../types';

export const phase2Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // PHASE 2: SPRING BOOT 3 CORE & REST APIS
  // -----------------------------------------------------------------------
  {
    id: 'sb-mod-08',
    number: '08',
    title: 'Spring Boot 3 Fundamentals',
    description:
      'Conventions over configuration, bootstrap sequences, auto-configuration conditions, and container runtimes.',
    lessons: [
      {
        id: 'sb-8-1',
        number: '8.1',
        title: 'What is Spring Boot? Opinionated Conventions & Initializr Anatomy',
        noteSlug: 'what-is-spring-boot-opinionated-conventions-initializr-anatomy',
        description:
          'The philosophy of opinionated conventions over configuration, starter dependencies, dependency management BOMs, and the anatomy of a generated Spring Initializr project.',
        status: 'published',
        readTime: '20m read',
        topics: ['spring-boot', 'conventions', 'starters', 'initializr', 'maven'],
      },
      {
        id: 'sb-8-2',
        number: '8.2',
        title: 'Anatomy of @SpringBootApplication: Configuration, Auto-Configuration & Component Scanning',
        noteSlug: 'anatomy-spring-boot-application-configuration-autoconfiguration-componentscan',
        description:
          'Deep breakdown of the composite meta-annotation: @SpringBootConfiguration and CGLIB proxyBeanMethods, @EnableAutoConfiguration and Spring Boot 3 AutoConfiguration.imports, and @ComponentScan package scanning invariants.',
        status: 'published',
        readTime: '20m read',
        topics: ['spring-boot', 'auto-configuration', 'component-scan', 'configuration', 'architecture'],
      },
      {
        id: 'sb-8-3',
        number: '8.3',
        title: 'Embedded Servlet Containers: Tomcat, Jetty & Undertow (Web vs App Servers)',
        noteSlug: 'embedded-servlet-containers-tomcat-jetty-undertow-web-vs-app-servers',
        description:
          'Architectural paradigms of Web Servers, Servlet Containers, and Application Servers, embedded container mechanics, and thread models across Tomcat, Jetty, and Undertow with Java 21 Virtual Threads.',
        status: 'published',
        readTime: '22m read',
        topics: ['tomcat', 'jetty', 'undertow', 'servlet-containers', 'architecture', 'virtual-threads'],
      },
      {
        id: 'sb-8-4',
        number: '8.4',
        title: 'External Configuration: YAML Hierarchy, Profiles & @ConfigurationProperties',
        noteSlug: 'spring-boot-external-configuration-yaml-profiles-configurationproperties',
        description:
          'Property precedence order, application.properties vs YAML hierarchy, environment profiles, and type-safe @ConfigurationProperties validation using Java 21 records.',
        status: 'published',
        readTime: '22m read',
        topics: ['spring-boot', 'configuration', 'yaml', 'profiles', 'configuration-properties', 'architecture'],
      },
      {
        id: 'sb-8-5',
        number: '8.5',
        title: 'Executable Packaging & CDS Optimization',
        description:
          'Fat JAR layout, BOOT-INF classes, layered container builds, and Class Data Sharing (CDS) to cut startup latency.',
        status: 'published',
        noteSlug: 'spring-boot-architecture-build-packaging-deployment-interview-guide',
        readTime: '10m read',
        topics: ['spring-boot', 'packaging', 'docker', 'devops'],
      },
    ],
  },
  {
    id: 'sb-mod-09',
    number: '09',
    title: 'Building RESTful APIs with Spring MVC',
    description:
      'DispatcherServlet pipeline, request mapping mechanics, parameter binding, and response envelope structuring.',
    lessons: [
      {
        id: 'sb-9-1',
        number: '9.1',
        title: 'Spring MVC Architecture: DispatcherServlet, HandlerMappings & HttpMessageConverters',
        noteSlug: 'spring-boot-internal-architecture-request-lifecycle-auto-configuration',
        description:
          'The anatomy of an incoming HTTP request: DispatcherServlet dispatch loop, HandlerMapping resolution, HandlerAdapter invocation, and Jackson JSON serialization.',
        status: 'published',
        readTime: '12m read',
        topics: ['spring-mvc', 'dispatcher-servlet', 'jackson'],
      },
      {
        id: 'sb-9-2',
        number: '9.2',
        title: 'REST Controllers: @RestController, Path Variables, Request Bodies & Headers',
        description:
          'Developing clean REST endpoints: @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping, @PathVariable, @RequestParam, @RequestBody, and @RequestHeader.',
        status: 'upcoming',
        readTime: '10m read',
        topics: ['spring-mvc', 'rest-api', 'controllers'],
      },
      {
        id: 'sb-9-3',
        number: '9.3',
        title: 'Response Handling: ResponseEntity, Status Codes & Custom Response Envelopes',
        description:
          'Crafting consistent API contracts: ResponseEntity<T>, setting Location headers on 201 Created, 204 No Content, and unified enterprise response envelopes.',
        status: 'upcoming',
        readTime: '08m read',
        topics: ['rest-api', 'api-design', 'spring-mvc'],
      },
    ],
  },
  {
    id: 'sb-mod-10',
    number: '10',
    title: 'Input Validation (Jakarta Validation)',
    description:
      'Declarative request validation, constraint enforcement, and custom validator implementation.',
    lessons: [
      {
        id: 'sb-10-1',
        number: '10.1',
        title: 'Declarative Request Validation: Constraints, @Valid & @Validated',
        description:
          'Applying standard constraints: @NotNull, @NotBlank, @Size, @Min, @Max, @Email, @Pattern, and distinguishing method-level @Validated from parameter @Valid.',
        status: 'upcoming',
        readTime: '09m read',
        topics: ['validation', 'jakarta', 'spring-boot'],
      },
      {
        id: 'sb-10-2',
        number: '10.2',
        title: 'Custom Constraint Annotations & Custom Validator Implementation',
        description:
          'Authoring custom validation logic: creating ConstraintValidator<A, T> implementations, composing constraints, and dynamic error payload messages.',
        status: 'upcoming',
        readTime: '10m read',
        topics: ['validation', 'custom-validators', 'clean-code'],
      },
    ],
  },
  {
    id: 'sb-mod-11',
    number: '11',
    title: 'Global Exception Handling',
    description:
      'Centralized controller advisories, HTTP status mapping, and the RFC 7807 ProblemDetail standard.',
    lessons: [
      {
        id: 'sb-11-1',
        number: '11.1',
        title: 'Controller Advisories: @RestControllerAdvice & @ExceptionHandler Mechanics',
        description:
          'Intercepting controller exceptions globally, mapping domain exceptions to HTTP statuses, and handling MethodArgumentNotValidException payloads.',
        status: 'upcoming',
        readTime: '09m read',
        topics: ['exception-handling', 'rest-api', 'spring-mvc'],
      },
      {
        id: 'sb-11-2',
        number: '11.2',
        title: 'Modern RFC 7807 Standard: ProblemDetail API in Spring Boot 3',
        description:
          'Implementing RFC 7807 problem details: using Spring Boot 3 ProblemDetail class, custom properties, URI instance identifiers, and standardized error schemas.',
        status: 'upcoming',
        readTime: '08m read',
        topics: ['spring-boot-3', 'rfc-7807', 'api-standards'],
      },
    ],
  },
  {
    id: 'sb-mod-12',
    number: '12',
    title: 'Layered Architecture & DTO Mapping',
    description:
      'Controller-Service-Repository boundaries, entity encapsulation, and compile-time DTO transformation.',
    lessons: [
      {
        id: 'sb-12-1',
        number: '12.1',
        title: 'Strict Layered Boundaries: Controller to Service to Repository Isolation',
        description:
          'Why entities must never escape the service layer, single responsibility across web, service, and persistence tiers, and circular dependency avoidance.',
        status: 'upcoming',
        readTime: '10m read',
        topics: ['software-architecture', 'clean-code', 'layering'],
      },
      {
        id: 'sb-12-2',
        number: '12.2',
        title: 'DTO Pattern with Java Records & Compile-Time MapStruct Mapping',
        description:
          'Data Transfer Objects using modern Java records, eliminating reflection overhead via compile-time MapStruct code generation, and comparing with ModelMapper.',
        status: 'upcoming',
        readTime: '11m read',
        topics: ['mapstruct', 'java-records', 'dto-pattern'],
      },
    ],
  },
];
