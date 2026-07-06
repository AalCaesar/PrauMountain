'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mountain, Menu, X, LogIn, UserPlus } from 'lucide-react';

export default function DynamicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Mountain
              className={`h-8 w-8 transition-colors ${
                isScrolled ? 'text-emerald-600' : 'text-white'
              } group-hover:text-emerald-500`}
            />
            <span
              className={`text-xl font-bold transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}
            >
              PrauMountain
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/basecamps"
              className={`text-sm font-medium transition-colors hover:text-emerald-500 ${
                isScrolled ? 'text-gray-700' : 'text-white/90'
              }`}
            >
              Jelajahi Basecamp
            </Link>
            <Link
              href="/tentang"
              className={`text-sm font-medium transition-colors hover:text-emerald-500 ${
                isScrolled ? 'text-gray-700' : 'text-white/90'
              }`}
            >
              Tentang Kami
            </Link>

            <div className="flex items-center gap-3 ml-4">
              <Link
                href="/login"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isScrolled
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <LogIn className="h-4 w-4" />
                Masuk
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-medium hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
              >
                <UserPlus className="h-4 w-4" />
                Daftar
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
            }`}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/basecamps"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Jelajahi Basecamp
            </Link>
            <Link
              href="/tentang"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tentang Kami
            </Link>
            <div className="pt-3 space-y-2 border-t border-gray-200">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LogIn className="h-4 w-4" />
                Masuk
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserPlus className="h-4 w-4" />
                Daftar
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
