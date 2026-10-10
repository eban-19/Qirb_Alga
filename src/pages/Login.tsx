import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  Phone, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  UserX, 
  AlertCircle, 
  Eye, 
  EyeOff 
} from "lucide-react";
import { getAccountStatusMessage, AccountStatusError } from "@/utils/authMessages";
import {
  filterNameInput,
  filterPhoneInput,
  filterOtpInput,
  validateName,
  validatePhone,
  validateEmail,
  validatePassword,
  validateOtpCode
} from "@/utils/validation";

const Login = () => {
  const navigate = useNavigate();
  const { login, otpLogin, isAuthenticated, user } = useAuth();
  
  // Auth state methods
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'input' | 'otp' | 'password' | 'register_details'>('input');
  
  // Form input states
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<AccountStatusError | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // Helper function to get icon based on error type
  const getErrorIcon = (iconName: string) => {
    switch (iconName) {
      case 'alert-triangle': return <AlertTriangle className="h-5 w-5 shrink-0" />;
      case 'clock': return <Clock className="h-5 w-5 shrink-0" />;
      case 'x-circle': return <XCircle className="h-5 w-5 shrink-0" />;
      case 'lock': return <Lock className="h-5 w-5 shrink-0" />;
      case 'user-x': return <UserX className="h-5 w-5 shrink-0" />;
      case 'alert-circle': return <AlertCircle className="h-5 w-5 shrink-0" />;
      default: return <AlertCircle className="h-5 w-5 shrink-0" />;
    }
  };

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role?.toLowerCase();
      if (role === 'admin') {
        navigate("/dashboard/admin");
      } else if (role === 'customer') {
        navigate("/");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleNext = async () => {
    if (!identifier) {
      toast.error(`Please enter your ${method === 'phone' ? 'phone number' : 'email address'}`);
      return;
    }

    if (method === 'phone') {
      const phoneErr = validatePhone(identifier, true, false, 'Phone number');
      if (phoneErr) {
        toast.error(phoneErr);
        return;
      }
    } else {
      const emailErr = validateEmail(identifier, true, 'Email address');
      if (emailErr) {
        toast.error(emailErr);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Check if user exists
      const checkRes = await fetch(`http://localhost:3006/api/auth/check-user?identifier=${encodeURIComponent(identifier)}`);
      const checkData = await checkRes.json();
      
      if (method === 'email') {
        if (checkData.exists) {
          setStep('password');
          setIsNewUser(false);
        } else {
          setStep('password'); // Use password step but modify it for registration
          setIsNewUser(true);
        }
      } else {
        setIsNewUser(!checkData.exists);
        // Send OTP
        const response = await fetch('http://localhost:3006/api/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: identifier })
        });
        const data = await response.json();
        if (data.success) {
          setStep('otp');
          toast.success('OTP code sent successfully to your phone!');
        } else {
          toast.error(data.message || 'Failed to send OTP code');
        }
      }
    } catch (err: any) {
      toast.error('Something went wrong. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (method === 'email' && isNewUser) {
      const nameErr = validateName(fullName, 'Full name', true);
      if (nameErr) {
        toast.error(nameErr);
        return;
      }

      const phoneErr = validatePhone(phoneNumber, true, false, 'Phone number');
      if (phoneErr) {
        toast.error(phoneErr);
        return;
      }

      const passErr = validatePassword(password, true, 'Password');
      if (passErr) {
        toast.error(passErr);
        return;
      }
    }

    if (step === 'otp') {
      const otpErr = validateOtpCode(otpCode);
      if (otpErr) {
        toast.error(otpErr);
        return;
      }
    }

    if (step === 'register_details') {
      const nameErr = validateName(fullName, 'Full name', true);
      if (nameErr) {
        toast.error(nameErr);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      if (method === 'email') {
        if (isNewUser) {
          // Register new customer via email
          const regRes = await fetch('http://localhost:3006/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: identifier,
              password,
              fullName,
              phone: phoneNumber,
              role: 'Customer'
            })
          });
          const regData = await regRes.json();
          if (regData.success) {
            // After register, perform login
            await login(identifier, password);
            toast.success('Account created successfully!');
          } else {
            toast.error(regData.message || 'Registration failed');
          }
        } else {
          await login(identifier, password);
          toast.success('Welcome back!');
        }
      } else {
        if (step === 'otp') {
          // Verify OTP first without logging in
          const verifyRes = await fetch('http://localhost:3006/api/otp/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: identifier, code: otpCode })
          });
          const verifyData = await verifyRes.json();
          
          if (!verifyData.success) {
            throw new Error(verifyData.message || 'Invalid or expired OTP code');
          }

          if (isNewUser) {
            // Move to register_details phase
            setStep('register_details');
            setLoading(false);
            return;
          } else {
            // Existing user, log them in
            await otpLogin(identifier, otpCode);
            toast.success('Successfully authenticated!');
          }
        } else if (step === 'register_details') {
          await otpLogin(identifier, otpCode, fullName);
          toast.success('Account created and authenticated successfully!');
        }
      }
    } catch (err: any) {
      const statusError = getAccountStatusMessage(err, identifier);
      setError(statusError);
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-slate-200/80 shadow-none rounded-[2rem] bg-white overflow-hidden animate-in fade-in duration-300">
        <CardHeader className="space-y-2 pt-8 pb-4 text-center mt-2">
          <div className="mx-auto w-14 h-14 bg-slate-50 text-slate-700 rounded-2xl flex items-center justify-center border border-slate-100 mb-2">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
            Secure Access Portal
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium px-4">
            {step === 'input' 
              ? `Choose your login method to connect to your profile` 
              : step === 'otp' 
                ? `Enter the verification code sent to your phone`
                : step === 'register_details'
                  ? `Almost there! Please provide your full name to complete registration`
                  : isNewUser 
                    ? "Let's create your account to get started"
                    : "Enter your password to continue"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 py-4">
          {error && (
            <Alert 
              variant={error.variant}
              className={`
                mb-6 rounded-2xl border
                ${error.severity === 'medium' && error.status === 'suspended' ? 'border-orange-200 bg-orange-50 text-orange-800' : ''}
                ${error.severity === 'low' ? 'border-blue-200 bg-blue-50 text-blue-800' : ''}
                ${error.severity === 'high' ? 'border-red-200 bg-red-50 text-red-800' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                {error.icon && getErrorIcon(error.icon)}
                <div className="flex-1">
                  <span className="font-bold text-sm block tracking-tight">{error.title}</span>
                  <span className="text-xs font-medium block mt-0.5 opacity-90">{error.message}</span>
                </div>
              </div>
            </Alert>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-5">
            {step === 'input' && (
              <div className="space-y-4">
                <div className="flex bg-slate-50 border border-slate-100 p-1.5 rounded-2xl mb-2">
                  <button
                    type="button"
                    onClick={() => { setMethod('phone'); setIdentifier(''); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                      method === 'phone' ? 'bg-white shadow-sm text-slate-800 border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Phone className="w-4 h-4" /> Phone Number
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMethod('email'); setIdentifier(''); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                      method === 'email' ? 'bg-white shadow-sm text-slate-800 border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Mail className="w-4 h-4" /> Email Address
                  </button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-slate-700 font-bold text-sm">
                    {method === 'phone' ? 'Phone Number' : 'Email Address'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="identifier"
                      type={method === 'email' ? 'email' : 'tel'}
                      placeholder={method === 'phone' ? "e.g. 0911..." : "name@example.com"}
                      value={identifier}
                      onChange={(e) => setIdentifier(method === 'phone' ? filterPhoneInput(e.target.value) : e.target.value)}
                      className="h-13 rounded-xl pl-12 border-slate-200 bg-slate-50/20 focus:ring-blue-500/20 font-semibold"
                      required
                      disabled={loading}
                    />
                    <div className="absolute left-4 top-4 text-slate-400">
                      {method === 'email' ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                <Button 
                  type="button" 
                  className="w-full h-13 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2" 
                  onClick={handleNext}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-slate-700 font-bold text-sm">6-Digit Verification Code</Label>
                  <Input
                    id="otp"
                    placeholder="· · · · · ·"
                    value={otpCode}
                    onChange={(e) => setOtpCode(filterOtpInput(e.target.value))}
                    maxLength={6}
                    className="h-13 rounded-xl text-center text-xl font-mono tracking-widest border-slate-200 bg-slate-50/20 focus:ring-blue-500/20"
                    required
                    disabled={loading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-13 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                </Button>
                
                <button 
                  type="button" 
                  className="w-full text-sm text-blue-600 font-bold hover:underline py-1"
                  onClick={() => { setStep('input'); setOtpCode(''); }}
                  disabled={loading}
                >
                  Change Phone Number
                </button>
              </div>
            )}

            {step === 'register_details' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-700 font-bold text-sm">Your Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="e.g. Abebe Bikila"
                    value={fullName}
                    onChange={(e) => setFullName(filterNameInput(e.target.value))}
                    className="h-13 rounded-xl border-slate-200 bg-slate-50/20 focus:ring-blue-500/20 font-medium"
                    required
                    disabled={loading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-13 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]" 
                  disabled={loading || !fullName.trim()}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
                </Button>
                
                <button 
                  type="button" 
                  className="w-full text-sm text-blue-600 font-bold hover:underline py-1"
                  onClick={() => { setStep('input'); setOtpCode(''); setFullName(''); }}
                  disabled={loading}
                >
                  Start Over
                </button>
              </div>
            )}

            {step === 'password' && (
              <div className="space-y-5">
                {isNewUser && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-slate-700 font-bold text-sm">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="Abebe Bikila"
                        value={fullName}
                        onChange={(e) => setFullName(filterNameInput(e.target.value))}
                        className="h-13 rounded-xl border-slate-200 bg-slate-50/20 focus:ring-blue-500/20 font-medium"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-slate-700 font-bold text-sm">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="e.g. 0911..."
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(filterPhoneInput(e.target.value))}
                        className="h-13 rounded-xl border-slate-200 bg-slate-50/20 focus:ring-blue-500/20 font-medium"
                        required
                        disabled={loading}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-bold text-sm">
                    {isNewUser ? "Choose a Password" : "Password"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={isNewUser ? "Minimum 6 characters" : "Enter your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-13 rounded-xl pl-12 pr-10 border-slate-200 bg-slate-50/20 focus:ring-blue-500/20 font-semibold"
                      required
                      disabled={loading}
                    />
                    <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password - only shown for existing users */}
                {!isNewUser && (
                  <div className="text-right -mt-2">
                    <Link
                      to="/forgot-password"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full h-13 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isNewUser ? "Create Account & Continue" : "Sign In")}
                </Button>
                
                <button 
                  type="button" 
                  className="w-full text-sm text-blue-600 font-bold hover:underline py-1"
                  onClick={() => { setStep('input'); setPassword(''); setError(null); }}
                  disabled={loading}
                >
                  Use a different email/phone
                </button>
              </div>
            )}
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3 px-6 pb-8 pt-2">
          <div className="w-full border-t border-slate-100 my-1"></div>
          <div className="text-sm text-slate-500 text-center font-medium">
            Don't have an account?{" "}
            <Link to="/register-property" className="text-blue-600 font-bold hover:underline transition-all">
              Register your property
            </Link>
          </div>
          <div className="text-sm text-slate-500 text-center font-medium">
            <Link to="/" className="text-slate-400 font-semibold hover:text-slate-600 transition-all">
              Back to home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
