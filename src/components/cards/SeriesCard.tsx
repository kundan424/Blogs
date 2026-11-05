import React from 'react';
import { Link } from 'react-router-dom';
import { Series } from '../../types';
import { cn } from '../../utils/cn';

interface SeriesCardProps {
  series: Series;
  className?: string;
}

export const SeriesCard: React.FC<SeriesCardProps> = ({ series, className }) => {
  return (
    <div className={cn('rounded-xl bg-warm-taupe dark:bg-[#1a1815] p-space-lg shadow-sm border border-stone/80 dark:border-[#332e27]', className)}>
      <div className="flex items-center justify-between">
        <span className="font-mono-data text-label-sm text-ember-orange uppercase tracking-wider font-semibold">
          SERIES IN PROGRESS
        </span>
        <span className="rounded-full bg-secondary-container px-2.5 py-0.5 font-mono-data text-label-sm text-secondary font-medium">
          Part {series.currentPart} of {series.totalParts}
        </span>
      </div>

      <h4 className="mt-space-sm font-title-md text-title-md text-ink">
        {series.title}
      </h4>
      <p className="mt-space-xs font-body-sm text-body-sm text-smoke">
        {series.description}
      </p>

      {/* Linear Progress Bar */}
      <div className="mt-space-md">
        <div className="flex justify-between font-mono-data text-label-sm text-graphite mb-1.5">
          <span>Curriculum Completion</span>
          <span>{series.progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-stone overflow-hidden">
          <div
            className="h-full rounded-full bg-ember-orange transition-all duration-500"
            style={{ width: `${series.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Interactive Stepper */}
      <div className="mt-space-lg space-y-3">
        {series.steps.map((step) => {
          if (step.status === 'completed') {
            return (
              <div key={step.number} className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-on-primary">
                  <span className="material-symbols-outlined text-[12px]">check</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-graphite line-through">
                    {step.title}
                  </p>
                  <span className="font-mono-data text-label-sm text-smoke">
                    {step.meta}
                  </span>
                </div>
              </div>
            );
          }

          if (step.status === 'current') {
            return (
              <div key={step.number} className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-spark text-on-primary ring-4 ring-tertiary-fixed">
                  <span className="h-1.5 w-1.5 rounded-full bg-on-primary animate-pulse" />
                </div>
                <div>
                  {step.slug ? (
                    <Link
                      to={`/notes/${step.slug}`}
                      className="font-label-md text-label-md font-medium text-ink hover:text-violet-spark transition-colors"
                    >
                      {step.title}
                    </Link>
                  ) : (
                    <p className="font-label-md text-label-md font-medium text-ink">
                      {step.title}
                    </p>
                  )}
                  <span className="font-mono-data text-label-sm text-violet-spark font-medium">
                    {step.meta}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div key={step.number} className="flex items-start gap-3 opacity-60">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone text-smoke">
                <span className="font-mono-data text-[10px]">{step.number}</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-smoke">{step.title}</p>
                <span className="font-mono-data text-label-sm text-smoke">
                  {step.meta}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
