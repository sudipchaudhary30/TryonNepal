import { useEffect, useRef, useState } from 'react';
import { Pose, type Results } from '@mediapipe/pose';
import type { NormalizedLandmark } from '@/types/ar';

export function usePoseDetection(videoRef: React.RefObject<HTMLVideoElement>, isReady: boolean) {
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fps, setFps] = useState(0);
  
  const poseRef = useRef<Pose | null>(null);
  const requestRef = useRef<number>();
  const lastFrameTime = useRef<number>(0);
  const framesCount = useRef(0);
  const fpsCalculateTime = useRef<number>(0);

  useEffect(() => {
    if (!isReady || !videoRef.current) return;

    let isSubscribed = true;

    const initPose = async () => {
      try {
        const pose = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1, // 0=fast/low quality, 1=balanced, 2=slow/high quality
          smoothLandmarks: true,
          enableSegmentation: false, // Turn off segmentation for better performance
          smoothSegmentation: false,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.65,
        });

        pose.onResults((results: Results) => {
          if (!isSubscribed) return;
          if (results.poseLandmarks) {
            setLandmarks(results.poseLandmarks as NormalizedLandmark[]);
          } else {
            setLandmarks(null);
          }
          setIsLoading(false);
        });

        await pose.initialize();
        if (isSubscribed) {
          poseRef.current = pose;
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to init Pose:", error);
      }
    };

    void initPose();

    return () => {
      isSubscribed = false;
      if (poseRef.current) {
        poseRef.current.close().catch(console.error);
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isReady, videoRef]);

  // Video processing loop
  useEffect(() => {
    if (!isReady || isLoading || !videoRef.current || !poseRef.current) return;
    
    let isSubscribed = true;
    const video = videoRef.current;
    
    const processFrame = async () => {
      if (!isSubscribed || !video || video.readyState < 2) {
        requestRef.current = requestAnimationFrame(processFrame);
        return;
      }
      
      const now = performance.now();
      
      try {
        await poseRef.current?.send({ image: video });
        
        // Calculate FPS
        framesCount.current++;
        if (now - fpsCalculateTime.current > 1000) {
          setFps(Math.round((framesCount.current * 1000) / (now - fpsCalculateTime.current)));
          framesCount.current = 0;
          fpsCalculateTime.current = now;
        }
      } catch (error) {
        console.error("Pose processing error:", error);
      }
      
      if (isSubscribed) {
        requestRef.current = requestAnimationFrame(processFrame);
      }
    };
    
    fpsCalculateTime.current = performance.now();
    requestRef.current = requestAnimationFrame(processFrame);
    
    return () => {
      isSubscribed = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isReady, isLoading, videoRef]);

  return { landmarks, isLoading, fps };
}
