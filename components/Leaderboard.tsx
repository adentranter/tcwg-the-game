"use client";

import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "@/lib/leaderboard";

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/leaderboard")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setEntries(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? "Error loading leaderboard");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-[#0c0c0c] border border-[#1e1e1e] rounded w-[340px] p-4">
        <div className="font-[family-name:var(--font-orbitron)] text-[9px] text-[var(--tcwg-red)] tracking-[0.2em] mb-2">
          LEADERBOARD
        </div>
        <div className="text-[#777] text-[10px] py-2">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0c0c0c] border border-[#1e1e1e] rounded w-[340px] p-4">
        <div className="font-[family-name:var(--font-orbitron)] text-[9px] text-[var(--tcwg-red)] tracking-[0.2em] mb-2">
          LEADERBOARD
        </div>
        <div className="text-[#999] text-[10px] py-2">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#0c0c0c] border border-[#1e1e1e] rounded w-[340px] p-4 mb-6">
      <div className="font-[family-name:var(--font-orbitron)] text-[9px] text-[var(--tcwg-red)] tracking-[0.2em] mb-2">
        LEADERBOARD
      </div>
      {entries.length === 0 ? (
        <div className="text-[#777] text-[10px] text-center py-2">
          No scores yet.
        </div>
      ) : (
        <div className="space-y-0">
          {entries.slice(0, 7).map((r, i) => (
            <div
              key={r.id}
              className="flex justify-between items-center py-1 border-b border-[#161616] text-[10px] last:border-b-0"
            >
              <span className="text-[#777] w-6">{i + 1}</span>
              <span className="text-[#ccc] flex-1">{r.player_name}</span>
              <span className="text-[#f0b429] text-[9px]">
                {"★".repeat(r.avg_stars)}
                {"☆".repeat(5 - r.avg_stars)}
              </span>
              <span className="font-[family-name:var(--font-orbitron)] text-[11px] text-[var(--tcwg-red)]">
                ${r.score}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
