import { MapPin, Search, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/hooks/use-language";

const SearchBar = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isLocating, setIsLocating] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLocate = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          navigate(`/?lat=${position.coords.latitude}&lng=${position.coords.longitude}#rooms`);
          
          // Scroll to rooms section smoothly
          const roomsSection = document.getElementById("rooms");
          if (roomsSection) {
            roomsSection.scrollIntoView({ behavior: "smooth" });
          }
        },
        (error) => {
          setIsLocating(false);
          alert("Could not get your location. Please check your browser permissions.");
        }
      );
    } else {
      setIsLocating(false);
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}#rooms`);
      const roomsSection = document.getElementById("rooms");
      if (roomsSection) {
        roomsSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 mt-8 font-sans">
      <div className="bg-card rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex items-center gap-2 bg-secondary rounded-xl px-4">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder={t.hero?.searchPlaceholder || "Search by pension name or area..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full py-3 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm font-sans"
          />
        </div>
        <Button
          variant="default"
          size="lg"
          onClick={handleLocate}
          disabled={isLocating}
          className="rounded-xl gap-2 font-sans"
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Navigation className="w-5 h-5" />
          )}
          {t.hero?.findNearMe || "Find Near Me"}
        </Button>
      </div>

      <p className="text-primary-foreground/80 text-xs mt-4 text-center font-sans">
        📍 {t.hero?.locationNote || "Get accurate location-based results"}
      </p>
    </div>
  );
};

export default SearchBar;
