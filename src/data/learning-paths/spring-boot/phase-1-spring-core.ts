import { LearningModule } from '../../../types';

export const phase1Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // PHASE 1: SPRING FRAMEWORK CORE
  // -----------------------------------------------------------------------
  {
    id: 'sb-mod-03',
    number: '03',
    title: 'Inversion of Control (IoC) & Dependency Injection (DI)',
    description:
      'Decoupling component lifecycles, inversion of control architecture, and comparing injection strategies.',
    lessons: [
      {
        id: 'sb-3-1',
        number: '3.1',
        title: 'Why Dependency Injection? Decoupling, Testability & Separation of Concerns',
        noteSlug: 'why-dependency-injection-decoupling-testability-separation-of-concerns',
        description:
          'Why DI? Decoupling class coupling, testability through test doubles, and separation of creation concerns from business execution.',
        status: 'published',
        readTime: '18m read',
        topics: ['spring-core', 'ioc', 'dependency-injection'],
      },
      {
        id: 'sb-3-2',
        number: '3.2',
        title: 'Dependency Injection Variants: Constructor, Setter & Field Injection',
        noteSlug: 'dependency-injection-constructor-setter-field',
        description:
          'Why constructor injection is the gold standard (immutability, fail-fast null safety), setter injection for optional dependencies, and why field injection is an anti-pattern.',
        status: 'published',
        readTime: '20m read',
        topics: ['spring-core', 'dependency-injection', 'best-practices'],
      },
    ],
  },
  {
    id: 'sb-mod-04',
    number: '04',
    title: 'Spring ApplicationContext & Bean Lifecycle',
    description:
      'Container instantiation, bean definition registries, scoping semantics, and lifecycle callback execution.',
    lessons: [
      {
        id: 'sb-4-1',
        number: '4.1',
        title: 'BeanFactory vs ApplicationContext & Bean Scopes (Singleton, Prototype, Web)',
        description:
          'BeanFactory lazy initialization vs ApplicationContext pre-instantiation, bean naming, and thread safety across singleton, prototype, request, and session scopes.',
        status: 'upcoming',
        readTime: '10m read',
        topics: ['spring-core', 'application-context', 'bean-scopes'],
      },
      {
        id: 'sb-4-2',
        number: '4.2',
        title: 'Bean Lifecycle Callbacks: Initialization, Destruction & Post-Processors',
        description:
          'Complete lifecycle traversal: @PostConstruct, @PreDestroy, InitializingBean, DisposableBean, and BeanPostProcessor hook mechanics.',
        status: 'upcoming',
        readTime: '12m read',
        topics: ['spring-core', 'bean-lifecycle', 'post-processors'],
      },
    ],
  },
  {
    id: 'sb-mod-05',
    number: '05',
    title: 'Spring Configuration Approaches',
    description:
      'Stereotype annotations, Java-based configuration, component scanning, and dependency resolution disambiguation.',
    lessons: [
      {
        id: 'sb-5-1',
        number: '5.1',
        title: 'Annotation-Driven Configuration: @Configuration, @Bean & Component Scanning',
        description:
          '@Configuration CGLIB proxy semantics, @Bean factory methods, and stereotype discovery (@Component, @Service, @Repository, @ComponentScan).',
        status: 'upcoming',
        readTime: '09m read',
        topics: ['spring-core', 'configuration', 'annotations'],
      },
      {
        id: 'sb-5-2',
        number: '5.2',
        title: 'Bean Disambiguation: @Autowired, @Qualifier & @Primary Resolution',
        description:
          'Resolving NoUniqueBeanDefinitionException using @Qualifier, setting default fallbacks with @Primary, and collection injection patterns.',
        status: 'upcoming',
        readTime: '08m read',
        topics: ['spring-core', 'autowired', 'qualifier'],
      },
    ],
  },
  {
    id: 'sb-mod-06',
    number: '06',
    title: 'Spring Expression Language (SpEL) & Environment',
    description:
      'Runtime expression parsing, dynamic property evaluation, and external configuration loading.',
    lessons: [
      {
        id: 'sb-6-1',
        number: '6.1',
        title: 'Reading Properties with @Value, Profiles & SpEL Evaluation',
        description:
          'Injecting properties with @Value, SpEL syntax (#{...}), Environment property sources, and dynamic @Profile activation.',
        status: 'upcoming',
        readTime: '08m read',
        topics: ['spring-core', 'spel', 'configuration'],
      },
    ],
  },
  {
    id: 'sb-mod-07',
    number: '07',
    title: 'Aspect-Oriented Programming (Spring AOP)',
    description:
      'Decoupling cross-cutting concerns, pointcut expression languages, and runtime proxy interception.',
    lessons: [
      {
        id: 'sb-7-1',
        number: '7.1',
        title: 'AOP Core Primitives: Cross-Cutting Concerns, Pointcuts & JoinPoints',
        description:
          'Decomposing cross-cutting concerns: Aspects, JoinPoints, Pointcut expression syntax (execution, within, @annotation), and JDK Dynamic Proxy vs CGLIB.',
        status: 'upcoming',
        readTime: '11m read',
        topics: ['spring-aop', 'pointcuts', 'proxies'],
      },
      {
        id: 'sb-7-2',
        number: '7.2',
        title: 'Practical Advices: Intercepting Logging, Performance Timing & Transactions',
        description:
          'Writing production advices: @Before input validation, @AfterReturning audits, and @Around ProceedingJoinPoint for method execution telemetry.',
        status: 'upcoming',
        readTime: '10m read',
        topics: ['spring-aop', 'telemetry', 'observability'],
      },
    ],
  },
];
