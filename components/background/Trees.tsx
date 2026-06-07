'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Trees: React.FC = () => {
  return (
    <>
      {/* --- Cherry Blossom Tree (far back, right side) --- */}
      <div className="absolute bottom-[45%] md:bottom-[50%] right-[10%] md:right-[20%] w-16 md:w-20 h-[15%] md:h-[20%] flex flex-col items-center z-[15]">
        <motion.div
          className="relative w-full h-full flex items-end justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: 'easeOut', delay: 0.3 }}
        >
          {/* Glow as a separate div — drop-shadow filter on img causes a compositing rectangle */}
          <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
            <div className="w-[50%] h-[50%] bg-[#ffb6c1] opacity-20 blur-[15px] rounded-full" />
          </div>
          <img
            src="/Cherryblossom-fixed.webp"
            alt="Cherry blossom tree"
            className="w-full h-full object-contain relative"
          />
        </motion.div>
      </div>

      {/* --- Main Left Tree (above all grass, z-50) --- */}
      <div className="absolute bottom-[10%] md:bottom-[15%] left-[-15%] md:left-[-5%] w-full max-w-lg h-[75%] md:h-[80%] flex flex-col items-center z-50">
        <motion.div
          className="relative w-full h-full flex items-end justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        >
          {/* Glow effect as a separate div behind the tree — NOT as a CSS filter on the img.
              CSS filter: drop-shadow() forces the browser to composite the element into an
              offscreen buffer with an opaque background, which creates a visible rectangle. */}
          <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
            <div className="w-[60%] h-[70%] bg-[#ff69b4] opacity-25 blur-[40px] rounded-full" />
          </div>
          <img src="/pinktree.webp" alt="Majestic pink tree" className="w-full h-full object-contain relative" />
        </motion.div>
      </div>
    </>
  );
};

export default React.memo(Trees);
