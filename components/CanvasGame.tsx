"use client";

import { useRef, useEffect } from "react";
import {
  initGame,
  startGame,
  tick,
  getPublicState,
  getPlayer,
  getRainT,
} from "@/game/engine";
import { draw } from "@/game/draw";
import type { GameOverSummary } from "@/game/types";

interface CanvasGameProps {
  playerName: string | null;
  onGameOver: (summary: GameOverSummary) => void;
  onStateChange: (state: ReturnType<typeof getPublicState>) => void;
}

export function CanvasGame({
  playerName,
  onGameOver,
  onStateChange,
}: CanvasGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const startedRef = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    initGame({ onGameOver });
  }, [onGameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || playerName === null) return;

    if (!startedRef.current) {
      startedRef.current = true;
      startGame(playerName);
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = (ts: number) => {
      const result = tick(keysRef.current, ts);
      const state = getPublicState();
      onStateChange(state);

      if (!result.active) {
        rafRef.current = 0;
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      draw(ctx, width, height, state, getPlayer(), getRainT());
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playerName, onStateChange]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
        e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
