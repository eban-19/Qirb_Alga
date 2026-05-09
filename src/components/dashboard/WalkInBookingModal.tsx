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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Walk-In Booking</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Guest Name</label>
            <input
              type="text"
              value={walkInForm.guestName}
              onChange={(e) => setWalkInForm({ ...walkInForm, guestName: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter guest name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              value={walkInForm.phoneNumber}
              onChange={(e) => setWalkInForm({ ...walkInForm, phoneNumber: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter phone number"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Check-in Date</label>
              <input
                type="date"
                value={walkInForm.checkIn}
                onChange={(e) => setWalkInForm({ ...walkInForm, checkIn: e.target.value })}
                className="w-full p-2 border rounded-md"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Check-out Date</label>
              <input
                type="date"
                value={walkInForm.checkOut}
                onChange={(e) => setWalkInForm({ ...walkInForm, checkOut: e.target.value })}
                className="w-full p-2 border rounded-md"
                min={walkInForm.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Package</label>
            <select
              value={walkInForm.packageId}
              onChange={(e) => setWalkInForm({ ...walkInForm, packageId: e.target.value })}
              className="w-full p-2 border rounded-md"
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
        
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={onWalkInSubmit} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
            Create Booking
          </Button>
        </div>
      </div>
    </div>
  );
};
