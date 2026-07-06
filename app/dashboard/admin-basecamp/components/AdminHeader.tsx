'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, User } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface AdminHeaderProps {
  userName: string | null;
  userEmail: string;
  onMenuToggle: () => void;
}

export default function AdminHeader({ userName, userEmail, onMenuToggle }: AdminHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');
    if (!confirmLogout) return;

    setIsLoggingOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
        alert('Gagal logout. Silakan coba lagi.');
        setIsLoggingOut(false);
        return;
      }

      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>

        {/* Left: Desktop breadcrumb or title (optional) */}
        <div className="hidden lg:block">
          <h2 className="text-lg font-semibold text-gray-900">Dashboard Admin Basecamp</h2>
        </div>

        {/* Right: User info and logout */}
        <div className="flex items-center gap-3">
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {userName || userEmail}
              </p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>

            {/* Role badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full">
              <User className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-700 hidden sm:inline">
                Admin Basecamp
              </span>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isLoggingOut ? 'Keluar...' : 'Keluar'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
