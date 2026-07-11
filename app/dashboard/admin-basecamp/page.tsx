import { createClient } from '@/utils/supabase/server';
import { LayoutDashboard, Map, CalendarDays, QrCode } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getDashboardStats } from './actions';
import { getAdminQuotaStats } from '@/app/actions/quota';
import { getOverdueHikers } from '@/app/actions/emergency';
import DashboardStats from './components/DashboardStats';
import QuotaCapacity from './components/QuotaCapacity';
import OverdueAlertWidget from './components/OverdueAlertWidget';

export default async function AdminBasecampDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  const { data: userData } = await supabase
    .from('users')
    .select('nama_lengkap, email')
    .eq('id', user?.id)
    .single();

  const displayName = userData?.nama_lengkap || user.email;

  const statsResponse = await getDashboardStats();
  const stats = statsResponse.success ? statsResponse.data : null;

  // Ambil basecamp_id untuk query kuota & emergency
  const { data: basecamp } = await supabase
    .from('basecamps')
    .select('id')
    .eq('admin_id', user.id)
    .single();

  let quotaStats = null;
  let overdueHikers: any[] = [];
  if (basecamp) {
    quotaStats = await getAdminQuotaStats(basecamp.id);
    overdueHikers = await getOverdueHikers(basecamp.id);
  }

  return (
    <div className="space-y-6">
      {/* Emergency Alert Widget */}
      <OverdueAlertWidget overdueHikers={overdueHikers} />

      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Selamat Datang di Dashboard Admin Basecamp
        </h1>
        <p className="text-gray-600">
          Halo, <span className="font-medium text-gray-900">{displayName}</span>!
          Pilih menu di samping untuk mengelola operasional pendakian Anda.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <LayoutDashboard className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Dashboard</h3>
          </div>
          <p className="text-sm text-gray-600">
            Lihat ringkasan operasional basecamp
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Map className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Kelola Jalur</h3>
          </div>
          <p className="text-sm text-gray-600">
            Atur jalur pendakian dan kuota
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CalendarDays className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Kelola Booking</h3>
          </div>
          <p className="text-sm text-gray-600">
            Monitor dan kelola reservasi pendaki
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <QrCode className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Scanner</h3>
          </div>
          <p className="text-sm text-gray-600">
            Check-in dan check-out pendaki
          </p>
        </div>
      </div>

      {/* Dashboard Stats Section */}
      <DashboardStats stats={stats} />

      {/* Quota Capacity Section */}
      <QuotaCapacity statsData={quotaStats} />

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Informasi:</span> Halaman-halaman fitur sedang dalam pengembangan.
          Gunakan menu navigasi di sebelah kiri untuk mengakses fitur yang tersedia.
        </p>
      </div>
    </div>
  );
}
