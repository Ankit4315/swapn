'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  bio: string;
  profileImageUrl?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: '', bio: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) throw new Error('Failed to load profile');
      const data = await response.json();
      setProfile(data);
      setEditData({ username: data.username, bio: data.bio });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message);
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

  if (!profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-white mb-8">My Profile</h1>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500 bg-opacity-20 border border-red-400 text-red-200 px-4 py-3 rounded-lg mb-6"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-500 bg-opacity-20 border border-green-400 text-green-200 px-4 py-3 rounded-lg mb-6"
        >
          {success}
        </motion.div>
      )}

      <div className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-xl p-8">
        {!isEditing ? (
          <>
            <div className="space-y-6">
              <div>
                <h3 className="text-pink-200 font-semibold text-sm mb-2">EMAIL</h3>
                <p className="text-white text-lg">{profile.email}</p>
              </div>

              <div>
                <h3 className="text-pink-200 font-semibold text-sm mb-2">USERNAME</h3>
                <p className="text-white text-lg">{profile.username}</p>
              </div>

              <div>
                <h3 className="text-pink-200 font-semibold text-sm mb-2">BIO</h3>
                <p className="text-pink-100 text-lg">
                  {profile.bio || 'No bio set yet'}
                </p>
              </div>

              <div>
                <h3 className="text-pink-200 font-semibold text-sm mb-2">MEMBER SINCE</h3>
                <p className="text-pink-100 text-lg">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="w-full mt-8 py-3 px-6 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-lg transition"
            >
              Edit Profile
            </motion.button>
          </>
        ) : (
          <>
            <div className="space-y-6">
              <div>
                <h3 className="text-pink-200 font-semibold text-sm mb-2">EMAIL</h3>
                <p className="text-white text-lg">{profile.email}</p>
                <p className="text-pink-300 text-sm mt-1">(Email cannot be changed)</p>
              </div>

              <div>
                <h3 className="text-pink-200 font-semibold text-sm mb-2">USERNAME</h3>
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  className="w-full px-4 py-2 bg-white bg-opacity-10 border border-pink-300 border-opacity-40 rounded-lg text-pink-600 focus:outline-none focus:bg-opacity-20 focus:border-pink-400"
                />
              </div>

              <div>
                <h3 className="text-pink-200 font-semibold text-sm mb-2">BIO</h3>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={5}
                  className="w-full px-4 py-2 bg-white bg-opacity-10 border border-pink-300 border-opacity-40 rounded-lg text-pink-600 placeholder-pink-200 focus:outline-none focus:bg-opacity-20 focus:border-pink-400 resize-none"
                />
                <p className="text-pink-300 text-sm mt-1">
                  {editData.bio.length}/500 characters
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpdate}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg transition"
              >
                Save Changes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsEditing(false);
                  setEditData({ username: profile.username, bio: profile.bio });
                }}
                className="flex-1 py-3 px-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
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
