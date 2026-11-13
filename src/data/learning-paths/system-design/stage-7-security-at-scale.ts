import { LearningModule } from '../../../types';

export const stage7Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // 7.0 Authentication vs Authorization
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-7-0',
    number: '7.0',
    title: 'Authentication vs Authorization',
    description: 'Who you are, and what you may do.',
    lessons: [
      {
        id: 'sd-7-0-1',
        number: '7.0.1',
        title: 'Sessions, tokens and JWT',
        noteSlug: 'sessions-tokens-and-jwt',
        description: 'Identity verification vs RBAC/ABAC permissions; stateful server sessions vs stateless cryptographically signed tokens.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['auth', 'authentication', 'authorization', 'security', 'rbac'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 7.1 OAuth 2.0 and OpenID Connect
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-7-1',
    number: '7.1',
    title: 'OAuth 2.0 and OpenID Connect',
    description: "Logging in with someone else's account.",
    lessons: [
      {
        id: 'sd-7-1-1',
        number: '7.1.1',
        title: 'OAuth and OIDC',
        noteSlug: 'oauth-and-oidc',
        description: 'Authorization Code flow with PKCE, ID tokens vs Access tokens, scopes, claims, and third-party login providers.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['oauth2', 'oidc', 'pkce', 'security', 'sso'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 7.2 JWT Deep Dive
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-7-2',
    number: '7.2',
    title: 'JWT Deep Dive',
    description: 'Signed tokens and their sharp edges.',
    lessons: [
      {
        id: 'sd-7-2-1',
        number: '7.2.1',
        title: 'JWT deep dive',
        noteSlug: 'jwt-deep-dive',
        description: 'Header-Payload-Signature structure, algorithm "none" vulnerabilities, token revocation challenges, short lifetimes, and refresh tokens.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['jwt', 'security', 'cryptography', 'tokens'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 7.3 mTLS and Service-to-Service Auth
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-7-3',
    number: '7.3',
    title: 'mTLS and Service-to-Service Auth',
    description: 'Services proving who they are.',
    lessons: [
      {
        id: 'sd-7-3-1',
        number: '7.3.1',
        title: 'mTLS',
        noteSlug: 'mtls',
        description: 'Mutual TLS: X.509 certificate exchange, zero-trust network verification, SPIFFE/SPIRE identity issuance, and automated cert rotation.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['mtls', 'zero-trust', 'spiffe', 'service-mesh', 'security'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 7.4 Secrets Management
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-7-4',
    number: '7.4',
    title: 'Secrets Management',
    description: 'Keys that never sit in code.',
    lessons: [
      {
        id: 'sd-7-4-1',
        number: '7.4.1',
        title: 'Secrets management',
        noteSlug: 'secrets-management',
        description: 'HashiCorp Vault, AWS Secrets Manager: dynamic short-lived credentials, automatic lease renewal, and audit access logs.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['vault', 'secrets-management', 'security', 'cloud'],
      },
      {
        id: 'sd-7-4-2',
        number: '7.4.2',
        title: 'Encryption and keys',
        noteSlug: 'encryption-and-keys',
        description: 'Envelope encryption, symmetric AES-256-GCM vs asymmetric RSA/ECC, Key Management Services (KMS), and Hardware Security Modules (HSM).',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['encryption', 'kms', 'envelope-encryption', 'cryptography'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 7.5 DDoS Protection and WAFs
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-7-5',
    number: '7.5',
    title: 'DDoS Protection and WAFs',
    description: 'Staying up when someone floods you.',
    lessons: [
      {
        id: 'sd-7-5-1',
        number: '7.5.1',
        title: 'DDoS and WAFs',
        noteSlug: 'ddos-and-wafs',
        description: 'Volumetric L3/L4 floods (SYN flood, UDP amplification) vs L7 application attacks (HTTP slowloris); Anycast scrubbing centers and WAF rules.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['ddos', 'waf', 'security', 'cloudflare', 'networking'],
      },
      {
        id: 'sd-7-5-2',
        number: '7.5.2',
        title: 'Web security basics: XSS, SQLi, CSRF',
        noteSlug: 'web-security-basics-xss-sqli-csrf',
        description: 'OWASP Top 10 vulnerabilities: SQL injection defense via prepared statements, Cross-Site Scripting (CSP headers), and CSRF tokens.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['owasp', 'xss', 'sqli', 'csrf', 'security'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 7.6 Data Residency and Compliance
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-7-6',
    number: '7.6',
    title: 'Data Residency and Compliance',
    description: 'GDPR, DPDP, CCPA and the right to erasure.',
    lessons: [
      {
        id: 'sd-7-6-1',
        number: '7.6.1',
        title: 'Data residency',
        noteSlug: 'data-residency',
        description: 'Geographic data fencing: ensuring EU/India customer PII never leaves local sovereign boundaries, geo-sharding databases.',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['compliance', 'data-residency', 'gdpr', 'architecture'],
      },
      {
        id: 'sd-7-6-2',
        number: '7.6.2',
        title: 'Right to erasure',
        noteSlug: 'right-to-erasure',
        description: 'Implementing GDPR Article 17 deletion in append-only immutable systems (Kafka, event-sourced ledgers) using cryptographic erasure.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['gdpr', 'right-to-erasure', 'crypto-shredding', 'event-sourcing'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 7.7 Supply Chain Security
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-7-7',
    number: '7.7',
    title: 'Supply Chain Security',
    description: "Trusting the code you didn't write.",
    lessons: [
      {
        id: 'sd-7-7-1',
        number: '7.7.1',
        title: 'Supply chain security',
        noteSlug: 'supply-chain-security',
        description: 'SBOM (Software Bill of Materials), container image signing with Cosign, dependency vulnerability scanning, and provenance verification.',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['supply-chain-security', 'sbom', 'sigstore', 'devops'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 7.8 Privacy-Preserving Systems
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-7-8',
    number: '7.8',
    title: 'Privacy-Preserving Systems',
    description: 'Differential privacy and federated learning.',
    lessons: [
      {
        id: 'sd-7-8-1',
        number: '7.8.1',
        title: 'Differential privacy',
        noteSlug: 'differential-privacy',
        description: 'Injecting calibrated Laplacian noise into analytics queries to mathematically guarantee individual privacy while preserving aggregate insights.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['privacy', 'differential-privacy', 'data-protection', 'analytics'],
      },
      {
        id: 'sd-7-8-2',
        number: '7.8.2',
        title: 'Federated learning',
        noteSlug: 'federated-learning',
        description: 'Training machine learning models directly on edge devices (smartphones) and aggregating gradient weights centrally without uploading raw user data.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['federated-learning', 'machine-learning', 'privacy', 'edge'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 7.9 Post-Quantum Cryptography
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-7-9',
    number: '7.9',
    title: 'Post-Quantum Cryptography',
    description: 'Preparing for keys that can be broken.',
    lessons: [
      {
        id: 'sd-7-9-1',
        number: '7.9.1',
        title: 'Post-quantum cryptography',
        noteSlug: 'post-quantum-cryptography',
        description: 'Harvest now, decrypt later threats; NIST post-quantum standards (ML-KEM/Kyber, ML-DSA/Dilithium), and hybrid TLS key exchanges.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['cryptography', 'quantum', 'kyber', 'security'],
      },
    ],
  },
];
