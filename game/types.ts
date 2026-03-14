// Tile type enum (top-down semantics; same logical layout as original)
export const TileType = {
  FL: 0,
  WL: 1,
  B1: 2,
  B2: 3,
  SK: 4,
  DO: 5,
  PU: 6,
  WT: 7,
  PW: 8,
  DG: 9,
  EX: 10,
  GP: 11,
  OUT: 12,
  WIN: 13,
  DR: 14,
} as const;

export type TileTypeId = (typeof TileType)[keyof typeof TileType];

export type Facing = "up" | "down" | "left" | "right";

export interface Slot {
  x: number;
  y: number;
  taken: boolean;
}

export type CustomerState =
  | "waiting"
  | "pw_waiting_pc"
  | "pw_waiting"
  | "repairing";

export interface Customer {
  id: number;
  ticket: string;
  name: string;
  slot: Slot;
  pwSlot: Slot | null;
  state: CustomerState;
  patience: number;
  patienceMax: number;
  color: string;
  waitStart: number;
  repairTime: number;
  animT: number;
  benchState?: "repairing" | "done";
}

export interface Player {
  x: number;
  y: number;
  facing: Facing;
}

export interface Review {
  name: string;
  ticket: string;
  stars: number;
  text: string;
  color: string;
}

export interface GameOverSummary {
  score: number;
  avgStars: number;
  reviews: Review[];
  playerName: string;
}

export interface GamePublicState {
  score: number;
  timeLeft: number;
  carried: Customer | null;
  customers: Customer[];
  repairProgress: number;
  isRepairing: boolean;
  hint: { message: string; color: string } | null;
}
