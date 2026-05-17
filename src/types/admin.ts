export interface PensionOwner {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessId: string;
  status: "pending" | "verified" | "approved" | "rejected" | "suspended";
  registrationDate: string;
  totalProperties: number;
  totalRevenue: number;
  rating: number;
  documentStatus: "pending" | "approved" | "rejected";
  lastActive: string;
}

export interface AdminBooking {
  id: string;
  propertyName: string;
  pensionId?: string | null;
  ownerId?: string | null;
  ownerName: string;
  ownerEmail?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "refunded";
  specialRequests?: string;
  createdAt: string;
}

export interface SystemAlert {
  id: string;
  type: "verification" | "payment" | "complaint" | "system" | "pension_approval";
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "resolved" | "investigating";
  createdAt: string;
  relatedEntity?: string;
  entityType?: "owner" | "property" | "booking" | "guest";
}

export interface MonthlyAnalytic {
  month: string;
  bookings: number;
  revenue: number;
}

export interface PlatformMetrics {
  totalOwners: number;
  totalProperties: number;
  totalBookings: number;
  totalUsers?: number;
  monthlyRevenue: number;
  occupancyRate: number;
  pendingVerifications: number;
  activeProperties: number;
  averageRating: number;
  pendingPensions?: number;
  monthlyAnalytics?: MonthlyAnalytic[];
}


export interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down';
  };
  bookings: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down';
  };
  properties: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down';
  };
  users: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down';
  };
}

export interface TopProperty {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
  occupancyRate: number;
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'registration' | 'payment' | 'review';
  description: string;
  timestamp: string;
  amount?: number;
}
