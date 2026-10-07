import {
  LayoutDashboard,
  Users,
  Calendar,
  Bed,
  UserCircle,
  Building,
  ArrowLeftRight,
  BarChart3,
  Settings,
  ShieldCheck,
  Contact,
  FileCheck,
  Home,
  Package,
  Gift,
  Star,
  Tags,
  ShieldBan
} from 'lucide-react';

export const sidebarLinks = [
  { id: "overview", labelKey: "overview", icon: "LayoutDashboard" },
  { id: "bookings", labelKey: "bookings", icon: "Calendar" },
  { id: "rooms", labelKey: "rooms", icon: "Bed" },
  { id: "guests", labelKey: "guests", icon: "UserCircle" },
  { id: "staff", labelKey: "staff", icon: "Users" },
  { id: "pension-profile", labelKey: "pensionProfile", icon: "Building" },
  { id: "packages", labelKey: "packages", icon: "Package" },
  { id: "pricing-policies", labelKey: "pricingPolicies", icon: "Tags" },
  { id: "booking-policies", labelKey: "bookingPolicies", icon: "ShieldBan" },
  { id: "promotions", labelKey: "promotions", icon: "Gift" },
  { id: "reviews", labelKey: "reviews", icon: "Star" },
  { id: "transactions", labelKey: "transactions", icon: "ArrowLeftRight" },
  { id: "reports", labelKey: "reports", icon: "BarChart3" },
  {
    id: "settings",
    labelKey: "settings",
    icon: "Settings",
    sublinks: [
      { id: "business-profile", labelKey: "businessProfile", icon: "Contact" },
      { id: "bank-settings", labelKey: "bankSettings", icon: "FileCheck" },
      { id: "security", labelKey: "security", icon: "ShieldCheck" }
    ]
  }
];

export const getIcon = (name: string) => {
  const icons: any = {
    LayoutDashboard,
    Users,
    Calendar,
    CalendarCheck: Calendar,
    Bed,
    UserCircle,
    Building,
    ArrowLeftRight,
    BarChart3,
    Settings,
    ShieldCheck,
    Contact,
    FileCheck,
    Home,
    Package,
    Gift,
    Star,
    Tags,
    ShieldBan
  };
  return icons[name] || LayoutDashboard;
};
