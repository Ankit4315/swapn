"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { AnimatedBackground, WishtreeInterface } from './AnimatedBackground';

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith('/auth');

  return (
    <SessionProvider>
      {!isAuthRoute && (
        <>
          <AnimatedBackground />
          <WishtreeInterface />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </SessionProvider>
  );
}
