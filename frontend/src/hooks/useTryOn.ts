import { useCallback, useState } from 'react';

import { tryOnApi } from '@/lib/api';
import type { GarmentType, TryOnResult } from '@/types/ar';

interface UseTryOnResult {
  resultUrl: string | null;
  isProcessing: boolean;
  error: string | null;
  trigger: (personBlob: Blob, garmentId: string, garmentType: GarmentType) => Promise<void>;
}

export function useTryOn(): UseTryOnResult {
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trigger = useCallback(async (personBlob: Blob, garmentId: string, garmentType: GarmentType) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result: TryOnResult = await tryOnApi.run(personBlob, garmentId, garmentType);
      setResultUrl(result.resultImageUrl);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Try-on request failed');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { resultUrl, isProcessing, error, trigger };
}
