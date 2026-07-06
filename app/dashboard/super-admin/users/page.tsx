import { createClient } from '@/utils/supabase/server';
import { User } from '@/types/database';
import UsersTable from './components/UsersTable';
import { Users } from 'lucide-react';

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'admin_basecamp')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">
          Failed to load admin users. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-emerald-600" />
            Manajemen Admin Basecamp
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Buat dan kelola akun Admin Basecamp untuk mengelola basecamp.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <UsersTable users={users as User[]} />
      </div>
    </div>
  );
}
