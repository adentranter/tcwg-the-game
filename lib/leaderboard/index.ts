import type { LeaderboardAdapter } from "./adapter";
import { sqliteAdapter } from "./sqlite";

let adapterPromise: Promise<LeaderboardAdapter> | null = null;

function getAdapter(): Promise<LeaderboardAdapter> {
  if (adapterPromise) return adapterPromise;
  adapterPromise =
    process.env.LEADERBOARD_BACKEND === "supabase"
      ? import("./supabase").then((m) => m.createSupabaseAdapter())
      : Promise.resolve(sqliteAdapter);
  return adapterPromise;
}

export async function getLeaderboard(): Promise<LeaderboardAdapter> {
  return getAdapter();
}

export type { LeaderboardEntry, InsertScoreInput } from "./types";
