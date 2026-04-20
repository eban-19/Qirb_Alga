import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, MapPin, PackageOpen, Sparkles, Wifi, Car, Shirt, ShieldCheck, Droplets, Zap, PhoneCall, CalendarCheck, PlayCircle, Image as ImageIcon, Mail, Phone, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";
import { getGoogleMapsNavigationUrl, type Room } from "@/lib/rooms";
import { useNavigate } from "react-router-dom";

// Helper function to construct full URLs for images
const getFullImageUrl = (imagePath: string | undefined | null): string => {
  console.log('🔍 getFullImageUrl input:', {
    imagePath,
    type: typeof imagePath,
    isNull: imagePath === null,
    isUndefined: imagePath === undefined,
    isEmpty: imagePath === ''
  });
  
  if (!imagePath) {
    const fallback = '/src/assets/room-1.png';
    console.log('🔍 Using fallback:', fallback);
    return fallback;
  }
  
  // If it's already a full URL (starts with http), return as is
  if (imagePath.startsWith('http')) {
    console.log('🔍 Already full URL:', imagePath);
    return imagePath;
  }
  
  // If it's a frontend asset path (/src/assets/), return as-is (served by frontend)
  if (imagePath.startsWith('/src/assets/')) {
    console.log('🔍 Frontend asset path, keeping as-is:', imagePath);
    return imagePath;
  }
  
  // If it's an uploaded file path (/uploads/), prepend the backend URL
  if (imagePath.startsWith('/uploads/')) {
    const fullUrl = `http://localhost:3005${imagePath}`;
    console.log('🔍 Backend uploaded file, constructed full URL:', fullUrl);
    return fullUrl;
  }
  
  // Default: assume it's a backend file
  const fullUrl = `http://localhost:3005${imagePath}`;
  console.log('🔍 Default backend file, constructed full URL:', fullUrl);
  return fullUrl;
};

interface RoomProfileProps {
  room: Room;
}

