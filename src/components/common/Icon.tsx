import React from 'react';
import { cn } from '../../utils/cn';

interface IconProps {
  name: string;
  className?: string;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({ name, className, size }) => {
  return (
    <span
      className={cn('material-symbols-outlined select-none', className)}
      style={size ? { fontSize: typeof size === 'number' ? `${size}px` : size } : undefined}
    >
      {name}
    </span>
  );
};
