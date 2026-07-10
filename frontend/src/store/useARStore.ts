import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

import type { ARState, GarmentType, NormalizedLandmark, TryOnResult } from '@/types/ar';
import type { Garment } from '@/types/garment';

interface ARStore extends ARState {
  fps: number;
  selectedGarment: Garment | null;
  tryOnResult: TryOnResult | null;
  setLandmarks: (landmarks: readonly NormalizedLandmark[] | null) => void;
  setFps: (fps: number) => void;
  selectGarment: (garment: Garment | null) => void;
  setTryOnResult: (result: TryOnResult | null) => void;
  resetAR: () => void;
  setError: (error: string | null) => void;
  setActive: (isActive: boolean) => void;
}

const initialState: Pick<ARStore, 'isActive' | 'landmarks' | 'isLoading' | 'error' | 'fps' | 'selectedGarment' | 'tryOnResult'> = {
  isActive: false,
  landmarks: null,
  isLoading: false,
  error: null,
  fps: 0,
  selectedGarment: null,
  tryOnResult: null,
};

export const useARStore = create<ARStore>()(
  devtools(
    immer((set) => ({
      ...initialState,
      setLandmarks: (landmarks) => set((state) => {
        state.landmarks = landmarks ? [...landmarks] : null;
      }),
      setFps: (fps) => set((state) => {
        state.fps = fps;
      }),
      selectGarment: (garment) => set((state) => {
        state.selectedGarment = garment;
      }),
      setTryOnResult: (result) => set((state) => {
        state.tryOnResult = result;
      }),
   
      setError: (error) => set((state) => {
        state.error = error;
      }),
      setActive: (isActive) => set((state) => {
        state.isActive = isActive;
      }),
    })),
    { name: 'ar-tryon-nepal-ar-store' },
  ),
);
