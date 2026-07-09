import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import AddGarmentModal from '@/components/ui/AddGarmentModal';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import type { Garment } from '@/types/garment';

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  TOP: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  BOTTOM: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  DRESS: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  OUTERWEAR: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  TRADITIONAL: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  ACCESSORY: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
};

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
    <div className="relative min-h-screen bg-[#0B1220] text-[#F5F1E8]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Background glows */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#C8102E]/8 blur-[120px]" />
        <div className="absolute top-1/2 right-0 h-80 w-80 rounded-full bg-[#D4A017]/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#D4A017] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A017]">Personal Space</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#F5F1E8]">My Wardrobe</h1>
            <p className="mt-2 text-sm text-[#9AA3B5]">
              Your private collection of garments. Upload custom pieces to try them on in real-time AR.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="rounded-full border border-[#F5F1E8]/10 bg-[#131B2E]/50 px-3 py-1 text-xs text-[#9AA3B5]">
                {count} garments saved
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#C8102E] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#F5F1E8] transition-all hover:brightness-110 hover:scale-[1.01] whitespace-nowrap"
            >
              <span className="text-base">+</span> <span className="hidden sm:inline">Add Garment</span><span className="sm:hidden">Add</span>
            </button>
            <button
              onClick={() => void refetch()}
              className="border border-[#F5F1E8]/10 bg-[#131B2E]/50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#9AA3B5] hover:border-[#F5F1E8]/20 hover:text-[#F5F1E8] whitespace-nowrap"
            >
              Refresh
            </button>
          </div>
        </div>

        <AddGarmentModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => void refetch()} 
        />

        {error ? (
          <p className="mb-6 rounded-none border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        {garments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <span className="text-6xl mb-4">👕</span>
            <p className="text-xl font-bold text-[#F5F1E8]/70">No garments yet</p>
            <p className="mt-2 text-sm text-[#9AA3B5] max-w-sm">
              Your personal wardrobe is empty. Click "+ Add Garment" to upload your first personal piece.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 bg-[#C8102E] px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-[#F5F1E8] hover:brightness-110"
            >
              Add Garment
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {garments.map((garment) => {
              const isSelected = selectedGarment?.id === garment.id;
              const fileType = (garment as any).fileType ?? (garment.modelUrl ? '3D' : '2D');
              const catColor = CATEGORY_BADGE_COLORS[garment.category] ?? 'bg-white/10 text-white/60 border-white/20';
              
              return (
                <article
                  key={garment.id}
                  className={`group relative flex flex-col overflow-hidden border bg-[#131B2E] transition-all duration-300 ${
                    isSelected
                      ? 'border-[#D4A017] shadow-lg shadow-[#D4A017]/10'
                      : 'border-[#F5F1E8]/10 hover:border-[#D4A017]/40'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square overflow-hidden bg-black/30">
                    <img
                      src={garment.thumbnailUrl}
                      alt={garment.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${catColor}`}>
                        {garment.category}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${fileType === '3D' ? 'border-purple-500/40 bg-purple-500/20 text-purple-300' : 'border-white/20 bg-white/10 text-white/60'}`}>
                        {fileType}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <h3 className="font-bold text-[#F5F1E8] line-clamp-1">{garment.name}</h3>
                      <p className="text-xs text-[#9AA3B5] mt-0.5">{garment.brand || 'Personal Item'}</p>
                    </div>
                    {garment.price != null && (
                      <p className="text-sm font-extrabold text-[#D4A017]">Rs. {garment.price}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => handleTryInAR(garment)}
                      className={`mt-auto w-full py-2.5 text-xs font-bold uppercase tracking-wider border transition-all ${
                        isSelected
                          ? 'border-[#D4A017] bg-[#D4A017]/10 text-[#D4A017] hover:bg-[#D4A017] hover:text-[#0B1220]'
                          : 'border-[#C8102E]/30 bg-[#C8102E]/10 text-[#C8102E] hover:bg-[#C8102E] hover:text-[#F5F1E8]'
                      }`}
                    >
                      {isSelected ? 'Selected ✓' : 'Try On →'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
