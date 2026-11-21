import React from 'react';

interface EndpointCapsuleProps {
  children: React.ReactNode;
  variant?: 'light' | 'dark' | 'pink' | 'teal' | 'glass';
  className?: string;
}

/**
 * Endpoint Capsule
 * Short eyebrow and proof-category label with two 6px endpoint dots
 * sitting halfway outside the left and right edges.
 */
export const EndpointCapsule: React.FC<EndpointCapsuleProps> = ({
  children,
  variant = 'light',
  className = '',
}) => {
  return (
    <span
      className={`relative inline-flex items-center justify-center px-3.5 py-1 rounded-full font-mono text-[12px] sm:text-[13px] uppercase tracking-[0.02em] font-medium select-none ${
        variant === 'glass'
          ? 'bg-white/10 text-white border border-white/20 backdrop-blur-md shadow-xs'
          : variant === 'teal' || variant === 'pink'
          ? 'bg-[#161616] text-[#ffffff] dark:bg-[#ffffff] dark:text-[#161616]'
          : variant === 'dark'
          ? 'bg-[#303030] text-[#fafafa]'
          : 'bg-[#f0f0f0] text-[#161616] dark:bg-[#303030] dark:text-[#fafafa]'
      } ${className}`}
    >
      <span
        className={`absolute -left-[3px] top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full ${
          variant === 'glass' ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-[#161616] dark:bg-[#fafafa]'
        }`}
        aria-hidden="true"
      />
      <span>{children}</span>
      <span
        className={`absolute -right-[3px] top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full ${
          variant === 'glass' ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-[#161616] dark:bg-[#fafafa]'
        }`}
        aria-hidden="true"
      />
    </span>
  );
};
