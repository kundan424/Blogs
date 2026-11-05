import React from 'react';
import { cn } from '../../utils/cn';

interface MetricItemProps {
  label: string;
  value: string | number;
  subValue?: string;
  indicatorColor?: string;
  className?: string;
}

export const MetricItem: React.FC<MetricItemProps> = ({
  label,
  value,
  subValue,
  indicatorColor,
  className,
}) => {
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center gap-1.5">
        {indicatorColor && (
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: indicatorColor }}
          />
        )}
        <span className="font-headline-md text-headline-md text-ink font-light leading-none">
          {value}
        </span>
        {subValue && (
          <span className="font-mono-data text-label-sm text-smoke ml-1">
            {subValue}
          </span>
        )}
      </div>
      <span className="font-mono-data text-label-sm text-smoke mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};
