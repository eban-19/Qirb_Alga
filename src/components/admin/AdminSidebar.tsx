import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { adminSidebarLinks, getAdminIcon, getBadgeVariant, SidebarLink, updateAlertsBadge } from '@/data/mock/adminSidebarData';
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
  const { logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>({
    users: true // Expand by default if needed, or based on active route
  });

  // Use static sidebar links since notifications are now in header
  const sidebarLinks = adminSidebarLinks;

  const isActiveLink = (href: string) => {
    return location.pathname === href;
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderSidebarItem = (link: SidebarLink, depth = 0) => {
    const Icon = getAdminIcon(link.icon);
    const active = link.href ? isActiveLink(link.href) : false;
    const badgeVariant = getBadgeVariant(link.badge);
    const hasChildren = link.children && link.children.length > 0;
    const isExpanded = expandedMenus[link.id];

    const toggleExpand = (e: React.MouseEvent) => {
      e.stopPropagation();
      setExpandedMenus(prev => ({
        ...prev,
        [link.id]: !prev[link.id]
      }));
    };

    // Static Dashboard label (non-clickable)
    if (link.isStatic) {
      return (
        <div key={link.id} className="mb-6">
          <div className="px-4 py-2">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {link.label}
              </span>
            </div>
          </div>
          <div className="h-px bg-slate-700/50 mx-4"></div>
        </div>
      );
    }

    return (
      <div key={link.id} className="w-full">
        <Tooltip delayDuration={collapsed && !isMobile ? 0 : 1000}>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                if (hasChildren) {
                  toggleExpand(e);
                } else if (link.href) {
                  handleNavigation(link.href);
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
                "hover:bg-slate-700/50",
                active && !hasChildren
                  ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-400"
                  : "text-slate-300 hover:text-white",
                collapsed && !isMobile && "justify-center px-3",
                depth > 0 && !collapsed && "pl-10" // Indent children
              )}
            >
            {/* Background gradient effect */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              active && "opacity-100"
            )} />

            <Icon className="w-4 h-4 relative z-10 flex-shrink-0" />

            {(!collapsed || isMobile) && (
              <>
                <span className="font-medium relative z-10 flex-1 text-left text-sm">
                  {link.label}
                </span>
                {link.badge && !hasChildren && (
                  <Badge variant={badgeVariant as any} className="relative z-10 text-xs">
                    {link.badge}
                  </Badge>
                )}
                {hasChildren && (
                  <div className="relative z-10 text-slate-400 group-hover:text-white transition-colors">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                )}
              </>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p>{link.label}</p>
        </TooltipContent>
      </Tooltip>
      
      {/* Render Children */}
      {hasChildren && isExpanded && (!collapsed || isMobile) && (
        <div className="mt-1 space-y-1">
          {link.children!.map((child) => renderSidebarItem(child, depth + 1))}
        </div>
      )}
    </div>
    );
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
              <div className={cn("w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg", collapsed && !isMobile && "hidden")}>
                {/* <svg className=" hidden w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> */}
                <svg
                  className=" w-6 h-6 text-white"

                  fill="none" stroke="currentColor" viewBox="0 0 24 24">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              {(!collapsed && !isMobile) && (
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
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => renderSidebarItem(link))}
        </nav>

        {/* Footer - Logout Button */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={logout}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-red-500/10 text-slate-400 hover:text-red-500",
              collapsed && !isMobile && "justify-center px-0"
            )}
          >
            <LogOut className={cn("w-5 h-5 transition-transform group-hover:scale-110")} />
            {(!collapsed || isMobile) && (
              <span className="font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>

    </TooltipProvider>
  );
};

export default AdminSidebar;
