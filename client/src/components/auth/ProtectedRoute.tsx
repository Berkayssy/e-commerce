"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "seller" | "admin";
}

export const ProtectedRoute = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (redirectingRef.current || isLoading) return;

    if (!isAuthenticated || !user) {
      redirectingRef.current = true;

      const returnUrl = encodeURIComponent(pathname);
      const loginUrl = `/auth/login?returnUrl=${returnUrl}`;

      if (!pathname.startsWith("/auth/login")) {
        router.replace(loginUrl);
      }
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      redirectingRef.current = true;

      const roleBasedPaths = {
        user: `/dashboard/user/${user.id}`,
        seller: `/dashboard/seller/${user.id}`,
        admin: "/admin/dashboard",
      };

      const targetPath =
        roleBasedPaths[user.role as keyof typeof roleBasedPaths] ||
        "/dashboard";

      if (pathname !== targetPath) {
        router.replace(targetPath);
      }
      return;
    }

    const shouldRedirectToDashboard =
      pathname === "/" ||
      pathname.startsWith("/auth/login") ||
      pathname.startsWith("/auth/register");

    if (shouldRedirectToDashboard && user) {
      redirectingRef.current = true;

      const dashboardPaths = {
        user: `/dashboard/user/${user.id}`,
        seller: `/dashboard/seller/${user.id}`,
        admin: "/admin/dashboard",
      };

      const targetDashboard =
        dashboardPaths[user.role as keyof typeof dashboardPaths] ||
        "/dashboard";

      if (pathname !== targetDashboard) {
        router.replace(targetDashboard);
      }
    }
  }, [user, isLoading, isAuthenticated, router, pathname, requiredRole]);

  useEffect(() => {
    redirectingRef.current = false;
  }, [user, isLoading, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || redirectingRef.current) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don&lsquo;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
