import React from 'react';
import { Pill } from '../common/Pill';
import { cn } from '../../utils/cn';

export interface FilterItem {
  id: string;
  label: string;
  count?: number | string;
  prefix?: React.ReactNode;
}

interface FilterBarProps {
  items: FilterItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  items,
  selectedId,
  onSelect,
  className,
}) => {
  return (
    <div
      className={cn(
        'no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none font-mono-data text-[10px]',
        className
      )}
      role="tablist"
    >
      {items.map((item) => (
        <Pill
          key={item.id}
          label={item.label}
          count={item.count}
          active={selectedId === item.id}
          variant="filter"
          prefix={item.prefix}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </div>
  );
};
