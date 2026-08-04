"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const castShadow = true;
const receiveShadow = true;

// --- Floors ---

export function PolishedConcreteFloor(props: { position: [number, number, number]; size?: number }) {
  const pos = props.position;
  const size = props.size ?? 1;
  return (
    <mesh position={pos} receiveShadow={receiveShadow}>
      <boxGeometry args={[size, 0.05, size]} />
      <meshStandardMaterial
        color="#3d403a"
        roughness={0.35}
        metalness={0.08}
      />
    </mesh>
  );
}

/** Tile grid overlay for polished look - optional thin lines */
export function FloorTileGrid(props: { position: [number, number, number]; size?: number }) {
  const pos = props.position;
  const size = props.size ?? 1;
  const lines: React.ReactElement[] = [];
  for (let i = 0; i <= 4; i++) {
    const o = (i / 4) * size - size / 2;
    lines.push(
      <mesh key={`v-${i}`} position={[o, 0.026, 0]}>
        <boxGeometry args={[0.012, 0.002, size]} />
        <meshStandardMaterial color="#2a2d28" roughness={0.6} />
      </mesh>,
      <mesh key={`h-${i}`} position={[0, 0.026, o]}>
        <boxGeometry args={[size, 0.002, 0.012]} />
        <meshStandardMaterial color="#2a2d28" roughness={0.6} />
      </mesh>,
    );
  }
  return <group position={pos}>{lines}</group>;
}

/** Bitumen/concrete apron outside the building — the real site has no grass around it */
export function ExteriorGround(props: { position: [number, number, number]; size?: number }) {
  const pos = props.position;
  const size = props.size ?? 1;
  return (
    <mesh position={pos} receiveShadow={receiveShadow}>
      <boxGeometry args={[size, 0.05, size]} />
      <meshStandardMaterial
        color="#5f5d54"
        roughness={0.95}
        metalness={0}
      />
    </mesh>
  );
}

// --- Window (for WIN tiles) ---

export function Window(props: { position: [number, number, number]; facing?: "north" | "east" | "west" }) {
  const pos = props.position;
  const facing = props.facing ?? "north";
  const frameW = 0.9;
  const frameH = 0.36;
  const wallY = 0.275;
  const frameThick = 0.06;
  const glassInset = 0.02;

  const rotY = facing === "north" ? 0 : facing === "east" ? -Math.PI / 2 : Math.PI / 2;

  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* Wall recess */}
      <mesh position={[0, wallY, 0]} castShadow={castShadow} receiveShadow={receiveShadow}>
        <boxGeometry args={[frameW + 0.2, frameH + 0.2, 0.15]} />
        <meshStandardMaterial color="#252525" roughness={0.9} />
      </mesh>
      {/* Frame */}
      <mesh position={[0, wallY, 0.08]}>
        <boxGeometry args={[frameW + frameThick, frameH + frameThick, frameThick]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Glass */}
      <mesh position={[0, wallY, 0.08 + glassInset]}>
        <boxGeometry args={[frameW - frameThick, frameH - frameThick, 0.02]} />
        <meshStandardMaterial
          color="#6a8a9a"
          roughness={0.1}
          metalness={0.05}
          transparent
          opacity={0.75}
        />
      </mesh>
      {/* Cross divider */}
      <mesh position={[0, wallY, 0.09]}>
        <boxGeometry args={[frameThick, frameH - frameThick, 0.025]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.6} />
      </mesh>
    </group>
  );
}

// --- Power plug (wall outlet) ---

export function PowerPlug(props: { position: [number, number, number]; rotation?: number }) {
  const pos = props.position;
  const rot = props.rotation ?? 0;
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh castShadow={castShadow}>
        <boxGeometry args={[0.12, 0.08, 0.04]} />
        <meshStandardMaterial color="#f0e8d8" roughness={0.7} />
      </mesh>
      <mesh position={[0.03, 0, 0.025]}>
        <boxGeometry args={[0.02, 0.04, 0.01]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
      <mesh position={[-0.03, 0, 0.025]}>
        <boxGeometry args={[0.02, 0.04, 0.01]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
    </group>
  );
}

// --- First aid (wall) ---

export function FirstAid(props: { position: [number, number, number]; rotation?: number }) {
  const pos = props.position;
  const rot = props.rotation ?? 0;
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.9, 0.06]} castShadow={castShadow}>
        <boxGeometry args={[0.2, 0.28, 0.04]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.9, 0.08]} castShadow={castShadow}>
        <boxGeometry args={[0.08, 0.12, 0.01]} />
        <meshStandardMaterial color="#cc3333" roughness={0.5} />
      </mesh>
    </group>
  );
}

