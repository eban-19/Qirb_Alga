import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, Users, XCircle, RefreshCw } from 'lucide-react';
import { Room } from '@/lib/rooms';

interface PropertyDetailsModalProps {
  property?: Room | null;
  isOpen: boolean;
  onClose: () => void;
}

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({ 
  property, 
  isOpen, 
  onClose 
}) => {
  const getRoomStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Available</Badge>;
      case 'occupied':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Occupied</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {property?.name || 'Property Details'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {property?.locationName || property?.city || 'Location information'}
          </DialogDescription>
        </DialogHeader>

        {property ? (
          <div className="space-y-6">
            {/* Property Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Property Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{property.locationName || property.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Rooms</p>
                    <p className="font-medium">{property.availableRooms || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Rooms</p>
                    <p className="font-medium">{property.totalRooms || property.rooms?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Packages</p>
                    <p className="font-medium">{property.packages?.length || 0}</p>
                  </div>
                </div>
                {property.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-gray-700">{property.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rooms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Available Rooms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {property.rooms?.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No rooms found for this property
                    </div>
                  ) : (
                    property.rooms?.map((room) => (
                      <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{room.name}</div>
                            <div className="text-sm text-gray-500">
                              {room.type || 'Standard Room'} · {room.capacity || 2} guests
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="font-bold text-green-600">ETB {room.price || 0}</div>
                            <div className="text-sm text-gray-500">per night</div>
                          </div>
                          {getRoomStatusBadge(room.status || 'available')}
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
                  <Package className="h-5 w-5" />
                  Available Packages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {property.packages?.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No packages found for this property
                    </div>
                  ) : (
                    property.packages?.map((pkg) => (
                      <div key={pkg.id || pkg.name} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-purple-700 mb-2">{pkg.name}</h4>
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
                              ETB {(pkg.price || 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {pkg.duration || 'per night'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No property data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsModal;
