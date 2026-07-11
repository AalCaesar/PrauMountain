'use client';

import { useState } from 'react';
import { Calendar, Users, CreditCard, Eye, Check, X, Loader2, Clock } from 'lucide-react';
import { updateBookingStatus, cancelBooking } from '../actions';

interface BookingTableProps {
  bookings: any[];
}

export default function BookingTable({ bookings }: BookingTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Check className="h-3 w-3 mr-1" />
          Lunas
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </span>
    );
  };

  const getBookingStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
      PENDING_PAYMENT: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Disetujui', className: 'bg-blue-100 text-blue-800' },
      CHECKED_IN: { label: 'Check-in', className: 'bg-indigo-100 text-indigo-800' },
      CHECKED_OUT: { label: 'Selesai', className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Ditolak/Batal', className: 'bg-red-100 text-red-800' },
      EXPIRED: { label: 'Kadaluarsa', className: 'bg-gray-100 text-gray-800' },
    };

    const badge = badges[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const handleStatusChange = async (bookingId: string, newStatus: any) => {
    setLoadingId(bookingId);
    try {
      const result = await updateBookingStatus(bookingId, newStatus);
      if (result.success) {
        // Success - revalidation will update the UI
      } else {
        alert(`Gagal mengubah status: ${result.error}`);
      }
    } catch (error) {
      console.error('Error changing status:', error);
      alert('Terjadi kesalahan saat mengubah status');
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancel = async (bookingId: string) => {
    setLoadingId(bookingId);
    try {
      const result = await cancelBooking(bookingId);
      if (result.success) {
        // Success - revalidation will update the UI
      } else {
        alert(`Gagal membatalkan booking: ${result.error}`);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Terjadi kesalahan saat membatalkan booking');
    } finally {
      setLoadingId(null);
    }
  };

  const canApprove = (booking: any) => {
    return booking.status_booking === 'PENDING_PAYMENT' && booking.paid_at;
  };

  const canCancel = (booking: any) => {
    return ['PENDING_PAYMENT', 'CONFIRMED'].includes(booking.status_booking);
  };

  const canCheckIn = (booking: any) => {
    return booking.status_booking === 'CONFIRMED';
  };

  const canCheckOut = (booking: any) => {
    return booking.status_booking === 'CHECKED_IN';
  };

  if (bookings.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Booking</h3>
          <p className="text-gray-600">
            Belum ada booking yang masuk untuk basecamp Anda. Booking akan muncul di sini setelah pendaki melakukan pemesanan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID Booking
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pendaki
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Jalur & Tanggal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Jumlah
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Harga
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pembayaran
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-mono text-gray-900">{shortenId(booking.id)}</div>
                <div className="text-xs text-gray-500">{formatDate(booking.created_at)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {booking.users?.nama_lengkap || 'N/A'}
                </div>
                <div className="text-xs text-gray-500">{booking.users?.email}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {booking.jalur_pendakian?.nama_jalur || 'N/A'}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(booking.tanggal_pendakian)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1 text-sm text-gray-900">
                  <Users className="h-4 w-4 text-gray-400" />
                  {booking.jumlah_anggota} orang
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  {formatPrice(booking.total_harga)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getPaymentStatusBadge(booking.paid_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getBookingStatusBadge(booking.status_booking)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  {loadingId === booking.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <>
                      {canApprove(booking) && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 transition-colors"
                          title="Setujui"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Setujui
                        </button>
                      )}
                      {canCheckIn(booking) && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'CHECKED_IN')}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                          title="Check-in"
                        >
                          Check-in
                        </button>
                      )}
                      {canCheckOut(booking) && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'CHECKED_OUT')}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors"
                          title="Check-out"
                        >
                          Check-out
                        </button>
                      )}
                      {canCancel(booking) && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
                          title="Tolak/Batal"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Tolak
                        </button>
                      )}
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
