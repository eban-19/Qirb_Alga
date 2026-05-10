import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SubscriptionVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const txRef = searchParams.get("ref");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const verify = async () => {
      if (!txRef) {
        setStatus("error");
        setMessage("Invalid transaction reference.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:3005/api/payments/verify/${txRef}`);
        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage("Subscription activated successfully! Welcome to the premium experience.");
          toast.success("Payment verified!");
        } else {
          setStatus("error");
          setMessage(data.message || "Payment verification failed.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred while verifying payment.");
      }
    };

    verify();
  }, [txRef]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-16 flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 bg-card border border-border rounded-[2.5rem] shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-500">
          {status === "loading" && (
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-spin">
                <Loader2 className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-heading font-bold">Verifying Payment</h1>
              <p className="text-muted-foreground">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Payment Success!</h1>
              <p className="text-muted-foreground text-lg">{message}</p>
              <Button className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Verification Failed</h1>
              <p className="text-muted-foreground text-lg">{message}</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button className="flex-1 h-12 rounded-xl font-bold" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubscriptionVerify;
