'use client';

import { MapPin, Calendar, Users, Package, CreditCard, CheckCircle } from 'lucide-react';

interface Trail {
  id: string;
  nama_jalur: string;
  harga_per_orang: number;
  tingkat_kesulitan: string;
}

interface Basecamp {
  nama_gunung: string;
  nama_basecamp: string;
}

interface HikerDetail {
  namaLengkap: string;
  nik: string;
  nomorTelepon: string;
}

interface LogistikState {
  tenda: number;
  carrier: number;
  sleepingBag: number;
  matras: number;
  kompor: number;
  kantongSampah: number;
  p3k: number;
}

interface ReviewStepProps {
  trail: Trail;
  basecamp: Basecamp;
  hikingDate: string;
  hikerCount: number;
  hikerDetails: HikerDetail[];
  logistics: LogistikState;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

const logistikLabels: Record<keyof LogistikState, string> = {
  tenda: 'Tenda',
  carrier: 'Carrier',
  sleepingBag: 'Sleeping Bag',
  matras: 'Matras',
  kompor: 'Kompor',
  kantongSampah: 'Kantong Sampah',
  p3k: 'P3K',
};

export default function ReviewStep({
  trail,
  basecamp,
  hikingDate,
  hikerCount,
  hikerDetails,
  logistics,
  onBack,
  onConfirm,
  isSubmitting = false,
}: ReviewStepProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const logistikWithQty = Object.entries(logistics).filter(([_, qty]) => qty > 0);
  const totalPrice = hikerCount * trail.harga_per_orang;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Booking Anda</h2>
        <p className="text-gray-600">Pastikan semua data sudah benar sebelum melanjutkan pembayaran</p>
      </div>

      {/* Trail & Date Info */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-600" />
          Informasi Jalur
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Gunung</span>
            <span className="font-semibold text-gray-900">{basecamp.nama_gunung}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Basecamp</span>
            <span className="font-semibold text-gray-900">{basecamp.nama_basecamp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Jalur</span>
            <span className="font-semibold text-gray-900">{trail.nama_jalur}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tanggal Pendakian
            </span>
            <span className="font-semibold text-gray-900">{formatDate(hikingDate)}</span>
          </div>
        </div>
      </div>

      {/* Hikers List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-600" />
          Data Pendaki ({hikerCount} Orang)
        </h3>
        <div className="space-y-4">
          {hikerDetails.map((hiker, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">
                  {hiker.namaLengkap}
                  {index === 0 && (
                    <span className="ml-2 text-xs font-normal text-emerald-600">(Ketua)</span>
                  )}
                </h4>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">NIK</span>
                  <span className="font-mono text-gray-700">{hiker.nik}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Telepon</span>
                  <span className="text-gray-700">{hiker.nomorTelepon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logistics List */}
      {logistikWithQty.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            Logistik Bawaan
          </h3>
          <div className="space-y-2">
            {logistikWithQty.map(([key, qty]) => (
              <div key={key} className="flex justify-between items-center py-2">
                <span className="text-gray-700">{logistikLabels[key as keyof LogistikState]}</span>
                <span className="font-semibold text-gray-900">{qty} unit</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Summary */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border-2 border-emerald-500 shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          Ringkasan Biaya
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Harga per orang</span>
            <span className="font-medium text-gray-900">{formatPrice(trail.harga_per_orang)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Jumlah pendaki</span>
            <span className="font-medium text-gray-900">{hikerCount} orang</span>
          </div>
          <div className="border-t-2 border-emerald-300 pt-3 flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">Total Pembayaran</span>
            <span className="text-3xl font-bold text-emerald-600">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className={`px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl transition-colors font-medium ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
        >
          Kembali
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className={`px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl transition-all font-bold shadow-lg flex items-center gap-2 ${
            isSubmitting
              ? 'opacity-75 cursor-not-allowed'
              : 'hover:from-emerald-700 hover:to-emerald-800 hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Memproses Booking...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              Konfirmasi & Bayar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
