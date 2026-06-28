import { Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { GarmentType, NormalizedLandmark } from '@/types/ar';
import { useBodyTracker } from '@/hooks/useBodyTracker';

interface Garment3DOverlayProps {
  landmarks: readonly NormalizedLandmark[] | null;
  modelUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  garmentType: GarmentType;
}

export default function Garment3DOverlay({
  landmarks,
  modelUrl,
  canvasWidth,
  canvasHeight,
  garmentType
}: Garment3DOverlayProps) {
  return (
    <div className="absolute inset-0 z-20 h-full w-full pointer-events-none">
      <Canvas orthographic camera={{ position: [0, 0, 5], near: 0.1, far: 1000, zoom: 1 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[0, 10, 5]} intensity={1.5} />
        <directionalLight position={[-5, 0, -5]} intensity={0.5} />
        <Suspense fallback={null}>
          <GarmentModel 
            landmarks={landmarks} 
            modelUrl={modelUrl} 
            canvasWidth={canvasWidth} 
            canvasHeight={canvasHeight} 
            garmentType={garmentType} 
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

function GarmentModel({ landmarks, modelUrl, canvasWidth, canvasHeight, garmentType }: Garment3DOverlayProps) {
  const { scene } = useGLTF(modelUrl);
  
  // Clone the scene so multiple instances don't share transforms if used repeatedly
  const mesh = useMemo(() => scene.clone(), [scene]);
  
  const metrics = useBodyTracker(landmarks, canvasWidth, canvasHeight, 0.2); // Smoothing alpha 0.2 for 3D lerp

  useFrame(() => {
    if (!metrics.hasValidTracking) return;

    // 1. Calculate World Anchor Position
    // Three.js orthographic origin is at center. Canvas origin is top-left.
    let anchorX = metrics.shoulderCenterX;
    let anchorY = metrics.neckY;

    if (garmentType === 'lower_body') {
      anchorX = metrics.hipCenterX;
      anchorY = metrics.hipCenterY;
    }

    const worldX = anchorX - canvasWidth / 2;
    const worldY = -(anchorY - canvasHeight / 2); // Three.js Y is up

    // 2. Calculate Scale
    let baseScaleX = metrics.shoulderWidth * 1.45;
    let baseScaleY = metrics.torsoHeight * 1.35;
    
    if (garmentType === 'lower_body') {
      baseScaleX = metrics.shoulderWidth * 1.25;
      baseScaleY = metrics.torsoHeight * 1.5;
    } else if (garmentType === 'full_body' || garmentType === 'traditional') {
      baseScaleX = metrics.shoulderWidth * 1.5;
      baseScaleY = metrics.torsoHeight * 2.3;
    }

    const scaleZ = baseScaleX * 0.35; // Volumetric depth

    // 3. Offset pivot so top of mesh aligns with anchor
    const pivotOffsetDown = baseScaleY * 0.42;
    const finalY = worldY - pivotOffsetDown;

    // 4. Lateral shift on turn
    const shiftX = metrics.turnY * baseScaleX * 0.06;
    const finalX = worldX + shiftX;

    // 5. Apply transformations smoothly via frame loop
    // Because useBodyTracker already uses EMA, we just assign directly.
    mesh.position.set(finalX, finalY, 0);
    mesh.scale.set(baseScaleX, baseScaleY, scaleZ);

    // Rotations (Three.js Euler: YXZ order best for humanoid)
    // tiltZ needs to be negative because Three.js Y goes up, Canvas Y goes down
    mesh.rotation.set(metrics.leanX, metrics.turnY, -metrics.tiltZ, 'YXZ');
  });

  return <primitive object={mesh} />;
}
