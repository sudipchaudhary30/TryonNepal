import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import CameraView from '@/components/ar/CameraView';
import Button from '@/components/ui/Button';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import UploadPortal from '@/components/ui/UploadPortal';
import { getGarmentTypeFromCategory, isDemoGarment } from '@/lib/demoGarments';
import { tryOnApi } from '@/lib/api';
import { useARStore } from '@/store/useARStore';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import { useBodyTracker } from '@/hooks/useBodyTracker';
import { useNepaliSizeRecommendation } from '@/hooks/useNepaliSizeRecommendation';
import type { Garment } from '@/types/garment';
import type { NepaliSize } from '@/hooks/useNepaliSizeRecommendation';

// ── Size badge colour map ───────────────────────────────────────────────────
const SIZE_COLORS: Record<NepaliSize, string> = {
  XS:      'text-[#9AA3B5] border-[#9AA3B5]/40 bg-[#9AA3B5]/10',
  S:       'text-[#7EC8E3] border-[#7EC8E3]/40 bg-[#7EC8E3]/10',
  M:       'text-[#D4A017] border-[#D4A017]/40 bg-[#D4A017]/15',
  L:       'text-[#C8102E] border-[#C8102E]/40 bg-[#C8102E]/10',
  XL:      'text-orange-400 border-orange-400/40 bg-orange-400/10',
  XXL:     'text-purple-400 border-purple-400/40 bg-purple-400/10',
  UNKNOWN: 'text-[#9AA3B5] border-[#9AA3B5]/20 bg-transparent',
};

