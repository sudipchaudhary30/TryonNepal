import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import AddGarmentModal from '@/components/ui/AddGarmentModal';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import type { Garment } from '@/types/garment';

export default function Wardrobe() {
  const { garments, isLoading, error, refetch } = useWardrobe();
  const selectedGarment = useWardrobeStore((state) => state.selectedGarment);
  const selectGarment = useWardrobeStore((state) => state.selectGarment);
  const navigate = useNavigate();
  const count = useMemo(() => garments.length, [garments.length]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTryInAR = (garment: Garment) => {
    selectGarment(garment);
    void navigate('/tryon');
  };

  if (isLoading && garments.length === 0) {
    return <Loader message="Loading wardrobe" />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-white">My Wardrobe</h1>
          <p className="mt-2 text-white/60">{count} garment{count === 1 ? '' : 's'} available</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsModalOpen(true)} className="bg-accent/20 text-accent hover:bg-accent hover:text-black">
            + Add Garment
          </Button>
          <Button onClick={() => void refetch()} loading={isLoading}>
            Refresh
          </Button>
        </div>
      </div>

      <AddGarmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => void refetch()} 
      />

      {error ? (
        <p className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {garments.map((garment) => {
          const isSelected = selectedGarment?.id === garment.id;
          const has3D = Boolean(garment.modelUrl);
          return (
            <article
              key={garment.id}
              className={`group flex flex-col overflow-hidden rounded-2xl border p-3 transition-all duration-200 ${
                isSelected
                  ? 'border-accent bg-accent/10 shadow-lg shadow-accent/10'
                  : 'border-white/10 bg-card hover:border-white/20'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-square overflow-hidden rounded-xl bg-white/5">
                <img
                  src={garment.thumbnailUrl}
                  alt={garment.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* 3D badge */}
                {has3D && (
                  <span className="absolute right-2 top-2 rounded-full border border-accent/40 bg-black/70 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-accent backdrop-blur-sm">
                    3D
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="mt-3 flex-1">
                <p className="truncate font-semibold text-white">{garment.name}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-white/50">{garment.category}</p>
                {garment.price != null && (
                  <p className="mt-1 text-sm font-bold text-accent">Rs. {garment.price}</p>
                )}
              </div>

              {/* Try in AR button */}
              <button
                type="button"
                onClick={() => handleTryInAR(garment)}
                className={`mt-3 w-full rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isSelected
                    ? 'bg-accent text-black shadow-md shadow-accent/20'
                    : 'border border-white/10 bg-white/5 text-white/70 hover:border-accent/40 hover:bg-accent/10 hover:text-accent'
                }`}
              >
                {isSelected ? '✓ Selected — View in AR' : 'Try in AR'}
              </button>
            </article>
          );
        })}
      </div>

      {garments.length === 0 && !isLoading && (
        <div className="mt-16 text-center text-white/40">
          <p className="text-4xl">👗</p>
          <p className="mt-3 text-lg font-semibold">No garments yet</p>
          <p className="text-sm">Garments will appear here once the backend is running.</p>
        </div>
      )}
    </div>
  );
}
