"use client";

import { useState } from "react";
import { StoreSetupProps } from "@/types/onboarding";

const STORE_TYPES = [
  { value: "fashion", label: "Fashion & Apparel" },
  { value: "electronics", label: "Electronics" },
  { value: "home", label: "Home & Garden" },
  { value: "beauty", label: "Beauty & Cosmetics" },
  { value: "food", label: "Food & Beverage" },
] as const;

export default function StoreSetup({ onUpdate, onNext }: StoreSetupProps) {
  const [formData, setFormData] = useState({
    name: "", // storeName → name
    type: "", // storeType → type
    description: "", // storeDescription → description
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validasyon
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Store name is required";
    if (!formData.type) newErrors.type = "Store type is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Data'yı parent componente gönder
      onUpdate({
        store: {
          name: formData.name,
          type: formData.type,
          description: formData.description,
        },
      });

      onNext();
    } catch (error) {
      console.error("Error updating store info:", error);
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
      <h2 className="text-2xl font-bold text-primary-700 mb-2">Store Setup</h2>
      <p className="text-secondary-600 mb-6">
        Tell us about your store to get started
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Store Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-secondary-700 mb-1"
          >
            Store Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.name ? "border-danger-500" : "border-secondary-300"
            }`}
            placeholder="Enter your store name"
          />
          {errors.name && (
            <p className="text-danger-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Store Type */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-secondary-700 mb-1"
          >
            Store Type *
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.type ? "border-danger-500" : "border-secondary-300"
            }`}
          >
            <option value="">Select store type</option>
            {STORE_TYPES.map((storeType) => (
              <option key={storeType.value} value={storeType.value}>
                {storeType.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-danger-500 text-sm mt-1">{errors.type}</p>
          )}
        </div>

        {/* Store Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-secondary-700 mb-1"
          >
            Store Description (Optional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Briefly describe your store..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Saving..." : "Continue to Plan Selection"}
          </button>
        </div>
      </form>
    </div>
  );
}
