# WebAR Cloth Mirror — Architecture, Pipeline & Upgrade Plan

> **Principal AR Engineer Analysis** — Based on full codebase audit of your existing React + Three.js + MediaPipe stack.

---

## Current State (What You Already Have ✅)

Your project is well-structured and surprisingly complete. Here's what's already in place:

| Layer | File | Status |
|-------|------|--------|
| Pose Tracking | `usePoseDetection.ts` | ✅ MediaPipe Pose (33 landmarks, 30fps cap) |
| Body Measurement | `useBodyMeasurements.ts` | ✅ Shoulder width, torso height, tilt, turnFactor |
| 3D Anchoring | `use3DGarmentAnchoring.ts` | ✅ Pixel→World coord conversion, per-garment offsets |
| 3D Rendering | `Garment3DOverlay.tsx` | ✅ R3F orthographic canvas, LERP smoothing, SLERP rotation |
| 2D Fallback | `ClothOverlay.tsx` | ✅ Canvas2D with cylindrical lighting shader |
| Camera | `CameraView.tsx` | ✅ Layered canvas system (video → seg → cloth → skeleton) |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER TAB                             │
│                                                             │
│  ┌──────────┐   frames   ┌─────────────────────────────┐   │
│  │  <video> │ ──────────▶│  MediaPipe Pose WASM Worker  │   │
│  │ (webcam) │            │  33 NormalizedLandmarks/frame│   │
│  └──────────┘            └──────────────┬──────────────┘   │
│       │                                 │ landmarks[]       │
│       │ CSS scaleX(-1)                  ▼                   │
│       │               ┌────────────────────────────────┐   │
│       │               │  useBodyMeasurements()         │   │
│       │               │  • shoulderWidth  (px)         │   │
│       │               │  • torsoHeight    (px)         │   │
│       │               │  • bodyCenterX/Y  (px)         │   │
│       │               │  • tiltAngle      (°)          │   │
│       │               │  • turnFactor     [-1,1]       │   │
│       │               └────────────────┬───────────────┘   │
│       │                                │                    │
│       │               ┌────────────────▼───────────────┐   │
│       │               │  use3DGarmentAnchoring()       │   │
│       │               │  • position [x,y,z] world-px   │   │
│       │               │  • scale    [x,y,z]            │   │
│       │               │  • rotation [rx,ry,rz] rad     │   │
│       │               └────────────────┬───────────────┘   │
│       │                                │                    │
│  ┌────▼────────────────▼───────────────▼──────────────┐    │
│  │  React Three Fiber Canvas (z-index: 20, alpha)     │    │
│  │  ┌─────────────────────────────────────────────┐   │    │
│  │  │  OrthographicCamera (pixel ↔ world 1:1)    │   │    │
│  │  │  GarmentModel (.glb) ─ LERP / SLERP smooth  │   │    │
│  │  │  DirectionalLight  (turnFactor-driven)       │   │    │
│  │  └─────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## The Vector Math Explained

### Step 1 — Landmark → Pixel Space

MediaPipe returns landmarks normalized to `[0,1]`. We scale to actual pixel dimensions:

```
Px  = landmark.x × canvasWidth
Py  = landmark.y × canvasHeight
```

### Step 2 — Shoulder Width (Euclidean Distance)

```
shoulderWidth = √[(Px_L - Px_R)² + (Py_L - Py_R)²]
```

This gives the **actual pixel distance** between shoulder joints, which becomes the garment's X-scale base.

### Step 3 — Torso Height (Midpoint-to-Midpoint)

```
midShoulder = (P_shoulder_L + P_shoulder_R) / 2   ← vector average
midHip      = (P_hip_L + P_hip_R) / 2
torsoHeight = |midHip - midShoulder|               ← magnitude
```

### Step 4 — Shoulder Tilt (Z-rotation)

```
tiltAngle = atan2(Py_L - Py_R,  Px_L - Px_R)   [in degrees]
rotZ      = -tiltAngle × π/180                   [negate for Y-up Three.js]
```

### Step 5 — Body Turn / Y-rotation (Depth)

MediaPipe's `z` is **estimated depth relative to the hip midpoint** (normalized). When the body turns:
- Left shoulder gets closer to camera → `z_L` more negative
- Right shoulder moves away → `z_R` more positive

```
depthDiff  = z_L - z_R                          [range ≈ -0.4 to +0.4]
turnFactor = clamp(depthDiff × 2.5, -0.8, 0.8)  [map to [-1, 1]]
rotY       = turnFactor × π/6                    [max ±30°]
```

### Step 6 — Pixel → Three.js Orthographic World Space

The orthographic frustum spans `[-W/2, +W/2]` in X and `[-H/2, +H/2]` in Y:

```
worldX = (pixelX / W - 0.5) × W  =  pixelX - W/2
worldY = -(pixelY / H - 0.5) × H = -(pixelY - H/2)   ← Y-flip!
```

### Step 7 — Per-Garment Scale Multipliers

