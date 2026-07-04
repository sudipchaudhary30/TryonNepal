import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

import { garmentApi, outfitApi } from '@/lib/api';
import type { Garment, GarmentFilter } from '@/types/garment';
import type { Outfit } from '@/types/outfit';

interface WardrobeStore {
  garments: Garment[];
  outfits: Outfit[];
  selectedGarment: Garment | null;
  filter: GarmentFilter;
  isLoading: boolean;
  error: string | null;
  fetchGarments: () => Promise<void>;
  addGarment: (garment: Garment) => Promise<void>;
  removeGarment: (id: string) => Promise<void>;
  selectGarment: (garment: Garment | null) => void;
  setFilter: (filter: GarmentFilter) => void;
  fetchOutfits: () => Promise<void>;
  saveOutfit: (name: string, garmentIds: readonly string[]) => Promise<void>;
}

export const useWardrobeStore = create<WardrobeStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        garments: [],
        outfits: [],
        selectedGarment: null,
        filter: { category: 'ALL' },
        isLoading: false,
        error: null,
        fetchGarments: async () => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });
          try {
            const garments = await garmentApi.getAll(get().filter);
            set((state) => {
              state.garments = garments;
              if (!state.selectedGarment && garments.length > 0) {
                state.selectedGarment = garments[0] ?? null;
              }
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to fetch garments';
            });
          }
        },
        addGarment: async (garment) => {
          set((state) => {
            state.garments = [garment, ...state.garments];
          });
        },
        removeGarment: async (id) => {
          const previous = get().garments;
          set((state) => {
            state.garments = state.garments.filter((item) => item.id !== id);
            if (state.selectedGarment?.id === id) {
              state.selectedGarment = state.garments[0] ?? null;
            }
          });
          try {
            await garmentApi.delete(id);
          } catch (error) {
            set((state) => {
              state.garments = previous;
              if (!state.selectedGarment && previous.length > 0) {
                state.selectedGarment = previous[0] ?? null;
              }
              state.error = error instanceof Error ? error.message : 'Failed to delete garment';
            });
          }
        },
        selectGarment: (garment) => {
          set((state) => {
            state.selectedGarment = garment;
          });
        },
        setFilter: (filter) => {
          set((state) => {
            state.filter = filter;
          });
        },
        fetchOutfits: async () => {
          set((state) => {
            state.isLoading = true;
          });
          try {
            const outfits = await outfitApi.getAll();
            set((state) => {
              state.outfits = outfits;
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to fetch outfits';
            });
          }
        },
        saveOutfit: async (name, garmentIds) => {
          const outfit = await outfitApi.create(name, [...garmentIds]);
          set((state) => {
            state.outfits = [outfit, ...state.outfits];
          });
        },
      })),
      {
        name: 'ar-tryon-nepal-wardrobe-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ selectedGarment: state.selectedGarment, filter: state.filter }),
      },
    ),
    { name: 'ar-tryon-nepal-wardrobe-store' },
  ),
);
