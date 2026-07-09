import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Box, Image, Shirt, UploadCloud, X, CheckCircle2, AlertCircle } from 'lucide-react';
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
        await garmentApi.upload(imageFile!, name, category, uploadedBy || 'Anonymous', false);
      } else {
        await garmentApi.upload3D(modelFile!, thumbnailFile!, name, category, uploadedBy || 'Anonymous', false);
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B1220]/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative w-full max-w-xl border border-[#F5F1E8]/10 bg-[#131B2E] p-6 shadow-2xl"
            style={{ fontFamily: "'Manrope', sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#D4A017]">Community Upload</p>
                <h2 className="mt-0.5 font-display text-2xl font-black text-[#F5F1E8]">Add Your Clothing</h2>
              </div>
              <button 
                onClick={onClose} 
                className="flex h-9 w-9 items-center justify-center border border-[#F5F1E8]/10 text-[#9AA3B5] hover:border-[#F5F1E8]/20 hover:text-[#F5F1E8] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-5 flex gap-1 border border-[#F5F1E8]/10 bg-[#0B1220] p-1">
              {(['2D', '3D'] as UploadTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${
                    tab === t 
                      ? 'bg-[#C8102E] text-[#F5F1E8] shadow-md' 
                      : 'text-[#9AA3B5] hover:text-[#F5F1E8]'
                  }`}
                >
                  {t === '2D' ? (
                    <>
                      <Camera size={14} />
                      <span>2D Image</span>
                    </>
                  ) : (
                    <>
                      <Box size={14} />
                      <span>3D Model (.glb)</span>
                    </>
                  )}
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
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#F5F1E8]/15 bg-[#0B1220]/50 p-6 cursor-pointer hover:border-[#D4A017]/50 transition-colors"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="h-32 w-auto rounded-xl object-cover border border-[#F5F1E8]/10" />
                  ) : (
                    <>
                      <Shirt size={28} className="text-[#9AA3B5]" />
                      <span className="text-sm font-medium text-[#F5F1E8]/75">Drag & drop or click to upload</span>
                      <span className="text-xs text-[#9AA3B5]/50">PNG, JPG, WEBP supported</span>
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
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#F5F1E8]/15 bg-[#0B1220]/50 p-5 cursor-pointer hover:border-[#D4A017]/50 transition-colors"
                  >
                    <Box size={24} className="text-[#D4A017]" />
                    <span className="text-sm font-medium text-[#F5F1E8]/90">{modelFile ? `${modelFile.name}` : 'Drop .glb model file here'}</span>
                    <input type="file" accept=".glb,.gltf" className="hidden" onChange={handleModelDrop} />
                  </label>
                  <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleThumbDrop}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#F5F1E8]/10 bg-[#0B1220]/50 p-5 cursor-pointer hover:border-[#D4A017]/50 transition-colors"
                  >
                    {thumbnailPreview ? (
                      <img src={thumbnailPreview} alt="thumb" className="h-20 w-auto rounded-lg object-cover border border-[#F5F1E8]/10" />
                    ) : (
                      <>
                        <Image size={20} className="text-[#9AA3B5]" />
                        <span className="text-sm text-[#9AA3B5]/75">Drop preview thumbnail image</span>
                      </>
                    )}
                    <input type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={handleThumbDrop} />
                  </label>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#9AA3B5]/70">Garment Name *</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Blue Linen Shirt"
                    className="w-full border border-[#F5F1E8]/10 bg-[#0B1220] px-4 py-2.5 text-sm text-[#F5F1E8] placeholder-[#9AA3B5]/40 outline-none transition focus:border-[#D4A017]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#9AA3B5]/70">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GarmentCategory)}
                    className="w-full border border-[#F5F1E8]/10 bg-[#0B1220] px-3 py-2.5 text-sm text-[#F5F1E8] outline-none transition focus:border-[#D4A017]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#9AA3B5]/70">Your Name</label>
                  <input
                    value={uploadedBy}
                    onChange={(e) => setUploadedBy(e.target.value)}
                    placeholder="Anonymous"
                    className="w-full border border-[#F5F1E8]/10 bg-[#0B1220] px-4 py-2.5 text-sm text-[#F5F1E8] placeholder-[#9AA3B5]/40 outline-none transition focus:border-[#D4A017]"
                  />
                </div>
              </div>

              {error && (
                <p className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-400">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </p>
              )}
              {success && (
                <p className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">
                  <CheckCircle2 size={16} />
                  <span>Upload successful! Sharing with the community...</span>
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={uploading || success}
                className="w-full bg-[#C8102E] py-3 text-sm font-bold uppercase tracking-widest text-[#F5F1E8] transition-all hover:bg-[#b00e28] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <UploadCloud size={16} />
                <span>{uploading ? 'Uploading...' : `Share ${tab} Garment with Community`}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
