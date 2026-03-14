import type { LeaderboardAdapter } from "./adapter";
import type { LeaderboardEntry, InsertScoreInput } from "./types";

export async function createSupabaseAdapter(): Promise<LeaderboardAdapter> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase env NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) required");
  }
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key);

  return {
    async getTopScores(limit: number): Promise<LeaderboardEntry[]> {
      const { data, error } = await supabase
        .from("scores")
        .select("id, player_name, score, avg_stars, created_at")
        .order("score", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((r: { id: string; player_name: string; score: number; avg_stars: number; created_at: string }) => ({
        id: r.id,
        player_name: r.player_name,
        score: r.score,
        avg_stars: r.avg_stars,
        created_at: r.created_at,
      }));
    },

    async insertScore(entry: InsertScoreInput): Promise<void> {
      const name = entry.name.slice(0, 12).toUpperCase();
      const { error } = await supabase.from("scores").insert({
        id: crypto.randomUUID(),
        player_name: name,
        score: entry.score,
        avg_stars: entry.stars,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
  };
}
