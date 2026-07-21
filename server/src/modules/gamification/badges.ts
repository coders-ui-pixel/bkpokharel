import { GamificationProfile } from "@prisma/client";

export interface BadgeDefinition {
  key: string;
  label: string;
  description: string;
  icon: string;
  check: (profile: GamificationProfile) => boolean;
}

export const BADGES: BadgeDefinition[] = [
  {
    key: "first_steps",
    label: "First Steps",
    description: "Completed your first activity",
    icon: "🌱",
    check: (p) => p.xp >= 10,
  },
  {
    key: "streak_3",
    label: "On a Roll",
    description: "Reached a 3-day study streak",
    icon: "🔥",
    check: (p) => p.currentStreak >= 3,
  },
  {
    key: "streak_7",
    label: "Week Warrior",
    description: "Reached a 7-day study streak",
    icon: "⚡",
    check: (p) => p.currentStreak >= 7,
  },
  {
    key: "streak_30",
    label: "Unstoppable",
    description: "Reached a 30-day study streak",
    icon: "🏆",
    check: (p) => p.currentStreak >= 30,
  },
  {
    key: "xp_100",
    label: "Rising Star",
    description: "Earned 100 XP",
    icon: "⭐",
    check: (p) => p.xp >= 100,
  },
  {
    key: "xp_500",
    label: "Scholar",
    description: "Earned 500 XP",
    icon: "🎓",
    check: (p) => p.xp >= 500,
  },
  {
    key: "xp_1000",
    label: "Master",
    description: "Earned 1000 XP",
    icon: "👑",
    check: (p) => p.xp >= 1000,
  },
];

export const XP_RULES = {
  PRACTICE_SUBMIT: 10,
  LIVE_EXAM_SUBMIT: 25,
  STUDY_TASK_DONE: 5,
};
