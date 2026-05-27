import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, Clock, ShieldAlert, ShieldX, Database, CheckSquare } from 'lucide-react';
import { useLanguage } from '../../hooks/use-language';

const AVAILABLE_FEATURES = [
  { id: 'add_room', label: 'Add/Edit Rooms' },
  { id: 'add_package', label: 'Add/Edit Packages' },
  { id: 'add_staff', label: 'Manage Staff' },
  { id: 'reports', label: 'View Reports' },
  { id: 'promotions', label: 'Manage Promotions' },
  { id: 'pricing', label: 'Manage Pricing Policies' },
  { id: 'settings', label: 'Change Property Settings' }
];

export const SubscriptionPoliciesTab = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [policy, setPolicy] = useState({
    trial_enabled: true,
    trial_duration_days: 14,
    grace_period_days: 0,
    warning_days_before: '7, 3, 1',
    soft_restriction_days: 0,
    hard_restriction_days: 7,
    data_retention_days: 90,
    restricted_features: [] as string[]
  });

  useEffect(() => {
    fetchGlobalPolicy();
  }, []);

  const fetchGlobalPolicy = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3006/api/admin/subscription-policies/global', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        setPolicy({
          trial_enabled: data.data.trial_enabled,
          trial_duration_days: data.data.trial_duration_days,
          grace_period_days: data.data.grace_period_days,
          warning_days_before: Array.isArray(data.data.warning_days_before) 
            ? data.data.warning_days_before.join(', ') 
            : '7, 3, 1',
          soft_restriction_days: data.data.soft_restriction_days,
          hard_restriction_days: data.data.hard_restriction_days,
          data_retention_days: data.data.data_retention_days,
          restricted_features: Array.isArray(data.data.restricted_features)
            ? data.data.restricted_features
            : []
        });
      }
    } catch (err) {
      console.error('Error fetching global policy:', err);
      setError('Failed to load global subscription policy.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Parse warning days
      const warningDaysArray = policy.warning_days_before
        .split(',')
        .map(s => parseInt(s.trim()))
        .filter(n => !isNaN(n))
        .sort((a, b) => b - a);

      const payload = {
        ...policy,
        warning_days_before: JSON.stringify(warningDaysArray),
        restricted_features: JSON.stringify(policy.restricted_features)
      };

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3006/api/admin/subscription-policies/global', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage('Global subscription policy updated successfully.');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.message || 'Failed to update policy.');
      }
    } catch (err) {
      console.error('Error saving global policy:', err);
      setError('An error occurred while saving the policy.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPolicy(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-heading">Global Subscription Policies</h2>
          <p className="text-muted-foreground mt-1">Configure trials, expirations, and restrictions across the platform.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-5 h-5" />
          )}
          Save Policies
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-200 flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
            <div className="w-2 h-2 bg-green-600 rounded-full" />
          </div>
          <p>{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trial Settings */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Clock className="w-6 h-6" />
            <h3 className="text-lg font-bold">Free Trial Configuration</h3>
          </div>
          
          <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-xl hover:bg-muted/50 transition-colors">
            <input
              type="checkbox"
              name="trial_enabled"
              checked={policy.trial_enabled}
              onChange={handleInputChange}
              className="w-5 h-5 rounded text-primary focus:ring-primary border-input"
            />
            <div>
              <div className="font-semibold">Enable Free Trial</div>
              <div className="text-sm text-muted-foreground">Allow new owners to test the platform before paying.</div>
            </div>
          </label>

          {policy.trial_enabled && (
            <div>
              <label className="block text-sm font-semibold mb-2">Trial Duration (Days)</label>
              <input
                type="number"
                name="trial_duration_days"
                value={policy.trial_duration_days}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border rounded-xl bg-background"
              />
              <p className="text-xs text-muted-foreground mt-2">Number of days the free trial lasts before requiring a subscription.</p>
            </div>
          )}
        </div>

        {/* Expiration & Grace Period */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-4 text-amber-500">
            <ShieldAlert className="w-6 h-6" />
            <h3 className="text-lg font-bold">Expiration & Warnings</h3>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Grace Period (Days)</label>
            <input
              type="number"
              name="grace_period_days"
              value={policy.grace_period_days}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-2 border rounded-xl bg-background"
            />
            <p className="text-xs text-muted-foreground mt-2">Extra days allowed after expiration before applying restrictions.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Warning Schedule (Days Before)</label>
            <input
              type="text"
              name="warning_days_before"
              value={policy.warning_days_before}
              onChange={handleInputChange}
              placeholder="7, 3, 1"
              className="w-full px-4 py-2 border rounded-xl bg-background"
            />
            <p className="text-xs text-muted-foreground mt-2">Comma-separated list of days before expiration to send warnings.</p>
          </div>
        </div>

        {/* Restrictions & Suspensions */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-4 text-red-500">
            <ShieldX className="w-6 h-6" />
            <h3 className="text-lg font-bold">Restrictions & Suspension</h3>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Soft Restriction (Days After Grace Period)</label>
            <input
              type="number"
              name="soft_restriction_days"
              value={policy.soft_restriction_days}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-2 border rounded-xl bg-background"
            />
            <p className="text-xs text-muted-foreground mt-2">Days before disabling certain features (e.g., new bookings).</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Hard Suspension (Days After Soft Restriction)</label>
            <input
              type="number"
              name="hard_restriction_days"
              value={policy.hard_restriction_days}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-2 border rounded-xl bg-background"
            />
            <p className="text-xs text-muted-foreground mt-2">Days before completely blocking dashboard access.</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-3">Restricted Features</label>
            <p className="text-xs text-muted-foreground mb-4">Select the features that should be disabled when an account is softly restricted.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_FEATURES.map((feature) => (
                <label 
                  key={feature.id} 
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                    policy.restricted_features.includes(feature.id)
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : 'hover:bg-muted/50 border-border'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={policy.restricted_features.includes(feature.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPolicy(prev => ({
                          ...prev,
                          restricted_features: [...prev.restricted_features, feature.id]
                        }));
                      } else {
                        setPolicy(prev => ({
                          ...prev,
                          restricted_features: prev.restricted_features.filter(id => id !== feature.id)
                        }));
                      }
                    }}
                    className="w-5 h-5 rounded text-red-600 focus:ring-red-500 border-input"
                  />
                  <span className="font-medium text-sm">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-4 text-indigo-500">
            <Database className="w-6 h-6" />
            <h3 className="text-lg font-bold">Data Retention</h3>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Data Retention (Days After Suspension)</label>
            <input
              type="number"
              name="data_retention_days"
              value={policy.data_retention_days}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-2 border rounded-xl bg-background"
            />
            <p className="text-xs text-muted-foreground mt-2">Days to keep data after hard suspension before archiving/deleting.</p>
          </div>
          
          <div className="p-4 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200 text-sm">
            <p><strong>Note:</strong> Data deletion runs via automated background jobs. Ensure you give owners sufficient time to export their data before permanent deletion.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
