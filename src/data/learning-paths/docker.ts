import { LearningPath } from '../../types';

export const dockerPath: LearningPath = {
  id: 'docker-container-runtime-mastery',
  slug: 'docker-container-runtime-mastery',
  title: 'Docker & Container Runtime Mastery',
  description:
    'Linux namespaces, cgroups, BuildKit caching layers, rootless daemon security, and production multi-stage image optimization.',
  subjectSlug: 'devops-cloud-infrastructure',
  icon: 'cloud_sync',
  level: 'Intermediate',
  estimatedDuration: '1 Module • 3 Lessons',
  modules: [
    {
      id: 'docker-mod-01',
      number: '01',
      title: 'Container Foundations & Engine Mechanics',
      description:
        'Container engine architecture, Dockerfile layer cache optimization, and multi-stage builds.',
      lessons: [
        {
          id: 'docker-1-1',
          number: '1.1',
          title: 'Container Architecture & CLI Foundations',
          description:
            'Container runtime vs virtual machine hypervisors, process isolation, and CLI lifecycle commands.',
          status: 'published',
          noteSlug: 'docker-interview-deep-dive-part-i-foundations-cli',
          readTime: '08m read',
          topics: ['docker', 'containers', 'devops'],
        },
        {
          id: 'docker-1-2',
          number: '1.2',
          title: 'Dockerfile Internals & Production Architecture Guide',
          description:
            'OverlayFS union mounts, layer immutability, build cache optimization, and signal propagation.',
          status: 'published',
          noteSlug: 'dockerfile-architecture-internals-production-guide',
          readTime: '10m read',
          topics: ['docker', 'dockerfile', 'buildkit'],
        },
        {
          id: 'docker-1-3',
          number: '1.3',
          title: 'Optimizing Images: From Naive to Production',
          description:
            'Multi-stage builds, distroless runtimes, non-root user execution, and trimming image sizes by 90%.',
          status: 'published',
          noteSlug: 'dockerfile-deep-dive-from-naive-to-production',
          readTime: '09m read',
          topics: ['docker', 'performance', 'security'],
        },
      ],
    },
  ],
};
