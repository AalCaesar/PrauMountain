'use client';

import { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { Basecamp } from '@/types/database';
import { assignAdminToBasecamp } from '../actions';

interface AssignAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  basecamp: Basecamp | null;
  admins: { id: string; nama_lengkap: string | null; email: string }[];
}

export default function AssignAdminModal({ isOpen, onClose, basecamp, admins }: AssignAdminModalProps) {
  const [adminId, setAdminId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!basecamp) return;

    if (!adminId) {
      setError('Silakan pilih admin basecamp');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await assignAdminToBasecamp(basecamp.id, adminId.trim());

      if (result.success) {
        setAdminId('');
        setError(null);
        onClose();
        alert(`Admin berhasil di-assign ke basecamp ${basecamp.nama_basecamp}!`);
      } else {
        setError(result.error || 'Terjadi kesalahan saat meng-assign admin');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Terjadi kesalahan yang tidak terduga');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminId(e.target.value);
    if (error) {
      setError(null);
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

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Assign Admin
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Basecamp:</span> {basecamp.nama_basecamp}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <span className="font-medium">Gunung:</span> {basecamp.nama_gunung}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="admin_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pilih Admin Basecamp <span className="text-red-500">*</span>
              </label>
              <select
                id="admin_id"
                name="admin_id"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Pilih Admin Basecamp...</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.nama_lengkap || admin.email}
                  </option>
                ))}
              </select>
              {admins.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  Belum ada admin basecamp terdaftar. Buat admin baru terlebih dahulu.
                </p>
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Assign Admin'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
