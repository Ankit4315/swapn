'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Isolated, memoized background layer components ---
import StarField from './background/StarField';
import Moon from './background/Moon';
import Clouds from './background/Clouds';
import ThreeGrassField from './background/ThreeGrassField';
import Trees from './background/Trees';
import Fireflies from './background/Fireflies';

// --- GEMINI API LLM INTEGRATION ---
const getTreeWisdom = async (prompt: string, retryCount = 0): Promise<string> => {
  const apiKey = ""; // Provided by execution environment
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const systemInstruction = `
    You are the spirit of an ancient, magical pink tree in a glowing forest. 
    A traveler approaches you and whispers a thought, wish, or worry.
    Respond in a gentle, poetic, slightly mysterious, and comforting tone. 
    Keep your response short (1 to 3 sentences maximum). 
    If they share a worry, soothe it. If they share a wish, bless it with the magic of the forest.
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "The tree's leaves rustle softly, granting you peace.";
  } catch (error) {
    if (retryCount < 5) {
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(r => setTimeout(r, delay));
      return getTreeWisdom(prompt, retryCount + 1);
    }
    throw new Error("The magic of the tree is currently resting. Try whispering again later.");
  }
};

// --- WHISPER UI COMPONENT ---
export const WishtreeInterface: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [treeResponse, setTreeResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleWhisper = async () => {
    if (!inputText.trim()) return;

    setIsGenerating(true);
    setTreeResponse(null);
    setError(null);

    try {
      const wisdom = await getTreeWisdom(inputText);
      setTreeResponse(wisdom);
      setInputText("");
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="absolute top-8 left-8 md:top-12 md:left-12 z-[60] pointer-events-auto w-full max-w-sm pr-8">
      {!isOpen ? (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-pink-300/30 rounded-full text-pink-100 shadow-[0_0_20px_rgba(255,105,180,0.3)] transition-all flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-xl">✨</span>
          <span className="font-medium tracking-wide">Whisper to the Tree</span>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-[#1a020a]/60 backdrop-blur-xl border border-pink-400/30 p-6 rounded-2xl shadow-[0_0_40px_rgba(255,105,180,0.2)]"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-pink-200 font-serif italic text-xl flex items-center gap-2">
              <span>✨</span> The Wishtree
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-pink-300/50 hover:text-pink-200 transition-colors"
            >
              ✕
            </button>
          </div>

          <p className="text-pink-100/70 text-sm mb-4">
            Share a wish, a dream, or a worry with the ancient pink tree...
          </p>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="I wish for..."
            className="w-full bg-black/40 border border-pink-500/30 rounded-xl p-3 text-pink-100 placeholder-pink-300/30 focus:outline-none focus:border-pink-400/60 resize-none h-24 mb-4"
          />

          <button
            onClick={handleWhisper}
            disabled={isGenerating || !inputText.trim()}
            className="w-full py-3 bg-gradient-to-r from-[#ff1493]/60 to-[#ff69b4]/60 hover:from-[#ff1493]/80 hover:to-[#ff69b4]/80 disabled:opacity-50 text-white rounded-xl font-medium transition-all flex justify-center items-center gap-2"
          >
            {isGenerating ? (
              <span className="animate-pulse">The tree is listening...</span>
            ) : (
              <><span>✨</span> Seek Wisdom</>
            )}
          </button>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 text-red-300/90 text-sm p-3 bg-red-900/20 rounded-lg border border-red-500/20"
              >
                {error}
              </motion.div>
            )}
            {treeResponse && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 text-pink-50 text-sm leading-relaxed p-4 bg-pink-900/20 rounded-xl border border-pink-300/20 font-serif italic shadow-inner"
              >
                "{treeResponse}"
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};


// --- MAIN SCENE ORCHESTRATOR ---
// Each visual layer is a separate React.memo component that manages its own state.
// This prevents re-renders in one layer from affecting others.
export function AnimatedBackground() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-screen -z-10 bg-gradient-to-b from-[#0a0010] via-[#2d0a22] to-[#4a1030] overflow-hidden">

      {/* Sky & Stars */}
      {isClient && <StarField />}

      {/* Pink Moon */}
      <Moon />

      {/* Pink Clouds */}
      {isClient && <Clouds />}

      {/* --- UNIFIED 3D GROUND FIELD CONTAINER --- */}
      <div className="absolute bottom-0 w-full h-[55vh] md:h-[65vh] pointer-events-none">

        {/* Deep Ground Base Fade */}
        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-[#020001] via-[#1a0512]/95 to-transparent z-0" />

        {/* Pink Glow Bloom behind the horizon field */}
        <div className="absolute bottom-[5%] left-0 w-full h-[40%] bg-gradient-to-t from-[#ff1493]/30 via-[#ffb6c1]/10 to-transparent blur-3xl z-0" />

        {/* Trees (Cherry Blossom + Main Tree) */}
        <Trees />

        {/* Three.js Layer 1: Background Grass */}
        {isClient && <ThreeGrassField isForeground={false} />}

        {/* Three.js Layer 2: Foreground Grass */}
        {isClient && <ThreeGrassField isForeground={true} />}

        {/* Floating Fireflies */}
        {isClient && <Fireflies />}

      </div>

    </div>
  );
}

export default function App() {
  return <AnimatedBackground />;
}