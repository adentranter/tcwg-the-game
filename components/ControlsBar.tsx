"use client";

export function ControlsBar() {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/90 py-2 px-4 flex gap-6 justify-center text-[9px] text-[#333] pointer-events-none z-10 font-[family-name:var(--font-share)]">
      <span><b className="text-[#555]">WASD / ARROWS</b> move</span>
      <span><b className="text-[#555]">SPACE</b> pick up at orange counter</span>
      <span><b className="text-[#555]">HOLD SPACE</b> at bench to repair</span>
      <span><b className="text-[#555]">Walk to customer</b> to return PC</span>
    </div>
  );
}
