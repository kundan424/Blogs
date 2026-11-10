import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Helper to render an 11-by-11 dot-matrix icon in #4575cd
 * Inactive circles: 2px diameter at 20% opacity.
 * Active circles: 4px diameter in #4575cd.
 */
interface DotMatrixIconProps {
  activeCoords: [number, number][]; // [row, col] 0..10
}

const DotMatrixIcon: React.FC<DotMatrixIconProps> = ({ activeCoords }) => {
  const activeSet = new Set(activeCoords.map(([r, c]) => `${r}-${c}`));
  const dots: React.ReactNode[] = [];

  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 11; c++) {
      const isActive = activeSet.has(`${r}-${c}`);
      dots.push(
        <circle
          key={`${r}-${c}`}
          cx={c * 6 + 3}
          cy={r * 6 + 3}
          r={isActive ? 2 : 1}
          fill="#4575cd"
          opacity={isActive ? 1 : 0.2}
        />
      );
    }
  }

  return (
    <svg width="66" height="66" viewBox="0 0 66 66" fill="none" className="shrink-0">
      {dots}
    </svg>
  );
};

// 11x11 Icon Patterns: Layers / Folder / Terminal
const layersPattern: [number, number][] = [
  // Top layer
  [2, 3], [2, 4], [2, 5], [2, 6], [2, 7],
  [3, 2], [3, 8],
  [4, 3], [4, 4], [4, 5], [4, 6], [4, 7],
  // Middle layer
  [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8],
  // Bottom layer
  [8, 3], [8, 4], [8, 5], [8, 6], [8, 7],
];

const terminalPattern: [number, number][] = [
  // Screen frame
  [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8],
  [3, 2], [3, 8],
  [4, 2], [4, 4], [4, 8],
  [5, 2], [5, 5], [5, 8],
  [6, 2], [6, 4], [6, 7], [6, 8],
  [7, 2], [7, 8],
  [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], [8, 8],
];

const networkPattern: [number, number][] = [
  // Center node
  [5, 5], [5, 4], [5, 6],
  // Top-left node
  [2, 2], [2, 3], [3, 2],
  // Top-right node
  [2, 7], [2, 8], [3, 8],
  // Bottom node
  [8, 5], [8, 4], [8, 6],
  // Connector dots
  [4, 3], [4, 7], [6, 5], [7, 5],
];