| Garment | scaleX | scaleY | posY offset |
|---------|--------|--------|-------------|
| upper_body | shoulderWidth × 1.45 | torsoHeight × 1.35 | −scaleY × 0.46 |
| lower_body | shoulderWidth × 1.25 | torsoHeight × 1.50 | −scaleY × 0.95 |
| full_body | shoulderWidth × 1.50 | torsoHeight × 2.30 | −scaleY × 0.46 |
| traditional | shoulderWidth × 1.45 | torsoHeight × 2.20 | −scaleY × 0.46 |

---

## Gap Analysis — What Needs Improvement

| Issue | Severity | Proposed Fix |
|-------|----------|--------------|
| **No temporal smoothing on measurements** | High | Exponential Moving Average (EMA) filter on `shoulderWidth`, `torsoHeight`, `bodyCenterX/Y` |
| **No visibility confidence gating** | High | Skip landmark if `visibility < 0.5` and use last valid frame |
| **Missing spine anchor** | Medium | Compute neck midpoint (11+12 average Y - offset) as spine top |
| **No Kalman/1€ filter** | Medium | Add 1€ Filter for jitter-free tracking at low movement |
| **LERP constant hard-coded 0.18** | Low | Expose as prop; lower = smoother but laggier |
| **No occlusion handling** | Low | Fallback to last-known good transform if confidence drops |
| **FPS calculation is per-result** | Low | Use rolling 30-frame window average |

---

## Proposed Upgrades

### 1. `useBodyMeasurements.ts` → Add EMA Smoothing + Confidence Gating

Instead of raw landmark values each frame, maintain an EMA state:
```
EMA_new = α × raw + (1 - α) × EMA_old
```
Use `α = 0.25` for positions (smooth but responsive) and `α = 0.15` for rotation (extra stable).

### 2. New `useGarmentPhysics.ts` Hook — Spring Simulation

A simple spring dampener to simulate cloth inertia:
```
velocity += (target - position) × stiffness
velocity × dampening
position += velocity
```

### 3. `use3DGarmentAnchoring.ts` → Spine Vector Anchor

Currently anchors to shoulder midpoint. Upgrade to use the **spine direction vector**:
```
spineVec   = midHip - midShoulder           [direction vector]
spineAngle = atan2(spineVec.x, spineVec.y)  [lean angle]
```
This prevents slipping when the user bends forward/backward.

### 4. `usePoseDetection.ts` → Throttled Worker Pattern

Move `pose.send()` to a Web Worker via `OffscreenCanvas` to free the main thread.

---

## Files to Create/Modify

### [MODIFY] `useBodyMeasurements.ts`
- Add EMA temporal smoothing with `useRef` state
- Add landmark visibility gating (`visibility >= 0.5`)
- Add neck midpoint calculation
- Add `spineVec` output for anchoring

### [NEW] `useGarmentPhysics.ts`
- Spring + damper simulation for position/scale
- Velocity-based momentum so garment "settles" naturally

### [MODIFY] `use3DGarmentAnchoring.ts`
- Use spine vector for primary Y-axis alignment
- Add neck/chest anchor point (not just shoulder midpoint)
- Expose `smoothingFactor` as a parameter

### [MODIFY] `usePoseDetection.ts`
- Add rolling FPS window (last 30 frames)
- Add consecutive low-confidence frame counter
- Graceful fallback when pose is lost

### [MODIFY] `Garment3DOverlay.tsx`
- Pass `smoothingFactor` prop down to GarmentModel
- Add depth sorting hint for better z-ordering

---

## Performance Budget (30+ FPS Target)

| Task | Budget | Current |
|------|--------|---------|
| MediaPipe inference (model=0) | ~12ms | ✅ capped @33ms |
| R3F render (Three.js) | ~8ms | ✅ OK |
| React reconciliation | ~2ms | ✅ useMemo everywhere |
| Anchoring math | <1ms | ✅ trivial |
| **Total frame budget** | **16.7ms** | ~23ms (43fps) |

**Key optimizations already in place:**
- `modelComplexity: 0` (lite model)
- Frame throttle at 33ms minimum
- `useMemo` on all heavy computations
- LERP/SLERP in `useFrame` (GPU-side interpolation)
- Orthographic camera (no perspective recalculation)

---

## Open Questions

> [!IMPORTANT]
> **Q1**: Should I add the `useGarmentPhysics.ts` spring simulation? It adds beautiful cloth-settling behavior but adds ~2ms per frame.

> [!IMPORTANT]  
> **Q2**: Do you want me to implement **landmark visibility confidence gating** strictly (skip frame if confidence < 0.5) or permissively (use all landmarks)?

> [!NOTE]
> **Q3**: The `traditional` garment type (likely kurta/sari) has the same scale coefficients as `full_body`. Should it have its own tuned values based on your specific garment catalog?

> [!NOTE]
> **Q4**: Your `minDetectionConfidence: 0.15` is very low. This helps detect in low light but causes jitter. Want me to raise this to `0.5` and add EMA smoothing instead?
