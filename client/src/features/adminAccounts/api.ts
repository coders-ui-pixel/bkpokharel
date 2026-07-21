import { apiClient } from "../../lib/apiClient";
import type { AdminRole } from "../auth/types";
import type { AdminAccount, CreateAdminInput } from "./types";

export async function fetchAdmins(): Promise<AdminAccount[]> {
  const { data } = await apiClient.get<{ admins: AdminAccount[] }>("/admin/admins");
  return data.admins;
}

export async function createAdmin(input: CreateAdminInput): Promise<AdminAccount> {
  const { data } = await apiClient.post<{ admin: AdminAccount }>("/admin/admins", input);
  return data.admin;
}

export async function updateAdminRole(id: number, adminRole: AdminRole): Promise<AdminAccount> {
  const { data } = await apiClient.put<{ admin: AdminAccount }>(`/admin/admins/${id}/role`, { adminRole });
  return data.admin;
}

export async function deleteAdmin(id: number): Promise<void> {
  await apiClient.delete(`/admin/admins/${id}`);
}
