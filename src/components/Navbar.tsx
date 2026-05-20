import { useState } from "react";
import { MapPin, Globe, Search, CheckCircle, XCircle, FileSearch, Calendar, Building, BedDouble, LogIn, LogOut } from "lucide-react";
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
            <DropdownMenuContent align="end" className="min-w-[220px] rounded-2xl shadow-xl border-slate-100 p-1.5 animate-in fade-in zoom-in-95 duration-200">
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
            <div className="flex items-center gap-2">
              {user?.role?.toLowerCase() === 'customer' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex text-muted-foreground font-bold"
                  onClick={() => navigate("/profile")}
                >
                  My Stays
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex text-muted-foreground"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                {t.booking?.logout || "Logout"}
              </Button>
            </div>
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
