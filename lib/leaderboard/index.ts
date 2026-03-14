import type { LeaderboardAdapter } from "./adapter";
import type { LeaderboardEntry, InsertScoreInput } from "./types";

let adapterPromise: Promise<LeaderboardAdapter> | null = null;

// Simple in-memory adapter used in development to avoid native better-sqlite3 issues.
function createMemoryAdapter(): LeaderboardAdapter {
  const scores: LeaderboardEntry[] = [];
  return {
    async getTopScores(limit: number): Promise<LeaderboardEntry[]> {
      return scores
        .slice()
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return b.created_at.localeCompare(a.created_at);
        })
        .slice(0, limit);
    },
    async insertScore(entry: InsertScoreInput): Promise<void> {
      const now = new Date().toISOString();
      scores.push({
        id: crypto.randomUUID(),
        player_name: entry.name.slice(0, 12).toUpperCase(),
        score: entry.score,
        avg_stars: entry.stars,
        created_at: now,
      });
    },
  };
}

function getAdapter(): Promise<LeaderboardAdapter> {
  if (adapterPromise) return adapterPromise;

  if (process.env.NODE_ENV === "development") {
    adapterPromise = Promise.resolve(createMemoryAdapter());
    return adapterPromise;
  }

  if (process.env.LEADERBOARD_BACKEND === "supabase") {
    adapterPromise = import("./supabase").then((m) => m.createSupabaseAdapter());
    return adapterPromise;
  }

  // Default to SQLite in non-development environments, using a dynamic import
  // so better-sqlite3 is only loaded when actually needed.
  adapterPromise = import("./sqlite").then((m) => m.sqliteAdapter);
  return adapterPromise;
}

export async function getLeaderboard(): Promise<LeaderboardAdapter> {
  return getAdapter();
}

export type { LeaderboardEntry, InsertScoreInput } from "./types";
