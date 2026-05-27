import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, MapPin, PackageOpen, Sparkles, Wifi, Car, Shirt, ShieldCheck, Droplets, Zap, PhoneCall, CalendarCheck, PlayCircle, Image as ImageIcon, Mail, Phone, X, ChevronLeft, ChevronRight, Users, Bed, Gift, Tag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";
import { getGoogleMapsNavigationUrl, type Room } from "@/lib/rooms";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UnifiedAuthModal from "./auth/UnifiedAuthModal";
import PensionReviews from "./pension/PensionReviews";

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
    return `http://localhost:3006${imagePath}`;
  }
  
  // If it's a relative path without /uploads/, prepend it
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `http://localhost:3006/uploads${normalizedPath}`;
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
  
  // State to track active image per package name
  const [activePackageImages, setActivePackageImages] = useState<Record<string, string>>({});
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPackage, setPendingPackage] = useState<string | null>(null);

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

  const [activeTab, setActiveTab] = useState('');

  // Update active tab when packages load or change
  useEffect(() => {
    if (room?.packages && room.packages.length > 0) {
      const mostPopular = room.packages.find(p => p.isMostPopular);
      if (mostPopular) {
        setActiveTab(mostPopular.name);
      } else if (room.packages.length > 0) {
        setActiveTab(room.packages[0].name);
      }
    }
  }, [room?.packages]);

  const handleTabChange = (newValue: string) => {
    const scrollY = window.scrollY;
    setActiveTab(newValue);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  };

  const handleBookNow = (pkgName: string) => {
    navigate(`/book/${room.id}?package=${pkgName}`);
  };

  const handleAuthSuccess = () => {
    // No longer needed here
  };

  return (
    <div className="w-full bg-background pt-20 pb-16 min-h-screen overflow-x-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Header & Back Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-4">
          <div>
            <Button variant="ghost" size="sm" className="mt-4 mb-2 -ml-2 text-muted-foreground hover:text-foreground gap-2" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" /> {t.rooms.back || "Back"}
            </Button>
            <h1 className="font-heading text-2xl md:text-5xl font-bold text-foreground">{tr(room.name_ml || room.name)}</h1>
            <div className="flex items-center gap-2 mt-3 text-muted-foreground mr-4 sm:mr-0">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors underline-offset-4 hover:underline text-lg pr-4 sm:pr-0 truncate">
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
        <div className="max-w-7xl mx-auto space-y-10">
          

          {/* Packages Tabs */}
          <section className="space-y-6" style={{ scrollBehavior: 'auto' }}>
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-2xl font-heading font-bold text-foreground">{t.rooms.packagesTitle || "Available Packages"}</h2>
              <p className="text-muted-foreground text-lg">{t.rooms.choosePackageSubtitle || "Choose a package that fits your needs."}</p>
            </div>

            {/* Dynamic Promotions Banner */}
            {(() => {
              const activePromos = room.promotions?.filter(p => p.is_active) || [];
              if (activePromos.length > 0) {
                return (
                  <div className="relative overflow-hidden bg-card border border-border rounded-[2rem] p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Background glowing blob */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 mb-6 relative z-10">
                      <div className="bg-primary/10 p-3 rounded-2xl shrink-0">
                        <Gift className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-2xl md:text-3xl font-bold font-heading bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-1">
                          {t.rooms.specialOffersAvailable || "Special Offers Available!"}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                          {t.rooms.discountsAppliedCheckout || "Discounts are automatically applied at checkout when requirements are met."}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`grid grid-cols-1 ${activePromos.length >= 3 ? 'md:grid-cols-2 lg:grid-cols-3' : activePromos.length === 2 ? 'md:grid-cols-2' : ''} gap-5 relative z-10`}>
                      {activePromos.map(promo => (
                        <div key={promo.promo_id} className="group relative bg-background border border-border hover:border-primary/40 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between">
                          <div className="absolute -top-3 right-6 bg-primary text-primary-foreground px-4 py-1 rounded-full font-black text-sm shadow-md flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" />
                            {promo.discount_percent}% OFF
                          </div>
                          
                          <div className="mb-4 mt-2">
                            <h4 className="font-bold text-xl tracking-tight mb-2 text-foreground">{promo.name}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">{promo.description}</p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/50">
                            {promo.type === 'EARLY_BIRD' && <span className="text-[11px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-3 py-1.5 rounded-xl">{(t.rooms.requiresDaysAdvance || "Requires {days}+ days advance").replace("{days}", String(promo.min_days))}</span>}
                            {promo.type === 'LONG_STAY' && <span className="text-[11px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-3 py-1.5 rounded-xl">{(t.rooms.requiresNightsStay || "Requires {nights}+ nights stay").replace("{nights}", String(promo.min_days))}</span>}
                            {promo.type === 'LAST_MINUTE' && <span className="text-[11px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-3 py-1.5 rounded-xl">{(t.rooms.bookWithinDays || "Book within {days} days").replace("{days}", String(promo.max_days))}</span>}
                            {promo.package_id && promo.package ? (
                              <span className="text-[11px] font-bold tracking-wider bg-primary/10 text-primary px-3 py-1.5 rounded-xl">📦 {promo.package.name} {t.rooms.onlySuffix || "only"}</span>
                            ) : (
                              <span className="text-[11px] font-bold tracking-wider bg-primary/10 text-primary px-3 py-1.5 rounded-xl">{t.rooms.allPackages || "✓ All packages"}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              
              <TabsList className="w-full flex justify-start overflow-x-auto whitespace-nowrap mb-6 p-1.5 bg-muted/50 rounded-2xl h-auto border border-border/50">
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
                    <div className={`grid lg:grid-cols-[1fr_1.4fr] gap-8 md:gap-12 bg-card rounded-3xl p-6 md:p-10 border-2 transition-all ${isPopular ? 'border-primary shadow-xl' : 'border-border shadow-md'}`}>
                      
                      {/* Package Details */}
                      <div className="flex flex-col justify-center order-2 lg:order-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                          <h3 className="text-3xl font-bold font-heading flex items-center gap-3 text-foreground">
                            <PackageOpen className={`w-8 h-8 ${isPopular ? 'text-primary' : 'text-muted-foreground'}`} />
                            {tr(pkg.name_ml || pkg.name)}
                          </h3>
                          {isPopular && (
                            <span className="shrink-0 w-fit text-xs font-bold px-4 py-1.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
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

                        {/* Capacity & Beds Badges */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                          <div className="flex items-center gap-2 text-slate-700 bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200/50 shadow-sm">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span>{pkg.capacity || 0} {t.rooms.guestsLabel || "Guests"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700 bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200/50 shadow-sm">
                            <Bed className="w-4 h-4 text-emerald-600" />
                            <span>{pkg.beds || 0} {t.rooms.bedsLabel || "Beds"}</span>
                          </div>
                        </div>


                        <div className="mb-4">
                          {/* Availability is determined in the booking step after selecting dates */}
                        </div>

                        <div className="flex-grow space-y-5">
                          <h4 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                            <Sparkles className="w-5 h-5 text-primary" />
                            {t.rooms.includedServices || "Included Services"}
                          </h4>
                          {pkg.services && (Array.isArray(pkg.services) ? pkg.services.length > 0 : typeof pkg.services === 'string' && pkg.services.length > 0) ? (() => {
                            const servicesArray = Array.isArray(pkg.services) 
                              ? pkg.services 
                              : (typeof pkg.services === 'string' ? (pkg.services.startsWith('[') ? JSON.parse(pkg.services) : pkg.services.split(',').map(s => s.trim())) : []);
                            
                            const filteredServices = servicesArray.map((service: any) => {
                              if (typeof service === 'string') return service;
                              if (service && typeof service === 'object') {
                                return service.name || service.text || service.label || JSON.stringify(service);
                              }
                              return null;
                            }).filter((service: any) => 
                              service && 
                              typeof service === 'string' &&
                              service.trim() !== ''
                            );
                            
                            return filteredServices.length > 0 ? (
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredServices.map((service: string, idx: number) => (
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
                              <p className="text-muted-foreground text-sm">{t.rooms.noServices || "No services specified by owner"}</p>
                            );
                          })() : (
                            <p className="text-muted-foreground text-sm">{t.rooms.noServices || "No services specified by owner"}</p>
                          )}
                        </div>

                        <div className="mt-10 pt-8 border-t border-border">
                          <Button 
                            size="lg" 
                            className="w-full md:w-auto md:min-w-[240px] text-lg h-14 gap-3 rounded-xl shadow-md"
                            variant={isPopular ? "default" : "secondary"}
                            disabled={pkg.availableRooms === 0 && false} // User wants availability unknown here
                            onClick={() => handleBookNow(pkg.name)}
                          >
                            <CalendarCheck className="w-5 h-5" />
                            {t.rooms.bookNow || "Book Now"}
                          </Button>
                        </div>
                      </div>

                      {/* Package Media Demo */}
                      <div className="order-1 lg:order-2 space-y-4">
                        <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-inner group bg-muted border border-border">
                          {pkg.videoUrl ? (
                            <>
                              <video 
                                src={pkg.videoUrl} 
                                poster={getFullImageUrl(activePackageImages[pkg.name] || pkg.image)}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                autoPlay 
                                loop 
                                muted 
                                playsInline
                              />
                              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 z-10 shadow-lg">
                                <PlayCircle className="w-4 h-4" /> {t.rooms.demoBadge || "Demo"}
                              </div>
                            </>
                          ) : (
                            <img 
                              src={getFullImageUrl(activePackageImages[pkg.name] || pkg.image)}
                              alt={pkg.name} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            />
                          )}

                          {/* Next/Prev Navigation Buttons */}
                          {pkg.images && pkg.images.length > 1 && (
                            <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-12 w-12 rounded-full bg-white/80 backdrop-blur-sm pointer-events-auto shadow-lg hover:bg-white"
                                onClick={() => {
                                  const images = pkg.images || [];
                                  const current = activePackageImages[pkg.name] || pkg.image;
                                  const idx = images.indexOf(current);
                                  const prevIdx = (idx - 1 + images.length) % images.length;
                                  setActivePackageImages(prev => ({ ...prev, [pkg.name]: images[prevIdx] }));
                                }}
                              >
                                <ChevronLeft className="h-6 w-6" />
                              </Button>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-12 w-12 rounded-full bg-white/80 backdrop-blur-sm pointer-events-auto shadow-lg hover:bg-white"
                                onClick={() => {
                                  const images = pkg.images || [];
                                  const current = activePackageImages[pkg.name] || pkg.image;
                                  const idx = images.indexOf(current);
                                  const nextIdx = (idx + 1) % images.length;
                                  setActivePackageImages(prev => ({ ...prev, [pkg.name]: images[nextIdx] }));
                                }}
                              >
                                <ChevronRight className="h-6 w-6" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Thumbnail gallery if multiple images exist */}
                        {pkg.images && pkg.images.length > 1 && (
                          <div className="flex flex-wrap gap-4 overflow-x-auto pb-2 custom-scrollbar">
                            {pkg.images.map((img: string, i: number) => {
                              const currentActive = activePackageImages[pkg.name] || pkg.image;
                              const isActive = currentActive === img;
                              
                              return (
                                <button 
                                  key={i}
                                  onClick={() => setActivePackageImages(prev => ({ ...prev, [pkg.name]: img }))}
                                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 shadow-sm ${
                                    isActive 
                                      ? 'border-primary shadow-md z-10' 
                                      : 'border-transparent opacity-60 grayscale-[0.5] blur-[1px] hover:opacity-100 hover:grayscale-0 hover:blur-0'
                                  }`}
                                >
                                  <img src={getFullImageUrl(img)} className="w-full h-full object-cover" alt="" />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Package Description Moved Outside the Grid Box */}
                    {(pkg.description || pkg.description_ml) && (
                      <div className="mt-8 p-8 bg-card rounded-3xl border border-border shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <h4 className="text-xl font-bold text-foreground">
                            {t.rooms.packageDescription || "About this Package"}
                          </h4>
                        </div>
                        <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
                          {tr(pkg.description_ml || pkg.description)}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </section>

          {/* About Section Moved to Bottom */}
          <section className="space-y-6 pt-12 border-t border-border">
            <div className="space-y-4">
              <h2 className="text-3xl font-heading font-bold text-foreground">{t.rooms.aboutTitle || "About the Property"}</h2>
              <div className="h-1 w-20 bg-primary rounded-full"></div>
            </div>
            
            <div className="bg-card border border-border p-6 md:p-8 rounded-3xl shadow-sm space-y-6 transition-all hover:shadow-md">
              <p className="text-lg leading-relaxed text-muted-foreground">{tr(room.description_ml || room.description)}</p>
              
              <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-border/50">
                <div className="p-6 rounded-2xl bg-muted/20 border border-border/30">
                  <h3 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    {t.rooms.ownerInfoTitle}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{tr(room.owner_info_ml || room.ownerInfo)}</p>
                </div>
                <div className="p-6 rounded-2xl bg-muted/20 border border-border/30">
                  <h3 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {t.rooms.roomDetailsTitle}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{tr(room.room_details_ml || room.roomDetails)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Pension reviews feed and summary ratings */}
          <PensionReviews pensionId={room.pension_id || parseInt(room.id)} />
        </div>
      </div>

      {/* Contact Host Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5" />
              {t.rooms.contactHostTitle || "Contact Host"}
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
                    <p className="font-medium">{t.rooms.phoneLabel || "Phone"}</p>
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
                    <p className="font-medium">{t.rooms.emailLabel || "Email"}</p>
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
                  {t.rooms.contactNotAvailable || "Contact information not available"}
                </p>
              )}
            </div>
            
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowContactModal(false)}>
                {t.rooms.closeButton || "Close"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* UnifiedAuthModal removed from here */}
    </div>
  );
};

export default RoomProfile;
