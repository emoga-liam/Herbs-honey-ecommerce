import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import grich20Logo from "@assets/669d7800-ae3f-4716-a7df-e3960f397008_1780226804105.jpeg";

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const login = useAdminLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { data: { email, password } },
      {
        onSuccess: () => navigate("/admin"),
        onError: () => toast({ title: "Invalid credentials", description: "Check your email and password.", variant: "destructive" }),
      }
    );
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
                id="email"
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
                id="password"
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
              className="w-full bg-amber-500 hover:bg-amber-400 text-[#060d07] font-bold mt-2 rounded-xl"
              disabled={login.isPending}
            >
              {login.isPending ? "Signing in..." : "Sign In"}
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
