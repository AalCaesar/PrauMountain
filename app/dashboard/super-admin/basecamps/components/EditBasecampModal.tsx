'use client';

import { useState, useEffect } from 'react';
import { X, Mountain, Loader2 } from 'lucide-react';
import { Basecamp } from '@/types/database';
import { updateBasecamp } from '../actions';

interface EditBasecampModalProps {
  isOpen: boolean;
  onClose: () => void;
  basecamp: Basecamp | null;
}

export default function EditBasecampModal({ isOpen, onClose, basecamp }: EditBasecampModalProps) {
  const [formData, setFormData] = useState({
    nama_gunung: '',
    nama_basecamp: '',
    lokasi: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (basecamp && isOpen) {
      setFormData({
        nama_gunung: basecamp.nama_gunung,
        nama_basecamp: basecamp.nama_basecamp,
        lokasi: basecamp.lokasi,
      });
      setErrors({});
      setSubmitError(null);
    }
  }, [basecamp, isOpen]);

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

    if (!basecamp) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateBasecamp(basecamp.id, formData);

      if (result.success) {
        onClose();
        alert('Basecamp berhasil diperbarui!');
      } else {
        setSubmitError(result.error || 'Terjadi kesalahan saat memperbarui basecamp');
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
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (!isOpen || !basecamp) return null;

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
                Edit Basecamp
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
                htmlFor="edit_nama_gunung"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Gunung <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="edit_nama_gunung"
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
                htmlFor="edit_nama_basecamp"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Basecamp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="edit_nama_basecamp"
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
                htmlFor="edit_lokasi"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Lokasi <span className="text-red-500">*</span>
              </label>
              <textarea
                id="edit_lokasi"
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
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
