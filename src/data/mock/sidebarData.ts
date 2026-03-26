import {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  ShieldCheck,
  Shield,
  Building
} from 'lucide-react';

export const sidebarLinks = [
  {
    id: "overview",
    label: "Overview",
    icon: "LayoutDashboard",
    href: "/dashboard"
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: "CalendarCheck",
    href: "/bookings"
  },
  {
    id: "rooms",
    label: "Rooms",
    icon: "BedDouble",
    href: "/rooms"
  },
  {
    id: "guests",
    label: "Guests",
    icon: "Users",
    href: "/guests"
  },
  {
    id: "staff",
    label: "Staff & HR",
    icon: "Users",
    href: "/staff"
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: "CreditCard",
    href: "/transactions"
  },
  {
    id: "reports",
    label: "Reports",
    icon: "BarChart3",
    href: "/reports"
  },
  {
    id: "settings",
    label: "Settings",
    icon: "Settings",
    href: "/settings",
    sublinks: [
      {
        id: "pension-profile",
        label: "Pension Profile",
        icon: "Building"
      },
      {
        id: "legal",
        label: "Legal",
        icon: "ShieldCheck"
      },
      {
        id: "billing",
        label: "Billing",
        icon: "CreditCard"
      },
      {
        id: "security",
        label: "Security",
        icon: "Shield"
      }
    ]
  }
];

export const getIcon = (iconName: string) => {
  const icons: { [key: string]: any } = {
    LayoutDashboard,
    CalendarCheck,
    BedDouble,
    Users,
    CreditCard,
    BarChart3,
    Settings,
    ShieldCheck,
    Shield,
    Building,
  };
  return icons[iconName] || Settings;
};
