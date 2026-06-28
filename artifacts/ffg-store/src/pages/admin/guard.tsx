import { useGetAdminMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import grich20Logo from "@assets/669d7800-ae3f-4716-a7df-e3960f397008_1780226804105.jpeg";

function AuthLoading() {
  return (
    <div className="min-h-screen bg-[#060d07] flex flex-col items-center justify-center gap-4">
      <img src={grich20Logo} alt="Grich20" className="h-14 w-14 rounded-xl animate-pulse" />
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const { user: firebaseUser, isLoading: isAuthLoading } = useAuth();

  const { data: me, isLoading: isMeLoading, isError } = useGetAdminMe({
    query: {
      enabled: !isAuthLoading && !!firebaseUser,
      retry: 1,
    },
  });

  useEffect(() => {
    if (!isAuthLoading) {
      if (!firebaseUser) {
        navigate("/admin/login");
      } else if (!isMeLoading && isError) {
        navigate("/admin/login");
      }
    }
  }, [isAuthLoading, firebaseUser, isMeLoading, isError, navigate]);

  if (isAuthLoading || (firebaseUser && isMeLoading)) {
    return <AuthLoading />;
  }

  if (!firebaseUser || !me) {
    return null;
  }

  return <>{children}</>;
}

