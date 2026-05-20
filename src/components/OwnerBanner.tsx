import { Building2, TrendingUp, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useNavigate } from "react-router-dom";

const benefitIcons = [Users, TrendingUp, Zap] as const;

const OwnerBanner = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-primary" id="owner-cta">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground px-4 py-2 rounded-full mb-6 text-sm font-medium">
            <Building2 className="w-4 h-4" />
            {t.ownerBanner.badge}
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            {t.ownerBanner.title}
          </h2>
          <p className="text-primary-foreground/70 max-w-lg mx-auto">
            {t.ownerBanner.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          {t.ownerBanner.benefits.map((b, i) => {
            const Icon = benefitIcons[i];

            return (
              <div key={b.title} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-primary-foreground text-lg mb-2">
                {b.title}
              </h3>
              <p className="text-primary-foreground/60 text-sm">{b.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button onClick={() => navigate("/register-property")} variant="accent" size="lg" className="rounded-xl text-base px-4 sm:px-8 shadow-lg hover:scale-105 transition-transform mr-4 sm:mr-0 mx-4 sm:mx-0">
            {t.ownerBanner.cta}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OwnerBanner;
