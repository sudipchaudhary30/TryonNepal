import { useEffect, useMemo, useRef, useState } from 'react';

import Button from '@/components/ui/Button';
import { GarmentCategory, type Garment } from '@/types/garment';

interface ClothingSelectorProps {
  garments: readonly Garment[];
  selectedGarment: Garment | null;
  onSelect: (garment: Garment) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function ClothingSelector({ garments, selectedGarment, onSelect, onRefresh, isLoading = false }: ClothingSelectorProps) {
  const preloadedSourcesRef = useRef(new Set<string>());
  const [activeCategory, setActiveCategory] = useState<GarmentCategory | 'ALL'>('ALL');

  const categories = useMemo(() => {
    const available = Array.from(new Set(garments.map((garment) => garment.category)));
    return ['ALL', ...available];
  }, [garments]);

  const visibleGarments = useMemo(() => {
    if (activeCategory === 'ALL') {
      return garments;
    }
    return garments.filter((garment) => garment.category === activeCategory);
  }, [activeCategory, garments]);

  useEffect(() => {
    visibleGarments.forEach((garment) => {
      if (preloadedSourcesRef.current.has(garment.imageUrl)) {
        return;
      }

      const image = new Image();
      image.src = garment.imageUrl;
      preloadedSourcesRef.current.add(garment.imageUrl);
    });
  }, [visibleGarments]);

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-4 shadow-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Clothing Selector</h2>
          <p className="text-sm text-white/60">Browse shirts, jackets, kurta, and traditional wear sized for quick mobile selection.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onRefresh} loading={isLoading}>
          Refresh
        </Button>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => {
          const selected = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category as GarmentCategory | 'ALL')}
              className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${selected ? 'border-accent bg-accent/15 text-accent' : 'border-white/10 bg-black/20 text-white/60 hover:border-white/20 hover:text-white'}`}
            >
              {category === 'ALL' ? 'All' : category.toLowerCase()}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {visibleGarments.map((garment) => {
          const selected = selectedGarment?.id === garment.id;
          return (
            <button
              key={garment.id}
              type="button"
              onClick={() => onSelect(garment)}
              className={`overflow-hidden rounded-2xl border p-2 text-left transition-colors ${selected ? 'border-accent bg-accent/10' : 'border-white/10 bg-black/20 hover:border-white/20'}`}
            >
              <div className="aspect-[4/5] overflow-hidden rounded-xl bg-white/5">
                <img src={garment.thumbnailUrl} alt={garment.name} className="h-full w-full object-cover" />
              </div>
              <p className="mt-2 truncate text-sm font-semibold text-white">{garment.name}</p>
              <p className="truncate text-xs text-white/60">{garment.brand ?? 'DressMesh Nepal'}</p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">{garment.category}</p>
            </button>
          );
        })}
      </div>

      {visibleGarments.length === 0 ? <p className="mt-4 text-sm text-white/50">No garments match this filter.</p> : null}
    </section>
  );
}