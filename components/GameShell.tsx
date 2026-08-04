"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreeGame } from "./ThreeGame";
import { Hud } from "./Hud";
import { ControlsBar } from "./ControlsBar";
import { StartScreen } from "./StartScreen";
import { GameOverScreen } from "./GameOverScreen";
import type { GameOverSummary, GamePublicState, TutorialStep } from "@/game/types";

type Mode = "attract" | "playing" | "gameOver";

const TUTORIAL_COPY: Record<TutorialStep, string> = {
  find_customer: "A customer's here with a broken PC — walk over and press SPACE to take it",
  bring_to_bench: "Carry it to the workbench and press SPACE to start the repair",
  watch_repair: "Watch the progress bar — repairs go faster with more PCs on the bench",
  grab_ready: "It's fixed! Walk up to the bench to grab it — no button needed",
  return_to_customer: "Walk it back to the customer to get paid",
};

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

  const repairingPc =
    gameState?.bench?.find((c) => c.benchState === "repairing") ?? null;
  const repairState = Boolean(gameState?.isRepairing && repairingPc);

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
            {gameState?.tutorialStep && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/95 border border-[#333] rounded px-4 py-1.5 text-[10px] text-[#ccc] whitespace-nowrap pointer-events-none z-10 font-[family-name:var(--font-share)]">
                {TUTORIAL_COPY[gameState.tutorialStep]}
              </div>
            )}
            <div className="flex-1 relative min-h-0">
              <ThreeGame
                playerName={playerName}
                onGameOver={handleGameOver}
                onStateChange={setGameState}
              />
            </div>

            {repairState && repairingPc && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/97 border border-[#2a2a2a] rounded px-5 py-2 min-w-[260px] text-center z-10">
                <div className="text-[9px] text-[#999] tracking-widest mb-1">
                  REPAIRING — {Math.floor((gameState?.repairProgress ?? 0) * 100)}%
                  {(gameState?.bench?.length ?? 0) > 0
                    ? ` · ${gameState!.bench.length}/22 on bench`
                    : ""}
                </div>
                <div className="h-2 bg-[#181818] rounded overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[var(--tcwg-red)] to-[#ff7a5c] rounded"
                    initial={false}
                    animate={{ width: `${(gameState?.repairProgress ?? 0) * 100}%` }}
                    transition={{ type: "tween", duration: 0.08 }}
                  />
                </div>
                <div className="font-[family-name:var(--font-orbitron)] text-[8px] text-[var(--tcwg-red)]/70 mt-1">
                  #{repairingPc.ticket} — {repairingPc.name}
                  {repairingPc.pcIssue ? ` · ${repairingPc.pcIssue}` : ""}
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
