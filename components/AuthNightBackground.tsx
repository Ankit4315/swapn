'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  isFalling: boolean;
}

export function AuthNightBackground({ starCount = 60 }: { starCount?: number }) {
  const [isClient, setIsClient] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && window.matchMedia) {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  const stars = useMemo(() => {
    const arr: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      arr.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 6,
        isFalling: Math.random() < 0.12,
      });
    }
    return arr;
  }, [starCount]);

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-black via-zinc-900 to-slate-900 overflow-hidden -z-10 pointer-events-none">
      <div className="absolute inset-0 w-full h-full">
        {isClient &&
          stars.map((star) => {
            const style = {
              width: star.size,
              height: star.size,
              left: `${star.x}%`,
              top: `${star.y}%`,
              boxShadow: '0 0 8px rgba(255, 182, 193, 0.9)',
            } as React.CSSProperties;

            if (reducedMotion) {
              return (
                <div
                  key={`star-${star.id}`}
                  className="absolute rounded-full bg-pink-300"
                  style={style}
                  aria-hidden
                />
              );
            }

            if (star.isFalling) {
              return (
                <motion.div
                  key={`star-${star.id}`}
                  className="absolute rounded-full bg-pink-300"
                  style={style}
                  animate={{
                    opacity: [0.3, 1, 0],
                    y: [0, -6, 420],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 6 + Math.random() * 4,
                    delay: star.delay,
                    repeat: Infinity,
                    ease: 'linear',
                    repeatDelay: 6 + Math.random() * 6,
                  }}
                  aria-hidden
                />
              );
            }

            return (
              <motion.div
                key={`star-${star.id}`}
                className="absolute rounded-full bg-pink-300"
                style={style}
                animate={{
                  opacity: [0.25, 1, 0.25],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: star.duration,
                  delay: star.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                aria-hidden
              />
            );
          })}
      </div>
    </div>
  );
}
