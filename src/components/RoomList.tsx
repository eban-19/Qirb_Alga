import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import RoomCard from "@/components/RoomCard";
import RoomProfile from "@/components/RoomProfile";
import RoomCardSkeleton from "@/components/RoomCardSkeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useRooms } from "@/hooks/use-rooms";
import { useLanguage } from "@/hooks/use-language";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Room } from "@/lib/rooms";

const RoomList = () => {
  const { data: rooms = [], isLoading } = useRooms();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const selectedRoomId = searchParams.get("pension");
  const urlLat = searchParams.get("lat");
  const urlLng = searchParams.get("lng");

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id.toString() === selectedRoomId) || null,
    [rooms, selectedRoomId]
  );

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

  const filteredRooms = useMemo(() => {
    let result = [...rooms];

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (room) =>
          room.name.toLowerCase().includes(lowerQuery) ||
          room.locationName.toLowerCase().includes(lowerQuery)
      );
    }

    if (urlLat && urlLng) {
      const userLat = parseFloat(urlLat);
      const userLng = parseFloat(urlLng);
      // Calculate and attach distance to each room
      result = result.map(room => ({
        ...room,
        distance: calculateDistance(userLat, userLng, room.latitude, room.longitude)
      }));
      // Sort by distance (closest first)
      result.sort((a, b) => {
        return (a.distance || 0) - (b.distance || 0);
      });
    }

    return result;
  }, [rooms, searchQuery, urlLat, urlLng]);

  const handleOpenRoom = (room: Room) => {
    setSearchParams({ pension: room.id.toString() }, { replace: true });
  };

  const handleCloseRoom = () => {
    setSearchParams({}, { replace: true });
  };

  return (
    <section className="py-16 bg-background" id="rooms">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">{t.rooms.listTitle}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t.rooms.listSubtitle}</p>
        </div>

        <div className="max-w-md mx-auto mb-12 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t.hero.searchPlaceholder}
              className="pl-10 h-12 rounded-xl border-border bg-card shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <RoomCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center max-w-lg mx-auto">
            <h3 className="text-xl font-bold mb-2">No Properties Available</h3>
            <p className="text-muted-foreground">{searchQuery ? "No matches found for your search." : t.rooms.noRooms}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} onViewProfile={handleOpenRoom} />
            ))}
          </div>
        )}

        {isMobile ? (
          <Drawer open={Boolean(selectedRoom)} onOpenChange={(isOpen) => !isOpen && handleCloseRoom()}>
            <DrawerContent className="max-h-[95vh] p-0">
              {selectedRoom ? (
                <>
                  <DrawerHeader className="sr-only">
                    <DrawerTitle>{selectedRoom.name}</DrawerTitle>
                    <DrawerDescription>{selectedRoom.locationName}</DrawerDescription>
                  </DrawerHeader>
                  <div className="overflow-y-auto w-full">
                    <RoomProfile room={selectedRoom} />
                  </div>
                </>
              ) : null}
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={Boolean(selectedRoom)} onOpenChange={(isOpen) => !isOpen && handleCloseRoom()}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden max-h-[90vh]">
              {selectedRoom ? (
                <>
                  <DialogHeader className="sr-only">
                    <DialogTitle>{selectedRoom.name}</DialogTitle>
                    <DialogDescription>{selectedRoom.locationName}</DialogDescription>
                  </DialogHeader>
                  <RoomProfile room={selectedRoom} />
                </>
              ) : null}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  );
};

export default RoomList;
