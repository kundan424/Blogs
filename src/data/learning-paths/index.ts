import { LearningPath } from '../../types';
import { reactPath } from './react';
import { springBootPath } from './spring-boot';
import { microservicesPath } from './microservices';
import { javaCorePath } from './java-core';
import { dockerPath } from './docker';
import { systemDesignPath } from './system-design';
import { typescriptPath } from './typescript';

export const learningPaths: LearningPath[] = [
  reactPath,
  springBootPath,
  systemDesignPath,
  microservicesPath,
  javaCorePath,
  dockerPath,
  typescriptPath,
];

export {
  reactPath,
  springBootPath,
  systemDesignPath,
  microservicesPath,
  javaCorePath,
  dockerPath,
  typescriptPath,
};
