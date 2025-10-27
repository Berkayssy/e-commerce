"use client";

import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();

  /*
  useEffect(() => {
    const checkAuth = () => {
      if (!isLoading && !user) {
        router.push("/auth/login");
      }

      if (!isLoading && user) {
        router.push(`/dashboard/user/${user.id}`);
      }

      if (!isLoading && user && user.role === "seller") {
        router.push(`/dashboard/seller/${user.id}`);
      }

      if (!isLoading && user && user.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/seller/onboarding");
      }
    };

    checkAuth();
  }, [isLoading, user, router]); */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <main>{children}</main>
    </div>
  );
}
