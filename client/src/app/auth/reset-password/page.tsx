"use client";

import React, { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

import {
  AuthContainer,
  AuthCard,
  AuthHeader,
  AuthFooter,
} from "@/components/auth/AuthLayout";
import { AuthInput, AuthButton, AuthIcons } from "@/components/auth/AuthForm";
import { AuthLink, AuthError } from "@/components/auth/AuthUI";
import { authService } from "@/services/auth.service";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password");

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword(
        token,
        data.password,
        data.confirmPassword
      );
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reset password";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthContainer>
        <AuthCard>
          <AuthHeader
            title="Password reset successful"
            subtitle="Your password has been updated successfully"
          />

          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">✅</span>
            </div>

            <p className="text-slate-600 dark:text-slate-400">
              You can now sign in with your new password.
            </p>
          </div>

          <AuthFooter>
            <AuthLink
              href="/auth/login"
              className="flex items-center justify-center"
            >
              Continue to sign in
            </AuthLink>
          </AuthFooter>
        </AuthCard>
      </AuthContainer>
    );
  }

  if (!token) {
    return (
      <AuthContainer>
        <AuthCard>
          <AuthHeader
            title="Invalid reset link"
            subtitle="This password reset link is invalid or has expired"
          />

          <AuthFooter>
            <AuthLink href="/auth/forgot-password">
              Request a new reset link
            </AuthLink>
          </AuthFooter>
        </AuthCard>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <AuthCard>
        <AuthHeader
          title="Set new password"
          subtitle="Enter your new password below"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AuthError error={error || ""} />

          <AuthInput
            label="New password"
            placeholder="Enter your new password"
            icon={<AuthIcons.Lock />}
            isPassword
            error={errors.password?.message}
            {...register("password")}
          />

          <AuthInput
            label="Confirm new password"
            placeholder="Confirm your new password"
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

          <AuthButton type="submit" isLoading={isLoading} disabled={isLoading}>
            Update password
          </AuthButton>
        </form>

        <AuthFooter>
          <AuthLink href="/auth/login">Back to sign in</AuthLink>
        </AuthFooter>
      </AuthCard>
    </AuthContainer>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthContainer>
          <AuthCard>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                Loading...
              </p>
            </div>
          </AuthCard>
        </AuthContainer>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
