import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Users, ArrowRight, Search, Mountain, Shield, Clock } from 'lucide-react';
import DynamicNavbar from '@/components/DynamicNavbar';
import LandingContent from './components/LandingContent';

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
      foto,
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

      <LandingContent basecamps={basecamps} />

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
                  <Link href="/#jelajahi" className="hover:text-emerald-400 transition-colors">
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
