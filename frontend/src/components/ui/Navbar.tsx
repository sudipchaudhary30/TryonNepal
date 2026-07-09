// import { Link, NavLink } from 'react-router-dom';

// const navItems = [
//   { to: '/', label: 'Home' },
//   { to: '/tryon', label: 'TryOn' },
//   { to: '/community', label: 'Community' },
// ];

// export default function Navbar() {
//   return (
//     <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md">
//       <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
//         <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-widest text-white transition-opacity hover:opacity-90">
//           <span>AR TryOn Nepal</span>
//         </Link>

//         <nav className="hidden items-center gap-8 md:flex">
//           {navItems.map((item) => (
//             <NavLink
//               key={item.to}
//               to={item.to}
//               className={({ isActive }) =>
//                 `text-sm font-medium transition-colors hover:text-white ${isActive ? 'text-white border-b-2 border-[#8B5CF6] pb-1' : 'text-gray-400'
//                 }`
//               }
//             >
//               {item.label}
//             </NavLink>
//           ))}
//         </nav>

//         <div className="flex items-center gap-6 text-gray-300">
//           <Link to="/register" className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-6 py-2 rounded-none font-medium transition-colors text-sm">
//             Register
//           </Link>
//         </div>
//       </div>
//     </header>
//   );
// }

import { Link, NavLink } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';

export default function Navbar() {
  const { isAuthenticated, user, signOut } = useUserStore();

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/tryon', label: 'Try-On' },
    { to: '/community', label: 'Community' },
    ...(isAuthenticated ? [{ to: '/wardrobe', label: 'Wardrobe' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#F5F1E8]/10 bg-[#0B1220]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="font-display flex items-center gap-2 text-xl font-bold tracking-widest text-[#F5F1E8] transition-opacity hover:opacity-90"
        >
          <span>AR TryOn Nepal</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `font-mono-label text-xs uppercase tracking-widest transition-colors hover:text-[#F5F1E8] ${
                  isActive ? 'border-b-2 border-[#D4A017] pb-1 text-[#F5F1E8]' : 'text-[#9AA3B5]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="font-mono-label text-xs uppercase tracking-widest text-[#9AA3B5] hover:text-[#F5F1E8] transition-colors"
              >
                Profile ({user?.name || 'User'})
              </Link>
              <button
                onClick={() => void signOut()}
                className="rounded-none border border-[#F5F1E8]/10 bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#9AA3B5] hover:border-[#C8102E] hover:text-[#C8102E] transition-all"
              >
                Log Out
              </button>
            </div>
          ) : (
            <Link
              to="/register"
              className="rounded-none bg-[#C8102E] px-6 py-2.5 text-sm font-bold text-[#F5F1E8] transition-transform hover:scale-[1.03]"
            >
              Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}