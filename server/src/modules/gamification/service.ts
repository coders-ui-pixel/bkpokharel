import { db } from "../../config/db";
import { BADGES } from "./badges";

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

async function getOrCreateProfile(userId: number) {
  const existing = await db
    .selectFrom("gamificationProfiles")
    .selectAll()
    .where("userId", "=", userId)
    .executeTakeFirst();
  if (existing) return existing;

  try {
    await db.insertInto("gamificationProfiles").values({ userId, updatedAt: new Date() }).execute();
  } catch {
    // Duplicate-key race: another concurrent call already created the profile.
  }
  return db
    .selectFrom("gamificationProfiles")
    .selectAll()
    .where("userId", "=", userId)
    .executeTakeFirstOrThrow();
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

  await db
    .updateTable("gamificationProfiles")
    .set({
      xp: profile.xp + xpAmount,
      coins: profile.coins + Math.round(xpAmount / 2),
      currentStreak: nextStreak,
      longestStreak: Math.max(profile.longestStreak, nextStreak),
      lastActivityDate: today,
      updatedAt: new Date(),
    })
    .where("userId", "=", userId)
    .execute();
  const updated = await db
    .selectFrom("gamificationProfiles")
    .selectAll()
    .where("userId", "=", userId)
    .executeTakeFirstOrThrow();

  const earned = await db
    .selectFrom("userBadges")
    .select(["badgeKey"])
    .where("userId", "=", userId)
    .execute();
  const earnedKeys = new Set(earned.map((b) => b.badgeKey));
  const toAward = BADGES.filter((b) => !earnedKeys.has(b.key) && b.check(updated));

  if (toAward.length > 0) {
    await db
      .insertInto("userBadges")
      .values(toAward.map((b) => ({ userId, badgeKey: b.key })))
      .execute();
  }

  return {
    profile: updated,
    newBadges: toAward.map((b) => ({ key: b.key, label: b.label, description: b.description, icon: b.icon })),
  };
}

export async function getProfile(userId: number) {
  const profile = await getOrCreateProfile(userId);
  const earned = await db.selectFrom("userBadges").selectAll().where("userId", "=", userId).execute();
  const earnedByKey = new Map(earned.map((b) => [b.badgeKey, b.earnedAt]));
  const higherRanked = await db
    .selectFrom("gamificationProfiles")
    .select((eb) => eb.fn.countAll().as("count"))
    .where("xp", ">", profile.xp)
    .executeTakeFirstOrThrow();

  return {
    xp: profile.xp,
    coins: profile.coins,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    lastActivityDate: profile.lastActivityDate,
    rank: Number(higherRanked.count) + 1,
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
  const profiles = await db
    .selectFrom("gamificationProfiles")
    .innerJoin("users", "users.id", "gamificationProfiles.userId")
    .select(["gamificationProfiles.xp", "gamificationProfiles.currentStreak", "users.name"])
    .orderBy("gamificationProfiles.xp", "desc")
    .limit(limit)
    .execute();

  return profiles.map((p, i) => ({
    rank: i + 1,
    name: p.name,
    xp: p.xp,
    currentStreak: p.currentStreak,
  }));
}
