"use client";

import { motion } from "framer-motion";
import type { GameOverSummary } from "@/game/types";

interface GameOverScreenProps {
  summary: GameOverSummary;
  onPlayAgain: () => void;
}

export function GameOverScreen({ summary, onPlayAgain }: GameOverScreenProps) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-[100] bg-black/97"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="font-[family-name:var(--font-orbitron)] text-3xl font-black text-[var(--tcwg-red)] mb-1"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        SHIFT COMPLETE
      </motion.div>
      <motion.div
        className="font-[family-name:var(--font-orbitron)] text-5xl font-black text-white my-2"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        ${summary.score}
      </motion.div>
      <motion.div
        className="text-2xl mb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {"★".repeat(summary.avgStars)}
        {"☆".repeat(5 - summary.avgStars)}
      </motion.div>
      <div className="font-[family-name:var(--font-orbitron)] text-[9px] text-[#888] tracking-wider mb-5">
        CUSTOMER REVIEWS
      </div>

      <div className="w-[380px] max-h-[190px] overflow-y-auto mb-4 space-y-1">
        {summary.reviews.length === 0 ? (
          <div className="text-[#888] text-[10px] text-center py-3">
            No repairs completed.
          </div>
        ) : (
          summary.reviews.map((r, i) => (
            <motion.div
              key={`${r.ticket}-${i}`}
              className="bg-[#0c0c0c] border border-[#1a1a1a] rounded p-2 flex gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{ background: `${r.color}22`, color: r.color }}
              >
                {r.name[0]}
              </div>
              <div>
                <div className="text-[9px] text-[#ccd] mb-0.5">
                  {r.name} <span className="text-[#777] text-[7px]">#{r.ticket}</span>
                </div>
                <div className="text-[8px] text-[#f0b429] mb-0.5">
                  {"★".repeat(r.stars)}
                  {"☆".repeat(5 - r.stars)}
                </div>
                <div className="text-[8px] text-[#999] leading-snug">{r.text}</div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <motion.button
        className="font-[family-name:var(--font-orbitron)] text-xs font-bold tracking-wider border border-[var(--tcwg-red)] text-[var(--tcwg-red)] px-10 py-3 cursor-pointer transition-colors hover:bg-[var(--tcwg-red)]/10"
        onClick={onPlayAgain}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        PLAY AGAIN
      </motion.button>
    </motion.div>
  );
}
