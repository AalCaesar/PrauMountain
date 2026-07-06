import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import LayoutWrapper from './LayoutWrapper';

export default async function AdminBasecampLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch user data from public users table to verify role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role, nama_lengkap, email')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    console.error('Error fetching user data:', userError);
    redirect('/login');
  }

  // Strict role check: Only allow admin_basecamp role
  if (userData.role !== 'admin_basecamp') {
    redirect('/unauthorized');
  }

  return (
    <LayoutWrapper
      userName={userData.nama_lengkap}
      userEmail={userData.email}
    >
      {children}
    </LayoutWrapper>
  );
}
