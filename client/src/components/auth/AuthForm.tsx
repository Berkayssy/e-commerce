import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  error,
  icon,
  isPassword = false,
  className,
  type,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          className={cn(
            "w-full px-4 py-3 rounded-lg border transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent",
            "bg-background text-text-primary",
            "placeholder:text-text-muted",
            icon ? "pl-10" : "",
            isPassword ? "pr-10" : "",
            error
              ? "border-danger-500 focus:ring-danger-500"
              : isFocused
              ? "border-accent-500"
              : "border-border-medium",
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-danger-600">{error}</p>}
    </div>
  );
};

interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  isLoading = false,
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}) => {
  const baseClasses =
    "w-full font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-primary-900 hover:bg-primary-800 text-white focus:ring-primary-500",
    secondary:
      "bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500",
    outline:
      "border-2 border-border-medium text-text-primary hover:bg-surface focus:ring-accent-500",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Icon components for common auth inputs
export const AuthIcons = {
  Mail: () => <Mail size={20} />,
  Lock: () => <Lock size={20} />,
  User: () => <User size={20} />,
};
