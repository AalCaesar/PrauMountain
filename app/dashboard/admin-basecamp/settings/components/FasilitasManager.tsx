'use client';

import { useState } from 'react';
import { Save, Loader2, Plus, X, List } from 'lucide-react';
import { updateFasilitas } from '../actions';

const COMMON_FACILITIES = [
  'Toilet',
  'Tempat Istirahat',
  'Warung Makan',
  'Parkir Motor',
  'Parkir Mobil',
  'Mushola',
  'Tempat Sewa Alat',
  'Air Bersih',
  'Listrik',
  'Wifi',
];

interface FasilitasManagerProps {
  basecampId: string;
  currentFasilitas: string[];
}

export default function FasilitasManager({ basecampId, currentFasilitas }: FasilitasManagerProps) {
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(currentFasilitas);
  const [customTag, setCustomTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleToggleFacility = (facility: string) => {
    setSelectedFacilities((prev) => {
      if (prev.includes(facility)) {
        return prev.filter((f) => f !== facility);
      } else {
        return [...prev, facility];
      }
    });

    if (submitSuccess) setSubmitSuccess(false);
    if (submitError) setSubmitError(null);
  };

  const handleAddCustomTag = () => {
    const trimmedTag = customTag.trim();
    if (!trimmedTag) return;

    if (selectedFacilities.includes(trimmedTag)) {
      alert('Fasilitas ini sudah ditambahkan');
      return;
    }

    setSelectedFacilities((prev) => [...prev, trimmedTag]);
    setCustomTag('');

    if (submitSuccess) setSubmitSuccess(false);
    if (submitError) setSubmitError(null);
  };

  const handleRemoveCustomTag = (tag: string) => {
    if (COMMON_FACILITIES.includes(tag)) {
      handleToggleFacility(tag);
    } else {
      setSelectedFacilities((prev) => prev.filter((f) => f !== tag));
    }

    if (submitSuccess) setSubmitSuccess(false);
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(true);

    try {
      const result = await updateFasilitas(basecampId, selectedFacilities);

      if (result.success) {
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        setSubmitError(result.error || 'Terjadi kesalahan saat menyimpan fasilitas');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Terjadi kesalahan yang tidak terduga');
    } finally {
      setIsSubmitting(false);
    }
  };

  const customFacilities = selectedFacilities.filter((f) => !COMMON_FACILITIES.includes(f));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Fasilitas Basecamp
          </h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Pilih fasilitas yang tersedia di basecamp Anda
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
            Fasilitas basecamp berhasil diperbarui!
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Fasilitas Umum
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMMON_FACILITIES.map((facility) => (
              <label
                key={facility}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedFacilities.includes(facility)}
                  onChange={() => handleToggleFacility(facility)}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded disabled:cursor-not-allowed"
                />
                <span className="text-sm text-gray-900">{facility}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fasilitas Kustom
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomTag();
                }
              }}
              disabled={isSubmitting}
              placeholder="Tambah fasilitas lainnya..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              disabled={isSubmitting || !customTag.trim()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah
            </button>
          </div>

          {customFacilities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {customFacilities.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomTag(tag)}
                    disabled={isSubmitting}
                    className="hover:text-emerald-900 transition-colors disabled:cursor-not-allowed"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedFacilities.length} fasilitas dipilih
          </div>
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
                Simpan Fasilitas
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
