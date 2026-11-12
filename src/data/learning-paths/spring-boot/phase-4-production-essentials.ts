import { LearningModule } from '../../../types';

export const phase4Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // PHASE 4: PRODUCTION-GRADE ESSENTIALS (SECURITY, TESTING & OBSERVABILITY)
  // -----------------------------------------------------------------------
  {
    id: 'sb-mod-18',
    number: '18',
    title: 'Spring Security 6 & Modern Stateless Authentication',
    description:
      'Security filter chain lifecycle, lambda DSL configuration, stateless JWT authentication, and method security.',
    lessons: [
      {
        id: 'sb-18-1',
        number: '18.1',
        title: 'SecurityFilterChain Architecture & Non-Deprecated Lambda DSL Configuration',
        description:
          'Replacing legacy WebSecurityConfigurerAdapter: configuring SecurityFilterChain bean, authorizeHttpRequests lambda DSL, AuthenticationManager, and BCryptPasswordEncoder.',
        status: 'upcoming',
        readTime: '12m read',
        topics: ['spring-security', 'security', 'authentication'],
      },
      {
        id: 'sb-18-2',
        number: '18.2',
        title: 'Stateless Authentication with JWT: Issuance, Signature Verification & Claims',
        description:
          'Building a stateless JWT filter: token generation (HMAC/RSA), extracting claims, signature verification, and populating SecurityContextHolder without server sessions.',
        status: 'upcoming',
        readTime: '14m read',
        topics: ['jwt', 'stateless-auth', 'spring-security'],
      },
      {
        id: 'sb-18-3',
        number: '18.3',
        title: 'Role-Based Access Control (RBAC) & Method Security with @PreAuthorize',
        description:
          'Enabling method security with @EnableMethodSecurity: hasRole vs hasAuthority, SpEL expressions in @PreAuthorize, and securing service methods.',
        status: 'upcoming',
        readTime: '09m read',
        topics: ['rbac', 'authorization', 'spring-security'],
      },
    ],
  },
  {
    id: 'sb-mod-19',
    number: '19',
    title: 'Testing Spring Boot Applications',
    description:
      'Testing pyramid, unit tests with Mockito, web and JPA slice tests, and containerized integration tests.',
    lessons: [
      {
        id: 'sb-19-1',
        number: '19.1',
        title: 'Unit Testing with JUnit 5 & Mockito: Strict Isolation & Stubs',
        description:
          'Fast isolated unit tests: JUnit 5 lifecycle (@Test, @ParameterizedTest), Mockito annotations (@Mock, @InjectMocks), stubbing with when(), and asserting invocations with verify().',
        status: 'upcoming',
        readTime: '10m read',
        topics: ['junit5', 'mockito', 'unit-testing'],
      },
      {
        id: 'sb-19-2',
        number: '19.2',
        title: 'Slice Testing: Web Layer (@WebMvcTest) & Persistence Layer (@DataJpaTest)',
        description:
          'Targeted slice testing: MockMvc controller assertions with @WebMvcTest, in-memory repository tests with @DataJpaTest, and TestEntityManager.',
        status: 'upcoming',
        readTime: '11m read',
        topics: ['slice-testing', 'spring-test', 'mockmvc'],
      },
      {
        id: 'sb-19-3',
        number: '19.3',
        title: 'Integration Testing with Testcontainers: Real PostgreSQL & MySQL Containers',
        description:
          'Eliminating H2 in-memory divergence: running disposable Docker database containers during maven test via Testcontainers and @DynamicPropertySource.',
        status: 'upcoming',
        readTime: '13m read',
        topics: ['testcontainers', 'docker', 'integration-testing'],
      },
    ],
  },
  {
    id: 'sb-mod-20',
    number: '20',
    title: 'Observability, Actuator & Health Checks',
    description:
      'Production metrics telemetry, custom health indicators, structured logging, and OpenAPI documentation.',
    lessons: [
      {
        id: 'sb-20-1',
        number: '20.1',
        title: 'Spring Boot Actuator Production Endpoints, Metrics & Custom HealthIndicators',
        description:
          'Exposing /actuator/health, /actuator/metrics, /actuator/info, securing actuator management ports, and authoring custom HealthIndicator classes for downstream probes.',
        status: 'upcoming',
        readTime: '10m read',
        topics: ['actuator', 'observability', 'monitoring'],
      },
      {
        id: 'sb-20-2',
        number: '20.2',
        title: 'Structured Logging with SLF4J/Logback & OpenAPI Spec Generation with Springdoc',
        description:
          'JSON-formatted logstash encoders for log aggregators, MDC correlation IDs, and automated Swagger UI generation via springdoc-openapi-starter-webmvc-ui.',
        status: 'upcoming',
        readTime: '09m read',
        topics: ['logging', 'swagger', 'openapi', 'springdoc'],
      },
    ],
  },
];
