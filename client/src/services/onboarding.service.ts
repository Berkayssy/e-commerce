import { OnboardingResponse, PlanResponse } from "@/types/onboarding";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

class OnboardingService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async startOnboarding(data: {
    name: string;
    surname: string;
  }): Promise<OnboardingResponse> {
    return this.request<OnboardingResponse>("/seller/onboarding/start", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateStoreInfo(data: {
    storeName: string;
    storeType: string;
    storeDescription?: string;
  }): Promise<OnboardingResponse> {
    return this.request<OnboardingResponse>("/seller/onboarding/store-info", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async selectPlan(data: {
    planType: string;
    billingCycle: string;
  }): Promise<OnboardingResponse> {
    return this.request<OnboardingResponse>("/seller/onboarding/select-plan", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async setupPayment(data: {
    cardNumber: string;
    cardExpiry: string;
    cardCvv: string;
    billingAddress?: string;
  }): Promise<OnboardingResponse> {
    return this.request<OnboardingResponse>(
      "/seller/onboarding/setup-payment",
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async completeOnboarding(): Promise<OnboardingResponse> {
    return this.request<OnboardingResponse>("/seller/onboarding/complete", {
      method: "POST",
    });
  }

  async getOnboardingStatus(): Promise<OnboardingResponse> {
    return this.request<OnboardingResponse>("/seller/onboarding/status", {
      method: "GET",
    });
  }

  async getPlans(): Promise<PlanResponse> {
    return this.request<PlanResponse>("/plans", {
      method: "GET",
    });
  }
}

export const onboardingService = new OnboardingService();
