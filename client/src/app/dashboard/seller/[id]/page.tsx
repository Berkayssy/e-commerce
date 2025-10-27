"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";

export default function SellerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { getOnboardingStatus, loading } = useOnboarding();

  useEffect(() => {
    checkSellerStatus();
  }, [user]);

  const checkSellerStatus = async () => {
    if (!user) return;

    try {
      const response = await getOnboardingStatus();

      if (!response.onboardingStarted || response.status === "onboarding") {
        router.push("/dashboard/seller/onboarding");
        return;
      }

      if (response.status === "active") {
        // Show actual seller dashboard
        console.log("Seller dashboard loaded", response);
      }
    } catch (error) {
      console.error("Seller status check failed:", error);
      // Hata durumunda da onboarding'e yönlendir
      router.push("/dashboard/seller/onboarding");
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">
          Seller Dashboard
        </h1>
        <p className="text-secondary-600 mb-8">
          Manage your store and products
        </p>

        {/* Seller dashboard content will go here */}
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <p className="text-secondary-600">
            Your seller dashboard is being prepared...
          </p>
        </div>
      </div>
    </div>
  );
}
