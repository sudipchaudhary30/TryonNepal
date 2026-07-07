import { Link } from 'react-router-dom';
import heroImage from '@/Assets/heroimage.png';
import Footer from '../components/ui/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-20 border-b border-white/5">
        <div className="absolute inset-0 overflow-hidden flex justify-end items-center right-0 z-0 opacity-40 lg:opacity-100">
          {/* Placeholder for the mirror image - using the existing heroImage or a gradient box */}
          <div className="w-1/2 h-[80%] relative mr-12 mt-12 hidden lg:flex items-center justify-center">
            <div className="absolute inset-0 border-[4px] border-[#8B5CF6] shadow-[0_0_40px_rgba(139,92,246,0.3)] rounded-lg"></div>
            <img src={heroImage} alt="Mirror" className="w-full h-full object-cover object-center rounded-sm opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] to-transparent z-10 w-1/3 left-0"></div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="max-w-xl">
            <p className="text-xs font-bold tracking-widest text-[#8B5CF6] uppercase mb-6">
              The Future of Shopping
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] mb-6">
              Try It On.<br />
              <span className="text-[#8B5CF6]">Perfectly.</span>
            </h1>
            <p className="text-gray-300 text-lg mb-10 max-w-md">
              VirtuWear uses advanced AI to show you your perfect fit, before you buy.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/collections" className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-8 py-3 rounded-none font-medium transition-colors text-sm">
                Explore Collections &rarr;
              </Link>
              <button className="flex items-center gap-3 text-sm font-medium hover:text-gray-300 transition-colors">
                <span className="flex items-center justify-center w-10 h-10 border border-white/30 rounded-full">
                  <svg className="w-3 h-3 ml-1 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </span>
                See How It Works
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Nepali Men */}
      <section className="relative py-24 border-b border-white/5 bg-[#0a0a0a]">
        <div className="absolute inset-0 z-0 opacity-30 lg:opacity-60 flex justify-end">
          <img src={heroImage} alt="Nepali Men" className="w-2/3 h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"></div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-xl">
            <p className="text-xs font-bold tracking-widest text-[#8B5CF6] uppercase mb-4">
              Built for Nepali Men
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Look good.<br />
              Buy once.<br />
              Wear confidently.
            </h2>
            <p className="text-gray-400 text-base max-w-sm leading-relaxed">
              Whether you're shopping for college, your first job, or a night out, VirtuWear helps you choose the right fit before you order.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Sound Familiar */}
      <section className="relative py-24 border-b border-white/5 bg-[#050505]">
        <div className="absolute inset-0 z-0 opacity-30 lg:opacity-60 flex justify-start">
          <img src={heroImage} alt="Stressed Shopper" className="w-1/2 h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#050505] via-[#050505]/80 to-transparent"></div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex justify-end">
          <div className="max-w-md w-full">
            <p className="text-xs font-bold tracking-widest text-[#8B5CF6] uppercase mb-4">
              Sound Familiar?
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-6">
              Ordered Medium.<br />
              Got Medium.<br />
              Still didn't fit.
            </h2>
            <div className="w-12 h-[2px] bg-[#8B5CF6] mb-6"></div>
            <p className="text-gray-400 text-base mb-10">
              That's because size charts don't know your body.
            </p>
            <Link to="/how-it-works" className="inline-block bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-8 py-3 rounded-none font-medium transition-colors text-sm">
              See how VirtuWear fixes this &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: How It Works */}
      <section className="py-24 bg-white text-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold tracking-widest text-[#8B5CF6] uppercase mb-4">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-16">
            Four simple steps
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
            {/* Camera */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Open Camera</h3>
              <p className="text-gray-600 text-sm max-w-[200px]">Use your phone camera. That's all you need.</p>
            </div>

            {/* Stand Naturally */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Stand Naturally</h3>
              <p className="text-gray-600 text-sm max-w-[200px]">We capture your real body measurements.</p>
            </div>

            {/* See Yourself */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">See Yourself</h3>
              <p className="text-gray-600 text-sm max-w-[200px]">Try on any outfit virtually in real-time.</p>
            </div>

            {/* Order */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Order</h3>
              <p className="text-gray-600 text-sm max-w-[200px]">Buy with confidence. The right fit, every time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Dress with Confidence */}
      <section className="relative py-32 bg-[#111]">
        <div className="absolute inset-0 z-0 opacity-40">
          <img src={heroImage} alt="Dress Confidence" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col justify-center h-full">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Dress with <br />
            <span className="text-[#8B5CF6]">confidence.</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Because the best outfit<br />
            is the one that actually fits.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
