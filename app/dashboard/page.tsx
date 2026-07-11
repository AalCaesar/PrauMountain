import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardDispatcher() {
  const supabase = await createClient();

  // 1. Cek apakah user sudah login
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login'); // Lempar ke login jika belum login
  }

  // 2. Ambil role user dari database (Pastikan tabel 'users' dan kolom 'role' sesuai dengan Supabase kamu)
  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = userData?.role;

  // 3. Arahkan ke folder yang sesuai dengan struktur folder di gambarmu
  if (role === 'super-admin') {
    redirect('/dashboard/super-admin');
  } else if (role === 'admin-basecamp') {
    redirect('/dashboard/admin-basecamp');
  } else {
    // Default: Jika role 'pendaki' atau error/tidak ditemukan, masukkan ke dashboard pendaki
    redirect('/dashboard/pendaki');
  }
}