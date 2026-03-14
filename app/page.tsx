import { GameShell } from "@/components/GameShell";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="w-full h-screen flex items-center justify-center">
      <GameShell />
    </main>
  );
}
