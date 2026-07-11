import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, CheckCircle, XCircle, Mountain, Users, Clock, TrendingUp } from 'lucide-react';

interface Basecamp {
  id: string;
  nama_gunung: string;
  nama_basecamp: string;
  lokasi: string;
  status_buka: boolean;
  foto: string | null;
}

interface Trail {
  id: string;
  basecamp_id: string;
  nama_jalur: string;
  deskripsi: string | null;
  kuota_per_hari: number;
  harga_per_orang: number;
  tingkat_kesulitan: 'mudah' | 'sedang' | 'sulit' | 'ekstrem';
  estimasi_waktu: string | null;
  is_active: boolean;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

const getDifficultyBadge = (difficulty: string) => {
  const badges = {
    mudah: { label: 'Mudah', className: 'bg-emerald-50 text-emerald-700' },
    sedang: { label: 'Sedang', className: 'bg-blue-50 text-blue-700' },
    sulit: { label: 'Sulit', className: 'bg-amber-50 text-amber-700' },
    ekstrem: { label: 'Ekstrem', className: 'bg-rose-50 text-rose-700' },
  };
  return badges[difficulty as keyof typeof badges] || badges.mudah;
};

export default async function BasecampDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch basecamp details
  const { data: basecamp, error: basecampError } = await supabase
    .from('basecamps')
    .select('*')
    .eq('id', id)
    .single();

  if (basecampError || !basecamp) {
    notFound();
  }

  // Fetch active trails for this basecamp
  const { data: trails, error: trailsError } = await supabase
    .from('jalur_pendakian')
    .select('*')
    .eq('basecamp_id', id)
    .eq('is_active', true)
    .order('harga_per_orang', { ascending: true });

  const activeTrails: Trail[] = trails || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={
              basecamp.foto ||
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80'
            }
            alt={basecamp.nama_gunung}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="pt-24">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Kembali</span>
            </Link>
          </div>

          {/* Title */}
          <div className="pb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              {basecamp.nama_gunung}
            </h1>
            <p className="text-xl sm:text-2xl text-white/90">
              {basecamp.nama_basecamp}
            </p>
          </div>
        </div>
      </section>

      {/* Basecamp Info Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-6">
            {/* Location */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 rounded-full">
                <MapPin className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Lokasi</p>
                <p className="text-base font-semibold text-gray-900">{basecamp.lokasi}</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${basecamp.status_buka ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                {basecamp.status_buka ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`text-base font-semibold ${basecamp.status_buka ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {basecamp.status_buka ? 'Buka' : 'Tutup'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trails Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Pilih Jalur Pendakian
            </h2>
            <p className="text-lg text-gray-600">
              Tersedia {activeTrails.length} jalur pendakian dengan berbagai tingkat kesulitan
            </p>
          </div>

          {/* Trails Grid */}
          {activeTrails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeTrails.map((trail) => {
                const difficulty = getDifficultyBadge(trail.tingkat_kesulitan);

                return (
                  <div
                    key={trail.id}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500 overflow-hidden flex flex-col group"
                  >
                    <div className="p-6 sm:p-8 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-slate-800">
                        {trail.nama_jalur}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed mt-2 line-clamp-3">
                        {trail.deskripsi || 'Jalur pendakian yang menantang dengan pemandangan indah'}
                      </p>

                      <div className="mt-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${difficulty.className}`}>
                          <TrendingUp className="h-3 w-3" />
                          {difficulty.label}
                        </span>
                      </div>

                      <div className="flex flex-col gap-3 my-6">
                        {trail.estimasi_waktu && (
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-slate-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-slate-700">
                              {trail.estimasi_waktu}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-slate-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-slate-700">
                            {trail.kuota_per_hari} orang/hari
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-5 mt-auto">
                        <p className="text-xs text-slate-500 mb-1">Harga per Orang</p>
                        <p className="text-2xl font-black text-emerald-600">
                          {formatPrice(trail.harga_per_orang)}
                        </p>
                        <Link
                          href={`/booking/${trail.id}`}
                          className="block w-full mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-center font-semibold py-3.5 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg"
                        >
                          Pesan Jalur Ini
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Mountain className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Tidak Ada Jalur Tersedia
                </h3>
                <p className="text-gray-600 mb-6">
                  Saat ini belum ada jalur pendakian yang tersedia di basecamp ini.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
