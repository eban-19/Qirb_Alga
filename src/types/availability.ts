export interface CheckInData {
  bookingId: number;
  actualCheckIn?: string;
  earlyCheckIn?: boolean;
  notes?: string;
}

export interface CheckOutData {
  bookingId: number;
  actualCheckOut?: string;
  earlyCheckOut?: boolean;
  notes?: string;
}

export interface AvailabilityUpdateData {
  roomId: number;
  newStatus: 'Available' | 'Occupied' | 'Maintenance' | 'Blocked';
  reason?: string;
  bookingId?: number;
}

export interface AvailabilityHistory {
  history_id: number;
  room_id: number;
  old_status: string;
  new_status: string;
  changed_by: number;
  changed_by_name?: string;
  reason: string;
  booking_id?: number;
  created_at: string;
}

export interface RoomNeedingAttention {
  room_id: number;
  room_type: string;
  availability_status: string;
  pension_id: number;
  booking_id?: number;
  customer_id?: number;
  check_in_date?: string;
  check_out_date?: string;
  actual_check_in?: string;
  actual_check_out?: string;
  early_check_in?: number;
  early_check_out?: number;
  customer_name?: string;
  days_until_checkin?: number;
  days_until_checkout?: number;
}

export interface AvailabilityResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface QuickCheckInResponse extends AvailabilityResponse {
  data?: {
    bookingId: number;
    checkInTime: string;
    earlyCheckIn: boolean;
  };
}

export interface QuickCheckOutResponse extends AvailabilityResponse {
  data?: {
    bookingId: number;
    checkOutTime: string;
    earlyCheckOut: boolean;
  };
}
