"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const castShadow = true;
const receiveShadow = true;

// --- Primitives (local space; parent positions the group) ---

export function DeskSurface(props: { position?: [number, number, number]; color?: string }) {
  const pos = props.position ?? [0, 0, 0];
  const color = props.color ?? "#4a3728";
  return (
    <mesh position={pos} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={[1, 0.05, 1]} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
    </mesh>
  );
}

export function DeskLegs(props: { position?: [number, number, number]; color?: string }) {
  const pos = props.position ?? [0, 0, 0];
  const color = props.color ?? "#2a1f18";
  const h = 0.48;
  const w = 0.04;
  const d = 0.04;
  const o = 0.45;
  return (
    <group position={pos}>
      {[
        [-o, h / 2, -o],
        [o, h / 2, -o],
        [-o, h / 2, o],
        [o, h / 2, o],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow={castShadow}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export type MonitorScreenMode = "off" | "flicker" | "bios" | "gpu" | "terminal" | "matrix" | "error" | "download";

function MonitorScreen(props: { mode: MonitorScreenMode }) {
  const mode = props.mode;
  const meshRef = useRef<{ material?: { emissiveIntensity?: number } } | null>(null);
  const timeRef = useRef(0);
  const flickerRef = useRef(1);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (mode === "flicker") {
      if (Math.random() < 0.02) flickerRef.current = Math.random() < 0.5 ? 0.15 : 0.9;
      const mat = meshRef.current?.material as { emissiveIntensity?: number } | undefined;
      if (mat && "emissiveIntensity" in mat) mat.emissiveIntensity = flickerRef.current;
    }
  });

  if (mode === "off") {
    return (
      <mesh position={[0, 0.02, 0.02]} castShadow={castShadow}>
        <boxGeometry args={[0.42, 0.22, 0.01]} />
        <meshStandardMaterial color="#0a1628" roughness={0.3} metalness={0.1} />
      </mesh>
    );
  }

  if (mode === "flicker") {
    return (
      <mesh position={[0, 0.02, 0.02]} castShadow={castShadow} ref={meshRef}>
        <boxGeometry args={[0.42, 0.22, 0.01]} />
        <meshStandardMaterial
          color="#1a2a3a"
          emissive="#0a1525"
          emissiveIntensity={flickerRef.current}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
    );
  }

  if (mode === "gpu") {
    const t = (timeRef.current * 0.5) % 1;
    const h = (t * 360) % 360;
    const s = 80;
    const l = 50;
    const hueToRgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s / 100) : l + s / 100 - (l * s) / 100;
    const p = 2 * l - q;
    const r = hueToRgb(p, q, (h / 360 + 1 / 3)) * 255;
    const g = hueToRgb(p, q, h / 360) * 255;
    const b = hueToRgb(p, q, (h / 360 - 1 / 3)) * 255;
    const hex = `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
    return (
      <mesh position={[0, 0.02, 0.02]} castShadow={castShadow}>
        <boxGeometry args={[0.42, 0.22, 0.01]} />
        <meshStandardMaterial
          color={hex}
          emissive={hex}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.05}
        />
      </mesh>
    );
  }

  if (mode === "terminal") {
    const scroll = (timeRef.current * 0.4) % 1;
    const lines = 6;
    return (
      <group position={[0, 0.02, 0.02]}>
        <mesh castShadow={castShadow}>
          <boxGeometry args={[0.42, 0.22, 0.01]} />
          <meshStandardMaterial color="#0a1208" emissive="#0a1208" emissiveIntensity={0.1} roughness={0.3} />
        </mesh>
        {Array.from({ length: lines }, (_, i) => {
          const y = 0.08 - (i / lines) * 0.18 + scroll * 0.22;
          const wrapped = ((y + 0.12) % 0.24) - 0.12;
          return (
            <mesh key={i} position={[0, wrapped, 0.006]} castShadow={false}>
              <boxGeometry args={[0.32 - i * 0.02, 0.014, 0.002]} />
              <meshBasicMaterial color="#22cc44" />
            </mesh>
          );
        })}
      </group>
    );
  }

  if (mode === "matrix") {
    const rows = 8;
    const t = timeRef.current;
    return (
      <group position={[0, 0.02, 0.02]}>
        <mesh castShadow={castShadow}>
          <boxGeometry args={[0.42, 0.22, 0.01]} />
          <meshStandardMaterial color="#051008" emissive="#051008" emissiveIntensity={0.05} roughness={0.3} />
        </mesh>
        {Array.from({ length: rows }, (_, i) => {
          const phase = (t * 5 + i * 2.1) % (Math.PI * 2);
          const intensity = 0.25 + (Math.sin(phase) * 0.5 + 0.5) * 0.6;
          return (
            <mesh key={i} position={[0, 0.09 - (i / (rows - 1)) * 0.18, 0.006]} castShadow={false}>
              <boxGeometry args={[0.38, 0.018, 0.002]} />
              <meshStandardMaterial color="#0a3010" emissive="#22aa44" emissiveIntensity={intensity} roughness={0.2} />
            </mesh>
          );
        })}
      </group>
    );
  }

  if (mode === "error") {
    return (
      <group position={[0, 0.02, 0.02]}>
        <mesh castShadow={castShadow}>
          <boxGeometry args={[0.42, 0.22, 0.01]} />
          <meshStandardMaterial color="#0a0a28" emissive="#102060" emissiveIntensity={0.5} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.04, 0.006]} castShadow={false}>
          <boxGeometry args={[0.4, 0.06, 0.002]} />
          <meshBasicMaterial color="#4466ff" />
        </mesh>
        <mesh position={[0, -0.02, 0.006]} castShadow={false}>
          <boxGeometry args={[0.38, 0.08, 0.002]} />
          <meshBasicMaterial color="#cc2244" />
        </mesh>
        <mesh position={[0, -0.08, 0.006]} castShadow={false}>
          <boxGeometry args={[0.2, 0.02, 0.002]} />
          <meshBasicMaterial color="#8888ff" />
        </mesh>
      </group>
    );
  }

  if (mode === "download") {
    const progress = (timeRef.current * 0.15) % 1;
    return (
      <group position={[0, 0.02, 0.02]}>
        <mesh castShadow={castShadow}>
          <boxGeometry args={[0.42, 0.22, 0.01]} />
          <meshStandardMaterial color="#0a0a12" emissive="#0a0a12" emissiveIntensity={0.1} roughness={0.3} />
        </mesh>
        <mesh position={[-0.18 + 0.18 * progress, -0.06, 0.006]} castShadow={false}>
          <boxGeometry args={[0.36 * progress, 0.04, 0.002]} />
          <meshBasicMaterial color="#44aaff" />
        </mesh>
        <mesh position={[0, -0.06, 0.005]} castShadow={false}>
          <boxGeometry args={[0.36, 0.045, 0.001]} />
          <meshBasicMaterial color="#222233" />
        </mesh>
      </group>
    );
  }

  // bios: blue/amber static blocks
  return (
    <group position={[0, 0.02, 0.02]}>
      <mesh castShadow={castShadow}>
        <boxGeometry args={[0.42, 0.22, 0.01]} />
        <meshStandardMaterial color="#001830" emissive="#002040" emissiveIntensity={0.4} roughness={0.3} />
      </mesh>
      {/* BIOS-style lines */}
      {[
        { y: 0.06, w: 0.35, color: "#4488ff" },
        { y: 0.02, w: 0.2, color: "#4488ff" },
        { y: -0.02, w: 0.38, color: "#ccaa44" },
        { y: -0.06, w: 0.15, color: "#ccaa44" },
      ].map((line, i) => (
        <mesh key={i} position={[0, line.y, 0.006]} castShadow={false}>
          <boxGeometry args={[line.w, 0.012, 0.002]} />
          <meshBasicMaterial color={line.color} />
        </mesh>
      ))}
    </group>
  );
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function GpuStrip(props: { position: [number, number, number]; width: number; height: number }) {
  const meshRef = useRef<{ material?: { color: { setStyle: (s: string) => void }; emissive?: { setStyle: (s: string) => void }; emissiveIntensity: number } } | null>(null);
  const timeRef = useRef(0);
  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = (timeRef.current * 0.5) % 1;
    const h = (t * 360) % 360;
    const l = 0.5;
    const s = 0.8;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hueToRgb(p, q, h / 360 + 1 / 3) * 255;
    const g = hueToRgb(p, q, h / 360) * 255;
    const b = hueToRgb(p, q, h / 360 - 1 / 3) * 255;
    const hex = `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
    const mat = meshRef.current?.material as { color: { setStyle: (s: string) => void }; emissive: { setStyle: (s: string) => void }; emissiveIntensity: number } | undefined;
    if (mat) {
      mat.color.setStyle(hex);
      mat.emissive?.setStyle(hex);
      mat.emissiveIntensity = 0.5;
    }
  });
  return (
    <mesh position={props.position} ref={meshRef}>
      <boxGeometry args={[props.width, props.height, 0.008]} />
      <meshStandardMaterial color="#4488ff" emissive="#2244aa" emissiveIntensity={0.5} roughness={0.2} />
    </mesh>
  );
}

