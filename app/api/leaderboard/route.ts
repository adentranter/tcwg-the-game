import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/leaderboard";

export async function GET() {
  try {
    const leaderboard = await getLeaderboard();
    const entries = await leaderboard.getTopScores(10);
    return NextResponse.json(entries);
  } catch (e) {
    console.error("Leaderboard GET error:", e);
    return NextResponse.json(
      { error: "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const score = typeof body.score === "number" ? body.score : Number(body.score);
    const stars = typeof body.stars === "number" ? body.stars : Number(body.stars);
    if (!name || score < 0 || !Number.isFinite(score) || !Number.isFinite(stars) || stars < 0 || stars > 5) {
      return NextResponse.json(
        { error: "Invalid name, score, or stars" },
        { status: 400 }
      );
    }
    const leaderboard = await getLeaderboard();
    await leaderboard.insertScore({
      name: name.slice(0, 12),
      score: Math.floor(score),
      stars: Math.min(5, Math.max(0, Math.floor(stars))),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Leaderboard POST error:", e);
    return NextResponse.json(
      { error: "Failed to save score" },
      { status: 500 }
    );
  }
}
