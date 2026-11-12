import { LearningModule } from '../../../types';

export const phase8Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // PHASE 8: CONTAINERIZATION, KUBERNETES & CLOUD-NATIVE DEPLOYMENT
  // -----------------------------------------------------------------------
  {
    id: 'sb-mod-33',
    number: '33',
    title: 'Containerization with Docker & Buildpacks',
    description:
      'Multi-stage Docker builds, layered JAR caching, Cloud-Native Buildpacks, and Docker Compose environments.',
    lessons: [
      {
        id: 'sb-33-1',
        number: '33.1',
        title: 'Containerizing Spring Boot: Multi-Stage Builds, Layertools & Cloud-Native Buildpacks',
        description:
          'Optimizing container images: extracting Spring Boot layertools JAR layers, multi-stage Docker caching, and generating container images without Dockerfiles via Cloud-Native Buildpacks.',
        status: 'published',
        noteSlug: 'spring-boot-architecture-build-packaging-deployment-interview-guide',
        readTime: '10m read',
        topics: ['docker', 'buildpacks', 'containers', 'devops'],
      },
      {
        id: 'sb-33-2',
        number: '33.2',
        title: 'Local Multi-Service Orchestration with Docker Compose',
        description:
          'Orchestrating microservices locally: defining docker-compose.yml for microservice containers, PostgreSQL, Apache Kafka, Redis, Zipkin, and Keycloak with healthcheck dependencies.',
        status: 'upcoming',
        readTime: '12m read',
        topics: ['docker-compose', 'orchestration', 'devops'],
      },
    ],
  },
  {
    id: 'sb-mod-34',
    number: '34',
    title: 'Kubernetes (K8s) Fundamentals for Spring Boot',
    description:
      'Kubernetes primitives, Actuator health probes, ConfigMaps, Secrets, Ingress, and cloud-native service discovery.',
    lessons: [
      {
        id: 'sb-34-1',
        number: '34.1',
        title: 'K8s Architecture: Pods, Deployments, ReplicaSets & Cluster Services',
        description:
          'Container orchestration primitives: Pod lifecycles, Deployments with rolling updates, ReplicaSets, and ClusterIP / NodePort / LoadBalancer service topologies.',
        status: 'upcoming',
        readTime: '14m read',
        topics: ['kubernetes', 'k8s', 'containers', 'devops'],
      },
      {
        id: 'sb-34-2',
        number: '34.2',
        title: 'ConfigMaps, Secrets, Ingress Routing & Actuator Liveness/Readiness Probes',
        description:
          'Production K8s configurations: injecting ConfigMaps & Secrets, configuring Ingress controllers, and binding Spring Boot Actuator probes to K8s livenessProbe and readinessProbe.',
        status: 'upcoming',
        readTime: '13m read',
        topics: ['kubernetes', 'configmap', 'probes', 'ingress'],
      },
      {
        id: 'sb-34-3',
        number: '34.3',
        title: 'Kubernetes Native Service Discovery vs Eureka Replacement',
        description:
          'Why cloud-native deployments discard Eureka: leveraging Kubernetes CoreDNS and native K8s Service abstractions for transparent internal service discovery and load balancing.',
        status: 'upcoming',
        readTime: '11m read',
        topics: ['kubernetes', 'service-discovery', 'eureka-vs-k8s'],
      },
    ],
  },
  {
    id: 'sb-mod-35',
    number: '35',
    title: 'CI/CD Automation Pipelines',
    description:
      'Automated verification pipelines, linting, Testcontainers integration testing, and production registry publishing.',
    lessons: [
      {
        id: 'sb-35-1',
        number: '35.1',
        title: 'Automated Delivery Pipelines: GitHub Actions, Testcontainers & Registry Publishing',
        description:
          'Building enterprise CI/CD pipelines with GitHub Actions: automated linting, unit tests, Docker-in-Docker Testcontainers execution, image building, vulnerability scanning, and container registry publishing.',
        status: 'upcoming',
        readTime: '12m read',
        topics: ['ci-cd', 'github-actions', 'devops', 'automation'],
      },
    ],
  },
];
