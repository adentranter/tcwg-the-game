import {
  B1_CELLS,
  WSLOTS,
  PWSLOTS,
  freeWSlot,
  freePWSlot,
  nearCells,
  d2,
  canWalkR,
  DOOR_WEST,
  DOOR_EAST,
  CAR_BAY_X,
  CAR_BAY_Z,
  worldToTile,
  SOUTH_ENTRY_OUTSIDE,
  SOUTH_ENTRY_INSIDE,
} from "./map";
import type {
  Player,
  Customer,
  Review,
  GameOverSummary,
  GamePublicState,
  RepairDifficulty,
  PcIssue,
  ParkedCar,
  TutorialStep,
} from "./types";

const NAMES = [
  "Alex",
  "Jordan",
  "Sam",
  "Casey",
  "Morgan",
  "Taylor",
  "Riley",
  "Drew",
  "Quinn",
  "Blake",
  "Avery",
  "Logan",
  "Kai",
  "Remi",
  "Chris",
  "Dana",
];
const GOOD = [
  "Fixed super fast!",
  "Back in action!",
  "Didn't lose a file.",
  "Faster than expected!",
  "Would 100% return.",
];
const BAD = [
  "Waited too long.",
  "Could have been faster.",
  "Not great service.",
];
const CUSTCOLS = [
  "#4d96ff",
  "#ff6b6b",
  "#ffd93d",
  "#6bcb77",
  "#ff6fc8",
  "#c77dff",
  "#ff9f1c",
  "#00d4aa",
];

function rnd<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

let tickN = 0;
function nextTick(): string {
  tickN = (tickN + 1) % 10000;
  return String(tickN).padStart(4, "0");
}

const CUSTOMER_WALK_SPEED = 5.5;
const ARRIVE_EPS = 0.2;
const MAX_BENCH_PCS = 22;

function nextFreeBenchSlot(): number | null {
  const used = new Set(
    bench.filter((c) => c.benchSlot != null).map((c) => c.benchSlot as number)
  );
  for (let i = 0; i < MAX_BENCH_PCS; i++) {
    if (!used.has(i)) return i;
  }
  return null;
}

let player: Player;
let customers: Customer[];
let carried: Customer | null;
let bench: Customer[];
let score: number;
let gTime: number;
let gActive: boolean;
let repProg: number;
let iCD: number;
let lastT: number;
let pName: string;
let reviews: Review[];
let rainT: number;
let spaceWas: boolean;
let gameOverSummary: GameOverSummary | null = null;
let glitchRequest: number = 0;

type CarInternal = ParkedCar & { timer: number };
let cars: CarInternal[];
let carSpawnCD: number;
let nextCarId: number;
const VEHICLES_PER_CAR = 5;
const MAX_LIVE_CUSTOMERS = 14;
const BENCH_CENTER = { x: 11.5, y: 5.5 };

let tutorialActive: boolean;

const PC_ISSUES: PcIssue[] = ["virus", "bad HDD", "overheating", "corrupted OS"];
const DIFFICULTY_CONFIG: {
  d: RepairDifficulty;
  repairTimeMin: number;
  repairTimeMax: number;
  bonus: number;
}[] = [
  { d: "easy", repairTimeMin: 4, repairTimeMax: 7, bonus: 0 },
  { d: "normal", repairTimeMin: 8, repairTimeMax: 13, bonus: 20 },
  { d: "hard", repairTimeMin: 14, repairTimeMax: 19, bonus: 60 },
];

