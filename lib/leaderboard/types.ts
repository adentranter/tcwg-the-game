export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  avg_stars: number;
  created_at: string;
}

export interface InsertScoreInput {
  name: string;
  score: number;
  stars: number;
}
