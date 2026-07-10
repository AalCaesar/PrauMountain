import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/auth';
import { createClient } from '@/utils/supabase/server';

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
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Dashboard
          </h1>
          <p className="text-gray-600 mb-4">
            Selamat datang, <span className="font-semibold">{displayName}</span>!
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-700">
              🎉 Authentication berhasil diimplementasikan! Anda sudah login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}