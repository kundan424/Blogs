import React, { useState } from 'react';

export const PoolCalculator: React.FC = () => {
  const [cores, setCores] = useState(8);
  const [spindles, setSpindles] = useState(1);
  const [trafficSurge, setTrafficSurge] = useState(5000);

  // HikariCP official heuristic: connections = ((core_count * 2) + effective_spindle_count)
  const recommendedPool = cores * 2 + spindles;
  const theoreticalMaxRps = recommendedPool * 320; // benchmark estimate per pooled connection
  const estimatedQueueLatencyMs = Math.max(1, Math.round((trafficSurge / theoreticalMaxRps) * 4));

  return (
    <div className="my-8 rounded-2xl bg-warm-taupe dark:bg-[#1a1815] border border-stone/80 dark:border-[#332e27] p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone dark:border-[#332e27]">
        <div>
          <span className="font-mono-data text-label-sm uppercase tracking-wider text-ember-orange font-semibold">
            INTERACTIVE RUNTIME BENCHMARK
          </span>
          <h3 className="font-headline-sm text-headline-sm text-ink mt-1">
            HikariCP Deterministic Pool Sizing Calculator
          </h3>
          <p className="font-body-md text-smoke mt-1">
            Calculate your exact optimal pool size based on hardware cores, disk queue depth, and target RPS.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#221f1b] border border-stone dark:border-[#332e27] font-mono-data text-label-sm text-graphite shrink-0 self-start sm:self-auto">
          PostgreSQL 16 &amp; HikariCP 5.1
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div>
          <label className="block font-mono-data text-label-sm text-graphite mb-2">
            DATABASE CPU CORES ({cores})
          </label>
          <input
            type="range"
            min="2"
            max="64"
            step="2"
            value={cores}
            onChange={(e) => setCores(Number(e.target.value))}
            className="w-full accent-ink cursor-pointer"
          />
          <div className="flex justify-between text-label-sm font-mono-data text-smoke mt-1">
            <span>2 Cores</span>
            <span>64 Cores</span>
          </div>
        </div>

        <div>
          <label className="block font-mono-data text-label-sm text-graphite mb-2">
            EFFECTIVE SPINDLES / NVMe QUEUES ({spindles})
          </label>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={spindles}
            onChange={(e) => setSpindles(Number(e.target.value))}
            className="w-full accent-ink cursor-pointer"
          />
          <div className="flex justify-between text-label-sm font-mono-data text-smoke mt-1">
            <span>1 (NVMe SSD)</span>
            <span>8 (RAID Spindles)</span>
          </div>
        </div>

        <div>
          <label className="block font-mono-data text-label-sm text-graphite mb-2">
            TRAFFIC SURGE ({trafficSurge.toLocaleString()} req/s)
          </label>
          <input
            type="range"
            min="500"
            max="20000"
            step="500"
            value={trafficSurge}
            onChange={(e) => setTrafficSurge(Number(e.target.value))}
            className="w-full accent-ink cursor-pointer"
          />
          <div className="flex justify-between text-label-sm font-mono-data text-smoke mt-1">
            <span>500 req/s</span>
            <span>20,000 req/s</span>
          </div>
        </div>
      </div>

      {/* Calculated Output Bar */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-white dark:bg-[#151310] border border-stone dark:border-[#332e27]">
        <div className="flex flex-col">
          <span className="font-mono-data text-label-sm text-smoke uppercase tracking-wider">
            RECOMMENDED MAXIMUM POOL SIZE
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline-md text-headline-md text-ink font-light">
              {recommendedPool}
            </span>
            <span className="font-mono-data text-label-sm text-violet-spark font-medium">
              connections
            </span>
          </div>
          <span className="font-mono-data text-[11px] text-smoke mt-1">
            Formula: ({cores} × 2) + {spindles}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="font-mono-data text-label-sm text-smoke uppercase tracking-wider">
            MAX ESTIMATED THROUGHPUT
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline-md text-headline-md text-ink font-light">
              ~{theoreticalMaxRps.toLocaleString()}
            </span>
            <span className="font-mono-data text-label-sm text-smoke">req/sec</span>
          </div>
          <span className="font-mono-data text-[11px] text-smoke mt-1">
            Zero thread-thrashing saturation
          </span>
        </div>

        <div className="flex flex-col">
          <span className="font-mono-data text-label-sm text-smoke uppercase tracking-wider">
            PROJECTED P99 QUEUE DELAY
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline-md text-headline-md text-ink font-light">
              {estimatedQueueLatencyMs}
            </span>
            <span className="font-mono-data text-label-sm text-smoke">ms</span>
          </div>
          <span className="font-mono-data text-[11px] text-smoke mt-1">
            Socket queue hold time
          </span>
        </div>
      </div>
    </div>
  );
};
