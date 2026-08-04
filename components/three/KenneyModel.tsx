"use client";

import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Monitor } from "@/components/three/ShopProps";

export interface KenneyModelProps {
  src: string;
  position?: [number, number, number];
  scale?: number | [number, number, number];
  rotation?: [number, number, number];
  clone?: boolean;
}

export function KenneyModel({
  src,
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  clone = true,
}: Readonly<KenneyModelProps>) {
  const { scene } = useGLTF(src);
  const obj = useMemo(() => (clone ? scene.clone(true) : scene), [scene, clone]);
  const s = Array.isArray(scale) ? scale : [scale, scale, scale];
  return (
    <primitive
      object={obj}
      position={position}
      scale={s as [number, number, number]}
      rotation={rotation}
    />
  );
}

class Boundary extends React.Component<
  Readonly<{ children: React.ReactNode }>,
  { err: boolean }
> {
  state = { err: false };
  static getDerivedStateFromError() {
    return { err: true };
  }
  render() {
    return this.state.err ? null : this.props.children;
  }
}

function Prop(props: Readonly<KenneyModelProps>) {
  return (
    <Boundary>
      <React.Suspense fallback={null}>
        <KenneyModel {...props} />
      </React.Suspense>
    </Boundary>
  );
}

/**
 * Kenney-employee character wrapped in an error boundary.
 * Exported so ThreeGame can use it for NPC techs.
 */
export function CharacterEmployee(
  props: Readonly<{
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
  }>
) {
  return (
    <Prop
      src="/models/character-employee.glb"
      position={props.position ?? [0, 0, 0]}
      rotation={props.rotation ?? [0, 0, 0]}
      scale={props.scale ?? 0.8}
    />
  );
}

/**
 * World-space positioning guide (map 26×20, tile → world: (tx − 13, ty − 10)):
 *   Rear bench       B2  ty=3         world z ≈ −6.5              desk surface y = 0.5
 *   Rear projection  B2  tx=12–13,ty=4 world x ≈ −0.5  z ≈ −5.5
 *   L-desk (vert.)   B2  tx=3–4,ty=5–10  world x ≈ −9.5  z ≈ −4.5..0.5
 *   L-desk (horiz.)  B2  tx=5–8,ty=9–10  world x ≈ −6.5  z ≈ −0.5..0.5
 *   Central island   B1  tx=9–16,ty=8–10 world x ≈ −0.5  z ≈ −1
 *   Utility/sink         tx=3,ty=12–13   world x ≈ −10   z ≈ 2..3
 *   Service counter  DO/PU ty=12–13   world z ≈ 2..3   top y = 0.79
 *     drop-off (orange) tx=9–13  world x ≈ −4..0
 *     pickup   (green)  tx=14–18 world x ≈ 1..5
 *   Customer wait    ty=14–15   world z ≈ 4..5
 *
 * Monitor height rule: desk surface y=0.5, monitor group y = 0.85 (= 0.5 + 0.35).
 */
const MM = (name: string) => `/models/${name}`;
const FK = (name: string) => `/models/GLTF%20format/${name}`;

