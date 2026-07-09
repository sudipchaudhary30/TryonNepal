import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Loader2, Lock, ScanLine } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import type { GarmentType } from '@/types/ar';

import ClothOverlay from './ClothOverlay';
import Garment3DOverlay from './Garment3DOverlay';
import SkeletonRenderer from './SkeletonRenderer';

// ─── Constants ────────────────────────────────────────────────────────────────

// Namaste (🙏) gesture thresholds in normalised [0,1] coordinates
// Both wrists (lm 15 & 16) must be:
//   • within NAMASTE_WRIST_DIST of each other (hands touching)
//   • at similar height (NAMASTE_Y_DIFF)
//   • above hip level (wristY < NAMASTE_MAX_Y)
const NAMASTE_WRIST_DIST = 0.18;  // normalised distance between wrists
const NAMASTE_Y_DIFF     = 0.15;  // max Y difference between wrists
const NAMASTE_MAX_Y      = 0.80;  // wrists must be above hip
const NAMASTE_MIN_VIS    = 0.5;   // minimum MediaPipe visibility score

// How long (ms) the Namaste must be held to trigger
const DWELL_MS = 1800;
// Scan duration (ms)
const SCAN_DURATION_MS = 2600;

interface CameraViewProps {
  onCapture?: (blob: Blob) => void;
  showSkeleton?: boolean;
  garmentImageUrl?: string | null;
  garmentModelUrl?: string | null;
  garmentType?: GarmentType;
  onCanvasSize?: (size: { w: number; h: number }) => void;
}

// ─── Namaste detection helper ─────────────────────────────────────────────────
function detectNamaste(
  landmarks: Array<{ x: number; y: number; z: number; visibility?: number }> | null
): boolean {
  if (!landmarks) return false;
  const lw = landmarks[15]; // left  wrist
  const rw = landmarks[16]; // right wrist
  if (!lw || !rw) return false;
  if ((lw.visibility ?? 0) < NAMASTE_MIN_VIS) return false;
  if ((rw.visibility ?? 0) < NAMASTE_MIN_VIS) return false;

  // Euclidean distance in XY plane (normalised)
  const dx   = lw.x - rw.x;
  const dy   = lw.y - rw.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const bothHigh   = lw.y < NAMASTE_MAX_Y && rw.y < NAMASTE_MAX_Y;
  const closeEnough = dist < NAMASTE_WRIST_DIST;
  const sameHeight  = Math.abs(dy) < NAMASTE_Y_DIFF;

  return closeEnough && sameHeight && bothHigh;
}

