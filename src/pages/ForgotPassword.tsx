import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2, CheckCircle2, Send } from "lucide-react";
import { validateEmail } from "@/utils/validation";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    const errMsg = validateEmail(email.trim(), true, "Email address");
    if (errMsg) {
      setEmailError(errMsg);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3006/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        toast.success("Check your inbox — a reset link has been sent!");
      } else {
        toast.error(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Connection error. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to login */}
        <Link
          to="/login"
          className="flex items-center gap-2 text-sm text-slate-500 font-semibold hover:text-blue-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Sign In
        </Link>

        <Card className="shadow-2xl shadow-slate-200/70 border border-slate-200/80 bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader className="text-center pb-2 pt-8 px-8">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Forgot your password?
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium mt-2 leading-relaxed">
              No problem. Enter your account email and we'll send you a secure reset link.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-6">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-700 font-bold text-sm">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      className={`h-12 pl-10 rounded-xl text-base border-slate-200 bg-slate-50/30 focus:bg-white transition-colors font-medium ${
                        emailError ? "border-red-400 focus:ring-red-500/20" : ""
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs font-semibold text-red-600 mt-1">{emailError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full h-12 text-base font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Reset Link
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-slate-400 font-medium pt-1">
                  Remember your password?{" "}
                  <Link to="/login" className="text-blue-600 font-bold hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            ) : (
              /* ── Success State ── */
              <div className="text-center space-y-5 py-4">
                <div className="mx-auto w-16 h-16 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-slate-900">Check your inbox!</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    We've sent a password reset link to{" "}
                    <span className="font-bold text-slate-700">{email}</span>.
                    <br />
                    The link and code expire in <span className="font-bold">15 minutes</span>.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-2">
                  <p className="text-xs font-extrabold text-amber-800 uppercase tracking-wide">📭 Didn't receive it?</p>
                  <ul className="text-xs text-amber-700 space-y-1 font-medium">
                    <li>• <strong>Check your Spam / Junk folder</strong> — reset emails often land there</li>
                    <li>• Check the "All Mail" label in Gmail</li>
                    <li>• Allow up to 2–3 minutes for delivery</li>
                    <li>• Make sure the email address above is correct</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
                  <p className="text-xs font-extrabold text-blue-800 mb-1">🔢 Prefer to enter a code?</p>
                  <p className="text-xs text-blue-700 font-medium">
                    The email also contains a <strong>6-digit verification code</strong>. You can go to the{" "}
                    <Link to="/reset-password" className="underline font-bold">reset page</Link>{" "}
                    and enter that code manually instead of clicking the email link.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl font-bold border-slate-200"
                    onClick={() => { setSubmitted(false); setEmail(""); }}
                  >
                    Try a different email
                  </Button>
                  <Link to="/login">
                    <Button className="w-full rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
