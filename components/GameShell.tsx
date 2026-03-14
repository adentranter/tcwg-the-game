"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreeGame } from "./ThreeGame";
import { Hud } from "./Hud";
import { ControlsBar } from "./ControlsBar";
import { StartScreen } from "./StartScreen";
import { GameOverScreen } from "./GameOverScreen";
import type { GameOverSummary } from "@/game/types";
import type { GamePublicState } from "@/game/types";

type Mode = "attract" | "playing" | "gameOver";

export function GameShell() {
  const [mode, setMode] = useState<Mode>("attract");
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [gameOverSummary, setGameOverSummary] = useState<GameOverSummary | null>(null);
  const [gameState, setGameState] = useState<GamePublicState | null>(null);

  const handleStart = useCallback((name: string) => {
    setPlayerName(name);
    setGameOverSummary(null);
    setMode("playing");
  }, []);

  const handleGameOver = useCallback((summary: GameOverSummary) => {
    setGameOverSummary(summary);
    setMode("gameOver");
    fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: summary.playerName,
        score: summary.score,
        stars: summary.avgStars,
      }),
    }).catch(() => {});
  }, []);

  const handlePlayAgain = useCallback(() => {
    setMode("attract");
    setPlayerName(null);
    setGameOverSummary(null);
    setGameState(null);
  }, []);

  const repairState = gameState?.isRepairing && gameState?.carried && gameState.carried.benchState !== "done";

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        {mode === "attract" && (
          <StartScreen key="start" onStart={handleStart} />
        )}
        {mode === "playing" && (
          <motion.div
            key="playing"
            className="absolute inset-0 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Hud
              score={gameState?.score ?? 0}
              timeLeft={gameState?.timeLeft ?? 60}
            />
            <div className="flex-1 relative min-h-0">
              <ThreeGame
                playerName={playerName}
                onGameOver={handleGameOver}
                onStateChange={setGameState}
              />
            </div>

            {repairState && gameState?.carried && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/97 border border-[#2a2a2a] rounded px-5 py-2 min-w-[260px] text-center z-10">
                <div className="text-[9px] text-[#555] tracking-widest mb-1">
                  HOLD SPACE — {100 - Math.floor((gameState.repairProgress ?? 0) * 100)}% remaining
                </div>
                <div className="h-2 bg-[#181818] rounded overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[var(--tcwg-orange)] to-[#ffaa44] rounded"
                    initial={false}
                    animate={{ width: `${(gameState.repairProgress ?? 0) * 100}%` }}
                    transition={{ type: "tween", duration: 0.08 }}
                  />
                </div>
                <div className="font-[family-name:var(--font-orbitron)] text-[8px] text-[var(--tcwg-orange)]/40 mt-1">
                  #{gameState.carried.ticket} — {gameState.carried.name} ({gameState.carried.repairTime?.toFixed(1)}s)
                </div>
              </div>
            )}

            {gameState?.hint?.message && !repairState && (
              <div
                className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/92 border rounded px-4 py-1.5 text-[10px] whitespace-nowrap pointer-events-none z-10"
                style={{
                  borderColor: `${gameState.hint.color}55`,
                  color: gameState.hint.color,
                }}
              >
                {gameState.hint.message}
              </div>
            )}

            <ControlsBar />
          </motion.div>
        )}
        {mode === "gameOver" && gameOverSummary && (
          <GameOverScreen
            key="gameover"
            summary={gameOverSummary}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
