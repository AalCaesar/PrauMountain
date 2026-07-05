'use client';

import { useState } from 'react';
import { X, Mountain, Loader2 } from 'lucide-react';
import { addBasecamp } from '../actions';

interface AddBasecampModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBasecampModal({ isOpen, onClose }: AddBasecampModalProps) {
  const [formData, setFormData] = useState({
    nama_gunung: '',
    nama_basecamp: '',
    lokasi: '',
    status_buka: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_gunung.trim()) {
      newErrors.nama_gunung = 'Nama gunung wajib diisi';
    }

    if (!formData.nama_basecamp.trim()) {
      newErrors.nama_basecamp = 'Nama basecamp wajib diisi';
    }

    if (!formData.lokasi.trim()) {
      newErrors.lokasi = 'Lokasi wajib diisi';
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
      const result = await addBasecamp(formData);

      if (result.success) {
        setFormData({
          nama_gunung: '',
          nama_basecamp: '',
          lokasi: '',
          status_buka: true,
        });
        setErrors({});
        onClose();
        alert('Basecamp berhasil ditambahkan!');
      } else {
        setSubmitError(result.error || 'Terjadi kesalahan saat menambahkan basecamp');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Terjadi kesalahan yang tidak terduga');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Mountain className="h-6 w-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Tambah Basecamp Baru
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
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {submitError}
              </div>
            )}

            <div>
              <label
                htmlFor="nama_gunung"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Gunung <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama_gunung"
                name="nama_gunung"
                value={formData.nama_gunung}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.nama_gunung ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contoh: Gunung Prau"
              />
              {errors.nama_gunung && (
                <p className="mt-1 text-sm text-red-600">{errors.nama_gunung}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="nama_basecamp"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Basecamp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama_basecamp"
                name="nama_basecamp"
                value={formData.nama_basecamp}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.nama_basecamp ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contoh: Basecamp Patak Banteng"
              />
              {errors.nama_basecamp && (
                <p className="mt-1 text-sm text-red-600">{errors.nama_basecamp}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="lokasi"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Lokasi <span className="text-red-500">*</span>
              </label>
              <textarea
                id="lokasi"
                name="lokasi"
                value={formData.lokasi}
                onChange={handleChange}
                disabled={isSubmitting}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none ${
                  errors.lokasi ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contoh: Desa Patak Banteng, Kec. Batur, Kab. Banjarnegara, Jawa Tengah"
              />
              {errors.lokasi && (
                <p className="mt-1 text-sm text-red-600">{errors.lokasi}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="status_buka"
                name="status_buka"
                checked={formData.status_buka}
                onChange={handleChange}
                disabled={isSubmitting}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded disabled:cursor-not-allowed"
              />
              <label
                htmlFor="status_buka"
                className="ml-2 block text-sm text-gray-700"
              >
                Basecamp aktif dan dapat menerima booking
              </label>
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
                  'Tambah Basecamp'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
