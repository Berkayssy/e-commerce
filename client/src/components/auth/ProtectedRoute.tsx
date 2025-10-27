"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      if (user.role === "user") {
        router.replace(`/dashboard/user/${user.id}`);
        return;
      }

      if (user.role === "seller") {
        router.replace(`/dashboard/seller/${user.id}`);
        return;
      }
    }
  }, [user, isLoading, router]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );

  return <>{children}</>;
};
