import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';

export default function Navbar() {
  const { isAuthenticated, user, signOut } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/tryon', label: 'Try-On' },
    { to: '/community', label: 'Community' },
    ...(isAuthenticated ? [{ to: '/wardrobe', label: 'Wardrobe' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#F5F1E8]/10 bg-[#0B1220]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="font-display flex items-center gap-2 text-lg sm:text-xl font-bold tracking-widest text-[#F5F1E8] transition-opacity hover:opacity-90"
          >
            <span className="hidden sm:inline">AR TryOn Nepal</span>
            <span className="sm:hidden">ARTryOn</span>
          </Link>

          {/* Desktop Navigation */}
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

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="font-mono-label text-xs uppercase tracking-widest text-[#9AA3B5] hover:text-[#F5F1E8] transition-colors"
                >
                  Edit Profile
                </Link>
                <button
                  onClick={() => void signOut()}
                  className="rounded-none border border-[#F5F1E8]/10 bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#9AA3B5] hover:border-[#C8102E] hover:text-[#C8102E] transition-all"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                to="/register"
                className="rounded-none bg-[#C8102E] px-6 py-2.5 text-sm font-bold text-[#F5F1E8] transition-transform hover:scale-[1.03]"
              >
                Sign Up
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden flex flex-col space-y-1.5 focus:outline-none"
            aria-label="Toggle menu"
          >
            <span
              className={`block h-0.5 w-6 bg-[#F5F1E8] transition-all duration-300 ${
                mobileMenuOpen ? 'translate-y-2 rotate-45' : ''
              }`}
            ></span>
            <span
              className={`block h-0.5 w-6 bg-[#F5F1E8] transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-0' : ''
              }`}
            ></span>
            <span
              className={`block h-0.5 w-6 bg-[#F5F1E8] transition-all duration-300 ${
                mobileMenuOpen ? '-translate-y-2 -rotate-45' : ''
              }`}
            ></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#F5F1E8]/10 bg-[#0B1220]/95 pb-4 animate-in fade-in slide-in-from-top duration-300">
            <nav className="flex flex-col space-y-1 pt-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `px-4 py-3 font-mono-label text-xs uppercase tracking-widest transition-colors ${
                      isActive
                        ? 'border-l-4 border-[#D4A017] bg-[#F5F1E8]/5 text-[#F5F1E8]'
                        : 'text-[#9AA3B5] hover:bg-[#F5F1E8]/5 hover:text-[#F5F1E8]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Auth Section */}
            <div className="border-t border-[#F5F1E8]/10 pt-4 mt-4 px-4">
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="px-4 py-2 text-xs uppercase tracking-widest text-[#9AA3B5] hover:text-[#F5F1E8] transition-colors"
                  >
                    Edit Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      closeMobileMenu();
                    }}
                    className="w-full rounded-none border border-[#C8102E] bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#C8102E] transition-all hover:bg-[#C8102E] hover:text-white"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="block w-full text-center rounded-none bg-[#C8102E] px-6 py-2.5 text-sm font-bold text-[#F5F1E8] transition-transform hover:scale-[1.03]"
                >
                  Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
