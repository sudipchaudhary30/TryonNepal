import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useUserStore } from '@/store/useUserStore';

function passwordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
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

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile', { replace: true });
      return;
    }

    void initAuth();
  }, [initAuth, isAuthenticated, navigate]);

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
      navigate('/profile', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Registration failed.');
    }
  };

  if (isLoading && !isAuthenticated) {
    return <Loader message="Preparing your account" />;
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="border border-white/10 bg-[#111111] p-6 sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">Private access</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white">Create your personal fitting suite.</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Register once to keep your style notes, measurements, and preferred silhouettes ready for every future try-on.
          </p>
          <div className="mt-8 space-y-3 border border-white/10 bg-black/20 p-4 text-sm text-white/70">
            <p className="font-semibold text-white">What you unlock</p>
            <p>Personalized wardrobe curation for your best outfits.</p>
            <p>Measurements and fit preferences stay attached to each fitting.</p>
          </div>
        </section>

        <section className="border border-white/10 bg-[#111111] p-6 sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">Register</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white">Build your account</h2>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {error ? <p className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

            <div>
              <label htmlFor="register-name" className="mb-2 block text-sm text-white/80">Full name</label>
              <input
                id="register-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-[2px] border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent"
                placeholder="Aarav Shrestha"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="mb-2 block text-sm text-white/80">Email</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-[2px] border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="mb-2 block text-sm text-white/80">Password</label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-[2px] border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent"
                placeholder="••••••••"
              />
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4].map((bar) => (
                  <span key={bar} className={`h-2 flex-1 ${bar <= strength ? 'bg-accent' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="register-confirm" className="mb-2 block text-sm text-white/80">Confirm password</label>
              <input
                id="register-confirm"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-[2px] border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent"
                placeholder="••••••••"
              />
            </div>

            <label className="flex items-center gap-3 border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
              <input
                type="checkbox"
                checked={agree}
                onChange={(event) => setAgree(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-transparent text-accent focus:ring-accent"
              />
              I agree to the privacy policy.
            </label>

            <Button loading={isLoading} className="w-full" type="submit">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-sm text-white/70">
            Already have an account?{' '}
            <Link to="/login" className="text-accent transition hover:underline">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
