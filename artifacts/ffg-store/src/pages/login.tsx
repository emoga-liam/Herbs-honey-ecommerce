import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import grich20Logo from "@assets/669d7800-ae3f-4716-a7df-e3960f397008_1780226804105.jpeg";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const redirect = new URLSearchParams(search).get("redirect") ?? "/products";
  const { signInWithEmail, signInWithGoogle, isConfigured, isLoading, user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in
  if (user) { navigate(redirect); return null; }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#060d07] flex items-center justify-center p-4">
        <div className="bg-[#0f1e12] border border-amber-900/30 rounded-2xl p-8 max-w-md w-full text-center">
          <img src={grich20Logo} alt="Grich20" className="h-16 mx-auto mb-4 rounded-xl" />
          <h2 className="font-cormorant text-2xl text-amber-400 mb-2">Authentication Not Set Up</h2>
          <p className="text-amber-200/60 text-sm mb-4">Firebase authentication hasn't been configured yet.</p>
          <Button asChild variant="outline" className="border-amber-700 text-amber-400">
            <Link href="/">Back to Store</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      navigate(redirect);
    } catch {
      toast({ title: "Sign in failed", description: "Check your email and password.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      navigate(redirect);
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? "Please try again.";
      toast({ title: "Google sign in failed", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#060d07] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,53,15,0.12),transparent_70%)]" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex flex-col items-center gap-3 cursor-pointer">
              <div className="relative">
                <div className="absolute -inset-3 rounded-2xl bg-amber-600/20 blur-xl" />
                <img src={grich20Logo} alt="Grich20" className="relative h-20 w-20 rounded-2xl object-cover ring-1 ring-amber-600/40 shadow-2xl hover:ring-amber-500/60 transition-all" />
              </div>
              <div>
                <h1 className="font-cormorant font-bold text-3xl text-amber-400">Welcome Back</h1>
                <p className="text-amber-200/40 text-sm mt-0.5">Sign in to shop at Grich20</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-[#0f1e12] border border-amber-900/30 rounded-2xl p-8 shadow-2xl">
          <Button onClick={handleGoogle} variant="outline"
            className="w-full border-amber-700/50 text-amber-200 bg-transparent hover:bg-amber-900/20 mb-6 gap-3 rounded-xl">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-amber-900/30" /></div>
            <div className="relative flex justify-center text-xs text-amber-200/30"><span className="bg-[#0f1e12] px-3">or continue with email</span></div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-amber-200/60 text-sm">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
                className="bg-[#060d07] border-amber-900/40 text-amber-100 placeholder:text-amber-200/20 focus:border-amber-600 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-amber-200/60 text-sm">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                className="bg-[#060d07] border-amber-900/40 text-amber-100 placeholder:text-amber-200/20 focus:border-amber-600 rounded-xl" />
            </div>
            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-[#060d07] font-bold rounded-xl" disabled={submitting || isLoading}>
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center mt-6 space-y-2">
            <Link href="/forgot-password" className="block text-sm text-amber-200/40 hover:text-amber-300 transition-colors">
              Forgot your password?
            </Link>
            <p className="text-sm text-amber-200/40">
              Don't have an account?{" "}
              <Link href={`/register${search}`} className="text-amber-400 hover:text-amber-300 font-semibold">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
