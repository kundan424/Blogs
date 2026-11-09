import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-footer dark:bg-[#100f0d] border-t border-edge/60 dark:border-stone/20 transition-colors">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-12">
          {/* Brand & Summary Column (Lg: 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-strong dark:text-white group inline-flex">
              <span className="flex items-center justify-center w-7 h-7 rounded-[6px] bg-[#37383c] text-white font-mono text-[12px] font-medium">
                $_
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-sans text-[15px] font-medium tracking-tight text-strong dark:text-white">
                  dev.notes
                </span>
                <span className="font-mono text-[11px] text-muted">/learnings</span>
              </div>
            </Link>

            <p className="font-sans text-[14px] leading-6 text-footer-text dark:text-ash max-w-sm">
              Approachable, deep architectural distillation, systems engineering runbooks, and algorithmic primitives synthesized for deliberate practitioners.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[12px] text-strong dark:text-white uppercase tracking-wider font-medium">
                Knowledge Base: Operative
              </span>
            </div>
          </div>

          {/* 4 Navigation Columns Group (Lg: 8 cols -> 4 sub-columns) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Column 1: Core Subjects */}
            <div className="space-y-3">
              <h4 className="font-sans font-semibold text-[14px] leading-6 text-footer-heading dark:text-white">
                Subjects
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/subjects/backend-distributed-systems" className="font-sans text-[14px] leading-6 text-footer-text dark:text-ash hover:text-footer-heading dark:hover:text-white transition-colors">
                    Distributed Systems
                  </Link>
                </li>
                <li>
                  <Link to="/subjects/database-internals-storage" className="font-sans text-[14px] leading-6 text-footer-text dark:text-ash hover:text-footer-heading dark:hover:text-white transition-colors">
                    Storage &amp; DB Internals
                  </Link>
                </li>
                <li>
                  <Link to="/subjects/data-structures-algorithms" className="font-sans text-[14px] leading-6 text-footer-text dark:text-ash hover:text-footer-heading dark:hover:text-white transition-colors">
                    Algorithms &amp; DSA
                  </Link>
                </li>
                <li>
                  <Link to="/subjects/devops-cloud-infrastructure" className="font-sans text-[14px] leading-6 text-footer-text dark:text-ash hover:text-footer-heading dark:hover:text-white transition-colors">
                    DevOps &amp; Infra
                  </Link>
                </li>
                <li>
                  <Link to="/subjects" className="font-sans text-[14px] leading-6 text-accent hover:underline">
                    View All Subjects →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Deep Topics */}
            <div className="space-y-3">
              <h4 className="font-sans font-semibold text-[14px] leading-6 text-footer-heading dark:text-white">
                Key Topics
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/topics/postgresql" className="font-sans text-[14px] leading-6 text-footer-text dark:text-ash hover:text-footer-heading dark:hover:text-white transition-colors">
                    #postgresql
                  </Link>
                </li>
                <li>
                  <Link to="/topics/distributed-systems" className="font-sans text-[14px] leading-6 text-footer-text dark:text-ash hover:text-footer-heading dark:hover:text-white transition-colors">
                    #raft-consensus
                  </Link>
                </li>
                <li>
                  <Link to="/topics/concurrency" className="font-sans text-[14px] leading-6 text-footer-text dark:text-ash hover:text-footer-heading dark:hover:text-white transition-colors">
                    #concurrency
                  </Link>
                </li>
                <li>
                  <Link to="/topics/networking" className="font-sans text-[14px] leading-6 text-footer-text dark:text-ash hover:text-footer-heading dark:hover:text-white transition-colors">
                    #tcp-ebpf
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Tracks & Curations */}
            <div className="space-y-3">
              <h4 className="font-sans font-semibold text-[14px] leading-6 text-footer-heading dark:text-white">
                Series &amp; Paths
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/series" className="font-sans text-[14px] leading-6 text-footer-text dark:text-ash hover:text-footer-heading dark:hover:text-white transition-colors">
                    Learning Series
                  </Link>
                </li>
                <li>
                  <Link to="/series" className="font-sans text-[14px] leading-6 text-footer-text dark:text-ash hover:text-footer-heading dark:hover:text-white transition-colors">
                    Consensus Protocols
                  </Link>
                </li>
                <li>
                  <Link to="/series" className="font-sans text-[14px] leading-6 text-footer-text dark:text-ash hover:text-footer-heading dark:hover:text-white transition-colors">
                    Storage Engines
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="font-sans text-[14px] leading-6 text-footer-text dark:text-ash hover:text-footer-heading dark:hover:text-white transition-colors">
                    System Architecture
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Resources */}
            <div className="space-y-3">
              <h4 className="font-sans font-semibold text-[14px] leading-6 text-footer-heading dark:text-white">
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="font-sans text-[14px] leading-6 text-footer-text dark:text-ash hover:text-footer-heading dark:hover:text-white transition-colors">
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <Link to="/about" className="font-sans text-[14px] leading-6 text-footer-text dark:text-ash hover:text-footer-heading dark:hover:text-white transition-colors">
                    About dev.notes
                  </Link>
                </li>
                <li>
                  <span className="font-sans text-[14px] leading-6 text-muted">
                    RSS Feed (v2.4)
                  </span>
                </li>
                <li>
                  <span className="font-sans text-[14px] leading-6 text-muted">
                    MIT Open License
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Lower Hairline & Copyright */}
        <div className="pt-8 border-t border-edge/60 dark:border-stone/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="font-mono text-[13px] text-muted">
              © {new Date().getFullYear()} dev.notes — Living Engineering Knowledge Base
            </span>
          </div>
          <div className="font-mono text-[12px] text-muted">
            Warm tools, vivid possibilities
          </div>
        </div>
      </div>
    </footer>
  );
};
