# Kenney 3D assets (décor)

Drop **.glb** files here from [Kenney.nl](https://kenney.nl) (CC0). The game loads them via **Drei**'s `useGLTF`.

Floors, walls, counters, and workbenches are **procedural meshes** in `ShopProps` / `RoomProps`. Kenney models are **décor only** — they are not wired to tile types.

## How models are used

| Source | Role |
|--------|------|
| `components/three/KenneyModel.tsx` (`OptionalKenneyModels`) | Shop interior props (monitors, chairs, boxes, conveyors, waiting area) |
| `components/three/ShopFront.tsx` / `FrontStrip.tsx` | Road, traffic, parked cars, signs |
| `components/three/kenneyAssets.ts` | Path reference map for root-level GLBs |

Furniture kit pieces live under `GLTF format/` and are loaded with a URL-encoded path (`/models/GLTF%20format/...`). Prefer filenames **without spaces** for new root-level assets.

## Adding décor

1. Put a `.glb` in this folder (or `GLTF format/`).
2. Add a `<KenneyModel src="/models/yourfile.glb" position={[x, y, z]} … />` inside `OptionalKenneyModels` (already wrapped in Suspense + error boundary).
3. Optionally register the path in `kenneyAssets.ts` for discoverability.

If a file is missing, the error boundary hides that prop so the rest of the scene still loads.
