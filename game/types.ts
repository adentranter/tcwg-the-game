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
  | "repairing"
  | "leaving";

export type RepairDifficulty = "easy" | "normal" | "hard";

export type PcIssue = "virus" | "bad HDD" | "overheating" | "corrupted OS";

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
  /** Animated world position — walks toward `slot` (or the exit door when leaving) */
  px: number;
  py: number;
  /** Remaining tile-space waypoints to pass through before heading for `slot` (e.g. walking in from a parked car) */
  route?: { x: number; y: number }[];
  benchState?: "repairing" | "done";
  repProgress?: number;
  /** Fixed workbench grid slot (0–21) so PCs don't reshuffle when others are added/removed */
  benchSlot?: number;
  repairDifficulty?: RepairDifficulty;
  repairBonus?: number;
  pcIssue?: PcIssue;
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

export type CarState = "incoming" | "parked" | "unloading" | "leaving";

export interface ParkedCar {
  id: number;
  bay: number; // 0 | 1 | 2, index into ShopFront's 3 bay slots
  state: CarState;
  progress: number; // 0..1 drive-in/drive-out animation progress (only meaningful during "incoming"/"leaving")
  vehicleIndex: number; // pick which GLB to render, cycle through a small set
  passengersLeft: number; // customers still to spawn from this car
}

export type TutorialStep =
  | "find_customer"
  | "bring_to_bench"
  | "watch_repair"
  | "grab_ready"
  | "return_to_customer";

export interface GamePublicState {
  score: number;
  timeLeft: number;
  carried: Customer | null;
  bench: Customer[];
  customers: Customer[];
  repairProgress: number;
  isRepairing: boolean;
  hint: { message: string; color: string } | null;
  glitchRequest: number;
  cars: ParkedCar[];
  tutorialStep: TutorialStep | null;
  tutorialTarget: { x: number; y: number } | null;
}
