import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, Printer, Home, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const txRef = searchParams.get('ref');
  
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    const verifyAndFetch = async () => {
      if (!txRef) {
        setLoading(false);
        return;
      }

      try {
        // 1. Verify Payment
        const verifyRes = await fetch(`http://localhost:3005/api/payments/verify/${txRef}`);
        const verifyData = await verifyRes.json();
        
        if (verifyData.success) {
          // 2. Fetch Booking details (assuming we can find it by txRef or it was linked)
          // In our case, the webhook handles the DB update, so we just need to fetch the status.
          // Since we don't have a specific "get booking by txRef" endpoint yet, 
          // let's assume we can use the verifyData if it returns enough info, 
          // or we fetch the booking if it was provided in the return URL (which I should add).
          
          // For now, let's look for the booking_id in verifyData or similar.
          setBookingData(verifyData.data);
        } else {
          toast.error("Payment verification failed.");
        }
      } catch (error) {
        console.error("Verification error:", error);
      } finally {
        setLoading(false);
      }
    };

    verifyAndFetch();
  }, [txRef]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-24">
          <div className="text-center space-y-4">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground font-medium">Verifying your payment...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!txRef || !bookingData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-24">
          <div className="text-center space-y-6 max-w-md px-4">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 opacity-20" />
            </div>
            <h1 className="text-2xl font-bold">Booking Not Found</h1>
            <p className="text-muted-foreground">We couldn't retrieve your booking information. Please check your email or contact support.</p>
            <Button onClick={() => navigate('/')} className="w-full h-12 rounded-xl">Back to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-16 flex items-center justify-center px-4">
        <div className="max-w-md w-full mx-auto p-8 bg-card border border-border rounded-3xl shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Booking Confirmed!</h1>
          <p className="text-muted-foreground text-lg">
            Your reservation is confirmed. <span className="font-semibold text-foreground">Room {bookingData.booking?.room_number || 'Assigned'}</span>.
          </p>
          
          <div className="p-6 bg-gradient-to-br from-card to-muted/30 rounded-3xl border border-primary/20 text-left space-y-4 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
            
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Booking Receipt</span>
              <span className="text-xs font-mono text-primary font-bold">#{bookingData.reference || 'REF-ID'}</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Guest</span>
                <span className="text-sm font-semibold">{bookingData.user?.full_name || 'Guest'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Room</span>
                <span className="text-sm font-semibold">Room {bookingData.booking?.room_number || 'Assigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-xs font-bold uppercase px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Paid</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-dashed border-border">
                <span className="text-sm font-bold">Total Paid</span>
                <span className="text-lg font-black text-primary">ETB {parseFloat(bookingData.amount).toLocaleString()}</span>
              </div>
            </div>

            {bookingData.booking?.pass_code && (
              <div className="mt-6 p-4 bg-primary text-primary-foreground rounded-2xl text-center space-y-1 shadow-lg shadow-primary/20">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80">Digital Access Key</p>
                <p className="text-3xl font-mono font-black tracking-[0.3em]">{bookingData.booking.pass_code}</p>
              </div>
            )}

            <p className="text-[10px] text-center text-muted-foreground mt-4 italic">
              * Please show this digital slip or the passcode upon arrival for verification.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl h-12 gap-2" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Print Slip
            </Button>
            <Button className="flex-1 rounded-xl h-12 shadow-lg shadow-primary/20 gap-2" onClick={() => navigate("/")}>
              <Home className="w-4 h-4" /> Back to Home
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingSuccess;
