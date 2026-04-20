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
    labelKey: "overview",
    icon: "LayoutDashboard",
    href: "/dashboard"
  },
  {
    id: "bookings",
    labelKey: "bookings",
    icon: "CalendarCheck",
    href: "/bookings"
  },
  {
    id: "rooms",
    labelKey: "rooms",
    icon: "BedDouble",
    href: "/rooms"
  },
  {
    id: "guests",
    labelKey: "guests",
    icon: "Users",
    href: "/guests"
  },
  {
    id: "pension-profile",
    labelKey: "pensionProfile",
    icon: "Building",
    href: "/pension-profile"
  },
  {
    id: "staff",
    labelKey: "staffHr",
    icon: "Users",
    href: "/staff"
  },
  {
    id: "transactions",
    labelKey: "transactions",
    icon: "CreditCard",
    href: "/transactions"
  },
  {
    id: "reports",
    labelKey: "reports",
    icon: "BarChart3",
    href: "/reports"
  },
  {
    id: "settings",
    labelKey: "settings",
    icon: "Settings",
    href: "/settings",
    sublinks: [
      {
        id: "business-profile",
        labelKey: "businessProfile",
        icon: "Building"
      },
      {
        id: "security",
        labelKey: "security",
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
