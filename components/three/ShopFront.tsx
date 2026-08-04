"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type * as THREE from "three";
import {
  facingRotY,
  FrontStrip,
  SafeModel,
  VehicleErrorBoundary,
} from "@/components/three/FrontStrip";
import { getPublicState } from "@/game/engine";
import {
  CAR_BAY_X,
  CAR_BAY_Z,
  MAP_WIDTH,
  PAVEMENT_Z,
} from "@/game/map";

/**
 * Branded fascia sign — black band + red wordmark, mounted on the
 * south exterior wall face above the entrance.
 */
function ShopSign() {
  const signZ = 6.58;
  const signY = 0.85;
  return (
    <group position={[-1, signY, signZ]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[15, 0.5, 0.08]} />
        <meshStandardMaterial color="#0e0e0e" roughness={0.6} metalness={0.15} />
      </mesh>
      <Text
        position={[0, 0.02, 0.05]}
        fontSize={0.32}
        color="#d8382c"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.02}
      >
        THE COMPUTER WORKSHOP
      </Text>
    </group>
  );
}

/**
 * Tan corrugated fascia running around the building perimeter — reads as a
 * shared awning roofline (real site: one continuous tan roof over several
 * adjoining tenancies), without capping the interior so the camera still
 * sees straight in.
 */
