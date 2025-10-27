import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AuthError as AuthErrorType } from "@/types/auth";

interface AuthLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const AuthLink: React.FC<AuthLinkProps> = ({
  href,
  children,
  className,
}) => {
  return (
    <Link
      href={href}
      className={cn(
        "text-accent-600 hover:text-accent-700 font-medium transition-colors duration-200",
        className
      )}
    >
      {children}
    </Link>
  );
};

interface AuthDividerProps {
  text?: string;
  className?: string;
}

export const AuthDivider: React.FC<AuthDividerProps> = ({
  text = "or",
  className,
}) => {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border-medium" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-background text-text-muted">{text}</span>
      </div>
    </div>
  );
};

interface SocialAuthButtonProps {
  provider: "google" | "apple" | "facebook";
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

export const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({
  provider,
  onClick,
  className,
}) => {
  type ProviderConfig = Record<
    SocialAuthButtonProps["provider"],
    {
      name: string;
      icon?: string;
      bgColor: string;
      textColor: string;
      borderColor: string;
    }
  >;

  const providerConfig: ProviderConfig = {
    google: {
      name: "Google",
      //icon: "🔍",
      bgColor: "bg-background hover:bg-surface",
      textColor: "text-text-primary",
      borderColor: "border-border-medium",
    },
    apple: {
      name: "Apple",
      //icon: "",
      bgColor: "bg-secondary-900 hover:bg-secondary-800",
      textColor: "text-white",
      borderColor: "border-secondary-900",
    },
    facebook: {
      name: "Facebook",
      icon: "📘",
      bgColor: "bg-primary-600 hover:bg-primary-700",
      textColor: "text-white",
      borderColor: "border-primary-600",
    },
  };

  const config = providerConfig[provider];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg border transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      {/*<span className="text-lg">{config.icon}</span>*/}
      <span className="font-medium">Continue with {config.name}</span>
    </button>
  );
};

interface AuthErrorProps {
  error: string | AuthErrorType | null | undefined;
  className?: string;
}

export const AuthError: React.FC<AuthErrorProps> = ({ error, className }) => {
  if (!error) return null;

  const errorMessage =
    typeof error === "string" ? error : error.message || "An error occurred";

  return (
    <div
      className={cn(
        "bg-danger-50 border border-danger-200 rounded-lg p-4",
        className
      )}
    >
      <p className="text-sm text-danger-800">{errorMessage}</p>
    </div>
  );
};

interface AuthSuccessProps {
  message: string;
  className?: string;
}

export const AuthSuccess: React.FC<AuthSuccessProps> = ({
  message,
  className,
}) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        "bg-accent-50 border border-accent-200 rounded-lg p-4",
        className
      )}
    >
      <p className="text-sm text-accent-800">{message}</p>
    </div>
  );
};
