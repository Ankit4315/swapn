'use client';

import React from 'react';
import { motion } from 'framer-motion';

// --- MOCKS FOR NEXT.JS & NEXT-AUTH ---
// These simulate your Next.js environment so the component can render in this preview
type MockSession = { data: { user?: { username: string } | null } };
const useSession = (): MockSession => ({ data: { user: { username: 'StarGazer' } } });
const useRouter = (): { push: (url: string) => void } => ({ push: (url: string) => console.log('Navigating to:', url) });
const signOut = async (options?: { redirect?: boolean }): Promise<void> => { console.log('Signing out...'); };
const Link: React.FC<{ href: string; className?: string; children?: React.ReactNode }> = ({ href, children, className }) => (
  <a href={href} className={className}>{children}</a>
);


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
      // Changed backdrop-blur-[2px] to an arbitrary backdrop-blur-[1px] to reduce the effect further
      className="relative z-50 sticky top-0 backdrop-blur-[1px] border-b border-pink-400/20 shadow-[0_4px_30px_rgba(255,20,147,0.1)]"
      // Added a slight white/pink tint at 3% opacity to give it a real glass shine
      style={{ backgroundColor: 'rgba(255, 182, 193, 0.03)' }}
    >
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
      {/* Fake glowing background elements to demonstrate the full transparency */}
      <div className="absolute top-32 left-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 pointer-events-none" />
      <div className="absolute top-20 right-32 w-80 h-80 bg-purple-700 rounded-full mix-blend-screen filter blur-[100px] opacity-40 pointer-events-none" />
      
      {/* The Nav Bar */}
      <AppNav />
      
      {/* Dummy content to allow scrolling and testing the "sticky" transparent effect */}
      <div className="max-w-4xl mx-auto mt-20 p-8 text-center text-pink-200/50">
        <h1 className="text-3xl font-serif italic mb-4 text-pink-200">Scroll down to test the further reduced blur glassmorphism!</h1>
        <p className="mb-12">Notice how reducing the blur to "1px" makes the nav bar look almost completely clear, maintaining only a hint of the frosted effect.</p>
        <div className="h-[1200px] w-full rounded-2xl border border-pink-500/10 bg-white/5 flex items-center justify-center">
           <span className="opacity-50">Empty Space for Scrolling</span>
        </div>
      </div>
    </div>
  );
}