import { MapPin, Search, CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const stepIcons = [MapPin, Search, CheckCircle] as const;

const HowItWorks = () => {
  const { t } = useLanguage();

  return (
    <section id="how-it-works" className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
            {t.howItWorks.title}
          </h2>
          <p className="text-muted-foreground">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {t.howItWorks.steps.map((step, i) => {
            const Icon = stepIcons[i];

            return (
              <div key={step.title} className="text-center">
              <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Icon className="w-7 h-7 text-primary" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-foreground text-lg mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
