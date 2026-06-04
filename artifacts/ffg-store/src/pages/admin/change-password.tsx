import { useState } from "react";
import { useChangeAdminPassword } from "@workspace/api-client-react";
import { AdminLayout } from "./dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function AdminChangePasswordPage() {
  const { toast } = useToast();
  const changePassword = useChangeAdminPassword();

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });
  const [success, setSuccess] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleShow = (key: keyof typeof show) =>
    setShow((s) => ({ ...s, [key]: !s[key] }));

  const validate = (): string | null => {
    if (!form.currentPassword) return "Please enter your current password.";
    if (form.newPassword.length < 8) return "New password must be at least 8 characters.";
    if (form.newPassword === form.currentPassword) return "New password must be different from your current password.";
    if (form.newPassword !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast({ title: err, variant: "destructive" }); return; }

    changePassword.mutate(
      { data: { currentPassword: form.currentPassword, newPassword: form.newPassword } },
      {
        onSuccess: () => {
          setSuccess(true);
          setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
          toast({ title: "✅ Password changed successfully!" });
        },
        onError: (err: unknown) => {
          const msg =
            err && typeof err === "object" && "response" in err
              ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? "Failed to change password")
              : "Failed to change password";
          toast({ title: msg, variant: "destructive" });
        },
      }
    );
  };

  return (
    <AdminLayout title="Change Password">
      <div className="max-w-md">
        {success && (
          <div className="mb-6 rounded-xl bg-green-900/20 border border-green-700/40 p-5 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-300 font-semibold text-sm">Password updated</p>
              <p className="text-green-400/70 text-xs mt-0.5">Your new password is now active. Use it the next time you log in.</p>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-amber-900/30 border border-amber-800/40 flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-cormorant font-bold text-lg text-amber-300">Update Password</h3>
              <p className="text-xs text-muted-foreground">Minimum 8 characters required</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-amber-200/70">Current Password</Label>
              <div className="relative">
                <Input
                  type={show.current ? "text" : "password"}
                  value={form.currentPassword}
                  onChange={set("currentPassword")}
                  placeholder="Enter your current password"
                  className="pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => toggleShow("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {show.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-amber-200/70">New Password</Label>
              <div className="relative">
                <Input
                  type={show.newPw ? "text" : "password"}
                  value={form.newPassword}
                  onChange={set("newPassword")}
                  placeholder="At least 8 characters"
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => toggleShow("newPw")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {show.newPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.newPassword.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        form.newPassword.length >= [8, 12, 16, 20][i]
                          ? i < 2 ? "bg-amber-500" : "bg-green-500"
                          : "bg-border"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-amber-200/70">Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={show.confirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="Re-enter new password"
                  className={`pr-10 ${
                    form.confirmPassword && form.confirmPassword !== form.newPassword
                      ? "border-red-700/60 focus-visible:ring-red-700"
                      : form.confirmPassword && form.confirmPassword === form.newPassword
                      ? "border-green-700/60"
                      : ""
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => toggleShow("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {show.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.confirmPassword && form.confirmPassword !== form.newPassword && (
                <p className="text-xs text-red-400">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-[#060d07] font-bold gap-2"
              disabled={changePassword.isPending}
            >
              <KeyRound className="h-4 w-4" />
              {changePassword.isPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          After changing your password, you will stay logged in. Your new password will be required on the next login.
        </p>
      </div>
    </AdminLayout>
  );
}
