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
        <span className="text-[26px] font-medium text-navy dark:text-white leading-none">
          {value}
        </span>
        {subValue && (
          <span className="font-mono text-[11px] text-muted-ink ml-1">
            {subValue}
          </span>
        )}
      </div>
      <span className="font-mono text-[11px] text-muted-ink mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};
