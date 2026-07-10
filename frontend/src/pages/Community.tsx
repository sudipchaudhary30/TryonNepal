import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt } from 'lucide-react';

import ARFittingRoom from '@/components/ar/ARFittingRoom';
import UploadPortal from '@/components/ui/UploadPortal';
import { garmentApi } from '@/lib/api';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import { demoGarments } from '@/lib/demoGarments';
import type { Garment } from '@/types/garment';

const CATEGORY_FILTERS: { label: string; value: string }[] = [
  { label: 'All',         value: 'ALL' },
  { label: 'Tops',        value: 'TOP' },
  { label: 'Bottoms',     value: 'BOTTOM' },
  { label: 'Dresses',     value: 'DRESS' },
  { label: 'Outerwear',   value: 'OUTERWEAR' },
  { label: 'Traditional', value: 'TRADITIONAL' },
  { label: 'Accessories', value: 'ACCESSORY' },
];

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  TOP:        'bg-blue-500/20 text-blue-300 border-blue-500/30',
  BOTTOM:     'bg-purple-500/20 text-purple-300 border-purple-500/30',
  DRESS:      'bg-pink-500/20 text-pink-300 border-pink-500/30',
  OUTERWEAR:  'bg-orange-500/20 text-orange-300 border-orange-500/30',
  TRADITIONAL:'bg-amber-500/20 text-amber-300 border-amber-500/30',
  ACCESSORY:  'bg-teal-500/20 text-teal-300 border-teal-500/30',
};



  // When non-null → show ARFittingRoom for this garment
  const [arGarment, setArGarment] = useState<Garment | null>(null);

  const loadGarments = useCallback(async () => {
    setIsLoading(true);
    try {
      const communityItems = await garmentApi.getAll({ scope: 'community' });
      const merged  = [...demoGarments, ...communityItems];
      const deduped = Array.from(new Map(merged.map((g) => [g.id, g])).values());
      setAllGarments(deduped);
    } catch {
      setAllGarments(demoGarments);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadGarments(); }, [loadGarments]);

  // Local filtering
  useEffect(() => {
    let result = allGarments;
    if (activeCategory !== 'ALL') {
      result = result.filter((g) => g.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((g) =>
        [g.name, g.brand ?? '', g.category, (g as any).uploadedBy ?? ''].join(' ').toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [allGarments, activeCategory, searchQuery]);

  // ── ARFittingRoom view ──────────────────────────────────────────────────────
  if (arGarment) {
    const headerSlot = (
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D4A017] animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-[#D4A017]">Community Wardrobe</span>
        </div>
        <h1 className="font-display text-lg font-black text-[#F5F1E8] leading-tight">AR Mirror</h1>
        <p className="mt-0.5 text-[10px] text-[#9AA3B5]">Select any garment from the list below</p>
      </div>
    );

    const footerActions = (
      <>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex w-full items-center justify-center gap-2 bg-[#C8102E] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#F5F1E8] hover:brightness-110 transition-all"
        >
          <span>↑</span> Upload Your Clothes
        </button>
        <button
          onClick={() => setArGarment(null)}
          className="w-full border border-[#F5F1E8]/10 py-2.5 text-xs font-bold uppercase tracking-wider text-[#9AA3B5] hover:border-[#F5F1E8]/20 hover:text-[#F5F1E8] transition-all"
        >
          ← Back to Community
        </button>
      </>
    );

    return (
      <>
        <ARFittingRoom
          garments={filtered.length > 0 ? filtered : allGarments}
          selectedGarment={selectedGarment}
          onSelectGarment={selectGarment}
          isLoading={isLoading}
          headerSlot={headerSlot}
          footerActions={footerActions}
          railLabel="Community Wardrobe"
        />
        <UploadPortal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploadSuccess={loadGarments}
        />
      </>
    );
  }

  // ── Default grid view ───────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-[#0B1220] text-[#F5F1E8]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Background glows */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#C8102E]/8 blur-[120px]" />
        <div className="absolute top-1/2 right-0 h-80 w-80 rounded-full bg-[#D4A017]/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#D4A017] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A017]">Community Wardrobe</span>
            </div>
            <h1 className="font-display text-4xl font-black text-[#F5F1E8] sm:text-5xl">
              Try Community Clothes
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[#9AA3B5]">
              Browse clothing uploaded by the community. Select any piece and try it on instantly in the AR mirror.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="rounded-full border border-[#F5F1E8]/10 bg-[#131B2E]/50 px-3 py-1 text-xs text-[#9AA3B5]">
                {allGarments.length} garments available
              </span>
              <span className="rounded-full border border-[#D4A017]/20 bg-[#D4A017]/10 px-3 py-1 text-xs text-[#D4A017]">
                {allGarments.filter((g) => (g as any).fileType === '3D').length} 3D models
              </span>
            </div>
          </div>
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 bg-[#C8102E] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#F5F1E8] transition-all hover:brightness-110 hover:scale-[1.01]"
          >
            <span className="text-base">↑</span>
            Upload Your Clothes
          </button>
        </div>

        {/* Search + Filter Bar */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search garments, brands, uploaders..."
            className="min-w-[240px] flex-1 border border-[#F5F1E8]/10 bg-[#131B2E]/50 px-4 py-2.5 text-sm text-[#F5F1E8] placeholder:text-[#9AA3B5]/40 focus:border-[#C8102E]/50 focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((cf) => (
              <button
                key={cf.value}
                onClick={() => setActiveCategory(cf.value)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all ${
                  activeCategory === cf.value
                    ? 'border-[#C8102E] bg-[#C8102E] text-[#F5F1E8]'
                    : 'border-[#F5F1E8]/10 text-[#9AA3B5] hover:border-[#F5F1E8]/20 hover:text-[#F5F1E8]'
                }`}
              >
                {cf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Garment Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#C8102E] border-t-transparent" />
              <p className="text-sm text-[#9AA3B5]">Loading community wardrobe...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Shirt size={48} className="mb-4 text-[#9AA3B5] opacity-40" />
            <p className="text-xl font-bold text-[#F5F1E8]/70">No garments found</p>
            <p className="mt-2 text-sm text-[#9AA3B5] max-w-sm">
              {searchQuery || activeCategory !== 'ALL'
                ? 'Try a different search or category.'
                : 'Be the first to upload! Click "Upload Your Clothes" to share with the community.'}
            </p>
            {!searchQuery && activeCategory === 'ALL' && (
              <button
                onClick={() => setUploadOpen(true)}
                className="mt-6 bg-[#C8102E] px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-[#F5F1E8] hover:brightness-110"
              >
                Upload First Garment
              </button>
            )}
          </div>
        ) : (
          <motion.div layout className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence>
              {filtered.map((garment) => (
                <GarmentCard
                  key={garment.id}
                  garment={garment}
                  onTryOn={() => {
                    selectGarment(garment);
                    setArGarment(garment);
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <UploadPortal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadSuccess={loadGarments}
      />
    </div>
  );
}

// ── Garment Card ─────────────────────────────────────────────────────────────
function GarmentCard({ garment, onTryOn }: { garment: Garment; onTryOn: () => void }) {
  const [imgError, setImgError] = useState(false);
  const fileType  = (garment as any).fileType ?? '2D';
  const uploadedBy = (garment as any).uploadedBy ?? 'Community';
  const catColor  = CATEGORY_BADGE_COLORS[garment.category] ?? 'bg-white/10 text-white/60 border-white/20';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative flex flex-col overflow-hidden border border-[#F5F1E8]/10 bg-[#131B2E] transition-all duration-300 hover:border-[#D4A017]/40"
    >
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-black/30">
        {!imgError ? (
          <img
            src={garment.thumbnailUrl}
            alt={garment.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center opacity-30">
            <Shirt size={48} className="text-[#9AA3B5]" />
          </div>
        )}

        {/* Badges */}
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

        {/* AR badge */}
        <div className="absolute bottom-2 right-2">
          <span className="border border-[#D4A017]/30 bg-[#0B1220]/80 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#D4A017]">
            AR
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-bold text-[#F5F1E8] line-clamp-1">{garment.name}</h3>
          <p className="text-xs text-[#9AA3B5] mt-0.5">by {uploadedBy}</p>
          {garment.brand && <p className="text-xs text-[#D4A017] mt-0.5">{garment.brand}</p>}
        </div>

        <button
          onClick={onTryOn}
          className="mt-auto w-full border border-[#C8102E]/30 bg-[#C8102E]/10 py-2.5 text-xs font-bold uppercase tracking-wider text-[#C8102E] transition-all hover:bg-[#C8102E] hover:text-[#F5F1E8]"
        >
          Try On →
        </button>
      </div>
    </motion.div>
  );
}
