# Frontend Production-Ready Implementation Plan

**Target:** Backend seviyesinde profesyonel, production-ready frontend architecture  
**Timeline:** 2-3 weeks  
**Status:** Implementation Guide

---

## 📋 Implementation Roadmap

### Phase 1: Core Infrastructure (Days 1-3)

### Phase 2: State Management & API Layer (Days 4-7)

### Phase 3: Error Handling & Resilience (Days 8-10)

### Phase 4: Developer Experience (Days 11-12)

### Phase 5: Testing & Quality (Days 13-14)

### Phase 6: Performance & Production (Days 15-17)

---

# PHASE 1: Core Infrastructure (Days 1-3)

## Step 1.1: Install Dependencies

```bash
cd client
npm install @reduxjs/toolkit react-redux
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install axios
npm install @sentry/nextjs  # Error tracking
npm install zustand  # Alternative lightweight state (optional)
npm install react-error-boundary  # Error boundaries
npm install react-hook-form @hookform/resolvers zod  # Already installed, verify versions
```

**Dev Dependencies:**

```bash
npm install -D @types/node
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
npm install -D jest jest-environment-jsdom
npm install -D @types/jest
npm install -D eslint-plugin-react-hooks
```

---

## Step 1.2: Project Structure Setup

Create the following directory structure:

```
src/
├── app/                    # Next.js App Router (existing)
├── components/             # UI Components (existing)
│   ├── layout/            # Layout components
│   ├── error/             # Error components
│   └── ...
├── lib/                   # Core utilities
│   ├── api/              # API client infrastructure
│   │   ├── client.ts     # Axios instance
│   │   ├── interceptors/ # Request/Response interceptors
│   │   │   ├── request.ts
│   │   │   ├── response.ts
│   │   │   └── error.ts
│   │   └── adapters/     # Backend adapters
│   │       ├── base.ts
│   │       ├── nodejs.ts
│   │       └── rails.ts
│   ├── config/           # Configuration
│   │   ├── env.ts        # Environment variables
│   │   ├── constants.ts  # App constants
│   │   └── api.config.ts # API configuration
│   ├── utils/            # Utilities (existing)
│   ├── logger.ts         # Frontend logging service
│   └── error-handler.ts  # Error handling utilities
├── store/                # Redux store
│   ├── index.ts          # Store configuration
│   ├── hooks.ts          # Typed hooks
│   └── slices/           # Redux slices
│       ├── auth.slice.ts
│       ├── product.slice.ts
│       ├── cart.slice.ts
│       ├── order.slice.ts
│       └── ui.slice.ts
├── services/             # API services (refactor existing)
│   ├── base.service.ts   # Base service class
│   ├── auth.service.ts   # Refactor existing
│   ├── product.service.ts
│   ├── order.service.ts
│   ├── search.service.ts
│   ├── cart.service.ts
│   ├── user.service.ts
│   └── ...
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Auth hook wrapper
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   ├── useClickOutside.ts
│   └── queries/          # React Query hooks
│       ├── useProducts.ts
│       ├── useOrders.ts
│       └── ...
├── context/              # React Context (existing, keep for compatibility)
├── types/                # TypeScript types (existing + expand)
│   ├── api/             # API types
│   │   ├── response.ts
│   │   ├── error.ts
│   │   └── common.ts
│   ├── entities/        # Entity types
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── ...
│   └── ...
├── middleware/           # Client-side middleware (like backend)
│   ├── error-boundary.tsx
│   ├── auth-guard.tsx
│   └── monitoring.ts     # Analytics, performance
└── tests/                # Test files
    ├── setup.ts
    ├── mocks/
    └── utils/
```

---

## Step 1.3: Environment Configuration

**File: `src/lib/config/env.ts`**

```typescript
/**
 * Environment Configuration
 * Centralized environment variable management
 * Similar to backend/config/env.js
 */

export const env = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  API_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000"),

  // Backend Type
  BACKEND_TYPE: (process.env.NEXT_PUBLIC_BACKEND_TYPE || "nodejs") as
    | "nodejs"
    | "rails",

  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",

  // Feature Flags
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  ENABLE_ERROR_TRACKING:
    process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING === "true",

  // External Services
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GA_ID,

  // App Configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Galeria",
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
} as const;

// Validate required environment variables
if (env.IS_PRODUCTION) {
  if (!env.API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is required in production");
  }
}

export default env;
```

