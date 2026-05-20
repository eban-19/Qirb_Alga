import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Phone, Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    setError(null);
    if (!identifier) {
      setError('Please enter your email or phone number');
      return;
    }

    if (method === 'phone') {
      const cleanPhone = identifier.trim();
      const digitsOnly = cleanPhone.replace('+', '');
      if (!/^\d+$/.test(digitsOnly)) {
        setError("Phone must contain only numeric digits");
        return;
      }

      if (cleanPhone.startsWith('+')) {
        if (!cleanPhone.startsWith('+251')) {
          setError("Must start with country code +251");
          return;
        }
        const afterCountry = cleanPhone.slice(4);
        if (!afterCountry.startsWith('9') && !afterCountry.startsWith('7')) {
          setError("Must start with +2519 or +2517");
          return;
        }
        if (cleanPhone.length !== 13) {
          setError("Must be exactly 13 characters");
          return;
        }
      } else if (cleanPhone.startsWith('251')) {
        const afterCountry = cleanPhone.slice(3);
        if (!afterCountry.startsWith('9') && !afterCountry.startsWith('7')) {
          setError("Must start with 2519 or 2517");
          return;
        }
        if (cleanPhone.length !== 12) {
          setError("Must be exactly 12 digits");
          return;
        }
      } else {
        const startsWithZero = cleanPhone.startsWith('0');
        const normalizedLocal = startsWithZero ? cleanPhone : '0' + cleanPhone;
        
        if (!normalizedLocal.startsWith('09') && !normalizedLocal.startsWith('07')) {
          setError("Must start with 09 or 07");
          return;
        }
        
        const expectedLength = startsWithZero ? 10 : 9;
        if (cleanPhone.length !== expectedLength) {
          setError(`Must be exactly ${expectedLength} digits`);
          return;
        }
      }
    }

    setIsLoading(true);
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
          setOtpSent(true);
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (method === 'email' && isNewUser) {
      if (!phoneNumber) {
        setError("Phone number is required for registration");
        return;
      }
      
      const cleanPhone = phoneNumber.trim();
      const digitsOnly = cleanPhone.replace('+', '');
      if (!/^\d+$/.test(digitsOnly)) {
        setError("Phone must contain only numeric digits");
        return;
      }

      if (cleanPhone.startsWith('+')) {
        if (!cleanPhone.startsWith('+251')) {
          setError("Must start with country code +251");
          return;
        }
        const afterCountry = cleanPhone.slice(4);
        if (!afterCountry.startsWith('9') && !afterCountry.startsWith('7')) {
          setError("Must start with +2519 or +2517");
          return;
        }
        if (cleanPhone.length !== 13) {
          setError("Must be exactly 13 characters");
          return;
        }
      } else if (cleanPhone.startsWith('251')) {
        const afterCountry = cleanPhone.slice(3);
        if (!afterCountry.startsWith('9') && !afterCountry.startsWith('7')) {
          setError("Must start with 2519 or 2517");
          return;
        }
        if (cleanPhone.length !== 12) {
          setError("Must be exactly 12 digits");
          return;
        }
      } else {
        const startsWithZero = cleanPhone.startsWith('0');
        const normalizedLocal = startsWithZero ? cleanPhone : '0' + cleanPhone;
        
        if (!normalizedLocal.startsWith('09') && !normalizedLocal.startsWith('07')) {
          setError("Must start with 09 or 07");
          return;
        }
        
        const expectedLength = startsWithZero ? 10 : 9;
        if (cleanPhone.length !== expectedLength) {
          setError(`Must be exactly ${expectedLength} digits`);
          return;
        }
      }
    }

    setIsLoading(true);
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
            const res = await login(identifier, password);
            if (res.success) {
              toast.success('Account created successfully!');
              onSuccess();
              onClose();
            } else {
              setError(res.message || 'Login failed after registration');
            }
          } else {
            setError(regData.message || 'Registration failed');
          }
        } else {
          const res = await login(identifier, password);
          if (res.success) {
            toast.success('Login successful!');
            const role = res.data?.user?.role?.toLowerCase() || '';
            if (role === 'owner') {
              window.location.href = '/dashboard';
            } else if (role === 'admin') {
              window.location.href = '/dashboard/admin';
            } else {
              onSuccess();
              onClose();
            }
          } else {
            setError(res.message || 'Invalid email or password');
          }
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
            setStep('register_details');
            setIsLoading(false);
            return;
          } else {
            const res = await otpLogin(identifier, otpCode);
            if (res.success) {
              toast.success('Login successful!');
              const role = res.data?.user?.role?.toLowerCase() || '';
              if (role === 'owner') window.location.href = '/dashboard';
              else if (role === 'admin') window.location.href = '/dashboard/admin';
              else { onSuccess(); onClose(); }
            } else {
              setError(res.message || 'Verification failed. Please check the code.');
            }
          }
        } else if (step === 'register_details') {
          if (!fullName.trim()) throw new Error('Full Name is required');
          const res = await otpLogin(identifier, otpCode, fullName);
          if (res.success) {
            toast.success('Login successful!');
            const role = res.data?.user?.role?.toLowerCase() || '';
            if (role === 'owner') window.location.href = '/dashboard';
            else if (role === 'admin') window.location.href = '/dashboard/admin';
            else { onSuccess(); onClose(); }
          } else {
            setError(res.message || 'Registration failed.');
          }
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
      <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-8">
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
                  ? `Almost there! Please provide your full name to complete registration`
                  : isNewUser 
                    ? "Create your account to complete your booking."
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
                    placeholder={method === 'phone' ? "e.g. 0911..." : "name@example.com"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
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
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">6-Digit Code</Label>
                <Input
                  id="otp"
                  placeholder="· · · · · ·"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  className="h-14 rounded-xl text-center text-2xl font-mono tracking-widest"
                />
              </div>
              <Button type="submit" className="w-full h-14 rounded-xl text-lg font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
              </Button>
              <button 
                type="button" 
                className="w-full text-sm text-primary font-medium hover:underline"
                onClick={() => { setStep('input'); setError(null); }}
              >
                Change Phone Number
              </button>
            </div>
          )}

          {step === 'register_details' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Your Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Abebe Bikila"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-14 rounded-xl"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full h-14 rounded-xl text-lg font-bold" disabled={isLoading || !fullName.trim()}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
              </Button>
              <button 
                type="button" 
                className="w-full text-sm text-primary font-medium hover:underline"
                onClick={() => { setStep('input'); setError(null); setOtpCode(''); setFullName(''); }}
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
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-14 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="e.g. 0911..."
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
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
                    placeholder={isNewUser ? "Min 6 characters" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
