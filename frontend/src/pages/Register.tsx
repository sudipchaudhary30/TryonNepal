// import { useEffect, useMemo, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';

// import Button from '@/components/ui/Button';
// import Loader from '@/components/ui/Loader';
// import { useUserStore } from '@/store/useUserStore';

// function passwordStrength(password: string): number {
//   let score = 0;
//   if (password.length >= 8) score += 1;
//   if (/[A-Z]/.test(password)) score += 1;
//   if (/[0-9]/.test(password)) score += 1;
//   if (/[^A-Za-z0-9]/.test(password)) score += 1;
//   return score;
// }

// export default function Register() {
//   const navigate = useNavigate();
//   const { signUp, isLoading, isAuthenticated, initAuth } = useUserStore();
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [agree, setAgree] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/profile', { replace: true });
//       return;
//     }

//     void initAuth();
//   }, [initAuth, isAuthenticated, navigate]);

//   const strength = useMemo(() => passwordStrength(password), [password]);

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setError(null);

//     if (!name.trim() || name.trim().length < 2) {
//       setError('Please enter your full name.');
//       return;
//     }

//     if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       setError('Please enter a valid email address.');
//       return;
//     }

//     if (password.length < 8) {
//       setError('Password must be at least 8 characters long.');
//       return;
//     }

//     if (password !== confirmPassword) {
//       setError('Passwords do not match.');
//       return;
//     }

//     if (!agree) {
//       setError('Please accept the privacy policy.');
//       return;
//     }

//     try {
//       await signUp(email.trim(), password, name.trim());
//       navigate('/profile', { replace: true });
//     } catch (caughtError) {
//       setError(caughtError instanceof Error ? caughtError.message : 'Registration failed.');
//     }
//   };

//   if (isLoading && !isAuthenticated) {
//     return <Loader message="Preparing your account" />;
//   }

//   return (
//     <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
//       <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
//         <section className="border border-white/10 bg-[#111111] p-6 sm:p-8">
//           <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">Private access</p>
//           <h1 className="mt-3 font-display text-4xl font-bold text-white">Create your personal fitting suite.</h1>
//           <p className="mt-4 text-sm leading-relaxed text-white/70">
//             Register once to keep your style notes, measurements, and preferred silhouettes ready for every future try-on.
//           </p>
//           <div className="mt-8 space-y-3 border border-white/10 bg-black/20 p-4 text-sm text-white/70">
//             <p className="font-semibold text-white">What you unlock</p>
//             <p>Personalized wardrobe curation for your best outfits.</p>
//             <p>Measurements and fit preferences stay attached to each fitting.</p>
//           </div>
//         </section>

//         <section className="border border-white/10 bg-[#111111] p-6 sm:p-8">
//           <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">Register</p>
//           <h2 className="mt-2 font-display text-3xl font-bold text-white">Build your account</h2>

//           <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
//             {error ? <p className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

//             <div>
//               <label htmlFor="register-name" className="mb-2 block text-sm text-white/80">Full name</label>
//               <input
//                 id="register-name"
//                 value={name}
//                 onChange={(event) => setName(event.target.value)}
//                 className="w-full rounded-[2px] border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent"
//                 placeholder="Full Name"
//               />
//             </div>

//             <div>
//               <label htmlFor="register-email" className="mb-2 block text-sm text-white/80">Email</label>
//               <input
//                 id="register-email"
//                 type="email"
//                 value={email}
//                 onChange={(event) => setEmail(event.target.value)}
//                 className="w-full rounded-[2px] border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent"
//                 placeholder="you@example.com"
//               />
//             </div>

//             <div>
//               <label htmlFor="register-password" className="mb-2 block text-sm text-white/80">Password</label>
//               <input
//                 id="register-password"
//                 type="password"
//                 value={password}
//                 onChange={(event) => setPassword(event.target.value)}
//                 className="w-full rounded-[2px] border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent"
//                 placeholder="••••••••"
//               />
//               <div className="mt-3 flex gap-1">
//                 {[1, 2, 3, 4].map((bar) => (
//                   <span key={bar} className={`h-2 flex-1 ${bar <= strength ? 'bg-accent' : 'bg-white/10'}`} />
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label htmlFor="register-confirm" className="mb-2 block text-sm text-white/80">Confirm password</label>
//               <input
//                 id="register-confirm"
//                 type="password"
//                 value={confirmPassword}
//                 onChange={(event) => setConfirmPassword(event.target.value)}
//                 className="w-full rounded-[2px] border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent"
//                 placeholder="••••••••"
//               />
//             </div>

//             <label className="flex items-center gap-3 border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
//               <input
//                 type="checkbox"
//                 checked={agree}
//                 onChange={(event) => setAgree(event.target.checked)}
//                 className="h-4 w-4 rounded border-white/20 bg-transparent text-accent focus:ring-accent"
//               />
//               I agree to the privacy policy.
//             </label>

//             <Button loading={isLoading} className="w-full" type="submit">
//               Create Account
//             </Button>
//           </form>

