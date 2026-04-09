import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ 
  children, 
  className 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={cn("flex h-screen bg-slate-50 overflow-hidden", className)}>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Admin Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
            <div className="flex items-center gap-4">
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
              
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              
              {/* User Menu */}
              <div className="flex items-center gap-3">
                <button className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
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
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden">
          <div className="fixed inset-0 bg-white w-64 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            {/* Mobile Navigation */}
            <nav className="p-4 space-y-2">
              {[
                { href: '/dashboard/admin', label: 'Overview', icon: 'LayoutDashboard' },
                { href: '/dashboard/admin/owners', label: 'Owners', icon: 'Users' },
                { href: '/dashboard/admin/properties', label: 'Properties', icon: 'Building' },
                { href: '/dashboard/admin/approvals', label: 'Pension Approvals', icon: 'CheckCircle' },
                { href: '/dashboard/admin/bookings', label: 'Bookings', icon: 'CalendarCheck' },
                { href: '/dashboard/admin/alerts', label: 'Alerts', icon: 'Bell' }
              ].map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.location.href = item.href;
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-slate-100 transition-colors"
                >
                  <div className="w-5 h-5 text-slate-600">
                    {/* Simple icon representation */}
                    <div className="w-full h-full rounded bg-slate-200 flex items-center justify-center">
                      <span className="text-xs font-bold">{item.label[0]}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{item.label}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardLayout;
