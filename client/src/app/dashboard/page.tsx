"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Redirecting to your dashboard...</div>
    </ProtectedRoute>
  );
}
