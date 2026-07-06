'use client';

import { useState } from 'react';
import { User, MapPin, Calendar, Users, CreditCard, Check, Clock, LogIn, LogOut, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { processCheckIn, processCheckOut } from '../actions';

interface BookingResultProps {
  booking: any;
  onReset: () => void;
}

export default function BookingResult({ booking, onReset }: BookingResultProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const shortenId = (id: string) => {
    return id.slice(0, 8).toUpperCase();
  };

  const getPaymentStatusBadge = (paidAt: string | null) => {
    if (paidAt) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <Check className="h-4 w-4 mr-1" />
          Lunas
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        <Clock className="h-4 w-4 mr-1" />
        Pending
      </span>
    );
  };

  const getBookingStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: any }> = {
      DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-800', icon: Clock },
      PENDING_PAYMENT: { label: 'Menunggu Pembayaran', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      CONFIRMED: { label: 'Dikonfirmasi', className: 'bg-blue-100 text-blue-800', icon: Check },
      CHECKED_IN: { label: 'Sedang Mendaki', className: 'bg-indigo-100 text-indigo-800', icon: LogIn },
      CHECKED_OUT: { label: 'Selesai', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      CANCELLED: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800', icon: AlertCircle },
      EXPIRED: { label: 'Kadaluarsa', className: 'bg-gray-100 text-gray-800', icon: Clock },
    };

    const badge = badges[status] || { label: status, className: 'bg-gray-100 text-gray-800', icon: Clock };
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
        <Icon className="h-4 w-4 mr-1" />
        {badge.label}
      </span>
    );
  };

  const handleCheckIn = async () => {
    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await processCheckIn(booking.id);

      if (result.success) {
        setSuccess('Check-in berhasil! Pendaki telah masuk ke jalur pendakian.');
        setTimeout(() => {
          onReset();
        }, 2000);
      } else {
        setError(result.error || 'Gagal melakukan check-in');
      }
    } catch (err) {
      console.error('Error during check-in:', err);
      setError('Terjadi kesalahan saat proses check-in');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await processCheckOut(booking.id);

      if (result.success) {
        setSuccess('Check-out berhasil! Pendaki telah selesai mendaki dengan selamat.');
        setTimeout(() => {
          onReset();
        }, 2000);
      } else {
        setError(result.error || 'Gagal melakukan check-out');
      }
    } catch (err) {
      console.error('Error during check-out:', err);
      setError('Terjadi kesalahan saat proses check-out');
    } finally {
      setProcessing(false);
    }
  };

  const canCheckIn = booking.status === 'CONFIRMED' && booking.paid_at;
  const canCheckOut = booking.status === 'CHECKED_IN';
  const isPaymentPending = !booking.paid_at;
  const isCancelled = booking.status === 'CANCELLED';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Detail Booking</h2>
        <p className="text-emerald-100 text-sm mt-1">ID: {shortenId(booking.id)}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">Berhasil!</h3>
                <p className="mt-1 text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hiker Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Informasi Pendaki</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {booking.users?.nama_lengkap || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">{booking.users?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trail Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Informasi Jalur</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <p className="text-sm font-medium text-gray-900">
                {booking.jalur_pendakian?.nama_jalur || 'N/A'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <p className="text-sm text-gray-900">{formatDate(booking.tanggal_pendakian)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <p className="text-sm text-gray-900">{booking.jumlah_anggota} orang</p>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <p className="text-sm font-semibold text-gray-900">{formatPrice(booking.total_harga)}</p>
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Status</h3>
          <div className="flex flex-wrap gap-3">
            {getPaymentStatusBadge(booking.paid_at)}
            {getBookingStatusBadge(booking.status)}
          </div>
        </div>

        {/* Warning Messages */}
        {isPaymentPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Pembayaran Belum Lunas</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Check-in tidak dapat dilakukan karena pembayaran belum dikonfirmasi.
                </p>
              </div>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Booking Dibatalkan</h3>
                <p className="mt-1 text-sm text-red-700">
                  Booking ini telah dibatalkan dan tidak dapat diproses.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {canCheckIn && (
            <button
              onClick={handleCheckIn}
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Proses Check-in
                </>
              )}
            </button>
          )}

          {canCheckOut && (
            <button
              onClick={handleCheckOut}
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <LogOut className="h-5 w-5" />
                  Proses Check-out
                </>
              )}
            </button>
          )}

          <button
            onClick={onReset}
            disabled={processing}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="h-5 w-5" />
            Scan Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
