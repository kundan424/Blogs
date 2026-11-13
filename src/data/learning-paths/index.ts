import { LearningPath } from '../../types';
import { springBootPath } from './spring-boot';
import { microservicesPath } from './microservices';
import { javaCorePath } from './java-core';
import { dockerPath } from './docker';
import { systemDesignPath } from './system-design';

export const learningPaths: LearningPath[] = [
  springBootPath,
  systemDesignPath,
  microservicesPath,
  javaCorePath,
  dockerPath,
];

export {
  springBootPath,
  systemDesignPath,
  microservicesPath,
  javaCorePath,
  dockerPath,
};
