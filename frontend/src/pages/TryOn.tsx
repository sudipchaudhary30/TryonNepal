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
import type { Garment } from '@/types/garment';

export default function TryOn() {
  const { garments, selectedGarment, selectGarment, fetchGarments, isLoading } = useWardrobeStore();
  const { tryOnResult, setTryOnResult } = useARStore();
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

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

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-black">
      {/* ── LEFT: AR Mirror ─────────────────────────────────────── */}
      <div className="relative flex-1 min-w-0">
        {/* Mirror frame glow */}
        <div className="pointer-events-none absolute inset-0 z-10 rounded-none shadow-[inset_0_0_80px_rgba(0,200,255,0.04)]" />

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
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 animate-ping rounded-full bg-accent/30" />
                  <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-accent border-t-transparent" />
                </div>
                <p className="font-display text-xl font-bold text-white">Generating Try-On…</p>
                <p className="text-sm text-white/50">AI is fitting the garment to your body</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom HUD Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-40 flex items-end justify-between p-4 pointer-events-none">
          <div className="pointer-events-auto flex flex-col gap-2">
            <button
              onClick={() => setShowSkeleton(v => !v)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-all ${
                showSkeleton
                  ? 'border-accent/60 bg-accent/20 text-accent'
                  : 'border-white/10 bg-black/40 text-white/60 hover:border-white/20 hover:text-white'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${showSkeleton ? 'bg-accent animate-pulse' : 'bg-white/40'}`} />
              {showSkeleton ? 'Hide Tracker' : 'Show Tracker'}
            </button>
          </div>

          <div className="pointer-events-auto">
            {/* Upload button */}
            <button
              onClick={() => setUploadOpen(true)}
              className="rounded-full border border-white/20 bg-black/50 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white/80 backdrop-blur-md hover:border-accent/60 hover:text-accent transition-all"
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
            className="absolute left-4 top-4 z-40 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/55 px-4 py-2.5 backdrop-blur-md"
          >
            {selectedGarment.thumbnailUrl && (
              <img
                src={selectedGarment.thumbnailUrl}
                alt=""
                className="h-9 w-9 rounded-lg object-cover border border-white/10"
              />
            )}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Wearing</p>
              <p className="text-sm font-bold text-white leading-tight">{selectedGarment.name}</p>
            </div>
            {selectedGarment.price && (
              <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent border border-accent/30">
                Rs. {selectedGarment.price}
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* ── RIGHT: Garment Rail ──────────────────────────────────── */}
      <aside className="relative z-10 flex w-[260px] shrink-0 flex-col border-l border-white/5 bg-black/80 backdrop-blur-xl">
        {/* Rail header */}
        <div className="border-b border-white/5 px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent">
              AR Fitting Room
            </span>
          </div>
          <h2 className="mt-1 font-display text-lg font-black text-white">Select Garment</h2>
          <p className="mt-0.5 text-[11px] text-white/40">
            {garments.length} piece{garments.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Garment list */}
        <div className="flex-1 overflow-y-auto py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {isLoading ? (
            <div className="space-y-3 px-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex animate-pulse gap-3 rounded-xl bg-white/5 p-3">
                  <div className="h-14 w-14 shrink-0 rounded-xl bg-white/10" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-3/4 rounded bg-white/10" />
                    <div className="h-2 w-1/2 rounded bg-white/5" />
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
        <div className="border-t border-white/5 p-4 space-y-2">
          <Button
            variant="primary"
            className="w-full text-sm"
            onClick={() => setUploadOpen(true)}
          >
            ↑ Upload New Garment
          </Button>
          <button
            onClick={() => void fetchGarments()}
            className="w-full rounded-xl border border-white/10 py-2 text-xs text-white/50 hover:border-white/20 hover:text-white/80 transition-all"
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
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
        isSelected
          ? 'border border-accent/40 bg-accent/10 shadow-md shadow-accent/5'
          : 'border border-transparent hover:border-white/10 hover:bg-white/5'
      }`}
    >
      {/* Thumbnail */}
      <div className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border ${
        isSelected ? 'border-accent/40' : 'border-white/10'
      } bg-black/40`}>
        {garment.thumbnailUrl ? (
          <img src={garment.thumbnailUrl} alt={garment.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-accent/20 to-purple-500/20" />
        )}
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-accent/20 rounded-xl">
            <span className="text-lg">✓</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold leading-tight ${isSelected ? 'text-accent' : 'text-white'}`}>
          {garment.name}
        </p>
        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/40">
          {garment.category}
        </p>
        {garment.price && (
          <p className="mt-1 text-xs font-bold text-accent/80">Rs. {garment.price}</p>
        )}
      </div>

      {/* AR badge */}
      <div className="shrink-0">
        <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent border border-accent/20">
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
        <Button variant="primary" onClick={onReset} className="px-8 shadow-xl shadow-accent/20">
          ← Try Another
        </Button>
        <div className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs text-white/60 backdrop-blur-md">
          Processed in {result.processingTimeMs}ms
        </div>
      </div>
    </div>
  );
}
