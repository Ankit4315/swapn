'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Seeded random for deterministic positions
const seededRandom = (n: number) => {
  const x = Math.sin(n) * 10000;
  return x - Math.floor(x);
};

const Fireflies: React.FC = () => {
  const fireflies = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const z = Math.pow(seededRandom(100 + i * 6 + 1), 1.2);
      const horizonBottom = (1 - z) * 30 - 5;

      return {
        id: i,
        left: Number((seededRandom(100 + i * 6 + 2) * 100).toFixed(2)),
        bottom: Number((horizonBottom + seededRandom(100 + i * 6 + 3) * 25).toFixed(2)),
        size: Number((z * 4 + 1.5).toFixed(2)),
        duration: Number((seededRandom(100 + i * 6 + 4) * 3 + 2).toFixed(2)),
        delay: Number((seededRandom(100 + i * 6 + 5) * 4).toFixed(2)),
        xOffset: Number((seededRandom(100 + i * 6 + 6) * 30 - 15).toFixed(2)),
        zIndex: z < 0.5 ? 25 : 35 // Weave between tree (z:20) and foreground (z:40)
      };
    });
  }, []);

  return (
    <>
      {fireflies.map((bug) => (
        <motion.div
          key={`bug-${bug.id}`}
          className="absolute rounded-full bg-[#fff0f5] mix-blend-screen"
          style={{
            width: bug.size, height: bug.size, left: `${bug.left}%`, bottom: `${bug.bottom}%`,
            zIndex: bug.zIndex,
            boxShadow: '0 0 8px 2px rgba(255, 182, 193, 0.8), 0 0 15px 4px rgba(255, 20, 147, 0.6)',
          }}
          animate={{ y: [0, -40, 0], x: [0, bug.xOffset, 0], opacity: [0, 1, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: bug.duration, delay: bug.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  );
};

export default React.memo(Fireflies);
