'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

// --- AUTH NIGHT BACKGROUND COMPONENT ---

export function AuthNightBackground({ starCount = 80 }) {
  const [isClient, setIsClient] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && window.matchMedia) {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < starCount; i++) {
      const isFalling = Math.random() < 0.15; // 15% chance to be a falling star
      arr.push({
        id: i,
        // Falling stars start higher and further left to smoothly sweep across the whole screen
        x: isFalling ? (Math.random() * 120) - 20 : Math.random() * 100,
        y: isFalling ? (Math.random() * -30) - 10 : Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: isFalling ? Math.random() * 1.5 + 2 : Math.random() * 3 + 2,
        delay: Math.random() * 8,
        isFalling,
      });
    }
    return arr;
  }, [starCount]);

  return (
    // Deep dark night background with a very subtle midnight-teal tint to complement the pink
    <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-[#020b14] via-[#051320] to-[#010408] overflow-hidden -z-10 pointer-events-none">
      
      {/* --- PINK STARS --- */}
      <div className="absolute inset-0 w-full h-full">
        {isClient &&
          stars.map((star) => {
            if (reducedMotion) {
              return (
                <div
                  key={`star-${star.id}`}
                  className="absolute rounded-full bg-pink-400"
                  style={{
                    width: star.size,
                    height: star.size,
                    left: `${star.x}%`,
                    top: star.isFalling ? `${Math.random() * 100}%` : `${star.y}%`,
                    boxShadow: '0 0 8px rgba(255, 105, 180, 0.8)',
                  }}
                  aria-hidden
                />
              );
            }

            if (star.isFalling) {
              return (
                <motion.div
                  key={`star-${star.id}`}
                  className="absolute"
                  style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    width: `${Math.max(1, star.size - 1)}px`, 
                    height: `${star.size * 25}px`,
                    // Bright pink gradient tail
                    background: 'linear-gradient(to bottom, rgba(255,182,193,0) 0%, rgba(255,105,180,1) 100%)',
                    boxShadow: '0 8px 16px rgba(255, 105, 180, 0.9)',
                    borderRadius: '100px',
                    rotate: '-45deg', 
                  }}
                  animate={{
                    x: ['0vh', '150vh'], 
                    y: ['0vh', '150vh'], 
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: star.duration,
                    delay: star.delay,
                    repeat: Infinity,
                    ease: 'linear',
                    repeatDelay: 5 + Math.random() * 8, 
                  }}
                  aria-hidden
                />
              );
            }

            // Twinkling pink stars
            return (
              <motion.div
                key={`star-${star.id}`}
                className="absolute rounded-full bg-pink-400"
                style={{
                  width: star.size,
                  height: star.size,
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  boxShadow: '0 0 12px rgba(255, 105, 180, 0.9)',
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.8, 1.3, 0.8],
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

// --- DEMO APP WRAPPER ---

export default function App() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center font-sans">
      <AuthNightBackground starCount={90} />
    </div>
  );
}