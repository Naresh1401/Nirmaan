'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useAuth } from '@/context/AuthContext';

export type MembershipTier = 'free' | 'silver' | 'gold' | 'platinum';

interface LoyaltyBalance {
  total_points: number;
  redeemed_points: number;
  available_points: number;
  tier_bonus_multiplier: number;
  monetary_value: number;
}

interface PremiumContextType {
  isPremium: boolean;
  membershipTier: MembershipTier;
  membershipStatus: string | null;
  membershipExpiry: string | null;
  loyaltyPoints: LoyaltyBalance | null;
  benefits: Record<string, unknown>;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const defaultBalance: LoyaltyBalance = {
  total_points: 0,
  redeemed_points: 0,
  available_points: 0,
  tier_bonus_multiplier: 1,
  monetary_value: 0,
};

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [membershipTier, setMembershipTier] = useState<MembershipTier>('free');
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null);
  const [membershipExpiry, setMembershipExpiry] = useState<string | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyBalance | null>(null);
  const [benefits, setBenefits] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(false);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setIsPremium(false);
      setMembershipTier('free');
      setLoyaltyPoints(null);
      return;
    }
    setIsLoading(true);
    try {
      const [membershipRes, loyaltyRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/v1/premium/membership`, { headers: authHeader }),
        fetch(`${API_URL}/api/v1/premium/loyalty/balance`, { headers: authHeader }),
      ]);

      if (membershipRes.status === 'fulfilled' && membershipRes.value.ok) {
        const m = await membershipRes.value.json();
        setIsPremium(!!m.is_premium);
        setMembershipTier((m.tier as MembershipTier) || 'free');
        setMembershipStatus(m.status || null);
        setMembershipExpiry(m.end_date || null);
        setBenefits(m.benefits || {});
      }

      if (loyaltyRes.status === 'fulfilled' && loyaltyRes.value.ok) {
        const l = await loyaltyRes.value.json();
        setLoyaltyPoints(l);
      } else {
        setLoyaltyPoints(defaultBalance);
      }
    } catch {
      // silently ignore — free tier remains default
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        membershipTier,
        membershipStatus,
        membershipExpiry,
        loyaltyPoints,
        benefits,
        isLoading,
        refresh,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}
