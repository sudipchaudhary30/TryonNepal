// import { Link } from 'react-router-dom';
// import heroImage from '@/Assets/heroimage.png';
// import Footer from '../components/ui/Footer';

// export default function Home() {
//   return (
//     <div className="min-h-screen bg-[#050505] text-white font-sans">

//       {/* HERO SECTION */}
//       <section className="relative min-h-[90vh] flex items-center pt-20 pb-20 border-b border-white/5">
//         <div className="absolute inset-0 overflow-hidden flex justify-end items-center right-0 z-0 opacity-40 lg:opacity-100">
//           {/* Placeholder for the mirror image - using the existing heroImage or a gradient box */}
//           <div className="w-1/2 h-[80%] relative mr-12 mt-12 hidden lg:flex items-center justify-center">
//             <div className="absolute inset-0 border-[4px] border-[#8B5CF6] shadow-[0_0_40px_rgba(139,92,246,0.3)] rounded-lg"></div>
//             <img src={heroImage} alt="Mirror" className="w-full h-full object-cover object-center rounded-sm opacity-50" />
//             <div className="absolute inset-0 bg-gradient-to-r from-[#050505] to-transparent z-10 w-1/3 left-0"></div>
//           </div>
//         </div>

//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full relative z-10">
//           <div className="max-w-xl">
//             <p className="text-xs font-bold tracking-widest text-[#8B5CF6] uppercase mb-6">
//               The Future of Shopping
//             </p>
//             <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] mb-6">
//               Try It On.<br />
//               <span className="text-[#8B5CF6]">Perfectly.</span>
//             </h1>
//             <p className="text-gray-300 text-lg mb-10 max-w-md">
//               VirtuWear uses advanced AI to show you your perfect fit, before you buy.
//             </p>
//             <div className="flex items-center gap-6">
//               <Link to="/collections" className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-8 py-3 rounded-none font-medium transition-colors text-sm">
//                 Explore Collections &rarr;
//               </Link>
//               <button className="flex items-center gap-3 text-sm font-medium hover:text-gray-300 transition-colors">
//                 <span className="flex items-center justify-center w-10 h-10 border border-white/30 rounded-full">
//                   <svg className="w-3 h-3 ml-1 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
//                 </span>
//                 See How It Works
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* SECTION 2: Nepali Men */}
//       <section className="relative py-24 border-b border-white/5 bg-[#0a0a0a]">
//         <div className="absolute inset-0 z-0 opacity-30 lg:opacity-60 flex justify-end">
//           <img src={heroImage} alt="Nepali Men" className="w-2/3 h-full object-cover" />
//           <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"></div>
//         </div>
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
//           <div className="max-w-xl">
//             <p className="text-xs font-bold tracking-widest text-[#8B5CF6] uppercase mb-4">
//               Built for Nepali Men
//             </p>
//             <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
//               Look good.<br />
//               Buy once.<br />
//               Wear confidently.
//             </h2>
//             <p className="text-gray-400 text-base max-w-sm leading-relaxed">
//               Whether you're shopping for college, your first job, or a night out, VirtuWear helps you choose the right fit before you order.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* SECTION 3: Sound Familiar */}
//       <section className="relative py-24 border-b border-white/5 bg-[#050505]">
//         <div className="absolute inset-0 z-0 opacity-30 lg:opacity-60 flex justify-start">
//           <img src={heroImage} alt="Stressed Shopper" className="w-1/2 h-full object-cover" />
//           <div className="absolute inset-0 bg-gradient-to-l from-[#050505] via-[#050505]/80 to-transparent"></div>
//         </div>
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex justify-end">
//           <div className="max-w-md w-full">
//             <p className="text-xs font-bold tracking-widest text-[#8B5CF6] uppercase mb-4">
//               Sound Familiar?
//             </p>
//             <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-6">
//               Ordered Medium.<br />
//               Got Medium.<br />
//               Still didn't fit.
//             </h2>
//             <div className="w-12 h-[2px] bg-[#8B5CF6] mb-6"></div>
//             <p className="text-gray-400 text-base mb-10">
//               That's because size charts don't know your body.
//             </p>
//             <Link to="/how-it-works" className="inline-block bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-8 py-3 rounded-none font-medium transition-colors text-sm">
//               See how VirtuWear fixes this &rarr;
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* SECTION 4: How It Works */}
//       <section className="py-24 bg-white text-black">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
//           <p className="text-xs font-bold tracking-widest text-[#8B5CF6] uppercase mb-4">
//             How It Works
//           </p>
//           <h2 className="text-3xl sm:text-4xl font-bold mb-16">
//             Four simple steps
//           </h2>

