import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  MapPin,
  ClipboardList,
  Settings,
  ArrowRight,
  UserCog,
  Banknote
} from 'lucide-react';
import { getSuperAdminStats } from './actions';
import { getRecentAuditLogs } from '@/app/actions/audit';
import BasecampComparisonChart from './components/BasecampComparisonChart';
import AuditTrailTable from './components/AuditTrailTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  // 3. Overview Statistik (Dari Server Action)
  const [
    { count: totalBasecamps },
    { count: totalUsers },
    auditLogs
  ] = await Promise.all([
    supabase.from('basecamps').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    getRecentAuditLogs()
  ]);

  const statsData = await getSuperAdminStats();
  const totalPendapatan = statsData.success ? statsData.totalPendapatan || 0 : 0;
  const basecampPerformance = statsData.success ? statsData.basecampPerformance || [] : [];
  
  // Hitung total transaksi dari agregasi
  const totalBookings = basecampPerformance.reduce((acc, curr) => acc + curr.transaksi, 0);

  const stats = [
    { label: 'Total Basecamp', value: totalBasecamps || 0, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Pengguna', value: totalUsers || 0, icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Total Transaksi', value: totalBookings || 0, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Pendapatan Keseluruhan', value: `Rp ${totalPendapatan.toLocaleString('id-ID')}`, icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50', isMoney: true },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Sapaan Pengguna */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Selamat datang, {displayName}</h1>
        <p className="text-slate-500 mt-1">Berikut adalah ringkasan performa seluruh sistem dan basecamp.</p>
      </div>

      {/* Overview Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-5 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.isMoney ? 'text-emerald-600' : 'text-slate-900'}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Akses Cepat (Quick Links) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/super-admin/basecamps" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Kelola Basecamp</span>
              <span className="text-sm text-slate-500">Atur jalur dan kuota basecamp</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </Link>

        <Link href="/dashboard/super-admin/users" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-cyan-50 rounded-xl group-hover:bg-cyan-100 transition-colors">
              <UserCog className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Kelola Pengguna</span>
              <span className="text-sm text-slate-500">Atur hak akses admin dan pendaki</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 transition-colors" />
        </Link>
      </div>

      {/* Grid wrapper untuk Chart dan Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <BasecampComparisonChart data={basecampPerformance} />
        </div>
        <div className="lg:col-span-1 max-h-[500px] overflow-y-auto rounded-2xl shadow-sm bg-white">
          <AuditTrailTable logs={auditLogs} />
        </div>
      </div>

    </div>
  );
}
