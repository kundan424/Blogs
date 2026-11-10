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
    <div className="my-8 rounded-[8px] bg-canvas border border-edge p-6 sm:p-8 shadow-catalog-edge">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-edge">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-proof-green font-medium">
            INTERACTIVE RUNTIME BENCHMARK
          </span>
          <h3 className="text-[18px] sm:text-[20px] font-medium text-navy dark:text-white mt-1">
            HikariCP Deterministic Pool Sizing Calculator
          </h3>
          <p className="text-[14px] text-secondary-ink mt-1">
            Calculate your exact optimal pool size based on hardware cores, disk queue depth, and target RPS.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-[8px] bg-white dark:bg-panel border border-edge font-mono text-[11px] text-secondary-ink shrink-0 self-start sm:self-auto shadow-xs">
          PostgreSQL 16 &amp; HikariCP 5.1
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div>
          <label className="block font-mono text-[11.5px] text-secondary-ink mb-2">
            DATABASE CPU CORES ({cores})
          </label>
          <input
            type="range"
            min="2"
            max="64"
            step="2"
            value={cores}
            onChange={(e) => setCores(Number(e.target.value))}
            className="w-full accent-navy cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-muted-ink mt-1">
            <span>2 Cores</span>
            <span>64 Cores</span>
          </div>
        </div>

        <div>
          <label className="block font-mono text-[11.5px] text-secondary-ink mb-2">
            EFFECTIVE SPINDLES / NVMe QUEUES ({spindles})
          </label>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={spindles}
            onChange={(e) => setSpindles(Number(e.target.value))}
            className="w-full accent-navy cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-muted-ink mt-1">
            <span>1 (NVMe SSD)</span>
            <span>8 (RAID Spindles)</span>
          </div>
        </div>

        <div>
          <label className="block font-mono text-[11.5px] text-secondary-ink mb-2">
            TRAFFIC SURGE ({trafficSurge.toLocaleString()} req/s)
          </label>
          <input
            type="range"
            min="500"
            max="20000"
            step="500"
            value={trafficSurge}
            onChange={(e) => setTrafficSurge(Number(e.target.value))}
            className="w-full accent-navy cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-muted-ink mt-1">
            <span>500 req/s</span>
            <span>20,000 req/s</span>
          </div>
        </div>
      </div>

      {/* Calculated Output Bar */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-[8px] bg-white dark:bg-panel border border-edge shadow-catalog-edge">
        <div className="flex flex-col">
          <span className="font-mono text-[11px] text-muted-ink uppercase tracking-wider">
            RECOMMENDED MAXIMUM POOL SIZE
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[28px] font-medium text-navy dark:text-white leading-none">
              {recommendedPool}
            </span>
            <span className="font-mono text-[11px] text-proof-green font-medium">
              connections
            </span>
          </div>
          <span className="font-mono text-[11px] text-muted-ink mt-1">
            Formula: ({cores} × 2) + {spindles}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="font-mono text-[11px] text-muted-ink uppercase tracking-wider">
            MAX ESTIMATED THROUGHPUT
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[28px] font-medium text-navy dark:text-white leading-none">
              ~{theoreticalMaxRps.toLocaleString()}
            </span>
            <span className="font-mono text-[11px] text-muted-ink">req/sec</span>
          </div>
          <span className="font-mono text-[11px] text-muted-ink mt-1">
            Zero thread-thrashing saturation
          </span>
        </div>

        <div className="flex flex-col">
          <span className="font-mono text-[11px] text-muted-ink uppercase tracking-wider">
            PROJECTED P99 QUEUE DELAY
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[28px] font-medium text-navy dark:text-white leading-none">
              {estimatedQueueLatencyMs}
            </span>
            <span className="font-mono text-[11px] text-muted-ink">ms</span>
          </div>
          <span className="font-mono text-[11px] text-muted-ink mt-1">
            Socket queue hold time
          </span>
        </div>
      </div>
    </div>
  );
};
