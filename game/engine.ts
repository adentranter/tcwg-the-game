import {
  B1_CELLS,
  WSLOTS,
  PWSLOTS,
  freeWSlot,
  freePWSlot,
  nearCells,
  d2,
  canWalk,
} from "./map";
import type {
  Player,
  Customer,
  Review,
  GameOverSummary,
  GamePublicState,
  Facing,
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

let player: Player;
let customers: Customer[];
let carried: Customer | null;
let score: number;
let gTime: number;
let gActive: boolean;
let repProg: number;
let spawnT: number;
let iCD: number;
let lastT: number;
let pName: string;
let reviews: Review[];
let rainT: number;
let spaceWas: boolean;
let gameOverSummary: GameOverSummary | null = null;

let onGameOverCallback: (summary: GameOverSummary) => void = () => {};

export function initGame(hooks: { onGameOver: (summary: GameOverSummary) => void }) {
  onGameOverCallback = hooks.onGameOver;
}

function initState(): void {
  player = { x: 6.5, y: 12, facing: "down" };
  customers = [];
  carried = null;
  score = 0;
  gTime = 60;
  gActive = false;
  repProg = 0;
  spawnT = 0;
  iCD = 0;
  lastT = 0;
  reviews = [];
  rainT = 0;
  spaceWas = false;
  gameOverSummary = null;
  WSLOTS.forEach((s) => (s.taken = false));
  PWSLOTS.forEach((s) => (s.taken = false));
}

function spawnCustomer(): void {
  const slot = freeWSlot();
  if (!slot) return;
  slot.taken = true;
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
  };
  customers.push(c);
}

function interact(): void {
  if (iCD > 0) return;
  iCD = 0.25;

  if (!carried) {
    const c = customers.find(
      (cu) =>
        cu.state === "waiting" &&
        d2(player, { x: cu.slot.x, y: cu.slot.y }) < 3.5
    );
    if (c) {
      c.waitStart = gTime;
      c.repairTime = 0.1 + Math.random() * 0.8;
      c.slot.taken = false;
      const ps = freePWSlot();
      if (ps) {
        ps.taken = true;
        c.pwSlot = ps;
        c.slot = ps;
      }
      c.state = "pw_waiting_pc";
      carried = c;
      return;
    }
  }

  if (
    carried &&
    (carried.state === "pw_waiting_pc" || !carried.benchState) &&
    nearCells(B1_CELLS, player.x, player.y, 2.0)
  ) {
    carried.benchState = "repairing";
    repProg = 0;
    return;
  }

  if (carried) {
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
  spawnCustomer();
  spawnCustomer();
  spawnT = 3.5;
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
  if (canWalk(nx, player.y)) player.x = nx;
  if (canWalk(player.x, ny)) player.y = ny;

  const canRep =
    carried &&
    carried.benchState === "repairing" &&
    nearCells(B1_CELLS, player.x, player.y, 2.2);

  if (canRep && spNow) {
    repProg += dt / (carried!.repairTime || 0.5);
    if (repProg >= 1) {
      repProg = 1;
      carried!.benchState = "done";
      const c = customers.find((cu) => cu.id === carried!.id);
      if (c) c.state = "pw_waiting";
    }
  } else {
    if (!canRep && carried && carried.benchState === "repairing") repProg = 0;
  }

  if (
    carried &&
    carried.benchState === "done"
  ) {
    const owner = customers.find(
      (cu) => cu.id === carried!.id && cu.state === "pw_waiting"
    );
    if (owner && d2(player, { x: owner.slot.x, y: owner.slot.y }) < 2.0) {
      const wait = owner.waitStart - gTime;
      const pts = Math.max(
        80,
        Math.round((120 + Math.random() * 200) / 10) * 10 - Math.floor(wait * 6)
      );
      score += pts;
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
      customers = customers.filter((x) => x.id !== owner.id);
      carried = null;
      repProg = 0;
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
        customers = customers.filter((x) => x.id !== c.id);
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
        customers = customers.filter((x) => x.id !== c.id);
        if (carried && carried.id === c.id) carried = null;
      }
    }
  });

  spawnT -= dt;
  if (spawnT <= 0) {
    spawnCustomer();
    spawnT = 3.5 + Math.random() * 4;
  }

  return { active: true, summary: null };
}

export function getPublicState(): GamePublicState {
  let hint: { message: string; color: string } | null = null;
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
    } else if (customers.some((c) => c.state === "waiting")) {
      hint = {
        message: "→ walk to orange counter to take a PC",
        color: "#aaa",
      };
    }
  } else if (carried.benchState !== "done") {
    if (nearCells(B1_CELLS, player.x, player.y, 2.2)) {
      hint =
        carried.benchState === "repairing"
          ? { message: `HOLD SPACE to repair  #${carried.ticket}`, color: "#aaa" }
          : {
              message: `SPACE — place on bench  #${carried.ticket}`,
              color: "#aaa",
            };
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

  const canRep =
    carried &&
    carried.benchState === "repairing" &&
    nearCells(B1_CELLS, player.x, player.y, 2.2);

  return {
    score,
    timeLeft: gTime,
    carried,
    customers,
    repairProgress: canRep ? repProg : 0,
    isRepairing: !!(canRep && carried && carried.benchState !== "done"),
    hint,
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
