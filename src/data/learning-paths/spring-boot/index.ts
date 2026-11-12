import { LearningPath } from '../../../types';
import { phase0Modules } from './phase-0-prerequisites';
import { phase1Modules } from './phase-1-spring-core';
import { phase2Modules } from './phase-2-spring-boot';
import { phase3Modules } from './phase-3-data-access';
import { phase4Modules } from './phase-4-production-essentials';
import { phase5Modules } from './phase-5-microservices-transition';
import { phase6Modules } from './phase-6-spring-cloud';
import { phase7Modules } from './phase-7-distributed-messaging';
import { phase8Modules } from './phase-8-cloud-native';

export const springBootPath: LearningPath = {
  id: 'spring-boot-production-mastery',
  slug: 'spring-boot-production-mastery',
  title: 'Spring Boot 3 & Microservices Architecture',
  description:
    'A comprehensive, step-by-step staircase roadmap from foundational build tools and networking to Spring Framework core, Spring Boot 3 REST APIs, JPA persistence, cloud-native infrastructure, distributed messaging, and Kubernetes orchestration.',
  subjectSlug: 'backend-distributed-systems',
  icon: 'developer_mode',
  level: 'Production Scale',
  estimatedDuration: '35 Modules • 75 Lessons',
  modules: [
    ...phase0Modules,
    ...phase1Modules,
    ...phase2Modules,
    ...phase3Modules,
    ...phase4Modules,
    ...phase5Modules,
    ...phase6Modules,
    ...phase7Modules,
    ...phase8Modules,
  ],
};
