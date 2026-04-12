import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Bed, Package, MapPin, Star, Users } from "lucide-react";
import apiService from '@/services/api';

interface PropertyRoomsAndPackagesProps {
  propertyId: string;
  propertyName: string;
}

interface Room {
  id: string;
  room_number?: string;
  type: string;
  capacity: number;
  price: number;
  status: 'Available' | 'Occupied';
  amenities?: string[];
}

interface Package {
  id: string;
  name: string;
  price: number;
  description?: string;
  services?: string[];
  isMostPopular?: boolean;
  availableRooms?: number;
}

export const PropertyRoomsAndPackages: React.FC<PropertyRoomsAndPackagesProps> = ({
  propertyId,
  propertyName
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoomsAndPackages();
  }, [propertyId]);

  const fetchRoomsAndPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch rooms and packages using the same logic as owner dashboard
      const [roomsResponse, packagesResponse] = await Promise.all([
        apiService.getRooms(parseInt(propertyId)),
        apiService.getPackages(parseInt(propertyId))
      ]);

      // Process rooms data (same as owner dashboard)
      const roomsData = roomsResponse.data?.items || roomsResponse.data || [];
      const normalizedRooms = Array.isArray(roomsData) ? roomsData.map((room: any) => ({
        id: room.id || room.room_id,
        room_number: room.room_number || room.room_id,
        type: room.type || room.room_type || 'Standard',
        capacity: room.capacity || 2,
        price: room.price_per_night || room.price || 0,
        status: (room.is_available ? 'Available' : 'Occupied') as 'Available' | 'Occupied',
        amenities: room.amenities || []
      })) : [];

      // Process packages data (same as owner dashboard)
      const packagesData = packagesResponse.data || [];
      const normalizedPackages = Array.isArray(packagesData) ? packagesData.map((pkg: any) => ({
        id: pkg.package_id || pkg.id,
        name: pkg.name || 'Standard Package',
        price: pkg.price || 0,
        description: pkg.description,
        services: pkg.services || pkg.features || [],
        isMostPopular: pkg.is_most_popular === 1 || pkg.is_most_popular === true,
        availableRooms: normalizedRooms.filter(room => room.status === 'Available').length
      })) : [];

      setRooms(normalizedRooms);
      setPackages(normalizedPackages);
    } catch (err: any) {
      console.error('Failed to fetch rooms and packages:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const availableRooms = rooms.filter(room => room.status === 'Available');
  const occupiedRooms = rooms.filter(room => room.status === 'Occupied');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading rooms and packages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-2">Error loading data</p>
        <Button onClick={fetchRoomsAndPackages} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Room Availability Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5 text-blue-600" />
            Room Availability - {propertyName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{rooms.length}</div>
              <div className="text-sm text-gray-600">Total Rooms</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{availableRooms.length}</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{occupiedRooms.length}</div>
              <div className="text-sm text-gray-600">Occupied</div>
            </div>
          </div>

          {/* Room List */}
          <div className="space-y-3">
            {rooms.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No rooms found for this property
              </div>
            ) : (
              rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Bed className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{room.type}</div>
                      <div className="text-sm text-gray-500">
                        Room {room.room_number || room.id} · {room.capacity} guests
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-bold text-green-600">ETB {room.price}</div>
                      <div className="text-sm text-gray-500">per night</div>
                    </div>
                    <Badge className={
                      room.status === 'Available' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }>
                      {room.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-600" />
            Available Packages - {propertyName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {packages.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No packages found for this property
              </div>
            ) : (
              packages.map((pkg) => (
                <div key={pkg.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-purple-700">{pkg.name}</h4>
                        {pkg.isMostPopular && (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Most Popular
                          </Badge>
                        )}
                      </div>
                      {pkg.description && (
                        <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                      )}
                      {pkg.services && pkg.services.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {pkg.services.map((service: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-purple-600">
                        ETB {pkg.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">per night</div>
                      {pkg.availableRooms !== undefined && (
                        <div className="text-xs text-green-600 mt-1">
                          {pkg.availableRooms} rooms available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
