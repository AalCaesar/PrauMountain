import { createClient } from '@/utils/supabase/server';
import { Map, AlertCircle } from 'lucide-react';
import { getJalur } from './actions';
import JalurManager from './components/JalurManager';

export default async function JalurPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex flex-row items-start md:items-center gap-3">
          <Map className="h-8 w-8 text-gray-600 shrink-0 mt-1 md:mt-0" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Kelola Jalur Pendakian</h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-red-700">Anda harus login untuk mengakses halaman ini.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch admin's basecamp
  const { data: basecamp } = await supabase
    .from('basecamps')
    .select('id, nama_basecamp, nama_gunung')
    .eq('admin_id', user.id)
    .single();

  if (!basecamp) {
    return (
      <div className="space-y-6">
        <div className="flex flex-row items-start md:items-center gap-3">
          <Map className="h-8 w-8 text-gray-600 shrink-0 mt-1 md:mt-0" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Kelola Jalur Pendakian</h1>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">
                Basecamp Belum Ditugaskan
              </h3>
              <p className="text-amber-700">
                Akun Anda belum ditugaskan ke basecamp manapun. Silakan hubungi Super Admin
                untuk mendapatkan akses pengelolaan jalur pendakian.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch trails
  const jalurResult = await getJalur();

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-start md:items-center gap-3">
        <Map className="h-8 w-8 text-emerald-600 shrink-0 mt-1 md:mt-0" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Kelola Jalur Pendakian</h1>
          <p className="text-sm text-gray-600 mt-1">
            {basecamp.nama_basecamp} - {basecamp.nama_gunung}
          </p>
        </div>
      </div>

      {jalurResult.success ? (
        <JalurManager
          basecampId={basecamp.id}
          jalurData={jalurResult.data}
        />
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-red-700">{jalurResult.error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
