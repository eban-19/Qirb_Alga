import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useRoomById } from "@/hooks/use-rooms";
import { useLanguage } from "@/hooks/use-language";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import UnifiedAuthModal from "@/components/auth/UnifiedAuthModal";
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, ShieldCheck, User, Home, Calendar, AlertCircle, Users, Bed, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Helper function to construct full URLs for images (same as in RoomProfile)
const getFullImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    return '/src/assets/room-1.png';
  }
  
  // If it's already a full URL (starts with http), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a frontend asset path (/src/assets/), return as-is
  if (imagePath.startsWith('/src/assets/')) {
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

const Booking = () => {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: room, isLoading } = useRoomById(id);
  const { t, tr } = useLanguage();

  const { user, isAuthenticated } = useAuth();
  const pkgNameFromUrl = searchParams.get("package");
  
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  useEffect(() => {
    if (room && pkgNameFromUrl) {
      const pkg = room.packages.find((p: any) => p.name === pkgNameFromUrl);
      if (pkg) setSelectedPackage(pkg);
    }
  }, [room, pkgNameFromUrl]);

  useEffect(() => {
    if (!isAuthenticated) {
      // navigate("/"); // Should have been handled by RoomProfile, but safety first
    }
  }, [isAuthenticated]);

  const [formData, setFormData] = useState({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rooms: 1,
    fullName: user?.full_name || "",
    phone: user?.phone || "",
    paymentMethod: "chapa"
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.full_name || prev.fullName,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [passCode, setPassCode] = useState<string | null>(null);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [data, setData] = useState<any>(null);
  const [packageAvailability, setPackageAvailability] = useState<any[]>([]);
  const [activePromotions, setActivePromotions] = useState<any[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [dynamicPriceData, setDynamicPriceData] = useState<any>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(true); // Now verified by Auth modal or existing session
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [showAuthModal, setShowAuthModal] = useState(false);

  const checkAvailability = async () => {
    setIsCheckingAvailability(true);
    try {
      const response = await fetch(`http://localhost:3006/api/public/availability?pensionId=${id}&checkIn=${formData.checkIn}&checkOut=${formData.checkOut}`);
      const result = await response.json();
      if (result.success) {
        setPackageAvailability(result.data.packages || result.data);
        setActivePromotions(result.data.promotions || []);
        return result.data;
      }
    } catch (err) {
      console.error("Error checking availability:", err);
    } finally {
      setIsCheckingAvailability(false);
    }
    return null;
  };

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    if (!formData.phone) {
      toast.error("Please enter a phone number first.");
      return;
    }
    setIsSendingOtp(true);
    try {
      const response = await fetch('http://localhost:3006/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });
      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
        setResendTimer(60);
        toast.success("OTP sent successfully!");
      } else {
        toast.error(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      toast.error("Error sending OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      toast.error("Please enter the code sent to your phone.");
      return;
    }
    try {
      const response = await fetch('http://localhost:3006/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, code: otpCode })
      });
      const data = await response.json();
      if (data.success) {
        setOtpVerified(true);
        toast.success("Phone verified successfully!");
        handleNextStep();
      } else {
        toast.error(data.message || "Invalid OTP code.");
      }
    } catch (err) {
      toast.error("Error verifying OTP.");
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.checkIn && formData.checkOut;
      case 2:
        return !!selectedPackage && (!dynamicPriceData?.errors || dynamicPriceData.errors.length === 0);
      case 3:
        return formData.fullName && formData.phone;
      case 4:
        return formData.paymentMethod && idDocument;
      default:
        return false;
    }
  };

  const handleStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      if (isStepValid()) {
        handleNextStep();
      } else {
        toast.error("Please fill in all required fields for this step.");
      }
    } else {
      handleSubmit(e);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [systemSettings, setSystemSettings] = useState<Record<string, string>>({
    VAT_PERCENTAGE: "15",
    SERVICE_FEE_PERCENTAGE: "0"
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:3006/api/system/settings');
        const result = await response.json();
        if (result.success && result.data) {
          setSystemSettings(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch system settings:", error);
      }
    };
    fetchSettings();
  }, []);

  // Calculate pricing
  const checkInDate = new Date(formData.checkIn);
  const checkOutDate = new Date(formData.checkOut);
  
  // Dynamic Pricing Fetcher
  useEffect(() => {
    const fetchDynamicPrice = async () => {
      if (!id || !selectedPackage || !formData.checkIn || !formData.checkOut) return;
      
      setIsCalculatingPrice(true);
      try {
        const response = await fetch('http://localhost:3006/api/public/calculate-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pension_id: id,
            package_id: selectedPackage.id || selectedPackage.package_id,
            check_in: formData.checkIn,
            check_out: formData.checkOut,
            base_price: selectedPackage.price,
            guests: (selectedPackage.capacity || 2) * formData.rooms
          })
        });
        
        const result = await response.json();
        if (result.success && result.result) {
          setDynamicPriceData(result.result);
        }
      } catch (err) {
        console.error('Failed to fetch dynamic price:', err);
      } finally {
        setIsCalculatingPrice(false);
      }
    };
    
    // Use a small debounce
    const timeoutId = setTimeout(() => {
      fetchDynamicPrice();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [id, selectedPackage?.id, selectedPackage?.package_id, selectedPackage?.price, formData.checkIn, formData.checkOut, formData.rooms]);

  // Calculate lead time for early bird discount
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDateZero = new Date(checkInDate);
  checkInDateZero.setHours(0, 0, 0, 0);
  const timeDiffAdvance = checkInDateZero.getTime() - today.getTime();
  const daysInAdvance = Math.ceil(timeDiffAdvance / (1000 * 60 * 60 * 24));

  const timeDiffStay = checkOutDate.getTime() - checkInDate.getTime();
  const diffDays = Math.ceil(timeDiffStay / (1000 * 60 * 60 * 24));
  const nights = diffDays > 0 ? diffDays : 1;

  let appliedDiscountPercent = 0;
  let appliedPromoName = '';
  let appliedPromoType = '';

  // Find the best applicable promotion (respecting package scope)
  if (activePromotions.length > 0) {
    for (const promo of activePromotions) {
      // Check package scope: apply only if promotion is for all packages OR matches selected package
      const selectedPkgId = selectedPackage?.id || selectedPackage?.package_id;
      const promoAppliesToPackage = !promo.package_id || String(promo.package_id) === String(selectedPkgId);
      if (!promoAppliesToPackage) continue;

      if (promo.type === 'EARLY_BIRD' && promo.min_days && daysInAdvance >= promo.min_days) {
        if (promo.discount_percent > appliedDiscountPercent) {
          appliedDiscountPercent = promo.discount_percent;
          appliedPromoName = promo.name;
          appliedPromoType = promo.type;
        }
      } else if (promo.type === 'LONG_STAY' && promo.min_days && nights >= promo.min_days) {
        if (promo.discount_percent > appliedDiscountPercent) {
          appliedDiscountPercent = promo.discount_percent;
          appliedPromoName = promo.name;
          appliedPromoType = promo.type;
        }
      } else if (promo.type === 'LAST_MINUTE' && promo.max_days && daysInAdvance <= promo.max_days) {
        if (promo.discount_percent > appliedDiscountPercent) {
          appliedDiscountPercent = promo.discount_percent;
          appliedPromoName = promo.name;
          appliedPromoType = promo.type;
        }
      }
    }
  }

  // Find the selected package's availability info
  const pkgAvail = packageAvailability.find(p => p.packageId === selectedPackage?.id || p.packageName === selectedPackage?.name);


  const vatRate = parseFloat(systemSettings.VAT_PERCENTAGE) / 100;
  const serviceFeeRate = parseFloat(systemSettings.SERVICE_FEE_PERCENTAGE) / 100;

  // If dynamic pricing is available, use it. Otherwise fallback to standard math.
  const rawBaseSubtotal = dynamicPriceData ? dynamicPriceData.baseTotal : (selectedPackage?.price || 0) * nights;
  const rawDynamicSubtotal = dynamicPriceData ? dynamicPriceData.finalTotal : rawBaseSubtotal;

  const baseSubtotal = rawBaseSubtotal * formData.rooms;
  const dynamicSubtotal = rawDynamicSubtotal * formData.rooms;
  
  const discountAmount = dynamicSubtotal * (appliedDiscountPercent / 100);
  const subtotal = dynamicSubtotal - discountAmount;
  
  const tax = subtotal * vatRate;
  const serviceFee = subtotal * serviceFeeRate;
  const total = subtotal + tax + serviceFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!formData.checkIn || !formData.checkOut) {
        toast.error("Please select both check-in and check-out dates.");
        return;
      }
      if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
        toast.error("Check-out date must be after check-in date.");
        return;
      }

      const availability = await checkAvailability();
      if (!availability) {
        toast.error("Could not verify availability. Please try again.");
        return;
      }
      
      const pkgs = Array.isArray(availability) ? availability : availability.packages || [];
      const totalAvailable = pkgs.reduce((sum: number, pkg: any) => sum + pkg.availableRooms, 0);
      if (totalAvailable === 0) {
        toast.error("Sorry, this property is fully booked for the selected dates.");
        return;
      }
    }

    if (currentStep === 2) {
      // Check if selected package is available for these dates
      const pkgAvail = packageAvailability.find(p => p.packageId === selectedPackage?.id || p.packageName === selectedPackage?.name);
      if (pkgAvail && pkgAvail.availableRooms < formData.rooms) {
        toast.error(`Only ${pkgAvail.availableRooms} room(s) available for the selected package and dates.`);
        return;
      }

      if (!isAuthenticated) {
        setShowAuthModal(true);
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setCurrentStep(3);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.checkIn || !formData.checkOut || !formData.fullName || !formData.phone || !idDocument) {
      toast.error("Please fill in all required fields, including your ID document.");
      return;
    }

    setIsSubmitting(true);

    try {
      // First, create the booking
      const payload = new FormData();
      payload.append('pensionId', id);
      payload.append('packageName', selectedPackage?.name);
      payload.append('checkIn', formData.checkIn);
      payload.append('checkOut', formData.checkOut);
      payload.append('fullName', formData.fullName);
      payload.append('phone', formData.phone);
      payload.append('totalPrice', total.toString());
      payload.append('rooms', formData.rooms.toString());
      payload.append('guests', ((selectedPackage?.capacity || 2) * formData.rooms).toString());
      if (idDocument) {
        payload.append('idDocument', idDocument);
      }

      const response = await fetch('http://localhost:3006/api/public/bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: payload
      });

      const responseData = await response.json();

      if (responseData.success) {
        const bookingId = responseData.data?.bookingIds?.[0] || responseData.data?.booking?.booking_id || responseData.data?.bookingId;
        const requiresApproval = responseData.data?.requiresApproval;
        
        if (requiresApproval) {
           toast.success("Booking request sent! The host will review your request shortly.");
           navigate('/profile/bookings');
           return;
        }
        
        // Redirect to Chapa Payment
        const cleanName = formData.fullName.trim();
        const nameParts = cleanName.split(/\s+/);
        const fName = nameParts[0] || 'Guest';
        const lName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'User';

        const paymentResponse = await fetch('http://localhost:3006/api/payments/initialize-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            amount: total.toString(),
            email: `${fName.toLowerCase()}@guest.qirbalga.com`,
            firstName: fName,
            lastName: lName,
            phone: formData.phone
          })
        });
        
        const paymentData = await paymentResponse.json();
        if (paymentData.success && paymentData.data.checkout_url) {
          window.location.href = paymentData.data.checkout_url;
          return;
        } else {
          toast.error("Failed to initialize payment gateway.");
        }
      } else {
        toast.error(responseData.message || "Failed to confirm booking.");
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      toast.error("An error occurred while submitting your booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !room || !selectedPackage) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-32 pb-16 text-center text-muted-foreground">{t.rooms.loadingBooking}</main>
        <Footer />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-32 pb-16 flex items-center justify-center px-4">
          <div className="max-w-md w-full mx-auto p-8 bg-card border border-border rounded-3xl shadow-xl text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-foreground">{t.booking.successTitle}</h1>
            <p className="text-muted-foreground text-lg">
              {t.booking.successDesc} <span className="font-semibold text-foreground">Room {data.data?.booking?.roomNumber || 'Assigned'}</span>.
            </p>
            <div className="p-6 bg-gradient-to-br from-card to-muted/30 rounded-3xl border border-primary/20 text-left space-y-4 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
              
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Booking Receipt</span>
                <span className="text-xs font-mono text-primary font-bold">#{bookingId || 'PENDING'}</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Guest</span>
                  <span className="text-sm font-semibold">{formData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Room</span>
                  <span className="text-sm font-semibold">Room {data.data?.booking?.roomNumber || 'Assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Check-in</span>
                  <span className="text-sm font-semibold">{formData.checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Check-out</span>
                  <span className="text-sm font-semibold">{formData.checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">VAT ({systemSettings.VAT_PERCENTAGE}%)</span>
                  <span className="text-sm font-semibold">ETB {tax.toLocaleString()}</span>
                </div>
                {parseFloat(systemSettings.SERVICE_FEE_PERCENTAGE) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Service Fee ({systemSettings.SERVICE_FEE_PERCENTAGE}%)</span>
                    <span className="text-sm font-semibold">ETB {serviceFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-dashed border-border">
                  <span className="text-sm font-bold">Payment Method</span>
                  <span className="text-sm font-semibold text-amber-600">Pay at Hotel</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">Total to Pay</span>
                  <span className="text-lg font-black text-primary">ETB {total.toLocaleString()}</span>
                </div>
              </div>

              {passCode && (
                <div className="mt-6 p-4 bg-primary text-primary-foreground rounded-2xl text-center space-y-1 shadow-lg shadow-primary/20">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80">Digital Access Key</p>
                  <p className="text-3xl font-mono font-black tracking-[0.3em]">{passCode}</p>
                </div>
              )}

              <p className="text-[10px] text-center text-muted-foreground mt-4 italic">
                * Please show this digital slip or the passcode upon arrival for verification.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => window.print()}>
                Print Slip
              </Button>
              <Button className="flex-1 rounded-xl h-12 shadow-lg shadow-primary/20" onClick={() => navigate("/")}>
                {t.booking.backToHome}
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-32 container mx-auto px-4 lg:px-8">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> {t.rooms.backToRooms}
        </Button>
        
        <div className="mb-8 block md:hidden">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{t.booking.secureBooking}</h1>
          <p className="text-muted-foreground">{t.booking.secureBookingDesc}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative border-t-0 lg:border-t lg:border-border lg:pt-8">
          
          {/* Left Column: Form */}
          <div className="w-full lg:w-[60%] space-y-8">
            <div className="hidden md:block mb-8">
              <h1 className="text-4xl font-heading font-bold text-foreground mb-2">{t.booking.secureBooking}</h1>
              <p className="text-muted-foreground text-lg">{t.booking.secureBookingDesc}</p>
            </div>

            <form onSubmit={handleStepSubmit} className="space-y-10">
              
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-12">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 shadow-sm ${
                      currentStep >= step 
                        ? 'bg-primary text-primary-foreground scale-110 shadow-primary/20' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {step === 1 && <Calendar className="w-5 h-5" />}
                      {step === 2 && <Package className="w-5 h-5" />}
                      {step === 3 && <User className="w-5 h-5" />}
                      {step === 4 && <CreditCard className="w-5 h-5" />}
                    </div>
                    {step < totalSteps && (
                      <div className={`w-12 sm:w-20 h-1 mx-2 rounded-full transition-colors duration-500 ${
                        currentStep > step ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Dates */}
              {currentStep === 1 && (
                <section className="bg-card p-6 md:p-10 rounded-[2.5rem] border border-border shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-heading font-bold flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      {t.booking.pickStayDates}
                    </h2>
                    <p className="text-muted-foreground">{t.booking.pickStayDatesDesc}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="checkIn">{t.booking.checkInDate}</Label>
                      <Input 
                        id="checkIn" 
                        name="checkIn" 
                        type="date" 
                        required 
                        min={
                          (() => {
                            const today = new Date();
                            if (room?.bookingPolicy && !room.bookingPolicy.allow_same_day) {
                              today.setDate(today.getDate() + 1);
                            }
                            if (room?.bookingPolicy?.min_advance_days) {
                              today.setDate(today.getDate() + room.bookingPolicy.min_advance_days);
                            }
                            return today.toISOString().split('T')[0];
                          })()
                        }
                        max={
                          room?.bookingPolicy?.max_advance_days 
                            ? new Date(new Date().getTime() + room.bookingPolicy.max_advance_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                            : undefined
                        }
                        value={formData.checkIn} 
                        onChange={handleInputChange} 
                        className="h-14 rounded-2xl px-6" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOut">{t.booking.checkOutDate}</Label>
                      <Input 
                        id="checkOut" 
                        name="checkOut" 
                        type="date" 
                        required 
                        min={
                          (() => {
                            const minStay = room?.bookingPolicy?.min_stay_nights || 1;
                            const checkInDate = new Date(formData.checkIn || new Date());
                            checkInDate.setDate(checkInDate.getDate() + minStay);
                            return checkInDate.toISOString().split('T')[0];
                          })()
                        } 
                        max={
                          (() => {
                            const maxStay = room?.bookingPolicy?.max_stay_nights;
                            if (!maxStay) return undefined;
                            const checkInDate = new Date(formData.checkIn || new Date());
                            checkInDate.setDate(checkInDate.getDate() + maxStay);
                            return checkInDate.toISOString().split('T')[0];
                          })()
                        }
                        value={formData.checkOut} 
                        onChange={handleInputChange} 
                        className="h-14 rounded-2xl px-6" 
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button 
                        type="button" 
                        className="w-full h-14 rounded-xl text-lg font-bold" 
                        onClick={handleNextStep}
                        disabled={isCheckingAvailability}
                    >
                        {isCheckingAvailability ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {t.booking.checkingAvailability}
                          </>
                        ) : (
                          <>
                            {t.booking.checkAvailability} <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                    </Button>
                  </div>
                </section>
              )}

              {/* Step 2: Package Selection */}
              {currentStep === 2 && (
                <section className="bg-card p-6 md:p-10 rounded-[2.5rem] border border-border shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-heading font-bold flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      {t.booking.selectPackage}
                    </h2>
                    <p className="text-muted-foreground">{t.booking.selectPackageDesc}</p>
                  </div>
                  
                  <div className="grid gap-4">
                    {room.packages.map((pkg: any) => {
                      const avail = packageAvailability.find(p => p.packageId === pkg.id || p.packageName === pkg.name);
                      const isSoldOut = avail ? avail.availableRooms === 0 : false;
                      
                      return (
                        <div 
                          key={pkg.name}
                          onClick={() => !isSoldOut && setSelectedPackage(pkg)}
                          className={`relative cursor-pointer p-6 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                            selectedPackage?.name === pkg.name 
                              ? 'border-primary bg-primary/5 shadow-md' 
                              : isSoldOut 
                                ? 'border-muted bg-muted/20 opacity-70 cursor-not-allowed'
                                : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {avail && avail.discountPercentage > 0 && avail.discountMinDays > 0 && (
                            <div className="absolute -top-3 left-4 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md z-10">
                              {avail.discountMinDays}+ Days Early Bird: {avail.discountPercentage}% Off
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-muted rounded-xl overflow-hidden shrink-0">
                              <img src={getFullImageUrl(pkg.image)} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div>
                              <h4 className="font-bold">{tr(pkg.name_ml || pkg.name)}</h4>
                              <div className="flex gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {pkg.capacity}</span>
                                <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {pkg.beds}</span>
                                {(() => {
                                  const count = avail ? avail.availableRooms : 0;
                                  
                                  if (count > 0) {
                                    return (
                                      <span className="flex items-center gap-1 text-green-600 font-medium">
                                        <CheckCircle2 className="w-3 h-3" /> {count} Left
                                      </span>
                                    );
                                  } else {
                                    return (
                                      <span className="flex items-center gap-1 text-red-600 font-medium">
                                        <AlertCircle className="w-3 h-3" /> Sold Out
                                      </span>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {avail && avail.discountPercentage > 0 && avail.discountMinDays > 0 && daysInAdvance >= avail.discountMinDays ? (
                              <>
                                <div className="text-xs text-muted-foreground line-through decoration-red-500/50">ETB {pkg.price.toLocaleString()}</div>
                                <div className="font-black text-lg text-green-600">ETB {(pkg.price * (1 - avail.discountPercentage / 100)).toLocaleString()}</div>
                              </>
                            ) : (
                              <div className={`font-black text-lg ${isSoldOut ? 'text-muted-foreground line-through' : ''}`}>ETB {pkg.price.toLocaleString()}</div>
                            )}
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">per night</div>
                          </div>
                          {selectedPackage?.name === pkg.name && (
                            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-md z-10">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="rooms">{t.booking.numberOfRooms}</Label>
                      <select 
                        id="rooms" 
                        name="rooms" 
                        required 
                        value={formData.rooms} 
                        onChange={(e) => setFormData(prev => ({ ...prev, rooms: parseInt(e.target.value) }))}
                        className="flex h-14 w-full rounded-2xl border border-input bg-background px-6 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {(() => {
                          const avail = packageAvailability.find(p => p.packageId === selectedPackage?.id || p.packageName === selectedPackage?.name);
                          const count = avail ? avail.availableRooms : 0;
                          return Array.from({ length: Math.min(count, 10) }).map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1} Room{i > 0 ? 's' : ''}</option>
                          ));
                        })()}
                      </select>
                      {selectedPackage && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Total Capacity: {(selectedPackage.capacity || 2) * formData.rooms} Guests
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-8">
                    {dynamicPriceData?.errors && dynamicPriceData.errors.length > 0 && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="mb-1">Cannot proceed with booking:</p>
                          {dynamicPriceData.errors.map((err: string, i: number) => <div key={i}>• {err}</div>)}
                        </div>
                      </div>
                    )}
                    <Button 
                      type="button" 
                      className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20" 
                      onClick={handleNextStep}
                      disabled={!selectedPackage || (() => {
                        const avail = packageAvailability.find(p => p.packageId === selectedPackage?.id || p.packageName === selectedPackage?.name);
                        return !avail || avail.availableRooms === 0;
                      })() || (dynamicPriceData?.errors && dynamicPriceData.errors.length > 0)}
                    >
                      {isAuthenticated ? t.booking.continueToGuestDetails : t.booking.signInToComplete}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </section>
              )}

              {/* Step 3: Guest Details */}
              {currentStep === 3 && (
                <section className="bg-card p-6 md:p-10 rounded-[2.5rem] border border-border shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-heading font-bold flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      {t.booking.stepGuestDetails || "Guest Details"}
                    </h2>
                    <p className="text-muted-foreground">{t.booking.guestDetailsDesc}</p>
                  </div>
                  
                  <div className="grid gap-8">
                    <div className="bg-muted/30 p-6 rounded-2xl border border-border/50 flex flex-col md:flex-row gap-6 md:gap-12">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">{t.booking.guestName || "Guest Name"}</div>
                        <div className="text-lg font-semibold flex items-center gap-2">
                          {formData.fullName}
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">{t.booking.phoneNumber || "Phone Number"}</div>
                        <div className="text-lg font-semibold flex items-center gap-2">
                          {formData.phone}
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idDocument">{t.booking.idDocumentRequired}</Label>
                      <div className="relative group">
                        <Input
                          id="idDocument"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
                          className="h-16 w-full rounded-2xl cursor-pointer bg-muted/20 border-dashed border-2 hover:border-primary/50 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{t.booking.idDocumentDesc}</p>
                    </div>
                  </div>
                  <div className="pt-8">
                    <Button 
                      type="button" 
                      className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20" 
                      onClick={handleNextStep}
                      disabled={!idDocument}
                    >
                      {t.booking.reviewAndPay} <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </section>
              )}

              <UnifiedAuthModal 
                isOpen={showAuthModal} 
                onClose={() => setShowAuthModal(false)} 
                onSuccess={handleAuthSuccess}
                defaultFullName={formData.fullName}
              />

              {/* Step 4: Payment */}
              {currentStep === 4 && (
                <section className="bg-card p-6 md:p-10 rounded-[2.5rem] border border-border shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-heading font-bold flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>
                      {t.booking.checkoutAndPayment}
                    </h2>
                    <p className="text-muted-foreground">{t.booking.checkoutDesc}</p>
                  </div>
                  
                  <div className="space-y-6">
                    <label className="relative block cursor-pointer rounded-3xl border-2 p-8 transition-all duration-500 border-primary bg-primary/5 ring-8 ring-primary/5 shadow-2xl shadow-primary/10">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="chapa"
                        checked={true}
                        readOnly
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-20 h-20 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 transform transition-transform group-hover:scale-110">
                          <CreditCard className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-black text-2xl tracking-tight">{t.booking.secureOnlinePayment}</h3>
                          <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                            {t.booking.paySafelyDesc}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-xs font-bold uppercase tracking-widest text-green-600">{t.booking.encryptedSecure}</span>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 text-sm text-muted-foreground flex gap-4 items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-medium">
                      {t.booking.redirectMessage}
                    </p>
                  </div>
                </section>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t.booking.previous}
                </Button>
                
                <Button
                  type="submit"
                  disabled={!isStepValid()}
                  className="flex items-center gap-2"
                >
                  {currentStep === totalSteps ? (
                      <>
                        {isSubmitting ? (
                          <>Processing...</>
                        ) : (
                          <>
                            {room?.bookingPolicy && !room.bookingPolicy.instant_booking ? (
                              <>
                                <CreditCard className="w-4 h-4" />
                                Request to Book
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4" />
                                {t.booking.proceedToPayment}
                              </>
                            )}
                          </>
                        )}
                      </>
                  ) : (
                    <>
                      {t.booking.next}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Room Details & Pricing */}
          <div className="w-full lg:w-[35%] lg:sticky lg:top-32 lg:self-start">
            <div className="space-y-6 pb-12 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 scrollbar-hide">
              {/* Room Card */}
              <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={getFullImageUrl(selectedPackage.image)}
                    alt={selectedPackage.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/src/assets/room-1.png';
                    }}
                  />
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-lg">{room.name}</h3>
                    <p className="text-muted-foreground text-sm">{selectedPackage.name}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>{selectedPackage.capacity || 0} Guests</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                      <Bed className="w-3.5 h-3.5 text-primary" />
                      <span>{selectedPackage.beds || 0} Beds</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t.propertyCard?.perNight || t.booking?.perNight || "Per Night"}</span>
                    <span className="font-bold text-lg">ETB {selectedPackage.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-card rounded-3xl border border-border shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-lg flex items-center justify-between">
                  {t.booking?.pricingSummary || "Pricing Summary"}
                  {appliedDiscountPercent > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                      {t.booking?.promoApplied || "Promo Applied"}
                    </span>
                  )}
                </h3>
                <div className="space-y-2">
                  {dynamicPriceData && dynamicPriceData.breakdown ? (
                    dynamicPriceData.breakdown.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <span className={`text-sm ${item.amount < 0 ? 'text-green-600 font-semibold' : 'text-muted-foreground'}`}>
                          {item.type} {item.isPerNight ? `x ${diffDays} nights` : ''} {formData.rooms > 1 ? `x ${formData.rooms} rooms` : ''}
                        </span>
                        <span className={`text-sm ${item.amount < 0 ? 'text-green-600 font-bold' : ''}`}>
                          {item.amount < 0 ? '-' : ''} ETB {(Math.abs(item.amount) * formData.rooms).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t.booking?.roomRate || "Room Rate"}</span>
                      <span className="text-sm">ETB {selectedPackage.price.toLocaleString()} x {diffDays} nights {formData.rooms > 1 ? `x ${formData.rooms} rooms` : ''}</span>
                    </div>
                  )}
                  {appliedDiscountPercent > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm font-semibold">{appliedPromoName || t.booking?.specialSavings || 'Special Savings'} ({appliedDiscountPercent}%)</span>
                      <span className="text-sm font-bold">- ETB {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm font-semibold">{t.booking?.subtotal || "Subtotal"}</span>
                    <span className="font-semibold">ETB {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t.booking?.vat || "VAT"} ({systemSettings.VAT_PERCENTAGE}%)</span>
                    <span className="font-semibold">ETB {tax.toLocaleString()}</span>
                  </div>
                  {parseFloat(systemSettings.SERVICE_FEE_PERCENTAGE) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t.booking?.serviceFee || "Service Fee"} ({systemSettings.SERVICE_FEE_PERCENTAGE}%)</span>
                      <span className="font-semibold">ETB {serviceFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-bold">{t.booking?.total || "Total"}</span>
                    <span className="font-bold text-lg text-primary">ETB {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-green-50 border border-green-200 rounded-3xl p-4 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 text-green-600" />
                <p className="text-sm text-green-700">Your booking is secure and protected</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Booking;