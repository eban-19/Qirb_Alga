import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import { getGoogleMapsNavigationUrl, getFullImageUrl, type Room } from "@/lib/rooms";

interface RoomCardProps {
  room: Room;
  onViewProfile: (room: Room) => void;
  isDeal?: boolean;
}

const RoomCard = ({ room, onViewProfile, isDeal }: RoomCardProps) => {
  const { t, tr } = useLanguage();
  
  // Convert pension image URL using the same function as package images
  const fullImageUrl = getFullImageUrl(room.images[0]);
  console.log('🔍 RoomCard image rendering:', {
    roomName: room.name,
    originalImage: room.images[0],
    fullImageUrl,
    type: typeof room.images[0]
  });
  
  // Calculate starting price based on available rooms if possible, else default to minimum 
  const availablePkgs = room.packages.filter(p => p.availableRooms > 0);
  const startingPrice = availablePkgs.length > 0 
    ? Math.min(...availablePkgs.map((item) => item.price))
    : Math.min(...room.packages.map((item) => item.price));

  const mapsUrl = getGoogleMapsNavigationUrl(room);

  return (
    <article className={`bg-card rounded-xl overflow-hidden border card-hover group flex flex-col cursor-pointer transition-all ${isDeal ? 'border-orange-200 dark:border-orange-900/50 shadow-md ring-1 ring-orange-500/20' : 'border-border'}`} onClick={() => onViewProfile(room)}>
      <div className="relative h-56 overflow-hidden shrink-0">
        <img
          src={fullImageUrl}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            console.error('❌ RoomCard image failed to load:', fullImageUrl, e);
            e.target.src = '/src/assets/room-1.png'; // Fallback
          }}
        />
        {isDeal && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white px-2.5 py-1 rounded-md font-bold text-xs shadow-md flex items-center gap-1.5 z-10">
            {t.rooms.bestDealBadge}
          </div>
        )}
        <Badge className={`absolute top-3 right-3 border-0 font-semibold text-xs shadow-sm ${room.availableRooms > 0 ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}`}>
          {room.availableRooms === 0 ? t.rooms.soldOut : `${t.rooms.availableRooms}: ${room.availableRooms}`}
        </Badge>
      </div>

      <div className="p-5 flex flex-col h-full">
        <div className="space-y-1 mb-4 flex-grow">
          <h3 className="font-heading font-bold text-card-foreground text-xl leading-tight line-clamp-1" title={room.name}>
            {room.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-2">
            {tr(room.description)}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
            aria-label={`${t.propertyCard.openInMaps} ${room.locationName}`}
            onClick={(e) => e.stopPropagation()}
          >
            <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
            <span className="truncate">
              {room.locationName}
              {room.distance !== undefined && (
                <span className="ml-2 font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[11px]">
                  {room.distance < 1 ? `${Math.round(room.distance * 1000)} m ${t.propertyCard.away}` : `${room.distance.toFixed(1)} km ${t.propertyCard.away}`}
                </span>
              )}
            </span>
          </a>
        </div>

        <div className="space-y-4 mt-auto">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.propertyCard.startingPriceLabel}</span>
              <p className="text-xl font-bold text-foreground">
                ETB {startingPrice.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{t.propertyCard.perNight}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="default" className="flex-1 shadow-sm" onClick={(e) => { e.stopPropagation(); onViewProfile(room); }}>
              {t.propertyCard.viewProfile}
            </Button>
            <Button 
              variant="secondary" 
              size="icon"
              className="shrink-0 shadow-sm" 
              onClick={(e) => { 
                e.stopPropagation(); 
                window.open(mapsUrl, '_blank', 'noopener,noreferrer');
              }}
              title={t.propertyCard.openInMaps}
            >
              <Navigation className="w-4 h-4 text-primary" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default RoomCard;