// --- Water cooler (wall) ---

export function WaterCooler(props: { position: [number, number, number]; rotation?: number }) {
  const pos = props.position;
  const rot = props.rotation ?? 0;
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.5, 0.06]} castShadow={castShadow}>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.25, 0.11]} castShadow={castShadow}>
        <boxGeometry args={[0.12, 0.25, 0.08]} />
        <meshStandardMaterial color="#c0d8f0" roughness={0.3} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

// --- Whiteboard (wall-mounted) ---

export function Whiteboard(props: { position: [number, number, number]; rotation?: number }) {
  const pos = props.position;
  const rot = props.rotation ?? 0;
  const w = 0.7;
  const h = 0.5;
  const frameThick = 0.03;
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.9, 0.06]} castShadow={castShadow}>
        <boxGeometry args={[w + frameThick * 2, h + frameThick * 2, 0.04]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.9, 0.08]} castShadow={castShadow}>
        <boxGeometry args={[w, h, 0.01]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.8} />
      </mesh>
      {/* Scribble lines (simple line meshes) */}
      {[
        { x: -0.15, z: 0.05, w: 0.2, h: 0.002 },
        { x: 0.1, z: -0.08, w: 0.15, h: 0.002 },
        { x: -0.2, z: -0.12, w: 0.25, h: 0.002 },
      ].map((line, i) => (
        <mesh key={i} position={[line.x, 0.9, 0.085 + line.z]} castShadow={false}>
          <boxGeometry args={[line.w, line.h, 0.005]} />
          <meshStandardMaterial color="#333" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// --- Wall-mounted AC unit ---

export function AirCon(props: { position: [number, number, number]; rotation?: number }) {
  const pos = props.position;
  const rot = props.rotation ?? 0;
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh castShadow={castShadow}>
        <boxGeometry args={[0.7, 0.35, 0.25]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.13]}>
        <boxGeometry args={[0.6, 0.2, 0.04]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
      <mesh position={[0.2, 0.08, 0.14]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
    </group>
  );
}

// --- Ceiling power cords (hang from ceiling to above benches) ---

const CORD_RADIUS = 0.02;
const CEILING_Y = 1.7;

export function CeilingPowerCords() {
  // Scene space: vertical cords from ceiling down to above workbench/counters
  const cords: { x: number; z: number; endY: number }[] = [
    { x: -1.5, z: -4.5, endY: 0.75 },
    { x: -0.5, z: -5.2, endY: 0.7 },
    { x: -6, z: 3.5, endY: 0.9 },
    { x: 2.5, z: 3.5, endY: 0.9 },
    { x: 7.5, z: -0.5, endY: 0.85 },
  ];
  return (
    <group>
      {cords.map(({ x, z, endY }, i) => {
        const length = CEILING_Y - endY;
        const midY = (CEILING_Y + endY) / 2;
        return (
          <mesh key={i} position={[x, midY, z]} castShadow={castShadow}>
            <cylinderGeometry args={[CORD_RADIUS, CORD_RADIUS, length, 8]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.9} metalness={0.05} />
          </mesh>
        );
      })}
    </group>
  );
}

// --- Ceiling lights (fluorescent strips) ---

export function CeilingLights(props: {
  glitchPhaseRef?: React.MutableRefObject<number>;
}) {
  const stripW = 12;
  const stripH = 0.15;
  const y = 2.2;
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const phase = props.glitchPhaseRef?.current ?? 0;
    if (phase <= 0) return;
    const base = 0.7 * (1 - phase * 0.6);
    const flicker = 0.3 * Math.random() * phase;
    const intensity = Math.max(0.1, base + flicker);
    [leftRef.current, rightRef.current].forEach((mesh) => {
      const mat = mesh?.material as THREE.MeshStandardMaterial | undefined;
      if (mat && "emissiveIntensity" in mat) mat.emissiveIntensity = intensity;
    });
  });

  return (
    <group position={[0, y, 0]}>
      <mesh ref={leftRef} position={[-6, 0, 0]} castShadow={false}>
        <boxGeometry args={[stripW, stripH, 0.3]} />
        <meshStandardMaterial
          color="#fffbe8"
          emissive="#f0e8a0"
          emissiveIntensity={0.7}
          roughness={0.8}
        />
      </mesh>
      <mesh ref={rightRef} position={[6, 0, 0]} castShadow={false}>
        <boxGeometry args={[stripW, stripH, 0.3]} />
        <meshStandardMaterial
          color="#fffbe8"
          emissive="#f0e8a0"
          emissiveIntensity={0.7}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}
