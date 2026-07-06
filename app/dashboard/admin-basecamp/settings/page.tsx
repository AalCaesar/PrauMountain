import { Settings, AlertCircle } from 'lucide-react';
import { getMyBasecamp } from './actions';
import BasecampInfoForm from './components/BasecampInfoForm';
import FasilitasManager from './components/FasilitasManager';
import PhotoUploader from './components/PhotoUploader';

export default async function SettingsPage() {
  const result = await getMyBasecamp();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-8 w-8 text-gray-600" />
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Basecamp</h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-red-700">{result.error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result.data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-8 w-8 text-gray-600" />
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Basecamp</h1>
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
                untuk mendapatkan akses pengelolaan basecamp.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const basecamp = result.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Basecamp</h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola informasi dan fasilitas basecamp Anda
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Photo Uploader */}
        <div className="lg:col-span-1">
          <PhotoUploader
            basecampId={basecamp.id}
            currentPhoto={basecamp.foto}
            basecampName={basecamp.nama_basecamp}
          />
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Form */}
          <BasecampInfoForm basecamp={basecamp} />

          {/* Facilities Manager */}
          <FasilitasManager
            basecampId={basecamp.id}
            currentFasilitas={basecamp.fasilitas as string[] || []}
          />
        </div>
      </div>
    </div>
  );
}
