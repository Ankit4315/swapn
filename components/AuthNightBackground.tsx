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
      // Slightly increased chance of falling stars overall (20%)
      const isFalling = Math.random() < 0.20; 
      
      // Bias the falling stars heavily to the left side
      let fallingX = 0;
      if (isFalling) {
        // Push starting positions MUCH further left (-60% to 10%) so when they 
        // fly diagonally to the right, they actually stay visibly on the left half!
        fallingX = Math.random() < 0.85 
          ? (Math.random() * 70) - 60 
          : (Math.random() * 40) + 40;
      }

      arr.push({
        id: i,
        // Apply the biased X position for falling stars
        x: isFalling ? fallingX : Math.random() * 100,
        y: isFalling ? (Math.random() * -40) - 10 : Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: isFalling ? Math.random() * 1.5 + 2 : Math.random() * 3 + 2,
        delay: Math.random() * 8,
        isFalling,
      });
    }
    return arr;
  }, [starCount]);

  // Set specific positions for the clouds
  const clouds = useMemo(() => {
    return [
      // Close to the moon (top right of it)
      { id: 5, x: 18, y: 5, size: 160, duration: 24, delay: 1.5 },
      // Two close together on the left
      { id: 0, x: 10, y: 55, size: 240, duration: 18, delay: 0 },
      { id: 1, x: 20, y: 65, size: 200, duration: 22, delay: 2 },
      // One in the middle
      { id: 2, x: 45, y: 40, size: 280, duration: 20, delay: 1 },
      // Two independent ones on the right
      { id: 3, x: 70, y: 20, size: 180, duration: 17, delay: 3 },
      { id: 4, x: 80, y: 60, size: 220, duration: 19, delay: 4 },
    ];
  }, []);

  return (
    // Deep dark night background with a very subtle midnight-teal tint to complement the pink
    <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-[#020b14] via-[#051320] to-[#010408] overflow-hidden -z-10 pointer-events-none">
      
      {/* --- PINK MOON --- */}
      {isClient && (
        <motion.div
          className="absolute top-4 left-4 md:top-8 md:left-8 w-28 h-28 md:w-56 md:h-56 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 3, ease: 'easeOut' }}
        >
          {/* Soft pink glow behind the moon */}
          <div className="absolute inset-0 bg-pink-500/40 rounded-full blur-[20px] md:blur-[35px]" />
          
          <img
            src="/pinkmoon1.png"
            alt="Glowing Pink Moon"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="relative w-full h-full object-contain mix-blend-screen"
          />
        </motion.div>
      )}

      {/* --- PINK CLOUDS --- */}
      <div className="absolute inset-0 w-full h-full">
        {isClient &&
          clouds.map((cloud) => {
            if (reducedMotion) {
              return (
                <div
                  key={`cloud-${cloud.id}`}
                  className="absolute opacity-70"
                  style={{
                    left: `${cloud.x}%`,
                    top: `${cloud.y}%`,
                    width: `${cloud.size}px`,
                    height: `${cloud.size}px`,
                  }}
                >
                  <div className="absolute inset-0 bg-pink-500/30 rounded-full blur-[30px]" />
                  <img
                    src="/pinkcloud.png"
                    alt="Fluffy Pink Cloud"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    className="relative w-full h-full object-contain mix-blend-screen"
                  />
                </div>
              );
            }

            return (
              <motion.div
                key={`cloud-${cloud.id}`}
                className="absolute"
                style={{
                  left: `${cloud.x}%`,
                  top: `${cloud.y}%`,
                  width: `${cloud.size}px`,
                  height: `${cloud.size}px`,
                }}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 0.7, y: [0, -20, 0] }}
                transition={{
                  opacity: { duration: 4, delay: cloud.delay, ease: 'easeOut' },
                  y: { duration: cloud.duration, repeat: Infinity, ease: 'easeInOut', delay: cloud.delay }
                }}
              >
                {/* Soft pink glow behind each cloud */}
                <div className="absolute inset-0 bg-pink-500/30 rounded-full blur-[30px]" />
                
                <img
                  src="/pinkcloud.png"
                  alt="Fluffy Pink Cloud"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="relative w-full h-full object-contain mix-blend-screen"
                />
              </motion.div>
            );
          })}
      </div>

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
                    // Shortened the travel distance slightly so they fade out before reaching the far right
                    x: ['0vh', '100vh'], 
                    y: ['0vh', '100vh'], 
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