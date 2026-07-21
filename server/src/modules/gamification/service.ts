import { prisma } from "../../config/db";
import { BADGES } from "./badges";

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

async function getOrCreateProfile(userId: number) {
  return prisma.gamificationProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function awardActivity(userId: number, xpAmount: number) {
  const profile = await getOrCreateProfile(userId);
  const today = startOfDay(new Date());

  let nextStreak = profile.currentStreak;
  if (!profile.lastActivityDate) {
    nextStreak = 1;
  } else {
    const prevDay = startOfDay(profile.lastActivityDate);
    const dayDiff = Math.round((today.getTime() - prevDay.getTime()) / 86400000);
    if (dayDiff === 0) {
      nextStreak = profile.currentStreak || 1;
    } else if (dayDiff === 1) {
      nextStreak = profile.currentStreak + 1;
    } else {
      nextStreak = 1;
    }
  }

  const updated = await prisma.gamificationProfile.update({
    where: { userId },
    data: {
      xp: profile.xp + xpAmount,
      coins: profile.coins + Math.round(xpAmount / 2),
      currentStreak: nextStreak,
      longestStreak: Math.max(profile.longestStreak, nextStreak),
      lastActivityDate: today,
    },
  });

  const earned = await prisma.userBadge.findMany({ where: { userId }, select: { badgeKey: true } });
  const earnedKeys = new Set(earned.map((b) => b.badgeKey));
  const toAward = BADGES.filter((b) => !earnedKeys.has(b.key) && b.check(updated));

  if (toAward.length > 0) {
    await prisma.userBadge.createMany({
      data: toAward.map((b) => ({ userId, badgeKey: b.key })),
    });
  }

  return {
    profile: updated,
    newBadges: toAward.map((b) => ({ key: b.key, label: b.label, description: b.description, icon: b.icon })),
  };
}

export async function getProfile(userId: number) {
  const profile = await getOrCreateProfile(userId);
  const earned = await prisma.userBadge.findMany({ where: { userId } });
  const earnedByKey = new Map(earned.map((b) => [b.badgeKey, b.earnedAt]));
  const higherRanked = await prisma.gamificationProfile.count({ where: { xp: { gt: profile.xp } } });

  return {
    xp: profile.xp,
    coins: profile.coins,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    lastActivityDate: profile.lastActivityDate,
    rank: higherRanked + 1,
    badges: BADGES.map((b) => ({
      key: b.key,
      label: b.label,
      description: b.description,
      icon: b.icon,
      earned: earnedByKey.has(b.key),
      earnedAt: earnedByKey.get(b.key) ?? null,
    })),
  };
}

export async function getLeaderboard(limit = 20) {
  const profiles = await prisma.gamificationProfile.findMany({
    orderBy: { xp: "desc" },
    take: limit,
    include: { user: { select: { name: true } } },
  });

  return profiles.map((p, i) => ({
    rank: i + 1,
    name: p.user.name,
    xp: p.xp,
    currentStreak: p.currentStreak,
  }));
}
