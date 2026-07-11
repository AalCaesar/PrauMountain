'use client';

import { useState, useMemo } from 'react';
import BookingTable from './BookingTable';
import { BookingWithRelations } from '@/types/database';

interface BookingManagerProps {
  bookingsData: any[];
}

type TabFilter = 'semua' | 'menunggu' | 'disetujui' | 'selesai';

export default function BookingManager({ bookingsData }: BookingManagerProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>('semua');

  const filteredBookings = useMemo(() => {
    if (activeTab === 'semua') {
      return bookingsData;
    }

    return bookingsData.filter((booking) => {
      switch (activeTab) {
        case 'menunggu':
          return booking.status_booking === 'PENDING_PAYMENT' || booking.status_booking === 'DRAFT';
        case 'disetujui':
          return booking.status_booking === 'CONFIRMED' || booking.status_booking === 'CHECKED_IN';
        case 'selesai':
          return booking.status_booking === 'CHECKED_OUT';
        default:
          return true;
      }
    });
  }, [bookingsData, activeTab]);

  const counts = useMemo(() => {
    return {
      semua: bookingsData.length,
      menunggu: bookingsData.filter(
        (b) => b.status_booking === 'PENDING_PAYMENT' || b.status_booking === 'DRAFT'
      ).length,
      disetujui: bookingsData.filter(
        (b) => b.status_booking === 'CONFIRMED' || b.status_booking === 'CHECKED_IN'
      ).length,
      selesai: bookingsData.filter((b) => b.status_booking === 'CHECKED_OUT').length,
    };
  }, [bookingsData]);

  const tabs: { id: TabFilter; label: string }[] = [
    { id: 'semua', label: 'Semua' },
    { id: 'menunggu', label: 'Menunggu' },
    { id: 'disetujui', label: 'Disetujui' },
    { id: 'selesai', label: 'Selesai' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = counts[tab.id];

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors
                    ${
                      isActive
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                  <span
                    className={`
                      ml-2 py-0.5 px-2 rounded-full text-xs
                      ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-gray-100 text-gray-600'
                      }
                    `}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <BookingTable bookings={filteredBookings} />
      </div>
    </div>
  );
}
