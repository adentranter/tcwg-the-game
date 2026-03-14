import { TileType, type TileTypeId } from "./types";

const T = TileType;
const GW = 20;
const GH = 17;

const WALK = new Set<TileTypeId>([T.FL, T.WT, T.PW, T.EX, T.GP]);

const MAP: TileTypeId[][] = [];
function fill(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  v: TileTypeId
): void {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++) MAP[y][x] = v;
}

// Initialize all outside
for (let y = 0; y < GH; y++) {
  MAP[y] = [];
  for (let x = 0; x < GW; x++) MAP[y][x] = T.OUT;
}

// Building shell
fill(3, 3, 16, 15, T.WL);
fill(4, 4, 15, 14, T.FL);

// B2 corner bench
fill(4, 4, 15, 5, T.B2);

// B1 main workbench
fill(9, 5, 10, 11, T.B1);
MAP[11][9] = T.GP;
MAP[11][10] = T.GP;

// Sink
MAP[7][4] = T.SK;
MAP[8][4] = T.SK;

// Counters
fill(4, 13, 9, 13, T.DO);
fill(10, 13, 15, 13, T.PU);

// Customer zones
fill(4, 14, 7, 15, T.WT);
fill(11, 14, 15, 15, T.PW);

// Diag racks
MAP[7][15] = T.DG;
MAP[8][15] = T.DG;

// Exit
MAP[16][9] = T.EX;
MAP[16][10] = T.EX;

// Windows and doors
[5, 8, 11, 14].forEach((x) => (MAP[3][x] = T.WIN));
[6, 10].forEach((y) => (MAP[y][3] = T.WIN));
[6, 10].forEach((y) => (MAP[y][16] = T.WIN));
MAP[14][3] = T.DR;
MAP[14][16] = T.DR;

export const MAP_WIDTH = GW;
export const MAP_HEIGHT = GH;

export function cellAt(x: number, y: number): TileTypeId {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  if (ix < 0 || iy < 0 || ix >= GW || iy >= GH) return T.WL;
  return MAP[iy][ix];
}

export function canWalk(x: number, y: number): boolean {
  return WALK.has(cellAt(x, y));
}

export function getMap(): TileTypeId[][] {
  return MAP;
}

// Cell lists for interaction zones
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
    (c) => Math.sqrt((px - (c.x + 0.5)) ** 2 + (py - (c.y + 0.5)) ** 2) < r
  );
}

export function d2(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