//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
//             {/* Camera */}
//             <div className="flex flex-col items-center">
//               <div className="w-16 h-16 mb-4 flex items-center justify-center">
//                 <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
//                 </svg>
//               </div>
//               <h3 className="font-bold text-lg mb-2">Open Camera</h3>
//               <p className="text-gray-600 text-sm max-w-[200px]">Use your phone camera. That's all you need.</p>
//             </div>

//             {/* Stand Naturally */}
//             <div className="flex flex-col items-center">
//               <div className="w-16 h-16 mb-4 flex items-center justify-center">
//                 <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                 </svg>
//               </div>
//               <h3 className="font-bold text-lg mb-2">Stand Naturally</h3>
//               <p className="text-gray-600 text-sm max-w-[200px]">We capture your real body measurements.</p>
//             </div>

//             {/* See Yourself */}
//             <div className="flex flex-col items-center">
//               <div className="w-16 h-16 mb-4 flex items-center justify-center">
//                 <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
//                 </svg>
//               </div>
//               <h3 className="font-bold text-lg mb-2">See Yourself</h3>
//               <p className="text-gray-600 text-sm max-w-[200px]">Try on any outfit virtually in real-time.</p>
//             </div>

//             {/* Order */}
//             <div className="flex flex-col items-center">
//               <div className="w-16 h-16 mb-4 flex items-center justify-center">
//                 <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
//                 </svg>
//               </div>
//               <h3 className="font-bold text-lg mb-2">Order</h3>
//               <p className="text-gray-600 text-sm max-w-[200px]">Buy with confidence. The right fit, every time.</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* SECTION 5: Dress with Confidence */}
//       <section className="relative py-32 bg-[#111]">
//         <div className="absolute inset-0 z-0 opacity-40">
//           <img src={heroImage} alt="Dress Confidence" className="w-full h-full object-cover" />
//           <div className="absolute inset-0 bg-black/60"></div>
//         </div>
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col justify-center h-full">
//           <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
//             Dress with <br />
//             <span className="text-[#8B5CF6]">confidence.</span>
//           </h2>
//           <p className="text-gray-300 text-lg">
//             Because the best outfit<br />
//             is the one that actually fits.
//           </p>
//         </div>
//       </section>

//       {/* FOOTER */}
//       <Footer />
//     </div>
//   );
// }

// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';

// import { garmentApi } from '@/lib/api';
// import type { Garment } from '@/types/garment';

// export default function Home() {
//   const [featuredGarments, setFeaturedGarments] = useState<Garment[]>([]);

//   useEffect(() => {
//     let cancelled = false;

//     const loadCatalog = async () => {
//       const garments = await garmentApi.getAll();
//       if (!cancelled) {
//         setFeaturedGarments(garments.slice(0, 4));
//       }
//     };

//     void loadCatalog();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   return (
//     <div className="relative overflow-hidden">
//       {/* Decorative Glow Elements */}
//       <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-accent/10 blur-[120px]" />
//       <div className="pointer-events-none absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-accent-warm/5 blur-[150px]" />

//       <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col justify-center gap-16 px-4 py-16 sm:px-6 lg:px-8">
//         <div className="relative z-10 max-w-3xl space-y-8">
//           <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-accent">
//             <span className="relative flex h-2 w-2">
//               <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
//               <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
//             </span>
//             Interactive Live Try-On
//           </div>
//           <h1 className="font-display text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl">
//             Fitting room, <br/>
//             <span className="bg-gradient-to-r from-accent via-white to-white bg-clip-text text-transparent">reimagined.</span>
//           </h1>
//           <p className="max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
//             Experience AR Tryon Nepal. Try on authentic Nepalese traditional garments and modern wardrobe essentials in real-time, right from your browser. Privacy-preserving, on-device pose tracking ensures your camera stream never leaves your device.
//           </p>
//           <div className="flex flex-wrap gap-4 pt-2">
//             <Link to="/tryon" className="group relative rounded-full bg-accent px-8 py-4 font-bold text-black shadow-lg shadow-accent/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-accent/35">
//               Launch Try On Room
//             </Link>
//             <Link to="/wardrobe" className="rounded-full border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white transition-all duration-200 hover:border-white/20 hover:bg-white/10">
//               Explore Wardrobe
//             </Link>
//           </div>
//         </div>

