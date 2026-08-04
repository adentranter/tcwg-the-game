# TCWG — The Game

A short arcade shift sim for **The Computer Workshop Group**. You are a tech in a repair shop: take PCs from customers, place them on the workbench (auto-repair — queue more for help from other techs), return them, beat the 60s timer, and chase the leaderboard.

## Run locally

```bash
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Controls:** **WASD** / **arrows** to move · **SPACE** to take a PC at the orange counter, place it on the workbench, or pick up a finished job · walk to the customer on the green/right side to return it. Repairs run automatically on the bench.

## Production build

```bash
pnpm run build
pnpm start
```

**Note:** The build script forces `NODE_ENV=production`. If your shell exports `NODE_ENV=development`, Next 15 can fail prerendering `/404` with a misleading `<Html>` import error.

## Leaderboard

- **Development:** Scores stay in memory for the process lifetime (avoids native `better-sqlite3` friction during local work). They reset when you restart the dev server.
- **Production default:** Local SQLite at `./data/leaderboard.sqlite` (created on first use). No env vars needed.
- **Supabase:** Set in `.env.local`:
  - `LEADERBOARD_BACKEND=supabase`
  - `NEXT_PUBLIC_SUPABASE_URL=...`
  - `SUPABASE_SERVICE_ROLE_KEY=...` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
  - Create a `scores` table with columns: `id` (uuid), `player_name` (text), `score` (int), `avg_stars` (int), `created_at` (timestamptz).

The API and UI are unchanged when switching backends.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion
- Game view: React Three Fiber + Drei + Three.js (isometric orthographic shop)
- Logic in `game/engine.ts` and tile map in `game/map.ts`
- Leaderboard adapter in `lib/leaderboard/` (memory in dev, SQLite or Supabase otherwise)
- Kenney CC0 décor GLBs under `public/models/` (floors/walls stay procedural)