function RoofFascia() {
  const y = 0.62;
  const h = 0.14;
  const th = 0.26;
  const xMin = -11.6;
  const xMax = 10.6;
  const zMin = -8.6;
  const zMax = 6.35;
  const color = "#b89968";
  return (
    <group>
      <mesh position={[(xMin + xMax) / 2, y, zMin]} castShadow>
        <boxGeometry args={[xMax - xMin + th, h, th]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      <mesh position={[(xMin + xMax) / 2, y, zMax]} castShadow>
        <boxGeometry args={[xMax - xMin + th, h, th]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      <mesh position={[xMin, y, (zMin + zMax) / 2]} castShadow>
        <boxGeometry args={[th, h, zMax - zMin + th]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      <mesh position={[xMax, y, (zMin + zMax) / 2]} castShadow>
        <boxGeometry args={[th, h, zMax - zMin + th]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
    </group>
  );
}

/**
 * Flanking neighbor-unit blocks (west: warm tan like "Barbers Barn",
 * east: cooler grey like "Keypower Systems") so the shop reads as one
 * tenancy in a row of shared-wall units, not a standalone building.
 */
function NeighborUnits() {
  const depth = 8;
  const centerZ = 1;
  const wallH = 0.5;
  return (
    <group>
      <mesh position={[-14, wallH / 2, centerZ]} castShadow receiveShadow>
        <boxGeometry args={[4.5, wallH, depth]} />
        <meshStandardMaterial color="#8a7554" roughness={0.85} />
      </mesh>
      <mesh position={[-14, wallH + 0.06, centerZ]} castShadow>
        <boxGeometry args={[4.9, 0.12, depth + 0.4]} />
        <meshStandardMaterial color="#b89968" roughness={0.75} />
      </mesh>
      <mesh position={[14.5, wallH / 2, centerZ]} castShadow receiveShadow>
        <boxGeometry args={[5.5, wallH, depth]} />
        <meshStandardMaterial color="#8c8a80" roughness={0.8} />
      </mesh>
      <mesh position={[14.5, wallH + 0.06, centerZ]} castShadow>
        <boxGeometry args={[5.9, 0.12, depth + 0.4]} />
        <meshStandardMaterial color="#c9c5bb" roughness={0.7} />
      </mesh>
    </group>
  );
}

/**
 * ShopFront — everything outside the building walls.
 * Road + vehicles live in FrontStrip.
 * Here we add customer cars parked near the entrance,
 * construction props, and signage to sell the repair-shop vibe.
 *
 * World-space notes (map 26×20, offset = [-13, 0, -10]):
 *   South building wall  z ≈ 6    (tile y=16)
 *   Outside/exit path    z ≈ 7    (tile y=17)
 *   Pavement / parked    z ≈ 9–10
 *   Road centre          z = STRIP_Z (MAP_HEIGHT/2 + 2 = 12)
 */

// Vehicle scale base — sized so a parked car reads at roughly true proportion
// next to a customer character (see PEOPLE_SCALE in ThreeGame.tsx), not the
// smaller scale used for background road traffic in FrontStrip.
const V = 0.85;

const BAY_X = CAR_BAY_X;
const BAY_PARKED_ROT = [Math.PI * 0.6, Math.PI / 2, Math.PI * 0.85];
const BAY_Z = CAR_BAY_Z;
const CAR_VEHICLE_SRCS = [
  "/models/sedan.glb",
  "/models/van.glb",
  "/models/suv.glb",
  "/models/taxi.glb",
  "/models/hatchback-sports.glb",
];
const CAR_VEHICLE_SCALES = [0.9, 0.85, 0.8, 0.85, 0.8];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Asphalt ground + painted bay-line markings for the customer parking area.
 * Fills the gap between the shop floor (z ≈ 9) and the sidewalk (z ≈ 11),
 * where cars would otherwise render floating over the scene background.
 */
function ParkingLot() {
  const lotZ = PAVEMENT_Z + 0.1;
  const lotDepth = 2.2;
  const bayWidth = 2.2;
  const bayDepth = 2.4;

  return (
    <group>
      <mesh position={[0, 0.005, lotZ]} receiveShadow>
        <boxGeometry args={[MAP_WIDTH, 0.03, lotDepth]} />
        <meshStandardMaterial color="#3a3a3d" roughness={0.95} />
      </mesh>
      {BAY_X.map((bx) => (
        <group key={`bay-${bx}`}>
          <mesh position={[bx - bayWidth / 2, 0.03, PAVEMENT_Z]}>
            <boxGeometry args={[0.06, 0.01, bayDepth]} />
            <meshStandardMaterial color="#e8e6df" roughness={0.6} />
          </mesh>
          <mesh position={[bx + bayWidth / 2, 0.03, PAVEMENT_Z]}>
            <boxGeometry args={[0.06, 0.01, bayDepth]} />
            <meshStandardMaterial color="#e8e6df" roughness={0.6} />
          </mesh>
          <mesh position={[bx, 0.03, PAVEMENT_Z - bayDepth / 2]}>
            <boxGeometry args={[bayWidth, 0.01, 0.06]} />
            <meshStandardMaterial color="#e8e6df" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** One arriving/parked/leaving customer car — reads its own live state each frame */
function CustomerCar({ carId }: Readonly<{ carId: number }>) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const car = getPublicState().cars.find((c) => c.id === carId);
    if (!car || !groupRef.current) return;
    const baseX = BAY_X[car.bay];
    const parkedRot = BAY_PARKED_ROT[car.bay];
    const offscreenX = baseX + (car.bay % 2 === 0 ? -7 : 7);

    let x: number = baseX;
    let rotY: number = parkedRot;
    if (car.state === "incoming") {
      x = lerp(offscreenX, baseX, car.progress);
      const travelRot = facingRotY(baseX - offscreenX);
      rotY =
        car.progress > 0.75
          ? lerp(travelRot, parkedRot, (car.progress - 0.75) / 0.25)
          : travelRot;
    } else if (car.state === "leaving") {
      x = lerp(baseX, offscreenX, car.progress);
      const travelRot = facingRotY(offscreenX - baseX);
      rotY =
        car.progress < 0.25
          ? lerp(parkedRot, travelRot, car.progress / 0.25)
          : travelRot;
    }

    groupRef.current.position.set(x, 0, BAY_Z[car.bay]);
    groupRef.current.rotation.y = rotY;
  });

  const car = getPublicState().cars.find((c) => c.id === carId);
  if (!car) return null;
  const src = CAR_VEHICLE_SRCS[car.vehicleIndex % CAR_VEHICLE_SRCS.length];
  const scale = V * CAR_VEHICLE_SCALES[car.vehicleIndex % CAR_VEHICLE_SCALES.length];

  return (
    <group ref={groupRef} position={[BAY_X[car.bay], 0, BAY_Z[car.bay]]}>
      <VehicleErrorBoundary>
        <React.Suspense fallback={null}>
          <SafeModel src={src} scale={scale} />
        </React.Suspense>
      </VehicleErrorBoundary>
    </group>
  );
}

/** Cars parked/arriving/leaving the shop-side pavement, driven by the engine's car spawn state machine */
function CustomerCars() {
  const state = getPublicState();
  return (
    <group>
      {state.cars.map((c) => (
        <CustomerCar key={c.id} carId={c.id} />
      ))}
    </group>
  );
}

export function ShopFront() {
  const π = Math.PI;

  return (
    <group>
      {/* ── Road + moving traffic (handles its own GLB loading) ── */}
      <FrontStrip />

      {/* ── Shared strip-mall context: fascia roofline + adjoining units ── */}
      <RoofFascia />
      <NeighborUnits />

      {/* ── Branded fascia sign above the entrance ── */}
      <React.Suspense fallback={null}>
        <ShopSign />
      </React.Suspense>

      {/* ── Customer parking lot: asphalt + painted bay lines ── */}
      <ParkingLot />

      {/* ══════════════════════════════════════════════════════════
          CUSTOMER VEHICLES — driven by the engine's car spawn state
          machine (arrive, park, unload passengers, leave)
      ══════════════════════════════════════════════════════════ */}
      <CustomerCars />

      {/* ══════════════════════════════════════════════════════════
          SIGNAGE
      ══════════════════════════════════════════════════════════ */}
      <SafeModel
        src="/models/sign-highway-wide.glb"
        position={[-10, 0, PAVEMENT_Z + 0.5]}
        rotation={[0, π / 2, 0]}
        scale={0.55}
      />
      <SafeModel
        src="/models/sign-highway.glb"
        position={[10, 0, PAVEMENT_Z + 0.5]}
        rotation={[0, -π / 2, 0]}
        scale={0.55}
      />

      {/* ══════════════════════════════════════════════════════════
          GARBAGE / DELIVERY TRUCKS — parked at far left
      ══════════════════════════════════════════════════════════ */}
      <VehicleErrorBoundary>
        <React.Suspense fallback={null}>
          <SafeModel
            src="/models/garbage-truck.glb"
            position={[-10, 0, PAVEMENT_Z - 0.2]}
            rotation={[0, π / 2, 0]}
            scale={V * 0.7}
          />
        </React.Suspense>
      </VehicleErrorBoundary>
    </group>
  );
}
