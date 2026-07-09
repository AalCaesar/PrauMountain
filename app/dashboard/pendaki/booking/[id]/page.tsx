import { createClient } from '@/utils/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import PaymentButton from './components/PaymentButton';
import TicketGenerator from './components/TicketGenerator';
import {
  Calendar,
  CreditCard,
  Users,
  Mountain,
  MapPin,
  Package,
  User,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Ticket,
} from 'lucide-react';

interface BookingDetail {
  id: string;
  kode_booking: string;
  tanggal_naik: string;
  tanggal_turun: string;
  total_anggota: number;
  total_biaya: number;
  status_booking: string;
  created_at: string;
  jalur_pendakian: {
    nama_jalur: string;
    deskripsi: string;
    tingkat_kesulitan: string;
    basecamps: {
      nama_gunung: string;
      nama_basecamp: string;
      lokasi: string;
    };
  };
  anggota_rombongan: Array<{
    nama_anggota: string;
    nik: string;
    kontak_darurat: string;
  }>;
  logistik_bawaan: Array<{
    nama_barang: string;
    jumlah_dibawa: number;
  }>;
}

async function getBookingDetail(bookingId: string, userId: string): Promise<BookingDetail | null> {
  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      id,
      kode_booking,
      tanggal_naik,
      tanggal_turun,
      total_anggota,
      total_biaya,
      status_booking,
      created_at,
      jalur_pendakian (
        nama_jalur,
        deskripsi,
        tingkat_kesulitan,
        basecamps (
          nama_gunung,
          nama_basecamp,
          lokasi
        )
      ),
      anggota_rombongan (
        nama_anggota,
        nik,
        kontak_darurat
      ),
      logistik_bawaan (
        nama_barang,
        jumlah_dibawa
      )
    `)
    .eq('id', bookingId)
    .eq('user_id', userId)
    .single();

  if (error || !booking) {
    return null;
  }

  return booking as any;
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    'PENDING_PAYMENT': {
      label: 'Menunggu Pembayaran',
      color: 'bg-amber-100 text-amber-700 border-amber-300',
      icon: Clock,
    },
    'CONFIRMED': {
      label: 'Terkonfirmasi',
      color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      icon: CheckCircle,
    },
    'CHECKED_IN': {
      label: 'Sudah Check-in',
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      icon: CheckCircle,
    },
    'CHECKED_OUT': {
      label: 'Selesai',
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: CheckCircle,
    },
    'CANCELLED': {
      label: 'Dibatalkan',
      color: 'bg-red-100 text-red-700 border-red-300',
      icon: XCircle,
    },
    'EXPIRED': {
      label: 'Kadaluarsa',
      color: 'bg-gray-100 text-gray-500 border-gray-300',
      icon: AlertCircle,
    },
  };

  const config = statusConfig[status] || statusConfig['PENDING_PAYMENT'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border ${config.color}`}>
      <Icon className="h-4 w-4" />
      {config.label}
    </span>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getDifficultyBadge(difficulty: string) {
  const difficultyConfig: Record<string, { label: string; color: string }> = {
    'mudah': { label: 'Mudah', color: 'bg-green-100 text-green-700 border-green-300' },
    'sedang': { label: 'Sedang', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    'sulit': { label: 'Sulit', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    'ekstrem': { label: 'Ekstrem', color: 'bg-red-100 text-red-700 border-red-300' },
  };

  const config = difficultyConfig[difficulty] || difficultyConfig['sedang'];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const booking = await getBookingDetail(id, user.id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <Link
            href="/dashboard/pendaki"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Kembali ke Dashboard
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Detail Booking</h1>
              <p className="text-gray-600">Informasi lengkap tentang booking Anda</p>
            </div>
            {getStatusBadge(booking.status_booking)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Booking Code Card */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-4 md:p-8 mb-8 text-white">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-emerald-100 text-sm font-medium mb-2">Kode Booking</p>
              <p className="text-2xl sm:text-4xl font-bold font-mono break-all">{booking.kode_booking}</p>
              <p className="text-emerald-100 text-sm mt-2">
                Dibuat pada {formatDate(booking.created_at)}
              </p>
            </div>
            <div className="p-3 md:p-4 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
              <Ticket className="h-8 w-8 md:h-12 md:w-12" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mountain & Trail Info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mountain className="h-6 w-6 text-emerald-600" />
                Informasi Jalur Pendakian
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gunung</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {booking.jalur_pendakian.basecamps.nama_gunung}
                  </p>
                </div>
                <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Basecamp</p>
                    <p className="font-semibold text-gray-900 break-words">
                      {booking.jalur_pendakian.basecamps.nama_basecamp}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Jalur</p>
                    <p className="font-semibold text-gray-900 break-words">
                      {booking.jalur_pendakian.nama_jalur}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Lokasi</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-900">{booking.jalur_pendakian.basecamps.lokasi}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Tingkat Kesulitan</p>
                  {getDifficultyBadge(booking.jalur_pendakian.tingkat_kesulitan)}
                </div>
                {booking.jalur_pendakian.deskripsi && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Deskripsi</p>
                    <p className="text-gray-700 leading-relaxed">
                      {booking.jalur_pendakian.deskripsi}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Hikers List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-emerald-600" />
                Anggota Rombongan ({booking.total_anggota} Orang)
              </h2>
              <div className="space-y-4">
                {booking.anggota_rombongan.map((anggota, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <User className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 break-words">
                            {anggota.nama_anggota}
                          </h3>
                          {index === 0 && (
                            <span className="text-xs text-emerald-600 font-medium">
                              Ketua Rombongan
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">NIK</p>
                        <p className="font-mono font-semibold text-gray-900 break-all">{anggota.nik}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Kontak Darurat</p>
                        <p className="font-semibold text-gray-900 break-words">{anggota.kontak_darurat}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logistics */}
            {booking.logistik_bawaan.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-6 w-6 text-emerald-600" />
                  Logistik Bawaan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {booking.logistik_bawaan.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 break-words">{item.nama_barang}</span>
                      <span className="font-semibold text-gray-900 flex-shrink-0 ml-2">{item.jumlah_dibawa} unit</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Date Info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                Jadwal Pendakian
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tanggal Naik</p>
                  <p className="font-semibold text-gray-900">{formatDate(booking.tanggal_naik)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tanggal Turun</p>
                  <p className="font-semibold text-gray-900">{formatDate(booking.tanggal_turun)}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border-2 border-emerald-500 shadow-lg p-4 md:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                Rincian Biaya
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Jumlah Pendaki</span>
                  <span className="font-medium text-gray-900">{booking.total_anggota} orang</span>
                </div>
                <div className="border-t-2 border-emerald-300 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600 break-words">
                    {formatPrice(booking.total_biaya)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Actions */}
            {booking.status_booking === 'PENDING_PAYMENT' && (
              <PaymentButton
                bookingId={booking.id}
                bookingCode={booking.kode_booking}
              />
            )}

            {/* E-Ticket Download */}
            {(booking.status_booking === 'CONFIRMED' ||
              booking.status_booking === 'CHECKED_IN' ||
              booking.status_booking === 'CHECKED_OUT') && (
                <TicketGenerator
                  bookingData={{
                    bookingCode: booking.kode_booking,
                    leaderName: booking.anggota_rombongan[0]?.nama_anggota || 'N/A',
                    totalMembers: booking.total_anggota,
                    hikingDate: booking.tanggal_naik,
                    pathName: booking.jalur_pendakian.nama_jalur,
                    mountainName: booking.jalur_pendakian.basecamps.nama_gunung,
                    basecampName: booking.jalur_pendakian.basecamps.nama_basecamp,
                  }}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
