import { useEffect, useRef } from 'react';
import type { NormalizedLandmark } from '@/types/ar';

// MediaPipe Pose landmark indices
const L_SHOULDER = 11;
const R_SHOULDER = 12;
const L_ELBOW    = 13;
const R_ELBOW    = 14;
const L_HIP      = 23;
const R_HIP      = 24;

export interface BodyTrackingMetrics {
  shoulderCenterX: number;
  shoulderCenterY: number;
  neckY:           number;   // collar anchor
  hipCenterX:      number;
  hipCenterY:      number;   // waistband anchor
  shoulderWidth:   number;   // px
  torsoHeight:     number;   // px (shoulder center → hip center)
  tiltZ:           number;   // radians: shoulder roll
  turnY:           number;   // radians: body yaw
  leanX:           number;   // radians: forward lean
  hasValidTracking: boolean;
}

interface EMAState extends Omit<BodyTrackingMetrics, 'hasValidTracking'> {}

/**
 * useBodyTracker
 *
 * Reads raw MediaPipe landmarks and returns smoothed body metrics used to
 * position and size the AR clothing overlay.
 *
 * KEY DESIGN DECISION: All values are in PIXEL space (multiplied by
 * canvasWidth/canvasHeight). Pixel-space coordinates already encode camera
 * distance — when the user steps back, the shoulders are fewer pixels apart
 * AND the body occupies fewer pixels of height. Therefore NO additional
 * distance-scale factor is needed; the overlay will naturally fit at any
 * distance as long as we derive garment size from these pixel values.
 */
export function useBodyTracker(
  landmarks: readonly NormalizedLandmark[] | null,
  canvasWidth:  number,
  canvasHeight: number,
): BodyTrackingMetrics {
  const emaRef = useRef<EMAState | null>(null);

  // We use a ref so the RAF in ClothOverlay always reads the latest value
  // without needing the RAF effect to re-run on every landmark update.
  const resultRef = useRef<BodyTrackingMetrics>(fallback(null));

  useEffect(() => {
    if (!landmarks || canvasWidth <= 0 || canvasHeight <= 0) {
      resultRef.current = fallback(emaRef.current);
      return;
    }

    const ls = landmarks[L_SHOULDER];
    const rs = landmarks[R_SHOULDER];
    const le = landmarks[L_ELBOW];
    const re = landmarks[R_ELBOW];
    const lh = landmarks[L_HIP];
    const rh = landmarks[R_HIP];

    const vis = (lm: NormalizedLandmark | undefined, t = 0.45) =>
      !!lm && lm.visibility > t;

    if (!vis(ls) || !vis(rs)) {
      resultRef.current = fallback(emaRef.current);
      return;
    }

    // ── Pixel coordinates ──────────────────────────────────────────────────
    const lsX = ls.x * canvasWidth,  lsY = ls.y * canvasHeight;
    const rsX = rs.x * canvasWidth,  rsY = rs.y * canvasHeight;

    const shoulderWidth = Math.hypot(rsX - lsX, rsY - lsY);
    const shoulderCX    = (lsX + rsX) / 2;
    const shoulderCY    = (lsY + rsY) / 2;

    // Neck / collar: sits above shoulder midpoint (about 20% of shoulder width)
    const neckY = shoulderCY - shoulderWidth * 0.20;

    // Hip center — use real landmarks if visible, else estimate from shoulders
    let hipCX: number;
    let hipCY: number;

    if (vis(lh) && vis(rh)) {
      const lhX = lh.x * canvasWidth,  lhY = lh.y * canvasHeight;
      const rhX = rh.x * canvasWidth,  rhY = rh.y * canvasHeight;
      hipCX = (lhX + rhX) / 2;
      hipCY = (lhY + rhY) / 2;
    } else {
      // Estimate: hips are typically ~1.45× shoulder width below shoulder center.
      // This preserves a sensible torso height even when hips are off-screen.
      hipCX = shoulderCX;
      hipCY = shoulderCY + shoulderWidth * 1.45;
    }

    const torsoHeight = Math.hypot(hipCX - shoulderCX, hipCY - shoulderCY);

    // ── Rotations ──────────────────────────────────────────────────────────
    // Tilt (Z) — positive = user tilted right
    const tiltZ = Math.atan2(lsY - rsY, lsX - rsX);

    // Turn (Y yaw) — from z-depth difference of shoulders
    // Multiply by a modest factor; clamp to ±0.9 rad (≈52°)
    const depthDiff = (ls.z - rs.z) * 3.2;
    const turnY = Math.max(-0.9, Math.min(0.9, depthDiff)) * (Math.PI / 5);

    // Lean (X pitch) — from hip vs shoulder z-depth
    let leanX = 0;
    if (vis(lh) && vis(rh)) {
      const shoulderZ = (ls.z + rs.z) / 2;
      const hipZ      = (lh.z + rh.z) / 2;
      leanX = Math.max(-0.4, Math.min(0.4, (hipZ - shoulderZ) * 0.9));
    }

    // ── EMA smoothing ──────────────────────────────────────────────────────
    // Separate alphas: positions smooth slowly, rotations fast, size very slow.
    const PA = 0.30;  // position alpha
    const RA = 0.50;  // rotation alpha
    const SA = 0.22;  // size alpha (slowest — reduces cloth jitter)

    const raw: EMAState = {
      shoulderCenterX: shoulderCX,
      shoulderCenterY: shoulderCY,
      neckY,
      hipCenterX: hipCX,
      hipCenterY: hipCY,
      shoulderWidth,
      torsoHeight,
      tiltZ,
      turnY,
      leanX,
    };

    if (!emaRef.current) {
      emaRef.current = { ...raw };
    } else {
      const p = emaRef.current;
      emaRef.current = {
        shoulderCenterX: p.shoulderCenterX + PA * (raw.shoulderCenterX - p.shoulderCenterX),
        shoulderCenterY: p.shoulderCenterY + PA * (raw.shoulderCenterY - p.shoulderCenterY),
        neckY:           p.neckY           + PA * (raw.neckY           - p.neckY),
        hipCenterX:      p.hipCenterX      + PA * (raw.hipCenterX      - p.hipCenterX),
        hipCenterY:      p.hipCenterY      + PA * (raw.hipCenterY      - p.hipCenterY),
        shoulderWidth:   p.shoulderWidth   + SA * (raw.shoulderWidth   - p.shoulderWidth),
        torsoHeight:     p.torsoHeight     + SA * (raw.torsoHeight     - p.torsoHeight),
        tiltZ:           p.tiltZ           + RA * (raw.tiltZ           - p.tiltZ),
        turnY:           p.turnY           + RA * (raw.turnY           - p.turnY),
        leanX:           p.leanX           + RA * (raw.leanX           - p.leanX),
      };
    }

    resultRef.current = { ...emaRef.current, hasValidTracking: true };
  }, [landmarks, canvasWidth, canvasHeight]);

  return resultRef.current;
}

function fallback(last: EMAState | null): BodyTrackingMetrics {
  if (last) return { ...last, hasValidTracking: false };
  return {
    shoulderCenterX: 0, shoulderCenterY: 0,
    neckY: 0,
    hipCenterX: 0, hipCenterY: 0,
    shoulderWidth: 0, torsoHeight: 0,
    tiltZ: 0, turnY: 0, leanX: 0,
    hasValidTracking: false,
  };
}
