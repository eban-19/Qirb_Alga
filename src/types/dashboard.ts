export interface User {
  id: string | number;
  full_name: string;
  role: string;
  email: string;
  pension_id?: string | number;
}

export interface Pension {
  id: string | number;
  pension_id?: string | number;
  name: string;
  name_en?: string;
  name_am?: string;
  name_om?: string;
  address: string;
  address_en?: string;
  address_am?: string;
  address_om?: string;
  phone: string;
  email: string;
  capacity: string | number;
  description: string;
  description_en?: string;
  description_am?: string;
  description_om?: string;
  owner_id: string | number;
  owner_info?: string;
  owner_info_en?: string;
  owner_info_am?: string;
  owner_info_om?: string;
  room_details?: string;
  room_details_en?: string;
  room_details_am?: string;
  room_details_om?: string;
  image_url?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
}

export interface Package {
  id: string | number;
  package_id?: string | number;
  name: string;
  name_en?: string;
  name_am?: string;
  name_om?: string;
  price: string | number;
  description: string;
  description_en?: string;
  description_am?: string;
  description_om?: string;
  services: string[];
  isMostPopular: boolean;
  image?: string;
  imageType?: 'Normal' | '3D';
  availableRooms?: number;
  customService?: string;
}

export interface Room {
  id: string | number;
  room_number: string;
  room_type: string;
  floor?: string;
  price_per_night: number;
  availability_status: string;
  capacity: number;
  number_of_beds: number;
  package_id?: string | number;
  status?: string; // Some parts of the code use 'status' instead of 'availability_status'
}

export interface Booking {
  id: string | number;
  booking_id?: string | number;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: string;
  total_price: number;
  room_number?: string;
  phone_number?: string;
}

export interface Staff {
  id: string | number;
  full_name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  salary: string | number;
  status: string;
  pension_id?: string | number;
}

export interface Guest {
  id: string | number;
  name: string;
  full_name?: string;
  email: string;
  phone: string;
  nationality?: string;
  room_number?: string;
  totalBookings: number;
  totalSpent: number;
  last_stay?: string;
  status: string;
}

export interface Transaction {
  id: string | number;
  date: string;
  description: string;
  guest?: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Cancelled' | string;
  method: string;
  type: 'income' | 'expense' | 'Revenue' | 'Expense' | string;
}

export interface Expense {
  id: string | number;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
}

export interface DashboardStats {
  staffCount: number;
  availableRooms: number;
  activeBookings: number;
  totalRevenue: number;
}
