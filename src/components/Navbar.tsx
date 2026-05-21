import { useState } from "react";
import { MapPin, Globe, Search, CheckCircle, XCircle, FileSearch, Calendar, Building, BedDouble, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/use-language";
import type { Language } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { language, setLanguage, options, t } = useLanguage();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [trackId, setTrackId] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackError, setTrackError] = useState("");

  const handleTrackBooking = async () => {
    if (!trackId.trim()) return;

    setTrackLoading(true);
    setTrackError("");
    setTrackResult(null);

    // Strip out # or BKG- if user typed them
    const cleanId = trackId.replace(/[^0-9]/g, '');

    try {
      const response = await fetch(`http://localhost:3006/api/public/bookings/${cleanId}/status`);
      const data = await response.json();

      if (data.success) {
        setTrackResult(data.data);
      } else {
        setTrackError(data.message || "Booking not found.");
      }
    } catch (error) {
      setTrackError("Failed to connect to the server.");
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold text-foreground">
            Qirb <span className="text-primary">Alga</span>
          </span>
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-2 gap-1.5 rounded-full text-muted-foreground hover:bg-slate-50" aria-label={t.navbar.languageLabel}>

                {options.find(opt => opt.value === language) && (
                  <img
                    src={options.find(opt => opt.value === language)?.flag}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover border border-slate-200 shadow-sm"
                  />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[220px] rounded-2xl shadow-xl border-slate-100 p-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
              {options.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setLanguage(option.value as Language)}
                  className={`cursor-pointer font-semibold gap-3 p-3 rounded-xl focus:bg-slate-50 transition-colors ${language === option.value ? "bg-primary/5 text-primary font-bold" : "text-slate-600"}`}
                >
                  <img
                    src={option.flag}
                    alt=""
                    className="w-5.5 h-5.5 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
                    style={{ width: '22px', height: '22px' }}
                  />
                  <span className="truncate flex-1">{option.label}</span>
                  {language === option.value && (
                    <span className="text-primary font-bold text-sm mr-1">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>



          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex text-muted-foreground"
            onClick={() => {
              const howItWorksSection = document.getElementById("how-it-works");
              if (howItWorksSection) {
                howItWorksSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            {t.navbar.howItWorks}
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-100 shadow-sm transition-colors focus-visible:ring-0">
                  <span className="font-bold text-blue-600 text-lg">
                    {user?.full_name?.charAt(0).toUpperCase() || <User className="w-5 h-5 text-blue-600" />}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-2xl shadow-xl border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-300 mt-2">
                <div className="px-3 py-2.5 mb-1.5 border-b border-slate-100 bg-slate-50/50 rounded-lg">
                  <p className="font-bold text-sm text-slate-800 truncate">{user?.full_name || 'Guest User'}</p>
                  <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{user?.phone || user?.email}</p>
                </div>

                {user?.role?.toLowerCase() === 'customer' ? (
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer font-semibold p-3 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700 gap-3 transition-colors focus:bg-blue-50 focus:text-blue-700"
                  >
                    <User className="w-4.5 h-4.5" />
                    Profile
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => navigate(user?.role?.toLowerCase() === 'admin' ? "/dashboard/admin" : "/dashboard")}
                    className="cursor-pointer font-semibold p-3 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700 gap-3 transition-colors focus:bg-blue-50 focus:text-blue-700"
                  >
                    <Building className="w-4.5 h-4.5" />
                    Dashboard
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="cursor-pointer font-semibold p-3 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-3 transition-colors mt-1 focus:bg-rose-50 focus:text-rose-700"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  {t.booking?.logout || "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground whitespace-nowrap"
              onClick={() => navigate("/login")}
            >
              {t.navbar?.login || "Login"}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
