import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useUserStore } from '@/store/useUserStore';

export default function Login() {
  const navigate = useNavigate();
  const { signInWithEmail, isLoading, isAuthenticated, initAuth } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile', { replace: true });
      return;
    }

    void initAuth();
  }, [initAuth, isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      await signInWithEmail(email.trim(), password);
      navigate('/profile', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Login failed.');
    }
  };

  if (isLoading && !isAuthenticated) {
    return <Loader message="Checking your account" />;
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="border border-white/10 bg-[#111111] p-6 sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">Secure access</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white">Welcome back to your fitting room.</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Sign in to access your saved looks, preferred measurements, and fitted wardrobe notes.
          </p>
          <div className="mt-8 space-y-3 border border-white/10 bg-black/20 p-4 text-sm text-white/70">
            <p className="font-semibold text-white">Why it matters</p>
            <p>Every try-on stays aligned with your saved preferences and fit profile.</p>
            <p>Switch between looks without losing your session or wardrobe rhythm.</p>
          </div>
        </section>

        <section className="border border-white/10 bg-[#111111] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">Sign in</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-white">Continue your fitting journey</h2>
            </div>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {error ? <p className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm text-white/80">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-[2px] border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm text-white/80">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-[2px] border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent"
                placeholder="••••••••"
              />
            </div>

            <Button loading={isLoading} className="w-full" type="submit">
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-sm text-white/70">
            New here?{' '}
            <Link to="/register" className="text-accent transition hover:underline">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
