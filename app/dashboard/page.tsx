import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/auth';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Ticket, History, Map, PlusCircle, ChevronRight, Compass } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('users')
    .select('nama_lengkap')
    .eq('id', user.id)
    .single();

  const displayName = profile?.nama_lengkap || user.email;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Pendaki</h1>
          <p className="text-gray-600 mt-2">
            Selamat datang kembali, <span className="font-semibold text-emerald-600">{displayName}</span>! Siap untuk petualangan selanjutnya?
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Tiket Aktif</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <History className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Pendakian</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Jalur Favorit</p>
              <p className="text-lg font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Pendakian Mendatang</h2>
                <Link href="/dashboard/bookings" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                  Lihat Semua <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <Compass className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Belum Ada Pendakian</h3>
                <p className="text-gray-500 mb-6 max-w-sm">
                  Kamu belum memiliki tiket pendakian aktif. Yuk, rencanakan pendakianmu ke Gunung Prau sekarang!
                </p>
                <Link
                  href="/booking"
                  className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <PlusCircle className="w-5 h-5" />
                  Pesan Tiket Sekarang
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h2>
              <div className="space-y-3">
                <Link
                  href="/basecamps"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors group"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 group-hover:text-emerald-700">Jelajahi Basecamp</p>
                    <p className="text-xs text-gray-500">Lihat info dan kuota jalur</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors group"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 group-hover:text-emerald-700">Pengaturan Profil</p>
                    <p className="text-xs text-gray-500">Perbarui data diri kamu</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}