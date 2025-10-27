"use client";

import { useState } from "react";
import { PlanSelectionProps } from "@/types/onboarding";

// Mock plans - sonra API'den alacağız
const MOCK_PLANS = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for small businesses just getting started",
    price: 29,
    durationDays: 30,
    features: ["Up to 50 products", "Basic analytics", "Email support"],
  },
  {
    id: "professional",
    name: "Professional",
    description: "Great for growing businesses with more needs",
    price: 79,
    durationDays: 30,
    features: [
      "Up to 500 products",
      "Advanced analytics",
      "Priority support",
      "Custom domain",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large businesses with complex requirements",
    price: 199,
    durationDays: 30,
    features: [
      "Unlimited products",
      "Full analytics suite",
      "24/7 phone support",
      "Custom features",
    ],
  },
];

export default function PlanSelection({
  onUpdate,
  onNext,
  onBack,
}: PlanSelectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) {
      alert("Please select a plan");
      return;
    }

    setIsLoading(true);
    try {
      onUpdate({
        plan: {
          planType: selectedPlan,
          billingCycle: billingCycle,
        },
      });
      onNext();
    } catch (error) {
      console.error("Error selecting plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
      <h2 className="text-2xl font-bold text-primary-700 mb-2">
        Choose Your Plan
      </h2>
      <p className="text-secondary-600 mb-6">
        Select the plan that works best for your business
      </p>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-secondary-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-md transition-colors ${
              billingCycle === "monthly"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-secondary-600"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-2 rounded-md transition-colors ${
              billingCycle === "yearly"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-secondary-600"
            }`}
          >
            Yearly (Save 20%)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {MOCK_PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? "border-primary-500 bg-primary-50 shadow-md"
                  : "border-secondary-200 hover:border-primary-300"
              }`}
            >
              <h3 className="text-xl font-bold text-primary-700">
                {plan.name}
              </h3>
              <p className="text-secondary-600 mt-2 text-sm">
                {plan.description}
              </p>

              <div className="mt-4">
                <span className="text-2xl font-bold text-primary-600">
                  $
                  {billingCycle === "yearly"
                    ? Math.round(plan.price * 12 * 0.8)
                    : plan.price}
                </span>
                <span className="text-secondary-600 ml-1">
                  /{billingCycle === "yearly" ? "year" : "month"}
                </span>
              </div>

              <ul className="mt-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center text-sm text-secondary-700"
                  >
                    <span className="text-success-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`w-full mt-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedPlan === plan.id
                    ? "bg-primary-500 text-white hover:bg-primary-600"
                    : "bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
                }`}
              >
                {selectedPlan === plan.id ? "Selected" : "Select Plan"}
              </button>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!selectedPlan || isLoading}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Processing..." : "Continue to Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}
