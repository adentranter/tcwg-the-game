import { getMap, MAP_WIDTH, MAP_HEIGHT } from "./map";
import { TileType } from "./types";
import type { GamePublicState, Player, Customer } from "./types";

const T = TileType;
const TILE_SIZE = 40;

const FLOOR_DARK = "#3c3c3e";
const FLOOR_LIGHT = "#383839";
const WALL = "#a0a0a0";
const WALL_DARK = "#808080";
const COUNTER_ORANGE = "#c45a10";
const COUNTER_ORANGE_DARK = "#8b3d0a";
const COUNTER_GREEN = "#2d8b4a";
const COUNTER_GREEN_DARK = "#1e6b38";
const BENCH_TOP = "#1e1e20";
const BENCH_LEG = "#111114";
const WAIT_ZONE = "#2e242a";
const PICKUP_ZONE = "#1a2c1e";
const GRASS = ["#3a5e1e", "#3d6420", "#3a5a1c", "#426820"];
const EXIT_PATH = "#a89060";
const GAP = "#4a4a4c";

function grassH(x: number, y: number): number {
  return (x * 7 + y * 13) % GRASS.length;
}

export function worldToScreen(x: number, y: number, width: number, height: number): { sx: number; sy: number } {
  const mapW = MAP_WIDTH * TILE_SIZE;
  const mapH = MAP_HEIGHT * TILE_SIZE;
  const ox = (width - mapW) / 2;
  const oy = (height - mapH) / 2;
  return {
    sx: ox + x * TILE_SIZE,
    sy: oy + y * TILE_SIZE,
  };
}