**File: `.env.local` (create)**

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_BACKEND_TYPE=nodejs
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true
```

**File: `.env.example` (create)**

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_BACKEND_TYPE=nodejs
NEXT_PUBLIC_API_TIMEOUT=30000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true

# External Services (Optional)
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_GA_ID=

# App Info
NEXT_PUBLIC_APP_NAME=Galeria
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## Step 1.4: Frontend Logging Service

**File: `src/lib/logger.ts`**

```typescript
/**
 * Frontend Logging Service
 * Similar to backend/utils/logger.js
 * Structured logging for frontend
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (context && Object.keys(context).length > 0) {
      logMessage += ` | Context: ${JSON.stringify(context)}`;
    }

    if (error) {
      logMessage += ` | Error: ${error.message} | Stack: ${error.stack}`;
    }

    return logMessage;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formattedMessage = this.formatMessage(entry);

    // Console logging
    switch (level) {
      case "debug":
        if (this.isDevelopment) console.debug(formattedMessage);
        break;
      case "info":
        console.info(formattedMessage);
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "error":
        console.error(formattedMessage);
        // Send to error tracking service in production
        if (!this.isDevelopment && typeof window !== "undefined") {
          // Integration with Sentry, LogRocket, etc.
          this.sendToErrorTracking(entry);
        }
        break;
    }

    // Store in localStorage for debugging (development only)
    if (this.isDevelopment && typeof window !== "undefined") {
      this.storeInLocalStorage(entry);
    }
  }

  private sendToErrorTracking(entry: LogEntry) {
    // TODO: Integrate with Sentry or other error tracking
    // Example: Sentry.captureException(entry.error, { extra: entry.context });
  }

  private storeInLocalStorage(entry: LogEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem("app_logs") || "[]");
      logs.push(entry);
      // Keep only last 100 logs
      if (logs.length > 100) logs.shift();
      localStorage.setItem("app_logs", JSON.stringify(logs));
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log("error", message, context, error);
  }
}

export const logger = new Logger();
export default logger;
```

---

# PHASE 2: State Management & API Layer (Days 4-7)

## Step 2.1: Redux Store Setup

**File: `src/store/index.ts`**

```typescript
/**
 * Redux Store Configuration
 * Similar to backend's modular structure
 */

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import logger from "@/lib/logger";

// Slices
import authReducer from "./slices/auth.slice";
import productReducer from "./slices/product.slice";
import cartReducer from "./slices/cart.slice";
import orderReducer from "./slices/order.slice";
import uiReducer from "./slices/ui.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Infer types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Log store changes in development
if (process.env.NODE_ENV === "development") {
  store.subscribe(() => {
    logger.debug("Store updated", { state: store.getState() });
  });
}

export default store;
```

**File: `src/store/hooks.ts`**

```typescript
/**
 * Typed Redux Hooks
 * Re-exports for convenience
 */

export { useAppDispatch, useAppSelector } from "./index";
export type { RootState, AppDispatch } from "./index";
```

**File: `src/store/slices/auth.slice.ts`**

```typescript
/**
 * Auth Slice
 * Manages authentication state
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  refreshToken:
    typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: AuthUser;
        token: string;
        refreshToken: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const {
  setCredentials,
  clearCredentials,
  setLoading,
  setError,
  updateUser,
} = authSlice.actions;
export default authSlice.reducer;
```

**Similar slices for:**

- `product.slice.ts`
- `cart.slice.ts`
- `order.slice.ts`
- `ui.slice.ts` (loading states, notifications, modals)

---

## Step 2.2: API Client Infrastructure

**File: `src/lib/api/adapters/base.ts`**

```typescript
/**
 * Base Backend Adapter
 * Abstract interface for backend adapters
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface BackendAdapter {
  normalizeResponse<T>(response: any): ApiResponse<T>;
  normalizeError(error: any): Error;
  getBaseURL(): string;
}

export abstract class BaseAdapter implements BackendAdapter {
  abstract normalizeResponse<T>(response: any): ApiResponse<T>;
  abstract normalizeError(error: any): Error;
  abstract getBaseURL(): string;
}
```

**File: `src/lib/api/adapters/nodejs.ts`**

```typescript
/**
 * Node.js Backend Adapter
 */

import { BaseAdapter, ApiResponse } from "./base";

export class NodeJSAdapter extends BaseAdapter {
  getBaseURL(): string {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  }

  normalizeResponse<T>(response: any): ApiResponse<T> {
    // Node.js backend response format
    if (response.data) {
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message,
      };
    }

