'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Moon: React.FC = () => {
  return (
    <motion.div
      className="absolute top-2 md:top-4 right-6 md:right-14 w-10 h-10 md:w-18 md:h-18 z-0"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 2, ease: 'easeOut' }}
    >
      <img
        src="/pinkmoon1.webp"
        alt="Pink moon"
        className="w-full h-full object-contain mix-blend-screen opacity-90 drop-shadow-[0_0_20px_rgba(255,105,180,0.3)]"
      />
    </motion.div>
  );
};

export default React.memo(Moon);
