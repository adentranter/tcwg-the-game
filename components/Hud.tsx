"use client";

interface HudProps {
  score: number;
  timeLeft: number;
}

export function Hud({ score, timeLeft }: HudProps) {
  const urgent = timeLeft < 15;
  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-2 bg-gradient-to-b from-black/85 to-transparent pointer-events-none z-10">
      <div className="bg-black/95 border border-[#222] rounded px-3 py-1 font-[family-name:var(--font-orbitron)] text-[10px] text-[#444] tracking-widest">
        EARNED <span className="text-[var(--tcwg-orange)] text-[13px]">${score}</span>
      </div>
      <div className="font-[family-name:var(--font-orbitron)] text-[9px] text-[#555] tracking-[0.2em]">
        THE COMPUTER WORKSHOP GROUP
      </div>
      <div
        className={`bg-black/95 border border-[#222] rounded px-3 py-1 font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest ${
          urgent ? "text-red-500 animate-pulse" : "text-[#444]"
        }`}
      >
        TIME <span className="text-[var(--tcwg-orange)] text-[13px]">{Math.ceil(timeLeft)}</span>s
      </div>
    </div>
  );
}
