import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import apiService from '../../../services/api';

interface BlackoutCalendarProps {
  pensionId: string | number;
}

export const BlackoutCalendar: React.FC<BlackoutCalendarProps> = ({ pensionId }) => {
  const [dates, setDates] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    room_id: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, [pensionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [datesRes, roomsRes] = await Promise.all([
        apiService.request(`/booking-policies/${pensionId}/blackout-dates`),
        apiService.request(`/rooms/pension/${pensionId}`)
      ]);

      if (datesRes.success) setDates(datesRes.data);
      if (roomsRes.success) setRooms(roomsRes.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date) {
      alert('Please select start and end dates.');
      return;
    }

    try {
      const res = await apiService.request(`/booking-policies/${pensionId}/blackout-dates`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (res.success) {
        setFormData({ start_date: '', end_date: '', room_id: '', reason: '' });
        fetchData();
      } else {
        alert(res.message || 'Failed to add blackout date');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this restriction?')) return;
    try {
      const res = await apiService.request(`/booking-policies/${pensionId}/blackout-dates/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dates...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <CalendarIcon className="w-5 h-5 text-red-500" />
          <div>
            <h3 className="text-lg font-bold">Blackout Dates</h3>
            <p className="text-xs text-slate-500 mt-1">Block out dates for maintenance, private events, or unavailability.</p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label>Room (Optional)</Label>
            <select name="room_id" value={formData.room_id} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">All Rooms (Entire Property)</option>
              {rooms.map(r => (
                <option key={r.room_id} value={r.room_id}>Room {r.room_number}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Input type="text" name="reason" value={formData.reason} onChange={handleChange} placeholder="e.g. Maintenance" />
          </div>
          <Button type="submit" className="w-full gap-2 bg-slate-900 text-white">
            <Plus className="w-4 h-4" /> Add Block
          </Button>
        </form>

        <div className="space-y-3">
          {dates.length === 0 ? (
            <div className="text-center py-8 text-slate-500 border border-dashed rounded-xl">
              No blackout dates set. Your property is open for all days.
            </div>
          ) : (
            dates.map(date => (
              <div key={date.id} className="flex items-center justify-between p-4 border rounded-xl hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-red-50 p-2 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {new Date(date.start_date).toLocaleDateString()} — {new Date(date.end_date).toLocaleDateString()}
                    </h4>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <span className="font-medium text-slate-700">{date.room_id ? `Room ${rooms.find(r => r.room_id === date.room_id)?.room_number || date.room_id}` : 'Entire Property'}</span>
                      {date.reason && <span>• {date.reason}</span>}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(date.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
