import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import { getFullImageUrl } from "@/lib/rooms";

interface PropertyCardProps {
  image_url: string;
  name: string;
  address: string;
  distance: string;
  price: number;
  rating: number;
  roomsLeft: number;
}

const PropertyCard = ({
  image_url,
  name,
  address,
  distance,
  price,
  rating,
  roomsLeft,
}: PropertyCardProps) => {
  const isLow = roomsLeft <= 2;
  const { t } = useLanguage();

  // Convert pension image URL using the same function as package images
  const fullImageUrl = getFullImageUrl(image_url);
  console.log('🔍 PropertyCard image rendering:', {
    originalImage: image_url,
    fullImageUrl,
    type: typeof image_url
  });

  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border card-hover cursor-pointer group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={fullImageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            console.error('❌ PropertyCard image failed to load:', fullImageUrl, e);
            e.target.src = '/src/assets/room-1.png'; // Fallback to default image
          }}
        />
        <Badge
          className={`absolute top-3 right-3 ${
            isLow
              ? "bg-destructive text-destructive-foreground"
              : "bg-success text-success-foreground"
          } border-0 font-semibold text-xs`}
        >
          {roomsLeft} {roomsLeft === 1 ? t.propertyCard.room : t.propertyCard.rooms} {t.propertyCard.left}
        </Badge>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-heading font-semibold text-card-foreground text-lg leading-tight">
            {name}
          </h3>
          <div className="flex items-center gap-1 text-accent shrink-0 ml-2">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{address}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-primary font-semibold text-sm">
            📍 {distance} {t.propertyCard.away}
          </span>
          <div className="text-card-foreground">
            <span className="font-heading font-bold text-lg">{price} ETB</span>
            <span className="text-muted-foreground text-xs"> {t.propertyCard.perNight}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
