import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, MapPin, BedDouble, Tags, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import RoomCard from "@/components/RoomCard";
import RoomCardSkeleton from "@/components/RoomCardSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRooms } from "@/hooks/use-rooms";
import { useLanguage } from "@/hooks/use-language";
import type { Room } from "@/lib/rooms";

export type FilterType = "nearest" | "available" | "deals" | "topRated" | null;

const RoomList = () => {
  const { data: rooms = [], isLoading } = useRooms();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const urlLat = searchParams.get("lat");
  const urlLng = searchParams.get("lng");

  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [isLocating, setIsLocating] = useState<FilterType>(null);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(() => {
    if (urlLat && urlLng) {
      return { lat: parseFloat(urlLat), lng: parseFloat(urlLng) };
    }
    return null;
  });

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleFilterClick = (filter: Extract<FilterType, string>) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
      return;
    }

    // topRated doesn't need geolocation
    if (filter === 'topRated') {
      setActiveFilter(filter);
      return;
    }

    if (!userLoc) {
      setIsLocating(filter);
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
            setUserLoc(loc);
            setActiveFilter(filter);
            setIsLocating(null);
            
            // Optionally, update URL to keep location sticky
            const params = new URLSearchParams(searchParams);
            params.set("lat", loc.lat.toString());
            params.set("lng", loc.lng.toString());
            setSearchParams(params, { replace: true });
          },
          (error) => {
            setIsLocating(null);
            toast.error("Location disabled. Showing general results.");
            // Still set filter to apply non-location parts like basic sort
            setActiveFilter(filter);
          },
          { timeout: 10000 }
        );
      } else {
        toast.error("Geolocation is not supported by your browser.");
        setIsLocating(null);
        setActiveFilter(filter);
      }
    } else {
      setActiveFilter(filter);
    }
  };

  const filteredRooms = useMemo(() => {
    let result = [...rooms];

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (room) =>
          room.name.toLowerCase().includes(lowerQuery) ||
          room.locationName.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Attach Distance if Location Known
    if (userLoc) {
      result = result.map((room) => ({
        ...room,
        distance: calculateDistance(userLoc.lat, userLoc.lng, room.latitude, room.longitude),
      }));
    }

    // 3. Apply Quick Filters
    if (activeFilter === "nearest") {
      // Filter out completely sold out properties
      result = result.filter((r) => r.availableRooms > 0);
      // Sort primarily by distance
      if (userLoc) {
        result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }
    } else if (activeFilter === "available") {
      // Ensure we only show available
      result = result.filter((r) => r.availableRooms > 0);
      // Sort heavily by available rooms descending, then distance
      result.sort((a, b) => {
        const roomDiff = b.availableRooms - a.availableRooms;
        if (roomDiff !== 0) return roomDiff;
        return (a.distance || 0) - (b.distance || 0);
      });
    } else if (activeFilter === "deals") {
      // Filter out completely sold out properties
      result = result.filter((r) => r.availableRooms > 0);
      
      // Calculate cheapest available package for each room
      const getCheapestPrice = (r: Room) => {
        const availablePkgs = r.packages.filter(p => p.availableRooms > 0);
        if (availablePkgs.length === 0) return Infinity;
        return Math.min(...availablePkgs.map(p => p.price));
      };

      // Ensure we mark them as a deal on the entity if we wanted
      result.sort((a, b) => {
        const priceA = getCheapestPrice(a);
        const priceB = getCheapestPrice(b);
        const priceDiff = priceA - priceB;
        if (priceDiff !== 0) return priceDiff;
        return (a.distance || 0) - (b.distance || 0);
      });
    } else if (activeFilter === "topRated") {
      // Only show pensions with at least 1 review
      result = result.filter((r) => (r.reviewCount || 0) > 0);
      // Sort by avgRating descending, then by reviewCount as a tiebreaker
      result.sort((a, b) => {
        const ratingDiff = (b.avgRating || 0) - (a.avgRating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      });
    }

    return result;
  }, [rooms, searchQuery, userLoc, activeFilter]);

  const handleOpenRoom = (room: Room) => {
    navigate(`/room/${room.id}`);
  };

  return (
    <section className="py-16 bg-background" id="rooms">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto mb-10 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2 px-2">
            <Button 
              variant={activeFilter === "nearest" ? "default" : "outline"} 
              size="sm" 
              className="rounded-full shadow-sm gap-2"
              onClick={() => handleFilterClick("nearest")}
              disabled={isLocating === "nearest"}
            >
              {isLocating === "nearest" ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {t.rooms.nearestProperties}
            </Button>
            <Button 
              variant={activeFilter === "available" ? "default" : "outline"} 
              size="sm" 
              className="rounded-full shadow-sm gap-2"
              onClick={() => handleFilterClick("available")}
              disabled={isLocating === "available"}
            >
              {isLocating === "available" ? <Loader2 className="w-4 h-4 animate-spin" /> : <BedDouble className="w-4 h-4" />}
              {t.rooms.availableRoomsFilter}
            </Button>
            <Button 
              variant={activeFilter === "deals" ? "default" : "outline"} 
              size="sm" 
              className="rounded-full shadow-sm gap-2"
              onClick={() => handleFilterClick("deals")}
              disabled={isLocating === "deals"}
            >
              {isLocating === "deals" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tags className="w-4 h-4" />}
              {t.rooms.bestDeals}
            </Button>
            <Button 
              variant={activeFilter === "topRated" ? "default" : "outline"} 
              size="sm" 
              className="rounded-full shadow-sm gap-2"
              onClick={() => handleFilterClick("topRated")}
            >
              <Star className="w-4 h-4" />
              {t.rooms.topRated}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <RoomCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center max-w-lg mx-auto shadow-sm">
            <h3 className="text-xl font-bold mb-2">{t.rooms.noPropertiesFound}</h3>
            <p className="text-muted-foreground">{searchQuery ? t.rooms.noMatchesQuery : t.rooms.noRooms}</p>
            {activeFilter && (
              <Button variant="outline" className="mt-4" onClick={() => setActiveFilter(null)}>
                {t.rooms.clearFilters}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard 
                key={room.id} 
                room={room} 
                onViewProfile={handleOpenRoom} 
                isDeal={activeFilter === "deals"}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RoomList;
