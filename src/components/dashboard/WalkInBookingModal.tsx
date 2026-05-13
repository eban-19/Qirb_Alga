import React from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl border-none ring-1 ring-slate-200 overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"></div>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100/50">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add Walk-In Booking</h3>
                <p className="text-sm text-slate-500 font-medium mt-0.5">Quickly register guests arriving without prior reservation</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5 text-slate-400" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Guest Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Guest Information</h4>
                
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Guest Full Name</label>
                  <input
                    type="text"
                    value={walkInForm.guestName}
                    onChange={(e) => setWalkInForm({ ...walkInForm, guestName: e.target.value })}
                    className="w-full h-12 px-4 border border-slate-200 rounded-xl bg-slate-50/30 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-700 transition-all"
                    placeholder="e.g., Daniel Abebe"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={walkInForm.phoneNumber}
                    onChange={(e) => setWalkInForm({ ...walkInForm, phoneNumber: e.target.value })}
                    className="w-full h-12 px-4 border border-slate-200 rounded-xl bg-slate-50/30 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-700 transition-all"
                    placeholder="+251 ..."
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Stay Details */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Stay & Package</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Check-in Date</label>
                    <input
                      type="date"
                      value={walkInForm.checkIn}
                      onChange={(e) => setWalkInForm({ ...walkInForm, checkIn: e.target.value })}
                      className="w-full h-12 px-4 border border-slate-200 rounded-xl bg-slate-50/30 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-700 transition-all"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Check-out Date</label>
                    <input
                      type="date"
                      value={walkInForm.checkOut}
                      onChange={(e) => setWalkInForm({ ...walkInForm, checkOut: e.target.value })}
                      className="w-full h-12 px-4 border border-slate-200 rounded-xl bg-slate-50/30 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-700 transition-all"
                      min={walkInForm.checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Select Room Package</label>
                  <select
                    value={walkInForm.packageId}
                    onChange={(e) => setWalkInForm({ ...walkInForm, packageId: e.target.value })}
                    className="w-full h-12 px-4 border border-slate-200 rounded-xl bg-slate-50/30 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-700 transition-all"
                  >
                    <option value="">Select a package</option>
                    {walkInPackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - ETB {pkg.price}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 mt-10 pt-6 border-t border-slate-100">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold border-2">Cancel</Button>
            <Button 
              onClick={onWalkInSubmit} 
              className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 rounded-xl font-bold text-lg active:scale-95 transition-all"
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
