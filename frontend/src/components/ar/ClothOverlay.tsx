import { useEffect, useRef } from 'react';
import type { GarmentType, NormalizedLandmark } from '@/types/ar';
import { useBodyTracker } from '@/hooks/useBodyTracker';

interface ClothOverlayProps {
  landmarks: readonly NormalizedLandmark[] | null;
  garmentImageUrl: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  garmentType: GarmentType;
}

// ── REFERENCE DISTANCE ────────────────────────────────────────────────────────
// Expected distanceRatio (shoulderWidth / canvasWidth) when the user is at the
// ideal standing distance (~70 cm from a typical webcam).
// At this ratio the garment fits perfectly with the default multipliers below.
// If the user is closer, distanceRatio > REF → garment scales up; farther → scales down.
const IDEAL_DISTANCE_RATIO = 0.24;

export default function ClothOverlay({
  landmarks,
  garmentImageUrl,
  canvasRef,
  garmentType,
}: ClothOverlayProps) {
  const imageRef          = useRef<HTMLImageElement | null>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ── Load & background-remove garment image ──────────────────────────────────
  useEffect(() => {
    if (!garmentImageUrl) {
      imageRef.current = null;
      processedCanvasRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = garmentImageUrl;
    img.onload = () => {
      imageRef.current = img;
      try {
        const W = img.naturalWidth  || 512;
        const H = img.naturalHeight || 512;
        const pCanvas = document.createElement('canvas');
        pCanvas.width  = W;
        pCanvas.height = H;
        const pCtx = pCanvas.getContext('2d');
        if (!pCtx) return;

        pCtx.drawImage(img, 0, 0);
        const imgData = pCtx.getImageData(0, 0, W, H);
        const data    = imgData.data;
        const visited = new Uint8Array(W * H);

        // Flood-fill from edges: marks connected light/transparent pixels as background
        const isBg = (idx: number) => {
          const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
          if (a < 20) return true;
          const brightness  = r * 0.299 + g * 0.587 + b * 0.114;
          const saturation  = Math.max(r, g, b) - Math.min(r, g, b);
          return brightness > 215 && saturation < 30;
        };

        const queue: number[] = [];
        const seed = (x: number, y: number) => {
          const pos = y * W + x;
          if (!visited[pos] && isBg(pos * 4)) { visited[pos] = 1; queue.push(pos); }
        };
        for (let x = 0; x < W; x++) { seed(x, 0); seed(x, H - 1); }
        for (let y = 0; y < H; y++) { seed(0, y); seed(W - 1, y); }

        const dx4 = [1, -1, 0, 0], dy4 = [0, 0, 1, -1];
        let qi = 0;
        while (qi < queue.length) {
          const pos = queue[qi++];
          const bx = pos % W, by = Math.floor(pos / W);
          for (let d = 0; d < 4; d++) {
            const nx = bx + dx4[d], ny = by + dy4[d];
            if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
            const npos = ny * W + nx;
            if (!visited[npos] && isBg(npos * 4)) { visited[npos] = 1; queue.push(npos); }
          }
        }

        // Remove background; feather edge pixels
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const pos = y * W + x;
            if (visited[pos]) {
              data[pos * 4 + 3] = 0;
            } else {
              let bgN = 0;
              for (let d = 0; d < 4; d++) {
                const nx = x + dx4[d], ny = y + dy4[d];
                if (nx >= 0 && ny >= 0 && nx < W && ny < H && visited[ny * W + nx]) bgN++;
              }
              if (bgN > 0) data[pos * 4 + 3] = Math.round(data[pos * 4 + 3] * (1 - bgN * 0.35));
            }
          }
        }
        pCtx.putImageData(imgData, 0, 0);
        processedCanvasRef.current = pCanvas;
      } catch {
        processedCanvasRef.current = null;
      }
    };
  }, [garmentImageUrl]);

  // ── Canvas size sync ─────────────────────────────────────────────────────────
  const canvasSizeRef = useRef({ w: 640, h: 480 });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sync = () => {
      if (canvas.width > 0 && canvas.height > 0)
        canvasSizeRef.current = { w: canvas.width, h: canvas.height };
    };
    sync();
    const obs = new ResizeObserver(sync);
    obs.observe(canvas);
    return () => obs.disconnect();
  }, [canvasRef]);

  // ── Body tracker ─────────────────────────────────────────────────────────────
  const metrics    = useBodyTracker(landmarks, canvasSizeRef.current.w, canvasSizeRef.current.h);
  const metricsRef = useRef(metrics);
  metricsRef.current = metrics;

  // ── Drawing loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;

    const drawFrame = () => {
      const cw = canvas.width;
      const ch = canvas.height;
      if (cw > 0 && ch > 0) canvasSizeRef.current = { w: cw, h: ch };

      ctx.clearRect(0, 0, cw, ch);

      const m = metrics;
      if (!m.hasValidTracking || m.shoulderWidth < 10) {
        rafId = requestAnimationFrame(drawFrame);
        return;
      }

      const img = imageRef.current;

      // ── MIRROR APPROACH ────────────────────────────────────────────────────
      const mirrorX = (x: number) => cw - x;

      const anchorMX = mirrorX(m.shoulderCenterX);
      const anchorMY = m.neckY;
      const hipMX    = mirrorX(m.hipCenterX);

      // ── DIRECT PIXEL-SPACE SCALING ──────────────────────────────────────────
      const torso = m.torsoHeight > 30 ? m.torsoHeight : m.shoulderWidth * 1.4;

      let pivotX:     number;
      let pivotY:     number;
      let drawW:      number;
      let drawH:      number;
      let topOverlap: number;

      if (garmentType === 'lower_body') {
        pivotX     = hipMX;
        pivotY     = m.hipCenterY;
        const hipW = m.hipWidth > 10 ? m.hipWidth : m.shoulderWidth * 0.95;
        drawW      = hipW * 1.55;
        drawH      = torso * 2.10;
        topOverlap = drawH * 0.05;
      } else if (garmentType === 'full_body' || garmentType === 'traditional') {
        pivotX     = anchorMX;
        pivotY     = anchorMY;
        drawW      = m.shoulderWidth * 1.95;  // extends past body shoulders
        drawH      = torso * 2.40;
        topOverlap = drawH * 0.12;
      } else {
        // upper_body (shirt, kurta, jacket)
        pivotX     = anchorMX;
        pivotY     = anchorMY;
        drawW      = m.shoulderWidth * 2.00;  // extends past body shoulders
        drawH      = torso * 1.38;
        topOverlap = drawH * 0.08;
      }

      // Foreshortening shift when user turns (mirrored space: turning right shifts LEFT)
      const shiftX = m.turnY * drawW * 0.20;

      ctx.save();
      ctx.translate(pivotX + shiftX, pivotY);
      // Tilt is negated in mirrored space
      ctx.rotate(-m.tiltZ);

      if (img && img.complete) {
        const drawable = processedCanvasRef.current ?? img;
        ctx.drawImage(drawable, -drawW / 2, -topOverlap, drawW, drawH);

        // Side shading for 3-D depth illusion
        const grad  = ctx.createLinearGradient(-drawW / 2, 0, drawW / 2, 0);
        const lShade = Math.max(0.02, 0.10 - m.turnY * 0.15);
        const rShade = Math.max(0.02, 0.10 + m.turnY * 0.15);
        grad.addColorStop(0,    `rgba(0,0,0,${lShade})`);
        grad.addColorStop(0.45, 'rgba(255,255,255,0.03)');
        grad.addColorStop(1,    `rgba(0,0,0,${rShade})`);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = grad;
        ctx.fillRect(-drawW / 2, -topOverlap, drawW, drawH);
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.fillStyle = 'rgba(0,180,255,0.12)';
        ctx.roundRect(-drawW / 2, -topOverlap, drawW, drawH, 12);
        ctx.fill();
      }

      ctx.restore();
      rafId = requestAnimationFrame(drawFrame);
    };

    rafId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafId);
  }, [canvasRef, garmentType, metrics]);

  return null;
}
