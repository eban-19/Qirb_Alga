import React, { useEffect, useState } from 'react';
import { Building, Briefcase, FileCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import apiService from '../../services/api';
import { toast } from 'sonner';

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
  bankSettings,
  setBankSettings,
  isUpdating,
  setIsUpdating,
  showSuccess
}) => {
  const [banks, setBanks] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchBanksAndProfile = async () => {
      try {
        const banksResponse = await apiService.getBanks();
        if (banksResponse.success) {
          setBanks(banksResponse.data);
        }

        const profileResponse = await apiService.getProfile();
        if (profileResponse.success && profileResponse.data?.ownerProfile) {
          const profile = profileResponse.data.ownerProfile;
          if (profile.bank_id || profile.chapa_subaccount_id) {
            setBankSettings({
              bankId: profile.bank_id || '',
              bankName: profile.bank_name || '',
              accountName: profile.account_name || '',
              accountNumber: profile.account_number || '',
              chapaSubaccountId: profile.chapa_subaccount_id || ''
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchBanksAndProfile();
  }, [setBankSettings]);

  const handleBankChange = (value: string) => {
    const selectedBank = banks.find(b => b.id === value);
    setBankSettings({
      ...bankSettings,
      bankId: value,
      bankName: selectedBank?.name || ''
    });
  };

  const handleSaveBankSettings = async () => {
    if (!bankSettings.bankId || !bankSettings.accountName || !bankSettings.accountNumber) {
      toast.error('Please fill in all bank details');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await apiService.createSubaccount({
        bank_id: bankSettings.bankId,
        bank_name: bankSettings.bankName,
        account_name: bankSettings.accountName,
        account_number: bankSettings.accountNumber
      });

      if (response.success) {
        setBankSettings({
          ...bankSettings,
          chapaSubaccountId: response.data.chapa_subaccount_id
        });
        toast.success(response.message);
        showSuccess();
      } else {
        toast.error(response.message || 'Failed to save bank settings');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving bank settings');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold mb-2">Payout Settings</h2>
          <p className="text-muted-foreground text-lg">Manage where you receive your booking payments.</p>
        </div>
      </div>

      {bankSettings.chapaSubaccountId && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-4 text-emerald-800">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <div>
            <h4 className="font-bold text-lg">Sub-Account Active</h4>
            <p className="text-sm">Your Chapa sub-account is properly configured. You will automatically receive payouts for new bookings minus the platform service fee.</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
          <CardDescription>Enter the bank account where your booking revenue will be deposited.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Select 
              value={bankSettings.bankId} 
              onValueChange={handleBankChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map(bank => (
                  <SelectItem key={bank.id} value={bank.id}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input
                placeholder="e.g. Abebe Bikila"
                value={bankSettings.accountName}
                onChange={(e) => setBankSettings({ ...bankSettings, accountName: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Must exactly match the name registered at your bank.</p>
            </div>
            
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                placeholder="e.g. 1000123456789"
                value={bankSettings.accountNumber}
                onChange={(e) => setBankSettings({ ...bankSettings, accountNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={handleSaveBankSettings} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Bank Details'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
