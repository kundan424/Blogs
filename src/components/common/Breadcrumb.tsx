import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center flex-wrap gap-1.5 font-mono text-[12px] uppercase tracking-[0.02em] text-[#616161] dark:text-[#a3a3a3]', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-[#8f8f8f]/60 text-[10px] select-none">/</span>}
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="hover:text-[#161616] dark:hover:text-[#fafafa] transition-colors flex items-center gap-1"
              >
                {item.icon && <span className="material-symbols-outlined text-[14px]">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className={cn('text-[#161616] dark:text-[#fafafa] font-medium flex items-center gap-1', isLast && 'truncate max-w-[280px] sm:max-w-md')}>
                {item.icon && <span className="material-symbols-outlined text-[14px]">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
