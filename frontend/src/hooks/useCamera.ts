import { useCallback, useEffect, useRef, useState } from 'react';

interface CameraState {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  isReady: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCamera(): CameraState {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startPromiseRef = useRef<Promise<void> | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setIsReady(false);
    startPromiseRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    if (startPromiseRef.current) {
      return startPromiseRef.current;
    }

    if (streamRef.current) {
      setStream(streamRef.current);
      setIsReady(true);
      return Promise.resolve();
    }

    setError(null);
    const startPromise = (async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });

        streamRef.current = mediaStream;
        setStream(mediaStream);

        const video = videoRef.current;
        if (video) {
          video.srcObject = mediaStream;
          await new Promise<void>((resolve) => {
            if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
              resolve();
              return;
            }
            video.onloadedmetadata = () => resolve();
          });

          await video.play().catch(() => undefined);
        }

        setIsReady(true);
      } catch (caughtError) {
        const domError = caughtError as DOMException;
        if (domError.name === 'NotAllowedError') {
          setError('Camera permission denied');
        } else if (domError.name === 'NotFoundError') {
          setError('No camera found');
        } else {
          setError(domError.message || 'Unable to access camera');
        }
        setIsReady(false);
      } finally {
        startPromiseRef.current = null;
      }
    })();

    startPromiseRef.current = startPromise;
    return startPromise;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  return { videoRef, stream, isReady, error, startCamera, stopCamera };
}
