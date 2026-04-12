import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Plus, Building, MapPin, Package } from "lucide-react";

import { PropertyCard } from "./PropertyCard";

import { PropertyForm } from "./PropertyForm";

import { Room } from "@/lib/rooms";



interface PropertiesTabProps {
  properties: any[]; // Using any to match API response structure
  onPropertyAction: (action: string, propertyId: string, property?: any) => void;
}



export function PropertiesTab({ properties, onPropertyAction }: PropertiesTabProps) {

  const [showForm, setShowForm] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState<Room | undefined>();



  const handlePropertyAction = (action: string, propertyId: string, property?: any) => {
    if (action === "edit") {
      // Handle edit action
      setSelectedProperty(property);
      setShowForm(true);
    } else if (action === "delete") {
      // Handle delete action
      if (confirm("Are you sure you want to delete this property?")) {
        onPropertyAction("delete", propertyId);
      }
    } else if (action === "location") {
      // Handle location click - open Google Maps with property address
      const address = property?.address || property?.locationName || property?.city || property?.area || '';
      if (address) {
        // Encode the address for URL and open Google Maps
        const encodedAddress = encodeURIComponent(address);
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        window.open(googleMapsUrl, '_blank');
      } else {
        // Fallback if no address available
        alert('Location information not available for this property');
      }
    } else {
      onPropertyAction(action, propertyId, property);
    }
  };

  const handleSaveProperty = (property: Room) => {
    if (property.id) {
      onPropertyAction("update", property.id, property);
    } else {
      onPropertyAction("create", "", property);
    }
  };

  const handleCreateProperty = () => {
    setSelectedProperty(undefined);
    setShowForm(true);
  };



  // Safe property calculations with fallbacks

  const safeProperties = properties || [];

  const totalRooms = safeProperties.reduce((sum, p) => sum + (p?.availableRooms || 0), 0);

  const totalPackages = safeProperties.reduce((sum, p) => sum + (p?.packages?.length || 0), 0);

  const uniqueCities = new Set(safeProperties.map(p => p?.city).filter(Boolean));



  return (

    <div className="space-y-6">

      {/* Header with prominent CTA */}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mx-4 sm:mx-6 md:mx-8">

        <div className="flex flex-col items-center sm:flex-row sm:items-center gap-3 sm:gap-4">

          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white shadow-lg">

            <Building className="w-6 h-6" />

          </div>

          <div className="text-center sm:text-left">

            <h2 className="text-2xl font-bold text-slate-900">Properties Management</h2>

            <p className="text-slate-600">Manage pension properties and room packages</p>

          </div>

        </div>

        

        {/* <Button 

          onClick={handleCreateProperty}

          size="lg"

          className="

            relative

            overflow-hidden

            bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 

            hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 

            text-white 

            font-bold 

            px-8 

            py-4 

            text-lg

            shadow-xl 

            hover:shadow-2xl 

            transform 

            hover:scale-105 

            transition-all 

            duration-300

            border-2 

            border-purple-800

            rounded-xl

            before:absolute

            before:inset-0

            before:bg-gradient-to-r

            before:from-white/20

            before:to-transparent

            before:opacity-0

            hover:before:opacity-100

            before:transition-opacity

            before:duration-300

            active:scale-95

            group

          "

        >

          <span className="relative z-10 flex items-center gap-3">

            <Plus className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" />

            <span>Add New Property</span>

            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>

          </span>

        </Button> */}

      </div>



      {/* METRIC CARDS SECTION - REMOVED FOR CLEANER DISPLAY
      // The metric cards (Total Properties, Cities Covered, Room Packages, Available Rooms) 
      // have been removed from above the properties list for a cleaner interface.
      // The code is preserved and can be restored if needed in the future.
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mx-4 sm:mx-6 md:mx-8">

        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 rounded-3xl p-3 sm:p-4 md:p-6 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 cursor-pointer">

          <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="absolute -top-2 -right-2 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>

          <div className="absolute -bottom-2 -left-2 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>

          <div className="relative z-10 text-center">

            <div className="p-2 sm:p-3 md:p-4 bg-white/20 rounded-2xl backdrop-blur-sm border-2 border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 mx-auto mb-2 sm:mb-3 md:mb-4">

              <Building className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 group-hover:rotate-12 transition-transform duration-300 mx-auto" />

            </div>

            <div className="text-2xl sm:text-3xl md:text-4xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-purple-200 transition-all duration-300">

              {safeProperties.length}

            </div>

            <div className="text-xs sm:text-sm text-purple-100 font-semibold group-hover:text-white transition-colors duration-300">Total Properties</div>

            <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2">

              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>

              <div className="text-xs text-green-300 font-semibold">Active listings</div>

            </div>

          </div>

        </div>



        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 rounded-3xl p-3 sm:p-4 md:p-6 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-rotate-1 transition-all duration-500 cursor-pointer">

          <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="absolute -top-2 -right-2 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>

          <div className="absolute -bottom-2 -left-2 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>

          <div className="relative z-10 text-center">

            <div className="p-2 sm:p-3 md:p-4 bg-white/20 rounded-2xl backdrop-blur-sm border-2 border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 mx-auto mb-2 sm:mb-3 md:mb-4">

              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 group-hover:rotate-12 transition-transform duration-300 mx-auto" />

            </div>

            <div className="text-2xl sm:text-3xl md:text-4xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-blue-200 transition-all duration-300">

              {uniqueCities.size}

            </div>

            <div className="text-xs sm:text-sm text-blue-100 font-semibold group-hover:text-white transition-colors duration-300">Cities Covered</div>

            <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2">

              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>

              <div className="text-xs text-green-300 font-semibold">Wide coverage</div>

            </div>

          </div>

        </div>



        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-500 rounded-3xl p-3 sm:p-4 md:p-6 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-rotate-1 transition-all duration-500 cursor-pointer">

          <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="absolute -top-2 -right-2 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>

          <div className="absolute -bottom-2 -left-2 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>

          <div className="relative z-10 text-center">

            <div className="p-2 sm:p-3 md:p-4 bg-white/20 rounded-2xl backdrop-blur-sm border-2 border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 mx-auto mb-2 sm:mb-3 md:mb-4">

              <Package className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 group-hover:rotate-12 transition-transform duration-300 mx-auto" />

            </div>

            <div className="text-2xl sm:text-3xl md:text-4xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-emerald-200 transition-all duration-300">

              {totalPackages}

            </div>

            <div className="text-xs sm:text-sm text-emerald-100 font-semibold group-hover:text-white transition-colors duration-300">Room Packages</div>

            <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2">

              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>

              <div className="text-xs text-green-300 font-semibold">Available now</div>

            </div>

          </div>

        </div>



        <div className="group relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-500 rounded-3xl p-3 sm:p-4 md:p-6 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-rotate-1 transition-all duration-500 cursor-pointer">

          <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="absolute -top-2 -right-2 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>

          <div className="absolute -bottom-2 -left-2 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>

          <div className="relative z-10 text-center">

            <div className="p-2 sm:p-3 md:p-4 bg-white/20 rounded-2xl backdrop-blur-sm border-2 border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 mx-auto mb-2 sm:mb-3 md:mb-4">

              <Plus className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 group-hover:rotate-12 transition-transform duration-300 mx-auto" />

            </div>

            <div className="text-2xl sm:text-3xl md:text-4xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-orange-200 transition-all duration-300">

              {totalRooms}

            </div>

            <div className="text-xs sm:text-sm text-orange-100 font-semibold group-hover:text-white transition-colors duration-300">Available Rooms</div>

            <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2">

              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>

              <div className="text-xs text-green-300 font-semibold">Ready to book</div>

            </div>

          </div>

        </div>

      </div>
      
      */}



      {/* Properties Grid */}

      <Card className="border-2 border-slate-200 shadow-md">

        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-slate-200">

          <CardTitle className="flex items-center gap-2">

            <Building className="w-5 h-5 text-purple-700" />

            Properties Directory ({safeProperties.length})

          </CardTitle>

        </CardHeader>

        <CardContent className="p-6">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">

            {safeProperties.map((property) => (

              <PropertyCard

                key={property.id}

                property={property}

                onAction={(action, propertyId) => {
                  handlePropertyAction(action, propertyId, property);
                }}

              />

            ))}

            {safeProperties.length === 0 && (

              <div className="col-span-2 text-center py-12">

                <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />

                <h3 className="text-lg font-semibold text-slate-700 mb-2">No properties found</h3>

                <p className="text-slate-500 mb-4">Start by adding your first pension property</p>

                <Button onClick={handleCreateProperty} variant="outline" className="hover:bg-purple-50 hover:border-purple-300">

                  <Plus className="w-4 h-4 mr-2" />

                  Add First Property

                </Button>

              </div>

            )}

          </div>

        </CardContent>

      </Card>

      {/* Property Form Modal */}

      <PropertyForm

        property={selectedProperty}

        isOpen={showForm}

        onClose={() => setShowForm(false)}

        onSave={handleSaveProperty}

      />

    </div>

  );

}

