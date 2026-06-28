import { useEffect } from 'react';
import type { NormalizedLandmark } from '@/types/ar';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

interface SkeletonRendererProps {
  landmarks: readonly NormalizedLandmark[] | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  show: boolean;
}

const L_SHOULDER = 11, R_SHOULDER = 12;
const L_ELBOW = 13,    R_ELBOW = 14;
const L_HIP = 23,      R_HIP = 24;

export default function SkeletonRenderer({ landmarks, canvasRef, show }: SkeletonRendererProps) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!show || !landmarks || landmarks.length === 0) return;

    const W = canvas.width;
    const H = canvas.height;

    // Mirror X to match the CSS scaleX(-1) video
    const mx = (lm: NormalizedLandmark) => W - lm.x * W;
    const my = (lm: NormalizedLandmark) => lm.y * H;
    const vis = (lm: NormalizedLandmark | undefined, t = 0.45): lm is NormalizedLandmark =>
      !!lm && lm.visibility > t;

    // ─── 1. Torso + arm bones ─────────────────────────────────────────────
    ctx.save();
    ctx.strokeStyle = 'rgba(0,230,255,0.5)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.setLineDash([]);

    for (const [p1, p2] of POSE_CONNECTIONS) {
      if (p1 < 11 || p2 < 11) continue;   // skip face
      if (p1 > 24 || p2 > 24) continue;   // skip below hips
      const s = landmarks[p1], e = landmarks[p2];
      if (!vis(s) || !vis(e)) continue;
      ctx.beginPath();
      ctx.moveTo(mx(s), my(s));
      ctx.lineTo(mx(e), my(e));
      ctx.stroke();
    }
    ctx.restore();

    // ─── 2. Shoulder width line ───────────────────────────────────────────
    const ls = landmarks[L_SHOULDER], rs = landmarks[R_SHOULDER];
    if (vis(ls) && vis(rs)) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0,255,200,0.75)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(mx(ls), my(ls));
      ctx.lineTo(mx(rs), my(rs));
      ctx.stroke();
      ctx.restore();

      // Label
      const midX = (mx(ls) + mx(rs)) / 2;
      const midY = (my(ls) + my(rs)) / 2 - 16;
      const swPx = Math.hypot(mx(rs) - mx(ls), my(rs) - my(ls));
      ctx.save();
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = 'rgba(0,255,200,0.85)';
      ctx.textAlign = 'center';
      ctx.fillText(`↔ ${Math.round(swPx)}px`, midX, midY);
      ctx.restore();
    }

    // ─── 3. Hip / waist anchor line ───────────────────────────────────────
    const lh = landmarks[L_HIP], rh = landmarks[R_HIP];
    if (vis(lh) && vis(rh)) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,140,0,0.70)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(mx(lh), my(lh));
      ctx.lineTo(mx(rh), my(rh));
      ctx.stroke();
      ctx.restore();

      const hcx = (mx(lh) + mx(rh)) / 2;
      const hcy = (my(lh) + my(rh)) / 2;

      // Cross-hair
      ctx.save();
      ctx.strokeStyle = 'rgba(255,140,0,0.85)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(hcx - 10, hcy); ctx.lineTo(hcx + 10, hcy);
      ctx.moveTo(hcx, hcy - 10); ctx.lineTo(hcx, hcy + 10);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = 'rgba(255,160,40,0.9)';
      ctx.textAlign = 'center';
      ctx.fillText('WAIST', hcx, hcy + 20);
      ctx.restore();
    }

    // ─── 4. Torso height indicator ────────────────────────────────────────
    if (vis(ls) && vis(rs) && vis(lh) && vis(rh)) {
      const sCX = (mx(ls) + mx(rs)) / 2, sCY = (my(ls) + my(rs)) / 2;
      const hCX = (mx(lh) + mx(rh)) / 2, hCY = (my(lh) + my(rh)) / 2;
      ctx.save();
      ctx.strokeStyle = 'rgba(180,100,255,0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(sCX, sCY);
      ctx.lineTo(hCX, hCY);
      ctx.stroke();
      ctx.restore();
    }

    // ─── 5. Key joint glowing dots ────────────────────────────────────────
    const keyPoints = [
      { idx: L_SHOULDER, color: '0,220,255',  r: 6 },
      { idx: R_SHOULDER, color: '0,220,255',  r: 6 },
      { idx: L_ELBOW,    color: '0,180,255',  r: 5 },
      { idx: R_ELBOW,    color: '0,180,255',  r: 5 },
      { idx: L_HIP,      color: '255,140,0',  r: 7 },
      { idx: R_HIP,      color: '255,140,0',  r: 7 },
    ];

    for (const kp of keyPoints) {
      const lm = landmarks[kp.idx];
      if (!vis(lm)) continue;
      const x = mx(lm), y = my(lm);

      // Glow
      const grd = ctx.createRadialGradient(x, y, 0, x, y, kp.r * 2.5);
      grd.addColorStop(0, `rgba(${kp.color},0.55)`);
      grd.addColorStop(1, `rgba(${kp.color},0)`);
      ctx.save();
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(x, y, kp.r * 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Core dot
      ctx.save();
      ctx.fillStyle   = `rgba(${kp.color},0.95)`;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(x, y, kp.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // ─── 6. Status tag ────────────────────────────────────────────────────
    ctx.save();
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = 'rgba(0,230,255,0.65)';
    ctx.textAlign = 'left';
    ctx.fillText('● TRACKING', 14, H - 14);
    ctx.restore();

  }, [landmarks, canvasRef, show]);

  return null;
}
