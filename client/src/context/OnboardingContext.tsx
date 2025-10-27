"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { OnboardingState, OnboardingResponse, Plan } from "@/types/onboarding";
import { onboardingService } from "@/services/onboarding.service";

interface OnboardingContextType extends OnboardingState {
  startOnboarding: (data: { name: string; surname: string }) => Promise<void>;
  updateStoreInfo: (data: {
    storeName: string;
    storeType: string;
    storeDescription?: string;
  }) => Promise<void>;
  selectPlan: (data: {
    planType: string;
    billingCycle: string;
  }) => Promise<void>;
  setupPayment: (data: {
    cardNumber: string;
    cardExpiry: string;
    cardCvv: string;
    billingAddress?: string;
  }) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  getOnboardingStatus: () => Promise<OnboardingResponse>;
  fetchPlans: () => Promise<Plan[]>;
  clearError: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<OnboardingState>({
    onboarding: null,
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState((prev) => ({
      ...prev,
      loading,
      error: loading ? null : prev.error,
    }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error, loading: false }));
  };

  const startOnboarding = useCallback(
    async (data: { name: string; surname: string }) => {
      setLoading(true);
      try {
        await onboardingService.startOnboarding(data);
        setState((prev) => ({ ...prev, loading: false }));
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        throw error;
      }
    },
    []
  );

  const updateStoreInfo = useCallback(
    async (data: {
      storeName: string;
      storeType: string;
      storeDescription?: string;
    }) => {
      setLoading(true);
      try {
        await onboardingService.updateStoreInfo(data);
        setState((prev) => ({ ...prev, loading: false }));
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        throw error;
      }
    },
    []
  );

  const selectPlan = useCallback(
    async (data: { planType: string; billingCycle: string }) => {
      setLoading(true);
      try {
        await onboardingService.selectPlan(data);
        setState((prev) => ({ ...prev, loading: false }));
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        throw error;
      }
    },
    []
  );

  const setupPayment = useCallback(
    async (data: {
      cardNumber: string;
      cardExpiry: string;
      cardCvv: string;
      billingAddress?: string;
    }) => {
      setLoading(true);
      try {
        await onboardingService.setupPayment(data);
        setState((prev) => ({ ...prev, loading: false }));
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        throw error;
      }
    },
    []
  );

  const completeOnboarding = useCallback(async () => {
    setLoading(true);
    try {
      await onboardingService.completeOnboarding();
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      throw error;
    }
  }, []);

  const getOnboardingStatus =
    useCallback(async (): Promise<OnboardingResponse> => {
      setLoading(true);
      try {
        const response = await onboardingService.getOnboardingStatus();
        setState((prev) => ({ ...prev, loading: false }));
        return response;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        throw error;
      }
    }, []);

  const fetchPlans = useCallback(async (): Promise<Plan[]> => {
    setLoading(true);
    try {
      const response = await onboardingService.getPlans();
      setState((prev) => ({ ...prev, loading: false }));
      return response.plans;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: OnboardingContextType = {
    ...state,
    startOnboarding,
    updateStoreInfo,
    selectPlan,
    setupPayment,
    completeOnboarding,
    getOnboardingStatus,
    fetchPlans,
    clearError,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
