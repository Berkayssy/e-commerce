"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  AuthState,
  LoginFormData,
  RegisterFormData,
  GoogleLoginData,
  AuthUser,
  AuthResponse,
} from "@/types/auth";
import { authService } from "@/services/auth.service";

interface AuthContextType extends AuthState {
  login: (credentials: LoginFormData) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  googleLogin: (data: GoogleLoginData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// ✅ Normalized auth response interface
interface NormalizedAuthResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
  });

  // ✅ Response formatını normalize eden helper function - ANY YOK
  const normalizeAuthResponse = (
    response: AuthResponse
  ): NormalizedAuthResponse => {
    console.log("📦 Normalizing auth response:", response);

    // Backend response formatını handle et
    const data = response?.data || response;

    const token = data?.token || response?.token;
    const refreshToken = data?.refreshToken || response?.refreshToken;
    const user = data?.user || response?.user;

    if (!token || !refreshToken || !user) {
      throw new Error("Invalid auth response format");
    }

    return {
      token,
      refreshToken,
      user,
    };
  };

  // ✅ Google Login
  const googleLogin = async (data: GoogleLoginData) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authService.googleLogin(data);
      const { token, refreshToken, user } = normalizeAuthResponse(response);

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);

      setState({
        user: user,
        token: token,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      });

      console.log("✅ Google login successful:", user.email);
    } catch (error) {
      console.error("❌ Google login failed:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: {
          message:
            error instanceof Error ? error.message : "Google login failed",
        },
      }));
      throw error;
    }
  };

  // ✅ Token Refresh
  const refreshAuth = useCallback(async () => {
    console.log("🔁 Refreshing token...");
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token available");

      const response = await authService.refreshToken(refreshToken);
      const {
        token,
        refreshToken: newRefreshToken,
        user,
      } = normalizeAuthResponse(response);

      localStorage.setItem("token", token);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      setState({
        user: user,
        token: token,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      });

      console.log("✅ Token successfully refreshed!");
    } catch (error) {
      console.warn("❌ Token refresh failed:", error);

      // Refresh failed, clear auth state
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      setState({
        user: null,
        token: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
      });

      throw error;
    }
  }, []);

  // ✅ Login
  const login = async (credentials: LoginFormData) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authService.login(credentials);
      const { token, refreshToken, user } = normalizeAuthResponse(response);

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);

      setState({
        user: user,
        token: token,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("❌ Login failed:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: {
          message: error instanceof Error ? error.message : "Login failed",
        },
      }));
      throw error;
    }
  };

  // ✅ Register
  const register = async (data: RegisterFormData) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authService.register(data);
      const { token, refreshToken, user } = normalizeAuthResponse(response);

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);

      setState({
        user: user,
        token: token,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: {
          message:
            error instanceof Error ? error.message : "Registration failed",
        },
      }));
      throw error;
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      setState({
        user: null,
        token: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
      });
    }
  };

  // ✅ Error Temizleme
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  // ✅ Initial Auth Check
  useEffect(() => {
    let isMounted = true;
    let refreshInterval: NodeJS.Timeout | null = null;

    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!token || !refreshToken) {
        if (isMounted) setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        await refreshAuth();

        if (isMounted) {
          console.log("⏰ Setting up token refresh interval (14 min)");
          refreshInterval = setInterval(() => {
            console.log("⏰ Auto-refreshing token...");
            refreshAuth().catch((err) => {
              console.error("Auto-refresh failed:", err);
              if (refreshInterval) clearInterval(refreshInterval);
            });
          }, 14 * 60 * 1000); // 14 minutes
        }
      } catch (error) {
        console.error("❌ Initial auth failed:", error);
        if (isMounted) {
          setState({
            user: null,
            token: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,
          });
        }
      }
    };

    initAuth();

    return () => {
      console.log("🧹 AuthProvider unmounted");
      isMounted = false;
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshAuth]);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    googleLogin,
    logout,
    refreshAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
