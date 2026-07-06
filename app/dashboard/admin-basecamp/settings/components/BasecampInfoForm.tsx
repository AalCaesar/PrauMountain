'use client';

import { useState } from 'react';
import { Save, Loader2, Info } from 'lucide-react';
import { updateBasecampInfo } from '../actions';

interface BasecampInfoFormProps {
  basecamp: {
    id: string;
    nama_basecamp: string;
    nama_gunung: string;
    lokasi: string;
    kontak_telepon?: string | null;
    kontak_email?: string | null;
  };
}

export default function BasecampInfoForm({ basecamp }: BasecampInfoFormProps) {
  const [formData, setFormData] = useState({
    nama_basecamp: basecamp.nama_basecamp || '',
    nama_gunung: basecamp.nama_gunung || '',
    lokasi: basecamp.lokasi || '',
    kontak_telepon: basecamp.kontak_telepon || '',
    kontak_email: basecamp.kontak_email || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_basecamp.trim()) {
      newErrors.nama_basecamp = 'Nama basecamp wajib diisi';
    }

    if (!formData.nama_gunung.trim()) {
      newErrors.nama_gunung = 'Nama gunung wajib diisi';
    }

    if (!formData.lokasi.trim()) {
      newErrors.lokasi = 'Lokasi wajib diisi';
    }

    if (formData.kontak_email && !isValidEmail(formData.kontak_email)) {
      newErrors.kontak_email = 'Format email tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (submitSuccess) setSubmitSuccess(false);
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateBasecampInfo(basecamp.id, formData);

      if (result.success) {
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        setSubmitError(result.error || 'Terjadi kesalahan saat menyimpan data');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Terjadi kesalahan yang tidak terduga');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Informasi Basecamp
          </h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Perbarui informasi dasar tentang basecamp Anda
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
            Informasi basecamp berhasil diperbarui!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="kontak_telepon"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nomor Telepon
            </label>
            <input
              type="text"
              id="kontak_telepon"
              name="kontak_telepon"
              value={formData.kontak_telepon}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="08123456789"
            />
          </div>

          <div>
            <label
              htmlFor="kontak_email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Kontak
            </label>
            <input
              type="email"
              id="kontak_email"
              name="kontak_email"
              value={formData.kontak_email}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.kontak_email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="basecamp@example.com"
            />
            {errors.kontak_email && (
              <p className="mt-1 text-sm text-red-600">{errors.kontak_email}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
