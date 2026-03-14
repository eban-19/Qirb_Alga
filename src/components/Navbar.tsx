import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import type { Language } from "@/lib/i18n";

const Navbar = () => {
  const { language, setLanguage, options, t } = useLanguage();

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
          <label className="flex items-center gap-2 text-xs text-muted-foreground" htmlFor="language-switcher">
            <span className="hidden md:inline">{t.navbar.languageLabel}</span>
            <select
              id="language-switcher"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="h-8 md:h-9 rounded-md border border-border bg-background px-1 md:px-2 text-xs md:text-sm text-foreground outline-none"
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

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
          <Button variant="accent" size="sm">
            {t.navbar.listProperty}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
