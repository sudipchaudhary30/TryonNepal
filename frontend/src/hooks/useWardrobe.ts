import { useCallback, useEffect, useState } from 'react';

import { garmentApi } from '@/lib/api';
import type { Garment } from '@/types/garment';

interface UseWardrobeResult {
  garments: Garment[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWardrobe(): UseWardrobeResult {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const items = await garmentApi.getAll();
      if (!controller.signal.aborted) {
        setGarments(items);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to load wardrobe');
    } finally {
      setIsLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { garments, isLoading, error, refetch };
}
