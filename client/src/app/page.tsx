"use client";

import React from "react";
import { IndexLogo } from "@/components/custom/logo-galeria/index";
import MegaDropdownMenu from "@/components/custom/dropdown-menu/page";
import VideoHeroSection from "../components/custom/video-hero/page";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleCreateAccount = () => {
    router.push("/auth/create-account");
  };

  return (
    <main className="relative min-h-scree text-white">
      {/* Top-right buttons */}
      <div className="absolute right-4 top-4 flex gap-14 px-16">
        {/* "Sign In" and "Start for free" */}
        <button
          className="px-2 py-3 text-primary-900 text-md font-normal hover:underline hover:decoration-primary-900 "
          onClick={handleLogin}
        >
          Sign In
        </button>

        {/* "Start for free"  */}
        <button
          className="px-8 rounded-full text-justify bg-primary-900 text-white shadow-soft hover:bg-primary-900 hover:text-secondary-400 transition-colors"
          onClick={handleCreateAccount}
        >
          Start for free
        </button>
      </div>
      {/* Centered content */}

      <div className="flex ml-12 max-w-full">
        <span className="max-w-20 ">
          <IndexLogo width={240} height={80} />
        </span>
        <MegaDropdownMenu />
      </div>
      <div className="flex items-center justify-center min-h-screen ">
        <div>
          <VideoHeroSection />
        </div>
      </div>
    </main>
  );
}
