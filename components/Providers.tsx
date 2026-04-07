"use client";

import { SessionProvider } from "next-auth/react";
import { AnimatedBackground, WishtreeInterface } from './AnimatedBackground';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AnimatedBackground />
      <WishtreeInterface />
      <div className="relative z-10">{children}</div>
    </SessionProvider>
  );
}
