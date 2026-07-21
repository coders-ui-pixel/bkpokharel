export type Role = "user" | "admin";
export type AdminRole = "super_admin" | "admin" | "instructor" | "content_manager" | "moderator";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
  role: Role;
  adminRole: AdminRole | null;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  college: string;
  password: string;
  confirmPassword: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  college?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
