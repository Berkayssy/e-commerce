import React from "react";
import { cn } from "@/lib/utils";

interface AuthContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-surface to-neutral-100",
        "flex items-center justify-center p-4",
        className
      )}
    >
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
};

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "bg-background rounded-2xl shadow-medium border border-border-light",
        "p-8 space-y-6 animate-fade-in",
        className
      )}
    >
      {children}
    </div>
  );
};

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  className,
}) => {
  return (
    <div className={cn("text-center space-y-2", className)}>
      <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
      {subtitle && <p className="text-text-secondary">{subtitle}</p>}
    </div>
  );
};

interface AuthFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("text-center space-y-4", className)}>{children}</div>
  );
};
