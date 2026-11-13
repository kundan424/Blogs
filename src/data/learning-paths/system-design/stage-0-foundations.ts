import { LearningModule } from '../../../types';

export const stage0Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // STAGE 0: FOUNDATIONS — THE SINGLE MACHINE & ANATOMY OF A REQUEST
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-01',
    number: '01',
    title: 'Ingress & Network Protocol Mechanics',
    description:
      'DNS recursive resolution, TCP three-way handshake, TLS 1.3 cryptographic negotiation, OS kernel socket buffers, and the evolution from HTTP/1.1 to HTTP/3 QUIC.',
    lessons: [
      {
        id: 'sd-1-1',
        number: '1.1',
        title: 'The Journey of a Packet: DNS Recursive Resolution to IP Discovery',
        noteSlug: 'the-journey-of-a-packet-dns-recursive-resolution-to-ip-discovery',
        description:
          'Browser and OS caching, recursive resolvers, root and TLD hierarchies, authoritative name servers, DNS record taxonomy, and TTL caching dynamics.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['dns', 'networking', 'system-design', 'internet'],
      },
      {
        id: 'sd-1-2',
        number: '1.2',
        title: 'The Transport Handshake: TCP 3-Way Handshake & TLS 1.3 Cryptography',
        noteSlug: 'the-transport-handshake-tcp-three-way-and-tls-negotiation',
        description:
          'SYN/ACK sequence synchronization, sliding windows, TLS 1.3 cipher negotiation, Diffie-Hellman key exchange, session resumption, and 0-RTT handshakes.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['tcp', 'tls', 'security', 'cryptography', 'networking'],
      },
      {
        id: 'sd-1-3',
        number: '1.3',
        title: 'Server OS Network Ingress: Kernel Sockets, Network Buffers & Epoll',
        noteSlug: 'server-os-network-ingress-kernel-sockets-buffers-and-epoll',
        description:
          'NIC ring buffers, softirqs, OS kernel receive/send buffers, socket file descriptors, epoll/kqueue event loops, and non-blocking I/O multiplexing.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['linux', 'kernel', 'sockets', 'epoll', 'os-internals'],
      },
      {
        id: 'sd-1-4',
        number: '1.4',
        title: 'Application Layer Evolution: HTTP/1.1 vs HTTP/2 Stream Multiplexing',
        noteSlug: 'application-layer-evolution-http1-vs-http2-stream-multiplexing',
        description:
          'ASCII framing vs binary framing, persistent keep-alive connections, HTTP-level Head-of-Line (HoL) blocking, HPACK compression, and stream multiplexing.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['http', 'http2', 'multiplexing', 'protocols'],
      },
      {
        id: 'sd-1-5',
        number: '1.5',
        title: 'The Next-Gen Transport: HTTP/3, QUIC & Zero Round-Trip Time (0-RTT)',
        noteSlug: 'the-next-gen-transport-http3-quic-and-zero-rtt',
        description:
          'Replacing TCP with QUIC over UDP, eliminating transport-level Head-of-Line blocking, connection migration across Wi-Fi/cellular, and 0-RTT reconnection.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['http3', 'quic', 'udp', 'performance', 'networking'],
      },
    ],
  },
  {
    id: 'sd-mod-02',
    number: '02',
    title: 'Single-Box Architecture & Hardware Latency Limits',
    description:
      'Co-locating reverse proxy, application runtime, and database on one server, the physical hardware latency hierarchy, and vertical scaling ceilings.',
    lessons: [
      {
        id: 'sd-2-1',
        number: '2.1',
        title: 'The Single-Box Architecture: Co-locating Nginx, App Runtime & Database',
        noteSlug: 'the-single-box-architecture-nginx-app-database-co-location',
        description:
          'Day-1 monolithic deployment on a single VPS, Unix domain sockets vs loopback TCP, memory sharing, context switching overhead, and thread starvation.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['nginx', 'single-server', 'architecture', 'databases'],
      },
      {
        id: 'sd-2-2',
        number: '2.2',
        title: 'Latency Numbers Every Systems Engineer Must Know: Memory vs Disk vs Network',
        noteSlug: 'latency-numbers-every-systems-engineer-must-know-memory-vs-disk-vs-network',
        description:
          'Jeff Dean rules of thumb: L1/L2 CPU cache, RAM, sequential vs random SSD I/O, cross-datacenter round-trips, and the logarithmic scale of physical delays.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['hardware', 'latency', 'performance', 'jeff-dean'],
      },
      {
        id: 'sd-2-3',
        number: '2.3',
        title: 'The Breaking Point: Single Point of Failure (SPOF) & Vertical Scaling Ceilings',
        noteSlug: 'the-breaking-point-spof-and-vertical-scaling-ceilings',
        description:
          'Why upgrading to 64 cores/256 GB RAM hits an exponential cost wall, Linux OOM killer invocations, file descriptor exhaustion, and total disaster on hardware failure.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['spof', 'vertical-scaling', 'reliability', 'system-failure'],
      },
    ],
  },
];
