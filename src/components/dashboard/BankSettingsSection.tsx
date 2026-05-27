import React, { useEffect, useState } from 'react';
import { Building, CheckCircle2, Plus, Trash2, Check, AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import apiService from '../../services/api';
import { toast } from 'sonner';
import { useLanguage } from '../../hooks/use-language';

interface PayoutSettingsSectionProps {
  isUpdating: boolean;
  setIsUpdating: (updating: boolean) => void;
  showSuccess: () => void;
}

export const BankSettingsSection: React.FC<PayoutSettingsSectionProps> = ({
  isUpdating,
  setIsUpdating,
  showSuccess
}) => {
  const { t } = useLanguage();
  const [methods, setMethods] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [accountDetails, setAccountDetails] = useState<Record<string, any>>({});

  const fetchPayoutData = async () => {
    try {
      setLoading(true);
      // Fetch dynamic active methods
      const methodsRes = await apiService.request('/payout-methods/owner/methods/active');
      if (methodsRes.success) {
        setMethods(methodsRes.methods);
      }

      // Fetch owner's configured accounts
      const accountsRes = await apiService.request('/payout-methods/owner/accounts');
      if (accountsRes.success) {
        setAccounts(accountsRes.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch payout settings data:', error);
      toast.error('Failed to load payout settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const handleMethodChange = (value: string) => {
    setSelectedMethodId(value);
    setAccountDetails({});
  };

  const handleDetailChange = (key: string, value: string) => {
    setAccountDetails(prev => ({ ...prev, [key]: value }));
  };

  const handleAddAccount = async () => {
    const method = methods.find(m => m.id.toString() === selectedMethodId);
    if (!method) return toast.error('Please select a payout method');

    // Validate required fields
    for (const field of method.fields) {
      if (field.is_required && !accountDetails[field.name]) {
        return toast.error(`Please fill in: ${field.label}`);
      }
    }

    setIsUpdating(true);
    try {
      const response = await apiService.request('/payout-methods/owner/accounts', {
        method: 'POST',
        body: JSON.stringify({
          payout_method_id: method.id,
          account_details: accountDetails
        })
      });

      if (response.success) {
        toast.success('Payout account added successfully!');
        setSelectedMethodId('');
        setAccountDetails({});
        setShowAddForm(false);
        fetchPayoutData();
        showSuccess();
      } else {
        toast.error(response.message || 'Failed to add payout account');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error adding payout account');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleActivateAccount = async (id: number) => {
    setIsUpdating(true);
    try {
      const response = await apiService.request(`/payout-methods/owner/accounts/${id}/active`, {
        method: 'PUT'
      });
      if (response.success) {
        toast.success('Primary payout destination updated!');
        fetchPayoutData();
      } else {
        toast.error(response.message || 'Failed to activate account');
      }
    } catch (error: any) {
      toast.error('Error activating account');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm('Are you sure you want to delete this payout account?')) return;
    
    setIsUpdating(true);
    try {
      const response = await apiService.request(`/payout-methods/owner/accounts/${id}`, {
        method: 'DELETE'
      });
      if (response.success) {
        toast.success('Payout account removed');
        fetchPayoutData();
      } else {
        toast.error(response.message || 'Failed to delete account');
      }
    } catch (error: any) {
      toast.error('Error deleting account');
    } finally {
      setIsUpdating(false);
    }
  };

  const activeAccount = accounts.find(acc => acc.is_active);
  const selectedMethod = methods.find(m => m.id.toString() === selectedMethodId);

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-heading font-black tracking-tight mb-1">{t.dashboard?.payoutSettings || "Payout Settings"}</h2>
          <p className="text-muted-foreground text-base">Manage your registered payout methods and primary destination.</p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800">
            <Plus className="h-4 w-4" /> Add Payout Account
          </Button>
        )}
      </div>

      {activeAccount && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-4 text-emerald-900 shadow-sm transition-all duration-300">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-base leading-tight">Active Split Payment Account</h4>
            <p className="text-sm text-emerald-700 mt-1">
              Your primary payout destination is set to <strong className="font-semibold text-emerald-900">{activeAccount.payout_method?.name}</strong>.
              All booking transactions will automatically be split, delivering your revenue minus the admin commission to this account.
            </p>
          </div>
        </div>
      )}

      {!activeAccount && accounts.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4 text-amber-900 shadow-sm transition-all duration-300">
          <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-base leading-tight">No Active Payout Account Selected</h4>
            <p className="text-sm text-amber-700 mt-1">
              Please choose an active account below to ensure your booking revenues split correctly.
            </p>
          </div>
        </div>
      )}

      {showAddForm && (
        <Card className="border border-slate-100 shadow-xl overflow-hidden rounded-2xl animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6">
            <CardTitle className="text-lg font-black text-slate-800">Add New Payout Account</CardTitle>
            <CardDescription className="text-xs">Configure your payout channel for split payments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 px-6 pb-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Payout Method</Label>
              <Select 
                value={selectedMethodId} 
                onValueChange={handleMethodChange}
              >
                <SelectTrigger className="rounded-xl border-slate-200 h-11">
                  <SelectValue placeholder="Select Method (e.g. CBE, Telebirr)" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {methods.map(method => (
                    <SelectItem key={method.id} value={method.id.toString()} className="rounded-lg">
                      {method.name} ({method.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMethod && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedMethod.fields?.map((field: any) => (
                  <div key={field.name} className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {field.label} {field.is_required && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      type={field.type === 'number' ? 'number' : 'text'}
                      className="rounded-xl border-slate-200 h-11"
                      placeholder={`Enter ${field.label}`}
                      value={accountDetails[field.name] || ''}
                      onChange={(e) => handleDetailChange(field.name, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3">
              <Button 
                variant="outline"
                onClick={() => setShowAddForm(false)} 
                disabled={isUpdating}
                className="rounded-xl font-bold h-11 px-5 border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddAccount} 
                disabled={isUpdating}
                className="rounded-xl bg-slate-900 text-white font-bold h-11 px-6 hover:bg-slate-800"
              >
                {isUpdating ? 'Saving...' : 'Register Account'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payout Accounts List */}
      <Card className="border border-slate-100 shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-slate-50">
          <CardTitle className="text-lg font-bold text-slate-800">Saved Payout Accounts</CardTitle>
          <CardDescription className="text-xs">Manage payout channels for split booking payments.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <Building className="h-12 w-12 text-slate-300 mb-3" />
              <p className="font-bold text-slate-700 text-base">No Accounts Configured</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">Please register a payout account to set up automatic payment splitting.</p>
              <Button onClick={() => setShowAddForm(true)} variant="outline" className="mt-4 rounded-xl border-slate-200 font-bold hover:bg-slate-50">
                Register First Account
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {accounts.map((account) => (
                <div key={account.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors duration-150 hover:bg-slate-50/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl text-slate-600 shrink-0">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-base">{account.payout_method?.name}</h4>
                        {account.is_active && (
                          <span className="inline-flex items-center gap-1 py-0.5 px-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-full ring-1 ring-emerald-200">
                            <Check className="h-3 w-3" /> Primary Payout
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-slate-700 mt-2 space-y-1">
                        {Object.entries(account.account_details || {}).map(([key, value]) => {
                          const field = account.payout_method?.fields?.find((f: any) => f.name === key);
                          return (
                            <p key={key} className="text-xs"><span className="text-slate-400 mr-2">{field?.label || key}:</span> {String(value)}</p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {!account.is_active && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleActivateAccount(account.id)}
                        disabled={isUpdating}
                        className="rounded-xl text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-100 h-9"
                      >
                        Set Active
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleDeleteAccount(account.id)}
                      disabled={isUpdating}
                      className="rounded-xl border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-100 h-9 w-9 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
