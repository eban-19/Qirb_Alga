import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus, Edit, Trash2, Gift, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useLanguage } from '../../hooks/use-language';

export const PromotionsSection: React.FC = () => {
  const { token } = useAuth();
  const { t } = useLanguage();
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
    if (!confirm(t.dashboard?.confirmDeletePromotion || 'Are you sure you want to delete this promotion?')) return;
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
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{t.dashboard?.promotionsHeaderDescription || "Manage dynamic discounts and special offers for your properties."}</p>
        <Button onClick={handleAddNew} className="gap-2 bg-orange-600 hover:bg-orange-700 shadow-lg h-11 px-6 rounded-xl font-bold">
          <Plus className="w-5 h-5" /> {t.dashboard?.addPromotion || "Add Promotion"}
        </Button>
      </div>

      {/* Promotion Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-muted-foreground col-span-full">{t.dashboard?.loadingPromotions || "Loading promotions..."}</p>
        ) : promotions.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Gift className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">{t.dashboard?.noPromotionsYet || "No Promotions Yet"}</h3>
            <p className="text-slate-500 mb-6">{t.dashboard?.noPromotionsDescription || "Create an Early Bird or Long Stay deal to attract more customers!"}</p>
            <Button onClick={handleAddNew}>{t.dashboard?.createFirstPromotion || "Create First Promotion"}</Button>
          </div>
        ) : (
          promotions.map((promo) => (
            <div key={promo.promo_id} className={`p-6 rounded-3xl border-2 transition-all shadow-sm ${promo.is_active ? 'bg-white border-orange-200' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${promo.is_active ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-500'}`}>
                    <Gift className="w-6 h-6" />
                  </div>
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
                {promo.min_days && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">{promo.type === 'LONG_STAY' ? `${t.dashboard?.minNightsStay || 'Min'}: ${promo.min_days} ${t.dashboard?.nights || 'nights'}` : `${t.dashboard?.minDaysInAdvance || 'Min'}: ${promo.min_days} ${t.dashboard?.days || 'days'}`}</span>}
                {promo.max_days && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">{t.dashboard?.maxDays || "Max"}: {promo.max_days} {t.dashboard?.days || "days"}</span>}
              </div>

              {/* Package scope badge */}
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                {promo.package ? (
                  <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                    {promo.package.name} {t.dashboard?.only || "only"}
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {t.dashboard?.allPackages || "All packages"}
                  </span>
                )}
              </div>

              <p className="text-slate-600 text-sm line-clamp-2 mb-4">{promo.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-sm font-semibold text-slate-600">{t.dashboard?.status || "Status"}</span>
                <Button
                  variant={promo.is_active ? "default" : "outline"}
                  size="sm"
                  className={promo.is_active ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => toggleActive(promo.promo_id, promo.is_active)}
                >
                  {promo.is_active ? (t.dashboard?.active || 'Active') : (t.dashboard?.inactive || 'Inactive')}
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
            <DialogTitle>{isEditing ? (t.dashboard?.editPromotion || 'Edit Promotion') : (t.dashboard?.createNewPromotion || 'Create New Promotion')}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">

            {/* Property */}
            <div className="space-y-2">
              <Label>{t.dashboard?.property || "Property"}</Label>
              <select
                className={selectClass}
                value={formData.pension_id}
                onChange={e => setFormData({ ...formData, pension_id: e.target.value })}
                required
              >
                {pensions.length === 0
                  ? <option value="">{t.dashboard?.loadingProperties || "Loading properties..."}</option>
                  : pensions.map(p => (
                    <option key={p.pension_id} value={p.pension_id}>{p.name}</option>
                  ))
                }
              </select>
            </div>

            {/* Package Scope */}
            <div className="space-y-2">
              <Label>{t.dashboard?.applyTo || "Apply To"}</Label>
              <select
                className={selectClass}
                value={formData.package_id}
                onChange={e => setFormData({ ...formData, package_id: e.target.value })}
              >
                <option value="">{t.dashboard?.allPackages || "All Packages"}</option>
                {packagesForPension.map(pkg => (
                  <option key={pkg.package_id} value={pkg.package_id}>{pkg.name}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {formData.package_id
                  ? (t.dashboard?.applyToPackageSelected || 'This discount will only apply to the selected package.')
                  : (t.dashboard?.applyToAllPackages || 'This discount will apply to every package in this property.')}
              </p>
            </div>

            {/* Type + Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.dashboard?.promotionType || "Promotion Type"}</Label>
                <select
                  className={selectClass}
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="EARLY_BIRD">{t.dashboard?.promoEarlyBird || "Early Bird (Advance)"}</option>
                  <option value="LONG_STAY">{t.dashboard?.promoLongStay || "Long Stay"}</option>
                  <option value="LAST_MINUTE">{t.dashboard?.promoLastMinute || "Last Minute"}</option>
                  <option value="SEASONAL">{t.dashboard?.promoSeasonal || "Seasonal"}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t.dashboard?.discountPercent || "Discount (%)"}</Label>
                <Input type="number" min="1" max="100" required value={formData.discount_percent}
                  onChange={e => setFormData({ ...formData, discount_percent: e.target.value })} />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label>{t.dashboard?.promotionName || "Promotion Name"}</Label>
              <Input required placeholder={t.dashboard?.promoNamePlaceholder || "e.g. Summer Early Bird"} value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>{t.dashboard?.promotionDescriptionLabel || "Description (shown to customers)"}</Label>
              <Input required placeholder={t.dashboard?.promoDescPlaceholder || "e.g. Book 30 days ahead to save 15%!"} value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>

            {/* Day rule */}
            <div className="border-t pt-4 space-y-3">
              {formData.type === 'LAST_MINUTE' ? (
                <div className="space-y-2">
                  <Label>{t.dashboard?.lastMinuteRuleLabel || "Must book within how many days of check-in?"}</Label>
                  <Input type="number" min="1" placeholder={t.dashboard?.egDaysPlaceholder || "e.g. 2"} required value={formData.max_days}
                    onChange={e => setFormData({ ...formData, max_days: e.target.value })} />
                </div>
              ) : formData.type !== 'SEASONAL' ? (
                <div className="space-y-2">
                  <Label>{formData.type === 'LONG_STAY' ? (t.dashboard?.minNightsStay || 'Minimum nights stay') : (t.dashboard?.minDaysInAdvance || 'Minimum days in advance')}</Label>
                  <Input type="number" min="1" placeholder={formData.type === 'LONG_STAY' ? (t.dashboard?.egNightsPlaceholder || 'e.g. 5') : (t.dashboard?.egDaysAdvancePlaceholder || 'e.g. 30')} required
                    value={formData.min_days} onChange={e => setFormData({ ...formData, min_days: e.target.value })} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.dashboard?.startDate || "Start Date"}</Label>
                    <Input type="date" value={formData.min_days} onChange={e => setFormData({ ...formData, min_days: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.dashboard?.endDate || "End Date"}</Label>
                    <Input type="date" value={formData.max_days} onChange={e => setFormData({ ...formData, max_days: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold">
              {isEditing ? (t.dashboard?.saveChanges || 'Save Changes') : (t.dashboard?.createPromotion || 'Create Promotion')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
