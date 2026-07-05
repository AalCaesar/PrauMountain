import { createClient } from '@/utils/supabase/server';
import { Basecamp } from '@/types/database';
import BasecampTable from './components/BasecampTable';
import { Mountain } from 'lucide-react';

export default async function BasecampsPage() {
  const supabase = await createClient();

  const { data: basecamps, error } = await supabase
    .from('basecamps')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching basecamps:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">
          Failed to load basecamps. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Mountain className="h-8 w-8 text-emerald-600" />
            Manajemen Basecamp
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Kelola basecamp dan assign admin untuk setiap lokasi pendakian.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <BasecampTable basecamps={basecamps as Basecamp[]} />
      </div>
    </div>
  );
}
