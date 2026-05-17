import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Tabs, TabsContent } from '../ui/tabs';
import { 
  Building, 
  Shield, 
  ShieldCheck, 
  AlertCircle, 
  Save,
  Zap
} from 'lucide-react';
import { BankSettingsSection } from './BankSettingsSection';

interface SettingsSectionProps {
  activeTab: string;
  businessProfile: any;
  setBusinessProfile: (profile: any) => void;
  bankSettings?: any;
  setBankSettings?: (settings: any) => void;
  securitySettings: any;
  setSecuritySettings: (settings: any) => void;
  approvalStatus: string;
  isUpdating: boolean;
  setIsUpdating?: (updating: boolean) => void;
  onSaveBusinessProfile: () => void;
  onSaveSecuritySettings: () => void;
  onToggleTwoFactor: () => void;
  showSaveSuccess: boolean;
  subscriptionStatus?: any;
  onUpgradeClick?: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  activeTab,
  businessProfile,
  setBusinessProfile,
  bankSettings,
  setBankSettings,
  securitySettings,
  setSecuritySettings,
  approvalStatus,
  isUpdating,
  setIsUpdating,
  onSaveBusinessProfile,
  onSaveSecuritySettings,
  onToggleTwoFactor,
  showSaveSuccess,
  subscriptionStatus,
  onUpgradeClick
}) => {
  const sub = subscriptionStatus?.subscription;
  const isPro = subscriptionStatus?.hasActiveSubscription;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 capitalize">
          {activeTab === "settings-business-profile" ? "Business Profile Settings" : "Security Settings"}
        </h2>
        <p className="text-slate-500 text-sm">Configure your property and account preferences.</p>
      </div>

      {showSaveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3 shadow-sm">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-semibold text-sm">Settings saved successfully!</span>
        </div>
      )}

      <Tabs value={activeTab} className="w-full">
        <TabsContent value="settings-business-profile" className="mt-0">
          <Card className="border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
            <div className="h-2 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400" />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Building className="h-6 w-6" />
                  </div>
                  <span>Business Profile</span>
                </CardTitle>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  approvalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {approvalStatus === 'Approved' ? '✓ Approved' : '⏳ Pending Review'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Business Name</Label>
                  <Input
                    value={businessProfile.businessName}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, businessName: e.target.value })}
                    placeholder="Enter your business name"
                    className="h-11 border-slate-200 bg-slate-50/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Business Email</Label>
                  <Input
                    type="email"
                    value={businessProfile.businessEmail}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, businessEmail: e.target.value })}
                    placeholder="business@example.com"
                    className="h-11 border-slate-200 bg-slate-50/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Business Phone</Label>
                  <Input
                    value={businessProfile.businessPhone}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, businessPhone: e.target.value })}
                    placeholder="+251 ..."
                    className="h-11 border-slate-200 bg-slate-50/30"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={onSaveBusinessProfile} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  {isUpdating ? 'Updating...' : 'Update Business Profile'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
            <div className="h-2 w-full bg-gradient-to-r from-purple-400 via-blue-500 to-purple-400" />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <span>Subscription Management</span>
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onUpgradeClick}
                  className="rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 font-bold gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Upgrade
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Plan</p>
                  <p className="text-xl font-black text-slate-900">{sub?.plan?.name || (subscriptionStatus?.trial?.isActive ? 'Free Trial' : 'No Active Plan')}</p>
                </div>
                {isPro && (
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expires On</p>
                    <p className="text-sm font-bold text-slate-900">{new Date(sub.end_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings-bank-settings" className="mt-0">
          <BankSettingsSection 
            bankSettings={bankSettings}
            setBankSettings={setBankSettings}
            isUpdating={isUpdating}
            setIsUpdating={setIsUpdating}
            showSuccess={() => {}}
          />
        </TabsContent>

        <TabsContent value="settings-security" className="mt-0">
          <Card className="border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
            <div className="h-2 w-full bg-gradient-to-r from-slate-400 via-slate-500 to-slate-400" />
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                  <Shield className="h-6 w-6" />
                </div>
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Current Password</Label>
                  <Input
                    type="password"
                    value={securitySettings.currentPassword}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
                    className="h-11 border-slate-200 bg-slate-50/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">New Password</Label>
                  <Input
                    type="password"
                    value={securitySettings.newPassword}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                    className="h-11 border-slate-200 bg-slate-50/30"
                  />
                </div>
              </div>
              <div className="p-6 rounded-2xl border-2 border-dashed border-red-100 bg-red-50/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h4 className="font-bold text-red-900">Two-Factor Authentication (2FA)</h4>
                    <p className="text-xs text-red-700/80">Add an extra layer of security to your account</p>
                  </div>
                  <Button
                    variant={securitySettings.twoFactorEnabled ? "default" : "outline"}
                    className={`h-11 px-8 rounded-xl font-black ${securitySettings.twoFactorEnabled ? "bg-red-600 text-white" : "border-red-200 text-red-700"}`}
                    onClick={onToggleTwoFactor}
                  >
                    {securitySettings.twoFactorEnabled ? "Disable" : "Enable"} 2FA
                  </Button>
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t">
                <Button onClick={onSaveSecuritySettings} disabled={!securitySettings.currentPassword || !securitySettings.newPassword} className="bg-slate-900 text-white px-8">
                  Update Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
