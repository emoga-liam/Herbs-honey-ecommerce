import { useState } from "react";
import { useLocation } from "wouter";
import { auth, signInWithEmailAndPassword } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import grich20Logo from "@assets/669d7800-ae3f-4716-a7df-e3960f397008_1780226804105.jpeg";

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
    <div className="min-h-screen bg-[#060d07] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,53,15,0.15),transparent_70%)]" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-3 rounded-2xl bg-amber-600/20 blur-xl" />
              <img src={grich20Logo} alt="Grich20" className="relative h-20 w-20 rounded-2xl object-cover ring-1 ring-amber-600/40 shadow-2xl" />
            </div>
            <div>
              <h1 className="font-cormorant font-bold text-3xl text-amber-400 leading-tight">Grich20</h1>
              <p className="text-amber-200/40 text-xs uppercase tracking-widest mt-0.5">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[#0f1e12] border border-amber-900/30 p-8 shadow-2xl">
          <h2 className="font-cormorant font-bold text-2xl text-amber-100 mb-6">Sign In to Dashboard</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-amber-200/70 text-sm">Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@grich20.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#060d07] border-amber-900/40 text-amber-100 placeholder:text-amber-200/20 focus:border-amber-600"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-amber-200/70 text-sm">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#060d07] border-amber-900/40 text-amber-100 placeholder:text-amber-200/20 focus:border-amber-600"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              id="admin-login-btn"
              className="w-full bg-amber-500 hover:bg-amber-400 text-[#060d07] font-bold mt-2 rounded-xl"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-amber-200/25 mt-6">
          Grich20 International General Services Limited
        </p>
      </div>
    </div>
  );
}
