'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/dreams',
      });

      if (result?.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center sm:justify-end sm:pr-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-transparent backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white border-opacity-10">
          <h1 className="text-4xl font-bold text-center text-white mb-2">Welcome</h1>
          <p className="text-center text-pink-100 mb-8">Share your dreams with the world</p>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500 bg-opacity-20 border border-red-400 text-red-200 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-pink-100 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 bg-transparent border border-pink-300 border-opacity-30 rounded-lg text-white placeholder-pink-200 focus:outline-none focus:border-pink-400 transition"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-pink-100 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full pr-12 px-4 py-2 bg-transparent border border-pink-300 border-opacity-30 rounded-lg text-white placeholder-pink-200 focus:outline-none focus:border-pink-400 transition"
                  required
                />

                <motion.button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-pressed={showPassword}
                  whileTap={{ scale: 0.92 }}
                  initial={false}
                  animate={showPassword ? { rotate: 14 } : { rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                  className="absolute inset-y-0 right-2 flex items-center p-1 rounded-md text-pink-400 hover:text-pink-300 focus:outline-none focus:ring-0 ring-0 bg-transparent border-0 outline-none"
                >
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18"
                      animate={{ opacity: showPassword ? 1 : 0, scale: showPassword ? 1 : 0.9 }}
                      transition={{ duration: 0.18 }}
                    />
                  </motion.svg>
                </motion.button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-pink-100 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-pink-300 hover:text-pink-200 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
