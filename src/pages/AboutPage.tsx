import React from 'react';
import { Breadcrumb } from '../components/common/Breadcrumb';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full bg-canvas text-body-ink min-h-screen py-10 transition-colors">
      <div className="max-w-column mx-auto w-full px-5 space-y-10">
        <section className="space-y-3 pb-8 border-b border-edge">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'About' },
            ]}
          />
          <div className="column-eyebrow text-muted-ink">ABOUT PLATFORM</div>
          <h1 className="text-[32px] sm:text-[44px] font-medium leading-[1.1] tracking-[-0.03em] text-navy dark:text-white">
            About dev.notes
          </h1>
          <p className="text-[15px] sm:text-[16px] text-secondary-ink dark:text-ash leading-relaxed max-w-2xl">
            Technical engineering notes, learning curricula, and architectural runbooks built with physical clarity and empirical precision.
          </p>
        </section>

        <section className="space-y-6 text-body-ink leading-relaxed max-w-3xl">
          <h2 className="text-[22px] sm:text-[26px] font-medium tracking-tight text-navy dark:text-white">
            Editorial Philosophy
          </h2>
          <p className="text-[15px] sm:text-[16px] text-secondary-ink dark:text-ash leading-relaxed">
            Most modern tech blogs oscillate between superficial introductory tutorials and impenetrable academic papers. <code>dev.notes</code> was created to bridge this chasm.
          </p>
          <p className="text-[15px] sm:text-[16px] text-secondary-ink dark:text-ash leading-relaxed">
            Every note published here is synthesized from production post-mortems, kernel profiling traces, high-scale architecture RFCs, and open-source engine internals (JVM, PostgreSQL, Linux eBPF, Envoy, and Redis).
          </p>

          <div className="p-6 rounded-[8px] bg-white dark:bg-panel border border-edge space-y-4 my-8 shadow-catalog-edge">
            <h3 className="font-mono text-[12px] uppercase tracking-wider text-muted-ink font-semibold">
              Core Tenets
            </h3>
            <ul className="space-y-3 text-[14px] text-body-ink">
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-proof-green text-[18px] shrink-0 mt-0.5">check_circle</span>
                <span><strong className="text-navy dark:text-white font-medium">Mechanical Sympathy:</strong> Know how hardware, kernel CPU caches, and disk spindles behave beneath the runtime.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-proof-green text-[18px] shrink-0 mt-0.5">check_circle</span>
                <span><strong className="text-navy dark:text-white font-medium">Mathematical Verification:</strong> Reject cargo-cult configurations; prove sizing rules with queuing theory and empirical metrics.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-proof-green text-[18px] shrink-0 mt-0.5">check_circle</span>
                <span><strong className="text-navy dark:text-white font-medium">Zero Noise Delivery:</strong> Dense, actionable prose designed to save engineers weeks of debugging in production outages.</span>
              </li>
            </ul>
          </div>

          <h2 className="text-[22px] sm:text-[26px] font-medium tracking-tight text-navy dark:text-white pt-4">
            Design Philosophy
          </h2>
          <p className="text-[15px] sm:text-[16px] text-secondary-ink dark:text-ash leading-relaxed">
            Inspired by technical infrastructure aesthetics: navy ink (<code>#111a4a</code>), cool gray canvas (<code>#f6f6f8</code>), mint-blue halftone dot artwork, precise proof green metrics (<code>#167e6c</code>), 36px physical key controls, and bounded deep teal chapters (<code>#011821</code>).
          </p>
        </section>
      </div>
    </div>
  );
};
