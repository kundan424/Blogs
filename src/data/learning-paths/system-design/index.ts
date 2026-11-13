import { LearningPath } from '../../../types';
import { stage0Modules } from './stage-0-fundamentals';
import { stage1Modules } from './stage-1-core-fundamentals';
import { stage2Modules } from './stage-2-building-blocks';
import { stage3Modules } from './stage-3-distributed-systems';
import { stage4Modules } from './stage-4-data-systems';
import { stage5Modules } from './stage-5-architecture-patterns';
import { stage6Modules } from './stage-6-reliability-operations';
import { stage7Modules } from './stage-7-security-at-scale';
import { stage8Modules } from './stage-8-practice-problems';

export const systemDesignPath: LearningPath = {
  id: 'system-design',
  slug: 'system-design',
  title: 'System Design',
  description:
    'From networking fundamentals, operating system essentials, and core scalability principles to distributed consensus, data systems, microservices, reliability engineering, and real-world system design interview blueprints.',
  subjectSlug: 'software-architecture-system-design',
  icon: 'architecture',
  level: 'Production Scale',
  estimatedDuration: '84 Modules • 277 Lessons',
  modules: [
    ...stage0Modules,
    ...stage1Modules,
    ...stage2Modules,
    ...stage3Modules,
    ...stage4Modules,
    ...stage5Modules,
    ...stage6Modules,
    ...stage7Modules,
    ...stage8Modules,
  ],
};
