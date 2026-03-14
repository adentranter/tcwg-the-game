import type { LeaderboardEntry, InsertScoreInput } from "./types";

export interface LeaderboardAdapter {
  getTopScores(limit: number): Promise<LeaderboardEntry[]>;
  insertScore(entry: InsertScoreInput): Promise<void>;
}
