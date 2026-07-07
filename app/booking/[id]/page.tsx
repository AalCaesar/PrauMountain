import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import BookingForm from './components/BookingForm';

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

interface Basecamp {
  id: string;
  nama_gunung: string;
  nama_basecamp: string;
  lokasi: string;
  status_buka: boolean;
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch trail details
  const { data: trail, error: trailError } = await supabase
    .from('jalur_pendakian')
    .select('*')
    .eq('id', id)
    .single();

  if (trailError || !trail || !trail.is_active) {
    notFound();
  }

  // Fetch associated basecamp
  const { data: basecamp, error: basecampError } = await supabase
    .from('basecamps')
    .select('id, nama_gunung, nama_basecamp, lokasi, status_buka')
    .eq('id', trail.basecamp_id)
    .single();

  if (basecampError || !basecamp || !basecamp.status_buka) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Booking Pendakian
          </h1>
          <p className="text-gray-600">
            Lengkapi data untuk reservasi jalur {trail.nama_jalur}
          </p>
        </div>

        {/* Booking Form */}
        <BookingForm trail={trail as Trail} basecamp={basecamp as Basecamp} />
      </div>
    </div>
  );
}
