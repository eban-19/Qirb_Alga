import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Package as PackageIcon, 
  X, 
  CheckCircle2, 
  Box, 
  Image as ImageIcon,
  DollarSign,
  Info,
  Layers,
  ExternalLink,
  RotateCw,
  Sparkles
} from 'lucide-react';
import { Package } from '../../types/dashboard';
import { Badge } from '../ui/badge';
import { getFullImageUrl } from '../../lib/rooms';

interface ViewPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: Package | null;
  language: string;
}

export const ViewPackageModal: React.FC<ViewPackageModalProps> = ({
  isOpen,
  onClose,
  pkg,
  language
}) => {
  if (!isOpen || !pkg) return null;

  const getName = () => {
    if (language === 'en') return pkg.name_en || pkg.name;
    if (language === 'am') return pkg.name_am || pkg.name;
    if (language === 'om') return pkg.name_om || pkg.name;
    return pkg.name;
  };

  const getDescription = () => {
    // Priority: Language specific -> Generic description -> Fallback text
    let desc = "";
    if (language === 'en') desc = pkg.description_en || "";
    else if (language === 'am') desc = pkg.description_am || "";
    else if (language === 'om') desc = pkg.description_om || "";
    
    return desc || pkg.description || "No description provided for this package tier.";
  };

  // Combine images array and single image field for fallback
  const allImages = pkg.images && pkg.images.length > 0 
    ? pkg.images 
    : (pkg.image ? [pkg.image] : []);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-4xl max-h-[90vh] border-none shadow-2xl bg-white ring-1 ring-slate-200 overflow-hidden flex flex-col rounded-[2.5rem] animate-in zoom-in-95 duration-300">
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <CardHeader className="pb-4 border-b border-slate-50 p-6">
          <CardTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50">
                <PackageIcon className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Package Details</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500 font-medium">Viewing details for</span>
                  <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200 font-bold">{getName()}</Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5 text-slate-400" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          {/* Media Header Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-b border-slate-100 pb-6">
            {/* Gallery Column */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Media Gallery</h3>
                </div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                  {allImages.length} Images
                </span>
              </div>
              
              {allImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {allImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-100 group">
                      <img 
                        src={getFullImageUrl(img)} 
                        alt={`Package view ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="h-12 w-12 mb-2 opacity-20" />
                  <p className="text-sm font-bold">No images uploaded</p>
                </div>
              )}
            </div>

            {/* VR Tour Column */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                  <RotateCw className="h-5 w-5 text-orange-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">VR Tour Files</h3>
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${pkg.virtual_tour_url ? 'text-green-500' : 'text-slate-300'}`}>
                  {pkg.virtual_tour_url ? 'Available' : 'Not Available'}
                </span>
              </div>

              <div className="aspect-[16/10] rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center p-8 group transition-all hover:bg-slate-100/50">
                {pkg.virtual_tour_url ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                      <Box className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800">3D Interactive Experience</h4>
                      <p className="text-xs text-slate-400 font-medium max-w-[200px] mx-auto">Explore this package tier in full immersive 3D</p>
                    </div>
                    <Button variant="outline" className="bg-white border-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl font-bold transition-all shadow-sm h-11 px-8" asChild>
                      <a href={pkg.virtual_tour_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Launch VR Tour
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4 opacity-40">
                    <RotateCw className="h-12 w-12 text-slate-300 mx-auto" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-tighter">No VR tour available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
            {/* Left Column: Info & Pricing */}
            <div className="space-y-6">
              <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
                {pkg.isMostPopular && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full shadow-sm w-fit">
                    <Sparkles className="h-3 w-3 fill-white" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Most Popular</span>
                  </div>
                )}
                
                <div className="space-y-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Pricing</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl md:text-5xl font-black text-blue-600 tracking-tighter">ETB {Number(pkg.price).toLocaleString()}</span>
                    <span className="text-slate-400 font-bold text-sm md:text-lg">/ night</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Amenities */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Included Amenities</h3>
                </div>
                <Badge className="bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-50">
                  {pkg.services?.length || 0} Items
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pkg.services && pkg.services.length > 0 ? (
                  pkg.services.map((service: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-purple-200 group">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{service}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                    <Info className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 font-bold">No specific amenities listed</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full Width Row: Description */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Detailed Description</h3>
            </div>
            <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
              <p className="text-slate-600 font-medium leading-relaxed">
                {getDescription()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
