import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Lock, CheckCircle2, ChevronLeft, ChevronRight, Loader2, X, Ban, ArrowLeft } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, startOfDay } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

export const RoomCalendarSection = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [calendarData, setCalendarData] = useState<{ bookings: any[], blocks: any[] }>({ bookings: [], blocks: [] });
  
  // Blocking Form State
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails();
      fetchCalendarData();
    }
  }, [roomId, currentDate]);

  const fetchRoomDetails = async () => {
    try {
      const res = await fetch(`http://localhost:3006/api/rooms/${roomId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success && data.data.room) {
        setRoomName(`${data.data.room.type} (Room ${data.data.room.room_number || data.data.room.id})`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const start = startOfMonth(currentDate).toISOString();
      const end = endOfMonth(addMonths(currentDate, 1)).toISOString();
      
      const res = await fetch(`http://localhost:3006/api/rooms/${roomId}/calendar?startDate=${start}&endDate=${end}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setCalendarData(data.data);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load availability data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlockDates = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlocking(true);
    try {
      const res = await fetch(`http://localhost:3006/api/rooms/${roomId}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          startDate: blockStart,
          endDate: blockEnd,
          reason: blockReason
        })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Success", description: "Dates blocked successfully" });
        setShowBlockForm(false);
        setBlockStart("");
        setBlockEnd("");
        setBlockReason("");
        fetchCalendarData();
      } else {
        toast({ title: "Error", description: data.message || "Failed to block dates", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "An error occurred while blocking dates", variant: "destructive" });
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblock = async (blockId: number) => {
    if (!window.confirm("Are you sure you want to unblock these dates?")) return;
    try {
      const res = await fetch(`http://localhost:3006/api/rooms/${roomId}/block/${blockId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Success", description: "Dates unblocked successfully" });
        fetchCalendarData();
      } else {
        toast({ title: "Error", description: data.message || "Failed to unblock", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "An error occurred", variant: "destructive" });
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calendar Grid Generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayStatus = (day: Date) => {
    const dayStart = startOfDay(day);
    const block = calendarData.blocks.find(b => {
      const bs = startOfDay(parseISO(b.start_date));
      const be = startOfDay(parseISO(b.end_date));
      return dayStart >= bs && dayStart <= be;
    });
    if (block) return { type: 'blocked', label: 'Blocked', data: block };

    const booking = calendarData.bookings.find(b => {
      const bs = startOfDay(parseISO(b.check_in_date));
      const be = startOfDay(parseISO(b.check_out_date));
      return dayStart >= bs && dayStart < be;
    });

    if (booking) {
      const statusLower = booking.status?.toLowerCase();
      if (statusLower === 'completed' || booking.actual_check_out) {
        return { type: 'completed', label: 'Completed', data: booking };
      }
      if (booking.actual_check_in && !booking.actual_check_out) {
        return { type: 'checked_in', label: 'Checked In', data: booking };
      }
      if (statusLower === 'confirmed') {
        return { type: 'confirmed', label: 'Confirmed', data: booking };
      }
      return { type: 'pending', label: 'Pending', data: booking };
    }

    return { type: 'available', label: 'Available', data: null };
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full shrink-0">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Availability Calendar
          </h2>
          {roomName && <p className="text-slate-500 text-sm font-medium mt-1">{roomName}</p>}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-full shadow-sm"><ChevronLeft className="w-4 h-4" /></Button>
            <h2 className="text-lg font-bold text-slate-800 w-36 text-center">{format(currentDate, 'MMMM yyyy')}</h2>
            <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-full shadow-sm"><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowBlockForm(!showBlockForm)} variant={showBlockForm ? "outline" : "default"} className="gap-2 shadow-sm">
              {showBlockForm ? <X className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {showBlockForm ? "Cancel Blocking" : "Block Dates"}
            </Button>
          </div>
        </div>

        {/* Block Dates Form */}
        {showBlockForm && (
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl shadow-inner animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2">
              <Ban className="w-4 h-4" /> Manually Block Room Dates
            </h3>
            <form onSubmit={handleBlockDates} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full space-y-1">
                <label className="text-xs font-semibold text-slate-600">Start Date</label>
                <Input type="date" required value={blockStart} onChange={e => setBlockStart(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="flex-1 w-full space-y-1">
                <label className="text-xs font-semibold text-slate-600">End Date</label>
                <Input type="date" required value={blockEnd} onChange={e => setBlockEnd(e.target.value)} min={blockStart || new Date().toISOString().split('T')[0]} />
              </div>
              <div className="flex-1 w-full space-y-1">
                <label className="text-xs font-semibold text-slate-600">Reason (e.g. Maintenance)</label>
                <Input type="text" placeholder="Optional" value={blockReason} onChange={e => setBlockReason(e.target.value)} />
              </div>
              <Button type="submit" disabled={blocking} className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
                {blocking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Block Now"}
              </Button>
            </form>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs font-medium justify-center py-2">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Available</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Confirmed Booking</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Checked In</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-400"></div> Pending</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-300"></div> Completed / Checked Out</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-500"></div> Blocked / Maintenance</div>
        </div>

        {/* Calendar Grid */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}
          <div className="grid grid-cols-7 bg-slate-100 text-slate-500 font-semibold text-xs text-center border-b border-slate-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-2 border-r border-slate-200 last:border-0">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {/* Padding days */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`pad-${i}`} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50 opacity-50 p-2" />
            ))}
            
            {/* Actual days */}
            {daysInMonth.map((day) => {
              const status = getDayStatus(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div key={day.toISOString()} className={`min-h-[100px] border-b border-r border-slate-100 p-2 flex flex-col relative hover:bg-slate-50 transition-colors group`}>
                  <span className={`text-sm font-bold z-10 inline-flex items-center justify-center w-6 h-6 rounded-full mb-1 ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="flex-1 w-full mt-1 flex flex-col gap-1 overflow-hidden">
                    {status.type !== 'available' && (
                      <div className={`text-[10px] sm:text-xs px-1.5 py-1 rounded w-full truncate font-medium text-white shadow-sm flex items-center justify-between ${
                        status.type === 'confirmed' ? 'bg-rose-500' :
                        status.type === 'checked_in' ? 'bg-blue-500' :
                        status.type === 'pending' ? 'bg-yellow-500 text-yellow-950' :
                        status.type === 'completed' ? 'bg-slate-300 text-slate-700' :
                        status.type === 'blocked' ? 'bg-slate-500' : ''
                      }`}>
                        <span className="truncate">{status.type === 'blocked' ? (status.data?.reason || 'Maintenance') : (status.data?.customer?.full_name || status.data?.walk_in_guest_name)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline / Details List */}
        <div className="mt-8">
          <h3 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Upcoming Events & Blocks</h3>
          <div className="space-y-3">
            {calendarData.blocks
              .filter(b => new Date(b.end_date) >= startOfDay(new Date()))
              .map(b => (
                <div key={`block-${b.block_id}`} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600"><Lock className="w-5 h-5" /></div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Blocked: {b.reason || 'Maintenance'}</h4>
                      <p className="text-xs text-slate-500">{format(parseISO(b.start_date), 'MMM d')} - {format(parseISO(b.end_date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleUnblock(b.block_id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">Unblock</Button>
                </div>
              ))}
            
            {calendarData.bookings
              .filter(b => {
                const statusLower = b.status?.toLowerCase();
                return statusLower !== 'cancelled' && statusLower !== 'completed' && new Date(b.check_out_date) >= startOfDay(new Date());
              })
              .map(b => {
                const isConfirmed = b.status?.toLowerCase() === 'confirmed';
                return (
                  <div key={`book-${b.booking_id}`} className="flex items-center justify-between p-3 bg-white border border-slate-200 shadow-sm rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${b.actual_check_in ? 'bg-blue-500' : isConfirmed ? 'bg-rose-500' : 'bg-yellow-500'}`}>
                        {b.actual_check_in ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{b.customer?.full_name || b.walk_in_guest_name}</h4>
                        <p className="text-xs text-slate-500">{format(parseISO(b.check_in_date), 'MMM d, h:mm a')} - {format(parseISO(b.check_out_date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${b.actual_check_in ? 'bg-blue-100 text-blue-700' : isConfirmed ? 'bg-rose-100 text-rose-700' : 'bg-yellow-100 text-yellow-800'}`}>
                          {b.actual_check_in ? 'Checked In' : b.status}
                        </span>
                    </div>
                  </div>
                );
              })}

            {calendarData.blocks.filter(b => new Date(b.end_date) >= startOfDay(new Date())).length === 0 && 
             calendarData.bookings.filter(b => {
               const statusLower = b.status?.toLowerCase();
               return statusLower !== 'cancelled' && statusLower !== 'completed' && new Date(b.check_out_date) >= startOfDay(new Date());
             }).length === 0 && !loading && (
              <div className="text-center py-8 text-slate-500 text-sm">No upcoming events or blocked dates.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
