import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, MapPin, PackageOpen, Sparkles, Wifi, Car, Shirt, ShieldCheck, Droplets, Zap, PhoneCall, CalendarCheck, PlayCircle, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { getGoogleMapsNavigationUrl, type Room } from "@/lib/rooms";
import { useNavigate } from "react-router-dom";

interface RoomProfileProps {
  room: Room;
}

const RoomProfile = ({ room }: RoomProfileProps) => {
  const { t, tr } = useLanguage();
  const navigate = useNavigate();
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

  return (
    <div className="w-full bg-background pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Header & Back Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground gap-2" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground">{room.name}</h1>
            <div className="flex items-center gap-2 mt-3 text-muted-foreground">
              <MapPin className="w-5 h-5 text-primary" />
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors underline-offset-4 hover:underline text-lg">
                {room.locationName}
              </a>
            </div>
          </div>
          <Button size="lg" className="gap-2 shrink-0 shadow-sm">
            <PhoneCall className="w-4 h-4" />
            {t.rooms.contactHost}
          </Button>
        </div>

        {/* Layout: Content */}
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* About Section */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-heading font-bold text-foreground">{t.rooms.aboutTitle || "About the Property"}</h2>
              <div className="h-1 w-20 bg-primary rounded-full"></div>
            </div>
            
            <div className="bg-card border border-border p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
              <p className="text-lg leading-relaxed text-muted-foreground">{tr(room.description)}</p>
              
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    {t.rooms.ownerInfoTitle}
                  </h3>
                  <p className="text-muted-foreground">{tr(room.ownerInfo)}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {t.rooms.roomDetailsTitle}
                  </h3>
                  <p className="text-muted-foreground">{tr(room.roomDetails)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Packages Tabs */}
          <section className="space-y-8" id="packages">
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-3xl font-heading font-bold text-foreground">{t.rooms.packagesTitle || "Available Packages"}</h2>
              <p className="text-muted-foreground text-lg">Choose a package that fits your needs.</p>
            </div>

            <Tabs defaultValue={sortedPackages[1]?.name || sortedPackages[0]?.name} className="w-full">
              
              <TabsList className="w-full flex justify-start overflow-x-auto whitespace-nowrap mb-8 p-1.5 bg-muted/50 rounded-2xl h-auto border border-border/50">
                {sortedPackages.map((pkg) => (
                  <TabsTrigger 
                    key={pkg.name} 
                    value={pkg.name} 
                    className="flex-1 px-8 py-3.5 text-base md:text-lg font-medium rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md transition-all"
                  >
                    {tr(pkg.name)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {sortedPackages.map((pkg) => {
                const isStandard = pkg.name === "Standard";
                return (
                  <TabsContent key={pkg.name} value={pkg.name} className="mt-0 focus-visible:outline-none">
                    <div className={`grid lg:grid-cols-2 gap-8 md:gap-12 bg-card rounded-3xl p-6 md:p-10 border-2 transition-all ${isStandard ? 'border-primary shadow-xl' : 'border-border shadow-md'}`}>
                      
                      {/* Package Details */}
                      <div className="flex flex-col justify-center order-2 lg:order-1">
                        <div className="flex items-start justify-between mb-4 gap-4">
                          <h3 className="text-3xl font-bold font-heading flex items-center gap-3 text-foreground">
                            <PackageOpen className={`w-8 h-8 ${isStandard ? 'text-primary' : 'text-muted-foreground'}`} />
                            {tr(pkg.name)}
                          </h3>
                          {isStandard && (
                            <span className="shrink-0 text-xs font-bold px-4 py-1.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                              {t.rooms.mostPopular || "Most Popular"}
                            </span>
                          )}
                        </div>
                        
                        <div className="mb-6 flex items-baseline gap-2">
                          <span className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                            ETB {pkg.price.toLocaleString()}
                          </span>
                          <span className="text-lg text-muted-foreground">{t.propertyCard.perNight || "/ night"}</span>
                        </div>
                        
                        <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                          {tr(pkg.description)}
                        </p>

                        {pkg.availableRooms <= 3 && (
                          <div className={`inline-flex items-center self-start gap-2 px-4 py-2 text-sm font-semibold rounded-full mb-8 ${pkg.availableRooms === 0 ? 'bg-destructive/10 text-destructive' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'}`}>
                            {pkg.availableRooms === 0 ? "Sold Out" : `Only ${pkg.availableRooms} rooms left!`}
                          </div>
                        )}
                        {pkg.availableRooms > 3 && <div className="mb-8" />}

                        <div className="flex-grow space-y-5">
                          <h4 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                            <Sparkles className="w-5 h-5 text-primary" /> 
                            {t.rooms.includedServices || "Included Services"}
                          </h4>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {pkg.services?.map((service, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-muted-foreground text-base">
                                <div className="mt-1 rounded-full bg-primary/10 p-1 text-primary shrink-0">
                                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                                <span className="font-medium">{tr(service)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-10 pt-8 border-t border-border">
                          <Button 
                            size="lg" 
                            className="w-full md:w-auto md:min-w-[240px] text-lg h-14 gap-3 rounded-xl shadow-md"
                            variant={isStandard ? "default" : "secondary"}
                            disabled={pkg.availableRooms === 0}
                            onClick={() => navigate(`/book/${room.id}?package=${pkg.name}`)}
                          >
                            <CalendarCheck className="w-5 h-5" />
                            {pkg.availableRooms === 0 ? "Unavailable" : (t.rooms.bookNow || "Book Now")}
                          </Button>
                        </div>
                      </div>

                      {/* Package Media Demo */}
                      <div className="order-1 lg:order-2">
                        <div className="relative w-full h-64 md:h-full lg:min-h-[400px] rounded-2xl overflow-hidden shadow-inner group bg-muted border border-border">
                          {pkg.videoUrl ? (
                            <>
                              <video 
                                src={pkg.videoUrl} 
                                poster={pkg.image}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                autoPlay 
                                loop 
                                muted 
                                playsInline
                              />
                              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 z-10 shadow-lg">
                                <PlayCircle className="w-4 h-4" /> Demo
                              </div>
                            </>
                          ) : (
                            <img 
                              src={pkg.image} 
                              alt={pkg.name} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            />
                          )}
                        </div>
                      </div>

                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </section>

        </div>
      </div>
    </div>
  );
};

export default RoomProfile;
