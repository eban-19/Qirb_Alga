import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, RefreshCcw, Percent, CreditCard, Info } from "lucide-react";
import { toast } from "sonner";
import apiService from "@/services/api";

export const SystemSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

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

  const handleInputChange = (key: string, value: string) => {
    setEditValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiService.updateSystemSettings(editValues);
      if (response.success) {
        toast.success("Settings updated successfully");
        fetchSettings();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings");
    } finally {
      setSaving(false);
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Configuration</h2>
          <p className="text-slate-500">Manage global financial parameters and system constants.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchSettings} 
          disabled={loading}
          className="gap-2"
        >
          <RefreshCcw className={loading ? "animate-spin w-4 h-4" : "w-4 h-4"} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* VAT Setting */}
        <Card className="border-none shadow-lg bg-white overflow-hidden ring-1 ring-slate-200">
          <div className="h-2 w-full bg-blue-500" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>VAT Percentage</CardTitle>
                <CardDescription>Value Added Tax applied to all bookings</CardDescription>
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
                  className="pl-10 h-12 text-lg font-bold"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-sm text-slate-600 leading-relaxed">
                This percentage will be added to the base price of every room booking. The default in Ethiopia is 15%.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service Fee Setting */}
        <Card className="border-none shadow-lg bg-white overflow-hidden ring-1 ring-slate-200">
          <div className="h-2 w-full bg-emerald-500" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Service Fee Percentage</CardTitle>
                <CardDescription>Platform processing fee for bookings</CardDescription>
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
                  className="pl-10 h-12 text-lg font-bold"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3">
              <Info className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-sm text-slate-600 leading-relaxed">
                This fee covers platform maintenance and transaction processing. It is added to the customer's total.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-blue-500/20 gap-2 transition-all"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save System Configuration
        </Button>
      </div>
    </div>
  );
};
