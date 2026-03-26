import { MapPin, Search, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import heroBg from "@/assets/hero-bg.png";
import { useLanguage } from "@/hooks/use-language";

const HeroSection = () => {
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
    <section className="relative w-full h-screen min-h-screen flex items-center pt-16 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-foreground/60" />

      <div className="relative container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm text-primary-foreground px-4 py-2 rounded-full mb-6 text-sm font-medium border border-primary/30">
          <MapPin className="w-4 h-4" />
          {t.hero.badge}
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-4 leading-tight">
          {t.hero.titleLine1}
          <br />
          <span className="text-accent">{t.hero.titleLine2}</span>
        </h1>

        <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-10">
          {t.hero.subtitle}
        </p>

        <div className="max-w-2xl mx-auto bg-card rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex items-center gap-2 bg-secondary rounded-xl px-4">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder={t.hero.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full py-3 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
            />
          </div>
          <Button
            variant="hero"
            size="lg"
            onClick={handleLocate}
            disabled={isLocating}
            className="rounded-xl gap-2"
          >
            {isLocating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
            {isLocating ? t.hero.finding : t.hero.findNearMe}
          </Button>
        </div>

        <p className="text-primary-foreground/60 text-xs mt-4">
          📍 {t.hero.locationNote}
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
