import { useEffect, useMemo, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import Button from './Button';
import { useUserStore } from '@/store/useUserStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'signin' | 'signup';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithEmail, signInWithGoogle, signUp, isLoading } = useUserStore();
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setPassword('');
      setConfirmPassword('');
      setName('');
      setAgree(false);
    }
  }, [isOpen]);

  const strength = useMemo(() => passwordStrength(password), [password]);

  if (!isOpen) {
    return null;
  }

  const validateSignIn = (): string | null => {
    if (!isValidEmail(email)) {
      return 'Enter a valid email address.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    return null;
  };

  const validateSignUp = (): string | null => {
    if (name.trim().length < 2) {
      return 'Enter your full name.';
    }
    if (!isValidEmail(email)) {
      return 'Enter a valid email address.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    if (!agree) {
      return 'You must agree to the privacy policy.';
    }
    return null;
  };

  const handleSignIn = async () => {
    const validationError = validateSignIn();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    try {
      await signInWithEmail(email, password);
      onClose();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Sign in failed.');
    }
  };

  const handleSignUp = async () => {
    const validationError = validateSignUp();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    try {
      await signUp(email, password, name);
      onClose();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Sign up failed.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-3xl border border-white/10 bg-card p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent">AR Try On</p>
              <h2 id="auth-modal-title" className="font-display mt-2 text-3xl font-bold text-white">
                {tab === 'signin' ? 'Welcome back' : 'Create your account'}
              </h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5">
              Close
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 rounded-full border border-white/10 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setTab('signin')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tab === 'signin' ? 'bg-accent text-black' : 'text-white/70'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab('signup')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tab === 'signup' ? 'bg-accent text-black' : 'text-white/70'}`}
            >
              Sign Up
            </button>
          </div>

          {error ? <p className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

          <div className="mt-6 space-y-4">
            {tab === 'signup' ? (
              <div>
                <label htmlFor="name" className="mb-2 block text-sm text-white/80">
                  Full name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-accent"
                  placeholder="Aarav Shrestha"
                />
              </div>
            ) : null}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-white/80">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-accent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm text-white/80">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-accent"
                placeholder="••••••••"
              />
              {tab === 'signup' ? (
                <div className="mt-3 flex gap-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <span
                      key={bar}
                      className={`h-2 flex-1 rounded-full ${bar <= strength ? 'bg-accent' : 'bg-white/10'}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            {tab === 'signup' ? (
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm text-white/80">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-accent"
                  placeholder="••••••••"
                />
              </div>
            ) : null}

            {tab === 'signup' ? (
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(event) => setAgree(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-transparent text-accent focus:ring-accent"
                />
                I agree to the privacy policy.
              </label>
            ) : (
              <button type="button" className="text-sm text-accent hover:underline">
                Forgot password?
              </button>
            )}

            <Button loading={isLoading} className="w-full" onClick={() => void (tab === 'signin' ? handleSignIn() : handleSignUp())}>
              {tab === 'signin' ? 'Sign In' : 'Sign Up'}
            </Button>

            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/30">
              <span className="h-px flex-1 bg-white/10" />
              <span>or</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.01]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.95h5.6c-.24 1.3-1.12 3.02-5.6 3.02a6.55 6.55 0 1 1 0-13.1 5.8 5.8 0 0 1 4.1 1.6l2.8-2.7A10 10 0 1 0 12 22c5.9 0 9.8-3.8 9.8-9.2 0-.62-.06-1.12-.14-1.6H12Z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => setTab(tab === 'signin' ? 'signup' : 'signin')}
              className="w-full text-sm text-white/70 hover:text-white"
            >
              {tab === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