export const Footer: React.FC = () => {
  return (
    <footer className="w-full pb-6 pt-10">
      {/* =========================================================================
          COLUMN CLOSING DESTINATION CONTAINER
          12px-inset, 12px-rounded pale #eeeff2 panel with 1px #e3e4e8 outline
          ========================================================================= */}
      <div className="closing-destination">
        <div className="max-w-column mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-14">
          
          {/* Closing Invitation (60px/1, -0.01em) + Support (18px/24px) */}
          <div className="max-w-2xl">
            <h2 className="font-sans text-[44px] sm:text-[56px] md:text-[60px] font-semibold text-navy dark:text-white leading-none tracking-tight">
              Start building today
            </h2>
            <p className="mt-3 font-sans text-[16px] sm:text-[18px] text-secondary-ink dark:text-muted-ink leading-[24px]">
              Practical capabilities, production heuristics, and runtime architecture deconstructed for engineers.
            </p>
          </div>

          {/* Three Route Cards (3-column grid with 20px gaps) */}
          <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Route Card 1: Domain Hubs */}
            <Link to="/subjects" className="closing-route-card group">
              <DotMatrixIcon activeCoords={layersPattern} />
              <div>
                <h3 className="font-sans text-[16px] font-semibold text-navy dark:text-white leading-tight group-hover:text-dot-blue transition-colors">
                  Explore Domain Hubs
                </h3>
                <p className="mt-1 text-[13px] text-muted-ink leading-normal">
                  Distributed systems, database storage engines, and cloud runtimes.
                </p>
              </div>
            </Link>

            {/* Route Card 2: Key Topics */}
            <Link to="/topics/postgresql" className="closing-route-card group">
              <DotMatrixIcon activeCoords={terminalPattern} />
              <div>
                <h3 className="font-sans text-[16px] font-semibold text-navy dark:text-white leading-tight group-hover:text-dot-blue transition-colors">
                  Deconstruct Internals
                </h3>
                <p className="mt-1 text-[13px] text-muted-ink leading-normal">
                  In-depth architectural notes, JVM memory models, and MVCC internals.
                </p>
              </div>
            </Link>

            {/* Route Card 3: System Runbooks */}
            <Link to="/subjects/devops-cloud-infrastructure" className="closing-route-card group">
              <DotMatrixIcon activeCoords={networkPattern} />
              <div>
                <h3 className="font-sans text-[16px] font-semibold text-navy dark:text-white leading-tight group-hover:text-dot-blue transition-colors">
                  Production Runbooks
                </h3>
                <p className="mt-1 text-[13px] text-muted-ink leading-normal">
                  Container optimizations, Dockerfile mechanics, and failure modes.
                </p>
              </div>
            </Link>
          </div>

          {/* Integrated Link Directory (72px top breathing room, 4 columns) */}
          <div className="mt-20 pt-12 border-t border-edge/80 dark:border-edge/40">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
              
              {/* Wordmark Column (4 cols) */}
              <div className="lg:col-span-4 space-y-3">
                <Link to="/" className="flex items-center gap-2.5 text-navy dark:text-white group inline-flex">
                  <span className="flex items-center justify-center w-7 h-7 rounded-[6px] bg-navy text-white font-mono text-[12px] font-medium">
                    $_
                  </span>
                  <div className="flex flex-col leading-none">
                    <span className="font-sans text-[15px] font-semibold tracking-tight text-heading-ink dark:text-white">
                      dev.notes
                    </span>
                    <span className="font-mono text-[11px] text-muted-ink">/infrastructure</span>
                  </div>
                </Link>
                <p className="text-[14px] leading-relaxed text-secondary-ink dark:text-muted-ink max-w-sm">
                  Technical infrastructure synthesized in soft focus. Living documentation and systems engineering knowledge.
                </p>
              </div>

              {/* 4 Directory Columns (8 cols) */}
              <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
                {/* Col 1: Domains */}
                <div className="space-y-3">
                  <h4 className="font-sans font-medium text-[14px] text-heading-ink dark:text-white tracking-tight">
                    Domains
                  </h4>
                  <ul className="space-y-2 text-[14px]">
                    <li>
                      <Link to="/subjects/backend-distributed-systems" className="text-muted-ink hover:text-navy dark:hover:text-white transition-colors">
                        Distributed Systems
                      </Link>
                    </li>
                    <li>
                      <Link to="/subjects/database-internals-storage" className="text-muted-ink hover:text-navy dark:hover:text-white transition-colors">
                        Storage &amp; DB
                      </Link>
                    </li>
                    <li>
                      <Link to="/subjects/devops-cloud-infrastructure" className="text-muted-ink hover:text-navy dark:hover:text-white transition-colors">
                        DevOps &amp; Cloud
                      </Link>
                    </li>
                    <li>
                      <Link to="/subjects" className="text-proof-green hover:underline font-medium">
                        View All Subjects →
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Col 2: Key Topics */}
                <div className="space-y-3">
                  <h4 className="font-sans font-medium text-[14px] text-heading-ink dark:text-white tracking-tight">
                    Topics
                  </h4>
                  <ul className="space-y-2 text-[14px]">
                    <li>
                      <Link to="/topics/postgresql" className="text-muted-ink hover:text-navy dark:hover:text-white transition-colors">
                        #postgresql
                      </Link>
                    </li>
                    <li>
                      <Link to="/topics/spring-boot" className="text-muted-ink hover:text-navy dark:hover:text-white transition-colors">
                        #spring-boot
                      </Link>
                    </li>
                    <li>
                      <Link to="/topics/docker" className="text-muted-ink hover:text-navy dark:hover:text-white transition-colors">
                        #docker
                      </Link>
                    </li>
                    <li>
                      <Link to="/topics/system-design" className="text-muted-ink hover:text-navy dark:hover:text-white transition-colors">
                        #system-design
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Col 3: Research */}
                <div className="space-y-3">
                  <h4 className="font-sans font-medium text-[14px] text-heading-ink dark:text-white tracking-tight">
                    Engineering
                  </h4>
                  <ul className="space-y-2 text-[14px]">
                    <li>
                      <Link to="/about" className="text-muted-ink hover:text-navy dark:hover:text-white transition-colors">
                        Operating Philosophy
                      </Link>
                    </li>
                    <li>
                      <Link to="/about" className="text-muted-ink hover:text-navy dark:hover:text-white transition-colors">
                        Writing Guidelines
                      </Link>
                    </li>
                    <li>
                      <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-ink hover:text-navy dark:hover:text-white transition-colors">
                        GitHub Source
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Col 4: Platform */}
                <div className="space-y-3">
                  <h4 className="font-sans font-medium text-[14px] text-heading-ink dark:text-white tracking-tight">
                    Platform
                  </h4>
                  <ul className="space-y-2 text-[14px]">
                    <li>
                      <span className="text-muted-ink">Release v2.4</span>
                    </li>
                    <li>
                      <span className="text-muted-ink">MIT License</span>
                    </li>
                    <li>
                      <span className="inline-flex items-center gap-1.5 text-proof-green text-[13px] font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-proof-green" />
                        System Operative
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>

          {/* Lower Hairline & Copyright */}
          <div className="mt-12 pt-6 border-t border-edge/60 dark:border-edge/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-muted-ink font-mono">
            <div>© {new Date().getFullYear()} dev.notes — Infrastructure in soft focus</div>
            <div>Built for deliberate engineers</div>
          </div>

        </div>
      </div>
    </footer>
  );
};
