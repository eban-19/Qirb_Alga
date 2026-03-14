import { useMemo, useState, useEffect } from "react";
import { MapPin, PackageOpen, Sparkles, Wifi, Car, Shirt, ShieldCheck, Droplets, Zap, PhoneCall, CalendarCheck, PlayCircle, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { getGoogleMapsNavigationUrl, type Room } from "@/lib/rooms";

interface RoomProfileProps {
  room: Room;
}

const RoomProfile = ({ room }: RoomProfileProps) => {
  const { t } = useLanguage();
  const [showVideo, setShowVideo] = useState(false);
  const [activeMediaUrl, setActiveMediaUrl] = useState<string | undefined>(room.videoUrl || room.images[0]);
  const [activeMediaType, setActiveMediaType] = useState<'video'|'image'>(room.videoUrl ? 'video' : 'image');
  const mapsUrl = getGoogleMapsNavigationUrl(room);

  // Reset when room changes
  useEffect(() => {
    setActiveMediaUrl(room.videoUrl || room.images[0]);
    setActiveMediaType(room.videoUrl ? 'video' : 'image');
    setShowVideo(false);
  }, [room]);

  const sortedPackages = useMemo(
    () => [...room.packages].sort((a, b) => a.price - b.price),
    [room.packages],
  );

  const serviceIconMap: Record<string, JSX.Element> = {
    WiFi: <Wifi className="w-4 h-4" />,
    Parking: <Car className="w-4 h-4" />,
    Laundry: <Shirt className="w-4 h-4" />,
    Security: <ShieldCheck className="w-4 h-4" />,
    Water: <Droplets className="w-4 h-4" />,
    Electricity: <Zap className="w-4 h-4" />,
  };

  return (
    <div className="bg-background w-full h-full lg:max-h-[90vh] overflow-y-auto pb-4">
      <div className="p-5 md:p-6 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <h2 className="font-heading text-2xl font-bold text-foreground">{room.name}</h2>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-muted-foreground">{t.rooms.profileTitlePrefix} #{room.id}</p>
          <Button size="sm" variant="outline" className="gap-2">
            <PhoneCall className="w-4 h-4" />
            {t.rooms.contactHost}
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6 pt-4">
        <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden border border-border mb-4 bg-muted group">
          {showVideo && activeMediaType === 'video' && activeMediaUrl ? (
            <video 
              key={activeMediaUrl} // force re-render on url change
              src={activeMediaUrl} 
              poster={room.images[0]}
              controls 
              autoPlay 
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <img src={activeMediaUrl && activeMediaType === 'image' ? activeMediaUrl : room.images[0]} alt={room.name} className="w-full h-full object-cover" />
              {((activeMediaUrl && activeMediaType === 'video') || room.videoUrl) && (
                <div 
                  className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => setShowVideo(true)}
                >
                  <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
                </div>
              )}
            </>
          )}

          {(room.videoUrl || room.packages.some(p => p.videoUrl)) && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button 
                size="sm" 
                variant={!showVideo ? "outline" : "default"} 
                className="gap-2 bg-background/90 hover:bg-background text-foreground backdrop-blur-sm"
                onClick={() => {
                  setShowVideo(false);
                  setActiveMediaType('image');
                  setActiveMediaUrl(room.images[0]);
                }}
              >
                <ImageIcon className="w-4 h-4" />
                {t.rooms.viewPhotos || "Photos"}
              </Button>
              {room.videoUrl && (
                <Button 
                  size="sm" 
                  variant={showVideo && activeMediaUrl === room.videoUrl ? "outline" : "default"} 
                  className="gap-2 bg-background/90 hover:bg-background text-foreground backdrop-blur-sm"
                  onClick={() => {
                    setShowVideo(true);
                    setActiveMediaType('video');
                    setActiveMediaUrl(room.videoUrl);
                  }}
                >
                  <PlayCircle className="w-4 h-4" />
                  {t.rooms.watchVideo || "Room Demo"}
                </Button>
              )}
            </div>
          )}
        </div>

        <Tabs defaultValue="about" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap">
            <TabsTrigger value="about">{t.rooms.aboutTitle}</TabsTrigger>
            <TabsTrigger value="services">{t.rooms.servicesTitle}</TabsTrigger>
            <TabsTrigger value="packages">{t.rooms.packagesTitle}</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-4 space-y-4">
            <section className="bg-card border border-border rounded-xl p-4 space-y-3">
              <p className="text-muted-foreground">{room.description}</p>
              <div>
                <h3 className="font-semibold text-card-foreground">{t.rooms.ownerInfoTitle}</h3>
                <p className="text-muted-foreground">{room.ownerInfo}</p>
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">{t.rooms.roomDetailsTitle}</h3>
                <p className="text-muted-foreground">{room.roomDetails}</p>
              </div>
              <div className="pt-1 text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
                >
                  {t.rooms.locationPrefix}: {room.locationName}
                </a>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-sm font-medium text-primary hover:text-primary/80"
              >
                {t.rooms.openInMaps}
              </a>
            </section>
          </TabsContent>

          <TabsContent value="services" className="mt-4">
            <section className="bg-card border border-border rounded-xl p-4">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.services.map((service) => (
                  <li key={service} className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground flex items-center gap-2">
                    {serviceIconMap[service] ?? <Sparkles className="w-4 h-4" />}
                    {service}
                  </li>
                ))}
              </ul>
            </section>
          </TabsContent>

          <TabsContent value="packages" className="mt-4">
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sortedPackages.map((pkg) => (
                <article key={pkg.name} className="bg-card border border-border rounded-xl overflow-hidden group relative flex flex-col h-full hover:border-primary/50 transition-colors">
                  <div 
                    className="relative w-full h-48 cursor-pointer"
                    onClick={() => {
                      if (pkg.videoUrl) {
                        setShowVideo(true);
                        setActiveMediaType('video');
                        setActiveMediaUrl(pkg.videoUrl);
                        // Optional: Scroll back to top to watch
                        document.querySelector('.bg-background.lg\\:max-h-\\[90vh\\]')?.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        setShowVideo(false);
                        setActiveMediaType('image');
                        setActiveMediaUrl(pkg.image);
                        document.querySelector('.bg-background.lg\\:max-h-\\[90vh\\]')?.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    {pkg.videoUrl ? (
                      <video 
                        src={pkg.videoUrl} 
                        poster={pkg.image}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                      />
                    ) : (
                      <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    )}
                    {pkg.videoUrl && (
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1.5 z-10">
                        <PlayCircle className="w-3 h-3" /> 3D Tour
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="bg-background/90 text-foreground px-3 py-1.5 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm pointer-events-none">
                        Preview {pkg.videoUrl ? 'Tour' : 'Image'}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                        <PackageOpen className="w-5 h-5 text-primary" />
                        {pkg.name}
                      </h3>
                      <p className="text-sm font-medium text-primary mt-1">{t.rooms.packagePrice}: ETB {pkg.price.toLocaleString()}{t.propertyCard.perNight}</p>
                      <p className="text-sm text-muted-foreground mt-3">{pkg.description}</p>
                    </div>
                    <Button variant="default" className="w-full mt-5 gap-2">
                      <CalendarCheck className="w-4 h-4" />
                      {t.rooms.bookNow}
                    </Button>
                  </div>
                </article>
              ))}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RoomProfile;
