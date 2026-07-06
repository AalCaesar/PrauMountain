'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Keyboard, Search, AlertCircle } from 'lucide-react';

interface QRReaderProps {
  mode: 'camera' | 'manual';
  onScan: (bookingId: string) => void;
  loading: boolean;
}

export default function QRReader({ mode, onScan, loading }: QRReaderProps) {
  const [manualInput, setManualInput] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerInitialized = useRef(false);

  useEffect(() => {
    if (mode === 'camera' && !scannerInitialized.current) {
      initializeScanner();
    }

    return () => {
      cleanupScanner();
    };
  }, [mode]);

  const initializeScanner = async () => {
    if (scannerInitialized.current || scannerRef.current) {
      return;
    }

    try {
      setCameraError(null);
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      scannerInitialized.current = true;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          if (decodedText && !loading) {
            setIsScanning(true);
            onScan(decodedText);
            setTimeout(() => setIsScanning(false), 2000);
          }
        },
        (errorMessage) => {
          // Ignore decode errors (when no QR code is visible)
        }
      );
    } catch (error: any) {
      console.error('Failed to start camera:', error);
      scannerInitialized.current = false;

      if (error.message?.includes('NotAllowedError') || error.message?.includes('Permission')) {
        setCameraError('Izin kamera ditolak. Silakan izinkan akses kamera di browser Anda.');
      } else if (error.message?.includes('NotFoundError')) {
        setCameraError('Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera.');
      } else {
        setCameraError('Gagal mengakses kamera. Gunakan mode manual sebagai alternatif.');
      }
    }
  };

  const cleanupScanner = async () => {
    if (scannerRef.current && scannerInitialized.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (error) {
        console.error('Error cleaning up scanner:', error);
      }
      scannerRef.current = null;
      scannerInitialized.current = false;
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim() && !loading) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  if (mode === 'camera') {
    return (
      <div className="space-y-4">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <div id="qr-reader" className="w-full" style={{ minHeight: '300px' }} />

          {isScanning && (
            <div className="absolute inset-0 bg-emerald-500 bg-opacity-20 flex items-center justify-center">
              <div className="bg-white rounded-lg px-6 py-3 shadow-lg">
                <p className="text-emerald-600 font-semibold">QR Code terdeteksi!</p>
              </div>
            </div>
          )}
        </div>

        {cameraError && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800">Perhatian</h3>
                <p className="mt-1 text-sm text-amber-700">{cameraError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Camera className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800">Tips Scanning</h3>
              <ul className="mt-1 text-sm text-blue-700 space-y-1">
                <li>• Arahkan kamera ke QR code pada tiket</li>
                <li>• Pastikan QR code terlihat jelas dan tidak blur</li>
                <li>• Hindari pantulan cahaya pada QR code</li>
                <li>• Jarak optimal: 10-30 cm dari kamera</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleManualSubmit} className="space-y-4">
        <div>
          <label htmlFor="booking-id" className="block text-sm font-medium text-gray-700 mb-2">
            Booking ID
          </label>
          <div className="relative">
            <input
              type="text"
              id="booking-id"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Masukkan ID booking (contoh: abc123...)"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Keyboard className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Masukkan ID booking yang diberikan kepada pendaki
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !manualInput.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
        >
          <Search className="h-5 w-5" />
          {loading ? 'Mencari...' : 'Cari Booking'}
        </button>
      </form>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Keyboard className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-800">Mode Manual</h3>
            <p className="mt-1 text-sm text-gray-600">
              Gunakan mode ini jika kamera tidak tersedia atau QR code rusak.
              Minta pendaki untuk memberikan ID booking yang ada di email konfirmasi mereka.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
