import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { EnrichedLearningPath } from '../../utils/learningPathLoader';
import { CuratedPathCard } from './CuratedPathCard';

interface CircularCuratedPathsCarouselProps {
  paths: EnrichedLearningPath[];
}

export const CircularCuratedPathsCarousel: React.FC<CircularCuratedPathsCarouselProps> = ({ paths }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = paths.length;

  const nextOrbit = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevOrbit = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextOrbit();
    if (e.key === 'ArrowLeft') prevOrbit();
  };

  // Responsive horizontal spacing between cards
  const [spacing, setSpacing] = useState(310);

  useEffect(() => {
    const updateSpacing = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setSpacing(140);
      } else if (width < 1024) {
        setSpacing(230);
      } else {
        setSpacing(310);
      }
    };

    updateSpacing();
    window.addEventListener('resize', updateSpacing);
    return () => window.removeEventListener('resize', updateSpacing);
  }, []);

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="relative w-full flex flex-col items-center select-none focus:outline-hidden py-2"
      aria-label="Curated learning pathways circular carousel"
    >
      {/* Stage Container */}
      <div
        className="relative w-full h-[410px] sm:h-[430px] flex items-center justify-center overflow-hidden sm:overflow-visible"
        style={{ perspective: '1000px' }}
      >
        {/* Subtle Ambient Orbit Ring Guide */}
        <div
          className="absolute w-[88%] sm:w-[76%] max-w-[720px] h-[180px] rounded-[50%] border border-dashed border-[#d9d9d9]/60 dark:border-[#333333]/80 pointer-events-none -translate-y-2"
          style={{ transform: 'rotateX(72deg)' }}
        />

        {/* Floating Small Left Arrow Button */}
        <button
          type="button"
          onClick={prevOrbit}
          aria-label="Previous pathway"
          className="absolute left-1 sm:left-4 z-50 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] hover:border-[#161616] dark:hover:border-[#ffffff] text-[#161616] dark:text-[#fafafa] flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-110 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </button>

        {/* Floating Small Right Arrow Button */}
        <button
          type="button"
          onClick={nextOrbit}
          aria-label="Next pathway"
          className="absolute right-1 sm:right-4 z-50 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] hover:border-[#161616] dark:hover:border-[#ffffff] text-[#161616] dark:text-[#fafafa] flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-110 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>

        {/* Cards Stack with Strict Stacking Order & Solid White Surfaces */}
        {paths.map((path, idx) => {
          // Circular offset calculation relative to activeIndex
          let offset = idx - activeIndex;
          if (offset > total / 2) offset -= total;
          if (offset < -total / 2) offset += total;

          const isFront = offset === 0;
          const absOffset = Math.abs(offset);

          let targetX = 0;
          let targetScale = 1;
          let targetOpacity = 1;
          let targetRotateY = 0;
          let isVisible = true;

          if (offset === 0) {
            targetX = 0;
            targetScale = 1;
            targetOpacity = 1;
            targetRotateY = 0;
          } else if (offset === 1) {
            targetX = spacing;
            targetScale = 0.88;
            targetOpacity = 0.88;
            targetRotateY = -9;
          } else if (offset === -1) {
            targetX = -spacing;
            targetScale = 0.88;
            targetOpacity = 0.88;
            targetRotateY = 9;
          } else if (offset === 2) {
            targetX = spacing * 1.62;
            targetScale = 0.76;
            targetOpacity = 0.35;
            targetRotateY = -16;
          } else if (offset === -2) {
            targetX = -spacing * 1.62;
            targetScale = 0.76;
            targetOpacity = 0.35;
            targetRotateY = 16;
          } else {
            // Cards on the backside are hidden to avoid overlapping or bleed-through
            targetX = offset > 0 ? spacing * 2 : -spacing * 2;
            targetScale = 0.6;
            targetOpacity = 0;
            targetRotateY = 0;
            isVisible = false;
          }

          // Strict z-index: front card is always on top (50), adjacent (30), outer (20), hidden (10)
          const zIndex = isFront ? 50 : 40 - absOffset * 10;

          return (
            <motion.div
              key={path.id}
              onClick={() => {
                if (!isFront) {
                  setActiveIndex(idx);
                }
              }}
              // Horizontal drag navigation on front card
              drag={isFront ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragEnd={(_, info) => {
                if (info.offset.x < -30 || info.velocity.x < -180) {
                  nextOrbit();
                } else if (info.offset.x > 30 || info.velocity.x > 180) {
                  prevOrbit();
                }
              }}
              animate={{
                x: targetX,
                scale: targetScale,
                opacity: targetOpacity,
                rotateY: targetRotateY,
              }}
              transition={{
                type: 'spring',
                stiffness: 220,
                damping: 26,
                mass: 0.8,
              }}
              style={{
                position: 'absolute',
                zIndex,
                cursor: isFront ? 'grab' : 'pointer',
                pointerEvents: isVisible ? 'auto' : 'none',
                visibility: isVisible ? 'visible' : 'hidden',
              }}
              whileDrag={{ cursor: 'grabbing' }}
              className="w-[86%] max-w-[290px] sm:max-w-[320px] touch-none"
            >
              <div
                className={`transition-all duration-300 rounded-[22px] ${
                  isFront
                    ? 'shadow-[0_18px_45px_-10px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] ring-1.5 ring-[#161616] dark:ring-[#ffffff]'
                    : 'hover:ring-1 hover:ring-[#161616]/20 dark:hover:ring-white/20'
                }`}
              >
                <CuratedPathCard path={path} index={idx} compact={true} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Minimal Bottom Bar: Small Arrow Controls + Circular Indicator Dots */}
      <div className="mt-3 flex items-center justify-center gap-3 relative z-40">
        {/* Small Left Arrow */}
        <button
          type="button"
          onClick={prevOrbit}
          aria-label="Previous pathway"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] hover:border-[#161616] dark:hover:border-[#ffffff] flex items-center justify-center text-[#161616] dark:text-[#fafafa] transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
        </button>

        {/* Minimal Indicator Dots */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333]">
          {paths.map((p, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`transition-all cursor-pointer rounded-full ${
                  isSelected
                    ? 'w-5 h-1.5 bg-[#161616] dark:bg-[#ffffff]'
                    : 'w-1.5 h-1.5 bg-[#b5b5b5] dark:bg-[#555555] hover:bg-[#161616] dark:hover:bg-[#fafafa]'
                }`}
                aria-label={`Go to pathway ${idx + 1}`}
                title={p.title}
              />
            );
          })}
        </div>

        {/* Small Right Arrow */}
        <button
          type="button"
          onClick={nextOrbit}
          aria-label="Next pathway"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#f0f0f0] dark:bg-[#212121] border border-[#d9d9d9] dark:border-[#333333] hover:border-[#161616] dark:hover:border-[#ffffff] flex items-center justify-center text-[#161616] dark:text-[#fafafa] transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </button>
      </div>

      {/* Subtle Hint */}
      <div className="mt-2 text-center font-mono text-[10.5px] uppercase tracking-[0.02em] text-[#8f8f8f]">
        <span>Drag with cursor or use small arrows to rotate</span>
      </div>
    </div>
  );
};
