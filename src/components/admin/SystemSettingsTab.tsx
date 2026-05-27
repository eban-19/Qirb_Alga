import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Save, 
  RefreshCcw, 
  Percent, 
  CreditCard, 
  Info, 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Key, 
  Edit2, 
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import apiService from "@/services/api";
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/use-language";
import { PayoutMethodsAdmin } from './PayoutMethodsAdmin';

interface SystemSettingsTabProps {
  activeSection?: 'financial' | 'account' | 'security';
}

export const SystemSettingsTab: React.FC<SystemSettingsTabProps> = ({ activeSection = 'financial' }) => {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { t } = useLanguage();

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRawSystemSettings();
      if (response.success && response.data) {
        setSettings(response.data);
        const values: Record<string, string> = {};
        response.data.forEach((s: any) => {
          values[s.key] = s.value;
        });
        setEditValues(values);
      }
    } catch (error: any) {
      toast.error("Failed to fetch system settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleInputChange = (key: string, value: string) => {
    setEditValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await apiService.updateSystemSettings(editValues);
      if (response.success) {
        toast.success("System configuration updated");
        fetchSettings();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdatingProfile(true);
      await updateProfile(profileForm);
      toast.success("Profile updated successfully");
      setIsEditingProfile(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors({ confirmPassword: "Passwords do not match" });
      return;
    }
    try {
      setChangingPassword(true);
      const res = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordErrors({ general: error.message || "Failed to change password" });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 capitalize">
          {activeSection === 'financial' ? (t.adminTabs?.settings?.financialSettings || 'Financial Settings') : 
           activeSection === 'account' ? (t.adminTabs?.settings?.accountSettings || 'Account Settings') : 
           activeSection === 'security' ? (t.adminTabs?.settings?.securitySettings || 'Security Settings') : 
           activeSection === 'payouts' ? 'Payout Methods' : 
           `${activeSection} Settings`}
        </h2>
        <p className="text-slate-500">{t.adminTabs?.settings?.subtitle || "Manage system parameters and your personal account."}</p>
      </div>

      {activeSection === 'financial' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSettings} 
              disabled={loading}
              className="gap-2 rounded-lg"
            >
              <RefreshCcw className={loading ? "animate-spin w-4 h-4" : "w-4 h-4"} />
              {t.adminTabs?.common?.refresh || "Refresh Data"}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-lg bg-white overflow-hidden ring-1 ring-slate-200">
              <div className="h-2 w-full bg-blue-500" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Percent className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>{t.adminTabs?.settings?.vatPercentage || "VAT Percentage"}</CardTitle>
                    <CardDescription>{t.adminTabs?.settings?.vatDescription || "Value Added Tax applied to bookings"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="VAT_PERCENTAGE">Rate (%)</Label>
                  <div className="relative">
                    <Input
                      id="VAT_PERCENTAGE"
                      type="number"
                      value={editValues['VAT_PERCENTAGE'] || ''}
                      onChange={(e) => handleInputChange('VAT_PERCENTAGE', e.target.value)}
                      className="pl-10 h-12 text-lg font-bold rounded-xl"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 text-xs">
                  <Info className="w-4 h-4 text-blue-500 shrink-0" />
                  <p className="text-slate-600">{t.adminTabs?.settings?.vatHint || "Ethiopia Standard VAT is typically 15%."}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white overflow-hidden ring-1 ring-slate-200">
              <div className="h-2 w-full bg-emerald-500" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>{t.adminTabs?.settings?.serviceFee || "Service Fee"}</CardTitle>
                    <CardDescription>{t.adminTabs?.settings?.serviceFeeDescription || "Platform processing fee"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="SERVICE_FEE_PERCENTAGE">Rate (%)</Label>
                  <div className="relative">
                    <Input
                      id="SERVICE_FEE_PERCENTAGE"
                      type="number"
                      value={editValues['SERVICE_FEE_PERCENTAGE'] || ''}
                      onChange={(e) => handleInputChange('SERVICE_FEE_PERCENTAGE', e.target.value)}
                      className="pl-10 h-12 text-lg font-bold rounded-xl"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 text-xs">
                  <Info className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p className="text-slate-600">{t.adminTabs?.settings?.serviceFeeHint || "Fee charged to owners for using the platform."}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSaveSettings} 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-blue-500/20 gap-2 transition-all"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {t.adminTabs?.settings?.saveConfiguration || "Save Configuration"}
            </Button>
          </div>
        </div>
      )}

      {activeSection === 'account' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Info Card */}
            <Card className="lg:col-span-2 border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-200">
              <div className="h-2 w-full bg-blue-600" />
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>{t.adminTabs?.settings?.profileInfo || "Profile Information"}</CardTitle>
                    <CardDescription>{t.adminTabs?.settings?.profileDescription || "Manage your public display details."}</CardDescription>
                  </div>
                </div>
                {!isEditingProfile && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)} className="rounded-lg gap-2">
                    <Edit2 className="w-3 h-3" /> {t.adminTabs?.common?.edit || "Edit"}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6 p-8 pt-2">
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
                    <span className="text-white text-4xl font-bold">{(user?.full_name || 'A')[0].toUpperCase()}</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-bold text-slate-900">{user?.full_name}</h3>
                    <Badge className="mt-1 bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50">
                      System Administrator
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-500 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email Address
                    </Label>
                    <Input value={user?.email} disabled className="bg-slate-50 border-slate-100 font-medium" />
                    <p className="text-[10px] text-slate-400">Email cannot be changed for security reasons.</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-500 flex items-center gap-2">
                      <UserIcon className="w-4 h-4" /> Full Name
                    </Label>
                    <Input 
                      value={isEditingProfile ? profileForm.full_name : user?.full_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                      disabled={!isEditingProfile}
                      className={cn("font-medium", !isEditingProfile && "bg-slate-50 border-slate-100")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-500 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Phone Number
                    </Label>
                    <Input 
                      value={isEditingProfile ? profileForm.phone : user?.phone || 'Not provided'}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditingProfile}
                      className={cn("font-medium", !isEditingProfile && "bg-slate-50 border-slate-100")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-500 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Role
                    </Label>
                    <Input value={user?.role} disabled className="bg-slate-50 border-slate-100 font-medium capitalize" />
                  </div>
                </div>

                {isEditingProfile && (
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" onClick={() => setIsEditingProfile(false)} disabled={updatingProfile}>{t.adminTabs?.common?.cancel || "Cancel"}</Button>
                    <Button onClick={handleUpdateProfile} disabled={updatingProfile} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">
                      {updatingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      {t.adminTabs?.settings?.updateProfile || "Update Profile"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats/Actions */}
            <div className="space-y-6">
              <Card className="border-none shadow-lg bg-white ring-1 ring-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Account Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-none shadow-none">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-none shadow-none">Verified</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-red-50 ring-1 ring-red-100">
                <CardContent className="p-6">
                  <h4 className="font-bold text-red-900 mb-2">Danger Zone</h4>
                  <p className="text-xs text-red-700 mb-4">Logout will terminate your current active session on this device.</p>
                  <Button 
                    variant="destructive" 
                    onClick={logout}
                    className="w-full rounded-xl font-bold gap-2 shadow-lg shadow-red-500/10"
                  >
                    <LogOut className="w-4 h-4" /> {t.adminTabs?.settings?.signOut || "Sign Out"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-200">
              <div className="h-2 w-full bg-indigo-600" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>{t.adminTabs?.settings?.changePassword || "Change Password"}</CardTitle>
                    <CardDescription>{t.adminTabs?.settings?.changePasswordDescription || "Update your login credentials."}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passwordErrors.general && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                      <AlertCircle className="w-4 h-4" />
                      {passwordErrors.general}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input 
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="rounded-xl h-11 pr-10"
                      />
                      <button 
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input 
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="rounded-xl h-11 pr-10"
                      />
                      <button 
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input 
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className={cn("rounded-xl h-11 pr-10", passwordErrors.confirmPassword && "border-red-500")}
                      />
                      <button 
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={changingPassword}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-bold mt-4"
                  >
                    {changingPassword ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    {t.adminTabs?.settings?.updatePassword || "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-200">
              <div className="h-2 w-full bg-slate-800" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-800">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Extra layer of security.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 mb-4 w-full">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900">2FA Coming Soon</h3>
                  <p className="text-slate-500 text-sm mt-2">
                    We are currently implementing multi-factor authentication to ensure your admin account remains bulletproof.
                  </p>
                </div>
                <Button variant="outline" className="w-full rounded-xl h-12" disabled>
                  Enable 2FA (Beta)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeSection === 'payouts' && (
        <div className="animate-in fade-in duration-300">
          <PayoutMethodsAdmin />
        </div>
      )}
    </div>
  );
};

// Helper for classNames
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
