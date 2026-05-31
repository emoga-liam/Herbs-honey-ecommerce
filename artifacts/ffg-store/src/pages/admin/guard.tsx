import { useGetAdminMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const { data: me, isLoading, isError } = useGetAdminMe();

  useEffect(() => {
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
