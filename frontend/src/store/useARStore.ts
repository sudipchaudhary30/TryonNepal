import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

import type { ARState, GarmentType, NormalizedLandmark, TryOnResult } from '@/types/ar';
import type { Garment } from '@/types/garment';



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
      resetAR: () => set((state) => {
        state.isActive = false;
        state.landmarks = null;
        state.isLoading = false;
        state.error = null;
        state.fps = 0;
        state.selectedGarment = null;
        state.tryOnResult = null;
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
