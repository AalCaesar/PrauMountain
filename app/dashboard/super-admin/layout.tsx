import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import SuperAdminClientLayout from './components/SuperAdminClientLayout';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role, email, nama_lengkap')
    .eq('id', user.id)
    .single();

  if (userError || !userData || userData.role !== 'super_admin') {
    redirect('/dashboard');
  }

  const handleLogout = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  };

  return (
    <SuperAdminClientLayout userData={userData} handleLogout={handleLogout}>
      {children}
    </SuperAdminClientLayout>
  );
}
