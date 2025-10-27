"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  AuthContainer,
  AuthCard,
  AuthHeader,
  AuthFooter,
} from "@/components/auth/AuthLayout";
import { AuthInput, AuthButton, AuthIcons } from "@/components/auth/AuthForm";
import {
  AuthLink,
  AuthDivider,
  SocialAuthButton,
  AuthError,
} from "@/components/auth/AuthUI";
import { useAuth } from "@/context/AuthContext";
import { LoginFormData } from "@/types/auth";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin, error, isLoading, user } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLocalError(null);

    try {
      await login(data);
      toast.success("Welcome back!");
      router.replace("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setLocalError(errorMessage);
      toast.error(errorMessage);
    }
  };
  useEffect(() => {
    if (user?.id) {
      toast.success("Login successful!");
      router.push(`/dashboard/user/${user.id}`);
    }
  }, [user, router]);

  const handleSocialLogin = async (
    provider: "google" | "apple" | "facebook"
  ) => {
    if (provider === "google") {
      try {
        await googleLogin({});
        // ✅ useEffect otomatik yönlendirecek
      } catch (error) {
        console.error("❌ Google login failed:", error);
        toast.error("Google login failed");
      }
    } else if (provider === "apple" || provider === "facebook") {
      toast.info(`${provider} login coming soon!`);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthHeader
          title="Welcome back"
          subtitle="Sign in to your account to continue"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AuthError error={localError || error || ""} />

          <AuthInput
            label="Email address"
            type="email"
            placeholder="Enter your email"
            icon={<AuthIcons.Mail />}
            error={errors.email?.message}
            {...register("email")}
          />

          <AuthInput
            label="Password"
            placeholder="Enter your password"
            icon={<AuthIcons.Lock />}
            isPassword
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                Remember me
              </span>
            </label>
            <AuthLink href="/auth/forgot-password">Forgot password?</AuthLink>
          </div>

          <AuthButton type="submit" isLoading={isLoading} disabled={isLoading}>
            Sign in
          </AuthButton>
        </form>

        <AuthDivider />

        <div className="space-y-3">
          <SocialAuthButton
            provider="google"
            onClick={() => handleSocialLogin("google")}
            isLoading={isLoading}
            disabled={isLoading}
          />
          <SocialAuthButton
            provider="apple"
            onClick={() => handleSocialLogin("apple")}
          />
        </div>

        <AuthFooter>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <AuthLink href="/auth/register">Sign up</AuthLink>
          </p>
        </AuthFooter>
      </AuthCard>
    </AuthContainer>
  );
}
