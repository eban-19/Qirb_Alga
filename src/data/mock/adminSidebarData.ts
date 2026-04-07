import {
  LayoutDashboard,
  Users,
  Building,
  CheckCircle,
  CalendarCheck,
  Bell,
  TrendingUp,
  Settings,
  Shield,
  AlertTriangle
} from 'lucide-react';

export const adminSidebarLinks = [
  {
    id: "overview",
    label: "Overview",
    icon: "LayoutDashboard",
    href: "/dashboard/admin",
    description: "System overview & metrics",
    badge: null
  },
  {
    id: "owners",
    label: "Owners",
    icon: "Users", 
    href: "/dashboard/admin/owners",
    description: "Manage pension owners",
    badge: "pending" // Will show count of pending owners
  },
  {
    id: "properties",
    label: "Properties",
    icon: "Building",
    href: "/dashboard/admin/properties", 
    description: "All pension properties",
    badge: null
  },
  {
    id: "approvals",
    label: "Pension Approvals",
    icon: "CheckCircle",
    href: "/dashboard/admin/approvals",
    description: "Pending pension approvals",
    badge: "urgent" // Will show count of pending approvals
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: "CalendarCheck",
    href: "/dashboard/admin/bookings",
    description: "All system bookings",
    badge: null
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: "Bell",
    href: "/dashboard/admin/alerts",
    description: "System alerts & notifications",
    badge: "new" // Will show count of unread alerts
  }
];

export const getAdminIcon = (iconName: string) => {
  const icons: { [key: string]: any } = {
    LayoutDashboard,
    Users,
    Building,
    CheckCircle,
    CalendarCheck,
    Bell,
    TrendingUp,
    Settings,
    Shield,
    AlertTriangle
  };
  return icons[iconName] || LayoutDashboard;
};

export const getBadgeVariant = (badgeType: string | null) => {
  switch (badgeType) {
    case "urgent":
      return "destructive";
    case "pending":
      return "secondary";
    case "new":
      return "default";
    default:
      return null;
  }
};
