export interface StaffMember {
  id: string;
  full_name: string; // matches database column
  name: string;      // keeping for backward compatibility if needed in UI
  role: string;
  department: string;
  email: string;
  phone: string;
  salary: number;
  status: 'Active' | 'On Leave' | 'Inactive' | 'active' | 'inactive' | 'on leave';
  joinDate?: string;
  avatar?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  date: string;
  amount: number;
  status?: string;
}

export interface Room {
  id: string;
  type: string;
  floor: number;
  price: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  capacity: number;
  amenities: string[];
  image?: string;
  model3D?: string;
  pensionId: string;        // Link to pension profile
  packageId?: string;       // Assigned package
  roomNumber: string;       // Display number (e.g., "101")
}

export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  roomId: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  totalAmount: number;
  guests: number;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  checkIn: string;
  checkOut: string;
  roomId: string;
  status: 'Checked In' | 'Checked Out' | 'Reserved';
  totalBookings: number;
  totalSpent: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
  occupancy: number;
}

export interface DashboardStats {
  totalStaff: number;
  totalRooms: number;
  totalBookings: number;
  totalGuests: number;
  totalRevenue: number;
  occupancyRate: number;
}

export interface ViewModes {
  staff: 'card' | 'table';
  rooms: 'card' | 'table';
  bookings: 'card' | 'table';
  guests: 'card' | 'table';
  transactions: 'card' | 'table';
}

export interface BulkUploadData {
  file: File | null;
  data: any[];
  preview: any[];
}