//         <section className="relative z-10 grid gap-6 md:grid-cols-[1fr_1.3fr] lg:gap-8">
//           <div className="flex flex-col justify-between rounded-3xl border border-white/5 bg-card/45 p-8 backdrop-blur-md shadow-2xl">
//             <div>
//               <p className="text-[10px] font-black uppercase tracking-[0.25em] text-accent/70">Nepal Heritage Catalogue</p>
//               <h2 className="mt-3 font-display text-2xl font-bold text-white leading-snug">Authentic Craftsmanship Meets AR</h2>
//               <p className="mt-4 text-sm leading-relaxed text-white/50">
//                 Discover the beauty of traditional designs like the Himalayan Kurta, Dhaka print dresses, and the iconic Daura Suruwal. Crafted using high-fidelity digital assets mapped dynamically to your body coordinates.
//               </p>
//             </div>
//             <div className="mt-8 flex items-center gap-6 border-t border-white/5 pt-6 text-xs text-white/40">
//               <div>
//                 <span className="block font-display text-xl font-bold text-white">0%</span>
//                 Data Shared
//               </div>
//               <div className="h-8 w-px bg-white/5" />
//               <div>
//                 <span className="block font-display text-xl font-bold text-accent">60 FPS</span>
//                 On-device Tracking
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
//             {featuredGarments.map((garment) => (
//               <article key={garment.id} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-card/25 p-3 transition-all duration-300 hover:border-white/10 hover:bg-card/45 hover:shadow-xl">
//                 <div className="aspect-[4/5] overflow-hidden rounded-xl bg-black/20 relative">
//                   <img src={garment.thumbnailUrl} alt={garment.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
//                 </div>
//                 <div className="pt-3">
//                   <p className="truncate text-sm font-bold text-white">{garment.name}</p>
//                   <div className="mt-1 flex items-center justify-between gap-1">
//                     <span className="text-[10px] uppercase tracking-wider text-white/40">{garment.category}</span>
//                     {garment.price && (
//                       <span className="text-[11px] font-extrabold text-accent">Rs. {garment.price}</span>
//                     )}
//                   </div>
//                 </div>
//               </article>
//             ))}
//           </div>
//         </section>
//       </section>
//     </div>
//   );
// }


import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { garmentApi } from '@/lib/api';
import type { Garment } from '@/types/garment';
import Footer from '../components/ui/Footer';
import heroBg from '@/Assets/herobg_new.jpg';

/* ------------------------------------------------------------------ */
/*  Dhaka-weave divider — the page's one signature motif.              */
/*  Pattern is a simplified version of the diagonal-lattice weave      */
/*  found on Dhaka topi fabric, used once as a structural break        */
/*  rather than scattered as decoration.                               */
/* ------------------------------------------------------------------ */
function DhakaDivider() {
  return (
    <div className="relative h-10 w-full overflow-hidden bg-[#0B1220]" aria-hidden="true">
      <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 40">
        <defs>
          <pattern id="dhaka" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="none" stroke="#C8102E" strokeWidth="1.2" opacity="0.55" />
            <circle cx="20" cy="20" r="2.2" fill="#D4A017" opacity="0.8" />
          </pattern>
        </defs>
        <rect width="400" height="40" fill="url(#dhaka)" />
      </svg>
    </div>
  );
}

/* Camera-viewfinder corner brackets, framing the hero garment.        */
function ViewfinderFrame({ children }: { children: React.ReactNode }) {
  const corner = 'absolute h-6 w-6 border-[#D4A017]';
  return (
    <div className="relative">
      <div className={`${corner} left-0 top-0 border-l-2 border-t-2`} />
      <div className={`${corner} right-0 top-0 border-r-2 border-t-2`} />
      <div className={`${corner} bottom-0 left-0 border-b-2 border-l-2`} />
      <div className={`${corner} bottom-0 right-0 border-b-2 border-r-2`} />
      {children}
    </div>
  );
}

