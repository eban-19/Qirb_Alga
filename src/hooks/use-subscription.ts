import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  isRestricted: boolean; // Hard restricted
  isSoftRestricted: boolean;
  trial: {
    isActive: boolean;
    daysLeft: number;
    expiryDate: string | null;
  };
  gracePeriod: {
    isActive: boolean;
    daysLeft: number;
    expiryDate: string | null;
  };
  subscription: any | null;
  plan: any | null;
  warnings: string[];
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async () => {
    if (!user || user.role !== 'Owner') {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3006/api/subscriptions/status/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user]);

  return { status, isLoading, refetch: fetchStatus };
};
