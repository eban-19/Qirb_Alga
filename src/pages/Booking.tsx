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
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, ShieldCheck, User, Home, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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
    return `http://localhost:3005${imagePath}`;
  }
  
  // If it's a relative path without /uploads/, prepend it
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `http://localhost:3005/uploads${normalizedPath}`;
};

const Booking = () => {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: room, isLoading } = useRoomById(id);
  const { t, tr } = useLanguage();

  const pkgName = searchParams.get("package") || "Standard";
  
  const selectedPackage = useMemo(() => {
    return room?.packages.find(p => p.name === pkgName) || room?.packages[1] || room?.packages[0];
  }, [room, pkgName]);

  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    rooms: 1,
    fullName: "",
    phone: "",
    specialRequests: "",
    paymentMethod: "chapa"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [passCode, setPassCode] = useState<string | null>(null);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [data, setData] = useState<any>(null);

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

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
      const response = await fetch('http://localhost:3005/api/otp/send', {
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
      const response = await fetch('http://localhost:3005/api/otp/verify', {
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
        return otpVerified;
      case 2:
        return formData.checkIn && formData.checkOut && formData.rooms > 0;
      case 3:
        return formData.fullName;
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

  // Calculate pricing
  const checkInDate = new Date(formData.checkIn);
  const checkOutDate = new Date(formData.checkOut);
  const diffTime = checkOutDate.getTime() - checkInDate.getTime();
  const diffDays = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 1; // Default to 1 night if invalid

  const subtotal = (selectedPackage?.price || 0) * diffDays * formData.rooms;
  const tax = subtotal * 0.15; // Assuming 15% VAT for realism
  const total = subtotal + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
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
      payload.append('packageName', pkgName);
      payload.append('checkIn', formData.checkIn);
      payload.append('checkOut', formData.checkOut);
      payload.append('fullName', formData.fullName);
      payload.append('phone', formData.phone);
      payload.append('specialRequests', formData.specialRequests);
      payload.append('totalPrice', total.toString());
      payload.append('rooms', formData.rooms.toString());
      if (idDocument) {
        payload.append('idDocument', idDocument);
      }

      const response = await fetch('http://localhost:3005/api/public/bookings', {
        method: 'POST',
        body: payload
      });

      const responseData = await response.json();

      if (responseData.success) {
        const bookingId = responseData.data?.bookingIds?.[0] || responseData.data?.booking?.booking_id;
        
        // Redirect to Chapa Payment
        const cleanName = formData.fullName.trim();
        const nameParts = cleanName.split(/\s+/);
        const fName = nameParts[0] || 'Guest';
        const lName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'User';

        const paymentResponse = await fetch('http://localhost:3005/api/payments/initialize-booking', {
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
                      {step === 1 && <ShieldCheck className="w-5 h-5" />}
                      {step === 2 && <Calendar className="w-5 h-5" />}
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

              {/* Step 1: Phone Verification */}
              {currentStep === 1 && (
                <section className="bg-card p-6 md:p-10 rounded-[2.5rem] border border-border shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-heading font-bold flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                      </div>
                      Phone Verification
                    </h2>
                    <p className="text-muted-foreground">Verify your phone number to secure your booking.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-3">
                        <Input 
                          id="phone" 
                          name="phone" 
                          type="tel" 
                          placeholder="+251 9XX XXX XXX" 
                          required 
                          disabled={otpSent && !otpVerified}
                          value={formData.phone} 
                          onChange={handleInputChange} 
                          className="h-14 w-full rounded-2xl text-lg px-6" 
                        />
                        {!otpSent && (
                          <Button 
                            type="button" 
                            onClick={handleSendOtp} 
                            disabled={isSendingOtp || !formData.phone}
                            className="h-14 px-8 rounded-2xl shrink-0"
                          >
                            {isSendingOtp ? "Sending..." : "Send OTP"}
                          </Button>
                        )}
                        {otpSent && !otpVerified && (
                           <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setOtpSent(false)} 
                            className="h-14 px-6 rounded-2xl shrink-0"
                          >
                            Change
                          </Button>
                        )}
                      </div>
                    </div>

                    {otpSent && !otpVerified && (
                      <div className="space-y-4 pt-4 border-t border-dashed border-border animate-in zoom-in-95 duration-300">
                        <div className="space-y-3">
                          <Label htmlFor="otpCode">Enter 6-digit Code</Label>
                          <Input 
                            id="otpCode" 
                            placeholder="· · · · · ·" 
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="h-14 w-full rounded-2xl text-center text-2xl font-mono tracking-[0.5em] px-6" 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Button 
                            type="button" 
                            onClick={handleVerifyOtp} 
                            className="h-14 w-full rounded-2xl shadow-lg shadow-primary/20"
                          >
                            Verify & Continue
                          </Button>
                        </div>
                        <div className="text-center">
                          {resendTimer > 0 ? (
                            <p className="text-sm text-muted-foreground">Resend in {resendTimer}s</p>
                          ) : (
                            <button 
                              type="button" 
                              onClick={handleSendOtp}
                              className="text-sm text-primary font-bold hover:underline"
                            >
                              Resend OTP
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {otpVerified && (
                      <div className="p-6 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-4 text-green-700 animate-in zoom-in-95 duration-300">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold">Verified!</p>
                          <p className="text-sm opacity-80">Phone number {formData.phone} verified.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Step 2: Stay Details */}
              {currentStep === 2 && (
                <section className="bg-card p-6 md:p-10 rounded-[2.5rem] border border-border shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-heading font-bold flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      Stay Information
                    </h2>
                    <p className="text-muted-foreground">Select your dates and number of rooms.</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="checkIn">{t.booking.checkInDate}</Label>
                      <Input id="checkIn" name="checkIn" type="date" required min={new Date().toISOString().split('T')[0]} value={formData.checkIn} onChange={handleInputChange} className="h-12 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOut">{t.booking.checkOutDate}</Label>
                      <Input id="checkOut" name="checkOut" type="date" required min={formData.checkIn || new Date().toISOString().split('T')[0]} value={formData.checkOut} onChange={handleInputChange} className="h-12 w-full" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rooms">{t.booking.numberOfRooms}</Label>
                    <select 
                      id="rooms" 
                      name="rooms" 
                      required 
                      value={formData.rooms} 
                     
                      onChange={(e) => setFormData(prev => ({ ...prev, rooms: parseInt(e.target.value) }))}
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {Array.from({ length: selectedPackage.availableRooms || 1 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">{t.booking.maxAvailable} {selectedPackage.availableRooms}</p>
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
                      Guest Details
                    </h2>
                    <p className="text-muted-foreground">Tell us a bit about yourself.</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{t.booking.fullName}</Label>
                      <Input id="fullName" name="fullName" placeholder="Abebe Bikila" required value={formData.fullName} onChange={handleInputChange} className="h-14 w-full rounded-2xl px-6" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Verified)</Label>
                      <Input id="phone" name="phone" disabled value={formData.phone} className="h-14 w-full rounded-2xl px-6 bg-muted/50" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="idDocument">ID Document (Required)</Label>
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
                      <p className="text-xs text-muted-foreground">Please upload a valid ID document or passport for verification.</p>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="specialRequests">{t.booking.specialRequests}</Label>
                      <Textarea id="specialRequests" name="specialRequests" placeholder="Any special requests..." value={formData.specialRequests} onChange={handleInputChange} className="min-h-[120px] w-full rounded-2xl p-6" />
                    </div>
                  </div>
                </section>
              )}

              {/* Step 4: Payment */}
              {currentStep === 4 && (
                <section className="bg-card p-6 md:p-10 rounded-[2.5rem] border border-border shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-heading font-bold flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>
                      Checkout & Payment
                    </h2>
                    <p className="text-muted-foreground">Choose your payment method and complete the booking.</p>
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
                          <h3 className="font-black text-2xl tracking-tight">Secure Online Payment</h3>
                          <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                            Pay safely via <strong>Chapa</strong> using Telebirr, Bank Transfer, or Debit/Credit Cards.
                          </p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-xs font-bold uppercase tracking-widest text-green-600">Encrypted & Secure</span>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 text-sm text-muted-foreground flex gap-4 items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-medium">
                      You will be redirected to the secure Chapa gateway to complete your payment. Once finished, your booking will be instantly confirmed.
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
                  Previous
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
                              <CreditCard className="w-4 h-4" />
                              Proceed to Payment
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Room Details & Pricing */}
          <div className="w-full lg:w-[35%]">
            <div className="lg:sticky lg:top-32 space-y-6 pb-12 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 scrollbar-hide">
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
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Per Night</span>
                    <span className="font-bold text-lg">ETB {selectedPackage.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-card rounded-3xl border border-border shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-lg">Pricing Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Room Rate</span>
                    <span className="text-sm">ETB {selectedPackage.price.toLocaleString()} x {diffDays} nights</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">ETB {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">VAT (15%)</span>
                    <span className="font-semibold">ETB {tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-bold">Total</span>
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