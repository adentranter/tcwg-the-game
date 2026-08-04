import { TileType, type TileTypeId } from "./types";

const T = TileType;
const GW = 26;
const GH = 20;

const WALK = new Set<TileTypeId>([T.FL, T.WT, T.PW, T.EX, T.GP]);

/** Zone: player can only walk in TECHBAY and UTILITY; DESK/BENCH are other techs' areas */
export type ZoneId = "techbay" | "utility" | "desk" | "bench" | null;

const MAP: TileTypeId[][] = [];
const ZONE: ZoneId[][] = [];

function fill(x1: number, y1: number, x2: number, y2: number, v: TileTypeId): void {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++) MAP[y][x] = v;
}
function zoneFill(x1: number, y1: number, x2: number, y2: number, z: ZoneId): void {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++) ZONE[y][x] = z;
}

// Initialize all outside
for (let y = 0; y < GH; y++) {
  MAP[y] = [];
  ZONE[y] = [];
  for (let x = 0; x < GW; x++) {
    MAP[y][x] = T.OUT;
    ZONE[y][x] = null;
  }
}

// ── Building shell ────────────────────────────────────────────────────────────
fill(2, 2, 23, 16, T.WL);    // outer walls (top y=2, bottom y=16, sides x=2/23)
fill(3, 3, 22, 15, T.FL);    // interior floor

// ── Back bench row (B2) ───────────────────────────────────────────────────────
fill(3, 3, 22, 3, T.B2);     // full-width back bench along top wall

// ── Main workbench (B1) – centred in tech space ───────────────────────────────
fill(10, 4, 13, 7, T.B1);    // 4-wide × 4-tall workbench
fill(10, 8, 13, 8, T.GP);    // walkable gap at bench base (approach from south)

// ── Sink / utility corner ─────────────────────────────────────────────────────
MAP[5][3] = T.SK;
MAP[6][3] = T.SK;

// ── Diagnostic rack ───────────────────────────────────────────────────────────
MAP[4][21] = T.DG;
MAP[5][21] = T.DG;
MAP[6][21] = T.DG;

// ── NPC side-bench (other techs' area, right wall) ────────────────────────────
fill(20, 8, 21, 11, T.B2);

// ── Drop-off counter (orange) ─────────────────────────────────────────────────
fill(3, 13, 11, 13, T.DO);

// ── Pickup counter (green) ────────────────────────────────────────────────────
fill(13, 13, 22, 13, T.PU);

// ── Customer waiting zones ────────────────────────────────────────────────────
fill(3, 14, 11, 15, T.WT);   // drop-off wait (left)
fill(13, 14, 22, 15, T.PW);  // pickup wait (right)

// ── Exit ─────────────────────────────────────────────────────────────────────
MAP[16][11] = T.EX;           // through bottom wall
MAP[16][12] = T.EX;
MAP[17][11] = T.EX;           // outside path
MAP[17][12] = T.EX;

// ── Windows ──────────────────────────────────────────────────────────────────
[5, 9, 13, 17, 21].forEach((x) => (MAP[2][x] = T.WIN));  // top wall
[6, 10].forEach((y) => (MAP[y][2] = T.WIN));              // left wall
[6, 10].forEach((y) => (MAP[y][23] = T.WIN));             // right wall

// ── Doors (side customer entrances) ──────────────────────────────────────────
MAP[14][2] = T.DR;
MAP[14][23] = T.DR;

/** Customers spawn/walk in here (drop-off side) and walk out through it if they give up waiting */
export const DOOR_WEST = { x: 2.5, y: 14.5 };
/** Customers walk out through here once their PC is handed back (pickup side) */
export const DOOR_EAST = { x: 23.5, y: 14.5 };

// ── Zone assignment ───────────────────────────────────────────────────────────
// Default: every non-structure interior cell → techbay
for (let y = 0; y < GH; y++) {
  for (let x = 0; x < GW; x++) {
    const cell = MAP[y][x];
    if (cell !== T.OUT && cell !== T.WL && cell !== T.WIN && cell !== T.DR) {
      ZONE[y][x] = "techbay";
    }
  }
}
// NPC-only areas (player blocked)
zoneFill(17, 3, 22, 6, "desk");    // back-right desk
zoneFill(19, 8, 21, 11, "bench");  // right-side NPC bench
// Utility area (player can enter)
zoneFill(3, 4, 5, 9, "utility");

