"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function UserDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.role !== "user" || user.id !== resolvedParams.id) {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, resolvedParams.id, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!user || user.role !== "user") return null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
      <p>Welcome {user.firstName}! Review your Galeria</p>
    </div>
  );
}
