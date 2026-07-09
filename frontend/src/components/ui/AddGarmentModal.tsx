import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, UploadCloud } from 'lucide-react';
import { garmentApi } from '@/lib/api';
import type { GarmentCategory } from '@/types/garment';

interface AddGarmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: { label: string; value: GarmentCategory }[] = [
  { label: 'Top / Shirt',        value: 'TOP' as GarmentCategory },
  { label: 'Bottom / Pants',     value: 'BOTTOM' as GarmentCategory },
  { label: 'Full Dress',         value: 'DRESS' as GarmentCategory },
  { label: 'Outerwear / Jacket', value: 'OUTERWEAR' as GarmentCategory },
  { label: 'Traditional Wear',   value: 'TRADITIONAL' as GarmentCategory },
  { label: 'Accessory',          value: 'ACCESSORY' as GarmentCategory },
];

export default function AddGarmentModal({ isOpen, onClose, onSuccess }: AddGarmentModalProps) {
  const [name, setName]               = useState('');
  const [category, setCategory]       = useState<GarmentCategory>('TOP' as GarmentCategory);
  const [file, setFile]               = useState<File | null>(null);
  const [preview, setPreview]         = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState(false);
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !file) {
      setError('Please provide a name and select an image.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      // is_private = true — wardrobe uploads are personal and never appear in Community
      await garmentApi.upload(file, name.trim(), category, 'Personal', true);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setName(''); setCategory('TOP' as GarmentCategory);
        setFile(null); setPreview(null);
        setSuccess(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload garment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(11,18,32,0.88)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative w-full max-w-md border border-[#F5F1E8]/10 bg-[#0e0e14] shadow-2xl"
            style={{ fontFamily: "'Manrope', sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F5F1E8]/10 px-6 py-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4A017]">My Wardrobe</p>
                <h2 className="mt-0.5 font-display text-xl font-black text-white">Add Private Garment</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center border border-white/10 text-white/60 hover:border-white/20 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-6">
              {error && (
                <div className="border border-[#C8102E]/30 bg-[#C8102E]/10 px-4 py-3 text-sm text-[#F5B8C0]">
                  {error}
                </div>
              )}
              {success && (
                <div className="border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                  Garment added to your private wardrobe!
                </div>
              )}

              {/* Image upload */}
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/15 bg-white/2 p-6 cursor-pointer hover:border-[#D4A017]/50 transition-colors">
                {preview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={preview} alt="Preview" className="h-28 w-auto object-cover" />
                    <span className="text-[10px] text-[#D4A017]">Click to change</span>
                  </div>
                ) : (
                  <>
                    <svg className="h-8 w-8 text-[#9AA3B5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-sm text-white/60">Click or drag to upload image</span>
                    <span className="text-[10px] text-white/30">PNG, JPG, WEBP</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                  required
                />
              </label>

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                  Garment Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#D4A017]/50 focus:outline-none"
                  placeholder="e.g. My Blue Linen Shirt"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GarmentCategory)}
                  className="w-full border border-white/10 bg-[#0e0e14] px-4 py-3 text-sm text-white focus:border-[#D4A017]/50 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Private notice */}
              <p className="flex items-center gap-2 text-[10px] text-[#9AA3B5]">
                <Lock size={12} className="text-[#D4A017] shrink-0" />
                This garment will only be visible to you — not the Community.
              </p>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 border border-white/10 py-3 text-xs font-bold uppercase tracking-wider text-white/60 transition-colors hover:border-white/20 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || success}
                  className="flex-1 bg-[#C8102E] py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? 'Uploading...' : 'Save to Wardrobe'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
