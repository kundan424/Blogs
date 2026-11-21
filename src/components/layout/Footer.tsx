import React from 'react';
import { Link } from 'react-router-dom';
import { PixelSymbol } from '../common/PixelSymbol';
import { EndpointCapsule } from '../common/EndpointCapsule';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full px-4 sm:px-6 pb-6 pt-16">
      {/* Inset technical footer: 1392px-wide Dark workbench with 24px corners */}
      <div className="max-w-[1392px] mx-auto bg-[#212121] text-[#fafafa] rounded-[24px] border border-[#303030] overflow-hidden">
        
        {/* Upper Navigation Grid */}
        <div className="p-8 sm:p-12 lg:p-16 border-b border-[#303030]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            
            {/* Column 1: Identity & Brand */}
            <div className="space-y-4 lg:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2 group">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#fafafa] text-[#212121] font-mono text-[13px] font-medium transition-transform group-hover:scale-105">
                  $_
                </span>
                <span className="font-sans font-medium text-[20px] tracking-tight text-[#fafafa]">
                  dev.notes
                </span>
              </Link>
              <p className="text-[14px] leading-relaxed text-[#8f8f8f] max-w-xs font-sans">
                Living systems engineering knowledge base. Concurrency heuristics, storage engines, and distributed architectures synthesized for engineers.
              </p>
              <div className="pt-2 font-mono text-[12px] text-[#fafafa] uppercase tracking-[0.02em]">
                v3.0 • CONTINUOUS TRACE
              </div>
            </div>

            {/* Column 2: Domains */}
            <div className="space-y-4">
              <h4 className="font-mono text-[13px] uppercase tracking-[0.02em] font-medium text-[#fafafa]">
                Domains
              </h4>
              <ul className="space-y-2.5 font-mono text-[13px] uppercase tracking-[0.02em]">
                <li>
                  <Link
                    to="/subjects/backend-distributed-systems"
                    className="text-[#8f8f8f] hover:text-[#fafafa] transition-colors"
                  >
                    Distributed Systems
                  </Link>
                </li>
                <li>
                  <Link
                    to="/subjects/database-internals-storage"
                    className="text-[#8f8f8f] hover:text-[#fafafa] transition-colors"
                  >
                    Database Internals
                  </Link>
                </li>
                <li>
                  <Link
                    to="/subjects/devops-cloud-infrastructure"
                    className="text-[#8f8f8f] hover:text-[#fafafa] transition-colors"
                  >
                    Cloud &amp; DevOps
                  </Link>
                </li>
                <li>
                  <Link
                    to="/subjects"
                    className="text-[#fafafa] hover:underline"
                  >
                    All Domains →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Topics */}
            <div className="space-y-4">
              <h4 className="font-mono text-[13px] uppercase tracking-[0.02em] font-medium text-[#fafafa]">
                Topics
              </h4>
              <ul className="space-y-2.5 font-mono text-[13px] uppercase tracking-[0.02em]">
                <li>
                  <Link
                    to="/topics/postgresql"
                    className="text-[#8f8f8f] hover:text-[#fafafa] transition-colors"
                  >
                    #postgresql
                  </Link>
                </li>
                <li>
                  <Link
                    to="/topics/spring-boot"
                    className="text-[#8f8f8f] hover:text-[#fafafa] transition-colors"
                  >
                    #spring-boot
                  </Link>
                </li>
                <li>
                  <Link
                    to="/topics/docker"
                    className="text-[#8f8f8f] hover:text-[#fafafa] transition-colors"
                  >
                    #docker
                  </Link>
                </li>
                <li>
                  <Link
                    to="/topics/system-design"
                    className="text-[#8f8f8f] hover:text-[#fafafa] transition-colors"
                  >
                    #system-design
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Curricula */}
            <div className="space-y-4">
              <h4 className="font-mono text-[13px] uppercase tracking-[0.02em] font-medium text-[#fafafa]">
                Curricula
              </h4>
              <ul className="space-y-2.5 font-mono text-[13px] uppercase tracking-[0.02em]">
                <li>
                  <Link
                    to="/learning-paths/spring-boot-production-mastery"
                    className="text-[#8f8f8f] hover:text-[#fafafa] transition-colors"
                  >
                    Spring Boot Mastery
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learning-paths/production-microservices-distributed-architecture"
                    className="text-[#8f8f8f] hover:text-[#fafafa] transition-colors"
                  >
                    Microservices Architecture
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learning-paths/docker-container-runtime-mastery"
                    className="text-[#8f8f8f] hover:text-[#fafafa] transition-colors"
                  >
                    Docker Runtime
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learning-paths/system-design"
                    className="text-[#8f8f8f] hover:text-[#fafafa] transition-colors"
                  >
                    System Design
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Tenets */}
            <div className="space-y-4">
              <h4 className="font-mono text-[13px] uppercase tracking-[0.02em] font-medium text-[#fafafa]">
                Tenets
              </h4>
              <ul className="space-y-2.5 font-mono text-[13px] uppercase tracking-[0.02em]">
                <li>
                  <Link
                    to="/about"
                    className="text-[#8f8f8f] hover:text-[#fafafa] transition-colors"
                  >
                    Operating Philosophy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-[#8f8f8f] hover:text-[#fafafa] transition-colors"
                  >
                    Empirical Verification
                  </Link>
                </li>
                <li>
                  <span className="text-[#fafafa] font-mono text-[12px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fafafa]" />
                    <span>Zero Marketing Fluff</span>
                  </span>
                </li>
                <li>
                  <span className="text-[#8f8f8f] text-[12px] font-mono">
                    MIT Open Architecture
                  </span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Signature Footer Dot Field: 360px-deep field of 2px #303030 dots at 24px intervals */}
        <div className="footer-dot-field relative min-h-[320px] sm:min-h-[360px] flex items-center justify-center p-8 sm:p-12 text-center">
          <div className="relative z-10 max-w-2xl flex flex-col items-center">
            <div className="mb-4">
              <PixelSymbol variant="architecture" size={44} className="text-[#fafafa]" />
            </div>

            <EndpointCapsule variant="dark" className="mb-6">
              Empirical Systems Engineering
            </EndpointCapsule>

            <h3 className="font-sans font-medium text-[28px] sm:text-[38px] text-[#fafafa] leading-[1.05] tracking-tight">
              When the reading ends, the runtime begins.
            </h3>

            <p className="mt-4 font-sans text-[15px] sm:text-[16px] text-[#8f8f8f] max-w-lg leading-relaxed">
              Every note is validated against live execution traces, memory profilers, and production constraints.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/subjects" className="btn-primary">
                <span>Explore Domain Hubs</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
              <Link to="/about" className="btn-secondary">
                <span>Operating Philosophy</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Utility Row: links left, social marks centered, copyright right */}
        <div className="px-8 sm:px-12 py-6 border-t border-[#303030] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[12px] uppercase tracking-[0.02em] text-[#8f8f8f]">
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-[#fafafa] transition-colors">Philosophy</Link>
            <Link to="/subjects" className="hover:text-[#fafafa] transition-colors">Directory</Link>
            <Link to="/topics/postgresql" className="hover:text-[#fafafa] transition-colors">Postgres</Link>
          </div>

          <div className="flex items-center gap-4 text-[#a3a3a3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fafafa]" />
            <span>Soft Machinery, Human Control</span>
          </div>

          <div>
            © {new Date().getFullYear()} dev.notes — Production Engineering
          </div>
        </div>

      </div>
    </footer>
  );
};
