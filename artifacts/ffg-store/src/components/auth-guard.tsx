import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { BrandLogo } from "@/components/brand-logo";

function AuthLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <BrandLogo
        frameClassName="h-14 w-14 rounded-xl animate-pulse"
        scaleClassName="scale-[1.55]"
        width={56}
        height={56}
      />
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
