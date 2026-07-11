import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardDispatcher() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = userData?.role;

  if (role === 'super_admin') {
    redirect('/dashboard/super-admin');
  } else if (role === 'admin_basecamp') {
    redirect('/dashboard/admin-basecamp');
  } else {
    redirect('/dashboard/pendaki');
  }
}