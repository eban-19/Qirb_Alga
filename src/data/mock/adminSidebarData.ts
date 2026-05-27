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
  CreditCard,
  User
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
    id: "users",
    label: "Users",
    icon: "Users",
    isParent: true,
    children: [
      {
        id: "owners",
        label: "Owners",
        icon: "Building",
        href: "/dashboard/admin/owners"
      },
      {
        id: "customers",
        label: "Customers",
        icon: "Users",
        href: "/dashboard/admin/customers"
      },
      {
        id: "staffs",
        label: "Admin Staffs",
        icon: "Shield",
        href: "/dashboard/admin/staffs"
      }
    ]
  },
  {
    id: "pensions",
    label: "Pensions",
    icon: "Building",
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

  // {
  //   id: "alerts",
  //   label: "Alerts",
  //   icon: "Bell",
  //   href: "/dashboard/admin/alerts",
  //   badge: null // No badge since notifications are in header
  // },
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
    isParent: true,
    children: [
      {
        id: "settings-account",
        label: "Account",
        icon: "User",
        href: "/dashboard/admin/settings/account"
      },
      {
        id: "settings-financial",
        label: "Financial (VAT)",
        icon: "CreditCard",
        href: "/dashboard/admin/settings/financial"
      },
      {
        id: "settings-security",
        label: "Security",
        icon: "Shield",
        href: "/dashboard/admin/settings/security"
      },
      {
        id: "settings-payouts",
        label: "Payout Methods",
        icon: "CreditCard",
        href: "/dashboard/admin/settings/payouts"
      },
      {
        id: "settings-subscription-policies",
        label: "Subscription Policies",
        icon: "Shield",
        href: "/dashboard/admin/settings/subscription-policies"
      }
    ]
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
    CreditCard,
    User
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
