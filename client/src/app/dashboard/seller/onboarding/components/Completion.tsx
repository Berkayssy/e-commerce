"use client";

import { CompletionProps } from "@/types/onboarding";

export default function Completion({ onComplete }: CompletionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-8 text-center">
      <div className="w-16 h-16 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-primary-700 mb-2">
        Setup Complete!
      </h2>
      <p className="text-secondary-600 mb-6 max-w-md mx-auto">
        Congratulations! Your seller account has been successfully set up. You
        can now start adding products and managing your store.
      </p>

      <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
        <h3 className="font-semibold text-success-800 mb-2">Whats Next?</h3>
        <ul className="text-sm text-success-700 text-left space-y-1">
          <li>• Add your first products to the store</li>
          <li>• Customize your store settings</li>
          <li>• Set up shipping options</li>
          <li>• Start promoting your store</li>
        </ul>
      </div>

      <button
        onClick={onComplete}
        className="px-8 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
      >
        Go to Seller Dashboard
      </button>
    </div>
  );
}
