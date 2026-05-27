import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, AlertCircle, Calendar, Users, Moon, CreditCard, Clock, Baby, Bed, Filter } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Badge } from '../../ui/badge';
import apiService from '../../../services/api';
import { PolicyBuilder } from './PolicyBuilder';

interface PricingPolicy {
  policy_id: number;
  name: string;
  category: string;
  description: string | null;
  min_nights: number | null;
  max_nights: number | null;
  min_guests: number | null;
  max_guests: number | null;
  adjustment_type: string | null;
  adjustment_value: string | number | null;
  is_active: boolean;
  priority: number;
}

export const PricingPoliciesSection: React.FC<{ pensionId: number }> = ({ pensionId }) => {
  const [policies, setPolicies] = useState<PricingPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await apiService.request('/pricing-policies');
      if (res.success) {
        setPolicies(res.policies);
      }
    } catch (error) {
      console.error('Failed to fetch pricing policies', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    try {
      const res = await apiService.request(`/pricing-policies/${id}`, { method: 'DELETE' });
      if (res.success) {
        setPolicies(prev => prev.filter(p => p.policy_id !== id));
      }
    } catch (error) {
      console.error('Failed to delete policy', error);
    }
  };

  const toggleActive = async (policy: PricingPolicy) => {
    try {
      const res = await apiService.request(`/pricing-policies/${policy.policy_id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !policy.is_active })
      });
      if (res.success) {
        setPolicies(prev => prev.map(p => p.policy_id === policy.policy_id ? { ...p, is_active: !p.is_active } : p));
      }
    } catch (error) {
      console.error('Failed to toggle active status', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SEASONAL': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'WEEKEND': return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'OCCUPANCY': return <Users className="w-4 h-4 text-green-500" />;
      case 'LONG_STAY': return <Moon className="w-4 h-4 text-indigo-500" />;
      case 'MINIMUM_STAY': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'CANCELLATION':
      case 'REFUND': return <CreditCard className="w-4 h-4 text-red-500" />;
      case 'CHILD': return <Baby className="w-4 h-4 text-pink-500" />;
      case 'EXTRA_BED': return <Bed className="w-4 h-4 text-teal-500" />;
      default: return <Filter className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatAdjustment = (type: string | null, value: string | number | null) => {
    if (!type || value === null) return 'No Adjustment';
    const num = Number(value);
    const prefix = num > 0 ? '+' : '';
    if (type === 'PERCENTAGE') return `${prefix}${num}%`;
    if (type === 'FIXED_AMOUNT') return `${prefix}${num} ETB`;
    if (type === 'OVERRIDE') return `${num} ETB (Fixed Rate)`;
    return value.toString();
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading pricing policies...</div>;
  }

  if (isCreating) {
    return (
      <PolicyBuilder 
        pensionId={pensionId} 
        onBack={() => setIsCreating(false)} 
        onSaved={() => {
          setIsCreating(false);
          fetchPolicies();
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pricing Policies</h2>
          <p className="text-slate-500">Manage dynamic pricing, weekend rates, and occupancy rules.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Policy
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Pricing Policies Found</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              You haven't set up any dynamic pricing rules yet. Create rules to automatically adjust prices for weekends, seasons, or extra guests.
            </p>
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create First Policy
            </Button>
          </div>
        ) : (
          policies.map(policy => (
            <Card key={policy.policy_id} className={`transition-all duration-200 border-2 ${policy.is_active ? 'border-primary/20 shadow-md shadow-primary/5' : 'border-slate-100 opacity-75'}`}>
              <CardHeader className="pb-3 relative">
                <div className="absolute top-4 right-4 flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(policy.policy_id)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    {getCategoryIcon(policy.category)}
                  </div>
                  <Badge variant={policy.is_active ? 'default' : 'secondary'} className={policy.is_active ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}>
                    {getCategoryLabel(policy.category)}
                  </Badge>
                  {!policy.is_active && <Badge variant="outline" className="text-slate-500 border-slate-200">Inactive</Badge>}
                </div>
                <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1">{policy.name}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-[40px] text-xs">
                  {policy.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 mb-4">
                  <div className="text-sm font-medium text-slate-700 flex justify-between items-center">
                    <span>Price Adjustment</span>
                    <span className={`font-bold ${Number(policy.adjustment_value) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatAdjustment(policy.adjustment_type, policy.adjustment_value)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={policy.is_active ? "outline" : "default"} 
                    className={`w-full gap-2 ${policy.is_active ? 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300' : ''}`}
                    onClick={() => toggleActive(policy)}
                  >
                    {policy.is_active ? (
                      <><XCircle className="w-4 h-4" /> Deactivate</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4" /> Activate</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