export default function TryOn() {
  const { garments, selectedGarment, selectGarment, fetchGarments, isLoading } = useWardrobeStore();
  const { tryOnResult, setTryOnResult, landmarks: storeLandmarks } = useARStore();
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Canvas size tracked here so the body tracker can convert to real measurements
  const [canvasSize, setCanvasSize] = useState({ w: 640, h: 480 });

  useEffect(() => {
    if (!selectedGarment && garments.length > 0) selectGarment(garments[0] ?? null);
  }, [garments, selectGarment, selectedGarment]);

  useEffect(() => {
    const first = garments.find((g) => isDemoGarment(g.id));
    if (first && (!selectedGarment || !isDemoGarment(selectedGarment.id))) selectGarment(first);
  }, [garments, selectGarment, selectedGarment]);

  useEffect(() => {
    if (garments.length === 0) void fetchGarments();
  }, [fetchGarments, garments.length]);

  const handleCapture = async (blob: Blob) => {
    if (!selectedGarment) return;
    try {
      setIsProcessing(true);
      const type = getGarmentTypeFromCategory(selectedGarment.category);
      const result = await tryOnApi.run(blob, selectedGarment.id, type);
      setTryOnResult(result);
    } catch (error) {
      console.error('TryOn ML Error:', error);
      alert('Failed to process realistic try-on. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Body metrics from global landmark store ────────────────────────────────
  const bodyMetrics = useBodyTracker(storeLandmarks ?? null, canvasSize.w, canvasSize.h);
  const sizeRec     = useNepaliSizeRecommendation(bodyMetrics);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#0B1220] text-[#F5F1E8]">
      {/* ── LEFT: AR Mirror ─────────────────────────────────────── */}
      <div className="relative flex-1 min-w-0">
        {/* Mirror frame glow */}
        <div className="pointer-events-none absolute inset-0 z-10 border border-white/5" />

        <ErrorBoundary>
          {tryOnResult ? (
            <TryOnResult
              result={tryOnResult}
              onReset={() => setTryOnResult(null)}
            />
          ) : (
            <CameraView
              garmentImageUrl={selectedGarment?.imageUrl ?? null}
              garmentModelUrl={selectedGarment?.modelUrl ?? null}
              garmentType={selectedGarment ? getGarmentTypeFromCategory(selectedGarment.category) : 'upper_body'}
              onCapture={handleCapture}
              showSkeleton={showSkeleton}
              onCanvasSize={setCanvasSize}
            />
          )}
        </ErrorBoundary>

        {/* Processing overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-[#0B1220]/80"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 animate-ping rounded-full bg-[#C8102E]/30" />
                  <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-[#C8102E] border-t-transparent" />
                </div>
                <p className="font-display text-xl font-bold text-[#F5F1E8]">Generating Try-On…</p>
                <p className="text-sm text-[#9AA3B5]">AI is fitting the garment to your body</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom HUD Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-40 flex items-end justify-between p-4 pointer-events-none">
          <div className="pointer-events-auto flex flex-col gap-2">
            <button
              onClick={() => setShowSkeleton(v => !v)}
              className={`flex items-center gap-2 border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                showSkeleton
                  ? 'border-[#D4A017]/60 bg-[#D4A017]/20 text-[#D4A017]'
                  : 'border-[#F5F1E8]/10 bg-[#0B1220]/60 text-[#9AA3B5] hover:border-[#F5F1E8]/30 hover:text-[#F5F1E8]'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${showSkeleton ? 'bg-[#D4A017] animate-pulse' : 'bg-[#9AA3B5]/40'}`} />
              {showSkeleton ? 'Hide Tracker' : 'Show Tracker'}
            </button>
          </div>

          <div className="pointer-events-auto">
            <button
              onClick={() => setUploadOpen(true)}
              className="border border-[#F5F1E8]/15 bg-[#0B1220]/50 px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#F5F1E8]/80 hover:border-[#C8102E]/60 hover:text-[#C8102E] transition-all"
            >
              ↑ Upload Garment
            </button>
          </div>
        </div>

        {/* Currently wearing strip */}
        {selectedGarment && (
          <motion.div
            key={selectedGarment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-4 top-4 z-40 flex items-center gap-3 border border-[#F5F1E8]/10 bg-[#131B2E]/90 px-4 py-2.5"
          >
            {selectedGarment.thumbnailUrl && (
              <img
                src={selectedGarment.thumbnailUrl}
                alt=""
                className="h-9 w-9 object-cover border border-[#F5F1E8]/10"
              />
            )}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#9AA3B5]">Wearing</p>
              <p className="text-sm font-bold text-[#F5F1E8] leading-tight">{selectedGarment.name}</p>
            </div>
            {selectedGarment.price && (
              <span className="ml-2 bg-[#D4A017]/15 px-2 py-0.5 text-xs font-bold text-[#D4A017] border border-[#D4A017]/30">
                Rs. {selectedGarment.price}
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* ── RIGHT: Garment Rail ──────────────────────────────────── */}
      <aside className="relative z-10 flex w-[260px] shrink-0 flex-col border-l border-[#F5F1E8]/10 bg-[#131B2E]/90">
        {/* Rail header */}
        <div className="border-b border-[#F5F1E8]/10 px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#D4A017] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A017]">
              AR Fitting Room
            </span>
          </div>
          <h2 className="mt-1 font-display text-lg font-black text-[#F5F1E8]">Select Garment</h2>
          <p className="mt-0.5 text-[11px] text-[#9AA3B5]">
            {garments.length} piece{garments.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* ── SIZE RECOMMENDATION PANEL ──────────────────────────── */}
        <SizePanel rec={sizeRec} hasLandmarks={!!storeLandmarks} />

        {/* Garment list */}
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
          ) : (
            <div className="space-y-1 px-3">
              {garments.map((garment) => (
                <GarmentRailCard
                  key={garment.id}
                  garment={garment}
                  isSelected={selectedGarment?.id === garment.id}
                  onSelect={() => selectGarment(garment)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Rail footer actions */}
        <div className="border-t border-[#F5F1E8]/10 p-4 space-y-2">
          <Button
            variant="primary"
            className="w-full text-sm !bg-[#C8102E] !border-[#C8102E] !text-[#F5F1E8] hover:!bg-[#b00e28]"
            onClick={() => setUploadOpen(true)}
          >
            ↑ Upload New Garment
          </Button>
          <button
            onClick={() => void fetchGarments()}
            className="w-full border border-[#F5F1E8]/10 py-2 text-xs text-[#9AA3B5] hover:border-[#F5F1E8]/30 hover:text-[#F5F1E8] transition-all"
          >
            ↺ Refresh
          </button>
        </div>
      </aside>

      <UploadPortal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadSuccess={() => void fetchGarments()}
      />
    </div>
  );
}

// ── Size Recommendation Panel ──────────────────────────────────────────────────
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
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#C8102E]">
          Size Recommendation
        </span>
        <span className="text-[9px] uppercase tracking-wider text-[#9AA3B5]">
          Nepal · Age 18–28
        </span>
      </div>

      {!hasLandmarks ? (
        // Camera not started yet
        <p className="text-[11px] text-[#9AA3B5] leading-snug">
          Enable camera to get your size recommendation.
        </p>
      ) : rec.size === 'UNKNOWN' ? (
        // Camera on but no valid reading
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#9AA3B5] animate-pulse" />
          <p className="text-[11px] text-[#9AA3B5] leading-snug">{rec.fitNote}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Size badge + confidence */}
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

          {/* Measurements */}
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

          {/* Fit note */}
          <div className={`flex items-center gap-1.5 rounded px-2 py-1.5 text-[10px] font-semibold ${
            rec.fitNote === 'True to size'
              ? 'bg-emerald-500/10 text-emerald-400'
              : rec.fitNote === 'At size boundary'
              ? 'bg-[#D4A017]/10 text-[#D4A017]'
              : 'bg-[#C8102E]/10 text-[#C8102E]'
          }`}>
            <span>{
              rec.fitNote === 'True to size' ? '✓' :
              rec.fitNote === 'Stand closer for accurate reading' ? '↔' : '!'
            }</span>
            {rec.fitNote}
          </div>

          {!rec.isReliable && (
            <p className="text-[10px] text-[#9AA3B5] leading-tight">
              Stand ~60–80 cm from camera for best accuracy.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Garment Rail Card ──────────────────────────────────────────────────────
function GarmentRailCard({
  garment,
  isSelected,
  onSelect,
}: {
  garment: Garment;
  isSelected: boolean;
  onSelect: () => void;
}) {
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
            <span className="text-lg">✓</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold leading-tight ${isSelected ? 'text-[#D4A017]' : 'text-[#F5F1E8]'}`}>
          {garment.name}
        </p>
        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[#9AA3B5]">
          {garment.category}
        </p>
        {garment.price && (
          <p className="mt-1 text-xs font-bold text-[#D4A017]">Rs. {garment.price}</p>
        )}
      </div>

      {/* AR badge */}
      <div className="shrink-0">
        <span className="bg-[#D4A017]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#D4A017] border border-[#D4A017]/20">
          AR
        </span>
      </div>
    </motion.button>
  );
}

// ── Try-On Result View ────────────────────────────────────────────────────
function TryOnResult({
  result,
  onReset,
}: {
  result: { resultImageUrl: string; processingTimeMs: number };
  onReset: () => void;
}) {
  return (
    <div className="relative h-full w-full">
      <img src={result.resultImageUrl} alt="Try-On Result" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
        <Button variant="primary" onClick={onReset} className="px-8 !bg-[#C8102E] !border-[#C8102E] !text-[#F5F1E8] hover:!bg-[#b00e28]">
          ← Try Another
        </Button>
        <div className="border border-[#F5F1E8]/10 bg-[#0B1220]/60 px-4 py-2 text-xs text-[#9AA3B5]">
          Processed in {result.processingTimeMs}ms
        </div>
      </div>
    </div>
  );
}
