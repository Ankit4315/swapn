'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// --- THREE.JS 3D GRASS COMPONENT ---
// This uses hardware-accelerated WebGL Instancing and custom Shaders to render 
// tens of thousands of grass blades at buttery smooth 60fps!
interface ThreeGrassFieldProps { isForeground?: boolean }
const ThreeGrassField: React.FC<ThreeGrassFieldProps> = ({ isForeground = false }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // 1. Setup Scene & Camera
    const scene = new THREE.Scene();
    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // Using identical camera settings for both layers to match perspective
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5);
    camera.lookAt(0, 0.5, 0);

    // 2. Setup Renderer (Transparent background)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    currentMount.appendChild(renderer.domElement);

    // 3. Grass Blade Geometry (Tapered Plane)
    const geometry = new THREE.PlaneGeometry(0.06, 1.5, 1, 4);
    geometry.translate(0, 0.75, 0); // Anchor rotation to the bottom of the blade

    // 4. Custom Wind Shader Material
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isForeground ? 1.0 : 0.85
    });

    // Inject custom organic wind animation into standard Three.js shader
    material.onBeforeCompile = (shader) => {
      shader.uniforms.time = { value: 0 };
      material.userData.shader = shader;

      shader.vertexShader = `uniform float time;\n` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        `#include <begin_vertex>`,
        `
        vec3 transformed = vec3( position );
        
        // Taper the grass blade to a point at the top
        transformed.x *= (1.0 - uv.y * 0.85);
        
        // Calculate world position to create rolling wind waves
        vec4 worldPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        
        // Organic wind algorithm (Reduced wave by another 50%)
        float windWave = sin(time * 2.5 + worldPos.x * 0.6 + worldPos.z * 0.8) * 0.04675;
        float windGust = sin(time * 1.2 + worldPos.x * 0.2) * 0.04675;
        
        // Bend more aggressively at the top (pow curve)
        float bend = pow(uv.y, 2.0);
        
        transformed.x += (windWave + windGust) * bend;
        transformed.z += (windWave * 0.5) * bend;
        `
      );
    };

    // 5. Instancing (Drawing thousands of blades in one single draw call)
    const count = isForeground ? 10000 : 8000;
    const mesh = new THREE.InstancedMesh(geometry, material, count);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    // Base properties for clearings around both trees
    const treeCenterX = -13.0;
    const treeCenterZ = -4.0;
    const clearingRadius = 7.0;

    // Updated coordinates to push the right tree clearing further back
    const tree2CenterX = 15.0; // Pushed further right
    const tree2CenterZ = -14.0; // Pushed to the very back of the grass field
    const clearing2Radius = 4.0; // Smaller clearing because the tree is further away

    for (let i = 0; i < count; i++) {
      // Spread grass out wide
      const x = (Math.random() - 0.5) * 35;

      // Determine depth placement based on which layer this is
      let z;
      if (isForeground) {
        z = Math.random() * 4; // Near camera [0 to 4]
      } else {
        z = (Math.random() * 14) - 15; // Far from camera [-15 to -1]
      }

      // Position & Natural random rotation
      dummy.position.set(x, 0, z);
      dummy.rotation.y = Math.random() * Math.PI;

      // Scale variations (taller in front, smaller in back)
      const depthScale = (z + 15) / 19; // normalized 0 to 1
      const baseScaleY = (Math.random() * 0.5 + 0.5) * (depthScale * 0.8 + 0.5);

      // --- LOGIC 1: Circular clearing around the primary left tree base ---
      const distToTreeX = x - treeCenterX;
      const distToTreeZ = z - treeCenterZ;
      const distToTree = Math.sqrt(distToTreeX * distToTreeX + distToTreeZ * distToTreeZ);

      let treeHeightFactor = 1.0;
      if (distToTree < clearingRadius) {
        const normalizedDist = distToTree / clearingRadius;
        treeHeightFactor = 0.15 + Math.pow(normalizedDist, 2.0) * 0.85;
      }

      // --- LOGIC 1B: Circular clearing around the new right Cherry Blossom tree ---
      const distToTree2X = x - tree2CenterX;
      const distToTree2Z = z - tree2CenterZ;
      const distToTree2 = Math.sqrt(distToTree2X * distToTree2X + distToTree2Z * distToTree2Z);

      let tree2HeightFactor = 1.0;
      if (distToTree2 < clearing2Radius) {
        const normalizedDist2 = distToTree2 / clearing2Radius;
        tree2HeightFactor = 0.2 + Math.pow(normalizedDist2, 2.0) * 0.8;
      }

      // --- LOGIC 2: Organic winding path from center-front to the primary left tree ---
      // Calculate interpolation factor 't' from 0 (front z=4) to 1 (tree z=-4)
      const t = Math.max(0, Math.min(1, (4.0 - z) / 8.0));

      // Winding path starting from center front (x=0) curving towards the tree (x=-13)
      const pathX = -13.0 * t + Math.sin(t * Math.PI) * -3.5;
      const distToPath = Math.abs(x - pathX);

      // Wider path at the front (closer to camera) shrinking as it reaches the tree
      const pathWidth = 1.5 + (1.0 - t) * 4.5;

      let pathHeightFactor = 1.0;
      // Only generate the path footprint in front of the tree depth
      if (z > -6.0 && distToPath < pathWidth) {
        const normalizedPathDist = distToPath / pathWidth;
        // Make the center of the path essentially flat/clear, blending to edges
        pathHeightFactor = 0.05 + Math.pow(normalizedPathDist, 2.0) * 0.95;
      }

      // Combine clearings by taking the minimum height factor
      const finalHeightFactor = Math.min(treeHeightFactor, tree2HeightFactor, pathHeightFactor);

      // --- LOGIC 3: Boost grass length on the left side (bottom-left and center-left) ---
      let regionalBoost = 1.0;
      if (x < 2.0) {
        // Increase height from center-right (x=2.0) all the way to far left (x=-17.5)
        const leftFactor = Math.min(Math.max((2.0 - x) / 19.5, 0.0), 1.0);
        regionalBoost = 1.0 + leftFactor * 1.5; // Up to 150% taller on the far left

        // Extra boost for the absolute bottom foreground
        if (isForeground) {
          regionalBoost *= 1.4;
        }
      }

      // Apply the factors and foreground reductions
      const foregroundAdjustment = isForeground ? 0.7 : 1.0;
      const scaleY = baseScaleY * 0.4 * finalHeightFactor * foregroundAdjustment * regionalBoost;
      const scaleX = (Math.random() * 0.5 + 0.8) * (finalHeightFactor * 0.4 + 0.6);
      dummy.scale.set(scaleX, scaleY, 1);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // --- Color based on depth and clearing fade ---
      if (isForeground) {
        // Foreground: Very dark silhouettes
        const depthT = z / 4; // 0 to 1
        // Fade the grass to dark ground within the path/clearings
        const opacityBias = finalHeightFactor < 0.9 ? finalHeightFactor + 0.2 : 1.0;
        color.setHSL(0.85, 0.6, (0.15 - depthT * 0.12) * Math.min(opacityBias, 1.0));
      } else {
        // Background: Glowing pinks blending to deep purple
        const depthT = (z + 15) / 14; // 0 to 1
        const opacityBias = finalHeightFactor < 0.9 ? finalHeightFactor + 0.3 : 1.0;
        color.setHSL(0.85 + Math.random() * 0.05, 0.8, (0.65 - depthT * 0.4) * Math.min(opacityBias, 1.0));
      }
      mesh.setColorAt(i, color);
    }

    scene.add(mesh);

    // 6. Animation Loop
    let animationFrameId: number | null = null;
    const startTime = performance.now();

    const animate = () => {
      if (material.userData.shader) {
        const elapsed = (performance.now() - startTime) / 1000;
        material.userData.shader.uniforms.time.value = elapsed;
      }
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // 7. Handle Resizing
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      currentMount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isForeground]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: isForeground ? 40 : 10,
        // Apply a CSS drop-shadow to the canvas container to create a soft, magical organic glow around the grass blades!
        filter: isForeground
          ? 'drop-shadow(0px -2px 5px rgba(255, 20, 147, 0.25))'
          : 'drop-shadow(0px -5px 12px rgba(255, 105, 180, 0.65))'
      }}
    />
  );
};

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


