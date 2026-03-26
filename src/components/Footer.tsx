import { MapPin, Facebook, Twitter, Instagram, Send } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-2xl font-bold text-white tracking-tight">
                Qirb <span className="text-primary">Alga</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              {t.footer.tagline}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#rooms" className="text-sm hover:text-primary transition-colors inline-block hover:translate-x-1 duration-200">
                  {t.navbar.howItWorks}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors inline-block hover:translate-x-1 duration-200">
                  {t.footer.about}
                </a>
              </li>
              <li>
                <a href="/register-property" className="text-sm hover:text-primary transition-colors inline-block hover:translate-x-1 duration-200">
                  {t.footer.forOwners}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Support Column */}
          <div>
            <h4 className="text-white font-semibold mb-6">
              {t.footer.support}
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors inline-block hover:translate-x-1 duration-200">
                  {t.footer.contact}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors inline-block hover:translate-x-1 duration-200">
                  {t.footer.privacy}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors inline-block hover:translate-x-1 duration-200">
                  {t.footer.terms}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter / CTA Column */}
          <div>
            <h4 className="text-white font-semibold mb-6">Stay Updated</h4>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Get the latest deals and new pension listings right in your inbox.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary w-full placeholder:text-slate-500"
              />
              <Button size="icon" variant="default" className="shrink-0 rounded-lg">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {currentYear} Qirb Alga. {t.footer.rights}
          </p>
          <div className="flex items-center gap-2">
            <span>🇪🇹</span> Made in Ethiopia
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
