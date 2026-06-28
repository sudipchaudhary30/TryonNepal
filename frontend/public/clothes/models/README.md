# 3D Garment Models

Place your `.glb` or `.gltf` garment model files in this directory.

## Expected file names

| Garment               | File name                  |
|-----------------------|----------------------------|
| Himalayan Kurta       | `himalayan_kurta.glb`      |
| Daura Suruwal         | `daura_suruwal.glb`        |
| Kathmandu Sherwani    | `sherwani.glb`             |
| Dhaka Festival Set    | `dhaka_set.glb`            |
| Midnight Oxford Shirt | `oxford_shirt.glb`         |
| Peakline Field Jacket | `field_jacket.glb`         |

## Model requirements

- Format: **GLB** (binary GLTF) preferred — a single self-contained file with textures embedded.
- Scale: Models should be **unit-normalised** — roughly 1 unit tall (from collar to hem). The overlay
  component will re-scale the model to match the detected shoulder width and torso height automatically.
- Origin: The model origin (0,0,0) should be at the **shoulder/neckline centre** so the anchoring maths works correctly.
- Rigging: Static meshes work fine. Skinned/rigged meshes are also supported via `@react-three/drei`.

## How the 3D overlay works

`Garment3DOverlay.tsx` uses a React Three Fiber `<Canvas>` with:
- A **transparent background** (the live video shows through).
- An **orthographic camera** whose frustum matches the video pixel dimensions exactly.
- The model is positioned using coordinates derived from MediaPipe pose landmarks (shoulders + hips).
- Lighting uses a directional light that shifts sideways based on `turnFactor` (shoulder depth difference).
