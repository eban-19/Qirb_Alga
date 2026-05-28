import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, Search, LogOut, User, Settings as SettingsIcon, Bell, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminSidebar from './AdminSidebar';
import NotificationBell from '@/components/NotificationBell';

interface SystemAlert {
  id: string;
  type: "verification" | "payment" | "complaint" | "system";
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "resolved" | "investigating";
  createdAt: string;
  relatedEntity?: string;
  entityType?: "owner" | "property" | "booking" | "guest";
}

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  alerts?: SystemAlert[];
  onAlertClick?: (alertId: string) => void;
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  children,
  className,
  alerts = [],
  onAlertClick
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);
  const { user, logout } = useAuth();
  const { language: currentLang, setLanguage, options, t } = useLanguage();

  return (
    <div className={cn("flex h-screen bg-slate-50 overflow-hidden", className)}>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 shrink-0 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 py-4 shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${sidebarCollapsed ? 'gap-2' : 'gap-4'}`}>
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>

              {/* {!sidebarCollapsed && ( */}
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              {/* )} */}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">

              {/* Notifications */}
              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 px-2 gap-1.5 rounded-full text-slate-600 hover:bg-slate-100" aria-label={t.navbar.languageLabel}>

                    {options.find(opt => opt.value === currentLang) && (
                      <img
                        src={options.find(opt => opt.value === currentLang)?.flag}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover border border-slate-200 shadow-sm"
                      />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[220px] mt-2 rounded-2xl shadow-xl border-slate-100 p-1.5 animate-in fade-in zoom-in-95 duration-200">
                  {options.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setLanguage(option.value)}
                      className={`cursor-pointer font-semibold gap-3 p-3 rounded-xl focus:bg-slate-50 transition-colors ${currentLang === option.value ? "bg-primary/5 text-primary font-bold" : "text-slate-600"}`}
                    >
                      <img
                        src={option.flag}
                        alt=""
                        className="w-5.5 h-5.5 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
                        style={{ width: '22px', height: '22px' }}
                      />
                      <span className="truncate flex-1">{option.label}</span>
                      {currentLang === option.value && (
                        <span className="text-primary font-bold text-sm mr-1">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Admin Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 pl-2 border-l border-slate-200 outline-none hover:opacity-80 transition-opacity">
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-semibold text-slate-800">{user?.full_name || 'Admin User'}</p>
                      <p className="text-xs text-slate-500">Administrator</p>
                    </div>
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      <span className="text-white text-sm font-bold">{(user?.full_name || 'A')[0].toUpperCase()}</span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-xl border-slate-200">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/dashboard/admin/settings'} className="cursor-pointer gap-2 py-2">
                    <SettingsIcon className="w-4 h-4" />
                    <span>System Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/dashboard/admin/notifications'} className="cursor-pointer gap-2 py-2">
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer gap-2 py-2 text-red-600 focus:text-red-600 focus:bg-red-50">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
