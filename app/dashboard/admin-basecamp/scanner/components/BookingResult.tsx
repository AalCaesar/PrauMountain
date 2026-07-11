'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  User,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  Check,
  Clock,
  LogIn,
  LogOut,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Package,
  ClipboardCheck,
  ShieldCheck,
  Loader2,
  X,
  Scale,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { processCheckIn, processCheckOut } from '../actions';

interface AnggotaRombongan {
  id: string;
  nama_anggota: string;
}

interface LogistikBawaan {
  id: string;
  nama_barang: string;
  status_pengecekan: boolean;
}

interface BookingResultProps {
  booking: any;
  onReset: () => void;
}

// ===== TOAST COMPONENT =====
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[60] animate-in slide-in-from-top-2 fade-in duration-300">
      <div
        className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-sm max-w-md ${type === 'success'
          ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
          : 'bg-red-50/95 border-red-200 text-red-800'
          }`}
      >
        <div className={`flex-shrink-0 p-1 rounded-full ${type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
        </div>
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className={`flex-shrink-0 p-1 rounded-lg transition-colors ${type === 'success' ? 'hover:bg-emerald-100' : 'hover:bg-red-100'
            }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ===== CHECKOUT MODAL COMPONENT =====
function CheckOutModal({
  booking,
  logistikList,
  onClose,
  onSuccess,
  onError,
}: {
  booking: any;
  logistikList: LogistikBawaan[];
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [beratSampah, setBeratSampah] = useState<string>('');
  const [jenisSampah, setJenisSampah] = useState<string>('');
  const [coSelectedLogistics, setCoSelectedLogistics] = useState<string[]>(
    logistikList.filter((l) => l.status_pengecekan).map((l) => l.id)
  );
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [processing, setProcessing] = useState(false);

  const allCoLogisticsChecked = useMemo(
    () => logistikList.length > 0 && coSelectedLogistics.length === logistikList.length,
    [logistikList, coSelectedLogistics]
  );

  const canSubmit = useMemo(() => {
    const hasBerat = beratSampah.trim() !== '' && parseFloat(beratSampah) >= 0;
    const hasJenis = jenisSampah.trim() !== '';
    const logisticsOk = logistikList.length === 0 || allCoLogisticsChecked;
    return hasBerat && hasJenis && logisticsOk && confirmChecked && !processing;
  }, [beratSampah, jenisSampah, logistikList, allCoLogisticsChecked, confirmChecked, processing]);

  const toggleCoLogistic = (id: string) => {
    setCoSelectedLogistics((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAllCoLogistics = () => {
    if (allCoLogisticsChecked) {
      setCoSelectedLogistics([]);
    } else {
      setCoSelectedLogistics(logistikList.map((l) => l.id));
    }
  };

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      const result = await processCheckOut(
        booking.id,
        parseFloat(beratSampah),
        jenisSampah.trim(),
        coSelectedLogistics
      );

      if (result.success) {
        onSuccess('Check-out berhasil! Data sampah tersimpan dan pendaki telah selesai mendaki dengan selamat.');
        onClose();
      } else {
        onError(result.error || 'Gagal melakukan check-out');
      }
    } catch (err) {
      console.error('Error during check-out:', err);
      onError('Terjadi kesalahan saat proses check-out');
    } finally {
      setProcessing(false);
    }
  };

  const jenisSampahOptions = [
    'Organik',
    'Plastik',
    'Kertas',
    'Campuran',
    'Logam',
    'Kaca',
    'Lainnya',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!processing ? onClose : undefined}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <LogOut className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Konfirmasi Check-Out</h3>
              <p className="text-blue-100 text-xs mt-0.5">
                {booking.kode_booking || booking.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={processing}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Berat Sampah */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Scale className="h-4 w-4 text-blue-600" />
              Berat Sampah (kg) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.1"
                value={beratSampah}
                onChange={(e) => setBeratSampah(e.target.value)}
                placeholder="Masukkan berat sampah..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm placeholder:text-gray-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                kg
              </span>
            </div>
          </div>

          {/* Jenis Sampah */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Trash2 className="h-4 w-4 text-orange-600" />
              Jenis Sampah <span className="text-red-500">*</span>
            </label>
            <select
              value={jenisSampah}
              onChange={(e) => setJenisSampah(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm appearance-none bg-white cursor-pointer"
            >
              <option value="">Pilih jenis sampah...</option>
              {jenisSampahOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Logistik Checklist */}
          {logistikList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Package className="h-4 w-4 text-purple-600" />
                  Verifikasi Logistik Bawaan
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${allCoLogisticsChecked
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                      }`}
                  >
                    {coSelectedLogistics.length}/{logistikList.length}
                  </span>
                </label>
                <button
                  onClick={toggleAllCoLogistics}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors hover:underline"
                >
                  {allCoLogisticsChecked ? 'Batal Semua' : 'Pilih Semua'}
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {logistikList.map((item, index) => {
                  const isChecked = coSelectedLogistics.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleCoLogistic(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-200 text-left group ${isChecked
                        ? 'bg-purple-50 border-purple-300 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all duration-200 ${isChecked
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-300 group-hover:bg-gray-200'
                          }`}
                      >
                        {isChecked ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <span className="text-[10px] font-bold">{index + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium truncate flex-1 ${isChecked ? 'text-purple-800' : 'text-gray-700'
                          }`}
                      >
                        {item.nama_barang}
                      </span>
                      {isChecked && (
                        <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Final Confirmation Checkbox */}
          <div className="pt-2">
            <button
              onClick={() => setConfirmChecked(!confirmChecked)}
              className={`w-full flex items-start gap-3 px-4 py-4 rounded-xl border-2 transition-all duration-200 text-left ${confirmChecked
                ? 'bg-blue-50 border-blue-400 shadow-sm'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
            >
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5 transition-all duration-200 ${confirmChecked
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border-2 border-gray-300'
                  }`}
              >
                {confirmChecked && <Check className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${confirmChecked ? 'text-blue-800' : 'text-gray-700'
                    }`}
                >
                  Konfirmasi Akhir
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Semua pendaki telah kembali dengan selamat dan sampah telah ditimbang serta dicatat dengan benar.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 flex-shrink-0 bg-gray-50/80">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${canSubmit
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg active:scale-[0.98]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <FileCheck className="h-5 w-5" />
                Konfirmasi Check-Out
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function BookingResult({ booking, onReset }: BookingResultProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Check-in checklist state
  const anggotaList: AnggotaRombongan[] = booking.anggota_rombongan || [];
  const logistikList: LogistikBawaan[] = booking.logistik_bawaan || [];

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedLogistics, setSelectedLogistics] = useState<string[]>(
    logistikList.filter((l) => l.status_pengecekan).map((l) => l.id)
  );

  const allMembersChecked = useMemo(
    () => anggotaList.length > 0 && selectedMembers.length === anggotaList.length,
    [anggotaList, selectedMembers]
  );

  const allLogisticsChecked = useMemo(
    () => logistikList.length > 0 && selectedLogistics.length === logistikList.length,
    [logistikList, selectedLogistics]
  );

  const checklistComplete = useMemo(() => {
    const membersOk = anggotaList.length === 0 || allMembersChecked;
    const logisticsOk = logistikList.length === 0 || allLogisticsChecked;
    return membersOk && logisticsOk;
  }, [anggotaList, logistikList, allMembersChecked, allLogisticsChecked]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const shortenId = (id: string) => {
    return id.slice(0, 8).toUpperCase();
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const toggleLogistic = (logisticId: string) => {
    setSelectedLogistics((prev) =>
      prev.includes(logisticId) ? prev.filter((id) => id !== logisticId) : [...prev, logisticId]
    );
  };

  const toggleAllMembers = () => {
    if (allMembersChecked) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(anggotaList.map((m) => m.id));
    }
  };

  const toggleAllLogistics = () => {
    if (allLogisticsChecked) {
      setSelectedLogistics([]);
    } else {
      setSelectedLogistics(logistikList.map((l) => l.id));
    }
  };

  const getPaymentStatusBadge = (paidAt: string | null) => {
    if (paidAt) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <Check className="h-4 w-4 mr-1" />
          Lunas
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        <Clock className="h-4 w-4 mr-1" />
        Pending
      </span>
    );
  };

  const getBookingStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: any }> = {
      DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-800', icon: Clock },
      PENDING_PAYMENT: { label: 'Menunggu Pembayaran', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      CONFIRMED: { label: 'Dikonfirmasi', className: 'bg-blue-100 text-blue-800', icon: Check },
      CHECKED_IN: { label: 'Sedang Mendaki', className: 'bg-indigo-100 text-indigo-800', icon: LogIn },
      CHECKED_OUT: { label: 'Selesai', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      CANCELLED: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800', icon: AlertCircle },
      EXPIRED: { label: 'Kadaluarsa', className: 'bg-gray-100 text-gray-800', icon: Clock },
    };

    const badge = badges[status] || { label: status, className: 'bg-gray-100 text-gray-800', icon: Clock };
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
        <Icon className="h-4 w-4 mr-1" />
        {badge.label}
      </span>
    );
  };

  const handleCheckIn = async () => {
    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await processCheckIn(booking.id, selectedMembers, selectedLogistics);

      if (result.success) {
        setToast({
          message: 'Check-in berhasil! Semua anggota dan logistik telah diverifikasi.',
          type: 'success',
        });
        setSuccess('Check-in berhasil! Pendaki telah masuk ke jalur pendakian.');
        setTimeout(() => {
          onReset();
        }, 3000);
      } else {
        setToast({ message: result.error || 'Gagal melakukan check-in', type: 'error' });
        setError(result.error || 'Gagal melakukan check-in');
      }
    } catch (err) {
      console.error('Error during check-in:', err);
      setToast({ message: 'Terjadi kesalahan saat proses check-in', type: 'error' });
      setError('Terjadi kesalahan saat proses check-in');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOutClick = () => {
    setShowCheckOutModal(true);
  };

  const handleCheckOutSuccess = (msg: string) => {
    setToast({ message: msg, type: 'success' });
    setSuccess(msg);
    setTimeout(() => {
      onReset();
    }, 3000);
  };

  const handleCheckOutError = (msg: string) => {
    setToast({ message: msg, type: 'error' });
    setError(msg);
  };

  const canCheckIn = booking.status_booking === 'CONFIRMED' && booking.paid_at;
  const canCheckOut = booking.status_booking === 'CHECKED_IN';
  const isPaymentPending = !booking.paid_at;
  const isCancelled = booking.status_booking === 'CANCELLED';

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Check-Out Modal */}
      {showCheckOutModal && (
        <CheckOutModal
          booking={booking}
          logistikList={logistikList}
          onClose={() => setShowCheckOutModal(false)}
          onSuccess={handleCheckOutSuccess}
          onError={handleCheckOutError}
        />
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Detail Booking</h2>
              <p className="text-emerald-100 text-sm mt-1">
                Kode: <span className="font-mono font-semibold">{booking.kode_booking || shortenId(booking.id)}</span>
              </p>
            </div>
            {getBookingStatusBadge(booking.status_booking)}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-1 bg-green-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-green-800">Berhasil!</h3>
                  <p className="mt-1 text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-1 bg-red-100 rounded-full">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Hiker Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4" />
              Informasi Pendaki
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {booking.users?.nama_lengkap || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">{booking.users?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trail Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Informasi Jalur
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Jalur</p>
                    <p className="text-sm font-medium text-gray-900">{booking.jalur_pendakian?.nama_jalur || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Tanggal</p>
                    <p className="text-sm font-medium text-gray-900">
                      {booking.tanggal_naik ? `${formatDate(booking.tanggal_naik)} - ${formatDate(booking.tanggal_turun)}` : formatDate(booking.tanggal_pendakian)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Jumlah</p>
                    <p className="text-sm font-medium text-gray-900">
                      {booking.total_anggota || ((booking.anggota_rombongan?.length || 0) + 1)} orang
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm font-semibold text-gray-900">{formatPrice(booking.total_biaya || booking.total_harga || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pembayaran:</span>
            {getPaymentStatusBadge(booking.paid_at)}
          </div>

          {/* Warning Messages */}
          {isPaymentPending && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-1 bg-amber-100 rounded-full">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-800">Pembayaran Belum Lunas</h3>
                  <p className="mt-1 text-sm text-amber-700">
                    Check-in tidak dapat dilakukan karena pembayaran belum dikonfirmasi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-1 bg-red-100 rounded-full">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-800">Booking Dibatalkan</h3>
                  <p className="mt-1 text-sm text-red-700">
                    Booking ini telah dibatalkan dan tidak dapat diproses.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===== CHECK-IN CHECKLIST SECTION ===== */}
          {canCheckIn && (
            <div className="space-y-5 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">Checklist Verifikasi Check-In</h3>
              </div>

              {/* Anggota Rombongan Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    Verifikasi Anggota Rombongan
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${allMembersChecked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                    >
                      {selectedMembers.length}/{anggotaList.length}
                    </span>
                  </h4>
                  {anggotaList.length > 0 && (
                    <button
                      onClick={toggleAllMembers}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors hover:underline"
                    >
                      {allMembersChecked ? 'Batal Semua' : 'Pilih Semua'}
                    </button>
                  )}
                </div>

                {anggotaList.length === 0 ? (
                  <p className="text-sm text-gray-400 italic pl-6">Tidak ada data anggota rombongan.</p>
                ) : (
                  <div className="space-y-1.5">
                    {anggotaList.map((anggota, index) => {
                      const isChecked = selectedMembers.includes(anggota.id);
                      return (
                        <button
                          key={anggota.id}
                          onClick={() => toggleMember(anggota.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left group ${isChecked
                            ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          <div
                            className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 ${isChecked
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-300 group-hover:bg-gray-200 group-hover:text-gray-400'
                              }`}
                          >
                            {isChecked ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <span className="text-xs font-bold">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isChecked ? 'text-emerald-800' : 'text-gray-700'}`}>
                              {anggota.nama_anggota}
                            </p>
                            <p className="text-xs text-gray-400">Validasi KTP fisik</p>
                          </div>
                          {isChecked && <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Logistik Bawaan Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Package className="h-4 w-4 text-orange-600" />
                    Verifikasi Logistik Bawaan
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${allLogisticsChecked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                    >
                      {selectedLogistics.length}/{logistikList.length}
                    </span>
                  </h4>
                  {logistikList.length > 0 && (
                    <button
                      onClick={toggleAllLogistics}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors hover:underline"
                    >
                      {allLogisticsChecked ? 'Batal Semua' : 'Pilih Semua'}
                    </button>
                  )}
                </div>

                {logistikList.length === 0 ? (
                  <p className="text-sm text-gray-400 italic pl-6">Tidak ada data logistik bawaan.</p>
                ) : (
                  <div className="space-y-1.5">
                    {logistikList.map((item, index) => {
                      const isChecked = selectedLogistics.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleLogistic(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left group ${isChecked
                            ? 'bg-orange-50 border-orange-300 shadow-sm'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          <div
                            className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 ${isChecked
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-300 group-hover:bg-gray-200 group-hover:text-gray-400'
                              }`}
                          >
                            {isChecked ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <span className="text-xs font-bold">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isChecked ? 'text-orange-800' : 'text-gray-700'}`}>
                              {item.nama_barang}
                            </p>
                            <p className="text-xs text-gray-400">
                              {item.status_pengecekan ? 'Sudah diverifikasi sebelumnya' : 'Perlu verifikasi'}
                            </p>
                          </div>
                          {isChecked && <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Checklist Progress Bar */}
              {(anggotaList.length > 0 || logistikList.length > 0) && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Progress Verifikasi</span>
                    <span className={`font-bold ${checklistComplete ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {selectedMembers.length + selectedLogistics.length}/{anggotaList.length + logistikList.length} item
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ease-out ${checklistComplete ? 'bg-emerald-500' : 'bg-amber-400'
                        }`}
                      style={{
                        width: `${((selectedMembers.length + selectedLogistics.length) / (anggotaList.length + logistikList.length)) * 100}%`,
                      }}
                    />
                  </div>
                  {!checklistComplete && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Centang semua item untuk mengaktifkan tombol check-in
                    </p>
                  )}
                  {checklistComplete && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Semua item terverifikasi! Siap untuk check-in.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {canCheckIn && (
              <button
                onClick={handleCheckIn}
                disabled={processing || !checklistComplete}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${checklistComplete
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg active:scale-[0.98]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  } disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100`}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Memproses Check-in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Konfirmasi Check-in
                  </>
                )}
              </button>
            )}

            {canCheckOut && (
              <button
                onClick={handleCheckOutClick}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                <LogOut className="h-5 w-5" />
                Proses Check-out
              </button>
            )}

            <button
              onClick={onReset}
              disabled={processing}
              className="flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <RefreshCw className="h-5 w-5" />
              Scan Lagi
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
