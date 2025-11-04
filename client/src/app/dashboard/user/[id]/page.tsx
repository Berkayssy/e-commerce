"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Logo } from "@/components/custom/logo-galeria/logo";

import {
  Bell,
  Search,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Package,
  Settings,
  HelpCircle,
  Wallet,
  Heart,
  Store,
} from "lucide-react";

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

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    toast.success("Logout successful!");
    router.push("/");
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user || user.role !== "user") return null;

  const menuItems = [
    { icon: Store, label: "Stores", active: true },
    { icon: Heart, label: "Favorities" },
    { icon: Wallet, label: "My wallet" },
    { icon: Package, label: "Orders" },
    { icon: Settings, label: "Settings" },
    { icon: HelpCircle, label: "Help" },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-12"
        }`}
      >
        <div className="items-center justify-between pr-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <div className="flex justify-center items-center">
              <Logo width={200} className="items-center justify-center" />
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </div>
          </button>
        </div>

        <ul className="pt-2">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <li key={index} className="mb-2">
                <a
                  href="#"
                  className={`flex items-center p-2 mx-2 rounded-md transition-colors ${
                    item.active
                      ? "bg-primary-500 text-white"
                      : "text-text-primary hover:bg-secondary-100"
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className={`ml-4 ${sidebarOpen ? "block" : "hidden"}`}>
                    {item.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        <button className="p-2 rounded-lg hover:bg-secondary-100 text-secondary-700">
          <LogOut className="w-5 h-5" onClick={handleLogout} />
        </button>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-0" : "ml-0"
        }`}
      >
        {/* Navbar */}
        <nav className="bg-white flex items-center justify-between">
          <span className="flex justify-centertext-center items-center">
            Welcome, <span className="font-bold"> John Doe</span>
          </span>
          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-20">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-text-muted" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-1.5 border border-border-light rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-lg hover:bg-secondary-100 text-secondary-700">
              <Bell className="w-5 h-5" />
            </button>
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:scroll-smooth">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                <User className="w-4 h-4" />
              </div>
            </button>
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1 bg-white min-h-screen ">
          {/* Welcome Card */}
          <div className="flex justify-center pt-4 ">
            <div className="bg-white rounded-xl shadow-medium p-5 w-full max-w-[280px] aspect-square flex flex-col justify-center items-center text-center">
              <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">
                  BMW
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    BMW Club
                  </h3>
                  <p className="text-xl text-text-primary font-medium">
                    Tom Hardy
                  </p>
                </div>
              </div>
              <span className="inline-block text-primary-500 text-sm px-3 py-1.5 rounded-full">
                Owner
              </span>
              <p className="text-amber-400 text-sm mt-2">Ultimate</p>
              <p className="text-text-secondary text-sm  mb-3">
                Joined in 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
