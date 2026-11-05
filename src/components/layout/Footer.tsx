import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-warm-taupe shadow-[0_1px_8px_rgba(0,0,0,0.02)] border-t border-stone/50 mt-16">
      <div className="max-w-7xl mx-auto px-margin lg:px-margin-desktop py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-xl pb-space-lg">
          {/* Brand Column */}
          <div className="space-y-space-sm md:col-span-2">
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-violet-spark animate-pulse" />
              <span className="font-mono-data text-label-sm text-ink uppercase tracking-wider font-semibold">
                System Status: Operative
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-smoke max-w-md leading-relaxed">
              Curated technical distillation, architecture whitepapers, systems engineering runbooks, and algorithmic primitives synthesized for deliberate practitioners.
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="space-y-space-xs">
            <div className="font-mono-data text-label-sm text-ink uppercase tracking-wider font-semibold">
              Knowledge Index
            </div>
            <ul className="space-y-space-xs">
              <li>
                <Link to="/subjects/backend-distributed-systems" className="font-body-sm text-body-sm text-on-surface-variant hover:text-ink transition-colors">
                  Distributed Systems
                </Link>
              </li>
              <li>
                <Link to="/subjects/database-internals-storage" className="font-body-sm text-body-sm text-on-surface-variant hover:text-ink transition-colors">
                  Database Internals &amp; Storage
                </Link>
              </li>
              <li>
                <Link to="/subjects/data-structures-algorithms" className="font-body-sm text-body-sm text-on-surface-variant hover:text-ink transition-colors">
                  Data Structures &amp; DSA
                </Link>
              </li>
              <li>
                <Link to="/subjects/devops-cloud-infrastructure" className="font-body-sm text-body-sm text-on-surface-variant hover:text-ink transition-colors">
                  DevOps &amp; Infrastructure
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="space-y-space-xs">
            <div className="font-mono-data text-label-sm text-ink uppercase tracking-wider font-semibold">
              Repository &amp; Feeds
            </div>
            <ul className="space-y-space-xs">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="font-body-sm text-body-sm text-on-surface-variant hover:text-ink transition-colors">
                  GitHub Notes Repo
                </a>
              </li>
              <li>
                <Link to="/series" className="font-body-sm text-body-sm text-on-surface-variant hover:text-ink transition-colors">
                  Learning Series
                </Link>
              </li>
              <li>
                <Link to="/about" className="font-body-sm text-body-sm text-on-surface-variant hover:text-ink transition-colors">
                  Architecture Principles
                </Link>
              </li>
              <li>
                <span className="font-body-sm text-body-sm text-smoke">
                  RSS Learning Stream (v2.4)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-space-md border-t border-stone/60 flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-ember-orange" />
            <span className="font-mono-data text-label-sm text-smoke">
              © {new Date().getFullYear()} dev.notes / MIT License
            </span>
          </div>
          <div className="font-mono-data text-label-sm text-smoke">
            v2.4.0-snapshot • bauhaus-grid
          </div>
        </div>
      </div>
    </footer>
  );
};