export function draw(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: GamePublicState,
  player: Player,
  rainT: number
): void {
  const map = getMap();
  const mapW = MAP_WIDTH * TILE_SIZE;
  const mapH = MAP_HEIGHT * TILE_SIZE;
  const ox = (width - mapW) / 2;
  const oy = (height - mapH) / 2;

  ctx.fillStyle = "#1e3010";
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(ox, oy);

  for (let gy = 0; gy < MAP_HEIGHT; gy++) {
    for (let gx = 0; gx < MAP_WIDTH; gx++) {
      const c = map[gy][gx];
      const x = gx * TILE_SIZE;
      const y = gy * TILE_SIZE;

      if (c === T.OUT) {
        const col = GRASS[grassH(gx, gy)];
        ctx.fillStyle = col;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "#2a4c14";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (c === T.FL) {
        const sh = (gx + gy) % 2 === 0 ? FLOOR_DARK : FLOOR_LIGHT;
        ctx.fillStyle = sh;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "#2c2c2e";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (c === T.WT) {
        ctx.fillStyle = WAIT_ZONE;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        const pulse = 0.15 + 0.12 * Math.sin(rainT * 2.2);
        ctx.strokeStyle = `rgba(232, 114, 42, ${pulse})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.lineWidth = 1;
      } else if (c === T.PW) {
        ctx.fillStyle = PICKUP_ZONE;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        const pulse = 0.15 + 0.12 * Math.sin(rainT * 2.2 + 1);
        ctx.strokeStyle = `rgba(107, 203, 119, ${pulse})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.lineWidth = 1;
      } else if (c === T.EX) {
        ctx.fillStyle = EXIT_PATH;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#E8722A88";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("EXIT", x + TILE_SIZE / 2, y + TILE_SIZE / 2);
      } else if (c === T.GP) {
        ctx.fillStyle = GAP;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#E8722A55";
        ctx.fillText("⇕", x + TILE_SIZE / 2, y + TILE_SIZE / 2 + 2);
      } else if (c === T.WL || c === T.WIN || c === T.DR) {
        ctx.fillStyle = WALL;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = WALL_DARK;
        ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4);
        if (c === T.WIN) {
          ctx.fillStyle = "#a8d8ea";
          ctx.fillRect(x + 6, y + 8, TILE_SIZE - 12, TILE_SIZE - 20);
        }
        if (c === T.DR) {
          ctx.fillStyle = "#5a3a10";
          ctx.fillRect(x + 8, y + 6, TILE_SIZE - 16, TILE_SIZE - 12);
        }
      } else if (c === T.B1) {
        ctx.fillStyle = BENCH_TOP;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "#E8722A";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "rgba(26,42,26,0.2)";
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        const pulse = 0.6 + 0.2 * Math.sin(rainT * 3);
        ctx.fillStyle = `hsla(${(rainT * 50) % 360}, 70%, 45%, ${pulse})`;
        ctx.fillRect(x + 10, y + 10, 12, 10);
      } else if (c === T.B2) {
        ctx.fillStyle = "#1c1610";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "#E8722A44";
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (c === T.SK) {
        ctx.fillStyle = "#0e1c2c";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#1a2d3a";
        ctx.fillRect(x + 6, y + 8, TILE_SIZE - 12, TILE_SIZE - 16);
      } else if (c === T.DO) {
        ctx.fillStyle = COUNTER_ORANGE_DARK;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COUNTER_ORANGE;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE - 6);
        ctx.strokeStyle = "#E8722A";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (c === T.PU) {
        ctx.fillStyle = COUNTER_GREEN_DARK;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COUNTER_GREEN;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE - 6);
        ctx.strokeStyle = "#6bcb77";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (c === T.DG) {
        ctx.fillStyle = "#060c16";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        const rc = ["#E8722A", "#4d96ff", "#6bcb77", "#ffd93d", "#ff6b6b"];
        rc.forEach((col, i) => {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(x + TILE_SIZE - 8, y + 10 + i * 6, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }
  }

  const entities: { d: number; fn: () => void }[] = [];

  state.customers.forEach((c) => {
    entities.push({
      d: c.slot.x + c.slot.y,
      fn: () => drawCustomer(ctx, c, rainT),
    });
  });
  entities.push({
    d: player.x + player.y,
    fn: () => drawPlayer(ctx, player, state.carried, rainT),
  });
  entities.sort((a, b) => a.d - b.d);
  entities.forEach((e) => e.fn());

  ctx.restore();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  carried: Customer | null,
  rainT: number
): void {
  const bob = Math.sin(rainT * 2) * 2;
  const cx = player.x * TILE_SIZE;
  const cy = player.y * TILE_SIZE + bob;

  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 32, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  if (carried) {
    ctx.fillStyle = carried.benchState === "done" ? "#c8c8c8" : carried.color;
    ctx.fillRect(cx - 8, cy - 18, 16, 10);
    ctx.fillStyle = "#080808";
    ctx.fillRect(cx - 6, cy - 15, 12, 5);
    ctx.fillStyle = "#E8722A";
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.fillText("#" + carried.ticket, cx, cy - 24);
  }

  ctx.fillStyle = "#2a3a6a";
  ctx.fillRect(cx - 8, cy - 4, 6, 14);
  ctx.fillRect(cx + 2, cy - 4, 6, 14);
  ctx.fillStyle = "#c85e1a";
  ctx.fillRect(cx - 10, cy - 18, 20, 14);
  ctx.fillStyle = "#E8722A";
  ctx.font = "9px Orbitron";
  ctx.textAlign = "center";
  ctx.fillText("TCWG", cx, cy - 8);
  ctx.fillStyle = "#f5c6a0";
  ctx.beginPath();
  ctx.arc(cx, cy - 24, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.arc(cx, cy - 26, 6, Math.PI, 0);
  ctx.fill();
}

function drawCustomer(
  ctx: CanvasRenderingContext2D,
  c: Customer,
  rainT: number
): void {
  const bob = Math.sin(c.animT * 2) * 2;
  const cx = c.slot.x * TILE_SIZE;
  const cy = c.slot.y * TILE_SIZE + bob;

  if (c.state === "waiting") {
    const fr = c.patience / c.patienceMax;
    ctx.fillStyle = "#111";
    ctx.fillRect(cx - 14, cy - 42, 28, 5);
    ctx.fillStyle = fr > 0.5 ? "#6bcb77" : fr > 0.25 ? "#f0b429" : "#ff4444";
    ctx.fillRect(cx - 14, cy - 42, 28 * fr, 5);
  }

  const bc = c.state === "pw_waiting" || c.state === "pw_waiting_pc" ? "#6bcb77" : "#E8722A";
  ctx.fillStyle = "rgba(0,0,0,0.9)";
  ctx.fillRect(cx - 18, cy - 52, 36, 12);
  ctx.fillStyle = bc;
  ctx.font = "bold 8px monospace";
  ctx.textAlign = "center";
  ctx.fillText("#" + c.ticket, cx, cy - 44);
  ctx.fillStyle = "#555";
  ctx.font = "8px monospace";
  ctx.fillText(c.name, cx, cy - 34);
  if (c.state === "pw_waiting") {
    ctx.fillStyle = "#6bcb77";
    ctx.fillText("READY ✓", cx, cy - 26);
  }
  if (c.state === "pw_waiting_pc") {
    ctx.fillStyle = "#88aaff";
    ctx.fillText("WAITING", cx, cy - 26);
  }

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 32, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.color;
  ctx.fillRect(cx - 8, cy - 14, 16, 14);
  ctx.fillStyle = "#f5c6a0";
  ctx.beginPath();
  ctx.arc(cx, cy - 24, 7, 0, Math.PI * 2);
  ctx.fill();

  if (c.state === "waiting") {
    ctx.fillStyle = c.color;
    ctx.fillRect(cx + 14, cy - 8, 12, 8);
  }
}