export function Monitor(props: {
  position?: [number, number, number];
  rotation?: number;
  screenMode?: MonitorScreenMode;
}) {
  const pos = props.position ?? [0, 0, 0];
  const rot = props.rotation ?? 0;
  const screenMode = props.screenMode ?? "off";
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.2, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.45, 0.28, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
      </mesh>
      <MonitorScreen mode={screenMode} />
      <mesh position={[0, 0.08, -0.04]} castShadow={castShadow}>
        <boxGeometry args={[0.08, 0.12, 0.04]} />
        <meshStandardMaterial color="#252525" roughness={0.7} />
      </mesh>
    </group>
  );
}

export function Keyboard(props: { position?: [number, number, number]; rotation?: number }) {
  const pos = props.position ?? [0, 0, 0];
  const rot = props.rotation ?? 0;
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
        <boxGeometry args={[0.35, 0.02, 0.12]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[0.32, 0.005, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
    </group>
  );
}

export function Tower(props: { position?: [number, number, number]; color?: string }) {
  const pos = props.position ?? [0, 0, 0];
  const color = props.color ?? "#1e1e1e";
  return (
    <group position={pos}>
      <mesh castShadow={castShadow}>
        <boxGeometry args={[0.28, 0.56, 0.63]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0.08, 0.21, 0.32]}>
        <boxGeometry args={[0.11, 0.17, 0.02]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.25, 0.32]}>
        <cylinderGeometry args={[0.028, 0.028, 0.04, 8]} />
        <meshStandardMaterial color="#333" roughness={0.6} metalness={0.4} />
      </mesh>
    </group>
  );
}