//           <p className="mt-6 text-sm text-white/70">
//             Already have an account?{' '}
//             <Link to="/login" className="text-accent transition hover:underline">
//               Sign in
//             </Link>
//           </p>
//         </section>
//       </div>
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useUserStore } from '@/store/useUserStore';
import { garmentApi } from '@/lib/api';
import type { Garment } from '@/types/garment';

function passwordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

function DhakaDivider() {
  return (
    <div className="relative h-8 w-full overflow-hidden" aria-hidden="true">
      <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 32">
        <defs>
          <pattern id="dhaka-register" width="40" height="32" patternUnits="userSpaceOnUse">
            <path d="M0 16 L20 0 L40 16 L20 32 Z" fill="none" stroke="#C8102E" strokeWidth="1.2" opacity="0.55" />
            <circle cx="20" cy="16" r="2.2" fill="#D4A017" opacity="0.8" />
          </pattern>
        </defs>
        <rect width="400" height="32" fill="url(#dhaka-register)" />
      </svg>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { signUp, isLoading, isAuthenticated, initAuth } = useUserStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<Garment[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);

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

  useEffect(() => {
    // Only fetch initial authentication state if needed, but do not auto-redirect on mount
    void initAuth();
  }, [initAuth]);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agree) {
      setError('Please accept the privacy policy.');
      return;
    }

    try {
      await signUp(email.trim(), password, name.trim());
      navigate('/wardrobe', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Registration failed.');
    }
  };

  if (isLoading && !isAuthenticated) {
    return <Loader message="Preparing your account" />;
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
          <section className="relative flex flex-col overflow-hidden rounded-none border border-[#F5F1E8]/10 bg-[#131B2E] p-4 sm:p-5">
            <p className="font-mono-label px-2 pt-2 text-[10px] uppercase tracking-[0.35em] text-[#D4A017]">
              The Wardrobe
            </p>

            <div className="relative mt-4 aspect-[4/5] w-full overflow-hidden rounded-none bg-black/20">
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
                  {slides[slideIndex].price && (
                    <span className="font-mono-label text-xs font-bold text-[#D4A017]">
                      Rs. {slides[slideIndex].price}
                    </span>
                  )}
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
                  className={`h-1.5 transition-all ${
                    i === slideIndex ? 'w-6 bg-[#D4A017] rounded-none' : 'w-1.5 bg-[#F5F1E8]/20 rounded-none'
                  }`}
                />
              ))}
            </div>
          </section>

          <section className="rounded-none border border-[#F5F1E8]/10 bg-[#131B2E] p-6 sm:p-8">
            <p className="font-mono-label text-[10px] uppercase tracking-[0.35em] text-[#D4A017]">
              Register
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold">Build your account</h2>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              {error ? (
                <p className="rounded-none border border-[#C8102E]/30 bg-[#C8102E]/10 px-4 py-3 text-sm text-[#F5B8C0]">
                  {error}
                </p>
              ) : null}

              <div>
                <label htmlFor="register-name" className="mb-2 block text-sm text-[#F5F1E8]/80">
                  Full name
                </label>
                <input
                  id="register-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-none border border-[#F5F1E8]/10 bg-black/30 px-4 py-3 text-[#F5F1E8] outline-none transition focus:border-[#D4A017]"
                  placeholder="Name Surname"
                />
              </div>

              <div>
                <label htmlFor="register-email" className="mb-2 block text-sm text-[#F5F1E8]/80">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-none border border-[#F5F1E8]/10 bg-black/30 px-4 py-3 text-[#F5F1E8] outline-none transition focus:border-[#D4A017]"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="register-password" className="mb-2 block text-sm text-[#F5F1E8]/80">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-none border border-[#F5F1E8]/10 bg-black/30 px-4 py-3 text-[#F5F1E8] outline-none transition focus:border-[#D4A017]"
                  placeholder="••••••••"
                />
                <div className="mt-3 flex gap-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <span
                      key={bar}
                      className={`h-1.5 flex-1 rounded-none ${
                        bar <= strength ? 'bg-[#D4A017]' : 'bg-[#F5F1E8]/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="register-confirm" className="mb-2 block text-sm text-[#F5F1E8]/80">
                  Confirm password
                </label>
                <input
                  id="register-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-none border border-[#F5F1E8]/10 bg-black/30 px-4 py-3 text-[#F5F1E8] outline-none transition focus:border-[#D4A017]"
                  placeholder="••••••••"
                />
              </div>

              <label className="flex items-center gap-3 rounded-none border border-[#F5F1E8]/10 bg-black/20 px-4 py-3 text-sm text-[#9AA3B5]">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(event) => setAgree(event.target.checked)}
                  className="h-4 w-4 rounded-none border-[#F5F1E8]/20 bg-transparent text-[#D4A017] focus:ring-[#D4A017]"
                />
                I agree to the privacy policy.
              </label>

              <Button loading={isLoading} className="w-full !rounded-none !bg-[#C8102E] hover:!bg-[#a80d26]" type="submit">
                Create Account
              </Button>
            </form>

            <p className="mt-6 text-sm text-[#9AA3B5]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#D4A017] transition hover:underline">
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}