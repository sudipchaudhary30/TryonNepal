import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Ruler, LogOut, RefreshCw, Layers, Sliders, ArrowRight, ShieldCheck } from 'lucide-react';

import Loader from '@/components/ui/Loader';
import { useUserStore } from '@/store/useUserStore';

export default function Profile() {
  const { user, isLoading, isAuthenticated, signOut, initAuth } = useUserStore();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  if (isLoading && !user) {
    return <Loader message="Loading profile" />;
  }

  // ── Not authenticated ──────────────────────────────────────────────────────
  if (!isAuthenticated || !user) {
    return (
      <div className="relative min-h-[calc(100vh-5rem)] bg-[#0B1220] text-[#F5F1E8] flex items-center justify-center px-4 py-16">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#C8102E]/8 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[#D4A017]/5 blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md border border-[#F5F1E8]/10 bg-[#131B2E] p-10 shadow-2xl"
        >
          <div className="mb-1 h-0.5 w-10 bg-[#C8102E]" />
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#D4A017]">Private Suite</p>
          <h1 className="mt-2 font-display text-3xl font-black text-[#F5F1E8]">Your fitting room is waiting.</h1>
          <p className="mt-4 text-sm leading-relaxed text-[#9AA3B5]">
            Sign in or create an account to save preferred silhouettes, measurements, and wardrobe picks.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 bg-[#C8102E] py-3 text-sm font-bold uppercase tracking-widest text-[#F5F1E8] transition-all hover:brightness-110"
            >
              Sign In <ArrowRight size={14} />
            </Link>
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 border border-[#F5F1E8]/10 py-3 text-sm font-bold uppercase tracking-widest text-[#9AA3B5] transition-all hover:border-[#F5F1E8]/20 hover:text-[#F5F1E8]"
            >
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Authenticated ──────────────────────────────────────────────────────────
  const firstName = user.name.split(' ')[0];

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] bg-[#0B1220] text-[#F5F1E8]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#C8102E]/8 blur-[120px]" />
        <div className="absolute top-1/2 right-0 h-80 w-80 rounded-full bg-[#D4A017]/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Page label */}
        <div className="mb-10 flex items-center gap-3">
          <div className="h-0.5 w-8 bg-[#C8102E]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4A017]">Private Suite</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">

          {/* ── Profile card ──────────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="border border-[#F5F1E8]/10 bg-[#131B2E] p-8"
          >
            {/* Avatar + name */}
            <div className="flex items-start gap-5 mb-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-[#D4A017]/30 bg-[#D4A017]/10 text-2xl font-black text-[#D4A017]">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-display text-3xl font-black text-[#F5F1E8] leading-tight">
                  Welcome back, {firstName}.
                </h1>
                <p className="mt-1 text-sm text-[#9AA3B5]">
                  Your profile carries the details that matter for smarter try-ons.
                </p>
              </div>
            </div>

            {/* Info rows */}
            <div className="space-y-3 mb-8">
              <InfoRow icon={<User size={14} />} label="Name" value={user.name} />
              <InfoRow icon={<Mail size={14} />} label="Email" value={user.email} />
              <InfoRow
                icon={<Ruler size={14} />}
                label="Height"
                value={user.heightCm ? `${user.heightCm} cm` : 'Not set'}
                muted={!user.heightCm}
              />
            </div>

            {/* Privacy badge */}
            <div className="mb-8 flex items-center gap-2 border border-[#D4A017]/20 bg-[#D4A017]/5 px-4 py-2.5">
              <ShieldCheck size={14} className="text-[#D4A017] shrink-0" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#D4A017]">
                On-device · Your data never leaves this browser
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => void handleSignOut()}
                disabled={signingOut}
                className="flex flex-1 items-center justify-center gap-2 border border-[#C8102E]/40 bg-[#C8102E]/10 py-3 text-xs font-bold uppercase tracking-widest text-[#C8102E] transition-all hover:bg-[#C8102E] hover:text-[#F5F1E8] disabled:opacity-50"
              >
                <LogOut size={14} />
                {signingOut ? 'Signing out...' : 'Sign Out'}
              </button>
              <button
                onClick={() => void initAuth()}
                className="flex flex-1 items-center justify-center gap-2 border border-[#F5F1E8]/10 py-3 text-xs font-bold uppercase tracking-widest text-[#9AA3B5] transition-all hover:border-[#F5F1E8]/20 hover:text-[#F5F1E8]"
              >
                <RefreshCw size={14} />
                Refresh Session
              </button>
            </div>
          </motion.section>

          {/* ── Right column ──────────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Membership header card */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border border-[#F5F1E8]/10 bg-[#131B2E] p-8"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8102E]">Membership</p>
              <h2 className="mt-2 font-display text-2xl font-black text-[#F5F1E8]">
                A calm, curated capsule for your wardrobe.
              </h2>
              <p className="mt-3 text-sm text-[#9AA3B5] leading-relaxed">
                Every preference you save brings your next try-on closer to perfect.
              </p>
            </motion.section>

            {/* Feature tiles */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              <FeatureTile
                icon={<Layers size={20} className="text-[#D4A017]" />}
                title="Selective Fittings"
                body="Save garments and revisit your best looks in one tailored space."
              />
              <FeatureTile
                icon={<Sliders size={20} className="text-[#C8102E]" />}
                title="Precision Styling"
                body="Keep measurements and fit preferences aligned with future try-ons."
              />
            </motion.div>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border border-[#F5F1E8]/10 bg-[#131B2E] p-6"
            >
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#9AA3B5]">Quick Access</p>
              <div className="flex flex-col gap-2">
                <QuickLink to="/wardrobe" label="My Wardrobe" sub="Your private garments" />
                <QuickLink to="/community" label="Community" sub="Browse shared clothes" />
                <QuickLink to="/tryon" label="AR Try-On" sub="Live fitting room" />
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function InfoRow({ icon, label, value, muted = false }: { icon: React.ReactNode; label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-3 border border-[#F5F1E8]/8 bg-[#0B1220]/50 px-4 py-3">
      <span className="shrink-0 text-[#9AA3B5]">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-wider text-[#9AA3B5] w-14 shrink-0">{label}</span>
      <span className={`text-sm font-semibold ${muted ? 'italic text-[#9AA3B5]/60' : 'text-[#F5F1E8]'}`}>{value}</span>
    </div>
  );
}

function FeatureTile({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="border border-[#F5F1E8]/10 bg-[#0B1220]/60 p-5 hover:border-[#D4A017]/30 transition-colors">
      <div className="mb-3">{icon}</div>
      <p className="text-sm font-bold text-[#F5F1E8]">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-[#9AA3B5]">{body}</p>
    </div>
  );
}

function QuickLink({ to, label, sub }: { to: string; label: string; sub: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between border border-transparent px-3 py-2.5 transition-all hover:border-[#F5F1E8]/10 hover:bg-[#F5F1E8]/3"
    >
      <div>
        <p className="text-sm font-semibold text-[#F5F1E8] group-hover:text-[#D4A017] transition-colors">{label}</p>
        <p className="text-[10px] text-[#9AA3B5]">{sub}</p>
      </div>
      <ArrowRight size={14} className="text-[#9AA3B5] group-hover:text-[#D4A017] transition-colors" />
    </Link>
  );
}
