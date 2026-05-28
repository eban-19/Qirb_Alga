import React, { useState, useEffect } from 'react';
import { Save, Calendar as CalendarIcon, Clock, ShieldAlert, UserPlus, Ban } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import apiService from '../../../services/api';
import { BlackoutCalendar } from './BlackoutCalendar';

interface BookingPoliciesModuleProps {
  pensionId: string | number;
}

export const BookingPoliciesModule: React.FC<BookingPoliciesModuleProps> = ({ pensionId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'blackout'>('rules');

  const [policy, setPolicy] = useState({
    booking_window_start: '',
    booking_window_end: '',
    max_advance_days: '',
    min_advance_hours: '',
    allow_same_day: true,
    same_day_cutoff: '',
    min_stay_nights: '',
    max_stay_nights: '',
    check_in_start_time: '',
    check_in_end_time: '',
    check_out_time: '',
    cancellation_type: 'FREE',
    free_cancellation_hours: '',
    cancellation_penalty_percent: '',
    instant_booking: true,
    allow_children: true,
    allow_pets: false,
    allow_smoking: false,
    is_active: true
  });

  useEffect(() => {
    fetchPolicy();
  }, [pensionId]);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const res = await apiService.request(`/booking-policies/${pensionId}`);
      if (res.success && res.data) {
        const d = res.data;
        setPolicy({
          ...policy,
          ...d,
          booking_window_start: d.booking_window_start ? d.booking_window_start.split('T')[0] : '',
          booking_window_end: d.booking_window_end ? d.booking_window_end.split('T')[0] : '',
          max_advance_days: d.max_advance_days?.toString() || '',
          min_advance_hours: d.min_advance_hours?.toString() || '',
          same_day_cutoff: d.same_day_cutoff || '',
          min_stay_nights: d.min_stay_nights?.toString() || '',
          max_stay_nights: d.max_stay_nights?.toString() || '',
          check_in_start_time: d.check_in_start_time || '',
          check_in_end_time: d.check_in_end_time || '',
          check_out_time: d.check_out_time || '',
          free_cancellation_hours: d.free_cancellation_hours?.toString() || '',
          cancellation_penalty_percent: d.cancellation_penalty_percent?.toString() || ''
        });
      }
    } catch (err) {
      console.error('Error fetching policy:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setPolicy(prev => ({
      ...prev,
      [name]: type === 'number' ? value : value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setPolicy(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        ...policy,
        max_advance_days: policy.max_advance_days ? parseInt(policy.max_advance_days) : null,
        min_advance_hours: policy.min_advance_hours ? parseInt(policy.min_advance_hours) : null,
        min_stay_nights: policy.min_stay_nights ? parseInt(policy.min_stay_nights) : null,
        max_stay_nights: policy.max_stay_nights ? parseInt(policy.max_stay_nights) : null,
        free_cancellation_hours: policy.free_cancellation_hours ? parseInt(policy.free_cancellation_hours) : null,
        cancellation_penalty_percent: policy.cancellation_penalty_percent ? parseInt(policy.cancellation_penalty_percent) : null
      };

      const res = await apiService.request(`/booking-policies/${pensionId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        alert('Booking policies saved successfully!');
      } else {
        alert(res.message || 'Failed to save policies');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading booking policies...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Booking Policies</h2>
          <p className="text-slate-500">Control when, how, and who can book your property.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'rules' ? 'bg-white shadow text-primary' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Booking Rules
          </button>
          <button
            onClick={() => setActiveTab('blackout')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'blackout' ? 'bg-white shadow text-primary' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Blackout Dates
          </button>
        </div>
      </div>

      {activeTab === 'rules' && (
        <div className="space-y-8">
          
          {/* Booking Window */}
          <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-bold">Booking Window & Advance Rules</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Booking Window Start</Label>
                <Input type="date" name="booking_window_start" value={policy.booking_window_start} onChange={handleChange} />
                <p className="text-xs text-slate-500">Guests cannot book dates before this.</p>
              </div>
              <div className="space-y-2">
                <Label>Booking Window End</Label>
                <Input type="date" name="booking_window_end" value={policy.booking_window_end} onChange={handleChange} />
                <p className="text-xs text-slate-500">Guests cannot book dates after this.</p>
              </div>
              
              <div className="space-y-2">
                <Label>Maximum Advance Booking (Days)</Label>
                <Input type="number" min="0" name="max_advance_days" value={policy.max_advance_days} onChange={handleChange} placeholder="e.g. 90" />
                <p className="text-xs text-slate-500">How far in advance can guests book?</p>
              </div>
              <div className="space-y-2">
                <Label>Minimum Advance Booking (Hours)</Label>
                <Input type="number" min="0" name="min_advance_hours" value={policy.min_advance_hours} onChange={handleChange} placeholder="e.g. 24" />
                <p className="text-xs text-slate-500">How much notice do you need before check-in?</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Allow Same-Day Booking</Label>
                  <p className="text-xs text-slate-500">Can guests book and check-in on the same day?</p>
                </div>
                <Switch 
                  checked={policy.allow_same_day} 
                  onCheckedChange={(c) => handleSwitchChange('allow_same_day', c)} 
                />
              </div>
              
              {policy.allow_same_day && (
                <div className="space-y-2">
                  <Label>Same-Day Booking Cutoff Time</Label>
                  <Input type="time" name="same_day_cutoff" value={policy.same_day_cutoff} onChange={handleChange} />
                  <p className="text-xs text-slate-500">Stop same-day bookings after this time.</p>
                </div>
              )}
            </div>
          </section>

          {/* Stay & Timings */}
          <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <Clock className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold">Stay Duration & Timings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Minimum Stay (Nights)</Label>
                <Input type="number" min="1" name="min_stay_nights" value={policy.min_stay_nights} onChange={handleChange} placeholder="e.g. 1" />
              </div>
              <div className="space-y-2">
                <Label>Maximum Stay (Nights)</Label>
                <Input type="number" min="1" name="max_stay_nights" value={policy.max_stay_nights} onChange={handleChange} placeholder="e.g. 30" />
              </div>

              <div className="space-y-2">
                <Label>Check-in Start Time</Label>
                <Input type="time" name="check_in_start_time" value={policy.check_in_start_time} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Check-in End Time (Optional)</Label>
                <Input type="time" name="check_in_end_time" value={policy.check_in_end_time} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Check-out Time</Label>
                <Input type="time" name="check_out_time" value={policy.check_out_time} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* Cancellation & Approval */}
          <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold">Cancellation & Approval</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50">
                  <div>
                    <Label className="text-base text-slate-900 font-bold">Instant Booking</Label>
                    <p className="text-xs text-slate-500 mt-1">If disabled, you must manually approve all requests before payment.</p>
                  </div>
                  <Switch checked={policy.instant_booking} onCheckedChange={(c) => handleSwitchChange('instant_booking', c)} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Cancellation Policy</Label>
                  <select
                    name="cancellation_type"
                    value={policy.cancellation_type}
                    onChange={handleChange as any}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="FREE">Free Cancellation</option>
                    <option value="PARTIAL">Partial Refund</option>
                    <option value="NON_REFUNDABLE">Non-Refundable</option>
                  </select>
                </div>

                {policy.cancellation_type !== 'NON_REFUNDABLE' && (
                  <div className="space-y-2">
                    <Label>Free Cancellation Window (Hours before check-in)</Label>
                    <Input type="number" name="free_cancellation_hours" value={policy.free_cancellation_hours} onChange={handleChange} placeholder="e.g. 48" />
                  </div>
                )}
                
                {policy.cancellation_type === 'PARTIAL' && (
                  <div className="space-y-2">
                    <Label>Penalty Percentage (%)</Label>
                    <Input type="number" min="1" max="100" name="cancellation_penalty_percent" value={policy.cancellation_penalty_percent} onChange={handleChange} placeholder="e.g. 50" />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Restrictions */}
          <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <Ban className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold">Guest Restrictions</h3>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-xl">
                <Switch checked={policy.allow_children} onCheckedChange={(c) => handleSwitchChange('allow_children', c)} />
                <Label>Allow Children</Label>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-xl">
                <Switch checked={policy.allow_pets} onCheckedChange={(c) => handleSwitchChange('allow_pets', c)} />
                <Label>Allow Pets</Label>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-xl">
                <Switch checked={policy.allow_smoking} onCheckedChange={(c) => handleSwitchChange('allow_smoking', c)} />
                <Label>Allow Smoking</Label>
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white font-bold px-8">
              {saving ? 'Saving...' : 'Save Policies'}
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'blackout' && (
        <BlackoutCalendar pensionId={pensionId} />
      )}
    </div>
  );
};
