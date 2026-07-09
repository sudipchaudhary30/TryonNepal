import { useEffect, useRef } from 'react';
import type { NormalizedLandmark } from '@/types/ar';

// ── MediaPipe Pose landmark indices ──────────────────────────────────────────
const L_SHOULDER = 11;
const R_SHOULDER = 12;
const L_ELBOW    = 13;
const R_ELBOW    = 14;
const L_WRIST    = 15;
const R_WRIST    = 16;
const L_HIP      = 23;
const R_HIP      = 24;
const L_KNEE     = 25;
const R_KNEE     = 26;
const NOSE       = 0;

export interface BodyTrackingMetrics {
  // Core anchors (all in pixels)
  shoulderCenterX:  number;
  shoulderCenterY:  number;
  neckY:            number;   // collar anchor — above shoulder center
  hipCenterX:       number;
  hipCenterY:       number;

  // Dimensions (pixels)
  shoulderWidth:    number;   // L_SHOULDER → R_SHOULDER distance
  torsoHeight:      number;   // shoulder center → hip center
  hipWidth:         number;   // L_HIP → R_HIP (0 when not visible)
  armSpan:          number;   // L_WRIST → R_WRIST (0 when not visible)

  // Rotations
  tiltZ:            number;   // rad — shoulder roll left/right
  turnY:            number;   // rad — body yaw (facing angle)
  leanX:            number;   // rad — forward/back lean

  // Distance estimate (0–1): ratio of shoulderWidth / canvasWidth.
  // Larger = closer to camera. Used by ClothOverlay to scale correctly.
  distanceRatio:    number;

  // Height proxy (nose → knee midpoint, pixels). 0 if not all landmarks visible.
  heightProxy:      number;

  hasValidTracking: boolean;
}

type EMAState = Omit<BodyTrackingMetrics, 'hasValidTracking'>;

/**
 * useBodyTracker
 *
 * Converts raw MediaPipe landmarks into smoothed, pixel-space body metrics.
 *
 * DISTANCE SCALING:
 *   All dimensions are in pixel-space, which already encodes distance:
 *   closer → wider shoulders in pixels → larger garment. No extra factor needed.
 *   `distanceRatio = shoulderWidth / canvasWidth` is exported so ClothOverlay
 *   can further normalize its fixed-factor multipliers relative to an ideal distance.
 *
 * EMA SMOOTHING:
 *   Three separate alphas:
 *   - SA (size/width):   0.35  — was 0.22, now faster to reduce size-lag
 *   - PA (position):     0.40  — was 0.30, now slightly faster
 *   - RA (rotation):     0.55  — unchanged
 */
