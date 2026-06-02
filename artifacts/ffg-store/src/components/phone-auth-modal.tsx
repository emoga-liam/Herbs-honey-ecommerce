import { useState, useRef, useEffect } from "react";
import { auth, signInWithPhoneNumber, RecaptchaVerifier, type ConfirmationResult } from "@/lib/firebase";
import { X } from "lucide-react";

type Step = "phone" | "otp";

export function PhoneAuthModal({
  onSuccess,
  onClose,
}: {
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("phone");
  const [countryCode, setCountryCode] = useState("+234");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      verifierRef.current?.clear();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startResendTimer = () => {
    setResendCountdown(60);
    timerRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const buildFullNumber = () => {
    const digits = phone.replace(/\D/g, "");
    const withoutLeadingZero = digits.startsWith("0") ? digits.slice(1) : digits;
    return `${countryCode}${withoutLeadingZero}`;
  };

  const handleSendOtp = async () => {
    if (!auth) return;
    setLoading(true);
    setError("");
    try {
      if (!verifierRef.current) {
        verifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current!, {
          size: "invisible",
          callback: () => {},
        });
      }
      const fullNumber = buildFullNumber();
      const result = await signInWithPhoneNumber(auth, fullNumber, verifierRef.current);
      confirmationRef.current = result;
      setStep("otp");
      startResendTimer();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      console.error("[PhoneAuth] sendOTP error code:", code, err);
      if (code === "auth/invalid-phone-number") {
        setError("Invalid phone number. Please check and try again.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else if (code === "auth/unauthorized-domain") {
        setError("This domain is not authorised in Firebase. Add it under Authentication → Settings → Authorized domains.");
      } else if (code === "auth/operation-not-allowed") {
        setError("Phone sign-in is not enabled. The site owner must enable it in Firebase Console → Authentication → Sign-in providers → Phone.");
      } else {
        setError(`Failed to send OTP (${code ?? "unknown"}). Please try again.`);
      }
      verifierRef.current?.clear();
      verifierRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationRef.current) return;
    setLoading(true);
    setError("");
    try {
      await confirmationRef.current.confirm(otp);
      onSuccess();
    } catch {
      setError("Incorrect code. Please check and try again.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setStep("phone");
    setOtp("");
    setError("");
    confirmationRef.current = null;
    verifierRef.current?.clear();
    verifierRef.current = null;
  };

  const inputClass = "w-full bg-[#060d07] border border-amber-900/40 text-amber-100 placeholder:text-amber-200/20 focus:border-amber-600 rounded-xl px-4 py-3 text-sm outline-none transition-colors";
  const btnPrimary = "w-full bg-amber-500 hover:bg-amber-400 text-[#060d07] font-bold rounded-xl py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Invisible reCAPTCHA anchor — must NOT be display:none */}
      <div ref={recaptchaContainerRef} style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} />

      <div
        className="bg-[#0f1e12] border border-amber-900/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-amber-200/30 hover:text-amber-200/70 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {step === "phone" ? (
          <>
            <div className="text-center mb-7">
              <div className="text-4xl mb-3">📱</div>
              <h2 className="font-cormorant font-bold text-2xl text-amber-200">Phone Verification</h2>
              <p className="text-amber-200/40 text-sm mt-1.5">Enter your phone number to receive an OTP</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-amber-200/60 text-sm">Country Code</label>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full bg-[#060d07] border border-amber-900/40 text-amber-100 focus:border-amber-600 rounded-xl px-4 py-3 text-sm outline-none"
                >
                  <option value="+234">🇳🇬 Nigeria (+234)</option>
                  <option value="+1">🇺🇸 USA / Canada (+1)</option>
                  <option value="+44">🇬🇧 UK (+44)</option>
                  <option value="+233">🇬🇭 Ghana (+233)</option>
                  <option value="+27">🇿🇦 South Africa (+27)</option>
                  <option value="+254">🇰🇪 Kenya (+254)</option>
                  <option value="+255">🇹🇿 Tanzania (+255)</option>
                  <option value="+256">🇺🇬 Uganda (+256)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-amber-200/60 text-sm">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08012345678"
                  className={inputClass}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter" && phone.length >= 7) handleSendOtp(); }}
                />
                <p className="text-amber-200/30 text-xs">
                  Will be sent as: {buildFullNumber() || `${countryCode}…`}
                </p>
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button onClick={handleSendOtp} disabled={loading || phone.replace(/\D/g, "").length < 7} className={btnPrimary}>
                {loading ? "Sending OTP…" : "Send OTP via SMS"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-7">
              <div className="text-4xl mb-3">🔐</div>
              <h2 className="font-cormorant font-bold text-2xl text-amber-200">Enter OTP</h2>
              <p className="text-amber-200/40 text-sm mt-1.5">
                6-digit code sent to <span className="text-amber-300 font-medium">{buildFullNumber()}</span>
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                maxLength={6}
                className={`${inputClass} text-center tracking-[0.5em] text-xl font-bold`}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter" && otp.length === 6) handleVerifyOtp(); }}
              />

              {error && (
                <p className="text-red-400 text-xs bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2 text-center">
                  {error}
                </p>
              )}

              <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6} className={btnPrimary}>
                {loading ? "Verifying…" : "Verify & Sign In"}
              </button>

              <div className="flex items-center justify-between text-xs text-amber-200/30 pt-1">
                <button
                  onClick={handleResend}
                  disabled={resendCountdown > 0}
                  className="hover:text-amber-200/60 disabled:cursor-not-allowed transition-colors"
                >
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "← Change number"}
                </button>
                <span>Check spam / SMS inbox</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
