import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Info, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import apiService from '../../../services/api';

interface PolicyBuilderProps {
  onBack: () => void;
  onSaved: () => void;
  pensionId: number;
}

export const PolicyBuilder: React.FC<PolicyBuilderProps> = ({ onBack, onSaved, pensionId }) => {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'SEASONAL',
    description: '',
    room_id: '',
    package_id: '',
    start_date: '',
    end_date: '',
    min_nights: '',
    max_nights: '',
    min_guests: '',
    max_guests: '',
    adjustment_type: 'PERCENTAGE',
    adjustment_value: '',
    priority: '0',
    rules: {} as any
  });

  useEffect(() => {
    // Fetch rooms and packages to populate dropdowns
    const fetchDropdowns = async () => {
      try {
        const [roomsRes, pkgsRes] = await Promise.all([
          apiService.request(`/rooms/pension/${pensionId}?limit=100`),
          apiService.request(`/packages/pensions/${pensionId}`)
        ]);
        if (roomsRes.success && roomsRes.data) setRooms(roomsRes.data.items || []);
        if (pkgsRes.success) setPackages(pkgsRes.data || []);
      } catch (err) {
        console.error('Error fetching dropdowns:', err);
      }
    };
    fetchDropdowns();
  }, [pensionId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRuleChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      rules: { ...prev.rules, [key]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Manual Validation
    if (!formData.adjustment_value || isNaN(parseFloat(formData.adjustment_value))) {
      alert("Please provide a valid numeric value for Price Adjustment.");
      return;
    }
    
    if ((formData.category === 'LONG_STAY' || formData.category === 'MINIMUM_STAY') && !formData.min_nights) {
      alert("Please specify the Minimum Nights required for this policy.");
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        pension_id: pensionId,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        room_id: formData.room_id ? parseInt(formData.room_id) : null,
        package_id: formData.package_id ? parseInt(formData.package_id) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        min_nights: formData.min_nights ? parseInt(formData.min_nights) : null,
        max_nights: formData.max_nights ? parseInt(formData.max_nights) : null,
        min_guests: formData.min_guests ? parseInt(formData.min_guests) : null,
        max_guests: formData.max_guests ? parseInt(formData.max_guests) : null,
        adjustment_type: formData.adjustment_type,
        adjustment_value: formData.adjustment_value ? parseFloat(formData.adjustment_value) : null,
        priority: parseInt(formData.priority),
        rules: formData.rules,
        is_active: true
      };

      const res = await apiService.request('/pricing-policies', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        onSaved();
      } else {
        alert(res.message || 'Failed to save policy');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('An error occurred while saving the policy.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 bg-white border border-slate-200 hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Create Pricing Policy</h2>
          <p className="text-slate-500">Define automated rules to adjust your prices dynamically.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Policy Name <span className="text-red-500">*</span></Label>
              <Input 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="e.g., Summer Peak Season" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Category <span className="text-red-500">*</span></Label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleInputChange}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="SEASONAL">Seasonal</option>
                <option value="WEEKEND">Weekend Rate</option>
                <option value="MINIMUM_STAY">Minimum Stay</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Briefly describe what this policy does..." 
                rows={2} 
              />
            </div>
          </div>
        </div>

        {/* Triggers & Conditions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Triggers & Conditions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Target Room/Package */}
            <div className="space-y-2">
              <Label>Apply to Specific Room (Optional)</Label>
              <select 
                name="room_id" 
                value={formData.room_id} 
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Rooms</option>
                {rooms.map(r => (
                  <option key={r.room_id} value={r.room_id}>Room {r.room_number} ({r.room_type})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Apply to Specific Package (Optional)</Label>
              <select 
                name="package_id" 
                value={formData.package_id} 
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Packages</option>
                {packages.map(p => (
                  <option key={p.package_id} value={p.package_id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            {(formData.category === 'SEASONAL' || formData.category === 'WEEKEND') && (
              <>
                <div className="space-y-2">
                  <Label>Start Date (Optional)</Label>
                  <Input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} />
                </div>
              </>
            )}

            {/* Weekend Rules */}
            {formData.category === 'WEEKEND' && (
              <div className="space-y-2 md:col-span-2 bg-purple-50 p-4 rounded-lg border border-purple-100">
                <Label className="text-purple-900">Which days are considered weekends?</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {[
                    { val: 5, label: 'Friday' },
                    { val: 6, label: 'Saturday' },
                    { val: 0, label: 'Sunday' }
                  ].map(day => (
                    <label key={day.val} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={(formData.rules.days || [5, 6]).includes(day.val)}
                        onChange={(e) => {
                          const current = formData.rules.days || [5, 6];
                          if (e.target.checked) {
                            handleRuleChange('days', [...current, day.val]);
                          } else {
                            handleRuleChange('days', current.filter((d: number) => d !== day.val));
                          }
                        }}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Duration Rules */}
            {(formData.category === 'MINIMUM_STAY') && (
              <>
                <div className="space-y-2">
                  <Label>Minimum Nights <span className="text-red-500">*</span></Label>
                  <Input type="number" min="1" name="min_nights" value={formData.min_nights} onChange={handleInputChange} placeholder="e.g., 3" required={(formData.category === 'MINIMUM_STAY')} />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Nights (Optional)</Label>
                  <Input type="number" min="1" name="max_nights" value={formData.max_nights} onChange={handleInputChange} placeholder="e.g., 30" />
                </div>
              </>
            )}


            
          </div>
        </div>

        {/* Pricing Adjustments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Price Adjustments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <Label>Adjustment Type <span className="text-red-500">*</span></Label>
              <select 
                name="adjustment_type" 
                value={formData.adjustment_type} 
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (+/- ETB)</option>
                <option value="OVERRIDE">Override (Set absolute price)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Value <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input 
                  type="number" 
                  step="0.01"
                  name="adjustment_value" 
                  value={formData.adjustment_value} 
                  onChange={handleInputChange} 
                  placeholder={formData.adjustment_type === 'PERCENTAGE' ? "e.g., -10 for 10% discount" : "e.g., 500"} 
                  required 
                />
                <span className="absolute right-3 top-2 text-slate-400 font-medium text-sm">
                  {formData.adjustment_type === 'PERCENTAGE' ? '%' : 'ETB'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Use negative numbers for discounts.</p>
            </div>

            <div className="space-y-2">
              <Label>Priority (Higher executes first)</Label>
              <Input type="number" name="priority" value={formData.priority} onChange={handleInputChange} />
              <p className="text-xs text-slate-500 mt-1">If policies conflict, the highest priority wins.</p>
            </div>
            
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Policy'}
          </Button>
        </div>
      </form>
    </div>
  );
};
