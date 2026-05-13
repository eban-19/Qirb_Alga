import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import { Button } from './button';
import { MapPin, Navigation, Search } from 'lucide-react';

// Fix for Leaflet marker icons in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

// Search Control Component
const SearchField = ({ provider, onLocationSelect }: { provider: any, onLocationSelect: any }) => {
  const map = useMap();

  useEffect(() => {
    const searchControl = new (GeoSearchControl as any)({
      provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Search for address...',
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', (result: any) => {
      onLocationSelect({
        address: result.location.label,
        lat: result.location.y,
        lng: result.location.x,
      });
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, provider, onLocationSelect]);

  return null;
};

// Map Click Handler
const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLat,
  initialLng,
  initialAddress
}) => {
  // Default to Addis Ababa
  const defaultCenter: [number, number] = [9.03, 38.74];
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [isLoading, setIsLoading] = useState(false);

  const provider = new OpenStreetMapProvider();

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setIsLoading(true);
    try {
      // Reverse geocode to get address
      const results = await provider.search({ query: `${lat}, ${lng}` });
      const address = results.length > 0 ? results[0].label : `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
      onLocationSelect({ address, lat, lng });
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      onLocationSelect({ address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`, lat, lng });
    } finally {
      setIsLoading(false);
    }
  }, [onLocationSelect]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        handleMapClick(latitude, longitude);
      },
      (err) => {
        console.error(err);
        alert('Could not get your location');
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Pin Your Location *
        </label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleGetCurrentLocation}
          className="h-8 text-xs gap-1.5"
          disabled={isLoading}
        >
          <Navigation className="h-3 w-3" />
          {isLoading ? 'Locating...' : 'Use My Location'}
        </Button>
      </div>

      <div className="relative h-[300px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0">
        <MapContainer 
          center={position || defaultCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <SearchField provider={provider} onLocationSelect={onLocationSelect} />
          <MapEvents onMapClick={handleMapClick} />
          {position && <Marker position={position} />}
        </MapContainer>
        
        {!position && (
          <div className="absolute inset-0 bg-slate-900/10 pointer-events-none flex items-center justify-center">
            <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-slate-700 backdrop-blur-sm border border-slate-200">
              Click the map or search to drop a pin
            </div>
          </div>
        )}
      </div>
      
      {initialAddress && !position && (
        <p className="text-[10px] text-muted-foreground italic">
          Current stored address: {initialAddress}
        </p>
      )}
    </div>
  );
};
