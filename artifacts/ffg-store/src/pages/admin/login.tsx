import { useState } from "react";
import { useLocation } from "wouter";
import { auth, signInWithEmailAndPassword, onAuthStateChanged } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import grich20Logo from "@assets/669d7800-ae3f-4716-a7df-e3960f397008_1780226804105.jpeg";

/** Wait until Firebase Auth has a current user (and AuthContext can catch up). */
function waitForSignedInUser(): Promise<void> {
  const firebaseAuth = auth;
  if (!firebaseAuth) return Promise.reject(new Error("Firebase not configured"));
  if (firebaseAuth.currentUser) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      unsub();
      reject(new Error("Timed out waiting for auth state"));
    }, 8000);
    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        window.clearTimeout(timeout);
        unsub();
        resolve();
      }
    });
  });
}

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({ title: "Firebase not configured", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await waitForSignedInUser();
      navigate("/admin");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      let description = "Check your email and password.";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        description = "Invalid email or password.";
      } else if (code === "auth/too-many-requests") {
        description = "Too many failed attempts. Please try again later.";
      }
      toast({ title: "Sign in failed", description, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)_/_0.08),transparent_70%)]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-3 rounded-2xl bg-primary/15 blur-xl" />
              <img src={grich20Logo} alt="GRICH20" className="relative h-20 w-20 rounded-2xl object-cover ring-1 ring-border shadow-2xl" />
            </div>
            <div>
              <h1 className="font-cormorant font-bold text-3xl text-primary leading-tight">GRICH20</h1>
              <p className="text-muted-foreground text-xs uppercase tracking-widest mt-0.5">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-8 shadow-2xl">
          <h2 className="font-cormorant font-bold text-2xl text-foreground mb-6">Sign In to Dashboard</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="info@grich20.online"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              id="admin-login-btn"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold mt-2 rounded-xl"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          GRICH20
        </p>
      </div>
    </div>
  );
}
