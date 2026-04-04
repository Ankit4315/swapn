import { AuthNightBackground } from '@/components/AuthNightBackground';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthNightBackground />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        {children}
      </div>
    </>
  );
}
