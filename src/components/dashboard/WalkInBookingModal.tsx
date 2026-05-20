import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { X, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface WalkInBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  walkInForm: any;
  setWalkInForm: (form: any) => void;
  walkInPackages: any[];
  onWalkInSubmit: () => void;
}

export const WalkInBookingModal: React.FC<WalkInBookingModalProps> = ({
  isOpen,
  onClose,
  walkInForm,
  setWalkInForm,
  walkInPackages,
  onWalkInSubmit
}) => {
  const [availableRooms, setAvailableRooms] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Reset availability when dates or package change
  useEffect(() => {
    setAvailableRooms(null);
  }, [walkInForm.checkIn, walkInForm.checkOut, walkInForm.packageId]);

  const handleCheckAvailability = async () => {
    if (!walkInForm.checkIn || !walkInForm.checkOut || !walkInForm.packageId) {
      alert("Please select dates and a package first.");
      return;
    }
    if (new Date(walkInForm.checkOut) <= new Date(walkInForm.checkIn)) {
      alert("Check-out date must be after check-in date.");
      return;
    }
    
    setIsChecking(true);
    try {
      const response = await fetch('http://localhost:3006/api/bookings/walk-in/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          checkIn: walkInForm.checkIn,
          checkOut: walkInForm.checkOut,
          packageId: walkInForm.packageId
        })
      });
      const result = await response.json();
      if (result.success) {
        setAvailableRooms(result.availableRooms);
      } else {
        alert(result.message || "Failed to check availability");
        setAvailableRooms(0);
      }
    } catch (error) {
      console.error("Availability check failed:", error);
      alert("Something went wrong checking availability.");
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 sm:p-8 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="hidden sm:flex p-3 rounded-2xl bg-slate-50 text-slate-600 border border-slate-200 shrink-0">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">Add Walk-In Booking</h3>
                <p className="text-xs sm:text-sm text-slate-505 font-medium mt-0.5 text-slate-500 truncate sm:whitespace-normal">Quickly register guests arriving without prior reservation</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-slate-100 transition-colors shrink-0 flex items-center justify-center">
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Left Column: Guest Info */}
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400">Guest Information</h4>
                
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700">Guest Full Name</label>
                  <input
                    type="text"
                    value={walkInForm.guestName}
                    onChange={(e) => setWalkInForm({ ...walkInForm, guestName: e.target.value })}
                    className="w-full h-11 sm:h-12 px-4 border border-slate-200 rounded-xl bg-slate-50/30 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-700 text-sm sm:text-base transition-all"
                    placeholder="e.g., Daniel Abebe"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={walkInForm.phoneNumber}
                    onChange={(e) => setWalkInForm({ ...walkInForm, phoneNumber: e.target.value })}
                    className="w-full h-11 sm:h-12 px-4 border border-slate-200 rounded-xl bg-slate-50/30 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-700 text-sm sm:text-base transition-all"
                    placeholder="+251 ..."
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Stay Details */}
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400">Stay & Package</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">Check-in Date</label>
                    <input
                      type="date"
                      value={walkInForm.checkIn}
                      onChange={(e) => setWalkInForm({ ...walkInForm, checkIn: e.target.value })}
                      className="w-full h-11 sm:h-12 px-3 sm:px-4 border border-slate-200 rounded-xl bg-slate-50/30 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-705 text-xs sm:text-sm transition-all"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">Check-out Date</label>
                    <input
                      type="date"
                      value={walkInForm.checkOut}
                      onChange={(e) => setWalkInForm({ ...walkInForm, checkOut: e.target.value })}
                      className="w-full h-11 sm:h-12 px-3 sm:px-4 border border-slate-200 rounded-xl bg-slate-50/30 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-705 text-xs sm:text-sm transition-all"
                      min={walkInForm.checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700">Select Room Package</label>
                  <select
                    value={walkInForm.packageId}
                    onChange={(e) => setWalkInForm({ ...walkInForm, packageId: e.target.value })}
                    className="w-full h-11 sm:h-12 px-4 border border-slate-200 rounded-xl bg-slate-50/30 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-700 text-sm sm:text-base transition-all"
                  >
                    <option value="">Select a package</option>
                    {walkInPackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - ETB {pkg.price}
                      </option>
                    ))}
                  </select>
                </div>
                
                {walkInForm.checkIn && walkInForm.checkOut && walkInForm.packageId && (
                  <div className="pt-2">
                    {availableRooms === null ? (
                      <Button 
                        onClick={handleCheckAvailability} 
                        disabled={isChecking}
                        className="w-full h-11 sm:h-12 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm sm:text-base"
                      >
                        {isChecking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                        Check Availability
                      </Button>
                    ) : availableRooms > 0 ? (
                      <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                        <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-emerald-900">Rooms Available</p>
                          <p className="text-[10px] sm:text-xs font-medium text-emerald-700">{availableRooms} rooms match this package.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl bg-rose-50 border border-rose-100">
                        <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-rose-600 shrink-0" />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-rose-900">No Availability</p>
                          <p className="text-[10px] sm:text-xs font-medium text-rose-700">All rooms for this package are booked.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6 sm:mt-10 pt-4 sm:pt-6 border-t border-slate-100">
            <Button variant="outline" onClick={onClose} className="flex-1 h-11 sm:h-12 rounded-xl font-bold border border-slate-200 text-sm sm:text-base">Cancel</Button>
            <Button 
              onClick={onWalkInSubmit} 
              disabled={availableRooms === null || availableRooms === 0}
              className={`flex-1 h-11 sm:h-12 text-white rounded-xl font-bold text-sm sm:text-base transition-all ${
                availableRooms && availableRooms > 0 ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95' : 'bg-slate-300 shadow-none cursor-not-allowed'
              }`}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
