import React from 'react';
import { Breadcrumb } from '../components/common/Breadcrumb';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full bg-eggshell min-h-screen py-10">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 space-y-10">
        <section className="space-y-3 pb-8 border-b border-stone">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'About' },
            ]}
          />
          <h1 className="font-headline-xl text-headline-xl text-ink font-light tracking-tight">
            About dev.notes /learnings
          </h1>
          <p className="font-body-lg text-body-lg text-graphite leading-relaxed">
            A Bauhaus studio notebook on cream paper — warm, editorial, and technically precise.
          </p>
        </section>

        <section className="space-y-6 font-body-md text-graphite leading-relaxed">
          <h2 className="font-headline-md text-headline-md text-ink font-light">
            Editorial Philosophy
          </h2>
          <p>
            Most modern tech blogs oscillate between superficial introductory tutorials and impenetrable academic papers. <code>dev.notes</code> was created to bridge this chasm.
          </p>
          <p>
            Every single note published here is synthesized from production post-mortems, kernel profiling traces, high-scale architecture RFCs, and open-source engine internals (JVM, PostgreSQL, Linux eBPF, Envoy, and Redis).
          </p>

          <div className="p-6 rounded-2xl bg-warm-taupe border border-stone space-y-4 my-8">
            <h3 className="font-title-md text-title-md text-ink">
              Core Tenets
            </h3>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-ember-orange text-[18px] shrink-0 mt-0.5">check</span>
                <span><strong>Mechanical Sympathy:</strong> Know how hardware, kernel CPU caches, and disk spindles behave beneath the runtime.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-ember-orange text-[18px] shrink-0 mt-0.5">check</span>
                <span><strong>Mathematical Verification:</strong> Reject cargo-cult configurations; prove sizing rules with queuing theory and empirical metrics.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-ember-orange text-[18px] shrink-0 mt-0.5">check</span>
                <span><strong>Zero Noise Delivery:</strong> Dense, actionable prose designed to save engineers weeks of debugging in production outages.</span>
              </li>
            </ul>
          </div>

          <h2 className="font-headline-md text-headline-md text-ink font-light pt-6">
            The Design System
          </h2>
          <p>
            Inspired by Bauhaus typography and warm minimalism: off-white eggshell canvas (<code>#fdfcfc</code>), deep black ink type (<code>#000000</code>), warm taupe surface plates (<code>#f5f3f1</code>), and two vibrant sparks—Vivid Violet (<code>#0447ff</code>) and Ember Orange (<code>#ff4704</code>).
          </p>
        </section>
      </div>
    </div>
  );
};
