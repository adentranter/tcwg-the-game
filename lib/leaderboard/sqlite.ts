import type { LeaderboardAdapter } from "./adapter";
import type { LeaderboardEntry, InsertScoreInput } from "./types";
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "leaderboard.sqlite");

function getDb(): Database.Database {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS scores (
      id TEXT PRIMARY KEY,
      player_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      avg_stars INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  return db;
}

export const sqliteAdapter: LeaderboardAdapter = {
  async getTopScores(limit: number): Promise<LeaderboardEntry[]> {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT id, player_name, score, avg_stars, created_at FROM scores ORDER BY score DESC, created_at DESC LIMIT ?`
      )
      .all(limit) as { id: string; player_name: string; score: number; avg_stars: number; created_at: string }[];
    db.close();
    return rows.map((r) => ({
      id: r.id,
      player_name: r.player_name,
      score: r.score,
      avg_stars: r.avg_stars,
      created_at: r.created_at,
    }));
  },

  async insertScore(entry: InsertScoreInput): Promise<void> {
    const db = getDb();
    const id = crypto.randomUUID();
    const name = entry.name.slice(0, 12).toUpperCase();
    const created_at = new Date().toISOString();
    db.prepare(
      `INSERT INTO scores (id, player_name, score, avg_stars, created_at) VALUES (?, ?, ?, ?, ?)`
    ).run(id, name, entry.score, entry.stars, created_at);
    db.close();
  },
};
