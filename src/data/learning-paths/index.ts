import { LearningPath } from '../../types';
import { springBootPath } from './spring-boot';
import { microservicesPath } from './microservices';
import { javaCorePath } from './java-core';
import { dockerPath } from './docker';

export const learningPaths: LearningPath[] = [
  springBootPath,
  microservicesPath,
  javaCorePath,
  dockerPath,
];

export {
  springBootPath,
  microservicesPath,
  javaCorePath,
  dockerPath,
};