export function Mouse(props: { position?: [number, number, number] }) {
  const pos = props.position ?? [0, 0, 0];
  return (
    <mesh position={pos} castShadow={castShadow}>
      <boxGeometry args={[0.06, 0.02, 0.1]} />
      <meshStandardMaterial color="#222" roughness={0.5} />
    </mesh>
  );
}

export function Chair(props: { position?: [number, number, number] }) {
  const pos = props.position ?? [0, 0, 0];
  return (
    <group position={pos}>
      <mesh position={[0, 0.22, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.45, -0.15]} castShadow={castShadow}>
        <boxGeometry args={[0.5, 0.4, 0.06]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.8} />
      </mesh>
      <mesh position={[0.22, 0.15, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.06, 0.3, 0.5]} />
        <meshStandardMaterial color="#2a2015" roughness={0.9} />
      </mesh>
      <mesh position={[-0.22, 0.15, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.06, 0.3, 0.5]} />
        <meshStandardMaterial color="#2a2015" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function Shelf(props: {
  position?: [number, number, number];
  width?: number;
  depth?: number;
  color?: string;
}) {
  const pos = props.position ?? [0, 0, 0];
  const w = props.width ?? 0.9;
  const d = props.depth ?? 0.3;
  const color = props.color ?? "#3a3025";
  return (
    <mesh position={pos} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={[w, 0.04, d]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

export function ToolTray(props: { position?: [number, number, number]; color?: string }) {
  const pos = props.position ?? [0, 0, 0];
  const color = props.color ?? "#2a2218";
  return (
    <group position={pos}>
      <mesh castShadow={castShadow}>
        <boxGeometry args={[0.25, 0.04, 0.15]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0.04, 0.025, 0.02]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 6]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[-0.05, 0.025, -0.02]}>
        <boxGeometry args={[0.06, 0.02, 0.03]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
    </group>
  );
}

export function SinkBasin(props: { position?: [number, number, number] }) {
  const pos = props.position ?? [0, 0, 0];
  return (
    <group position={pos}>
      <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
        <boxGeometry args={[0.4, 0.12, 0.35]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.35, 0.06, 0.3]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  );
}

export function Cabinet(props: {
  position?: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
}) {
  const pos = props.position ?? [0, 0, 0];
  const w = props.width ?? 1;
  const h = props.height ?? 0.8;
  const d = props.depth ?? 0.5;
  const color = props.color ?? "#2a2520";
  return (
    <mesh position={pos} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
    </mesh>
  );
}

export function Tap(props: { position?: [number, number, number] }) {
  const pos = props.position ?? [0, 0, 0];
  return (
    <group position={pos}>
      <mesh position={[0, 0.08, 0]} castShadow={castShadow}>
        <cylinderGeometry args={[0.03, 0.04, 0.08, 12]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.14, 0.04]} castShadow={castShadow}>
        <cylinderGeometry args={[0.015, 0.015, 0.08, 8]} />
        <meshStandardMaterial color="#a0a0a0" roughness={0.35} metalness={0.5} />
      </mesh>
    </group>
  );
}

export function Cup(props: { position?: [number, number, number]; color?: string }) {
  const pos = props.position ?? [0, 0, 0];
  const color = props.color ?? "#e8d8c0";
  return (
    <group position={pos}>
      <mesh castShadow={castShadow}>
        <cylinderGeometry args={[0.04, 0.035, 0.08, 12]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0} />
      </mesh>
      <mesh position={[0.05, 0, 0]} castShadow={castShadow}>
        <torusGeometry args={[0.02, 0.008, 8, 12, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  );
}

// --- Composed furniture (one per tile; position = tile center in parent space) ---

export function Workbench(props: {
  position?: [number, number, number];
  variant?: "main" | "back" | "side";
  screenMode?: MonitorScreenMode;
}) {
  const pos = props.position ?? [0, 0, 0];
  const variant = props.variant ?? "main";
  const deskY = 0.5;
  const screenMode =
    props.screenMode ??
    (variant === "back" ? "bios" : variant === "side" ? "flicker" : "off");

  return (
    <group position={pos}>
      <DeskLegs position={[0, 0.24, 0]} />
      {/* main = clean tech bay (only the PC we're working on); back/side = desks with gear */}
      <DeskSurface
        position={[0, deskY, 0]}
        color={variant === "main" ? "#6b6f66" : "#4a3728"}
      />
      {variant === "main" && (
        <mesh position={[0, deskY + 0.001, 0]} receiveShadow={receiveShadow}>
          <boxGeometry args={[0.94, 0.001, 0.94]} />
          <meshStandardMaterial color="#7d8177" roughness={0.5} metalness={0.15} />
        </mesh>
      )}

      {variant === "main" ? (
        /* Clean tech bay — no clutter; only the carried/repair PC appears in gameplay */
        null
      ) : variant === "back" ? (
        <>
          <Monitor position={[0, deskY + 0.35, 0]} screenMode={screenMode} />
          <Keyboard position={[0, deskY + 0.03, -0.28]} />
          <Cup position={[0.32, deskY + 0.06, 0.22]} />
        </>
      ) : (
        /* side = right-side metal bench with shelves of gear */
        <>
          <Monitor position={[0, deskY + 0.35, 0.2]} screenMode={screenMode} />
          <Shelf position={[0, deskY - 0.2, 0.2]} width={0.85} depth={0.35} color="#2a2520" />
          <Shelf position={[0, deskY - 0.45, 0.2]} width={0.85} depth={0.35} color="#2a2520" />
          <ToolTray position={[-0.28, deskY + 0.04, 0.1]} />
          <Cup position={[-0.25, deskY + 0.06, -0.15]} color="#f0e8e0" />
        </>
      )}
    </group>
  );
}

export function Counter(props: {
  position?: [number, number, number];
  variant?: "orange" | "green";
}) {
  const pos = props.position ?? [0, 0, 0];
  const variant = props.variant ?? "orange";
  const surfaceColor = variant === "orange" ? "#E8722A" : "#6bcb77";
  const darkColor = variant === "orange" ? "#c85e1a" : "#4a9e55";
  const topY = 0.75;

  return (
    <group position={pos}>
      <mesh position={[0, 0.38, 0]} castShadow={castShadow} receiveShadow={receiveShadow}>
        <boxGeometry args={[1, 0.75, 1]} />
        <meshStandardMaterial color={darkColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, topY, 0]} castShadow={castShadow} receiveShadow={receiveShadow}>
        <boxGeometry args={[1, 0.04, 1]} />
        <meshStandardMaterial color={surfaceColor} roughness={0.7} />
      </mesh>
      {/* Divider / screen strip on customer side */}
      <mesh position={[0, topY + 0.08, 0.4]} castShadow={castShadow}>
        <boxGeometry args={[0.9, 0.12, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, topY + 0.08, 0.4]}>
        <boxGeometry args={[0.7, 0.08, 0.02]} />
        <meshStandardMaterial color="#0a1628" roughness={0.3} />
      </mesh>
      <GpuStrip position={[0, topY + 0.08, 0.41]} width={0.68} height={0.06} />
      {/* Small keyboard on tech side */}
      <Keyboard position={[-0.2, topY + 0.03, -0.25]} rotation={0} />
      <Cup position={[0.25, topY + 0.05, -0.2]} color="#fff5e8" />
    </group>
  );
}

export function DiagRack(props: { position?: [number, number, number] }) {
  const pos = props.position ?? [0, 0, 0];
  return (
    <group position={pos}>
      {/* Uprights */}
      <mesh position={[-0.4, 0.5, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.05, 0.6, 0.05]} />
        <meshStandardMaterial color="#2a2520" roughness={0.8} />
      </mesh>
      <mesh position={[0.4, 0.5, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.05, 0.6, 0.05]} />
        <meshStandardMaterial color="#2a2520" roughness={0.8} />
      </mesh>
      {/* Shelves */}
      <Shelf position={[0, 0.25, 0]} width={0.85} depth={0.35} />
      <Shelf position={[0, 0.5, 0]} width={0.85} depth={0.35} />
      <Shelf position={[0, 0.75, 0]} width={0.85} depth={0.35} />
      {/* Small PCs on shelves */}
      <group position={[-0.25, 0.26, 0]}>
        <mesh castShadow={castShadow}>
          <boxGeometry args={[0.18, 0.15, 0.25]} />
          <meshStandardMaterial color="#1e1e1e" roughness={0.7} />
        </mesh>
      </group>
      <group position={[0.2, 0.26, 0]}>
        <mesh castShadow={castShadow}>
          <boxGeometry args={[0.15, 0.12, 0.2]} />
          <meshStandardMaterial color="#252525" roughness={0.7} />
        </mesh>
      </group>
      <group position={[0, 0.51, 0]}>
        <mesh castShadow={castShadow}>
          <boxGeometry args={[0.2, 0.18, 0.28]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

export function Sink(props: { position?: [number, number, number] }) {
  const pos = props.position ?? [0, 0, 0];
  const cabinetH = 0.6;
  const topY = cabinetH + 0.02;

  return (
    <group position={pos}>
      <Cabinet position={[0, cabinetH / 2, 0]} height={cabinetH} color="#2a2520" />
      <mesh position={[0, topY, 0]} castShadow={castShadow} receiveShadow={receiveShadow}>
        <boxGeometry args={[1, 0.04, 1]} />
        <meshStandardMaterial color="#3a3530" roughness={0.6} />
      </mesh>
      <SinkBasin position={[-0.1, topY + 0.1, 0]} />
      <Tap position={[0.15, topY + 0.08, 0.1]} />
    </group>
  );
}
