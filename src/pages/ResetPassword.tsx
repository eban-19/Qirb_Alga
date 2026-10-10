import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Lock,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { validatePassword } from "@/utils/validation";

type Step = "code" | "password" | "success";

const CODE_LENGTH = 6;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlToken = searchParams.get("token") || "";
  const urlEmail = searchParams.get("email") || "";

  const [step, setStep] = useState<Step>(urlToken && urlEmail ? "password" : "code");
  const [email, setEmail] = useState(urlEmail);
  const [verifiedToken, setVerifiedToken] = useState(urlToken);

  // 6-digit code inputs
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const codeInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // New password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Auto-verify via URL token on mount
  useEffect(() => {
    if (urlToken && urlEmail) {
      verifyTokenFromUrl(urlToken, urlEmail);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const verifyTokenFromUrl = async (token: string, email: string) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3006/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const data = await res.json();
      if (data.success) {
        setVerifiedToken(data.token);
        setEmail(email);
        setStep("password");
        toast.success("Link verified! Please enter your new password.");
      } else {
        setStep("code");
        setError("This link has expired or already been used. Please enter your 6-digit code instead.");
      }
    } catch {
      setStep("code");
      setError("Connection error. Please enter your 6-digit code manually.");
    } finally {
      setLoading(false);
    }
  };

  // ── Code digit input handlers ──────────────────────────────────────────────
  const handleDigitChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...codeDigits];
    next[index] = digit;
    setCodeDigits(next);
    if (digit && index < CODE_LENGTH - 1) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const digits = [...codeDigits];
    for (let i = 0; i < pasted.length; i++) digits[i] = pasted[i];
    setCodeDigits(digits);
    const nextEmpty = pasted.length < CODE_LENGTH ? pasted.length : CODE_LENGTH - 1;
    codeInputRefs.current[nextEmpty]?.focus();
  };

  const enteredCode = codeDigits.join("");

  // ── Submit 6-digit code ────────────────────────────────────────────────────
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (enteredCode.length !== CODE_LENGTH) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter the email address linked to your account.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3006/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: enteredCode }),
      });
      const data = await res.json();
      if (data.success) {
        setVerifiedToken(data.token);
        setStep("password");
        toast.success("Code verified! Choose your new password.");
      } else {
        setError(data.message || "Invalid or expired code. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Submit new password ────────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setError(null);

    const passErr = validatePassword(newPassword, true, "Password");
    if (passErr) { setPasswordError(passErr); return; }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3006/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verifiedToken, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("success");
        toast.success("Password reset successfully!");
      } else {
        setError(data.message || "Failed to reset password. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicators
  const passwordChecks = [
    { label: "8+ characters", ok: newPassword.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(newPassword) },
    { label: "Lowercase letter", ok: /[a-z]/.test(newPassword) },
    { label: "Number", ok: /\d/.test(newPassword) },
    { label: "Special character", ok: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword) },
  ];
  const strengthScore = passwordChecks.filter((c) => c.ok).length;
  const strengthColor =
    strengthScore <= 1 ? "bg-red-500" :
    strengthScore <= 3 ? "bg-amber-500" :
    strengthScore === 4 ? "bg-blue-500" : "bg-emerald-500";
  const strengthLabel =
    strengthScore <= 1 ? "Very weak" :
    strengthScore <= 3 ? "Fair" :
    strengthScore === 4 ? "Good" : "Strong";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {step !== "success" && (
          <Link
            to="/forgot-password"
            className="flex items-center gap-2 text-sm text-slate-500 font-semibold hover:text-blue-600 transition-colors mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>
        )}

        <Card className="shadow-2xl shadow-slate-200/70 border border-slate-200/80 bg-white/90 backdrop-blur-sm rounded-2xl">
          {/* ── Code Step ──────────────────────────────────────────────────── */}
          {step === "code" && (
            <>
              <CardHeader className="text-center pb-2 pt-8 px-8">
                <div className="mx-auto w-16 h-16 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheck className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Enter verification code
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium mt-2 leading-relaxed">
                  Enter the 6-digit code we sent to your email, then confirm your email address below.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-8 pt-4">
                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-sm font-semibold text-red-700">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyCode} className="space-y-5" noValidate>
                  {/* 6-digit boxes */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold text-sm">6-Digit Code</Label>
                    <div className="flex gap-2 justify-between">
                      {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                        <input
                          key={i}
                          ref={(el) => { codeInputRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={codeDigits[i]}
                          onChange={(e) => handleDigitChange(i, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown(i, e)}
                          onPaste={i === 0 ? handleDigitPaste : undefined}
                          disabled={loading}
                          className={`w-12 h-14 text-center text-xl font-extrabold rounded-xl border-2 outline-none transition-all
                            ${codeDigits[i] ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-900"}
                            focus:border-blue-500 focus:bg-blue-50 focus:ring-2 focus:ring-blue-500/20`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Email confirmation */}
                  <div className="space-y-1.5">
                    <Label htmlFor="codeEmail" className="text-slate-700 font-bold text-sm">
                      Your Account Email
                    </Label>
                    <Input
                      id="codeEmail"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl text-base border-slate-200 bg-slate-50/30 focus:bg-white transition-colors font-medium"
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || enteredCode.length !== CODE_LENGTH || !email.trim()}
                    className="w-full h-12 text-base font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Verifying...</> : "Verify Code"}
                  </Button>

                  <p className="text-center text-xs text-slate-400 font-medium">
                    Didn't receive a code?{" "}
                    <Link to="/forgot-password" className="text-blue-600 font-bold hover:underline">
                      Request a new one
                    </Link>
                  </p>
                </form>
              </CardContent>
            </>
          )}

          {/* ── New Password Step ───────────────────────────────────────────── */}
          {step === "password" && (
            <>
              <CardHeader className="text-center pb-2 pt-8 px-8">
                <div className="mx-auto w-16 h-16 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Set a new password
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium mt-2">
                  Make it strong — at least 8 characters with uppercase, lowercase, number and special character.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-8 pt-4">
                {(error || passwordError) && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-sm font-semibold text-red-700">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    {error || passwordError}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-slate-700 font-bold text-sm">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (passwordError) setPasswordError(null);
                        }}
                        className="h-12 pl-10 pr-10 rounded-xl text-base border-slate-200 bg-slate-50/30 focus:bg-white transition-colors font-medium"
                        disabled={loading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Strength bar */}
                    {newPassword.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <div
                              key={n}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                n <= strengthScore ? strengthColor : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs font-bold ${
                          strengthScore <= 1 ? "text-red-600" :
                          strengthScore <= 3 ? "text-amber-600" :
                          strengthScore === 4 ? "text-blue-600" : "text-emerald-600"
                        }`}>
                          {strengthLabel}
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                          {passwordChecks.map((c) => (
                            <div key={c.label} className="flex items-center gap-1.5">
                              <div className={`h-3.5 w-3.5 rounded-full flex items-center justify-center transition-colors ${
                                c.ok ? "bg-emerald-500" : "bg-slate-200"
                              }`}>
                                {c.ok && (
                                  <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className={`text-xs font-semibold ${c.ok ? "text-emerald-700" : "text-slate-400"}`}>
                                {c.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-slate-700 font-bold text-sm">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (passwordError) setPasswordError(null);
                        }}
                        className={`h-12 pl-10 pr-10 rounded-xl text-base border-slate-200 bg-slate-50/30 focus:bg-white transition-colors font-medium ${
                          confirmPassword && confirmPassword !== newPassword
                            ? "border-red-400 focus:ring-red-500/20"
                            : confirmPassword && confirmPassword === newPassword
                            ? "border-emerald-400"
                            : ""
                        }`}
                        disabled={loading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="text-xs font-semibold text-red-600">Passwords do not match</p>
                    )}
                    {confirmPassword && confirmPassword === newPassword && (
                      <p className="text-xs font-semibold text-emerald-600">✓ Passwords match</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || strengthScore < 5 || newPassword !== confirmPassword}
                    className="w-full h-12 text-base font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Resetting...</> : "Reset Password"}
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          {/* ── Success Step ────────────────────────────────────────────────── */}
          {step === "success" && (
            <CardContent className="px-8 pb-10 pt-10">
              <div className="text-center space-y-5">
                <div className="mx-auto w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-slate-900">Password reset!</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Your password has been changed successfully.
                    <br />
                    You can now sign in with your new password.
                  </p>
                </div>
                <Button
                  className="w-full h-12 text-base font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all"
                  onClick={() => navigate("/login")}
                >
                  Go to Sign In
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