    return {
      success: response.success !== false,
      data: response,
      message: response.message,
    };
  }

  normalizeError(error: any): Error {
    if (error.response?.data) {
      return new Error(error.response.data.message || "An error occurred");
    }
    return error instanceof Error ? error : new Error("Unknown error");
  }
}
```

**File: `src/lib/api/adapters/rails.ts`**

```typescript
/**
 * Rails Backend Adapter
 */

import { BaseAdapter, ApiResponse } from "./base";

export class RailsAdapter extends BaseAdapter {
  getBaseURL(): string {
    return process.env.NEXT_PUBLIC_RAILS_API_URL || "http://localhost:3000/api";
  }

  normalizeResponse<T>(response: any): ApiResponse<T> {
    // Rails backend response format
    if (response.errors) {
      return {
        success: false,
        error: Array.isArray(response.errors)
          ? response.errors.join(", ")
          : response.errors,
      };
    }

    return {
      success: true,
      data: response,
    };
  }

  normalizeError(error: any): Error {
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      const message = Array.isArray(errors) ? errors.join(", ") : errors;
      return new Error(message);
    }
    return error instanceof Error ? error : new Error("Unknown error");
  }
}
```

**File: `src/lib/api/client.ts`**

```typescript
/**
 * Centralized API Client
 * Similar to backend's service layer
 * Uses Axios with interceptors
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/lib/config/env";
import { logger } from "@/lib/logger";
import { NodeJSAdapter } from "./adapters/nodejs";
import { RailsAdapter } from "./adapters/rails";
import { BackendAdapter } from "./adapters/base";
import type { ApiResponse } from "./adapters/base";

class ApiClient {
  private client: AxiosInstance;
  private adapter: BackendAdapter;

  constructor() {
    // Select adapter based on environment
    this.adapter =
      env.BACKEND_TYPE === "rails" ? new RailsAdapter() : new NodeJSAdapter();

    // Create Axios instance
    this.client = axios.create({
      baseURL: this.adapter.getBaseURL(),
      timeout: env.API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracing
        const requestId = this.generateRequestId();
        if (config.headers) {
          config.headers["X-Request-ID"] = requestId;
        }

        logger.debug("API Request", {
          method: config.method,
          url: config.url,
          requestId,
        });

        return config;
      },
      (error: AxiosError) => {
        logger.error("Request Error", error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug("API Response", {
          status: response.status,
          url: response.config.url,
        });

        // Normalize response using adapter
        const normalized = this.adapter.normalizeResponse(response.data);
        return {
          ...response,
          data: normalized,
        };
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 Unauthorized - Token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken =
              typeof window !== "undefined"
                ? localStorage.getItem("refreshToken")
                : null;

            if (refreshToken) {
              const response = await axios.post(
                `${this.adapter.getBaseURL()}/auth/refresh`,
                { refreshToken }
              );

              const { token, refreshToken: newRefreshToken } =
                response.data.data || response.data;

              if (typeof window !== "undefined") {
                localStorage.setItem("token", token);
                if (newRefreshToken) {
                  localStorage.setItem("refreshToken", newRefreshToken);
                }
              }

              // Retry original request
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            if (typeof window !== "undefined") {
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              window.location.href = "/auth/login";
            }
            return Promise.reject(refreshError);
          }
        }

        // Normalize error using adapter
        const normalizedError = this.adapter.normalizeError(error);
        logger.error("API Error", normalizedError, {
          status: error.response?.status,
          url: error.config?.url,
        });

        return Promise.reject(normalizedError);
      }
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
```

---

## Step 2.3: Base Service Class

**File: `src/services/base.service.ts`**

```typescript
/**
 * Base Service Class
 * Similar to backend's service pattern
 * All services extend this base class
 */

import { apiClient, ApiResponse } from "@/lib/api/client";
import { logger } from "@/lib/logger";

export abstract class BaseService {
  protected api = apiClient;
  protected logger = logger;

  protected handleError(error: any, context: string): never {
    this.logger.error(`Error in ${context}`, error);
    throw error;
  }

