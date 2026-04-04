'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';

interface Dream {
  _id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function DreamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [dream, setDream] = useState<Dream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Dream>>({});
  const [error, setError] = useState('');

  const moods = ['peaceful', 'happy', 'scary', 'confusing', 'vivid', 'lucid', 'nightmare', 'unknown'];

  useEffect(() => {
    if (id) {
      fetchDream();
    }
  }, [id]);

  const fetchDream = async () => {
    try {
      const response = await fetch(`/api/dreams/${id}`);
      if (!response.ok) throw new Error('Dream not found');
      const data = await response.json();
      setDream(data);
      setEditData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!dream) return;

    try {
      const response = await fetch(`/api/dreams/${dream._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editData.title,
          content: editData.content,
          mood: editData.mood,
          tags: editData.tags,
        }),
      });

      if (!response.ok) throw new Error('Failed to update dream');

      const updatedDream = await response.json();
      setDream(updatedDream);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!dream) return;

    if (!confirm('Are you sure you want to delete this dream?')) return;

    try {
      const response = await fetch(`/api/dreams/${dream._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete dream');

      router.push('/dreams');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
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

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-red-300 mb-6">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition"
        >
          Go Back
        </button>
      </motion.div>
    );
  }

  if (!dream) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button
        onClick={() => router.back()}
        className="mb-6 text-pink-200 hover:text-white transition font-semibold"
      >
        ← Back
      </button>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500 bg-opacity-20 border border-red-400 text-red-200 px-4 py-3 rounded-lg mb-6"
        >
          {error}
        </motion.div>
      )}

      <div className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-xl p-8">
        {!isEditing ? (
          <>
            <h1 className="text-4xl font-bold text-white mb-4">{dream.title}</h1>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm px-3 py-1 bg-pink-500 bg-opacity-30 text-pink-200 rounded-full">
                {dream.mood}
              </span>
              <span className="text-pink-200 text-sm">
                {new Date(dream.createdAt).toLocaleDateString()} at{' '}
                {new Date(dream.createdAt).toLocaleTimeString()}
              </span>
            </div>

            <p className="text-pink-100 text-lg leading-relaxed mb-8 whitespace-pre-wrap">
              {dream.content}
            </p>

            {dream.tags && dream.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-pink-200 font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {dream.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm px-3 py-1 bg-purple-500 bg-opacity-20 text-purple-200 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
              >
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
              >
                Delete
              </motion.button>
            </div>
          </>
        ) : (
          <>
            <input
              type="text"
              value={editData.title || ''}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="w-full text-4xl font-bold text-white bg-white bg-opacity-10 border border-pink-300 border-opacity-40 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:bg-opacity-20"
            />

            <div className="flex gap-4 mb-8">
              <select
                value={editData.mood || 'unknown'}
                onChange={(e) => setEditData({ ...editData, mood: e.target.value })}
                className="px-4 py-2 bg-white bg-opacity-10 border border-pink-300 border-opacity-40 rounded-lg text-white focus:outline-none focus:bg-opacity-20"
              >
                {moods.map((m) => (
                  <option key={m} value={m} className="bg-pink-900">
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              value={editData.content || ''}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
              rows={12}
              className="w-full px-4 py-3 bg-white bg-opacity-10 border border-pink-300 border-opacity-40 rounded-lg text-pink-100 focus:outline-none focus:bg-opacity-20 focus:border-pink-400 transition mb-6 resize-none"
            />

            <input
              type="text"
              value={editData.tags?.join(', ') || ''}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  tags: e.target.value.split(',').map((t) => t.trim()),
                })
              }
              placeholder="Tags (comma-separated)"
              className="w-full px-4 py-2 bg-white bg-opacity-10 border border-pink-300 border-opacity-40 rounded-lg text-white placeholder-pink-200 focus:outline-none focus:bg-opacity-20 mb-6"
            />

            <div className="flex gap-4 pt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpdate}
                className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
              >
                Save Changes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsEditing(false);
                  setEditData(dream);
                }}
                className="flex-1 py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
              >
                Cancel
              </motion.button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
    try {
      const response = await fetch(`/api/dreams/${params.id}`);
      if (!response.ok) throw new Error('Dream not found');
      const data = await response.json();
      setDream(data);
      setEditData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!dream) return;

    try {
      const response = await fetch(`/api/dreams/${dream._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editData.title,
          content: editData.content,
          mood: editData.mood,
          tags: editData.tags,
        }),
      });

      if (!response.ok) throw new Error('Failed to update dream');

      const updatedDream = await response.json();
      setDream(updatedDream);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!dream) return;

    if (!confirm('Are you sure you want to delete this dream?')) return;

    try {
      const response = await fetch(`/api/dreams/${dream._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete dream');

      router.push('/dreams');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
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

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-red-300 mb-6">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition"
        >
          Go Back
        </button>
      </motion.div>
    );
  }

  if (!dream) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button
        onClick={() => router.back()}
        className="mb-6 text-pink-200 hover:text-white transition font-semibold"
      >
        ← Back
      </button>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500 bg-opacity-20 border border-red-400 text-red-200 px-4 py-3 rounded-lg mb-6"
        >
          {error}
        </motion.div>
      )}

      <div className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-xl p-8">
        {!isEditing ? (
          <>
            <h1 className="text-4xl font-bold text-white mb-4">{dream.title}</h1>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm px-3 py-1 bg-pink-500 bg-opacity-30 text-pink-200 rounded-full">
                {dream.mood}
              </span>
              <span className="text-pink-200 text-sm">
                {new Date(dream.createdAt).toLocaleDateString()} at{' '}
                {new Date(dream.createdAt).toLocaleTimeString()}
              </span>
            </div>

            <p className="text-pink-100 text-lg leading-relaxed mb-8 whitespace-pre-wrap">
              {dream.content}
            </p>

            {dream.tags && dream.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-pink-200 font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {dream.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm px-3 py-1 bg-purple-500 bg-opacity-20 text-purple-200 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
              >
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
              >
                Delete
              </motion.button>
            </div>
          </>
        ) : (
          <>
            <input
              type="text"
              value={editData.title || ''}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="w-full text-4xl font-bold text-white bg-white bg-opacity-10 border border-pink-300 border-opacity-40 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:bg-opacity-20"
            />

            <div className="flex gap-4 mb-8">
              <select
                value={editData.mood || 'unknown'}
                onChange={(e) => setEditData({ ...editData, mood: e.target.value })}
                className="px-4 py-2 bg-white bg-opacity-10 border border-pink-300 border-opacity-40 rounded-lg text-white focus:outline-none focus:bg-opacity-20"
              >
                {moods.map((m) => (
                  <option key={m} value={m} className="bg-pink-900">
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              value={editData.content || ''}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
              rows={12}
              className="w-full px-4 py-3 bg-white bg-opacity-10 border border-pink-300 border-opacity-40 rounded-lg text-pink-100 focus:outline-none focus:bg-opacity-20 focus:border-pink-400 transition mb-6 resize-none"
            />

            <input
              type="text"
              value={editData.tags?.join(', ') || ''}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  tags: e.target.value.split(',').map((t) => t.trim()),
                })
              }
              placeholder="Tags (comma-separated)"
              className="w-full px-4 py-2 bg-white bg-opacity-10 border border-pink-300 border-opacity-40 rounded-lg text-white placeholder-pink-200 focus:outline-none focus:bg-opacity-20 mb-6"
            />

            <div className="flex gap-4 pt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpdate}
                className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
              >
                Save Changes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsEditing(false);
                  setEditData(dream);
                }}
                className="flex-1 py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
              >
                Cancel
              </motion.button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
