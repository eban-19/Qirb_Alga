import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye, Edit, Trash2 } from "lucide-react";
import { Room } from "@/lib/rooms";

interface PropertyCardProps {
  property: Room;
  onAction: (action: string, propertyId: string) => void;
}

export function PropertyCard({ property, onAction }: PropertyCardProps) {
  return (
    <Card className={`
      border-2 border-slate-200 
      shadow-md 
      hover:shadow-xl 
      hover:border-slate-400 
      hover:scale-[1.02]
      transform 
      transition-all 
      duration-300 
      ease-in-out
      cursor-pointer
      relative
      overflow-hidden
      group
    `}>
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">
              {property.name}
            </h3>
            <p className="font-medium text-slate-700 mb-3 group-hover:text-slate-900 transition-colors line-clamp-2">
              {property.description}
            </p>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full border-2 border-blue-300 group-hover:bg-blue-200 transition-colors">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">{property.locationName}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-600 mb-3 group-hover:text-slate-700 transition-colors">
              <div className="flex items-center gap-1">
                <span className="font-medium">{property.availableRooms}</span>
                <span>rooms available</span>
              </div>
              <span className="text-slate-400">•</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">{property.packages?.length || 0}</span>
                <span>packages</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {(property.packages || []).slice(0, 3).map((pkg, index) => (
                <Badge 
                  key={index} 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-2 border-purple-700 hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
                >
                  {pkg.name}: {pkg.price.toLocaleString()} ETB
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onAction('view', property.id)}
              className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transform hover:scale-110 transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onAction('edit', property.id)}
              className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transform hover:scale-110 transition-all duration-200"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onAction('delete', property.id)}
              className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 transform hover:scale-110 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
