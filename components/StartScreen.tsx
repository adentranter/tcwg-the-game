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
        className="font-[family-name:var(--font-orbitron)] text-4xl font-black text-[var(--tcwg-red)] tracking-wider mb-0.5 drop-shadow-[0_0_36px_rgba(216,56,44,0.4)]"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        TCWG
      </motion.div>
      <motion.div
        className="font-[family-name:var(--font-orbitron)] text-[9px] text-[#8a8a8a] tracking-[0.35em] mb-9"
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
          className="bg-[#0c0c0c] border border-[#1e1e1e] text-[var(--tcwg-red)] font-[family-name:var(--font-share)] text-sm px-3 py-2 outline-none w-[170px] uppercase"
          type="text"
          maxLength={10}
          placeholder="YOUR NAME"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="font-[family-name:var(--font-orbitron)] text-xs font-bold tracking-wider border border-[var(--tcwg-red)] text-[var(--tcwg-red)] px-10 py-3 cursor-pointer transition-colors hover:bg-[var(--tcwg-red)]/10"
          onClick={() => onStart(name)}
        >
          START
        </button>
      </motion.div>

      <div className="text-[9px] text-[#7a7a7a] text-center leading-relaxed max-w-md">
        <b className="text-[#aaa]">①</b> Walk to orange counter · SPACE to take PC
        <br />
        <b className="text-[#aaa]">②</b> Carry to workbench · SPACE to place · auto-repairs
        <br />
        <b className="text-[#aaa]">③</b> SPACE to pick up · walk to customer on right to return
        <br />
        Queue more PCs — other techs help. Each job earns $80–$320
      </div>
    </motion.div>
  );
}
