import React from 'react';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import NotificationBell from '../NotificationBell';
import { TranslationText } from '../TranslationText';

interface DashboardHeaderProps {
  isSearchOpenMobile: boolean;
  setIsSearchOpenMobile: (open: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  user: any;
  language: string;
  subscriptionStatus?: any;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isSearchOpenMobile,
  setIsSearchOpenMobile,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  searchQuery,
  setSearchQuery,
  activeTab,
  user,
  language,
  subscriptionStatus
}) => {
  const isPro = subscriptionStatus?.hasActiveSubscription;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white/80 backdrop-blur-md px-4 lg:px-8 shadow-sm">
      {isSearchOpenMobile ? (
        <div className="flex items-center w-full gap-3 animate-in slide-in-from-right-4 duration-300">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setIsSearchOpenMobile(false)}
          >
            <X className="h-5 w-5 text-slate-500" />
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              autoFocus
              type="search"
              placeholder="Search bookings, rooms, guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-slate-100 pl-10 h-10 rounded-full focus-visible:ring-primary focus-visible:bg-white transition-all shadow-none"
            />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 flex-1 lg:flex-1 min-w-0">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9 text-slate-500 hover:text-primary transition-colors rounded-full bg-slate-50 flex-shrink-0"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              >
                {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              <h1 className="text-lg font-bold lg:text-xl capitalize text-slate-900 truncate">
                {activeTab === "staff" ? <TranslationText text="Staff & HR Management" language={language} /> : 
                 activeTab === "overview" ? <TranslationText text="Dashboard Overview" language={language} /> : 
                 activeTab === "availability" ? <TranslationText text="Availability Management" language={language} /> :
                 activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace("-", " ")}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex h-9 w-9 text-slate-500 hover:text-primary transition-colors rounded-full bg-slate-50"
              onClick={() => setIsSearchOpenMobile(true)}
            >
              <Search className="h-4 w-4" />
            </Button>

            <NotificationBell />

            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-semibold text-slate-800">{user?.full_name || 'Admin User'}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-500">{user?.role || 'Administrator'}</p>
                  {isPro && (
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                      PRO
                    </span>
                  )}
                </div>
              </div>
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-2 ring-slate-100">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'AU'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