// --- MAIN SCENE ---
export function AnimatedBackground() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const seededRandom = (n: number) => {
    const x = Math.sin(n) * 10000;
    return x - Math.floor(x);
  };

  // Generate Stars
  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => {
      return {
        id: i,
        x: Number((seededRandom(i * 5 + 1) * 100).toFixed(2)),
        y: Number((seededRandom(i * 5 + 2) * 100).toFixed(2)),
        size: Number((seededRandom(i * 5 + 3) * 3 + 1).toFixed(2)),
        duration: Number((seededRandom(i * 5 + 4) * 3 + 2).toFixed(2)),
        delay: Number((seededRandom(i * 5 + 5) * 2).toFixed(2))
      };
    });
  }, []);

  // Generate Fireflies
  const fireflies = useMemo(() => {
    return Array.from({ length: 120 }).map((_, i) => {
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

  interface CloudProps { top: number; delay: number; duration: number; scale: number; opacity?: number }
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
        src="/pinkcloud.png"
        alt="Floating pink cloud"
        // Gave them a standard width so scaling makes a huge visual difference
        className="w-32 md:w-56 object-contain mix-blend-screen"
        style={{ filter: 'brightness(1.1) contrast(1.1)' }}
      />
    </motion.div>
  );

  return (
    <div className="fixed inset-0 w-full h-screen -z-10 bg-gradient-to-b from-[#0a0010] via-[#2d0a22] to-[#4a1030] overflow-hidden">

      {/* Sky & Stars */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {isClient && stars.map((star) => (
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

      {/* Pink Moon */}
      <motion.div
        className="absolute top-0 md:top-2 right-4 md:right-10 w-16 h-16 md:w-28 md:h-28 z-0"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      >
        <img src="/pinkmoon1.png" alt="Pink moon" className="w-full h-full object-contain mix-blend-screen opacity-95 drop-shadow-[0_0_40px_rgba(255,105,180,0.4)]" />
      </motion.div>

      {/* Pink Clouds */}
      {isClient && (
        <div className="z-0">
          {/* Top clouds: reduced size by 20% */}
          <Cloud top={10} delay={0} duration={60} scale={1.2} opacity={0.8} />
          <Cloud top={25} delay={-20} duration={80} scale={0.96} opacity={0.9} />

          {/* Mid cloud: reduced size by 20% */}
          <Cloud top={5} delay={-40} duration={50} scale={0.72} opacity={0.6} />

          {/* Lowest cloud: tiny, far in the distance near the grass */}
          <Cloud top={40} delay={-10} duration={70} scale={0.3} opacity={0.7} />
        </div>
      )}

      {/* --- UNIFIED 3D GROUND FIELD CONTAINER --- */}
      <div className="absolute bottom-0 w-full h-[55vh] md:h-[65vh] pointer-events-none">

        {/* Deep Ground Base Fade */}
        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-[#020001] via-[#1a0512]/95 to-transparent z-0" />

        {/* Pink Glow Bloom behind the horizon field */}
        <div className="absolute bottom-[5%] left-0 w-full h-[40%] bg-gradient-to-t from-[#ff1493]/30 via-[#ffb6c1]/10 to-transparent blur-3xl z-0" />

        {/* --- The New Right Tree (Cherry Blossom) - Pushed way back, higher up the screen, and scaled down! --- */}
        <div className="absolute bottom-[45%] md:bottom-[50%] right-[10%] md:right-[20%] w-16 md:w-20 h-[15%] md:h-[20%] flex flex-col items-center z-[15]">
          <motion.div
            className="relative w-full h-full flex items-end justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: 'easeOut', delay: 0.3 }}
          >
            {/* Restored mix-blend-screen because the uploaded image is a JPG with a black background! This removes the visible square boundary. */}
            <img
              src="/Cherryblossom.png"
              alt="Cherry blossom tree"
              className="w-full h-full object-contain mix-blend-screen drop-shadow-[0_0_15px_rgba(255,182,193,0.5)]"
              style={{
                // Mask the bottom so it fades perfectly into the deep grass
                maskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%)',
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%)'
              }}
            />
          </motion.div>
          <div className="absolute bottom-2 w-[60%] h-3 bg-[#ffb6c1] blur-[8px] opacity-30 rounded-[100%] z-[-1]" />
        </div>

        {/* --- Three.js Layer 1: Background Grass (Behind Main Tree, covers the base of the small Cherry Blossom tree) --- */}
        {isClient && <ThreeGrassField isForeground={false} />}

        {/* --- The Main Left Tree (Placed above all grass with a higher z-index 50) --- */}
        <div className="absolute bottom-[10%] md:bottom-[15%] left-[-15%] md:left-[-5%] w-full max-w-lg h-[75%] md:h-[80%] flex flex-col items-center z-50">
          <motion.div
            className="relative w-full h-full flex items-end justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          >
            <img src="/pinktree.png" alt="Majestic pink tree" className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(255,105,180,0.6)]" />
          </motion.div>
          <div className="absolute bottom-6 w-[50%] h-12 bg-[#ff69b4] blur-2xl opacity-50 rounded-[100%] z-[-1]" />
        </div>

        {/* Floating HTML Fireflies (Weaving through z-index layers) */}
        {isClient && fireflies.map((bug) => (
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

        {/* --- Three.js Layer 2: Foreground Grass (In Front of Left Tree) --- */}
        {isClient && <ThreeGrassField isForeground={true} />}

      </div>

    </div>
  );
}

export default function App() {
  return <AnimatedBackground />;
}