export default function CameraView({
  onCapture,
  showSkeleton = false,
  garmentImageUrl = null,
  garmentModelUrl = null,
  garmentType = 'upper_body',
  onCanvasSize,
}: CameraViewProps) {
  const { videoRef, isReady, error, startCamera } = useCamera();
  const [hasRequestedCamera, setHasRequestedCamera] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

  const skeletonCanvasRef = useRef<HTMLCanvasElement>(null);
  const garmentCanvasRef  = useRef<HTMLCanvasElement>(null);
  const scanCanvasRef     = useRef<HTMLCanvasElement>(null);

  const { landmarks, isLoading, fps } = usePoseDetection(videoRef, isReady);

  // ── Mirror / Scan state ───────────────────────────────────────────────────
  const [isMirrorActive, setIsMirrorActive] = useState(false);
  const [isScanning,     setIsScanning]     = useState(false);
  const [scanProgress,   setScanProgress]   = useState(0);   // 0–100
  const [dwellPct,       setDwellPct]       = useState(0);   // 0–100 namaste dwell
  const [namasteActive,  setNamasteActive]  = useState(false);

  const dwellStartRef = useRef<number | null>(null);
  const dwellRafRef   = useRef<number | null>(null);
  const scanStartRef  = useRef<number | null>(null);
  const scanRafRef    = useRef<number | null>(null);

  // ── Sync canvas sizes ─────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReady) return;
    const syncCanvases = () => {
      const { videoWidth, videoHeight } = video;
      if (!videoWidth || !videoHeight) return;
      setVideoDimensions({ width: videoWidth, height: videoHeight });
      onCanvasSize?.({ w: videoWidth, h: videoHeight });
      [skeletonCanvasRef.current, garmentCanvasRef.current, scanCanvasRef.current].forEach((c) => {
        if (!c) return;
        c.width  = videoWidth;
        c.height = videoHeight;
      });
    };
    syncCanvases();
    video.addEventListener('loadedmetadata', syncCanvases);
    const interval = setInterval(syncCanvases, 500);
    return () => {
      video.removeEventListener('loadedmetadata', syncCanvases);
      clearInterval(interval);
    };
  }, [isReady, videoRef, onCanvasSize]);

  // ── Capture photo ─────────────────────────────────────────────────────────
  const capture = async () => {
    const video = videoRef.current;
    if (!video) return;
    const tmp = document.createElement('canvas');
    tmp.width  = video.videoWidth;
    tmp.height = video.videoHeight;
    const ctx = tmp.getContext('2d');
    if (!ctx) return;
    ctx.scale(-1, 1);
    ctx.drawImage(video, -tmp.width, 0, tmp.width, tmp.height);
    if (onCapture) {
      const blob = await new Promise<Blob | null>((res) => tmp.toBlob(res, 'image/jpeg', 0.92));
      if (blob) onCapture(blob);
    } else {
      tmp.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a   = Object.assign(document.createElement('a'), { href: url, download: 'tryon-capture.jpg' });
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.92);
    }
  };

  const handleEnableCamera = async () => {
    setHasRequestedCamera(true);
    await startCamera();
  };

  // ── Trigger scan ──────────────────────────────────────────────────────────
  const triggerScan = useCallback(() => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setDwellPct(0);
    scanStartRef.current = performance.now();
    const tick = () => {
      const pct = Math.min(100, ((performance.now() - (scanStartRef.current ?? 0)) / SCAN_DURATION_MS) * 100);
      setScanProgress(pct);
      if (pct < 100) { scanRafRef.current = requestAnimationFrame(tick); }
      else { setIsScanning(false); setIsMirrorActive(true); }
    };
    scanRafRef.current = requestAnimationFrame(tick);
  }, [isScanning]);

  const handleStopMirror = useCallback(() => {
    setIsMirrorActive(false);
    setIsScanning(false);
    setScanProgress(0);
    setDwellPct(0);
    if (scanRafRef.current) cancelAnimationFrame(scanRafRef.current);
  }, []);

  // ── Namaste gesture dwell ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isReady) return;

    const isNamaste = detectNamaste(landmarks);
    setNamasteActive(isNamaste);

    if (isNamaste && !isScanning) {
      // Start dwell if not already running
      if (dwellStartRef.current === null) {
        dwellStartRef.current = performance.now();
        const dwellTick = () => {
          const elapsed = performance.now() - (dwellStartRef.current ?? 0);
          const pct     = Math.min(100, (elapsed / DWELL_MS) * 100);
          setDwellPct(pct);
          if (pct >= 100) {
            dwellStartRef.current = null;
            if (isMirrorActive) handleStopMirror();
            else triggerScan();
          } else {
            dwellRafRef.current = requestAnimationFrame(dwellTick);
          }
        };
        dwellRafRef.current = requestAnimationFrame(dwellTick);
      }
    } else {
      // Reset dwell when gesture breaks
      if (dwellRafRef.current) cancelAnimationFrame(dwellRafRef.current);
      dwellStartRef.current = null;
      if (!isNamaste) setDwellPct(0);
    }
  }, [landmarks, isReady, isScanning, isMirrorActive, triggerScan, handleStopMirror]);

  // ── Professional body scan canvas ─────────────────────────────────────────
  useEffect(() => {
    const canvas = scanCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (!isScanning) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }

    let rafId: number;
    const draw = () => {
      const W = canvas.width  || 640;
      const H = canvas.height || 480;
      ctx.clearRect(0, 0, W, H);
      const sweepY = (scanProgress / 100) * H;

      // 1. Vignette top
      const vTop = ctx.createLinearGradient(0, 0, 0, H * 0.28);
      vTop.addColorStop(0, 'rgba(11,18,32,0.55)');
      vTop.addColorStop(1, 'rgba(11,18,32,0)');
      ctx.fillStyle = vTop; ctx.fillRect(0, 0, W, H * 0.28);

      // Vignette bottom
      const vBot = ctx.createLinearGradient(0, H * 0.72, 0, H);
      vBot.addColorStop(0, 'rgba(11,18,32,0)');
      vBot.addColorStop(1, 'rgba(11,18,32,0.55)');
      ctx.fillStyle = vBot; ctx.fillRect(0, H * 0.72, W, H * 0.28);

      // 2. Grid
      ctx.save();
      ctx.strokeStyle = 'rgba(212,160,23,0.055)';
      ctx.lineWidth   = 1;
      for (let y = 0; y < H; y += H / 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      for (let x = 0; x < W; x += W / 18) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      ctx.restore();

      // 3. Scanned region blue tint
      const tint = ctx.createLinearGradient(0, 0, 0, sweepY);
      tint.addColorStop(0, 'rgba(0,180,255,0.045)');
      tint.addColorStop(1, 'rgba(0,180,255,0.02)');
      ctx.fillStyle = tint; ctx.fillRect(0, 0, W, sweepY);

      // 4. Laser sweep
      const laser = ctx.createLinearGradient(0, sweepY - 3, 0, sweepY + 5);
      laser.addColorStop(0,   'rgba(0,220,255,0)');
      laser.addColorStop(0.35,'rgba(0,220,255,0.92)');
      laser.addColorStop(0.6, 'rgba(212,160,23,0.98)');
      laser.addColorStop(1,   'rgba(212,160,23,0)');
      ctx.fillStyle = laser; ctx.fillRect(0, sweepY - 3, W, 8);

      // Glow halo
      const halo = ctx.createLinearGradient(0, sweepY, 0, sweepY + 48);
      halo.addColorStop(0, 'rgba(212,160,23,0.28)');
      halo.addColorStop(1, 'rgba(212,160,23,0)');
      ctx.fillStyle = halo; ctx.fillRect(0, sweepY, W, 48);

      // 5. Corner brackets
      const bLen = Math.min(W, H) * 0.08;
      const m    = 18;
      ctx.strokeStyle = 'rgba(0,220,255,0.88)';
      ctx.lineWidth   = 2.5;
      ctx.lineCap     = 'square';
      // TL
      ctx.beginPath(); ctx.moveTo(m, m + bLen); ctx.lineTo(m, m); ctx.lineTo(m + bLen, m); ctx.stroke();
      // TR
      ctx.beginPath(); ctx.moveTo(W - m - bLen, m); ctx.lineTo(W - m, m); ctx.lineTo(W - m, m + bLen); ctx.stroke();
      // BL
      ctx.beginPath(); ctx.moveTo(m, H - m - bLen); ctx.lineTo(m, H - m); ctx.lineTo(m + bLen, H - m); ctx.stroke();
      // BR
      ctx.beginPath(); ctx.moveTo(W - m - bLen, H - m); ctx.lineTo(W - m, H - m); ctx.lineTo(W - m, H - m - bLen); ctx.stroke();

      // 6. Tick marks along laser
      ctx.save();
      ctx.strokeStyle = 'rgba(212,160,23,0.72)';
      ctx.lineWidth   = 1.5;
      const ticks = 14;
      for (let i = 0; i <= ticks; i++) {
        const tx = (W / ticks) * i;
        const tl = i % 4 === 0 ? 9 : 4;
        ctx.beginPath(); ctx.moveTo(tx, sweepY - tl); ctx.lineTo(tx, sweepY + tl); ctx.stroke();
      }
      ctx.restore();

      // 7. Percentage + status text
      ctx.save();
      ctx.font         = 'bold 11px monospace';
      ctx.fillStyle    = 'rgba(212,160,23,0.9)';
      ctx.textAlign    = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${Math.round(scanProgress)}%`, W - m - 4, sweepY - 7);
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle    = 'rgba(0,220,255,0.78)';
      ctx.fillText('● BODY SCAN IN PROGRESS', m + 4, m + 8);
      ctx.restore();

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [isScanning, scanProgress]);

  const activeLandmarks = isMirrorActive ? landmarks : null;

  const stateLabel = useMemo(() => {
    if (error) return error;
    if (hasRequestedCamera && isLoading) return 'Initializing AR...';
    if (isReady) return 'Camera ready';
    return 'Tap Enable Camera to start';
  }, [error, hasRequestedCamera, isLoading, isReady]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0B1220]">
      <video
        ref={videoRef}
        className="absolute inset-0 z-0 h-full w-full object-cover [transform:scaleX(-1)]"
        autoPlay muted playsInline
      />

      {/* Body scan canvas */}
      <canvas ref={scanCanvasRef} className="absolute inset-0 z-25 h-full w-full pointer-events-none" />

      {/* Garment overlays */}
      {garmentModelUrl && activeLandmarks ? (
        <Garment3DOverlay
          landmarks={activeLandmarks}
          modelUrl={garmentModelUrl}
          garmentType={garmentType}
          canvasWidth={videoDimensions.width}
          canvasHeight={videoDimensions.height}
        />
      ) : (
        <>
          <canvas ref={garmentCanvasRef} className="absolute inset-0 z-20 h-full w-full pointer-events-none" />
          <ClothOverlay
            landmarks={activeLandmarks}
            garmentImageUrl={garmentImageUrl}
            canvasRef={garmentCanvasRef}
            garmentType={garmentType}
          />
        </>
      )}

      {/* Skeleton */}
      <canvas ref={skeletonCanvasRef} className="absolute inset-0 z-30 h-full w-full pointer-events-none" />
      <SkeletonRenderer landmarks={activeLandmarks} canvasRef={skeletonCanvasRef} show={showSkeleton} />

      {/* ── Namaste gesture indicator + dwell ring ── */}
      {isReady && (
        <div 
          className={`absolute z-40 flex flex-col items-center gap-2 transition-all duration-500 ${
            isMirrorActive 
              ? 'top-[60px] right-4 translate-x-0' 
              : 'bottom-24 left-1/2 -translate-x-1/2'
          }`}
        >
          {/* Dwell arc button */}
          <div
            onClick={() => {
              if (isScanning) return;
              if (isMirrorActive) handleStopMirror();
              else triggerScan();
            }}
            className="relative flex items-center justify-center cursor-pointer select-none"
            style={{ width: '82px', height: '82px' }}
          >
            <svg viewBox="0 0 82 82" className="absolute inset-0 w-full h-full">
              {/* Background circle */}
              <circle
                cx="41" cy="41" r="37"
                fill={
                  isMirrorActive
                    ? 'rgba(200,16,46,0.18)'
                    : namasteActive
                    ? 'rgba(212,160,23,0.15)'
                    : 'rgba(11,18,32,0.72)'
                }
                stroke={
                  isMirrorActive
                    ? 'rgba(200,16,46,0.55)'
                    : namasteActive
                    ? 'rgba(212,160,23,0.7)'
                    : 'rgba(245,241,232,0.12)'
                }
                strokeWidth="1.5"
              />
              {/* Track ring (faint) */}
              <circle
                cx="41" cy="41" r="37"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="4"
              />
              {/* Namaste dwell progress arc */}
              {dwellPct > 0 && (
                <circle
                  cx="41" cy="41" r="37"
                  fill="none"
                  stroke={isMirrorActive ? 'rgba(200,16,46,0.9)' : 'rgba(212,160,23,0.95)'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(dwellPct / 100) * 232.5} 232.5`}
                  transform="rotate(-90 41 41)"
                />
              )}
              {/* 4 tick marks */}
              {[0, 90, 180, 270].map((deg) => (
                <line
                  key={deg}
                  x1="41" y1="3" x2="41" y2="10"
                  stroke="rgba(212,160,23,0.45)"
                  strokeWidth="2"
                  transform={`rotate(${deg} 41 41)`}
                />
              ))}
            </svg>

            {/* Centre content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              {isMirrorActive ? (
                <>
                  <div className="text-sm font-black leading-none text-[#C8102E] mb-1">■</div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-[#C8102E]">Namaste</p>
                  <p className="text-[7px] font-bold uppercase tracking-widest text-[#F5F1E8]/50">to stop</p>
                </>
              ) : isScanning ? (
                <>
                  <p className="font-mono text-sm font-bold leading-none text-[#D4A017] mb-1">{Math.round(scanProgress)}%</p>
                  <p className="text-[7px] font-black uppercase tracking-widest text-[#D4A017]">Scanning</p>
                </>
              ) : (
                <>
                  {/* Folded Hands Namaste SVG in Lucide style (2px stroke, smooth curves) */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={namasteActive ? '#D4A017' : '#F5F1E8'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`mb-1 transition-colors duration-200 ${namasteActive ? 'scale-110' : ''}`}
                  >
                    {/* Left palm */}
                    <path d="M12 20c-1.5-2.5-3-6-3-9.5 0-3.5 1.5-6.5 3-8.5" />
                    {/* Right palm */}
                    <path d="M12 20c1.5-2.5 3-6 3-9.5 0-3.5-1.5-6.5-3-8.5" />
                    {/* Cuff lines */}
                    <path d="M9 20h6" />
                    <path d="M10 22h4" />
                  </svg>
                  <p className="text-[7px] font-black uppercase tracking-wider text-[#F5F1E8]/80 leading-none">
                    {namasteActive ? 'Hold...' : 'Namaste'}
                  </p>
                  <p className="text-[6.5px] font-bold uppercase tracking-widest text-[#D4A017] animate-pulse leading-none mt-0.5">
                    to start
                  </p>
                </>
              )}
            </div>

            {/* Pulse ring when gesture detected */}
            {namasteActive && !isMirrorActive && (
              <div className="absolute inset-0 rounded-full animate-ping border-2 border-[#D4A017]/50" />
            )}
          </div>

          {/* Instruction label below button */}
          <AnimatePresence mode="wait">
            {!isScanning && (
              <motion.p
                key={isMirrorActive ? 'stop' : namasteActive ? 'hold' : 'idle'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="text-[9px] font-bold uppercase tracking-widest text-center max-w-[120px] leading-tight"
                style={{ color: namasteActive ? '#D4A017' : 'rgba(245,241,232,0.4)' }}
              >
                {isMirrorActive
                  ? '🙏 Namaste to stop'
                  : namasteActive
                  ? `Hold… ${Math.round(dwellPct)}%`
                  : '🙏 Press palms together'}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Camera-not-ready overlay */}
      <AnimatePresence>
        {!isReady || error ? (
          <motion.div
            key="camera-state"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#0B1220]/80 p-6 text-center backdrop-blur-md"
          >
            <div className="max-w-sm space-y-5 border border-[#F5F1E8]/10 bg-[#131B2E]/90 p-8 shadow-2xl">
              <div className="mx-auto h-1 w-12 bg-[#C8102E]" />
              <div className="space-y-2">
                <p className="font-display text-2xl font-bold text-[#F5F1E8]">{stateLabel}</p>
                <p className="text-sm leading-relaxed text-[#9AA3B5]">
                  Allow camera access to map your pose directly in the browser.
                </p>
              </div>
              <div className="flex justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#D4A017]" style={{ opacity: 0.3 + i * 0.15 }} />
                ))}
              </div>
              <button
                onClick={() => void handleEnableCamera()}
                disabled={hasRequestedCamera && isLoading && !isReady}
                className="w-full bg-[#C8102E] px-8 py-3.5 text-sm font-bold text-[#F5F1E8] transition-all hover:bg-[#b00e28] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {hasRequestedCamera && isLoading && !isReady ? (
                  <><Loader2 size={16} className="animate-spin" />Initializing AR…</>
                ) : (
                  <><Camera size={16} />Enable Camera</>
                )}
              </button>
              <p className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest text-[#9AA3B5]">
                <Lock size={10} />
                On-device · No data leaves your browser
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* AR Live badge */}
      <div className="absolute right-4 top-4 z-40 flex items-center gap-1.5 border border-[#D4A017]/40 bg-[#0B1220]/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#D4A017] backdrop-blur-md">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4A017]" />
        {isMirrorActive ? 'Tracking Live' : 'AR Live'}
      </div>

      {/* FPS counter */}
      <div className="absolute bottom-4 right-4 z-40 border border-[#F5F1E8]/10 bg-[#0B1220]/60 px-3 py-1 text-xs font-mono text-[#9AA3B5] backdrop-blur-md">
        {fps > 0 ? `${fps} FPS` : 'Initializing…'}
      </div>

      {/* Capture button */}
      <div className="absolute bottom-24 right-4 z-40">
        <button
          onClick={capture}
          className="flex items-center gap-2 bg-[#C8102E] px-6 py-3 text-sm font-bold text-[#F5F1E8] shadow-lg shadow-[#C8102E]/30 transition-all hover:bg-[#b00e28] active:scale-[0.98]"
        >
          <ScanLine size={15} />
          Capture
        </button>
      </div>
    </div>
  );
}
