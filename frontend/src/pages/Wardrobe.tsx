import { useEffect, useMemo, useState } from 'react';
import { Shirt } from 'lucide-react';

import Loader from '@/components/ui/Loader';
import AddGarmentModal from '@/components/ui/AddGarmentModal';
import ARFittingRoom from '@/components/ar/ARFittingRoom';
import { garmentApi } from '@/lib/api';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import { useUserStore } from '@/store/useUserStore';
import { demoGarments } from '@/lib/demoGarments';
import type { Garment } from '@/types/garment';

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  TOP:        'bg-blue-500/20 text-blue-300 border-blue-500/30',
  BOTTOM:     'bg-purple-500/20 text-purple-300 border-purple-500/30',
  DRESS:      'bg-pink-500/20 text-pink-300 border-pink-500/30',
  OUTERWEAR:  'bg-orange-500/20 text-orange-300 border-orange-500/30',
  TRADITIONAL:'bg-amber-500/20 text-amber-300 border-amber-500/30',
  ACCESSORY:  'bg-teal-500/20 text-teal-300 border-teal-500/30',
};

export default function Wardrobe() {
  const { selectedGarment, selectGarment } = useWardrobeStore();
  const user = useUserStore((s) => s.user);

  const [garments, setGarments]     = useState<Garment[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // When non-null the user has clicked "Try On" — show ARFittingRoom
  const [arGarment, setArGarment]   = useState<Garment | null>(null);

  const count = useMemo(() => garments.length, [garments.length]);

  const loadGarments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all private garments (is_private=true) — backend filters by scope
      // We don't require a userId so uploaded garments always appear
      const privateItems = await garmentApi.getAll({ scope: 'wardrobe' });
      // Merge demo garments first so AR mirror always has garments to show
      const merged = [...demoGarments, ...privateItems];
      const deduped = Array.from(new Map(merged.map((g) => [g.id, g])).values());
      setGarments(deduped);
    } catch (e) {
      setError('Failed to load wardrobe.');
      setGarments(demoGarments);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadGarments(); }, []);

  // ── AR fitting room view ────────────────────────────────────────────────────
  if (arGarment) {
    const footerActions = (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 bg-[#C8102E] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#F5F1E8] hover:brightness-110 transition-all"
        >
          <span>+</span> Upload Your Cloth
        </button>
        <button
          onClick={() => setArGarment(null)}
          className="w-full border border-[#F5F1E8]/10 py-2.5 text-xs font-bold uppercase tracking-wider text-[#9AA3B5] hover:border-[#F5F1E8]/20 hover:text-[#F5F1E8] transition-all"
        >
          ← Back to Wardrobe
        </button>
      </>
    );

    const headerSlot = (
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D4A017] animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-[#D4A017]">My Wardrobe</span>
        </div>
        <h1 className="font-display text-lg font-black text-[#F5F1E8] leading-tight">AR Mirror</h1>
        <p className="mt-0.5 text-[10px] text-[#9AA3B5]">Select any garment from the list</p>
      </div>
    );

    return (
      <>
        <ARFittingRoom
          garments={garments}
          selectedGarment={selectedGarment}
          onSelectGarment={selectGarment}
          isLoading={isLoading}
          headerSlot={headerSlot}
          footerActions={footerActions}
          railLabel="My Wardrobe"
        />
        <AddGarmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => void loadGarments()}
        />
      </>
    );
  }

  // ── Default grid view ──────────────────────────────────────────────────────
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
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#D4A017] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A017]">Personal Space</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#F5F1E8]">My Wardrobe</h1>
            <p className="mt-2 text-sm text-[#9AA3B5]">
              Your private collection. Upload pieces to try on in real-time AR.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="rounded-full border border-[#F5F1E8]/10 bg-[#131B2E]/50 px-3 py-1 text-xs text-[#9AA3B5]">
                {count} garments saved
              </span>
              <span className="rounded-full border border-[#D4A017]/20 bg-[#D4A017]/10 px-3 py-1 text-xs text-[#D4A017]">
                Private — only visible to you
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#C8102E] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#F5F1E8] transition-all hover:brightness-110 hover:scale-[1.01] whitespace-nowrap"
            >
              <span className="text-base">+</span>
              <span className="hidden sm:inline">Upload Your Cloth</span>
              <span className="sm:hidden">Upload</span>
            </button>
            <button
              onClick={() => void loadGarments()}
              className="border border-[#F5F1E8]/10 bg-[#131B2E]/50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#9AA3B5] hover:border-[#F5F1E8]/20 hover:text-[#F5F1E8] whitespace-nowrap"
            >
              Refresh
            </button>
          </div>
        </div>

        <AddGarmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => void loadGarments()}
        />

        {error && (
          <p className="mb-6 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
        )}

        {garments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Shirt size={48} className="mb-4 text-[#9AA3B5] opacity-40" />
            <p className="text-xl font-bold text-[#F5F1E8]/70">No garments yet</p>
            <p className="mt-2 text-sm text-[#9AA3B5] max-w-sm">
              Your personal wardrobe is empty. Click "+ Upload Your Cloth" to upload your first private piece.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 bg-[#C8102E] px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-[#F5F1E8] hover:brightness-110"
            >
              Upload Your Cloth
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {garments.map((garment) => {
              const fileType = (garment as any).fileType ?? (garment.modelUrl ? '3D' : '2D');
              const catColor = CATEGORY_BADGE_COLORS[garment.category] ?? 'bg-white/10 text-white/60 border-white/20';

              return (
                <article
                  key={garment.id}
                  className="group relative flex flex-col overflow-hidden border border-[#F5F1E8]/10 bg-[#131B2E] transition-all duration-300 hover:border-[#D4A017]/40"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square overflow-hidden bg-black/30">
                    <img
                      src={garment.thumbnailUrl}
                      alt={garment.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${catColor}`}>
                        {garment.category}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                        fileType === '3D'
                          ? 'border-purple-500/40 bg-purple-500/20 text-purple-300'
                          : 'border-white/20 bg-white/10 text-white/60'
                      }`}>
                        {fileType}
                      </span>
                    </div>
                    {garment.isPrivate && (
                      <span className="absolute top-2 right-2 border border-[#D4A017]/30 bg-[#0B1220]/80 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#D4A017]">
                        Private
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <h3 className="font-bold text-[#F5F1E8] line-clamp-1">{garment.name}</h3>
                      <p className="text-xs text-[#9AA3B5] mt-0.5">{garment.brand || 'Personal Item'}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        selectGarment(garment);
                        setArGarment(garment);
                      }}
                      className="mt-auto w-full border border-[#C8102E]/30 bg-[#C8102E]/10 py-2.5 text-xs font-bold uppercase tracking-wider text-[#C8102E] transition-all hover:bg-[#C8102E] hover:text-[#F5F1E8]"
                    >
                      Try On →
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
