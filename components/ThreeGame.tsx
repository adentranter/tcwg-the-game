"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  initGame,
  startGame,
  tick,
  getPublicState,
  getPlayer,
  isActive,
} from "@/game/engine";
import { getMap, zoneAt, MAP_WIDTH, MAP_HEIGHT } from "@/game/map";
import { TileType } from "@/game/types";
import type { GameOverSummary, GamePublicState } from "@/game/types";
import {
  Workbench,
  Counter,
  DiagRack,
  Sink,
  Tower,
  type MonitorScreenMode,
} from "@/components/three/ShopProps";

const BENCH_SCREEN_MODES: MonitorScreenMode[] = [
  "bios",
  "flicker",
  "terminal",
  "matrix",
  "error",
  "download",
  "gpu",
  "off",
];
import {
  PolishedConcreteFloor,
  FloorTileGrid,
  ExteriorGround,
  Window,
  PowerPlug,
  AirCon,
  FirstAid,
  WaterCooler,
  CeilingLights,
  CeilingPowerCords,
  Whiteboard,
} from "@/components/three/RoomProps";
import { ShopFront } from "@/components/three/ShopFront";
import { OptionalKenneyModels, CharacterEmployee } from "@/components/three/KenneyModel";

// Scene center in world space (floor group is offset so logical center is near origin)
const SCENE_CENTER = new THREE.Vector3(0, 0.5, 0);

interface ThreeGameProps {
  readonly playerName: string | null;
  readonly onGameOver: (summary: GameOverSummary) => void;
  readonly onStateChange: (state: GamePublicState) => void;
}

