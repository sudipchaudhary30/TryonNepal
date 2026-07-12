import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, Check, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import CameraView from '@/components/ar/CameraView';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { getGarmentTypeFromCategory } from '@/lib/demoGarments';
import { useARStore } from '@/store/useARStore';
import { useBodyTracker } from '@/hooks/useBodyTracker';
import { useNepaliSizeRecommendation } from '@/hooks/useNepaliSizeRecommendation';
import type { Garment } from '@/types/garment';
import type { NepaliSize } from '@/hooks/useNepaliSizeRecommendation';

// ── Size badge colour map ────────────────────────────────────────────────────
const SIZE_COLORS: Record<NepaliSize, string> = {
  XS:      'text-[#9AA3B5] border-[#9AA3B5]/40 bg-[#9AA3B5]/10',
  S:       'text-[#7EC8E3] border-[#7EC8E3]/40 bg-[#7EC8E3]/10',
  M:       'text-[#D4A017] border-[#D4A017]/40 bg-[#D4A017]/15',
  L:       'text-[#C8102E] border-[#C8102E]/40 bg-[#C8102E]/10',
  XL:      'text-orange-400 border-orange-400/40 bg-orange-400/10',
  XXL:     'text-purple-400 border-purple-400/40 bg-purple-400/10',
  UNKNOWN: 'text-[#9AA3B5] border-[#9AA3B5]/20 bg-transparent',
};

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  TOP:        'bg-blue-500/20 text-blue-300 border-blue-500/30',
  BOTTOM:     'bg-purple-500/20 text-purple-300 border-purple-500/30',
  DRESS:      'bg-pink-500/20 text-pink-300 border-pink-500/30',
  OUTERWEAR:  'bg-orange-500/20 text-orange-300 border-orange-500/30',
  TRADITIONAL:'bg-amber-500/20 text-amber-300 border-amber-500/30',
  ACCESSORY:  'bg-teal-500/20 text-teal-300 border-teal-500/30',
};

interface ARFittingRoomProps {
  /** Garments to show in the rail */
  garments: Garment[];
  /** Currently active garment */
  selectedGarment: Garment | null;
  onSelectGarment: (g: Garment) => void;
  isLoading?: boolean;
  /** Slot rendered above the garment rail (page title, search bar, etc.) */
  headerSlot?: React.ReactNode;
  /** Slot rendered in the sidebar footer (upload / add buttons) */
  footerActions?: React.ReactNode;
  /** Label shown in "Select Garment" header */
  railLabel?: string;
}

