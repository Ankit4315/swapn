'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const moods = ['peaceful', 'happy', 'scary', 'confusing', 'vivid', 'lucid', 'nightmare', 'unknown'];

export default function NewDreamPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('unknown');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await fetch('/api/dreams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          mood,
          tags: tagsArray,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to save dream');
        return;
      }

      router.push('/dreams');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-white mb-8">Write a New Dream</h1>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500 bg-opacity-20 border border-red-400 text-red-200 px-4 py-3 rounded-lg mb-6"
        >
          {error}
        </motion.div>
      )}

      <div className="bg-white/5 backdrop-blur-2xl border border-white/20 rounded-xl p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-lg font-semibold text-pink-100 mb-3">
              Dream Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your dream a title..."
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-pink-300/30 rounded-lg text-white placeholder-pink-200 focus:outline-none focus:bg-white/10 focus:border-pink-400 transition text-lg shadow-lg"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-lg font-semibold text-pink-100 mb-3">
              Dream Description
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write about your dream in detail..."
              rows={10}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-pink-300/30 rounded-lg text-white placeholder-pink-200 focus:outline-none focus:bg-white/10 focus:border-pink-400 transition text-lg resize-none shadow-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="mood" className="block text-lg font-semibold text-pink-100 mb-3">
                Mood
              </label>
              <select
                id="mood"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-pink-300/30 rounded-lg text-white focus:outline-none focus:bg-white/10 focus:border-pink-400 transition shadow-lg"
              >
                {moods.map((m) => (
                  <option key={m} value={m} className="bg-pink-900">
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-lg font-semibold text-pink-100 mb-3">
                Tags (comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., flying, family, adventure"
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-pink-300/30 rounded-lg text-white placeholder-pink-200 focus:outline-none focus:bg-white/10 focus:border-pink-400 transition shadow-lg"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Dream'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 px-6 bg-white/5 backdrop-blur-xl hover:bg-white/10 border border-white/20 text-white font-semibold rounded-lg transition shadow-lg"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
