import React from 'react';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { EndpointCapsule } from '../components/common/EndpointCapsule';
import { PixelSymbol } from '../components/common/PixelSymbol';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full bg-bright-white dark:bg-[#161616] text-[#161616] dark:text-[#fafafa] min-h-screen py-10 transition-colors">
      <div className="max-w-[1190px] mx-auto w-full px-6 space-y-10">
        
        {/* Page Header */}
        <section className="p-8 sm:p-10 rounded-[24px] bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] space-y-4">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'About' },
            ]}
          />
          <EndpointCapsule>ABOUT PLATFORM</EndpointCapsule>
          <h1 className="heading-xl text-[#161616] dark:text-[#fafafa]">
            About dev.notes
          </h1>
          <p className="font-sans text-[17px] text-[#616161] dark:text-[#a3a3a3] leading-relaxed max-w-2xl">
            Technical systems engineering notes, structured learning curricula, and architectural runbooks built with production rigor and empirical clarity.
          </p>
        </section>

        {/* Content Body */}
        <section className="space-y-8 text-[#161616] dark:text-[#fafafa] leading-relaxed max-w-3xl">
          <div className="space-y-3">
            <h2 className="heading-lg text-[#161616] dark:text-[#fafafa]">
              Engineering Philosophy
            </h2>
            <p className="font-sans text-[16px] text-[#616161] dark:text-[#a3a3a3] leading-[1.35]">
              Most modern tech blogs oscillate between superficial introductory tutorials and impenetrable academic papers. <code>dev.notes</code> was created to bridge this chasm.
            </p>
            <p className="font-sans text-[16px] text-[#616161] dark:text-[#a3a3a3] leading-[1.35]">
              Every note published here is synthesized from production post-mortems, kernel profiling traces, high-scale architecture RFCs, and open-source engine internals (JVM, PostgreSQL, Linux eBPF, Envoy, and Redis).
            </p>
          </div>

          {/* Tenets Panel */}
          <div className="p-7 sm:p-8 rounded-[24px] bg-bright-white dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] space-y-5 my-8">
            <div className="flex items-center gap-2">
              <PixelSymbol variant="architecture" size={24} />
              <h3 className="font-mono text-[12px] uppercase tracking-[0.02em] text-[#161616] dark:text-[#fafafa] font-medium">
                Core Tenets
              </h3>
            </div>
            <ul className="space-y-4 text-[15px] font-sans">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#161616] dark:bg-[#ffffff] shrink-0 mt-2" />
                <span><strong className="text-[#161616] dark:text-[#fafafa] font-medium">Mechanical Sympathy:</strong> Know how hardware, kernel CPU caches, and disk spindles behave beneath high-level runtimes.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#161616] dark:bg-[#ffffff] shrink-0 mt-2" />
                <span><strong className="text-[#161616] dark:text-[#fafafa] font-medium">Mathematical Verification:</strong> Reject cargo-cult configurations; size thread pools and connections with Little&apos;s Law and queuing models.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#161616] dark:bg-[#ffffff] shrink-0 mt-2" />
                <span><strong className="text-[#161616] dark:text-[#fafafa] font-medium">Zero Noise Delivery:</strong> Dense, actionable prose designed to save engineers weeks of debugging in production outages.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="heading-lg text-[#161616] dark:text-[#fafafa]">
              Soft Machinery, Human Control
            </h2>
            <p className="font-sans text-[16px] text-[#616161] dark:text-[#a3a3a3] leading-[1.35]">
              Built with a refined monochrome technical aesthetic: bright white canvas (<code>#ffffff</code>) and workbench charcoal (<code>#161616</code> / <code>#212121</code>), high-contrast monochrome controls, compact medium grotesk display typography (Inter 500), uppercase monospace labels (IBM Plex Mono), dotted work surfaces, and pixel capability symbols.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};