export function ThreeGame({
  playerName,
  onGameOver,
  onStateChange,
}: ThreeGameProps) {
  const keysRef = useRef<Record<string, boolean>>({});
  const startedRef = useRef(false);

  const onGameOverRef = useRef(onGameOver);
  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  useEffect(() => {
    initGame({
      onGameOver: (summary) => {
        onGameOverRef.current(summary);
      },
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };
    globalThis.addEventListener("keydown", onKeyDown as EventListener);
    globalThis.addEventListener("keyup", onKeyUp as EventListener);
    return () => {
      globalThis.removeEventListener("keydown", onKeyDown as EventListener);
      globalThis.removeEventListener("keyup", onKeyUp as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!playerName || startedRef.current) return;
    startedRef.current = true;
    startGame(playerName);
  }, [playerName]);

  return (
    <Canvas
      className="w-full h-full"
      orthographic
      shadows
      gl={{ antialias: true }}
      camera={{ position: [0, 0, 0], zoom: 40, near: 0.1, far: 200 }}
    >
      <color attach="background" args={["#5a584f"]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[15, 25, 15]} intensity={1.2} castShadow />
      <directionalLight position={[-10, 15, -10]} intensity={0.5} />

      <GlitchLights />
      <CeilingPowerCords />
      <IsoCamera />
      <GameLoop keysRef={keysRef} onStateChange={onStateChange} />

      <ShopFloor />
      <BenchPC />
      <OptionalKenneyModels />
      <ShopFront />
      <NPCTechs />
      <Characters />
      <TutorialMarker />
    </Canvas>
  );
}

const glitchPhaseRef = { current: 0 };

function GlitchLights() {
  const lastRequestRef = useRef(0);
  const glitchEndRef = useRef(0);

  useFrame(() => {
    const state = getPublicState();
    if (state.glitchRequest !== lastRequestRef.current) {
      lastRequestRef.current = state.glitchRequest;
      glitchEndRef.current = performance.now() / 1000 + 0.5;
    }
    const now = performance.now() / 1000;
    glitchPhaseRef.current =
      glitchEndRef.current > now
        ? 1 - (glitchEndRef.current - now) / 0.5
        : 0;
  });

  return <CeilingLights glitchPhaseRef={glitchPhaseRef} />;
}

function IsoCamera() {
  const { camera } = useThree();

  useLayoutEffect(() => {
    const ortho = camera as THREE.OrthographicCamera;
    ortho.position.set(14, 16, 14);
    ortho.lookAt(SCENE_CENTER);
    ortho.zoom = 42;
    ortho.near = 0.1;
    ortho.far = 200;
    ortho.updateProjectionMatrix();
  }, [camera]);

  return null;
}

function GameLoop({
  keysRef,
  onStateChange,
}: {
  keysRef: React.MutableRefObject<Record<string, boolean>>;
  onStateChange: (state: GamePublicState) => void;
}) {
  useFrame(() => {
    tick(keysRef.current, performance.now());
    const state = getPublicState();
    onStateChange(state);
  });
  return null;
}

const TILE_SIZE = 1;
/**
 * Hand-built player/customer meshes are authored in raw tile-units and were
 * sized ~1.5-1.8 tall (realistic-human scale), while the Kenney vehicle kit
 * outside is deliberately shrunk to fit a 1-tile road lane. Scaling people
 * down brings the two in line without touching the vehicle/road layout.
 */
const PEOPLE_SCALE = 0.62;
/** Low knee-walls so the isometric camera can see straight into the shop */
const WALL_H = 0.55;
const WALL_Y = WALL_H / 2;
/** Wall-mounted fixtures sit near the top edge of the knee-wall, not dead-center */
const FIXTURE_Y = WALL_H * 0.85;

/** NPC techs in the L-shaped desk zone (3–8, 5–10), on the left of the shop */
const NPC_POSITIONS: { x: number; y: number }[] = [
  { x: 4.6, y: 5.5 },
  { x: 4.6, y: 7.2 },
  { x: 4.6, y: 9 },
  { x: 6.5, y: 10.6 },
  { x: 8, y: 10.6 },
];

/** Central workbench island B1 is fill(9,8,16,10) → centre tile (12.5, 9) */
const B1_CENTER_WORLD: [number, number, number] = [
  (12.5 - MAP_WIDTH / 2) * TILE_SIZE,
  0.5,
  (9 - MAP_HEIGHT / 2) * TILE_SIZE,
];

/** 7×4 grid covering the 8×3 central island — slots stay put when PCs are added/removed */
const BENCH_COLS = 7;
const BENCH_ROWS = 4;
const BENCH_SLOT_X = 0.95;
const BENCH_SLOT_Z = 0.55;
const BAR_WIDTH = 0.5;
const BAR_HEIGHT = 0.09;

function benchSlotWorldOffset(slot: number): [number, number, number] {
  const col = slot % BENCH_COLS;
  const row = Math.floor(slot / BENCH_COLS);
  const offsetX = (col - (BENCH_COLS - 1) / 2) * BENCH_SLOT_X;
  const offsetZ = (row - (BENCH_ROWS - 1) / 2) * BENCH_SLOT_Z;
  return [offsetX, 0, offsetZ];
}

function BenchPC() {
  const { camera } = useThree();
  const progressFillRefs = useRef<Map<number, THREE.Mesh>>(new Map());
  const barGroupRefs = useRef<Map<number, THREE.Group>>(new Map());
  const glowRefs = useRef<Map<number, THREE.Mesh>>(new Map());

  useFrame(() => {
    const s = getPublicState();
    s.bench.forEach((c) => {
      const fill = progressFillRefs.current.get(c.id);
      if (fill) {
        const p = Math.max(0.02, c.repProgress ?? 0);
        fill.scale.x = p;
        fill.position.x = -BAR_WIDTH / 2 + (BAR_WIDTH * p) / 2;
        const mat = fill.material as THREE.MeshBasicMaterial;
        if (mat?.color) {
          mat.color.set(c.benchState === "done" ? "#3ddc84" : "#ffcc33");
        }
      }
      const barGroup = barGroupRefs.current.get(c.id);
      if (barGroup) {
        barGroup.quaternion.copy(camera.quaternion);
      }
      if (c.benchState === "repairing") {
        const glow = glowRefs.current.get(c.id);
        const mat = glow?.material as THREE.MeshStandardMaterial | undefined;
        if (mat?.emissiveIntensity !== undefined) {
          mat.emissiveIntensity = 0.2 + 0.12 * Math.sin(performance.now() * 0.008);
        }
      }
    });
  });

  const bench = getPublicState().bench ?? [];
  if (bench.length === 0) return null;

  return (
    <group position={B1_CENTER_WORLD}>
      {bench.map((c, i) => {
        const slot = c.benchSlot ?? i;
        const [offsetX, , offsetZ] = benchSlotWorldOffset(slot);
        const isRepairing = c.benchState === "repairing";
        const isDone = c.benchState === "done";
        const progress = c.repProgress ?? 0;
        const fillColor = isDone ? "#3ddc84" : "#ffcc33";

        return (
          <group key={c.id} position={[offsetX, 0, offsetZ]}>
            {isRepairing && (
              <mesh
                ref={(el) => {
                  if (el) glowRefs.current.set(c.id, el);
                  else glowRefs.current.delete(c.id);
                }}
                position={[0, 0.2, 0]}
              >
                <boxGeometry args={[0.34, 0.56, 0.62]} />
                <meshStandardMaterial
                  color={c.color}
                  emissive={c.color}
                  emissiveIntensity={0.2}
                  roughness={0.8}
                  transparent
                  opacity={0.35}
                />
              </mesh>
            )}
            <group position={[0, 0.18, 0]} scale={[0.75, 0.75, 0.75]}>
              <Tower color={c.color} />
            </group>

            {/* Big billboard progress bar — always faces camera */}
            <group
              ref={(el) => {
                if (el) barGroupRefs.current.set(c.id, el);
                else barGroupRefs.current.delete(c.id);
              }}
              position={[0, 0.95, 0]}
            >
              {/* Outer frame */}
              <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[BAR_WIDTH + 0.08, BAR_HEIGHT + 0.08]} />
                <meshBasicMaterial color="#0a0a0a" depthTest={false} />
              </mesh>
              {/* Track */}
              <mesh position={[0, 0, 0]}>
                <planeGeometry args={[BAR_WIDTH, BAR_HEIGHT]} />
                <meshBasicMaterial color="#2a2a2a" depthTest={false} />
              </mesh>
              {/* Fill */}
              <mesh
                ref={(el) => {
                  if (el) progressFillRefs.current.set(c.id, el);
                  else progressFillRefs.current.delete(c.id);
                }}
                position={[-BAR_WIDTH / 2 + (BAR_WIDTH * Math.max(0.02, progress)) / 2, 0, 0.01]}
                scale={[Math.max(0.02, progress), 1, 1]}
              >
                <planeGeometry args={[BAR_WIDTH, BAR_HEIGHT * 0.78]} />
                <meshBasicMaterial color={fillColor} depthTest={false} />
              </mesh>
              {/* Ready pulse marker */}
              {isDone && (
                <mesh position={[0, BAR_HEIGHT * 0.95, 0.02]}>
                  <planeGeometry args={[BAR_WIDTH + 0.04, 0.04]} />
                  <meshBasicMaterial color="#3ddc84" depthTest={false} />
                </mesh>
              )}
            </group>
          </group>
        );
      })}
    </group>
  );
}

function NPCTechs() {
  return (
    <group>
      {NPC_POSITIONS.map((pos, i) => {
        const px = (pos.x - MAP_WIDTH / 2) * TILE_SIZE;
        const pz = (pos.y - MAP_HEIGHT / 2) * TILE_SIZE;
        const rotY = (i % 4) * (Math.PI / 2);
        return (
          <group key={`npc-${pos.x}-${pos.y}`} position={[px, 0, pz]}>
            <CharacterEmployee rotation={[0, rotY, 0]} scale={0.85} />
            {/* ground shadow disc */}
            <mesh position={[0, 0.02, 0]} receiveShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.02, 12]} />
              <meshStandardMaterial color="black" opacity={0.35} transparent />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function ShopFloor() {
  const map = getMap();

  return (
    <group
      position={[
        -(MAP_WIDTH * TILE_SIZE) / 2,
        0,
        -(MAP_HEIGHT * TILE_SIZE) / 2,
      ]}
    >
      {map.map((row, y) =>
        row.map((t, x) => {
          const keyBase = `${x}-${y}`;
          const px = x * TILE_SIZE;
          const pz = y * TILE_SIZE;

          const isWalkable =
            t === TileType.FL ||
            t === TileType.WT ||
            t === TileType.PW ||
            t === TileType.EX ||
            t === TileType.GP;

          const meshes: React.ReactElement[] = [];

          if (t === TileType.OUT) {
            meshes.push(
              <ExteriorGround key={keyBase + "-floor"} position={[px, 0, pz]} size={TILE_SIZE} />,
            );
          } else {
            meshes.push(
              <PolishedConcreteFloor key={keyBase + "-floor"} position={[px, 0, pz]} size={TILE_SIZE} />,
            );
            if (isWalkable) {
              meshes.push(
                <FloorTileGrid key={keyBase + "-grid"} position={[px, 0, pz]} size={TILE_SIZE} />,
              );
            }
          }

          if (t === TileType.WIN) {
            meshes.push(
              <mesh
                key={keyBase + "-wall"}
                position={[px, WALL_Y, pz]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[TILE_SIZE, WALL_H, TILE_SIZE]} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
              </mesh>,
            );
            // Walls: top y=2, left x=2, right x=23
            const facing = y === 2 ? "north" : x === 23 ? "east" : "west";
            meshes.push(
              <Window
                key={keyBase + "-window"}
                position={[px, 0, pz]}
                facing={facing}
              />,
            );
          } else if (t === TileType.WL) {
            meshes.push(
              <mesh
                key={keyBase + "-wall"}
                position={[px, WALL_Y, pz]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[TILE_SIZE, WALL_H, TILE_SIZE]} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
              </mesh>,
            );
            if ((x === 2 && y === 8) || (x === 23 && y === 8)) {
              const plugX = x === 2 ? px + 0.52 : px - 0.52;
              const plugZ = pz;
              meshes.push(
                <AirCon
                  key={keyBase + "-ac"}
                  position={[plugX, WALL_Y, plugZ]}
                  rotation={x === 2 ? Math.PI / 2 : -Math.PI / 2}
                />,
              );
            }
            if ((x === 2 && y === 4) || (x === 23 && y === 4)) {
              const plugX = x === 2 ? px + 0.52 : px - 0.52;
              meshes.push(
                <PowerPlug
                  key={keyBase + "-plug"}
                  position={[plugX, WALL_Y, pz]}
                  rotation={x === 2 ? Math.PI / 2 : -Math.PI / 2}
                />,
              );
            }
            if (x === 2 && y === 6) {
              meshes.push(
                <FirstAid
                  key={keyBase + "-firstaid"}
                  position={[px + 0.52, WALL_Y, pz]}
                  rotation={Math.PI / 2}
                />,
              );
            }
            if (x === 2 && y === 10) {
              meshes.push(
                <WaterCooler
                  key={keyBase + "-water"}
                  position={[px + 0.52, WALL_Y, pz]}
                  rotation={Math.PI / 2}
                />,
              );
            }
            if (x === 2 && y === 5) {
              meshes.push(
                <Whiteboard
                  key={keyBase + "-whiteboard"}
                  position={[px + 0.52, WALL_Y, pz]}
                  rotation={Math.PI / 2}
                />,
              );
            }
          } else if (t === TileType.DR) {
            meshes.push(
              <mesh
                key={keyBase + "-wall"}
                position={[px, WALL_Y, pz]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[TILE_SIZE, WALL_H, TILE_SIZE]} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
              </mesh>,
            );
          } else if (t === TileType.B1) {
            meshes.push(
              <Workbench
                key={keyBase + "-bench"}
                position={[px, 0, pz]}
                variant="main"
              />,
            );
          } else if (t === TileType.B2) {
            const benchVariant = zoneAt(x, y) === "bench" ? "side" : "back";
            const screenMode = BENCH_SCREEN_MODES[(x * 31 + y) % BENCH_SCREEN_MODES.length];
            meshes.push(
              <Workbench
                key={keyBase + "-bench"}
                position={[px, 0, pz]}
                variant={benchVariant}
                screenMode={screenMode}
              />,
            );
          } else if (t === TileType.DO) {
            meshes.push(
              <Counter
                key={keyBase + "-counter"}
                position={[px, 0, pz]}
                variant="orange"
              />,
            );
          } else if (t === TileType.PU) {
            meshes.push(
              <Counter
                key={keyBase + "-counter"}
                position={[px, 0, pz]}
                variant="green"
              />,
            );
          } else if (t === TileType.DG) {
            meshes.push(
              <DiagRack key={keyBase + "-diag"} position={[px, 0, pz]} />,
            );
          } else if (t === TileType.SK) {
            meshes.push(
              <Sink key={keyBase + "-sink"} position={[px, 0, pz]} />,
            );
          }

          return meshes;
        }),
      )}
    </group>
  );
}

const FACING_TO_Y_ROT: Record<string, number> = {
  up: 0,
  down: Math.PI,
  left: Math.PI / 2,
  right: -Math.PI / 2,
};

const LEG_SWING = 0.5;
const ARM_SWING = 0.55;
const WALK_CYCLE_SPEED = 11;

function PlayerCharacter() {
  const prevPos = useRef({ x: 0, y: 0 });
  const walkPhase = useRef(0);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const player = getPlayer();
    if (player == null) return;
    const dx = player.x - prevPos.current.x;
    const dy = player.y - prevPos.current.y;
    prevPos.current = { x: player.x, y: player.y };
    const moving = Math.hypot(dx, dy) > 0.002;
    if (moving) {
      walkPhase.current = (walkPhase.current + delta * WALK_CYCLE_SPEED) % 1;
    } else {
      walkPhase.current *= 0.9;
    }
    const t = walkPhase.current * Math.PI * 2;
    const leftLegAngle = moving ? Math.sin(t) * LEG_SWING : 0;
    const rightLegAngle = moving ? -Math.sin(t) * LEG_SWING : 0;
    const leftArmAngle = moving ? -Math.sin(t) * ARM_SWING : 0;
    const rightArmAngle = moving ? Math.sin(t) * ARM_SWING : 0;
    leftLegRef.current && (leftLegRef.current.rotation.x = leftLegAngle);
    rightLegRef.current && (rightLegRef.current.rotation.x = rightLegAngle);
    leftArmRef.current && (leftArmRef.current.rotation.x = leftArmAngle);
    rightArmRef.current && (rightArmRef.current.rotation.x = rightArmAngle);
  });

  const player = getPlayer();
  if (player == null || typeof player.x !== "number" || typeof player.y !== "number") {
    return null;
  }

  const state = getPublicState();
  const carried = state.carried;
  const px = (player.x - MAP_WIDTH / 2) * TILE_SIZE;
  const pz = (player.y - MAP_HEIGHT / 2) * TILE_SIZE;
  const rotY = FACING_TO_Y_ROT[player.facing] ?? 0;

  return (
    <group position={[px, 0, pz]} rotation={[0, rotY, 0]} scale={PEOPLE_SCALE}>
      {/* Carried PC (in front of torso when carrying) */}
      {carried && (
        <group position={[0, 0.6, 0.26]} scale={[0.85, 0.85, 0.85]}>
          <Tower color={carried.color} />
        </group>
      )}
      {/* Torso — black polo with red collar trim, matching staff uniform */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.35]} />
        <meshStandardMaterial color="#1c1c1c" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.92, 0.001]} castShadow>
        <boxGeometry args={[0.5, 0.08, 0.352]} />
        <meshStandardMaterial color="#d8382c" roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#f5c6a0" />
      </mesh>
      {/* Shadow */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.02, 16]} />
        <meshStandardMaterial color="black" opacity={0.4} transparent />
      </mesh>

      {/* Left leg: thigh + shin, hip at -x */}
      <group ref={leftLegRef} position={[-0.12, 0.25, 0]} rotation={[0, 0, 0]}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <boxGeometry args={[0.11, 0.36, 0.12]} />
          <meshStandardMaterial color="#2a1810" />
        </mesh>
        <group position={[0, -0.36, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <boxGeometry args={[0.1, 0.28, 0.11]} />
            <meshStandardMaterial color="#1e120c" />
          </mesh>
        </group>
      </group>
      {/* Right leg */}
      <group ref={rightLegRef} position={[0.12, 0.25, 0]} rotation={[0, 0, 0]}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <boxGeometry args={[0.11, 0.36, 0.12]} />
          <meshStandardMaterial color="#2a1810" />
        </mesh>
        <group position={[0, -0.36, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <boxGeometry args={[0.1, 0.28, 0.11]} />
            <meshStandardMaterial color="#1e120c" />
          </mesh>
        </group>
      </group>

      {/* Left arm: upper arm + forearm, swings opposite to left leg */}
      <group ref={leftArmRef} position={[-0.26, 0.88, 0]} rotation={[0, 0, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.09, 0.3, 0.09]} />
          <meshStandardMaterial color="#f5c6a0" />
        </mesh>
        <group position={[0, -0.3, 0]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <boxGeometry args={[0.07, 0.24, 0.07]} />
            <meshStandardMaterial color="#f5c6a0" />
          </mesh>
        </group>
      </group>
      {/* Right arm */}
      <group ref={rightArmRef} position={[0.26, 0.88, 0]} rotation={[0, 0, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.09, 0.3, 0.09]} />
          <meshStandardMaterial color="#f5c6a0" />
        </mesh>
        <group position={[0, -0.3, 0]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <boxGeometry args={[0.07, 0.24, 0.07]} />
            <meshStandardMaterial color="#f5c6a0" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/** States where the customer still has a job in flight — shows a mini PC ticket over their head */
const JOB_ACTIVE_STATES = new Set(["waiting", "pw_waiting_pc", "pw_waiting"]);

function CustomerCharacter(props: { customerId: number; color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Mesh>(null);
  const ticketRef = useRef<THREE.Group>(null);
  const prevPos = useRef<{ x: number; y: number } | null>(null);
  const walkPhase = useRef(0);

  useFrame((_, delta) => {
    const state = getPublicState();
    const cust = state.customers.find((c) => c.id === props.customerId);
    if (!cust || !groupRef.current) return;

    const px = (cust.px - MAP_WIDTH / 2) * TILE_SIZE;
    const pz = (cust.py - MAP_HEIGHT / 2) * TILE_SIZE;
    groupRef.current.position.set(px, 0, pz);

    const prev = prevPos.current ?? { x: cust.px, y: cust.py };
    const moving = Math.hypot(cust.px - prev.x, cust.py - prev.y) > 0.001;
    prevPos.current = { x: cust.px, y: cust.py };

    if (moving) {
      walkPhase.current = (walkPhase.current + delta * 9) % 1;
      const dx = cust.px - prev.x;
      const dz = cust.py - prev.y;
      if (Math.hypot(dx, dz) > 0.0001) {
        groupRef.current.rotation.y = Math.atan2(dx, dz);
      }
    } else {
      walkPhase.current *= 0.85;
    }
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.abs(Math.sin(walkPhase.current * Math.PI * 2)) * 0.08;
    }
    if (ticketRef.current) {
      ticketRef.current.position.y = 1.95 + Math.sin(performance.now() * 0.0025) * 0.05;
      ticketRef.current.visible = JOB_ACTIVE_STATES.has(cust.state);
    }

    if (torsoRef.current?.material) {
      const ratio = cust.patience / cust.patienceMax;
      const mat = torsoRef.current.material as THREE.MeshStandardMaterial;
      if (ratio < 0.2 && cust.state !== "leaving") {
        mat.emissive = new THREE.Color(0.8, 0.15, 0.15);
        mat.emissiveIntensity = 0.25 + 0.2 * Math.sin(performance.now() * 0.004);
      } else {
        mat.emissive = new THREE.Color(0, 0, 0);
        mat.emissiveIntensity = 0;
      }
    }
  });

  return (
    <group ref={groupRef} scale={PEOPLE_SCALE}>
      <group ref={bodyRef}>
        <mesh ref={torsoRef} position={[0, 0.65, 0]} castShadow>
          <boxGeometry args={[0.7, 1.3, 0.7]} />
          <meshStandardMaterial color={props.color} roughness={0.75} />
        </mesh>
        <mesh position={[0, 1.42, 0]} castShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#f5c6a0" />
        </mesh>
      </group>
      {/* Mini PC ticket floating above head — shows this customer still has a job in the queue */}
      <group ref={ticketRef} scale={0.55}>
        <Tower color={props.color} />
      </group>
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.02, 16]} />
        <meshStandardMaterial color="black" opacity={0.35} transparent />
      </mesh>
    </group>
  );
}

function Characters() {
  if (!isActive()) return null;

  const state = getPublicState();
  const player = getPlayer();

  return (
    <group>
      {player != null && (
        <PlayerCharacter />
      )}

      {state.customers.map((c) => (
        <CustomerCharacter key={c.id} customerId={c.id} color={c.color} />
      ))}
    </group>
  );
}

const TUTORIAL_STEP_COLOR: Record<string, string> = {
  find_customer: "#E8722A",
  bring_to_bench: "#E8722A",
  watch_repair: "#e8c84a",
  grab_ready: "#6bcb77",
  return_to_customer: "#6bcb77",
};

function TutorialMarker() {
  const ringRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const state = getPublicState();
    const group = ringRef.current;
    if (!group) return;
    if (!state.tutorialStep || !state.tutorialTarget) {
      group.visible = false;
      return;
    }
    group.visible = true;
    const px = (state.tutorialTarget.x - MAP_WIDTH / 2) * TILE_SIZE;
    const pz = (state.tutorialTarget.y - MAP_HEIGHT / 2) * TILE_SIZE;
    group.position.set(px, 0.03, pz);
    const pulse = 0.85 + 0.15 * Math.sin(performance.now() * 0.005);
    group.scale.set(pulse, 1, pulse);
    const mat = materialRef.current;
    if (mat) {
      mat.color.set(TUTORIAL_STEP_COLOR[state.tutorialStep] ?? "#aaa");
      mat.opacity = 0.45 + 0.25 * Math.sin(performance.now() * 0.005);
    }
  });

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.55, 0.75, 32]} />
      <meshBasicMaterial ref={materialRef} color="#E8722A" transparent opacity={0.6} />
    </mesh>
  );
}