const RoomProfile = ({ room }: RoomProfileProps) => {
  const { t, tr } = useLanguage();
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
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

  const [activeTab, setActiveTab] = useState(sortedPackages.find(p => p.isMostPopular)?.name || room?.packages[1]?.name || room?.packages[0]?.name || '');

  const handleTabChange = (newValue: string) => {
    const scrollY = window.scrollY;
    setActiveTab(newValue);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  };

  return (
    <div className="w-full bg-background pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Header & Back Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground gap-2" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground">{tr(room.name_ml || room.name)}</h1>
            <div className="flex items-center gap-2 mt-3 text-muted-foreground">
              <MapPin className="w-5 h-5 text-primary" />
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors underline-offset-4 hover:underline text-lg">
                {room.locationName}
              </a>
            </div>
          </div>
          <Button size="lg" className="gap-2 shrink-0 shadow-sm" onClick={() => setShowContactModal(true)}>
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
              <p className="text-lg leading-relaxed text-muted-foreground">{tr(room.description_ml || room.description)}</p>
              
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    {t.rooms.ownerInfoTitle}
                  </h3>
                  <p className="text-muted-foreground">{tr(room.owner_info_ml || room.ownerInfo)}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {t.rooms.roomDetailsTitle}
                  </h3>
                  <p className="text-muted-foreground">{tr(room.room_details_ml || room.roomDetails)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Packages Tabs */}
          <section className="space-y-8" style={{ scrollBehavior: 'auto' }}>
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-3xl font-heading font-bold text-foreground">{t.rooms.packagesTitle || "Available Packages"}</h2>
              <p className="text-muted-foreground text-lg">Choose a package that fits your needs.</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              
              <TabsList className="w-full flex justify-start overflow-x-auto whitespace-nowrap mb-8 p-1.5 bg-muted/50 rounded-2xl h-auto border border-border/50">
                {sortedPackages.map((pkg) => (
                  <TabsTrigger
                    key={pkg.name}
                    value={pkg.name}
                    className="flex-shrink-0 px-8 py-3.5 text-base md:text-lg font-medium rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md transition-all"
                  >
                    {tr(pkg.name_ml || pkg.name)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {sortedPackages.map((pkg) => {
                const isPopular = pkg.isMostPopular;
                return (
                  <TabsContent key={pkg.name} value={pkg.name} className="mt-0 focus-visible:outline-none scroll-mt-0">
                    <div className={`grid lg:grid-cols-2 gap-8 md:gap-12 bg-card rounded-3xl p-6 md:p-10 border-2 transition-all ${isPopular ? 'border-primary shadow-xl' : 'border-border shadow-md'}`}>
                      
                      {/* Package Details */}
                      <div className="flex flex-col justify-center order-2 lg:order-1">
                        <div className="flex items-start justify-between mb-4 gap-4">
                          <h3 className="text-3xl font-bold font-heading flex items-center gap-3 text-foreground">
                            <PackageOpen className={`w-8 h-8 ${isPopular ? 'text-primary' : 'text-muted-foreground'}`} />
                            {tr(pkg.name_ml || pkg.name)}
                          </h3>
                          {isPopular && (
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
                        
                        <div className="mb-4">
                          {pkg.availableRooms === 0 ? (
                            <div className="inline-flex items-center self-start gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-destructive/10 text-destructive">
                              Sold Out
                            </div>
                          ) : (
                            <div className="inline-flex items-center self-start gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                              {pkg.availableRooms} room{pkg.availableRooms !== 1 ? 's' : ''} available
                            </div>
                          )}
                        </div>

                        <div className="flex-grow space-y-5">
                          <h4 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                            <Sparkles className="w-5 h-5 text-primary" />
                            {t.rooms.includedServices || "Included Services"}
                          </h4>
                          {pkg.services && pkg.services.length > 0 ? (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {pkg.services.filter(service => service && service.trim() !== '').map((service, idx) => (
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
                          ) : (
                            <p className="text-muted-foreground text-sm">No services specified by owner</p>
                          )}
                        </div>

                        <div className="mt-10 pt-8 border-t border-border">
                          <Button 
                            size="lg" 
                            className="w-full md:w-auto md:min-w-[240px] text-lg h-14 gap-3 rounded-xl shadow-md"
                            variant={isPopular ? "default" : "secondary"}
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
                                poster={getFullImageUrl(pkg.image)}
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
                            (() => {
                              const imageSrc = getFullImageUrl(pkg.image);
                              console.log('🔍 Package image rendering:', {
                                packageName: pkg.name,
                                originalImage: pkg.image,
                                finalSrc: imageSrc
                              });
                              return (
                                <img 
                                  src={imageSrc}
                                  alt={pkg.name} 
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                  onError={(e) => {
                                    console.error('🔍 Image load error:', {
                                      packageName: pkg.name,
                                      src: imageSrc,
                                      error: e
                                    });
                                  }}
                                  onLoad={(e) => {
                                    console.log('🔍 Image loaded successfully:', {
                                      packageName: pkg.name,
                                      src: imageSrc
                                    });
                                  }}
                                />
                              );
                            })()
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

      {/* Contact Host Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5" />
              Contact Host
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">{room.name}</p>
              <p className="text-muted-foreground">{tr(room.ownerInfo)}</p>
            </div>
            
            <div className="space-y-3">
              {room.phone && (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a 
                      href={`tel:${room.phone}`}
                      className="text-primary hover:underline"
                    >
                      {room.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {room.email && (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a 
                      href={`mailto:${room.email}`}
                      className="text-primary hover:underline"
                    >
                      {room.email}
                    </a>
                  </div>
                </div>
              )}
              
              {!room.phone && !room.email && (
                <p className="text-center text-muted-foreground py-4">
                  Contact information not available
                </p>
              )}
            </div>
            
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowContactModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomProfile;
