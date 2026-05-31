import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { User, ShoppingBag, LogOut } from "lucide-react";

export default function AccountPage() {
  const { user, isLoading, logout, isConfigured } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [user, isLoading, navigate]);

  if (!isConfigured) {
    return (
      <Layout>
        <div className="container max-w-screen-md mx-auto px-4 py-20 text-center">
          <h2 className="font-serif text-2xl font-bold mb-4">Auth not configured</h2>
          <Button asChild><Link href="/">Back to Store</Link></Button>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="container max-w-screen-md mx-auto px-4 py-12">
        <div className="rounded-2xl bg-card border border-border p-8 mb-6">
          <div className="flex items-center gap-5 mb-6">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName ?? "User"} className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <h1 className="font-serif font-bold text-2xl">{user.displayName ?? "Customer"}</h1>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/products">
              <div className="rounded-xl border border-border p-5 hover:border-primary/40 hover:bg-muted/30 transition-all cursor-pointer">
                <ShoppingBag className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Shop Products</h3>
                <p className="text-sm text-muted-foreground">Browse our full honey collection</p>
              </div>
            </Link>
            <Link href="/cart">
              <div className="rounded-xl border border-border p-5 hover:border-primary/40 hover:bg-muted/30 transition-all cursor-pointer">
                <ShoppingBag className="h-6 w-6 text-amber-500 mb-3" />
                <h3 className="font-semibold mb-1">View Cart</h3>
                <p className="text-sm text-muted-foreground">See items in your cart</p>
              </div>
            </Link>
          </div>
        </div>

        <Button
          onClick={() => { logout(); navigate("/"); }}
          variant="outline"
          className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </Layout>
  );
}
