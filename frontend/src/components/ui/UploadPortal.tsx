import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { garmentApi } from '@/lib/api';
import type { GarmentCategory } from '@/types/garment';

interface UploadPortalProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const CATEGORIES: { label: string; value: GarmentCategory }[] = [
  { label: 'Top / Shirt', value: 'TOP' as GarmentCategory },
  { label: 'Bottom / Pants', value: 'BOTTOM' as GarmentCategory },
  { label: 'Full Dress', value: 'DRESS' as GarmentCategory },
  { label: 'Outerwear / Jacket', value: 'OUTERWEAR' as GarmentCategory },
  { label: 'Traditional Wear', value: 'TRADITIONAL' as GarmentCategory },
  { label: 'Accessory', value: 'ACCESSORY' as GarmentCategory },
];

type UploadTab = '2D' | '3D';

export default function UploadPortal({ open, onClose, onUploadSuccess }: UploadPortalProps) {
  const [tab, setTab] = useState<UploadTab>('2D');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GarmentCategory>('TOP' as GarmentCategory);
  const [uploadedBy, setUploadedBy] = useState('');

  // 2D state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 3D state
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const imageDrop = useRef<HTMLDivElement>(null);
  const modelDrop = useRef<HTMLDivElement>(null);
  const thumbDrop = useRef<HTMLDivElement>(null);

  const handleImageDrop = useCallback((e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    const file = 'dataTransfer' in e ? e.dataTransfer.files[0] : (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const handleThumbDrop = useCallback((e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    const file = 'dataTransfer' in e ? e.dataTransfer.files[0] : (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }, []);

  const handleModelDrop = useCallback((e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    const file = 'dataTransfer' in e ? e.dataTransfer.files[0] : (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    setModelFile(file);
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) return setError('Please enter a garment name.');

    if (tab === '2D') {
      if (!imageFile) return setError('Please select a clothing image.');
    } else {
      if (!modelFile) return setError('Please select a .glb model file.');
      if (!thumbnailFile) return setError('Please select a thumbnail image.');
    }

    try {
      setUploading(true);
      if (tab === '2D') {
        await garmentApi.upload(imageFile!, name, category, uploadedBy || 'Anonymous');
      } else {
        await garmentApi.upload3D(modelFile!, thumbnailFile!, name, category, uploadedBy || 'Anonymous');
      }
      setSuccess(true);
      setTimeout(() => {
        onUploadSuccess();
        handleReset();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Upload failed. Make sure the backend is running.');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setName(''); setCategory('TOP' as GarmentCategory); setUploadedBy('');
    setImageFile(null); setImagePreview(null);
    setModelFile(null); setThumbnailFile(null); setThumbnailPreview(null);
    setError(null); setSuccess(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#0e0e14] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-accent">Community Upload</p>
                <h2 className="mt-0.5 font-display text-2xl font-black text-white">Add Your Clothing</h2>
              </div>
              <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 hover:border-white/20 hover:text-white transition-colors">
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-5 flex gap-1 rounded-full border border-white/10 bg-black/30 p-1">
              {(['2D', '3D'] as UploadTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-full py-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
                    tab === t ? 'bg-accent text-black shadow-lg shadow-accent/20' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {t === '2D' ? '📷 2D Image' : '🧊 3D Model (.glb)'}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {/* 2D Upload */}
              {tab === '2D' && (
                <label
                  ref={imageDrop as React.RefObject<HTMLLabelElement>}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleImageDrop}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-white/2 p-6 cursor-pointer hover:border-accent/50 transition-colors"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="h-32 w-auto rounded-xl object-cover" />
                  ) : (
                    <>
                      <span className="text-3xl">🎽</span>
                      <span className="text-sm font-medium text-white/60">Drag & drop or click to upload</span>
                      <span className="text-xs text-white/30">PNG, JPG, WEBP supported</span>
                    </>
                  )}
                  <input type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={handleImageDrop} />
                </label>
              )}

              {/* 3D Upload */}
              {tab === '3D' && (
                <div className="space-y-3">
                  <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleModelDrop}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-white/2 p-5 cursor-pointer hover:border-accent/50 transition-colors"
                  >
                    <span className="text-3xl">🧊</span>
                    <span className="text-sm font-medium text-white/70">{modelFile ? `✅ ${modelFile.name}` : 'Drop .glb model file here'}</span>
                    <input type="file" accept=".glb,.gltf" className="hidden" onChange={handleModelDrop} />
                  </label>
                  <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleThumbDrop}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 bg-white/2 p-5 cursor-pointer hover:border-accent/50 transition-colors"
                  >
                    {thumbnailPreview ? (
                      <img src={thumbnailPreview} alt="thumb" className="h-20 w-auto rounded-lg object-cover" />
                    ) : (
                      <>
                        <span className="text-2xl">🖼️</span>
                        <span className="text-sm text-white/50">Drop preview thumbnail image</span>
                      </>
                    )}
                    <input type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={handleThumbDrop} />
                  </label>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/50">Garment Name *</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Blue Linen Shirt"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-accent/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/50">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GarmentCategory)}
                    className="w-full rounded-xl border border-white/10 bg-[#0e0e14] px-3 py-2.5 text-sm text-white focus:border-accent/50 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/50">Your Name</label>
                  <input
                    value={uploadedBy}
                    onChange={(e) => setUploadedBy(e.target.value)}
                    placeholder="Anonymous"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-accent/50 focus:outline-none"
                  />
                </div>
              </div>

              {error && <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-400">{error}</p>}
              {success && <p className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">✅ Upload successful! Adding to community...</p>}

              <button
                onClick={handleSubmit}
                disabled={uploading || success}
                className="w-full rounded-xl bg-accent py-3 text-sm font-black uppercase tracking-widest text-black shadow-lg shadow-accent/20 transition-all hover:brightness-110 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : `Share ${tab} Garment with Community`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
