import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Users, ArrowRight, Search, Mountain, Shield, Clock } from 'lucide-react';
import DynamicNavbar from '@/components/DynamicNavbar';

interface BasecampWithPrice {
  id: string;
  nama_gunung: string;
  nama_basecamp: string;
  lokasi: string;
  status_buka: boolean;
  minPrice: number | null;
  foto: string | null;
}

async function getActiveBasecamps(): Promise<BasecampWithPrice[]> {
  const supabase = await createClient();

  // Fetch all active basecamps with their trails
  const { data: basecamps, error } = await supabase
    .from('basecamps')
    .select(`
      id,
      nama_gunung,
      nama_basecamp,
      lokasi,
      status_buka,
      foto,  // <--- Tambahkan baris ini di sini
      jalur_pendakian(harga_per_orang, is_active)
    `)
    .eq('status_buka', true);

  if (error || !basecamps) {
    console.error('Error fetching basecamps:', error);
    return [];
  }

  // Calculate minimum price for each basecamp
  const basecampsWithPrice: BasecampWithPrice[] = basecamps.map((basecamp: any) => {
    const activeTrails = basecamp.jalur_pendakian?.filter((trail: any) => trail.is_active) || [];
    const prices = activeTrails.map((trail: any) => trail.harga_per_orang).filter((price: number) => price > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;

    return {
      id: basecamp.id,
      nama_gunung: basecamp.nama_gunung,
      nama_basecamp: basecamp.nama_basecamp,
      lokasi: basecamp.lokasi,
      status_buka: basecamp.status_buka,
      minPrice,
      foto: basecamp.foto,
    };
  });

  return basecampsWithPrice;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

export default async function Home() {
  const basecamps = await getActiveBasecamps();

  return (
    <div className="min-h-screen bg-white">
      <DynamicNavbar />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80"
            alt="Mountain Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Eksplorasi Keindahan
            <br />
            <span className="text-emerald-400">Gunung Prau</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Booking tiket pendakian lebih mudah, aman, dan tanpa antri.
          </p>

          {/* Glassmorphism Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/20">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-3 bg-white/90 rounded-xl px-4 py-3">
                  <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari gunung atau basecamp..."
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
                  />
                </div>
                <Link
                  href="/basecamps"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>Jelajahi</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span className="text-sm">Booking Aman</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-400" />
              <span className="text-sm">Proses Cepat</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-400" />
              <span className="text-sm">Terpercaya</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Basecamps Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Life After Breakup?? Mendaki Saja!!
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pilih dari berbagai basecamp terbaik dengan fasilitas lengkap dan jalur pendakian yang menantang
            </p>
          </div>

          {/* Basecamps Grid */}
          {basecamps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {basecamps.map((basecamp, index) => (
                <Link
                  key={basecamp.id}
                  href={`/basecamp/${basecamp.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                        src={basecamp.foto || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80"}
                        alt={basecamp.nama_gunung}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Price Badge */}
                    {basecamp.minPrice && (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                        Mulai dari {formatPrice(basecamp.minPrice)}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {basecamp.nama_gunung}
                    </h3>
                    <p className="text-gray-600 mb-4">{basecamp.nama_basecamp}</p>

                    <div className="flex items-center gap-2 text-gray-500 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{basecamp.lokasi}</span>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-emerald-600 font-medium group-hover:text-emerald-700 transition-colors">
                        Booking Sekarang
                      </span>
                      <ArrowRight className="h-5 w-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Mountain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Basecamp Tersedia</h3>
              <p className="text-gray-600">
                Basecamp akan ditampilkan di sini setelah ditambahkan oleh admin.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Mountain className="h-8 w-8 text-emerald-400" />
                <span className="text-xl font-bold">PrauMountain</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Platform booking pendakian gunung terpercaya di Indonesia. Wujudkan petualangan impianmu dengan mudah dan aman.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Navigasi</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/basecamps" className="hover:text-emerald-400 transition-colors">
                    Jelajahi Basecamp
                  </Link>
                </li>
                <li>
                  <Link href="/tentang" className="hover:text-emerald-400 transition-colors">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link href="/bantuan" className="hover:text-emerald-400 transition-colors">
                    Bantuan
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Kontak</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@praumountain.com</li>
                <li>Telepon: (021) 1234-5678</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 PrauMountain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
