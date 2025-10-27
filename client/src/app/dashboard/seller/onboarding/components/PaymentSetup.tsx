"use client";

import { useState } from "react";
import { PaymentSetupProps } from "@/types/onboarding";

export default function PaymentSetup({
  onUpdate,
  onNext,
  onBack,
}: PaymentSetupProps) {
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    billingAddress: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validasyon
    const newErrors: Record<string, string> = {};
    if (
      !formData.cardNumber.trim() ||
      formData.cardNumber.replace(/\s/g, "").length !== 16
    ) {
      newErrors.cardNumber = "Valid card number is required";
    }
    if (!formData.cardExpiry.trim())
      newErrors.cardExpiry = "Expiry date is required";
    if (!formData.cardCvv.trim() || formData.cardCvv.length !== 3) {
      newErrors.cardCvv = "Valid CVV is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      onUpdate({
        payment: {
          cardNumber: formData.cardNumber,
          cardExpiry: formData.cardExpiry,
          cardCvv: formData.cardCvv,
          billingAddress: formData.billingAddress || undefined,
        },
      });
      onNext();
    } catch (error) {
      console.error("Error setting up payment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Kart numarası formatı
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
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
      <h2 className="text-2xl font-bold text-primary-700 mb-2">
        Payment Setup
      </h2>
      <p className="text-secondary-600 mb-6">
        Enter your payment details to complete setup
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label
            htmlFor="cardNumber"
            className="block text-sm font-medium text-secondary-700 mb-1"
          >
            Card Number *
          </label>
          <input
            id="cardNumber"
            type="text"
            value={formData.cardNumber}
            onChange={(e) =>
              handleChange("cardNumber", formatCardNumber(e.target.value))
            }
            maxLength={19}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.cardNumber ? "border-danger-500" : "border-secondary-300"
            }`}
            placeholder="1234 5678 9012 3456"
          />
          {errors.cardNumber && (
            <p className="text-danger-500 text-sm mt-1">{errors.cardNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Expiry Date */}
          <div>
            <label
              htmlFor="cardExpiry"
              className="block text-sm font-medium text-secondary-700 mb-1"
            >
              Expiry Date *
            </label>
            <input
              id="cardExpiry"
              type="text"
              value={formData.cardExpiry}
              onChange={(e) => handleChange("cardExpiry", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.cardExpiry ? "border-danger-500" : "border-secondary-300"
              }`}
              placeholder="MM/YY"
              maxLength={5}
            />
            {errors.cardExpiry && (
              <p className="text-danger-500 text-sm mt-1">
                {errors.cardExpiry}
              </p>
            )}
          </div>

          {/* CVV */}
          <div>
            <label
              htmlFor="cardCvv"
              className="block text-sm font-medium text-secondary-700 mb-1"
            >
              CVV *
            </label>
            <input
              id="cardCvv"
              type="text"
              value={formData.cardCvv}
              onChange={(e) =>
                handleChange("cardCvv", e.target.value.replace(/\D/g, ""))
              }
              maxLength={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.cardCvv ? "border-danger-500" : "border-secondary-300"
              }`}
              placeholder="123"
            />
            {errors.cardCvv && (
              <p className="text-danger-500 text-sm mt-1">{errors.cardCvv}</p>
            )}
          </div>
        </div>

        {/* Billing Address */}
        <div>
          <label
            htmlFor="billingAddress"
            className="block text-sm font-medium text-secondary-700 mb-1"
          >
            Billing Address (Optional)
          </label>
          <input
            id="billingAddress"
            type="text"
            value={formData.billingAddress}
            onChange={(e) => handleChange("billingAddress", e.target.value)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your billing address"
          />
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
            disabled={isLoading}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Processing..." : "Complete Setup"}
          </button>
        </div>
      </form>
    </div>
  );
}
