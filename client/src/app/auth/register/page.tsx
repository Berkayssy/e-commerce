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

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and conditions"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Zod schema'dan type oluştur
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register: registerUser,
    error,
    isLoading,
    user,
    googleLogin,
  } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  React.useEffect(() => {
    if (user?.id) {
      toast.success("Registration successful!");
      router.push(`/dashboard/user/${user.id}`);
    }
  }, [user, router]);

  const onSubmit = async (data: RegisterFormValues) => {
    setLocalError(null);

    try {
      // Backend'e sadece gerekli field'ları gönder
      const registerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      };

      await registerUser(registerData);
      toast.success("Welcome to Galeria!");
      router.push("/dashboard");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setLocalError(errorMessage);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (user?.id) {
      toast.success("Register successful!");
      router.push(`/dashboard/user/${user.id}`);
    }
  }, [user, router]);

  const handleSocialRegister = async (
    provider: "google" | "apple" | "facebook"
  ) => {
    if (provider === "google") {
      //setIsGoogleLoading(true);
      setLocalError(null);
      try {
        await googleLogin({});
        // ✅ useEffect otomatik yönlendirecek
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Google registration failed";
        setLocalError(errorMessage);
        toast.error(errorMessage);
      } finally {
      }
    } else if (provider === "apple" || provider === "facebook") {
      toast.info(`${provider} registration coming soon!`);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthHeader
          title="Create your account"
          subtitle="Join Galeria and discover amazing collections"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AuthError error={localError || error?.message || ""} />

          <div className="grid grid-cols-2 gap-4">
            <AuthInput
              label="First name"
              placeholder="Enter your first name"
              icon={<AuthIcons.User />}
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <AuthInput
              label="Last name"
              placeholder="Enter your last name"
              icon={<AuthIcons.User />}
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>

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
            placeholder="Create a strong password"
            icon={<AuthIcons.Lock />}
            isPassword
            error={errors.password?.message}
            {...register("password")}
          />

          <AuthInput
            label="Confirm password"
            placeholder="Confirm your password"
            icon={<AuthIcons.Lock />}
            isPassword
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {/* Password strength indicator */}
          {password && (
            <div className="space-y-2">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Password strength:
              </div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded ${
                      password.length >= level * 2
                        ? password.length >= 8 &&
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
                          ? "bg-green-500"
                          : "bg-yellow-500"
                        : "bg-slate-200 dark:bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              {...register("terms")}
            />
            <label className="text-sm text-slate-600 dark:text-slate-400">
              I agree to the{" "}
              <AuthLink href="/terms" className="underline">
                Terms of Service
              </AuthLink>{" "}
              and{" "}
              <AuthLink href="/privacy" className="underline">
                Privacy Policy
              </AuthLink>
            </label>
          </div>
          {errors.terms && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {errors.terms.message}
            </p>
          )}

          <AuthButton type="submit" isLoading={isLoading} disabled={isLoading}>
            Create account
          </AuthButton>
        </form>

        <AuthDivider />

        <div className="space-y-3">
          <SocialAuthButton
            provider="google"
            onClick={() => handleSocialRegister("google")}
            isLoading={isLoading}
            disabled={isLoading}
          />
          <SocialAuthButton
            provider="apple"
            onClick={() => handleSocialRegister("apple")}
          />
        </div>

        <AuthFooter>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <AuthLink href="/auth/login">Sign in</AuthLink>
          </p>
        </AuthFooter>
      </AuthCard>
    </AuthContainer>
  );
}
