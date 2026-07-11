'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, ArrowRight, Search, Mountain, Shield, Clock } from 'lucide-react';

interface BasecampWithPrice {
  id: string;
  nama_gunung: string;
  nama_basecamp: string;
  lokasi: string;
  status_buka: boolean;
  minPrice: number | null;
  foto: string | null;
}

interface LandingContentProps {
  basecamps: BasecampWithPrice[];
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

export default function LandingContent({ basecamps }: LandingContentProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBasecamps = basecamps.filter((basecamp) => {
    const query = searchQuery.toLowerCase();
    return (
      basecamp.nama_gunung.toLowerCase().includes(query) ||
      basecamp.nama_basecamp.toLowerCase().includes(query) ||
      basecamp.lokasi.toLowerCase().includes(query)
    );
  });

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1697444267811-6344d510f179?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari gunung, basecamp, atau lokasi..."
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
                  />
                </div>
                <Link
                  href="#jelajahi"
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
      <section id="jelajahi" className="py-20 bg-gradient-to-b from-white to-gray-50">
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
          {filteredBasecamps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBasecamps.map((basecamp, index) => (
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
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Mountain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Basecamp tidak ditemukan</h3>
              <p className="text-gray-500">
                Coba gunakan kata kunci pencarian yang lain atau periksa ejaan Anda.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
