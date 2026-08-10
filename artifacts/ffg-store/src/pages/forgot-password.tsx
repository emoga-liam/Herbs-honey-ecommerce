import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export default function ForgotPasswordPage() {
  const { resetPassword, isConfigured } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center">
          <BrandLogo frameClassName="h-16 w-16 mx-auto mb-4 rounded-xl" scaleClassName="scale-[1.5]" width={64} height={64} />
          <p className="text-muted-foreground text-sm">Authentication is not configured.</p>
          <Button asChild variant="outline" className="mt-4 border-border text-foreground">
            <Link href="/">Back to Store</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const description =
        code === "auth/user-not-found"
          ? "No account found with that email."
          : code === "auth/invalid-email"
          ? "Please enter a valid email address."
          : "Something went wrong. Please try again.";
      toast({ title: "Couldn't send reset email", description, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)_/_0.08),transparent_70%)]" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex flex-col items-center gap-3 cursor-pointer">
              <div className="relative">
                <div className="absolute -inset-3 rounded-2xl bg-primary/15 blur-xl" />
                <BrandLogo frameClassName="relative h-20 w-20 rounded-2xl shadow-2xl" scaleClassName="scale-[1.5]" width={80} height={80} />
              </div>
              <div>
                <h1 className="font-cormorant font-bold text-3xl text-primary">Reset Password</h1>
                <p className="text-muted-foreground text-sm mt-0.5">We'll send you a link to reset it</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700/40 p-4">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h2 className="font-cormorant font-bold text-2xl text-foreground">Check your inbox</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We've sent a password reset link to <span className="text-foreground font-medium">{email}</span>.
                Check your email and follow the instructions to reset your password.
              </p>
              <p className="text-muted-foreground text-xs">Didn't receive it? Check your spam folder.</p>
              <Button
                variant="outline"
                className="w-full border-border text-foreground mt-2"
                onClick={() => setSent(false)}
              >
                Try a different email
              </Button>
              <Link href="/login">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl mt-2">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center mb-6">
                <div className="rounded-full bg-primary/10 border border-border p-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm text-center mb-6 leading-relaxed">
                Enter your registered email address and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-sm">Email Address</Label>
                  <Input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" required autoFocus
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl" disabled={submitting}>
                  {submitting ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
              <div className="text-center mt-6">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
