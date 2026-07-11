'use client';

import { useState } from 'react';
import { Calendar, Users, CreditCard, Eye, Check, X, Loader2, Clock, MapPin, Package, FileText } from 'lucide-react';
import { updateBookingStatus, cancelBooking } from '../actions';

interface BookingTableProps {
  bookings: any[];
}

export default function BookingTable({ bookings }: BookingTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const formatDateSafe = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatPriceSafe = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) return 'Rp 0';
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
                <div className="text-sm font-medium text-gray-900 break-words max-w-xs">
                  {booking.jalur_pendakian?.nama_jalur || 'N/A'} | {formatDateSafe(booking.tanggal_naik)} - {formatDateSafe(booking.tanggal_turun)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1 text-sm text-gray-900">
                  <Users className="h-4 w-4 text-gray-400" />
                  {booking.total_anggota || 0} orang
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  {formatPriceSafe(booking.total_biaya)}
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
                        onClick={() => setSelectedBooking(booking)}
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

      {/* MODAL DETAIL BOOKING */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Detail Booking</h2>
                  <p className="text-sm text-gray-500 font-mono">{selectedBooking?.kode_booking || shortenId(selectedBooking.id)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-8">
              {/* Info Utama */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div>{getBookingStatusBadge(selectedBooking?.status_booking)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Tanggal</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {formatDateSafe(selectedBooking?.tanggal_naik)} - {formatDateSafe(selectedBooking?.tanggal_turun)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Total Biaya</p>
                  <p className="font-semibold text-gray-900">
                    {formatPriceSafe(selectedBooking?.total_biaya)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Total Anggota</p>
                  <p className="font-semibold text-gray-900">
                    {selectedBooking?.total_anggota || 0} orang
                  </p>
                </div>
              </div>

              {/* Info Ketua */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Informasi Ketua Rombongan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                  <div>
                    <p className="text-sm text-gray-500">Nama Lengkap</p>
                    <p className="font-medium text-gray-900">{selectedBooking?.users?.nama_lengkap || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 break-all">{selectedBooking?.users?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nomor HP</p>
                    <p className="font-medium text-gray-900">{selectedBooking?.users?.nomor_hp || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Tabel Anggota */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Daftar Anggota
                </h3>
                <div className="overflow-hidden border border-gray-200 rounded-xl">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Anggota</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak Darurat</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(selectedBooking?.anggota_rombongan || []).length > 0 ? (
                        selectedBooking.anggota_rombongan.map((anggota: any, idx: number) => (
                          <tr key={anggota.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{anggota.nama_anggota}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 font-mono">{anggota.nik}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{anggota.kontak_darurat}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                            Tidak ada data anggota
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel Logistik */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-emerald-600" />
                  Logistik Bawaan
                </h3>
                <div className="overflow-hidden border border-gray-200 rounded-xl">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Barang</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Dibawa</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Cek</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(selectedBooking?.logistik_bawaan || []).length > 0 ? (
                        selectedBooking.logistik_bawaan.map((logistik: any) => (
                          <tr key={logistik.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{logistik.nama_barang}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{logistik.jumlah_dibawa}</td>
                            <td className="px-4 py-3 text-sm">
                              {logistik.status_pengecekan ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Sesuai</span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Belum Dicek</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">
                            Tidak ada data logistik
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
