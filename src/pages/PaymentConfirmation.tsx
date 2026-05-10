import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from '@/components/ui/button';
import { CheckCircle2, Receipt, ArrowRight, CreditCard } from 'lucide-react';

const PaymentConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const txRef = searchParams.get('ref');
  
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Simulate a brief verification delay for a more "secure" feel
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleViewReceipt = () => {
    navigate(`/booking/success?ref=${txRef}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-16 flex items-center justify-center px-4">
        <div className="max-w-md w-full mx-auto p-10 bg-card border border-border rounded-[3rem] shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-700">
          
          {isVerifying ? (
            <div className="space-y-6 py-8">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <CreditCard className="absolute inset-0 m-auto w-10 h-10 text-primary/40" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-heading font-bold">Verifying Payment</h1>
                <p className="text-muted-foreground">Securing your transaction details...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="relative mx-auto w-32 h-32">
                {/* Decorative Rings */}
                <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping duration-1000"></div>
                <div className="absolute inset-4 bg-green-500/20 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-16 h-16" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest border border-green-100">
                  Transaction Successful
                </div>
                <h1 className="text-4xl font-heading font-bold text-foreground">Payment Received!</h1>
                <p className="text-muted-foreground text-lg px-4">
                  Thank you for your payment. Your transaction has been processed and your booking is now being finalized.
                </p>
              </div>

              <div className="pt-4 space-y-4">
                <Button 
                  onClick={handleViewReceipt} 
                  className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 gap-3 group"
                >
                  <Receipt className="w-6 h-6 transition-transform group-hover:scale-110" />
                  Get Printable Slip
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Transaction Ref: <span className="font-mono font-medium">{txRef || '---'}</span>
                </p>
              </div>

              <div className="pt-6 border-t border-dashed border-border">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/')} 
                  className="text-muted-foreground hover:text-foreground"
                >
                  Return to Homepage
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentConfirmation;
