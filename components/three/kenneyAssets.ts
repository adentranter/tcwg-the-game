/**
 * Reference map of GLB paths for Kenney assets in public/models/.
 * Used by OptionalKenneyModels / ShopFront / FrontStrip — not by the tile system.
 *
 * Pose / scale notes (all measured in tile-units where 1 unit ≈ 1 m):
 *   - Most pieces fit within 1 × 1 × 1 at scale=1.
 *   - Conveyor-long pieces span 2 units; rotate 90° to run Z-axis.
 *   - Counter top is at y ≈ 0.79, so surface props need y ≥ 0.79.
 *   - Robot arms are ~1.2 u tall; scale 0.9 fits comfortably.
 */

export const MODELS = {
  // Conveyors
  conveyor: "/models/conveyor.glb",
  conveyorStripe: "/models/conveyor-stripe.glb",
  conveyorLong: "/models/conveyor-long.glb",
  conveyorBars: "/models/conveyor-bars.glb",

  // Robots
  robotArmA: "/models/robot-arm-a.glb",
  robotArmB: "/models/robot-arm-b.glb",

  // Shelves / storage
  shelfBoxes: "/models/shelf-boxes.glb",
  shelfBags: "/models/shelf-bags.glb",
  shelfEnd: "/models/shelf-end.glb",
  freezer: "/models/freezer.glb",
  freezersStanding: "/models/freezers-standing.glb",

  // Counter equipment
  cashRegister: "/models/cash-register.glb",
  scannerHigh: "/models/scanner-high.glb",
  scannerLow: "/models/scanner-low.glb",

  // Wayfinding
  arrowBasic: "/models/arrow-basic.glb",
  arrow: "/models/arrow.glb",
  bottleReturn: "/models/bottle-return.glb",

  // Boxes
  box: "/models/box.glb",
  boxLarge: "/models/box-large.glb",
  boxSmall: "/models/box-small.glb",
  boxWide: "/models/box-wide.glb",
  boxLong: "/models/box-long.glb",

  // Barriers / borders
  borderHigh: "/models/border-high.glb",
  borderCorner: "/models/border-corner.glb",

  // Detail
  detailPipe: "/models/detail-pipe.glb",

  // Characters / traffic (ShopFront + FrontStrip)
  characterEmployee: "/models/character-employee.glb",
  roadStraight: "/models/road-straight.glb",
  roadSide: "/models/road-side.glb",
  lightSquare: "/models/light-square.glb",
} as const;
