'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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
      className="relative z-10 bg-white bg-opacity-10 backdrop-blur-md border-b border-white border-opacity-20 sticky top-0"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/dreams" className="text-2xl font-bold text-white hover:text-pink-200 transition">
          ✨ Dream Journal
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/dreams"
            className="text-pink-100 hover:text-white transition font-medium"
          >
            My Dreams
          </Link>
          <Link
            href="/dreams/new"
            className="text-pink-100 hover:text-white transition font-medium"
          >
            Write Dream
          </Link>
          <Link
            href="/profile"
            className="text-pink-100 hover:text-white transition font-medium"
          >
            Profile
          </Link>

          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white border-opacity-20">
            <span className="text-pink-100">{(session.user as any).username}</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
