"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Leaderboard } from "./Leaderboard";

interface StartScreenProps {
  onStart: (playerName: string) => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [name, setName] = useState("TECH");

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-[100] bg-black/97"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="font-[family-name:var(--font-orbitron)] text-4xl font-black text-[var(--tcwg-orange)] tracking-wider mb-0.5 drop-shadow-[0_0_36px_rgba(232,114,42,0.33)]"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        TCWG
      </motion.div>
      <motion.div
        className="font-[family-name:var(--font-orbitron)] text-[9px] text-[#2a2a2a] tracking-[0.35em] mb-9"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        THE COMPUTER WORKSHOP GROUP — THE GAME
      </motion.div>

      <Leaderboard />

      <motion.div
        className="flex gap-2 items-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <input
          className="bg-[#0c0c0c] border border-[#1e1e1e] text-[var(--tcwg-orange)] font-[family-name:var(--font-share)] text-sm px-3 py-2 outline-none w-[170px] uppercase"
          type="text"
          maxLength={10}
          placeholder="YOUR NAME"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="font-[family-name:var(--font-orbitron)] text-xs font-bold tracking-wider border border-[var(--tcwg-orange)] text-[var(--tcwg-orange)] px-10 py-3 cursor-pointer transition-colors hover:bg-[var(--tcwg-orange)]/10"
          onClick={() => onStart(name)}
        >
          START
        </button>
      </motion.div>

      <div className="text-[9px] text-[#252525] text-center leading-relaxed max-w-md">
        <b className="text-[#444]">①</b> Walk to orange counter · SPACE to take PC
        <br />
        <b className="text-[#444]">②</b> Carry to workbench · hold SPACE to repair (0.1–0.9s)
        <br />
        <b className="text-[#444]">③</b> Walk to customer on right side · auto hand back
        <br />
        Each job earns $80–$320
      </div>
    </motion.div>
  );
}
