import { useState, useRef } from 'react';
import Button from './Button';
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
      // Reset form
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-card p-6 shadow-2xl">
        <h2 className="mb-4 text-2xl font-bold text-white font-display">Add New Garment</h2>
        
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-200 border border-red-500/30">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-white/70">Garment Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white placeholder-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="e.g. My Custom T-Shirt"
              required
            />
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-white/70">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GarmentCategory)}
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="TOP">Top (Upper Body)</option>
              <option value="BOTTOM">Bottom (Lower Body)</option>
              <option value="DRESS">Dress (Full Body)</option>
              <option value="TRADITIONAL">Traditional</option>
              <option value="OUTERWEAR">Outerwear</option>
            </select>
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-white/70">Garment Image (2D)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="w-full rounded-xl border border-white/10 bg-black/30 p-2 text-white/70 file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-bold file:text-black hover:file:bg-accent/90"
              required
            />
            {file && (
              <div className="mt-2 flex items-center gap-3">
                <img src={URL.createObjectURL(file)} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-white/10" />
                <span className="text-sm text-white/60 truncate">{file.name}</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 font-bold text-white/70 hover:bg-white/10 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <Button type="submit" loading={isSubmitting}>
              Upload Garment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
