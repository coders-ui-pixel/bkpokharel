import type { AdminRole } from "../auth/types";

export interface AdminAccount {
  id: number;
  name: string;
  email: string;
  adminRole: AdminRole | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  adminRole: AdminRole;
}
