import { LearningPath } from '../../../types';
import { stage0Modules } from './stage-0-foundations';
import { stage1Modules } from './stage-1-scaling-compute';
import { stage2Modules } from './stage-2-scaling-read-path';
import { stage3Modules } from './stage-3-scaling-data-tier';
import { stage4Modules } from './stage-4-distributed-theory';
import { stage5Modules } from './stage-5-asynchronous-processing';
import { stage6Modules } from './stage-6-distributed-coordination';
import { stage7Modules } from './stage-7-planet-scale-architecture';
import { stage8Modules } from './stage-8-reliability-engineering';
import { stage9Modules } from './stage-9-blueprints-and-case-studies';

export const systemDesignPath: LearningPath = {
  id: 'system-design-zero-to-hundred-million',
  slug: 'system-design-roadmap-scale',
  title: 'System Design: From 1 User to 100 Million Users',
  description:
    'A comprehensive, first-principles staircase roadmap from single-box network anatomy to multi-tier caching, consistent hashing, distributed consensus, event-driven sagas, global active-active multi-region topologies, and planet-scale case studies.',
  subjectSlug: 'software-architecture-system-design',
  icon: 'architecture',
  level: 'Production Scale',
  estimatedDuration: '23 Modules • 72 Lessons',
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
    ...stage9Modules,
  ],
};
