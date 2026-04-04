'use client';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { AppNav } from '@/components/AppNav';
import { SessionProvider } from 'next-auth/react';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen">
        <AppNav />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
