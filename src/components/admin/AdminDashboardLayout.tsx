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
              
              {/* Admin Account */}
              <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">Admin User</p>
                  <p className="text-xs text-slate-600 truncate">Administrator</p>
                </div>
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
