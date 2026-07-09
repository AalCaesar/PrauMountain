'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, ChevronUp, ChevronDown, User, CreditCard, AlertCircle, Tent } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Stepper from './Stepper';
import LogistikStep from './LogistikStep';
import ReviewStep from './ReviewStep';

// --- INTERFACES UNTUK PROPS & STATE ---
interface Trail {
  id: string;
  basecamp_id: string;
  nama_jalur: string;
  harga_per_orang: number;
  tingkat_kesulitan: string;
}

interface Basecamp {
  id: string;
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

// --- INTERFACES UNTUK DATABASE (Sesuai ERD) ---
type BookingInsert = {
  kode_booking: string;
  ketua_id: string;
  jalur_id: string;
  tanggal_naik: string;
  tanggal_turun: string;
  total_anggota: number;
  total_biaya: number;
  status_booking: string;
  user_id: string;
};

type AnggotaInsert = {
  booking_id: string;
  nama_anggota: string;
  nik: string;
  kontak_darurat: string;
};

type LogistikInsert = {
  booking_id: string;
  nama_barang: string;
  jumlah_dibawa: number;
};

const steps = [
  { number: 1, title: 'Data Pendaki', icon: Users },
  { number: 2, title: 'Logistik', icon: Tent },
  { number: 3, title: 'Review & Bayar', icon: CreditCard },
];

export default function BookingForm({ trail, basecamp }: BookingFormProps) {
  const router = useRouter();
  const supabase = createClient();

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const errorKey = field === 'namaLengkap' ? `nama_${index}` : field === 'nik' ? `nik_${index}` : `telp_${index}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      if (!validateForm()) return;
    }
    setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const generateBookingCode = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PRAU-${year}${month}${day}-${random}`;
  };

  const totalPrice = hikerCount * trail.harga_per_orang;

  const handleFinalConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        alert('Anda harus login terlebih dahulu untuk melakukan booking.');
        router.push('/login');
        setIsSubmitting(false);
        return;
      }

      const bookingCode = generateBookingCode();

      // 1. Insert to bookings
      const bookingPayload: BookingInsert = {
        kode_booking: bookingCode,
        user_id: user.id,
        ketua_id: user.id,
        jalur_id: trail.id,
        tanggal_naik: hikingDate,
        tanggal_turun: hikingDate,
        total_anggota: hikerCount,
        total_biaya: totalPrice,
        status_booking: 'PENDING_PAYMENT',
      };

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingPayload)
        .select()
        .single();

      if (bookingError || !booking) {
        console.error('Booking error:', bookingError);
        throw new Error('Gagal membuat booking. Pastikan data sudah benar.');
      }

      // 2. Insert to anggota_rombongan
      const anggotaPayload: AnggotaInsert[] = hikerDetails.map((hiker) => ({
        booking_id: booking.id,
        nama_anggota: hiker.namaLengkap,
        nik: hiker.nik,
        kontak_darurat: hiker.nomorTelepon,
      }));

      const { error: anggotaError } = await supabase
        .from('anggota_rombongan')
        .insert(anggotaPayload);

      if (anggotaError) {
        console.error('Anggota error:', anggotaError);
        throw new Error('Gagal menyimpan data anggota rombongan.');
      }

      // 3. Insert to logistik_bawaan
      const logistikItems = [
        { nama: 'Tenda', jumlah: logistics.tenda },
        { nama: 'Carrier', jumlah: logistics.carrier },
        { nama: 'Sleeping Bag', jumlah: logistics.sleepingBag },
        { nama: 'Matras', jumlah: logistics.matras },
        { nama: 'Kompor', jumlah: logistics.kompor },
        { nama: 'Kantong Sampah', jumlah: logistics.kantongSampah },
        { nama: 'P3K', jumlah: logistics.p3k },
      ].filter(item => item.jumlah > 0);

      if (logistikItems.length > 0) {
        const logistikPayload: LogistikInsert[] = logistikItems.map(item => ({
          booking_id: booking.id,
          nama_barang: item.nama,
          jumlah_dibawa: item.jumlah,
        }));

        const { error: logistikError } = await supabase
          .from('logistik_bawaan')
          .insert(logistikPayload);

        if (logistikError) {
          console.error('Logistik error:', logistikError);
          throw new Error('Gagal menyimpan data logistik.');
        }
      }

      // Redirect on success
      router.push(`/booking/success?code=${bookingCode}`);

    } catch (error: any) {
      console.error('Booking submission error:', error);
      alert(error.message || 'Terjadi kesalahan saat memproses booking.');
      setIsSubmitting(false);
    }
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
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.hikingDate ? 'border-red-500' : 'border-gray-300'
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
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors[`nama_${index}`] ? 'border-red-500' : 'border-gray-300'
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
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono ${errors[`nik_${index}`] ? 'border-red-500' : 'border-gray-300'
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
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors[`telp_${index}`] ? 'border-red-500' : 'border-gray-300'
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
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Order Summary */}
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