function rollRepairTime(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

let onGameOverCallback: (summary: GameOverSummary) => void = () => {};

export function initGame(hooks: { onGameOver: (summary: GameOverSummary) => void }) {
  onGameOverCallback = hooks.onGameOver;
}

function initState(): void {
  player = { x: 6.5, y: 10, facing: "down" };
  customers = [];
  carried = null;
  bench = [];
  score = 0;
  gTime = 60;
  gActive = false;
  repProg = 0;
  iCD = 0;
  lastT = 0;
  reviews = [];
  rainT = 0;
  spaceWas = false;
  gameOverSummary = null;
  glitchRequest = 0;
  cars = [];
  carSpawnCD = 1.5;
  nextCarId = 1;
  tutorialActive =
    typeof window !== "undefined" &&
    localStorage.getItem("tcwg_tutorial_done") !== "1";
  WSLOTS.forEach((s) => (s.taken = false));
  PWSLOTS.forEach((s) => (s.taken = false));
}

/**
 * Spawns a customer. When `bay` is given (a passenger unloading from a
 * parked car), they start at that car's exterior position and walk in
 * through the south doorway onto the parking lot; otherwise (the two
 * customers already waiting when the game starts) they start at the door.
 */
function spawnCustomer(bay?: number): boolean {
  const slot = freeWSlot();
  if (!slot) return false;
  slot.taken = true;
  const origin =
    bay !== undefined
      ? worldToTile(CAR_BAY_X[bay], CAR_BAY_Z[bay])
      : DOOR_WEST;
  const c: Customer = {
    id: Math.random(),
    ticket: nextTick(),
    name: rnd(NAMES),
    slot,
    pwSlot: null,
    state: "waiting",
    patience: 20 + Math.random() * 14,
    patienceMax: 34,
    color: rnd(CUSTCOLS),
    waitStart: 0,
    repairTime: 0,
    animT: Math.random() * Math.PI * 2,
    px: origin.x,
    py: origin.y,
    route:
      bay !== undefined ? [SOUTH_ENTRY_OUTSIDE, SOUTH_ENTRY_INSIDE] : undefined,
  };
  customers.push(c);
  return true;
}

function updateCars(dt: number): void {
  carSpawnCD -= dt;
  if (carSpawnCD <= 0) {
    const freeBays = [0, 1, 2].filter((b) => !cars.some((c) => c.bay === b));
    if (freeBays.length > 0 && customers.length < MAX_LIVE_CUSTOMERS) {
      cars.push({
        id: nextCarId++,
        bay: rnd(freeBays),
        state: "incoming",
        progress: 0,
        vehicleIndex: Math.floor(Math.random() * VEHICLES_PER_CAR),
        passengersLeft: Math.random() < 0.65 ? 1 : 2,
        timer: 0,
      });
    }
    carSpawnCD = 4 + Math.random() * 4;
  }

  cars.forEach((c) => {
    if (c.state === "incoming") {
      c.progress = Math.min(1, c.progress + dt / 1.4);
      if (c.progress >= 1) {
        c.state = "parked";
        c.timer = 0;
      }
    } else if (c.state === "parked") {
      c.timer += dt;
      if (c.timer >= 0.5) {
        c.state = "unloading";
        c.timer = 0;
      }
    } else if (c.state === "unloading") {
      c.timer += dt;
      if (c.timer >= 0.5) {
        c.timer = 0;
        if (spawnCustomer(c.bay)) {
          c.passengersLeft -= 1;
          if (c.passengersLeft <= 0) {
            c.state = "leaving";
            c.progress = 0;
          }
        }
      }
    } else if (c.state === "leaving") {
      c.progress = Math.min(1, c.progress + dt / 1.15);
    }
  });

  cars = cars.filter((c) => !(c.state === "leaving" && c.progress >= 1));
}

function interact(): void {
  if (iCD > 0) return;
  iCD = 0.25;

  const nearBench = nearCells(B1_CELLS, player.x, player.y, 2.0);

  // Hands empty: take from customer, or SPACE-grab a finished PC from the bench
  if (!carried) {
    const nearWaiting = customers.find(
      (cu) =>
        cu.state === "waiting" &&
        d2(player, { x: cu.slot.x, y: cu.slot.y }) < 3.5
    );
    if (nearWaiting) {
      nearWaiting.waitStart = gTime;
      const diffConfig = rnd(DIFFICULTY_CONFIG);
      nearWaiting.repairDifficulty = diffConfig.d;
      nearWaiting.repairTime = rollRepairTime(
        diffConfig.repairTimeMin,
        diffConfig.repairTimeMax
      );
      nearWaiting.repairBonus = diffConfig.bonus;
      nearWaiting.pcIssue = rnd(PC_ISSUES);
      nearWaiting.slot.taken = false;
      const ps = freePWSlot();
      if (ps) {
        ps.taken = true;
        nearWaiting.pwSlot = ps;
        nearWaiting.slot = ps;
      }
      nearWaiting.state = "pw_waiting_pc";
      carried = nearWaiting;
      return;
    }

    if (nearBench) {
      const doneOnBench = bench.find((c) => c.benchState === "done");
      if (doneOnBench) {
        bench = bench.filter((x) => x.id !== doneOnBench.id);
        doneOnBench.benchSlot = undefined;
        carried = doneOnBench;
      }
    }
    return;
  }

  // Carrying a broken PC: place on bench (never auto-swap for a finished one)
  if (carried.benchState !== "done" && nearBench) {
    const slot = nextFreeBenchSlot();
    if (slot == null || bench.length >= MAX_BENCH_PCS) return;
    // Ensure repair duration is in the 4–19s range at place time
    if (!carried.repairTime || carried.repairTime < 4) {
      const diffConfig =
        DIFFICULTY_CONFIG.find((d) => d.d === carried!.repairDifficulty) ??
        rnd(DIFFICULTY_CONFIG);
      carried.repairDifficulty = diffConfig.d;
      carried.repairTime = rollRepairTime(
        diffConfig.repairTimeMin,
        diffConfig.repairTimeMax
      );
      carried.repairBonus = diffConfig.bonus;
    }
    carried.benchState = "repairing";
    carried.repProgress = 0;
    carried.benchSlot = slot;
    bench.push(carried);
    carried = null;
    repProg = 0;
    return;
  }

  // Carrying something else / not near bench: cancel broken-PC carry
  if (carried.benchState !== "done") {
    const c = customers.find((cu) => cu.id === carried!.id);
    if (c && c.state === "pw_waiting_pc") {
      c.state = "waiting";
      if (c.pwSlot) c.pwSlot.taken = false;
      const free = WSLOTS.find((s) => !s.taken);
      if (free) {
        free.taken = true;
        c.slot = free;
      }
    }
    carried = null;
    repProg = 0;
  }
}

export function startGame(playerName: string): void {
  pName = playerName.trim() || "TECH";
  initState();
  gActive = true;
  glitchRequest += 1;
  spawnCustomer();
  spawnCustomer();
  lastT = performance.now();
}

export function stopGame(): void {
  gActive = false;
}

export function tick(
  keys: Record<string, boolean>,
  ts: number
): { active: boolean; summary: GameOverSummary | null } {
  if (!gActive)
    return { active: false, summary: gameOverSummary };

  const dt = Math.min((ts - lastT) / 1000, 0.05);
  lastT = ts;
  rainT += dt;
  gTime -= dt;

  if (gTime <= 0) {
    gTime = 0;
    gActive = false;
    const avg =
      reviews.length > 0
        ? Math.round(
            reviews.reduce((a, r) => a + r.stars, 0) / reviews.length
          )
        : 3;
    gameOverSummary = {
      score,
      avgStars: avg,
      reviews,
      playerName: pName,
    };
    onGameOverCallback(gameOverSummary);
    return { active: false, summary: gameOverSummary };
  }

  if (iCD > 0) iCD -= dt;

  const spNow = !!keys[" "];
  if (spNow && !spaceWas) interact();
  spaceWas = spNow;

  const spd = 5.5;
  let dx = 0,
    dy = 0;
  if (keys["w"] || keys["W"] || keys["ArrowUp"]) {
    dy -= 1;
    player.facing = "up";
  }
  if (keys["s"] || keys["S"] || keys["ArrowDown"]) {
    dy += 1;
    player.facing = "down";
  }
  if (keys["a"] || keys["A"] || keys["ArrowLeft"]) {
    dx -= 1;
    player.facing = "left";
  }
  if (keys["d"] || keys["D"] || keys["ArrowRight"]) {
    dx += 1;
    player.facing = "right";
  }
  if (dx && dy) {
    dx *= 0.707;
    dy *= 0.707;
  }
  const nx = player.x + dx * spd * dt;
  const ny = player.y + dy * spd * dt;
  if (canWalkR(nx, player.y)) player.x = nx;
  if (canWalkR(player.x, ny)) player.y = ny;

  bench.forEach((c) => {
    if (c.benchState !== "repairing") return;
    const duration = Math.max(4, c.repairTime || 10);
    const prog = (c.repProgress ?? 0) + dt / duration;
    c.repProgress = Math.min(1, prog);
    if (c.repProgress >= 1) {
      c.benchState = "done";
      if (c.repairDifficulty === "hard") glitchRequest += 1;
      const cust = customers.find((cu) => cu.id === c.id);
      if (cust) cust.state = "pw_waiting";
    }
  });

  // Finished PCs stay on the bench until SPACE grabs them (no auto-pickup).

  if (carried && carried.benchState === "done") {
    const owner = customers.find(
      (cu) => cu.id === carried!.id && cu.state === "pw_waiting"
    );
    if (owner && d2(player, { x: owner.slot.x, y: owner.slot.y }) < 2.0) {
      const wait = owner.waitStart - gTime;
      const pts = Math.max(
        80,
        Math.round((120 + Math.random() * 200) / 10) * 10 - Math.floor(wait * 6)
      );
      score += pts + (carried.repairBonus ?? 0);
      const stars =
        pts >= 280 ? 5 : pts >= 220 ? 4 : pts >= 160 ? 3 : pts >= 120 ? 2 : 1;
      reviews.push({
        name: owner.name,
        ticket: owner.ticket,
        stars,
        text: stars >= 4 ? rnd(GOOD) : rnd(BAD),
        color: owner.color,
      });
      if (owner.pwSlot) owner.pwSlot.taken = false;
      owner.state = "leaving";
      bench = bench.filter((x) => x.id !== owner.id);
      carried = null;
      repProg = 0;
      if (tutorialActive) {
        tutorialActive = false;
        if (typeof window !== "undefined")
          localStorage.setItem("tcwg_tutorial_done", "1");
      }
    }
  }

  customers.forEach((c) => {
    c.animT += dt;
    if (c.state === "waiting") {
      c.patience -= dt;
      if (c.patience <= 0) {
        reviews.push({
          name: c.name,
          ticket: c.ticket,
          stars: 1,
          text: rnd(BAD),
          color: c.color,
        });
        c.slot.taken = false;
        c.state = "leaving";
        score = Math.max(0, score - 20);
      }
    }
    if (c.state === "pw_waiting" || c.state === "pw_waiting_pc") {
      c.patience -= dt * 0.3;
      if (c.patience <= 0) {
        reviews.push({
          name: c.name,
          ticket: c.ticket,
          stars: 2,
          text: rnd(BAD),
          color: c.color,
        });
        if (c.pwSlot) c.pwSlot.taken = false;
        c.state = "leaving";
        bench = bench.filter((x) => x.id !== c.id);
        if (carried && carried.id === c.id) carried = null;
      }
    }

    const routeTarget = c.route && c.route.length > 0 ? c.route[0] : null;
    const target =
      routeTarget ??
      (c.state === "leaving"
        ? c.pwSlot !== null
          ? DOOR_EAST
          : DOOR_WEST
        : { x: c.slot.x, y: c.slot.y });
    const ddx = target.x - c.px;
    const ddy = target.y - c.py;
    const dist = Math.hypot(ddx, ddy);
    const step = CUSTOMER_WALK_SPEED * dt;
    if (dist > step) {
      c.px += (ddx / dist) * step;
      c.py += (ddy / dist) * step;
    } else {
      c.px = target.x;
      c.py = target.y;
      if (routeTarget) c.route!.shift();
    }
  });

  customers = customers.filter((c) => {
    if (c.state !== "leaving") return true;
    const door = c.pwSlot !== null ? DOOR_EAST : DOOR_WEST;
    return Math.hypot(c.px - door.x, c.py - door.y) > ARRIVE_EPS;
  });

  updateCars(dt);

  return { active: true, summary: null };
}

export function getPublicState(): GamePublicState {
  let hint: { message: string; color: string } | null = null;
  const nearBench = nearCells(B1_CELLS, player.x, player.y, 2.2);
  const doneOnBench = bench.find((c) => c.benchState === "done");

  if (!carried) {
    const near = customers.find(
      (c) =>
        c.state === "waiting" &&
        d2(player, { x: c.slot.x, y: c.slot.y }) < 3.5
    );
    if (near) {
      hint = {
        message: `SPACE — take PC from ${near.name}  #${near.ticket}`,
        color: "#E8722A",
      };
    } else if (nearBench && doneOnBench) {
      hint = {
        message: `SPACE — grab finished PC  #${doneOnBench.ticket}`,
        color: "#6bcb77",
      };
    } else if (customers.some((c) => c.state === "waiting")) {
      hint = {
        message: "→ walk to orange counter to take a PC",
        color: "#aaa",
      };
    } else if (bench.length > 0) {
      const repairing = bench.filter((c) => c.benchState === "repairing").length;
      const ready = bench.length - repairing;
      hint = {
        message:
          ready > 0
            ? `${ready} ready · ${repairing} repairing  (${bench.length}/${MAX_BENCH_PCS})`
            : `${repairing} PC(s) repairing  (${bench.length}/${MAX_BENCH_PCS})`,
        color: ready > 0 ? "#6bcb77" : "#aaa",
      };
    }
  } else if (carried.benchState !== "done") {
    if (nearBench) {
      if (bench.length >= MAX_BENCH_PCS) {
        hint = {
          message: `BENCH FULL (${MAX_BENCH_PCS}/${MAX_BENCH_PCS}) — grab a finished PC first`,
          color: "#e85555",
        };
      } else {
        hint = {
          message: `SPACE — place on bench  #${carried.ticket} (${bench.length}/${MAX_BENCH_PCS})`,
          color: "#aaa",
        };
      }
    } else {
      hint = {
        message: "→ carry PC to the WORKBENCH",
        color: "#aaa",
      };
    }
  } else {
    const c = carried;
    const owner = customers.find(
      (cu) => cu.id === c.id && cu.state === "pw_waiting"
    );
    hint = {
      message: owner
        ? `→ walk to ${owner.name} on the right to return  #${c.ticket}`
        : "→ find the customer on the right side",
      color: "#6bcb77",
    };
  }

  const firstRepairing = bench.find((c) => c.benchState === "repairing");
  const repairProgress = firstRepairing ? (firstRepairing.repProgress ?? 0) : 0;
  const isRepairing = bench.some((c) => c.benchState === "repairing");

  let tutorialStep: TutorialStep | null = null;
  let tutorialTarget: { x: number; y: number } | null = null;
  if (tutorialActive) {
    if (!carried) {
      const waitingCust = customers.find((c) => c.state === "waiting");
      if (waitingCust) {
        tutorialStep = "find_customer";
        tutorialTarget = { x: waitingCust.slot.x, y: waitingCust.slot.y };
      } else if (
        bench.some((c) => c.benchState === "repairing") &&
        !doneOnBench
      ) {
        tutorialStep = "watch_repair";
        tutorialTarget = BENCH_CENTER;
      } else if (doneOnBench) {
        tutorialStep = "grab_ready";
        tutorialTarget = BENCH_CENTER;
      }
    } else if (carried.benchState !== "done") {
      tutorialStep = "bring_to_bench";
      tutorialTarget = BENCH_CENTER;
    } else {
      const owner = customers.find((cu) => cu.id === carried!.id);
      tutorialStep = "return_to_customer";
      tutorialTarget = owner ? { x: owner.slot.x, y: owner.slot.y } : null;
    }
  }

  return {
    score,
    timeLeft: gTime,
    carried,
    bench,
    customers,
    repairProgress,
    isRepairing,
    hint,
    glitchRequest,
    cars,
    tutorialStep,
    tutorialTarget,
  };
}

export function getPlayer(): Player {
  return player;
}

export function getRainT(): number {
  return rainT;
}

export function isActive(): boolean {
  return gActive;
}
