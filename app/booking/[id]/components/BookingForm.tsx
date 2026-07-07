'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, ChevronUp, ChevronDown, User, CreditCard, AlertCircle, Tent } from 'lucide-react';
import Stepper from './Stepper';
import LogistikStep from './LogistikStep';
import ReviewStep from './ReviewStep';

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

interface BookingFormProps {
  trail: Trail;
  basecamp: Basecamp;
}

const steps = [
  { number: 1, title: 'Data Pendaki', icon: Users },
  { number: 2, title: 'Logistik', icon: Tent },
  { number: 3, title: 'Review & Bayar', icon: CreditCard },
];

export default function BookingForm({ trail, basecamp }: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [hikingDate, setHikingDate] = useState('');
  const [hikerCount, setHikerCount] = useState(1);
  const [hikerDetails, setHikerDetails] = useState<HikerDetail[]>([
    { namaLengkap: '', nik: '', nomorTelepon: '' }
  ]);
  const [logistics, setLogistics] = useState<LogistikState>({
    tenda: 0,
    carrier: 0,
    sleepingBag: 0,
    matras: 0,
    kompor: 0,
    kantongSampah: 0,
    p3k: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update hiker details array when count changes
  useEffect(() => {
    if (hikerCount > hikerDetails.length) {
      const newDetails = [...hikerDetails];
      for (let i = hikerDetails.length; i < hikerCount; i++) {
        newDetails.push({ namaLengkap: '', nik: '', nomorTelepon: '' });
      }
      setHikerDetails(newDetails);
    } else if (hikerCount < hikerDetails.length) {
      setHikerDetails(hikerDetails.slice(0, hikerCount));
    }
  }, [hikerCount]);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const validateNIK = (nik: string): boolean => {
    return /^\d{16}$/.test(nik);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!hikingDate) {
      newErrors.hikingDate = 'Tanggal pendakian wajib diisi';
    }

    hikerDetails.forEach((hiker, index) => {
      if (!hiker.namaLengkap.trim()) {
        newErrors[`nama_${index}`] = 'Nama lengkap wajib diisi';
      }
      if (!hiker.nik) {
        newErrors[`nik_${index}`] = 'NIK wajib diisi';
      } else if (!validateNIK(hiker.nik)) {
        newErrors[`nik_${index}`] = 'NIK harus 16 digit angka';
      }
      if (!hiker.nomorTelepon.trim()) {
        newErrors[`telp_${index}`] = 'Nomor telepon wajib diisi';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleHikerDetailChange = (index: number, field: keyof HikerDetail, value: string) => {
    const newDetails = [...hikerDetails];
    newDetails[index][field] = value;
    setHikerDetails(newDetails);

    // Clear error for this field
    const errorKey = field === 'namaLengkap' ? `nama_${index}` : field === 'nik' ? `nik_${index}` : `telp_${index}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      // Validate Step 1 before proceeding
      if (!validateForm()) {
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFinalConfirm = () => {
    const bookingData = {
      trail: {
        id: trail.id,
        nama: trail.nama_jalur,
        harga: trail.harga_per_orang
      },
      basecamp: {
        gunung: basecamp.nama_gunung,
        nama: basecamp.nama_basecamp
      },
      hikingDate,
      hikerCount,
      hikers: hikerDetails,
      logistics,
      totalPrice: hikerCount * trail.harga_per_orang
    };

    console.log('Final Booking Data:', bookingData);
    alert('Booking siap diproses!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToNextStep();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalPrice = hikerCount * trail.harga_per_orang;

  return (
    <form onSubmit={handleSubmit}>
      <Stepper currentStep={currentStep} steps={steps} />

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Data Pendaki */}
          {currentStep === 1 && (
            <div className="space-y-8">
        {/* Date Picker */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Tanggal Pendakian</h2>
          </div>

          <div>
            <label htmlFor="hikingDate" className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="hikingDate"
              value={hikingDate}
              min={getTodayDate()}
              onChange={(e) => {
                setHikingDate(e.target.value);
                if (errors.hikingDate) {
                  const newErrors = { ...errors };
                  delete newErrors.hikingDate;
                  setErrors(newErrors);
                }
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.hikingDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.hikingDate && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.hikingDate}
              </p>
            )}
          </div>
        </div>

        {/* Hiker Count */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Jumlah Pendaki</h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setHikerCount(Math.max(1, hikerCount - 1))}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={hikerCount <= 1}
            >
              <ChevronDown className="h-5 w-5 text-gray-700" />
            </button>
            <div className="flex-1 text-center">
              <p className="text-3xl font-bold text-gray-900">{hikerCount}</p>
              <p className="text-sm text-gray-500">orang</p>
            </div>
            <button
              type="button"
              onClick={() => setHikerCount(hikerCount + 1)}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
            >
              <ChevronUp className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Hiker Details */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <User className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Data Pendaki</h2>
          </div>

          {hikerDetails.map((hiker, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pendaki {index + 1}
                  {index === 0 && (
                    <span className="ml-2 text-sm font-normal text-emerald-600">(Ketua Rombongan)</span>
                  )}
                </h3>
              </div>

              <div className="space-y-4">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hiker.namaLengkap}
                    onChange={(e) => handleHikerDetailChange(index, 'namaLengkap', e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors[`nama_${index}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[`nama_${index}`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`nama_${index}`]}</p>
                  )}
                </div>

                {/* NIK */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIK (16 Digit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hiker.nik}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                      handleHikerDetailChange(index, 'nik', value);
                    }}
                    placeholder="Masukkan 16 digit NIK"
                    maxLength={16}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono ${
                      errors[`nik_${index}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[`nik_${index}`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`nik_${index}`]}</p>
                  )}
                  {hiker.nik && (
                    <p className="mt-1 text-xs text-gray-500">{hiker.nik.length}/16 digit</p>
                  )}
                </div>

                {/* Nomor Telepon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={hiker.nomorTelepon}
                    onChange={(e) => handleHikerDetailChange(index, 'nomorTelepon', e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors[`telp_${index}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[`telp_${index}`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`telp_${index}`]}</p>
                  )}
                </div>
              </div>
           </div>
          ))}
            </div>
          </div>
          )}

          {/* Step 2: Logistik Bawaan */}
          {currentStep === 2 && (
            <LogistikStep
              logistics={logistics}
              onChange={setLogistics}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
            />
          )}

          {/* Step 3: Review & Bayar */}
          {currentStep === 3 && (
            <ReviewStep
              trail={trail}
              basecamp={basecamp}
              hikingDate={hikingDate}
              hikerCount={hikerCount}
              hikerDetails={hikerDetails}
              logistics={logistics}
              onBack={goToPreviousStep}
              onConfirm={handleFinalConfirm}
            />
          )}
        </div>

        {/* Order Summary - Desktop: Sticky Right / Mobile: Only Step 1 */}
        {currentStep === 1 && (
          <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-24 bg-white rounded-2xl border-2 border-emerald-500 shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CreditCard className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Ringkasan Pesanan</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500">Gunung</p>
              <p className="font-semibold text-gray-900">{basecamp.nama_gunung}</p>
            </div>
            <div>
              <p className="text-gray-500">Jalur</p>
              <p className="font-semibold text-gray-900">{trail.nama_jalur}</p>
            </div>
            <div>
              <p className="text-gray-500">Tanggal Pendakian</p>
              <p className="font-semibold text-gray-900">
                {hikingDate ? new Date(hikingDate).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric'
                }) : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Jumlah Pendaki</p>
              <p className="font-semibold text-gray-900">{hikerCount} orang</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Harga per orang</span>
              <span className="font-medium text-gray-900">{formatPrice(trail.harga_per_orang)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-emerald-600">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
          >
            Lanjut ke Logistik
          </button>
          </div>
        </div>
      )}
    </div>
  </form>
);
}
