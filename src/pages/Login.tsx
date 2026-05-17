import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Clock, XCircle, Lock, UserX, AlertCircle, Eye, EyeOff } from "lucide-react";
import { getAccountStatusMessage, AccountStatusError } from "@/utils/authMessages";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AccountStatusError | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Helper function to get icon based on error type
  const getErrorIcon = (iconName: string) => {
    switch (iconName) {
      case 'alert-triangle': return <AlertTriangle className="h-4 w-4" />;
      case 'clock': return <Clock className="h-4 w-4" />;
      case 'x-circle': return <XCircle className="h-4 w-4" />;
      case 'lock': return <Lock className="h-4 w-4" />;
      case 'user-x': return <UserX className="h-4 w-4" />;
      case 'alert-circle': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role (case-insensitive)
      if (user.role?.toLowerCase() === 'admin') {
        navigate("/dashboard/admin");
      } else if (user.role?.toLowerCase() === 'customer') {
        navigate("/");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      // Navigation will be handled by useEffect
    } catch (error: any) {
      const statusError = getAccountStatusMessage(error, email);
      setError(statusError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Owner Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your pension dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert 
                variant={error.variant}
                className={`
                  ${error.severity === 'medium' && error.status === 'suspended' ? 'border-orange-200 bg-orange-50' : ''}
                  ${error.severity === 'low' ? 'border-blue-200 bg-blue-50' : ''}
                  ${error.severity === 'high' ? 'border-red-200 bg-red-50' : ''}
                `}
              >
                <div className="flex items-start gap-2">
                  {error.icon && getErrorIcon(error.icon)}
                  <div className="flex-1">
                    <AlertDescription className={`font-semibold ${
                      error.severity === 'medium' && error.status === 'suspended' ? 'text-orange-800' : ''
                    } ${error.severity === 'low' ? 'text-blue-800' : ''} ${
                      error.severity === 'high' ? 'text-red-800' : ''
                    }`}>
                      {error.title}
                    </AlertDescription>
                    <AlertDescription className={`text-sm mt-1 ${
                      error.severity === 'medium' && error.status === 'suspended' ? 'text-orange-700' : ''
                    } ${error.severity === 'low' ? 'text-blue-700' : ''} ${
                      error.severity === 'high' ? 'text-red-700' : ''
                    }`}>
                      {error.message}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            Don't have an account?{" "}
            <Link to="/register-property" className="text-primary hover:underline">
              Register your property
            </Link>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            <Link to="/" className="text-primary hover:underline">
              Back to home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
