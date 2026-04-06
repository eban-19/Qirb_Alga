import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { adminSidebarLinks, getAdminIcon, getBadgeVariant } from '@/data/mock/adminSidebarData';

interface AdminSidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  className, 
  collapsed = false, 
  onToggleCollapse,
  isMobile = false,
  onCloseMobile
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActiveLink = (href: string) => {
    if (href === '/dashboard/admin') {
      return location.pathname === href || location.pathname.startsWith('/dashboard/admin');
    }
    return location.pathname === href;
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-all duration-300",
        isMobile ? "w-64" : cn(
          "hidden md:flex",
          collapsed ? "w-16" : "w-64"
        ),
        className
      )}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className={cn(
            "flex items-center justify-between transition-all duration-300",
            collapsed && !isMobile && "justify-center"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              {(!collapsed || isMobile) && (
                <div>
                  <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                  <p className="text-xs text-slate-400">Management System</p>
                </div>
              )}
            </div>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {adminSidebarLinks.map((link) => {
            const Icon = getAdminIcon(link.icon);
            const active = isActiveLink(link.href);
            const badgeVariant = getBadgeVariant(link.badge);
            
            return (
              <Tooltip key={link.id} delayDuration={collapsed && !isMobile ? 0 : 1000}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleNavigation(link.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                      active
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white",
                      (collapsed && !isMobile) && "justify-center px-3"
                    )}
                  >
                    {/* Background Effect */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                      active && "opacity-100"
                    )} />
                    
                    {/* Icon */}
                    <div className={cn(
                      "relative z-10 flex-shrink-0",
                      active && "text-white"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    {/* Label */}
                    {(!collapsed || isMobile) && (
                      <div className="relative z-10 flex-1 text-left">
                        <div className="font-medium">{link.label}</div>
                        {link.description && (
                          <div className="text-xs opacity-70">{link.description}</div>
                        )}
                      </div>
                    )}
                    
                    {/* Badge */}
                    {(!collapsed || isMobile) && link.badge && (
                      <div className="relative z-10">
                        <Badge variant={badgeVariant} className="text-xs">
                          {link.badge}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Active Indicator */}
                    {active && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg" />
                    )}
                  </button>
                </TooltipTrigger>
                {collapsed && !isMobile && (
                  <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                    <div className="font-medium">{link.label}</div>
                    {link.description && (
                      <div className="text-xs text-slate-400">{link.description}</div>
                    )}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-lg bg-slate-700/30",
            collapsed && "justify-center"
          )}>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin User</p>
                <p className="text-xs text-slate-400 truncate">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AdminSidebar;
