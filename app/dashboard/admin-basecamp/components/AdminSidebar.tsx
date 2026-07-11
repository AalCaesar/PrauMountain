'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  CalendarDays,
  QrCode,
  Settings,
  X,
  Mountain
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard/admin-basecamp',
    icon: LayoutDashboard,
  },
  {
    name: 'Kelola Jalur',
    href: '/dashboard/admin-basecamp/jalur',
    icon: Map,
  },
  {
    name: 'Kelola Booking',
    href: '/dashboard/admin-basecamp/bookings',
    icon: CalendarDays,
  },
  {
    name: 'Scanner / Check-in',
    href: '/dashboard/admin-basecamp/scanner',
    icon: QrCode,
  },
  {
    name: 'Pengaturan Basecamp',
    href: '/dashboard/admin-basecamp/settings',
    icon: Settings,
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard/admin-basecamp') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Mountain className="h-8 w-8 text-emerald-600" />
              <div>
                <h1 className="font-bold text-gray-900">Prau Admin</h1>
                <p className="text-xs text-gray-500">Basecamp</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-colors duration-150
                        ${
                          active
                            ? 'bg-emerald-50 text-emerald-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 ${
                          active ? 'text-emerald-600' : 'text-gray-400'
                        }`}
                      />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800 font-medium mb-1">
                Admin Basecamp
              </p>
              <p className="text-xs text-blue-600">
                Kelola operasional pendakian basecamp Anda
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
