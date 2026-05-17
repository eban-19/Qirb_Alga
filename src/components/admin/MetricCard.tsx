import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Route } from "react-router-dom";


interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

export function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
  return (
    <Card className={`
      ${color} 
      border-2 border-slate-200 
      shadow-lg 
      hover:shadow-2xl 
      hover:scale-105 
      hover:border-slate-400
      transform 
      transition-all 
      duration-300 
      ease-in-out
      cursor-pointer
      relative
      overflow-hidden
      group
    `}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700 mb-1 group-hover:text-slate-900 transition-colors">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors">
              {value}
            </p>
            {change !== undefined && (
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${change >= 0
                ? "bg-green-100 text-green-700 group-hover:bg-green-200"
                : "bg-red-100 text-red-700 group-hover:bg-red-200"
                } transition-colors`}>
                {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% from last month
              </div>
            )}
          </div>
          <div className={`
            p-4 rounded-xl 
            bg-white/90 
            shadow-md 
            group-hover:shadow-lg 
            group-hover:scale-110 
            transform 
            transition-all 
            duration-300
            border border-slate-200
          `}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
