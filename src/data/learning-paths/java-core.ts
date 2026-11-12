import { LearningPath } from '../../types';

export const javaCorePath: LearningPath = {
  id: 'java-core-oop-deep-dives',
  slug: 'java-core-oop-deep-dives',
  title: 'Java Core & Object-Oriented Deep Dives',
  description:
    'From virtual method tables and JVM memory layouts to the Java Collections Framework, lambda functional mechanics, and clean code architecture.',
  subjectSlug: 'backend-distributed-systems',
  icon: 'terminal',
  level: 'Intermediate',
  estimatedDuration: '2 Modules • 8 Lessons',
  modules: [
    {
      id: 'java-mod-01',
      number: '01',
      title: 'Object-Oriented Architecture & Runtime Execution',
      description:
        'Deep architectural analysis of OOP pillars, JVM method dispatch, and object identity contracts.',
      lessons: [
        {
          id: 'java-1-1',
          number: '1.1',
          title: 'Encapsulation, Polymorphism & Abstraction Mechanics',
          description:
            'Practical object-oriented principles tested against production engineering interview scenarios.',
          status: 'published',
          noteSlug: 'java-object-oriented-progamming-interview-questions-i',
          readTime: '10m read',
          topics: ['java', 'oop', 'jvm-internals'],
        },
        {
          id: 'java-1-2',
          number: '1.2',
          title: 'Inheritance, Virtual Method Tables & Method Dispatch',
          description:
            'vtable lookup mechanics, invokevirtual vs invokeinterface bytecode, and composition tradeoffs.',
          status: 'published',
          noteSlug: 'java-object-oriented-programming-interview-deep-dive-part-ii',
          readTime: '11m read',
          topics: ['java', 'oop', 'bytecode'],
        },
        {
          id: 'java-1-3',
          number: '1.3',
          title: 'Object Class Internals, HashCode & Equals Contracts',
          description:
            'HashMap bucket collision behavior, identity vs semantic equality, and immutable domain types.',
          status: 'published',
          noteSlug: 'java-object-oriented-programming-interview-deep-dive-part-iii',
          readTime: '09m read',
          topics: ['java', 'oop', 'collections'],
        },
        {
          id: 'java-1-4',
          number: '1.4',
          title: 'SOLID Principles & Architectural Clean Code',
          description:
            'Single responsibility, open-closed, and dependency inversion verified through real-world refactorings.',
          status: 'published',
          noteSlug: 'java-object-oriented-programming-interview-deep-dive-part-iv',
          readTime: '12m read',
          topics: ['java', 'solid-principles', 'architecture'],
        },
      ],
    },
    {
      id: 'java-mod-02',
      number: '02',
      title: 'Core Java (Java 17+ or 21 LTS)',
      description:
        'The foundational engine: Java Collections Framework internals, lambda functional mechanics, modern LTS language features, and multithreading foundations.',
      lessons: [
        {
          id: 'java-2-1',
          number: '2.1',
          title: 'Collections Framework (List, Set, Map, Queue, equals/hashCode contracts)',
          description:
            'In-depth architectural analysis of ArrayList, LinkedList, HashSet, HashMap, ConcurrentHashMap, PriorityQueue, ArrayDeque, and equals/hashCode contracts.',
          status: 'published',
          noteSlug: 'java-collections-framework-list-set-map-queue-contracts',
          readTime: '24m read',
          topics: ['java', 'collections', 'hashmap', 'jvm-internals', 'data-structures'],
        },
        {
          id: 'java-2-2',
          number: '2.2',
          title: 'Java 8+ Features: Lambdas, Stream API, Optional & Functional Interfaces',
          description:
            'invokedynamic translation of lambdas, stream pipeline fusion, short-circuiting operations, Spliterator mechanics, and idiomatic Optional usage.',
          status: 'upcoming',
          readTime: '14m read',
          topics: ['java', 'streams', 'functional-programming', 'lambdas'],
        },
        {
          id: 'java-2-3',
          number: '2.3',
          title: 'Modern Java Features: Records, Sealed Classes, Pattern Matching & Text Blocks',
          description:
            'Data-oriented programming in Java 17 and 21: canonical record constructors, exhaustive switch pattern matching, algebraic data types with sealed hierarchies, and text block formatting.',
          status: 'upcoming',
          readTime: '12m read',
          topics: ['java', 'java-21', 'records', 'sealed-classes'],
        },
        {
          id: 'java-2-4',
          number: '2.4',
          title: 'Multithreading & Concurrency Basics: CompletableFuture & Thread Pools',
          description:
            'Java Memory Model (JMM), happens-before guarantees, ThreadPoolExecutor tuning, ForkJoinPool, and asynchronous pipeline composition with CompletableFuture.',
          status: 'upcoming',
          readTime: '16m read',
          topics: ['java', 'concurrency', 'multithreading', 'completable-future'],
        },
      ],
    },
  ],
};
