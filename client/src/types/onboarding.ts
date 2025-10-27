export interface Onboarding {
  id: string;
  userId: string;
  currentStep: number;
  status: "pending" | "onboarding" | "active" | "suspended" | "expired";
  storeName?: string;
  storeType?: string;
  planType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingState {
  onboarding: Onboarding | null;
  loading: boolean;
  error: string | null;
}

export interface OnboardingFormData {
  store?: {
    name: string;
    type: string;
    description?: string;
  };
  plan?: {
    planType: string;
    billingCycle: string;
  };
  payment?: {
    cardNumber: string;
    cardExpiry: string;
    cardCvv: string;
    billingAddress?: string;
  };
}

export interface OnboardingResponse {
  success: boolean;
  message: string;
  onboardingStarted: boolean;
  currentStep?: number;
  status?: "onboarding" | "active" | "pending";
  store?: {
    id: string;
    name: string;
    url: string;
  };
  plan?: {
    id: string;
    name: string;
    price: number;
    duration: number;
    features: string[];
  };
}

export interface Plan {
  _id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  features: string[];
}

export interface PlanResponse {
  plans: Plan[];
}

export interface PlanState {
  plans: Plan[];
  loading: boolean;
  error: string | null;
}

// Component props type'larını düzelt
export interface StoreSetupProps {
  onUpdate: (data: { store: OnboardingFormData["store"] }) => void;
  onNext: () => void;
}

export interface PlanSelectionProps {
  onUpdate: (data: { plan: OnboardingFormData["plan"] }) => void;
  onNext: () => void;
  onBack: () => void;
}

export interface PaymentSetupProps {
  onUpdate: (data: { payment: OnboardingFormData["payment"] }) => void;
  onNext: () => void;
  onBack: () => void;
}

export interface CompletionProps {
  onComplete: () => void;
}