export default function Home() {
  const [wardrobe, setWardrobe] = useState<Garment[]>([]);
  const [reticlePos, setReticlePos] = useState({ x: 50, y: 45 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const loadCatalog = async () => {
      const garments = await garmentApi.getAll();
      if (!cancelled) setWardrobe(garments.slice(0, 4));
    };
    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  // Subtle drifting reticle inside the hero frame, echoing a pose-tracking
  // dot without pretending to be a real demo.
  useEffect(() => {
    const id = setInterval(() => {
      setReticlePos({
        x: 42 + Math.random() * 16,
        y: 38 + Math.random() * 16,
      });
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const steps = [
    {
      n: '01',
      title: 'Frame yourself',
      body: 'Open the camera. No suit, no markers, no setup — just stand where your phone can see you.',
    },
    {
      n: '02',
      title: 'Pose locks in',
      body: 'On-device tracking finds your shoulders, waist and hips in real time. Nothing leaves your phone.',
    },
    {
      n: '03',
      title: 'Outfit renders live',
      body: 'The garment drapes onto your actual proportions, not a mannequin\u2019s.',
    },
    {
      n: '04',
      title: 'Order the fit you saw',
      body: 'Confident in size and drape, check out knowing exactly what arrives.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F5F1E8]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Manrope:wght@400;500;700;800&family=Space+Mono:wght@400;700&display=swap');
        .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        .font-mono-label { font-family: 'Space Mono', monospace; }
      `}</style>

      {/* ---------------------------------------------------------------- */}
      {/* HERO                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section 
        className="relative w-full bg-cover bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `url(${heroBg})`, backgroundPosition: '80% center' }}
      >
        {/* Gradient overlay: fully solid dark over left text, then smooth fade to reveal the shifted jacket image */}
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#0B1220] via-[#0B1220] via-45% to-transparent z-0 w-[60%]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-28">
          <div className="flex flex-col items-start justify-center text-left max-w-3xl">
            <p className="font-mono-label text-[11px] uppercase tracking-[0.3em] text-[#D4A017]">
              Live AR Fitting &mdash; Kathmandu
            </p>
            <h1 className="font-display mt-5 text-5xl font-semibold leading-[1.05] sm:text-6xl text-left">
              See it on.
              <br />
              <span className="text-[#C8102E]">Before</span> you buy it.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#9AA3B5] text-left">
              Point your camera. Watch a daura suruwal drape onto your
              own shoulders, in real time, entirely on your device. No account, no upload,
              no guesswork.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/tryon"
                className="rounded-none bg-[#C8102E] px-8 py-3.5 text-sm font-bold text-[#F5F1E8] transition-transform hover:scale-[1.03]"
              >
                Launch Try-On Room
              </Link>
              <Link
                to="/wardrobe"
                className="rounded-none border border-[#F5F1E8]/15 px-8 py-3.5 text-sm font-semibold text-[#F5F1E8] transition-colors hover:border-[#F5F1E8]/40"
              >
                Browse Wardrobe
              </Link>
            </div>

            <div className="mt-12 flex gap-10 border-t border-[#F5F1E8]/10 pt-6 font-mono-label text-xs text-[#9AA3B5]">
              <div>
                <span className="block text-xl font-bold text-[#F5F1E8]">0%</span>
                data leaves device
              </div>
              <div>
                <span className="block text-xl font-bold text-[#D4A017]">60fps</span>
                pose tracking
              </div>
              <div>
                <span className="block text-xl font-bold text-[#F5F1E8]">&lt;2s</span>
                to first fit
              </div>
            </div>
          </div>
        </div>
      </section>

      <DhakaDivider />

      {/* ---------------------------------------------------------------- */}
      {/* PROCESS — genuine sequence, numbering earns its keep here         */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <p className="font-mono-label text-xs uppercase tracking-[0.3em] text-[#D4A017]">
          The Fitting Sequence
        </p>
        <h2 className="font-display mt-3 max-w-lg text-3xl font-semibold leading-tight sm:text-4xl">
          Four steps, one continuous frame.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-[#F5F1E8]/10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.n} className="bg-[#0B1220] p-7">
              <span className="font-mono-label text-sm text-[#C8102E]">{step.n}</span>
              <h3 className="font-display mt-4 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#9AA3B5]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* WARDROBE                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono-label text-xs uppercase tracking-[0.3em] text-[#D4A017]">
              The Rack
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
              Traditional weave. Modern cut.
            </h2>
          </div>
          <Link to="/wardrobe" className="text-sm font-semibold text-[#C8102E] hover:underline">
            View full wardrobe &rarr;
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {wardrobe.map((garment) => (
            <article
              key={garment.id}
              className="group relative overflow-hidden rounded-lg border border-[#F5F1E8]/10 bg-[#131B2E] p-2.5 transition-colors hover:border-[#D4A017]/40"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-black/20">
                <img
                  src={garment.thumbnailUrl}
                  alt={garment.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="pt-3">
                <p className="truncate text-sm font-bold">{garment.name}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono-label text-[10px] uppercase tracking-wider text-[#9AA3B5]">
                    {garment.category}
                  </span>
                  {garment.price && (
                    <span className="font-mono-label text-[11px] font-bold text-[#D4A017]">
                      Rs. {garment.price}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <DhakaDivider />

      {/* ---------------------------------------------------------------- */}
      {/* CLOSING CTA                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-6 py-28 text-center lg:px-8">
        <h2 className="font-display mx-auto max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
          Stop guessing your size.
          <br />
          <span className="text-[#C8102E]">Start seeing it.</span>
        </h2>
        <Link
          to="/tryon"
          className="mt-10 inline-block rounded-none bg-[#C8102E] px-10 py-4 text-sm font-bold text-[#F5F1E8] transition-transform hover:scale-[1.03]"
        >
          Launch Try-On Room
        </Link>
      </section>

      <Footer />
    </div>
  );
}