  protected async request<T>(
    method: "get" | "post" | "put" | "patch" | "delete",
    endpoint: string,
    data?: any,
    config?: any
  ): Promise<ApiResponse<T>> {
    try {
      switch (method) {
        case "get":
          return await this.api.get<T>(endpoint, config);
        case "post":
          return await this.api.post<T>(endpoint, data, config);
        case "put":
          return await this.api.put<T>(endpoint, data, config);
        case "patch":
          return await this.api.patch<T>(endpoint, data, config);
        case "delete":
          return await this.api.delete<T>(endpoint, config);
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
    } catch (error) {
      this.handleError(error, `${method.toUpperCase()} ${endpoint}`);
    }
  }
}
```

**File: `src/services/product.service.ts`**

```typescript
/**
 * Product Service
 * Similar to backend/modules/product/product.service.js
 */

import { BaseService } from "./base.service";
import {
  Product,
  ProductListResponse,
  ProductFilters,
} from "@/types/entities/product";

export class ProductService extends BaseService {
  async getAll(filters?: ProductFilters): Promise<ProductListResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const endpoint = `/products${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return this.request<ProductListResponse>("get", endpoint);
  }

  async getById(id: string): Promise<Product> {
    const response = await this.request<Product>("get", `/products/${id}`);
    return response.data!;
  }

  async create(data: Partial<Product>): Promise<Product> {
    const response = await this.request<Product>("post", "/products", data);
    return response.data!;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const response = await this.request<Product>(
      "put",
      `/products/${id}`,
      data
    );
    return response.data!;
  }

  async delete(id: string): Promise<void> {
    await this.request<void>("delete", `/products/${id}`);
  }
}

export const productService = new ProductService();
```

**Similar services for:**

- `order.service.ts`
- `search.service.ts`
- `cart.service.ts`
- `user.service.ts`
- `favorite.service.ts`
- `community.service.ts`
- `notification.service.ts`

**Refactor existing:**

- `auth.service.ts` - Extend BaseService
- `onboarding.service.ts` - Extend BaseService

---

## Step 2.4: React Query Setup

**File: `src/lib/react-query.ts`**

```typescript
/**
 * React Query Configuration
 * Similar to backend's caching strategy
 */

import { QueryClient, QueryClientConfig } from "@tanstack/react-query";
import { logger } from "./logger";

const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
};

export const queryClient = new QueryClient(queryConfig);

// Log query errors
queryClient.getQueryCache().subscribe((event) => {
  if (event?.type === "error") {
    logger.error("React Query Error", event.error, {
      queryKey: event.query.queryKey,
    });
  }
});
```

**File: `src/app/providers.tsx`** (create new)

```typescript
/**
 * App Providers
 * Wrap app with all necessary providers
 */

"use client";

import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { store } from "@/store";
import { queryClient } from "@/lib/react-query";
import { AuthProvider } from "@/context/AuthContext"; // Keep for compatibility
import { OnboardingProvider } from "@/context/OnboardingContext"; // Keep for compatibility

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OnboardingProvider>{children}</OnboardingProvider>
        </AuthProvider>
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </Provider>
  );
}
```

**Update: `src/app/layout.tsx`**

```typescript
import { Providers } from "./providers";
// ... other imports

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**File: `src/hooks/queries/useProducts.ts`**

```typescript
/**
 * React Query Hooks for Products
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { Product, ProductFilters } from "@/types/entities/product";

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getAll(filters),
    select: (response) => response.data,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Product>) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
```

---

# PHASE 3: Error Handling & Resilience (Days 8-10)

## Step 3.1: Global Error Boundary

**File: `src/components/error/ErrorBoundary.tsx`**

```typescript
/**
 * Global Error Boundary
 * Similar to backend's globalErrorHandler middleware
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("Error Boundary Caught Error", error, {
      componentStack: errorInfo.componentStack,
    });

    // Send to error tracking service
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      // Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              We're sorry, but something unexpected happened. Please try
              refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Update: `src/app/layout.tsx`**

```typescript
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

---

## Step 3.2: Error Handling Utilities

**File: `src/lib/error-handler.ts`**

```typescript
/**
 * Error Handling Utilities
 * Similar to backend/utils/errorHandler.js
 */

import { AxiosError } from "axios";
import { logger } from "./logger";

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export class ErrorHandler {
  static handle(error: unknown): AppError {
    // Axios errors
    if (this.isAxiosError(error)) {
      return this.handleAxiosError(error);
    }

    // Standard errors
    if (error instanceof Error) {
      return {
        message: error.message,
        code: error.name,
      };
    }

    // Unknown errors
    logger.error("Unknown error type", new Error("Unknown error"), { error });
    return {
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
    };
  }

  private static isAxiosError(error: any): error is AxiosError {
    return error?.isAxiosError === true;
  }

  private static handleAxiosError(error: AxiosError): AppError {
    const statusCode = error.response?.status;
    const data = error.response?.data as any;

    // Handle different status codes
    switch (statusCode) {
      case 400:
        return {
          message: data?.message || "Bad request",
          code: "BAD_REQUEST",
          statusCode: 400,
          details: data,
        };
      case 401:
        return {
          message: "Unauthorized. Please log in again.",
          code: "UNAUTHORIZED",
          statusCode: 401,
        };
      case 403:
        return {
          message: "You do not have permission to perform this action.",
          code: "FORBIDDEN",
          statusCode: 403,
        };
      case 404:
        return {
          message: data?.message || "Resource not found",
          code: "NOT_FOUND",
          statusCode: 404,
        };
      case 422:
        return {
          message: data?.message || "Validation error",
          code: "VALIDATION_ERROR",
          statusCode: 422,
          details: data?.errors,
        };
      case 429:
        return {
          message: "Too many requests. Please try again later.",
          code: "RATE_LIMIT",
          statusCode: 429,
        };
      case 500:
        return {
          message: "Internal server error. Please try again later.",
          code: "SERVER_ERROR",
          statusCode: 500,
        };
      default:
        return {
          message: data?.message || error.message || "An error occurred",
          code: "API_ERROR",
          statusCode: statusCode,
          details: data,
        };
    }
  }

  static getErrorMessage(error: unknown): string {
    const appError = this.handle(error);
    return appError.message;
  }
}
```

---

# PHASE 4: Developer Experience (Days 11-12)

## Step 4.1: Custom Hooks

**File: `src/hooks/useDebounce.ts`**

```typescript
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**File: `src/hooks/useLocalStorage.ts`**

```typescript
import { useState, useEffect } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error saving to localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}
```

**File: `src/hooks/useMediaQuery.ts`**

```typescript
import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}
```

**File: `src/hooks/useClickOutside.ts`**

```typescript
import { useEffect, RefObject } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
```

---

## Step 4.2: Type Definitions

**File: `src/types/api/response.ts`**

```typescript
/**
 * API Response Types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
```

**File: `src/types/api/error.ts`**

```typescript
/**
 * API Error Types
 */

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
  errors?: Record<string, string[]>;
}
```

**File: `src/types/entities/product.ts`**

```typescript
/**
 * Product Entity Types
 */

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  brand?: string;
  stock: number;
  sellerId: string;
  communityId?: string;
  status: "active" | "inactive" | "draft";
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

**Similar type files for:**

- `order.ts`
- `cart.ts`
- `user.ts`
- `community.ts`
- etc.

---

# PHASE 5: Testing & Quality (Days 13-14)

## Step 5.1: Testing Setup

**File: `jest.config.js`** (create)

```javascript
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

**File: `tests/setup.ts`**

```typescript
import "@testing-library/jest-dom";
```

**File: `tests/utils/test-utils.tsx`**

```typescript
import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
```

---

# PHASE 6: Performance & Production (Days 15-17)

## Step 6.1: Next.js Configuration

**File: `next.config.ts`** (update)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    domains: ["localhost", "your-cdn-domain.com"],
    formats: ["image/avif", "image/webp"],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ["@heroicons/react", "lucide-react"],
  },
};

