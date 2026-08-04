"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type * as THREE from "three";
import { MAP_WIDTH, STRIP_Z } from "@/game/map";

/**
 * Y-rotation that faces a Kenney vehicle (local forward = +Z) toward its
 * direction of travel along X: +90° for +X travel, -90° for -X travel.
 */
export function facingRotY(dx: number): number {
  return dx >= 0 ? Math.PI / 2 : -Math.PI / 2;
}
const STRIP_WIDTH = MAP_WIDTH;
const CAR_SPEED_MIN = 1.5;
const CAR_SPEED_MAX = 3.5;
const NUM_MOVING_CARS = 5;
const VEHICLE_SCALE = 0.45;

const MOVING_VEHICLE_SRCS = [
  "/models/sedan.glb",
  "/models/van.glb",
  "/models/taxi.glb",
  "/models/delivery.glb",
  "/models/hatchback-sports.glb",
] as const;

// ── Error boundary ────────────────────────────────────────────────────────────

export class VehicleErrorBoundary extends React.Component<
  Readonly<{ children: React.ReactNode; fallback?: React.ReactNode }>,
  { err: boolean }
> {
  state = { err: false };
  static getDerivedStateFromError() {
    return { err: true };
  }
  render() {
    if (this.state.err) return this.props.fallback ?? null;
    return this.props.children;
  }
}

// ── Shared GLB primitive ───────────────────────────────────────────────────────

export function VehicleModel(
  props: Readonly<{
    src: string;
    position?: [number, number, number];
    scale?: number;
    rotation?: [number, number, number];
  }>
) {
  const { scene } = useGLTF(props.src);
  const clone = useMemo(() => scene.clone(true), [scene]);
  const s = props.scale ?? VEHICLE_SCALE;
  return (
    <primitive
      object={clone}
      position={props.position ?? [0, 0, 0]}
      scale={[s, s, s]}
      rotation={props.rotation ?? [0, 0, 0]}
    />
  );
}

/** Renders a GLB in a Suspense + error-boundary shell — safe to use anywhere */
export function SafeModel(
  props: Readonly<{
    src: string;
    position?: [number, number, number];
    scale?: number;
    rotation?: [number, number, number];
  }>
) {
  return (
    <VehicleErrorBoundary>
      <React.Suspense fallback={null}>
        <VehicleModel {...props} />
      </React.Suspense>
    </VehicleErrorBoundary>
  );
}

// ── Moving vehicle ─────────────────────────────────────────────────────────────

function MovingCar(
  props: Readonly<{
    initialX: number;
    speed: number;
    vehicleSrc: string;
  }>
) {
  const groupRef = useRef<THREE.Group>(null);
  const xRef = useRef(props.initialX);
  const { speed, vehicleSrc } = props;
  const init = useRef(true);

  const rot: [number, number, number] = [0, facingRotY(speed), 0];

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (init.current) {
      init.current = false;
      groupRef.current.position.set(xRef.current, 0, STRIP_Z);
    }
    xRef.current += speed * delta;
    if (xRef.current > STRIP_WIDTH / 2 + 1) xRef.current = -STRIP_WIDTH / 2 - 1;
    if (xRef.current < -STRIP_WIDTH / 2 - 1) xRef.current = STRIP_WIDTH / 2 + 1;
    groupRef.current.position.x = xRef.current;
  });

  return (
    <group ref={groupRef}>
      <SafeModel src={vehicleSrc} scale={VEHICLE_SCALE * 0.9} rotation={rot} />
    </group>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

export function FrontStrip() {
  const movingCarsRef = useRef<
    { x: number; speed: number; vehicleSrc: string }[] | null
  >(null);
  movingCarsRef.current ??= Array.from({ length: NUM_MOVING_CARS }, (_, i) => ({
    x: (Math.random() - 0.5) * STRIP_WIDTH,
    speed:
      (Math.random() > 0.5 ? 1 : -1) *
      (CAR_SPEED_MIN + Math.random() * (CAR_SPEED_MAX - CAR_SPEED_MIN)),
    vehicleSrc: MOVING_VEHICLE_SRCS[i % MOVING_VEHICLE_SRCS.length],
  }));
  const movingCars = movingCarsRef.current ?? [];

  // Tile counts for road + sidewalk rows (each Kenney road tile = 1 unit wide)
  const half = Math.ceil(STRIP_WIDTH / 2);
  const roadXs = Array.from({ length: STRIP_WIDTH + 2 }, (_, i) => i - half);

  return (
    <group>
      {/* ── Road tiles (road-straight.glb, rotated to run along X) ── */}
      {roadXs.map((x) => (
        <SafeModel
          key={`road-${x}`}
          src="/models/road-straight.glb"
          position={[x + 0.5, 0, STRIP_Z]}
          rotation={[0, Math.PI / 2, 0]}
          scale={1}
        />
      ))}

      {/* ── Sidewalk on building side ── */}
      {roadXs.map((x) => (
        <SafeModel
          key={`side-${x}`}
          src="/models/road-side.glb"
          position={[x + 0.5, 0, STRIP_Z - 1]}
          rotation={[0, Math.PI / 2, 0]}
          scale={1}
        />
      ))}

      {/* ── Street lights ── */}
      {[-8, -4, 4, 8].map((x) => (
        <SafeModel
          key={`light-${x}`}
          src="/models/light-square.glb"
          position={[x, 0, STRIP_Z - 1]}
          scale={1}
        />
      ))}

      {/* ── Parked cars far side of road ── */}
      <SafeModel
        src="/models/truck.glb"
        position={[-6, 0, STRIP_Z + 0.9]}
        rotation={[0, Math.PI / 2, 0]}
        scale={VEHICLE_SCALE * 0.8}
      />
      <SafeModel
        src="/models/sedan-sports.glb"
        position={[5, 0, STRIP_Z + 0.9]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={VEHICLE_SCALE * 0.85}
      />
      <SafeModel
        src="/models/police.glb"
        position={[0, 0, STRIP_Z + 0.9]}
        rotation={[0, Math.PI / 2, 0]}
        scale={VEHICLE_SCALE * 0.85}
      />

      {/* ── Moving vehicles ── */}
      {movingCars.map((c, i) => (
        <VehicleErrorBoundary key={`moving-${c.vehicleSrc}-${i}`}>
          <React.Suspense fallback={null}>
            <MovingCar
              initialX={c.x}
              speed={c.speed}
              vehicleSrc={c.vehicleSrc}
            />
          </React.Suspense>
        </VehicleErrorBoundary>
      ))}
    </group>
  );
}
