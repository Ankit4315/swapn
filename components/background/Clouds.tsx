'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CloudProps {
  top: number;
  delay: number;
  duration: number;
  scale: number;
  opacity?: number;
}

const Cloud: React.FC<CloudProps> = ({ top, delay, duration, scale, opacity = 1 }) => (
  <motion.div
    className="absolute flex items-center justify-center pointer-events-none"
    style={{ top: `${top}%`, opacity }}
    // PASS SCALE DIRECTLY TO FRAMER MOTION!
    // Otherwise, Framer Motion overwrites scale when managing the 'x' animation
    initial={{ x: '-30vw', scale: scale }}
    animate={{ x: '120vw', scale: scale }}
    transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
  >
    <img
      src="/pinkcloud.webp"
      alt="Floating pink cloud"
      className="w-32 md:w-56 object-contain mix-blend-screen"
      style={{ filter: 'brightness(1.1) contrast(1.1)' }}
    />
  </motion.div>
);

const Clouds: React.FC = () => {
  return (
    <div className="z-0">
      {/* High sky clouds — small and distant */}
      <Cloud top={6} delay={0} duration={70} scale={0.55} opacity={0.6} />
      <Cloud top={15} delay={-20} duration={90} scale={0.45} opacity={0.7} />

      {/* Mid-sky wisp */}
      <Cloud top={3} delay={-40} duration={60} scale={0.35} opacity={0.45} />

      {/* Tiny distant cloud near horizon */}
      <Cloud top={28} delay={-10} duration={80} scale={0.15} opacity={0.5} />
    </div>
  );
};

export default React.memo(Clouds);
