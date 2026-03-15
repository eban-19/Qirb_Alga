import { Smartphone, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

const AppDownload = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background border-y border-border/50">
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 max-w-6xl mx-auto">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary/10 text-primary px-5 py-2.5 rounded-full mb-6 text-sm font-semibold shadow-sm border border-primary/20 backdrop-blur-sm">
              <Smartphone className="w-4 h-4" />
              {t.appDownload.badge}
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
              {t.appDownload.title}
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0">
              {t.appDownload.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="lg" className="h-[60px] px-8 rounded-2xl w-full sm:w-auto gap-3 text-base font-semibold shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all bg-gradient-to-r from-primary to-primary/80 border-0">
                <Download className="w-6 h-6" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[10px] font-normal opacity-80 uppercase tracking-wider mb-0.5">Get it on</span>
                  <span className="text-base">{t.appDownload.googlePlay.replace('Get it on ', '')}</span>
                </div>
              </Button>
              <Button size="lg" variant="outline" className="h-[60px] px-8 rounded-2xl w-full sm:w-auto gap-3 text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-foreground text-background hover:bg-foreground/90 hover:text-background border-0">
                <Smartphone className="w-6 h-6" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[10px] font-normal opacity-70 uppercase tracking-wider mb-0.5">Download on the</span>
                  <span className="text-base">{t.appDownload.appStore.replace('Download on the ', '')}</span>
                </div>
              </Button>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                {t.appDownload.feature1}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                {t.appDownload.feature2}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                {t.appDownload.feature3}
              </div>
            </div>
          </div>

          {/* Visuals - Phone Mockup */}
          <div className="flex-1 w-full max-w-md lg:max-w-none relative z-10 flex justify-center lg:justify-end">
            <div className="relative w-[280px] h-[580px] bg-foreground rounded-[3rem] border-[8px] border-foreground shadow-2xl overflow-hidden flex flex-col transform rotate-3 hover:rotate-0 transition-transform duration-500">
              {/* Dynamic Island Notch */}
              <div className="mx-auto w-1/3 h-7 bg-foreground rounded-b-3xl absolute top-0 left-1/2 -translate-x-1/2 z-20 shadow-sm" />
              
              {/* Actual Website Screen */}
              <div className="flex-1 w-full h-full bg-background rounded-[2.5rem] overflow-hidden relative">
                <iframe 
                  src="/" 
                  className="w-full h-full border-0 pointer-events-none select-none"
                  title="Qirb Alga App Preview"
                  tabIndex={-1}
                />
              </div>
            </div>
            
            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;