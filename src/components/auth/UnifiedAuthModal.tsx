import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Phone, Mail, Lock, ShieldCheck, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import {
  validatePhone,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validateOtpCode,
  filterPhoneInput,
  filterOtpInput,
  filterNameInput
} from '@/utils/validation';

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultFullName?: string;
}

const UnifiedAuthModal: React.FC<UnifiedAuthModalProps> = ({ isOpen, onClose, onSuccess, defaultFullName }) => {
  const { login, otpLogin } = useAuth();
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'input' | 'otp' | 'password' | 'register_details'>('input');
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [fullName, setFullName] = useState(defaultFullName || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmRegisterPassword, setConfirmRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  React.useEffect(() => {
    if (!isOpen) {
      setStep('input');
      setIdentifier('');
      setPassword('');
      setOtpCode('');
      setFullName(defaultFullName || '');
      setPhoneNumber('');
      setRegisterPassword('');
      setConfirmRegisterPassword('');
      setShowRegisterPassword(false);
      setShowConfirmPassword(false);
      setError(null);
      setIsLoading(false);
      setOtpSent(false);
      setIsNewUser(false);
    }
  }, [isOpen, defaultFullName]);

  const handleNext = async () => {
    setError(null);
    if (!identifier.trim()) {
      setError(method === 'phone' ? 'Please enter your phone number' : 'Please enter your email address');
      return;
    }

    if (method === 'phone') {
      const phoneValidation = validatePhone(identifier, true);
      if (!phoneValidation.isValid) {
        setError(phoneValidation.error);
        return;
      }
    } else {
      const emailValidation = validateEmail(identifier, true);
      if (!emailValidation.isValid) {
        setError(emailValidation.error);
        return;
      }
    }

    setIsLoading(true);
    try {
      // 1. Check if user exists
      const checkRes = await fetch(`http://localhost:3006/api/auth/check-user?identifier=${encodeURIComponent(identifier)}`);
      const checkData = await checkRes.json();
      
      setIsNewUser(!checkData.exists);

      if (method === 'email') {
        // Send OTP to email
        const response = await fetch('http://localhost:3006/api/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: identifier.trim().toLowerCase() })
        });
        const data = await response.json();
        if (data.success) {
          setOtpSent(true);
          setResendTimer(60);
          setStep('otp');
          toast.success('Verification code sent to your email!');
        } else {
          setError(data.message || 'Failed to send verification email');
        }
      } else {
        // Send OTP to phone
        const response = await fetch('http://localhost:3006/api/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: identifier })
        });
        const data = await response.json();
        if (data.success) {
          setOtpSent(true);
          setResendTimer(60);
          setStep('otp');
          toast.success('OTP sent to your phone');
        } else {
          setError(data.message || 'Failed to send OTP');
        }
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3006/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          method === 'email'
            ? { email: identifier.trim().toLowerCase() }
            : { phone: identifier.trim() }
        )
      });
      const data = await response.json();
      if (data.success) {
        setResendTimer(60);
        toast.success(method === 'email' ? 'New verification code sent to your email!' : 'New OTP code sent to your phone!');
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setIsLoading(true);
    try {
      if (step === 'otp') {
        const otpValidation = validateOtpCode(otpCode, 6);
        if (!otpValidation.isValid) {
          setError(otpValidation.error);
          setIsLoading(false);
          return;
        }

        // Verify OTP first without logging in
        const verifyPayload = method === 'email'
          ? { email: identifier.trim().toLowerCase(), code: otpCode.trim() }
          : { phone: identifier.trim(), code: otpCode.trim() };

        const verifyRes = await fetch('http://localhost:3006/api/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verifyPayload)
        });
        const verifyData = await verifyRes.json();
        
        if (!verifyData.success) {
          throw new Error(verifyData.message || 'Invalid or expired OTP code');
        }

        if (isNewUser && method === 'email') {
          // Email new users must create a password
          setStep('register_details');
          setIsLoading(false);
          return;
        } else {
          // Phone new users (and all returning users) log in directly via OTP
          const res = await otpLogin(identifier.trim(), otpCode.trim());
          if (res.success) {
            toast.success(isNewUser ? 'Account created successfully!' : 'Login successful!');
            const role = res.data?.user?.role?.toLowerCase() || '';
            if (role === 'owner') window.location.href = '/dashboard';
            else if (role === 'admin') window.location.href = '/dashboard/admin';
            else { onSuccess(); onClose(); }
          } else {
            setError(res.message || 'Verification failed. Please check the code.');
          }
        }
      } else if (step === 'register_details') {
        // Only reached for email new users
        const nameValidation = validateName(fullName, 'Full name', true);
        if (!nameValidation.isValid) {
          setError(nameValidation.error);
          setIsLoading(false);
          return;
        }

        const passValidation = validatePassword(registerPassword, true, 'Password');
        if (!passValidation.isValid) {
          setError(passValidation.error);
          setIsLoading(false);
          return;
        }

        const confirmValidation = validateConfirmPassword(registerPassword, confirmRegisterPassword);
        if (!confirmValidation.isValid) {
          setError(confirmValidation.error);
          setIsLoading(false);
          return;
        }

        const res = await otpLogin(identifier.trim(), otpCode.trim(), fullName.trim(), registerPassword);
        if (res.success) {
          toast.success('Account created successfully! Welcome to Qirb Alga 🎉');
          const role = res.data?.user?.role?.toLowerCase() || '';
          if (role === 'owner') window.location.href = '/dashboard';
          else if (role === 'admin') window.location.href = '/dashboard/admin';
          else { onSuccess(); onClose(); }
        } else {
          setError(res.message || 'Registration failed.');
        }
      } else if (step === 'password') {
        const res = await login(identifier.trim().toLowerCase(), password);
        if (res.success) {
          toast.success('Login successful!');
          const role = res.data?.user?.role?.toLowerCase() || '';
          if (role === 'owner') window.location.href = '/dashboard';
          else if (role === 'admin') window.location.href = '/dashboard/admin';
          else { onSuccess(); onClose(); }
        } else {
          setError(res.message || 'Invalid email or password');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl font-bold font-heading">Secure Sign In</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 'input' 
              ? `Enter your ${method === 'phone' ? 'phone number' : 'email address'} to continue.` 
              : step === 'otp' 
                ? `Enter the 6-digit code sent to ${identifier}`
                : step === 'register_details'
                  ? (method === 'email'
                      ? `Almost there! Enter your name and create a password to complete your account.`
                      : `Just one more step — enter your name to complete registration.`)
                  : "Enter your password to continue."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAuth} className="space-y-6 pt-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-1">
              <span>{error}</span>
              <button 
                type="button" 
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-rose-600 font-bold ml-2 shrink-0 text-sm"
              >
                ×
              </button>
            </div>
          )}

          {step === 'input' && (
            <div className="space-y-4">
              <div className="flex bg-muted/50 p-1 rounded-2xl mb-4">
                <button
                  type="button"
                  onClick={() => { setMethod('phone'); setIdentifier(''); setError(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    method === 'phone' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Phone className="w-4 h-4" /> Phone
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('email'); setIdentifier(''); setError(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    method === 'email' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="identifier">{method === 'phone' ? 'Phone Number' : 'Email Address'}</Label>
                <div className="relative">
                  <Input
                    id="identifier"
                    type={method === 'email' ? 'email' : 'tel'}
                    placeholder={method === 'phone' ? "0911..." : "name@example.com"}
                    value={identifier}
                    onChange={(e) => {
                      const val = method === 'phone' ? filterPhoneInput(e.target.value) : e.target.value;
                      setIdentifier(val);
                      if (error) setError(null);
                    }}
                    className="h-14 rounded-xl pl-12"
                  />
                  <div className="absolute left-4 top-4 text-muted-foreground">
                    {method === 'email' ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                  </div>
                </div>
              </div>
              <Button 
                type="button" 
                className="w-full h-14 rounded-xl text-lg font-bold gap-2" 
                onClick={handleNext}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5" /></>}
              </Button>
              {method === 'email' && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep('password'); setIsNewUser(false); setError(null); }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    Or sign in with password
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp">6-Digit Code</Label>
                  <span className="text-xs text-muted-foreground">
                    Sent via {method === 'email' ? 'email' : 'SMS'}
                  </span>
                </div>
                <Input
                  id="otp"
                  placeholder="· · · · · ·"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(filterOtpInput(e.target.value, 6));
                    if (error) setError(null);
                  }}
                  maxLength={6}
                  className="h-14 rounded-xl text-center text-2xl font-mono tracking-widest"
                />
              </div>
              <Button type="submit" className="w-full h-14 rounded-xl text-lg font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
              </Button>
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  disabled={resendTimer > 0 || isLoading}
                  onClick={handleResendOtp}
                  className="text-primary font-semibold hover:underline disabled:text-muted-foreground disabled:no-underline"
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
                </button>
                <button 
                  type="button" 
                  className="text-muted-foreground font-medium hover:text-foreground"
                  onClick={() => { setStep('input'); setError(null); }}
                >
                  {method === 'email' ? "Change email" : "Change phone"}
                </button>
              </div>
            </div>
          )}

          {step === 'register_details' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Your Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Abebe Bikila"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(filterNameInput(e.target.value));
                    if (error) setError(null);
                  }}
                  className="h-12 rounded-xl"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password fields — only shown for email registrations */}
              {method === 'email' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="registerPassword">Create Password</Label>
                    <div className="relative">
                      <Input
                        id="registerPassword"
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="Min 8 chars (upper, lower, num, symbol)"
                        value={registerPassword}
                        onChange={(e) => {
                          setRegisterPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        className="h-12 rounded-xl pl-11 pr-11"
                        required
                        disabled={isLoading}
                      />
                      <div className="absolute left-3.5 top-3.5 text-muted-foreground">
                        <Lock className="w-5 h-5" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showRegisterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmRegisterPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmRegisterPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repeat your password"
                        value={confirmRegisterPassword}
                        onChange={(e) => {
                          setConfirmRegisterPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        className="h-12 rounded-xl pl-11 pr-11"
                        required
                        disabled={isLoading}
                      />
                      <div className="absolute left-3.5 top-3.5 text-muted-foreground">
                        <Lock className="w-5 h-5" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base font-bold shadow-md shadow-primary/20" 
                  disabled={
                    isLoading ||
                    !fullName.trim() ||
                    (method === 'email' && (!registerPassword || !confirmRegisterPassword))
                  }
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
                </Button>
              </div>

              <button 
                type="button" 
                className="w-full text-sm text-primary font-medium hover:underline text-center"
                onClick={() => {
                  setStep('input');
                  setError(null);
                  setOtpCode('');
                  setFullName('');
                  setRegisterPassword('');
                  setConfirmRegisterPassword('');
                }}
              >
                Start Over
              </button>
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-6">
              {isNewUser && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Abebe Bikila"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(filterNameInput(e.target.value));
                        if (error) setError(null);
                      }}
                      className="h-14 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="0911..."
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(filterPhoneInput(e.target.value));
                        if (error) setError(null);
                      }}
                      className="h-14 rounded-xl"
                      required
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">{isNewUser ? "Choose a Password" : "Password"}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder={isNewUser ? "Min 8 chars with letter, digit & symbol" : "Enter your password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="h-14 rounded-xl pl-12"
                    required
                  />
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 rounded-xl text-lg font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isNewUser ? "Create Account & Continue" : "Sign In")}
              </Button>
              <button 
                type="button" 
                className="w-full text-sm text-primary font-medium hover:underline"
                onClick={() => { setStep('input'); setError(null); }}
              >
                Use a different email/phone
              </button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedAuthModal;