export function useBodyTracker(
  landmarks: readonly NormalizedLandmark[] | null,
  canvasWidth:  number,
  canvasHeight: number,
): BodyTrackingMetrics {
  const emaRef    = useRef<EMAState | null>(null);
  const resultRef = useRef<BodyTrackingMetrics>(emptyFallback());

  useEffect(() => {
    if (!landmarks || canvasWidth <= 0 || canvasHeight <= 0) {
      resultRef.current = fallback(emaRef.current);
      return;
    }

    // ── Landmark helpers ───────────────────────────────────────────────────
    const px  = (lm: NormalizedLandmark) => lm.x * canvasWidth;
    const py  = (lm: NormalizedLandmark) => lm.y * canvasHeight;
    const vis = (lm: NormalizedLandmark | undefined, t = 0.5): lm is NormalizedLandmark =>
      !!lm && lm.visibility > t;

    const ls = landmarks[L_SHOULDER];
    const rs = landmarks[R_SHOULDER];
    const le = landmarks[L_ELBOW];
    const re = landmarks[R_ELBOW];
    const lw = landmarks[L_WRIST];
    const rw = landmarks[R_WRIST];
    const lh = landmarks[L_HIP];
    const rh = landmarks[R_HIP];
    const lk = landmarks[L_KNEE];
    const rk = landmarks[R_KNEE];
    const ns = landmarks[NOSE];

    // Both shoulders are mandatory
    if (!vis(ls) || !vis(rs)) {
      resultRef.current = fallback(emaRef.current);
      return;
    }

    // ── Shoulder ───────────────────────────────────────────────────────────
    const lsX = px(ls), lsY = py(ls);
    const rsX = px(rs), rsY = py(rs);

    const shoulderWidth = Math.hypot(rsX - lsX, rsY - lsY);
    const shoulderCX    = (lsX + rsX) / 2;
    const shoulderCY    = (lsY + rsY) / 2;

    // Neck anchor: sits above shoulder midpoint.
    // Factor 0.24 = ~empirically tuned for kurta/shirt collar alignment.
    const neckY = shoulderCY - shoulderWidth * 0.24;

    // ── Hips ───────────────────────────────────────────────────────────────
    let hipCX: number;
    let hipCY: number;
    let hipWidth = 0;

    if (vis(lh) && vis(rh)) {
      const lhX = px(lh), lhY = py(lh);
      const rhX = px(rh), rhY = py(rh);
      hipCX    = (lhX + rhX) / 2;
      hipCY    = (lhY + rhY) / 2;
      hipWidth = Math.hypot(rhX - lhX, rhY - lhY);
    } else {
      // Anatomical estimate: hips ~1.35× shoulder width below shoulder center
      hipCX    = shoulderCX;
      hipCY    = shoulderCY + shoulderWidth * 1.35;
    }

    const torsoHeight = Math.hypot(hipCX - shoulderCX, hipCY - shoulderCY);

    // ── Arm span ───────────────────────────────────────────────────────────
    let armSpan = 0;
    if (vis(lw, 0.4) && vis(rw, 0.4)) {
      armSpan = Math.hypot(px(rw) - px(lw), py(rw) - py(lw));
    } else if (vis(le, 0.4) && vis(re, 0.4)) {
      // Estimate from elbows when wrists aren't visible
      armSpan = Math.hypot(px(re) - px(le), py(re) - py(le)) * 1.55;
    }

    // ── Height proxy ───────────────────────────────────────────────────────
    let heightProxy = 0;
    if (vis(ns, 0.4) && vis(lk, 0.4) && vis(rk, 0.4)) {
      const kneeMidY = (py(lk) + py(rk)) / 2;
      heightProxy = kneeMidY - py(ns);
    }

    // ── Distance ratio ─────────────────────────────────────────────────────
    // shoulderWidth / canvasWidth: ~0.18 at 1m, ~0.36 at 50cm for typical webcam
    const distanceRatio = Math.min(1, shoulderWidth / canvasWidth);

    // ── Rotations ──────────────────────────────────────────────────────────
    const tiltZ = Math.atan2(lsY - rsY, lsX - rsX);

    const depthDiff = (ls.z - rs.z) * 3.5;
    const turnY = Math.max(-0.9, Math.min(0.9, depthDiff)) * (Math.PI / 5);

    let leanX = 0;
    if (vis(lh) && vis(rh)) {
      const shoulderZ = (ls.z + rs.z) / 2;
      const hipZ      = (lh.z + rh.z) / 2;
      leanX = Math.max(-0.4, Math.min(0.4, (hipZ - shoulderZ) * 0.9));
    }

    // ── EMA smoothing ──────────────────────────────────────────────────────
    const SA = 0.35; // size/width  (was 0.22 — now faster to avoid size lag)
    const PA = 0.40; // position    (was 0.30)
    const RA = 0.55; // rotation    (unchanged)

    const raw: EMAState = {
      shoulderCenterX: shoulderCX,
      shoulderCenterY: shoulderCY,
      neckY,
      hipCenterX: hipCX,
      hipCenterY: hipCY,
      shoulderWidth,
      torsoHeight,
      hipWidth,
      armSpan,
      tiltZ,
      turnY,
      leanX,
      distanceRatio,
      heightProxy,
    };

    if (!emaRef.current) {
      emaRef.current = { ...raw };
    } else {
      const p = emaRef.current;
      emaRef.current = {
        shoulderCenterX: lerp(p.shoulderCenterX, raw.shoulderCenterX, PA),
        shoulderCenterY: lerp(p.shoulderCenterY, raw.shoulderCenterY, PA),
        neckY:           lerp(p.neckY,           raw.neckY,           PA),
        hipCenterX:      lerp(p.hipCenterX,      raw.hipCenterX,      PA),
        hipCenterY:      lerp(p.hipCenterY,      raw.hipCenterY,      PA),
        shoulderWidth:   lerp(p.shoulderWidth,   raw.shoulderWidth,   SA),
        torsoHeight:     lerp(p.torsoHeight,     raw.torsoHeight,     SA),
        hipWidth:        lerp(p.hipWidth,        raw.hipWidth,        SA),
        armSpan:         lerp(p.armSpan,         raw.armSpan,         SA),
        tiltZ:           lerp(p.tiltZ,           raw.tiltZ,           RA),
        turnY:           lerp(p.turnY,           raw.turnY,           RA),
        leanX:           lerp(p.leanX,           raw.leanX,           RA),
        distanceRatio:   lerp(p.distanceRatio,   raw.distanceRatio,   SA),
        heightProxy:     lerp(p.heightProxy,     raw.heightProxy,     SA),
      };
    }

    resultRef.current = { ...emaRef.current, hasValidTracking: true };
  }, [landmarks, canvasWidth, canvasHeight]);

  return resultRef.current;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const lerp = (a: number, b: number, alpha: number) => a + alpha * (b - a);

function emptyFallback(): BodyTrackingMetrics {
  return {
    shoulderCenterX: 0, shoulderCenterY: 0,
    neckY: 0,
    hipCenterX: 0, hipCenterY: 0,
    shoulderWidth: 0, torsoHeight: 0,
    hipWidth: 0, armSpan: 0,
    tiltZ: 0, turnY: 0, leanX: 0,
    distanceRatio: 0, heightProxy: 0,
    hasValidTracking: false,
  };
}

function fallback(last: EMAState | null): BodyTrackingMetrics {
  if (last) return { ...last, hasValidTracking: false };
  return emptyFallback();
}
