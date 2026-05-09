import React from 'react';
import { Home, Building, ChevronDown, LogOut, LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Pension } from '../../types/dashboard';

interface SidebarLink {
  id: string;
  labelKey: string;
  icon: string;
  sublinks?: { id: string; labelKey: string; icon: string; }[];
}

interface DashboardSidebarProps {
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settingsExpanded: boolean;
  setSettingsExpanded: (expanded: boolean) => void;
  pensions: Pension[];
  user: any;
  selectedPensionId: string;
  handlePensionSelectionChange: (id: string) => void;
  handleLogout: () => void;
  navigate: (path: string) => void;
  sidebarLinks: SidebarLink[];
  getIcon: (name: string) => LucideIcon;
  t: any;
  isPensionOwner: () => boolean;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  mobileSidebarOpen,
  setMobileSidebarOpen,
  activeTab,
  setActiveTab,
  settingsExpanded,
  setSettingsExpanded,
  pensions,
  user,
  selectedPensionId,
  handlePensionSelectionChange,
  handleLogout,
  navigate,
  sidebarLinks,
  getIcon,
  t,
  isPensionOwner
}) => {
  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-64 border-r bg-white shadow-sm z-50 transform transition-transform duration-300 ease-in-out flex-shrink-0 overflow-hidden ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:top-0`}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center px-6 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Home className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">PensionHub</span>
            </div>
          </div>

          {(
            (isPensionOwner() && pensions.filter(p => String(p.owner_id) === String(user?.id)).length > 1) || 
            (user?.role?.toLowerCase() === 'admin' && pensions.length > 0)
          ) && (
            <div className="px-4 py-3 border-b border-slate-100">
              <Select value={selectedPensionId} onValueChange={handlePensionSelectionChange}>
                <SelectTrigger className="w-full h-9 bg-slate-50 border-slate-200 hover:bg-white focus:ring-2 focus:ring-primary/20 transition-all">
                  <SelectValue placeholder="Select Pension" />
                </SelectTrigger>
                <SelectContent className="w-64 max-h-60 overflow-y-auto">
                  {pensions
                    .filter(p => user?.role?.toLowerCase() === 'admin' || String(p.owner_id) === String(user?.id))
                    .map((pension) => (
                      <SelectItem 
                        key={String(pension.pension_id || pension.id)} 
                        value={String(pension.pension_id || pension.id)}
                      >
                        <div className="flex items-center gap-2 py-1">
                          <Building className="h-4 w-4 text-slate-500" />
                          <div className="flex-1 min-w-0">
                            <span className="truncate text-sm font-medium">{pension.name}</span>
                            <div className="text-xs text-slate-500">
                              {pension.address || 'Main Location'}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <nav className="flex-1 space-y-1.5 px-3 py-6">
            {sidebarLinks.map((link) => {
              const Icon = getIcon(link.icon);
              const isActive = activeTab === link.id || (link.id === "settings" && activeTab.startsWith("settings-"));

              if (link.id === "settings" && link.sublinks) {
                return (
                  <div key={link.id} className="space-y-1">
                    <button
                      onClick={() => setSettingsExpanded(!settingsExpanded)}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {t.sidebar[link.labelKey]}
                      <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${settingsExpanded ? "rotate-180" : ""}`} />
                    </button>

                    {settingsExpanded && (
                      <div className="ml-2 space-y-0.5">
                        {link.sublinks.map((sub) => {
                          const SubIcon = getIcon(sub.icon);
                          const isSubActive = activeTab === `settings-${sub.id}`;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setActiveTab(`settings-${sub.id}`);
                                setMobileSidebarOpen(false);
                              }}
                              className={`flex w-full items-center gap-3 rounded-lg px-4 py-2 text-[13px] font-bold transition-all duration-200 ${isSubActive
                                ? "text-primary bg-primary/10"
                                : "text-slate-600 hover:bg-white hover:text-primary"
                                }`}
                            >
                              <SubIcon className="h-3.5 w-3.5" />
                              {t.sidebar[sub.labelKey]}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setSettingsExpanded(false);
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.sidebar[link.labelKey]}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-600 hover:bg-white hover:text-primary transition-colors font-medium text-sm"
              onClick={() => {
                navigate("/");
                setMobileSidebarOpen(false);
              }}
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
