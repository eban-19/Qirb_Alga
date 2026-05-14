import {
  LayoutDashboard,
  Users,
  Building,
  CheckCircle,
  CalendarCheck,
  Bell,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Settings,
  Shield,
  AlertTriangle,
  CreditCard
} from 'lucide-react';

export interface SidebarLink {
  id: string;
  label: string;
  icon: string;
  href?: string;
  badge?: string | null;
  children?: SidebarLink[];
  isParent?: boolean;
  isStatic?: boolean;
}

export const adminSidebarLinks: SidebarLink[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "LayoutDashboard",
    href: "/dashboard/admin",
    badge: null
  },
  {
    id: "owners",
    label: "Owners",
    icon: "Users",
    href: "/dashboard/admin/owners",
    badge: null
  },
  {
    id: "properties",
    label: "Properties",
    icon: "Building",
    href: "/dashboard/admin/properties",
    badge: null
  },
  {
    id: "approvals",
    label: "Pension Approvals",
    icon: "CheckCircle",
    href: "/dashboard/admin/approvals",
    badge: null
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: "CalendarCheck",
    href: "/dashboard/admin/bookings",
    badge: null
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: "Bell",
    href: "/dashboard/admin/alerts",
    badge: null // No badge since notifications are in header
  },
  {
    id: "payments",
    label: "Payments & Plans",
    icon: "CreditCard",
    href: "/dashboard/admin/payments",
    badge: null
  },
  {
    id: "system-settings",
    label: "System Settings",
    icon: "Settings",
    href: "/dashboard/admin/settings",
    badge: null
  }
];

export const updateAlertsBadge = (count: number): SidebarLink[] => {
  return adminSidebarLinks.map(link =>
    link.id === "alerts" ? { ...link, badge: count.toString() } : link
  );
};

export const getAdminIcon = (iconName: string) => {
  const icons: { [key: string]: any } = {
    LayoutDashboard,
    Users,
    Building,
    CheckCircle,
    CalendarCheck,
    Bell,
    ChevronDown,
    ChevronRight,
    TrendingUp,
    Settings,
    Shield,
    AlertTriangle,
    CreditCard
  };
  return icons[iconName] || LayoutDashboard;
};

export const getBadgeVariant = (badgeType: string | null) => {
  // YouTube-style notification colors
  if (!badgeType || badgeType === "0") return null;

  const count = parseInt(badgeType);
  if (count > 0) {
    return "destructive"; // Red color like YouTube notifications
  }
  return null;
};
