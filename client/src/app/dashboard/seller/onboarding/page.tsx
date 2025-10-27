"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    storeName: "",
    storeType: "",
    description: "",
    plan: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPreviousStep = () => setCurrentStep((prev) => prev - 1);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.storeName.trim()) {
        newErrors.storeName = "Store name is required";
      }
      if (!formData.storeType) {
        newErrors.storeType = "Store category is required";
      }
    }

    if (step === 2) {
      if (!formData.plan) {
        newErrors.plan = "Please select a plan";
      }
    }

    if (step === 3) {
      if (
        !formData.cardNumber.trim() ||
        formData.cardNumber.replace(/\s/g, "").length !== 16
      ) {
        newErrors.cardNumber = "Valid card number is required";
      }
      if (
        !formData.expiryDate.trim() ||
        !/^\d{2}\/\d{2}$/.test(formData.expiryDate)
      ) {
        newErrors.expiryDate = "Valid expiry date (MM/YY) is required";
      }
      if (!formData.cvv.trim() || !/^\d{3}$/.test(formData.cvv)) {
        newErrors.cvv = "Valid CVV is required";
      }
      if (!formData.cardholderName.trim()) {
        newErrors.cardholderName = "Cardholder name is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleComplete = () => {
    console.log("Onboarding completed:", formData);
    router.push("/dashboard/seller");
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = matches ? matches[0] : "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(" ") : value;
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="bg-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Galeria</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white">
        <div className="max-w-xl mx-auto px-2 sm:px-2">
          <div className="flex items-center justify-between py-4">
            {[
              { number: 1, title: "Store Info" },
              { number: 2, title: "Plan" },
              { number: 3, title: "Payment" },
              { number: 4, title: "Complete" },
            ].map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                      step.number === currentStep
                        ? "bg-secondary-900 text-white border-primary-500 shadow-md"
                        : step.number < currentStep
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-gray-100 text-gray-400 border-gray-300"
                    }`}
                  >
                    {step.number < currentStep ? "✓" : step.number}
                  </div>
                  <span
                    className={`text-xs font-medium mt-2 ${
                      step.number === currentStep
                        ? "text-primary-500"
                        : step.number < currentStep
                        ? "text-green-500"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={`w-16 h-1 mx-4 ${
                      step.number < currentStep ? "bg-green-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl min-h-screen mx-auto px-2 sm:px-6 py-4">
        {/* Step 1 - Store Info */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Your Store
              </h2>
              <p className="text-gray-600">
                Set up your online store in minutes
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name *
                </label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) =>
                    handleInputChange("storeName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.storeName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your store name"
                />
                {errors.storeName && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.storeName}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  This will be your store&apos;s public name
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Category *
                </label>
                <select
                  value={formData.storeType}
                  onChange={(e) =>
                    handleInputChange("storeType", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.storeType ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a category</option>
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="electronics">Electronics</option>
                  <option value="home">Home & Garden</option>
                  <option value="beauty">Beauty & Cosmetics</option>
                  <option value="food">Food & Beverage</option>
                </select>
                {errors.storeType && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.storeType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Briefly describe what you'll be selling..."
                />
              </div>

              <button
                onClick={goToNextStep}
                disabled={!formData.storeName || !formData.storeType}
                className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Plan Selection
              </button>
            </div>
          </div>
        )}

        {/* Step 2 - Plan Selection */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Your Plan
              </h2>
              <p className="text-gray-600">Start free, upgrade anytime</p>
            </div>

            {errors.plan && (
              <p className="text-red-600 text-sm mb-4 text-center bg-red-50 py-2 rounded">
                {errors.plan}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                {
                  name: "Starter",
                  price: "Free",
                  period: "",
                  description: "Perfect for testing",
                  features: ["10 products", "Basic store", "Email support"],
                  popular: false,
                },
                {
                  name: "Professional",
                  price: "$29",
                  period: "/month",
                  description: "Growing businesses",
                  features: [
                    "100 products",
                    "Advanced analytics",
                    "Priority support",
                    "Custom domain",
                  ],
                  popular: true,
                },
                {
                  name: "Enterprise",
                  price: "$99",
                  period: "/month",
                  description: "High-volume stores",
                  features: [
                    "Unlimited products",
                    "Full analytics",
                    "24/7 support",
                    "API access",
                  ],
                  popular: false,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`relative border rounded-lg p-4 transition-all cursor-pointer ${
                    plan.popular
                      ? "border-primary-900 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-primary-500 hover:shadow-sm"
                  } ${
                    formData.plan === plan.name
                      ? "ring-1 ring-secondary-900"
                      : ""
                  }`}
                  onClick={() => handleInputChange("plan", plan.name)}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-danger-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-xs text-center mb-3">
                    {plan.description}
                  </p>

                  <div className="text-center mb-3">
                    <span className="text-2xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 text-sm">{plan.period}</span>
                  </div>

                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center text-xs text-gray-700"
                      >
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div
                    className={`w-full py-2 rounded text-sm font-medium text-center transition-colors ${
                      formData.plan === plan.name
                        ? "bg-gray-900 text-white"
                        : plan.popular
                        ? "bg-primary-900 text-white hover:bg-primary-500"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {formData.plan === plan.name
                      ? "Selected"
                      : plan.price === "Free"
                      ? "Get Started"
                      : "Select"}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={goToPreviousStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium"
              >
                Back
              </button>
              <button
                onClick={goToNextStep}
                disabled={!formData.plan}
                className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - Payment */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Details
              </h2>
              <p className="text-gray-600">Secure payment processing</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number *
                </label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) =>
                    handleInputChange(
                      "cardNumber",
                      formatCardNumber(e.target.value)
                    )
                  }
                  className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.cardNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
                {errors.cardNumber && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.cardNumber}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      handleInputChange("expiryDate", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.expiryDate ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  {errors.expiryDate && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.expiryDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV *
                  </label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={(e) =>
                      handleInputChange(
                        "cvv",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.cvv ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="123"
                    maxLength={3}
                  />
                  {errors.cvv && (
                    <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  value={formData.cardholderName}
                  onChange={(e) =>
                    handleInputChange("cardholderName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.cardholderName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="John Doe"
                />
                {errors.cardholderName && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.cardholderName}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 rounded p-3 border border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-900 font-medium">
                    Professional Plan
                  </span>
                  <span className="font-semibold text-gray-900">$29/month</span>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={goToPreviousStep}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={goToNextStep}
                  className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors font-medium"
                >
                  Complete Setup - $29/month
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 - Completion */}
        {currentStep === 4 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Welcome to Galeria!
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your store has been successfully created. Start your e-commerce
              journey today!
            </p>

            <div className="bg-green-50 border border-green-200 rounded p-4 mb-6 max-w-md mx-auto">
              <h3 className="font-semibold text-green-800 mb-3">
                What&apos;s next?
              </h3>
              <div className="grid grid-cols-1 gap-2 text-sm text-green-700">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Add your first products
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Customize your store design
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Set up payment & shipping
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Launch your store
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleComplete}
                className="px-6 py-2.5 bg-gray-900 text-white rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors font-medium"
              >
                Go to Seller Dashboard
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium"
              >
                Back to Homepage
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
