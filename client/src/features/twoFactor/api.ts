import { apiClient } from "../../lib/apiClient";

export async function beginTwoFactorSetup(): Promise<{ qrCodeDataUrl: string; secret: string }> {
  const { data } = await apiClient.post<{ qrCodeDataUrl: string; secret: string }>("/auth/2fa/setup");
  return data;
}

export async function confirmTwoFactorSetup(token: string): Promise<void> {
  await apiClient.post("/auth/2fa/verify", { token });
}

export async function disableTwoFactor(token: string): Promise<void> {
  await apiClient.post("/auth/2fa/disable", { token });
}
