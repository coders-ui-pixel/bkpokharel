export interface Badge {
  key: string;
  label: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
}

export interface GamificationProfile {
  xp: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  rank: number;
  badges: Badge[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  currentStreak: number;
}
