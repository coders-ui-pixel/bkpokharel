import { apiClient } from "../../lib/apiClient";
import type { GamificationProfile, LeaderboardEntry } from "./types";

export async function fetchGamificationProfile(): Promise<GamificationProfile> {
  const { data } = await apiClient.get<{ profile: GamificationProfile }>("/gamification/me");
  return data.profile;
}

export async function fetchGamificationLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data } = await apiClient.get<{ leaderboard: LeaderboardEntry[] }>("/gamification/leaderboard");
  return data.leaderboard;
}
