import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useLanguage } from "@/hooks/use-language";
import {
  Bed, X, Package as PackageIcon, Home, Hash, Users,
  AlertCircle, Sparkles, Upload, Keyboard, Plus, Trash2, CheckCircle2
} from 'lucide-react';
import { Package } from '../../types/dashboard';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  newRoom: any;
  setNewRoom: (room: any) => void;
  packages: Package[];
  onAddRoom: () => void;
  existingRooms: any[];
  errorMessage?: string;
}

type TabType = 'manual' | 'generate';

export const AddRoomModal: React.FC<AddRoomModalProps> = ({
  isOpen,
  onClose,
  newRoom,
  setNewRoom,
  packages,
  onAddRoom,
  existingRooms,
  errorMessage
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  // Local state for tabs and inputs
  const [activeTab, setActiveTab] = useState<TabType>('manual');
  const [tagInput, setTagInput] = useState('');

  // Sequential generation states
  const [seqPrefix, setSeqPrefix] = useState('');
  const [seqStart, setSeqStart] = useState('101');
  const [seqCount, setSeqCount] = useState('5');
  const [seqSuffix, setSeqSuffix] = useState('');

  // Helper to parse room numbers into an array
  const getRoomsArray = (): string[] => {
    return newRoom.roomNumbers
      ? newRoom.roomNumbers.split(',').map((r: string) => r.trim()).filter((r: string) => r.length > 0)
      : [];
  };

  // Helper to update parent room numbers
  const updateRoomNumbers = (roomsArr: string[]) => {
    const uniqueRooms = Array.from(new Set(roomsArr));
    setNewRoom({
      ...newRoom,
      roomNumbers: uniqueRooms.join(', '),
      numberOfRooms: String(uniqueRooms.length)
    });
  };

  // Tag Entry Handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/,/g, '');
      if (val) {
        const currentRooms = getRoomsArray();
        if (!currentRooms.includes(val)) {
          updateRoomNumbers([...currentRooms, val]);
        }
        setTagInput('');
      }
    }
  };

  const handleAddSingleTag = () => {
    const val = tagInput.trim().replace(/,/g, '');
    if (val) {
      const currentRooms = getRoomsArray();
      if (!currentRooms.includes(val)) {
        updateRoomNumbers([...currentRooms, val]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    const currentRooms = getRoomsArray();
    const updated = currentRooms.filter((_, idx) => idx !== index);
    updateRoomNumbers(updated);
  };

  const handleClearAllTags = () => {
    if (window.confirm('Are you sure you want to clear all entered room numbers?')) {
      updateRoomNumbers([]);
    }
  };

  // Excel / Text Paste Handler
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');

    // Split by newlines, commas, tabs, or spaces
    const parsedNumbers = pastedText
      .split(/[\n\r\t,]+/)
      .map(num => num.trim())
      .filter(num => num.length > 0);

    if (parsedNumbers.length > 0) {
      const currentRooms = getRoomsArray();
      updateRoomNumbers([...currentRooms, ...parsedNumbers]);
      setTagInput('');
    }
  };

  // Sequential Range Generator Handler
  const handleGenerateSequence = () => {
    const start = parseInt(seqStart) || 101;
    const count = parseInt(seqCount) || 1;
    const prefix = seqPrefix || '';
    const suffix = seqSuffix || '';

    const generated: string[] = [];
    for (let i = 0; i < count; i++) {
      generated.push(`${prefix}${start + i}${suffix}`);
    }

    const currentRooms = getRoomsArray();
    updateRoomNumbers([...currentRooms, ...generated]);

    // Switch to manual view for review
    setActiveTab('manual');
  };

  const roomList = getRoomsArray();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden border-none shadow-2xl bg-white shadow-none ring-1 ring-slate-100 rounded-2xl sm:rounded-[2rem] flex flex-col animate-in fade-in zoom-in duration-200">
        <CardHeader className="pb-4 shrink-0 border-b border-slate-50 p-5 sm:p-8">
          <CardTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden sm:flex p-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 shrink-0">
                <Bed className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">{t.dashboard?.addNewRoom || "Add New Rooms"}</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 truncate sm:whitespace-normal">{t.dashboard?.addRoomDesc || "Configure your property's room details and inventory"}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-slate-100 transition-colors shrink-0 flex items-center justify-center">
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 custom-scrollbar">
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-red-900">Action Required</h4>
                <p className="text-sm text-red-700 opacity-80">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Core Setup */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Category & Type</h3>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <PackageIcon className="h-4 w-4 text-blue-600" /> Select Package Tier
                  </Label>
                  <select
                    value={newRoom.package}
                    onChange={(e) => {
                      const pkgId = e.target.value;
                      const selectedPackage = packages.find(p => String(p.id || p.package_id) === String(pkgId));
                      const firstExistingRoom = existingRooms.find(r => String(r.package_id) === String(pkgId));

                      if (firstExistingRoom) {
                        setNewRoom({
                          ...newRoom,
                          package: pkgId,
                          type: firstExistingRoom.room_type || selectedPackage?.name || '',
                          capacity: String(firstExistingRoom.capacity || '1'),
                          numberOfBeds: String(firstExistingRoom.number_of_beds || '1'),
                          status: 'Available'
                        });
                      } else {
                        setNewRoom({
                          ...newRoom,
                          package: pkgId,
                          type: selectedPackage?.name || '',
                          capacity: selectedPackage?.services?.length ? '2' : '1',
                          numberOfBeds: selectedPackage?.name?.includes('Double') ? '2' : '1'
                        });
                      }
                    }}
                    className="h-12 w-full border border-slate-200 rounded-xl px-4 bg-slate-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none font-medium text-slate-700 transition-all"
                  >
                    <option value="">Select a package</option>
                    {packages.map(pkg => (
                      <option key={String(pkg.id || pkg.package_id)} value={String(pkg.id || pkg.package_id)}>
                        {pkg.name} - ETB {pkg.price}/night
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Home className="h-4 w-4 text-blue-600" /> Room Type Name
                  </Label>
                  <Input
                    value={newRoom.type || ''}
                    onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                    placeholder="e.g., Luxury Double"
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" /> Current Status
                  </Label>
                  <select
                    value={newRoom.status}
                    onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value })}
                    className="h-12 w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 outline-none font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Room Number Entry System */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Inventory & Room Numbers</h3>
                  {roomList.length > 0 && (
                    <button
                      onClick={handleClearAllTags}
                      className="text-xs text-red-500 hover:text-red-600 font-bold transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Clear All ({roomList.length})
                    </button>
                  )}
                </div>

                {/* Tabs for combined upload/generation experiences */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => setActiveTab('manual')}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-black uppercase tracking-tight rounded-lg transition-all ${activeTab === 'manual'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <Keyboard className="h-3.5 w-3.5" /> Manual / Paste
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('generate')}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-black uppercase tracking-tight rounded-lg transition-all ${activeTab === 'generate'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Auto-Seq
                  </button>
                </div>

                {/* Dynamic Panel based on Active Tab */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2rem p-5 space-y-4">

                  {activeTab === 'manual' && (
                    <div className="space-y-4">
                      {/* Active Tag Box */}
                      <div className="flex flex-wrap gap-2 p-3 min-h-[96px] max-h-[144px] overflow-y-auto bg-white border border-slate-200/60 rounded-xl shadow-inner custom-scrollbar">
                        {roomList.map((room, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100 rounded-lg text-sm font-bold shadow-sm group hover:border-blue-300 transition-all animate-in zoom-in-95 duration-200"
                          >
                            <span>{room}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(idx)}
                              className="text-blue-300 hover:text-red-500 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        {roomList.length === 0 && (
                          <span className="text-slate-400 text-xs italic m-auto text-center font-medium">
                            No rooms added yet. Type below or use auto-sequence.
                          </span>
                        )}
                      </div>

                      {/* Tag Input Field */}
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onPaste={handlePaste}
                          placeholder="Type room number (Enter) or paste Excel column..."
                          className="h-12 border-slate-200 bg-white rounded-xl focus:ring-blue-500/20"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleAddSingleTag}
                          className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">
                        Pro-tip: Copy a column of numbers from Excel and paste directly!
                      </p>
                    </div>
                  )}

                  {activeTab === 'generate' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-500">Start Number</Label>
                          <Input
                            value={seqStart}
                            onChange={(e) => setSeqStart(e.target.value)}
                            type="number"
                            className="h-11 border-slate-200 bg-white rounded-xl"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-500">Quantity of Rooms</Label>
                          <Input
                            value={seqCount}
                            onChange={(e) => setSeqCount(e.target.value)}
                            type="number"
                            min="1"
                            max="100"
                            className="h-11 border-slate-200 bg-white rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-500">Prefix (Optional)</Label>
                          <Input
                            value={seqPrefix}
                            onChange={(e) => setSeqPrefix(e.target.value)}
                            placeholder="e.g. A-"
                            className="h-11 border-slate-200 bg-white rounded-xl"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-500">Suffix (Optional)</Label>
                          <Input
                            value={seqSuffix}
                            onChange={(e) => setSeqSuffix(e.target.value)}
                            placeholder="e.g. B"
                            className="h-11 border-slate-200 bg-white rounded-xl"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleGenerateSequence}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all"
                      >
                        <Sparkles className="h-4 w-4" /> Generate and Insert
                      </Button>
                    </div>
                  )}
                </div>

                {/* Additional Room Meta Data */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-500">Total Rooms</Label>
                    <Input
                      value={newRoom.numberOfRooms}
                      onChange={(e) => setNewRoom({ ...newRoom, numberOfRooms: e.target.value })}
                      type="number"
                      min="1"
                      className="h-11 border-slate-200 bg-slate-50/30 rounded-xl text-center font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-500">Total Beds</Label>
                    <Input
                      value={newRoom.numberOfBeds || ''}
                      onChange={(e) => setNewRoom({ ...newRoom, numberOfBeds: e.target.value })}
                      type="number"
                      min="1"
                      className="h-11 border-slate-200 bg-slate-50/30 rounded-xl text-center font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-500">Max Capacity</Label>
                    <Input
                      value={newRoom.capacity}
                      onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                      type="number"
                      min="1"
                      className="h-11 border-slate-200 bg-slate-50/30 rounded-xl text-center font-bold text-slate-700"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </CardContent>

        <div className="p-4 sm:p-8 border-t border-slate-50 bg-slate-50/30 flex gap-3 sm:gap-4 shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11 sm:h-14 rounded-xl sm:rounded-2xl font-bold text-slate-600 border border-slate-200 hover:bg-white transition-all text-xs sm:text-base">Cancel</Button>
          <Button
            onClick={() => {
              if (!newRoom.package) return;
              onAddRoom();
            }}
            disabled={!newRoom.package || roomList.length === 0}
            className={`flex-[2] h-11 sm:h-14 transition-all rounded-xl sm:rounded-2xl font-black text-xs sm:text-lg ${!newRoom.package || roomList.length === 0
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95 hover:scale-[1.01]"
              }`}
          >
            {!newRoom.package
              ? "Select Package"
              : roomList.length === 0
                ? "Configure Rooms"
                : `Create ${roomList.length} Rooms`
            }
          </Button>
        </div>
      </Card>
    </div>
  );
};

