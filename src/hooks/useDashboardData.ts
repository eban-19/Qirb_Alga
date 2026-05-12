import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { 
  User, Pension, Package, Room, Booking, Staff, Guest, Transaction, Expense 
} from '../types/dashboard';

export const useDashboardData = (ui?: any) => {
  const { user } = useAuth() as { user: User };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data State
  const [pensions, setPensions] = useState<Pension[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [roomsData, setRoomsData] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [guestsData, setGuestsData] = useState<Guest[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [expensesData, setExpensesData] = useState<Expense[]>([]);
  const [dataTotals, setDataTotals] = useState<Record<string, number>>({
    rooms: 0,
    bookings: 0,
    guests: 0,
    staff: 0
  });
  
  // Stats State
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [actualRoomStats, setActualRoomStats] = useState({ totalRooms: 0, availableRooms: 0 });
  const [selectedPensionId, setSelectedPensionId] = useState<string>('');

  const loadRealData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Loading Dashboard Data for user:', user.id);
      
      // 1. Fetch Pensions
      let pensionsResp;
      try {
        pensionsResp = await apiService.getPensions();
      } catch (err) {
        console.error('Failed to fetch pensions:', err);
        pensionsResp = { success: false, data: [] };
      }

      if (pensionsResp.success) {
        const fetchedPensions = (Array.isArray(pensionsResp.data) ? pensionsResp.data : (pensionsResp.data as any)?.items || []) as Pension[];
        setPensions(fetchedPensions);
        
        // Find user's pension
        let userPension = fetchedPensions.find((p: Pension) => 
          String(p.owner_id) === String(user.id)
        );

        // Fallback to the first pension if user has none (useful for admin viewing the dashboard)
        if (!userPension && fetchedPensions.length > 0) {
          userPension = fetchedPensions[0];
        }
        
        if (userPension) {
          const pensionId = Number(userPension.pension_id || userPension.id);
          setSelectedPensionId(String(pensionId));
          
          // 2. Fetch Pension-specific data with pagination
          const results = await Promise.allSettled([
            apiService.getPackages(pensionId),
            apiService.getRooms(pensionId, { 
              page: ui?.pagination?.rooms?.page || 1, 
              limit: ui?.pagination?.rooms?.limit || 10 
            }),
            apiService.getBookings({ 
              pension_id: pensionId, 
              page: ui?.pagination?.bookings?.page || 1, 
              limit: ui?.pagination?.bookings?.limit || 10 
            }),
            apiService.getGuests(pensionId, { 
              page: ui?.pagination?.guests?.page || 1, 
              limit: ui?.pagination?.guests?.limit || 10 
            }),
            apiService.getStaff(pensionId, { 
              page: ui?.pagination?.staff?.page || 1, 
              limit: ui?.pagination?.staff?.limit || 10 
            }),
            apiService.getExpenses(pensionId, { 
              page: 1, 
              limit: 50 // Expenses might not need heavy pagination in overview
            }),
            apiService.getTransactions(pensionId, { 
              page: ui?.pagination?.transactions?.page || 1, 
              limit: ui?.pagination?.transactions?.limit || 10 
            })
          ]);

          const packagesResp = results[0].status === 'fulfilled' ? results[0].value : { success: false, data: [] };
          const roomsResp = results[1].status === 'fulfilled' ? results[1].value : { success: false, data: { items: [], total: 0 } };
          const bookingsResp = results[2].status === 'fulfilled' ? results[2].value : { success: false, data: { items: [], total: 0 } };
          const guestsResp = results[3].status === 'fulfilled' ? results[3].value : { success: false, data: { items: [], total: 0 } };
          const staffResp = results[4].status === 'fulfilled' ? results[4].value : { success: false, data: { items: [], total: 0 } };
          const expensesResp = results[5].status === 'fulfilled' ? results[5].value : { success: false, data: { items: [], total: 0 } };
          const transactionsResp = results[6]?.status === 'fulfilled' ? results[6].value : { success: false, data: { items: [], total: 0 } };

          if (results.some(r => r.status === 'rejected')) {
            console.warn('Some dashboard endpoints failed to load', results.filter(r => r.status === 'rejected'));
          }

          if (packagesResp.success) setPackages(packagesResp.data || []);
          if (roomsResp.success) {
            const roomsDataRaw = roomsResp.data;
            const rooms = (Array.isArray(roomsDataRaw) ? roomsDataRaw : (roomsDataRaw as any)?.items || []) as Room[];
            const totalRooms = (roomsDataRaw as any)?.total || rooms.length;
            
            // Map backend fields to UI expected fields
            const mappedRooms = rooms.map(r => ({
              ...r,
              status: r.availability_status || (r as any).status || 'Available',
              price: r.price_per_night || (r as any).price || 0,
              type: (r as any).type || r.room_type || 'Standard'
            }));
            setRoomsData(mappedRooms as any);
            setActualRoomStats({
              totalRooms: totalRooms,
              availableRooms: mappedRooms.filter((r: any) => r.status === 'Available').length
            });
            setDataTotals(prev => ({ ...prev, rooms: totalRooms }));
          }

          if (bookingsResp.success) {
            const fetchedBookingsRaw = (Array.isArray(bookingsResp.data) ? bookingsResp.data : (bookingsResp.data as any)?.items || []) as Booking[];
            
            // Deduplicate bookings by ID
            const uniqueBookingsMap = new Map();
            fetchedBookingsRaw.forEach(b => {
              const id = b.booking_id || b.id;
              if (!uniqueBookingsMap.has(id)) {
                uniqueBookingsMap.set(id, b);
              }
            });
            const fetchedBookings = Array.from(uniqueBookingsMap.values());
            
            const totalBookings = (bookingsResp.data as any)?.total || fetchedBookings.length;
            setBookings(fetchedBookings);
            setDataTotals(prev => ({ ...prev, bookings: totalBookings }));
            
            // Map Guests from Bookings if Guests endpoint is empty
            const uniqueGuestsMap = new Map();
            fetchedBookings.forEach((b: any) => {
              const customer = b.customer;
              const isWalkIn = b.is_walk_in || !customer;
              
              // Extract guest details from either registered customer or walk-in info
              const guestName = customer?.full_name || b.walk_in_guest_name || b.user_name || 'Unknown Guest';
              const guestEmail = customer?.email || b.walk_in_guest_email || b.user_email || 'N/A';
              const guestPhone = customer?.phone || b.walk_in_guest_phone || b.user_phone || b.phone || 'N/A';
              const guestUserId = customer?.user_id || customer?.id;
              
              // Unique ID for the guest (prioritize email/phone to merge records for same person)
              const guestId = guestEmail !== 'N/A' ? guestEmail : (guestPhone !== 'N/A' ? guestPhone : (guestUserId || b.booking_id || b.id));
              
              const bookingStatus = b.status?.toLowerCase();
              const guestStatus = bookingStatus === 'confirmed' ? 'Checked In' : 
                                 (bookingStatus === 'completed' ? 'Checked Out' : 'Pending');

              if (!uniqueGuestsMap.has(guestId)) {
                uniqueGuestsMap.set(guestId, {
                  id: guestId,
                  name: guestName,
                  email: guestEmail,
                  phone: guestPhone,
                  nationality: 'Ethiopian',
                  room_number: b.room_number || b.room?.room_number || b.room?.room_type || 'N/A',
                  roomId: b.room_id,
                  status: guestStatus,
                  totalBookings: 1,
                  totalSpent: parseFloat(b.total_price || 0),
                  isWalkIn: isWalkIn
                });
              } else {
                const existing = uniqueGuestsMap.get(guestId);
                existing.totalBookings += 1;
                existing.totalSpent += parseFloat(b.total_price || 0);
                
                // Update name if we have a better one
                if (existing.name === 'Unknown Guest' && guestName !== 'Unknown Guest') {
                  existing.name = guestName;
                }
                
                // Prioritize 'Checked In' status over others
                if (guestStatus === 'Checked In' || (guestStatus === 'Checked Out' && existing.status === 'Pending')) {
                  existing.status = guestStatus;
                  existing.room_number = b.room_number || b.room?.room_number || b.room?.room_type || existing.room_number;
                }
              }
            });

            // Get guests from API response
            const apiGuests = (Array.isArray(guestsResp.data) ? guestsResp.data : (guestsResp.data as any)?.items || []) as Guest[];
            
            // Merge API guests into our unique map to avoid duplicates and combine info
            apiGuests.forEach((g: any) => {
              const guestId = g.email || g.phone || g.id;
              if (guestId) {
                const existing = uniqueGuestsMap.get(guestId);
                if (existing) {
                  // Merge info, prioritize API data for basic fields but keep derived stats if higher
                  uniqueGuestsMap.set(guestId, {
                    ...existing,
                    ...g,
                    name: g.full_name || g.name || existing.name,
                    totalBookings: Math.max(existing.totalBookings, g.total_bookings || 0),
                    totalSpent: Math.max(existing.totalSpent, parseFloat(g.total_spent || 0))
                  });
                } else {
                  uniqueGuestsMap.set(guestId, {
                    id: g.id,
                    name: g.full_name || g.name || 'Unknown Guest',
                    email: g.email || 'N/A',
                    phone: g.phone || 'N/A',
                    nationality: g.nationality || 'Ethiopian',
                    room_number: g.room_number || 'N/A',
                    status: g.status || 'Active',
                    totalBookings: g.total_bookings || 0,
                    totalSpent: parseFloat(g.total_spent || 0)
                  });
                }
              }
            });

            const finalGuests = Array.from(uniqueGuestsMap.values());
            setGuestsData(finalGuests);
            setDataTotals(prev => ({ 
              ...prev, 
              guests: (guestsResp.data as any)?.total || Math.max(finalGuests.length, (guestsResp.data as any)?.total || 0) 
            }));
            
            // Map Transactions from Bookings and Expenses if Transactions endpoint is empty or not available
            const apiTransactions = (Array.isArray(transactionsResp.data) ? transactionsResp.data : (transactionsResp.data as any)?.items || []) as Transaction[];
            
            if (!transactionsResp.success || apiTransactions.length === 0) {
              const generatedIncome = fetchedBookings
                .filter(b => b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'completed')
                .map((b: any) => ({
                  id: `t-inc-${b.booking_id || b.id}`,
                  date: new Date(b.created_at || Date.now()).toISOString().split('T')[0],
                  description: `Booking - ${b.user_name || b.walk_in_guest_name || 'Guest'} (Room)`,
                  amount: parseFloat(b.total_price || 0),
                  type: 'income',
                  status: 'Completed',
                  method: b.payment_id ? 'Online' : 'Cash'
                }));

              const fetchedExpenses = (expensesResp.success ? (expensesResp.data?.items || []) : []) as any[];
              const generatedExpenses = fetchedExpenses.map((e: any) => ({
                id: `t-exp-${e.expense_id || e.id}`,
                date: new Date(e.expense_date || e.created_at || Date.now()).toISOString().split('T')[0],
                description: e.description || e.category || 'Expense',
                amount: parseFloat(e.amount || 0),
                type: 'expense',
                status: 'Completed',
                method: 'Cash'
              }));
              
              const combinedTransactions = [...generatedIncome, ...generatedExpenses].sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
              );

              setRecentTransactions(combinedTransactions);
              setDataTotals(prev => ({ ...prev, transactions: combinedTransactions.length }));
              
              const total = generatedIncome.reduce((acc: number, t: any) => acc + t.amount, 0);
              setTotalRevenue(total);
            } else {
              setRecentTransactions(apiTransactions);
              setDataTotals(prev => ({ ...prev, transactions: (transactionsResp.data as any)?.total || apiTransactions.length }));
              
              const total = apiTransactions.reduce((acc: number, t: Transaction) => 
                t.status === 'Completed' && (t.type === 'income' || t.type === 'Revenue') ? acc + (Number(t.amount) || 0) : acc, 0);
              setTotalRevenue(total);
            }
          } else {
            // Fallbacks if bookings fails
            if (guestsResp.success) {
              const guests = (Array.isArray(guestsResp.data) ? guestsResp.data : (guestsResp.data as any)?.items || []) as Guest[];
              setGuestsData(guests);
              setDataTotals(prev => ({ ...prev, guests: (guestsResp.data as any)?.total || guests.length }));
            }
            if (transactionsResp.success) {
              const transactions = (Array.isArray(transactionsResp.data) ? transactionsResp.data : (transactionsResp.data as any)?.items || []) as Transaction[];
              setRecentTransactions(transactions);
              setDataTotals(prev => ({ ...prev, transactions: (transactionsResp.data as any)?.total || transactions.length }));
            }
          }
          
          if (staffResp.success) {
            const fetchedStaff = (Array.isArray(staffResp.data) ? staffResp.data : (staffResp.data as any)?.items || []) as Staff[];
            const totalStaff = (staffResp.data as any)?.total || fetchedStaff.length;
            setStaffData(fetchedStaff);
            setDataTotals(prev => ({ ...prev, staff: totalStaff }));
          }
          if (expensesResp.success) {
            const expenses = expensesResp.data?.items || [];
            setExpensesData(expenses);
            setTotalExpenses(expensesResp.data?.totalExpenses || 0);
            setDataTotals(prev => ({ ...prev, expenses: expensesResp.data?.total || expenses.length }));
          }

          // Update property settings state
          if (ui?.setPropertySettings) {
            ui.setPropertySettings({
              name: userPension.name || '',
              address: userPension.address || '',
              description: userPension.description || '',
              email: userPension.email || '',
              phone: userPension.phone || '',
              capacity: userPension.capacity ? String(userPension.capacity) : '',
              imageUrl: userPension.image_url || '',
              ownerInfo: userPension.owner_info || '',
              roomDetails: userPension.room_details || '',
              amenities: Array.isArray(userPension.amenities) ? userPension.amenities : [],
            });
          }
        } else {
          console.warn('⚠️ No pension found for user:', user.id);
        }
      }
    } catch (err: any) {
      console.error('❌ Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user, ui?.pagination]);

  useEffect(() => {
    loadRealData();
  }, [loadRealData]);

  return {
    loading,
    error,
    pensions,
    packages,
    roomsData,
    bookings,
    staffData,
    guestsData,
    recentTransactions,
    expensesData,
    totalRevenue,
    totalExpenses,
    actualRoomStats,
    selectedPensionId,
    dataTotals,
    setSelectedPensionId,
    setPensions,
    setPackages,
    setRoomsData,
    setBookings,
    setStaffData,
    setGuestsData,
    setRecentTransactions,
    setExpensesData,
    setTotalRevenue,
    setTotalExpenses,
    loadRealData
  };
};
