"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
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
import { Workbench, Counter, DiagRack, Sink } from "@/components/three/ShopProps";
import {
  PolishedConcreteFloor,
  FloorTileGrid,
  GrassPatch,
  Window,
  PowerPlug,
  AirCon,
  Rain,
  FirstAid,
  WaterCooler,
  CeilingLights,
} from "@/components/three/RoomProps";

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
      gl={{
        antialias: true,
        shadowMap: { type: THREE.PCFShadowMap },
      }}
      camera={{ position: [0, 0, 0], zoom: 40, near: 0.1, far: 200 }}
    >
      <color attach="background" args={["#1e3010"]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[15, 25, 15]} intensity={1.2} castShadow />
      <directionalLight position={[-10, 15, -10]} intensity={0.5} />

      <CeilingLights />
      <IsoCamera />
      <GameLoop keysRef={keysRef} onStateChange={onStateChange} />

      <ShopFloor />
      <NPCTechs />
      <Characters />
      <Rain />
    </Canvas>
  );
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

const NPC_POSITIONS: { x: number; y: number }[] = [
  { x: 12.5, y: 4.8 },
  { x: 13.8, y: 4.8 },
  { x: 14.8, y: 5.2 },
  { x: 14.5, y: 8 },
  { x: 14.5, y: 10 },
];

function NPCTechs() {
  return (
    <group>
      {NPC_POSITIONS.map((pos) => {
        const px = (pos.x - MAP_WIDTH / 2) * TILE_SIZE;
        const pz = (pos.y - MAP_HEIGHT / 2) * TILE_SIZE;
        return (
          <group key={`npc-${pos.x}-${pos.y}`} position={[px, 0, pz]}>
            <mesh position={[0, 0.55, 0]} castShadow>
              <boxGeometry args={[0.45, 0.7, 0.3]} />
              <meshStandardMaterial color="#2a2a3a" roughness={0.8} />
            </mesh>
            <mesh position={[0, 1.1, 0]} castShadow>
              <sphereGeometry args={[0.28, 12, 12]} />
              <meshStandardMaterial color="#e8c8a8" roughness={0.7} />
            </mesh>
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

          const meshes: JSX.Element[] = [];

          // Floor: grass outside, polished concrete interior (tile grid on walkable only)
          if (t === TileType.OUT) {
            meshes.push(
              <GrassPatch key={keyBase + "-floor"} position={[px, 0, pz]} size={TILE_SIZE} />,
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
                position={[px, 0.9, pz]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[TILE_SIZE, 1.8, TILE_SIZE]} />
                <meshStandardMaterial color="#1b1b1b" />
              </mesh>,
            );
            const facing = y === 3 ? "north" : x === 16 ? "east" : "west";
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
                position={[px, 0.9, pz]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[TILE_SIZE, 1.8, TILE_SIZE]} />
                <meshStandardMaterial color="#1b1b1b" />
              </mesh>,
            );
            if ((x === 3 && y === 8) || (x === 16 && y === 8)) {
              const plugX = x === 3 ? px + 0.52 : px - 0.52;
              const plugZ = pz;
              meshes.push(
                <AirCon
                  key={keyBase + "-ac"}
                  position={[plugX, 0.9, plugZ]}
                  rotation={x === 3 ? Math.PI / 2 : -Math.PI / 2}
                />,
              );
            }
            if ((x === 4 && y === 4) || (x === 15 && y === 4)) {
              const plugX = x === 4 ? px + 0.52 : px - 0.52;
              meshes.push(
                <PowerPlug
                  key={keyBase + "-plug"}
                  position={[plugX, 0.9, pz]}
                  rotation={x === 4 ? Math.PI / 2 : -Math.PI / 2}
                />,
              );
            }
            if (x === 3 && y === 6) {
              meshes.push(
                <FirstAid
                  key={keyBase + "-firstaid"}
                  position={[px + 0.52, 0.9, pz]}
                  rotation={Math.PI / 2}
                />,
              );
            }
            if (x === 3 && y === 8) {
              meshes.push(
                <WaterCooler
                  key={keyBase + "-water"}
                  position={[px + 0.52, 0.9, pz]}
                  rotation={Math.PI / 2}
                />,
              );
            }
          } else if (t === TileType.DR) {
            meshes.push(
              <mesh
                key={keyBase + "-wall"}
                position={[px, 0.9, pz]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[TILE_SIZE, 1.8, TILE_SIZE]} />
                <meshStandardMaterial color="#1b1b1b" />
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
            meshes.push(
              <Workbench
                key={keyBase + "-bench"}
                position={[px, 0, pz]}
                variant={benchVariant}
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

  const px = (player.x - MAP_WIDTH / 2) * TILE_SIZE;
  const pz = (player.y - MAP_HEIGHT / 2) * TILE_SIZE;
  const rotY = FACING_TO_Y_ROT[player.facing] ?? 0;

  return (
    <group position={[px, 0, pz]} rotation={[0, rotY, 0]}>
      {/* Torso */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.35]} />
        <meshStandardMaterial color="#c85e1a" />
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

function Characters() {
  if (!isActive()) return null;

  const state = getPublicState();
  const player = getPlayer();

  return (
    <group>
      {player != null && (
        <PlayerCharacter />
      )}

      {state.customers.map((c) => {
        const cx = (c.slot.x - MAP_WIDTH / 2) * TILE_SIZE;
        const cz = (c.slot.y - MAP_HEIGHT / 2) * TILE_SIZE;
        return (
          <group key={c.id} position={[cx, 0, cz]}>
            <mesh position={[0, 0.55, 0]} castShadow>
              <boxGeometry args={[0.6, 1.1, 0.6]} />
              <meshStandardMaterial color={c.color} />
            </mesh>
            <mesh position={[0, 1.2, 0]} castShadow>
              <sphereGeometry args={[0.33, 16, 16]} />
              <meshStandardMaterial color="#f5c6a0" />
            </mesh>
            <mesh position={[0, 0.05, 0]} receiveShadow>
              <cylinderGeometry args={[0.26, 0.26, 0.02, 16]} />
              <meshStandardMaterial color="black" opacity={0.35} transparent />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

