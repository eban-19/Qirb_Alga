import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus, Edit, Trash2, Gift, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

export const PromotionsSection: React.FC = () => {
  const { token } = useAuth();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pensions, setPensions] = useState<any[]>([]);
  const [packagesForPension, setPackagesForPension] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    promo_id: '',
    pension_id: '',
    package_id: '',        // '' = applies to all packages
    type: 'EARLY_BIRD',
    name: '',
    description: '',
    discount_percent: '',
    min_days: '',
    max_days: '',
    is_active: true
  });

  // ─── Fetch promotions ───────────────────────────────────────────────────────
  const fetchPromotions = async () => {
    try {
      const res = await fetch('http://localhost:3006/api/promotions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPromotions(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch owner's pensions ─────────────────────────────────────────────────
  const fetchPensions = async () => {
    try {
      const res = await fetch('http://localhost:3006/api/pensions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const normalized = data.data.map((p: any) => ({
          ...p,
          pension_id: p.pension_id ?? p.id
        }));
        setPensions(normalized);
        if (normalized.length > 0) {
          setFormData(prev => ({ ...prev, pension_id: String(normalized[0].pension_id) }));
        }
      }
    } catch (e) {
      console.error('Failed to fetch pensions:', e);
    }
  };

  // ─── Load packages when pension_id changes in form ──────────────────────────
  const fetchPackagesForPension = async (pensionId: string) => {
    if (!pensionId) { setPackagesForPension([]); return; }
    try {
      const res = await fetch(`http://localhost:3006/api/packages/pensions/${pensionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPackagesForPension(data.data);
      } else {
        setPackagesForPension([]);
      }
    } catch (e) {
      console.error('Failed to fetch packages:', e);
      setPackagesForPension([]);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchPensions();
  }, [token]);

  // Re-fetch packages whenever the selected pension changes
  useEffect(() => {
    if (formData.pension_id) {
      fetchPackagesForPension(formData.pension_id);
      // Reset package selection when pension changes
      setFormData(prev => ({ ...prev, package_id: '' }));
    }
  }, [formData.pension_id]);

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing
      ? `http://localhost:3006/api/promotions/${formData.promo_id}`
      : 'http://localhost:3006/api/promotions';

    const payload = {
      ...formData,
      package_id: formData.package_id || null   // send null when "All packages"
    };

    try {
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        fetchPromotions();
        setShowModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    try {
      const res = await fetch(`http://localhost:3006/api/promotions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if ((await res.json()).success) fetchPromotions();
    } catch (e) { console.error(e); }
  };

  // ─── Edit ────────────────────────────────────────────────────────────────────
  const handleEdit = async (promo: any) => {
    const pensionId = String(promo.pension_id);
    setFormData({
      promo_id: promo.promo_id,
      pension_id: pensionId,
      package_id: promo.package_id ? String(promo.package_id) : '',
      type: promo.type,
      name: promo.name,
      description: promo.description || '',
      discount_percent: promo.discount_percent.toString(),
      min_days: promo.min_days?.toString() || '',
      max_days: promo.max_days?.toString() || '',
      is_active: promo.is_active
    });
    await fetchPackagesForPension(pensionId);
    setIsEditing(true);
    setShowModal(true);
  };

  // ─── Add New ─────────────────────────────────────────────────────────────────
  const handleAddNew = () => {
    const firstPensionId = pensions.length > 0 ? String(pensions[0].pension_id) : '';
    setFormData({
      promo_id: '',
      pension_id: firstPensionId,
      package_id: '',
      type: 'EARLY_BIRD',
      name: '',
      description: '',
      discount_percent: '',
      min_days: '',
      max_days: '',
      is_active: true
    });
    setIsEditing(false);
    setShowModal(true);
  };

  // ─── Toggle Active ────────────────────────────────────────────────────────────
  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`http://localhost:3006/api/promotions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) fetchPromotions();
    } catch (e) { console.error(e); }
  };

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4 mb-6 mr-3 sm:mr-0">
        <p className="text-muted-foreground hidden sm:block">Manage dynamic discounts and special offers for your properties.</p>
        <div className="flex-1 sm:flex-none" />
        <Button onClick={handleAddNew} className="w-full sm:w-auto gap-1.5 sm:gap-2 bg-orange-600 hover:bg-orange-700 shadow-lg h-10 sm:h-11 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm shrink-0 items-center justify-center">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Add Promotion
        </Button>
      </div>

      {/* Promotion Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-muted-foreground col-span-full">Loading promotions...</p>
        ) : promotions.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Gift className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No Promotions Yet</h3>
            <p className="text-slate-500 mb-6">Create an Early Bird or Long Stay deal to attract more customers!</p>
            <Button onClick={handleAddNew}>Create First Promotion</Button>
          </div>
        ) : (
          promotions.map((promo) => (
            <div key={promo.promo_id} className={`p-6 rounded-3xl border-2 transition-all shadow-sm ${promo.is_active ? 'bg-white border-orange-200' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{promo.name}</h3>
                    <p className="text-sm font-medium text-slate-500">{promo.pension?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(promo)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(promo.promo_id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase">{promo.type.replace(/_/g, ' ')}</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">{promo.discount_percent}% OFF</span>
                {promo.max_days && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">Max: {promo.max_days} days</span>}
              </div>

              {/* Package scope and min stay badge on the same line */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {promo.package ? (
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                      {promo.package.name} only
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      All packages
                    </span>
                  )}
                </div>

                {promo.min_days && (
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                    Min: {promo.min_days} {promo.type === 'LONG_STAY' ? 'nights' : 'days'}
                  </span>
                )}
              </div>

              <p className="text-slate-600 text-sm line-clamp-2 mb-4">{promo.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-sm font-semibold text-slate-600">Status</span>
                <Button
                  variant={promo.is_active ? "default" : "outline"}
                  size="sm"
                  className={promo.is_active ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => toggleActive(promo.promo_id, promo.is_active)}
                >
                  {promo.is_active ? 'Active' : 'Inactive'}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Promotion' : 'Create New Promotion'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">

            {/* Property */}
            <div className="space-y-2">
              <Label>Property</Label>
              <select
                className={selectClass}
                value={formData.pension_id}
                onChange={e => setFormData({ ...formData, pension_id: e.target.value })}
                required
              >
                {pensions.length === 0
                  ? <option value="">Loading properties...</option>
                  : pensions.map(p => (
                    <option key={p.pension_id} value={p.pension_id}>{p.name}</option>
                  ))
                }
              </select>
            </div>

            {/* Package Scope */}
            <div className="space-y-2">
              <Label>Apply To</Label>
              <select
                className={selectClass}
                value={formData.package_id}
                onChange={e => setFormData({ ...formData, package_id: e.target.value })}
              >
                <option value="">All Packages</option>
                {packagesForPension.map(pkg => (
                  <option key={pkg.package_id} value={pkg.package_id}>{pkg.name}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {formData.package_id
                  ? 'This discount will only apply to the selected package.'
                  : 'This discount will apply to every package in this property.'}
              </p>
            </div>

            {/* Type + Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Promotion Type</Label>
                <select
                  className={selectClass}
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="EARLY_BIRD">Early Bird (Advance)</option>
                  <option value="LONG_STAY">Long Stay</option>
                  <option value="LAST_MINUTE">Last Minute</option>
                  <option value="SEASONAL">Seasonal</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input type="number" min="1" max="100" required value={formData.discount_percent}
                  onChange={e => setFormData({ ...formData, discount_percent: e.target.value })} />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label>Promotion Name</Label>
              <Input required placeholder="e.g. Summer Early Bird" value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description (shown to customers)</Label>
              <Input required placeholder="e.g. Book 30 days ahead to save 15%!" value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>

            {/* Day rule */}
            <div className="border-t pt-4 space-y-3">
              {formData.type === 'LAST_MINUTE' ? (
                <div className="space-y-2">
                  <Label>Must book within how many days of check-in?</Label>
                  <Input type="number" min="1" placeholder="e.g. 2" required value={formData.max_days}
                    onChange={e => setFormData({ ...formData, max_days: e.target.value })} />
                </div>
              ) : formData.type !== 'SEASONAL' ? (
                <div className="space-y-2">
                  <Label>{formData.type === 'LONG_STAY' ? 'Minimum nights stay' : 'Minimum days in advance'}</Label>
                  <Input type="number" min="1" placeholder={formData.type === 'LONG_STAY' ? 'e.g. 5' : 'e.g. 30'} required
                    value={formData.min_days} onChange={e => setFormData({ ...formData, min_days: e.target.value })} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" value={formData.min_days} onChange={e => setFormData({ ...formData, min_days: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" value={formData.max_days} onChange={e => setFormData({ ...formData, max_days: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold">
              {isEditing ? 'Save Changes' : 'Create Promotion'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
