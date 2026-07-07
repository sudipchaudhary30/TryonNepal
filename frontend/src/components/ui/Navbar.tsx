import { Link, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/tryon', label: 'TryOn' },
  { to: '/community', label: 'Community' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-widest text-white transition-opacity hover:opacity-90">
          <span>AR TryOn Nepal</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-white ${isActive ? 'text-white border-b-2 border-[#8B5CF6] pb-1' : 'text-gray-400'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-6 text-gray-300">
          <Link to="/register" className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-6 py-2 rounded-none font-medium transition-colors text-sm">
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
