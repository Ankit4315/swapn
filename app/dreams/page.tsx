'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Dream {
  _id: string;
  title: string;
  content: string;
  mood: string;
  createdAt: string;
}

export default function DreamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchDreams();
    }
  }, [status, search, moodFilter, router]);

  const fetchDreams = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (moodFilter !== 'all') params.append('mood', moodFilter);

      const response = await fetch(`/api/dreams?${params.toString()}`);
      const data = await response.json();
      setDreams(data.dreams);
    } catch (error) {
      console.error('Failed to fetch dreams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-pink-300 border-t-white rounded-full"
        />
      </div>
    );
  }

  const moods = ['peaceful', 'happy', 'scary', 'confusing', 'vivid', 'lucid', 'nightmare', 'unknown'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-6">My Dreams</h1>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Search your dreams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white bg-opacity-10 border border-pink-300 border-opacity-40 rounded-lg text-white placeholder-pink-200 focus:outline-none focus:bg-opacity-20 focus:border-pink-400 transition"
          />

          <div className="flex flex-wrap gap-2">
            <select
              value={moodFilter}
              onChange={(e) => setMoodFilter(e.target.value)}
              className="px-4 py-2 bg-white bg-opacity-10 border border-pink-300 border-opacity-40 rounded-lg text-white focus:outline-none focus:bg-opacity-20 transition"
            >
              <option value="all" className="bg-pink-900">All Moods</option>
              {moods.map((mood) => (
                <option key={mood} value={mood} className="bg-pink-900">
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {dreams.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <p className="text-xl text-pink-100 mb-6">No dreams recorded yet</p>
          <Link
            href="/dreams/new"
            className="inline-block px-6 py-3 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-semibold rounded-lg transition"
          >
            Write Your First Dream
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dreams.map((dream, index) => (
            <motion.div
              key={dream._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-xl p-6 hover:bg-opacity-20 transition cursor-pointer group"
            >
              <Link href={`/dreams/${dream._id}`}>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-200 transition">
                  {dream.title}
                </h3>
                <p className="text-pink-100 mb-4 line-clamp-2">{dream.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm px-3 py-1 bg-pink-500 bg-opacity-30 text-pink-200 rounded-full">
                    {dream.mood}
                  </span>
                  <span className="text-sm text-pink-200">
                    {new Date(dream.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
