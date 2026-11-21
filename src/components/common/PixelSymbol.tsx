import React from 'react';

export type PixelSymbolVariant =
  | 'database'
  | 'runtime'
  | 'network'
  | 'container'
  | 'concurrency'
  | 'architecture'
  | 'cloud'
  | 'security'
  | 'terminal'
  | 'workflow';

interface PixelSymbolProps {
  variant: PixelSymbolVariant | string;
  size?: number;
  className?: string;
  pixelColor?: string;
}

/**
 * Pixel Capability Symbol
 * Assembled from separated rounded square pixels on an 8x8 or 10x10 grid,
 * matching n8n's signature technical illustration system.
 */
export const PixelSymbol: React.FC<PixelSymbolProps> = ({
  variant,
  size = 40,
  className = '',
  pixelColor,
}) => {
  // Grid definitions: 8x8 coordinates [col, row] (0-indexed)
  const getCoordinates = (v: string): [number, number][] => {
    switch (v) {
      case 'database':
      case 'storage':
        // Cylinder / disk stack
        return [
          // Top lid
          [2, 1], [3, 1], [4, 1], [5, 1],
          [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
          // Middle tier
          [1, 4], [6, 4],
          [2, 4], [3, 4], [4, 4], [5, 4],
          // Bottom tier
          [1, 6], [6, 6],
          [2, 6], [3, 6], [4, 6], [5, 6],
        ];

      case 'network':
      case 'distributed':
      case 'hub':
        // Distributed node cluster / hub
        return [
          // Central node
          [3, 3], [4, 3],
          [3, 4], [4, 4],
          // Connector lines
          [3, 1], [4, 1], // Top node
          [1, 3], [1, 4], // Left node
          [6, 3], [6, 4], // Right node
          [3, 6], [4, 6], // Bottom node
          // Outer satellites
          [1, 1], [6, 6],
        ];

      case 'runtime':
      case 'jvm':
      case 'execution':
        // Processor / execution chip
        return [
          [2, 2], [3, 2], [4, 2], [5, 2],
          [2, 3], [5, 3],
          [2, 4], [5, 4],
          [2, 5], [3, 5], [4, 5], [5, 5],
          // Pins
          [0, 3], [0, 4], // Left
          [7, 3], [7, 4], // Right
          [3, 0], [4, 0], // Top
          [3, 7], [4, 7], // Bottom
        ];

      case 'container':
      case 'docker':
      case 'cloud':
        // Stacked container units / shipping blocks
        return [
          [1, 1], [2, 1], [4, 1], [5, 1],
          [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3],
          [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5],
        ];

      case 'concurrency':
      case 'threads':
      case 'queue':
        // Parallel lanes with staggered worker pulses
        return [
          [1, 1], [2, 1], [3, 1],
          [3, 3], [4, 3], [5, 3], [6, 3],
          [1, 5], [2, 5],
          [4, 7], [5, 7], [6, 7],
        ];

      case 'security':
      case 'shield':
        // Technical shield silhouette
        return [
          [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
          [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
          [1, 3], [6, 3],
          [2, 4], [5, 4],
          [2, 5], [5, 5],
          [3, 6], [4, 6],
          [3, 7], [4, 7],
        ];

      case 'terminal':
      case 'prompt':
        // Command prompt >_
        return [
          [1, 1], [2, 2], [3, 3], [2, 4], [1, 5],
          [4, 6], [5, 6], [6, 6],
        ];

      case 'workflow':
      case 'architecture':
      default:
        // Branching workflow graph
        return [
          [1, 2], [2, 2],
          [3, 2], [3, 4],
          [4, 4], [5, 4],
          [4, 2], [5, 2],
          [6, 2], [6, 4],
        ];
    }
  };

  const coords = getCoordinates(variant.toLowerCase());
  const cellSize = 8;
  const gap = 2;
  const pixelRadius = 1.8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      aria-hidden="true"
    >
      {coords.map(([col, row], idx) => {
        const x = col * (cellSize + gap) + 4;
        const y = row * (cellSize + gap) + 4;
        return (
          <rect
            key={idx}
            x={x}
            y={y}
            width={cellSize}
            height={cellSize}
            rx={pixelRadius}
            className={pixelColor || 'fill-current'}
          />
        );
      })}
    </svg>
  );
};
