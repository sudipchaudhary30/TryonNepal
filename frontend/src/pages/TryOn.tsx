import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import ARFittingRoom from '@/components/ar/ARFittingRoom';
import Button from '@/components/ui/Button';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import CameraView from '@/components/ar/CameraView';
import UploadPortal from '@/components/ui/UploadPortal';
import { getGarmentTypeFromCategory, isDemoGarment } from '@/lib/demoGarments';
import { tryOnApi } from '@/lib/api';
import { useARStore } from '@/store/useARStore';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import type { Garment } from '@/types/garment';

export default function TryOn() {
  const { garments, selectedGarment, selectGarment, fetchGarments, isLoading } = useWardrobeStore();
  const { tryOnResult, setTryOnResult } = useARStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadOpen, setUploadOpen]     = useState(false);
  const [canvasSize, setCanvasSize]     = useState({ w: 640, h: 480 });

  useEffect(() => {
    if (garments.length === 0) void fetchGarments();
  }, [fetchGarments, garments.length]);

  // Auto-select demo garment on first load
  useEffect(() => {
    if (!selectedGarment && garments.length > 0) {
      const first = garments.find((g) => isDemoGarment(g.id)) ?? garments[0] ?? null;
      selectGarment(first);
    }
  }, [garments, selectGarment, selectedGarment]);

  const handleCapture = async (blob: Blob) => {
    if (!selectedGarment) return;
    try {
      setIsProcessing(true);
      const type   = getGarmentTypeFromCategory(selectedGarment.category);
      const result = await tryOnApi.run(blob, selectedGarment.id, type);
      setTryOnResult(result);
    } catch (error) {
      console.error('TryOn ML Error:', error);
      alert('Failed to process realistic try-on. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // When there's a ML try-on result, show that instead of the mirror
  if (tryOnResult) {
    return (
      <div className="relative h-[calc(100vh-64px)] w-full bg-[#0B1220]">
        <img src={tryOnResult.resultImageUrl} alt="Try-On Result" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          <Button variant="primary" onClick={() => setTryOnResult(null)} className="px-8 !bg-[#C8102E] !border-[#C8102E] !text-[#F5F1E8] hover:!bg-[#b00e28]">
            ← Try Another
          </Button>
          <div className="border border-[#F5F1E8]/10 bg-[#0B1220]/60 px-4 py-2 text-xs text-[#9AA3B5]">
            Processed in {tryOnResult.processingTimeMs}ms
          </div>
        </div>
      </div>
    );
  }

  const headerSlot = (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="h-1.5 w-1.5 rounded-full bg-[#D4A017] animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-widest text-[#D4A017]">AR Fitting Room</span>
      </div>
      <h1 className="font-display text-lg font-black text-[#F5F1E8] leading-tight">Try On</h1>
      <p className="mt-0.5 text-[10px] text-[#9AA3B5]">Select a garment and start the live mirror</p>
    </div>
  );

  const footerActions = (
    <>
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
    </>
  );

  return (
    <>
      {/* Processing overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0B1220]/80"
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

      <ARFittingRoom
        garments={garments}
        selectedGarment={selectedGarment}
        onSelectGarment={selectGarment}
        isLoading={isLoading}
        headerSlot={headerSlot}
        footerActions={footerActions}
        railLabel="AR Fitting Room"
      />

      <UploadPortal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadSuccess={() => void fetchGarments()}
      />
    </>
  );
}
