import { useGetAdminMe, getGetAdminMeQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import grich20Logo from "@assets/669d7800-ae3f-4716-a7df-e3960f397008_1780226804105.jpeg";

function AuthLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <img src={grich20Logo} alt="GRICH20" className="h-14 w-14 rounded-xl animate-pulse" />
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function meErrorMessage(error: unknown): string {
  const status = (error as { status?: number; response?: { status?: number } })?.status
    ?? (error as { response?: { status?: number } })?.response?.status;
  if (status === 403) {
    return "This account is not registered as an admin.";
  }
  if (status === 401) {
    return "Your session is invalid. Please sign in again.";
  }
  const msg =
    (error as { message?: string })?.message
    || (error as { data?: { error?: string } })?.data?.error;
  if (msg && typeof msg === "string" && !msg.toLowerCase().includes("fetch")) {
    return msg;
  }
  return "Could not verify admin access. Please try again.";
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user: contextUser, isLoading: isAuthLoading } = useAuth();
  // Bridge the brief gap after Sign In before AuthContext's onAuthStateChanged updates React state
  const firebaseUser = contextUser ?? auth?.currentUser ?? null;
  const errorToastShown = useRef(false);

  const { data: me, isLoading: isMeLoading, isError, error } = useGetAdminMe({
    query: {
      enabled: !isAuthLoading && !!firebaseUser,
      retry: 1,
      queryKey: getGetAdminMeQueryKey(),
    },
  });

  useEffect(() => {
    if (isAuthLoading) return;

    if (!firebaseUser) {
      navigate("/admin/login");
      return;
    }

    if (!isMeLoading && isError) {
      if (!errorToastShown.current) {
        errorToastShown.current = true;
        toast({
          title: "Admin access denied",
          description: meErrorMessage(error),
          variant: "destructive",
        });
      }
      navigate("/admin/login");
    }
  }, [isAuthLoading, firebaseUser, isMeLoading, isError, error, navigate, toast]);

  if (isAuthLoading || (firebaseUser && isMeLoading)) {
    return <AuthLoading />;
  }

  if (!firebaseUser || !me) {
    return null;
  }

  return <>{children}</>;
}
