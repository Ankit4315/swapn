'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Seeded random for deterministic star positions across renders
const seededRandom = (n: number) => {
  const x = Math.sin(n) * 10000;
  return x - Math.floor(x);
};

const StarField: React.FC = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Number((seededRandom(i * 5 + 1) * 100).toFixed(2)),
      y: Number((seededRandom(i * 5 + 2) * 100).toFixed(2)),
      size: Number((seededRandom(i * 5 + 3) * 3 + 1).toFixed(2)),
      duration: Number((seededRandom(i * 5 + 4) * 3 + 2).toFixed(2)),
      delay: Number((seededRandom(i * 5 + 5) * 2).toFixed(2))
    }));
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-pink-100"
          style={{
            width: star.size, height: star.size, left: `${star.x}%`, top: `${star.y}%`,
            boxShadow: '0 0 8px rgba(255, 182, 193, 0.9)',
          }}
          animate={{ opacity: [0.1, 1, 0.1], scale: [1, 1.5, 1] }}
          transition={{ duration: star.duration, delay: star.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

export default React.memo(StarField);