export default function ARFittingRoom({
  garments,
  selectedGarment,
  onSelectGarment,
  isLoading = false,
  headerSlot,
  footerActions,
  railLabel = 'AR Fitting Room',
}: ARFittingRoomProps) {
  const { landmarks: storeLandmarks } = useARStore();
  const [showSkeleton, setShowSkeleton]       = useState(false);
  const [showGarmentSelector, setShowGarmentSelector] = useState(false);
  const [canvasSize, setCanvasSize]           = useState({ w: 640, h: 480 });

  const bodyMetrics = useBodyTracker(storeLandmarks ?? null, canvasSize.w, canvasSize.h);
  const sizeRec     = useNepaliSizeRecommendation(bodyMetrics);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-[#0B1220] text-[#F5F1E8]">
      {/* ── CAMERA (left / top) ─────────────────────────────────────────────── */}
      <div className="relative flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Mirror border glow */}
        <div className="pointer-events-none absolute inset-0 z-10 border border-white/5" />

        <ErrorBoundary>
          <CameraView
            garmentImageUrl={selectedGarment?.imageUrl ?? null}
            garmentModelUrl={selectedGarment?.modelUrl ?? null}
            garmentType={selectedGarment ? getGarmentTypeFromCategory(selectedGarment.category) : 'upper_body'}
            showSkeleton={showSkeleton}
            onCanvasSize={setCanvasSize}
          />
        </ErrorBoundary>

        {/* Bottom HUD */}
        <div className="absolute bottom-0 left-0 right-0 z-40 flex items-end justify-between p-4 pointer-events-none gap-2">
          <div className="pointer-events-auto">
            <button
              onClick={() => setShowSkeleton((v) => !v)}
              className={`flex items-center gap-2 border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                showSkeleton
                  ? 'border-[#D4A017]/60 bg-[#D4A017]/20 text-[#D4A017]'
                  : 'border-[#F5F1E8]/10 bg-[#0B1220]/60 text-[#9AA3B5] hover:border-[#F5F1E8]/30 hover:text-[#F5F1E8]'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${showSkeleton ? 'bg-[#D4A017] animate-pulse' : 'bg-[#9AA3B5]/40'}`} />
              <span className="hidden sm:inline">{showSkeleton ? 'Hide Tracker' : 'Show Tracker'}</span>
              <span className="sm:hidden">{showSkeleton ? 'Hide' : 'Show'}</span>
            </button>
          </div>
          <div className="pointer-events-auto">
            <button
              onClick={() => setShowGarmentSelector(!showGarmentSelector)}
              className="lg:hidden border border-[#F5F1E8]/15 bg-[#0B1220]/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#F5F1E8]/80 hover:border-[#D4A017]/60 hover:text-[#D4A017] transition-all whitespace-nowrap"
            >
              Select Garment
            </button>
          </div>
        </div>

        {/* Currently wearing strip */}
        {selectedGarment && (
          <motion.div
            key={selectedGarment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-4 top-4 z-40 flex items-center gap-3 border border-[#F5F1E8]/10 bg-[#131B2E]/90 px-4 py-2.5 text-sm"
          >
            {selectedGarment.thumbnailUrl && (
              <img src={selectedGarment.thumbnailUrl} alt="" className="h-9 w-9 object-cover border border-[#F5F1E8]/10" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-[#9AA3B5]">Wearing</p>
              <p className="text-sm font-bold text-[#F5F1E8] leading-tight truncate">{selectedGarment.name}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── SIDEBAR (right on desktop, bottom sheet on mobile) ──────────────── */}
      <aside className={`relative z-20 flex w-full lg:w-[280px] shrink-0 flex-col border-l border-[#F5F1E8]/10 bg-[#131B2E]/95 max-h-[65vh] lg:max-h-full transition-transform duration-300 ${
        showGarmentSelector ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'
      }`}>

        {/* Page header slot (title, search, etc.) */}
        {headerSlot && (
          <div className="border-b border-[#F5F1E8]/10 px-4 py-4">
            {headerSlot}
          </div>
        )}

        {/* Rail header */}
        <div className="border-b border-[#F5F1E8]/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#D4A017] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A017]">{railLabel}</span>
          </div>
          <p className="mt-0.5 text-[11px] text-[#9AA3B5]">
            {garments.length} piece{garments.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Size recommendation */}
        <SizePanel rec={sizeRec} hasLandmarks={!!storeLandmarks} />

        {/* Garment rail */}
        <div className="flex-1 overflow-y-auto py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {isLoading ? (
            <div className="space-y-3 px-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex animate-pulse gap-3 border border-[#F5F1E8]/10 bg-[#131B2E]/50 p-3">
                  <div className="h-14 w-14 shrink-0 border border-[#F5F1E8]/10 bg-[#F5F1E8]/10" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-3/4 bg-[#F5F1E8]/10" />
                    <div className="h-2 w-1/2 bg-[#F5F1E8]/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : garments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
              <Shirt size={36} className="text-[#9AA3B5] opacity-30" />
              <p className="text-sm text-[#9AA3B5]">No garments yet. Upload something to get started!</p>
            </div>
          ) : (
            <div className="space-y-1 px-3">
              {garments.map((garment) => (
                <GarmentRailCard
                  key={garment.id}
                  garment={garment}
                  isSelected={selectedGarment?.id === garment.id}
                  onSelect={() => onSelectGarment(garment)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer actions (upload, add buttons) */}
        {footerActions && (
          <div className="border-t border-[#F5F1E8]/10 p-4 space-y-2">
            {footerActions}
          </div>
        )}
      </aside>
    </div>
  );
}

// ── Size Recommendation Panel ───────────────────────────────────────────────
function SizePanel({
  rec,
  hasLandmarks,
}: {
  rec: ReturnType<typeof useNepaliSizeRecommendation>;
  hasLandmarks: boolean;
}) {
  const sizeColor = SIZE_COLORS[rec.size] ?? SIZE_COLORS.UNKNOWN;
  const confidencePct = Math.round(rec.confidence * 100);

  return (
    <div className="border-b border-[#F5F1E8]/10 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#C8102E]">
          Size Recommendation
        </span>
        <span className="text-[9px] uppercase tracking-wider text-[#9AA3B5]">
          Nepal · Age 18–28
        </span>
      </div>

      {!hasLandmarks ? (
        <p className="text-[11px] text-[#9AA3B5] leading-snug">
          Enable camera to get your size recommendation.
        </p>
      ) : rec.size === 'UNKNOWN' ? (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#9AA3B5] animate-pulse" />
          <p className="text-[11px] text-[#9AA3B5] leading-snug">{rec.fitNote}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className={`rounded border px-3 py-1 text-2xl font-black leading-none ${sizeColor}`}>
              {rec.size}
            </span>
            <div className="flex-1">
              <div className="flex justify-between text-[10px] text-[#9AA3B5] mb-1">
                <span>Confidence</span>
                <span>{confidencePct}%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-[#F5F1E8]/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#D4A017]"
                  initial={{ width: 0 }}
                  animate={{ width: `${confidencePct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded bg-[#0B1220]/60 px-2 py-1.5">
              <p className="text-[9px] uppercase tracking-wider text-[#9AA3B5]">Shoulder</p>
              <p className="text-xs font-bold text-[#F5F1E8]">{rec.shoulderCm} cm</p>
            </div>
            <div className="rounded bg-[#0B1220]/60 px-2 py-1.5">
              <p className="text-[9px] uppercase tracking-wider text-[#9AA3B5]">Chest ~</p>
              <p className="text-xs font-bold text-[#F5F1E8]">{rec.chestEstCm} cm</p>
            </div>
          </div>

          <div className={`flex items-center gap-1.5 rounded px-2 py-1.5 text-[10px] font-semibold ${
            rec.fitNote === 'True to size'
              ? 'bg-emerald-500/10 text-emerald-400'
              : rec.fitNote === 'At size boundary'
              ? 'bg-[#D4A017]/10 text-[#D4A017]'
              : 'bg-[#C8102E]/10 text-[#C8102E]'
          }`}>
            {rec.fitNote === 'True to size' ? (
              <Check size={10} />
            ) : rec.fitNote === 'Stand closer for accurate reading' ? (
              <ArrowLeftRight size={10} />
            ) : (
              <AlertTriangle size={10} />
            )}
            {rec.fitNote}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Garment Rail Card ───────────────────────────────────────────────────────
function GarmentRailCard({
  garment,
  isSelected,
  onSelect,
}: {
  garment: Garment;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const catColor = CATEGORY_BADGE_COLORS[garment.category] ?? 'bg-white/10 text-white/60 border-white/20';

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-all duration-200 ${
        isSelected
          ? 'border border-[#D4A017]/40 bg-[#D4A017]/10'
          : 'border border-transparent hover:border-[#F5F1E8]/10 hover:bg-[#F5F1E8]/5'
      }`}
    >
      {/* Thumbnail */}
      <div className={`relative h-14 w-14 shrink-0 overflow-hidden border ${
        isSelected ? 'border-[#D4A017]/40' : 'border-[#F5F1E8]/10'
      } bg-black/40`}>
        {garment.thumbnailUrl ? (
          <img src={garment.thumbnailUrl} alt={garment.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#D4A017]/20 to-[#C8102E]/20" />
        )}
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#D4A017]/20">
            <Check size={16} className="text-[#0B1220] font-bold" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold leading-tight ${isSelected ? 'text-[#D4A017]' : 'text-[#F5F1E8]'}`}>
          {garment.name}
        </p>
        <span className={`mt-1 inline-block rounded-full border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${catColor}`}>
          {garment.category}
        </span>
      </div>

      {/* Type badge */}
      <div className="shrink-0">
        <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
          (garment as any).fileType === '3D'
            ? 'border-purple-500/40 bg-purple-500/20 text-purple-300'
            : 'border-[#D4A017]/20 bg-[#D4A017]/10 text-[#D4A017]'
        }`}>
          {(garment as any).fileType === '3D' ? '3D' : 'AR'}
        </span>
      </div>
    </motion.button>
  );
}
