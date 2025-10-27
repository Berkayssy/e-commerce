"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import {
  AuthContainer,
  AuthCard,
  AuthHeader,
  AuthFooter,
} from "@/components/auth/AuthLayout";
import { AuthInput, AuthButton, AuthIcons } from "@/components/auth/AuthForm";
import { AuthLink, AuthError } from "@/components/auth/AuthUI";
import { authService } from "@/services/auth.service";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success("Password reset email sent!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send reset email";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthContainer>
        <AuthCard>
          <AuthHeader
            title="Check your email"
            subtitle="We've sent a password reset link to your email address"
          />

          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">📧</span>
            </div>

            <p className="text-slate-600 dark:text-slate-400">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                try again
              </button>
            </p>
          </div>

          <AuthFooter>
            <AuthLink
              href="/auth/login"
              className="flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back to sign in</span>
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
          title="Forgot your password?"
          subtitle="No worries, we'll send you reset instructions"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AuthError error={error || ""} />

          <AuthInput
            label="Email address"
            type="email"
            placeholder="Enter your email"
            icon={<AuthIcons.Mail />}
            error={errors.email?.message}
            {...register("email")}
          />

          <AuthButton type="submit" isLoading={isLoading} disabled={isLoading}>
            Send reset instructions
          </AuthButton>
        </form>

        <AuthFooter>
          <AuthLink
            href="/auth/login"
            className="flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to sign in</span>
          </AuthLink>
        </AuthFooter>
      </AuthCard>
    </AuthContainer>
  );
}
