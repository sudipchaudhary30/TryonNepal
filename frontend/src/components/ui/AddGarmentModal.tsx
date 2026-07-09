import { useState, useRef } from 'react';
import { garmentApi } from '@/lib/api';
import type { GarmentCategory } from '@/types/garment';

interface AddGarmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddGarmentModal({ isOpen, onClose, onSuccess }: AddGarmentModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GarmentCategory>('TOP');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !file) {
      setError('Please provide a name and select an image.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await garmentApi.upload(file, name.trim(), category);
      onSuccess();
      onClose();
      setName('');
      setCategory('TOP');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload garment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(11,18,32,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative w-full max-w-md border border-[#F5F1E8]/10 bg-[#131B2E] shadow-2xl"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-[#F5F1E8]/10 px-6 py-4">
          <div>
            <p className="font-mono-label text-[10px] uppercase tracking-[0.3em] text-[#D4A017]">
              My Wardrobe
            </p>
            <h2 className="font-display mt-0.5 text-xl font-semibold text-[#F5F1E8]">
              Add New Garment
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9AA3B5] transition-colors hover:text-[#F5F1E8]"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-6">
          {error && (
            <div className="border border-[#C8102E]/30 bg-[#C8102E]/10 px-4 py-3 text-sm text-[#F5B8C0]">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="mb-1.5 block font-mono-label text-[10px] uppercase tracking-[0.2em] text-[#9AA3B5]">
              Garment Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-[#F5F1E8]/10 bg-[#0B1220] px-4 py-3 text-sm text-[#F5F1E8] placeholder-[#9AA3B5]/40 outline-none transition focus:border-[#D4A017]"
              placeholder="e.g. Navy Oxford Shirt"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block font-mono-label text-[10px] uppercase tracking-[0.2em] text-[#9AA3B5]">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GarmentCategory)}
              className="w-full border border-[#F5F1E8]/10 bg-[#0B1220] px-4 py-3 text-sm text-[#F5F1E8] outline-none transition focus:border-[#D4A017]"
            >
              <option value="TOP">Top — Upper Body</option>
              <option value="BOTTOM">Bottom — Lower Body</option>
              <option value="DRESS">Dress — Full Body</option>
              <option value="TRADITIONAL">Traditional</option>
              <option value="OUTERWEAR">Outerwear</option>
            </select>
          </div>

          {/* File upload */}
          <div>
            <label className="mb-1.5 block font-mono-label text-[10px] uppercase tracking-[0.2em] text-[#9AA3B5]">
              Garment Image (PNG / JPG / WEBP)
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-[#F5F1E8]/15 bg-[#0B1220] px-4 py-6 text-center transition hover:border-[#D4A017]/50">
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="h-24 w-24 object-cover border border-[#F5F1E8]/10"
                  />
                  <span className="text-xs text-[#9AA3B5] max-w-[200px] truncate">{file.name}</span>
                  <span className="text-[10px] text-[#D4A017]">Click to change</span>
                </div>
              ) : (
                <>
                  <svg className="h-8 w-8 text-[#9AA3B5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-sm text-[#9AA3B5]">Click to select file</span>
                  <span className="text-[10px] text-[#9AA3B5]/50">PNG, JPG, WEBP supported</span>
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
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border border-[#F5F1E8]/10 py-3 text-xs font-bold uppercase tracking-wider text-[#9AA3B5] transition-colors hover:border-[#F5F1E8]/20 hover:text-[#F5F1E8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#C8102E] py-3 text-xs font-bold uppercase tracking-wider text-[#F5F1E8] transition-all hover:brightness-110 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading…
                </span>
              ) : (
                'Upload Garment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
