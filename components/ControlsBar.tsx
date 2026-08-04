"use client";

export function ControlsBar() {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/90 py-2 px-4 flex gap-6 justify-center text-[9px] text-[#888] pointer-events-none z-10 font-[family-name:var(--font-share)]">
      <span><b className="text-[#ccc]">WASD / ARROWS</b> move</span>
      <span><b className="text-[#ccc]">SPACE</b> take PC from customer / place on bench</span>
      <span><b className="text-[#ccc]">Bench</b> auto-repairs (more PCs = faster) — walk up to grab it when done</span>
      <span><b className="text-[#ccc]">Walk to customer</b> to return PC</span>
    </div>
  );
}
