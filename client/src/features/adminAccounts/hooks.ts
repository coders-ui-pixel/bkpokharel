import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as adminAccountsApi from "./api";
import type { AdminRole } from "../auth/types";
import type { CreateAdminInput } from "./types";

const KEY = ["admin-accounts"];

export function useAdmins() {
  return useQuery({ queryKey: KEY, queryFn: adminAccountsApi.fetchAdmins });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAdminInput) => adminAccountsApi.createAdmin(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateAdminRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminRole }: { id: number; adminRole: AdminRole }) =>
      adminAccountsApi.updateAdminRole(id, adminRole),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminAccountsApi.deleteAdmin(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
