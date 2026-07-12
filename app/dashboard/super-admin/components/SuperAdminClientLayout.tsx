'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Mountain,
  Users,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function SuperAdminClientLayout({
  children,
  userData,
  handleLogout
}: {
  children: React.ReactNode;
  userData: { nama_lengkap: string; email: string };
  handleLogout: () => void;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // navigasi tanpa menu Settings sesuai permintaan (Tugas 2)
  const navigation = [
    { name: 'Dashboard', href: '/dashboard/super-admin', icon: LayoutDashboard },
    { name: 'Basecamps', href: '/dashboard/super-admin/basecamps', icon: Mountain },
    { name: 'Users', href: '/dashboard/super-admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 transition-opacity lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - responsive (Tugas 1) */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:shadow-none lg:border-r lg:border-gray-200 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center">
                <Mountain className="h-8 w-8 text-emerald-600 shrink-0" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Prau Admin
                </span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="group block w-full flex-shrink-0">
              <div className="flex items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userData.nama_lengkap || 'Super Admin'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userData.email}
                  </p>
                </div>
                <form action={handleLogout}>
                  <button
                    type="submit"
                    className="ml-3 p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main wrapper */}
      <div className="flex flex-col flex-1 w-full min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 hover:bg-gray-50 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1 items-center">
              <Mountain className="h-6 w-6 text-emerald-600" />
              <span className="ml-2 text-lg font-bold text-gray-900">
                Prau Admin
              </span>
            </div>
            <div className="flex items-center">
              <form action={handleLogout}>
                <button
                  type="submit"
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
