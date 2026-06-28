import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { garmentApi } from '@/lib/api';
import type { Garment } from '@/types/garment';

export default function Home() {
  const [featuredGarments, setFeaturedGarments] = useState<Garment[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      const garments = await garmentApi.getAll();
      if (!cancelled) {
        setFeaturedGarments(garments.slice(0, 4));
      }
    };

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-accent/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-accent-warm/5 blur-[150px]" />

      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col justify-center gap-16 px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative z-10 max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
            </span>
            Interactive Live Try-On
          </div>
          <h1 className="font-display text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl">
            Fitting room, <br/>
            <span className="bg-gradient-to-r from-accent via-white to-white bg-clip-text text-transparent">reimagined.</span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
            Experience AR Tryon Nepal. Try on authentic Nepalese traditional garments and modern wardrobe essentials in real-time, right from your browser. Privacy-preserving, on-device pose tracking ensures your camera stream never leaves your device.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/tryon" className="group relative rounded-full bg-accent px-8 py-4 font-bold text-black shadow-lg shadow-accent/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-accent/35">
              Launch Try On Room
            </Link>
            <Link to="/wardrobe" className="rounded-full border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white transition-all duration-200 hover:border-white/20 hover:bg-white/10">
              Explore Wardrobe
            </Link>
          </div>
        </div>

        <section className="relative z-10 grid gap-6 md:grid-cols-[1fr_1.3fr] lg:gap-8">
          <div className="flex flex-col justify-between rounded-3xl border border-white/5 bg-card/45 p-8 backdrop-blur-md shadow-2xl">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-accent/70">Nepal Heritage Catalogue</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-white leading-snug">Authentic Craftsmanship Meets AR</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/50">
                Discover the beauty of traditional designs like the Himalayan Kurta, Dhaka print dresses, and the iconic Daura Suruwal. Crafted using high-fidelity digital assets mapped dynamically to your body coordinates.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-6 border-t border-white/5 pt-6 text-xs text-white/40">
              <div>
                <span className="block font-display text-xl font-bold text-white">0%</span>
                Data Shared
              </div>
              <div className="h-8 w-px bg-white/5" />
              <div>
                <span className="block font-display text-xl font-bold text-accent">60 FPS</span>
                On-device Tracking
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {featuredGarments.map((garment) => (
              <article key={garment.id} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-card/25 p-3 transition-all duration-300 hover:border-white/10 hover:bg-card/45 hover:shadow-xl">
                <div className="aspect-[4/5] overflow-hidden rounded-xl bg-black/20 relative">
                  <img src={garment.thumbnailUrl} alt={garment.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                </div>
                <div className="pt-3">
                  <p className="truncate text-sm font-bold text-white">{garment.name}</p>
                  <div className="mt-1 flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-white/40">{garment.category}</span>
                    {garment.price && (
                      <span className="text-[11px] font-extrabold text-accent">Rs. {garment.price}</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
