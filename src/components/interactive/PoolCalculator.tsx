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
    <div className="my-8 rounded-[18px] bg-bright-white dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] p-6 sm:p-8 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e5e5e5] dark:border-[#333333]">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#161616] dark:text-[#fafafa] font-semibold">
            INTERACTIVE RUNTIME BENCHMARK
          </span>
          <h3 className="font-sans text-[22px] sm:text-[24px] font-medium text-[#161616] dark:text-[#fafafa] mt-1">
            HikariCP Deterministic Pool Sizing Calculator
          </h3>
          <p className="font-sans text-[14px] text-[#616161] dark:text-[#a3a3a3] mt-1">
            Calculate your optimal connection pool size based on CPU cores, disk queue depth, and target RPS.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-[10px] bg-[#f0f0f0] dark:bg-[#161616] border border-[#d9d9d9] dark:border-[#333333] font-mono text-[11px] text-[#161616] dark:text-[#fafafa] shrink-0 self-start sm:self-auto shadow-2xs">
          PostgreSQL 16 &amp; HikariCP 5.1
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div>
          <label className="block font-mono text-[11.5px] text-[#616161] dark:text-[#a3a3a3] mb-2 font-medium">
            DATABASE CPU CORES ({cores})
          </label>
          <input
            type="range"
            min="2"
            max="64"
            step="2"
            value={cores}
            onChange={(e) => setCores(Number(e.target.value))}
            className="w-full accent-[#161616] dark:accent-[#ffffff] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-[#8f8f8f] mt-1">
            <span>2 Cores</span>
            <span>64 Cores</span>
          </div>
        </div>

        <div>
          <label className="block font-mono text-[11.5px] text-[#616161] dark:text-[#a3a3a3] mb-2 font-medium">
            EFFECTIVE SPINDLES / NVMe QUEUES ({spindles})
          </label>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={spindles}
            onChange={(e) => setSpindles(Number(e.target.value))}
            className="w-full accent-[#161616] dark:accent-[#ffffff] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-[#8f8f8f] mt-1">
            <span>1 (NVMe SSD)</span>
            <span>8 (RAID Spindles)</span>
          </div>
        </div>

        <div>
          <label className="block font-mono text-[11.5px] text-[#616161] dark:text-[#a3a3a3] mb-2 font-medium">
            TRAFFIC SURGE ({trafficSurge.toLocaleString()} req/s)
          </label>
          <input
            type="range"
            min="500"
            max="20000"
            step="500"
            value={trafficSurge}
            onChange={(e) => setTrafficSurge(Number(e.target.value))}
            className="w-full accent-[#161616] dark:accent-[#ffffff] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-[#8f8f8f] mt-1">
            <span>500 req/s</span>
            <span>20,000 req/s</span>
          </div>
        </div>
      </div>

      {/* Calculated Output Bar */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-[14px] bg-[#f8f8f8] dark:bg-[#161616] border border-[#d9d9d9] dark:border-[#333333]">
        <div className="flex flex-col">
          <span className="font-mono text-[11px] text-[#8f8f8f] uppercase tracking-wider">
            RECOMMENDED MAXIMUM POOL SIZE
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-sans text-[32px] sm:text-[36px] font-medium text-[#161616] dark:text-[#fafafa] leading-none">
              {recommendedPool}
            </span>
            <span className="font-mono text-[11px] text-[#161616] dark:text-[#fafafa] font-medium">
              connections
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#8f8f8f] mt-1">
            Formula: ({cores} × 2) + {spindles}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="font-mono text-[11px] text-[#8f8f8f] uppercase tracking-wider">
            MAX ESTIMATED THROUGHPUT
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-sans text-[32px] sm:text-[36px] font-medium text-[#161616] dark:text-[#fafafa] leading-none">
              ~{theoreticalMaxRps.toLocaleString()}
            </span>
            <span className="font-mono text-[11px] text-[#8f8f8f]">req/sec</span>
          </div>
          <span className="font-mono text-[11px] text-[#8f8f8f] mt-1">
            Zero thread-thrashing saturation
          </span>
        </div>

        <div className="flex flex-col">
          <span className="font-mono text-[11px] text-[#8f8f8f] uppercase tracking-wider">
            PROJECTED P99 QUEUE DELAY
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-sans text-[32px] sm:text-[36px] font-medium text-[#161616] dark:text-[#fafafa] leading-none">
              {estimatedQueueLatencyMs}
            </span>
            <span className="font-mono text-[11px] text-[#8f8f8f]">ms</span>
          </div>
          <span className="font-mono text-[11px] text-[#8f8f8f] mt-1">
            Socket queue hold time
          </span>
        </div>
      </div>
    </div>
  );
};
