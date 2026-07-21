import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as sessionsApi from "./api";

export function useSessions() {
  return useQuery({ queryKey: ["sessions"], queryFn: sessionsApi.fetchSessions });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sessionsApi.revokeSession(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
  });
}
