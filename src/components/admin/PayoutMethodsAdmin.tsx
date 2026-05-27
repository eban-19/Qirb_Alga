import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import apiService from "@/services/api";

interface PayoutMethodField {
  id?: number;
  name: string;
  label: string;
  type: string;
  is_required: boolean;
}

interface PayoutMethod {
  id: number;
  name: string;
  type: string;
  provider_code: string;
  is_active: boolean;
  fields: PayoutMethodField[];
}

export const PayoutMethodsAdmin = () => {
  const [methods, setMethods] = useState<PayoutMethod[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [currentMethod, setCurrentMethod] = useState<Partial<PayoutMethod>>({
    name: '',
    type: 'bank',
    provider_code: '',
    is_active: true,
    fields: []
  });

  const fetchMethodsAndProviders = async () => {
    try {
      setLoading(true);
      const [res, providersRes] = await Promise.all([
        apiService.request('/payout-methods/admin'),
        apiService.request('/payout-methods/admin/chapa-providers')
      ]);

      if (res.success) {
        setMethods(res.methods);
      }
      if (providersRes.success) {
        setProviders(providersRes.providers);
      }
    } catch (error: any) {
      toast.error('Failed to fetch payout methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethodsAndProviders();
  }, []);

  const handleEdit = (method: PayoutMethod) => {
    setCurrentMethod({ ...method });
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentMethod({
      name: '',
      type: 'bank',
      provider_code: '',
      is_active: true,
      fields: []
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentMethod.name || !currentMethod.provider_code) {
      return toast.error('Name and provider code are required');
    }
    
    try {
      setSaving(true);
      let res;
      if (currentMethod.id) {
        res = await apiService.request(`/payout-methods/admin/${currentMethod.id}`, {
          method: 'PUT',
          body: JSON.stringify(currentMethod)
        });
      } else {
        res = await apiService.request('/payout-methods/admin', {
          method: 'POST',
          body: JSON.stringify(currentMethod)
        });
      }
      
      if (res.success) {
        toast.success('Payout method saved successfully');
        setIsEditing(false);
        fetchMethodsAndProviders();
      } else {
        toast.error(res.message || 'Failed to save');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error saving payout method');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this payout method?')) return;
    try {
      const res = await apiService.request(`/payout-methods/admin/${id}`, { method: 'DELETE' });
      if (res.success) {
        toast.success('Deleted successfully');
        fetchMethodsAndProviders();
      }
    } catch (error: any) {
      toast.error('Error deleting method');
    }
  };

  const addField = () => {
    setCurrentMethod(prev => ({
      ...prev,
      fields: [...(prev.fields || []), { name: '', label: '', type: 'text', is_required: true }]
    }));
  };

  const updateField = (index: number, key: keyof PayoutMethodField, value: any) => {
    const newFields = [...(currentMethod.fields || [])];
    newFields[index] = { ...newFields[index], [key]: value };
    setCurrentMethod(prev => ({ ...prev, fields: newFields }));
  };

  const removeField = (index: number) => {
    const newFields = [...(currentMethod.fields || [])];
    newFields.splice(index, 1);
    setCurrentMethod(prev => ({ ...prev, fields: newFields }));
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <Card className="border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Supported Payout Methods</CardTitle>
              <CardDescription>Manage dynamic banks, wallets, and mobile money providers.</CardDescription>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" /> Add New Method
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {methods.length === 0 ? (
                <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-xl">No payout methods configured.</div>
              ) : (
                methods.map(method => (
                  <div key={method.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        {method.name}
                        {!method.is_active && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">Inactive</span>}
                      </h4>
                      <div className="text-sm text-slate-500 mt-1 flex gap-4">
                        <span>Type: <span className="capitalize font-medium">{method.type}</span></span>
                        <span>Provider Code: <span className="font-medium">{method.provider_code}</span></span>
                        <span>Fields: {method.fields.length}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(method)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(method.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle>{currentMethod.id ? 'Edit' : 'Create'} Payout Method</CardTitle>
            <CardDescription>Configure provider details and dynamic input fields.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider (Chapa Integration)</Label>
                <Select value={currentMethod.provider_code} onValueChange={(val) => {
                  const selected = providers.find(p => p.id === val);
                  if (selected) {
                    let type = 'bank';
                    const nameLower = selected.name.toLowerCase();
                    if (nameLower.includes('telebirr') || nameLower.includes('cbe birr') || nameLower.includes('mpesa') || nameLower.includes('wallet')) {
                      type = 'mobile_money';
                    }
                    
                    setCurrentMethod(prev => ({ 
                      ...prev, 
                      provider_code: val,
                      name: selected.name,
                      type
                    }));
                  }
                }}>
                  <SelectTrigger><SelectValue placeholder="Select a Supported Provider" /></SelectTrigger>
                  <SelectContent>
                    {providers.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Display Name (Visible to Owners)</Label>
                <Input 
                  value={currentMethod.name} 
                  onChange={(e) => setCurrentMethod(prev => ({ ...prev, name: e.target.value }))} 
                  placeholder="e.g. Commercial Bank of Ethiopia" 
                />
              </div>

              <div className="space-y-2">
                <Label>Method Category</Label>
                <Select value={currentMethod.type} onValueChange={(val) => setCurrentMethod(prev => ({ ...prev, type: val }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money / Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex flex-col justify-center pt-6">
                <div className="flex items-center space-x-2">
                  <Switch checked={currentMethod.is_active} onCheckedChange={(val) => setCurrentMethod(prev => ({ ...prev, is_active: val }))} id="active-status" />
                  <Label htmlFor="active-status">Active (Visible to Owners)</Label>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">Dynamic Form Fields</h3>
                <Button size="sm" variant="outline" onClick={addField}>
                  <Plus className="w-4 h-4 mr-2" /> Add Field
                </Button>
              </div>
              
              <div className="space-y-4">
                {currentMethod.fields?.map((field, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs">Field Key (camelCase, e.g., accountNumber)</Label>
                          <Input value={field.name} onChange={(e) => updateField(idx, 'name', e.target.value)} placeholder="accountNumber" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Display Label</Label>
                          <Input value={field.label} onChange={(e) => updateField(idx, 'label', e.target.value)} placeholder="Account Number" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Input Type</Label>
                          <Select value={field.type} onValueChange={(val) => updateField(idx, 'type', val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1 flex items-center pt-6">
                          <div className="flex items-center space-x-2">
                            <Switch checked={field.is_required} onCheckedChange={(val) => updateField(idx, 'is_required', val)} />
                            <Label className="text-xs">Required Field</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 mt-6" onClick={() => removeField(idx)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {currentMethod.fields?.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    Add fields that the owner needs to fill out (e.g., Account Name, Account Number).
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Method
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
