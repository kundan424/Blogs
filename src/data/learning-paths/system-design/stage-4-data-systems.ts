import { LearningModule } from '../../../types';

export const stage4Modules: LearningModule[] = [
  // -----------------------------------------------------------------------
  // 4.0 Storage Engines
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-4-0',
    number: '4.0',
    title: 'Storage Engines',
    description: 'How bytes actually land on disk.',
    lessons: [
      {
        id: 'sd-4-0-1',
        number: '4.0.1',
        title: 'WAL, B-trees and LSM trees',
        noteSlug: 'wal-b-trees-and-lsm-trees',
        description: 'Read-optimized B+ Trees (in-place disk writes, page splits) vs write-optimized Log-Structured Merge (LSM) Trees with SSTables and Memtables.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['storage-engines', 'b-tree', 'lsm-tree', 'wal', 'rocksdb'],
      },
      {
        id: 'sd-4-0-2',
        number: '4.0.2',
        title: 'Compaction',
        noteSlug: 'storage-compaction',
        description: 'Size-tiered vs leveled compaction in LSM stores, write amplification, space amplification, and disk I/O pauses.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['compaction', 'lsm-tree', 'rocksdb', 'cassandra'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 4.1 OLTP vs OLAP
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-4-1',
    number: '4.1',
    title: 'OLTP vs OLAP',
    description: 'Serving users vs answering questions.',
    lessons: [
      {
        id: 'sd-4-1-1',
        number: '4.1.1',
        title: 'OLTP vs OLAP',
        noteSlug: 'oltp-vs-olap',
        description: 'Online Transaction Processing (low latency, high concurrency, row-oriented) vs Online Analytical Processing (massive aggregates, complex scans).',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['oltp', 'olap', 'databases', 'data-warehousing'],
      },
      {
        id: 'sd-4-1-2',
        number: '4.1.2',
        title: 'Columnar storage',
        noteSlug: 'columnar-storage',
        description: 'Parquet, ORC, ClickHouse: column-oriented memory layouts, vector execution, dictionary compression, and blazing SIMD aggregations.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['columnar-storage', 'parquet', 'clickhouse', 'performance'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 4.2 Data Warehouses and Data Lakes
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-4-2',
    number: '4.2',
    title: 'Data Warehouses and Data Lakes',
    description: 'Where analytics data lives.',
    lessons: [
      {
        id: 'sd-4-2-1',
        number: '4.2.1',
        title: 'Data warehouses',
        noteSlug: 'data-warehouses',
        description: 'Snowflake, BigQuery, Redshift: star and snowflake schemas, compute-storage separation, and query optimization.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['data-warehouse', 'snowflake', 'bigquery', 'analytics'],
      },
      {
        id: 'sd-4-2-2',
        number: '4.2.2',
        title: 'Data lakes and lakehouses',
        noteSlug: 'data-lakes-and-lakehouses',
        description: 'Raw S3 object storage lakes vs Lakehouse architectures (Apache Iceberg, Delta Lake, Hudi) with ACID metadata layers.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['data-lake', 'iceberg', 'delta-lake', 'lakehouse'],
      },
      {
        id: 'sd-4-2-3',
        number: '4.2.3',
        title: 'ETL vs ELT',
        noteSlug: 'etl-vs-elt',
        description: 'Extract-Transform-Load (pre-compute transformations) vs Extract-Load-Transform (leveraging cloud warehouse MPP query power).',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['etl', 'elt', 'data-pipelines', 'architecture'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 4.3 Stream vs Batch Processing
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-4-3',
    number: '4.3',
    title: 'Stream vs Batch Processing',
    description: 'Now, or later in bulk.',
    lessons: [
      {
        id: 'sd-4-3-1',
        number: '4.3.1',
        title: 'Batch vs stream',
        noteSlug: 'batch-vs-stream',
        description: 'Bounded datasets on schedules vs unbounded continuous event streams; latency, throughput, and lambda vs kappa architectures.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['batch-processing', 'stream-processing', 'lambda-architecture', 'kappa'],
      },
      {
        id: 'sd-4-3-2',
        number: '4.3.2',
        title: 'Event time, windows, joins',
        noteSlug: 'event-time-windows-joins',
        description: 'Event time vs processing time, watermarks, tumbling vs sliding vs session windows, and stream-table joins.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['event-time', 'watermarks', 'windowing', 'streaming'],
      },
      {
        id: 'sd-4-3-3',
        number: '4.3.3',
        title: 'Flink',
        noteSlug: 'apache-flink',
        description: 'Stateful stream processing, distributed snapshots (Chandy-Lamport algorithm), state backends, and exactly-once processing guarantees.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['flink', 'stream-processing', 'chandy-lamport', 'distributed-systems'],
      },
      {
        id: 'sd-4-3-4',
        number: '4.3.4',
        title: 'MapReduce and Spark',
        noteSlug: 'mapreduce-and-spark',
        description: 'Map-Shuffle-Reduce fundamentals vs Spark RDDs and DataFrames; in-memory caching, DAG execution plans, and task scheduling.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['spark', 'mapreduce', 'hadoop', 'big-data'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 4.4 Change Data Capture
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-4-4',
    number: '4.4',
    title: 'Change Data Capture',
    description: 'Turning a database into a stream.',
    lessons: [
      {
        id: 'sd-4-4-1',
        number: '4.4.1',
        title: 'Change data capture',
        noteSlug: 'change-data-capture',
        description: 'Reading Postgres WAL / MySQL binlogs with Debezium, streaming row-level mutations (Insert/Update/Delete) without polling overhead.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['cdc', 'debezium', 'wal', 'event-driven'],
      },
      {
        id: 'sd-4-4-2',
        number: '4.4.2',
        title: 'Design a CDC pipeline',
        noteSlug: 'design-a-cdc-pipeline',
        description: 'Interview blueprint: streaming operational Postgres mutations into Elasticsearch for search indexing and Snowflake for analytics in real time.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['system-design', 'interview-guide', 'cdc', 'kafka-connect'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 4.5 Search Systems
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-4-5',
    number: '4.5',
    title: 'Search Systems',
    description: 'Inverted indexes and ranking.',
    lessons: [
      {
        id: 'sd-4-5-1',
        number: '4.5.1',
        title: 'How search works',
        noteSlug: 'how-search-works',
        description: 'Tokenization, stemmers, stop words, inverted index postings lists, and BM25 relevance scoring algorithms.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['search', 'inverted-index', 'bm25', 'information-retrieval'],
      },
      {
        id: 'sd-4-5-2',
        number: '4.5.2',
        title: 'Elasticsearch',
        noteSlug: 'elasticsearch',
        description: 'Lucene segments, write buffers, translog durability, primary/replica shards, and cluster routing algorithms.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['elasticsearch', 'lucene', 'indexing', 'distributed-search'],
      },
      {
        id: 'sd-4-5-3',
        number: '4.5.3',
        title: 'Semantic search',
        noteSlug: 'semantic-search',
        description: 'Embedding text into vector spaces, dense retrieval vs lexical search, and hybrid search (BM25 + vector similarity).',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['semantic-search', 'embeddings', 'hybrid-search', 'ai'],
      },
      {
        id: 'sd-4-5-4',
        number: '4.5.4',
        title: 'Design typeahead',
        noteSlug: 'design-typeahead',
        description: 'Interview blueprint: designing Google/Amazon search autocomplete with Trie data structures, Redis sorted sets, and client debounce caching.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['system-design', 'interview-guide', 'typeahead', 'trie'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 4.6 Time-Series Databases
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-4-6',
    number: '4.6',
    title: 'Time-Series Databases',
    description: 'Metrics, ticks and sensor data.',
    lessons: [
      {
        id: 'sd-4-6-1',
        number: '4.6.1',
        title: 'Time-series databases',
        noteSlug: 'time-series-databases',
        description: 'Prometheus, InfluxDB, TimescaleDB: Gorilla float compression, delta-of-delta timestamp encoding, and high-ingest chunking.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['time-series', 'prometheus', 'gorilla-compression', 'observability'],
      },
      {
        id: 'sd-4-6-2',
        number: '4.6.2',
        title: 'Downsampling and retention',
        noteSlug: 'downsampling-and-retention',
        description: 'Rollup policies: preserving 1-second resolution for 7 days, 1-minute for 30 days, 1-hour for 1 year; lifecycle retention.',
        status: 'upcoming',
        readTime: '16m read',
        topics: ['time-series', 'downsampling', 'retention', 'metrics'],
      },
      {
        id: 'sd-4-6-3',
        number: '4.6.3',
        title: 'Design metrics and alerting',
        noteSlug: 'design-metrics-and-alerting',
        description: 'Interview blueprint: designing a Datadog-style monitoring system with statsd push agents, time-series ingest, and sliding alert windows.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['system-design', 'interview-guide', 'monitoring', 'metrics'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 4.7 Graph Databases
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-4-7',
    number: '4.7',
    title: 'Graph Databases',
    description: 'When the relationships are the data.',
    lessons: [
      {
        id: 'sd-4-7-1',
        number: '4.7.1',
        title: 'Graph databases',
        noteSlug: 'graph-databases',
        description: 'Neo4j, AWS Neptune: index-free adjacency, property graphs, Cypher queries, vs relational recursive CTE join bottlenecks.',
        status: 'upcoming',
        readTime: '18m read',
        topics: ['graph-database', 'neo4j', 'index-free-adjacency', 'nosql'],
      },
      {
        id: 'sd-4-7-2',
        number: '4.7.2',
        title: 'Design People You May Know',
        noteSlug: 'design-people-you-may-know',
        description: 'Interview blueprint: designing LinkedIn/Facebook friend recommendation algorithms via bidirectional BFS and triadic closure.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['system-design', 'interview-guide', 'graph', 'social-network'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 4.8 Vector Databases
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-4-8',
    number: '4.8',
    title: 'Vector Databases',
    description: 'Search by meaning, not by words.',
    lessons: [
      {
        id: 'sd-4-8-1',
        number: '4.8.1',
        title: 'Vector databases',
        noteSlug: 'vector-databases',
        description: 'Pinecone, Milvus, pgvector: Approximate Nearest Neighbor (ANN) search, HNSW (Hierarchical Navigable Small World), IVF-PQ.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['vector-database', 'hnsw', 'ann', 'ai-infrastructure'],
      },
      {
        id: 'sd-4-8-2',
        number: '4.8.2',
        title: 'Design RAG search',
        noteSlug: 'design-rag-search',
        description: 'Interview blueprint: designing Retrieval-Augmented Generation (RAG) pipelines with document chunking, embedding generation, and vector retrieval.',
        status: 'upcoming',
        readTime: '24m read',
        topics: ['system-design', 'interview-guide', 'rag', 'llm', 'vector-search'],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 4.9 Key-Value Stores
  // -----------------------------------------------------------------------
  {
    id: 'sd-mod-4-9',
    number: '4.9',
    title: 'Key-Value Stores',
    description: 'The simplest store, at the largest scale.',
    lessons: [
      {
        id: 'sd-4-9-1',
        number: '4.9.1',
        title: 'Redis',
        noteSlug: 'key-value-redis',
        description: 'Single-threaded event reactor architecture, memory allocation with jemalloc, RDB snapshots, and AOF rewrite mechanics.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['redis', 'key-value', 'caching', 'internals'],
      },
      {
        id: 'sd-4-9-2',
        number: '4.9.2',
        title: 'DynamoDB',
        noteSlug: 'key-value-dynamodb',
        description: 'Partition keys, sort keys, Global Secondary Indexes (GSI), read/write capacity units, adaptive capacity, and single-digit ms SLA.',
        status: 'upcoming',
        readTime: '20m read',
        topics: ['dynamodb', 'aws', 'nosql', 'key-value'],
      },
      {
        id: 'sd-4-9-3',
        number: '4.9.3',
        title: 'The Dynamo paper',
        noteSlug: 'the-dynamo-paper',
        description: 'Deconstructing the foundational 2007 Amazon paper: consistent hashing, vector clocks, sloppy quorums, and anti-entropy with Merkle trees.',
        status: 'upcoming',
        readTime: '22m read',
        topics: ['dynamo', 'paper-review', 'distributed-systems', 'classic-papers'],
      },
    ],
  },
];
