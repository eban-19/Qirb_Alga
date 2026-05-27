// User related types
export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'super_admin' | 'admin' | 'owner' | 'manager' | 'staff';
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: Omit<User, 'password_hash'>;
  error?: string;
}

// Pension related types
export interface Pension {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  owner_id: number;
  status: 'active' | 'inactive' | 'suspended';
  rating?: number;
  total_reviews?: number;
  is_featured?: boolean;
  check_in_time?: string;
  check_out_time?: string;
  cancellation_policy?: string;
  images?: string[];
  promotions?: any[];
  packages?: any[];
  policies?: any[];
  bookingPolicy?: any;
  blackoutDates?: any[];
  availableRooms?: number;
  ownerInfo?: string;
  roomDetails?: string;
  locationName?: string;
  area?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Package related types
export interface Package {
  id: number;
  pension_id: string;
  name: string;
  display_name?: string;
  price: number;
  currency?: string;
  description?: string;
  inclusions?: string[];
  max_guests?: number;
  min_nights?: number;
  cancellation_hours?: number;
  is_most_popular?: boolean;
  is_active?: boolean;
  sort_order?: number;
  seasonal_price?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePackageRequest {
  pension_id: string;
  name: string;
  price: number;
  description?: string;
  is_most_popular?: boolean;
}

export interface UpdatePackageRequest {
  name?: string;
  price?: number;
  description?: string;
  is_most_popolar?: boolean;
  is_active?: boolean;
}

// Room related types
export interface Room {
  id: string;
  pension_id: string;
  room_number: string;
  room_type: 'single' | 'double' | 'suite' | 'deluxe' | 'family';
  floor_number: number;
  base_price: number;
  current_price: number;
  max_capacity: number;
  base_capacity: number;
  bed_count?: number;
  bathroom_type: 'private' | 'shared' | 'ensuite';
  size_sqm?: number;
  amenities?: string[];
  images?: string[];
  video_url?: string;
  package_id?: number;
  status: 'available' | 'occupied' | 'maintenance' | 'out_of_order';
  last_cleaned?: Date;
  is_featured?: boolean;
  created_at: Date;
  updated_at: Date;
}

// Booking related types
export interface Booking {
  id: number;
  booking_reference: string;
  room_id: string;
  package_id: number;
  guest_id?: number;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  guest_count: number;
  check_in_date: Date;
  check_out_date: Date;
  nights_count: number;
  base_rate: number;
  package_rate: number;
  total_amount: number;
  paid_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out' | 'no_show';
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  special_requests?: string;
  notes?: string;
  cancellation_reason?: string;
  cancellation_fee?: number;
  source: 'website' | 'phone' | 'walk_in' | 'agency';
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Socket.IO event types
export interface SocketEvents {
  'pension_update': {
    pensionId: string;
    action: 'created' | 'updated' | 'deleted';
    data: Pension;
  };
  'package_update': {
    pensionId: string;
    action: 'created' | 'updated' | 'deleted';
    data: Package;
  };
  'room_update': {
    pensionId: string;
    action: 'created' | 'updated' | 'deleted';
    data: Room;
  };
  'booking_update': {
    pensionId: string;
    action: 'created' | 'updated' | 'deleted';
    data: Booking;
  };
}

// Error types
export interface ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;
}

// Middleware types
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
  headers: Request['headers'] & {
    authorization?: string;
  };
}

// JWT Payload
export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}