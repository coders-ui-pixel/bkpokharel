import { apiClient, setAccessToken } from "../../lib/apiClient";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
  User,
} from "./types";

interface AuthResponse {
  user: User;
  accessToken: string;
}

export type LoginResult =
  | { requiresTwoFactor: true; pendingToken: string }
  | { requiresTwoFactor: false; user: User };

export async function registerRequest(input: RegisterInput): Promise<User> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", input);
  setAccessToken(data.accessToken);
  return data.user;
}

export async function loginRequest(input: LoginInput): Promise<LoginResult> {
  const { data } = await apiClient.post<
    { requiresTwoFactor: true; pendingToken: string } | (AuthResponse & { requiresTwoFactor: false })
  >("/auth/login", input);

  if (data.requiresTwoFactor) {
    return { requiresTwoFactor: true, pendingToken: data.pendingToken };
  }
  setAccessToken(data.accessToken);
  return { requiresTwoFactor: false, user: data.user };
}

export async function verifyTwoFactorLoginRequest(pendingToken: string, code: string): Promise<User> {
  const { data } = await apiClient.post<AuthResponse>("/auth/2fa/login-verify", {
    pendingToken,
    code,
  });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post("/auth/logout");
  setAccessToken(null);
}

export async function refreshSessionRequest(): Promise<User | null> {
  try {
    const { data } = await apiClient.post<AuthResponse>("/auth/refresh");
    setAccessToken(data.accessToken);
    return data.user;
  } catch {
    return null;
  }
}

export async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<{ user: User }>("/auth/me");
  return data.user;
}

export async function forgotPasswordRequest(input: ForgotPasswordInput): Promise<void> {
  await apiClient.post("/auth/forgot-password", input);
}

export async function resetPasswordRequest(input: ResetPasswordInput): Promise<void> {
  await apiClient.post("/auth/reset-password", input);
}

export async function updateProfileRequest(input: UpdateProfileInput): Promise<User> {
  const { data } = await apiClient.put<{ user: User }>("/auth/me", input);
  return data.user;
}

export async function changePasswordRequest(input: ChangePasswordInput): Promise<void> {
  await apiClient.put("/auth/me/password", input);
  setAccessToken(null);
}
