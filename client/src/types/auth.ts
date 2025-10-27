export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePicture?: string;
  isEmailVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: AuthUser;
  // Backend response formatı için alternatif yapılar
  data?: {
    token: string;
    refreshToken: string;
    user: AuthUser;
  };
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface GoogleLoginData {
  token?: string;
  access_token?: string;
  userInfo?: {
    email?: string;
    name?: string;
    picture?: string;
  };
}
export interface GoogleRegisterData {
  token?: string;
  access_token?: string;
  userInfo?: {
    email?: string;
    name?: string;
    picture?: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: { message: string } | null;
  isAuthenticated: boolean;
}

export interface AuthError {
  message: string;
}
