import { apiClient } from "../../lib/apiClient";
import type { SessionInfo } from "./types";

export async function fetchSessions(): Promise<SessionInfo[]> {
  const { data } = await apiClient.get<{ sessions: SessionInfo[] }>("/auth/sessions");
  return data.sessions;
}

export async function revokeSession(id: number): Promise<void> {
  await apiClient.delete(`/auth/sessions/${id}`);
}
