import { useGetAdminMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const { data: me, isLoading, isError } = useGetAdminMe({
    query: {
      // Retry once — a 401 means not an admin; no point retrying many times
      retry: 1,
    },
  });

  useEffect(() => {
    // If no Firebase user at all, redirect immediately without waiting for the API
    if (!auth?.currentUser) {
      navigate("/admin/login");
      return;
    }
    if (!isLoading && isError) {
      navigate("/admin/login");
    }
  }, [isLoading, isError, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!me) return null;
  return <>{children}</>;
}
