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
  const [step, setStep] = useState<'input' | 'otp' | 'password'>('input');
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [fullName, setFullName] = useState(defaultFullName || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const handleNext = async () => {
    if (!identifier) {
      toast.error('Please enter your email or phone number');
      return;
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
          toast.error(data.message || 'Failed to send OTP');
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
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
            await login(identifier, password);
            toast.success('Account created successfully!');
            onSuccess();
            onClose();
          } else {
            toast.error(regData.message || 'Registration failed');
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
          }
        }
      } else {
        const res = await otpLogin(identifier, otpCode, fullName);
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
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
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
                : isNewUser 
                  ? "Create your account to complete your booking."
                  : "Enter your password to continue."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAuth} className="space-y-6 pt-4">
          {step === 'input' && (
            <div className="space-y-4">
              <div className="flex bg-muted/50 p-1 rounded-2xl mb-4">
                <button
                  type="button"
                  onClick={() => { setMethod('phone'); setIdentifier(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    method === 'phone' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Phone className="w-4 h-4" /> Phone
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('email'); setIdentifier(''); }}
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
                <Label htmlFor="fullName">Your Full Name (Optional)</Label>
                <Input
                  id="fullName"
                  placeholder="Abebe Bikila"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-14 rounded-xl"
                />
              </div>
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
                onClick={() => setStep('input')}
              >
                Change Phone Number
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
                onClick={() => setStep('input')}
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