// ── Exports ───────────────────────────────────────────────────────────────────
export const MAP_WIDTH = GW;
export const MAP_HEIGHT = GH;

// ── Exterior geometry (shared by ShopFront/FrontStrip rendering and the
//    engine's customer-car spawn/walk-in logic, so both stay in sync) ─────────
/** World-z of the road centre — 2 tiles beyond the south edge of the map */
export const STRIP_Z = MAP_HEIGHT / 2 + 2;
/** World-z of the pavement strip where customer cars park, between the shop and the sidewalk */
export const PAVEMENT_Z = STRIP_Z - 2.5;
/** World-x of each of the 3 customer parking bays outside the south wall */
export const CAR_BAY_X = [-4, 3.5, 7] as const;
export const CAR_BAY_Z = [PAVEMENT_Z, PAVEMENT_Z - 0.2, PAVEMENT_Z + 0.3] as const;

/** Converts a ShopFront/FrontStrip world-space x/z into the map's tile-space coordinates */
export function worldToTile(wx: number, wz: number): { x: number; y: number } {
  return { x: wx + MAP_WIDTH / 2, y: wz + MAP_HEIGHT / 2 };
}

/**
 * Waypoints (tile-space) a customer walks through between their parked car
 * and the drop-off waiting counter, routed through the south doorway (the
 * EX gap at MAP[16][11-12]/MAP[17][11-12]) that opens onto the parking lot.
 */
export const SOUTH_ENTRY_OUTSIDE = { x: 11.5, y: 17.5 };
export const SOUTH_ENTRY_INSIDE = { x: 11.5, y: 15.5 };

export function cellAt(x: number, y: number): TileTypeId {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  if (ix < 0 || iy < 0 || ix >= GW || iy >= GH) return T.WL;
  return MAP[iy][ix];
}

export function zoneAt(x: number, y: number): ZoneId {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  if (ix < 0 || iy < 0 || ix >= GW || iy >= GH) return null;
  return ZONE[iy][ix];
}

/** Player (techbay tech) can only walk in techbay and utility */
export function canWalk(x: number, y: number): boolean {
  if (!WALK.has(cellAt(x, y))) return false;
  const z = zoneAt(x, y);
  return z === "techbay" || z === "utility";
}

/** Radius-aware walk check: all four corners of player bounding box must be walkable */
export function canWalkR(x: number, y: number, r = 0.28): boolean {
  return (
    canWalk(x - r, y - r) &&
    canWalk(x + r, y - r) &&
    canWalk(x - r, y + r) &&
    canWalk(x + r, y + r)
  );
}

export function getMap(): TileTypeId[][] {
  return MAP;
}

// ── Cell lists for interaction zones ─────────────────────────────────────────
export const B1_CELLS: { x: number; y: number }[] = [];
const WTC: { x: number; y: number }[] = [];
const PWC: { x: number; y: number }[] = [];

for (let y = 0; y < GH; y++) {
  for (let x = 0; x < GW; x++) {
    const c = MAP[y][x];
    if (c === T.B1 || c === T.GP) B1_CELLS.push({ x, y });
    if (c === T.WT) WTC.push({ x, y });
    if (c === T.PW) PWC.push({ x, y });
  }
}

export interface SlotRef {
  x: number;
  y: number;
  taken: boolean;
}

// Slots at y=14 — first row of waiting zones, directly against the counters
export const WSLOTS: SlotRef[] = WTC.filter((c) => c.y === 14).map((c) => ({
  x: c.x + 0.5,
  y: c.y + 0.5,
  taken: false,
}));

export const PWSLOTS: SlotRef[] = PWC.filter((c) => c.y === 14).map((c) => ({
  x: c.x + 0.5,
  y: c.y + 0.5,
  taken: false,
}));

export function freeWSlot(): SlotRef | undefined {
  return WSLOTS.find((s) => !s.taken);
}

export function freePWSlot(): SlotRef | undefined {
  return PWSLOTS.find((s) => !s.taken);
}

export function nearCells(
  cells: { x: number; y: number }[],
  px: number,
  py: number,
  r: number
): boolean {
  return cells.some(
    (c) => Math.hypot(px - (c.x + 0.5), py - (c.y + 0.5)) < r
  );
}

export function d2(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
