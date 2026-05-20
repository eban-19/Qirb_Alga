import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { 
  FileText, 
  Shield, 
  ShieldCheck, 
  RefreshCcw, 
  CheckCircle, 
  CreditCard, 
  DollarSign, 
  Target, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Package, 
  Star, 
  Edit2, 
  TrashIcon, 
  Plus
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface SettingsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  propertySettings: any;
  setPropertySettings: (settings: any) => void;
  complianceSettings: any;
  securitySettings: any;
  setSecuritySettings: (settings: any) => void;
  showSaveSuccess: boolean;
  isUpdating: boolean;
  pensions: any[];
  packages: any[];
  handleSavePropertySettings: () => void;
  handleSaveComplianceSettings: () => void;
  handleSaveSecuritySettings: () => void;
  handleToggleTwoFactor: () => void;
  handleToggleMostPopular: (id: string) => void;
  handleEditPackage: (pkg: any) => void;
  handleDeletePackage: (id: string) => void;
  setShowAddPackageModal: (show: boolean) => void;
  setEditingPackage: (pkg: any) => void;
  setNewPackage: (pkg: any) => void;
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({
  activeTab,
  setActiveTab,
  propertySettings,
  setPropertySettings,
  complianceSettings,
  securitySettings,
  setSecuritySettings,
  showSaveSuccess,
  isUpdating,
  pensions,
  packages,
  handleSavePropertySettings,
  handleSaveComplianceSettings,
  handleSaveSecuritySettings,
  handleToggleTwoFactor,
  handleToggleMostPopular,
  handleEditPackage,
  handleDeletePackage,
  setShowAddPackageModal,
  setEditingPackage,
  setNewPackage
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 capitalize">
            {activeTab === "settings-billing" ? (t.dashboard?.billingSettings || "Billing Settings") :
             activeTab === "settings-pension" ? (t.dashboard?.pensionProfile || "Pension Profile") :
             (t.dashboard?.securitySettings || "Security Settings")}
          </h2>
          <p className="text-slate-500 text-sm">{t.dashboard?.settingsDescription || "Configure your property and account preferences."}</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-slate-100">

          <Button
            variant="ghost"
            size="sm"
            className={`h-8 rounded-lg text-xs font-bold ${activeTab === 'settings-billing' ? 'bg-blue-600 text-white hover:bg-blue-600 shadow-sm' : 'text-slate-500'}`}
            onClick={() => setActiveTab('settings-billing')}
          >
            {t.dashboard?.billing || "Billing"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 rounded-lg text-xs font-bold ${activeTab === 'settings-pension' ? 'bg-purple-600 text-white hover:bg-purple-600 shadow-sm' : 'text-slate-500'}`}
            onClick={() => setActiveTab('settings-pension')}
          >
            {t.dashboard?.pensionProfile || "Pension Profile"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 rounded-lg text-xs font-bold ${activeTab === 'settings-security' ? 'bg-slate-900 text-white hover:bg-slate-900 shadow-sm' : 'text-slate-500'}`}
            onClick={() => setActiveTab('settings-security')}
          >
            {t.dashboard?.security || "Security"}
          </Button>
        </div>
      </div>

      {showSaveSuccess && (
        <div className="group p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12">
            <CheckCircle className="h-5 w-5" />
          </div>
          <span className="font-semibold text-sm relative">{t.dashboard?.settingsSavedSuccess || "Settings saved successfully!"}</span>
        </div>
      )}

      <Tabs value={activeTab} className="w-full">
        <TabsContent value="settings-billing" className="mt-0">
          <Card className="group border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden ring-1 ring-slate-100 hover:scale-[1.01]">
            <div className="h-2 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400" />
            <CardHeader className="pb-4">
              <CardTitle className="lg:text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-lg hover:shadow-blue-500/25">
                  <CreditCard className="h-6 w-6" />
                </div>
                <span>{t.dashboard?.billingPayments || "Billing & Payments"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="group border border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500 uppercase">{t.dashboard?.currentPlan || "Current Plan"}</p>
                      </div>
                      <Badge className="bg-blue-500 text-[10px]">Premium</Badge>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">ETB 2,999/month</h4>
                    <div className="pt-2">
                      <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                        <Target className="h-4 w-4 mr-2" />
                        {t.dashboard?.upgradePlan || "Upgrade Plan"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group border border-slate-200 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-emerald-600" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500 uppercase">{t.dashboard?.paymentMethod || "Payment Method"}</p>
                      </div>
                      <Badge className="bg-emerald-500 text-[10px]">{t.dashboard?.active || "Active"}</Badge>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">••••• •••• •••• •••• ••••</h4>
                    <div className="pt-2">
                      <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-emerald-500/25 transition-all duration-300">
                        <Edit2 className="h-4 w-4 mr-2" />
                        {t.dashboard?.updatePaymentMethod || "Update Payment Method"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings-pension" className="mt-0">
          <Card className="group border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden ring-1 ring-slate-100 hover:scale-[1.01] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="h-2 w-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500" />
            <CardHeader className="pb-4 relative">
              <CardTitle className="lg:text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-purple-500/25">
                  <Building className="h-6 w-6 text-purple-600 group-hover:rotate-12 transition-transform duration-500" />
                </div>
                <span className="group-hover:text-purple-600 transition-colors duration-300">{t.dashboard?.publicPensionProfile || "Public Pension Profile"}</span>
              </CardTitle>
              <p className="text-slate-600">{t.dashboard?.publicPensionProfileDescription || "Manage how your pension appears to customers on the public site"}</p>
            </CardHeader>
            <CardContent className="space-y-6 pt-4 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Building className="h-4 w-4 text-purple-600" />
                    {t.dashboard?.pensionName || "Pension Name"}
                  </Label>
                  <Input
                    value={propertySettings.name}
                    onChange={(e) => setPropertySettings({ ...propertySettings, name: e.target.value })}
                    placeholder="e.g., Sunshine Pension"
                    className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    {t.dashboard?.location || "Location"}
                  </Label>
                  <Input
                    value={propertySettings.address}
                    onChange={(e) => setPropertySettings({ ...propertySettings, address: e.target.value })}
                    placeholder="e.g., Bole, Addis Ababa, Ethiopia"
                    className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-purple-600" />
                    {t.dashboard?.contactPhone || "Contact Phone"}
                  </Label>
                  <Input
                    value={propertySettings.phone}
                    onChange={(e) => setPropertySettings({ ...propertySettings, phone: e.target.value })}
                    placeholder="+251 911 234 567"
                    className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-600" />
                    {t.dashboard?.contactEmail || "Contact Email"}
                  </Label>
                  <Input
                    value={propertySettings.email}
                    onChange={(e) => setPropertySettings({ ...propertySettings, email: e.target.value })}
                    placeholder="info@sunshinepension.com"
                    className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  {t.dashboard?.aboutDescription || "About Description"}
                </Label>
                <textarea
                  value={propertySettings.description}
                  onChange={(e) => setPropertySettings({ ...propertySettings, description: e.target.value })}
                  placeholder={t.dashboard?.describePensionPlaceholder || "Describe your pension for customers..."}
                  rows={4}
                  className="w-full border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 rounded-lg px-3 py-2 transition-all duration-300 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-600" />
                  {t.dashboard?.packageTiers || "Package Tiers"}
                </Label>
                <div className="space-y-4">
                  {packages.map((pkg) => (
                    <div key={pkg.id || pkg.package_id} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:border-purple-300 transition-all duration-300">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-purple-700">{pkg.name_ml?.en || pkg.name}</h4>
                          {pkg.isMostPopular && (
                            <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">{t.dashboard?.mostPopular || "Most Popular"}</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{pkg.description_ml?.en || pkg.description}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-purple-600">ETB {pkg.price.toLocaleString()}/{t.dashboard?.perNight || "night"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleMostPopular(pkg.id)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            pkg.isMostPopular ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Star className={`h-4 w-4 ${pkg.isMostPopular ? 'fill-current' : ''}`} />
                        </button>
                        <button onClick={() => handleEditPackage(pkg)} className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeletePackage(pkg.id)} className="p-2 rounded-lg bg-red-100 text-red-600">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setEditingPackage(null);
                      setNewPackage({ name: '', price: '', description: '', services: ['WiFi', 'Clean Room'], availableRooms: 1, isMostPopular: false, image: '' });
                      setShowAddPackageModal(true);
                    }}
                    className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="font-semibold">{t.dashboard?.addNewPackage || "Add New Package"}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end pt-6 border-t">
                <Button className="h-11 px-8 bg-purple-600 hover:bg-purple-700 text-white shadow-xl hover:shadow-purple-500/25 rounded-xl font-bold transition-all duration-300 hover:scale-105" onClick={handleSavePropertySettings} disabled={isUpdating}>
                  {isUpdating ? (t.dashboard?.updating || 'Updating...') : (t.dashboard?.updatePublicProfile || 'Update Public Profile')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings-security" className="mt-0">
          <Card className="group border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden ring-1 ring-slate-100 hover:scale-[1.01]">
            <div className="h-2 w-full bg-gradient-to-r from-slate-400 via-slate-500 to-slate-400" />
            <CardHeader className="pb-4">
              <CardTitle className="lg:text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shadow-lg">
                  <Shield className="h-6 w-6" />
                </div>
                <span>{t.dashboard?.securitySettings || "Security Settings"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">{t.dashboard?.currentPassword || "Current Password"}</Label>
                  <Input
                    type="password"
                    value={securitySettings.currentPassword}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">{t.dashboard?.newPassword || "New Password"}</Label>
                  <Input
                    type="password"
                    value={securitySettings.newPassword}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end pt-6 border-t">
                <Button className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white shadow-xl rounded-xl font-bold" onClick={handleSaveSecuritySettings}>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {t.dashboard?.updateSecuritySettings || "Update Security Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsTabs;
