import { LearningModule } from '../../../types';

export const phase6Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // PHASE 6: CORE SPRING CLOUD INFRASTRUCTURE
  // -----------------------------------------------------------------------
  {
    id: 'sb-mod-24',
    number: '24',
    title: 'Centralized Configuration (Spring Cloud Config)',
    description:
      'Centralized repository configuration, Git and Vault backends, and dynamic property refresh with Spring Cloud Bus.',
    lessons: [
      {
        id: 'sb-24-1',
        number: '24.1',
        title: 'Centralized Configuration Server with Git & HashiCorp Vault Backends',
        description:
          'Setting up Spring Cloud Config Server: externalizing application.yml to Git, secret encryption with Vault, and bootstrap configuration injection.',
        status: 'upcoming',
        readTime: '11m read',
        topics: ['spring-cloud', 'config-server', 'devops'],
      },
      {
        id: 'sb-24-2',
        number: '24.2',
        title: 'Dynamic Runtime Refresh with @RefreshScope & Spring Cloud Bus',
        description:
          'Runtime property reloads without application restarts: @RefreshScope bean re-instantiation, actuator /actuator/refresh, and broadcast webhooks via Kafka/RabbitMQ Bus.',
        status: 'upcoming',
        readTime: '10m read',
        topics: ['spring-cloud', 'refresh-scope', 'dynamic-config'],
      },
    ],
  },
  {
    id: 'sb-mod-25',
    number: '25',
    title: 'Service Registration & Discovery',
    description:
      'Service registry topologies, dynamic ephemeral IP address resolution, and client-side load balancing.',
    lessons: [
      {
        id: 'sb-25-1',
        number: '25.1',
        title: 'Eureka Server Registry Topology, Heartbeats & Client-Side Load Balancing',
        description:
          'Netflix Eureka server and client integration, heartbeat renewal leases, self-preservation mode, and client-side load balancing with Spring Cloud LoadBalancer.',
        status: 'upcoming',
        readTime: '12m read',
        topics: ['eureka', 'service-discovery', 'load-balancing'],
      },
    ],
  },
  {
    id: 'sb-mod-26',
    number: '26',
    title: 'Inter-Service Synchronous Communication',
    description:
      'Synchronous RPC communication, modern WebClient, Spring 6 HTTP Interfaces, and declarative OpenFeign clients.',
    lessons: [
      {
        id: 'sb-26-1',
        number: '26.1',
        title: 'RestTemplate vs WebClient vs Spring 6 Declarative HTTP Interfaces',
        description:
          'Deprecating RestTemplate: non-blocking reactive WebClient calls, and Spring 6 @HttpExchange declarative client interfaces with auto-generated proxies.',
        status: 'upcoming',
        readTime: '11m read',
        topics: ['webclient', 'http-interfaces', 'rest-rpc'],
      },
      {
        id: 'sb-26-2',
        number: '26.2',
        title: 'Declarative Inter-Service RPC with Spring Cloud OpenFeign',
        description:
          'Declaring typed interfaces with @FeignClient, request interceptors for auth headers, custom error decoders, and integrating client-side load balancers.',
        status: 'upcoming',
        readTime: '10m read',
        topics: ['feign', 'openfeign', 'spring-cloud'],
      },
    ],
  },
  {
    id: 'sb-mod-27',
    number: '27',
    title: 'API Gateway (Spring Cloud Gateway)',
    description:
      'Reactive Netty edge proxying, route predicates, filter transformation pipelines, and centralized rate limiting.',
    lessons: [
      {
        id: 'sb-27-1',
        number: '27.1',
        title: 'Reactive Netty Ingress Architecture: Routes, Predicates & Filter Pipelines',
        description:
          'Spring Cloud Gateway built on Project Reactor & Netty: route mapping, Path/Method/Header predicates, and pre/post GatewayFilter factories.',
        status: 'upcoming',
        readTime: '12m read',
        topics: ['api-gateway', 'spring-cloud-gateway', 'reactive'],
      },
      {
        id: 'sb-27-2',
        number: '27.2',
        title: 'Edge Concerns: Token Bucket Rate Limiting, CORS & JWT Header Forwarding',
        description:
          'Production edge enforcement: Redis-backed token bucket rate limiting (RequestRateLimiter), cross-origin resource sharing, and token relay to internal microservices.',
        status: 'upcoming',
        readTime: '13m read',
        topics: ['rate-limiting', 'redis', 'api-gateway', 'cors'],
      },
    ],
  },
];
