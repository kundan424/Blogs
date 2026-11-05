import React from 'react';
import { seriesList } from '../data/series';
import { SeriesCard } from '../components/cards/SeriesCard';
import { Breadcrumb } from '../components/common/Breadcrumb';

export const SeriesPage: React.FC = () => {
  return (
    <div className="w-full bg-eggshell min-h-screen py-10">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 space-y-10">
        <section className="space-y-3 pb-8 border-b border-stone">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Series' },
            ]}
          />
          <h1 className="font-headline-xl text-headline-xl text-ink font-light tracking-tight">
            Curated Engineering Learning Series
          </h1>
          <p className="font-body-md text-body-md text-smoke max-w-2xl leading-relaxed">
            Structured, step-by-step masterclasses breaking down complex distributed systems, high-concurrency runtimes, and database engines into sequential, readable parts.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {seriesList.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </section>
      </div>
    </div>
  );
};
