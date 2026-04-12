import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { MapPin, Eye, Edit, Trash2, Bed, Package } from "lucide-react";

import { Room } from "@/lib/rooms";



interface PropertyCardProps {
  property: any; // Using any to match API response structure which includes address field
  onAction: (action: string, propertyId: string) => void;
}



export function PropertyCard({ property, onAction }: PropertyCardProps) {

  // Debug: Log property data structure
  console.log(`=== PROPERTY CARD DATA ===`);
  console.log('Property:', property);
  console.log('Available rooms:', property.availableRooms || 0);
  console.log('Total rooms:', property.totalRooms || 0);
  console.log('Packages:', property.packages || []);
  console.log('Packages length:', (property.packages || []).length);

  // Calculate dynamic values
  const availableRooms = property.availableRooms || 0;
  const totalRooms = property.totalRooms || 0;
  const packages = property.packages || [];
  const packagesCount = packages.length;

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

      

      <CardContent className="p-4 sm:p-6 relative z-10">

        <div className="flex items-start justify-between">

          <div className="flex-1 min-w-0">

            <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">

              {property.name}

            </h3>

            <p className="font-medium text-slate-700 mb-3 group-hover:text-slate-900 transition-colors line-clamp-2">

              {property.description}

            </p>

            

            <div className="flex items-center gap-2 mb-3">

              <div 
                className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full border-2 border-blue-300 group-hover:bg-blue-200 transition-colors cursor-pointer hover:border-blue-400"
                onClick={() => onAction('location', property.id)}
              >

                <MapPin className="w-4 h-4 text-blue-600" />

                <span className="text-sm font-semibold text-blue-800">
                  {property.address || property.locationName || property.city || property.area || 'Location'}
                </span>

              </div>

            </div>

            

            {/* Summary Info - Total Rooms and Packages */}
            <div className="flex items-center gap-4 text-sm text-slate-600 mb-3 group-hover:text-slate-700 transition-colors">
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{availableRooms}</span>
                <span>rooms available</span>
              </div>
              <span className="text-slate-400">|</span>
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4 text-purple-500" />
                <span className="font-medium">{packagesCount}</span>
                <span>packages</span>
              </div>
            </div>

          </div>

          

          <div className="flex items-center gap-2 ml-4">

            {/* <Button 

              size="sm" 

              variant="default" 

              onClick={() => onAction('view', property.id)}

              className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transform hover:scale-110 transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700"

            >

              <Eye className="w-4 h-4 mr-1" />

              View Details

            </Button> */}

            {/* <Button 

              size="sm" 

              variant="outline" 

              onClick={() => onAction('edit', property.id)}

              className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transform hover:scale-110 transition-all duration-200"

            >

              <Edit className="w-4 h-4" />

            </Button> */}

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

