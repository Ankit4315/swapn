'use client';

import React from 'react';
import { motion } from 'framer-motion';

// --- MOCKS FOR NEXT.JS & NEXT-AUTH ---
// These simulate your Next.js environment so the component can render in this preview
const useSession = () => ({ data: { user: { username: 'StarGazer' } } });
const useRouter = () => ({ push: (url) => console.log('Navigating to:', url) });
const signOut = async () => console.log('Signing out...');
const Link = ({ href, children, className }) => <a href={href} className={className}>{children}</a>;


// --- ACTUAL APP NAV CODE ---
export function AppNav() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  if (!session?.user) return null;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative z-50 sticky top-0 backdrop-blur-xl border-b border-pink-400/20 shadow-[0_4px_30px_rgba(255,20,147,0.15)] overflow-hidden"
    >
      {/* Galaxy Background Effect Layer */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 15% 30%, rgba(255, 255, 255, 0.8), transparent),
            radial-gradient(1px 1px at 25% 70%, rgba(255, 182, 193, 0.8), transparent),
            radial-gradient(2px 2px at 45% 20%, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(1px 1px at 65% 60%, rgba(255, 182, 193, 0.8), transparent),
            radial-gradient(1.5px 1.5px at 85% 40%, rgba(255, 255, 255, 0.8), transparent),
            radial-gradient(circle at 20% 150%, rgba(255, 20, 147, 0.25), transparent 60%),
            radial-gradient(circle at 80% -50%, rgba(138, 43, 226, 0.25), transparent 60%),
            radial-gradient(circle at 50% 50%, rgba(75, 0, 130, 0.15), transparent 50%),
            linear-gradient(to right, rgba(10, 0, 16, 0.6), rgba(45, 10, 34, 0.5), rgba(10, 0, 16, 0.6))
          `
        }}
      />

      {/* Nav Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link 
          href="/dreams" 
          className="text-2xl font-serif italic text-pink-200 drop-shadow-[0_0_10px_rgba(255,182,193,0.6)] hover:text-pink-100 hover:drop-shadow-[0_0_15px_rgba(255,105,180,0.8)] transition-all flex items-center gap-2"
        >
          <span>✨</span> Dream Journal
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/dreams"
            className="text-pink-100/70 hover:text-pink-100 hover:drop-shadow-[0_0_8px_rgba(255,105,180,0.8)] transition-all font-medium tracking-wide"
          >
            My Dreams
          </Link>
          <Link
            href="/dreams/new"
            className="text-pink-100/70 hover:text-pink-100 hover:drop-shadow-[0_0_8px_rgba(255,105,180,0.8)] transition-all font-medium tracking-wide"
          >
            Write Dream
          </Link>
          <Link
            href="/profile"
            className="text-pink-100/70 hover:text-pink-100 hover:drop-shadow-[0_0_8px_rgba(255,105,180,0.8)] transition-all font-medium tracking-wide"
          >
            Profile
          </Link>

          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-pink-400/20">
            <span className="text-pink-200/90 font-medium italic">
              {(session.user).username}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-5 py-2 bg-rose-500/10 hover:bg-rose-500/30 border border-rose-400/20 text-rose-100 backdrop-blur-md rounded-xl transition-all shadow-[0_0_15px_rgba(225,29,72,0.15)]"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

// --- PREVIEW ENVIRONMENT WRAPPER ---
export default function AppPreview() {
  return (
    <div className="min-h-screen bg-[#0a0010] relative font-sans">
      {/* Fake glowing background elements to demonstrate the glass transparency */}
      <div className="absolute top-32 left-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 pointer-events-none" />
      <div className="absolute top-20 right-32 w-80 h-80 bg-purple-700 rounded-full mix-blend-screen filter blur-[100px] opacity-40 pointer-events-none" />
      
      {/* The Nav Bar */}
      <AppNav />
      
      {/* Dummy content to allow scrolling and testing the "sticky" blur effect */}
      <div className="max-w-4xl mx-auto mt-20 p-8 text-center text-pink-200/50">
        <h1 className="text-3xl font-serif italic mb-4 text-pink-200">Scroll down to test the sticky glassmorphism!</h1>
        <p className="mb-12">Notice how the background elements and the dark void blur beautifully beneath the navigation bar.</p>
        <div className="h-[1200px] w-full rounded-2xl border border-pink-500/10 bg-white/5 flex items-center justify-center">
           <span className="opacity-50">Empty Space for Scrolling</span>
        </div>
      </div>
    </div>
  );
}