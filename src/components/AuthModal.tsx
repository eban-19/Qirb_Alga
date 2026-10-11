import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, Phone } from 'lucide-react';
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  filterPhoneInput,
  filterNameInput
} from '@/utils/validation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loading, error, clearError } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [clientError, setClientError] = useState<string | null>(null);

  // Login form state
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setClientError(null);

    const emailVal = validateEmail(loginForm.email, true);
    if (!emailVal.isValid) {
      setClientError(emailVal.error);
      return;
    }

    if (!loginForm.password) {
      setClientError('Password is required');
      return;
    }

    try {
      await login(loginForm.email.trim().toLowerCase(), loginForm.password);
      onClose();
    } catch {
      // Error is handled by auth context
    }
  };

  const handleRegister = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setClientError(null);

    const nameVal = validateName(registerForm.fullName, 'Full name', true);
    if (!nameVal.isValid) {
      setClientError(nameVal.error);
      return;
    }

    const emailVal = validateEmail(registerForm.email, true);
    if (!emailVal.isValid) {
      setClientError(emailVal.error);
      return;
    }

    if (registerForm.phone.trim()) {
      const phoneVal = validatePhone(registerForm.phone, false);
      if (!phoneVal.isValid) {
        setClientError(phoneVal.error);
        return;
      }
    }

    const passVal = validatePassword(registerForm.password, true);
    if (!passVal.isValid) {
      setClientError(passVal.error);
      return;
    }

    try {
      await register({
        ...registerForm,
        email: registerForm.email.trim().toLowerCase(),
        fullName: registerForm.fullName.trim(),
        phone: registerForm.phone.trim()
      });
      onClose();
    } catch {
      // Error is handled by auth context
    }
  };

  const handleLoginChange = (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm(prev => ({ ...prev, [field]: e.target.value }));
    setClientError(null);
    clearError();
  };

  const handleRegisterChange = (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (field === 'fullName') {
      val = filterNameInput(val);
    } else if (field === 'phone') {
      val = filterPhoneInput(val);
    }
    setRegisterForm(prev => ({ ...prev, [field]: val }));
    setClientError(null);
    clearError();
  };

  if (!isOpen) return null;

  const displayError = clientError || error;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to PensionHub</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayError && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {displayError}
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value as 'login' | 'register');
            setClientError(null);
            clearError();
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={handleLoginChange('email')}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={handleLoginChange('password')}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={registerForm.fullName}
                      onChange={handleRegisterChange('fullName')}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="regEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="regEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={registerForm.email}
                      onChange={handleRegisterChange('email')}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0911..."
                      value={registerForm.phone}
                      onChange={handleRegisterChange('phone')}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="regPassword">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="regPassword"
                      type="password"
                      placeholder="At least 8 chars with letter, digit & symbol"
                      value={registerForm.password}
                      onChange={handleRegisterChange('password')}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthModal;
