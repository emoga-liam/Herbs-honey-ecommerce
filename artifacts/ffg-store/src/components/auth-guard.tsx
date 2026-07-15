import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import grich20Logo from "@assets/669d7800-ae3f-4716-a7df-e3960f397008_1780226804105.jpeg";

function AuthLoading() {
  return (
    <div className="min-h-screen bg-[#060d07] flex flex-col items-center justify-center gap-4">
      <img src={grich20Logo} alt="FFG Foods" className="h-14 w-14 rounded-xl animate-pulse" />
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function StoreAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isConfigured } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (isConfigured && !isLoading && !user) {
      navigate(`/login?redirect=${encodeURIComponent(location)}`);
    }
  }, [user, isLoading, isConfigured, location, navigate]);

  if (!isConfigured) return <>{children}</>;
  if (isLoading) return <AuthLoading />;
  if (!user) return null;
  return <>{children}</>;
}
