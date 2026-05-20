import React, { useEffect, useState } from 'react';
import { Building, CheckCircle2, Plus, Trash2, Check, AlertCircle, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import apiService from '../../services/api';
import { toast } from 'sonner';
import { useLanguage } from '../../hooks/use-language';

interface BankSettingsSectionProps {
  bankSettings: {
    bankId: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    chapaSubaccountId: string;
  };
  setBankSettings: (settings: any) => void;
  isUpdating: boolean;
  setIsUpdating: (updating: boolean) => void;
  showSuccess: () => void;
}

export const BankSettingsSection: React.FC<BankSettingsSectionProps> = ({
  isUpdating,
  setIsUpdating,
  showSuccess
}) => {
  const { t } = useLanguage();
  const [banks, setBanks] = useState<{ id: string; name: string }[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New account form state
  const [newAccount, setNewAccount] = useState({
    bankId: '',
    bankName: '',
    accountName: '',
    accountNumber: ''
  });

  const fetchBanksAndAccounts = async () => {
    try {
      // 1. Fetch live banks from Chapa via backend
      const banksResponse = await apiService.getBanks();
      if (banksResponse.success) {
        setBanks(banksResponse.data);
      }

      // 2. Fetch owner's saved bank accounts
      const accountsResponse = await apiService.getBankAccounts();
      if (accountsResponse.success) {
        setAccounts(accountsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch bank accounts data:', error);
      toast.error(t.dashboard?.failedLoadBankSettings || 'Failed to load bank settings');
    }
  };

  useEffect(() => {
    fetchBanksAndAccounts();
  }, []);

  const handleBankChange = (value: string) => {
    const selectedBank = banks.find(b => b.id === value);
    setNewAccount(prev => ({
      ...prev,
      bankId: value,
      bankName: selectedBank?.name || ''
    }));
  };

  const handleAddAccount = async () => {
    if (!newAccount.bankId || !newAccount.accountName || !newAccount.accountNumber) {
      toast.error(t.dashboard?.fillAllBankDetails || 'Please fill in all bank details');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await apiService.addBankAccount({
        bank_id: newAccount.bankId,
        bank_name: newAccount.bankName,
        account_name: newAccount.accountName,
        account_number: newAccount.accountNumber
      });

      if (response.success) {
        toast.success(response.message || 'Bank account added successfully!');
        setNewAccount({ bankId: '', bankName: '', accountName: '', accountNumber: '' });
        setShowAddForm(false);
        fetchBanksAndAccounts();
        showSuccess();
      } else {
        toast.error(response.message || 'Failed to add bank account');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error adding bank account');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleActivateAccount = async (id: number) => {
    setIsUpdating(true);
    try {
      const response = await apiService.activateBankAccount(id);
      if (response.success) {
        toast.success(response.message || 'Payout destination updated!');
        fetchBanksAndAccounts();
      } else {
        toast.error(response.message || 'Failed to activate account');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error activating bank account');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm(t.dashboard?.deleteBankAccountConfirm || 'Are you sure you want to delete this bank account?')) return;
    
    setIsUpdating(true);
    try {
      const response = await apiService.deleteBankAccount(id);
      if (response.success) {
        toast.success(response.message || 'Bank account removed');
        fetchBanksAndAccounts();
      } else {
        toast.error(response.message || 'Failed to delete account');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting bank account');
    } finally {
      setIsUpdating(false);
    }
  };

  const activeAccount = accounts.find(acc => acc.is_active);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-heading font-black tracking-tight mb-1">{t.dashboard?.payoutSettings || "Payout Settings"}</h2>
          <p className="text-muted-foreground text-base">{t.dashboard?.payoutSettingsDesc || "Manage your registered bank accounts and primary payout options."}</p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800">
            <Plus className="h-4 w-4" /> {t.dashboard?.addBankAccount || "Add Bank Account"}
          </Button>
        )}
      </div>

      {activeAccount && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-4 text-emerald-900 shadow-sm transition-all duration-300">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-base leading-tight">{t.dashboard?.activeSplitAccount || "Active Split Payment Account"}</h4>
            <p className="text-sm text-emerald-700 mt-1">
              {t.dashboard?.payoutDestinationSet || "Your primary payout destination is set to"} <strong className="font-semibold text-emerald-900">{activeAccount.bank_name} ({activeAccount.account_number})</strong>.
              {t.dashboard?.payoutSplitNotice || "All booking transactions will automatically be split, delivering your revenue minus the admin commission to this account."}
            </p>
          </div>
        </div>
      )}

      {!activeAccount && accounts.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4 text-amber-900 shadow-sm transition-all duration-300">
          <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-base leading-tight">{t.dashboard?.noActivePayoutSelected || "No Active Payout Account Selected"}</h4>
            <p className="text-sm text-amber-700 mt-1">
              {t.dashboard?.payoutChooseNotice || "Please choose an active account below to ensure your booking revenues split correctly."}
            </p>
          </div>
        </div>
      )}

      {showAddForm && (
        <Card className="border border-slate-100 shadow-xl overflow-hidden rounded-2xl animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6">
            <CardTitle className="text-lg font-black text-slate-800">{t.dashboard?.addNewPayoutAccount || "Add New Payout Account"}</CardTitle>
            <CardDescription className="text-xs">{t.dashboard?.payoutConfigDesc || "Configure your CBE or Telebirr account for split payments."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 px-6 pb-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.dashboard?.bankChannelName || "Bank / Channel Name"}</Label>
              <Select 
                value={newAccount.bankId} 
                onValueChange={handleBankChange}
              >
                <SelectTrigger className="rounded-xl border-slate-200 h-11">
                  <SelectValue placeholder={t.dashboard?.selectBankWallet || "Select Bank or Wallet"} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {banks.map(bank => (
                    <SelectItem key={bank.id} value={bank.id} className="rounded-lg">
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.dashboard?.accountName || "Account Name"}</Label>
                <Input
                  className="rounded-xl border-slate-200 h-11"
                  placeholder="e.g. Abebe Bikila"
                  value={newAccount.accountName}
                  onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground">{t.dashboard?.accountNameNotice || "Must exactly match the name registered at your bank."}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.dashboard?.accountPhoneNumber || "Account / Phone Number"}</Label>
                <Input
                  className="rounded-xl border-slate-200 h-11"
                  placeholder="e.g. 1000123456789"
                  value={newAccount.accountNumber}
                  onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button 
                variant="outline"
                onClick={() => setShowAddForm(false)} 
                disabled={isUpdating}
                className="rounded-xl font-bold h-11 px-5 border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                {t.dashboard?.cancel || "Cancel"}
              </Button>
              <Button 
                onClick={handleAddAccount} 
                disabled={isUpdating}
                className="rounded-xl bg-slate-900 text-white font-bold h-11 px-6 hover:bg-slate-800"
              >
                {isUpdating ? (t.dashboard?.saving || 'Saving...') : (t.dashboard?.registerAccount || 'Register Account')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank Accounts List */}
      <Card className="border border-slate-100 shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-slate-50">
          <CardTitle className="text-lg font-bold text-slate-800">{t.dashboard?.savedPayoutAccounts || "Saved Payout Accounts"}</CardTitle>
          <CardDescription className="text-xs">{t.dashboard?.managePayoutDesc || "Manage payout channels for split booking payments."}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <Building className="h-12 w-12 text-slate-300 mb-3" />
              <p className="font-bold text-slate-700 text-base">{t.dashboard?.noBankAccountsConfigured || "No Bank Accounts Configured"}</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">{t.dashboard?.payoutRegisterNotice || "Please register a payout account (CBE or Telebirr) to set up automatic payment splitting."}</p>
              <Button onClick={() => setShowAddForm(true)} variant="outline" className="mt-4 rounded-xl border-slate-200 font-bold hover:bg-slate-50">
                {t.dashboard?.registerFirstAccount || "Register First Account"}
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {accounts.map((account) => (
                <div key={account.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-150 hover:bg-slate-50/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl text-slate-600 shrink-0">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-base">{account.bank_name}</h4>
                        {account.is_active && (
                          <span className="inline-flex items-center gap-1 py-0.5 px-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-full ring-1 ring-emerald-200">
                            <Check className="h-3 w-3" /> {t.dashboard?.primaryPayout || "Primary Payout"}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mt-1">{account.account_name}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{account.account_number}</p>
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
                        {t.dashboard?.setActive || "Set Active"}
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
