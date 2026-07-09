import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Loader2, Lock, ScanLine } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import type { GarmentType } from '@/types/ar';
import Button from '@/components/ui/Button';
import ClothOverlay from './ClothOverlay';
import Garment3DOverlay from './Garment3DOverlay';
import SkeletonRenderer from './SkeletonRenderer';

interface CameraViewProps {
  onCapture?: (blob: Blob) => void;
  showSkeleton?: boolean;
  garmentImageUrl?: string | null;
  garmentModelUrl?: string | null;
  garmentType?: GarmentType;
  /** Called whenever the camera canvas dimensions change, so parent can use them for size estimation */
  onCanvasSize?: (size: { w: number; h: number }) => void;
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
  const garmentCanvasRef = useRef<HTMLCanvasElement>(null);

  const { landmarks, isLoading, fps } = usePoseDetection(videoRef, isReady);

  // Sync canvas sizes with video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReady) return;

    const syncCanvases = () => {
      const { videoWidth, videoHeight } = video;
      if (!videoWidth || !videoHeight) return;
      
      setVideoDimensions({ width: videoWidth, height: videoHeight });
      onCanvasSize?.({ w: videoWidth, h: videoHeight });
      
      [skeletonCanvasRef.current, garmentCanvasRef.current].forEach(canvas => {
        if (!canvas) return;
        canvas.width = videoWidth;
        canvas.height = videoHeight;
      });
    };

    syncCanvases();
    video.addEventListener('loadedmetadata', syncCanvases);
    const interval = setInterval(syncCanvases, 500);
    
    return () => {
      video.removeEventListener('loadedmetadata', syncCanvases);
      clearInterval(interval);
    };
  }, [isReady, videoRef]);

  const capture = async () => {
    const video = videoRef.current;
    if (!video || !onCapture) {
      if (!video) return;
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = video.videoWidth;
      tmpCanvas.height = video.videoHeight;
      const tmpCtx = tmpCanvas.getContext('2d');
      if (!tmpCtx) return;
      // Capture exactly what the camera sees (mirrored)
      tmpCtx.scale(-1, 1);
      tmpCtx.drawImage(video, -tmpCanvas.width, 0, tmpCanvas.width, tmpCanvas.height);
      tmpCanvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tryon-capture.jpg';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.92);
      return;
    }
    
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const ctx = captureCanvas.getContext('2d');
    if (!ctx) return;
    
    // To match ML expectation, capture mirrored
    ctx.scale(-1, 1);
    ctx.drawImage(video, -captureCanvas.width, 0, captureCanvas.width, captureCanvas.height);
    const blob = await new Promise<Blob | null>((resolve) => captureCanvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (blob) {
      onCapture(blob);
    }
  };

  const stateLabel = useMemo(() => {
    if (error) return error;
    if (hasRequestedCamera && isLoading) return 'Initializing AR...';
    if (isReady) return 'Camera ready';
    return 'Tap Enable Camera to start';
  }, [error, hasRequestedCamera, isLoading, isReady]);

  const handleEnableCamera = async () => {
    setHasRequestedCamera(true);
    await startCamera();
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0B1220]">
      <video ref={videoRef} className="absolute inset-0 z-0 h-full w-full object-cover [transform:scaleX(-1)]" autoPlay muted playsInline />

      {garmentModelUrl && landmarks ? (
        <Garment3DOverlay
          landmarks={landmarks}
          modelUrl={garmentModelUrl}
          garmentType={garmentType}
          canvasWidth={videoDimensions.width}
          canvasHeight={videoDimensions.height}
        />
      ) : (
        <>
          <canvas ref={garmentCanvasRef} className="absolute inset-0 z-20 h-full w-full pointer-events-none" />
          <ClothOverlay 
            landmarks={landmarks} 
            garmentImageUrl={garmentImageUrl} 
            canvasRef={garmentCanvasRef} 
            garmentType={garmentType} 
          />
        </>
      )}

      <canvas ref={skeletonCanvasRef} className="absolute inset-0 z-30 h-full w-full pointer-events-none" />
      <SkeletonRenderer landmarks={landmarks} canvasRef={skeletonCanvasRef} show={showSkeleton} />

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
              {/* Dhaka-motif top accent */}
              <div className="mx-auto h-1 w-12 bg-[#C8102E]" />

              <div className="space-y-2">
                <p className="font-display text-2xl font-bold text-[#F5F1E8]">{stateLabel}</p>
                <p className="text-sm leading-relaxed text-[#9AA3B5]">
                  Allow camera access to map your pose directly in the browser.
                </p>
              </div>

              {/* Tracking dots preview */}
              <div className="flex justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-[#D4A017]"
                    style={{ opacity: 0.3 + i * 0.15 }}
                  />
                ))}
              </div>

              <button
                onClick={() => void handleEnableCamera()}
                disabled={hasRequestedCamera && isLoading && !isReady}
                className="w-full bg-[#C8102E] px-8 py-3.5 text-sm font-bold text-[#F5F1E8] transition-all hover:bg-[#b00e28] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {hasRequestedCamera && isLoading && !isReady ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Initializing AR…
                  </>
                ) : (
                  <>
                    <Camera size={16} />
                    Enable Camera
                  </>
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
        AR Live
      </div>

      {/* FPS counter */}
      <div className="absolute bottom-16 right-4 z-40 border border-[#F5F1E8]/10 bg-[#0B1220]/60 px-3 py-1 text-xs font-mono text-[#9AA3B5] backdrop-blur-md">
        {fps > 0 ? `${fps} FPS` : 'Initializing…'}
      </div>

      {/* Capture Photo button — centered at bottom */}
      <div className="absolute bottom-6 left-1/2 z-40 -translate-x-1/2">
        <button
          onClick={capture}
          className="flex items-center gap-2 bg-[#C8102E] px-10 py-3.5 text-sm font-bold text-[#F5F1E8] shadow-lg shadow-[#C8102E]/30 transition-all hover:bg-[#b00e28] active:scale-[0.98]"
        >
          <ScanLine size={16} />
          Capture Photo
        </button>
      </div>
    </div>
  );
}
