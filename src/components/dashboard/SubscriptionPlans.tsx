import { useState, useEffect } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const SubscriptionPlans = () => {
  const { user } = useAuth();
  const { status, refetch } = useSubscription();
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState<number | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('http://localhost:3006/api/subscriptions/plans');
        const data = await response.json();
        if (data.success) {
          setPlans(data.data);
        }
      } catch (error) {
        toast.error("Failed to load subscription plans.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (planId: number) => {
    if (!user) return;
    setIsInitializing(planId);

    try {
      const response = await fetch('http://localhost:3006/api/subscriptions/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: user.id,
          planId,
          email: user.email,
          firstName: user.full_name?.split(' ')[0] || 'Owner',
          lastName: user.full_name?.split(' ')[1] || 'User'
        })
      });

      const data = await response.json();
      if (data.success && data.data.checkout_url) {
        window.location.href = data.data.checkout_url;
      } else {
        toast.error(data.message || "Failed to initialize payment.");
      }
    } catch (error) {
      toast.error("Error connecting to payment gateway.");
    } finally {
      setIsInitializing(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading plans...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-heading font-black text-foreground">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Scale your pension business with professional tools and unlimited bookings.
        </p>
        
        {status?.trial.isActive && !status.hasActiveSubscription && (
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 text-primary rounded-full border border-primary/20 animate-pulse">
            <Zap className="w-5 h-5" />
            <span className="font-bold">Free Trial Active: {status.trial.daysLeft} days remaining</span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.plan_id} 
            className={`relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col ${
              plan.name.includes('Annual') 
                ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5' 
                : 'border-border bg-card'
            }`}
          >
            {plan.name.includes('Annual') && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-black uppercase tracking-widest shadow-lg">
                Best Value
              </div>
            )}

            <div className="space-y-6 flex-grow">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${plan.name.includes('Annual') ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    {plan.name.includes('Annual') ? <Crown className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                  </div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">ETB {plan.price.toLocaleString()}</span>
                  <span className="text-muted-foreground font-medium">/{plan.duration_days === 30 ? 'month' : 'year'}</span>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-border">
                {(() => {
                  try {
                    const features = typeof plan.features === 'string' 
                      ? (plan.features.startsWith('[') ? JSON.parse(plan.features) : [plan.features])
                      : (Array.isArray(plan.features) ? plan.features : []);
                    return features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-muted-foreground font-medium">{feature}</span>
                      </div>
                    ));
                  } catch (e) {
                    return null;
                  }
                })()}
              </div>
            </div>

            <Button 
              className={`mt-10 h-14 rounded-2xl text-lg font-bold w-full shadow-lg transition-all duration-300 ${
                status?.subscription?.plan_id === plan.plan_id
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'
                  : plan.name.includes('Annual') ? 'shadow-primary/20' : ''
              }`}
              onClick={() => handleSubscribe(plan.plan_id)}
              disabled={isInitializing === plan.plan_id || status?.subscription?.plan_id === plan.plan_id}
            >
              {isInitializing === plan.plan_id 
                ? "Initializing..." 
                : status?.subscription?.plan_id === plan.plan_id 
                  ? "Current Plan" 
                  : `Upgrade to ${plan.name}`
              }
            </Button>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 text-amber-900">
        <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center shrink-0">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-xl font-bold">Important Notice</h4>
          <p className="opacity-80">
            If your subscription expires, you will still be able to see your existing bookings, but you won't be able to add new rooms, manage staff, or receive new online bookings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
