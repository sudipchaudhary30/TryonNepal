import { useEffect } from 'react';

import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useUserStore } from '@/store/useUserStore';

export default function Profile() {
  const { user, isLoading, isAuthenticated, signOut, initAuth } = useUserStore();

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  if (isLoading && !user) {
    return <Loader message="Loading profile" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full border border-white/10 bg-[#111111] p-6 sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">Private suite</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white">Your fitting room is waiting.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
            Sign in or create an account to save your preferred silhouettes, measurements, and favorite wardrobe picks.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => window.location.assign('/login')}>
              Sign In
            </Button>
            <Button variant="ghost" onClick={() => window.location.assign('/register')}>
              Create Account
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="border border-white/10 bg-[#111111] p-6 sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">Private suite</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white">Welcome back, {user.name.split(' ')[0]}.</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Your profile now carries the details that matter for smarter try-ons and more consistent style decisions.
          </p>
          <div className="mt-6 space-y-3 border border-white/10 bg-black/20 p-4 text-sm text-white/80">
            <p><span className="text-white/50">Name</span> — {user.name}</p>
            <p><span className="text-white/50">Email</span> — {user.email}</p>
            <p><span className="text-white/50">Height</span> — {user.heightCm ?? 'Not set'} cm</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="ghost" onClick={() => void signOut()}>
                Sign Out
              </Button>
              <Button onClick={() => void initAuth()}>
                Refresh Session
              </Button>
            </div>
          </div>
        </section>

        <section className="border border-white/10 bg-[#111111] p-6 sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">Membership</p>
          <h2 className="mt-3 font-display text-2xl font-bold text-white">A calm, curated capsule for your wardrobe.</h2>
          <div className="mt-6 space-y-3 text-sm text-white/70">
            <div className="border border-white/10 bg-black/20 p-4">
              <p className="font-semibold text-white">Selective fittings</p>
              <p className="mt-1">Save garments and revisit your best looks in one tailored space.</p>
            </div>
            <div className="border border-white/10 bg-black/20 p-4">
              <p className="font-semibold text-white">Precision styling</p>
              <p className="mt-1">Keep your measurements and fit preferences aligned with future try-ons.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
