// import { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';

// import Button from '@/components/ui/Button';
// import Loader from '@/components/ui/Loader';
// import { useUserStore } from '@/store/useUserStore';

// export default function Login() {
//   const navigate = useNavigate();
//   const { signInWithEmail, isLoading, isAuthenticated, initAuth } = useUserStore();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/profile', { replace: true });
//       return;
//     }

//     void initAuth();
//   }, [initAuth, isAuthenticated, navigate]);

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setError(null);

//     if (!email.trim() || !password.trim()) {
//       setError('Please enter your email and password.');
//       return;
//     }

//     try {
//       await signInWithEmail(email.trim(), password);
//       navigate('/profile', { replace: true });
//     } catch (caughtError) {
//       setError(caughtError instanceof Error ? caughtError.message : 'Login failed.');
//     }
//   };

//   if (isLoading && !isAuthenticated) {
//     return <Loader message="Checking your account" />;
//   }

//   return (
//     <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
//       <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
//         <section className="border border-white/10 bg-[#111111] p-6 sm:p-8">
//           <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">Secure access</p>
//           <h1 className="mt-3 font-display text-4xl font-bold text-white">Welcome back to your fitting room.</h1>
//           <p className="mt-4 text-sm leading-relaxed text-white/70">
//             Sign in to access your saved looks, preferred measurements, and fitted wardrobe notes.
//           </p>
//           <div className="mt-8 space-y-3 border border-white/10 bg-black/20 p-4 text-sm text-white/70">
//             <p className="font-semibold text-white">Why it matters</p>
//             <p>Every try-on stays aligned with your saved preferences and fit profile.</p>
//             <p>Switch between looks without losing your session or wardrobe rhythm.</p>
//           </div>
//         </section>

//         <section className="border border-white/10 bg-[#111111] p-6 sm:p-8">
//           <div className="flex items-center justify-between gap-3">
//             <div>
//               <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">Sign in</p>
//               <h2 className="mt-2 font-display text-3xl font-bold text-white">Continue your fitting journey</h2>
//             </div>
//           </div>

//           <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
//             {error ? <p className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

//             <div>
//               <label htmlFor="login-email" className="mb-2 block text-sm text-white/80">Email</label>
//               <input
//                 id="login-email"
//                 type="email"
//                 value={email}
//                 onChange={(event) => setEmail(event.target.value)}
//                 className="w-full rounded-[2px] border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent"
//                 placeholder="you@example.com"
//               />
//             </div>

//             <div>
//               <label htmlFor="login-password" className="mb-2 block text-sm text-white/80">Password</label>
//               <input
//                 id="login-password"
//                 type="password"
//                 value={password}
//                 onChange={(event) => setPassword(event.target.value)}
//                 className="w-full rounded-[2px] border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent"
//                 placeholder="••••••••"
//               />
//             </div>

//             <Button loading={isLoading} className="w-full" type="submit">
//               Sign In
//             </Button>
//           </form>

//           <p className="mt-6 text-sm text-white/70">
//             New here?{' '}
//             <Link to="/register" className="text-accent transition hover:underline">
//               Create an account
//             </Link>
//           </p>
//         </section>
//       </div>
//     </div>
//   );
// }



import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useUserStore } from '@/store/useUserStore';
import { garmentApi } from '@/lib/api';
import type { Garment } from '@/types/garment';

function DhakaDivider() {
  return (
    <div className="relative h-8 w-full overflow-hidden" aria-hidden="true">
      <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 32">
        <defs>
          <pattern id="dhaka-login" width="40" height="32" patternUnits="userSpaceOnUse">
            <path d="M0 16 L20 0 L40 16 L20 32 Z" fill="none" stroke="#C8102E" strokeWidth="1.2" opacity="0.55" />
            <circle cx="20" cy="16" r="2.2" fill="#D4A017" opacity="0.8" />
          </pattern>
        </defs>
        <rect width="400" height="32" fill="url(#dhaka-login)" />
      </svg>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { signInWithEmail, isLoading, isAuthenticated, initAuth } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<Garment[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/wardrobe', { replace: true });
      return;
    }

    void initAuth();
  }, [initAuth, isAuthenticated, navigate]);

  useEffect(() => {
    let cancelled = false;
    const loadSlides = async () => {
      const garments = await garmentApi.getAll();
      if (!cancelled) setSlides(garments.slice(0, 5));
    };
    void loadSlides();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, 3500);
    return () => clearInterval(id);
  }, [slides.length]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      await signInWithEmail(email.trim(), password);
      navigate('/wardrobe', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Login failed.');
    }
  };

  if (isLoading && !isAuthenticated) {
    return <Loader message="Checking your account" />;
  }

  return (
    <div
      className="min-h-screen w-full bg-[#0B1220] text-[#F5F1E8]"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Manrope:wght@400;500;700;800&family=Space+Mono:wght@400;700&display=swap');
        .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        .font-mono-label { font-family: 'Space Mono', monospace; }
      `}</style>

      <DhakaDivider />

      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="relative flex flex-col overflow-hidden rounded-lg border border-[#F5F1E8]/10 bg-[#131B2E] p-4 sm:p-5">
            <p className="font-mono-label px-2 pt-2 text-[10px] uppercase tracking-[0.35em] text-[#D4A017]">
              The Wardrobe
            </p>

            <div className="relative mt-4 aspect-[4/5] w-full overflow-hidden rounded-md bg-black/20">
              {slides.map((garment, i) => (
                <img
                  key={garment.id}
                  src={garment.thumbnailUrl}
                  alt={garment.name}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
                    i === slideIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1220]/80 via-transparent to-transparent" />

              {slides[slideIndex] && (
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-bold text-[#F5F1E8]">{slides[slideIndex].name}</p>
                    <p className="font-mono-label text-[10px] uppercase tracking-wider text-[#9AA3B5]">
                      {slides[slideIndex].category}
                    </p>
                  </div>

                </div>
              )}
            </div>

            <div className="mt-4 flex justify-center gap-2 pb-1">
              {slides.map((garment, i) => (
                <button
                  key={garment.id}
                  type="button"
                  aria-label={`Show ${garment.name}`}
                  onClick={() => setSlideIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === slideIndex ? 'w-6 bg-[#D4A017]' : 'w-1.5 bg-[#F5F1E8]/20'
                  }`}
                />
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#F5F1E8]/10 bg-[#131B2E] p-6 sm:p-8">
            <p className="font-mono-label text-[10px] uppercase tracking-[0.35em] text-[#D4A017]">
              Sign In
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold">Continue your fitting journey</h2>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              {error ? (
                <p className="rounded-md border border-[#C8102E]/30 bg-[#C8102E]/10 px-4 py-3 text-sm text-[#F5B8C0]">
                  {error}
                </p>
              ) : null}

              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm text-[#F5F1E8]/80">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-none border border-[#F5F1E8]/10 bg-black/30 px-4 py-3 text-[#F5F1E8] outline-none transition focus:border-[#D4A017]"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-2 block text-sm text-[#F5F1E8]/80">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-none border border-[#F5F1E8]/10 bg-black/30 px-4 py-3 text-[#F5F1E8] outline-none transition focus:border-[#D4A017]"
                  placeholder="••••••••"
                />
              </div>

              <Button loading={isLoading} className="w-full !rounded-none !bg-[#C8102E] hover:!bg-[#a80d26]" type="submit">
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-sm text-[#9AA3B5]">
              New here?{' '}
              <Link to="/register" className="text-[#D4A017] transition hover:underline">
                Create an account
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}