import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
}

export default function CameraView({ 
  onCapture, 
  showSkeleton = false, 
  garmentImageUrl = null, 
  garmentModelUrl = null, 
  garmentType = 'upper_body' 
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
    <div className="relative h-full w-full overflow-hidden bg-black">
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
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 p-6 text-center backdrop-blur-md"
          >
            <div className="max-w-sm space-y-4 rounded-2xl border border-white/10 bg-black/40 p-6">
              <p className="font-display text-2xl font-bold text-white">{stateLabel}</p>
              <p className="text-sm text-white/70">Allow camera access to map your pose directly in the browser.</p>
              <Button onClick={() => void handleEnableCamera()} loading={hasRequestedCamera && isLoading && !isReady}>
                Enable Camera
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* AR Live badge */}
      <div className="absolute right-4 top-4 z-40 flex items-center gap-1.5 rounded-full border border-accent/30 bg-black/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-accent backdrop-blur-md">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        AR Live
      </div>

      {/* FPS counter */}
      <div className="absolute bottom-16 right-4 z-40 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs text-white/50 backdrop-blur-md">
        {fps > 0 ? `${fps} FPS` : 'Initializing…'}
      </div>

      {/* Capture Photo button — centered at bottom */}
      <div className="absolute bottom-6 left-1/2 z-40 -translate-x-1/2">
        <Button variant="primary" onClick={capture} className="px-8 shadow-2xl shadow-accent/25 text-sm font-bold">
          📸 Capture Photo
        </Button>
      </div>
    </div>
  );
}
