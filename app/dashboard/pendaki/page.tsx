import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  CreditCard,
  Users,
  Mountain,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ticket,
  ArrowRight,
  Flag
} from 'lucide-react';

interface Booking {
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
    basecamps: {
      nama_gunung: string;
      nama_basecamp: string;
    };
  };
  anggota_rombongan: Array<{
    nama_anggota: string;
  }>;
  logistik_bawaan: Array<{
    nama_barang: string;
    jumlah_dibawa: number;
  }>;
}

async function getUserBookings(userId: string): Promise<Booking[]> {
  const supabase = await createClient();

  const { data: bookings, error } = await supabase
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
        basecamps (
          nama_gunung,
          nama_basecamp
        )
      ),
      anggota_rombongan (
        nama_anggota
      ),
      logistik_bawaan (
        nama_barang,
        jumlah_dibawa
      )
    `)
    .eq('user_id', userId)
    .not('status_booking', 'in', '("CANCELLED","EXPIRED")')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }

  return (bookings as any) || [];
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
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
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

export default async function PendakiDashboard() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('nama_lengkap')
    .eq('id', user.id)
    .single();

  const displayName = profile?.nama_lengkap || user.email;

  const bookings = await getUserBookings(user.id);
  const selesaiCount = (bookings || []).filter(b => b.status_booking === 'CHECKED_OUT').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                Dashboard Pendaki
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Selamat datang, <span className="font-medium text-emerald-600">{displayName}</span>
              </p>
            </div>
            <Link
              href="/#jelajahi"
              className="px-4 py-2 md:px-6 md:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm md:text-base"
            >
              <Mountain className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Jelajahi Basecamp</span>
              <span className="sm:hidden">Jelajahi</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Ticket className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Booking</p>
                <p className="text-2xl font-bold text-gray-900">{(bookings || []).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-amber-100 rounded-xl">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Menunggu Pembayaran</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(bookings || []).filter(b => b.status_booking === 'PENDING_PAYMENT').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-blue-100 rounded-xl">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Terkonfirmasi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(bookings || []).filter(b => b.status_booking === 'CONFIRMED' || b.status_booking === 'CHECKED_IN').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-emerald-100 rounded-xl">
                <Flag className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendakian Selesai</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selesaiCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Riwayat Booking</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">Lihat semua pendakian yang pernah Anda booking</p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 shadow-sm p-8 md:p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full mb-4 md:mb-6">
              <Mountain className="h-8 w-8 md:h-10 md:w-10 text-gray-400" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Belum Ada Riwayat Pendakian
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 max-w-md mx-auto">
              Anda belum pernah melakukan booking pendakian. Mulai petualangan Anda dengan memilih gunung dan jalur favorit!
            </p>
            <Link
              href="/#jelajahi"
              className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-sm md:text-base"
            >
              <Mountain className="h-5 w-5" />
              Jelajahi Basecamp
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 md:px-6 md:py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="p-1.5 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Mountain className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white/90 text-xs md:text-sm font-medium">
                          {booking.jalur_pendakian.basecamps.nama_basecamp}
                        </p>
                        <h3 className="text-lg md:text-xl font-bold text-white">
                          {booking.jalur_pendakian.basecamps.nama_gunung}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                  {/* Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    {getStatusBadge(booking.status_booking)}
                    <span className="text-xs md:text-sm text-gray-500">
                      {formatDate(booking.created_at)}
                    </span>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between py-1.5 md:py-2 border-b border-gray-100">
                      <span className="text-xs md:text-sm text-gray-600 flex items-center gap-1.5 md:gap-2">
                        <Ticket className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        Kode Booking
                      </span>
                      <span className="font-mono font-semibold text-gray-900 text-xs md:text-sm">
                        {booking.kode_booking}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 md:py-2 border-b border-gray-100">
                      <span className="text-xs md:text-sm text-gray-600 flex items-center gap-1.5 md:gap-2">
                        <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        Tanggal Pendakian
                      </span>
                      <span className="font-semibold text-gray-900 text-xs md:text-sm">
                        {formatDate(booking.tanggal_naik)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 md:py-2 border-b border-gray-100">
                      <span className="text-xs md:text-sm text-gray-600 flex items-center gap-1.5 md:gap-2">
                        <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        Jumlah Anggota
                      </span>
                      <span className="font-semibold text-gray-900 text-xs md:text-sm">
                        {booking.total_anggota} orang
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 md:py-2">
                      <span className="text-xs md:text-sm text-gray-600 flex items-center gap-1.5 md:gap-2">
                        <CreditCard className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        Total Biaya
                      </span>
                      <span className="text-base md:text-lg font-bold text-emerald-600">
                        {formatPrice(booking.total_biaya)}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/dashboard/pendaki/booking/${booking.id}`}
                    className="block w-full text-center px-4 py-2.5 md:py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-medium transition-colors text-sm md:text-base"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
