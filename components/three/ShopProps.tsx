"use client";

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

export function Monitor(props: { position?: [number, number, number]; rotation?: number }) {
  const pos = props.position ?? [0, 0, 0];
  const rot = props.rotation ?? 0;
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.2, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.45, 0.28, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.02, 0.02]} castShadow={castShadow}>
        <boxGeometry args={[0.42, 0.22, 0.01]} />
        <meshStandardMaterial color="#0a1628" roughness={0.3} metalness={0.1} />
      </mesh>
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
        <boxGeometry args={[0.2, 0.4, 0.45]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0.06, 0.15, 0.23]}>
        <boxGeometry args={[0.08, 0.12, 0.02]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.18, 0.23]}>
        <cylinderGeometry args={[0.02, 0.02, 0.03, 8]} />
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

// --- Composed furniture (one per tile; position = tile center in parent space) ---

export function Workbench(props: { position?: [number, number, number]; variant?: "main" | "back" | "side" }) {
  const pos = props.position ?? [0, 0, 0];
  const variant = props.variant ?? "main";
  const deskY = 0.5;

  return (
    <group position={pos}>
      <DeskLegs position={[0, 0.24, 0]} />
      {/* main = clean tech bay (only the PC we're working on); back/side = desks with gear */}
      <DeskSurface
        position={[0, deskY, 0]}
        color={variant === "main" ? "#3d403a" : "#4a3728"}
      />

      {variant === "main" ? (
        /* Clean tech bay — no clutter; only the carried/repair PC appears in gameplay */
        null
      ) : variant === "back" ? (
        <>
          <Monitor position={[0, deskY + 0.35, 0]} />
          <Keyboard position={[0, deskY + 0.03, -0.28]} />
        </>
      ) : (
        /* side = right-side metal bench with shelves of gear */
        <>
          <Monitor position={[0, deskY + 0.35, 0.2]} />
          <Shelf position={[0, deskY - 0.2, 0.2]} width={0.85} depth={0.35} color="#2a2520" />
          <Shelf position={[0, deskY - 0.45, 0.2]} width={0.85} depth={0.35} color="#2a2520" />
          <ToolTray position={[-0.28, deskY + 0.04, 0.1]} />
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
      {/* Small keyboard on tech side */}
      <Keyboard position={[-0.2, topY + 0.03, -0.25]} rotation={0} />
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
