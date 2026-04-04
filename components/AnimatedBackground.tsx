'use client';

import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface Flower {
  id: number;
  x: number;
  y: number;
  delay: number;
}

export function AnimatedBackground() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const stars = useMemo(() => {
    const starsArray: Star[] = [];
    for (let i = 0; i < 50; i++) {
      starsArray.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
      });
    }
    return starsArray;
  }, []);

  const flowers = useMemo(() => {
    const flowersArray: Flower[] = [];
    for (let i = 0; i < 8; i++) {
      flowersArray.push({
        id: i,
        x: (i + 1) * (100 / 9),
        y: 75,
        delay: i * 0.2,
      });
    }
    return flowersArray;
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-pink-900 via-pink-800 to-pink-700 overflow-hidden -z-10 pointer-events-none">
      {/* Stars container */}
      <div className="absolute inset-0 w-full h-full">
        {isClient &&
          stars.map((star) => (
            <motion.div
              key={`star-${star.id}`}
              className="absolute rounded-full bg-pink-200"
              style={{
                width: star.size,
                height: star.size,
                left: `${star.x}%`,
                top: `${star.y}%`,
                boxShadow: '0 0 10px rgba(255, 182, 193, 0.8)',
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: star.duration,
                delay: star.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
      </div>

      {/* Flowers container */}
      <div className="absolute bottom-0 w-full h-32 flex items-end justify-around px-8">
        {flowers.map((flower) => (
          <motion.div
            key={`flower-${flower.id}`}
            className="flex flex-col items-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: flower.delay,
              duration: 0.8,
            }}
          >
            {/* Flower stem */}
            <div className="w-1 h-16 bg-green-400 rounded-full" />

            {/* Flower bloom - using circles to create a simple flower */}
            <div className="relative w-12 h-12 -mt-2">
              {/* Center */}
              <div className="absolute inset-2 bg-yellow-300 rounded-full shadow-lg" />

              {/* Petals */}
              {[0, 60, 120, 180, 240, 300].map((rotation) => (
                <motion.div
                  key={`${flower.id}-petal-${rotation}`}
                  className="absolute w-5 h-5 bg-pink-400 rounded-full"
                  style={{
                    top: 6,
                    left: 6,
                    transformOrigin: '50% 12px',
                    transform: `rotate(${rotation}deg) translateY(-12px)`,
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    delay: flower.delay + rotation * 0.05,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Character silhouette placeholder */}
      <motion.div
        className="absolute bottom-32 right-12 text-white opacity-60"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 0.6 }}
        transition={{ duration: 1 }}
      >
        <svg width="120" height="200" viewBox="0 0 120 200">
          {/* Head */}
          <circle cx="60" cy="40" r="20" fill="white" opacity="0.5" />

          {/* Body */}
          <rect x="50" y="60" width="20" height="40" fill="white" opacity="0.5" />

          {/* Arms */}
          <line x1="50" y1="70" x2="30" y2="85" stroke="white" strokeWidth="3" opacity="0.5" />
          <line x1="70" y1="70" x2="90" y2="85" stroke="white" strokeWidth="3" opacity="0.5" />

          {/* Legs */}
          <line x1="52" y1="100" x2="45" y2="140" stroke="white" strokeWidth="3" opacity="0.5" />
          <line x1="68" y1="100" x2="75" y2="140" stroke="white" strokeWidth="3" opacity="0.5" />
        </svg>
      </motion.div>
    </div>
  );
}
