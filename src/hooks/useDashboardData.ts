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
  
  // Stats State
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [actualRoomStats, setActualRoomStats] = useState({ totalRooms: 0, availableRooms: 0 });
  const [selectedPensionId, setSelectedPensionId] = useState<string>('');

  const loadRealData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Loading Dashboard Data for user:', user.id);
      
      // 1. Fetch Pensions
      let pensionsResp;
      if (user.role?.toLowerCase() === 'admin') {
        pensionsResp = await apiService.getAdminPensions();
      } else {
        pensionsResp = await apiService.getPensions();
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
          
          // 2. Fetch Pension-specific data
          const results = await Promise.allSettled([
            apiService.getPackages(pensionId),
            apiService.getRooms(pensionId),
            apiService.getBookings({ pension_id: pensionId }),
            apiService.getGuests(pensionId),
            apiService.getStaff(pensionId),
            apiService.getExpenses(pensionId)
          ]);

          const packagesResp = results[0].status === 'fulfilled' ? results[0].value : { success: false, data: [] };
          const roomsResp = results[1].status === 'fulfilled' ? results[1].value : { success: false, data: [] };
          const bookingsResp = results[2].status === 'fulfilled' ? results[2].value : { success: false, data: [] };
          const guestsResp = results[3].status === 'fulfilled' ? results[3].value : { success: false, data: [] };
          const staffResp = results[4].status === 'fulfilled' ? results[4].value : { success: false, data: [] };
          const expensesResp = results[5].status === 'fulfilled' ? results[5].value : { success: false, data: [] };

          if (results.some(r => r.status === 'rejected')) {
            console.warn('Some dashboard endpoints failed to load', results.filter(r => r.status === 'rejected'));
          }

          if (packagesResp.success) setPackages(packagesResp.data || []);
          if (roomsResp.success) {
            const rooms = (Array.isArray(roomsResp.data) ? roomsResp.data : (roomsResp.data as any)?.items || []) as Room[];
            setRoomsData(rooms);
            setActualRoomStats({
              totalRooms: rooms.length,
              availableRooms: rooms.filter((r: Room) => (r.availability_status || r.status) === 'Available').length
            });
          }
          if (bookingsResp.success) {
            const fetchedBookings = (Array.isArray(bookingsResp.data) ? bookingsResp.data : (bookingsResp.data as any)?.items || []) as Booking[];
            setBookings(fetchedBookings);
            
            // Map Guests from Bookings if Guests endpoint is empty
            if (!guestsResp.success || !guestsResp.data || (Array.isArray(guestsResp.data) && guestsResp.data.length === 0)) {
              const uniqueGuestsMap = new Map();
              fetchedBookings.forEach((b: any) => {
                const customer = b.customer;
                if (customer) {
                  const guestId = customer.user_id || customer.id || b.customer_id;
                  if (!uniqueGuestsMap.has(guestId)) {
                    uniqueGuestsMap.set(guestId, {
                      id: guestId,
                      name: customer.full_name || 'Unknown Guest',
                      email: customer.email || 'N/A',
                      phone: customer.phone || 'N/A',
                      nationality: 'Ethiopian',
                      room_number: b.room_number || b.room?.room_number || b.room?.room_type || 'N/A',
                      roomId: b.room_id,
                      status: b.status === 'Confirmed' ? 'Checked In' : (b.status === 'Completed' ? 'Checked Out' : 'Pending'),
                      totalBookings: 1,
                      totalSpent: parseFloat(b.total_price) || 0
                    });
                  } else {
                    const existing = uniqueGuestsMap.get(guestId);
                    existing.totalBookings += 1;
                    existing.totalSpent += parseFloat(b.total_price) || 0;
                  }
                }
              });
              setGuestsData(Array.from(uniqueGuestsMap.values()));
            } else {
              setGuestsData((Array.isArray(guestsResp.data) ? guestsResp.data : (guestsResp.data as any)?.items || []) as Guest[]);
            }

            // Map Transactions from Bookings if Transactions endpoint is empty
            const transResp = await apiService.getTransactions(pensionId);
            if (!transResp.success || !transResp.data || (Array.isArray(transResp.data) && transResp.data.length === 0)) {
              const generatedTransactions = fetchedBookings.map((b: any) => ({
                id: b.booking_id || b.id,
                date: new Date(b.created_at).toISOString().split('T')[0],
                description: `Booking - ${b.customer?.full_name || 'Unknown'} (Room)`,
                amount: parseFloat(b.total_price) || 0,
                type: 'income',
                status: b.status === 'Confirmed' ? 'Completed' : 'Pending',
                method: b.payment_method || 'Cash'
              }));
              setRecentTransactions(generatedTransactions);
              
              const total = generatedTransactions.reduce((acc: number, t: any) => 
                t.status === 'Completed' ? acc + t.amount : acc, 0);
              setTotalRevenue(total);
            } else {
              const fetchedTransactions = (Array.isArray(transResp.data) ? transResp.data : (transResp.data as any)?.items || []) as Transaction[];
              setRecentTransactions(fetchedTransactions);
              const total = fetchedTransactions.reduce((acc: number, t: Transaction) => 
                t.status === 'Completed' ? acc + (Number(t.amount) || 0) : acc, 0);
              setTotalRevenue(total);
            }
          } else {
            // Fallbacks if bookings fails
            if (guestsResp.success) {
              setGuestsData((Array.isArray(guestsResp.data) ? guestsResp.data : (guestsResp.data as any)?.items || []) as Guest[]);
            }
            const transResp = await apiService.getTransactions(pensionId);
            if (transResp.success) {
              const fetchedTransactions = (Array.isArray(transResp.data) ? transResp.data : (transResp.data as any)?.items || []) as Transaction[];
              setRecentTransactions(fetchedTransactions);
            }
          }
          
          if (staffResp.success) {
            const fetchedStaff = (Array.isArray(staffResp.data) ? staffResp.data : (staffResp.data as any)?.items || []) as Staff[];
            setStaffData(fetchedStaff);
          }
          if (expensesResp.success) {
            setExpensesData(expensesResp.data?.items || []);
            setTotalExpenses(expensesResp.data?.totalExpenses || 0);
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
  }, [user]);

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
