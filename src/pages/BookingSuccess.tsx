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
        
        console.log('🔍 Verification Data Received:', verifyData);

        if (verifyData.success) {
          setBookingData(verifyData.data);
          console.log('✅ Booking Data set:', verifyData.data);
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
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-slip, #printable-slip * {
            visibility: visible;
          }
          #printable-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 40px !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .no-print {
            display: none !important;
          }
          .bg-gradient-to-br {
            background: transparent !important;
            border: 1px solid #e2e8f0 !important;
          }
          .text-primary {
            color: black !important;
          }
          .bg-primary {
            background: #f1f5f9 !important;
            color: black !important;
            border: 1px solid #e2e8f0 !important;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
          h1 { font-size: 32pt !important; }
          .text-xl { font-size: 24pt !important; }
          .text-lg { font-size: 18pt !important; }
          .text-sm { font-size: 14pt !important; }
          .text-xs { font-size: 12pt !important; }
        }
      `}} />
      <div className="no-print">
        <Navbar />
      </div>
      <main className="flex-grow pt-32 pb-16 flex items-center justify-center px-4 no-print-bg">
        <div id="printable-slip" className="max-w-md w-full mx-auto p-8 bg-card border border-border rounded-3xl shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner no-print">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Booking Confirmed!</h1>
          <div className="space-y-1">
            <p className="text-xl font-bold text-primary">
              {bookingData.booking?.room?.pension?.name || bookingData.pension_name || 'Your Pension'}
            </p>
            <p className="text-muted-foreground text-lg">
              Your reservation is confirmed. <span className="font-semibold text-foreground">Room {bookingData.booking?.room_number || bookingData.booking?.room?.room_number || 'Assigned'}</span>.
            </p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-card to-muted/30 rounded-3xl border border-primary/20 text-left space-y-4 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700 no-print"></div>
            
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Booking Receipt</span>
              <span className="text-xs font-mono text-primary font-bold">#{bookingData.reference || 'REF-ID'}</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pension</span>
                <span className="text-sm font-semibold">{bookingData.booking?.room?.pension?.name || bookingData.pension_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Guest</span>
                <span className="text-sm font-semibold">{bookingData.user?.full_name || 'Guest'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Room</span>
                <span className="text-sm font-semibold">Room {bookingData.booking?.room_number || bookingData.booking?.room?.room_number || 'Assigned'}</span>
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
              * Please show this digital slip or the passcode upon arrival for verification at {bookingData.booking?.room?.pension?.name || 'the pension'}.
            </p>
          </div>

          <div className="flex gap-3 no-print">
            <Button variant="outline" className="flex-1 rounded-xl h-12 gap-2" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Print Slip
            </Button>
            <Button className="flex-1 rounded-xl h-12 shadow-lg shadow-primary/20 gap-2" onClick={() => navigate("/")}>
              <Home className="w-4 h-4" /> Back to Home
            </Button>
          </div>
        </div>
      </main>
      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
};

export default BookingSuccess;
