import { useQuery } from "@tanstack/react-query";
import * as gamificationApi from "./api";

export function useGamificationProfile() {
  return useQuery({
    queryKey: ["gamification", "me"],
    queryFn: gamificationApi.fetchGamificationProfile,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });
}

export function useGamificationLeaderboard() {
  return useQuery({
    queryKey: ["gamification", "leaderboard"],
    queryFn: gamificationApi.fetchGamificationLeaderboard,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });
}
