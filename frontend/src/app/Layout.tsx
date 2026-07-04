import { Link, NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/tryon', label: 'Try On' },
  { to: '/community', label: 'Community' },
  { to: '/profile', label: 'Profile' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg text-offwhite selection:bg-accent selection:text-bg">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-bg/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-[0.24em] text-offwhite transition-opacity hover:opacity-90">
            <span>AR TryOn Nepal</span>
            <span className="border border-accent/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-accent">
              Luxury Edition
            </span>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] transition-colors ${
                    isActive ? 'text-accent' : 'text-white/70 hover:text-offwhite'
                  }`
                }
              >
                {({ isActive }) => (
                  <span className="relative">
                    <span>{item.label}</span>
                    {isActive ? <span className="absolute inset-x-0 -bottom-1 h-px bg-accent" /> : null}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:hidden">
            <Link to="/tryon" className="border border-accent/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              Try On
            </Link>
          </div>
        </div>
      </header>
      <main className="relative z-10 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