export function OptionalKenneyModels() {
  const π = Math.PI;

  return (
    <group>

      {/* ══════════════════════════════════════════════════════════════
          BACK BENCH ROW  (B2, world z ≈ −6.5, desk top y = 0.5)
      ══════════════════════════════════════════════════════════════ */}

      <Monitor position={[-7,   0.85, -6.5]} screenMode="terminal"  rotation={π} />
      <Monitor position={[-5,   0.85, -6.5]} screenMode="matrix"    rotation={π} />
      <Monitor position={[-3,   0.85, -6.5]} screenMode="bios"      rotation={π} />
      <Monitor position={[-1,   0.85, -6.5]} screenMode="gpu"       rotation={π} />
      <Monitor position={[1,    0.85, -6.5]} screenMode="error"     rotation={π} />
      <Monitor position={[3,    0.85, -6.5]} screenMode="download"  rotation={π} />
      <Monitor position={[5,    0.85, -6.5]} screenMode="flicker"   rotation={π} />

      <Prop src={FK("laptop.glb")}           position={[-7,   0.55, -6.3]} scale={0.65} rotation={[0, π * 0.8, 0]} />
      <Prop src={FK("laptop.glb")}           position={[-3,   0.55, -6.3]} scale={0.65} rotation={[0, π * 0.9, 0]} />
      <Prop src={FK("laptop.glb")}           position={[3,    0.55, -6.3]} scale={0.65} rotation={[0, π,       0]} />
      <Prop src={FK("computerKeyboard.glb")} position={[-1,   0.55, -6.3]} scale={0.7}  rotation={[0, π,       0]} />
      <Prop src={FK("computerKeyboard.glb")} position={[5,    0.55, -6.3]} scale={0.7}  rotation={[0, π,       0]} />
      <Prop src={FK("computerMouse.glb")}    position={[-0.6, 0.55, -6.15]} scale={0.7} rotation={[0, π,       0]} />
      <Prop src={FK("computerMouse.glb")}    position={[5.4,  0.55, -6.15]} scale={0.7} rotation={[0, π,       0]} />

      {/* ══════════════════════════════════════════════════════════════
          REAR PROJECTING BENCH  (B2, tx=12–13,ty=4, world x ≈ −0.5 z ≈ −5.5)
      ══════════════════════════════════════════════════════════════ */}
      <Monitor position={[-0.5, 0.85, -5.5]} screenMode="terminal" rotation={0} />
      <Prop src={FK("computerKeyboard.glb")} position={[-0.5, 0.55, -5.3]} scale={0.7} rotation={[0, 0, 0]} />

      {/* ══════════════════════════════════════════════════════════════
          L-SHAPED DESK — vertical arm (B2, tx=3–4, ty=5–10, world x ≈ −9.5)
      ══════════════════════════════════════════════════════════════ */}
      <Monitor position={[-9.4, 0.85, -4.5]} screenMode="bios"     rotation={π / 2} />
      <Monitor position={[-9.4, 0.85, -2.5]} screenMode="flicker"  rotation={π / 2} />
      <Monitor position={[-9.4, 0.85, -0.5]} screenMode="download" rotation={π / 2} />
      <Prop src={FK("computerKeyboard.glb")} position={[-9.1, 0.55, -4.3]} scale={0.7} rotation={[0, π / 2, 0]} />
      <Prop src={FK("computerMouse.glb")}    position={[-9.1, 0.55, -3.9]} scale={0.7} rotation={[0, π / 2, 0]} />

      {/* ══════════════════════════════════════════════════════════════
          L-SHAPED DESK — horizontal arm (B2, tx=5–8, ty=9–10, world z ≈ −0.5..0.5)
      ══════════════════════════════════════════════════════════════ */}
      <Monitor position={[-7.5, 0.85, 0.5]} screenMode="matrix"   rotation={π} />
      <Monitor position={[-6,   0.85, 0.5]} screenMode="gpu"      rotation={π} />
      <Prop src={FK("laptop.glb")} position={[-6.8, 0.55, 0.7]} scale={0.65} rotation={[0, π * 0.9, 0]} />

      {/* ══════════════════════════════════════════════════════════════
          SEATING — chairs around/alongside the L-shaped desk
      ══════════════════════════════════════════════════════════════ */}
      <Prop src={FK("chairDesk.glb")} position={[-8.3, 0, -4.5]} scale={0.85} rotation={[0, π / 2, 0]} />
      <Prop src={FK("chairDesk.glb")} position={[-8.3, 0, -2.5]} scale={0.85} rotation={[0, π / 2, 0]} />
      <Prop src={FK("chairDesk.glb")} position={[-8.3, 0, -0.5]} scale={0.85} rotation={[0, π / 2, 0]} />
      <Prop src={FK("chairDesk.glb")} position={[-7.5, 0,  1.3]} scale={0.85} rotation={[0, 0,      0]} />
      <Prop src={FK("chairDesk.glb")} position={[-6,   0,  1.3]} scale={0.85} rotation={[0, 0,      0]} />

      {/* ══════════════════════════════════════════════════════════════
          DESK CHAIRS at the rear bench (B2, ty=3, world z ≈ −5.4)
      ══════════════════════════════════════════════════════════════ */}
      <Prop src={FK("chairDesk.glb")} position={[-7,   0, -5.4]} scale={0.85} rotation={[0, 0, 0]} />
      <Prop src={FK("chairDesk.glb")} position={[-5,   0, -5.4]} scale={0.85} rotation={[0, 0, 0]} />
      <Prop src={FK("chairDesk.glb")} position={[-3,   0, -5.4]} scale={0.85} rotation={[0, 0, 0]} />
      <Prop src={FK("chairDesk.glb")} position={[1,    0, -5.4]} scale={0.85} rotation={[0, 0, 0]} />
      <Prop src={FK("chairDesk.glb")} position={[3,    0, -5.4]} scale={0.85} rotation={[0, 0, 0]} />

      {/* ══════════════════════════════════════════════════════════════
          SHELVING  (open right-side floor, tucked in the back-right corner
          so the rear half of the room reads as open)
      ══════════════════════════════════════════════════════════════ */}
      <Prop src={MM("shelf-boxes.glb")} position={[7, 0, -5]} scale={0.9} rotation={[0, -π / 2, 0]} />
      <Prop src={MM("shelf-boxes.glb")} position={[7, 0, -4]} scale={0.9} rotation={[0, -π / 2, 0]} />
      <Prop src={MM("shelf-bags.glb")}  position={[7, 0, -3]} scale={0.9} rotation={[0, -π / 2, 0]} />
      <Prop src={MM("shelf-end.glb")}   position={[7, 0, -2]} scale={0.9} rotation={[0, -π / 2, 0]} />

      {/* ══════════════════════════════════════════════════════════════
          COUNTER-TOP DIAGNOSTIC SCANNERS — on the service counter (ty=13, world z ≈ 3.5)
      ══════════════════════════════════════════════════════════════ */}
      <Prop src={MM("scanner-high.glb")}  position={[-3, 0.79, 3.5]} scale={0.65} rotation={[0, π, 0]} />
      <Prop src={MM("scanner-low.glb")}   position={[3,  0.79, 3.5]} scale={0.65} rotation={[0, π, 0]} />

      <Prop src={MM("box-small.glb")} position={[-1, 0.79, 3.5]} scale={0.5}  rotation={[0, π * 0.3, 0]} />
      <Prop src={MM("box-small.glb")} position={[0,  0.79, 3.5]} scale={0.45} rotation={[0, π * 0.7, 0]} />
      <Prop src={MM("box.glb")}       position={[1,  0.79, 3.5]} scale={0.45} rotation={[0, π * 0.6, 0]} />

      {/* ══════════════════════════════════════════════════════════════
          ROBOT ARMS flanking the central island (world x ≈ −0.5 z ≈ −1)
      ══════════════════════════════════════════════════════════════ */}
      <Prop src={MM("robot-arm-a.glb")} position={[-4.5, 0, -1]} scale={0.9} rotation={[0,  π / 2, 0]} />
      <Prop src={MM("robot-arm-b.glb")} position={[3.5,  0, -1]} scale={0.9} rotation={[0, -π / 2, 0]} />

      {/* ══════════════════════════════════════════════════════════════
          CONVEYOR — repair intake lane, open right-side floor
      ══════════════════════════════════════════════════════════════ */}
      <Prop src={MM("conveyor.glb")}       position={[6, 0, -3] } scale={0.88} rotation={[0, π / 2, 0]} />
      <Prop src={MM("conveyor-stripe.glb")} position={[6, 0, -2]} scale={0.88} rotation={[0, π / 2, 0]} />
      <Prop src={MM("conveyor-bars.glb")}  position={[6, 0, -1] } scale={0.88} rotation={[0, π / 2, 0]} />
      <Prop src={MM("conveyor-long.glb")}  position={[6, 0,  0]  } scale={0.88} rotation={[0, π / 2, 0]} />

      {/* ══════════════════════════════════════════════════════════════
          CARDBOARD BOXES — utility corner (tx=3, ty=11–13, world x ≈ −10 z ≈ 1..3)
      ══════════════════════════════════════════════════════════════ */}
      <Prop src={FK("cardboardBoxOpen.glb")}   position={[-9.5, 0,    1.2]} scale={0.85} />
      <Prop src={FK("cardboardBoxOpen.glb")}   position={[-9.5, 0.55, 1.2]} scale={0.85} />
      <Prop src={FK("cardboardBoxClosed.glb")} position={[-9.5, 0,    3.3]} scale={0.85} />
      <Prop src={MM("box-wide.glb")}           position={[-8.5, 0.48, 1.2]} scale={0.8}  />
      <Prop src={MM("box-large.glb")}          position={[-8.5, 0,    3.3]}   scale={0.75} />

      {/* ══════════════════════════════════════════════════════════════
          UTILITY CORNER — coffee machine, beside the sink
      ══════════════════════════════════════════════════════════════ */}
      <Prop src={FK("kitchenCoffeeMachine.glb")} position={[-9.5, 0.55, 1.9]} scale={0.75} rotation={[0, π / 2, 0]} />

      {/* ══════════════════════════════════════════════════════════════
          RUBBISH BINS
      ══════════════════════════════════════════════════════════════ */}
      <Prop src={FK("trashcan.glb")} position={[-3.5, 0, 1.3]} scale={0.75} />
      <Prop src={FK("trashcan.glb")} position={[4,    0, 1.3]} scale={0.75} />
      <Prop src={FK("trashcan.glb")} position={[-8.5, 0, 2.4]} scale={0.75} />

      {/* ══════════════════════════════════════════════════════════════
          CUSTOMER WAITING AREA — potted plants flanking the counter
          (couches/side-table/laptop dropped: workshop, not a showroom)
      ══════════════════════════════════════════════════════════════ */}
      <Prop src={FK("pottedPlant.glb")}  position={[-5, 0, 2.5]} scale={0.85} />
      <Prop src={FK("pottedPlant.glb")}  position={[6,  0, 2.5]} scale={0.85} />
      <Prop src={FK("plantSmall1.glb")}  position={[-6, 0, 4.5]} scale={0.8}  />
      <Prop src={FK("plantSmall2.glb")}  position={[7,  0, 4.5]} scale={0.8}  />

      {/* ══════════════════════════════════════════════════════════════
          FLOOR ARROWS — guide customers to the counter
      ══════════════════════════════════════════════════════════════ */}
      <Prop src={MM("arrow.glb")}       position={[-3, 0.04, 2.8]} scale={0.6} rotation={[0, π, 0]} />
      <Prop src={MM("arrow-basic.glb")} position={[3,  0.04, 2.8]} scale={0.6} rotation={[0, π, 0]} />

    </group>
  );
}
