import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as notificationsApi from "./api";
import type { SendNotificationInput } from "./types";

const KEY = ["notifications"];

export function useNotifications() {
  return useQuery({
    queryKey: KEY,
    queryFn: notificationsApi.fetchNotifications,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useSendNotification() {
  return useMutation({
    mutationFn: (input: SendNotificationInput) => notificationsApi.sendNotification(input),
  });
}
