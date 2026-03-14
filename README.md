# TCWG — The Game

A Next.js repair-shop game with a Pokémon-style top-down room, leaderboard (SQLite or Supabase), and animated UI.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **WASD** or **arrow keys** to move, **SPACE** to pick up/place at the orange counter and at the workbench (hold to repair), then walk to the customer on the right to return the PC.

## Production build

```bash
npm run build
npm start
```

**Note:** With Next.js 15.x you may see a prerender error for the built-in 404 page. The app runs correctly with `npm run dev`. If the build fails, try upgrading Next.js (`npm install next@latest`) or run in development mode.

## Leaderboard

- **Default:** Scores are stored in a local SQLite file at `./data/leaderboard.sqlite` (created on first use). No env vars needed.
- **Supabase:** Set in `.env.local`:
  - `LEADERBOARD_BACKEND=supabase`
  - `NEXT_PUBLIC_SUPABASE_URL=...`
  - `SUPABASE_SERVICE_ROLE_KEY=...` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
  - Create a `scores` table with columns: `id` (uuid), `player_name` (text), `score` (int), `avg_stars` (int), `created_at` (timestamptz).

The API and UI are unchanged when switching backends.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion
- Game: canvas + top-down tile grid; logic in `game/engine.ts`, drawing in `game/draw.ts`
- Leaderboard: adapter in `lib/leaderboard/` (SQLite + optional Supabase)
