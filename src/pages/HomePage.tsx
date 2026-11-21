import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllNotes, getEnrichedSubjects, getEnrichedTopics } from '../utils/contentLoader';
import { NoteCard } from '../components/cards/NoteCard';
import { SubjectCard } from '../components/cards/SubjectCard';
import { CircularCuratedPathsCarousel } from '../components/curriculum/CircularCuratedPathsCarousel';
import { getAllLearningPaths } from '../utils/learningPathLoader';
import { FilterBar, FilterItem } from '../components/interactive/FilterBar';
import { useSearchModal } from '../context/SearchModalContext';
import { PixelSymbol } from '../components/common/PixelSymbol';
import { EndpointCapsule } from '../components/common/EndpointCapsule';

export const HomePage: React.FC = () => {
  const { openSearch } = useSearchModal();
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'alpha'>('recent');
  const [visibleNotesCount, setVisibleNotesCount] = useState(6);

  // Sort dropdown state & ref for right-aligned dropdown
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const sortOptions = [
    { id: 'recent' as const, label: 'Most Recent', icon: 'schedule', desc: 'Newest publication date' },
    { id: 'popular' as const, label: 'Most Popular', icon: 'favorite', desc: 'Highest reader appreciation' },
    { id: 'alpha' as const, label: 'Alphabetical', icon: 'sort_by_alpha', desc: 'Title A to Z' },
  ];
  const currentSortOption = sortOptions.find((opt) => opt.id === sortBy) || sortOptions[0];

  // Interactive scenario tab in Dark Workbench Theater
  const [activeScenario, setActiveScenario] = useState<0 | 1 | 2 | 3>(0);

  // Hero Modular Curriculum & Documentation Reader state
  const [activeHeroTrack, setActiveHeroTrack] = useState<0 | 1 | 2 | 3>(0);
  const [activeHeroChapter, setActiveHeroChapter] = useState<number>(1);

  // Section 2: Explore by Domains vs Topics
  const [browseView, setBrowseView] = useState<'domains' | 'topics'>('domains');

  // Rotating focus topic in first screen promise
  const rotatingWords = useMemo(
    () => ['systems architecture', 'database internals', 'distributed runtimes', 'concurrency models'],
    []
  );
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3600);
    return () => clearInterval(timer);
  }, [rotatingWords]);

  const allNotes = useMemo(() => getAllNotes(), []);
  const enrichedSubjects = useMemo(() => getEnrichedSubjects(), []);
  const enrichedTopics = useMemo(() => getEnrichedTopics(), []);
  const allLearningPaths = useMemo(() => getAllLearningPaths(), []);

  const filterTopics: FilterItem[] = useMemo(() => {
    return [
      { id: 'all', label: 'All Topics' },
      ...enrichedTopics.slice(0, 8).map((t) => ({
        id: t.slug,
        label: `#${t.name}`,
      })),
    ];
  }, [enrichedTopics]);

  const filteredNotes = useMemo(() => {
    let result = allNotes.filter((note) => {
      const matchesTopic =
        selectedTopic === 'all' ||
        note.tags.some((t) => t.toLowerCase() === selectedTopic.toLowerCase()) ||
        note.subjectSlug === selectedTopic;

      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        note.title.toLowerCase().includes(q) ||
        note.abstract.toLowerCase().includes(q) ||
        note.tags.some((t) => t.toLowerCase().includes(q)) ||
        note.subjectName.toLowerCase().includes(q);

      return matchesTopic && matchesQuery;
    });

    if (sortBy === 'popular') {
      result = [...result].sort((a, b) => (b.claps || 0) - (a.claps || 0));
    } else if (sortBy === 'alpha') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result = [...result].sort(
        (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      );
    }

    return result;
  }, [selectedTopic, searchQuery, sortBy, allNotes]);

  const displayedNotes = useMemo(() => {
    return filteredNotes.slice(0, visibleNotesCount);
  }, [filteredNotes, visibleNotesCount]);

  // Reset pagination to curated top 6 whenever filters change
  useEffect(() => {
    setVisibleNotesCount(6);
  }, [selectedTopic, searchQuery, sortBy]);

  // Scenario details for Dark Workbench Theater based on actual platform curricula
  const scenarios = [
    {
      id: 0,
      title: 'Spring Boot 3 & Microservices Architecture',
      category: 'ENTERPRISE JAVA & RUNTIME',
      badge: '35 MODULES • 75 LESSONS',
      metric: '43 Published Notes Available',
      lead: 'A comprehensive staircase syllabus from build tools and Java 21 core to auto-configuration, JPA persistence, embedded Tomcat with Virtual Threads, and distributed microservices.',
      inputs: ['Maven Lifecycle', '@SpringBootApplication', 'DispatcherServlet', 'Hibernate Persistence', 'Virtual Threads'],
      status: 'Spring Boot 3.3.0 initialized. Embedded Tomcat listening on :8080 (Virtual Threads enabled)',
      link: '/learning-paths/spring-boot-production-mastery',
    },
    {
      id: 1,
      title: 'System Design & Network Ingress Engineering',
      category: 'DISTRIBUTED ARCHITECTURE',
      badge: '84 MODULES • 277 LESSONS',
      metric: '15 Published Notes Available',
      lead: 'From recursive DNS discovery, TCP/TLS handshakes, and HTTP/3 QUIC transport to kernel socket buffers, epoll event loops, and high-scale interview blueprints.',
      inputs: ['DNS Resolution', 'TCP 3-Way Handshake', 'TLS 1.3 Key Exchange', 'epoll_wait() Loop', 'Kernel Ingress Socket'],
      status: 'DNS lookup resolved in 1.4ms. QUIC 0-RTT connection handshake established over UDP.',
      link: '/learning-paths/system-design',
    },
    {
      id: 2,
      title: 'TypeScript as a Static Type Checker & Erasure Runtime',
      category: 'STATIC TYPE SYSTEMS',
      badge: '12 MODULES • 48 LESSONS',
      metric: '03 Published Notes Available',
      lead: 'Shape-based structural typing compatibility, mathematical set theory unions, discriminated control-flow narrowing, generic inference engines, and compile-time erasure.',
      inputs: ['AST Lexer', 'Structural Checker', 'Control-Flow Analyzer', 'Type Erasure Strip', 'Emit ES2022 Output'],
      status: 'tsc --noEmit --strict: Found 0 diagnostic errors across 48 verified modules.',
      link: '/learning-paths/typescript',
    },
    {
      id: 3,
      title: 'React Declarative UI Mental Model & First Principles',
      category: 'FRONTEND ARCHITECTURE',
      badge: '16 MODULES • 52 LESSONS',
      metric: '01 Comprehensive Study Guide',
      lead: 'UI as a pure projection of state UI = f(state), Fiber tree reconciliation, batch state queuing, pure component render phases, and client runtime performance.',
      inputs: ['JSX AST Transpile', 'Virtual Fiber Node', 'Concurrent Scheduler', 'Reconciliation Diff', 'DOM Commit Phase'],
      status: 'Fiber reconciliation commit phase completed: 0 unmounted state leaks.',
      link: '/learning-paths/react',
    },
  ];

  const currentScenario = scenarios[activeScenario];

  // Hero Modular Curriculum Tracks & Documentation Reader Data (Directly from platform content)
  const heroTracks = useMemo(
    () => [
      {
        id: 0,
        name: 'Java and Spring Boot',
        shortTitle: 'Spring Boot 3',
        domainSlug: 'backend-distributed-systems',
        symbol: 'runtime' as const,
        moduleNumber: 'PHASE 02 // MODULE 08',
        moduleTitle: 'Spring Boot 3 Core, Auto-Configuration & Web Runtimes',
        category: 'FRAMEWORK INTERNALS',
        totalModules: '35 Modules',
        totalArticles: '43 Notes Available',
        badge: 'SYLLABUS SPEC // 20M READ',
        chapters: [
          {
            id: 0,
            code: '08.1',
            title: 'What is Spring Boot? Opinionated Conventions & Initializr Anatomy',
            readTime: '20m read',
            status: 'COMPLETED',
            docId: '#SB-INIT-081',
            tag: 'CONVENTIONS-STARTERS',
            noteSlug: 'what-is-spring-boot-opinionated-conventions-initializr-anatomy',
            heading: 'What is Spring Boot? Opinionated Conventions & Initializr Anatomy',
            invariant:
              'Spring Boot starter dependencies enforce curated BOM dependency management; opinionated default configurations eliminate boilerplate while allowing graceful manual bean overrides.',
            flowSteps: ['Initializr Project Setup', 'Curated BOM Dependency Tree', 'Parent POM Invariants', 'Starter Autowire Trigger', 'Clean Microservice Boot'],
            assertions: [
              'Eliminates transitive dependency version mismatch conflicts with unified BOMs',
              'Spring Boot starters package curated, production-tested library sets out-of-the-box',
              'Initializr structure establishes clean Maven/Gradle wrapper execution semantics',
            ],
          },
          {
            id: 1,
            code: '08.2',
            title: 'Anatomy of @SpringBootApplication: Configuration & Auto-Configuration',
            readTime: '20m read',
            status: 'ACTIVE',
            docId: '#SB-AUTO-082',
            tag: 'AUTO-CONFIGURATION',
            noteSlug: 'anatomy-spring-boot-application-configuration-autoconfiguration-componentscan',
            heading: 'Anatomy of @SpringBootApplication: Configuration & Scanning Invariants',
            invariant:
              'The composite @SpringBootApplication meta-annotation pairs CGLIB configuration proxying with package-scoped component scanning and Spring Boot 3 AutoConfiguration.imports directives.',
            flowSteps: ['@SpringBootConfiguration', '@ComponentScan Filter', 'META-INF AutoConfiguration Scan', 'ConditionEvaluationReport', 'Context Refresh'],
            assertions: [
              'proxyBeanMethods=true guarantees singletons when invoking intra-configuration @Bean methods',
              'AutoConfiguration.imports replaces legacy spring.factories in Spring Boot 3',
              'Package-scoped component scanning prevents accidental bean pollution across sub-packages',
            ],
          },
          {
            id: 2,
            code: '08.3',
            title: 'Embedded Servlet Containers: Tomcat, Jetty & Undertow (Virtual Threads)',
            readTime: '22m read',
            status: 'UPCOMING',
            docId: '#SB-TOMCAT-083',
            tag: 'VIRTUAL-THREADS',
            noteSlug: 'embedded-servlet-containers-tomcat-jetty-undertow-web-vs-app-servers',
            heading: 'Embedded Servlet Containers: Web vs App Servers & Java 21 Virtual Threads',
            invariant:
              'Embedded web servers eliminate standalone WAR deployments; container thread pools mount directly onto Java 21 Virtual Threads when enabled.',
            flowSteps: ['HTTP Ingress Request', 'Tomcat Acceptor Thread', 'Virtual Thread Carrier Yield', 'DispatcherServlet Route', 'Response Stream Flush'],
            assertions: [
              'spring.threads.virtual.enabled=true mounts request handlers onto unpinned carrier workers',
              'Embedded Tomcat, Jetty, and Undertow run with zero external servlet container setup',
              'Eliminates blocking thread starvation hazards under high concurrent connection spikes',
            ],
          },
        ],
      },
      {
        id: 1,
        name: 'System Design & Architecture',
        shortTitle: 'System Design',
        domainSlug: 'software-architecture-system-design',
        symbol: 'architecture' as const,
        moduleNumber: 'STAGE 00 // MODULE 0.0',
        moduleTitle: 'Networking Fundamentals for System Design',
        category: 'DISTRIBUTED ARCHITECTURE',
        totalModules: '84 Modules',
        totalArticles: '15 Notes Available',
        badge: 'NETWORK SPEC // 18M READ',
        chapters: [
          {
            id: 0,
            code: '00.2',
            title: 'The Journey of a Packet: DNS Recursive Resolution to IP Discovery',
            readTime: '18m read',
            status: 'ACTIVE',
            docId: '#SD-DNS-002',
            tag: 'DNS-RESOLUTION',
            noteSlug: 'the-journey-of-a-packet-dns-recursive-resolution-to-ip-discovery',
            heading: 'The Journey of a Packet: DNS Recursive Resolution to IP Discovery',
            invariant:
              'DNS recursive resolution walks Root, TLD, and Authoritative nameservers hierarchically; responses are cached according to strictly enforced TTL boundaries.',
            flowSteps: ['Browser Cache Check', 'OS Resolver Socket', 'Root Nameserver (.)', 'TLD Nameserver (.com)', 'Authoritative Server', 'IP Cache & Connect'],
            assertions: [
              'Recursive resolution isolates clients from querying nameserver hierarchies directly',
              'Anycast routing delivers DNS queries to the geographically closest server instance',
              'TTL expiration triggers background pre-fetching to eliminate resolution latency spikes',
            ],
          },
          {
            id: 1,
            code: '00.5',
            title: 'The Next-Gen Transport: HTTP/3, QUIC and Zero-RTT',
            readTime: '24m read',
            status: 'COMPLETED',
            docId: '#SD-QUIC-005',
            tag: 'HTTP3-QUIC',
            noteSlug: 'the-next-gen-transport-http3-quic-and-zero-rtt',
            heading: 'The Next-Gen Transport: HTTP/3, QUIC and Zero-RTT Handshakes',
            invariant:
              'QUIC replaces TCP with UDP-based transport, embedding TLS 1.3 encryption directly into the connection handshake to achieve zero-RTT connection establishment.',
            flowSteps: ['Client Initial UDP', 'QUIC TLS 1.3 Handshake', '0-RTT Session Ticket', 'Independent Stream Multiplex', 'Zero Head-of-Line Block'],
            assertions: [
              'Independent QUIC streams eliminate transport-layer head-of-line blocking on packet loss',
              'Connection IDs allow persistent mobile sessions across Wi-Fi and Cellular IP changes',
              'Built-in forward error correction and packet pacing optimize high-latency links',
            ],
          },
          {
            id: 2,
            code: '00.8',
            title: 'Server OS Network Ingress: Kernel Sockets, Buffers & epoll',
            readTime: '22m read',
            status: 'UPCOMING',
            docId: '#SD-EPOLL-008',
            tag: 'KERNEL-INGRESS',
            noteSlug: 'server-os-network-ingress-kernel-sockets-buffers-and-epoll',
            heading: 'Server OS Network Ingress: Kernel Sockets, Buffers & epoll Event Loops',
            invariant:
              'The Linux kernel handles network packets via NIC ring buffers, softirq processing, and socket receive queues; user space multiplexes events via O(1) epoll_wait().',
            flowSteps: ['NIC Packet Arrive', 'DMA to Ring Buffer', 'Kernel softirq IRQ', 'Socket sk_buff Queue', 'epoll_wait() Ready Notify'],
            assertions: [
              'epoll avoids the O(N) descriptor iteration penalty of legacy select() and poll() syscalls',
              'Edge-triggered mode delivers events only on state changes, minimizing syscall overhead',
              'Receive buffer auto-tuning prevents packet drops during bursty microservice traffic',
            ],
          },
        ],
      },
      {
        id: 2,
        name: 'TypeScript Type System',
        shortTitle: 'TypeScript',
        domainSlug: 'typescript',
        symbol: 'terminal' as const,
        moduleNumber: 'MODULE 00 // ORIENTATION',
        moduleTitle: 'Orientation: From Java to TypeScript',
        category: 'TYPE THEORY & ERASURE',
        totalModules: '12 Modules',
        totalArticles: '03 Notes Available',
        badge: 'COMPILER SPEC // 14M READ',
        chapters: [
          {
            id: 0,
            code: '00.2',
            title: 'TypeScript as a Static Type Checker & Erasure Runtime',
            readTime: '14m read',
            status: 'ACTIVE',
            docId: '#TS-ERASE-002',
            tag: 'TYPE-ERASURE',
            noteSlug: 'typescript-static-type-checker-erasure-runtime',
            heading: 'TypeScript as a Static Type Checker & Erasure Runtime',
            invariant:
              'TypeScript operates purely as a compile-time static type analysis engine; all types, interfaces, and generics are completely erased during JavaScript emit.',
            flowSteps: ['Source Code (.ts)', 'Scanner & Parser AST', 'Type Checker Analysis', 'Diagnostic Verification', 'Emit Pure JavaScript (.js)'],
            assertions: [
              'Zero runtime performance penalty: compiled JavaScript runs at native V8 engine speed',
              'Type checking catches structural incompatibilities prior to production deployment',
              'Runtime validation (e.g. Zod) is required when accepting untrusted external JSON data',
            ],
          },
          {
            id: 1,
            code: '00.3',
            title: 'Structural Typing vs Java\'s Nominal Typing: Shape Compatibility',
            readTime: '16m read',
            status: 'COMPLETED',
            docId: '#TS-STRUCT-003',
            tag: 'STRUCTURAL-TYPING',
            noteSlug: 'structural-typing-vs-java-nominal-typing',
            heading: 'Structural Typing vs Java\'s Nominal Typing: Shape-Based Compatibility',
            invariant:
              'TypeScript enforces structural subtyping: type compatibility is determined entirely by the members and shape of an object, not by explicit class declarations.',
            flowSteps: ['Type Target Shape', 'Candidate Value Shape', 'Deep Property Check', 'Excess Property Check', 'Structural Assign OK'],
            assertions: [
              'Two independently defined interfaces with identical fields are 100% interchangeable',
              'Eliminates the rigid inheritance hierarchies required by nominal languages like Java',
              'Excess property checks catch misspelled properties during object literal assignments',
            ],
          },
          {
            id: 2,
            code: '00.4',
            title: 'Types as Sets of Values: Set Theory & Union Semantics',
            readTime: '16m read',
            status: 'UPCOMING',
            docId: '#TS-SETS-004',
            tag: 'SET-THEORY',
            noteSlug: 'types-as-sets-unions-string-or-number',
            heading: 'Types as Sets of Values: Set Theory & Union Semantics',
            invariant:
              'Types are mathematical sets of allowed values: unions represent set unions (A | B), intersections represent set intersections (A & B), and never is the empty set.',
            flowSteps: ['Input Value Space', 'Union Membership Check', 'Discriminated Tag Match', 'Control-Flow Narrowing', 'Exhaustive Type Resolution'],
            assertions: [
              'Narrowing with typeof and in operator shrinks candidate value sets progressively',
              'Discriminated unions with literal tag fields enable compile-time exhaustive switch cases',
              'never type guarantees that unhandled edge cases fail compilation immediately',
            ],
          },
        ],
      },
      {
        id: 3,
        name: 'Spring Data JPA Persistence',
        shortTitle: 'JPA Persistence',
        domainSlug: 'backend-distributed-systems',
        symbol: 'database' as const,
        moduleNumber: 'PHASE 03 // MODULE 13',
        moduleTitle: 'ORM Fundamentals & Hibernate Entity Mapping',
        category: 'DATABASE PERSISTENCE',
        totalModules: '35 Modules',
        totalArticles: '43 Notes Available',
        badge: 'JPA SPEC // 22M READ',
        chapters: [
          {
            id: 0,
            code: '13.1',
            title: 'The Object-Relational Impedance Mismatch',
            readTime: '20m read',
            status: 'COMPLETED',
            docId: '#JPA-IMP-131',
            tag: 'ORM-FOUNDATIONS',
            noteSlug: 'spring-boot-object-relational-impedance-mismatch-raw-jdbc-orm-foundations',
            heading: 'The Object-Relational Impedance Mismatch: JDBC vs ORM Foundations',
            invariant:
              'First principles of why Java objects and relational database tables clash in granularity, associations, and identity; why raw JDBC becomes boilerplate-heavy at scale.',
            flowSteps: ['Object Identity Check', 'Relational Primary Key Match', 'Association Navigation', 'Lazy Proxy Initializer', 'Dirty Session Commit'],
            assertions: [
              'ORM maps object state graphs onto 2-dimensional tabular relational projections',
              'Eliminates repetitive manual ResultSet column-to-field mapping code',
              'First-level cache ensures transparent repeatable reads within the same Session boundary',
            ],
          },
          {
            id: 1,
            code: '13.2',
            title: 'JDBC vs. JPA vs. Hibernate: How the Stack Fits Together',
            readTime: '22m read',
            status: 'ACTIVE',
            docId: '#JPA-STACK-132',
            tag: 'PERSISTENCE-STACK',
            noteSlug: 'spring-boot-jdbc-jpa-hibernate-spring-data-persistence-stack-architecture',
            heading: 'JDBC vs. JPA vs. Hibernate: Architecture of the Spring Persistence Stack',
            invariant:
              'Clarifying the exact architectural boundary between JDBC API (driver layer), Jakarta Persistence (specification), Hibernate (engine), and Spring Data JPA (repository abstraction).',
            flowSteps: ['Spring Data Repository', 'JPA EntityManager API', 'Hibernate ORM Session', 'HikariCP Pool Acquire', 'PostgreSQL JDBC Socket'],
            assertions: [
              'JPA specifies the portable persistence interfaces while Hibernate provides the engine',
              'Spring Data JPA generates optimized proxy implementations from interface definitions',
              'HikariCP manages physical socket connection acquisition with zero lock wait',
            ],
          },
          {
            id: 2,
            code: '13.3',
            title: 'Anatomy of a JPA Entity & Lifecycle Rules',
            readTime: '22m read',
            status: 'UPCOMING',
            docId: '#JPA-RULES-133',
            tag: 'ENTITY-LIFECYCLE',
            noteSlug: 'spring-boot-anatomy-jpa-entity-lifecycle-rules-equals-hashcode',
            heading: 'Anatomy of a JPA Entity: Lifecycle Rules & Equals/HashCode Contracts',
            invariant:
              'Writing clean @Entity classes requires mandatory no-arg constructors, non-final entity classes for bytecode proxies, and safe equals()/hashCode() contracts.',
            flowSteps: ['new Entity() [Transient]', 'em.persist() [Managed]', 'em.detach() [Detached]', 'em.merge() [Re-attached]', 'em.remove() [Removed]'],
            assertions: [
              'Generated @Id values are null before flush, making them hazardous in HashSet/HashMap',
              'Hibernate lazy-loading proxies require non-final entity classes and getter access',
              'CascadeType.ALL and orphanRemoval=true enforce parent-child lifecycle containment',
            ],
          },
        ],
      },
    ],
    []
  );

  const currentHeroTrack = heroTracks[activeHeroTrack];
  const currentHeroChapter =
    currentHeroTrack.chapters[activeHeroChapter] || currentHeroTrack.chapters[0];

  return (
    <div className="flex flex-col w-full bg-bright-white dark:bg-[#161616] text-[#161616] dark:text-[#fafafa] transition-colors">

      {/* =========================================================================
          SECTION 1: FIRST SCREEN — OPEN DOTTED WORKBENCH (n8n design system)
          - Centered 64px/0.85 medium grotesk headline with -0.01em tracking
          - 18px/22px support lead
          - 42px deep teal pill paired with secondary button (12px gap)
          - Working product scene below on pale dotted field: Modular Documentation Reader
          ========================================================================= */}
      <section className="relative w-full pt-16 sm:pt-24 pb-20 sm:pb-28 overflow-hidden hero-mindcloud-surface border-b border-[#7eaee8]/50 dark:border-[#1e3a8a]/40">
        <div className="max-w-[1392px] mx-auto px-6 relative z-10">
          
          {/* Centered Opening Promise */}
          <div className="max-w-[800px] mx-auto text-center flex flex-col items-center">
            
            {/* Endpoint capsule eyebrow */}
            <div className="mb-6">
              <EndpointCapsule variant="glass">
                MODULAR ENGINEERING CURRICULA &amp; DOCUMENTATION
              </EndpointCapsule>
            </div>

            {/* Display Headline: 64px/0.88, weight 500, tight tracking */}
            <h1 className="display-title text-white text-center">
              Deconstruct{' '}
              <span className="text-white font-semibold">
                {rotatingWords[activeWordIndex]}
              </span>{' '}
              with modular clarity.
            </h1>

            {/* Support Lead: 18px/22px */}
            <p className="mt-6 text-[18px] sm:text-[20px] text-white/80 font-normal leading-[1.35] max-w-[700px]">
              Curated engineering syllabi, concrete architectural invariants, and deep technical notes organized into structured modules and production-grade documentation.
            </p>

            {/* Controls: 42px-high pill buttons (IBM Plex Mono uppercase 14px, 12px gap) */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/subjects"
                className="h-[42px] px-5 rounded-full font-mono text-[13px] uppercase tracking-[0.02em] font-medium transition-all inline-flex items-center justify-center gap-2 bg-white text-[#040d2a] hover:bg-white/90 shadow-md"
              >
                <span>Explore Curriculum Pathways</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>

              <button
                type="button"
                onClick={openSearch}
                className="h-[42px] px-5 rounded-full font-mono text-[13px] uppercase tracking-[0.02em] font-medium transition-all inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">search</span>
                <span>Search Documentation</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-white/15 font-mono text-[11px] text-white/90">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Compact Technical Verification Marker */}
            <div className="mt-6 flex items-center justify-center gap-3 font-mono text-[12px] uppercase tracking-[0.02em] text-white/70">
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Structured Modules
              </span>
              <span className="text-white/40">•</span>
              <span>Zero Marketing Fluff</span>
              <span className="text-white/40">•</span>
              <span>Production Documentation</span>
            </div>
          </div>

          {/* Interactive Modular Documentation Reader Stage (Glass Workbench with Transparent Border) */}
          <div className="mt-14 max-w-[960px] mx-auto">
            <div className="relative rounded-[24px] bg-white/10 dark:bg-white/[0.08] backdrop-blur-xl border border-white/20 ring-1 ring-inset ring-white/10 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.35)] overflow-hidden p-5 sm:p-7 text-white">
              
              {/* Glass Subtle Gradient Sheen */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/[0.05] to-transparent pointer-events-none" />

              {/* Mac Window Chrome Top Bar with Three Colored Dots on Left */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/15">
                {/* Left: 3 macOS Traffic Light Dots & Window Path */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 py-0.5">
                    <span
                      className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 shadow-xs cursor-pointer inline-block transition-transform hover:scale-110"
                      title="Close"
                    />
                    <span
                      className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 shadow-xs cursor-pointer inline-block transition-transform hover:scale-110"
                      title="Minimize"
                    />
                    <span
                      className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 shadow-xs cursor-pointer inline-block transition-transform hover:scale-110"
                      title="Maximize"
                    />
                  </div>
                </div>

                {/* Center: Track Selector Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {heroTracks.map((track, idx) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        setActiveHeroTrack(idx as 0 | 1 | 2 | 3);
                        setActiveHeroChapter(0);
                      }}
                      className={`h-[30px] sm:h-[32px] px-3 rounded-full font-mono text-[11px] uppercase tracking-[0.02em] transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                        activeHeroTrack === idx
                          ? 'bg-white text-black border-white font-medium shadow-xs'
                          : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-white/15 backdrop-blur-sm'
                      }`}
                    >
                      <span className="opacity-70 font-semibold">0{idx + 1}.</span>
                      <span>{track.shortTitle}</span>
                    </button>
                  ))}
                </div>

                {/* Modular Syllabus Indicator */}
                <div
                  className="hidden lg:flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.03em] text-white font-medium bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>MODULAR SYLLABUS</span>
                </div>
              </div>

              {/* Module Title & Context Banner */}
              <div className="relative z-10 pt-4 pb-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/15">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-[12px] bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20 shadow-2xs backdrop-blur-sm">
                    <PixelSymbol variant={currentHeroTrack.symbol} size={24} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-sans font-medium text-[16px] sm:text-[17px] text-white leading-snug tracking-[-0.015em] truncate">
                      {currentHeroTrack.moduleTitle}
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.03em] text-white/80 bg-white/10 px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-sm">
                  <span>{currentHeroTrack.totalModules}</span>
                  <span>•</span>
                  <span>{currentHeroTrack.totalArticles}</span>
                </div>
              </div>

              {/* Split Interface: Left Chapter Navigator (5 cols) & Right Documentation View (7 cols) */}
              <div className="relative z-10 mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left Column: Structured Chapters in Module */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.03em] text-white/70 mb-2 flex items-center justify-between">
                    <span>CURRICULUM SYLLABUS</span>
                    <span className="text-white font-medium">{currentHeroTrack.chapters.length} CHAPTERS</span>
                  </div>

                  <div className="space-y-1.5">
                    {currentHeroTrack.chapters.map((ch, idx) => {
                      const isSelected = activeHeroChapter === idx;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => setActiveHeroChapter(idx)}
                          className={`w-full text-left p-3 rounded-[14px] transition-all cursor-pointer flex flex-col gap-1 border ${
                            isSelected
                              ? 'bg-white/20 border-white/40 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.2)] text-white backdrop-blur-md'
                              : 'bg-white/[0.06] hover:bg-white/15 border-white/15 hover:border-white/25 text-white/80 hover:text-white backdrop-blur-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.03em]">
                            <span className={isSelected ? 'text-white font-semibold' : 'text-white/70'}>
                              CHAPTER {ch.code}
                            </span>
                            <span className="px-1.5 py-0.2 rounded-full bg-white/15 text-[9.5px] text-white/90">
                              {ch.readTime}
                            </span>
                          </div>
                          <div className="font-sans text-[13px] font-medium leading-snug text-white line-clamp-2">
                            {ch.title}
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.03em] text-white/70 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-white/40'}`} />
                            <span>{isSelected ? 'CURRENTLY READING' : ch.status}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Documentation Format Article Preview */}
                <div className="lg:col-span-7 p-5 sm:p-6 rounded-[20px] bg-white/10 backdrop-blur-lg border border-white/20 shadow-sm flex flex-col justify-between relative overflow-hidden text-white">
                  <div>
                    {/* Document Header Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/15 font-mono text-[10px] uppercase tracking-[0.03em] text-white/70">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-semibold">{currentHeroChapter.docId}</span>
                        <span>•</span>
                        <span>{currentHeroChapter.readTime}</span>
                      </div>
                      <span className="text-white font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">verified</span>
                        <span>VERIFIED SPECIFICATION</span>
                      </span>
                    </div>

                    {/* Document Title */}
                    <div className="mt-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.03em] text-white/70">
                        CHAPTER {currentHeroChapter.code} // {currentHeroChapter.tag}
                      </span>
                      <h4 className="font-sans font-medium text-[17px] sm:text-[18px] text-white leading-[1.3] tracking-[-0.015em] mt-1">
                        {currentHeroChapter.heading}
                      </h4>
                    </div>

                    {/* Architectural Invariant Callout Box */}
                    <div className="mt-3.5 p-3 rounded-[12px] bg-white/10 border-l-2 border-l-white border-y border-r border-white/15 backdrop-blur-sm">
                      <div className="font-mono text-[9.5px] uppercase tracking-[0.03em] text-white font-semibold mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">security</span>
                        <span>Architectural Invariant</span>
                      </div>
                      <p className="font-sans text-[12.5px] text-white/90 leading-relaxed">
                        {currentHeroChapter.invariant}
                      </p>
                    </div>

                    {/* Structured Process Flow / Architecture Pipeline (Clean & Minimal) */}
                    <div className="mt-3 p-3 rounded-[12px] bg-white/10 border border-white/15 backdrop-blur-sm">
                      <div className="font-mono text-[9.5px] uppercase tracking-[0.03em] text-white/70 mb-1.5 font-medium flex items-center justify-between">
                        <span>Execution Flow Deconstruction</span>
                        <span className="text-[9px] text-white font-medium">{currentHeroChapter.flowSteps.length} Steps</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] font-mono text-white">
                        {currentHeroChapter.flowSteps.map((step, idx) => (
                          <React.Fragment key={step}>
                            <span className="px-2 py-0.5 rounded-[6px] bg-white/15 border border-white/20 whitespace-nowrap text-white font-medium shadow-2xs cursor-default">
                              {step}
                            </span>
                            {idx < currentHeroChapter.flowSteps.length - 1 && (
                              <span className="text-white/60 shrink-0 text-[10px]">→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Verified Assertions List */}
                    <div className="mt-3 space-y-1">
                      {currentHeroChapter.assertions.map((assertion) => (
                        <div key={assertion} className="flex items-start gap-2 text-[12px] text-white/90 font-sans">
                          <span className="text-white font-mono text-[11px] shrink-0 mt-0.5 font-bold">✓</span>
                          <span className="leading-snug">{assertion}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deep-Dive Footer Link */}
                  <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between font-mono text-[10.5px]">
                    <span className="text-white/70 uppercase tracking-[0.03em]">
                      CHAPTER {activeHeroChapter + 1} OF {currentHeroTrack.chapters.length}
                    </span>
                    <Link
                      to={`/notes/${currentHeroChapter.noteSlug}`}
                      className="text-white hover:underline flex items-center gap-1 font-medium uppercase tracking-[0.03em] transition-colors"
                    >
                      <span>Open Note in Knowledge Base</span>
                      <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </Link>
                  </div>

                </div>

              </div>

              {/* Stage Bottom Status Row */}
              <div className="relative z-10 mt-5 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-white/70">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Curriculum Standard: RFC Architecture &amp; Production Verification</span>
                </div>
                <Link
                  to={`/subjects/${currentHeroTrack.domainSlug}`}
                  className="text-white hover:underline flex items-center gap-1 uppercase tracking-[0.03em] font-medium transition-colors"
                >
                  <span>Explore All {currentHeroTrack.totalModules} in {currentHeroTrack.shortTitle}</span>
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 2: ENGINEERING DOMAINS & CURATED TOPICS STRIP
          Interactive browse switch between 8 Domain Hubs and Top Architectural Topics
          ========================================================================= */}
      <section className="w-full py-10 sm:py-12 px-6 border-b border-[#d9d9d9] dark:border-[#333333] bg-bright-white dark:bg-[#161616]">
        <div className="max-w-[1190px] mx-auto text-center">
          
          {/* Section Eyebrow */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#161616] dark:bg-[#ffffff]" />
            <span className="font-mono text-[12px] uppercase tracking-[0.02em] text-[#8f8f8f]">
              EXPLORE BY DOMAIN OR TOPIC
            </span>
          </div>

          {/* View Toggle: Engineering Domains vs Curated Topics */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => setBrowseView('domains')}
              className={`h-[38px] px-4 rounded-full font-mono text-[12px] uppercase tracking-[0.02em] transition-all cursor-pointer flex items-center gap-2 border ${
                browseView === 'domains'
                  ? 'bg-[#161616] text-white border-[#161616] dark:bg-[#ffffff] dark:text-[#161616] dark:border-[#ffffff] font-medium shadow-xs'
                  : 'bg-[#f0f0f0] dark:bg-[#212121] text-[#616161] dark:text-[#8f8f8f] border-[#d9d9d9] dark:border-[#333333] hover:text-[#161616] dark:hover:text-[#fafafa]'
              }`}
            >
              <span>Engineering Domains</span>
              <span className="px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-black/20 text-[10.5px]">
                {enrichedSubjects.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBrowseView('topics')}
              className={`h-[38px] px-4 rounded-full font-mono text-[12px] uppercase tracking-[0.02em] transition-all cursor-pointer flex items-center gap-2 border ${
                browseView === 'topics'
                  ? 'bg-[#161616] text-white border-[#161616] dark:bg-[#ffffff] dark:text-[#161616] dark:border-[#ffffff] font-medium shadow-xs'
                  : 'bg-[#f0f0f0] dark:bg-[#212121] text-[#616161] dark:text-[#8f8f8f] border-[#d9d9d9] dark:border-[#333333] hover:text-[#161616] dark:hover:text-[#fafafa]'
              }`}
            >
              <span>Curated Topics</span>
              <span className="px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-black/20 text-[10.5px]">
                {enrichedTopics.slice(0, 14).length}
              </span>
            </button>
          </div>

          {/* Interactive Pills Grid */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {browseView === 'domains' ? (
              enrichedSubjects.map((subject) => (
                <Link
                  key={subject.id}
                  to={`/subjects/${subject.slug}`}
                  className="h-[42px] px-4 rounded-full bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] hover:border-[#161616] dark:hover:border-[#ffffff] flex items-center gap-2.5 font-mono text-[12.5px] uppercase tracking-[0.02em] text-[#161616] dark:text-[#fafafa] transition-all group hover:bg-bright-white dark:hover:bg-[#282828]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#161616] dark:bg-[#ffffff] group-hover:scale-125 transition-transform" />
                  <span>{subject.name}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-[#161616]/5 dark:bg-white/10 font-mono text-[11px] text-[#8f8f8f] group-hover:text-[#161616] dark:group-hover:text-[#fafafa]">
                    {subject.notesCount}
                  </span>
                </Link>
              ))
            ) : (
              enrichedTopics.slice(0, 14).map((topic) => (
                <Link
                  key={topic.slug}
                  to={`/topics/${topic.slug}`}
                  className="h-[42px] px-4 rounded-full bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] hover:border-[#161616] dark:hover:border-[#ffffff] flex items-center gap-2 font-mono text-[12.5px] uppercase tracking-[0.02em] text-[#161616] dark:text-[#fafafa] transition-all group hover:bg-bright-white dark:hover:bg-[#282828]"
                >
                  <span className="text-[#161616] dark:text-[#ffffff] font-medium">#</span>
                  <span>{topic.name}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-[#161616]/5 dark:bg-white/10 font-mono text-[11px] text-[#8f8f8f] group-hover:text-[#161616] dark:group-hover:text-[#fafafa]">
                    {topic.count}
                  </span>
                </Link>
              ))
            )}
          </div>

          {/* Quick Hub Navigation Link */}
          <div className="mt-5 text-center">
            <Link
              to={browseView === 'domains' ? '/subjects' : '/topics/postgresql'}
              className="inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.02em] text-[#8f8f8f] hover:text-[#161616] dark:hover:text-[#ffffff] transition-colors"
            >
              <span>
                {browseView === 'domains'
                  ? 'View All 8 Domain Hubs & Learning Paths'
                  : 'Explore All 190+ Technical Topic Tags'}
              </span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: DARK WORKBENCH THEATER (n8n design system)
          1190px container, padded 32px, row of compact role tabs, left copy rail
          beside wide readable process stage.
          ========================================================================= */}
      <section className="w-full py-20 sm:py-24 px-6 border-b border-[#d9d9d9] dark:border-[#333333]">
        <div className="max-w-[1190px] mx-auto">
          
          <div className="workbench-panel p-6 sm:p-10 border border-[#333333]">
            
            {/* Scenario Tabs Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-[#333333]">
              {scenarios.map((sc, idx) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setActiveScenario(idx as 0 | 1 | 2 | 3)}
                  className={`px-4 py-2 rounded-full font-mono text-[12.5px] uppercase tracking-[0.02em] transition-all cursor-pointer whitespace-nowrap ${
                    activeScenario === idx
                      ? 'bg-[#ffffff] text-[#161616] font-semibold'
                      : 'bg-[#303030] text-[#fafafa] hover:bg-[#474747]'
                  }`}
                >
                  0{idx + 1}. {sc.category}
                </button>
              ))}
            </div>

            {/* Split: Left Copy Rail & Right Stage */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Explanatory Rail (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.02em] text-[#fafafa]">
                  <span className="w-2 h-2 rounded-full bg-[#fafafa]" />
                  <span>{currentScenario.badge}</span>
                </div>

                <h3 className="heading-lg text-[#fafafa] leading-[1.05]">
                  {currentScenario.title}
                </h3>

                <p className="font-sans text-[15px] leading-relaxed text-[#8f8f8f]">
                  {currentScenario.lead}
                </p>

                <div className="pt-2 font-mono text-[13px] text-[#fafafa] uppercase tracking-[0.02em]">
                  {currentScenario.metric}
                </div>

                <div className="pt-4">
                  <Link
                    to={currentScenario.link}
                    className="inline-flex items-center gap-1.5 font-mono text-[13px] uppercase tracking-[0.02em] text-[#fafafa] hover:text-[#ffffff] hover:underline transition-colors"
                  >
                    <span>Explore Curriculum Syllabus</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Right Stage: Connected Modules Diagram (7 cols) */}
              <div className="lg:col-span-7 p-6 rounded-[20px] bg-[#161616] border border-[#333333]">
                <div className="font-mono text-[11px] uppercase tracking-[0.02em] text-[#8f8f8f] mb-4 flex items-center justify-between">
                  <span>Connected Architecture Stage</span>
                  <span className="text-[#fafafa]">Runtime Status: Stable</span>
                </div>

                {/* 4 Connected Module Nodes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {currentScenario.inputs.map((nodeName, idx) => (
                    <div
                      key={nodeName}
                      className="p-3 rounded-[14px] bg-[#212121] border border-[#303030] text-center flex flex-col items-center justify-center min-h-[84px] relative"
                    >
                      <span className="font-mono text-[10px] text-[#8f8f8f] mb-1">
                        NODE 0{idx + 1}
                      </span>
                      <span className="font-sans text-[13px] font-medium text-[#fafafa] leading-snug">
                        {nodeName}
                      </span>
                      {idx < 3 && (
                        <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-[#474747] z-10" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Terminal Status Output */}
                <div className="mt-4 p-3.5 rounded-[12px] bg-[#0c0c0c] border border-[#262626] font-mono text-[12px] text-[#fafafa] flex items-center gap-2">
                  <span className="text-[#8f8f8f]">$</span>
                  <span className="truncate">{currentScenario.status}</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4: STRUCTURED LEARNING PATHWAYS (n8n design system)
          Centered heading pair: 48px heading-xl, 18px lead, 3 roadmap cards
          with 24px corners, pixel capability symbols, and 42px pill buttons.
          ========================================================================= */}
      <section className="w-full py-20 sm:py-24 px-6 border-b border-[#d9d9d9] dark:border-[#333333]">
        <div className="max-w-[1190px] mx-auto">
          
          {/* Centered Heading Pair */}
          <div className="max-w-[800px] mx-auto text-center flex flex-col items-center mb-12">
            <EndpointCapsule className="mb-4">
              STRUCTURED LEARNING PATHWAYS
            </EndpointCapsule>
            <h2 className="heading-xl text-[#161616] dark:text-[#fafafa]">
              Curated paths from core to production scale.
            </h2>
            <p className="mt-4 text-[18px] text-[#616161] dark:text-[#a3a3a3] font-normal leading-[1.35]">
              Master backend architecture through modular curricula — organized by subject roadmap and actionable lessons.
            </p>
          </div>

          {/* 3D Circular Motion Orbit Carousel */}
          <CircularCuratedPathsCarousel paths={allLearningPaths} />

          <div className="mt-10 text-center">
            <Link
              to="/subjects"
              className="btn-secondary"
            >
              <span>Explore All Structured Curricula</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5: ENGINEERING DOMAIN HUBS (n8n design system)
          Centered heading pair + 4 SubjectCards with 24px corners and pixel symbols
          ========================================================================= */}
      <section id="catalog-section" className="w-full py-20 sm:py-24 px-6 border-b border-[#d9d9d9] dark:border-[#333333] dotted-work-surface">
        <div className="max-w-[1190px] mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <EndpointCapsule className="mb-3">
                KNOWLEDGE DOMAINS
              </EndpointCapsule>
              <h2 className="heading-xl text-[#161616] dark:text-[#fafafa]">
                Engineering domain hubs.
              </h2>
            </div>
            <Link
              to="/subjects"
              className="btn-secondary h-[42px]"
            >
              <span>Browse All Domains</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {enrichedSubjects.slice(0, 4).map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 6: PROMPT BAR & NOTES FEED (n8n design system)
          Prompt bar (9999px pill, 48px height), 42px filter pills, NoteCards grid
          ========================================================================= */}
      <section id="feed-section" className="w-full py-20 sm:py-24 px-6 border-b border-[#d9d9d9] dark:border-[#333333]">
        <div className="max-w-[1190px] mx-auto">
          
          {/* Section Heading & Prompt Bar Centerpiece */}
          <div className="text-center flex flex-col items-center mb-12">
            <EndpointCapsule className="mb-3">
              TECHNICAL KNOWLEDGE BASE
            </EndpointCapsule>
            <h2 className="heading-xl text-[#161616] dark:text-[#fafafa]">
              Published notes &amp; runbooks.
            </h2>
            <p className="mt-3 font-sans text-[16px] text-[#616161] dark:text-[#a3a3a3] max-w-[640px]">
              Explore RFCs, concrete performance heuristics, and architectural solutions.
            </p>

            {/* Prompt bar (n8n: 48px height, 9999px pill, soft gray, action text) */}
            <div className="mt-8 prompt-bar">
              <span className="font-mono text-[11px] uppercase tracking-[0.02em] font-medium text-[#161616] dark:text-[#fafafa] bg-bright-white dark:bg-[#303030] px-2.5 py-1 rounded-full border border-[#d9d9d9] dark:border-[#474747] shrink-0">
                PROMPT
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search by concept: "Explain PostgreSQL MVCC tuple visibility"'
                className="w-full bg-transparent border-none outline-none font-mono text-[13.5px] text-[#161616] dark:text-[#fafafa] placeholder:text-[#8f8f8f]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-[#8f8f8f] hover:text-[#161616] dark:hover:text-[#fafafa]"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="overflow-x-auto pb-1 sm:pb-0 flex-1 min-w-0">
              <FilterBar
                items={filterTopics}
                selectedId={selectedTopic}
                onSelect={(id) => setSelectedTopic(id)}
              />
            </div>

            {/* Sort Filter as Dropdown on the right side */}
            <div className="relative shrink-0 self-end sm:self-auto" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setSortDropdownOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={sortDropdownOpen}
                aria-label={`Sort articles: currently ${currentSortOption.label}`}
                className={`h-[32px] sm:h-[34px] px-3 rounded-full font-sans text-[12px] font-medium tracking-normal transition-all cursor-pointer select-none inline-flex items-center gap-1.5 border shadow-2xs ${
                  sortDropdownOpen
                    ? 'bg-[#161616] text-white border-[#161616] dark:bg-[#ffffff] dark:text-[#161616] dark:border-[#ffffff]'
                    : 'bg-bright-white dark:bg-[#212121] text-[#161616] dark:text-[#fafafa] border-[#d9d9d9] dark:border-[#333333] hover:border-[#161616] dark:hover:border-[#ffffff]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] text-[#161616] dark:text-[#fafafa]">
                  swap_vert
                </span>
                <span className="text-[#8f8f8f] font-normal">
                  Sort:
                </span>
                <span>
                  {currentSortOption.label}
                </span>
                <span
                  className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                    sortDropdownOpen ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {/* Floating Dropdown Menu */}
              {sortDropdownOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 top-[calc(100%+8px)] z-50 w-[240px] rounded-[18px] bg-bright-white dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] shadow-xl p-1.5 backdrop-blur-md"
                >
                  <div className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.02em] text-[#8f8f8f] border-b border-[#f0f0f0] dark:border-[#2e2e2e]">
                    Sort Order
                  </div>
                  <div className="py-1 space-y-0.5">
                    {sortOptions.map((opt) => {
                      const isSelected = sortBy === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setSortBy(opt.id);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-[12px] flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#f0f0f0] dark:bg-[#2e2e2e] text-[#161616] dark:text-[#fafafa] font-medium'
                              : 'hover:bg-[#f5f5f5] dark:hover:bg-[#282828] text-[#616161] dark:text-[#a3a3a3] hover:text-[#161616] dark:hover:text-[#fafafa]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`material-symbols-outlined text-[17px] ${
                                isSelected ? 'text-[#161616] dark:text-[#fafafa]' : 'text-[#8f8f8f]'
                              }`}
                            >
                              {opt.icon}
                            </span>
                            <div>
                              <div className="font-sans text-[12px] font-medium leading-snug">
                                {opt.label}
                              </div>
                              <div className="font-sans text-[11px] text-[#8f8f8f] leading-none mt-0.5">
                                {opt.desc}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="material-symbols-outlined text-[16px] text-[#161616] dark:text-[#fafafa] font-bold">
                              check
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Aesthetic Curation Counter & Status Bar */}
          {filteredNotes.length > 0 && (
            <div className="flex items-center justify-between gap-4 mb-6 px-1 text-xs font-mono uppercase tracking-[0.02em] text-[#8f8f8f]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#161616] dark:bg-[#fafafa] animate-pulse" />
                <span>
                  Curated Selection • Showing {displayedNotes.length} of {filteredNotes.length} articles
                </span>
              </div>
              {filteredNotes.length > displayedNotes.length && (
                <span className="hidden sm:inline-block text-[#161616] dark:text-[#fafafa] font-medium">
                  +{filteredNotes.length - displayedNotes.length} more in repository
                </span>
              )}
            </div>
          )}

          {/* Notes Grid: Single Column Format Per Article */}
          <div className="grid grid-cols-1 gap-5">
            {displayedNotes.map((note) => (
              <NoteCard key={note.id} note={note} onTagClick={(t) => setSelectedTopic(t)} />
            ))}
          </div>

          {/* Aesthetic Load More & Exploration Controls */}
          {filteredNotes.length > displayedNotes.length && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setVisibleNotesCount((prev) => Math.min(prev + 6, filteredNotes.length))}
                className="btn-secondary h-[44px] px-6 inline-flex items-center gap-2 group cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:translate-y-0.5 transition-transform">
                  expand_more
                </span>
                <span>Load More Articles ({filteredNotes.length - displayedNotes.length} remaining)</span>
              </button>
              <Link to="/subjects" className="btn-primary h-[44px] px-6 inline-flex items-center gap-2">
                <span>Browse By Domain Hub</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          )}

          {/* When all notes are expanded and count is large, offer an aesthetic collapse option */}
          {visibleNotesCount >= filteredNotes.length && filteredNotes.length > 6 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setVisibleNotesCount(6)}
                className="btn-secondary h-[40px] px-5 text-xs inline-flex items-center gap-1.5 text-[#8f8f8f] hover:text-[#161616] dark:hover:text-[#fafafa]"
              >
                <span className="material-symbols-outlined text-[16px]">expand_less</span>
                <span>Collapse to Curated 6</span>
              </button>
            </div>
          )}

          {filteredNotes.length === 0 && (
            <div className="py-20 text-center rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] p-8">
              <span className="material-symbols-outlined text-[36px] text-[#161616] dark:text-[#fafafa]">search_off</span>
              <p className="mt-3 text-[18px] font-sans font-medium text-[#161616] dark:text-[#fafafa]">
                No articles found matching your criteria.
              </p>
              <p className="mt-1 text-[14px] text-[#8f8f8f]">
                Try adjusting your search terms or clearing active topic filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedTopic('all');
                  setSearchQuery('');
                }}
                className="btn-secondary mt-5"
              >
                Reset Filters
              </button>
            </div>
          )}

        </div>
      </section>

      {/* =========================================================================
          SECTION 7: HUMAN CLOSING PROMISE (n8n design system)
          Photographic statement split: 48px centered promise over dots opposite
          a candid work/system scene, followed by paired action.
          ========================================================================= */}
      <section className="w-full py-20 sm:py-24 px-6 dotted-work-surface">
        <div className="max-w-[1190px] mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Left Statement */}
            <div className="space-y-6">
              <EndpointCapsule>
                VERIFIED SYSTEMS KNOWLEDGE
              </EndpointCapsule>
              <h2 className="heading-xl text-[#161616] dark:text-[#fafafa]">
                Engineered for builders who need production depth.
              </h2>
              <p className="text-[17px] text-[#616161] dark:text-[#a3a3a3] leading-relaxed">
                No superficial toy tutorials. Every article breaks down concrete kernel flags, query plans, lock trees, and memory profiles.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link to="/subjects" className="btn-primary">
                  <span>Explore All Domains</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
                <Link to="/about" className="btn-secondary">
                  <span>Operating Philosophy</span>
                </Link>
              </div>
            </div>

            {/* Right Candid Work Demonstration / Architectural Stage */}
            <div className="rounded-[24px] bg-[#212121] text-[#fafafa] p-8 border border-[#333333] space-y-6">
              <div className="flex items-center justify-between font-mono text-[11px] text-[#8f8f8f] uppercase tracking-[0.02em] pb-3 border-b border-[#333333]">
                <span>ARCHITECTURAL PROMISE</span>
                <span className="text-[#fafafa]">Production Ready</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-[16px] bg-[#161616] border border-[#303030]">
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.02em] text-[#8f8f8f]">
                    MEASUREMENT
                  </div>
                  <div className="font-sans font-medium text-[22px] text-[#fafafa] mt-1">
                    50k+
                  </div>
                  <div className="font-mono text-[11px] text-[#8f8f8f] mt-0.5">
                    Req/sec per single instance
                  </div>
                </div>

                <div className="p-4 rounded-[16px] bg-[#161616] border border-[#303030]">
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.02em] text-[#8f8f8f]">
                    LATENCY
                  </div>
                  <div className="font-sans font-medium text-[22px] text-[#fafafa] mt-1">
                    &lt;8ms
                  </div>
                  <div className="font-mono text-[11px] text-[#8f8f8f] mt-0.5">
                    P99 connection pool acquire
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-[16px] bg-[#161616] border border-[#303030] font-mono text-[12px] text-[#fafafa] space-y-1">
                <div className="text-[#fafafa]">✓ Zero cargo-cult configuration</div>
                <div className="text-[#fafafa]">✓ Little&apos;s Law concurrency mathematical models</div>
                <div className="text-[#fafafa]">✓ Row-level locks with zero-downtime schema migrations</div>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