export default nextConfig;
```

---

## Step 6.2: Monitoring & Analytics

**File: `src/middleware/monitoring.ts`**

```typescript
/**
 * Frontend Monitoring
 * Similar to backend/middlewares/monitoring.js
 */

import { logger } from "@/lib/logger";

export class MonitoringService {
  static trackPageView(path: string) {
    logger.info("Page View", { path });
    // Integrate with analytics service
    // Example: gtag('config', 'GA_MEASUREMENT_ID', { page_path: path });
  }

  static trackEvent(eventName: string, properties?: Record<string, any>) {
    logger.info("Event Tracked", { eventName, properties });
    // Integrate with analytics service
  }

  static trackError(error: Error, context?: Record<string, any>) {
    logger.error("Error Tracked", error, context);
    // Send to error tracking service
  }

  static trackPerformance(metric: string, value: number) {
    logger.debug("Performance Metric", { metric, value });
    // Send to performance monitoring service
  }
}
```

---

## Final Checklist

- [ ] All dependencies installed
- [ ] Project structure created
- [ ] Environment configuration setup
- [ ] Redux store configured
- [ ] API client with interceptors
- [ ] Backend adapters (Node.js + Rails)
- [ ] All services created
- [ ] React Query configured
- [ ] Error boundary implemented
- [ ] Custom hooks created
- [ ] Type definitions complete
- [ ] Testing setup complete
- [ ] Error tracking integrated
- [ ] Performance optimizations
- [ ] Security headers configured
- [ ] Documentation updated

---

**Next Steps:** Start with Phase 1 and work through each phase systematically. Each phase builds on the previous one, ensuring a solid foundation.
