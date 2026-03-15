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
import { ArrowLeft, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

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
    email: "",
    specialRequests: "",
    paymentMethod: "pay_at_hotel"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.checkIn || !formData.checkOut || !formData.fullName || !formData.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    // Mock API Call Latency
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success("Booking confirmed successfully!");
    }, 2000);
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
              {t.booking.successDesc} <span className="font-semibold text-foreground">{room.name}</span>.
            </p>
            <div className="p-4 bg-muted/50 rounded-xl border border-border text-left space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t.booking.bookingId}</span> <span className="font-mono font-medium">#BKG-{Math.floor(Math.random() * 10000)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t.booking.checkInDate.replace(' *', '')}</span> <span className="font-medium">{formData.checkIn}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t.booking.totalPaid}</span> <span className="font-medium">ETB {total.toLocaleString()}</span></div>
            </div>
            <Button size="lg" className="w-full mt-6" onClick={() => navigate("/")}>
              {t.booking.backToHome}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 container mx-auto px-4 lg:px-8">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> {t.rooms.backToRooms}
        </Button>
        
        <div className="mb-8 block md:hidden">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{t.booking.secureBooking}</h1>
          <p className="text-muted-foreground">{t.booking.secureBookingDesc}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative border-t-0 lg:border-t lg:border-border lg:pt-8">
          
          {/* Left Column: Form */}
          <div className="w-full lg:w-3/5 space-y-8">
            <div className="hidden md:block mb-8">
              <h1 className="text-4xl font-heading font-bold text-foreground mb-2">{t.booking.secureBooking}</h1>
              <p className="text-muted-foreground text-lg">{t.booking.secureBookingDesc}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Section 1: Stay Details */}
              <section className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 border-b border-border pb-4">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span> 
                  {t.booking.stepStayInfo}
                </h2>
                
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

              {/* Section 2: Guest Details */}
              <section className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 border-b border-border pb-4">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span> 
                  Guest Details
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t.booking.fullName}</Label>
                    <Input id="fullName" name="fullName" placeholder="Abebe Bikila" required value={formData.fullName} onChange={handleInputChange} className="h-12 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t.booking.phone}</Label>
                    <Input id="phone" name="phone" placeholder="0911..." required value={formData.phone} onChange={handleInputChange} className="h-12 w-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t.booking.email}</Label>
                  <Input id="email" name="email" type="email" placeholder={t.booking.emailOptional} value={formData.email} onChange={handleInputChange} className="h-12 w-full" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequests">{t.booking.specialRequests}</Label>
                  <Textarea id="specialRequests" name="specialRequests" placeholder={t.booking.specialRequestsOptional} value={formData.specialRequests} onChange={handleInputChange} className="resize-none h-24 w-full" />
                </div>
              </section>

              {/* Section 3: Payment Method */}
              <section className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 border-b border-border pb-4">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span> 
                  {t.booking.stepPayment}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'pay_at_hotel', label: t.booking.payAtProperty, icon: '🏨' },
                    { id: 'telebirr', label: 'Telebirr', icon: '📱' },
                    { id: 'cbe_birr', label: 'CBE Birr', icon: '🏦' },
                  ].map(method => (
                    <label 
                      key={method.id} 
                      className={`cursor-pointer flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${formData.paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    >
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value={method.id} 
                        checked={formData.paymentMethod === method.id} 
                        onChange={handleInputChange} 
                        className="sr-only" 
                      />
                      <span className="text-2xl">{method.icon}</span>
                      <span className="text-sm font-medium">{method.label}</span>
                    </label>
                  ))}
                </div>
              </section>

              <Button type="submit" size="lg" className="w-full h-14 text-lg rounded-2xl shadow-lg" disabled={isSubmitting}>
                {isSubmitting ? t.booking.processing : t.booking.confirmBooking}
              </Button>
            </form>
          </div>

          {/* Right Column: Summary Sticky Panel */}
          <div className="w-full lg:w-2/5 lg:sticky lg:top-24 space-y-6 lg:mt-0">
            <div className="bg-card p-1 rounded-3xl border border-border shadow-xl overflow-hidden">
              <div className="h-48 relative overflow-hidden rounded-t-2xl">
                <img src={selectedPackage.image || room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur text-foreground px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  {tr(selectedPackage.name)}
                </div>
              </div>
              
              <div className="p-6 md:p-8 space-y-6 bg-card">
                <div>
                  <h3 className="text-xl font-heading font-bold text-foreground">{room.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{room.locationName}</p>
                </div>

                <div className="bg-muted p-4 rounded-xl space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{diffDays} {t.booking.nights} x {formData.rooms} {t.propertyCard.rooms}</span>
                    <span className="font-medium">ETB {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.booking.tax}</span>
                    <span className="font-medium">ETB {tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between items-center text-lg font-bold">
                    <span>{t.booking.totalPayable}</span>
                    <span className="text-primary text-2xl">ETB {total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-4 text-xs text-muted-foreground">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-green-600" />
                  <p>{t.booking.secureBookingMessage}</p>
                </div>
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