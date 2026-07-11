'use client';

import { useState } from 'react';
import { Camera, Keyboard, RefreshCw } from 'lucide-react';
import QRReader from './QRReader';
import BookingResult from './BookingResult';
import { getBookingByCode } from '../actions';

type ScanMode = 'camera' | 'manual';

export default function ScannerManager() {
  const [mode, setMode] = useState<ScanMode>('manual');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (bookingId: string) => {
    if (!bookingId || !bookingId.trim()) {
      setError('Booking ID tidak boleh kosong');
      return;
    }

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const result = await getBookingByCode(bookingId.trim());

      if (result.success && result.data) {
        setBooking(result.data);
        setError(null);
      } else {
        setError(result.error || 'Booking tidak ditemukan');
        setBooking(null);
      }
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('Terjadi kesalahan saat mencari booking');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBooking(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Mode Scanner</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('manual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'manual'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Keyboard className="h-4 w-4" />
              Manual
            </button>
            <button
              onClick={() => setMode('camera')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'camera'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Camera className="h-4 w-4" />
              Kamera
            </button>
          </div>
        </div>

        {/* QR Reader Component */}
        <QRReader mode={mode} onScan={handleScan} loading={loading} />
      </div>

      {/* Error Display */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={handleReset}
              className="flex-shrink-0 text-red-600 hover:text-red-800 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Booking Result */}
      {booking && !loading && (
        <BookingResult booking={booking} onReset={handleReset} />
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-gray-600">Mencari booking...</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!booking && !loading && !error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Petunjuk Penggunaan</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li><strong>Mode Kamera:</strong> Arahkan kamera ke QR code pada tiket booking pendaki</li>
            <li><strong>Mode Manual:</strong> Masukkan ID booking secara manual jika kamera tidak tersedia</li>
            <li>Pastikan booking sudah dikonfirmasi (payment lunas) sebelum check-in</li>
            <li>Check-out hanya bisa dilakukan setelah pendaki check-in</li>
          </ul>
        </div>
      )}
    </div>
  );
}
