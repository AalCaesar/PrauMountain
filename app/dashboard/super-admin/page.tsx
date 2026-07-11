import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  MapPin,
  ClipboardList,
  Settings,
  ArrowRight,
  UserCog
} from 'lucide-react';

export default async function SuperAdminDashboardPage() {
  const supabase = await createClient();

  // 1. Pengecekan Autentikasi
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/login');

  // 2. Ambil Nama Pengguna
  const { data: profile } = await supabase
    .from('users')
    .select('nama_lengkap')
    .eq('id', user.id)
    .single();

  const displayName = profile?.nama_lengkap || user.email;

  // 3. Overview Statistik (Paralel)
  const [
    { count: totalBasecamps },
    { count: totalUsers },
    { count: totalBookings },
  ] = await Promise.all([
    supabase.from('basecamps').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
  ]);

  const stats = [
    { label: 'Total Basecamp', value: totalBasecamps || 0, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Pengguna', value: totalUsers || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Transaksi', value: totalBookings || 0, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Sapaan Pengguna */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Selamat datang, {displayName}</h1>
        <p className="text-gray-500 mt-1">Berikut adalah ringkasan data sistem Anda.</p>
      </div>

      {/* Overview Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-5">
            <div className={`p-4 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Akses Cepat (Quick Links) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/super-admin/basecamps" className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-900">Kelola Basecamp</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </Link>

        <Link href="/dashboard/super-admin/users" className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <UserCog className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="font-semibold text-gray-900">Kelola Pengguna</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
