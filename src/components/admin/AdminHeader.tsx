import { Shield, Globe } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import type { Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AdminHeader = () => {
  const { language, setLanguage, options, t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 md:p-6 shadow-xl fixed top-0 left-0 right-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-lg md:text-2xl font-bold">{t.sidebar?.adminPanel || "Pension Platform Admin"}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-2 gap-1.5 rounded-full text-blue-100 hover:bg-white/10 hover:text-white border border-white/20">

                {options.find(opt => opt.value === language) && (
                  <img
                    src={options.find(opt => opt.value === language)?.flag}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover border border-white/20 shadow-sm"
                  />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[220px] rounded-2xl shadow-xl border-slate-100 p-1.5">
              {options.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setLanguage(option.value as Language)}
                  className={`cursor-pointer font-semibold gap-3 p-3 rounded-xl focus:bg-slate-50 transition-colors ${language === option.value ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600"}`}
                >
                  <img
                    src={option.flag}
                    alt=""
                    className="w-5.5 h-5.5 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
                    style={{ width: '22px', height: '22px' }}
                  />
                  <span className="truncate flex-1">{option.label}</span>
                  {language === option.value && (
                    <span className="text-blue-600 font-bold text-sm mr-1">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
