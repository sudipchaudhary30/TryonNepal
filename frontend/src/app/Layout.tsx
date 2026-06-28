import { Link, NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/tryon', label: 'Try On' },
  { to: '/community', label: 'Community' },
  { to: '/wardrobe', label: 'Wardrobe' },
  { to: '/design', label: 'Design' },
  { to: '/showroom', label: 'Showroom' },
  { to: '/profile', label: 'Profile' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg text-white selection:bg-accent selection:text-black">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2 font-display text-xl font-extrabold tracking-widest text-white transition-opacity hover:opacity-90">
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">DressMesh</span>
            <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-black tracking-normal text-black shadow-md shadow-accent/20">NEPAL</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/5 bg-black/45 p-1 backdrop-blur-md">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-accent text-black shadow-lg shadow-accent/15'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          
          {/* Mobile navigation indicator */}
          <div className="sm:hidden flex items-center gap-2">
            <Link to="/tryon" className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-black">
              Try On
            </Link>
          </div>
        </div>
      </header>
      <main className="relative z-10 overflow-hidden">
        <Outlet />
      </main>
      
      {/* Footer / Decorative glow */}
      <div className="pointer-events-none fixed -top-[40%] left-[10%] z-0 h-[60%] w-[80%] rounded-full bg-accent/5 blur-[160px]" />
      <div className="pointer-events-none fixed -bottom-[40%] right-[10%] z-0 h-[60%] w-[80%] rounded-full bg-accent-warm/5 blur-[160px]" />
    </div>
  );
}
