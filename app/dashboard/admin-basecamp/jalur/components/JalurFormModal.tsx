'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, MapPin } from 'lucide-react';
import { createJalur, updateJalur } from '../actions';

interface JalurFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  basecampId: string;
  editingJalur: {
    id?: string;
    nama_jalur: string;
    deskripsi: string;
    tingkat_kesulitan: 'mudah' | 'sedang' | 'sulit' | 'ekstrem';
    estimasi_waktu?: string;
    harga_per_orang: number;
    kuota_per_hari: number;
  } | null;
}

const DIFFICULTY_OPTIONS = [
  { value: 'mudah', label: 'Mudah' },
  { value: 'sedang', label: 'Sedang' },
  { value: 'sulit', label: 'Sulit' },
  { value: 'ekstrem', label: 'Ekstrem' },
];

export default function JalurFormModal({ isOpen, onClose, basecampId, editingJalur }: JalurFormModalProps) {
  const [formData, setFormData] = useState({
    nama_jalur: '',
    deskripsi: '',
    tingkat_kesulitan: 'mudah' as 'mudah' | 'sedang' | 'sulit' | 'ekstrem',
    estimasi_waktu: '',
    harga_per_orang: 0,
    kuota_per_hari: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && editingJalur) {
      setFormData({
        nama_jalur: editingJalur.nama_jalur,
        deskripsi: editingJalur.deskripsi,
        tingkat_kesulitan: editingJalur.tingkat_kesulitan,
        estimasi_waktu: editingJalur.estimasi_waktu || '',
        harga_per_orang: editingJalur.harga_per_orang,
        kuota_per_hari: editingJalur.kuota_per_hari,
      });
    } else if (isOpen) {
      setFormData({
        nama_jalur: '',
        deskripsi: '',
        tingkat_kesulitan: 'mudah',
        estimasi_waktu: '',
        harga_per_orang: 0,
        kuota_per_hari: 0,
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [isOpen, editingJalur]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_jalur.trim()) {
      newErrors.nama_jalur = 'Nama jalur wajib diisi';
    }

    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = 'Deskripsi wajib diisi';
    }

    if (formData.harga_per_orang <= 0) {
      newErrors.harga_per_orang = 'Harga harus lebih dari 0';
    }

    if (formData.kuota_per_hari <= 0) {
      newErrors.kuota_per_hari = 'Kuota harus lebih dari 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = editingJalur?.id
        ? await updateJalur(editingJalur.id, formData)
        : await createJalur(basecampId, formData);

      if (result.success) {
        onClose();
      } else {
        setSubmitError(result.error || 'Terjadi kesalahan saat menyimpan jalur');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Terjadi kesalahan yang tidak terduga');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'harga_per_orang' || name === 'kuota_per_hari' ? Number(value) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-900">
                {editingJalur ? 'Edit Jalur Pendakian' : 'Tambah Jalur Pendakian'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {submitError}
              </div>
            )}

            <div>
              <label htmlFor="nama_jalur" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Jalur <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama_jalur"
                name="nama_jalur"
                value={formData.nama_jalur}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.nama_jalur ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contoh: Jalur Patak Banteng"
              />
              {errors.nama_jalur && <p className="mt-1 text-sm text-red-600">{errors.nama_jalur}</p>}
            </div>

            <div>
              <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                disabled={isSubmitting}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none ${
                  errors.deskripsi ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Jelaskan karakteristik jalur, pemandangan, dan hal-hal yang perlu diperhatikan..."
              />
              {errors.deskripsi && <p className="mt-1 text-sm text-red-600">{errors.deskripsi}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tingkat_kesulitan" className="block text-sm font-medium text-gray-700 mb-1">
                  Tingkat Kesulitan <span className="text-red-500">*</span>
                </label>
                <select
                  id="tingkat_kesulitan"
                  name="tingkat_kesulitan"
                  value={formData.tingkat_kesulitan}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="estimasi_waktu" className="block text-sm font-medium text-gray-700 mb-1">
                  Estimasi Waktu
                </label>
                <input
                  type="text"
                  id="estimasi_waktu"
                  name="estimasi_waktu"
                  value={formData.estimasi_waktu}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Contoh: 4 Jam"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="harga_per_orang" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga per Orang (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="harga_per_orang"
                  name="harga_per_orang"
                  value={formData.harga_per_orang}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.harga_per_orang ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="50000"
                />
                {errors.harga_per_orang && <p className="mt-1 text-sm text-red-600">{errors.harga_per_orang}</p>}
              </div>

              <div>
                <label htmlFor="kuota_per_hari" className="block text-sm font-medium text-gray-700 mb-1">
                  Kuota Harian (Orang) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="kuota_per_hari"
                  name="kuota_per_hari"
                  value={formData.kuota_per_hari}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.kuota_per_hari ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="50"
                />
                {errors.kuota_per_hari && <p className="mt-1 text-sm text-red-600">{errors.kuota_per_hari}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {editingJalur ? 'Simpan Perubahan' : 'Tambah Jalur'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
