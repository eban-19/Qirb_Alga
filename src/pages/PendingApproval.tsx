import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Mail, Phone, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function PendingApproval() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUserProfile(data.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Account Pending Approval
            </CardTitle>
            <p className="text-slate-600 mt-2">
              Your account is currently under review by our administration team
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className="text-center">
              <Badge className="bg-amber-100 text-amber-800 px-4 py-2 text-sm font-medium">
                <Clock className="w-4 h-4 mr-2" />
                Pending Review
              </Badge>
            </div>

            {/* User Information */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-slate-800 mb-3">Account Information</h3>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <FileText className="w-4 h-4 mr-2 text-slate-500" />
                  <span className="text-slate-600">Name:</span>
                  <span className="ml-2 font-medium text-slate-800">
                    {userProfile?.name || `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || 'Not provided'}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-slate-500" />
                  <span className="text-slate-600">Email:</span>
                  <span className="ml-2 font-medium text-slate-800">{user?.email || 'Not provided'}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-2 text-slate-500" />
                  <span className="text-slate-600">Phone:</span>
                  <span className="ml-2 font-medium text-slate-800">{userProfile?.phone || 'Not provided'}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-slate-500" />
                  <span className="text-slate-600">Role:</span>
                  <span className="ml-2 font-medium text-slate-800 capitalize">{user?.role || 'Owner'}</span>
                </div>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">What Happens Next?</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Our admin team will review your application within 24-48 hours</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>You'll receive an email notification once a decision is made</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Approved accounts can immediately access the dashboard</span>
                </li>
              </ul>
            </div>

            {/* Possible Outcomes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-green-900 text-sm">Approved</h4>
                <p className="text-xs text-green-700 mt-1">Full access granted</p>
              </div>
              
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <h4 className="font-medium text-amber-900 text-sm">Pending</h4>
                <p className="text-xs text-amber-700 mt-1">Currently under review</p>
              </div>
              
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <h4 className="font-medium text-red-900 text-sm">Rejected</h4>
                <p className="text-xs text-red-700 mt-1">Contact support</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="flex-1"
              >
                Check Status
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="default" 
                className="flex-1"
              >
                Logout
              </Button>
            </div>

            {/* Help Section */}
            <div className="text-center text-sm text-slate-500 pt-4 border-t">
              <p>Need help? Contact our support team</p>
              <p className="mt-1">
                <a href="mailto:support@qirbalga.com" className="text-blue-600 hover:underline">
                  support@qirbalga.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
