import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { garmentApi } from '@/lib/api';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import type { Garment, GarmentCategory } from '@/types/garment';
import UploadPortal from '@/components/ui/UploadPortal';

const CATEGORY_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Tops', value: 'TOP' },
  { label: 'Bottoms', value: 'BOTTOM' },
  { label: 'Dresses', value: 'DRESS' },
  { label: 'Outerwear', value: 'OUTERWEAR' },
  { label: 'Traditional', value: 'TRADITIONAL' },
  { label: 'Accessories', value: 'ACCESSORY' },
];

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  TOP: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  BOTTOM: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  DRESS: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  OUTERWEAR: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  TRADITIONAL: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  ACCESSORY: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
};

export default function Community() {
  const navigate = useNavigate();
  const { selectGarment } = useWardrobeStore();

  const [garments, setGarments] = useState<Garment[]>([]);
  const [filtered, setFiltered] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);

  const loadGarments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await garmentApi.getAll();
      setGarments(data);
    } catch (err) {
      console.error('Failed to load community garments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadGarments(); }, [loadGarments]);

  // Filter locally
  useEffect(() => {
    let result = garments;
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
  }, [garments, activeCategory, searchQuery]);

  const handleTryOn = (garment: Garment) => {
    selectGarment(garment);
    navigate('/tryon');
  };

  return (
    <div className="relative min-h-screen">
      {/* Background glows */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-accent/8 blur-[120px]" />
        <div className="absolute top-1/2 right-0 h-80 w-80 rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-accent">Community Wardrobe</span>
            </div>
            <h1 className="font-display text-4xl font-black text-white sm:text-5xl">
              Try Community Clothes
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/50">
              Browse clothing uploaded by the community. Select any piece and try it on instantly in the AR mirror.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                {garments.length} garments uploaded
              </span>
              <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs text-accent">
                {garments.filter((g) => (g as any).fileType === '3D').length} 3D models
              </span>
            </div>
          </div>
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 bg-accent px-6 py-3 text-sm font-black uppercase tracking-wider text-black transition-all hover:brightness-110 hover:scale-[1.01]"
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
            className="min-w-[240px] flex-1 border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent/50 focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((cf) => (
              <button
                key={cf.value}
                onClick={() => setActiveCategory(cf.value)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all ${
                  activeCategory === cf.value
                    ? 'border-accent bg-accent text-black'
                    : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white'
                }`}
              >
                {cf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Garment Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
              <p className="text-sm text-white/50">Loading community wardrobe...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <span className="text-6xl mb-4">👕</span>
            <p className="text-xl font-bold text-white/70">No garments yet</p>
            <p className="mt-2 text-sm text-white/40 max-w-sm">
              Be the first to upload! Click "Upload Your Clothes" to add the first piece to the community wardrobe.
            </p>
            <button
              onClick={() => setUploadOpen(true)}
              className="mt-6 bg-accent px-6 py-2.5 text-sm font-black uppercase tracking-wider text-black hover:brightness-110"
            >
              Upload First Garment
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            <AnimatePresence>
              {filtered.map((garment) => (
                <GarmentCard key={garment.id} garment={garment} onTryOn={handleTryOn} />
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

function GarmentCard({ garment, onTryOn }: { garment: Garment; onTryOn: (g: Garment) => void }) {
  const [imgError, setImgError] = useState(false);
  const fileType = (garment as any).fileType ?? '2D';
  const uploadedBy = (garment as any).uploadedBy ?? 'Community';
  const catColor = CATEGORY_BADGE_COLORS[garment.category] ?? 'bg-white/10 text-white/60 border-white/20';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative flex flex-col overflow-hidden border border-white/10 bg-[#111111] transition-all duration-300 hover:border-accent/40"
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
          <div className="flex h-full w-full items-center justify-center text-5xl">👕</div>
        )}

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
          <h3 className="font-bold text-white line-clamp-1">{garment.name}</h3>
          <p className="text-xs text-white/40 mt-0.5">by {uploadedBy}</p>
          {garment.brand && <p className="text-xs text-accent/80 mt-0.5">{garment.brand}</p>}
        </div>
        {garment.price && (
          <p className="text-sm font-extrabold text-accent">Rs. {garment.price}</p>
        )}
        <button
          onClick={() => onTryOn(garment)}
          className="mt-auto w-full border border-accent/30 bg-accent/10 py-2.5 text-xs font-black uppercase tracking-wider text-accent transition-all hover:bg-accent hover:text-black"
        >
          Try On →
        </button>
      </div>
    </motion.div>
  );
}
